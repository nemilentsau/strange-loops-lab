import { describe, expect, it } from 'vitest';
import { DESCRIPTION_LENGTH_EXAMPLES, THEOREM_TARGETS } from './examples';
import { shortestBitProgram } from './bitComplexity';
import { literalMiuBitLength } from './coding';
import { MIU_QUERY_BOUNDS, shortestTheoremDerivation } from './complexity';

describe('MIU theorem target examples', () => {
	it('keeps theorem targets nontrivial enough to compare description length', () => {
		expect(THEOREM_TARGETS).toEqual([
			'MUI',
			'MIIIIU',
			'MIIIUIU',
			'MIUIUIUIU',
			'MIUIIIIIUIIII'
		]);
		expect(THEOREM_TARGETS).not.toEqual(expect.arrayContaining(['MI', 'MII', 'MIU', 'MIIIIIIII']));

		const result = shortestTheoremDerivation('MIUIUIUIU');

		expect(result.outcome).toBe('found');
		expect(result.path?.map((move) => move.ruleId)).toEqual([
			'append-u',
			'double-tail',
			'double-tail'
		]);
	});

	it('pins both cost models and the literal baseline for every specimen', () => {
		const rows = DESCRIPTION_LENGTH_EXAMPLES.map(({ value }) => {
			const steps = shortestTheoremDerivation(value, MIU_QUERY_BOUNDS);
			const bits = shortestBitProgram(value, { maxNodes: MIU_QUERY_BOUNDS.maxNodes });
			return [value, literalMiuBitLength(value), steps.length, bits.bitLength];
		});

		expect(rows).toEqual([
			['MI', 3, 0, 4],
			['MIU', 6, 1, 7],
			['MUI', 6, 3, 14],
			['MIIIIIIIIIIIIIIII', 26, 4, 16]
		]);
		expect(rows.some(([, literal, , bits]) => bits! < literal!)).toBe(true);
		expect(rows.some(([, literal, , bits]) => bits! >= literal!)).toBe(true);
	});

	it('runs the specimens from the axiom to a compressible string', () => {
		expect(DESCRIPTION_LENGTH_EXAMPLES.map((example) => example.value)).toEqual([
			'MI',
			'MIU',
			'MUI',
			'MIIIIIIIIIIIIIIII'
		]);
		for (const example of DESCRIPTION_LENGTH_EXAMPLES) {
			expect(example.reading.length).toBeGreaterThan(0);
		}
	});
});
