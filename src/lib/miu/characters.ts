import type { MiuRuleId } from './core';

export type Z3Residue = 0 | 1 | 2;
export type Z3Character = 0 | 1 | 2;
export type OmegaExponent = 0 | 1 | 2;

export const Z3_CHARACTER_TABLE: OmegaExponent[][] = [
	[0, 0, 0],
	[0, 1, 2],
	[0, 2, 1]
];

export function characterExponent(character: Z3Character, residue: Z3Residue): OmegaExponent {
	return mod3(character * residue);
}

export function pullbackCharacterUnderDoubling(character: Z3Character): Z3Character {
	return mod3(2 * character);
}

export function residueAfterRule(ruleId: MiuRuleId, residue: Z3Residue): Z3Residue {
	return ruleId === 'double-tail' ? mod3(2 * residue) : residue;
}

export function deltaZeroFromCharacters(residue: Z3Residue): 0 | 1 {
	const exponents = ([0, 1, 2] as const).map((character) =>
		characterExponent(character, residue)
	);
	if (exponents.every((exponent) => exponent === 0)) {
		return 1;
	}
	const ordered = [...exponents].sort();
	if (ordered[0] === 0 && ordered[1] === 1 && ordered[2] === 2) {
		return 0;
	}
	throw new Error(`Unexpected Z/3 character exponents: ${exponents.join(',')}`);
}

function mod3(value: number): Z3Residue {
	return (((value % 3) + 3) % 3) as Z3Residue;
}
