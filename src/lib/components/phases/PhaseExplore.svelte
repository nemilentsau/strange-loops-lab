<script lang="ts">
	import LabDesk from '$lib/components/LabDesk.svelte';
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { DerivationTrace, MiuMove, MiuProposalAnalysis } from '$lib/miu/core';
	import { PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';

	interface ExploreGuideTask {
		title: string;
		body: string;
		question: string;
		proposal?: string;
	}

	let {
		currentString,
		legalMoves,
		proposalInput,
		proposalAnalysis,
		uniqueReachableStates,
		trace,
		workingQuestion,
		isNewSession,
		welcomeDismissed,
		onApplyMove,
		onApplyProposalMatch,
		onJumpToStep,
		onUndo,
		onRestart,
		onUpdateProposal,
		onUpdateQuestion,
		onDismissWelcome,
		onUseGuideTask
	}: {
		currentString: string;
		legalMoves: MiuMove[];
		proposalInput: string;
		proposalAnalysis: MiuProposalAnalysis | null;
		uniqueReachableStates: MiuMove[];
		trace: DerivationTrace;
		workingQuestion: string;
		isNewSession: boolean;
		welcomeDismissed: boolean;
		onApplyMove: (move: MiuMove) => void;
		onApplyProposalMatch: (move: MiuMove) => void;
		onJumpToStep: (index: number) => void;
		onUndo: () => void;
		onRestart: () => void;
		onUpdateProposal: (event: Event) => void;
		onUpdateQuestion: (event: Event) => void;
		onDismissWelcome: () => void;
		onUseGuideTask: (question: string, proposal?: string) => void;
	} = $props();

	const guideTasks: ExploreGuideTask[] = [
		{
			title: 'Test the tempting target',
			body: 'Try `MU` in the bench and compare “looks promising” with “is a legal next step.”',
			question: 'What distinguishes a tempting target from a legal next step in the MIU system?',
			proposal: 'MU'
		},
		{
			title: 'Force the first subtraction',
			body: 'Look for the first state where Rule 3 becomes available at all.',
			question: 'What has to happen before Rule 3 can even fire?'
		},
		{
			title: 'Look for convergence',
			body: 'Branch from an earlier trace step and see whether different derivations can land on the same string.',
			question: 'Can two different derivations reach the same MIU string?'
		}
	] as const;

	const level = PHASE_META.explore.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	// Compact guided-task rows expand on click to reveal body text. Kept as a
	// tiny local toggle (presentational only — no draft state).
	let expandedTask = $state<number | null>(null);

	function toggleTask(index: number) {
		expandedTask = expandedTask === index ? null : index;
	}
</script>

<div class="phase-canvas phase-canvas--{level} phase-explore">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<LabDesk>
		{#snippet guide()}
			<label class="working-question" for="working-question-input">
				<span class="working-question__label">Your working question</span>
				<input
					id="working-question-input"
					class="text-field working-question__input"
					type="text"
					placeholder="What are you trying to find out?"
					value={workingQuestion}
					oninput={onUpdateQuestion}
				/>
			</label>

			{#if isNewSession && !welcomeDismissed}
				<div class="hint-card">
					<p class="hint-card__text">
						<strong>Welcome to the MIU lab.</strong> You'll explore the MIU system, feel the
						limits of search, then build a proof. Start by trying the rules on the bench.
					</p>
					<button class="hint-card__dismiss" type="button" onclick={onDismissWelcome}>
						Got it
					</button>
				</div>
			{/if}

			<SurfacePanel title="Guided Tasks" eyebrow="Explore with intent">
				<div class="task-list">
					{#each guideTasks as task, index}
						<div class="task-row" data-expanded={expandedTask === index}>
							<div class="task-row__head">
								<button
									class="task-row__toggle"
									type="button"
									aria-expanded={expandedTask === index}
									onclick={() => toggleTask(index)}
								>
									<span class="task-row__caret" aria-hidden="true">
										{expandedTask === index ? '▾' : '▸'}
									</span>
									<span class="task-row__title">{task.title}</span>
								</button>
								<button
									class="button button--ghost button--sm task-row__use"
									type="button"
									onclick={() => onUseGuideTask(task.question, task.proposal)}
								>
									Use
								</button>
							</div>
							{#if expandedTask === index}
								<p class="task-row__body">{task.body}</p>
							{/if}
						</div>
					{/each}
				</div>
			</SurfacePanel>
		{/snippet}

		{#snippet instrument()}
			<SurfacePanel title="Bench" eyebrow="Inside the system" badge="verified rules" tone="verified">
				<div class="current-string-panel">
					<p class="eyebrow">Current string</p>
					<div class="current-string">{currentString}</div>
					<p class="field-note">
						Only legal next moves are shown. Applying one appends to the derivation trace and
						preserves exact rule metadata.
					</p>
				</div>

				<div class="bench-section">
					<p class="eyebrow">Legal moves</p>
					<div class="move-grid">
						{#if legalMoves.length > 0}
							{#each legalMoves as move}
								<button class="move-card" type="button" onclick={() => onApplyMove(move)}>
									<div class="move-card__top">
										<strong>{move.ruleLabel}</strong>
										<span>{move.result}</span>
									</div>
									<p>{move.detail}</p>
									<small>Span {move.start + 1}-{move.end}</small>
								</button>
							{/each}
						{:else}
							<p class="placeholder-copy">No legal moves exist from this state.</p>
						{/if}
					</div>
				</div>

				<div class="bench-section bench-workbench">
					<label class="field-label" for="proposal-input">
						Propose the next string yourself
						<input
							id="proposal-input"
							class="text-field"
							type="text"
							placeholder="e.g., MU"
							value={proposalInput}
							oninput={onUpdateProposal}
						/>
					</label>

					{#if proposalAnalysis}
						<div class="proposal-summary" data-valid={proposalAnalysis.exactMatches.length > 0}>
							<div class="proposal-summary__top">
								<strong>{proposalAnalysis.summary}</strong>
								<span
									class="badge"
									data-tone="verified"
									data-verdict={proposalAnalysis.exactMatches.length > 0 ? 'pass' : 'fail'}
								>
									{proposalAnalysis.exactMatches.length > 0 ? 'legal' : 'rejected'}
								</span>
							</div>

							{#if proposalAnalysis.exactMatches.length > 0}
								<button
									class="button button--ghost button--sm"
									type="button"
									onclick={() => onApplyProposalMatch(proposalAnalysis.exactMatches[0]!)}
								>
									Apply matched move
								</button>
							{/if}
						</div>

						{#if proposalAnalysis.syntaxValid}
							<div class="rule-result-list">
								{#each proposalAnalysis.ruleChecks as check}
									<div class="rule-result">
										<div class="rule-result__top">
											<strong>{check.ruleLabel}</strong>
											<span
												class="badge"
												data-tone="verified"
												data-verdict={check.status === 'matches' ? 'pass' : 'fail'}
											>
												{check.status === 'matches'
													? 'matches'
													: check.status === 'unavailable'
														? 'unavailable'
														: 'different result'}
											</span>
										</div>
										<p class="field-note">{check.explanation}</p>
										{#if check.legalResults.length > 0}
											<small>
												Legal result{check.legalResults.length === 1 ? '' : 's'}:
												{check.legalResults.join(', ')}
											</small>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					{:else}
						<p class="field-note">
							Type a candidate next string to see the verifier explain whether any MIU rule can
							produce it from the current state.
						</p>
					{/if}
				</div>
			</SurfacePanel>
		{/snippet}

		{#snippet evidence()}
			<SurfacePanel
				title="Derivation Trace"
				eyebrow="Ordered history"
				badge="branchable"
				tone="verified"
			>
				<div class="status-row">
					<button class="button button--ghost button--sm" type="button" onclick={onUndo}>
						Step back
					</button>
					<button class="button button--ghost button--sm" type="button" onclick={onRestart}>
						Restart from MI
					</button>
				</div>

				<div class="trace-list">
					{#each trace.steps as step, index}
						<button
							class="trace-step"
							type="button"
							data-active={index === trace.currentIndex}
							onclick={() => onJumpToStep(index)}
						>
							<div class="trace-step__meta">
								<strong>Step {index}</strong>
								<span>{step.via ? step.via.ruleLabel : 'Initial state'}</span>
							</div>
							<div class="trace-step__value">{step.value}</div>
							{#if step.via}
								<small>{step.via.detail} Span {step.via.start + 1}-{step.via.end}.</small>
							{:else}
								<small>Starting point for the derivation.</small>
							{/if}
						</button>
					{/each}
				</div>
				<p class="field-note">
					Click any earlier step, then apply a legal move from the bench to branch from that
					point instead of mutating later history in place.
				</p>
			</SurfacePanel>

			<SurfacePanel title="Immediate Reachability" eyebrow="Computed preview" tone="computed">
				<ul class="ledger">
					{#each uniqueReachableStates as move}
						<li>
							<strong>{move.result}</strong>
							<span>{move.ruleLabel}</span>
						</li>
					{/each}
				</ul>
				<p class="field-note">
					A bounded preview of the next reachable layer from the current string.
				</p>
			</SurfacePanel>
		{/snippet}
	</LabDesk>
</div>
