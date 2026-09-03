<script lang="ts">
	import MiuResidueFigure from './MiuResidueFigure.svelte';
	import type { Z3Residue } from '$lib/miu/characters';
	import type { DerivationTraceReading } from '$lib/miu/traceReadings';

	let {
		traceReading,
		target,
		targetResidue,
		reachedTarget
	}: {
		traceReading: DerivationTraceReading;
		target: string;
		targetResidue: Z3Residue | null;
		reachedTarget: boolean;
	} = $props();
</script>

<div class="dials" aria-label="Three readings of the active derivation">
	<div>
		<p class="microlabel">Invariant: residue mod 3</p>
		<MiuResidueFigure
			residues={traceReading.activeResidues}
			moves={traceReading.activeMoves.length}
			{targetResidue}
			targetLabel={targetResidue === null ? null : target}
			{reachedTarget}
		/>
	</div>
</div>
