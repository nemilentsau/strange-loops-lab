<script lang="ts">
	import { buildProofDocument } from '$lib/state/module1Proof';
	import { PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';

	let {
		currentString,
		invariantCandidate,
		artifactStatus,
		onApplyBuiltIn,
		onSaveInvariantArtifact,
		onSaveProofArtifact,
		onUpdateInvariant
	}: {
		currentString: string;
		invariantCandidate: string;
		artifactStatus: string;
		onApplyBuiltIn: () => void;
		onSaveInvariantArtifact: () => void;
		onSaveProofArtifact: () => void;
		onUpdateInvariant: (event: Event) => void;
	} = $props();

	const level = PHASE_META.prove.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	/* The whole page re-derives from the candidate: editing it rewrites the
	 * argument live. Every stamp is the verifier's. */
	const doc = $derived(buildProofDocument(invariantCandidate, currentString));
</script>

<div class="phase-canvas phase-canvas--{level} phase-prove">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<div class="proof-doc">
		<p class="worksheet__label">A proof about every derivation — verified arithmetic</p>

		<p class="proof-claim">
			<span class="proof-claim__word">Claim</span>MU is not derivable in the MIU system.
		</p>
		<p class="proof-claim-note">
			Search can't settle this — there are infinitely many derivations to check. But suppose
			some property holds for MI and no rule can break it. Then every derivable string has it,
			no matter how it was derived. If MU lacks that property, MU is unreachable.
		</p>

		<div class="proof-candidate">
			<div class="proof-candidate__row">
				<span class="proof-candidate__word">Candidate invariant</span>
				<input
					class="proof-candidate__input"
					type="text"
					aria-label="Candidate invariant"
					placeholder="count(I) mod 3 != 0"
					value={invariantCandidate}
					oninput={onUpdateInvariant}
				/>
				<button class="proof-candidate__builtin" type="button" onclick={onApplyBuiltIn}>
					⟲ use the built-in candidate
				</button>
			</div>
			{#if doc.supported}
				<p class="proof-candidate__note">
					supported forms: <code>count(I) mod k = r</code> · <code>count(I) mod k != r</code> —
					editing rewrites the argument below, live
				</p>
				<p class="proof-candidate__now">{doc.currentLine}</p>
			{:else}
				<p class="proof-candidate__note">{doc.unsupportedReason}</p>
			{/if}
		</div>

		{#if doc.supported}
			<ol class="proof-clauses">
				{#each doc.clauses as clause (clause.num)}
					<li class="proof-clause" data-stamp={clause.stamp}>
						<span class="proof-clause__num">{clause.num}</span>
						<div class="proof-clause__body">
							<p class="proof-clause__head">
								{clause.head}{#if clause.pattern}<span class="proof-clause__pat"
										>{clause.pattern}</span
									>{/if}
							</p>
							<p class="proof-clause__text">{clause.text}</p>
							{#if clause.witness}
								<p class="proof-clause__witness">{clause.witness}</p>
							{/if}
						</div>
						<span class="proof-clause__stamp" aria-label={clause.stamp === 'pass' ? 'verified' : 'fails'}>
							{clause.stamp === 'pass' ? '✓' : '✗'}
						</span>
					</li>
				{/each}

				{#if doc.conclusion}
					<li class="proof-clause proof-clause--conclusion" data-stamp={doc.conclusion.stamp}>
						<span class="proof-clause__num">∴</span>
						<div class="proof-clause__body">
							<p class="proof-clause__head">{doc.conclusion.head}</p>
							<p class="proof-clause__text">{doc.conclusion.text}</p>
						</div>
						<span
							class="proof-clause__stamp"
							aria-label={doc.conclusion.stamp === 'pass' ? 'verified' : 'fails'}
						>
							{doc.conclusion.stamp === 'pass' ? '✓' : '✗'}
						</span>
					</li>
				{/if}
			</ol>
		{/if}

		<div class="proof-foot">
			<button type="button" onclick={onSaveInvariantArtifact}>save this invariant run</button>
			<button type="button" onclick={onSaveProofArtifact}>save this proof attempt</button>
			<span class="proof-foot__status">{artifactStatus}</span>
		</div>
	</div>
</div>
