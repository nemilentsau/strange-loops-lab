<script lang="ts">
	import { normalizeMiuTailInput } from '$lib/miu/core';
	import { THEOREM_TARGETS } from '$lib/miu/examples';
	import { nextMiuQueryNodeBound, type ShortestDerivation } from '$lib/miu/complexity';
	import { countI } from '$lib/miu/invariants';
	import type { MiuTheoremDecision } from '$lib/miu/theoremhood';

	type WitnessKind = 'constructed' | 'shortest';

	let {
		target,
		decision,
		constructedLength,
		shortest,
		queryMaxNodes,
		witnessKind,
		onUpdateTarget,
		onUpdateMaxNodes,
		onShowWitness
	}: {
		target: string;
		decision: MiuTheoremDecision;
		constructedLength: number | null;
		shortest: ShortestDerivation | null;
		queryMaxNodes: number;
		witnessKind: WitnessKind | null;
		onUpdateTarget: (target: string) => void;
		onUpdateMaxNodes: (maxNodes: number) => void;
		onShowWitness: (kind: WitnessKind) => void;
	} = $props();

	const trimmed = $derived(target.trim());
	const targetTail = $derived(trimmed.startsWith('M') ? trimmed.slice(1) : '');
	const targetICount = $derived(decision.outcome === 'invalid' ? 0 : countI(trimmed));
	const nextNodeBound = $derived(nextMiuQueryNodeBound(queryMaxNodes));
	const longTail = $derived(targetTail.length > 14);

	function updateTail(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const normalizedTail = normalizeMiuTailInput(input.value);
		if (input.value !== normalizedTail) {
			input.value = normalizedTail;
		}
		onUpdateTarget(`M${normalizedTail}`);
	}
</script>

<div class="theorem-query">
	<div class="theorem-query__target">
		<div class="microlabel" id="produce-target-label">target string</div>
		<div class="target-editor" class:target-editor--long={longTail} aria-labelledby="produce-target-label">
			<span class="target-editor__prefix" aria-hidden="true">M</span>
			<input
				id="produce-target"
				class="target-editor__input"
				type="text"
				value={targetTail}
				oninput={updateTail}
				aria-label="Tail after M"
				inputmode="text"
				pattern="[IU]*"
				spellcheck="false"
				autocomplete="off"
			/>
		</div>
		<div class="target-examples" aria-label="Example theorem strings">
			{#each THEOREM_TARGETS as value}
				<button
					class="target-chip"
					class:target-chip--active={value === trimmed}
					type="button"
					aria-pressed={value === trimmed}
					onclick={() => onUpdateTarget(value)}
				>
					{value}
				</button>
			{/each}
		</div>
	</div>

	<div class="verdict" aria-live="polite">
		{#if decision.outcome === 'invalid'}
			<p class="verdict__line">
				<span class="stamp" aria-hidden="true">?</span>
				<span class="verdict__subject"><span class="o">{trimmed}</span> is not a MIU string</span>
			</p>
			<p class="verdict__fact">
				The tail after <span class="o">M</span> must be nonempty, over {'{'}<span class="o">I</span>,
				<span class="o">U</span>{'}'}.
			</p>
		{:else if decision.outcome === 'non-theorem'}
			<p class="verdict__line">
				<span class="stamp" aria-hidden="true">✗</span>
				<span class="verdict__subject"><span class="o">{trimmed}</span> <span class="mv">∉</span> Th(MIU)</span>
			</p>
			<p class="verdict__fact">
				<span class="mv">I</span> = {targetICount} ≡ 0 (mod 3); the invariant below excludes it.
			</p>
		{:else}
			<p class="verdict__line">
				<span class="stamp" aria-hidden="true">✓</span>
				<span class="verdict__subject"><span class="o">{trimmed}</span> <span class="mv">∈</span> Th(MIU)</span>
			</p>

			<div class="verdict__rows">
				<div class="verdict__row">
					<span class="verdict__row-label">Witness</span>
					<span>
						{constructedLength}
						{constructedLength === 1 ? 'move' : 'moves'}, constructed — not claimed minimal<button
							class="reveal"
							type="button"
							onclick={() => onShowWitness('constructed')}
						>
							{witnessKind === 'constructed' ? 'hide construction' : 'show construction'}
						</button>
					</span>
				</div>

				{#if shortest?.outcome === 'found'}
					<div class="verdict__row">
						<span class="verdict__row-label">Minimum</span>
						<span>
							<span class="mv">K</span><sub>steps</sub> = {shortest.length}<button
								class="reveal"
								type="button"
								onclick={() => onShowWitness('shortest')}
							>
								{witnessKind === 'shortest' ? 'hide shortest derivation' : 'show shortest derivation'}
							</button>
						</span>
					</div>
				{:else if shortest?.outcome === 'exhausted'}
					<div class="verdict__row">
						<span class="verdict__row-label">Minimum</span>
						<span>
							<span class="mv">K</span><sub>steps</sub> &gt; {shortest.completedDepth} — every
							derivation of at most {shortest.completedDepth}
							{shortest.completedDepth === 1 ? 'move' : 'moves'} enumerated{#if shortest.stoppedBy === 'nodes' && nextNodeBound}<br /><button
									class="compute"
									type="button"
									onclick={() => onUpdateMaxNodes(nextNodeBound)}
								>
									search deeper
								</button>{/if}
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
