import type { InvariantAnalysis } from '$lib/miu/invariants';
import type { DerivationTrace } from '$lib/miu/core';

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
