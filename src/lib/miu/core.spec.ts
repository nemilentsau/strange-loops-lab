import { describe, expect, it } from 'vitest';

import {
	applyMiuMove,
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	jumpToTraceStep,
	normalizeTrace,
	restartTrace,
	stepBackTrace
} from './core';

describe('MIU engine', () => {
	it('starts from MI with an initial trace step', () => {
		const trace = createDerivationTrace();

		expect(trace.steps).toEqual([{ value: 'MI', via: null }]);
		expect(trace.currentIndex).toBe(0);
	});

	it('enumerates append-u when the string ends with I', () => {
		const move = enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u');

		expect(move?.result).toBe('MIU');
	});

	it('enumerates double-tail from the M-prefix form', () => {
		const move = enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail');

		expect(move?.result).toBe('MIUIU');
	});

	it('enumerates all replace-iii positions including overlaps', () => {
		const moves = enumerateMiuMoves('MIIII').filter((candidate) => candidate.ruleId === 'replace-iii');

		expect(moves.map((move) => move.start)).toEqual([1, 2]);
		expect(moves.map((move) => move.result)).toEqual(['MUI', 'MIU']);
	});

	it('enumerates all delete-uu positions including overlaps', () => {
		const moves = enumerateMiuMoves('MUUU').filter((candidate) => candidate.ruleId === 'delete-uu');

		expect(moves.map((move) => move.start)).toEqual([1, 2]);
		expect(moves.map((move) => move.result)).toEqual(['MU', 'MU']);
	});

	it('rejects illegal moves against a state', () => {
		const illegalMove = {
			key: 'replace-iii:1:4:MU',
			ruleId: 'replace-iii' as const,
			ruleLabel: 'Rule 3',
			source: 'MI',
			result: 'MU',
			start: 1,
			end: 4,
			detail: 'Replace any occurrence of III with U.'
		};

		expect(() => applyMiuMove('MI', illegalMove)).toThrow(/Illegal MIU move/);
	});

	it('rejects malformed strings before evaluation', () => {
		expect(() => enumerateMiuMoves('IU')).toThrow(/Invalid MIU string/);
	});
});

describe('MIU trace', () => {
	it('applies a valid move to the current step', () => {
		const trace = createDerivationTrace();
		const move = enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u');

		expect(move).toBeDefined();

		const next = applyMoveToTrace(trace, move!);

		expect(next.steps.map((step) => step.value)).toEqual(['MI', 'MIU']);
		expect(next.currentIndex).toBe(1);
		expect(next.steps[1]?.via?.ruleId).toBe('append-u');
	});

	it('can jump backward without mutating trace history', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const second = applyMoveToTrace(
			first,
			enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail')!
		);

		const jumped = jumpToTraceStep(second, 0);

		expect(jumped.currentIndex).toBe(0);
		expect(jumped.steps.map((step) => step.value)).toEqual(['MI', 'MIU', 'MIUIU']);
	});

	it('branches from an earlier state by truncating future history', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const second = applyMoveToTrace(
			first,
			enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail')!
		);
		const branched = applyMoveToTrace(
			second,
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'double-tail')!,
			0
		);

		expect(branched.steps.map((step) => step.value)).toEqual(['MI', 'MII']);
		expect(branched.currentIndex).toBe(1);
	});

	it('steps back and restarts conservatively', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const steppedBack = stepBackTrace(first);
		const restarted = restartTrace(first);

		expect(steppedBack.currentIndex).toBe(0);
		expect(restarted.steps.map((step) => step.value)).toEqual(['MI']);
		expect(restarted.currentIndex).toBe(0);
	});

	it('falls back to a clean initial trace when persisted input is invalid', () => {
		const trace = normalizeTrace({
			steps: [{ value: 'MU', via: null }],
			currentIndex: 9
		});

		expect(trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(trace.currentIndex).toBe(0);
	});
});
