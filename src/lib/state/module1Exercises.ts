import { MIU_RULES, isDeadBranch, type DerivationTrace, type MiuRuleId } from '$lib/miu/core';

/**
 * Explore-phase exercises: each one is a predicate the engine detects against
 * real state (the live trace, or the persisted tester flag), never a label
 * the learner sets. Completion can honestly regress — if a branch discards
 * the steps that satisfied a predicate, the record no longer shows it and
 * the exercise reopens.
 *
 * The set is aimed at the puzzle, not the chrome (June 12 played review):
 * open every rule → notice availability; move the I-count → notice the only
 * quantity the puzzle turns on; the one-way door → notice irreversibility;
 * the MU test → notice what bounded search cannot settle.
 */
export type ExerciseId = 'open-every-rule' | 'i-count-down' | 'one-way-door' | 'mu-test';

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
 * draft flag latched when the target query has actually been asked for MU.
 */
export function exerciseStatuses(trace: DerivationTrace, muTested: boolean): ExerciseStatus[] {
	const usage = ruleUsage(trace);
	const dropStep = findICountDropStep(trace);
	const deadBranch = findDeadBranchStep(trace);

	return [
		{
			id: 'open-every-rule',
			title: 'Open every rule',
			complete: usage.completedAtStep !== null,
			stamp: usage.completedAtStep !== null ? `all four by step ${usage.completedAtStep}` : null,
			body:
				usage.completedAtStep !== null
					? 'Every rule has fired. Each one needed the string to be in the right shape first.'
					: 'Fire all four rules at least once.',
			progress:
				usage.completedAtStep === null && usage.used.length > 0
					? `so far: ${usage.used.map((id) => RULE_SHORT[id]).join(', ')}`
					: null
		},
		{
			id: 'i-count-down',
			title: 'Make the I-count go down',
			complete: dropStep !== null,
			stamp: dropStep !== null ? `noticed at step ${dropStep}` : null,
			body:
				dropStep !== null
					? 'The I-count fell — only R3 ever lowers it (−3), and only R2 ever raises it (×2). R1 and R4 never touch an I.'
					: "The command bar counts I's. Find which rules can change that number at all — and which direction each pushes it.",
			progress: null
		},
		{
			id: 'one-way-door',
			title: 'The one-way door',
			complete: deadBranch !== null,
			stamp: deadBranch !== null ? `noticed at step ${deadBranch.index}` : null,
			body:
				deadBranch !== null
					? `${deadBranch.value} can never reopen R1, R3, or R4 — doubling its tail creates nothing the other rules need. Jumping back is the only way out.`
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
