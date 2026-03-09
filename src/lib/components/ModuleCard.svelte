<script lang="ts">
	import type { ModuleSummary } from '$lib/content/modules';

	let { module }: { module: ModuleSummary } = $props();

	const statusLabels = {
		live: 'live now',
		scaffolding: 'scaffolding',
		planned: 'planned'
	} as const;
</script>

<a class="module-card" href={`/modules/${module.slug}`}>
	<div class="module-card__top">
		<p class="eyebrow">Module {module.index}</p>
		<span class="status-pill" data-status={module.status}>{statusLabels[module.status]}</span>
	</div>

	<div>
		<h2>{module.title}</h2>
		<p class="module-card__status">{module.subtitle}</p>
	</div>

	<p>{module.excerpt}</p>

	<ul class="module-card__surfaces">
		{#each module.surfaces.slice(0, 3) as surface}
			<li class="module-card__surface">
				<strong>{surface}</strong>
				<span>surface</span>
			</li>
		{/each}
	</ul>
</a>
