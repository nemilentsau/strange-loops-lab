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
