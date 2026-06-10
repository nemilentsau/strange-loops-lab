import { describe, expect, it } from 'vitest';

import { createDerivationTrace } from '$lib/miu/core';
import { analyzeInvariantCandidate, builtInInvariantAnalysis } from '$lib/miu/invariants';
import {
	buildInvariantArtifact,
	buildNoteArtifact,
	buildProofArtifact,
	buildTraceArtifact,
	noteArtifactTitle,
	proofArtifactTitle
} from './module1Artifacts';

const trace = createDerivationTrace();
const currentString = 'MI';

describe('noteArtifactTitle', () => {
	it('prefixes a note preview when notes is non-empty', () => {
		expect(noteArtifactTitle('Search is not proof.')).toBe('Note: Search is not proof.');
	});

	it('truncates preview to 36 characters', () => {
		const longNotes = 'A'.repeat(50);
		const title = noteArtifactTitle(longNotes);
		expect(title).toBe(`Note: ${'A'.repeat(36)}`);
	});

	it('falls back to Module 1 note when notes is blank', () => {
		expect(noteArtifactTitle('')).toBe('Module 1 note');
		expect(noteArtifactTitle('   ')).toBe('Module 1 note');
	});
});

describe('proofArtifactTitle', () => {
	it('includes the invariant candidate when non-empty', () => {
		expect(proofArtifactTitle('count(I) mod 3 != 0')).toBe(
			'Proof attempt: count(I) mod 3 != 0'
		);
	});

	it('falls back to Proof attempt when candidate is blank', () => {
		expect(proofArtifactTitle('')).toBe('Proof attempt');
		expect(proofArtifactTitle('   ')).toBe('Proof attempt');
	});
});

describe('buildNoteArtifact', () => {
	it('produces a note blueprint with correct type, title, and payload', () => {
		const notes = 'Search is not proof.';
		const lastEditedAt = '2026-03-01T10:00:00.000Z';
		const blueprint = buildNoteArtifact(notes, currentString, lastEditedAt);

		expect(blueprint.artifactType).toBe('note');
		expect(blueprint.title).toBe(noteArtifactTitle(notes));
		expect(blueprint.payload).toEqual({ notes, currentString, lastEditedAt });
	});

	it('passes null lastEditedAt through unchanged', () => {
		const blueprint = buildNoteArtifact('x', currentString, null);
		expect((blueprint.payload as { lastEditedAt: unknown }).lastEditedAt).toBeNull();
	});
});

describe('buildTraceArtifact', () => {
	it('produces a trace blueprint with title derived from currentString', () => {
		const blueprint = buildTraceArtifact(trace, 'MIIU');

		expect(blueprint.artifactType).toBe('trace');
		expect(blueprint.title).toBe('Trace to MIIU');
		expect(blueprint.payload).toEqual({ trace, currentString: 'MIIU' });
	});
});

describe('buildInvariantArtifact', () => {
	it('produces an invariant-run blueprint with label from candidate', () => {
		const candidate = analyzeInvariantCandidate('count(I) mod 3 != 0', currentString);
		const builtIn = builtInInvariantAnalysis(currentString);

		const blueprint = buildInvariantArtifact(
			currentString,
			'Why does mod 3 matter?',
			trace,
			candidate,
			builtIn
		);

		expect(blueprint.artifactType).toBe('invariant-run');
		expect(blueprint.title).toBe(`Invariant run: ${candidate.label}`);

		const payload = blueprint.payload as Record<string, unknown>;
		expect(payload.currentString).toBe(currentString);
		expect(payload.workingQuestion).toBe('Why does mod 3 matter?');
		expect(payload.trace).toBe(trace);
		expect(payload.candidate).toBe(candidate);
		expect(payload.builtIn).toBe(builtIn);
	});
});

describe('buildProofArtifact', () => {
	it('produces a proof-attempt blueprint with fixed claim and candidate consequence', () => {
		const candidate = analyzeInvariantCandidate('count(I) mod 3 != 0', currentString);

		const blueprint = buildProofArtifact(
			currentString,
			'Can MU appear?',
			trace,
			candidate,
			'Rule 2 and 3 preserve the residue.',
			'count(I) mod 3 != 0'
		);

		expect(blueprint.artifactType).toBe('proof-attempt');
		expect(blueprint.title).toBe('Proof attempt: count(I) mod 3 != 0');

		const payload = blueprint.payload as Record<string, unknown>;
		expect(payload.claim).toBe('MU is unreachable from MI.');
		expect(payload.currentString).toBe(currentString);
		expect(payload.workingQuestion).toBe('Can MU appear?');
		expect(payload.trace).toBe(trace);
		expect(payload.candidate).toBe(candidate);
		expect(payload.notes).toBe('Rule 2 and 3 preserve the residue.');
		expect(payload.conclusion).toBe(candidate.consequence);
	});

	it('falls back to Proof attempt title when invariantCandidate is blank', () => {
		const candidate = analyzeInvariantCandidate('', currentString);
		const blueprint = buildProofArtifact(currentString, '', trace, candidate, '', '');
		expect(blueprint.title).toBe('Proof attempt');
	});
});
