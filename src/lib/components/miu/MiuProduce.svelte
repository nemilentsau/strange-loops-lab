<script lang="ts">
	import { isValidMiuString, normalizeMiuTailInput } from '$lib/miu/core';
	import { THEOREM_TARGETS } from '$lib/miu/examples';
	import {
		MIU_QUERY_BOUNDS,
		nextMiuQueryNodeBound,
		shortestDerivation
	} from '$lib/miu/complexity';
	import { countI } from '$lib/miu/invariants';

	let {
		target,
		queryMaxNodes,
		witnessOpen,
		onUpdateTarget,
		onUpdateMaxNodes,
		onToggleWitness
	}: {
		target: string;
		queryMaxNodes: number;
		witnessOpen: boolean;
		onUpdateTarget: (target: string) => void;
		onUpdateMaxNodes: (maxNodes: number) => void;
		onToggleWitness: () => void;
	} = $props();

	const trimmed = $derived(target.trim());
	const targetTail = $derived(trimmed.startsWith('M') ? trimmed.slice(1) : '');
	const valid = $derived(isValidMiuString(trimmed));
	const queryBounds = $derived({ maxDepth: MIU_QUERY_BOUNDS.maxDepth, maxNodes: queryMaxNodes });
	const theoremQuery = $derived(valid ? shortestDerivation(trimmed, queryBounds) : null);
	const targetICount = $derived(valid ? countI(trimmed) : 0);
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
		<div class="query-label" id="produce-target-label">target theorem</div>
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
		<div class="target-examples" aria-label="Theorem targets">
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
		{#if !valid}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">?</span>
				<span>target ∉ M{'{'}I,U{'}'}<sup>+</sup></span>
			</div>
			<p class="query-verdict__fact">the tail must be nonempty and contain only I and U.</p>
		{:else if theoremQuery?.outcome === 'unreachable-invariant'}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">✗</span>
				<span>{trimmed} ∉ Th(MIU)</span>
			</div>
			<p class="query-verdict__fact">#I = {targetICount} ≡ 0 (mod 3); the invariant excludes it.</p>
		{:else if theoremQuery?.outcome === 'found'}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">✓</span>
				<span>{trimmed} ∈ Th(MIU)</span>
			</div>
			<p class="query-verdict__fact">
				K_MIU({trimmed}) = {theoremQuery.length}
				{#if (theoremQuery.length ?? 0) > 0}
					<button class="query-verdict__witness" type="button" onclick={onToggleWitness}>
						{witnessOpen ? 'close shortest witness' : 'open shortest witness'}
					</button>
				{/if}
			</p>
		{:else}
			<div class="query-verdict__line">
				<span class="stamp" aria-hidden="true">…</span>
				<span>{trimmed}: no witness in the bounded graph</span>
			</div>
			<p class="query-verdict__fact">
				horizon: {theoremQuery?.stoppedBy === 'depth'
					? `depth ${theoremQuery.maxDepth}`
					: `${theoremQuery?.maxNodes} strings`}; this is not a negative verdict.
				{#if theoremQuery?.stoppedBy === 'nodes' && nextNodeBound}
					<button
						class="query-verdict__witness"
						type="button"
						onclick={() => onUpdateMaxNodes(nextNodeBound)}
					>
						raise limit to {formatNodeBound(nextNodeBound)}
					</button>
				{/if}
			</p>
		{/if}
	</div>
</div>
