<script lang="ts">
	import type {
		DerivationStep,
		DerivationTrace,
		MiuMove,
		MiuRuleAvailability,
		MiuRuleId
	} from '$lib/miu/core';
	import { currentDeadBranchStart, traceRevisitIndices } from '$lib/state/module1Exercises';
	import { ellipsizeMiddle } from '$lib/state/module1';
	import MiuInvariant from './MiuInvariant.svelte';

	/**
	 * Reading 1 — manipulate. The page IS the derivation: a numbered spine, the
	 * current string written large (its rule sites are click targets in the
	 * string itself), and the four-rule ledger always on screen with the exact
	 * reason any rule cannot fire. The margin carries Reading 2.
	 */
	let {
		trace,
		currentString,
		ruleAvailability,
		invariantCandidate,
		reachTarget,
		onApplyMove,
		onJumpToStep,
		onUpdateReachTarget
	}: {
		trace: DerivationTrace;
		currentString: string;
		ruleAvailability: MiuRuleAvailability[];
		invariantCandidate: string;
		reachTarget: string;
		onApplyMove: (move: MiuMove) => void;
		onJumpToStep: (index: number) => void;
		onUpdateReachTarget: (event: Event) => void;
	} = $props();

	let pinnedRuleId = $state<MiuRuleId | null>(null);
	let hoverRuleId = $state<MiuRuleId | null>(null);
	let hoverMoveKey = $state<string | null>(null);
	let lastTrace: DerivationTrace | null = null;

	$effect(() => {
		if (trace !== lastTrace) {
			const isFreshTrace = trace.steps.length === 1;
			lastTrace = trace;
			if (isFreshTrace) {
				pinnedRuleId = null;
			}
		}
	});

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
	const revisits = $derived(traceRevisitIndices(trace));

	interface StringSegment {
		move: MiuMove | null;
		start: number;
		chars: string[];
	}

	const segments = $derived(buildSegments(currentString, activeMoves));

	function buildSegments(value: string, moves: MiuMove[]): StringSegment[] {
		const result: StringSegment[] = [];
		for (let index = 0; index < value.length; index += 1) {
			let owner: MiuMove | null = null;
			for (const move of moves) {
				if (move.start <= index && index < move.end) {
					owner = move;
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
													data-mark={markFor(segment.start + offset, true)}>{char}</span
												>{/each}</span
										>{:else}{#each segment.chars as char, offset}<span
											class="string-char"
											data-mark={markFor(segment.start + offset, false)}>{char}</span
										>{/each}{/if}{/each}
							</div>

							{#if hoverMove && activeRule}
								<p class="site-preview">
									<span class="site-preview__chip">
										apply {shortRuleId(activeRule.ruleLabel)} here → {ellipsizeMiddle(hoverMove.result)}
									</span>
								</p>
							{:else if activeRule && activeRule.moves.length > 1}
								<p class="focal__hint">
									{activeRule.ruleLabel} applies at {activeRule.moves.length} places — hover a highlighted
									site to preview it, click to apply.
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
						: `steps ${trace.currentIndex + 1}–${trace.steps.length - 1} stay`} until you apply a move
					from step {trace.currentIndex} — branching discards {aheadSteps === 1 ? 'it' : 'them'}.
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
				<strong>This branch is closed.</strong> Only R2 applies, and doubling this tail can never create
				III, UU, or a final I — the other rules will never reopen from here, however far you double.
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
		<MiuInvariant {currentString} {invariantCandidate} {reachTarget} {onUpdateReachTarget} />
	</div>
</div>
