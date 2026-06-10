<script lang="ts">
	import { LAB_PHASES, PHASE_META, LEVEL_PRESENTATION, type LabPhase } from '$lib/state/module1';

	let {
		currentString,
		stepCount,
		iCount,
		mod3Class,
		activePhase,
		visitedPhases,
		lastEditedLabel,
		onSelectPhase,
		onReset
	}: {
		currentString: string;
		stepCount: number;
		iCount: number;
		mod3Class: number;
		activePhase: LabPhase;
		visitedPhases: LabPhase[];
		lastEditedLabel: string;
		onSelectPhase: (phase: LabPhase) => void;
		onReset: () => void;
	} = $props();

	// Two clusters: object level (Explore, Map) and meta level (Prove, Reflect),
	// in canonical LAB_PHASES order, separated by a thin divider.
	const clusters = $derived(
		(['object', 'meta'] as const).map((level) => ({
			level,
			glyph: LEVEL_PRESENTATION[level].glyph,
			phases: LAB_PHASES.filter((phase) => PHASE_META[phase].level === level)
		}))
	);

	const activeLevel = $derived(PHASE_META[activePhase].level);
	const levelTag = $derived(LEVEL_PRESENTATION[activeLevel]);
</script>

<header class="command-bar">
	<div class="command-bar__brand">
		<span class="command-bar__wordmark">MIU Lab</span>

		<nav class="command-bar__tabs" aria-label="Lab phases">
			{#each clusters as cluster, clusterIndex}
				{#if clusterIndex > 0}
					<span class="command-bar__divider" aria-hidden="true"></span>
				{/if}

				<span class="command-bar__cluster" data-level={cluster.level}>
					<span class="command-bar__cluster-glyph" aria-hidden="true">{cluster.glyph}</span>
					{#each cluster.phases as phase}
						{@const meta = PHASE_META[phase]}
						<button
							class="command-bar__tab"
							type="button"
							data-active={activePhase === phase}
							data-visited={visitedPhases.includes(phase)}
							onclick={() => onSelectPhase(phase)}
							aria-current={activePhase === phase ? 'page' : undefined}
						>
							{meta.label}
						</button>
					{/each}
				</span>
			{/each}
		</nav>
	</div>

	<div class="command-bar__readout">
		<span class="command-bar__string" title={currentString}>{currentString}</span>

		<span class="command-bar__facts">
			<span class="command-bar__fact" data-tone="verified" title="Number of derivation steps from MI">
				<span class="command-bar__fact-label">steps</span>
				<span class="command-bar__fact-value">{stepCount}</span>
			</span>
			<span class="command-bar__fact" data-tone="verified" title="Number of I characters in the current string">
				<span class="command-bar__fact-label">I-count</span>
				<span class="command-bar__fact-value">{iCount}</span>
			</span>
			<span class="command-bar__fact" data-tone="verified" title="I-count modulo 3 — key to the unreachability proof">
				<span class="command-bar__fact-label">mod 3</span>
				<span class="command-bar__fact-value">{mod3Class}</span>
			</span>
		</span>

		<span class="command-bar__level" title={activeLevel === 'object' ? 'Working inside the system' : 'Reasoning about the system'}>
			<span class="command-bar__level-glyph" aria-hidden="true">{levelTag.glyph}</span>
			{levelTag.label}
		</span>

		<span class="command-bar__edited">{lastEditedLabel}</span>

		<button class="button button--ghost button--sm" type="button" onclick={onReset}>
			Reset session
		</button>
	</div>
</header>
