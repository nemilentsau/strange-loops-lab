import { describe, expect, it } from 'vitest';
import { enumerateMiuMoves } from './core';
import { encodeDerivation, literalMiuBitLength } from './coding';
import { shortestTheoremDerivation } from './complexity';

describe('MIU prefix code', () => {
	it('encodes the empty program as mode plus halt', () => {
		expect(encodeDerivation([])).toMatchObject({ bitLength: 4, instructions: [] });
	});

	it('charges no site bits for a unique site', () => {
		const path = shortestTheoremDerivation('MII').path!;
		expect(encodeDerivation(path)).toMatchObject({ bitLength: 7 });
		expect(encodeDerivation(path).instructions[0]).toMatchObject({
			opcode: '010',
			siteOrdinal: 0,
			siteCount: 1,
			siteBits: ''
		});
	});

	it('encodes a site ordinal when a rule has several sites', () => {
		const source = 'MIIII';
		const move = enumerateMiuMoves(source).filter((candidate) => candidate.ruleId === 'replace-iii')[1]!;
		const encoded = encodeDerivation([...shortestTheoremDerivation(source).path!, move]);
		expect(encoded.instructions.at(-1)).toMatchObject({
			opcode: '011',
			siteOrdinal: 1,
			siteCount: 2,
			siteBits: '1'
		});
	});

	it('uses a gamma-coded literal branch', () => {
		expect(literalMiuBitLength('MI')).toBe(3);
		expect(literalMiuBitLength('MII')).toBe(6);
		expect(literalMiuBitLength(`M${'I'.repeat(8)}`)).toBe(16);
	});

	it('makes the repeated I-run shorter as a program than as a literal', () => {
		const target = `M${'I'.repeat(8)}`;
		const path = shortestTheoremDerivation(target).path!;
		expect(encodeDerivation(path).bitLength).toBe(13);
		expect(encodeDerivation(path).bitLength).toBeLessThan(literalMiuBitLength(target));
	});

	it('refuses an instruction that is not legal at its program state', () => {
		const moveFromMi = enumerateMiuMoves('MI').find((move) => move.ruleId === 'double-tail')!;
		expect(() => encodeDerivation([moveFromMi, moveFromMi])).toThrow('Move is not legal from MII');
	});

	it('refuses a literal outside the MIU grammar', () => {
		expect(() => literalMiuBitLength('M')).toThrow('Invalid MIU literal: M');
	});
});
