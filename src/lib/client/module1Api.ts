import type { DialogueResult } from '$lib/dialogue/types';
import {
	normalizeModule1Artifact,
	normalizeModule1Artifacts,
	normalizeModule1Draft,
	type Module1Artifact,
	type Module1Draft
} from '$lib/state/module1';

export type LoadSnapshotResult =
	| { ok: true; draft: Module1Draft | null; updatedAt: string | null }
	| { ok: false; reason: 'http' | 'network' };

export type SaveSnapshotResult =
	| { ok: true; updatedAt: string }
	| { ok: false };

export type ListArtifactsResult =
	| { ok: true; artifacts: Module1Artifact[] }
	| { ok: false; reason: 'http' | 'network' };

export type CreateArtifactResult =
	| { ok: true; artifact: Module1Artifact | null }
	| { ok: false; reason: 'http' | 'network' };

export type RunDialogueResult =
	| { ok: true; dialogue: DialogueResult; artifact: Module1Artifact | null }
	| { ok: false; error: string };

export async function loadSnapshot(
	fetch: typeof globalThis.fetch,
	slug: string
): Promise<LoadSnapshotResult> {
	try {
		const response = await fetch(`/api/modules/${slug}/snapshot`);

		if (!response.ok) {
			return { ok: false, reason: 'http' };
		}

		const payload = (await response.json()) as {
			snapshot: { payload: unknown; updatedAt: string } | null;
		};

		const draft = payload.snapshot?.payload
			? normalizeModule1Draft(payload.snapshot.payload)
			: null;

		return {
			ok: true,
			draft,
			updatedAt: payload.snapshot?.updatedAt ?? null
		};
	} catch {
		return { ok: false, reason: 'network' };
	}
}

export async function saveSnapshot(
	fetch: typeof globalThis.fetch,
	slug: string,
	draft: Module1Draft
): Promise<SaveSnapshotResult> {
	try {
		const response = await fetch(`/api/modules/${slug}/snapshot`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ draft })
		});

		if (!response.ok) {
			return { ok: false };
		}

		const payload = (await response.json()) as { snapshot: { updatedAt: string } };

		return { ok: true, updatedAt: payload.snapshot.updatedAt };
	} catch {
		return { ok: false };
	}
}

export async function listArtifacts(
	fetch: typeof globalThis.fetch,
	slug: string
): Promise<ListArtifactsResult> {
	try {
		const response = await fetch(`/api/modules/${slug}/artifacts`);

		if (!response.ok) {
			return { ok: false, reason: 'http' };
		}

		const payload = (await response.json()) as { artifacts?: unknown };

		return { ok: true, artifacts: normalizeModule1Artifacts(payload.artifacts) };
	} catch {
		return { ok: false, reason: 'network' };
	}
}

export async function createArtifact(
	fetch: typeof globalThis.fetch,
	slug: string,
	artifactType: string,
	title: string,
	payload: unknown
): Promise<CreateArtifactResult> {
	try {
		const response = await fetch(`/api/modules/${slug}/artifacts`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ artifactType, title, payload })
		});

		if (!response.ok) {
			return { ok: false, reason: 'http' };
		}

		const result = (await response.json()) as { artifact?: unknown };

		return { ok: true, artifact: normalizeModule1Artifact(result.artifact) };
	} catch {
		return { ok: false, reason: 'network' };
	}
}

export async function runDialogue(
	fetch: typeof globalThis.fetch,
	slug: string,
	userInput: string,
	draft: Module1Draft
): Promise<RunDialogueResult> {
	try {
		const response = await fetch(`/api/modules/${slug}/dialogue`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ userInput, draft })
		});

		const payload = (await response.json()) as {
			error?: string;
			dialogue?: DialogueResult;
			artifact?: unknown;
		};

		if (!response.ok || !payload.dialogue) {
			return { ok: false, error: payload.error ?? 'Dialogue request failed.' };
		}

		const artifact = normalizeModule1Artifact(payload.artifact);

		return { ok: true, dialogue: payload.dialogue, artifact };
	} catch {
		return { ok: false, error: 'Feedback request failed.' };
	}
}
