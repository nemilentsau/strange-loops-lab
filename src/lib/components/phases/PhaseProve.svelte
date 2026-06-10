<script lang="ts">
	import LabDesk from '$lib/components/LabDesk.svelte';
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import WorkingQuestion from '$lib/components/WorkingQuestion.svelte';
	import type { InvariantAnalysis } from '$lib/miu/invariants';
	import { PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';

		let {
			currentString,
			invariantCandidate,
			builtInInvariant,
			candidateInvariant,
			artifactStatus,
			workingQuestion,
			onApplyBuiltIn,
			onSaveInvariantArtifact,
			onSaveProofArtifact,
			onUpdateInvariant,
			onUpdateQuestion
		}: {
			currentString: string;
			invariantCandidate: string;
			builtInInvariant: InvariantAnalysis;
			candidateInvariant: InvariantAnalysis;
			artifactStatus: string;
			workingQuestion: string;
			onApplyBuiltIn: () => void;
			onSaveInvariantArtifact: () => void;
			onSaveProofArtifact: () => void;
			onUpdateInvariant: (event: Event) => void;
			onUpdateQuestion: (event: Event) => void;
		} = $props();

	const level = PHASE_META.prove.level;
	const levelPresentation = LEVEL_PRESENTATION[level];
</script>

<div class="phase-canvas phase-canvas--{level} phase-prove">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<LabDesk>
		{#snippet guide()}
			<WorkingQuestion {workingQuestion} {onUpdateQuestion} />

			<SurfacePanel title="The claim" eyebrow="Meta-level proof move">
				<div class="ink-rule-card ink-rule-card--bare claim-card">
					<h3>MU is unreachable from MI.</h3>
					<p class="field-note">
						This is not a claim about one derivation path. It is a claim about the entire space
						of possible derivations.
					</p>
				</div>
				<button class="button button--ghost button--sm" type="button" onclick={onApplyBuiltIn}>
					Use built-in candidate
				</button>
				<p class="field-note">
					Loads <code>count(I) mod 3 != 0</code> into the workbench as a starting candidate.
				</p>
			</SurfacePanel>
		{/snippet}

		{#snippet instrument()}
			<SurfacePanel
				title="Invariant Workbench"
				eyebrow="About the system"
				badge="verified arithmetic"
				tone="verified"
				instrument
			>
				<div class="proof-rail">
					<div class="ink-rule-card proof-step">
						<div class="proof-step__index">1</div>
						<div>
							<p class="eyebrow">Claim</p>
							<h3>MU is unreachable from MI.</h3>
							<p class="field-note">
								A property that survives every rule, and that MU lacks, would settle this for
								the whole derivation space.
							</p>
						</div>
					</div>

					<div class="ink-rule-card proof-step">
						<div class="proof-step__index">2</div>
						<div class="proof-step__body">
							<p class="eyebrow">Candidate invariant</p>
							<h3>Choose the property you think every reachable string preserves.</h3>
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
								Supported forms: <code>count(I) mod 3 != 0</code>,
								<code>count(I) mod 4 = 1</code>.
							</p>
						</div>
					</div>

					<div class="ink-rule-card proof-step">
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

					<div class="ink-rule-card proof-step">
						<div class="proof-step__index">4</div>
						<div class="proof-step__body">
							<p class="eyebrow">Rule preservation</p>
							<h3>Check whether each rule keeps the property intact.</h3>
							{#if candidateInvariant.kind === 'supported'}
								<p class="field-note">{candidateInvariant.description}</p>
								<p class="field-note">
									Per-rule verdicts are recorded in the evidence rail.
								</p>
							{:else}
								<p class="placeholder-copy">{candidateInvariant.unsupportedReason}</p>
							{/if}
						</div>
					</div>

					<div class="ink-rule-card proof-step proof-step--conclusion">
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
				</div>
			</SurfacePanel>
		{/snippet}

		{#snippet evidence()}
			<SurfacePanel
				title="Rule Preservation"
				eyebrow="Verified verdicts"
				badge="per-rule"
				tone="verified"
			>
				{#if candidateInvariant.kind === 'supported'}
					<div class="rule-result-list">
						{#each candidateInvariant.ruleResults as result}
							<div class="ink-rule-card rule-result">
								<div class="rule-result__top">
									<strong>{result.ruleLabel}</strong>
									<span
										class="badge"
										data-tone="verified"
										data-verdict={result.preserved ? 'pass' : 'fail'}
									>
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
					<p class="placeholder-copy">
						Enter a supported candidate to see each rule's preservation verdict.
					</p>
				{/if}
			</SurfacePanel>

			<SurfacePanel title="Reference route" eyebrow="Verified verdict" tone="verified">
				<div class="ink-rule-card">
					<div class="rule-result__top">
						<strong>count(I) mod 3 != 0</strong>
						<span
							class="badge"
							data-tone="verified"
							data-verdict={builtInInvariant.preserved ? 'pass' : 'fail'}
						>
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
			</SurfacePanel>

			<SurfacePanel title="Notebook" eyebrow="Save this proof work">
				<div class="status-row">
					<button
						class="button button--ghost button--sm"
						type="button"
						onclick={onSaveInvariantArtifact}
					>
						Save invariant run
					</button>
					<button
						class="button button--ghost button--sm"
						type="button"
						onclick={onSaveProofArtifact}
					>
						Save proof attempt
					</button>
				</div>
				<p class="field-note">{artifactStatus}</p>
			</SurfacePanel>
		{/snippet}
	</LabDesk>
</div>
