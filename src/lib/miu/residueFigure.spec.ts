import { describe, expect, it } from 'vitest';
import { residueArrows, residueTrajectory, toZ3Residue } from './residueFigure';

describe('residue figure data', () => {
	it('draws twelve arrows: R2 swaps 1 and 2 and fixes 0; R1, R3, R4 fix every residue', () => {
		const arrows = residueArrows();
		expect(arrows).toHaveLength(12);
		const doubling = arrows.filter((arrow) => arrow.ruleId === 'double-tail');
		expect(doubling.map((arrow) => [arrow.from, arrow.to])).toEqual([
			[0, 0],
			[1, 2],
			[2, 1]
		]);
		for (const arrow of arrows.filter((arrow) => arrow.ruleId !== 'double-tail')) {
			expect(arrow.to).toBe(arrow.from);
		}
	});

	it('has no arrow entering 0 from a nonzero residue', () => {
		const entering = residueArrows().filter((arrow) => arrow.to === 0 && arrow.from !== 0);
		expect(entering).toEqual([]);
	});

	it('counts each ordered transit of the reader path in first-seen order', () => {
		expect(residueTrajectory([1, 2, 1, 1, 2])).toEqual({
			start: 1,
			current: 2,
			transits: [
				{ from: 1, to: 2, count: 2 },
				{ from: 2, to: 1, count: 1 },
				{ from: 1, to: 1, count: 1 }
			]
		});
	});

	it('reads the bare axiom as a trajectory with no transits', () => {
		expect(residueTrajectory([1])).toEqual({ start: 1, current: 1, transits: [] });
	});

	it('rejects an empty path and a value outside Z/3', () => {
		expect(() => residueTrajectory([])).toThrow('at least the axiom residue');
		expect(() => toZ3Residue(3)).toThrow('Not a residue mod 3: 3');
	});
});
