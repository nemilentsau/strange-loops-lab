<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { DialogueResult } from '$lib/dialogue/types';
	import {
		restoreTargetForModule1Artifact,
		type DialogueMode,
		type Module1Artifact
	} from '$lib/state/module1';

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

	function restoreHintFor(artifactType: string): string {
		const target = restoreTargetForModule1Artifact(artifactType);

		if (!target) {
			return 'saved only';
		}

		return `reopens in ${capitalize(target.phase)}`;
	}

	function capitalize(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	const DEFAULT_DIALOGUE_STATUS = 'Submit your explanation above to get coaching feedback.';
	const hasDialogueRun = $derived(lastDialogue !== null);
	const showDialogueStatus = $derived(
		hasDialogueRun || dialogueRunning || dialogueStatus !== DEFAULT_DIALOGUE_STATUS
	);
</script>

<div class="phase-reflect">
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

	<SurfacePanel title="Artifact Notebook" eyebrow="Your notebook" tone="coaching">
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
			<ul class="ledger artifact-ledger">
				{#each savedArtifacts as artifact}
					<li class="artifact-ledger__item">
						<div class="artifact-ledger__meta">
							<strong>{artifact.title}</strong>
							<span>
								{artifact.artifactType} · {restoreHintFor(artifact.artifactType)} ·
								{formatTimestamp(artifact.createdAt)}
							</span>
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
		{/if}
	</SurfacePanel>
</div>
