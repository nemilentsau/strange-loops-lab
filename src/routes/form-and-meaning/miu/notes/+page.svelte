<svelte:head>
	<title>Strange Loops Lab | MIU notes</title>
</svelte:head>

<nav class="instrument-breadcrumb" aria-label="Instrument location">
	<a href="/">Strange Loops Lab</a>
	<span aria-hidden="true">/</span>
	<a href="/#form-and-meaning">Form and meaning</a>
	<span aria-hidden="true">/</span>
	<a href="/form-and-meaning/miu">MIU</a>
	<span aria-hidden="true">/</span>
	<span aria-current="page">Notes</span>
</nav>

<header class="instrument-header">
	<h1>MIU system — notes</h1>
	<p>Full statements and proofs behind the instrument</p>
</header>

<div class="notes">
	<div class="notes-front">
		<p class="microlabel">What is checked, what is cited</p>
		<p>
			Two kinds of statement appear below. Statements about this machine — the characterization
			of Th(MIU), the invariant, the program code, the search bounds — are implemented and
			mechanically checked in the instrument's source (<span class="o">src/lib/miu</span>).
			Classical theorems — Kraft's inequality, the invariance theorem, Chaitin's incompleteness
			— are cited with sources and proved elsewhere; nothing this machine does establishes them.
		</p>
	</div>

	<section class="notes-section" id="the-system">
		<h2>§0 The system</h2>

		<p class="lede">
			The MIU system is the opening formal system of <i>Gödel, Escher, Bach</i>. As mathematics
			it is a string rewriting system, and the questions the instrument asks of it —
			reachability, invariants, description length — are the standard questions about such
			systems, small enough here to be answered completely.
		</p>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 0.1</b> (strings).</span> A MIU string is
				<span class="o">M</span> followed by a nonempty word over {'{'}<span class="o">I</span>,
				<span class="o">U</span>{'}'} — the regular language <span class="o">M[IU]⁺</span>.
				Write <span class="mv">t</span> for the <i>tail</i> (everything after
				<span class="o">M</span>), <span class="mv">I(s)</span> for the number of
				<span class="o">I</span>s in <span class="mv">s</span>, and <span class="mv">U(s)</span>
				for the number of <span class="o">U</span>s.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 0.2</b> (rules).</span> Four rules, each a partial
				map on strings:
			</p>
			<pre class="displaybox">R1   xI  → xIU    append U; applies iff s ends in I; one site
R2   Mx  → Mxx    double the tail; always applies; one site
R3   III → U      replace an occurrence; one site per occurrence of III in the tail
R4   UU  → ∅      delete an occurrence; one site per occurrence of UU in the tail</pre>
			<p>
				R1 and R2 are anchored — at the end of the string and at the whole tail. R3 and R4
				apply at any occurrence, and the choice of occurrence is the <i>site</i>. This choice
				is what the program code of §3 pays bits for.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 0.3</b> (derivations and theorems).</span>
				<span class="mv">s</span> <span class="mv">⇒</span> <span class="mv">s′</span> iff some
				rule applied at some site sends <span class="mv">s</span> to <span class="mv">s′</span>.
				A derivation is a finite sequence <span class="o">MI</span> =
				<span class="mv">s₀</span> <span class="mv">⇒</span> <span class="mv">s₁</span>
				<span class="mv">⇒</span> ⋯ <span class="mv">⇒</span> <span class="mv">sₙ</span>. The
				theorems are Th(MIU) = {'{'}<span class="mv">s</span> : <span class="o">MI</span>
				<span class="mv">⇒*</span> <span class="mv">s</span>{'}'}. The decision problem: given
				<span class="mv">s</span>, is <span class="mv">s</span> <span class="mv">∈</span>
				Th(MIU)?
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 0.4 (where this sits).</span> This is a semi-Thue system
				with anchored rules; the decision problem is reachability in the infinite directed
				graph whose vertices are strings and whose edges are rule applications. For semi-Thue
				systems in general, reachability is undecidable (Post 1947; Markov 1947). MIU is a
				fixed, small system for which it is decidable — §1 proves this by exhibiting the
				deciding residue and the witness construction.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 0.5 (well-formedness is preserved).</span> Each rule maps
				MIU strings to MIU strings, with one apparent exception: R4 applied to
				<span class="o">MUU</span> would leave a bare <span class="o">M</span> with empty tail.
				No derivation reaches <span class="o">MUU</span> — its <span class="o">I</span>-count
				is 0 ≡ 0 (mod 3), which §2 shows is unreachable — so the exception never arises.
				Definition 0.1's nonempty tail is an invariant, not an assumption.
			</p>
		</div>
	</section>

	<section class="notes-section" id="theoremhood">
		<h2>§1 Theoremhood and construction</h2>

		<p class="lede">
			The instrument's verdict is instant because theoremhood is decided by a residue, and its
			constructed witness is produced by an explicit algorithm, not a search. This section
			proves both halves.
		</p>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 1.1</b> (characterization).</span>
				<span class="mv">s</span> <span class="mv">∈</span> Th(MIU) ⟺ <span class="mv">s</span>
				is a MIU string and <span class="mv">I(s)</span> ≢ 0 (mod 3).
			</p>
			<p>
				The forward direction is Theorem 2.3, the invariant. The converse occupies the rest of
				this section: given a MIU string <span class="mv">s</span> =
				<span class="o">M</span>·<span class="mv">t</span> with <span class="mv">I(s)</span> ≢
				0 (mod 3), construct a derivation.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 1.2</b> (expanded length).</span>
				<span class="mv">E(s)</span> = <span class="mv">I(s)</span> +
				3·<span class="mv">U(s)</span> — the <span class="o">I</span>-count the target would
				have if every <span class="o">U</span> in its tail were re-expanded to
				<span class="o">III</span>. Since 3·<span class="mv">U(s)</span> ≡ 0 (mod 3),
				<span class="mv">E(s)</span> ≡ <span class="mv">I(s)</span> ≢ 0 (mod 3).
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Lemma 1.3</b> (a matching power of two exists).</span> For
				every <span class="mv">E</span> ≥ 1 with <span class="mv">E</span> mod 3 ∈ {'{'}1,
				2{'}'} there is a <span class="mv">k</span> with <span class="mv">2ᵏ</span> ≥
				<span class="mv">E</span> and <span class="mv">2ᵏ</span> ≡ <span class="mv">E</span>
				(mod 3).
			</p>
			<p>
				<span class="leadin">Proof.</span> <span class="mv">2ᵏ</span> mod 3 is 1 for even
				<span class="mv">k</span> and 2 for odd <span class="mv">k</span>: it alternates. Take
				the least <span class="mv">j</span> with <span class="mv">2ʲ</span> ≥
				<span class="mv">E</span>; either <span class="mv">2ʲ</span> or
				<span class="mv">2ʲ⁺¹</span> has the required residue. ∎
			</p>
			<p>
				Note <span class="mv">2ᵏ</span> &lt; 4<span class="mv">E</span> for the chosen
				<span class="mv">k</span> — used in Corollary 1.5.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Construction 1.4</b> (expand–double–contract).</span> With
				<span class="mv">E</span> = <span class="mv">E(s)</span>, <span class="mv">k</span>
				from Lemma 1.3, <span class="mv">D</span> = <span class="mv">2ᵏ</span> −
				<span class="mv">E</span> ≡ 0 (mod 3), and <span class="mv">m</span> =
				<span class="mv">D</span>/3, the count of surplus <span class="o">III</span>-triples:
			</p>
			<pre class="displaybox">Stage A — grow.      k applications of R2 take MI to M I^(2^k).

Stage B — shed.      Convert surplus triples (sites past position E) to U by R3.
                       m even:  m conversions leave M I^E U^m; then m/2 applications
                                of R4 delete the U's in pairs.
                       m odd:   m−1 conversions leave one triple: M I^E U^(m−1) III.
                                R1 appends U (the string ends in I); one final R3
                                turns the triple into U, giving M I^E U^(m+1); then
                                (m+1)/2 applications of R4 delete the U's in pairs.
                     Both cases end at M I^E.

Stage C — contract.  Scan the target tail t left to right with a cursor. At each I,
                     advance. At each U, apply R3 at the cursor: the III standing
                     where the target wants U becomes U. Invariant: after processing
                     a prefix p of t, the string is M · p · I^E′, where E′ is the
                     expanded length of the unprocessed suffix. When the scan ends,
                     the string is M·t = s.</pre>
			<p>
				Two facts to check. Every move is legal when applied: Stage B's R1 requires a terminal
				<span class="o">I</span>, which the odd case has; Stage B's R4 sites and Stage C's R3
				sites exist by the displayed invariants. And the parity fix is necessary: R4 deletes
				<span class="o">U</span>s only in pairs, so an odd number of surplus
				<span class="o">U</span>s cannot be cleared without manufacturing one more.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Corollary 1.5</b> (an explicit upper bound).</span> The
				construction uses <span class="mv">k</span> doublings, then in Stage B exactly
				<span class="mv">m</span> conversions, at most one append, and
				⌈<span class="mv">m</span>/2⌉ deletions, then <span class="mv">U(s)</span> conversions
				in Stage C. With <span class="mv">E</span> = <span class="mv">E(s)</span>:
			</p>
			<pre class="displaybox">K_steps(s)  ≤  k + (3/2)m + U(s) + 2,   where  k ≤ ⌈log₂ E⌉ + 1  and  m &lt; E.</pre>
			<p>
				Since <span class="mv">E</span> ≤ 3|<span class="mv">s</span>|, the constructed
				derivation has length O(|<span class="mv">s</span>|). It makes no minimality claim;
				<span class="mv">K</span><sub>steps</sub> is defined and bounded in §3.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 1.6 (decidability).</span> Theorem 1.1 makes Th(MIU)
				decidable by inspection: validate the string, count <span class="o">I</span>s mod 3.
				The instrument's verdict never searches. Membership always has a finite witness — a
				derivation; what Theorem 1.1 adds is that non-membership is also decided, by the §2
				certificate rather than by any exhaustion of derivations.
			</p>
		</div>
	</section>

	<section class="notes-section" id="invariant">
		<h2>§2 The invariant and the characters of ℤ/3</h2>
	</section>

	<section class="notes-section" id="programs">
		<h2>§3 Programs and description length</h2>
	</section>

	<section class="notes-section" id="universality">
		<h2>§4 The passage to universality</h2>
	</section>
</div>
