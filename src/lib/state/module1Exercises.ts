import type { DerivationTrace } from '$lib/miu/core';

/**
 * Explore-phase exercises: each one is a predicate the engine detects against
 * real state (the live trace, or the persisted tester flag), never a label
 * the learner sets. Completion can honestly regress — if a branch discards
 * the steps that satisfied a predicate, the record no longer shows it and
 * the exercise reopens.
 *
 * The copy is part of the contract (design rules 8 and 11): the open body
 * prints the observation the exercise exists to produce, and the detected
 * body is a written note carrying the verifier's step stamp.
 */
export type ExerciseId = 'rule3-possible' | 'two-routes' | 'mu-test';

export interface ExerciseStatus {
	id: ExerciseId;
	title: string;
	complete: boolean;
	/** Verifier stamp for the detected state, e.g. "noticed at step 2"; null while open. */
	stamp: string | null;
	/** Open: the observation to go produce. Detected: the written note of what happened. */
	body: string;
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
 * trace. The honest, detectable form of this exercise is therefore a
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
 * The three Explore exercises in display order. `muTested` is the persisted
 * draft flag latched when the tester has actually analyzed MU.
 */
export function exerciseStatuses(trace: DerivationTrace, muTested: boolean): ExerciseStatus[] {
	const rule3Step = findRule3PossibleStep(trace);
	const repeat = findRepeatedTraceString(trace);

	return [
		{
			id: 'rule3-possible',
			title: 'Make Rule 3 possible',
			complete: rule3Step !== null,
			stamp: rule3Step !== null ? `noticed at step ${rule3Step}` : null,
			body:
				rule3Step !== null
					? "III appeared and Rule 3 opened. A rule's availability is a fact about the current string."
					: "A rule's availability is a fact about the current string — change the string until III appears and Rule 3 opens."
		},
		{
			id: 'two-routes',
			title: 'One string, two routes',
			complete: repeat !== null,
			stamp: repeat !== null ? `noticed at step ${repeat.secondIndex}` : null,
			body:
				repeat !== null
					? `${repeat.value} returned by a different path. Move sequences reconverge; Map draws this.`
					: 'Reach a string you have already visited by a different route. Move sequences reconverge; Map draws this.'
		},
		{
			id: 'mu-test',
			title: 'Run the MU test',
			complete: muTested,
			stamp: muTested ? 'MU tested' : null,
			body: muTested
				? 'All four rules failed at once. That rejects single moves from one string — it does not prove MU unreachable.'
				: 'Ask the query for MU itself and watch all four rules fail at once. Then: what exactly does that fail to prove?'
		}
	];
}
