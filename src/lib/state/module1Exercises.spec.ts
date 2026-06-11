import { describe, expect, it } from 'vitest';

import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	type DerivationTrace
} from '$lib/miu/core';

import {
	exerciseStatuses,
	findRepeatedTraceString,
	findRule3PossibleStep,
	traceRevisitIndices
} from './module1Exercises';

function deriveTrace(values: string[]): DerivationTrace {
	let trace = createDerivationTrace();

	for (const value of values) {
		const move = enumerateMiuMoves(trace.steps[trace.currentIndex]!.value).find(
			(candidate) => candidate.result === value
		);

		if (!move) {
			throw new Error(`No legal move to ${value} in test setup`);
		}

		trace = applyMoveToTrace(trace, move);
	}

	return trace;
}

// MI → MII → MIIII → MIIIIU → MIUU → MI: a legal cycle back to the axiom.
const CYCLE = ['MII', 'MIIII', 'MIIIIU', 'MIUU', 'MI'];

describe('findRule3PossibleStep', () => {
	it('returns null while no step has ever contained III', () => {
		expect(findRule3PossibleStep(deriveTrace(['MII', 'MIIU']))).toBeNull();
	});

	it('returns the first step whose string contains III', () => {
		expect(findRule3PossibleStep(deriveTrace(['MII', 'MIIII', 'MIIIIU']))).toBe(2);
	});

	it('counts steps ahead of the current index after a jump back', () => {
		const trace = deriveTrace(['MII', 'MIIII']);
		const jumpedBack = { ...trace, currentIndex: 0 };

		expect(findRule3PossibleStep(jumpedBack)).toBe(2);
	});
});

describe('findRepeatedTraceString', () => {
	it('returns null when every step is distinct', () => {
		expect(findRepeatedTraceString(deriveTrace(['MII', 'MIIII']))).toBeNull();
	});

	it('detects the first revisited string with both step indices', () => {
		expect(findRepeatedTraceString(deriveTrace(CYCLE))).toEqual({
			value: 'MI',
			firstIndex: 0,
			secondIndex: 5
		});
	});
});

describe('traceRevisitIndices', () => {
	it('maps every step to null while all strings are distinct', () => {
		expect(traceRevisitIndices(deriveTrace(['MII', 'MIIII']))).toEqual([null, null, null]);
	});

	it('maps a revisited string to the index of its first appearance', () => {
		expect(traceRevisitIndices(deriveTrace(CYCLE))).toEqual([null, null, null, null, null, 0]);
	});

	it('maps a third occurrence to the first appearance, not the second', () => {
		const twoCycles = deriveTrace([...CYCLE, ...CYCLE]);

		expect(traceRevisitIndices(twoCycles)[10]).toBe(0);
	});
});

describe('exerciseStatuses', () => {
	it('reports all three exercises open on a fresh trace, with their prompts printed', () => {
		const statuses = exerciseStatuses(createDerivationTrace(), false);

		expect(statuses.map((status) => status.id)).toEqual(['rule3-possible', 'two-routes', 'mu-test']);
		expect(statuses.every((status) => !status.complete)).toBe(true);
		expect(statuses.every((status) => status.stamp === null)).toBe(true);
		expect(statuses.every((status) => status.body.length > 0)).toBe(true);
	});

	it('stamps rule3-possible with the step III first appeared at', () => {
		const rule3 = exerciseStatuses(deriveTrace(['MII', 'MIIII']), false)[0]!;

		expect(rule3.complete).toBe(true);
		expect(rule3.stamp).toBe('noticed at step 2');
		expect(rule3.body).toContain('Rule 3 opened');
	});

	it('stamps two-routes with the revisit step and names the revisited string', () => {
		const twoRoutes = exerciseStatuses(deriveTrace(CYCLE), false)[1]!;

		expect(twoRoutes.complete).toBe(true);
		expect(twoRoutes.stamp).toBe('noticed at step 5');
		expect(twoRoutes.body).toContain('MI returned by a different path');
	});

	it('completes mu-test from the persisted tester flag without a step stamp', () => {
		const muTest = exerciseStatuses(createDerivationTrace(), true)[2]!;

		expect(muTest.complete).toBe(true);
		expect(muTest.stamp).toBe('MU tested');
		expect(muTest.body).toContain('does not prove MU unreachable');
	});
});
