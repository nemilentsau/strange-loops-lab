<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { DialogueResult } from '$lib/dialogue/types';
	import {
		restoreTargetForModule1Artifact,
		type DialogueMode,
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

	interface ReflectionPrompt {
		title: string;
		subtitle: string;
		text: string;
		colorClass: string;
	}

	let {
		dialogueInput,
		dialogueMode,
		lastDialogue,
		dialogueRunning,
		dialogueStatus,
		notes,
		snapshotStatus,
		artifactStatus,
		savedArtifacts,
		reflectionPrompts,
		onUpdateDialogueInput,
		onRunDialogue,
		onUpdateNotes,
		onUseReflectionPrompt,
		onSaveSnapshot,
		onSaveNote,
		onSaveTrace,
		onRestoreArtifact,
		onPopulateSuggestion,
		formatTimestamp
	}: {
		dialogueInput: string;
		dialogueMode: DialogueMode;
		lastDialogue: DialogueResult | null;
		dialogueRunning: boolean;
		dialogueStatus: string;
		notes: string;
		snapshotStatus: string;
		artifactStatus: string;
		savedArtifacts: Module1Artifact[];
		reflectionPrompts: readonly ReflectionPrompt[];
		onUpdateDialogueInput: (event: Event) => void;
		onRunDialogue: () => void;
		onUpdateNotes: (event: Event) => void;
		onUseReflectionPrompt: (prompt: string) => void;
		onSaveSnapshot: () => void;
		onSaveNote: () => void;
		onSaveTrace: () => void;
		onRestoreArtifact: (artifact: Module1Artifact) => void;
		onPopulateSuggestion: (text: string) => void;
		formatTimestamp: (value: string | null) => string;
	} = $props();

	function restoreLabelFor(artifactType: string): string {
		const target = restoreTargetForModule1Artifact(artifactType);

		if (!target) {
			return 'Restore unavailable';
		}

		return `Restore to ${capitalize(target.phase)}`;
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
	const visibleArtifacts = $derived(
		filterArtifactsByType(savedArtifacts, artifactFilter)
	);

	// If the active filter empties out (e.g. after a reset), fall back to All so
	// the learner is never staring at a blank notebook with hidden entries.
	$effect(() => {
		if (artifactFilter !== 'all' && typeCounts[artifactFilter] === 0) {
			artifactFilter = 'all';
		}
	});

	const DEFAULT_DIALOGUE_STATUS = 'Submit your explanation above to get coaching feedback.';
	const hasDialogueRun = $derived(lastDialogue !== null);
	const showDialogueStatus = $derived(
		hasDialogueRun || dialogueRunning || dialogueStatus !== DEFAULT_DIALOGUE_STATUS
	);

	const level = PHASE_META.reflect.level;
	const levelPresentation = LEVEL_PRESENTATION[level];
</script>

<div class="phase-canvas phase-canvas--{level} phase-reflect">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>
	<SurfacePanel
		title="Dialogue Mode"
		eyebrow="Coaching"
		badge="Coaching, not proof"
		badgeTooltip="The examiner probes your understanding — it does not verify or certify proof correctness."
		tone="coaching"
	>
		<div class="dialogue-mode-card">
			<strong>{dialogueMode}</strong>
			<small>
				One honest coaching mode for now: probe the user explanation until the weak step becomes
				explicit, without pretending to certify proof.
			</small>
		</div>

		<label class="field-label" for="dialogue-input">
			Your explanation or question
			<textarea
				id="dialogue-input"
				class="text-area"
				placeholder="Describe your understanding or ask a question..."
				oninput={onUpdateDialogueInput}
			>{dialogueInput}</textarea>
		</label>
		<div class="status-row">
			<button
				class="button button--ghost"
				type="button"
				onclick={onRunDialogue}
				disabled={dialogueRunning}
			>
				{dialogueRunning ? 'Getting feedback...' : 'Get feedback'}
			</button>
		</div>

		{#if !hasDialogueRun && !dialogueRunning}
			<div class="dialogue-empty-state">
				<p>Describe what you understood about the proof. The examiner will probe your explanation to help you find gaps.</p>
				<button
					class="dialogue-empty-state__suggestion"
					type="button"
					onclick={() => onPopulateSuggestion('I think MU is unreachable because...')}
				>
					Try: "I think MU is unreachable because..."
				</button>
			</div>
		{/if}

		{#if showDialogueStatus}
			<p class="field-note">{dialogueStatus}</p>
		{/if}

		{#if lastDialogue}
			<div class="dialogue-transcript">
				{#each lastDialogue.messages as message}
					<div class="dialogue-turn" data-agent={message.agent}>
						<div class="dialogue-turn__top">
							<strong>{message.agent === 'examiner' ? 'Examiner' : 'Proof Coach'}</strong>
							<span class="badge" data-tone="coaching">coaching</span>
						</div>
						<p>{message.content}</p>
					</div>
				{/each}

				<div class="dialogue-final">
					<p class="eyebrow">Final response</p>
					<p>{lastDialogue.finalResponse}</p>
					{#if lastDialogue.sessionId}
						<small>Session {lastDialogue.sessionId}</small>
					{/if}
				</div>
			</div>
		{/if}
	</SurfacePanel>

	<SurfacePanel title="Artifact Notebook" eyebrow="Your notebook">
		<div class="reflection-prompt-stack">
			<div class="surface-panel__header">
				<div>
					<p class="eyebrow">Guided reflection</p>
					<h3>Use a prompt if the blank page is too open.</h3>
				</div>
			</div>
			<div class="reflection-prompt-grid">
				{#each reflectionPrompts as prompt}
					<button
						class="reflection-prompt {prompt.colorClass}"
						type="button"
						onclick={() => onUseReflectionPrompt(prompt.text)}
					>
						<strong>{prompt.title}</strong>
						<span class="reflection-prompt__subtitle">{prompt.subtitle}</span>
						<p>{prompt.text}</p>
					</button>
				{/each}
			</div>
		</div>

		<label class="field-label" for="module-notes">
			Notes and reflections
			<textarea
				id="module-notes"
				class="text-area"
				placeholder="Jot down observations, conjectures, or things you want to remember..."
				value={notes}
				oninput={onUpdateNotes}
			></textarea>
		</label>

		<div class="save-actions">
			<div class="save-action">
				<button class="button button--ghost" type="button" onclick={onSaveSnapshot}>
					Save progress
				</button>
				<span class="save-action__hint">Saves your entire session so you can resume later.</span>
			</div>
			<p class="field-note">{snapshotStatus}</p>

			<div class="save-actions__group">
				<div class="save-action">
					<button class="button button--ghost" type="button" onclick={onSaveNote}>
						Save notes
					</button>
					<span class="save-action__hint">Captures your current notes as a named artifact.</span>
				</div>
				<div class="save-action">
					<button class="button button--ghost" type="button" onclick={onSaveTrace}>
						Save derivation
					</button>
					<span class="save-action__hint">Captures the derivation trace you built in Explore.</span>
				</div>
			</div>
			<p class="field-note">{artifactStatus}</p>
		</div>

		{#if savedArtifacts.length > 0}
			<div class="artifact-notebook">
				<div class="artifact-filters" role="group" aria-label="Filter notebook by artifact type">
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
								class="button button--ghost button--sm"
								type="button"
								onclick={() => onRestoreArtifact(artifact)}
								disabled={!restoreTargetForModule1Artifact(artifact.artifactType)}
							>
								{restoreLabelFor(artifact.artifactType)}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</SurfacePanel>
</div>
