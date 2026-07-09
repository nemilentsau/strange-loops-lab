import { MIU_INITIAL_STRING, enumerateMiuMoves, type MiuMove } from './core';
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
	maxDepth: number;
	maxNodes: number;
}

export interface ShortestDerivationOptions {
	maxDepth?: number;
	maxNodes?: number;
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
 *  - `found` — BFS over the rewrite graph; first arrival is a shortest path
 *    because every move is one edge.
 *  - `exhausted` — the search hit its depth or node bound first. An honest
 *    optimization horizon. Theoremhood was decided independently and remains
 *    true beyond this search bound.
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
		return { ...base, outcome: 'found', length: 0, path: [], stoppedBy: null };
	}

	// Breadth-first from MI. `discovery` records the edge a string was first
	// reached by; first discovery is along a shortest derivation.
	const visited = new Set<string>([MIU_INITIAL_STRING]);
	const discovery = new Map<string, { from: string; move: MiuMove }>();
	const queue: Array<{ value: string; depth: number }> = [{ value: MIU_INITIAL_STRING, depth: 0 }];
	let head = 0;
	let stoppedBy: 'depth' | 'nodes' | null = null;

	while (head < queue.length) {
		const current = queue[head++]!;

		if (current.depth >= maxDepth) {
			stoppedBy ??= 'depth';
			continue;
		}

		for (const move of enumerateMiuMoves(current.value)) {
			const next = move.result;

			if (next === target) {
				discovery.set(next, { from: current.value, move });
				const path = reconstructPath(discovery, next);
				return { ...base, outcome: 'found', length: path.length, path, stoppedBy: null };
			}

			if (visited.has(next)) {
				continue;
			}

			if (visited.size >= maxNodes) {
				stoppedBy = 'nodes';
				queue.length = head; // drop the rest of the frontier; the budget is spent
				break;
			}

			visited.add(next);
			discovery.set(next, { from: current.value, move });
			queue.push({ value: next, depth: current.depth + 1 });
		}
	}

	return { ...base, outcome: 'exhausted', length: null, path: null, stoppedBy: stoppedBy ?? 'nodes' };
}

function reconstructPath(
	discovery: Map<string, { from: string; move: MiuMove }>,
	target: string
): MiuMove[] {
	const moves: MiuMove[] = [];
	let cursor = target;

	while (cursor !== MIU_INITIAL_STRING) {
		const link = discovery.get(cursor);

		if (!link) {
			throw new Error(`Broken derivation chain at ${cursor}`);
		}

		moves.push(link.move);
		cursor = link.from;
	}

	return moves.reverse();
}

function clampBound(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) {
		return min;
	}

	return Math.min(max, Math.max(min, Math.trunc(value)));
}
