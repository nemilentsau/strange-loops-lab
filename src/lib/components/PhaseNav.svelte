<script lang="ts">
	import { LAB_PHASES, PHASE_META, type LabPhase } from '$lib/state/module1';

	let {
		activePhase,
		visitedPhases,
		onSelectPhase
	}: {
		activePhase: LabPhase;
		visitedPhases: LabPhase[];
		onSelectPhase: (phase: LabPhase) => void;
	} = $props();
</script>

<nav class="phase-nav" aria-label="Lab phases">
	{#each LAB_PHASES as phase, i}
		{@const meta = PHASE_META[phase]}
		{@const isActive = activePhase === phase}
		{@const isVisited = visitedPhases.includes(phase)}

		{#if i > 0}
			<div class="phase-nav__connector"></div>
		{/if}

		<button
			class="phase-nav__step"
			type="button"
			data-active={isActive}
			data-visited={isVisited}
			data-tone={meta.tone}
			onclick={() => onSelectPhase(phase)}
			aria-current={isActive ? 'step' : undefined}
		>
			<span class="phase-nav__circle">{meta.index}</span>
			<span class="phase-nav__label">
				<strong>{meta.label}</strong>
				<small>{meta.epistemicLabel}</small>
			</span>
		</button>
	{/each}
</nav>
