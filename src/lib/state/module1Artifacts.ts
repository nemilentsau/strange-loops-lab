import type { InvariantAnalysis } from '$lib/miu/invariants';
import type { DerivationTrace } from '$lib/miu/core';
import { restoreTargetForModule1Artifact, type LabPhase, type Module1Artifact, type SurfaceId } from './module1';

export interface ArtifactBlueprint {
	artifactType: string;
	title: string;
	payload: unknown;
}

export function noteArtifactTitle(notes: string): string {
	const preview = notes.trim().slice(0, 36);
	return preview ? `Note: ${preview}` : 'Module 1 note';
}

export function proofArtifactTitle(invariantCandidate: string): string {
	const preview = invariantCandidate.trim();
	return preview ? `Proof attempt: ${preview}` : 'Proof attempt';
}

export function buildNoteArtifact(
	notes: string,
	currentString: string,
	lastEditedAt: string | null
): ArtifactBlueprint {
	return {
		artifactType: 'note',
		title: noteArtifactTitle(notes),
		payload: {
			notes,
			currentString,
			lastEditedAt
		}
	};
}

export function buildTraceArtifact(
	trace: DerivationTrace,
	currentString: string
): ArtifactBlueprint {
	return {
		artifactType: 'trace',
		title: `Trace to ${currentString}`,
		payload: {
			trace,
			currentString
		}
	};
}

export function buildInvariantArtifact(
	currentString: string,
	workingQuestion: string,
	trace: DerivationTrace,
	candidate: InvariantAnalysis,
	builtIn: InvariantAnalysis
): ArtifactBlueprint {
	return {
		artifactType: 'invariant-run',
		title: `Invariant run: ${candidate.label}`,
		payload: {
			currentString,
			workingQuestion,
			trace,
			candidate,
			builtIn
		}
	};
}

export function buildProofArtifact(
	currentString: string,
	workingQuestion: string,
	trace: DerivationTrace,
	candidate: InvariantAnalysis,
	notes: string,
	invariantCandidate: string
): ArtifactBlueprint {
	return {
		artifactType: 'proof-attempt',
		title: proofArtifactTitle(invariantCandidate),
		payload: {
			claim: 'MU is unreachable from MI.',
			currentString,
			workingQuestion,
			trace,
			candidate,
			notes,
			conclusion: candidate.consequence
		}
	};
}

// ── Notebook taxonomy ──────────────────────────────────────────────
// Learner-facing description of each artifact the app can write. The
// restore target is derived from the same source of truth the restore
// flow uses (restoreTargetForModule1Artifact in module1.ts) so the two
// can never drift. This is bookkeeping, not an epistemic claim.

export interface ArtifactTypeDescriptor {
	/** Short, learner-facing label for the type, used in badges and filters. */
	label: string;
	/** One-line description of what this artifact captures. */
	summary: string;
	/** Where restoring sends the learner; null when the type is saved-only. */
	restoreTarget: { phase: LabPhase; surface: SurfaceId } | null;
}

export const ARTIFACT_TYPE_ORDER = [
	'note',
	'trace',
	'invariant-run',
	'proof-attempt',
	'dialogue'
] as const;

export type KnownArtifactType = (typeof ARTIFACT_TYPE_ORDER)[number];

export const ARTIFACT_TAXONOMY: Record<
	KnownArtifactType,
	ArtifactTypeDescriptor
> = {
	note: {
		label: 'Note',
		summary: 'A freeform reflection captured from your notebook.',
		restoreTarget: restoreTargetForModule1Artifact('note')
	},
	trace: {
		label: 'Derivation',
		summary: 'A derivation path you built in Explore.',
		restoreTarget: restoreTargetForModule1Artifact('trace')
	},
	'invariant-run': {
		label: 'Invariant run',
		summary: 'A candidate invariant tested against the rules.',
		restoreTarget: restoreTargetForModule1Artifact('invariant-run')
	},
	'proof-attempt': {
		label: 'Proof attempt',
		summary: 'A worked argument for why MU is unreachable.',
		restoreTarget: restoreTargetForModule1Artifact('proof-attempt')
	},
	dialogue: {
		label: 'Dialogue',
		summary: 'A coaching exchange about your explanation.',
		restoreTarget: restoreTargetForModule1Artifact('dialogue')
	}
};

export function isKnownArtifactType(artifactType: string): artifactType is KnownArtifactType {
	return artifactType in ARTIFACT_TAXONOMY;
}

/** Learner-facing label for a type, falling back to the raw key for unknown types. */
export function artifactTypeLabel(artifactType: string): string {
	return isKnownArtifactType(artifactType) ? ARTIFACT_TAXONOMY[artifactType].label : artifactType;
}

export type ArtifactTypeFilter = KnownArtifactType | 'all';

/** Client-side filter over an already-loaded artifact list. Preserves order. */
export function filterArtifactsByType(
	artifacts: Module1Artifact[],
	filter: ArtifactTypeFilter
): Module1Artifact[] {
	if (filter === 'all') {
		return artifacts;
	}
	return artifacts.filter((artifact) => artifact.artifactType === filter);
}

export type ArtifactTypeCounts = Record<KnownArtifactType, number> & { all: number };

/** Count artifacts per known type (plus a total), for filter affordances. */
export function artifactTypeCounts(artifacts: Module1Artifact[]): ArtifactTypeCounts {
	const counts = { all: artifacts.length } as ArtifactTypeCounts;
	for (const type of ARTIFACT_TYPE_ORDER) {
		counts[type] = 0;
	}
	for (const artifact of artifacts) {
		if (isKnownArtifactType(artifact.artifactType)) {
			counts[artifact.artifactType] += 1;
		}
	}
	return counts;
}

// ── Review metadata ────────────────────────────────────────────────
// Compact, payload-derived bookkeeping shown on each notebook entry so a
// learner can recognize the right artifact without opening it. Every
// field is read from the stored payload at read time — no storage schema
// change, and no score-like metrics.

export interface ArtifactReviewField {
	label: string;
	value: string;
}

/**
 * Derive compact review metadata for a saved artifact from its payload.
 * Always leads with the restore target (the same source of truth the
 * restore flow uses), then adds type-specific recognizers when present.
 */
export function artifactReviewMetadata(artifact: Module1Artifact): ArtifactReviewField[] {
	const fields: ArtifactReviewField[] = [{ label: 'Reopens in', value: restoreTargetLabel(artifact.artifactType) }];
	const payload = asRecord(artifact.payload);

	if (!payload) {
		return fields;
	}

	switch (artifact.artifactType) {
		case 'note':
			pushString(fields, 'String', payload.currentString);
			break;
		case 'trace': {
			const derivation = describeTrace(payload.trace);
			if (derivation) {
				fields.push({ label: 'Derivation', value: derivation });
			}
			break;
		}
		case 'invariant-run':
			pushString(fields, 'Candidate', candidateLabel(payload.candidate));
			pushString(fields, 'String', payload.currentString);
			break;
		case 'proof-attempt':
			pushString(fields, 'Candidate', candidateLabel(payload.candidate));
			pushString(fields, 'Question', payload.workingQuestion);
			break;
		case 'dialogue':
			pushString(fields, 'Mode', payload.mode);
			pushString(fields, 'Turns', dialogueTurns(payload.dialogue));
			break;
		default:
			break;
	}

	return fields;
}

function restoreTargetLabel(artifactType: string): string {
	const target = restoreTargetForModule1Artifact(artifactType);
	return target ? capitalizePhase(target.phase) : 'Saved only';
}

function capitalizePhase(phase: LabPhase): string {
	return phase.charAt(0).toUpperCase() + phase.slice(1);
}

function pushString(fields: ArtifactReviewField[], label: string, value: unknown): void {
	if (typeof value === 'string' && value.trim()) {
		fields.push({ label, value: value.trim() });
	}
}

function describeTrace(input: unknown): string | null {
	const trace = asRecord(input);
	if (!trace || !Array.isArray(trace.steps) || trace.steps.length === 0) {
		return null;
	}

	const values = trace.steps
		.map((step) => asRecord(step))
		.map((step) => (step && typeof step.value === 'string' ? step.value : null))
		.filter((value): value is string => value !== null);

	if (values.length === 0) {
		return null;
	}

	const start = values[0];
	const end = values[values.length - 1];
	const stepCount = values.length - 1;
	const path = stepCount === 0 ? start : `${start} → ${end}`;
	return `${path} (${stepCount} ${stepCount === 1 ? 'step' : 'steps'})`;
}

function candidateLabel(input: unknown): string | null {
	const candidate = asRecord(input);
	return candidate && typeof candidate.label === 'string' ? candidate.label : null;
}

function dialogueTurns(input: unknown): string | null {
	const dialogue = asRecord(input);
	if (!dialogue || !Array.isArray(dialogue.messages)) {
		return null;
	}
	return String(dialogue.messages.length);
}

function asRecord(input: unknown): Record<string, unknown> | null {
	return input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
}
