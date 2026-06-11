import type { DerivationTrace } from '$lib/miu/core';

/**
 * Explore-phase challenges: each one is a predicate the engine detects
 * against real state (the live trace, or the persisted tester flag), never a
 * label the learner sets. Completion can honestly regress — if a branch
 * discards the steps that satisfied a predicate, the record no longer shows
 * it and the challenge reopens.
 */
export type ChallengeId = 'rule3-possible' | 'two-routes' | 'mu-test';

export interface ChallengeStatus {
	id: ChallengeId;
	label: string;
	complete: boolean;
	/** Where in the record the predicate first holds, e.g. "step 2". */
	context: string | null;
}

/**
 * "Make Rule 3 possible": the first step in the trace whose string contains
 * III, or null. Steps ahead of the current index (kept after a jump back,
 * until a branch discards them) still count — they are part of the record.
 */
export function findRule3PossibleStep(trace: DerivationTrace): number | null {
	const index = trace.steps.findIndex((step) => step.value.includes('III'));

	return index === -1 ? null : index;
}

/**
 * "Reach one string by two routes": the trace is linear — applying a move
 * from an earlier step truncates the abandoned branch (`applyMoveToTrace`),
 * so two coexisting branches that reconverge are never recorded in a single
 * trace. The honest, detectable form of this challenge is therefore a
 * revisit: the same string at two different steps, reached once by the short
 * route to its first appearance and again by the longer route back to it
 * (e.g. MI → MII → MIIII → MIIIIU → MIUU → MI).
 */
export function findRepeatedTraceString(
	trace: DerivationTrace
): { value: string; firstIndex: number; secondIndex: number } | null {
	const firstSeen = new Map<string, number>();

	for (const [index, step] of trace.steps.entries()) {
		const earlier = firstSeen.get(step.value);

		if (earlier !== undefined) {
			return { value: step.value, firstIndex: earlier, secondIndex: index };
		}

		firstSeen.set(step.value, index);
	}

	return null;
}

/**
 * The three Explore challenges in display order. `muTested` is the persisted
 * draft flag latched when the tester has actually analyzed MU.
 */
export function challengeStatuses(trace: DerivationTrace, muTested: boolean): ChallengeStatus[] {
	const rule3Step = findRule3PossibleStep(trace);
	const repeat = findRepeatedTraceString(trace);

	return [
		{
			id: 'rule3-possible',
			label: 'make Rule 3 possible',
			complete: rule3Step !== null,
			context: rule3Step !== null ? `step ${rule3Step}` : null
		},
		{
			id: 'two-routes',
			label: 'one string, two routes',
			complete: repeat !== null,
			context: repeat !== null ? `steps ${repeat.firstIndex} and ${repeat.secondIndex}` : null
		},
		{
			id: 'mu-test',
			label: 'run the MU test',
			complete: muTested,
			context: null
		}
	];
}
