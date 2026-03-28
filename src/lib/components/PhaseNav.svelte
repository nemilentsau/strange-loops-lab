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

	function cueForPhase(phase: LabPhase): string {
		switch (phase) {
			case 'explore': return 'Play with the rules. Try to reach MU.';
			case 'map': return 'See the full search space.';
			case 'prove': return 'Build an argument about all strings.';
			case 'reflect': return 'Explain and preserve what you learned.';
		}
	}
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
				{#if isActive}
					<span class="phase-nav__cue">{cueForPhase(phase)}</span>
				{/if}
			</span>
		</button>
	{/each}
</nav>
