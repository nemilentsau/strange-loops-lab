import { describe, expect, it } from 'vitest';

import {
	MODULE1_STORAGE_KEY,
	createModule1Draft,
	ellipsizeMiddle,
	normalizeModule1Artifacts,
	normalizeModule1Draft,
	pickNewestDraft,
	readModule1Draft,
	restoreModule1Artifact,
	writeModule1Draft
} from './module1';

describe('ellipsizeMiddle', () => {
	it('returns a string at exactly the limit unchanged', () => {
		const value = 'M' + 'I'.repeat(24);

		expect(ellipsizeMiddle(value)).toBe(value);
	});

	it('shortens past the limit to the limit, keeping both ends', () => {
		const value = 'MUIIUUIIUUII' + 'XY' + 'UIIUUIIUUIIU';

		expect(ellipsizeMiddle(value)).toBe('MUIIUUIIUUII…UIIUUIIUUIIU');
		expect(ellipsizeMiddle(value)).toHaveLength(25);
	});
});

describe('module1 draft state', () => {
	it('creates a conservative default draft', () => {
		const draft = createModule1Draft();

		expect(draft.activeSurface).toBe('sandbox');
		expect(draft.dialogueMode).toBe('Explain-Back Examiner');
		expect(draft.dialogueInput).toBe('');
		expect(draft.lastDialogue).toBeNull();
		expect(draft.proposalInput).toBe('');
		expect(draft.muTested).toBe(false);
		expect(draft.trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(draft.graphDepth).toBe(3);
		expect(draft.graphNodeLimit).toBe(16);
		expect(draft.selectedGraphNode).toBeNull();
		expect(draft.visitedSurfaces).toEqual(['sandbox']);
	});

	it('sanitizes invalid stored state', () => {
		const draft = normalizeModule1Draft({
			activeSurface: 'forbidden',
			dialogueMode: 'oracle',
			dialogueInput: 3,
			lastDialogue: { messages: [{ agent: 'bad', content: 'x' }], finalResponse: 1 },
			workingQuestion: 7,
			proposalInput: 19,
			muTested: 'yes',
			trace: { steps: [{ value: 'MU', via: null }], currentIndex: 12 },
			graphDepth: 999,
			graphNodeLimit: 2,
			selectedGraphNode: 123,
			visitedSurfaces: ['graph', 'graph', 'bad'],
			lastEditedAt: '2026-03-09T09:00:00.000Z'
		});

		expect(draft.activeSurface).toBe('sandbox');
		expect(draft.dialogueMode).toBe('Explain-Back Examiner');
		expect(draft.dialogueInput).toBe('');
		expect(draft.lastDialogue).toBeNull();
		expect(draft.workingQuestion).toContain('Can MI become MU');
		expect(draft.proposalInput).toBe('');
		expect(draft.muTested).toBe(false);
		expect(draft.trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(draft.graphDepth).toBe(3);
		expect(draft.graphNodeLimit).toBe(16);
		expect(draft.selectedGraphNode).toBeNull();
		expect(draft.visitedSurfaces).toEqual(['graph']);
		expect(draft.lastEditedAt).toBe('2026-03-09T09:00:00.000Z');
	});

	it('round-trips through storage', () => {
		const storage = new Map<string, string>();
		const mockStorage = {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, value)
		};

		const draft = {
			...createModule1Draft(),
			notes: 'Need a visible distinction between graph search and proof.',
			lastEditedAt: '2026-03-09T12:00:00.000Z'
		};

		writeModule1Draft(mockStorage, draft);

		expect(storage.has(MODULE1_STORAGE_KEY)).toBe(true);
		expect(readModule1Draft(mockStorage)).toEqual(draft);
	});

	it('keeps a latched MU-test flag through normalization', () => {
		const draft = normalizeModule1Draft({ ...createModule1Draft(), muTested: true });

		expect(draft.muTested).toBe(true);
	});

	it('normalizes an older Socratic draft back to the single supported dialogue mode', () => {
		const draft = normalizeModule1Draft({
			...createModule1Draft(),
			dialogueMode: 'Socratic Partner'
		});

		expect(draft.dialogueMode).toBe('Explain-Back Examiner');
	});

	it('filters malformed saved artifacts', () => {
		const artifacts = normalizeModule1Artifacts([
			{
				id: 1,
				artifactType: 'trace',
				title: 'Trace to MIU',
				payload: { trace: createModule1Draft().trace },
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			{
				id: 'bad',
				artifactType: 'note',
				title: 'Broken',
				payload: null,
				createdAt: '2026-03-28T12:00:00.000Z'
			}
		]);

		expect(artifacts).toHaveLength(1);
		expect(artifacts[0]?.artifactType).toBe('trace');
	});

	it('restores a note artifact into reflect', () => {
		const result = restoreModule1Artifact(
			createModule1Draft(),
			{
				id: 1,
				artifactType: 'note',
				title: 'Note: boundary',
				payload: { notes: 'Search is not proof.' },
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			'2026-03-28T12:30:00.000Z'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.draft.activePhase).toBe('reflect');
		expect(result.draft.activeSurface).toBe('artifacts');
		expect(result.draft.notes).toBe('Search is not proof.');
		expect(result.draft.lastEditedAt).toBe('2026-03-28T12:30:00.000Z');
	});

	it('restores a trace artifact into explore', () => {
		const trace = {
			steps: [
				{ value: 'MI', via: null },
				{
					value: 'MIU',
					via: {
						key: 'append-u:0:2',
						ruleId: 'append-u',
						ruleLabel: 'Rule 1',
						source: 'MI',
						result: 'MIU',
						start: 1,
						end: 1,
						detail: 'Append U to the end of a string ending in I.'
					}
				}
			],
			currentIndex: 1
		};

		const result = restoreModule1Artifact(
			createModule1Draft(),
			{
				id: 2,
				artifactType: 'trace',
				title: 'Trace to MIU',
				payload: { trace },
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			'2026-03-28T12:30:00.000Z'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.draft.activePhase).toBe('explore');
		expect(result.draft.activeSurface).toBe('trace');
		expect(result.draft.trace.steps.map((step) => step.value)).toEqual(['MI', 'MIU']);
		expect(result.draft.trace.currentIndex).toBe(1);
	});

	it('restores an invariant artifact into prove', () => {
		const draft = { ...createModule1Draft(), workingQuestion: 'old' };
		const result = restoreModule1Artifact(
			draft,
			{
				id: 3,
				artifactType: 'invariant-run',
				title: 'Invariant run',
				payload: {
					workingQuestion: 'Why does mod 3 matter?',
					trace: draft.trace,
					candidate: { label: 'count(I) mod 3 != 0' }
				},
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			'2026-03-28T12:30:00.000Z'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.draft.activePhase).toBe('prove');
		expect(result.draft.activeSurface).toBe('invariants');
		expect(result.draft.invariantCandidate).toBe('count(I) mod 3 != 0');
		expect(result.draft.workingQuestion).toBe('Why does mod 3 matter?');
	});

	it('restores a proof attempt and reloads its notes', () => {
		const result = restoreModule1Artifact(
			createModule1Draft(),
			{
				id: 4,
				artifactType: 'proof-attempt',
				title: 'Proof attempt',
				payload: {
					workingQuestion: 'Can MU ever appear?',
					notes: 'Rule 2 and Rule 3 preserve nonzero mod 3.',
					candidate: { label: 'count(I) mod 3 != 0' }
				},
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			'2026-03-28T12:30:00.000Z'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.draft.activePhase).toBe('prove');
		expect(result.draft.activeSurface).toBe('invariants');
		expect(result.draft.invariantCandidate).toBe('count(I) mod 3 != 0');
		expect(result.draft.notes).toBe('Rule 2 and Rule 3 preserve nonzero mod 3.');
		expect(result.draft.workingQuestion).toBe('Can MU ever appear?');
	});

	it('restores a dialogue artifact into reflect', () => {
		const result = restoreModule1Artifact(
			createModule1Draft(),
			{
				id: 5,
				artifactType: 'dialogue',
				title: 'Dialogue',
				payload: {
					userInput: 'I think search should be enough.',
					mode: 'Explain-Back Examiner',
					dialogue: {
						messages: [{ agent: 'examiner', content: 'Why would finite search prove a universal claim?' }],
						finalResponse: 'Search can motivate a conjecture, but it does not certify all derivations.',
						sessionId: 'sess_123',
						costUsd: 0.02
					}
				},
				createdAt: '2026-03-28T12:00:00.000Z'
			},
			'2026-03-28T12:30:00.000Z'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.draft.activePhase).toBe('reflect');
		expect(result.draft.activeSurface).toBe('dialogue');
		expect(result.draft.dialogueInput).toBe('I think search should be enough.');
		expect(result.draft.lastDialogue?.finalResponse).toContain('Search can motivate a conjecture');
	});

	it('rejects unsupported artifact types', () => {
		const result = restoreModule1Artifact(createModule1Draft(), {
			id: 6,
			artifactType: 'snapshot',
			title: 'Snapshot',
			payload: {},
			createdAt: '2026-03-28T12:00:00.000Z'
		});

		expect(result.ok).toBe(false);
		expect(result.status).toContain('not implemented');
	});

	it('picks the remote draft when remote is newer', () => {
		const local = { ...createModule1Draft(), lastEditedAt: '2026-03-01T10:00:00.000Z' };
		const remote = { ...createModule1Draft(), lastEditedAt: '2026-03-01T12:00:00.000Z' };

		expect(pickNewestDraft(local, remote)).toBe(remote);
	});

	it('keeps local draft when local is newer than remote', () => {
		const local = { ...createModule1Draft(), lastEditedAt: '2026-03-01T12:00:00.000Z' };
		const remote = { ...createModule1Draft(), lastEditedAt: '2026-03-01T10:00:00.000Z' };

		expect(pickNewestDraft(local, remote)).toBe(local);
	});

	it('keeps local draft when both have equal timestamps', () => {
		const ts = '2026-03-01T10:00:00.000Z';
		const local = { ...createModule1Draft(), lastEditedAt: ts };
		const remote = { ...createModule1Draft(), lastEditedAt: ts };

		expect(pickNewestDraft(local, remote)).toBe(local);
	});

	it('keeps local draft when remote lastEditedAt is null', () => {
		const local = { ...createModule1Draft(), lastEditedAt: '2026-03-01T10:00:00.000Z' };
		const remote = { ...createModule1Draft(), lastEditedAt: null };

		expect(pickNewestDraft(local, remote)).toBe(local);
	});

	it('picks remote draft when local lastEditedAt is null and remote is not', () => {
		const local = { ...createModule1Draft(), lastEditedAt: null };
		const remote = { ...createModule1Draft(), lastEditedAt: '2026-03-01T10:00:00.000Z' };

		expect(pickNewestDraft(local, remote)).toBe(remote);
	});

	it('keeps local draft when both lastEditedAt are null', () => {
		const local = { ...createModule1Draft(), lastEditedAt: null };
		const remote = { ...createModule1Draft(), lastEditedAt: null };

		expect(pickNewestDraft(local, remote)).toBe(local);
	});

	it('rejects malformed dialogue artifacts', () => {
		const result = restoreModule1Artifact(createModule1Draft(), {
			id: 7,
			artifactType: 'dialogue',
			title: 'Broken dialogue',
			payload: { userInput: 'x', dialogue: { finalResponse: 1 } },
			createdAt: '2026-03-28T12:00:00.000Z'
		});

		expect(result.ok).toBe(false);
		expect(result.status).toContain('could not be restored');
	});
});
