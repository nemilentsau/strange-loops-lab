import { describe, it, expect } from 'vitest';
import { MIU_INITIAL_STRING, applyMiuMove, type MiuMove } from './core';
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

		const within = shortestTheoremDerivation('MIIII', { maxDepth: 2 });
		expect(within.outcome).toBe('found');
		expect(within.length).toBe(2);
	});

	it('reports a target past the node budget as an honest horizon', () => {
		const result = shortestTheoremDerivation('MUI', { maxNodes: 2 });

		expect(result.outcome).toBe('exhausted');
		expect(result.stoppedBy).toBe('nodes');
		expect(result.length).toBeNull();
	});

	it('throws on a target that is not a MIU string', () => {
		expect(() => shortestTheoremDerivation('M')).toThrow();
		expect(() => shortestTheoremDerivation('MX')).toThrow();
		expect(() => shortestTheoremDerivation('I')).toThrow();
	});
});
