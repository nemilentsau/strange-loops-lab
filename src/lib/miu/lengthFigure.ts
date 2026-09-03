import { shortestBitProgram, type BitProgramResult } from './bitComplexity';
import { literalMiuBitLength } from './coding';
import { MIU_QUERY_BOUNDS } from './complexity';

export const I_RUN_TAIL_LENGTHS = [1, 2, 4, 8, 16, 32] as const;

export interface LengthPoint {
	value: string;
	tailLength: number;
	literalBits: number;
	programBits: number;
}

export type BitBracket =
	| { kind: 'exact'; bits: number }
	| { kind: 'bracket'; floor: number; upper: number; maxNodes: number }
	| { kind: 'pending'; upper: number };

export function iRunPoints(): LengthPoint[] {
	return I_RUN_TAIL_LENGTHS.map((tailLength) => {
		const value = `M${'I'.repeat(tailLength)}`;
		const result = shortestBitProgram(value, { maxNodes: MIU_QUERY_BOUNDS.maxNodes });
		if (result.outcome !== 'found') {
			throw new Error(`K_bits search exhausted on the I-run ${value}`);
		}
		return { value, tailLength, literalBits: literalMiuBitLength(value), programBits: result.bitLength };
	});
}

export function literalCurve(maxTailLength: number): { tailLength: number; bits: number }[] {
	const curve: { tailLength: number; bits: number }[] = [];
	for (let tailLength = 1; tailLength <= maxTailLength; tailLength += 1) {
		curve.push({ tailLength, bits: literalMiuBitLength(`M${'I'.repeat(tailLength)}`) });
	}
	return curve;
}

export function bitBracket(result: BitProgramResult | null, constructedBits: number): BitBracket {
	if (result === null) {
		return { kind: 'pending', upper: constructedBits };
	}
	if (result.outcome === 'found') {
		return { kind: 'exact', bits: result.bitLength };
	}
	if (result.lowerBound === constructedBits) {
		return { kind: 'exact', bits: constructedBits };
	}
	return { kind: 'bracket', floor: result.lowerBound, upper: constructedBits, maxNodes: result.maxNodes };
}
