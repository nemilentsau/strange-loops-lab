<script lang="ts">
	import MiuDepthFigure from './MiuDepthFigure.svelte';
	import MiuLengthFigure from './MiuLengthFigure.svelte';
	import MiuResidueFigure from './MiuResidueFigure.svelte';
	import type { BitProgramResult } from '$lib/miu/bitComplexity';
	import type { Z3Residue } from '$lib/miu/characters';
	import { literalMiuBitLength } from '$lib/miu/coding';
	import type { ShortestDerivation } from '$lib/miu/complexity';
	import { stepBracket } from '$lib/miu/depthFigure';
	import { bitBracket, iRunPoints, literalCurve } from '$lib/miu/lengthFigure';
	import type { DerivationTraceReading } from '$lib/miu/traceReadings';

	let {
		traceReading,
		currentString,
		target,
		targetResidue,
		reachedTarget,
		isTheorem,
		shortest,
		searchRuledOut,
		searchRunning,
		constructedLength,
		constructedBits,
		bitResult
	}: {
		traceReading: DerivationTraceReading;
		currentString: string;
		target: string;
		targetResidue: Z3Residue | null;
		reachedTarget: boolean;
		isTheorem: boolean;
		shortest: ShortestDerivation | null;
		searchRuledOut: number | null;
		searchRunning: boolean;
		constructedLength: number | null;
		constructedBits: number | null;
		bitResult: BitProgramResult | null;
	} = $props();

	const family = iRunPoints();
	const literal = literalCurve(1024);

	const steps = $derived(traceReading.activeMoves.length);
	const depthBracket = $derived(
		isTheorem && constructedLength !== null
			? stepBracket(shortest, searchRuledOut, constructedLength, searchRunning)
			: null
	);
	const lengthTarget = $derived(
		isTheorem && constructedBits !== null
			? {
					value: target,
					tailLength: target.length - 1,
					literalBits: literalMiuBitLength(target),
					bracket: bitBracket(bitResult, constructedBits)
				}
			: null
	);
	const lengthReader = $derived({
		value: currentString,
		tailLength: currentString.length - 1,
		bits: traceReading.activeProgram.bitLength,
		steps,
		atTarget: reachedTarget
	});
</script>

<div class="dials" aria-label="Three readings of the active derivation">
	<div>
		<p class="microlabel">Invariant: residue mod 3</p>
		<MiuResidueFigure
			residues={traceReading.activeResidues}
			moves={steps}
			{targetResidue}
			targetLabel={targetResidue === null ? null : target}
			{reachedTarget}
		/>
	</div>
	<div>
		<p class="microlabel">Program: moves</p>
		<MiuDepthFigure {target} bracket={depthBracket} reader={{ steps, atTarget: reachedTarget }} />
	</div>
	<div>
		<p class="microlabel">Program: bits</p>
		<MiuLengthFigure {family} {literal} target={lengthTarget} reader={lengthReader} />
	</div>
</div>
