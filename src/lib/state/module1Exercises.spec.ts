import { describe, expect, it } from 'vitest';

import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	type DerivationTrace
} from '$lib/miu/core';

import {
	createExerciseLatch,
	currentDeadBranchStart,
	exerciseStatuses,
	findDeadBranchStep,
	findICountDropStep,
	latchExercises,
	normalizeExerciseLatch,
	ruleUsage,
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

// Uses all four rules: R2, R2, R1, R3, R4 — and cycles back to the axiom.
const ALL_RULES = ['MII', 'MIIII', 'MIIIIU', 'MIUU', 'MI'];

describe('ruleUsage', () => {
	it('reports no rules used on a fresh trace', () => {
		expect(ruleUsage(createDerivationTrace())).toEqual({ used: [], completedAtStep: null });
	});

	it('lists used rules in ledger order without a completion step', () => {
		const usage = ruleUsage(deriveTrace(['MII', 'MIIU']));

		expect(usage.used).toEqual(['append-u', 'double-tail']);
		expect(usage.completedAtStep).toBeNull();
	});

	it('records the step at which the fourth distinct rule completed the set', () => {
		const usage = ruleUsage(deriveTrace(ALL_RULES));

		expect(usage.used).toEqual(['append-u', 'double-tail', 'replace-iii', 'delete-uu']);
		expect(usage.completedAtStep).toBe(5);
	});
});

describe('findICountDropStep', () => {
	it('returns null while the I-count has never fallen', () => {
		expect(findICountDropStep(deriveTrace(['MII', 'MIIU']))).toBeNull();
	});

	it('returns the first step whose I-count is below its parent', () => {
		// MIIIIU (4 I's) → MIUU (1 I) at step 4.
		expect(findICountDropStep(deriveTrace(ALL_RULES))).toBe(4);
	});
});

describe('findDeadBranchStep', () => {
	it('returns null when no recorded string is trapped', () => {
		expect(findDeadBranchStep(deriveTrace(['MII', 'MIIII']))).toBeNull();
	});

	it('returns the first trapped string with its step index', () => {
		expect(findDeadBranchStep(deriveTrace(['MIU', 'MIUIU']))).toEqual({ index: 1, value: 'MIU' });
	});
});

describe('currentDeadBranchStart', () => {
	it('returns null when the current string is not trapped', () => {
		expect(currentDeadBranchStart(deriveTrace(['MII']))).toBeNull();
	});

	it('returns the first step of the contiguous trapped run', () => {
		expect(currentDeadBranchStart(deriveTrace(['MIU', 'MIUIU', 'MIUIUIUIU']))).toBe(1);
	});

	it('returns null after jumping back out of the trap', () => {
		const trace = deriveTrace(['MIU', 'MIUIU']);

		expect(currentDeadBranchStart({ ...trace, currentIndex: 0 })).toBeNull();
	});
});

describe('traceRevisitIndices', () => {
	it('maps every step to null while all strings are distinct', () => {
		expect(traceRevisitIndices(deriveTrace(['MII', 'MIIII']))).toEqual([null, null, null]);
	});

	it('maps a revisited string to the index of its first appearance', () => {
		expect(traceRevisitIndices(deriveTrace(ALL_RULES))).toEqual([
			null,
			null,
			null,
			null,
			null,
			0
		]);
	});

	it('maps a third occurrence to the first appearance, not the second', () => {
		const twoCycles = deriveTrace([...ALL_RULES, ...ALL_RULES]);

		expect(traceRevisitIndices(twoCycles)[10]).toBe(0);
	});
});

describe('latchExercises', () => {
	it('latches the detections the trace currently demonstrates', () => {
		const latch = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));

		expect(latch.oneWayDoor).toEqual({ step: 1, value: 'MIU' });
		expect(latch.rulesUsed).toEqual(['append-u']);
	});

	it('keeps an existing latch when the trace no longer demonstrates it', () => {
		const latched = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));
		const afterBranch = latchExercises(latched, deriveTrace(['MII']));

		expect(afterBranch.oneWayDoor).toEqual({ step: 1, value: 'MIU' });
	});

	it('unions rule usage across branches in ledger order', () => {
		const latched = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));
		const afterBranch = latchExercises(latched, deriveTrace(['MII']));

		expect(afterBranch.rulesUsed).toEqual(['append-u', 'double-tail']);
	});

	it('does not overwrite an earlier latch with a later detection', () => {
		const earlier = {
			rulesUsed: [],
			openEveryRuleStep: null,
			iCountDownStep: 2,
			oneWayDoor: null
		};
		const merged = latchExercises(earlier, deriveTrace(ALL_RULES));

		expect(merged.iCountDownStep).toBe(2);
	});
});

describe('normalizeExerciseLatch', () => {
	it('falls back to an empty latch for malformed input', () => {
		expect(normalizeExerciseLatch(undefined)).toEqual(createExerciseLatch());
		expect(normalizeExerciseLatch({ oneWayDoor: { step: 'x', value: 3 } })).toEqual(
			createExerciseLatch()
		);
	});

	it('passes a valid latch through and drops unknown rule ids', () => {
		const latch = {
			rulesUsed: ['append-u', 'bogus'],
			openEveryRuleStep: 5,
			iCountDownStep: 4,
			oneWayDoor: { step: 1, value: 'MIU' }
		};

		expect(normalizeExerciseLatch(latch)).toEqual({ ...latch, rulesUsed: ['append-u'] });
	});
});

describe('exerciseStatuses', () => {
	it('keeps a latched one-way door detected after branching discarded the trapped steps', () => {
		// The reported repro: derive MIU (detected), jump back, branch to MII —
		// the record no longer contains MIU, but the notebook entry stays.
		const latch = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));
		const oneWayDoor = exerciseStatuses(deriveTrace(['MII']), false, latch)[2]!;

		expect(oneWayDoor.complete).toBe(true);
		expect(oneWayDoor.stamp).toBe('noticed earlier');
		expect(oneWayDoor.body).toContain('MIU can never reopen R1, R3, or R4');
	});

	it('prefers the live step stamp when the trace still demonstrates the detection', () => {
		const latch = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));
		const oneWayDoor = exerciseStatuses(deriveTrace(['MIU']), false, latch)[2]!;

		expect(oneWayDoor.stamp).toBe('noticed at step 1');
	});

	it('keeps a latched open-every-rule detected without a step stamp after branching', () => {
		const latch = latchExercises(createExerciseLatch(), deriveTrace(ALL_RULES));
		const openEveryRule = exerciseStatuses(deriveTrace(['MII']), false, latch)[0]!;

		expect(openEveryRule.complete).toBe(true);
		expect(openEveryRule.stamp).toBe('all four fired');
		expect(openEveryRule.progress).toBeNull();
	});

	it('writes rule progress as the union of latched and live usage', () => {
		// The reported repro's second half: R1 fired on a discarded branch,
		// then R2 on the new one — progress must read R1, R2, not just R2.
		const latch = latchExercises(createExerciseLatch(), deriveTrace(['MIU']));
		const openEveryRule = exerciseStatuses(deriveTrace(['MII']), false, latch)[0]!;

		expect(openEveryRule.complete).toBe(false);
		expect(openEveryRule.progress).toBe('so far: R1, R2');
	});

	it('reports all four exercises open on a fresh trace, with their prompts printed', () => {
		const statuses = exerciseStatuses(createDerivationTrace(), false);

		expect(statuses.map((status) => status.id)).toEqual([
			'open-every-rule',
			'i-count-down',
			'one-way-door',
			'mu-test'
		]);
		expect(statuses.every((status) => !status.complete)).toBe(true);
		expect(statuses.every((status) => status.stamp === null)).toBe(true);
		expect(statuses.every((status) => status.body.length > 0)).toBe(true);
	});

	it('writes rule progress into the open open-every-rule exercise', () => {
		const openEveryRule = exerciseStatuses(deriveTrace(['MII', 'MIIU']), false)[0]!;

		expect(openEveryRule.complete).toBe(false);
		expect(openEveryRule.progress).toBe('so far: R1, R2');
	});

	it('stamps open-every-rule when the fourth rule completes the set', () => {
		const openEveryRule = exerciseStatuses(deriveTrace(ALL_RULES), false)[0]!;

		expect(openEveryRule.complete).toBe(true);
		expect(openEveryRule.stamp).toBe('all four by step 5');
		expect(openEveryRule.progress).toBeNull();
	});

	it('stamps i-count-down at the step the count first fell', () => {
		const iCountDown = exerciseStatuses(deriveTrace(ALL_RULES), false)[1]!;

		expect(iCountDown.complete).toBe(true);
		expect(iCountDown.stamp).toBe('noticed at step 4');
		expect(iCountDown.body).toContain('only R3 ever lowers it');
	});

	it('stamps one-way-door at the first trapped string and names it', () => {
		const oneWayDoor = exerciseStatuses(deriveTrace(['MIU', 'MIUIU']), false)[2]!;

		expect(oneWayDoor.complete).toBe(true);
		expect(oneWayDoor.stamp).toBe('noticed at step 1');
		expect(oneWayDoor.body).toContain('MIU can never reopen R1, R3, or R4');
	});

	it('completes mu-test from the persisted flag without a step stamp', () => {
		const muTest = exerciseStatuses(createDerivationTrace(), true)[3]!;

		expect(muTest.complete).toBe(true);
		expect(muTest.stamp).toBe('MU tested');
		expect(muTest.body).toContain('"not found" into "never"');
	});
});
