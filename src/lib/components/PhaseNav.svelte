<script lang="ts">
	import { LAB_PHASES, PHASE_META, type LabPhase, type PhaseLevel } from '$lib/state/module1';

	let {
		activePhase,
		visitedPhases,
		onSelectPhase
	}: {
		activePhase: LabPhase;
		visitedPhases: LabPhase[];
		onSelectPhase: (phase: LabPhase) => void;
	} = $props();

	const REALM_LABELS: Record<PhaseLevel, string> = {
		object: 'in the system',
		meta: 'about the system'
	};

	const realms = (['object', 'meta'] as const).map((level) => ({
		level,
		label: REALM_LABELS[level],
		phases: LAB_PHASES.filter((phase) => PHASE_META[phase].level === level)
	}));

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
	{#each realms as realm, realmIndex}
		{#if realmIndex > 0}
			<div class="phase-nav__boundary" aria-hidden="true"></div>
		{/if}

		<div
			class="phase-nav__realm"
			data-level={realm.level}
			data-active={realm.phases.includes(activePhase)}
		>
			<span class="phase-nav__realm-label">{realm.label}</span>

			{#each realm.phases as phase, i}
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
		</div>
	{/each}
</nav>
