import { describe, it, expect } from 'vitest';
import { MIU_INITIAL_STRING, applyMiuMove, enumerateMiuMoves, type MiuMove } from './core';
import {
	MIU_QUERY_BOUNDS,
	MIU_QUERY_LIMITS,
	MIU_QUERY_NODE_BOUNDS,
	nextMiuQueryNodeBound,
	queryMaxNodesForTarget,
	shortestTheoremDerivation
} from './complexity';

/** Replay a derivation from MI: every move must be legal at its step. */
function replay(path: MiuMove[]): string {
	return path.reduce((value, move) => applyMiuMove(value, move), MIU_INITIAL_STRING);
}

describe('shortestTheoremDerivation (K_steps)', () => {
	it('uses the theorem-query horizon by default', () => {
		const result = shortestTheoremDerivation('MUI');

		expect(result.maxDepth).toBe(MIU_QUERY_BOUNDS.maxDepth);
		expect(result.maxNodes).toBe(200_000);
	});

	it('caps manually raised horizons at the instrument limit', () => {
		const result = shortestTheoremDerivation('MI', { maxDepth: 99, maxNodes: 99_000_000 });

		expect(result.maxDepth).toBe(MIU_QUERY_LIMITS.maxDepth);
		expect(result.maxNodes).toBe(MIU_QUERY_LIMITS.maxNodes);
	});

	it('steps the theorem-query horizon through bounded presets', () => {
		expect(MIU_QUERY_NODE_BOUNDS).toEqual([200_000, 1_000_000, 2_000_000, 5_000_000]);
		expect(MIU_QUERY_LIMITS.maxNodes).toBe(5_000_000);
		expect(nextMiuQueryNodeBound(200_000)).toBe(1_000_000);
		expect(nextMiuQueryNodeBound(1_000_000)).toBe(2_000_000);
		expect(nextMiuQueryNodeBound(2_000_000)).toBe(5_000_000);
		expect(nextMiuQueryNodeBound(5_000_000)).toBeNull();
	});

	it('resets a raised theorem-query horizon only when the target returns to MI', () => {
		expect(queryMaxNodesForTarget('MI', 5_000_000)).toBe(MIU_QUERY_BOUNDS.maxNodes);
		expect(queryMaxNodesForTarget(' MI ', 2_000_000)).toBe(MIU_QUERY_BOUNDS.maxNodes);
		expect(queryMaxNodesForTarget('MUI', 5_000_000)).toBe(5_000_000);
	});

	it('returns an empty derivation for the axiom MI', () => {
		const result = shortestTheoremDerivation('MI');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(0);
		expect(result.path).toEqual([]);
		expect(result.completedDepth).toBeNull();
	});

	it('finds the one-move derivation of MII', () => {
		const result = shortestTheoremDerivation('MII');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(1);
		expect(result.path).not.toBeNull();
		expect(result.path!.map((move) => move.ruleId)).toEqual(['double-tail']);
		expect(replay(result.path!)).toBe('MII');
	});

	it('measures K_MIU of a doubled I-run as the number of doublings', () => {
		// M followed by 2^3 I's: three applications of R2, and that is minimal —
		// a pure I-run can only be grown by doubling.
		const result = shortestTheoremDerivation('M' + 'I'.repeat(8));

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(3);
		expect(result.path!.every((move) => move.ruleId === 'double-tail')).toBe(true);
	});

	it('finds the shortest derivation of MUI at length three', () => {
		// MI → MII → MIIII → MUI (R3 on the leading III). No shorter route exists,
		// so K_MIU(MUI) = 3 = |MUI|: incompressible at this length.
		const result = shortestTheoremDerivation('MUI');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(3);
		expect(replay(result.path!)).toBe('MUI');
		expect(result.completedDepth).toBeNull();
	});

	it('finds a ten-move theorem within the default node budget', () => {
		// K_steps(MUUI) = 10. The forward rewrite graph alone holds ~3.8 million
		// strings at depth 10, far past the default budget; meeting in the middle
		// keeps both frontiers small enough to decide this within 200k nodes.
		const result = shortestTheoremDerivation('MUUI');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(10);
		expect(replay(result.path!)).toBe('MUUI');
	});

	it('agrees with exhaustive enumeration on every theorem within five moves', () => {
		// Ground truth: exact K_steps for the whole depth-5 ball around MI,
		// computed by plain layered enumeration. The production search must
		// report the same minimum for each of these theorems.
		const depthOf = new Map<string, number>([[MIU_INITIAL_STRING, 0]]);
		let frontier = [MIU_INITIAL_STRING];
		for (let depth = 1; depth <= 5; depth += 1) {
			const next: string[] = [];
			for (const value of frontier) {
				for (const move of enumerateMiuMoves(value)) {
					if (depthOf.has(move.result)) continue;
					depthOf.set(move.result, depth);
					next.push(move.result);
				}
			}
			frontier = next;
		}

		for (const [value, depth] of depthOf) {
			const result = shortestTheoremDerivation(value);
			expect(result.outcome).toBe('found');
			expect(result.length).toBe(depth);
			expect(replay(result.path!)).toBe(value);
		}
	});

	it('reports each completed frontier layer while searching', () => {
		// MUI meets at total depth 3: the forward layer completes (bound 1), then
		// the backward layer (bound 2), and the meet interrupts the third
		// expansion, so no bound 3 is ever reported.
		const bounds: number[] = [];
		const result = shortestTheoremDerivation('MUI', {
			onLayerComplete: (completedDepth) => bounds.push(completedDepth)
		});

		expect(result.outcome).toBe('found');
		expect(bounds).toEqual([1, 2]);
	});

	it('stops reporting layers when the node budget interrupts one', () => {
		// The five-node budget completes only the first forward layer before
		// dying inside the first backward layer.
		const bounds: number[] = [];
		shortestTheoremDerivation('MUI', {
			maxNodes: 5,
			onLayerComplete: (completedDepth) => bounds.push(completedDepth)
		});

		expect(bounds).toEqual([1]);
	});

	it('refuses to optimize a non-theorem', () => {
		expect(() => shortestTheoremDerivation('MU')).toThrow(
			'Expected theorem target, got non-theorem: MU'
		);
	});

	it('reports a target past the depth bound as an honest horizon', () => {
		// MIIII sits at depth 2 (two doublings).
		const beyond = shortestTheoremDerivation('MIIII', { maxDepth: 1 });
		expect(beyond.outcome).toBe('exhausted');
		expect(beyond.stoppedBy).toBe('depth');
		expect(beyond.length).toBeNull();
		// Depth exhaustion means the completed frontier depths sum to maxDepth
		// with no meeting string, so the proven bound is K_steps(MIIII) > 1.
		expect(beyond.completedDepth).toBe(1);

		const within = shortestTheoremDerivation('MIIII', { maxDepth: 2 });
		expect(within.outcome).toBe('found');
		expect(within.length).toBe(2);
	});

	it('reports a target past the node budget as an honest horizon', () => {
		const result = shortestTheoremDerivation('MUI', { maxNodes: 2 });

		expect(result.outcome).toBe('exhausted');
		expect(result.stoppedBy).toBe('nodes');
		expect(result.length).toBeNull();
		// The two seeds MI and MUI already fill the budget: neither frontier
		// completes a layer, so only K_steps(MUI) > 0 is proven.
		expect(result.completedDepth).toBe(0);
	});

	it('proves the lower bound of the deepest fully completed layers', () => {
		// With a five-node budget the forward frontier completes depth 1
		// (MIU, MII) and the budget dies inside the first backward layer, so the
		// completed depths are 1 + 0 and K_steps(MUI) > 1 is proven — sound,
		// since K_steps(MUI) = 3.
		const result = shortestTheoremDerivation('MUI', { maxNodes: 5 });

		expect(result.outcome).toBe('exhausted');
		expect(result.stoppedBy).toBe('nodes');
		expect(result.completedDepth).toBe(1);
	});

	it('throws on a target that is not a MIU string', () => {
		expect(() => shortestTheoremDerivation('M')).toThrow();
		expect(() => shortestTheoremDerivation('MX')).toThrow();
		expect(() => shortestTheoremDerivation('I')).toThrow();
	});
});
