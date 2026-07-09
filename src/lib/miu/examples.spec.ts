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
			['MIIIUIU', 12, 8, 35],
			['MIUIIIIIUIIII', 20, 5, 22],
			['MIUIUIUIU', 16, 3, 13]
		]);
		expect(rows.some(([, literal, , bits]) => bits! < literal!)).toBe(true);
		expect(rows.some(([, literal, , bits]) => bits! >= literal!)).toBe(true);
	});

	it('pins the description-length specimen rows', () => {
		expect(DESCRIPTION_LENGTH_EXAMPLES.map((example) => [example.value, example.reading])).toEqual([
			['MIIIUIU', 'literal code is shorter'],
			['MIUIIIIIUIIII', 'literal code is shorter'],
			['MIUIUIUIU', 'MIU program is shorter']
		]);
	});
});
