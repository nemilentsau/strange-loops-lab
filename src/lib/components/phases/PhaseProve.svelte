<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { InvariantAnalysis } from '$lib/miu/invariants';

	let {
		invariantCandidate,
		builtInInvariant,
		candidateInvariant,
		onApplyBuiltIn,
		onUpdateInvariant
	}: {
		invariantCandidate: string;
		builtInInvariant: InvariantAnalysis;
		candidateInvariant: InvariantAnalysis;
		onApplyBuiltIn: () => void;
		onUpdateInvariant: (event: Event) => void;
	} = $props();
</script>

<SurfacePanel title="Invariant Explorer" eyebrow="Meta-level proof move" badge="verified arithmetic" tone="verified">
	<div class="invariant-stack">
		<div class="invariant-card invariant-card--built-in">
			<div class="surface-panel__header">
				<div>
					<p class="eyebrow">Built-in argument</p>
					<h3>count(I) mod 3 != 0</h3>
				</div>
				<span class="badge" data-tone={builtInInvariant.preserved ? 'verified' : 'coaching'}>
					{builtInInvariant.preserved ? 'preserved' : 'fails'}
				</span>
			</div>
			<p class="field-note">
				Starting from MI, the I-count begins at 1. Rule 1 and Rule 4 leave it alone, Rule 3
				subtracts 3, and Rule 2 doubles it, flipping 1 and 2 modulo 3 without ever producing
				0.
			</p>
			{#if builtInInvariant.consequence}
				<p class="placeholder-copy">{builtInInvariant.consequence}</p>
			{/if}
			<button class="button button--ghost" type="button" onclick={onApplyBuiltIn}>
				Use built-in candidate
			</button>
		</div>

		<div class="invariant-card">
			<div class="surface-panel__header">
				<div>
					<p class="eyebrow">Custom candidate</p>
					<h3>{invariantCandidate}</h3>
				</div>
				{#if candidateInvariant.kind === 'supported'}
					<span
						class="badge"
						data-tone={candidateInvariant.preserved ? 'verified' : 'coaching'}
					>
						{candidateInvariant.preserved ? 'preserved' : 'counterexample found'}
					</span>
				{/if}
			</div>

			{#if candidateInvariant.kind === 'supported'}
				<p class="field-note">{candidateInvariant.description}</p>
				<div class="graph-summary">
					<div class="graph-metric">
						<strong>{candidateInvariant.currentICount}</strong>
						<span>I count in current string</span>
					</div>
					<div class="graph-metric">
						<strong>{candidateInvariant.currentSatisfied ? 'yes' : 'no'}</strong>
						<span>candidate holds now</span>
					</div>
					<div class="graph-metric">
						<strong>{candidateInvariant.preserved ? 'yes' : 'no'}</strong>
						<span>preserved under rules</span>
					</div>
				</div>

				<div class="rule-result-list">
					{#each candidateInvariant.ruleResults as result}
						<div class="rule-result">
							<div class="rule-result__top">
								<strong>{result.ruleLabel}</strong>
								<span class="badge" data-tone={result.preserved ? 'verified' : 'coaching'}>
									{result.preserved ? 'preserved' : 'fails'}
								</span>
							</div>
							<p class="field-note">{result.explanation}</p>
							{#if result.witness}
								<small>
									Witness: {result.witness.source} -> {result.witness.result}
								</small>
							{/if}
						</div>
					{/each}
				</div>

				{#if candidateInvariant.consequence}
					<p class="placeholder-copy">{candidateInvariant.consequence}</p>
				{/if}
			{:else}
				<p class="placeholder-copy">{candidateInvariant.unsupportedReason}</p>
				<p class="field-note">
					Supported forms: <code>count(I) mod 3 != 0</code>, <code>count(I) mod 4 = 1</code>.
				</p>
			{/if}
		</div>
	</div>
</SurfacePanel>
