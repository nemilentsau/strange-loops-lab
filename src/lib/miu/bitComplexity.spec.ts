import { describe, expect, it } from 'vitest';
import { encodeDerivation } from './coding';
import { shortestBitProgram } from './bitComplexity';

describe('K_bits', () => {
	it('returns mode plus halt for MI', () => {
		expect(shortestBitProgram('MI')).toMatchObject({
			outcome: 'found',
			bitLength: 4,
			path: []
		});
	});

	it('returns an executable minimum-bit path', () => {
		const result = shortestBitProgram('MUI');
		expect(result.outcome).toBe('found');
		expect(result.path).not.toBeNull();
		expect(result.bitLength).toBe(14);
		expect(encodeDerivation(result.path!).bitLength).toBe(result.bitLength);
	});

	it('reports node-budget exhaustion without changing theoremhood', () => {
		expect(shortestBitProgram('MUI', { maxNodes: 1 })).toMatchObject({
			outcome: 'exhausted',
			bitLength: null,
			path: null,
			maxNodes: 1
		});
	});

	it('clamps the node budget to the supported boundaries', () => {
		expect(shortestBitProgram('MI', { maxNodes: 0 }).maxNodes).toBe(1);
		expect(shortestBitProgram('MI', { maxNodes: 9_000_000 }).maxNodes).toBe(5_000_000);
	});

	it('uses the minimum budget for a nonfinite request', () => {
		expect(shortestBitProgram('MI', { maxNodes: Number.NaN }).maxNodes).toBe(1);
	});

	it('refuses to optimize a non-theorem', () => {
		expect(() => shortestBitProgram('MU')).toThrow(
			'Expected theorem target, got non-theorem: MU'
		);
	});
});
