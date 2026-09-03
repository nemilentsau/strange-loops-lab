import { describe, expect, it } from 'vitest';
import { bitBracket, iRunPoints, literalCurve } from './lengthFigure';

describe('length figure data', () => {
	it('prices the I-run family: the literal grows with the tail, the program by 3 bits per doubling', () => {
		const points = iRunPoints();
		expect(points.map((point) => point.value)).toEqual([
			'MI',
			'MII',
			'MIIII',
			'MIIIIIIII',
			'MIIIIIIIIIIIIIIII',
			'MIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII'
		]);
		expect(points.map((point) => point.literalBits)).toEqual([3, 6, 10, 16, 26, 44]);
		expect(points.map((point) => point.programBits)).toEqual([4, 7, 10, 13, 16, 19]);
	});

	it('matches the literal at tail length 4 and undercuts it from tail length 8', () => {
		const points = iRunPoints();
		const shorter = points.filter((point) => point.programBits < point.literalBits);
		expect(shorter.map((point) => point.tailLength)).toEqual([8, 16, 32]);
		expect(points.find((point) => point.tailLength === 4)).toMatchObject({
			literalBits: 10,
			programBits: 10
		});
	});

	it('samples the literal cost at every tail length from 1', () => {
		expect(literalCurve(4)).toEqual([
			{ tailLength: 1, bits: 3 },
			{ tailLength: 2, bits: 6 },
			{ tailLength: 3, bits: 7 },
			{ tailLength: 4, bits: 10 }
		]);
	});

	it('reports a found search as exact', () => {
		expect(
			bitBracket({ outcome: 'found', target: 'MUI', bitLength: 14, path: [], maxNodes: 200000 }, 14)
		).toEqual({ kind: 'exact', bits: 14 });
	});

	it('closes the bracket when the certified floor meets the construction', () => {
		expect(
			bitBracket(
				{ outcome: 'exhausted', target: 'x', bitLength: null, path: null, lowerBound: 31, maxNodes: 200000 },
				31
			)
		).toEqual({ kind: 'exact', bits: 31 });
	});

	it('keeps the bracket open between the floor and the construction', () => {
		expect(
			bitBracket(
				{ outcome: 'exhausted', target: 'x', bitLength: null, path: null, lowerBound: 31, maxNodes: 200000 },
				46
			)
		).toEqual({ kind: 'bracket', floor: 31, upper: 46, maxNodes: 200000 });
	});

	it('reports a missing result as pending under the construction bound', () => {
		expect(bitBracket(null, 46)).toEqual({ kind: 'pending', upper: 46 });
	});
});
