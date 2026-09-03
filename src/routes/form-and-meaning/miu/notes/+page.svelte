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
		<p class="microlabel">The machine</p>
		<p>
			These notes read the MIU system as a machine: one axiom, four rules, nothing else. §0
			defines it. §§1–2 decide it: a string is a theorem iff its count of
			<span class="o">I</span>s is ≢ 0 (mod 3) — the construction of §1 witnesses membership,
			and the invariant of §2, re-derived in the characters of ℤ/3, certifies non-membership. §3
			takes the machine reading literally: a derivation is a program, the four rules are its
			instruction set, and the shortest program's length is a description length relative to
			this machine. §4 replaces the fixed machine with a universal one and marks where each
			argument breaks. Every result about MIU itself is proved here, on paper; the
			instrument's source (<span class="o">src/lib/miu</span>) computes each of them and its
			tests exercise them on examples. The classical theorems of §3 and §4 — Kraft's
			inequality, the invariance theorem, the non-computability of
			<span class="mv">K</span>, Chaitin's incompleteness — are cited with sources, not
			proved.
		</p>
	</div>

	<section class="notes-section" id="the-system">
		<h2>§0 The system</h2>

		<p class="lede">
			The MIU system is the opening formal system of <i>Gödel, Escher, Bach</i>. As mathematics
			it is a string rewriting system, and the questions the instrument asks about it —
			reachability, invariants, description length — are the standard questions about such
			systems. MIU is small enough that all of them can be answered completely.
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
				<span class="leadin">Remark 0.4 (where this sits).</span> This is a string rewriting
				system. R3 and R4 are semi-Thue rules, applying at any position; R1 and R2 are
				anchored, at the right end and at the whole tail, which a semi-Thue presentation
				simulates with end markers. The decision problem is reachability in the infinite
				directed graph whose vertices are strings and whose edges are rule applications. For
				semi-Thue systems in general, reachability is undecidable (Post 1947; Markov 1947).
				MIU is a fixed, small system for which it is decidable — §1 proves this by exhibiting
				the deciding residue and the witness construction.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 0.5 (well-formedness is preserved).</span> Each rule maps
				MIU strings to MIU strings, with one apparent exception: R4 applied to
				<span class="o">MUU</span> would leave a bare <span class="o">M</span> with empty tail.
				No derivation reaches <span class="o">MUU</span> — its <span class="o">I</span>-count
				is 0 ≡ 0 (mod 3), which §2 shows is unreachable — so the exception never arises, and
				every derivation keeps the tail nonempty.
			</p>
		</div>
	</section>

	<section class="notes-section" id="theoremhood">
		<h2>§1 Theoremhood and construction</h2>

		<p class="lede">
			Membership in Th(MIU) is decided by counting <span class="o">I</span>s, and a derivation
			witnessing it can be written down by an explicit algorithm. This section proves both:
			the characterization first, then the construction behind the instrument's witness.
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
				derivation has length O(|<span class="mv">s</span>|). No minimality is claimed;
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

		<div class="stmt">
			<p>
				<span class="leadin"><b>Corollary 1.7</b> (Th(MIU) is regular).</span> By Theorem 1.1,
				Th(MIU) = <span class="o">M[IU]⁺</span> ∩ {'{'}<span class="mv">s</span> :
				<span class="mv">I(s)</span> ≢ 0 (mod 3){'}'}, an intersection of two regular
				languages. A deterministic automaton with states start, 0, 1, 2 and a rejecting sink
				recognizes it: <span class="o">M</span> sends start to 0, <span class="o">I</span>
				advances the residue, <span class="o">U</span> holds it, and 1 and 2 accept. A
				nonempty tail is automatic, since 1 and 2 are entered only by reading an
				<span class="o">I</span>. The residue of §2 is the state of this automaton.
			</p>
			<p>
				For a rewriting system this is unusual. The theorem set of a finite semi-Thue system
				is computably enumerable, by listing derivations, and in general no better (Remark
				0.4); here it is recognized by a four-state machine.
			</p>
		</div>
	</section>

	<section class="notes-section" id="invariant">
		<h2>§2 The invariant and the characters of ℤ/3</h2>

		<p class="lede">
			The count of <span class="o">I</span>s mod 3 decides membership in Th(MIU). This section
			proves the invariant, shows why the modulus is 3 and no other, and re-derives the same
			fact in the language of characters — the form that generalizes to ℤ/<span class="mv"
			>p</span>.
		</p>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 2.1</b> (residue).</span> <span class="mv">r(s)</span>
				= <span class="mv">I(s)</span> mod 3 ∈ ℤ/3.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 2.2</b> (rule action on residues).</span> Each rule
				induces a map on ℤ/3:
			</p>
			<pre class="displaybox">R1   xI  → xIU    I-count unchanged      n ↦ n
R2   Mx  → Mxx    I-count doubles       n ↦ 2n
R3   III → U      I-count drops by 3    n ↦ n − 3 ≡ n
R4   UU  → ∅      I-count unchanged     n ↦ n</pre>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 2.3</b> (the invariant).</span> Every
				<span class="mv">s</span> <span class="mv">∈</span> Th(MIU) has
				<span class="mv">r(s)</span> ∈ {'{'}1, 2{'}'}; hence <span class="o">MU</span>
				<span class="mv">∉</span> Th(MIU).
			</p>
			<p>
				<span class="leadin">Proof.</span> Induction on derivation length.
				<span class="mv">r(</span><span class="o">MI</span><span class="mv">)</span> = 1. By
				2.2 each rule acts on residues as the identity or as <span class="mv">n</span> ↦
				2<span class="mv">n</span>; 2 is a unit mod 3, and {'{'}1, 2{'}'} is the orbit of 1
				under multiplication by 2 (1 ↦ 2 ↦ 4 ≡ 1), so {'{'}1, 2{'}'} is closed under both
				maps. <span class="mv">r(</span><span class="o">MU</span><span class="mv">)</span> = 0
				∉ {'{'}1, 2{'}'}. ∎
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 2.4 (what an invariant is).</span> The proof used only: a
				map from strings to a finite set, a compatible action of each rule on that set, and a
				subset containing the image of <span class="o">MI</span>, closed under the actions,
				missing the image of <span class="o">MU</span>. A reachability question about
				infinitely many strings is settled by a reachability question about three residues,
				checked by inspection. This is the general shape of a certificate for
				non-reachability.
			</p>
			<p>
				Here the certificate is also complete: by Theorem 1.1, Th(MIU) =
				<span class="mv">r</span><sup>−1</sup>{'{'}1, 2{'}'} on MIU strings, so reachability
				in MIU is exactly reachability in the three-vertex quotient graph. In general an
				invariant is sound and not complete — it certifies some non-theorems and is silent on
				the rest — and for a semi-Thue system with undecidable reachability no computable
				finite-valued invariant can be complete, since it would decide reachability
				(Theorem 4.3).
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 2.5</b> (why modulus 3).</span> The same scheme
				fails for the neighboring moduli: for each, some rule sends an admissible residue to
				the forbidden one, with a reachable witness.
			</p>
			<pre class="displaybox">mod 2:  R2 doubles 1 to 0.       Witness MI ⇒ MII        (1 ↦ 2 ≡ 0).
mod 4:  R2 doubles 2 to 0.       Witness MII ⇒ MIIII     (2 ↦ 4 ≡ 0).
mod 5:  R3 sends 3 to 0.         Witness M I⁸ ⇒ M U I⁵   (8 ≡ 3 ↦ 5 ≡ 0).</pre>
			<p>
				(<span class="o">MII</span> is reachable by one doubling,
				<span class="o">M I⁸</span> by three. Mod 2 also fails at R3: subtracting 3 flips
				parity.)
				R3 acts trivially exactly at the multiples of 3, and each of these moduli yields a
				certificate — mod 6 the admissible set is {'{'}1, 2, 4, 5{'}'} — refining the mod-3
				one; 3 is the coarsest. Doubling permutes {'{'}1, 2{'}'} because 2 is a unit mod 3.
				The instrument's "why modulus 3"
				panel computes such witnesses for any candidate <span class="o">count(I) mod k</span>
				invariant.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 2.6</b> (characters of ℤ/3).</span>
				<span class="mv">χ<sub>k</sub>(n)</span> = <span class="mv">ω<sup>kn</sup></span>,
				<span class="mv">ω</span> = <span class="mv">e<sup>2πi/3</sup></span>,
				<span class="mv">k</span> ∈ {'{'}0, 1, 2{'}'}. The characters form the dual group,
				isomorphic to ℤ/3. The table of exponents of <span class="mv">ω</span>:
			</p>
			<table class="notes-table">
				<thead>
					<tr>
						<th></th>
						<th><span class="mv">n</span> = 0</th>
						<th><span class="mv">n</span> = 1</th>
						<th><span class="mv">n</span> = 2</th>
					</tr>
				</thead>
				<tbody>
					<tr><th><span class="mv">χ₀</span></th><td>0</td><td>0</td><td>0</td></tr>
					<tr><th><span class="mv">χ₁</span></th><td>0</td><td>1</td><td>2</td></tr>
					<tr><th><span class="mv">χ₂</span></th><td>0</td><td>2</td><td>1</td></tr>
				</tbody>
			</table>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 2.7</b> (orthogonality and the indicator).</span>
				(1/3) Σ<sub><span class="mv">n</span></sub> <span class="mv">χ<sub>k</sub>(n)</span> =
				1 if <span class="mv">k</span> = 0, else 0 — a geometric sum of the cube roots of
				unity. Consequently
			</p>
			<pre class="displaybox">δ₀(n)  =  (χ₀(n) + χ₁(n) + χ₂(n)) / 3</pre>
			<p>
				is 1 at <span class="mv">n</span> = 0 and 0 elsewhere: the indicator of the forbidden
				residue is the uniform combination of characters. This identity is computed by
				<span class="o">deltaZeroFromCharacters</span> in the instrument's source and exercised by
				its tests.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 2.8</b> (pullback).</span> The doubling map
				<span class="mv">d(n)</span> = 2<span class="mv">n</span> pulls characters back to
				characters: <span class="mv">χ<sub>k</sub></span> ∘ <span class="mv">d</span> =
				<span class="mv">χ<sub>2k</sub></span>, so <span class="mv">d</span>* fixes
				<span class="mv">χ₀</span> and swaps <span class="mv">χ₁</span> ↔
				<span class="mv">χ₂</span>; the other three rules pull back to the identity. Every
				rule pullback permutes the character basis, and therefore fixes
				<span class="mv">δ₀</span>:
			</p>
			<pre class="displaybox">δ₀ ∘ d  =  (1/3) Σ χ₂ₖ  =  δ₀</pre>
			<p>
				Theorem 2.3 restated: the forbidden-set indicator is character-uniform, and
				character-uniform functions are invariant under every rule.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 2.9 (why this machinery).</span> For a three-element group
				everything above is checkable by hand, and the character formulation proves nothing
				the induction did not. It is here because it is the form that scales: for a shallow
				transformer trained on addition mod <span class="mv">p</span>, the measured Fourier
				structure of the learned embeddings is an expansion in exactly these characters of
				ℤ/<span class="mv">p</span> — a measured result of the grokking literature, not a
				theorem. The <a href="/form-and-meaning/pq">pq instrument</a> will set that measured
				table against this built one.
			</p>
		</div>
	</section>

	<section class="notes-section" id="programs">
		<h2>§3 Programs and description length</h2>

		<p class="lede">
			A derivation is a finite record of choices — which rule, and where. Read the record as a
			program: the axiom <span class="o">MI</span> is the input, each rule application is an
			instruction, the final string is the output. The machine running these programs is
			fixed, and its entire instruction set is R1–R4. The length of the shortest program for
			<span class="mv">s</span> is then a description length of <span class="mv">s</span>
			relative to this machine. This section gives the exact code, says why it is built the
			way it is, and proves what bounding each minimum costs.
		</p>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 3.1</b> (two costs).</span> For a derivation
				<span class="mv">d</span> of <span class="mv">s</span>: steps(<span class="mv">d</span>)
				is its number of moves; bits(<span class="mv">d</span>) is the length of its encoding
				under Definition 3.2. <span class="mv">K</span><sub>steps</sub><span class="mv">(s)</span>
				= min steps(<span class="mv">d</span>) and
				<span class="mv">K</span><sub>bits</sub><span class="mv">(s)</span> = min
				bits(<span class="mv">d</span>), both over derivations of <span class="mv">s</span>.
				Both are description lengths relative to this fixed machine; neither is Kolmogorov
				complexity (§4).
			</p>
		</div>

		<div class="stmt">
			<p><span class="leadin"><b>Definition 3.2</b> (the program code).</span></p>
			<pre class="displaybox">program  =  0 · instr₁ ⋯ instrₙ · 000

instr    =  opcode · site
opcode   =  R1 ↦ 001   R2 ↦ 010   R3 ↦ 011   R4 ↦ 100     (000 reserved: halt)
site     =  empty if the rule has ≤ 1 legal site in the current string;
            otherwise the site's ordinal in ⌈log₂ c⌉ bits, c = number of legal sites</pre>
			<p>
				The empty derivation of <span class="o">MI</span> encodes as
				<span class="o">0·000</span> — 4 bits.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 3.3</b> (executable decodability).</span> The code
				is uniquely decodable by a decoder that runs the machine. Starting at
				<span class="o">MI</span>, read 3 bits; <span class="o">000</span> halts; otherwise
				the opcode names a rule, the current string determines the site count
				<span class="mv">c</span> and hence the selector width, so the decoder reads exactly
				the right number of bits, applies the move, and repeats. The selector width is a
				function of decoder state, not of the bitstream: the code is prefix-free conditional
				on the machine. This is what "executable" means here: the decoder needs no delimiters
				and no table of the reachability graph, only the four rules.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 3.4 (why this code).</span> Four design facts. (i) The
				opcode block is a fixed-length prefix code on five words — four rules and halt — and
				reserving <span class="o">000</span> for halt is what makes the program
				self-delimiting. (ii) The site selector charges ⌈log₂ <span class="mv">c</span>⌉ bits,
				the information cost of a <span class="mv">c</span>-way choice up to the less-than-one
				bit lost to rounding; fixed-width words of that length over <span class="mv">c</span>
				symbols satisfy Kraft's inequality Σ 2<sup>−ℓ</sup> ≤ 1 (Kraft 1949). (iii) Rules with
				a forced site cost zero selector bits, so an R2 doubling always costs exactly 3 bits —
				this is why structured targets compress. (iv) The leading flag bit makes the program
				one branch of a two-branch code whose other branch is Definition 3.5, so program and
				literal compete inside a single prefix code and their lengths are comparable.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 3.5</b> (the literal branch).</span>
			</p>
			<pre class="displaybox">literal  =  1 · γ(|t|) · t          one bit per tail symbol; M implicit

L_literal(s)  =  1 + (2⌊log₂ |t|⌋ + 1) + |t|</pre>
			<p>
				γ is the Elias gamma code, |γ(<span class="mv">n</span>)| = 2⌊log₂
				<span class="mv">n</span>⌋ + 1 (Elias 1975) — a self-delimiting code for the length,
				so the literal needs no terminator.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 3.6</b> (the two minima are different optima).</span>
				<span class="mv">K</span><sub>steps</sub> minimizes move count — computed by
				breadth-first search with unit edge costs. <span class="mv">K</span><sub>bits</sub>
				minimizes total instruction bits — computed by Dijkstra's algorithm with edge cost 3 +
				selector width. Every instruction costs at least 3 bits, so
			</p>
			<pre class="displaybox">K_bits(s)  ≥  3 · K_steps(s) + 4,</pre>
			<p>
				with equality iff some stepwise-shortest derivation pays no site bits. Worked
				comparison, computed by the engine; a site selector is written [·] after its opcode:
			</p>
			<table class="notes-table">
				<thead>
					<tr>
						<th><span class="mv">s</span></th>
						<th><span class="mv">L</span><sub>literal</sub></th>
						<th><span class="mv">K</span><sub>steps</sub></th>
						<th><span class="mv">K</span><sub>bits</sub></th>
						<th>shortest program</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="o">MI</span></td>
						<td>3</td>
						<td>0</td>
						<td>4</td>
						<td><span class="o">0·000</span></td>
					</tr>
					<tr>
						<td><span class="o">MIU</span></td>
						<td>6</td>
						<td>1</td>
						<td>7</td>
						<td><span class="o">0·001·000</span></td>
					</tr>
					<tr>
						<td><span class="o">MUI</span></td>
						<td>6</td>
						<td>3</td>
						<td>14</td>
						<td><span class="o">0·010·010·011[0]·000</span></td>
					</tr>
					<tr>
						<td><span class="o">M I¹⁶</span></td>
						<td>26</td>
						<td>4</td>
						<td>16</td>
						<td><span class="o">0·010·010·010·010·000</span></td>
					</tr>
					<tr>
						<td><span class="o">MUUI</span></td>
						<td>7</td>
						<td>10</td>
						<td>40</td>
						<td>ten instructions, six selector bits</td>
					</tr>
				</tbody>
			</table>
			<p>
				In <span class="o">MUI</span>'s program the R3 instruction pays one site bit — ordinal
				0 of 2 sites in <span class="o">MIIII</span> — and the literal beats every program:
				three moves cost more bits than naming two tail symbols. For
				<span class="o">M I¹⁶</span> four doublings undercut the literal by ten bits. For
				<span class="o">MUUI</span> the literal wins by 33: the shortest derivation passes
				through <span class="o">M I⁸</span> and back down, four of its ten instructions
				paying selectors. Structure compresses; arbitrary strings do not.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 3.7</b> (what bounds cost).</span> Any exhibited
				derivation <span class="mv">d</span> of <span class="mv">s</span> proves
				<span class="mv">K</span><sub>steps</sub><span class="mv">(s)</span> ≤
				steps(<span class="mv">d</span>) and
				<span class="mv">K</span><sub>bits</sub><span class="mv">(s)</span> ≤
				bits(<span class="mv">d</span>): an upper bound costs one witness. A lower bound
				<span class="mv">K</span><sub>steps</sub><span class="mv">(s)</span> &gt;
				<span class="mv">d</span> asserts that all derivations of length ≤
				<span class="mv">d</span> miss <span class="mv">s</span>, and costs exhaustion.
			</p>
			<p>
				<span class="leadin">Proof (the lower-bound argument, as implemented).</span> Write
				<span class="mv">B<sub>f</sub>(d)</span> for the set of strings at rule distance ≤
				<span class="mv">d</span> from <span class="o">MI</span> and
				<span class="mv">B<sub>b</sub>(d)</span> for the set at distance ≤
				<span class="mv">d</span> from <span class="mv">s</span> under the exact rule
				preimages. The search computes both balls layer by layer. Suppose
				<span class="mv">B<sub>f</sub>(d<sub>f</sub>)</span> ∩
				<span class="mv">B<sub>b</sub>(d<sub>b</sub>)</span> = ∅, and let
				<span class="mv">s₀</span> ⇒ ⋯ ⇒ <span class="mv">s<sub>n</sub></span> =
				<span class="mv">s</span> be a derivation with <span class="mv">n</span> ≤
				<span class="mv">d<sub>f</sub></span> + <span class="mv">d<sub>b</sub></span>. Put
				<span class="mv">i</span> = min(<span class="mv">n</span>,
				<span class="mv">d<sub>f</sub></span>). Then <span class="mv">s<sub>i</sub></span>
				∈ <span class="mv">B<sub>f</sub>(d<sub>f</sub>)</span>, and
				<span class="mv">n</span> − <span class="mv">i</span> ≤
				<span class="mv">d<sub>b</sub></span> puts <span class="mv">s<sub>i</sub></span> ∈
				<span class="mv">B<sub>b</sub>(d<sub>b</sub>)</span>: a contradiction. Each ball is
				finite, because each string admits finitely many moves and finitely many preimages,
				so completing a layer is a finite computation and each reported bound is proved. ∎
			</p>
			<p>
				An exhausted search therefore reports a bracket <span class="mv">d</span> &lt;
				<span class="mv">K</span><sub>steps</sub><span class="mv">(s)</span> ≤
				<span class="mv">c</span>, with <span class="mv">d</span> from the argument above and
				<span class="mv">c</span> from the constructed witness of §1. §4 turns on one property
				of this proof: the exhaustion terminates because the search space per depth is finite
				and enumerable.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Proposition 3.8</b> (a lower bound without exhaustion).</span>
				With <span class="mv">E</span> the expanded length of Definition 1.2, every theorem
				<span class="mv">s</span> satisfies
			</p>
			<pre class="displaybox">K_steps(s)  ≥  ⌈ log₂ ((E(s) + 2) / 3) ⌉.</pre>
			<p>
				<span class="leadin">Proof.</span> Each rule changes <span class="mv">E</span> by a
				fixed amount:
			</p>
			<pre class="displaybox">R1   E ↦ E + 3        R2   E ↦ 2E        R3   E ↦ E        R4   E ↦ E − 6</pre>
			<p>
				Every MIU string has <span class="mv">E</span> ≥ 1, so in all four cases
				<span class="mv">E(s′)</span> ≤ 2<span class="mv">E(s)</span> + 2, i.e.
				<span class="mv">E(s′)</span> + 2 ≤ 2(<span class="mv">E(s)</span> + 2). From
				<span class="mv">E(</span><span class="o">MI</span><span class="mv">)</span> + 2 = 3,
				induction along a derivation gives <span class="mv">E(s<sub>n</sub>)</span> ≤
				3·2<sup><span class="mv">n</span></sup> − 2. Solve for <span class="mv">n</span>. ∎
			</p>
			<p>
				The bound is weak — 3 against the true 4 for <span class="o">M I¹⁶</span>, 2 against
				10 for <span class="o">MUUI</span> — but it is certified by a computable potential
				and costs no search. Theorem 3.7 is therefore about tight lower bounds: exhaustion is
				what a bound better than any potential argument costs. The same shape recurs in §4,
				where counting programs gives a free bound for most strings and for no specific one.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Corollary 3.9</b> (the bit bracket).</span> When the step
				search halts with completed depth <span class="mv">d</span>, Proposition 3.6 turns
				the step bracket into a bit bracket:
			</p>
			<pre class="displaybox">3d + 7  ≤  K_bits(s)  ≤  bits(d_c),      d_c the derivation of Construction 1.4.</pre>
			<p>
				The bit search certifies its own floor independently of the step bracket. Dijkstra's
				algorithm expands strings in nondecreasing program cost, so when the node budget stops
				it, every string not yet expanded costs at least the cheapest one still queued, and
				any program for <span class="mv">s</span> passes through such a string. The reported
				floor is that cost plus the four framing bits. The two floors are not comparable in
				general; either is a proved lower bound.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Corollary 3.10</b> (both minima are computable).</span>
				<span class="mv">K</span><sub>steps</sub> and <span class="mv">K</span><sub>bits</sub>
				are computable functions on Th(MIU).
			</p>
			<p>
				<span class="leadin">Proof.</span> Corollary 1.5 gives an explicit
				<span class="mv">c</span> with <span class="mv">K</span><sub>steps</sub><span
					class="mv">(s)</span> ≤ <span class="mv">c</span>; the derivations of length ≤
				<span class="mv">c</span> are finitely many, since each string admits finitely many
				moves, and enumerating them finds the minimum. For
				<span class="mv">K</span><sub>bits</sub>, the constructed derivation gives a bit
				ceiling, every instruction costs at least 3 bits, and the derivations under that
				ceiling are again finitely many. ∎
			</p>
			<p>
				So every exhausted verdict in the instrument is a resource limit — the node and depth
				bounds of the search — and never a logical one: with enough time both minima are
				computed exactly. This is the statement §4 negates.
			</p>
		</div>
	</section>

	<section class="notes-section" id="universality">
		<h2>§4 The passage to universality</h2>

		<p class="lede">
			Everything above happened on a machine with four rules and one axiom. This section
			states what changes when the machine becomes universal — the results the instrument's
			coda names — and marks the exact point where each MIU argument breaks.
		</p>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Definition 4.1</b> (Kolmogorov complexity).</span> A universal
				machine <span class="mv">U</span> takes any finite binary program and runs it;
				<span class="mv">K<sub>U</sub>(s)</span> is the length of the shortest program whose
				output is <span class="mv">s</span> (Solomonoff 1964; Kolmogorov 1965; Chaitin 1966).
				Programs are taken self-delimiting, as in Proposition 3.3, so
				<span class="mv">K<sub>U</sub></span> is prefix complexity (Levin 1974; Chaitin 1975).
				Plain complexity, defined without the prefix condition, differs from it by
				O(log |<span class="mv">s</span>|); nothing below depends on the distinction.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 4.2</b> (invariance; cited).</span> For universal
				<span class="mv">U</span> and any machine <span class="mv">V</span> there is a
				constant <span class="mv">c<sub>V</sub></span> with
				<span class="mv">K<sub>U</sub>(s)</span> ≤ <span class="mv">K<sub>V</sub>(s)</span> +
				<span class="mv">c<sub>V</sub></span> for all <span class="mv">s</span>. In particular
				<span class="mv">K</span><sub>bits</sub> bounds <span class="mv">K<sub>U</sub></span>
				from above up to a constant: a universal machine can simulate the four-rule decoder of
				Proposition 3.3. Description length is machine-independent up to O(1), and this
				machine-independent quantity is Kolmogorov complexity. What does not transfer:
				<span class="mv">K<sub>U</sub></span> is defined for every string, while
				<span class="mv">K</span><sub>bits</sub> exists only for MIU theorems.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 4.3</b> (reachability becomes halting; cited).</span>
				For a finite semi-Thue system <span class="mv">S</span> with axiom
				<span class="mv">a</span>, Th(<span class="mv">S</span>) = {'{'}<span class="mv"
				>s</span> : <span class="mv">a</span> ⇒* <span class="mv">s</span>{'}'} is computably
				enumerable, by listing derivations. There are finite <span class="mv">S</span> for
				which it is not decidable (Post 1947; Markov 1947). For a universal machine
				<span class="mv">U</span> the halting set {'{'}<span class="mv">p</span> :
				<span class="mv">U(p)</span> halts{'}'} is computably enumerable and not decidable
				(Turing 1936); Post's theorem is proved by reducing the one to the other.
			</p>
			<p>
				Where the MIU argument breaks: Theorem 2.3 rested on a computable map to a finite
				set, commuting with the rules and separating Th from its complement. For such an
				<span class="mv">S</span> no such map exists — it would decide
				Th(<span class="mv">S</span>). Complete residue certificates exist only where
				reachability was decidable already. Note what is undecidable at
				<span class="mv">U</span>: every string is the output of some program, so the
				question is never whether <span class="mv">s</span> has a program, but whether a
				given program halts — equivalently, whether <span class="mv">s</span> has a program
				of length ≤ <span class="mv">n</span> (Theorem 4.4).
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 4.4</b> (<span class="mv">K<sub>U</sub></span> is not
				computable; cited).</span> The function <span class="mv">s</span> ↦
				<span class="mv">K<sub>U</sub>(s)</span> is not computable. The set
				{'{'}(<span class="mv">s</span>, <span class="mv">n</span>) :
				<span class="mv">K<sub>U</sub>(s)</span> ≤ <span class="mv">n</span>{'}'} is
				computably enumerable and not decidable (Kolmogorov 1965; Zvonkin–Levin 1970).
			</p>
			<p>
				<span class="leadin">Proof sketch.</span> If <span class="mv">K<sub>U</sub></span>
				were computable, the program "print the first string, in length-lexicographic order,
				with <span class="mv">K<sub>U</sub>(s)</span> &gt; <span class="mv">n</span>" would
				describe a string of complexity greater than <span class="mv">n</span> in log
				<span class="mv">n</span> + O(1) bits — below <span class="mv">n</span> for large
				<span class="mv">n</span>. ∎
			</p>
			<p>
				Where the MIU argument breaks: Corollary 3.10. A ceiling still exists —
				<span class="mv">K<sub>U</sub>(s)</span> ≤ |<span class="mv">s</span>| + O(1), by the
				literal program — but exhausting the programs beneath it asks of each one whether it
				halts. The finite enumeration behind Corollary 3.10 has no analogue.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin"><b>Theorem 4.5</b> (Chaitin's incompleteness; cited).</span> For
				each sound, computably axiomatized theory <span class="mv">T</span> able to state
				facts <span class="mv">K<sub>U</sub>(s)</span> &gt; <span class="mv">n</span>, there
				is a constant <span class="mv">c<sub>T</sub></span> such that <span class="mv">T</span>
				proves no true statement of the form <span class="mv">K<sub>U</sub>(s)</span> &gt;
				<span class="mv">c<sub>T</sub></span> — although all but finitely many strings satisfy
				such bounds (Chaitin 1974).
			</p>
			<p>
				<span class="leadin">Proof sketch.</span> A program that searches
				<span class="mv">T</span>'s theorems for the first proof of some
				<span class="mv">K<sub>U</sub>(s)</span> &gt; <span class="mv">c<sub>T</sub></span>
				and prints that <span class="mv">s</span> is itself a description of
				<span class="mv">s</span>, of length about log <span class="mv">c<sub>T</sub></span>
				plus a constant — below <span class="mv">c<sub>T</sub></span> for large
				<span class="mv">c<sub>T</sub></span>, contradicting soundness. ∎
			</p>
			<p>
				Where the MIU argument breaks: Theorem 3.7's lower bounds were proved by finite
				exhaustion of a finitely-branching search. Theorem 4.4 removes the algorithm;
				Chaitin's theorem removes the proofs: above <span class="mv">c<sub>T</sub></span> no
				lower bound is provable in <span class="mv">T</span>, by any method, although almost
				every string satisfies one.
			</p>
		</div>

		<div class="stmt">
			<p>
				<span class="leadin">Remark 4.6 (what survives).</span> Upper bounds. Exhibiting a
				program still proves <span class="mv">K<sub>U</sub>(s)</span> ≤
				|<span class="mv">p</span>|, at any machine — one witness, no exhaustion. The
				asymmetry of Theorem 3.7 holds at every machine; MIU is small enough that both sides
				of it can be computed.
			</p>
			<p>
				These statements are the instrument's coda made precise. They are theorems about
				other machines, cited here, proved elsewhere; nothing on this page depends on them.
			</p>
		</div>
	</section>
</div>
