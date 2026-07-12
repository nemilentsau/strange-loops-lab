import {
	createDerivationTrace,
	normalizeTrace,
	type DerivationTrace
} from '$lib/miu/core';

export const MODULE1_STORAGE_KEY = 'strange-loops/module-1/v2';

/**
 * Middle-ellipsis for derived string previews (ledger previews, query
 * clauses) that would otherwise double every move. Only previews are ever
 * shortened — the derivation itself always renders strings in full,
 * wrapping (design rule: design for step 10, not step 1).
 */
export function ellipsizeMiddle(value: string, maxChars = 25): string {
	if (value.length <= maxChars) {
		return value;
	}

	const head = Math.ceil((maxChars - 1) / 2);
	const tail = maxChars - 1 - head;

	return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

/**
 * The persisted session state of the instrument: the derivation trace and
 * its last-edited stamp. The storage key predates the trimmed shape;
 * normalization reads old phase-era drafts by simply ignoring their extra
 * fields.
 */
export interface Module1Draft {
	trace: DerivationTrace;
	lastEditedAt: string | null;
}

export interface Module1Artifact {
	id: number;
	artifactType: string;
	title: string;
	payload: unknown;
	createdAt: string;
}

export function createModule1Draft(): Module1Draft {
	return {
		trace: createDerivationTrace(),
		lastEditedAt: null
	};
}

export function normalizeModule1Draft(input: unknown): Module1Draft {
	if (!input || typeof input !== 'object') {
		return createModule1Draft();
	}

	const candidate = input as Partial<Module1Draft>;

	return {
		trace: normalizeTrace(candidate.trace),
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
