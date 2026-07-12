import { describe, expect, it } from 'vitest';
import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	jumpToTraceStep,
	type DerivationTrace
} from './core';
import { readDerivationTrace } from './traceReadings';

function take(trace: DerivationTrace, result: string): DerivationTrace {
	const source = trace.steps[trace.currentIndex]!.value;
	const move = enumerateMiuMoves(source).find((candidate) => candidate.result === result);

	if (!move) {
		throw new Error(`No MIU move from ${source} to ${result}`);
	}

	return applyMoveToTrace(trace, move);
}

describe('MIU trace readings', () => {
	it('reads the fresh axiom as the empty active program', () => {
		const reading = readDerivationTrace(createDerivationTrace());

		expect(reading.rows).toEqual([
			{
				step: { value: 'MI', via: null },
				residue: 1,
				instruction: null,
				active: true
			}
		]);
		expect(reading.activeResidues).toEqual([1]);
		expect(reading.activeMoves).toEqual([]);
		expect(reading.activeProgram).toMatchObject({ bitString: '0000', bitLength: 4 });
	});

	it('keeps future rows while reading only the active derivation prefix', () => {
		let trace = createDerivationTrace();
		trace = take(trace, 'MII');
		trace = take(trace, 'MIIII');
		trace = jumpToTraceStep(trace, 1);

		const reading = readDerivationTrace(trace);

		expect(reading.rows.map((row) => row.active)).toEqual([true, true, false]);
		expect(reading.rows.map((row) => row.residue)).toEqual([1, 2, 1]);
		expect(reading.rows[2]?.instruction?.opcode).toBe('010');
		expect(reading.activeResidues).toEqual([1, 2]);
		expect(reading.activeMoves).toHaveLength(1);
		expect(reading.activeProgram).toMatchObject({ bitString: '0010000', bitLength: 7 });
	});

	it('rejects a non-axiom step without a producing move', () => {
		const malformed: DerivationTrace = {
			steps: [
				{ value: 'MI', via: null },
				{ value: 'MII', via: null }
			],
			currentIndex: 1
		};

		expect(() => readDerivationTrace(malformed)).toThrow('Trace step 1 has no producing move');
	});
});
