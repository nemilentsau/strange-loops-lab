import { json } from '@sveltejs/kit';

import { getPersistenceStore } from '$lib/server/persistence';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const artifacts = getPersistenceStore().listArtifacts(params.slug);

	return json({ artifacts });
};

export const POST: RequestHandler = async ({ params, request }) => {
	const body = (await request.json()) as {
		artifactType?: string;
		title?: string;
		payload?: unknown;
	};

	if (!body.artifactType || !body.title) {
		return json({ error: 'artifactType and title are required.' }, { status: 400 });
	}

	const artifact = getPersistenceStore().createArtifact(
		params.slug,
		body.artifactType,
		body.title,
		body.payload ?? null
	);

	return json({ artifact }, { status: 201 });
};
