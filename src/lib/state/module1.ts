import {
	createDerivationTrace,
	normalizeTrace,
	type DerivationTrace
} from '$lib/miu/core';
import type { DialogueResult } from '$lib/dialogue/types';

export const MODULE1_STORAGE_KEY = 'strange-loops/module-1/v2';
export const GRAPH_DEPTH_OPTIONS = [1, 2, 3, 4, 5] as const;
export const GRAPH_NODE_LIMIT_OPTIONS = [8, 16, 24, 40, 64] as const;

export const SURFACE_SEQUENCE = [
	'sandbox',
	'trace',
	'graph',
	'invariants',
	'dialogue',
	'artifacts'
] as const;

export type SurfaceId = (typeof SURFACE_SEQUENCE)[number];
export type DialogueMode = 'Explain-Back Examiner' | 'Socratic Partner';

export interface Module1Draft {
	activeSurface: SurfaceId;
	dialogueMode: DialogueMode;
	dialogueInput: string;
	lastDialogue: DialogueResult | null;
	workingQuestion: string;
	invariantCandidate: string;
	notes: string;
	trace: DerivationTrace;
	graphDepth: number;
	graphNodeLimit: number;
	selectedGraphNode: string | null;
	visitedSurfaces: SurfaceId[];
	lastEditedAt: string | null;
}

const DIALOGUE_MODES: DialogueMode[] = ['Explain-Back Examiner', 'Socratic Partner'];

export function createModule1Draft(): Module1Draft {
	return {
		activeSurface: 'sandbox',
		dialogueMode: 'Explain-Back Examiner',
		dialogueInput: '',
		lastDialogue: null,
		workingQuestion: 'Can MI become MU, and what would count as evidence either way?',
		invariantCandidate: 'count(I) mod 3 != 0',
		notes: '',
		trace: createDerivationTrace(),
		graphDepth: 3,
		graphNodeLimit: 16,
		selectedGraphNode: null,
		visitedSurfaces: ['sandbox'],
		lastEditedAt: null
	};
}

export function normalizeModule1Draft(input: unknown): Module1Draft {
	const fallback = createModule1Draft();

	if (!input || typeof input !== 'object') {
		return fallback;
	}

	const candidate = input as Partial<Module1Draft>;

	return {
		activeSurface: isSurfaceId(candidate.activeSurface) ? candidate.activeSurface : fallback.activeSurface,
		dialogueMode: isDialogueMode(candidate.dialogueMode)
			? candidate.dialogueMode
			: fallback.dialogueMode,
		dialogueInput:
			typeof candidate.dialogueInput === 'string' ? candidate.dialogueInput : fallback.dialogueInput,
		lastDialogue: normalizeDialogue(candidate.lastDialogue),
		workingQuestion:
			typeof candidate.workingQuestion === 'string'
				? candidate.workingQuestion
				: fallback.workingQuestion,
		invariantCandidate:
			typeof candidate.invariantCandidate === 'string'
				? candidate.invariantCandidate
				: fallback.invariantCandidate,
		notes: typeof candidate.notes === 'string' ? candidate.notes : fallback.notes,
		trace: normalizeTrace(candidate.trace),
		graphDepth: normalizeNumericOption(candidate.graphDepth, GRAPH_DEPTH_OPTIONS, fallback.graphDepth),
		graphNodeLimit: normalizeNumericOption(
			candidate.graphNodeLimit,
			GRAPH_NODE_LIMIT_OPTIONS,
			fallback.graphNodeLimit
		),
		selectedGraphNode:
			typeof candidate.selectedGraphNode === 'string' ? candidate.selectedGraphNode : null,
		visitedSurfaces: normalizeVisitedSurfaces(candidate.visitedSurfaces),
		lastEditedAt: typeof candidate.lastEditedAt === 'string' ? candidate.lastEditedAt : null
	};
}

export function readModule1Draft(storage?: Pick<Storage, 'getItem'>): Module1Draft {
	if (!storage) {
		return createModule1Draft();
	}

	const raw = storage.getItem(MODULE1_STORAGE_KEY);

	if (!raw) {
		return createModule1Draft();
	}

	try {
		return normalizeModule1Draft(JSON.parse(raw));
	} catch {
		return createModule1Draft();
	}
}

export function writeModule1Draft(
	storage: Pick<Storage, 'setItem'> | undefined,
	draft: Module1Draft
): void {
	if (!storage) {
		return;
	}

	storage.setItem(MODULE1_STORAGE_KEY, JSON.stringify(draft));
}

function isSurfaceId(value: unknown): value is SurfaceId {
	return typeof value === 'string' && SURFACE_SEQUENCE.includes(value as SurfaceId);
}

function isDialogueMode(value: unknown): value is DialogueMode {
	return typeof value === 'string' && DIALOGUE_MODES.includes(value as DialogueMode);
}

function normalizeVisitedSurfaces(input: unknown): SurfaceId[] {
	if (!Array.isArray(input)) {
		return ['sandbox'];
	}

	const unique = input.filter(isSurfaceId).filter((value, index, values) => values.indexOf(value) === index);

	return unique.length > 0 ? unique : ['sandbox'];
}

function normalizeNumericOption(
	input: unknown,
	allowedValues: readonly number[],
	fallback: number
): number {
	return typeof input === 'number' && allowedValues.includes(input) ? input : fallback;
}

function normalizeDialogue(input: unknown): DialogueResult | null {
	if (!input || typeof input !== 'object') {
		return null;
	}

	const candidate = input as Partial<DialogueResult>;

	if (
		!Array.isArray(candidate.messages) ||
		typeof candidate.finalResponse !== 'string' ||
		(candidate.sessionId !== null && candidate.sessionId !== undefined && typeof candidate.sessionId !== 'string') ||
		(candidate.costUsd !== null && candidate.costUsd !== undefined && typeof candidate.costUsd !== 'number')
	) {
		return null;
	}

	const messages = candidate.messages.filter(
		(message): message is DialogueResult['messages'][number] =>
			!!message &&
			typeof message === 'object' &&
			(message.agent === 'examiner' || message.agent === 'proof_coach') &&
			typeof message.content === 'string'
	);

	if (messages.length !== candidate.messages.length) {
		return null;
	}

	return {
		messages,
		finalResponse: candidate.finalResponse,
		sessionId: candidate.sessionId ?? null,
		costUsd: candidate.costUsd ?? null
	};
}
