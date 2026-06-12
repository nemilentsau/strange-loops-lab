export const MIU_INITIAL_STRING = 'MI';

export const MIU_RULES = ['append-u', 'double-tail', 'replace-iii', 'delete-uu'] as const;

export type MiuRuleId = (typeof MIU_RULES)[number];

export interface MiuMove {
	key: string;
	ruleId: MiuRuleId;
	ruleLabel: string;
	source: string;
	result: string;
	start: number;
	end: number;
	detail: string;
}

export interface DerivationStep {
	value: string;
	via: MiuMove | null;
}

export interface DerivationTrace {
	steps: DerivationStep[];
	currentIndex: number;
}

export interface MiuProposalRuleCheck {
	ruleId: MiuRuleId;
	ruleLabel: string;
	status: 'matches' | 'different-result' | 'unavailable';
	explanation: string;
	legalResults: string[];
	matchingMoves: MiuMove[];
}

export interface MiuProposalAnalysis {
	source: string;
	proposed: string;
	syntaxValid: boolean;
	exactMatches: MiuMove[];
	ruleChecks: MiuProposalRuleCheck[];
	summary: string;
}

export interface MiuRuleAvailability {
	ruleId: MiuRuleId;
	ruleLabel: string;
	pattern: string;
	status: 'available' | 'unavailable';
	/** Concrete legal moves (sites) for this rule; empty when unavailable. */
	moves: MiuMove[];
	/** Learner-facing reason the rule cannot fire; null when available. */
	reason: string | null;
}

export function enumerateMiuMoves(source: string): MiuMove[] {
	assertValidMiuString(source);

	return [
		...appendUMoves(source),
		...doubleTailMoves(source),
		...replaceThreeIsMoves(source),
		...deleteDoubleUMoves(source)
	];
}

export function applyMiuMove(source: string, move: MiuMove): string {
	assertValidMiuString(source);

	const legalMove = enumerateMiuMoves(source).find((candidate) => candidate.key === move.key);

	if (!legalMove) {
		throw new Error(`Illegal MIU move for state ${source}`);
	}

	return legalMove.result;
}

export function analyzeMiuProposal(source: string, proposedInput: string): MiuProposalAnalysis {
	assertValidMiuString(source);

	const proposed = proposedInput.trim();

	if (!isValidMiuString(proposed)) {
		return {
			source,
			proposed,
			syntaxValid: false,
			exactMatches: [],
			ruleChecks: [],
			summary: 'Not a valid MIU string. States must start with M and then use only I and U.'
		};
	}

	const legalMoves = enumerateMiuMoves(source);
	const exactMatches = legalMoves.filter((move) => move.result === proposed);
	const ruleChecks = MIU_RULES.map((ruleId) => inspectRuleProposal(source, proposed, ruleId, legalMoves));

	return {
		source,
		proposed,
		syntaxValid: true,
		exactMatches,
		ruleChecks,
		summary:
			exactMatches.length > 0
				? summarizeExactMatches(exactMatches)
				: `No legal MIU rule produces ${proposed} from ${source}.`
	};
}

/**
 * A dead branch: a state from which no rule other than R2 (doubling) will
 * EVER apply again, however far you double.
 *
 * Proof of the closure. Let S = M·t with t starting in I, ending in U,
 * containing no III and no UU. Then R1 (needs a final I), R3 (needs III)
 * and R4 (needs UU) are all closed, and R2 gives M·tt where:
 *   - tt still starts in I and ends in U;
 *   - no III: t has none, and every 3-window crossing the seam contains
 *     t's final U;
 *   - no UU: t has none, and the seam pair is (U, I).
 * So the condition is preserved forever. Conversely, if t starts with U,
 * one doubling creates UU at the seam and R4 reopens — such states are NOT
 * flagged. The detector claims exactly what the induction proves.
 */
export function isDeadBranch(value: string): boolean {
	const tail = value.slice(1);

	return (
		tail.startsWith('I') &&
		tail.endsWith('U') &&
		!tail.includes('III') &&
		!tail.includes('UU')
	);
}

/**
 * Per-rule availability for the rules ledger: every rule, in fixed order,
 * with either its concrete sites (built on `enumerateMiuMoves`, never
 * re-derived) or the exact learner-facing reason it cannot fire.
 */
export function analyzeMiuRuleAvailability(current: string): MiuRuleAvailability[] {
	const legalMoves = enumerateMiuMoves(current);

	return MIU_RULES.map((ruleId) => {
		const moves = legalMoves.filter((move) => move.ruleId === ruleId);
		const available = moves.length > 0;

		return {
			ruleId,
			ruleLabel: labelForRule(ruleId),
			pattern: patternForRule(ruleId),
			status: available ? 'available' : 'unavailable',
			moves,
			reason: available ? null : availabilityReason(ruleId)
		};
	});
}

export function createDerivationTrace(initialValue = MIU_INITIAL_STRING): DerivationTrace {
	assertValidMiuString(initialValue);

	return {
		steps: [{ value: initialValue, via: null }],
		currentIndex: 0
	};
}

export function jumpToTraceStep(trace: DerivationTrace, nextIndex: number): DerivationTrace {
	if (nextIndex < 0 || nextIndex >= trace.steps.length) {
		throw new Error(`Trace index ${nextIndex} is out of bounds`);
	}

	return {
		steps: trace.steps,
		currentIndex: nextIndex
	};
}

export function stepBackTrace(trace: DerivationTrace): DerivationTrace {
	if (trace.currentIndex === 0) {
		return trace;
	}

	return jumpToTraceStep(trace, trace.currentIndex - 1);
}

export function restartTrace(trace: DerivationTrace): DerivationTrace {
	return {
		steps: [trace.steps[0]],
		currentIndex: 0
	};
}

export function applyMoveToTrace(
	trace: DerivationTrace,
	move: MiuMove,
	fromIndex = trace.currentIndex
): DerivationTrace {
	if (fromIndex < 0 || fromIndex >= trace.steps.length) {
		throw new Error(`Trace index ${fromIndex} is out of bounds`);
	}

	const source = trace.steps[fromIndex]?.value;

	if (!source) {
		throw new Error(`Missing source step at index ${fromIndex}`);
	}

	const result = applyMiuMove(source, move);
	const nextSteps = trace.steps.slice(0, fromIndex + 1).concat({
		value: result,
		via: move
	});

	return {
		steps: nextSteps,
		currentIndex: nextSteps.length - 1
	};
}

export function normalizeTrace(input: unknown): DerivationTrace {
	if (!input || typeof input !== 'object') {
		return createDerivationTrace();
	}

	const candidate = input as Partial<DerivationTrace>;

	if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
		return createDerivationTrace();
	}

	const steps = candidate.steps
		.map((step) => normalizeStep(step))
		.filter((step): step is DerivationStep => step !== null);

	if (steps.length === 0 || steps[0]?.value !== MIU_INITIAL_STRING) {
		return createDerivationTrace();
	}

	const currentIndex =
		typeof candidate.currentIndex === 'number' &&
		Number.isInteger(candidate.currentIndex) &&
		candidate.currentIndex >= 0 &&
		candidate.currentIndex < steps.length
			? candidate.currentIndex
			: steps.length - 1;

	return { steps, currentIndex };
}

function normalizeStep(input: unknown): DerivationStep | null {
	if (!input || typeof input !== 'object') {
		return null;
	}

	const candidate = input as Partial<DerivationStep>;

	if (typeof candidate.value !== 'string' || !isValidMiuString(candidate.value)) {
		return null;
	}

	return {
		value: candidate.value,
		via: normalizeMove(candidate.via, candidate.value)
	};
}

function normalizeMove(input: unknown, result: string): MiuMove | null {
	if (input === null || input === undefined) {
		return null;
	}

	if (!input || typeof input !== 'object') {
		return null;
	}

	const candidate = input as Partial<MiuMove>;

	if (
		typeof candidate.key !== 'string' ||
		!candidate.ruleId ||
		!MIU_RULES.includes(candidate.ruleId as MiuRuleId) ||
		typeof candidate.ruleLabel !== 'string' ||
		typeof candidate.source !== 'string' ||
		typeof candidate.result !== 'string' ||
		typeof candidate.start !== 'number' ||
		typeof candidate.end !== 'number' ||
		typeof candidate.detail !== 'string'
	) {
		return null;
	}

	if (candidate.result !== result) {
		return null;
	}

	return {
		key: candidate.key,
		ruleId: candidate.ruleId as MiuRuleId,
		ruleLabel: candidate.ruleLabel,
		source: candidate.source,
		result: candidate.result,
		start: candidate.start,
		end: candidate.end,
		detail: candidate.detail
	};
}

function inspectRuleProposal(
	source: string,
	proposed: string,
	ruleId: MiuRuleId,
	legalMoves: MiuMove[]
): MiuProposalRuleCheck {
	const ruleMoves = legalMoves.filter((move) => move.ruleId === ruleId);
	const matchingMoves = ruleMoves.filter((move) => move.result === proposed);

	if (matchingMoves.length > 0) {
		return {
			ruleId,
			ruleLabel: matchingMoves[0]!.ruleLabel,
			status: 'matches',
			explanation:
				matchingMoves.length === 1
					? `${matchingMoves[0]!.ruleLabel} matches at span ${matchingMoves[0]!.start + 1}-${matchingMoves[0]!.end}.`
					: `${matchingMoves[0]!.ruleLabel} matches in ${matchingMoves.length} different spans.`,
			legalResults: uniqueResults(ruleMoves),
			matchingMoves
		};
	}

	if (ruleMoves.length === 0) {
		return {
			ruleId,
			ruleLabel: labelForRule(ruleId),
			status: 'unavailable',
			explanation: unavailableRuleExplanation(source, ruleId),
			legalResults: [],
			matchingMoves: []
		};
	}

	return {
		ruleId,
		ruleLabel: labelForRule(ruleId),
		status: 'different-result',
		explanation: differentResultExplanation(ruleId, proposed, ruleMoves),
		legalResults: uniqueResults(ruleMoves),
		matchingMoves: []
	};
}

function appendUMoves(source: string): MiuMove[] {
	if (!source.endsWith('I')) {
		return [];
	}

	return [
		createMove({
			ruleId: 'append-u',
			ruleLabel: 'Rule 1',
			source,
			result: `${source}U`,
			start: source.length - 1,
			end: source.length,
			detail: 'If the string ends in I, append U.'
		})
	];
}

function doubleTailMoves(source: string): MiuMove[] {
	if (!source.startsWith('M')) {
		return [];
	}

	const tail = source.slice(1);

	return [
		createMove({
			ruleId: 'double-tail',
			ruleLabel: 'Rule 2',
			source,
			result: `M${tail}${tail}`,
			start: 1,
			end: source.length,
			detail: 'If the string has the form Mx, produce Mxx.'
		})
	];
}

function replaceThreeIsMoves(source: string): MiuMove[] {
	return enumerateSubstringMatches(source, 'III').map((start) =>
		createMove({
			ruleId: 'replace-iii',
			ruleLabel: 'Rule 3',
			source,
			result: `${source.slice(0, start)}U${source.slice(start + 3)}`,
			start,
			end: start + 3,
			detail: 'Replace any occurrence of III with U.'
		})
	);
}

function deleteDoubleUMoves(source: string): MiuMove[] {
	return enumerateSubstringMatches(source, 'UU').map((start) =>
		createMove({
			ruleId: 'delete-uu',
			ruleLabel: 'Rule 4',
			source,
			result: `${source.slice(0, start)}${source.slice(start + 2)}`,
			start,
			end: start + 2,
			detail: 'Delete any occurrence of UU.'
		})
	);
}

function enumerateSubstringMatches(source: string, pattern: string): number[] {
	const matches: number[] = [];

	for (let index = 0; index <= source.length - pattern.length; index += 1) {
		if (source.slice(index, index + pattern.length) === pattern) {
			matches.push(index);
		}
	}

	return matches;
}

function createMove(move: Omit<MiuMove, 'key'>): MiuMove {
	return {
		...move,
		key: `${move.ruleId}:${move.start}:${move.end}:${move.result}`
	};
}

function summarizeExactMatches(moves: MiuMove[]): string {
	if (moves.length === 1) {
		return `Legal next step via ${moves[0]!.ruleLabel}.`;
	}

	const labels = Array.from(new Set(moves.map((move) => move.ruleLabel))).join(' and ');
	return `Legal next step via ${labels}.`;
}

function differentResultExplanation(ruleId: MiuRuleId, proposed: string, ruleMoves: MiuMove[]): string {
	const legalResults = uniqueResults(ruleMoves);
	const preview = legalResults.slice(0, 3).join(', ');
	const suffix = legalResults.length > 3 ? ', ...' : '';

	if (legalResults.length === 1) {
		return `${labelForRule(ruleId)} is applicable here, but it would produce ${legalResults[0]}, not ${proposed}.`;
	}

	return `${labelForRule(ruleId)} is applicable here, but it can only produce ${preview}${suffix}, not ${proposed}.`;
}

function unavailableRuleExplanation(source: string, ruleId: MiuRuleId): string {
	switch (ruleId) {
		case 'append-u':
			return 'Rule 1 is unavailable because the current string does not end in I.';
		case 'double-tail':
			return 'Rule 2 is unavailable only when the current string is not a valid MIU state.';
		case 'replace-iii':
			return 'Rule 3 is unavailable because the current string has no III span.';
		case 'delete-uu':
			return 'Rule 4 is unavailable because the current string has no UU span.';
	}
}

function patternForRule(ruleId: MiuRuleId): string {
	switch (ruleId) {
		case 'append-u':
			return 'xI → xIU';
		case 'double-tail':
			return 'Mx → Mxx';
		case 'replace-iii':
			return 'III → U';
		case 'delete-uu':
			return 'UU → ∅';
	}
}

/**
 * Why a rule has no site right now, phrased for the learner. Rule 2 always
 * applies to a valid MIU state (every state starts with M), so it never needs
 * a reason; the fallback is unreachable in practice.
 */
function availabilityReason(ruleId: MiuRuleId): string {
	switch (ruleId) {
		case 'append-u':
			return "the string doesn't end in I";
		case 'double-tail':
			return 'the string does not start with M';
		case 'replace-iii':
			return 'no III in this string';
		case 'delete-uu':
			return 'no UU in this string';
	}
}

function uniqueResults(moves: MiuMove[]): string[] {
	return Array.from(new Set(moves.map((move) => move.result)));
}

function labelForRule(ruleId: MiuRuleId): string {
	switch (ruleId) {
		case 'append-u':
			return 'Rule 1';
		case 'double-tail':
			return 'Rule 2';
		case 'replace-iii':
			return 'Rule 3';
		case 'delete-uu':
			return 'Rule 4';
	}
}

function assertValidMiuString(value: string): void {
	if (!isValidMiuString(value)) {
		throw new Error(`Invalid MIU string: ${value}`);
	}
}

function isValidMiuString(value: string): boolean {
	return /^M[IU]*$/.test(value);
}
