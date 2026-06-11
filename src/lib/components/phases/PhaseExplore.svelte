<script lang="ts">
	import type {
		DerivationStep,
		DerivationTrace,
		MiuMove,
		MiuProposalAnalysis,
		MiuRuleAvailability,
		MiuRuleId
	} from '$lib/miu/core';
	import type { ChallengeStatus } from '$lib/state/module1Challenges';
	import { PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';

	let {
		trace,
		currentString,
		ruleAvailability,
		challenges,
		proposalInput,
		proposalAnalysis,
		onApplyMove,
		onApplyProposalMatch,
		onJumpToStep,
		onUpdateProposal
	}: {
		trace: DerivationTrace;
		currentString: string;
		ruleAvailability: MiuRuleAvailability[];
		challenges: ChallengeStatus[];
		proposalInput: string;
		proposalAnalysis: MiuProposalAnalysis | null;
		onApplyMove: (move: MiuMove) => void;
		onApplyProposalMatch: (move: MiuMove) => void;
		onJumpToStep: (index: number) => void;
		onUpdateProposal: (event: Event) => void;
	} = $props();

	const level = PHASE_META.explore.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	/* The selected rule: hovering a ledger row previews its sites; clicking the
	 * row (its sites button) pins the selection so the string stays interactive
	 * while the pointer moves up to it. */
	let pinnedRuleId = $state<MiuRuleId | null>(null);
	let hoverRuleId = $state<MiuRuleId | null>(null);
	let hoverMoveKey = $state<string | null>(null);
	let testerOpen = $state(false);
	let testerAutoOpened = false;
	let lastTrace: DerivationTrace | null = null;

	// Sync the tester with externally-driven draft changes: a restored draft
	// arriving with tester text opens it once; a session reset (fresh one-step
	// trace, empty input) closes it and drops the rule selection. Manual
	// toggling stays with the learner.
	$effect(() => {
		if (!testerAutoOpened && proposalInput.trim()) {
			testerOpen = true;
			testerAutoOpened = true;
		}

		if (trace !== lastTrace) {
			const isFreshTrace = trace.steps.length === 1;
			lastTrace = trace;

			if (isFreshTrace && !proposalInput.trim()) {
				testerOpen = false;
				testerAutoOpened = false;
				pinnedRuleId = null;
			}
		}
	});

	// If the pinned rule loses all its sites (e.g. the last III was spent),
	// the selection has nothing to point at any more.
	$effect(() => {
		if (
			pinnedRuleId &&
			!ruleAvailability.some((row) => row.ruleId === pinnedRuleId && row.status === 'available')
		) {
			pinnedRuleId = null;
		}
	});

	const activeRule = $derived.by(() => {
		const id = hoverRuleId ?? pinnedRuleId;
		if (!id) return null;
		const row = ruleAvailability.find((candidate) => candidate.ruleId === id);
		return row && row.status === 'available' ? row : null;
	});
	const activeMoves = $derived(activeRule?.moves ?? []);
	const hoverMove = $derived(activeMoves.find((move) => move.key === hoverMoveKey) ?? null);

	interface StringSegment {
		move: MiuMove | null;
		start: number;
		chars: string[];
	}

	/* Split the current string into click targets for the active rule. Sites
	 * can overlap (III in an I-run, UU in a U-run), so each character belongs
	 * to its latest-starting covering site; hover feedback always shows the
	 * exact span that would be replaced. */
	const segments = $derived(buildSegments(currentString, activeMoves));

	function buildSegments(value: string, moves: MiuMove[]): StringSegment[] {
		const result: StringSegment[] = [];

		for (let index = 0; index < value.length; index += 1) {
			let owner: MiuMove | null = null;
			for (const move of moves) {
				if (move.start <= index && index < move.end) {
					owner = move; // moves are ordered by start; keep the latest
				}
			}

			const last = result[result.length - 1];
			if (last && last.move === owner) {
				last.chars.push(value[index]!);
			} else {
				result.push({ move: owner, start: index, chars: [value[index]!] });
			}
		}

		return result;
	}

	function markFor(index: number, covered: boolean): 'hot' | 'warm' | null {
		if (hoverMove && hoverMove.start <= index && index < hoverMove.end) {
			return 'hot';
		}
		return covered ? 'warm' : null;
	}

	function applySite(move: MiuMove) {
		hoverMoveKey = null;
		onApplyMove(move);
	}

	// Sites are role="button" spans, not <button>s: a real button cannot break
	// across lines, so a long site (Rule 2's site is the whole tail) would turn
	// into one unbreakable box and blow up the wrapping (design rule 4).
	function siteKeydown(event: KeyboardEvent, move: MiuMove) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			applySite(move);
		}
	}

	function toggleRulePin(ruleId: MiuRuleId) {
		pinnedRuleId = pinnedRuleId === ruleId ? null : ruleId;
	}

	function shortRuleId(ruleLabel: string): string {
		return ruleLabel.replace('Rule ', 'R');
	}

	function ruleNote(via: MiuMove | null): string {
		if (!via) return 'axiom';
		switch (via.ruleId) {
			case 'append-u':
				return 'R1 · appended U';
			case 'double-tail':
				return 'R2 · doubled';
			case 'replace-iii':
				return 'R3 · III → U';
			case 'delete-uu':
				return 'R4 · removed UU';
		}
	}

	const currentStep = $derived(trace.steps[trace.currentIndex] ?? trace.steps[0]!);
	const aheadSteps = $derived(trace.steps.length - 1 - trace.currentIndex);
</script>

{#snippet spineLine(step: DerivationStep, index: number, ahead: boolean)}
	<button
		class="spine-line"
		class:spine-line--ahead={ahead}
		type="button"
		onclick={() => onJumpToStep(index)}
	>
		<span class="spine-line__num">{index}</span>
		<span class="spine-line__value">{step.value}</span>
		<span class="spine-line__note">{ruleNote(step.via)}</span>
		<span class="spine-line__jump" aria-hidden="true">
			{ahead ? '↪ jump forward' : '↩ continue from here'}
		</span>
	</button>
{/snippet}

<div class="phase-canvas phase-canvas--{level} phase-explore">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<div class="worksheet">
		<p class="worksheet__label">Derivation</p>

		<div class="spine">
			{#each trace.steps as step, index}
				{#if index < trace.currentIndex}
					{@render spineLine(step, index, false)}
				{:else if index === trace.currentIndex}
					<div class="focal">
						<span class="focal__num">{index}</span>
						<div class="focal__body">
							<div class="focal__string">
								{#each segments as segment (segment.start)}{#if segment.move}<span
											class="string-site"
											role="button"
											tabindex="0"
											aria-label={`Apply ${activeRule?.ruleLabel} at characters ${segment.move.start + 1}–${segment.move.end}, producing ${segment.move.result}`}
											onmouseenter={() => (hoverMoveKey = segment.move!.key)}
											onmouseleave={() => (hoverMoveKey = null)}
											onfocus={() => (hoverMoveKey = segment.move!.key)}
											onblur={() => (hoverMoveKey = null)}
											onclick={() => applySite(segment.move!)}
											onkeydown={(event) => siteKeydown(event, segment.move!)}
											>{#each segment.chars as char, offset}<span
													class="string-char"
													data-mark={markFor(segment.start + offset, true)}
													>{char}</span
												>{/each}</span
										>{:else}{#each segment.chars as char, offset}<span
											class="string-char"
											data-mark={markFor(segment.start + offset, false)}>{char}</span
										>{/each}{/if}{/each}
							</div>

							{#if hoverMove && activeRule}
								<p class="site-preview">
									<span class="site-preview__chip">
										apply {shortRuleId(activeRule.ruleLabel)} here → {hoverMove.result}
									</span>
								</p>
							{:else if activeRule && activeRule.moves.length > 1}
								<p class="focal__hint">
									{activeRule.ruleLabel} applies in {activeRule.moves.length} places — hover a
									highlighted site to preview it, click to apply.
								</p>
							{:else}
								<p class="focal__note">{ruleNote(currentStep.via)}</p>
							{/if}
						</div>
					</div>
				{:else}
					{@render spineLine(step, index, true)}
				{/if}
			{/each}

			{#if aheadSteps > 0}
				<p class="spine-ahead-note">
					{aheadSteps === 1
						? `step ${trace.steps.length - 1} stays`
						: `steps ${trace.currentIndex + 1}–${trace.steps.length - 1} stay`} until you apply a
					move from step {trace.currentIndex} — branching discards {aheadSteps === 1
						? 'it'
						: 'them'}.
				</p>
			{/if}
		</div>

		<p class="worksheet__label worksheet__label--rules">Rules</p>

		<div class="rules-ledger">
			{#each ruleAvailability as row (row.ruleId)}
				<div
					class="ledger-row"
					role="group"
					aria-label={row.ruleLabel}
					data-state={row.status}
					data-pinned={pinnedRuleId === row.ruleId}
					onpointerenter={() => {
						if (row.status === 'available') hoverRuleId = row.ruleId;
					}}
					onpointerleave={() => (hoverRuleId = null)}
				>
					<span class="ledger-row__id">{shortRuleId(row.ruleLabel)}</span>
					<span class="ledger-row__pattern">{row.pattern}</span>

					{#if row.status === 'unavailable'}
						<span class="ledger-row__status">— {row.reason}</span>
					{:else if row.moves.length === 1}
						<span class="ledger-row__status">applies — one way</span>
						<span class="ledger-row__preview">→ {row.moves[0]!.result}</span>
						<button
							class="ledger-apply"
							type="button"
							onfocus={() => (hoverRuleId = row.ruleId)}
							onblur={() => (hoverRuleId = null)}
							onclick={() => applySite(row.moves[0]!)}
						>
							Apply
						</button>
					{:else}
						<button
							class="ledger-sites"
							type="button"
							aria-pressed={pinnedRuleId === row.ruleId}
							onfocus={() => (hoverRuleId = row.ruleId)}
							onblur={() => (hoverRuleId = null)}
							onclick={() => toggleRulePin(row.ruleId)}
						>
							<strong>applies — {row.moves.length} places</strong>
							<span class="ledger-sites__hint">· click a highlighted site in the string</span>
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<div class="worksheet-foot">
			<button
				class="tester-toggle"
				type="button"
				aria-expanded={testerOpen}
				aria-controls="target-tester"
				onclick={() => (testerOpen = !testerOpen)}
			>
				{testerOpen ? '▾' : '▸'} Test a target string…
			</button>

			<p class="challenge-line">
				<span class="challenge-line__label">Challenges</span>
				{#each challenges as challenge, index (challenge.id)}
					<span class="challenge" data-complete={challenge.complete}>
						<span aria-hidden="true">{challenge.complete ? '✓' : '○'}</span>
						<span class="sr-only">{challenge.complete ? 'complete:' : 'open:'}</span>
						{challenge.label}
						{#if challenge.context}
							<span class="challenge__context">({challenge.context})</span>
						{/if}
					</span>
					{#if index < challenges.length - 1}
						<span class="challenge-line__sep" aria-hidden="true">·</span>
					{/if}
				{/each}
			</p>
		</div>

		{#if testerOpen}
			<div class="tester-body" id="target-tester">
				<label class="field-label" for="proposal-input">
					Test a target string against the current state
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
		{/if}
	</div>
</div>
