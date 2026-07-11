import {
	MIU_INITIAL_STRING,
	enumerateMiuMoves,
	enumerateMiuPredecessors,
	type MiuMove
} from './core';
import { decideMiuTheorem } from './theoremhood';

/**
 * Descriptional complexity for MIU. A derivation is read as a program: the
 * axiom MI is the input, the rule-and-site choice at each step is an
 * instruction, and the string is the output. K_MIU(s) is the length of the
 * SHORTEST such program — description length against the four MIU rules, a
 * fixed (non-universal) machine. Replacing the rules with a universal machine
 * turns this into Kolmogorov complexity; that step is not taken here.
 */

export type ShortestDerivationOutcome = 'found' | 'exhausted';

export interface ShortestDerivation {
	target: string;
	outcome: ShortestDerivationOutcome;
	/** K_MIU(target): moves in the shortest derivation from MI. Null unless found. */
	length: number | null;
	/** The shortest derivation MI ⇒ target, in order. Empty for MI itself; null unless found. */
	path: MiuMove[] | null;
	/** Which bound halted the search; only set for an 'exhausted' result. */
	stoppedBy: 'depth' | 'nodes' | null;
	/**
	 * Largest derivation length the halted search ruled out. The forward
	 * frontier was completed to some depth d_f and the backward frontier to
	 * d_b with no string in common; any derivation of length at most d_f + d_b
	 * would put its (d_f)-th string in both frontiers, so none exists and the
	 * proven bound is K_steps(target) > completedDepth = d_f + d_b. Null
	 * unless 'exhausted'.
	 */
	completedDepth: number | null;
	maxDepth: number;
	maxNodes: number;
}

export interface ShortestDerivationOptions {
	maxDepth?: number;
	maxNodes?: number;
	/**
	 * Called after each frontier layer completes, with the derivation lengths
	 * ruled out so far (the sum of the completed forward and backward depths).
	 * The values are exactly the completedDepth an exhaustion at that moment
	 * would report; the sequence increases by 1 per call.
	 */
	onLayerComplete?: (completedDepth: number) => void;
}

export const MIU_QUERY_NODE_BOUNDS = [200_000, 1_000_000, 2_000_000, 5_000_000] as const;

export const MIU_QUERY_BOUNDS = {
	maxDepth: 64,
	maxNodes: MIU_QUERY_NODE_BOUNDS[0]
} as const;

export const MIU_QUERY_LIMITS = {
	maxDepth: 64,
	maxNodes: MIU_QUERY_NODE_BOUNDS[MIU_QUERY_NODE_BOUNDS.length - 1]
} as const;

export function nextMiuQueryNodeBound(current: number): number | null {
	return MIU_QUERY_NODE_BOUNDS.find((bound) => bound > current) ?? null;
}

export function queryMaxNodesForTarget(target: string, currentMaxNodes: number): number {
	return target.trim() === MIU_INITIAL_STRING ? MIU_QUERY_BOUNDS.maxNodes : currentMaxNodes;
}

/**
 * The shortest derivation of a theorem target from MI, or the honest reason
 * the bounded optimization has no witness to report. Two outcomes:
 *
 *  - `found` — bidirectional BFS: one frontier grows forward from MI under
 *    the rules, the other backward from the target under their exact
 *    inverses, always expanding the smaller side. When a string first
 *    appears in both, gluing the two half-derivations at it is minimal: had
 *    a shorter derivation existed, its middle string would have been shared
 *    by frontiers already completed and checked.
 *  - `exhausted` — the search hit its depth or node bound first. An honest
 *    optimization horizon: `completedDepth` records the derivation lengths
 *    ruled out. Theoremhood was decided independently and remains true
 *    beyond this search bound.
 *
 * Meeting in the middle is what makes ten-move targets decidable interactively:
 * the layers of the rewrite graph grow by better than an order of magnitude
 * per move past depth 8, so two half-depth frontiers are smaller than one
 * full-depth frontier by a factor that grows with the target's distance.
 */
export function shortestTheoremDerivation(
	target: string,
	options: ShortestDerivationOptions = {}
): ShortestDerivation {
	const decision = decideMiuTheorem(target);
	if (decision.outcome !== 'theorem') {
		throw new Error(`Expected theorem target, got ${decision.outcome}: ${target}`);
	}

	const maxDepth = clampBound(
		options.maxDepth ?? MIU_QUERY_BOUNDS.maxDepth,
		0,
		MIU_QUERY_LIMITS.maxDepth
	);
	const maxNodes = clampBound(
		options.maxNodes ?? MIU_QUERY_BOUNDS.maxNodes,
		1,
		MIU_QUERY_LIMITS.maxNodes
	);
	const base = { target, maxDepth, maxNodes };

	if (target === MIU_INITIAL_STRING) {
		return { ...base, outcome: 'found', length: 0, path: [], stoppedBy: null, completedDepth: null };
	}

	// Each map sends a discovered string to the string it was discovered from:
	// its parent toward MI on the forward side, toward the target on the
	// backward side. First discovery is at true distance, so parent chains are
	// shortest half-derivations.
	const forward = new Map<string, string | null>([[MIU_INITIAL_STRING, null]]);
	const backward = new Map<string, string | null>([[target, null]]);
	let forwardFrontier = [MIU_INITIAL_STRING];
	let backwardFrontier = [target];
	let forwardDepth = 0;
	let backwardDepth = 0;
	// Both endpoints are held from the start, so the two seeds spend budget too.
	let nodeCount = 2;

	while (true) {
		if (forwardDepth + backwardDepth >= maxDepth) {
			return exhausted(base, 'depth', maxDepth);
		}

		const expandForward = forwardFrontier.length <= backwardFrontier.length;
		const same = expandForward ? forward : backward;
		const other = expandForward ? backward : forward;
		const frontier = expandForward ? forwardFrontier : backwardFrontier;
		const nextLayer: string[] = [];

		for (const value of frontier) {
			const neighbors = expandForward
				? enumerateMiuMoves(value).map((move) => move.result)
				: enumerateMiuPredecessors(value);

			for (const next of neighbors) {
				if (same.has(next)) {
					continue;
				}

				if (other.has(next)) {
					same.set(next, value);
					return found(base, forward, backward, next);
				}

				if (nodeCount >= maxNodes) {
					return exhausted(base, 'nodes', forwardDepth + backwardDepth);
				}

				same.set(next, value);
				nodeCount += 1;
				nextLayer.push(next);
			}
		}

		if (nextLayer.length === 0) {
			// A theorem target keeps both frontiers alive: the forward search can
			// only exhaust the reachable set after meeting the target, which sits
			// in the backward map from the start (and symmetrically for MI).
			throw new Error(`Search frontier emptied without reaching theorem ${target}`);
		}

		if (expandForward) {
			forwardFrontier = nextLayer;
			forwardDepth += 1;
		} else {
			backwardFrontier = nextLayer;
			backwardDepth += 1;
		}

		options.onLayerComplete?.(forwardDepth + backwardDepth);
	}
}

function exhausted(
	base: { target: string; maxDepth: number; maxNodes: number },
	stoppedBy: 'depth' | 'nodes',
	completedDepth: number
): ShortestDerivation {
	return { ...base, outcome: 'exhausted', length: null, path: null, stoppedBy, completedDepth };
}

/**
 * Glue the two half-derivations at the meeting string and re-derive the moves.
 * Both maps store only parent strings, so each consecutive pair is mapped back
 * to the legal move connecting it; the backward side's parents were generated
 * as exact rule preimages, so the forward move always exists.
 */
function found(
	base: { target: string; maxDepth: number; maxNodes: number },
	forward: Map<string, string | null>,
	backward: Map<string, string | null>,
	meet: string
): ShortestDerivation {
	const sequence: string[] = [];

	for (let cursor: string | null | undefined = meet; cursor != null; cursor = forward.get(cursor)) {
		sequence.push(cursor);
	}
	sequence.reverse();

	for (let cursor = backward.get(meet); cursor != null; cursor = backward.get(cursor)) {
		sequence.push(cursor);
	}

	const path: MiuMove[] = [];

	for (let index = 0; index + 1 < sequence.length; index += 1) {
		const move = enumerateMiuMoves(sequence[index]!).find(
			(candidate) => candidate.result === sequence[index + 1]
		);

		if (!move) {
			throw new Error(`Broken derivation chain at ${sequence[index]}`);
		}

		path.push(move);
	}

	return { ...base, outcome: 'found', length: path.length, path, stoppedBy: null, completedDepth: null };
}

function clampBound(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) {
		return min;
	}

	return Math.min(max, Math.max(min, Math.trunc(value)));
}
