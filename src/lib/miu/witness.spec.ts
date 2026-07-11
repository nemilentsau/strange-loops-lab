import { describe, expect, it } from 'vitest';
import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	type DerivationTrace
} from './core';
import { MIU_QUERY_BOUNDS, shortestTheoremDerivation } from './complexity';
import { nextWitnessStep, witnessValues } from './witness';

function traceThrough(values: string[]): DerivationTrace {
	let trace = createDerivationTrace();

	for (let index = 1; index < values.length; index += 1) {
		const source = values[index - 1]!;
		const target = values[index]!;
		const move = enumerateMiuMoves(source).find((candidate) => candidate.result === target);

		if (!move) {
			throw new Error(`No MIU move from ${source} to ${target}`);
		}

		trace = applyMoveToTrace(trace, move);
	}

	return trace;
}

describe('shortest-witness anchoring', () => {
	const path = shortestTheoremDerivation('MUI', MIU_QUERY_BOUNDS).path!;

	it('replays the witness values from MI to the target', () => {
		expect(witnessValues(path)).toEqual(['MI', 'MII', 'MIIII', 'MUI']);
	});

	it('continues from the current step when the trace is on the witness prefix', () => {
		const trace = traceThrough(['MI', 'MII']);
		const next = nextWitnessStep(trace, path);

		expect(next).toMatchObject({
			status: 'next',
			anchorIndex: 1,
			anchorValue: 'MII',
			result: 'MIIII'
		});
		expect(next.nextMove?.ruleId).toBe('double-tail');
	});

	it('anchors at the last common step when the trace has diverged', () => {
		const trace = traceThrough(['MI', 'MIU']);
		const next = nextWitnessStep(trace, path);

		expect(next).toMatchObject({
			status: 'next',
			anchorIndex: 0,
			anchorValue: 'MI',
			result: 'MII'
		});
		expect(next.nextMove?.ruleId).toBe('double-tail');
	});

	it('reports completion when the current trace already reaches the witness target', () => {
		const trace = traceThrough(['MI', 'MII', 'MIIII', 'MUI']);
		const next = nextWitnessStep(trace, path);

		expect(next).toEqual({
			status: 'complete',
			anchorIndex: 3,
			anchorValue: 'MUI',
			nextMove: null,
			result: null
		});
	});
});
