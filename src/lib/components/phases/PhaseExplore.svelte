<script lang="ts">
	import type {
		DerivationStep,
		DerivationTrace,
		MiuMove,
		MiuRuleAvailability,
		MiuRuleId
	} from '$lib/miu/core';
	import {
		currentDeadBranchStart,
		traceRevisitIndices,
		type ExerciseStatus
	} from '$lib/state/module1Exercises';
	import type { TargetQuery } from '$lib/state/module1Query';
	import { PHASE_META, LEVEL_PRESENTATION, ellipsizeMiddle } from '$lib/state/module1';

	const QUERY_BOUND_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

	let {
		trace,
		currentString,
		ruleAvailability,
		exercises,
		proposalInput,
		targetQuery,
		queryBound,
		onApplyMove,
		onWalkQueryPath,
		onJumpToStep,
		onUpdateProposal,
		onUpdateQueryBound
	}: {
		trace: DerivationTrace;
		currentString: string;
		ruleAvailability: MiuRuleAvailability[];
		exercises: ExerciseStatus[];
		proposalInput: string;
		targetQuery: TargetQuery | null;
		queryBound: number;
		onApplyMove: (move: MiuMove) => void;
		onWalkQueryPath: (moves: MiuMove[]) => void;
		onJumpToStep: (index: number) => void;
		onUpdateProposal: (event: Event) => void;
		onUpdateQueryBound: (event: Event) => void;
	} = $props();

	const level = PHASE_META.explore.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	/* The selected rule: hovering a ledger row previews its sites; clicking the
	 * row (its sites button) pins the selection so the string stays interactive
	 * while the pointer moves up to it. */
	let pinnedRuleId = $state<MiuRuleId | null>(null);
	let hoverRuleId = $state<MiuRuleId | null>(null);
	let hoverMoveKey = $state<string | null>(null);
	let anatomyOpen = $state(false);
	let lastTrace: DerivationTrace | null = null;

	// A session reset (fresh one-step trace) drops the rule selection.
	$effect(() => {
		if (trace !== lastTrace) {
			const isFreshTrace = trace.steps.length === 1;
			lastTrace = trace;

			if (isFreshTrace) {
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

	/* For each step, the index of the first earlier step with the same string
	 * — the spine writes the system's revisits instead of passing them by. */
	const revisits = $derived(traceRevisitIndices(trace));

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
	const focalRevisit = $derived(revisits[trace.currentIndex] ?? null);
	const aheadSteps = $derived(trace.steps.length - 1 - trace.currentIndex);
	/* Non-null exactly when the current string is provably stuck with R2
	 * forever (isDeadBranch); points at the first step of the trapped run. */
	const deadBranchStart = $derived(currentDeadBranchStart(trace));
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
		<span class="spine-line__note">
			{ruleNote(step.via)}{#if revisits[index] !== null}{' · '}<span class="spine-line__again"
					>↩ same as step {revisits[index]}</span
				>{/if}
		</span>
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
		<div class="worksheet__main">
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
											apply {shortRuleId(activeRule.ruleLabel)} here → {ellipsizeMiddle(
												hoverMove.result
											)}
										</span>
									</p>
								{:else if activeRule && activeRule.moves.length > 1}
									<p class="focal__hint">
										{activeRule.ruleLabel} applies at {activeRule.moves.length} places — hover a
										highlighted site to preview it, click to apply.
									</p>
								{:else}
									<p class="focal__note">
										{ruleNote(currentStep.via)}{#if focalRevisit !== null}{' · '}<span
												class="spine-line__again">↩ same as step {focalRevisit}</span
											>{/if}
									</p>
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

			<div class="anatomy">
				<button
					class="anatomy__toggle"
					type="button"
					aria-expanded={anatomyOpen}
					onclick={() => (anatomyOpen = !anatomyOpen)}
				>
					{anatomyOpen ? '▾' : '▸'} how the rules match
				</button>
				{#if anatomyOpen}
					<div class="anatomy__body">
						<p>
							<span class="anatomy__rule">R1</span> and <span class="anatomy__rule">R2</span> read
							the string globally — R1 looks only at its end (…I), R2 takes everything after M.
							When such a rule applies, it applies in exactly one way.
						</p>
						<p>
							<span class="anatomy__rule">R3</span> and <span class="anatomy__rule">R4</span> match
							a pattern anywhere inside — III or UU may occur at several places, so one rule can
							offer several moves.
						</p>
						<p>
							Every rule is pattern → replacement. The MIU system is a string-rewriting system;
							the four rules differ only in where their pattern may sit.
						</p>
					</div>
				{/if}
			</div>

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
							<span class="ledger-row__preview">→ {ellipsizeMiddle(row.moves[0]!.result)}</span>
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
								<strong>applies at {row.moves.length} places</strong>
								<span class="ledger-sites__hint">— click a site in the string</span>
							</button>
						{/if}
					</div>
				{/each}
			</div>

			{#if deadBranchStart !== null}
				<div class="dead-branch">
					<strong>This branch is closed.</strong> Only R2 applies, and doubling this tail can
					never create III, UU, or a final I — the other rules will never reopen from here,
					however far you double.
					{#if deadBranchStart > 0}
						<button
							class="dead-branch__jump"
							type="button"
							onclick={() => onJumpToStep(deadBranchStart - 1)}
						>
							↩ leave this branch — back to step {deadBranchStart - 1}
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<div class="worksheet__margin">
			<div class="query">
				<p class="worksheet__label">Target query</p>
				<p class="query__ask">
					From <span class="query__from">{ellipsizeMiddle(currentString)}</span> —<br />
					can
					<input
						class="query__input"
						type="text"
						aria-label="Target string"
						value={proposalInput}
						oninput={onUpdateProposal}
					/>
					be reached within
					<select
						class="query__bound"
						aria-label="Search bound in moves"
						value={queryBound}
						onchange={onUpdateQueryBound}
					>
						{#each QUERY_BOUND_OPTIONS as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
					move{queryBound === 1 ? '' : 's'}?
				</p>

				{#if targetQuery}
					<p class="query__verdict" data-ok={targetQuery.ok}>
						<span class="query__stamp" aria-hidden="true">{targetQuery.ok ? '✓' : '✗'}</span>
						<span class="sr-only">{targetQuery.ok ? 'verified legal:' : 'verified rejected:'}</span>
						{targetQuery.verdict}
					</p>

					{#if targetQuery.path && targetQuery.path.length > 0}
						<p class="query__path">
							{ellipsizeMiddle(targetQuery.path[0]!.source)}{#each targetQuery.path as move (move.key)}{' '}<span
									class="query__via">·{shortRuleId(move.ruleLabel)}·</span
								>{' '}{ellipsizeMiddle(move.result)}{/each}
						</p>
						<button
							class="query__walk"
							type="button"
							onclick={() => onWalkQueryPath(targetQuery.path!)}
						>
							{targetQuery.path.length === 1 ? 'Apply the move' : 'Walk this path'}
						</button>
					{/if}

					{#if targetQuery.detail}
						<p class="query__detail">{targetQuery.detail}</p>
					{/if}

					{#if targetQuery.clauses.length > 0}
						<div class="query__clauses">
							{#each targetQuery.clauses as clause (clause.ruleId)}
								<div class="query__clause">
									<span class="query__clause-id">{clause.ruleLabel} {clause.ok ? '✓' : '✗'}</span>
									{clause.text}
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>

			<div class="exercises">
				<p class="worksheet__label">Exercises</p>
				<p class="exercises__hint">detected by the verifier — never clicked</p>

				{#each exercises as exercise (exercise.id)}
					<div class="exercise" data-complete={exercise.complete}>
						<p class="exercise__head">
							<span aria-hidden="true">{exercise.complete ? '✓' : '○'}</span>
							<span class="sr-only">{exercise.complete ? 'detected:' : 'open:'}</span>
							{exercise.title}
						</p>
						<p class="exercise__body">
							{#if exercise.stamp}<span class="exercise__stamp">{exercise.stamp}</span
								>{' — '}{/if}{exercise.body}{#if exercise.progress}{' '}<span
									class="exercise__progress">{exercise.progress}</span
								>{/if}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
