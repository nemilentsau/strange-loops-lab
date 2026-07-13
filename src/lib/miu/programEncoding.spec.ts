import { describe, expect, it } from 'vitest';
import { enumerateMiuMoves } from './core';
import { encodeDerivation } from './coding';
import { shortestTheoremDerivation } from './complexity';
import { describeProgramEncoding } from './programEncoding';

describe('describeProgramEncoding', () => {
	it('reports frame only for the empty derivation', () => {
		const breakdown = describeProgramEncoding([]);
		expect(breakdown.rows).toEqual([]);
		expect(breakdown.payloadBits).toBe(0);
		expect(breakdown.tagBit).toBe('0');
		expect(breakdown.terminator).toBe('000');
		expect(breakdown.total).toBe(4);
	});

	it('lists one instruction per move with its 1-based step', () => {
		const path = shortestTheoremDerivation(`M${'I'.repeat(4)}`).path!;
		const breakdown = describeProgramEncoding(path);
		expect(breakdown.rows.map((row) => row.step)).toEqual([1, 2]);
		expect(breakdown.rows.every((row) => row.instruction.siteBits === '')).toBe(true);
	});

	it('carries the site selector bits when a rule has several sites', () => {
		const source = 'MIIII';
		const move = enumerateMiuMoves(source).filter((candidate) => candidate.ruleId === 'replace-iii')[1]!;
		const path = [...shortestTheoremDerivation(source).path!, move];
		const breakdown = describeProgramEncoding(path);
		expect(breakdown.rows.at(-1)!.instruction).toMatchObject({ siteBits: '1', siteCount: 2 });
	});

	it('total always equals the encoded bit length', () => {
		for (const target of ['MI', 'MII', `M${'I'.repeat(4)}`, `M${'I'.repeat(8)}`]) {
			const path = shortestTheoremDerivation(target).path!;
			expect(describeProgramEncoding(path).total).toBe(encodeDerivation(path).bitLength);
		}
	});
});
