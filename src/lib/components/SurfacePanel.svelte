<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		eyebrow = 'Work surface',
		badge,
		badgeTooltip,
		tone,
		children
	}: {
		title: string;
		eyebrow?: string;
		badge?: string;
		badgeTooltip?: string;
		tone?: 'verified' | 'computed' | 'coaching';
		children: Snippet;
	} = $props();
</script>

<section class="surface-panel" data-tone={tone}>
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
