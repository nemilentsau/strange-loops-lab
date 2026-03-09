import { error } from '@sveltejs/kit';

import { getModuleBySlug } from '$lib/content/modules';

export function load({ params }) {
	const module = getModuleBySlug(params.slug);

	if (!module) {
		throw error(404, 'Module not found');
	}

	return { module };
}
