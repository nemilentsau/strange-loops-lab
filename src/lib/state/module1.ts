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
export type DialogueMode = 'Explain-Back Examiner';

export const LAB_PHASES = ['explore', 'map', 'prove', 'reflect'] as const;
export type LabPhase = (typeof LAB_PHASES)[number];

export const PHASE_SURFACES: Record<LabPhase, SurfaceId[]> = {
	explore: ['sandbox', 'trace'],
	map: ['graph'],
	prove: ['invariants'],
	reflect: ['dialogue', 'artifacts']
};

export const PHASE_META: Record<
	LabPhase,
	{ index: number; label: string; epistemicLabel: string; tone: 'verified' | 'computed' | 'coaching' }
> = {
	explore: { index: 1, label: 'Explore', epistemicLabel: 'inside the system', tone: 'verified' },
	map: { index: 2, label: 'Map', epistemicLabel: 'the boundary', tone: 'computed' },
	prove: { index: 3, label: 'Prove', epistemicLabel: 'outside the system', tone: 'verified' },
	reflect: { index: 4, label: 'Reflect', epistemicLabel: 'synthesis', tone: 'coaching' }
};

export function phaseForSurface(surface: SurfaceId): LabPhase {
	for (const [phase, surfaces] of Object.entries(PHASE_SURFACES)) {
		if ((surfaces as SurfaceId[]).includes(surface)) {
			return phase as LabPhase;
		}
	}
	return 'explore';
}

function phasesFromVisitedSurfaces(visited: SurfaceId[]): LabPhase[] {
	const phases = new Set<LabPhase>();
	for (const surface of visited) {
		phases.add(phaseForSurface(surface));
	}
	return LAB_PHASES.filter((p) => phases.has(p));
}

export interface Module1Draft {
	activePhase: LabPhase;
	visitedPhases: LabPhase[];
	activeSurface: SurfaceId;
	dialogueMode: DialogueMode;
	dialogueInput: string;
	lastDialogue: DialogueResult | null;
	workingQuestion: string;
	proposalInput: string;
	invariantCandidate: string;
	notes: string;
	trace: DerivationTrace;
	graphDepth: number;
	graphNodeLimit: number;
	selectedGraphNode: string | null;
	visitedSurfaces: SurfaceId[];
	lastEditedAt: string | null;
}

export interface Module1Artifact {
	id: number;
	artifactType: string;
	title: string;
	payload: unknown;
	createdAt: string;
}

export type RestoreModule1ArtifactResult =
	| {
			ok: true;
			draft: Module1Draft;
			status: string;
	  }
	| {
			ok: false;
			status: string;
	  };

const DIALOGUE_MODES: DialogueMode[] = ['Explain-Back Examiner'];

export function createModule1Draft(): Module1Draft {
	return {
		activePhase: 'explore',
		visitedPhases: ['explore'],
		activeSurface: 'sandbox',
		dialogueMode: 'Explain-Back Examiner',
		dialogueInput: '',
		lastDialogue: null,
		workingQuestion: 'Can MI become MU, and what would count as evidence either way?',
		proposalInput: 'MU',
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

	const activeSurface = isSurfaceId(candidate.activeSurface) ? candidate.activeSurface : fallback.activeSurface;
	const visitedSurfaces = normalizeVisitedSurfaces(candidate.visitedSurfaces);

	return {
		activePhase: isLabPhase(candidate.activePhase)
			? candidate.activePhase
			: phaseForSurface(activeSurface),
		visitedPhases: normalizeVisitedPhases(candidate.visitedPhases, visitedSurfaces),
		activeSurface,
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
		proposalInput:
			typeof candidate.proposalInput === 'string' ? candidate.proposalInput : fallback.proposalInput,
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
		visitedSurfaces,
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

export function normalizeModule1Artifact(input: unknown): Module1Artifact | null {
	if (!input || typeof input !== 'object') {
		return null;
	}

	const candidate = input as Partial<Module1Artifact>;

	if (
		typeof candidate.id !== 'number' ||
		typeof candidate.artifactType !== 'string' ||
		typeof candidate.title !== 'string' ||
		typeof candidate.createdAt !== 'string'
	) {
		return null;
	}

	return {
		id: candidate.id,
		artifactType: candidate.artifactType,
		title: candidate.title,
		payload: candidate.payload ?? null,
		createdAt: candidate.createdAt
	};
}

export function normalizeModule1Artifacts(input: unknown): Module1Artifact[] {
	if (!Array.isArray(input)) {
		return [];
	}

	return input
		.map((artifact) => normalizeModule1Artifact(artifact))
		.filter((artifact): artifact is Module1Artifact => artifact !== null);
}

export function restoreTargetForModule1Artifact(
	artifactType: string
): { phase: LabPhase; surface: SurfaceId } | null {
	switch (artifactType) {
		case 'note':
			return { phase: 'reflect', surface: 'artifacts' };
		case 'trace':
			return { phase: 'explore', surface: 'trace' };
		case 'invariant-run':
		case 'proof-attempt':
			return { phase: 'prove', surface: 'invariants' };
		case 'dialogue':
			return { phase: 'reflect', surface: 'dialogue' };
		default:
			return null;
	}
}

export function restoreModule1Artifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt = new Date().toISOString()
): RestoreModule1ArtifactResult {
	switch (artifact.artifactType) {
		case 'note':
			return restoreNoteArtifact(draft, artifact, restoredAt);
		case 'trace':
			return restoreTraceArtifact(draft, artifact, restoredAt);
		case 'invariant-run':
			return restoreInvariantArtifact(draft, artifact, restoredAt);
		case 'proof-attempt':
			return restoreProofArtifact(draft, artifact, restoredAt);
		case 'dialogue':
			return restoreDialogueArtifact(draft, artifact, restoredAt);
		default:
			return {
				ok: false,
				status: `Restore is not implemented for ${artifact.artifactType} artifacts.`
			};
	}
}

function isSurfaceId(value: unknown): value is SurfaceId {
	return typeof value === 'string' && SURFACE_SEQUENCE.includes(value as SurfaceId);
}

function isLabPhase(value: unknown): value is LabPhase {
	return typeof value === 'string' && LAB_PHASES.includes(value as LabPhase);
}

function normalizeVisitedPhases(input: unknown, visitedSurfaces: SurfaceId[]): LabPhase[] {
	if (Array.isArray(input)) {
		const valid = input.filter(isLabPhase);
		const unique = valid.filter((v, i, a) => a.indexOf(v) === i);
		if (unique.length > 0) return unique;
	}
	return phasesFromVisitedSurfaces(visitedSurfaces);
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

function restoreNoteArtifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt: string
): RestoreModule1ArtifactResult {
	const payload = asRecord(artifact.payload);

	if (!payload || typeof payload.notes !== 'string') {
		return { ok: false, status: 'Saved note payload is incomplete and could not be restored.' };
	}

	return {
		ok: true,
		draft: buildRestoredDraft(
			draft,
			{ activePhase: 'reflect', activeSurface: 'artifacts', notes: payload.notes },
			restoredAt
		),
		status: `Restored note artifact "${artifact.title}" into Reflect.`
	};
}

function restoreTraceArtifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt: string
): RestoreModule1ArtifactResult {
	const payload = asRecord(artifact.payload);

	if (!payload || !('trace' in payload)) {
		return { ok: false, status: 'Saved trace payload is incomplete and could not be restored.' };
	}

	return {
		ok: true,
		draft: buildRestoredDraft(
			draft,
			{
				activePhase: 'explore',
				activeSurface: 'trace',
				trace: normalizeTrace(payload.trace)
			},
			restoredAt
		),
		status: `Restored trace artifact "${artifact.title}" into Explore.`
	};
}

function restoreInvariantArtifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt: string
): RestoreModule1ArtifactResult {
	const payload = asRecord(artifact.payload);
	const candidateLabel = payload ? extractCandidateLabel(payload.candidate) : null;

	if (!payload || !candidateLabel) {
		return {
			ok: false,
			status: 'Saved invariant artifact is missing its candidate and could not be restored.'
		};
	}

	const nextDraft: Partial<Module1Draft> & { activePhase: LabPhase; activeSurface: SurfaceId } = {
		activePhase: 'prove',
		activeSurface: 'invariants',
		invariantCandidate: candidateLabel
	};

	if ('trace' in payload) {
		nextDraft.trace = normalizeTrace(payload.trace);
	}

	if (typeof payload.workingQuestion === 'string') {
		nextDraft.workingQuestion = payload.workingQuestion;
	}

	return {
		ok: true,
		draft: buildRestoredDraft(draft, nextDraft, restoredAt),
		status: `Restored invariant artifact "${artifact.title}" into Prove.`
	};
}

function restoreProofArtifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt: string
): RestoreModule1ArtifactResult {
	const payload = asRecord(artifact.payload);
	const candidateLabel = payload ? extractCandidateLabel(payload.candidate) : null;
	const notes = payload && typeof payload.notes === 'string' ? payload.notes : null;

	if (!payload || (!candidateLabel && notes === null)) {
		return {
			ok: false,
			status: 'Saved proof attempt is missing its reusable fields and could not be restored.'
		};
	}

	const nextDraft: Partial<Module1Draft> & { activePhase: LabPhase; activeSurface: SurfaceId } = {
		activePhase: 'prove',
		activeSurface: 'invariants'
	};

	if (candidateLabel) {
		nextDraft.invariantCandidate = candidateLabel;
	}

	if (notes !== null) {
		nextDraft.notes = notes;
	}

	if ('trace' in payload) {
		nextDraft.trace = normalizeTrace(payload.trace);
	}

	if (typeof payload.workingQuestion === 'string') {
		nextDraft.workingQuestion = payload.workingQuestion;
	}

	return {
		ok: true,
		draft: buildRestoredDraft(draft, nextDraft, restoredAt),
		status: `Restored proof attempt "${artifact.title}" into Prove and reloaded its notes.`
	};
}

function restoreDialogueArtifact(
	draft: Module1Draft,
	artifact: Module1Artifact,
	restoredAt: string
): RestoreModule1ArtifactResult {
	const payload = asRecord(artifact.payload);
	const dialogue = payload ? normalizeDialogue(payload.dialogue) : null;

	if (!payload || !dialogue) {
		return {
			ok: false,
			status: 'Saved dialogue artifact is incomplete and could not be restored.'
		};
	}

	return {
		ok: true,
		draft: buildRestoredDraft(
			draft,
			{
				activePhase: 'reflect',
				activeSurface: 'dialogue',
				dialogueInput:
					typeof payload.userInput === 'string' ? payload.userInput : draft.dialogueInput,
				dialogueMode: isDialogueMode(payload.mode) ? payload.mode : draft.dialogueMode,
				lastDialogue: dialogue
			},
			restoredAt,
			['artifacts']
		),
		status: `Restored dialogue artifact "${artifact.title}" into Reflect.`
	};
}

function buildRestoredDraft(
	draft: Module1Draft,
	next: Partial<Module1Draft> & { activePhase: LabPhase; activeSurface: SurfaceId },
	restoredAt: string,
	extraVisitedSurfaces: SurfaceId[] = []
): Module1Draft {
	return normalizeModule1Draft({
		...draft,
		...next,
		activePhase: next.activePhase,
		activeSurface: next.activeSurface,
		visitedPhases: appendUnique(draft.visitedPhases, next.activePhase),
		visitedSurfaces: appendUnique(
			draft.visitedSurfaces,
			next.activeSurface,
			...extraVisitedSurfaces
		),
		lastEditedAt: restoredAt
	});
}

function extractCandidateLabel(input: unknown): string | null {
	const candidate = asRecord(input);

	return candidate && typeof candidate.label === 'string' ? candidate.label : null;
}

function asRecord(input: unknown): Record<string, unknown> | null {
	return input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
}

function appendUnique<T>(current: T[], ...values: T[]): T[] {
	return Array.from(new Set([...current, ...values]));
}
