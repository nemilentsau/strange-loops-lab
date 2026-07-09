import { describe, expect, it } from 'vitest';
import { applyMiuMove, MIU_INITIAL_STRING, type MiuMove } from './core';
import { constructMiuDerivation, decideMiuTheorem } from './theoremhood';

function replay(path: MiuMove[]): string {
	return path.reduce((value, move) => applyMiuMove(value, move), MIU_INITIAL_STRING);
}

describe('MIU theoremhood', () => {
	it('rejects strings outside the MIU grammar', () => {
		expect(decideMiuTheorem('M')).toMatchObject({ outcome: 'invalid' });
		expect(decideMiuTheorem('MX')).toMatchObject({ outcome: 'invalid' });
	});

	it('decides residue-zero strings as non-theorems', () => {
		expect(decideMiuTheorem('MU')).toEqual({ outcome: 'non-theorem', residue: 0 });
		expect(decideMiuTheorem('MIII')).toEqual({ outcome: 'non-theorem', residue: 0 });
	});

	it('decides both permitted residue classes as theorems', () => {
		expect(decideMiuTheorem('MI')).toEqual({ outcome: 'theorem', residue: 1 });
		expect(decideMiuTheorem('MII')).toEqual({ outcome: 'theorem', residue: 2 });
	});

	it('constructs the direct witnesses for MI and MII', () => {
		expect(constructMiuDerivation('MI')).toEqual([]);
		expect(replay(constructMiuDerivation('MII'))).toBe('MII');
	});

	it('constructs a mixed target when excess triples produce an odd U count', () => {
		const path = constructMiuDerivation('MIIUII');
		expect(replay(path)).toBe('MIIUII');
		expect(path.some((move) => move.ruleId === 'append-u')).toBe(true);
	});

	it('constructs a mixed target when excess triples produce an even U count', () => {
		const path = constructMiuDerivation('MIUUU');
		expect(replay(path)).toBe('MIUUU');
		expect(path.filter((move) => move.ruleId === 'delete-uu')).toHaveLength(1);
	});

	it('refuses to construct invalid strings and non-theorems', () => {
		expect(() => constructMiuDerivation('M')).toThrow('Invalid MIU target');
		expect(() => constructMiuDerivation('MU')).toThrow('not a theorem');
	});
});
