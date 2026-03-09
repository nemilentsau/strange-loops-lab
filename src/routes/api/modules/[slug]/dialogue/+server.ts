import { json } from '@sveltejs/kit';

import { normalizeModule1Draft } from '$lib/state/module1';
import { getPersistenceStore } from '$lib/server/persistence';
import { runModule1Dialogue } from '$lib/server/dialogue/team';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	if (params.slug !== 'module-1') {
		return json({ error: 'Dialogue mode is implemented only for module-1.' }, { status: 400 });
	}

	const body = (await request.json()) as { userInput?: string; draft?: unknown };
	const userInput = body.userInput?.trim() ?? '';

	if (!userInput) {
		return json({ error: 'userInput is required.' }, { status: 400 });
	}

	try {
		const draft = normalizeModule1Draft(body.draft);
		const dialogue = await runModule1Dialogue({ userInput, draft });
		const artifact = getPersistenceStore().createArtifact(params.slug, 'dialogue', `Dialogue: ${userInput.slice(0, 40)}`, {
			userInput,
			mode: draft.dialogueMode,
			dialogue
		});

		return json({ dialogue, artifact }, { status: 201 });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Dialogue run failed.' },
			{ status: 500 }
		);
	}
};
