import {
	MIU_INITIAL_STRING,
	applyMiuMove,
	type DerivationTrace,
	type MiuMove
} from './core';

export interface WitnessStep {
	status: 'next' | 'complete';
	anchorIndex: number;
	anchorValue: string;
	nextMove: MiuMove | null;
	result: string | null;
}

export function witnessValues(path: MiuMove[]): string[] {
	const values = [MIU_INITIAL_STRING];
	let current = MIU_INITIAL_STRING;

	for (const move of path) {
		current = applyMiuMove(current, move);
		values.push(current);
	}

	return values;
}

export function nextWitnessStep(trace: DerivationTrace, path: MiuMove[]): WitnessStep {
	const values = witnessValues(path);
	const activeTrace = trace.steps.slice(0, trace.currentIndex + 1);
	let anchorIndex = 0;

	for (let index = 0; index < Math.min(activeTrace.length, values.length); index += 1) {
		if (activeTrace[index]?.value !== values[index]) {
			break;
		}
		anchorIndex = index;
	}

	const anchorValue = values[anchorIndex] ?? MIU_INITIAL_STRING;
	const nextMove = path[anchorIndex] ?? null;

	if (!nextMove) {
		return {
			status: 'complete',
			anchorIndex,
			anchorValue,
			nextMove: null,
			result: null
		};
	}

	return {
		status: 'next',
		anchorIndex,
		anchorValue,
		nextMove,
		result: values[anchorIndex + 1] ?? nextMove.result
	};
}
