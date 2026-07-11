import { describe, expect, it } from 'vitest';

import { createModule1Draft } from '$lib/state/module1';
import {
	createArtifact,
	listArtifacts,
	loadSnapshot,
	runDialogue,
	saveSnapshot
} from './module1Api';

function makeOkFetch(body: unknown): typeof globalThis.fetch {
	return async () =>
		({
			ok: true,
			json: async () => body
		}) as Response;
}

function makeErrorFetch(status = 500): typeof globalThis.fetch {
	return async () =>
		({
			ok: false,
			status,
			json: async () => ({})
		}) as Response;
}

function makeThrowingFetch(): typeof globalThis.fetch {
	return async () => {
		throw new Error('network error');
	};
}

describe('loadSnapshot', () => {
	it('returns the normalized draft when the server returns a snapshot', async () => {
		const payload = {
			snapshot: {
				payload: createModule1Draft(),
				updatedAt: '2026-03-01T10:00:00.000Z'
			}
		};
		const result = await loadSnapshot(makeOkFetch(payload), 'module-1');

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft).not.toBeNull();
		expect(result.updatedAt).toBe('2026-03-01T10:00:00.000Z');
	});

	it('returns ok:false with reason http when the server responds with an error status', async () => {
		const result = await loadSnapshot(makeErrorFetch(), 'module-1');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('http');
	});

	it('returns ok:false with reason network when fetch throws', async () => {
		const result = await loadSnapshot(makeThrowingFetch(), 'module-1');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('network');
	});
});

describe('saveSnapshot', () => {
	it('returns the updatedAt timestamp when save succeeds', async () => {
		const payload = { snapshot: { updatedAt: '2026-03-01T11:00:00.000Z' } };
		const result = await saveSnapshot(makeOkFetch(payload), 'module-1', createModule1Draft());

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.updatedAt).toBe('2026-03-01T11:00:00.000Z');
	});

	it('returns ok:false when the server responds with an error status', async () => {
		const result = await saveSnapshot(makeErrorFetch(), 'module-1', createModule1Draft());
		expect(result.ok).toBe(false);
	});
});

describe('listArtifacts', () => {
	it('returns normalized artifacts on success', async () => {
		const payload = {
			artifacts: [
				{
					id: 1,
					artifactType: 'trace',
					title: 'Trace to MIU',
					payload: {},
					createdAt: '2026-03-28T12:00:00.000Z'
				}
			]
		};
		const result = await listArtifacts(makeOkFetch(payload), 'module-1');

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.artifacts).toHaveLength(1);
		expect(result.artifacts[0]?.artifactType).toBe('trace');
	});

	it('returns ok:false with reason http when the server responds with an error status', async () => {
		const result = await listArtifacts(makeErrorFetch(), 'module-1');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('http');
	});

	it('returns ok:false with reason network when fetch throws', async () => {
		const result = await listArtifacts(makeThrowingFetch(), 'module-1');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('network');
	});
});

describe('createArtifact', () => {
	it('returns the normalized artifact on success', async () => {
		const payload = {
			artifact: {
				id: 2,
				artifactType: 'note',
				title: 'Note: test',
				payload: {},
				createdAt: '2026-03-28T13:00:00.000Z'
			}
		};
		const result = await createArtifact(makeOkFetch(payload), 'module-1', 'note', 'Note: test', {});

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.artifact?.artifactType).toBe('note');
	});

	it('returns ok:false with reason http when the server responds with an error status', async () => {
		const result = await createArtifact(makeErrorFetch(), 'module-1', 'note', 'Note: test', {});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('http');
	});

	it('returns ok:false with reason network when fetch throws', async () => {
		const result = await createArtifact(makeThrowingFetch(), 'module-1', 'note', 'Note: test', {});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.reason).toBe('network');
	});
});

describe('runDialogue', () => {
	it('returns dialogue and artifact when the server returns a valid response', async () => {
		const payload = {
			dialogue: {
				messages: [{ agent: 'examiner', content: 'Why?' }],
				finalResponse: 'Because invariants.',
				sessionId: null,
				costUsd: 0.01
			},
			artifact: {
				id: 3,
				artifactType: 'dialogue',
				title: 'Dialogue',
				payload: {},
				createdAt: '2026-03-28T14:00:00.000Z'
			}
		};
		const result = await runDialogue(makeOkFetch(payload), 'module-1', 'I think search works', createModule1Draft());

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dialogue.finalResponse).toBe('Because invariants.');
		expect(result.artifact?.artifactType).toBe('dialogue');
	});

	it('carries the server error message when the response is not ok', async () => {
		const fetchWithError: typeof globalThis.fetch = async () =>
			({
				ok: false,
				json: async () => ({ error: 'Dialogue backend unavailable.' })
			}) as Response;

		const result = await runDialogue(fetchWithError, 'module-1', 'input', createModule1Draft());

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error).toBe('Dialogue backend unavailable.');
	});

	it('returns the fallback error message when fetch throws', async () => {
		const result = await runDialogue(makeThrowingFetch(), 'module-1', 'input', createModule1Draft());

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error).toBe('Feedback request failed.');
	});

	it('returns the failure variant when the response is ok but has no dialogue field', async () => {
		const fetchOkNoDialogue: typeof globalThis.fetch = async () =>
			({
				ok: true,
				json: async () => ({ error: 'No dialogue' })
			}) as Response;

		const result = await runDialogue(fetchOkNoDialogue, 'module-1', 'input', createModule1Draft());

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error).toBe('No dialogue');
	});
});
