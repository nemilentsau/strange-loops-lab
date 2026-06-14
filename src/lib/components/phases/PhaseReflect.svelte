<script lang="ts">
	import {
		restoreTargetForModule1Artifact,
		type Module1Artifact,
		PHASE_META,
		LEVEL_PRESENTATION
	} from '$lib/state/module1';
	import {
		ARTIFACT_TYPE_ORDER,
		artifactReviewMetadata,
		artifactTypeCounts,
		artifactTypeLabel,
		filterArtifactsByType,
		type ArtifactTypeFilter
	} from '$lib/state/module1Artifacts';

	let {
		snapshotStatus,
		artifactStatus,
		savedArtifacts,
		workingQuestion,
		onSaveSnapshot,
		onSaveTrace,
		onRestoreArtifact,
		onUpdateQuestion,
		formatTimestamp
	}: {
		snapshotStatus: string;
		artifactStatus: string;
		savedArtifacts: Module1Artifact[];
		workingQuestion: string;
		onSaveSnapshot: () => void;
		onSaveTrace: () => void;
		onRestoreArtifact: (artifact: Module1Artifact) => void;
		onUpdateQuestion: (event: Event) => void;
		formatTimestamp: (value: string | null) => string;
	} = $props();

	function restoreLabelFor(artifactType: string): string {
		const target = restoreTargetForModule1Artifact(artifactType);
		return target ? `Restore to ${capitalize(target.phase)}` : 'Saved only';
	}

	function capitalize(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	// The restore button already states the destination ("Restore to Prove"),
	// so drop the redundant "Reopens in" field from the inline review facts.
	function reviewFactsFor(artifact: Module1Artifact) {
		return artifactReviewMetadata(artifact).filter((field) => field.label !== 'Reopens in');
	}

	// Filters are ephemeral notebook UI state — not persisted into the draft.
	let artifactFilter = $state<ArtifactTypeFilter>('all');

	const typeCounts = $derived(artifactTypeCounts(savedArtifacts));
	const filterOptions = $derived([
		{ value: 'all' as ArtifactTypeFilter, label: 'All', count: typeCounts.all },
		...ARTIFACT_TYPE_ORDER.map((type) => ({
			value: type as ArtifactTypeFilter,
			label: artifactTypeLabel(type),
			count: typeCounts[type]
		}))
	]);
	const visibleArtifacts = $derived(filterArtifactsByType(savedArtifacts, artifactFilter));

	// If the active filter empties out (e.g. after a reset), fall back to All so
	// the reader is never staring at a blank notebook with hidden entries.
	$effect(() => {
		if (artifactFilter !== 'all' && typeCounts[artifactFilter] === 0) {
			artifactFilter = 'all';
		}
	});

	const level = PHASE_META.reflect.level;
	const levelPresentation = LEVEL_PRESENTATION[level];
</script>

<!--
	Reflect: the notebook's closing page. One document, single column, like its
	three siblings. The question you came with and the result you reached; an
	authored account of what the proof actually is and where it goes; the kept
	documents, filed as an index. The live examiner is retired — it had no value
	for a peer-level reader on a lesson they already own, and the coaching
	register can't be trusted on metamathematics. The dialogue backend is parked
	(still covered by smoke:dialogue) — see docs/module-1-document-model-plan.md.
-->
<div class="phase-canvas phase-canvas--{level} phase-reflect">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<div class="reflect-doc">
		<p class="worksheet__label">The notebook’s closing page — synthesis</p>

		<!-- Movement 1: your question, and what the module settled -->
		<section class="reflect-section">
			<label class="worksheet__label" for="reflect-question">Your working question</label>
			<input
				id="reflect-question"
				class="reflect-question__field"
				placeholder="What did you come here to decide? (e.g. can MU be reached from MI?)"
				value={workingQuestion}
				oninput={onUpdateQuestion}
			/>

			<p class="proof-claim">
				<span class="proof-claim__word">Result</span>MU is not reachable from MI.
			</p>
			<p class="proof-claim-note">
				The I-count mod 3 is preserved by every rule and MU has count 0, so no derivation reaches it.
				It’s a claim about every derivation at once, which is why it’s proved in Prove and not just
				left unsearched here.
			</p>
			<span class="badge reflect-claim-stamp" data-tone="verified" data-verdict="pass">verified in Prove</span>
		</section>

		<!-- Movement 2: what the proof is, and where it goes — authored, not coaching -->
		<section class="reflect-section">
			<p class="worksheet__label">What you proved</p>
			<p class="reflect-coda__lead">
				This is structural induction, not a search. The theorems are defined inductively — MI, plus
				whatever the four rules produce from a theorem — so to prove something about all of them you
				check that it holds for MI and that no rule breaks it. The I-count mod 3 works: MI has 1, every
				rule keeps it nonzero, MU would need 0. The only real work is finding that invariant; the rest
				is mechanical. It’s the same problem as finding a loop invariant — you strengthen a guess until
				every rule preserves it.
			</p>

			<p class="worksheet__label worksheet__label--rules">Where it goes</p>
			<div class="reflect-coda__threads">
				<p class="reflect-coda__thread">
					<em>The invariant is a model.</em> The rules act on ℤ/3: R2 doubles the count, R3 removes three
					I’s so it does nothing mod 3, R1 and R4 leave it alone. From 1 you only ever reach 1 or 2,
					never 0 — and MU is 0, so it isn’t a theorem. This is the usual way to prove something
					unprovable: find a model where it fails. Forcing does the same for ¬CH.
				</p>
				<p class="reflect-coda__thread">
					<em>MIU is decidable.</em> A string is a theorem exactly when its number of I’s isn’t a multiple
					of 3 — you can just check. That depends on these four rules. For string-rewriting systems in
					general, whether one string can be rewritten into another is undecidable (Post, 1947). MIU is
					just on the decidable side of that line, and the open question is when the invariant trick
					stops working.
				</p>
				<p class="reflect-coda__thread">
					<em>The proof talks about the system from outside.</em> It isn’t a longer derivation; it’s a
					statement about all derivations, which the system can’t make itself. That gap — provable inside
					versus true seen from outside — is where Gödel starts. It’s also why MIU is on the way to what
					we’re really after: a system that emits strings one token at a time and can’t step outside
					itself to see what it will never produce.
				</p>
			</div>
		</section>

		<!-- Movement 3: kept documents -->
		<section class="reflect-section">
			<p class="worksheet__label">Kept documents</p>

			{#if savedArtifacts.length > 0}
				<div class="artifact-filters" role="group" aria-label="Filter the notebook by document type">
					{#each filterOptions as option}
						<button
							class="artifact-filter"
							type="button"
							data-active={artifactFilter === option.value}
							disabled={option.value !== 'all' && option.count === 0}
							aria-pressed={artifactFilter === option.value}
							onclick={() => (artifactFilter = option.value)}
						>
							{option.label}
							<span class="artifact-filter__count">{option.count}</span>
						</button>
					{/each}
				</div>

				<ul class="ledger artifact-ledger">
					{#each visibleArtifacts as artifact (artifact.id)}
						<li class="artifact-ledger__item">
							<div class="artifact-ledger__meta">
								<div class="artifact-ledger__title-row">
									<span class="badge artifact-type-badge">{artifactTypeLabel(artifact.artifactType)}</span>
									<strong>{artifact.title}</strong>
								</div>
								<dl class="artifact-ledger__facts">
									{#each reviewFactsFor(artifact) as field}
										<div class="artifact-fact">
											<dt>{field.label}</dt>
											<dd>{field.value}</dd>
										</div>
									{/each}
									<div class="artifact-fact">
										<dt>Saved</dt>
										<dd>{formatTimestamp(artifact.createdAt)}</dd>
									</div>
								</dl>
							</div>
							<button
								class="button button--ghost button--sm restore-destination"
								type="button"
								onclick={() => onRestoreArtifact(artifact)}
								disabled={!restoreTargetForModule1Artifact(artifact.artifactType)}
							>
								{restoreLabelFor(artifact.artifactType)}
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="placeholder-copy">
					Nothing saved yet. Work you save in Explore, Map, and Prove lands here.
				</p>
			{/if}

			<div class="reflect-saves">
				<button class="button button--ghost button--sm" type="button" onclick={onSaveTrace}>
					Save derivation
				</button>
				<button class="button button--ghost button--sm" type="button" onclick={onSaveSnapshot}>
					Save progress
				</button>
			</div>
			<p class="field-note">{artifactStatus}</p>
			<p class="field-note">{snapshotStatus}</p>
		</section>
	</div>
</div>
