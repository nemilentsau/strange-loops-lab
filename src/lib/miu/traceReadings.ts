import { encodeDerivation, type EncodedDerivation, type EncodedInstruction } from './coding';
import {
	MIU_INITIAL_STRING,
	type DerivationStep,
	type DerivationTrace,
	type MiuMove
} from './core';
import { countI } from './invariants';

export interface DerivationReadingRow {
	step: DerivationStep;
	residue: number;
	instruction: EncodedInstruction | null;
	active: boolean;
}

export interface DerivationTraceReading {
	rows: DerivationReadingRow[];
	activeMoves: MiuMove[];
	activeResidues: number[];
	activeProgram: EncodedDerivation;
}

function producingMoves(steps: DerivationStep[]): MiuMove[] {
	return steps.slice(1).map((step, index) => {
		if (step.via === null) {
			throw new Error(`Trace step ${index + 1} has no producing move`);
		}

		return step.via;
	});
}

export function readDerivationTrace(trace: DerivationTrace): DerivationTraceReading {
	if (trace.steps[0]?.value !== MIU_INITIAL_STRING) {
		throw new Error(`Trace must start at ${MIU_INITIAL_STRING}`);
	}

	const allMoves = producingMoves(trace.steps);
	const allInstructions = encodeDerivation(allMoves).instructions;
	const activeMoves = allMoves.slice(0, trace.currentIndex);
	const activeSteps = trace.steps.slice(0, trace.currentIndex + 1);
	const rows = trace.steps.map((step, index) => ({
		step,
		residue: countI(step.value) % 3,
		instruction: index === 0 ? null : (allInstructions[index - 1] ?? null),
		active: index <= trace.currentIndex
	}));

	return {
		rows,
		activeMoves,
		activeResidues: activeSteps.map((step) => countI(step.value) % 3),
		activeProgram: encodeDerivation(activeMoves)
	};
}
