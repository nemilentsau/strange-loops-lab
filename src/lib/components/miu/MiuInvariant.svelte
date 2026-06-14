<script lang="ts">
	import { isValidMiuString } from '$lib/miu/core';
	import { countI } from '$lib/miu/invariants';
	import { shortestDerivation } from '$lib/miu/complexity';
	import { residueWheel, type WheelArrow } from '$lib/state/module1Proof';

	/**
	 * Reading 2 — the wall. The current string read as a residue on ℤ/k (the
	 * built-in invariant #I ≢ 0 mod 3) and a reachability check whose negative,
	 * when the invariant decides it, is verified rather than a search limit.
	 */
	let {
		currentString,
		invariantCandidate,
		reachTarget,
		onUpdateReachTarget
	}: {
		currentString: string;
		invariantCandidate: string;
		reachTarget: string;
		onUpdateReachTarget: (event: Event) => void;
	} = $props();

	const wheel = $derived(residueWheel(invariantCandidate));
	const trimmedTarget = $derived(reachTarget.trim());
	const reach = $derived(
		isValidMiuString(trimmedTarget) ? shortestDerivation(trimmedTarget) : null
	);
	const targetICount = $derived(isValidMiuString(trimmedTarget) ? countI(trimmedTarget) : 0);
	const currentResidue = $derived(wheel ? countI(currentString) % wheel.modulus : null);

	// Wheel geometry: dots on a circle, chords bowed apart by map family,
	// self-loops drawn outward. Carried over from the proof document.
	const WHEEL_R = 64;
	const WHEEL_C = 84;

	function dotAt(residue: number, modulus: number): { x: number; y: number } {
		const angle = -Math.PI / 2 + (2 * Math.PI * residue) / modulus;
		return { x: WHEEL_C + WHEEL_R * Math.cos(angle), y: WHEEL_C + WHEEL_R * Math.sin(angle) };
	}

	function labelAt(residue: number, modulus: number): { x: number; y: number } {
		const angle = -Math.PI / 2 + (2 * Math.PI * residue) / modulus;
		return {
			x: WHEEL_C + (WHEEL_R + 16) * Math.cos(angle),
			y: WHEEL_C + (WHEEL_R + 16) * Math.sin(angle) + 4
		};
	}

	function arrowPath(arrow: WheelArrow, modulus: number): string {
		const from = dotAt(arrow.from, modulus);

		if (arrow.from === arrow.to) {
			const ux = (from.x - WHEEL_C) / WHEEL_R;
			const uy = (from.y - WHEEL_C) / WHEEL_R;
			const ax = from.x + 6 * ux;
			const ay = from.y + 6 * uy;
			return `M ${ax} ${ay} a 7 7 0 1 1 ${0.5 + 2 * ux} ${0.5 + 2 * uy}`;
		}

		const to = dotAt(arrow.to, modulus);
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.hypot(dx, dy) || 1;
		const side = arrow.map === 'double' ? 1 : -1;
		const px = (-dy / length) * 14 * side;
		const py = (dx / length) * 14 * side;
		const startX = from.x + (dx / length) * 7;
		const startY = from.y + (dy / length) * 7;
		const endX = to.x - (dx / length) * 9;
		const endY = to.y - (dy / length) * 9;

		return `M ${startX} ${startY} Q ${(startX + endX) / 2 + px} ${(startY + endY) / 2 + py} ${endX} ${endY}`;
	}
</script>

<div class="reach">
	<p class="worksheet__label">Reachable?</p>
	<p class="query__ask">
		From <span class="query__from">{currentString.length > 14 ? currentString.slice(0, 13) + '…' : currentString}</span> — can
		<input
			class="query__input"
			type="text"
			aria-label="Target string"
			value={reachTarget}
			oninput={onUpdateReachTarget}
		/>
		be reached?
	</p>

	{#if !trimmedTarget}
		<p class="query__detail">Enter a target string.</p>
	{:else if !reach}
		<p class="query__detail">Not a MIU string — states start with M, then I and U.</p>
	{:else if reach.outcome === 'unreachable-invariant'}
		<p class="query__verdict">
			<span class="query__stamp" aria-hidden="true">✗</span>
			{trimmedTarget} is not a theorem.
		</p>
		<p class="query__detail">
			#I({trimmedTarget}) = {targetICount} ≡ 0 (mod 3); no theorem has residue 0. Excluded by the
			invariant — not the limit of a search.
		</p>
	{:else if reach.outcome === 'found'}
		<p class="query__verdict">
			<span class="query__stamp" aria-hidden="true">✓</span>
			{trimmedTarget} is reachable.
		</p>
		<p class="query__detail">Shortest derivation: {reach.length} step{reach.length === 1 ? '' : 's'}.</p>
	{:else}
		<p class="query__detail">
			No derivation found within the search horizon ({reach.stoppedBy === 'depth'
				? `depth ${reach.maxDepth}`
				: `${reach.maxNodes} strings`}). Reachability is open beyond it — this is a bound, not a
			verdict.
		</p>
	{/if}
</div>

{#if wheel}
	<div class="inv">
		<p class="worksheet__label">Invariant · ℤ/{wheel.modulus}</p>
		<p class="inv__def">P(s): #I(s) ≢ 0 (mod {wheel.modulus})</p>

		<svg
			class="inv__wheel"
			width="168"
			height="168"
			viewBox="0 0 168 168"
			role="img"
			aria-label={`Residues mod ${wheel.modulus}: allowed residues filled, residue 0 forbidden; doubling and minus-three arrows; the current residue ${currentResidue} ringed.`}
		>
			<defs>
				<marker id="inv-head" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
					<path d="M0,0.5 L7,4 L0,7.5" fill="none" stroke="var(--line-strong)" stroke-width="1.5" />
				</marker>
			</defs>

			{#each wheel.arrows as arrow (`${arrow.map}:${arrow.from}`)}
				<path
					class="wheel-arrow"
					class:wheel-arrow--minus3={arrow.map === 'minus3'}
					d={arrowPath(arrow, wheel.modulus)}
					marker-end="url(#inv-head)"
				/>
			{/each}

			{#each wheel.allowed as isAllowed, residue (residue)}
				{@const dot = dotAt(residue, wheel.modulus)}
				{@const label = labelAt(residue, wheel.modulus)}
				<circle
					class="wheel-dot"
					class:wheel-dot--forbidden={!isAllowed}
					class:wheel-dot--now={residue === currentResidue}
					cx={dot.x}
					cy={dot.y}
					r="5"
				/>
				<text
					class="wheel-label"
					class:wheel-label--forbidden={!isAllowed}
					x={label.x}
					y={label.y}>{residue}</text
				>
			{/each}
		</svg>

		<p class="wheel-legend">⟶ doubling (R2) · ⇢ minus 3 (R3) · filled = allowed · ◯ current</p>
		<p class="inv__caption">
			R2 doubles (k → 2k); R3 removes three (k → k−3, fixed mod {wheel.modulus}). The allowed set is
			closed — the inductive step, on ℤ/{wheel.modulus}.
		</p>
		<p class="inv__now">now: #I = {countI(currentString)} ≡ {currentResidue}</p>
	</div>
{/if}
