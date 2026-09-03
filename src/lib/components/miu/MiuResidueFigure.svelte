<script lang="ts">
	import type { Z3Residue } from '$lib/miu/characters';
	import { residueArrows, residueTrajectory } from '$lib/miu/residueFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		residues,
		moves,
		targetResidue,
		targetLabel,
		reachedTarget
	}: {
		residues: number[];
		moves: number;
		targetResidue: Z3Residue | null;
		targetLabel: string | null;
		reachedTarget: boolean;
	} = $props();

	const NODE: Record<Z3Residue, { x: number; y: number }> = {
		1: { x: 120, y: 120 },
		2: { x: 240, y: 120 },
		0: { x: 400, y: 120 }
	};
	const LOOP: Record<Z3Residue, string> = {
		1: 'M 108 110 a 16 16 0 1 0 0 20',
		2: 'M 252 110 a 16 16 0 1 1 0 20',
		0: 'M 390 108 a 16 16 0 1 1 20 0'
	};
	const SWAP = 'M 136 120 L 224 120';
	const ORDER: Z3Residue[] = [1, 2, 0];
	const LOOP_LABEL: Record<Z3Residue, { x: number; y: number; anchor: string; text: string }> = {
		1: { x: 70, y: 124, anchor: 'end', text: 'R1 R3 R4' },
		2: { x: 292, y: 124, anchor: 'start', text: 'R1 R3 R4' },
		0: { x: 400, y: 62, anchor: 'middle', text: 'R1 R2 R3 R4' }
	};

	const trajectory = $derived(residueTrajectory(residues));
	const swapCount = $derived(
		trajectory.transits
			.filter((transit) => transit.from !== transit.to)
			.reduce((sum, transit) => sum + transit.count, 0)
	);
	function loopCount(residue: Z3Residue): number {
		return (
			trajectory.transits.find((transit) => transit.from === residue && transit.to === residue)
				?.count ?? 0
		);
	}
	function traversedWidth(count: number): number {
		return 1 + Math.min(count, 3);
	}
	const arrowsEnteringZero = $derived(
		residueArrows().filter((arrow) => arrow.to === 0 && arrow.from !== 0).length
	);
	const shortTarget = $derived(targetLabel ? ellipsizeMiddle(targetLabel) : null);
</script>

<figure class="figure" aria-label="The rule action on residues mod 3">
	<svg viewBox="0 0 460 210" role="img">
		<defs>
			<marker id="residue-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
				<path d="M 0 0 L 8 4 L 0 8 z" class="fig-arrowhead" />
			</marker>
		</defs>

		<path d={SWAP} class="fig-edge" marker-start="url(#residue-arrow)" marker-end="url(#residue-arrow)" />
		{#if swapCount > 0}
			<path d={SWAP} class="fig-edge fig-edge--traversed" stroke-width={traversedWidth(swapCount)} />
		{/if}
		<text x="180" y="108" class="fig-label" text-anchor="middle">R2</text>

		{#each ORDER as residue (residue)}
			<path d={LOOP[residue]} class="fig-edge" marker-end="url(#residue-arrow)" />
			{#if loopCount(residue) > 0}
				<path d={LOOP[residue]} class="fig-edge fig-edge--traversed" stroke-width={traversedWidth(loopCount(residue))} />
			{/if}
			<text x={LOOP_LABEL[residue].x} y={LOOP_LABEL[residue].y} class="fig-label" text-anchor={LOOP_LABEL[residue].anchor}>{LOOP_LABEL[residue].text}</text>
		{/each}

		<line x1="336" y1="66" x2="336" y2="174" class="fig-sep" />
		<text x="336" y="196" class="fig-text" text-anchor="middle">{arrowsEnteringZero === 0 ? 'no arrow enters 0 from {1, 2}' : `${arrowsEnteringZero} arrows enter 0`}</text>

		{#if targetResidue !== null}
			<g class="fig-move" style={`transform: translate(${NODE[targetResidue].x}px, ${NODE[targetResidue].y}px)`}>
				<circle cx="0" cy="0" r="23" class="fig-ring" />
			</g>
		{/if}
		{#each ORDER as residue (residue)}
			<circle cx={NODE[residue].x} cy={NODE[residue].y} r="16" class="fig-node" class:fig-node--current={trajectory.current === residue} />
			<text x={NODE[residue].x} y={NODE[residue].y} class="fig-node-text" class:fig-node-text--current={trajectory.current === residue}>{residue}</text>
		{/each}

		<text x={NODE[1].x} y="156" class="fig-text" text-anchor="middle">MI</text>
		{#if targetResidue !== null && shortTarget}
			<text x={NODE[targetResidue].x} y="172" class="fig-text" text-anchor="middle">{shortTarget}</text>
		{/if}
	</svg>
	<figcaption class="figure__caption">
		<span class="figure__key">● current residue · ○ target · thick edge = traversed</span>
		{#if targetResidue === 0 && targetLabel}
			<span class="o">{shortTarget}</span> has residue 0. No arrow enters 0 from {'{'}1, 2{'}'}, so
			no derivation reaches it. Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}.
		{:else if reachedTarget && targetLabel}
			Your derivation ends at <span class="o">{shortTarget}</span>, residue {trajectory.current},
			after {moves} {moves === 1 ? 'move' : 'moves'}; every string on the way stayed in {'{'}1, 2{'}'}.
		{:else if targetResidue !== null && targetLabel}
			Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}. <span class="o">{shortTarget}</span> has residue
			{targetResidue}; both lie in {'{'}1, 2{'}'}.
		{:else}
			Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}; every string on the way stayed in {'{'}1, 2{'}'}.
		{/if}
		<a class="dial-link" href="#invariant">why 0 is never entered ↓</a>
	</figcaption>
</figure>
