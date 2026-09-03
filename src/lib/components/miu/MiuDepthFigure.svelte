<script lang="ts">
	import { MIU_LAYER_SIZES, type StepBracket } from '$lib/miu/depthFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		target,
		bracket,
		reader
	}: {
		target: string;
		bracket: StepBracket | null;
		reader: { steps: number; atTarget: boolean };
	} = $props();

	const STEP = 36;
	const LEFT = 30;
	const BASE = 150;
	const TOP = 56;
	const BAR_MAX = BASE - TOP;
	const LOG_MAX = Math.log10(MIU_LAYER_SIZES[MIU_LAYER_SIZES.length - 1]);

	const upperMark = $derived(
		bracket === null ? 0 : bracket.kind === 'exact' ? bracket.steps : bracket.upper
	);
	const columns = $derived(
		Math.max(MIU_LAYER_SIZES.length + 1, upperMark + 2, reader.atTarget ? reader.steps + 2 : 0)
	);
	const width = $derived(LEFT + STEP * columns + 8);
	function x(n: number): number {
		return LEFT + STEP * n + STEP / 2;
	}
	function barHeight(size: number): number {
		return (Math.log10(size) / LOG_MAX) * BAR_MAX + 4;
	}
	function tick(n: number): string {
		return `M ${x(n) - 6} ${BASE + 2} L ${x(n) + 6} ${BASE + 2} L ${x(n)} ${BASE - 8} z`;
	}
	function formatCount(size: number): string {
		return size.toLocaleString('en-US').replace(/,/g, ' ');
	}
	const shortTarget = $derived(ellipsizeMiddle(target));
</script>

<figure class="figure" aria-label="Derivation length and the strings first reached at each length">
	<svg viewBox={`0 0 ${width} 196`} role="img">
		{#if bracket?.kind === 'bracket'}
			<rect x={LEFT} y={TOP - 14} width={STEP * (bracket.ruledOut + 1)} height={BASE - TOP + 14} class="fig-shade" />
		{/if}

		{#each MIU_LAYER_SIZES as size, n (n)}
			<rect x={x(n) - 8} y={BASE - barHeight(size)} width="16" height={barHeight(size)} class="fig-bar" />
			<text x={x(n)} y={BASE - barHeight(size) - 4} class="fig-text" text-anchor="middle">{formatCount(size)}</text>
		{/each}

		<line x1={LEFT} y1={BASE} x2={width - 8} y2={BASE} class="fig-axis" />
		{#each Array.from({ length: columns }, (_, n) => n) as n (n)}
			<text x={x(n)} y={BASE + 16} class="fig-text" text-anchor="middle">{n}</text>
		{/each}
		<text x={LEFT} y={BASE + 34} class="fig-text">n = moves; bar = strings first reached at n (log scale)</text>

		{#if bracket?.kind === 'exact'}
			<path d={tick(bracket.steps)} class="fig-tick" />
			<text x={x(bracket.steps)} y="18" class="fig-label" text-anchor="middle">K<tspan class="fig-sub">steps</tspan> = {bracket.steps}</text>
		{:else if bracket?.kind === 'bracket'}
			<path d={tick(bracket.upper)} class="fig-tick fig-tick--hollow" />
			<text x={x(bracket.upper)} y="18" class="fig-label" text-anchor="middle">construction: {bracket.upper}</text>
			<text x={x(bracket.ruledOut) + STEP / 2} y="32" class="fig-text" text-anchor="end">ruled out ≤ {bracket.ruledOut}</text>
		{/if}

		{#if reader.atTarget && bracket !== null}
			<g class="fig-move" style={`transform: translate(${x(reader.steps)}px, ${BASE - 22}px)`}>
				<path d="M 0 -6 l 6 6 l -6 6 l -6 -6 z" class="fig-diamond" />
			</g>
		{/if}
	</svg>
	<figcaption class="figure__caption">
		<span class="figure__key">▲ K<sub>steps</sub> · △ construction · ◆ your derivation</span>
		{#if bracket === null}
			{#if target === ''}
				No target is set; the bars show how fast the layers grow.
			{:else}
				No derivation reaches <span class="o">{shortTarget}</span>: the invariant excludes it, so
				<span class="mv">K</span><sub>steps</sub> is undefined for it.
			{/if}
		{:else if bracket.kind === 'exact'}
			<span class="mv">K</span><sub>steps</sub>(<span class="o">{shortTarget}</span>) = {bracket.steps}:
			the shortest derivation has {bracket.steps} {bracket.steps === 1 ? 'move' : 'moves'}.
			{#if reader.atTarget}
				Your derivation has {reader.steps}{reader.steps === bracket.steps ? ' and is minimal.' : `; the minimum is ${bracket.steps}.`}
			{/if}
		{:else if bracket.running}
			Derivations of at most {bracket.ruledOut} {bracket.ruledOut === 1 ? 'move' : 'moves'} are ruled
			out and the search is still running; the construction gives
			<span class="mv">K</span><sub>steps</sub> ≤ {bracket.upper}.
		{:else}
			Derivations of at most {bracket.ruledOut} {bracket.ruledOut === 1 ? 'move' : 'moves'} are ruled
			out and the construction has {bracket.upper}: {bracket.ruledOut} &lt;
			<span class="mv">K</span><sub>steps</sub> ≤ {bracket.upper}. The search stopped at its budget
			before ruling out {bracket.ruledOut + 1}.
			{#if reader.atTarget}
				Your derivation has {reader.steps} {reader.steps === 1 ? 'move' : 'moves'}.
			{/if}
		{/if}
		<a class="dial-link" href="#description-length">how the bounds are proved ↓</a>
	</figcaption>
</figure>
