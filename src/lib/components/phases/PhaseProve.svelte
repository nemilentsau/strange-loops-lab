<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { InvariantAnalysis } from '$lib/miu/invariants';

	let {
		currentString,
		invariantCandidate,
		builtInInvariant,
		candidateInvariant,
		onApplyBuiltIn,
		onUpdateInvariant
	}: {
		currentString: string;
		invariantCandidate: string;
		builtInInvariant: InvariantAnalysis;
		candidateInvariant: InvariantAnalysis;
		onApplyBuiltIn: () => void;
		onUpdateInvariant: (event: Event) => void;
	} = $props();
</script>

<SurfacePanel title="Invariant Explorer" eyebrow="Meta-level proof move" badge="verified arithmetic" tone="verified">
	<div class="proof-rail">
		<div class="proof-step">
			<div class="proof-step__index">1</div>
			<div>
				<p class="eyebrow">Claim</p>
				<h3>MU is unreachable from MI.</h3>
				<p class="field-note">
					This is not a claim about one derivation path. It is a claim about the entire space of
					possible derivations.
				</p>
			</div>
		</div>

		<div class="proof-step">
			<div class="proof-step__index">2</div>
			<div class="proof-step__body">
				<div class="surface-panel__header">
					<div>
						<p class="eyebrow">Candidate invariant</p>
						<h3>Choose the property you think every reachable string preserves.</h3>
					</div>
					<button class="button button--ghost" type="button" onclick={onApplyBuiltIn}>
						Use built-in candidate
					</button>
				</div>
				<label class="field-label" for="prove-invariant">
					Candidate
					<input
						id="prove-invariant"
						class="text-field"
						type="text"
						placeholder="e.g., count(I) mod 3 != 0"
						value={invariantCandidate}
						oninput={onUpdateInvariant}
					/>
				</label>
				<p class="field-note">
					Supported forms: <code>count(I) mod 3 != 0</code>, <code>count(I) mod 4 = 1</code>.
				</p>
			</div>
		</div>

		<div class="proof-step">
			<div class="proof-step__index">3</div>
			<div class="proof-step__body">
				<p class="eyebrow">Current state check</p>
				<h3>Does the candidate hold for the string you are currently inspecting?</h3>
				<div class="graph-summary">
					<div class="graph-metric">
						<strong>{currentString}</strong>
						<span>current string</span>
					</div>
					<div class="graph-metric">
						<strong>{candidateInvariant.currentICount}</strong>
						<span>I count</span>
					</div>
					<div class="graph-metric">
						<strong>{candidateInvariant.currentSatisfied ? 'yes' : 'no'}</strong>
						<span>candidate holds now</span>
					</div>
				</div>
			</div>
		</div>

		<div class="proof-step">
			<div class="proof-step__index">4</div>
			<div class="proof-step__body">
				<p class="eyebrow">Rule preservation</p>
				<h3>Check whether each rule keeps the property intact.</h3>

				{#if candidateInvariant.kind === 'supported'}
					<p class="field-note">{candidateInvariant.description}</p>
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
				{:else}
					<p class="placeholder-copy">{candidateInvariant.unsupportedReason}</p>
				{/if}
			</div>
		</div>

		<div class="proof-step proof-step--conclusion">
			<div class="proof-step__index">5</div>
			<div class="proof-step__body">
				<p class="eyebrow">Conclusion</p>
				<h3>What does this let you conclude about MU?</h3>
				{#if candidateInvariant.kind === 'supported' && candidateInvariant.consequence}
					<p class="placeholder-copy">{candidateInvariant.consequence}</p>
				{:else if candidateInvariant.kind === 'supported'}
					<p class="field-note">
						The candidate is not yet strong enough to conclude anything global.
					</p>
				{:else}
					<p class="field-note">
						Start with a supported candidate before trying to state a consequence.
					</p>
				{/if}
			</div>
		</div>

		<div class="invariant-card invariant-card--built-in">
			<div class="surface-panel__header">
				<div>
					<p class="eyebrow">Reference route</p>
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
		</div>
	</div>
</SurfacePanel>
