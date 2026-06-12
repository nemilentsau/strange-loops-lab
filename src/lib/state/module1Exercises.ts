import { MIU_RULES, isDeadBranch, type DerivationTrace, type MiuRuleId } from '$lib/miu/core';

/**
 * Explore-phase exercises: each one is a predicate the engine detects against
 * real state (the live trace, the persisted latch, or the persisted tester
 * flag), never a label the learner sets.
 *
 * Detections are notebook entries: once an observation is made and written,
 * it stays — branching away from the steps that demonstrated it must not
 * unwrite it (the one-way door's own remedy is jumping back and branching,
 * which truncates the very steps that detected it). The persisted
 * `ExerciseLatch` carries the detection facts; the live trace, when it still
 * demonstrates a predicate, supplies the more precise step-stamped copy.
 *
 * The set is aimed at the puzzle, not the chrome (June 12 played review):
 * open every rule → notice availability; move the I-count → notice the only
 * quantity the puzzle turns on; the one-way door → notice irreversibility;
 * the MU test → notice what bounded search cannot settle.
 */
export type ExerciseId = 'open-every-rule' | 'i-count-down' | 'one-way-door' | 'mu-test';

/**
 * Persisted detection facts (draft state). Merge-only: a latched detection
 * is never removed, surviving branch truncation and reload. Copy is always
 * re-rendered from these facts so wording improvements reach old drafts.
 */
export interface ExerciseLatch {
	/** Every rule the session has ever fired, in ledger order. */
	rulesUsed: MiuRuleId[];
	/** Step at which the fourth distinct rule first completed the set. */
	openEveryRuleStep: number | null;
	/** Step at which the I-count first fell. */
	iCountDownStep: number | null;
	/** First dead-branch string noticed, with its step index at the time. */
	oneWayDoor: { step: number; value: string } | null;
}

export function createExerciseLatch(): ExerciseLatch {
	return { rulesUsed: [], openEveryRuleStep: null, iCountDownStep: null, oneWayDoor: null };
}

/** Merge the trace's current detections into the latch; never unlatches. */
export function latchExercises(latch: ExerciseLatch, trace: DerivationTrace): ExerciseLatch {
	const usage = ruleUsage(trace);
	const dropStep = findICountDropStep(trace);
	const deadBranch = findDeadBranchStep(trace);
	const rulesEverUsed = new Set([...latch.rulesUsed, ...usage.used]);

	return {
		rulesUsed: MIU_RULES.filter((id) => rulesEverUsed.has(id)),
		openEveryRuleStep: latch.openEveryRuleStep ?? usage.completedAtStep,
		iCountDownStep: latch.iCountDownStep ?? dropStep,
		oneWayDoor:
			latch.oneWayDoor ??
			(deadBranch ? { step: deadBranch.index, value: deadBranch.value } : null)
	};
}

export function normalizeExerciseLatch(input: unknown): ExerciseLatch {
	if (!input || typeof input !== 'object') {
		return createExerciseLatch();
	}

	const candidate = input as Partial<ExerciseLatch>;
	const door = candidate.oneWayDoor;
	const rulesUsed = Array.isArray(candidate.rulesUsed)
		? MIU_RULES.filter((id) => (candidate.rulesUsed as unknown[]).includes(id))
		: [];

	return {
		rulesUsed,
		openEveryRuleStep:
			typeof candidate.openEveryRuleStep === 'number' ? candidate.openEveryRuleStep : null,
		iCountDownStep: typeof candidate.iCountDownStep === 'number' ? candidate.iCountDownStep : null,
		oneWayDoor:
			door &&
			typeof door === 'object' &&
			typeof door.step === 'number' &&
			typeof door.value === 'string'
				? { step: door.step, value: door.value }
				: null
	};
}

export interface ExerciseStatus {
	id: ExerciseId;
	title: string;
	complete: boolean;
	/** Verifier stamp for the detected state, e.g. "noticed at step 2"; null while open. */
	stamp: string | null;
	/** Open: the observation to go produce. Detected: the written note of what happened. */
	body: string;
	/** Optional verifier-written progress for the open state, e.g. "so far: R1, R2". */
	progress: string | null;
}

const RULE_SHORT: Record<MiuRuleId, string> = {
	'append-u': 'R1',
	'double-tail': 'R2',
	'replace-iii': 'R3',
	'delete-uu': 'R4'
};

function iCount(value: string): number {
	let count = 0;

	for (const char of value) {
		if (char === 'I') {
			count += 1;
		}
	}

	return count;
}

/**
 * Which rules the record has fired, in ledger order, and the step at which
 * the fourth distinct rule first completed the set.
 */
export function ruleUsage(trace: DerivationTrace): {
	used: MiuRuleId[];
	completedAtStep: number | null;
} {
	const seen = new Set<MiuRuleId>();
	let completedAtStep: number | null = null;

	for (const [index, step] of trace.steps.entries()) {
		if (step.via) {
			seen.add(step.via.ruleId);

			if (completedAtStep === null && seen.size === MIU_RULES.length) {
				completedAtStep = index;
			}
		}
	}

	return { used: MIU_RULES.filter((id) => seen.has(id)), completedAtStep };
}

/**
 * The first step whose string has strictly fewer I's than its parent —
 * i.e. the first time the learner saw the I-count fall (only R3 can do it).
 */
export function findICountDropStep(trace: DerivationTrace): number | null {
	for (let index = 1; index < trace.steps.length; index += 1) {
		if (iCount(trace.steps[index]!.value) < iCount(trace.steps[index - 1]!.value)) {
			return index;
		}
	}

	return null;
}

/**
 * The first step in the record holding a dead-branch string (a state from
 * which only R2 will ever apply — `isDeadBranch`), or null.
 */
export function findDeadBranchStep(trace: DerivationTrace): { index: number; value: string } | null {
	for (const [index, step] of trace.steps.entries()) {
		if (isDeadBranch(step.value)) {
			return { index, value: step.value };
		}
	}

	return null;
}

/**
 * When the CURRENT position sits inside a dead branch, the index of the
 * first step of that contiguous trapped run — the live note's "this branch
 * is closed" anchor; `start - 1` is the last open line to jump back to.
 * Null when the current string is not trapped.
 */
export function currentDeadBranchStart(trace: DerivationTrace): number | null {
	const current = trace.currentIndex;

	if (!isDeadBranch(trace.steps[current]?.value ?? '')) {
		return null;
	}

	let start = current;

	while (start > 0 && isDeadBranch(trace.steps[start - 1]!.value)) {
		start -= 1;
	}

	return start;
}

/**
 * For each step, the index of the FIRST earlier step holding the same
 * string, or null when the string is new to the trace. Drives the spine's
 * revisit notes ("↩ same as step 5"): the system's degeneracy written on
 * the page instead of passing silently.
 */
export function traceRevisitIndices(trace: DerivationTrace): (number | null)[] {
	const firstSeen = new Map<string, number>();

	return trace.steps.map((step, index) => {
		const earlier = firstSeen.get(step.value);

		if (earlier === undefined) {
			firstSeen.set(step.value, index);
			return null;
		}

		return earlier;
	});
}

/**
 * The four Explore exercises in display order. `muTested` is the persisted
 * draft flag latched when the target query has actually been asked for MU;
 * `latch` carries the persisted detection facts. The live trace, when it
 * still demonstrates a predicate, wins (its step stamps point at lines on
 * the page); latch-only detections are stamped "noticed earlier" because
 * their step numbers refer to discarded branches.
 */
export function exerciseStatuses(
	trace: DerivationTrace,
	muTested: boolean,
	latch: ExerciseLatch = createExerciseLatch()
): ExerciseStatus[] {
	const usage = ruleUsage(trace);
	const dropStep = findICountDropStep(trace);
	const deadBranch = findDeadBranchStep(trace);

	const rulesEverUsed = new Set([...latch.rulesUsed, ...usage.used]);
	const usedUnion = MIU_RULES.filter((id) => rulesEverUsed.has(id));
	const allRulesComplete =
		usage.completedAtStep !== null ||
		latch.openEveryRuleStep !== null ||
		usedUnion.length === MIU_RULES.length;
	const dropComplete = dropStep !== null || latch.iCountDownStep !== null;
	const door = deadBranch ?? (latch.oneWayDoor ? { index: null, value: latch.oneWayDoor.value } : null);

	return [
		{
			id: 'open-every-rule',
			title: 'Open every rule',
			complete: allRulesComplete,
			stamp:
				usage.completedAtStep !== null
					? `all four by step ${usage.completedAtStep}`
					: allRulesComplete
						? 'all four fired'
						: null,
			body: allRulesComplete
				? 'Every rule has fired. Each one needed the string to be in the right shape first.'
				: 'Fire all four rules at least once.',
			progress:
				!allRulesComplete && usedUnion.length > 0
					? `so far: ${usedUnion.map((id) => RULE_SHORT[id]).join(', ')}`
					: null
		},
		{
			id: 'i-count-down',
			title: 'Make the I-count go down',
			complete: dropComplete,
			stamp:
				dropStep !== null
					? `noticed at step ${dropStep}`
					: dropComplete
						? 'noticed earlier'
						: null,
			body: dropComplete
				? 'The I-count fell — only R3 ever lowers it (−3), and only R2 ever raises it (×2). R1 and R4 never touch an I.'
				: "The command bar counts I's. Find which rules can change that number at all — and which direction each pushes it.",
			progress: null
		},
		{
			id: 'one-way-door',
			title: 'The one-way door',
			complete: door !== null,
			stamp:
				door === null ? null : door.index !== null ? `noticed at step ${door.index}` : 'noticed earlier',
			body:
				door !== null
					? `${door.value} can never reopen R1, R3, or R4 — doubling its tail creates nothing the other rules need. Jumping back is the only way out.`
					: 'Find a string the system can never take you back out of — some moves here cannot be undone.',
			progress: null
		},
		{
			id: 'mu-test',
			title: 'Run the MU test',
			complete: muTested,
			stamp: muTested ? 'MU tested' : null,
			body: muTested
				? 'Not found within the bound — and beyond the bound the search cannot see. What would turn "not found" into "never"?'
				: 'Ask the query for MU itself and watch bounded search fail. Then: what exactly does that fail to prove?',
			progress: null
		}
	];
}
