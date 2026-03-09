<script lang="ts">
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import { modules } from '$lib/content/modules';

	const principles = [
		{
			title: 'Verifier before vibe',
			body: 'If the system can check a claim deterministically, the UI should surface that fact explicitly instead of laundering it through language.'
		},
		{
			title: 'Module-aware guidance',
			body: 'The agent belongs inside the active instrument and must respond to the learner’s current state, not as a detached chat box.'
		},
		{
			title: 'Artifacts over noise',
			body: 'Persistence should preserve traces, notes, candidate invariants, and reflection, not an undifferentiated event log.'
		}
	];
</script>

<svelte:head>
	<title>Strange Loops Lab | Overview</title>
</svelte:head>

<section class="hero">
	<div class="hero__copy">
		<p class="eyebrow">Scaffolded for Module 1</p>
		<h1>Build the shell first. Let the formal system teach the architecture.</h1>
		<p class="hero__lede">
			The first pass stays narrow on purpose: a stable SvelteKit application shell, module-aware
			routing, local artifact persistence, and a serious landing point for the MIU laboratory.
		</p>

		<div class="hero__actions">
			<a class="button button--primary" href="/modules/module-1">Enter Module 1</a>
			<span class="button button--ghost">Root scaffold in place</span>
		</div>
	</div>

	<div class="hero__frame">
		<p class="hero__label">Current shell</p>
		<ul class="metric-list">
			<li>
				<strong>Root app</strong>
				<span>SvelteKit + TypeScript</span>
			</li>
			<li>
				<strong>Persistence</strong>
				<span>Local notebook state for Module 1</span>
			</li>
			<li>
				<strong>Boundary</strong>
				<span>Verified, computed, and coaching surfaces stay distinct</span>
			</li>
		</ul>
	</div>
</section>

<section class="panel-grid panel-grid--three">
	{#each principles as principle}
		<article class="panel panel--soft">
			<p class="eyebrow">Operating rule</p>
			<h2>{principle.title}</h2>
			<p>{principle.body}</p>
		</article>
	{/each}
</section>

<section class="section-header">
	<div>
		<p class="eyebrow">Module registry</p>
		<h2>Live now, planned next</h2>
	</div>
	<p class="section-header__copy">
		The shell is ready for multiple modules, but only Module 1 is implemented as an active work
		surface.
	</p>
</section>

<section class="module-grid">
	{#each modules as module}
		<ModuleCard {module} />
	{/each}
</section>
