import { describe, it, expect } from 'vitest';
import { MIU_INITIAL_STRING, applyMiuMove, type MiuMove } from './core';
import { shortestDerivation } from './complexity';

/** Replay a derivation from MI: every move must be legal at its step. */
function replay(path: MiuMove[]): string {
	return path.reduce((value, move) => applyMiuMove(value, move), MIU_INITIAL_STRING);
}

describe('shortestDerivation (K_MIU)', () => {
	it('returns an empty derivation for the axiom MI', () => {
		const result = shortestDerivation('MI');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(0);
		expect(result.path).toEqual([]);
	});

	it('finds the one-move derivation of MII', () => {
		const result = shortestDerivation('MII');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(1);
		expect(result.path).not.toBeNull();
		expect(result.path!.map((move) => move.ruleId)).toEqual(['double-tail']);
		expect(replay(result.path!)).toBe('MII');
	});

	it('measures K_MIU of a doubled I-run as the number of doublings', () => {
		// M followed by 2^3 I's: three applications of R2, and that is minimal —
		// a pure I-run can only be grown by doubling.
		const result = shortestDerivation('M' + 'I'.repeat(8));

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(3);
		expect(result.path!.every((move) => move.ruleId === 'double-tail')).toBe(true);
	});

	it('finds the shortest derivation of MUI at length three', () => {
		// MI → MII → MIIII → MUI (R3 on the leading III). No shorter route exists,
		// so K_MIU(MUI) = 3 = |MUI|: incompressible at this length.
		const result = shortestDerivation('MUI');

		expect(result.outcome).toBe('found');
		expect(result.length).toBe(3);
		expect(replay(result.path!)).toBe('MUI');
	});

	it('reports MU as unreachable by the I-count invariant, not as a search limit', () => {
		const result = shortestDerivation('MU');

		expect(result.outcome).toBe('unreachable-invariant');
		expect(result.length).toBeNull();
		expect(result.path).toBeNull();
	});

	it('reports a target past the depth bound as an honest horizon', () => {
		// MIIII sits at depth 2 (two doublings).
		const beyond = shortestDerivation('MIIII', { maxDepth: 1 });
		expect(beyond.outcome).toBe('exhausted');
		expect(beyond.stoppedBy).toBe('depth');
		expect(beyond.length).toBeNull();

		const within = shortestDerivation('MIIII', { maxDepth: 2 });
		expect(within.outcome).toBe('found');
		expect(within.length).toBe(2);
	});

	it('reports a target past the node budget as an honest horizon', () => {
		const result = shortestDerivation('MUI', { maxNodes: 2 });

		expect(result.outcome).toBe('exhausted');
		expect(result.stoppedBy).toBe('nodes');
		expect(result.length).toBeNull();
	});

	it('throws on a target that is not a MIU string', () => {
		expect(() => shortestDerivation('M')).toThrow();
		expect(() => shortestDerivation('MX')).toThrow();
		expect(() => shortestDerivation('I')).toThrow();
	});
});
