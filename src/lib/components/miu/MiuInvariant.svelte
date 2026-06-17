<script lang="ts">
	/**
	 * Movement 2 — why some strings are not theorems. Result first (MU is
	 * unreachable), then the invariant that certifies it: a displayed induction,
	 * the residue class it excludes, and why modulus 3 specifically.
	 */
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

<p class="inv-notation">
	<span class="m">I(s)</span> = the number of <b>I</b>'s in <b>s</b>.
	<span class="m">r(s)</span> = <span class="m">I(s)</span> mod 3.
</p>

<div class="result">
	<p class="result__line">
		<span class="result__label">Result</span>
		<span>No derivation from <b>MI</b> reaches <b>MU</b>.</span>
	</p>
	<p class="result__line">
		<span class="result__label">Certificate</span>
		<span><span class="m">r(s)</span> is invariant under the four rules. Every theorem has
			<span class="m">r(s) &isin; {'{'}1, 2{'}'}</span>, while <span class="m">r(MU) = 0</span>.</span>
	</p>
</div>

<div class="inv-proof">
	<div class="inv-proof__row">
		<span class="inv-proof__label">Base</span>
		<p><span class="m">MI</span> has one <b>I</b>, so <span class="m">I(MI) = 1</span> and
			<span class="m">r(MI) = 1</span>.</p>
	</div>
	<div class="inv-proof__row inv-proof__row--step">
		<span class="inv-proof__label">Step</span>
		<div class="inv-rules">
			<div><span class="m">R1</span><span class="m">xI &rarr; xIU</span><span class="inv-rules__why">r unchanged</span></div>
			<div><span class="m">R2</span><span class="m">Mx &rarr; Mxx</span><span class="inv-rules__why">r: 1 and 2 swap</span></div>
			<div><span class="m">R3</span><span class="m">III &rarr; U</span><span class="inv-rules__why">I drops by 3, r unchanged</span></div>
			<div><span class="m">R4</span><span class="m">UU &rarr; &empty;</span><span class="inv-rules__why">r unchanged</span></div>
		</div>
	</div>
	<div class="inv-proof__row">
		<span class="inv-proof__label">Conclusion</span>
		<p><span class="m">{'{'}1, 2{'}'}</span> is closed under all four rules, so a derivation that starts
			there never reaches residue 0.</p>
	</div>
</div>

<div class="nontheorems">
	<p class="worksheet__label">Strings ruled out by the invariant</p>
	<p class="nontheorems__list">MU · MUU · MIII · MUIIIU · MIIIUUU · …</p>
	<p class="nontheorems__def">
		If <span class="m">I(s) &equiv; 0 (mod 3)</span>, then
		<span class="m">s &notin; Th(MIU)</span>.
	</p>
	<p class="nontheorems__note">
		The invariant proves the necessary condition: every theorem has residue 1 or 2. For valid
		MIU strings this condition is also sufficient, but that converse requires a separate
		construction.
	</p>
</div>

<div class="candidates-wrap">
	<p class="worksheet__label">Why modulus 3</p>
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
