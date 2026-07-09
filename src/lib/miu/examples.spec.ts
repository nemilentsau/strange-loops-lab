import { describe, expect, it } from 'vitest';
import { DESCRIPTION_LENGTH_EXAMPLES, THEOREM_TARGETS } from './examples';
import { shortestTheoremDerivation } from './complexity';

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

	it('includes an incompressible and a compressible theorem target', () => {
		const incompressible = shortestTheoremDerivation('MIIIUIU');
		const compressible = shortestTheoremDerivation('MIUIIIIIUIIII');

		expect(incompressible.outcome).toBe('found');
		expect(incompressible.target.length).toBe(7);
		expect(incompressible.length).toBe(8);

		expect(compressible.outcome).toBe('found');
		expect(compressible.target.length).toBe(13);
		expect(compressible.length).toBe(5);
	});

	it('pins the description-length specimen rows', () => {
		expect(DESCRIPTION_LENGTH_EXAMPLES.map((example) => [example.value, example.reading])).toEqual([
			['MIIIUIU', 'as long as itself'],
			['MIUIIIIIUIIII', 'compressible'],
			['MIUIUIUIU', 'compressible']
		]);
	});
});
