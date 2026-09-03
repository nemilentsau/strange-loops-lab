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
		doublingsToReach,
		ruleShortLabel,
		traceRevisitIndices
	} from '$lib/miu/core';
	import { ellipsizeMiddle } from '$lib/state/module1';
	import { nextWitnessStep } from '$lib/miu/witness';
	import type { Snippet } from 'svelte';
	import type { DerivationTraceReading } from '$lib/miu/traceReadings';

	let {
		trace,
		traceReading,
		currentString,
		ruleAvailability,
		target,
		witnessTarget,
		witnessPath,
		witnessKind,
		onApplyMove,
		onJumpToStep,
		onReset,
		children
	}: {
		trace: DerivationTrace;
		traceReading: DerivationTraceReading;
		currentString: string;
		ruleAvailability: MiuRuleAvailability[];
		target: string;
		witnessTarget: string | null;
		witnessPath: MiuMove[] | null;
		witnessKind: 'constructed' | 'shortest' | null;
		onApplyMove: (move: MiuMove) => void;
		onJumpToStep: (index: number) => void;
		onReset: () => void;
		children?: Snippet;
	} = $props();

	let hoverRuleId = $state<MiuRuleId | null>(null);
	let hoverMoveKey = $state<string | null>(null);

	const activeRule = $derived.by(() => {
		if (!hoverRuleId) return null;
		const row = ruleAvailability.find((candidate) => candidate.ruleId === hoverRuleId);
		return row && row.status === 'available' ? row : null;
	});
	const activeMoves = $derived(activeRule?.moves ?? []);
	const hoverMove = $derived(activeMoves.find((move) => move.key === hoverMoveKey) ?? null);
	const revisits = $derived(traceRevisitIndices(trace));

	// A rule can apply at many sites on a long string; listing every one floods the
	// rail with near-identical results. Show a handful — any specific site is applied
	// by clicking it in the string above — and count the rest.
	const MAX_LEDGER_SITES = 6;

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

	function applyWitnessMove(move: MiuMove | null) {
		if (move) {
			onApplyMove(move);
		}
	}

	function siteKeydown(event: KeyboardEvent, move: MiuMove) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			applySite(move);
		}
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

	function instructionText(index: number): string {
		const instruction = traceReading.rows[index]?.instruction;
		if (!instruction) return '—';
		return instruction.siteBits
			? `${instruction.opcode} ${instruction.siteBits}`
			: instruction.opcode;
	}

	function residueText(index: number): string {
		return String(traceReading.rows[index]?.residue ?? '');
	}

	const currentStep = $derived(trace.steps[trace.currentIndex] ?? trace.steps[0]!);
	const focalRevisit = $derived(revisits[trace.currentIndex] ?? null);
	const aheadSteps = $derived(trace.steps.length - 1 - trace.currentIndex);
	const deadBranchStart = $derived(currentDeadBranchStart(trace));
	const trimmedTarget = $derived(target.trim());
	// On a closed branch only R2 ever applies, so the target is reachable from
	// here exactly when it is this tail doubled some number of times. 0 means
	// the target is reached (the notice has nothing left to steer); ≥ 1 means
	// the target sits further along this branch; null means it does not.
	const doublingsToTarget = $derived(doublingsToReach(currentString, trimmedTarget));
	const reachedTarget = $derived(trimmedTarget !== '' && currentString === trimmedTarget);
	const activeWitness = $derived.by(() => {
		if (!witnessPath || !witnessTarget || witnessTarget !== trimmedTarget) {
			return null;
		}

		return nextWitnessStep(trace, witnessPath);
	});
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
		<span
			class="spine-line__reading"
			aria-label={`Residue ${residueText(index)}; instruction ${instructionText(index)}`}
		>
			<span class="spine-line__residue">{residueText(index)}</span>
			<span class="spine-line__instruction">{instructionText(index)}</span>
		</span>
		<span class="spine-line__jump" aria-hidden="true">
			{ahead ? '↪ jump forward' : '↩ continue from here'}
		</span>
	</button>
{/snippet}

{#snippet witnessMenu(index: number)}
	{#if activeWitness && activeWitness.anchorIndex === index}
		<div class="witness-menu" data-state={activeWitness.status}>
			<p class="witness-menu__label">
				{witnessKind === 'shortest' ? 'shortest derivation' : 'constructed derivation'}
				for {ellipsizeMiddle(witnessTarget ?? trimmedTarget)}
			</p>
			{#if activeWitness.status === 'complete'}
				<p class="witness-menu__next">target reached along this derivation.</p>
			{:else if activeWitness.nextMove}
				<p class="witness-menu__next">
					{ruleNote(activeWitness.nextMove)} ⇒ {ellipsizeMiddle(activeWitness.result ?? activeWitness.nextMove.result)}
				</p>
				{#if trace.currentIndex === index}
					<button
						class="witness-menu__action"
						type="button"
						onclick={() => applyWitnessMove(activeWitness.nextMove)}
					>
						apply next step
					</button>
				{:else}
					<button
						class="witness-menu__action"
						type="button"
						onclick={() => onJumpToStep(index)}
					>
						continue from step {index}
					</button>
				{/if}
			{/if}
		</div>
	{/if}
{/snippet}

<div class="worksheet">
	<div class="worksheet__head">
		<p class="microlabel">Derivation toward {trimmedTarget}</p>
		<button class="worksheet-reset" type="button" onclick={onReset}>Reset to MI</button>
	</div>

	<div class="worksheet__cols">
		<div class="worksheet__main">
			<div class="spine">
				<div class="spine-reading-head" aria-hidden="true">
					<span>r(s)</span>
					<span>instruction</span>
				</div>
				{#each trace.steps as step, index}
					{#if index < trace.currentIndex}
						{@render spineLine(step, index, false)}
						{@render witnessMenu(index)}
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

								{#if reachedTarget}
									<p class="focal__note focal__note--target">= the target.</p>
								{:else if hoverMove && activeRule}
									<p class="site-preview">
										<span class="site-preview__chip">
											apply {ruleShortLabel(activeRule.ruleId)} here → {ellipsizeMiddle(hoverMove.result)}
										</span>
									</p>
								{:else if activeRule && activeRule.moves.length > 1}
									<p class="focal__hint">
										{activeRule.ruleLabel} applies at {activeRule.moves.length} sites.
									</p>
								{:else}
									<p class="focal__note">
										{ruleNote(currentStep.via)}{#if focalRevisit !== null}{' · '}<span
												class="spine-line__again">↩ same as step {focalRevisit}</span
											>{/if}
									</p>
								{/if}
							</div>
							<div class="focal__reading">
								<div>
									<span class="reading-column-label">r(s)</span>
									<strong>{residueText(trace.currentIndex)}</strong>
								</div>
								<div>
									<span class="reading-column-label">instruction</span>
									<code>{instructionText(trace.currentIndex)}</code>
								</div>
							</div>
						</div>
						{@render witnessMenu(index)}
					{:else}
						{@render spineLine(step, index, true)}
						{@render witnessMenu(index)}
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

			{@render children?.()}

			{#if deadBranchStart !== null && doublingsToTarget !== 0}
				<div class="dead-branch">
					<strong>This branch is closed.</strong> Only R2 applies, and doubling this tail can never
					create III, UU, or a final I — the other rules will never reopen from here, however far
					you double.
					{#if doublingsToTarget !== null}
						The target sits on this branch: {doublingsToTarget} more
						{doublingsToTarget === 1 ? 'doubling reaches' : 'doublings reach'} it.
					{:else if deadBranchStart > 0}
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

		<aside class="rules-rail">
			<p class="microlabel">Rules</p>
			<div class="rules-ledger">
				{#each ruleAvailability as row (row.ruleId)}
					<div
						class="ledger-row"
						role="group"
						aria-label={row.ruleLabel}
						data-state={row.status}
						onpointerenter={() => {
							if (row.status === 'available') hoverRuleId = row.ruleId;
						}}
						onpointerleave={() => {
							hoverRuleId = null;
							hoverMoveKey = null;
						}}
					>
						<div class="ledger-row__head">
							<span class="ledger-row__id">{ruleShortLabel(row.ruleId)}</span>
							<span class="ledger-row__pattern">{row.pattern}</span>
							{#if row.status === 'available' && row.moves.length > 1}
								<span class="ledger-row__count">{row.moves.length} sites</span>
							{/if}
						</div>

						{#if row.status === 'unavailable'}
							<p class="ledger-row__status">— {row.reason}</p>
						{:else}
							<div class="ledger-results">
								{#each row.moves.slice(0, MAX_LEDGER_SITES) as move (move.key)}
									<button
										class="ledger-result"
										type="button"
										aria-label={`Apply ${row.ruleLabel}, producing ${move.result}`}
										onpointerenter={() => {
											hoverRuleId = row.ruleId;
											hoverMoveKey = move.key;
										}}
										onpointerleave={() => (hoverMoveKey = null)}
										onfocus={() => {
											hoverRuleId = row.ruleId;
											hoverMoveKey = move.key;
										}}
										onblur={() => {
											hoverRuleId = null;
											hoverMoveKey = null;
										}}
										onclick={() => applySite(move)}
									>
										<span class="ledger-result__arrow" aria-hidden="true">→</span>
										<span class="ledger-result__value">{ellipsizeMiddle(move.result)}</span>
									</button>
								{/each}
								{#if row.moves.length > MAX_LEDGER_SITES}
									<p class="ledger-more">+{row.moves.length - MAX_LEDGER_SITES} more sites</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</aside>
	</div>
</div>
