import { describe, expect, it } from 'vitest';

import {
	MODULE1_STORAGE_KEY,
	createModule1Draft,
	ellipsizeMiddle,
	normalizeModule1Artifacts,
	normalizeModule1Draft,
	readModule1Draft,
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
	it('creates a default draft at the axiom with no edit stamp', () => {
		const draft = createModule1Draft();

		expect(draft.trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(draft.lastEditedAt).toBeNull();
	});

	it('sanitizes invalid stored state', () => {
		const draft = normalizeModule1Draft({
			trace: { steps: [{ value: 'MU', via: null }], currentIndex: 12 },
			lastEditedAt: 17
		});

		expect(draft.trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(draft.lastEditedAt).toBeNull();
	});

	it('ignores retired phase-era fields in stored drafts', () => {
		const draft = normalizeModule1Draft({
			activeSurface: 'graph',
			workingQuestion: 'Can MI become MU?',
			exerciseLatch: { rulesUsed: ['append-u'] },
			trace: createModule1Draft().trace,
			lastEditedAt: '2026-03-09T09:00:00.000Z'
		});

		expect(draft).toEqual({
			trace: createModule1Draft().trace,
			lastEditedAt: '2026-03-09T09:00:00.000Z'
		});
	});

	it('round-trips through storage', () => {
		const storage = new Map<string, string>();
		const mockStorage = {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, value)
		};

		const draft = {
			...createModule1Draft(),
			lastEditedAt: '2026-03-09T12:00:00.000Z'
		};

		writeModule1Draft(mockStorage, draft);

		expect(storage.has(MODULE1_STORAGE_KEY)).toBe(true);
		expect(readModule1Draft(mockStorage)).toEqual(draft);
	});

	it('falls back to a fresh draft on unreadable storage', () => {
		const mockStorage = { getItem: () => '{not json' };

		expect(readModule1Draft(mockStorage)).toEqual(createModule1Draft());
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
});
