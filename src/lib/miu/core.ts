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

function assertValidMiuString(value: string): void {
	if (!isValidMiuString(value)) {
		throw new Error(`Invalid MIU string: ${value}`);
	}
}

function isValidMiuString(value: string): boolean {
	return /^M[IU]*$/.test(value);
}
