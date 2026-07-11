import { describe, expect, it } from 'vitest';
import {
	Z3_CHARACTER_TABLE,
	characterExponent,
	deltaZeroFromCharacters,
	pullbackCharacterUnderDoubling,
	residueAfterRule
} from './characters';

describe('characters of Z/3', () => {
	it('constructs the exact character table as powers of omega', () => {
		expect(Z3_CHARACTER_TABLE).toEqual([
			[0, 0, 0],
			[0, 1, 2],
			[0, 2, 1]
		]);
		expect(characterExponent(2, 2)).toBe(1);
	});

	it('pulls doubling back to the swap of nontrivial characters', () => {
		expect(pullbackCharacterUnderDoubling(0)).toBe(0);
		expect(pullbackCharacterUnderDoubling(1)).toBe(2);
		expect(pullbackCharacterUnderDoubling(2)).toBe(1);
	});

	it('keeps R1, R3, and R4 fixed on residues while R2 doubles', () => {
		expect(residueAfterRule('append-u', 2)).toBe(2);
		expect(residueAfterRule('replace-iii', 2)).toBe(2);
		expect(residueAfterRule('delete-uu', 2)).toBe(2);
		expect(residueAfterRule('double-tail', 2)).toBe(1);
	});

	it('reconstructs the forbidden-residue indicator from all three characters', () => {
		expect(([0, 1, 2] as const).map(deltaZeroFromCharacters)).toEqual([1, 0, 0]);
	});
});
