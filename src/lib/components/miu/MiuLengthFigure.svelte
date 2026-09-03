<script lang="ts">
	import type { BitBracket, LengthPoint } from '$lib/miu/lengthFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		family,
		literal,
		target,
		reader
	}: {
		family: LengthPoint[];
		literal: { tailLength: number; bits: number }[];
		target: { value: string; tailLength: number; literalBits: number; bracket: BitBracket } | null;
		reader: { value: string; tailLength: number; bits: number; steps: number; atTarget: boolean };
	} = $props();

	const LEFT = 40;
	const RIGHT = 450;
	const TOP = 22;
	const BASE = 200;
	const LOG_MAX = 10;
	const BITS_MAX = 64;

	function x(tailLength: number): number {
		return LEFT + (Math.log2(Math.max(1, tailLength)) / LOG_MAX) * (RIGHT - LEFT);
	}
	function y(bits: number): number {
		return BASE - (bits / BITS_MAX) * (BASE - TOP);
	}
	function place(tailLength: number, bits: number): { x: number; y: number; clipped: boolean } {
		const clippedX = tailLength > 2 ** LOG_MAX;
		const clippedY = bits > BITS_MAX;
		return {
			x: clippedX ? RIGHT : x(tailLength),
			y: clippedY ? TOP : y(bits),
			clipped: clippedX || clippedY
		};
	}
	const FAMILY_LABELS = ['MI', 'MII', 'MIIII', 'MI⁸', 'MI¹⁶', 'MI³²'];
	const X_TICKS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
	const Y_TICKS = [0, 16, 32, 48, 64];

	const literalPath = $derived(
		literal.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.tailLength)} ${y(point.bits)}`).join(' ')
	);
	const familyPath = $derived(
		family.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.tailLength)} ${y(point.programBits)}`).join(' ')
	);
	const literalExit = $derived(literal.find((point) => point.bits > BITS_MAX) ?? null);
	const familyLast = $derived(family[family.length - 1] ?? null);
	const targetMark = $derived(
		target === null
			? null
			: target.bracket.kind === 'exact'
				? place(target.tailLength, target.bracket.bits)
				: place(target.tailLength, target.bracket.upper)
	);
	const targetFloor = $derived(
		target !== null && target.bracket.kind === 'bracket' ? place(target.tailLength, target.bracket.floor) : null
	);
	const readerMark = $derived(place(reader.tailLength, reader.bits));
	const shortTarget = $derived(target ? ellipsizeMiddle(target.value) : null);
	const shortReader = $derived(ellipsizeMiddle(reader.value));
</script>

<figure class="figure" aria-label="Bits against tail length: the literal, the I-run programs, the target, and the reader's derivation">
	<svg viewBox="0 0 470 240" role="img">
		<defs>
			<clipPath id="length-plot">
				<rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BASE - TOP} />
			</clipPath>
		</defs>

		{#each Y_TICKS as bits (bits)}
			<line x1={LEFT} y1={y(bits)} x2={RIGHT} y2={y(bits)} class="fig-grid" />
			<text x={LEFT - 6} y={y(bits) + 3} class="fig-text" text-anchor="end">{bits === BITS_MAX ? `${bits} bits` : bits}</text>
		{/each}
		{#each X_TICKS as tailLength (tailLength)}
			<text x={x(tailLength)} y={BASE + 14} class="fig-text" text-anchor="middle">{tailLength}</text>
		{/each}
		<line x1={LEFT} y1={BASE} x2={RIGHT} y2={BASE} class="fig-axis" />
		<text x={RIGHT} y={BASE + 30} class="fig-text" text-anchor="end">|t| = tail length after M (log₂ axis)</text>

		<path d={literalPath} class="fig-literal" clip-path="url(#length-plot)" />
		{#if literalExit}
			<text x={x(literalExit.tailLength) + 6} y={TOP + 10} class="fig-label">L<tspan class="fig-sub">literal</tspan></text>
		{/if}

		<path d={familyPath} class="fig-family" />
		{#each family as point, index (point.value)}
			<circle cx={x(point.tailLength)} cy={y(point.programBits)} r="3.5" class="fig-dot" />
			<text x={x(point.tailLength) + 6} y={y(point.programBits) + 11} class="fig-text">{FAMILY_LABELS[index]}</text>
		{/each}
		{#if familyLast}
			<text x={x(familyLast.tailLength) + 8} y={y(familyLast.programBits) - 5} class="fig-label">K<tspan class="fig-sub">bits</tspan> of M·I<tspan class="fig-sup">2ᵏ</tspan></text>
		{/if}

		{#if targetFloor && targetMark}
			<line x1={targetMark.x} y1={targetFloor.y} x2={targetMark.x} y2={targetMark.y} class="fig-bracket" />
			<line x1={targetMark.x - 5} y1={targetFloor.y} x2={targetMark.x + 5} y2={targetFloor.y} class="fig-bracket" />
			<line x1={targetMark.x - 5} y1={targetMark.y} x2={targetMark.x + 5} y2={targetMark.y} class="fig-bracket" />
		{/if}
		{#if targetMark && target}
			<g class="fig-move" style={`transform: translate(${targetMark.x}px, ${targetMark.y}px)`}>
				<circle cx="0" cy="0" r="7" class="fig-ring" class:fig-ring--pending={target.bracket.kind === 'pending'} />
				<text x="0" y="-11" class="fig-label" text-anchor="middle">{shortTarget}{targetMark.clipped ? ' ↑' : ''}</text>
			</g>
		{/if}

		{#if reader.steps > 0}
			<g class="fig-move" style={`transform: translate(${readerMark.x}px, ${readerMark.y}px)`}>
				<path d="M 0 -7 l 7 7 l -7 7 l -7 -7 z" class="fig-diamond" />
			</g>
		{/if}
	</svg>
	<figcaption class="figure__caption">
		<span class="figure__key">— L<sub>literal</sub> · ● M·I<sup>2ᵏ</sup> · ○ target · ◆ your derivation</span>
		{#if target === null}
			No program prints a non-theorem, so <span class="mv">K</span><sub>bits</sub> is undefined for the
			target.
		{:else if target.bracket.kind === 'exact'}
			<span class="mv">K</span><sub>bits</sub>(<span class="o">{shortTarget}</span>) = {target.bracket.bits}
			against a literal of {target.literalBits} bits:
			{#if target.bracket.bits < target.literalBits}
				the program is shorter by {target.literalBits - target.bracket.bits}.
			{:else if target.bracket.bits > target.literalBits}
				the literal is shorter by {target.bracket.bits - target.literalBits}.
			{:else}
				the two costs are equal.
			{/if}
		{:else if target.bracket.kind === 'bracket'}
			No program under {target.bracket.floor} bits prints <span class="o">{shortTarget}</span>, and the
			construction's program has {target.bracket.upper}: {target.bracket.floor} ≤
			<span class="mv">K</span><sub>bits</sub> ≤ {target.bracket.upper}. The search stopped at
			{target.bracket.maxNodes.toLocaleString('en-US')} stored strings; the literal costs
			{target.literalBits}.
		{:else}
			The construction's program for <span class="o">{shortTarget}</span> has {target.bracket.upper}
			bits; the search for <span class="mv">K</span><sub>bits</sub> is running.
		{/if}
		{#if reader.steps === 0}
			Your derivation is empty: the axiom <span class="o">MI</span> is a program of {reader.bits} bits.
		{:else if reader.atTarget && target}
			Your derivation is a program of {reader.bits} bits for the same string{target.bracket.kind === 'exact'
				? reader.bits === target.bracket.bits
					? ' and is minimal.'
					: `; the minimum is ${target.bracket.bits}.`
				: '.'}
		{:else}
			Your derivation, at <span class="o">{shortReader}</span> after {reader.steps}
			{reader.steps === 1 ? 'move' : 'moves'}, is a program of {reader.bits} bits{readerMark.clipped
				? ', off this axis'
				: ''}.
		{/if}
		<a class="dial-link" href="#description-length">definitions and specimens ↓</a>
	</figcaption>
</figure>
