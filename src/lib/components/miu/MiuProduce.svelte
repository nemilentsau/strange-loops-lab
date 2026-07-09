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

	function updateTail(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const normalizedTail = normalizeMiuTailInput(input.value);
		if (input.value !== normalizedTail) {
			input.value = normalizedTail;
		}
		onUpdateTarget(`M${normalizedTail}`);
	}

	function formatNodeBound(value: number): string {
		if (value >= 1_000_000) {
			return `${value / 1_000_000}M`;
		}
		if (value >= 1_000) {
			return `${value / 1_000}K`;
		}
		return value.toLocaleString();
	}
</script>

<div class="theorem-query">
	<div class="theorem-query__target">
		<div class="query-label" id="produce-target-label">target string</div>
		<div class="target-editor" aria-labelledby="produce-target-label">
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

	<div class="query-verdict" aria-live="polite">
		{#if decision.outcome === 'invalid'}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">?</span>
				<span>{trimmed} is not a MIU string.</span>
			</div>
			<p class="query-verdict__fact">The tail after M must be nonempty and contain only I and U.</p>
		{:else if decision.outcome === 'non-theorem'}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">✗</span>
				<span>{trimmed} ∉ Th(MIU).</span>
			</div>
			<p class="query-verdict__fact">
				I({trimmed}) = {targetICount} ≡ 0 (mod 3); the invariant excludes it.
			</p>
		{:else}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">✓</span>
				<span>{trimmed} ∈ Th(MIU).</span>
			</div>

			<div class="query-verdict__results">
				<div class="query-verdict__result">
					<span class="query-verdict__result-label">Witness</span>
					<span>
						constructed derivation: {constructedLength} moves
						<button
							class="query-verdict__witness"
							type="button"
							onclick={() => onShowWitness('constructed')}
						>
							{witnessKind === 'constructed' ? 'hide construction' : 'show construction'}
						</button>
					</span>
				</div>

				{#if shortest?.outcome === 'found'}
					<div class="query-verdict__result">
						<span class="query-verdict__result-label">Minimum</span>
						<span>
							K<sub>steps</sub>({trimmed}) = {shortest.length}
							<button
								class="query-verdict__witness"
								type="button"
								onclick={() => onShowWitness('shortest')}
							>
								{witnessKind === 'shortest' ? 'hide shortest derivation' : 'show shortest derivation'}
							</button>
						</span>
					</div>
				{:else if shortest?.outcome === 'exhausted'}
					<div class="query-verdict__result">
						<span class="query-verdict__result-label">Minimum</span>
						<span>
							K<sub>steps</sub>({trimmed}) not determined within {shortest.maxNodes.toLocaleString()}
							{shortest.maxNodes === 1 ? 'string' : 'strings'}; theoremhood follows from the
							characterization.
							{#if shortest.stoppedBy === 'nodes' && nextNodeBound}
								<button
									class="query-verdict__witness"
									type="button"
									onclick={() => onUpdateMaxNodes(nextNodeBound)}
								>
									increase bound to {formatNodeBound(nextNodeBound)}
								</button>
							{/if}
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
