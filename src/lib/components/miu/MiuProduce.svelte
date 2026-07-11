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
				The tail after <span class="o">M</span> must be nonempty and contain only
				<span class="o">I</span> and <span class="o">U</span>.
			</p>
		{:else if decision.outcome === 'non-theorem'}
			<p class="verdict__line">
				<span class="stamp" aria-hidden="true">✗</span>
				<span class="verdict__subject"><span class="o">{trimmed}</span> <span class="mv">∉</span> Th(MIU)</span>
			</p>
			<p class="verdict__fact">
				It has {targetICount === 0 ? 'no' : targetICount}
				<span class="o">I</span>'s, and {targetICount} ≡ 0 (mod 3): the invariant below excludes
				it.
			</p>
		{:else}
			<p class="verdict__line">
				<span class="stamp" aria-hidden="true">✓</span>
				<span class="verdict__subject"><span class="o">{trimmed}</span> <span class="mv">∈</span> Th(MIU)</span>
			</p>

			<div class="verdict__rows">
				{#if constructedLength === 0}
					<p class="verdict__row">
						<span class="o">MI</span> is the axiom: <span class="mv">K</span><sub>steps</sub> = 0
						(the empty derivation).
					</p>
				{:else if shortest?.outcome === 'found'}
					<p class="verdict__row">
						The shortest derivation from <span class="o">MI</span> takes {shortest.length}
						{shortest.length === 1 ? 'move' : 'moves'}: <span class="mv">K</span><sub>steps</sub>
						= {shortest.length}.<button
							class="reveal"
							type="button"
							onclick={() => onShowWitness('shortest')}
						>
							{witnessKind === 'shortest' ? 'hide shortest derivation' : 'show shortest derivation'}
						</button>
					</p>
					<p class="verdict__row">
						The general expand–double–contract construction takes {constructedLength}.<button
							class="reveal"
							type="button"
							onclick={() => onShowWitness('constructed')}
						>
							{witnessKind === 'constructed' ? 'hide construction' : 'show construction'}
						</button>
					</p>
				{:else}
					<p class="verdict__row">
						The general expand–double–contract construction derives it in {constructedLength}
						{constructedLength === 1 ? 'move' : 'moves'}.<button
							class="reveal"
							type="button"
							onclick={() => onShowWitness('constructed')}
						>
							{witnessKind === 'constructed' ? 'hide construction' : 'show construction'}
						</button>
					</p>
					{#if shortest?.outcome === 'exhausted' && shortest.completedDepth !== null}
						{@const bound = shortest.completedDepth}
						{#if constructedLength === bound + 1}
							<p class="verdict__row">
								None of the derivations of at most {bound}
								{bound === 1 ? 'move' : 'moves'} reaches it, so
								<span class="mv">K</span><sub>steps</sub> = {constructedLength}: the
								construction above is minimal.
							</p>
						{:else}
							<p class="verdict__row">
								None of the derivations of at most {bound}
								{bound === 1 ? 'move' : 'moves'} reaches it, so {bound} &lt;
								<span class="mv">K</span><sub>steps</sub> ≤ {constructedLength} — the exact
								minimum is still open.{#if shortest.stoppedBy === 'nodes' && nextNodeBound}<button
										class="compute"
										type="button"
										onclick={() => onUpdateMaxNodes(nextNodeBound)}
									>
										search deeper
									</button>{/if}
							</p>
						{/if}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
