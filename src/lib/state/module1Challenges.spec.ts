import { describe, expect, it } from 'vitest';

import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	type DerivationTrace
} from '$lib/miu/core';

import {
	challengeStatuses,
	findRepeatedTraceString,
	findRule3PossibleStep
} from './module1Challenges';

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
		// MI → MII → MIIII → MIIIIU → MIUU → MI: a legal cycle back to the axiom.
		const trace = deriveTrace(['MII', 'MIIII', 'MIIIIU', 'MIUU', 'MI']);

		expect(findRepeatedTraceString(trace)).toEqual({
			value: 'MI',
			firstIndex: 0,
			secondIndex: 5
		});
	});
});

describe('challengeStatuses', () => {
	it('reports all three challenges incomplete on a fresh trace', () => {
		const statuses = challengeStatuses(createDerivationTrace(), false);

		expect(statuses.map((status) => status.id)).toEqual(['rule3-possible', 'two-routes', 'mu-test']);
		expect(statuses.every((status) => !status.complete)).toBe(true);
		expect(statuses.every((status) => status.context === null)).toBe(true);
	});

	it('completes rule3-possible with the step it first happened at', () => {
		const statuses = challengeStatuses(deriveTrace(['MII', 'MIIII']), false);
		const rule3 = statuses.find((status) => status.id === 'rule3-possible')!;

		expect(rule3.complete).toBe(true);
		expect(rule3.context).toBe('step 2');
	});

	it('completes two-routes with both steps when a string is revisited', () => {
		const statuses = challengeStatuses(deriveTrace(['MII', 'MIIII', 'MIIIIU', 'MIUU', 'MI']), false);
		const twoRoutes = statuses.find((status) => status.id === 'two-routes')!;

		expect(twoRoutes.complete).toBe(true);
		expect(twoRoutes.context).toBe('steps 0 and 5');
	});

	it('completes mu-test from the persisted tester flag', () => {
		const statuses = challengeStatuses(createDerivationTrace(), true);
		const muTest = statuses.find((status) => status.id === 'mu-test')!;

		expect(muTest.complete).toBe(true);
	});
});
