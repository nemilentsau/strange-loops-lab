<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		eyebrow = 'Work surface',
		badge,
		badgeTooltip,
		tone,
		instrument = false,
		children
	}: {
		title: string;
		eyebrow?: string;
		badge?: string;
		badgeTooltip?: string;
		tone?: 'verified' | 'computed' | 'coaching';
		/** Marks this panel as the lab desk's instrument: opts into the oxblood
		 * action frame. The frame means "the work happens here", not a register. */
		instrument?: boolean;
		children: Snippet;
	} = $props();
</script>

<section class="surface-panel" class:surface-panel--instrument={instrument} data-tone={tone}>
	<div class="surface-panel__header">
		<div>
			<p class="eyebrow">{eyebrow}</p>
			<h2>{title}</h2>
		</div>

		{#if badge}
			<span class="legend-chip" title={badgeTooltip}>{badge}</span>
		{/if}
	</div>

	<div class="surface-panel__body">
		{@render children()}
	</div>
</section>
