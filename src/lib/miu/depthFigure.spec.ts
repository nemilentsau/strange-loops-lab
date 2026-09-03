import { describe, expect, it } from 'vitest';
import type { ShortestDerivation } from './complexity';
import { MIU_LAYER_SIZES, countMiuLayers, stepBracket } from './depthFigure';

const base = { target: 'x', maxDepth: 64, maxNodes: 200000 };

function found(length: number): ShortestDerivation {
	return { ...base, outcome: 'found', length, path: [], stoppedBy: null, completedDepth: null };
}

function exhausted(completedDepth: number): ShortestDerivation {
	return { ...base, outcome: 'exhausted', length: null, path: null, stoppedBy: 'nodes', completedDepth };
}

describe('depth figure data', () => {
	it('recomputes the recorded layer sizes by breadth-first search from MI', () => {
		expect(countMiuLayers(9)).toEqual([...MIU_LAYER_SIZES]);
	});

	it('reports the axiom as exactly zero moves', () => {
		expect(stepBracket(null, null, 0, true)).toEqual({ kind: 'exact', steps: 0 });
	});

	it('reports a found search as exact', () => {
		expect(stepBracket(found(5), null, 5, false)).toEqual({ kind: 'exact', steps: 5 });
	});

	it('closes the bracket when exhaustion reaches one below the construction', () => {
		expect(stepBracket(exhausted(8), null, 9, false)).toEqual({ kind: 'exact', steps: 9 });
	});

	it('keeps the bracket open otherwise', () => {
		expect(stepBracket(exhausted(7), null, 9, false)).toEqual({
			kind: 'bracket',
			ruledOut: 7,
			upper: 9,
			running: false
		});
	});

	it('advances the bracket with the running search progress', () => {
		expect(stepBracket(null, 3, 9, true)).toEqual({ kind: 'bracket', ruledOut: 3, upper: 9, running: true });
		expect(stepBracket(null, null, 9, true)).toEqual({ kind: 'bracket', ruledOut: 0, upper: 9, running: true });
	});
});
