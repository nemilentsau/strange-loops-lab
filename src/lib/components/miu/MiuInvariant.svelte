<script lang="ts">
	import { countI } from '$lib/miu/invariants';
	import { residueWheel, type WheelArrow } from '$lib/state/module1Proof';

	/**
	 * Movement 2 — why some strings are not theorems. The displayed induction,
	 * the four rules as a model on ℤ/3, the class of non-theorems, and the
	 * candidates that fail. The current string's residue rides on the wheel.
	 */
	let { currentString, invariantCandidate }: { currentString: string; invariantCandidate: string } =
		$props();

	const wheel = $derived(residueWheel(invariantCandidate));
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

	// Candidates of the same form that fail: even moduli die to doubling, odd
	// moduli other than 3 die to minus-three, and only mod 3 survives both.
	const CANDIDATES = [
		{ form: '#I ≢ 0 (mod 2)', holds: false, why: 'R2 doubles 1 → 0 — every even modulus dies to doubling.' },
		{ form: '#I ≢ 0 (mod 4)', holds: false, why: 'R2 doubles 2 → 0.' },
		{ form: '#I ≢ 0 (mod 5)', holds: false, why: 'odd, so R2 is fine — but R3 subtracts 3 → 0.' },
		{ form: '#I ≢ 0 (mod 3)', holds: true, why: 'odd (R2 stays a unit) and 3 ≡ 0 (R3 fixes residues) — the only modulus surviving both.' }
	];
</script>

<div class="proof">Proof, by structural induction on derivations.
Define  P(s):  #I(s) ≢ 0 (mod 3).
Base:   MI has one I, so P(MI).
Step:   R2:  k → 2k      (2 is a unit mod 3, so ≢ 0 stays ≢ 0)
        R3:  k → k − 3   (residue unchanged)
        R1, R4: k unchanged.
Hence every theorem satisfies P. MU has #I = 0, so MU is not a theorem.</div>

{#if wheel}
	<div class="wheel-wrap">
		<svg
			width="168"
			height="168"
			viewBox="0 0 168 168"
			role="img"
			aria-label={`The four rules as a model on ℤ/${wheel.modulus}: residue 0 forbidden, the rest allowed; doubling and minus-three arrows; the current string's residue ${currentResidue} ringed.`}
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
				<text class="wheel-label" class:wheel-label--forbidden={!isAllowed} x={label.x} y={label.y}
					>{residue}</text
				>
			{/each}
		</svg>
		<div class="wheel-side">
			<p class="wheel-legend">⟶ doubling (R2) · ⇢ minus 3 (R3) · filled = a theorem's residue · ◯ your current string</p>
			<p class="wheel-caption">
				The four rules act on ℤ/{wheel.modulus}. Doubling carries the allowed residues to each other;
				minus-three fixes them. The set {'{'}1, 2{'}'} is closed — nothing the rules do escapes it, and
				0 is never entered. That closure is the inductive step.
			</p>
			<p class="inv__now">your current string: #I = {countI(currentString)} ≡ {currentResidue} (mod {wheel.modulus})</p>
		</div>
	</div>
{/if}

<div class="nontheorems">
	<p class="worksheet__label">Is MU the only one?</p>
	<p class="nontheorems__def">non-theorems = { '{' } M x : x ∈ {'{'}I, U{'}'}⁺, #I(x) ≡ 0 (mod 3) { '}' }</p>
	<p class="nontheorems__list">MU · MUU · MIII · MUIIIU · MIIIUUU · …</p>
	<p class="nontheorems__note">
		The invariant proves one direction: a theorem must have #I ≢ 0. The converse — that every such
		string is a theorem — is a construction, not the invariant; the oracle confirms it string by
		string.
	</p>
</div>

<div class="candidates-wrap">
	<p class="worksheet__label">Other candidates fail</p>
	<div class="candidates">
		{#each CANDIDATES as candidate (candidate.form)}
			<div class="candidate" data-holds={candidate.holds}>
				<span class="candidate__stamp" aria-hidden="true">{candidate.holds ? '✓' : '✗'}</span>
				<span class="candidate__form">{candidate.form}</span>
				<span class="candidate__why">{candidate.why}</span>
			</div>
		{/each}
	</div>
</div>
