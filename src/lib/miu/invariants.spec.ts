import { describe, expect, it } from 'vitest';

import {
	analyzeInvariantCandidate,
	builtInInvariantAnalysis,
	countI,
	parseInvariantCandidate
} from './invariants';

describe('MIU invariants', () => {
	it('parses supported modular candidates', () => {
		expect(parseInvariantCandidate('count(I) mod 3 != 0')).toMatchObject({
			kind: 'mod-not-equals',
			modulus: 3,
			residue: 0
		});
		expect(parseInvariantCandidate('count(I) mod 4 = 1')).toMatchObject({
			kind: 'mod-equals',
			modulus: 4,
			residue: 1
		});
	});

	it('rejects unsupported candidate text', () => {
		expect(parseInvariantCandidate('parity of I')).toBeNull();
	});

	it('counts I symbols exactly', () => {
		expect(countI('MIUII')).toBe(3);
	});

	it('certifies the built-in MU invariant', () => {
		const analysis = builtInInvariantAnalysis('MI');

		expect(analysis.kind).toBe('supported');
		expect(analysis.preserved).toBe(true);
		expect(analysis.currentSatisfied).toBe(true);
		expect(analysis.ruleResults.every((result) => result.preserved)).toBe(true);
		expect(analysis.consequence).toContain('MU');
	});

	it('finds a concrete counterexample for a false candidate', () => {
		const analysis = analyzeInvariantCandidate('count(I) mod 2 != 0', 'MI');

		expect(analysis.kind).toBe('supported');
		expect(analysis.preserved).toBe(false);
		const failingRule = analysis.ruleResults.find((result) => result.preserved === false);
		expect(failingRule?.ruleId).toBe('double-tail');
		expect(failingRule?.witness?.source).toBe('MI');
		expect(failingRule?.witness?.result).toBe('MII');
	});

	it('reports unsupported input cleanly', () => {
		const analysis = analyzeInvariantCandidate('count(U) mod 2 = 0', 'MI');

		expect(analysis.kind).toBe('unsupported');
		expect(analysis.unsupportedReason).toContain('Use a modular candidate');
	});
});
