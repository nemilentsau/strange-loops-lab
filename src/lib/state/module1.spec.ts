import { describe, expect, it } from 'vitest';

import {
	MODULE1_STORAGE_KEY,
	createModule1Draft,
	normalizeModule1Draft,
	readModule1Draft,
	writeModule1Draft
} from './module1';

describe('module1 draft state', () => {
	it('creates a conservative default draft', () => {
		const draft = createModule1Draft();

		expect(draft.activeSurface).toBe('sandbox');
		expect(draft.dialogueMode).toBe('Explain-Back Examiner');
		expect(draft.dialogueInput).toBe('');
		expect(draft.lastDialogue).toBeNull();
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
});
