<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { MiuMove } from '$lib/miu/core';
	import type { DerivationTrace } from '$lib/miu/core';

	let {
		currentString,
		legalMoves,
		uniqueReachableStates,
		trace,
		onApplyMove,
		onJumpToStep,
		onUndo,
		onRestart
	}: {
		currentString: string;
		legalMoves: MiuMove[];
		uniqueReachableStates: MiuMove[];
		trace: DerivationTrace;
		onApplyMove: (move: MiuMove) => void;
		onJumpToStep: (index: number) => void;
		onUndo: () => void;
		onRestart: () => void;
	} = $props();
</script>

<div class="phase-explore">
	<div class="phase-explore__main">
		<div class="phase-explore__left">
			<SurfacePanel title="MIU Sandbox" eyebrow="Inside the system" badge="verified rules" tone="verified">
				<div class="current-string-panel">
					<p class="eyebrow">Current string</p>
					<div class="current-string">{currentString}</div>
					<p class="field-note">
						Only legal next moves are shown. Applying one appends to the derivation trace and
						preserves exact rule metadata.
					</p>
				</div>

				<div class="status-row">
					<button class="button button--ghost" type="button" onclick={onUndo}>Step back</button>
					<button class="button button--ghost" type="button" onclick={onRestart}>
						Restart from MI
					</button>
				</div>

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
			</SurfacePanel>

			<SurfacePanel title="Immediate Reachability" eyebrow="Computed preview" tone="verified">
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
		</div>

		<SurfacePanel title="Derivation Trace" eyebrow="Ordered history" badge="branchable" tone="verified">
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
				Click any earlier step, then apply a legal move from the sandbox to branch from that
				point instead of mutating later history in place.
			</p>
		</SurfacePanel>
	</div>
</div>
