<script lang="ts">
	import { countI } from '$lib/miu/invariants';

	/**
	 * Movement 2 — why some strings are not theorems. The displayed induction,
	 * the residue class excluded by the invariant, and the nearby candidates
	 * that fail.
	 */
	let { currentString }: { currentString: string } = $props();

	const modulus = 3;
	const currentICount = $derived(countI(currentString));
	const currentResidue = $derived(currentICount % modulus);

	// Candidates of the same form that fail: even moduli die to doubling, odd
	// moduli other than 3 die to minus-three, and only mod 3 survives both.
	const CANDIDATES = [
		{
			form: 'I(s) mod 2 is nonzero',
			holds: false,
			why: 'R2 can send residue 1 to residue 0.'
		},
		{ form: 'I(s) mod 4 is nonzero', holds: false, why: 'R2 can send residue 2 to residue 0.' },
		{ form: 'I(s) mod 5 is nonzero', holds: false, why: 'R3 subtracts 3, so residue 3 becomes 0.' },
		{
			form: 'I(s) mod 3 is 1 or 2',
			holds: true,
			why: 'R2 swaps 1 and 2; R1, R3, and R4 leave the residue fixed.'
		}
	];
</script>

<div class="invariant-notation">
	<div class="notation-row">
		<span class="notation-row__symbol">I(s)</span>
		<span>the number of letters <b>I</b> in the string <b>s</b>.</span>
	</div>
	<div class="notation-row">
		<span class="notation-row__symbol">r(s)</span>
		<span>I(s) modulo 3. The invariant is the condition <b>r(s) ∈ {'{'}1, 2{'}'}</b>.</span>
	</div>
</div>

<div class="proof">
	<div class="proof__claim">
		<span class="proof__label">Claim</span>
		<p>Every theorem <b>s</b> of the MIU system satisfies <b>r(s) ∈ {'{'}1, 2{'}'}</b>. Since
			<b>r(MU) = 0</b>, MU is not a theorem.</p>
		<p class="inv__now">current string {currentString}: I(s) = {currentICount}, so r(s) = {currentResidue}</p>
	</div>
	<div class="proof__steps">
		<div class="proof-step">
			<span class="proof-step__name">Base</span>
			<span><b>MI</b> has one <b>I</b>, so <b>I(MI) = 1</b> and <b>r(MI) = 1</b>.</span>
		</div>
		<div class="proof-step proof-step--rules">
			<span class="proof-step__name">Step</span>
			<div class="rule-preservation">
				<div><b>R1</b> <span>xI → xIU</span> <em>I(s) is unchanged.</em></div>
				<div><b>R2</b> <span>Mx → Mxx</span> <em>r = 1 and r = 2 are swapped.</em></div>
				<div><b>R3</b> <span>III → U</span> <em>I(s) decreases by 3, so r(s) is unchanged.</em></div>
				<div><b>R4</b> <span>UU → ∅</span> <em>I(s) is unchanged.</em></div>
			</div>
		</div>
		<div class="proof-step">
			<span class="proof-step__name">Conclusion</span>
			<span>The residues <b>{'{'}1, 2{'}'}</b> form a closed set for all four rules. A derivation that starts in that set cannot reach residue 0.</span>
		</div>
	</div>
</div>

<div class="nontheorems">
	<p class="worksheet__label">Is MU the only one?</p>
	<p class="nontheorems__def">strings excluded by this invariant = { '{' } s : s starts with M, I(s) mod 3 = 0 { '}' }</p>
	<p class="nontheorems__list">MU · MUU · MIII · MUIIIU · MIIIUUU · …</p>
	<p class="nontheorems__note">
		The invariant proves one direction: a theorem must have residue 1 or 2. The converse — that
		every string with residue 1 or 2 is a theorem — is a construction, not this invariant.
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
