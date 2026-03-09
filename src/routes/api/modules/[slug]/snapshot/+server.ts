import { json } from '@sveltejs/kit';

import { normalizeModule1Draft } from '$lib/state/module1';
import { getPersistenceStore } from '$lib/server/persistence';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const snapshot = getPersistenceStore().getModuleSnapshot(params.slug);

	return json({ snapshot });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = (await request.json()) as { draft?: unknown };
	const normalizedDraft = normalizeModule1Draft(body.draft);
	const snapshot = getPersistenceStore().saveModuleSnapshot(params.slug, normalizedDraft);

	return json({ snapshot });
};
