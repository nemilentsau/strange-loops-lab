import { describe, expect, it } from 'vitest';

import { createDerivationTrace, type DerivationTrace } from '$lib/miu/core';
import { analyzeInvariantCandidate, builtInInvariantAnalysis } from '$lib/miu/invariants';
import { restoreTargetForModule1Artifact, type Module1Artifact } from './module1';
import {
	ARTIFACT_TYPE_ORDER,
	ARTIFACT_TAXONOMY,
	artifactReviewMetadata,
	artifactTypeCounts,
	artifactTypeLabel,
	buildInvariantArtifact,
	buildNoteArtifact,
	buildProofArtifact,
	buildTraceArtifact,
	filterArtifactsByType,
	noteArtifactTitle,
	proofArtifactTitle,
	type KnownArtifactType
} from './module1Artifacts';

const trace = createDerivationTrace();
const currentString = 'MI';

function artifact(overrides: Partial<Module1Artifact> & Pick<Module1Artifact, 'artifactType'>): Module1Artifact {
	return {
		id: 1,
		title: 'Untitled',
		payload: null,
		createdAt: '2026-03-28T12:00:00.000Z',
		...overrides
	};
}

function twoStepTrace(target: string): DerivationTrace {
	return {
		steps: [
			{ value: 'MI', via: null },
			{
				value: target,
				via: {
					key: 'append-u:0:2',
					ruleId: 'append-u',
					ruleLabel: 'Rule 1',
					source: 'MI',
					result: target,
					start: 1,
					end: 1,
					detail: 'Append U.'
				}
			}
		],
		currentIndex: 1
	};
}

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

describe('artifact taxonomy', () => {
	it('describes every restorable artifact type the builders and dialogue route produce', () => {
		// The five concrete types the app can write; each needs a learner-facing label.
		const concreteTypes: KnownArtifactType[] = ['note', 'trace', 'invariant-run', 'proof-attempt', 'dialogue'];
		for (const type of concreteTypes) {
			expect(ARTIFACT_TAXONOMY[type]).toBeDefined();
			expect(ARTIFACT_TAXONOMY[type].label.length).toBeGreaterThan(0);
			expect(ARTIFACT_TAXONOMY[type].summary.length).toBeGreaterThan(0);
		}
	});

	it('orders types and includes no entries the taxonomy cannot describe', () => {
		expect(ARTIFACT_TYPE_ORDER).toEqual(['note', 'trace', 'invariant-run', 'proof-attempt', 'dialogue']);
		for (const type of ARTIFACT_TYPE_ORDER) {
			expect(ARTIFACT_TAXONOMY[type]).toBeDefined();
		}
	});

	it('keeps the taxonomy restore target consistent with the restore flow source of truth', () => {
		for (const type of ARTIFACT_TYPE_ORDER) {
			expect(ARTIFACT_TAXONOMY[type].restoreTarget).toEqual(restoreTargetForModule1Artifact(type));
		}
	});

	it('labels a known type with its taxonomy label and an unknown type with its raw key', () => {
		expect(artifactTypeLabel('invariant-run')).toBe(ARTIFACT_TAXONOMY['invariant-run'].label);
		expect(artifactTypeLabel('mystery')).toBe('mystery');
	});
});

describe('filterArtifactsByType', () => {
	const items = [
		artifact({ id: 1, artifactType: 'note' }),
		artifact({ id: 2, artifactType: 'trace' }),
		artifact({ id: 3, artifactType: 'note' })
	];

	it('returns every artifact when the filter is "all"', () => {
		expect(filterArtifactsByType(items, 'all').map((a) => a.id)).toEqual([1, 2, 3]);
	});

	it('returns only artifacts of the selected type, preserving order', () => {
		expect(filterArtifactsByType(items, 'note').map((a) => a.id)).toEqual([1, 3]);
	});

	it('returns an empty list when no artifact matches the selected type', () => {
		expect(filterArtifactsByType(items, 'dialogue')).toEqual([]);
	});
});

describe('artifactTypeCounts', () => {
	it('counts each present type and totals them under "all"', () => {
		const counts = artifactTypeCounts([
			artifact({ id: 1, artifactType: 'note' }),
			artifact({ id: 2, artifactType: 'note' }),
			artifact({ id: 3, artifactType: 'dialogue' })
		]);

		expect(counts.all).toBe(3);
		expect(counts.note).toBe(2);
		expect(counts.dialogue).toBe(1);
	});

	it('reports zero for every taxonomy type when the list is empty', () => {
		const counts = artifactTypeCounts([]);
		expect(counts.all).toBe(0);
		for (const type of ARTIFACT_TYPE_ORDER) {
			expect(counts[type]).toBe(0);
		}
	});
});

describe('artifactReviewMetadata', () => {
	it('derives restore target plus current string for a note artifact', () => {
		const fields = artifactReviewMetadata(
			artifact({ artifactType: 'note', payload: { notes: 'x', currentString: 'MIU', lastEditedAt: null } })
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Reopens in']).toBe('Reflect');
		expect(map['String']).toBe('MIU');
	});

	it('reports the derivation target with a singular step count for a one-step trace', () => {
		const fields = artifactReviewMetadata(
			artifact({ artifactType: 'trace', payload: { trace: twoStepTrace('MIUIU'), currentString: 'MIUIU' } })
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Reopens in']).toBe('Explore');
		expect(map['Derivation']).toBe('MI → MIUIU (1 step)');
	});

	it('pluralizes the step count for a multi-step trace', () => {
		const trace: DerivationTrace = {
			steps: [
				{ value: 'MI', via: null },
				{ value: 'MII', via: twoStepTrace('MII').steps[1].via },
				{ value: 'MIIII', via: twoStepTrace('MIIII').steps[1].via }
			],
			currentIndex: 2
		};
		const fields = artifactReviewMetadata(
			artifact({ artifactType: 'trace', payload: { trace, currentString: 'MIIII' } })
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Derivation']).toBe('MI → MIIII (2 steps)');
	});

	it('shows the full path for a loop-back trace where start equals end', () => {
		// Synthetic trace: MI → MIU → MI (start === end but stepCount > 0)
		const loopTrace: DerivationTrace = {
			steps: [
				{ value: 'MI', via: null },
				{ value: 'MIU', via: twoStepTrace('MIU').steps[1].via },
				{ value: 'MI', via: twoStepTrace('MI').steps[1].via }
			],
			currentIndex: 2
		};
		const fields = artifactReviewMetadata(
			artifact({ artifactType: 'trace', payload: { trace: loopTrace, currentString: 'MI' } })
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Derivation']).toBe('MI → MI (2 steps)');
	});

	it('surfaces the candidate invariant for an invariant-run artifact', () => {
		const fields = artifactReviewMetadata(
			artifact({
				artifactType: 'invariant-run',
				payload: {
					currentString: 'MI',
					workingQuestion: 'Why mod 3?',
					candidate: { label: 'count(I) mod 3 != 0' }
				}
			})
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Reopens in']).toBe('Prove');
		expect(map['Candidate']).toBe('count(I) mod 3 != 0');
	});

	it('describes a dialogue artifact from the server-side payload shape', () => {
		const fields = artifactReviewMetadata(
			artifact({
				artifactType: 'dialogue',
				payload: {
					userInput: 'I think search is enough.',
					mode: 'Explain-Back Examiner',
					dialogue: {
						messages: [
							{ agent: 'examiner', content: 'Why?' },
							{ agent: 'proof_coach', content: 'Missing premise.' }
						],
						finalResponse: 'Search motivates, it does not certify.',
						sessionId: 'sess_1',
						costUsd: 0.02
					}
				}
			})
		);
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Reopens in']).toBe('Reflect');
		expect(map['Mode']).toBe('Explain-Back Examiner');
		expect(map['Turns']).toBe('2');
	});

	it('omits payload-derived fields when the payload is missing but still reports the restore target', () => {
		const fields = artifactReviewMetadata(artifact({ artifactType: 'note', payload: null }));
		const labels = fields.map((f) => f.label);

		expect(labels).toContain('Reopens in');
		expect(labels).not.toContain('String');
	});

	it('reports the saved-only state for an unrestorable artifact type', () => {
		const fields = artifactReviewMetadata(artifact({ artifactType: 'snapshot', payload: {} }));
		const map = Object.fromEntries(fields.map((f) => [f.label, f.value]));

		expect(map['Reopens in']).toBe('Saved only');
	});
});
