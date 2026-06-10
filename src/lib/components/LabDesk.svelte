<script lang="ts">
	import type { Snippet } from 'svelte';

	// The lab desk: three-zone grammar shared by every phase.
	//   guide  (left, quiet)        — orientation, tasks, the working question
	//   instrument (center, primary) — the main event; carries the oxblood frame
	//   evidence (right, history)    — trace / observations / ledger
	// At ≤1200px the rails stack (instrument → evidence → guide) as a fallback,
	// not a designed mobile layout.
	let {
		guide,
		instrument,
		evidence
	}: {
		guide: Snippet;
		instrument: Snippet;
		evidence: Snippet;
	} = $props();
</script>

<div class="lab-desk">
	<aside class="lab-desk__guide">{@render guide()}</aside>
	<section class="lab-desk__instrument">{@render instrument()}</section>
	<aside class="lab-desk__evidence">{@render evidence()}</aside>
</div>
