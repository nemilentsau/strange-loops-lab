# MIU Lecture Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A lecture-notes page at `/form-and-meaning/miu/notes` giving full proofs of everything the MIU instrument asserts, plus the surrounding mathematics, for the graduate-level reader.

**Architecture:** One static Svelte route of structured prose — five sections mirroring the instrument's three readings plus system setup and the universality coda. No interactivity, no new dependencies; math rendered as plain HTML per the existing `.mv`/`.o` convention. Links added from the instrument overture and the lab index.

**Tech Stack:** SvelteKit, plain CSS in `src/app.css`, `vite-node` (already present via vitest) for one-off number cross-checks.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-miu-lecture-notes-design.md`.
- Design law (`docs/module-1-postmortem.md` §5) binds: no gamification vocabulary, every element names the mathematical fact it teaches, copy per case never templated.
- Prose skill (`.agents/skills/prose/SKILL.md`) binds: formal content is displayed and structured, never dissolved into flowing prose; motivation is precise connected prose; banned tics (antithesis reach, personified objects, portentous vagueness, hand-holding) apply to every sentence.
- Math markup: `.mv` spans for variables/symbols, `.o` spans for object strings (`MI`, `MU`, bit words), Unicode (ℤ, ω, χ, δ, ⇒, ≡, ≢, ⌈⌉, ∎), `<sub>`/`<sup>`. No KaTeX, no markdown pipeline, no new dependencies.
- No source-file comments stating rules or design principles (repo rule).
- Dead-CSS gate: every class added to `src/app.css` must be used by the page in the same commit; `npm run check` must pass at every commit.
- No interactive elements on the notes page. Hand-written numbers (tables, bit counts, witnesses) are cross-checked against the engine before the commit that introduces them (Task 6 provides the script; run it in Tasks 4–5 as noted).
- Epistemic register: statements about this machine are checked by `src/lib/miu`; classical theorems (Kraft, Elias, invariance, Chaitin, Post) are cited with author and year and never read as established by this machine.
- All copy in the plan below is authoritative content, not final HTML; transcribe it into the markup conventions exactly (worked example in Task 1, Step 3). Where the plan gives a displayed block, render it as displayed structure, not flowing prose.

---

### Task 1: Route scaffold, navigation, and notes CSS

**Files:**
- Create: `src/routes/form-and-meaning/miu/notes/+page.svelte`
- Modify: `src/routes/form-and-meaning/miu/+page.svelte` (overture: add notes link)
- Modify: `src/routes/+page.svelte` (MIU instrument entry: add notes link)
- Modify: `src/app.css` (notes block styles)

**Interfaces:**
- Consumes: existing classes `.instrument-breadcrumb`, `.instrument-header`, `.microlabel`, `.leadin`, `.mv`, `.o`.
- Produces: the page skeleton with five empty `<section class="notes-section">` shells (ids `the-system`, `theoremhood`, `invariant`, `programs`, `universality`) that Tasks 2–6 fill; CSS classes `.notes`, `.notes-front`, `.notes-section`, `.stmt`, `.stmt__body`, `.displaybox`, `.notes-table`, `.overture__notes`, `.instrument-notes-link` that all later tasks use.

- [ ] **Step 1: Create the route skeleton**

`src/routes/form-and-meaning/miu/notes/+page.svelte`:

```svelte
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
	<p>Full statements and proofs behind the instrument, and the theory each fact instantiates.</p>
</header>

<div class="notes">
	<div class="notes-front">
		<p class="microlabel">What is checked, what is cited</p>
		<p>
			Two kinds of statement appear below. Statements about this machine — the
			characterization of Th(MIU), the invariant, the program code, the search bounds — are
			implemented and mechanically checked in the instrument's source
			(<span class="o">src/lib/miu</span>). Classical theorems — Kraft's inequality, the
			invariance theorem, Chaitin's incompleteness — are cited with sources and proved
			elsewhere; nothing this machine does establishes them.
		</p>
	</div>

	<section class="notes-section" id="the-system">
		<h2>§0 The system</h2>
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
```

- [ ] **Step 2: Add the two links**

In `src/routes/form-and-meaning/miu/+page.svelte`, immediately after the `overture__reading` paragraph (inside `div.overture`):

```svelte
<p class="overture__notes">
	<a href="/form-and-meaning/miu/notes">Lecture notes</a> — full statements and proofs, and
	the theory each fact instantiates.
</p>
```

In `src/routes/+page.svelte`, inside the MIU `<li class="instrument-entry instrument-entry--built">`, after the existing `<a>`:

```svelte
<a class="instrument-notes-link" href="/form-and-meaning/miu/notes">notes</a>
```

- [ ] **Step 3: Add notes CSS and the markup convention example**

Append to `src/app.css`, following the file's existing variable and spacing idiom (match neighboring rules for fonts and colors — inspect `.movement__turn`, `.lede`, `.proof` and reuse their values rather than inventing new ones):

```css
.notes {
	display: flex;
	flex-direction: column;
	gap: 3rem;
	max-width: 72ch;
}

.notes-front {
	border-left: 2px solid var(--line, #d8d4c8);
	padding-left: 1.25rem;
}

.notes-section {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.notes-section h2 {
	font-size: 1.35rem;
}

.stmt {
	border-left: 2px solid var(--line, #d8d4c8);
	padding-left: 1.25rem;
}

.stmt__body {
	margin-top: 0.35rem;
}

.displaybox {
	font-family: var(--font-mono, ui-monospace, monospace);
	font-size: 0.95rem;
	line-height: 1.7;
	padding: 0.75rem 1.25rem;
	overflow-x: auto;
	white-space: pre;
}

.notes-table {
	border-collapse: collapse;
}

.notes-table th,
.notes-table td {
	border: 1px solid var(--line, #d8d4c8);
	padding: 0.35rem 0.85rem;
	text-align: center;
}

.overture__notes a,
.instrument-notes-link {
	text-decoration: underline;
	text-underline-offset: 3px;
}
```

Exact values must be adapted to the tokens actually present in `src/app.css` (CSS custom properties, font stacks); the structure above is the contract. Every one of these classes is used by the skeleton or by Tasks 2–6; if a class would be unused at this commit, use it in the skeleton now (`.stmt`, `.displaybox`, `.notes-table` first appear in Task 2 — either defer those three rules to Task 2's commit or include one §0 block early; prefer deferring to keep the dead-CSS gate green).

**Markup convention (worked example for all later tasks).** A numbered statement block:

```svelte
<div class="stmt">
	<p><span class="leadin"><b>Definition 0.1</b> (strings).</span></p>
	<p class="stmt__body">
		A <b>MIU string</b> is <span class="o">M</span> followed by a nonempty word over
		{'{'}<span class="o">I</span>, <span class="o">U</span>{'}'}.
	</p>
</div>
```

A proof follows its statement inside the same `.stmt`, opening with `<span class="leadin">Proof.</span>` and closing with ∎. Displayed derivations, code formats, and case analyses go in `<div class="displaybox">` with literal line breaks.

- [ ] **Step 4: Verify**

Run: `npm run check`
Expected: PASS (including dead-CSS gate).

Run: `npm run dev` and load `http://localhost:5173/form-and-meaning/miu/notes`, `http://localhost:5173/form-and-meaning/miu`, `http://localhost:5173/`.
Expected: notes page renders with breadcrumb and five section heads; both links present and navigate.

- [ ] **Step 5: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte src/routes/form-and-meaning/miu/+page.svelte src/routes/+page.svelte src/app.css
git commit -m "feat: scaffold MIU lecture-notes route with navigation"
```

---

### Task 2: §0 The system

**Files:**
- Modify: `src/routes/form-and-meaning/miu/notes/+page.svelte` (fill `#the-system`)
- Modify: `src/app.css` (add `.stmt`, `.displaybox`, `.notes-table` here if deferred from Task 1)

**Interfaces:**
- Consumes: skeleton and classes from Task 1.
- Produces: Definitions 0.1–0.3 and Remarks 0.4–0.5, referenced by later sections as "§0".

**Content (authoritative; transcribe to markup per Task 1 Step 3):**

- [ ] **Step 1: Write the section**

**Lede (motivation register, 2–3 sentences).** The MIU system is the opening formal system of *Gödel, Escher, Bach*. As mathematics it is a string rewriting system, and the questions the instrument asks about it — reachability, invariants, description length — are the standard questions about such systems, small enough here to be answered completely.

**Definition 0.1 (strings).** A MIU string is `M` followed by a nonempty word over {`I`, `U`} — the regular language `M[IU]⁺`. Write `t` for the tail (everything after `M`), `I(s)` for the number of `I`s in `s`, `U(s)` for the number of `U`s.

**Definition 0.2 (rules).** Four rules, each a partial map on strings (displayed box, one line per rule):

```
R1  xI → xIU     append U; applies iff s ends in I; one site.
R2  Mx → Mxx     double the tail; always applies; one site.
R3  III → U      replace an occurrence; one site per occurrence of III in the tail.
R4  UU → ∅       delete an occurrence; one site per occurrence of UU in the tail.
```

Remark that R1 and R2 are anchored (end of string, all of tail); R3 and R4 apply at any occurrence, and the choice of occurrence is the *site* — this choice is what the program code of §3 pays bits for.

**Definition 0.3 (derivations and theorems).** `s ⇒ s′` iff some rule applied at some site sends `s` to `s′`. A derivation is a finite sequence `MI = s₀ ⇒ s₁ ⇒ ⋯ ⇒ sₙ`. `Th(MIU) = { s : MI ⇒* s }`. The decision problem: given `s`, is `s ∈ Th(MIU)`?

**Remark 0.4 (where this sits).** This is a semi-Thue system with anchored rules; the decision problem is reachability in the infinite directed graph whose vertices are strings and whose edges are rule applications. For semi-Thue systems in general this problem is undecidable (Post 1947; Markov 1947). MIU is a fixed, small system for which it is decidable — §1 proves this by exhibiting the deciding residue and the witness construction.

**Remark 0.5 (well-formedness is preserved).** Each rule maps MIU strings to MIU strings, with one apparent exception: R4 applied to `MUU` would leave a bare `M` with empty tail. No derivation reaches `MUU` — its `I`-count is 0 ≡ 0 (mod 3), which §2 shows is unreachable — so the exception never arises. (Forward reference; stated here so Definition 0.1's nonempty tail is seen to be an invariant, not an assumption.)

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: PASS.

Visual check of the rendered section at `http://localhost:5173/form-and-meaning/miu/notes#the-system`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte src/app.css
git commit -m "feat: notes §0 — the MIU system as a rewriting system"
```

---

### Task 3: §1 Theoremhood and construction

**Files:**
- Modify: `src/routes/form-and-meaning/miu/notes/+page.svelte` (fill `#theoremhood`)

**Interfaces:**
- Consumes: §0 definitions; classes from Task 1.
- Produces: Theorem 1.1, Lemma 1.2, the construction and Corollary 1.5, referenced by §3.

**Content (authoritative). Source of truth for the algorithm: `src/lib/miu/theoremhood.ts` — re-read it before writing; the notes must describe exactly what it does.**

- [ ] **Step 1: Write the section**

**Lede.** The instrument's verdict is instant because theoremhood is decided by a residue, and its constructed witness is produced by an explicit algorithm, not a search. Both halves are proved here.

**Theorem 1.1 (characterization).** `s ∈ Th(MIU)` ⟺ `s` is a MIU string and `I(s) ≢ 0 (mod 3)`.

The forward direction is Theorem 2.3 (the invariant). The converse occupies the rest of this section: given a MIU string `s = M·t` with `I(s) ≢ 0 (mod 3)`, construct a derivation.

**Definition 1.2 (expanded length).** `E(s) = I(s) + 3·U(s)` — the `I`-count the target would have if every `U` in its tail were re-expanded to `III`. Since `3·U(s) ≡ 0 (mod 3)`, `E(s) ≡ I(s) ≢ 0 (mod 3)`.

**Lemma 1.3 (a matching power of two exists).** For every `E ≥ 1` with `E mod 3 ∈ {1, 2}` there is a `k` with `2^k ≥ E` and `2^k ≡ E (mod 3)`.

*Proof.* `2^k mod 3` is 1 for even `k`, 2 for odd `k`: it alternates. Take the least `j` with `2^j ≥ E`; either `2^j` or `2^{j+1}` has the required residue. ∎ (Note `2^k < 4E` for the chosen `k` — used in Corollary 1.5.)

**Construction 1.4 (expand–double–contract).** Displayed as three stages, matching `constructMiuDerivation`:

```
Stage A (grow).      k applications of R2 from MI reach M I^(2^k).

Stage B (shed).      Let D = 2^k − E ≡ 0 (mod 3) and m = D/3, the surplus III-triples.
                     Convert surplus triples (sites past position E) to U by R3.
                     m even:  m conversions, leaving M I^E U^m; then m/2 applications
                              of R4 delete the U's in pairs.
                     m odd:   m−1 conversions leave one surplus triple: M I^E U^(m−1) III.
                              One R1 appends U (the string ends in I), one final R3
                              converts the last triple: M I^E U^(m+1); U-count is now
                              even, and (m+1)/2 applications of R4 delete it.
                     Both cases end at M I^E.

Stage C (contract).  Scan the target tail t left to right with a cursor.  At each I,
                     advance.  At each U, apply R3 at the cursor: the III standing
                     where the target wants U becomes U.  Loop invariant: after
                     processing a prefix p of t, the current string is M · p · I^(E′)
                     where E′ is the expanded length of the unprocessed suffix.
                     When the scan ends the string is exactly M·t = s.
```

Follow the displayed stages with short prose noting the two facts a reader should check: every move in every stage is legal when applied (Stage B's R1 requires a terminal `I`, which the odd case has; Stage B's R4 sites and Stage C's R3 sites exist by the loop invariants), and the parity fix exists because R4 deletes `U`s only in pairs — an odd number of surplus `U`s cannot be cleared without manufacturing one more.

**Corollary 1.5 (an explicit upper bound).** The construction uses `k` doublings, then in Stage B exactly `m` conversions, at most one append, and `⌈m/2⌉` deletions, then `U(s)` conversions in Stage C: with `E = E(s)`,

`K_steps(s) ≤ k + (3/2)m + U(s) + 2`, where `k ≤ ⌈log₂ E⌉ + 1` and `m < E`.

Since `E ≤ 3|s|`, the constructed derivation has length `O(|s|)`. It makes no minimality claim; `K_steps` is defined and bounded in §3.

**Remark 1.6 (decidability).** Theorem 1.1 makes `Th(MIU)` decidable by inspection: validate the string, count `I`s mod 3. The instrument's verdict never searches. Membership always has a finite witness (a derivation); what Theorem 1.1 adds is that *non*-membership is also decided — by the §2 certificate rather than by any exhaustion of derivations.

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: PASS.

Cross-check Stage B against `src/lib/miu/theoremhood.ts` lines 60–79 line by line (order of moves, sites used). The notes must not describe a cleaner algorithm than the one implemented.

- [ ] **Step 3: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte
git commit -m "feat: notes §1 — characterization theorem and witness construction"
```

---

### Task 4: §2 The invariant and the characters of ℤ/3

**Files:**
- Modify: `src/routes/form-and-meaning/miu/notes/+page.svelte` (fill `#invariant`)

**Interfaces:**
- Consumes: §0–§1; `Z3_CHARACTER_TABLE`, `pullbackCharacterUnderDoubling`, `deltaZeroFromCharacters` in `src/lib/miu/characters.ts` (read before writing).
- Produces: Theorem 2.3 (cited by Theorem 1.1), the character table and δ₀ identity (cited by §4 and the pq forward reference).

**Content (authoritative):**

- [ ] **Step 1: Write the section**

**Lede.** One number decides everything about MIU, and this section says why it is a number mod 3 and not anything else — then re-derives the same fact in the language of characters, which is the form that generalizes.

**Definition 2.1 (residue).** `r(s) = I(s) mod 3 ∈ ℤ/3`.

**Proposition 2.2 (rule action on residues).** Displayed, one line per rule:

```
R1  xI → xIU    I-count unchanged        n ↦ n
R2  Mx → Mxx    I-count doubles          n ↦ 2n
R3  III → U     I-count drops by 3       n ↦ n − 3 ≡ n
R4  UU → ∅      I-count unchanged        n ↦ n
```

**Theorem 2.3 (the invariant).** Every `s ∈ Th(MIU)` has `r(s) ∈ {1, 2}`; hence `MU ∉ Th(MIU)`.

*Proof.* Induction on derivation length. `r(MI) = 1`. By 2.2 each rule acts on residues as the identity or as `n ↦ 2n`; 2 is a unit mod 3, and `{1, 2}` is the orbit of 1 under multiplication by 2 (`1 ↦ 2 ↦ 4 ≡ 1`), so `{1, 2}` is closed under both maps. `r(MU) = 0 ∉ {1, 2}`. ∎

**Remark 2.4 (what an invariant is).** The proof used only: a map `r` from strings to a finite set, a compatible action of each rule on that set, and a subset containing `r(MI)`, closed under the actions, missing `r(MU)`. Reachability upstairs (infinitely many strings) is settled by reachability downstairs (three residues, checked by inspection). This is the general shape of a certificate for non-reachability, and the shape the connection gate looks for elsewhere.

**Proposition 2.5 (why modulus 3).** The same scheme fails for the neighboring moduli — for each, some rule sends an admissible residue to the forbidden one, with a reachable witness:

```
mod 2:  R2 doubles 1 to 0.        Witness MI ⇒ MII        (1 ↦ 2 ≡ 0).
mod 4:  R2 doubles 2 to 0.        Witness MII ⇒ MIIII     (2 ↦ 4 ≡ 0).
mod 5:  R3 sends 3 to 0.          Witness M I⁸ ⇒ M I⁵ U   (8 ≡ 3 ↦ 5 ≡ 0).
```

(`MII` is reachable by one doubling, `M I⁸` by three.) Mod 3 works because doubling permutes `{1, 2}` and subtracting 3 acts trivially — the rule actions on ℤ/3 are the identity and a unit. The instrument's "why modulus 3" panel computes such witnesses live; the ones above must be cross-checked against it (Task 6 script and a manual look at the panel).

**Definition 2.6 (characters of ℤ/3).** `χ_k(n) = ω^{kn}`, `ω = e^{2πi/3}`, `k ∈ {0, 1, 2}`. Character table as exponents of ω (`.notes-table`, must equal `Z3_CHARACTER_TABLE`):

| | n = 0 | n = 1 | n = 2 |
|---|---|---|---|
| χ₀ | 0 | 0 | 0 |
| χ₁ | 0 | 1 | 2 |
| χ₂ | 0 | 2 | 1 |

The characters form the dual group, isomorphic to ℤ/3.

**Proposition 2.7 (orthogonality and the indicator).** `(1/3) Σₙ χ_k(n) = 1` if `k = 0`, else 0 (geometric sum of the cube roots of unity). Consequently

`δ₀(n) = (χ₀(n) + χ₁(n) + χ₂(n))/3`

is 1 at `n = 0` and 0 elsewhere: the indicator of the forbidden residue is the uniform combination of characters. This is what `deltaZeroFromCharacters` computes.

**Proposition 2.8 (pullback).** The doubling map `d(n) = 2n` pulls characters back to characters: `χ_k ∘ d = χ_{2k}`, so `d*` fixes χ₀ and swaps χ₁ ↔ χ₂; the other three rules pull back to the identity. Every rule pullback permutes the character basis, and therefore fixes `δ₀`: `δ₀ ∘ d = (1/3) Σ χ_{2k} = δ₀`. Theorem 2.3 restated: the forbidden-set indicator is character-uniform, and character-uniform functions are invariant under every rule.

**Remark 2.9 (why this machinery, honestly).** For a three-element group everything above is checkable by hand, and the character formulation proves nothing the induction did not. It is here because it is the form that scales: for a shallow transformer trained on addition mod p, the measured Fourier structure of the learned embeddings is an expansion in exactly these characters of ℤ/p (the grokking literature; measured, not proved). The pq instrument will set that measured table against this built one. Forward link to `/form-and-meaning/pq`.

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: PASS.

Cross-check the character table against `Z3_CHARACTER_TABLE` (visual diff of the 3×3 exponents) and the mod-2/4/5 witnesses against the instrument's "why modulus 3" panel in the running app (they must name the same failing rule per modulus; the witness strings may differ — if the panel's witnesses differ, use the panel's).

- [ ] **Step 3: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte
git commit -m "feat: notes §2 — invariant proof and characters of Z/3"
```

---

### Task 5: §3 Programs and description length

**Files:**
- Modify: `src/routes/form-and-meaning/miu/notes/+page.svelte` (fill `#programs`)

**Interfaces:**
- Consumes: §0–§2; `src/lib/miu/coding.ts`, `complexity.ts`, `bitComplexity.ts` (read all three before writing).
- Produces: Definitions 3.1–3.4 and Theorem 3.7, cited by §4.

**Content (authoritative). All bit counts below must be re-verified with the Task 6 script BEFORE this task's commit.**

- [ ] **Step 1: Write the section**

**Lede.** A derivation is a finite record of choices — which rule, and where. Coding the record in bits turns each derivation into a program for the fixed machine, and the length of the shortest program is a description length. This section gives the exact code, says why it is built the way it is, and proves what bounding each minimum costs.

**Definition 3.1 (two costs).** For a derivation `d` of `s`: `steps(d)` is its number of moves; `bits(d)` is the length of its encoding under Definition 3.2. `K_steps(s) = min steps(d)`, `K_bits(s) = min bits(d)`, both over derivations of `s`. These are description lengths relative to this fixed machine — the coda's caveat stands: neither is Kolmogorov complexity.

**Definition 3.2 (the program code).** Displayed:

```
program  =  0 · instr₁ ⋯ instrₙ · 000

instr    =  opcode · site
opcode   =  R1 ↦ 001   R2 ↦ 010   R3 ↦ 011   R4 ↦ 100      (000 reserved: halt)
site     =  empty if the rule has ≤ 1 legal site in the current string;
            otherwise the site's ordinal in ⌈log₂ c⌉ bits, c = number of legal sites.
```

The empty derivation of `MI` encodes as `0·000` — 4 bits.

**Proposition 3.3 (executable decodability).** The code is uniquely decodable by a decoder that runs the machine: starting at `MI`, read 3 bits; `000` halts; otherwise the opcode names a rule, the *current string* determines the site count `c`, hence the selector width, so the decoder reads exactly the right number of bits, applies the move, and repeats. The selector width is a function of decoder state, not of the bitstream — the code is prefix-free conditional on the machine. This is the content of "executable": no delimiter and no global table, just simulation.

**Remark 3.4 (why this code).** Four design facts, each one sentence: (i) the opcode block is a fixed-length prefix code on five words (four rules and halt), and reserving `000` for halt is what makes the program self-delimiting; (ii) the site selector charges `⌈log₂ c⌉` bits — the information cost of a `c`-way choice, up to the < 1 bit lost to rounding (Kraft's inequality: fixed-width words of length `⌈log₂ c⌉` over `c` symbols satisfy `Σ 2^(−ℓ) ≤ 1`; Kraft 1949, cited); (iii) rules with a forced site cost 0 selector bits, so an R2 doubling always costs exactly 3 bits — which is why structured targets compress; (iv) the leading flag bit makes the program one branch of a two-branch code whose other branch is Definition 3.5, so program and literal compete inside a single prefix code and their lengths are comparable.

**Definition 3.5 (the literal branch).** `literal = 1 · γ(|t|) · t`, where `t` is the tail, each tail symbol is one bit, and γ is the Elias gamma code, `|γ(n)| = 2⌊log₂ n⌋ + 1` (Elias 1975, cited — a self-delimiting code for the length, so the literal needs no terminator). `L_literal(s) = 1 + 2⌊log₂|t|⌋ + 1 + |t|`.

**Proposition 3.6 (the two minima are different optima).** `K_steps` minimizes move count — computed by breadth-first search with unit edge costs; `K_bits` minimizes total instruction bits — computed by Dijkstra with edge cost 3 + selector width. Every instruction costs at least 3 bits, so `K_bits(s) ≥ 3·K_steps(s) + 4`; the inequality is strict whenever every stepwise-shortest derivation passes through a string where its rule has multiple sites. Worked comparison (numbers from the engine; verify with the Task 6 script):

| s | L_literal | K_steps | K_bits | shortest program |
|---|---|---|---|---|
| MI | 3 | 0 | 4 | `0·000` |
| MIU | 6 | 1 | 7 | `0·001·000` |
| MUI | 6 | 3 | 14 | `0·010·010·011 0·000` — the R3 pays 1 site bit (ordinal 0 of 2 sites) |
| M I¹⁶ | 26 | 4 | 16 | `0·010·010·010·010·000` |

Two sentences of reading: for `MUI` the literal beats every program — three moves cost more bits than naming two tail symbols; for `M I¹⁶` four doublings undercut the literal by ten bits — structure compresses, arbitrary strings do not.

**Theorem 3.7 (what bounds cost).** Upper bounds cost one witness: any exhibited derivation `d` of `s` proves `K_steps(s) ≤ steps(d)` and `K_bits(s) ≤ bits(d)`. Lower bounds cost exhaustion: `K_steps(s) > d` asserts that all derivations of length ≤ `d` miss `s`. The instrument's search proves such bounds by a bidirectional argument:

*Proof (lower-bound argument, as implemented).* Grow a forward frontier from `MI` under the rules and a backward frontier from `s` under the exact rule preimages, completing whole layers. If the forward frontier is complete to depth `d_f` and the backward to `d_b` with no string in both, then no derivation of length ≤ `d_f + d_b` exists — such a derivation's `d_f`-th string would lie in both frontiers. Each layer is finite (each string admits finitely many moves and finitely many preimages), so completing layers is a terminating computation, and every reported bound `K_steps(s) > d` is a theorem, not a heuristic. ∎

Close the section by naming the bracket the instrument displays — an exhausted search reports `d < K_steps(s) ≤ c` with `d` from the argument above and `c` from the constructed witness of §1 — and the sentence that §4 turns on: on this machine the exhaustion terminates because the search space per depth is finite and enumerable.

- [ ] **Step 2: Verify the numbers**

Write the Task 6 cross-check script now if not yet present (it is defined in Task 6 Step 1; creating it early is fine) and run:

Run: `npx vite-node scratch-notes-check.ts`
Expected output includes: `MI literal=3 Kbits=4`, `MIU literal=6 Ksteps=1 Kbits=7`, `MUI literal=6 Ksteps=3 Kbits=14`, `MI^16 literal=26 Ksteps=4 Kbits=16`, and the shortest-bit program strings. Fix the notes if any number disagrees; the engine wins.

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte
git commit -m "feat: notes §3 — the executable code and the cost of bounds"
```

---

### Task 6: §4 The passage to universality, and the cross-check script

**Files:**
- Modify: `src/routes/form-and-meaning/miu/notes/+page.svelte` (fill `#universality`)
- Create (temporary, never committed): `scratch-notes-check.ts` at repo root

**Interfaces:**
- Consumes: §1–§3 statements.
- Produces: the completed page; the scratch script (deleted before commit).

- [ ] **Step 1: Write the cross-check script**

`scratch-notes-check.ts` (repo root; run with `npx vite-node scratch-notes-check.ts`; delete afterwards — it is a working artifact, per repo hygiene it is never committed):

```ts
import { literalMiuBitLength, encodeDerivation } from './src/lib/miu/coding';
import { shortestTheoremDerivation } from './src/lib/miu/complexity';
import { shortestBitProgram } from './src/lib/miu/bitComplexity';
import { constructMiuDerivation } from './src/lib/miu/theoremhood';

const targets = ['MI', 'MIU', 'MUI', 'M' + 'I'.repeat(16)];
for (const target of targets) {
	const literal = literalMiuBitLength(target);
	const steps = shortestTheoremDerivation(target, { maxDepth: 64, maxNodes: 200_000 });
	const bits = shortestBitProgram(target, { maxNodes: 200_000 });
	const constructed = constructMiuDerivation(target);
	console.log(
		target,
		`literal=${literal}`,
		`Ksteps=${steps.outcome === 'found' ? steps.length : 'exhausted'}`,
		`Kbits=${bits.outcome === 'found' ? bits.bitLength : 'exhausted'}`,
		`constructed=${constructed.length} steps, ${encodeDerivation(constructed).bitLength} bits`,
		bits.outcome === 'found' && bits.path ? `program=${encodeDerivation(bits.path).bitString}` : ''
	);
}
```

Adjust import names/signatures to the actual exports of `bitComplexity.ts` (read it first — the result shape may differ from `ShortestDerivation`). If `vite-node` fails to resolve, run through vitest instead: wrap the same calls in a temporary `*.spec.ts` with a single `it` that logs, run `npm run test -- scratch`, then delete.

- [ ] **Step 2: Write §4**

**Content (authoritative):**

**Lede.** Everything above happened on a machine with four rules and one axiom. The coda of the instrument names what changes when the machine becomes universal; this section states those results precisely, cites them, and marks the exact joint where each MIU argument breaks.

**Definition 4.1 (the universal machine, one displayed sentence).** A universal machine `U` takes any finite binary program and runs it; `K_U(s)` is the length of the shortest program whose output is `s` (Kolmogorov 1965; Solomonoff 1964; Chaitin 1966 — cited).

**Theorem 4.2 (invariance, cited).** For universal `U` and any machine `V` there is a constant `c_V` with `K_U(s) ≤ K_V(s) + c_V` for all `s`. In particular MIU's `K_bits` bounds `K_U` from above up to a constant: a universal machine can simulate the four-rule decoder of Proposition 3.3. Description length becomes machine-independent up to O(1) — which is what earns it the name Kolmogorov complexity. What does not transfer: `K_U` is defined for *every* string, while `K_bits` exists only for MIU theorems.

**Theorem 4.3 (producibility becomes halting, cited).** For universal `U`, `{ s : some program outputs s }` questions become the halting problem (Turing 1936); the set of outputs is computably enumerable and not decidable. Where the MIU argument breaks: Theorem 2.3 rested on a computable map to a finite set commuting with the rules and separating reachable from unreachable. For `U` no such computable invariant exists — it would decide an undecidable set. The residue certificate is a luxury of the fixed machine, not a method that scales.

**Theorem 4.4 (Chaitin's incompleteness, cited).** For each sound, computably axiomatized theory `T` (able to state facts `K_U(s) > n`) there is a constant `c_T` such that `T` proves no true statement of the form `K_U(s) > c_T`, although all but finitely many strings of each length satisfy such bounds (Chaitin 1974). One displayed proof sketch: a program that searches `T`'s theorems for the first proof of some `K_U(s) > c_T` and prints that `s` would itself be a description of `s` of length about `log c_T` plus a constant — below `c_T` for large `c_T`, a contradiction. Where the MIU argument breaks: Theorem 3.7's lower bounds were proved by finite exhaustion of a finitely-branching search; at a universal machine the candidate programs of length ≤ `d` cannot be exhausted, because ruling each one out asks whether it halts.

**Remark 4.5 (what survives).** Upper bounds. Exhibiting a program still proves `K_U(s) ≤ |p|`, at any machine — one witness, no exhaustion. The asymmetry of Theorem 3.7 is not a feature of MIU; MIU is where both sides of it are small enough to watch.

Closing sentence, register-checked: these four statements are the instrument's coda made precise; they are theorems about other machines, cited here, proved elsewhere, and nothing on this page depends on them.

- [ ] **Step 3: Verify and clean up**

Run: `npx vite-node scratch-notes-check.ts` — confirm §3's table one final time against the full page.
Run: `rm scratch-notes-check.ts`
Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/form-and-meaning/miu/notes/+page.svelte
git commit -m "feat: notes §4 — universality, invariance, and Chaitin, cited not claimed"
```

---

### Task 7: Docs, build, and visual pass

**Files:**
- Modify: `docs/product-architecture.md` (add the notes route where routes are listed)
- Modify: `README.md` (mention the notes page alongside the MIU instrument)

**Interfaces:**
- Consumes: the finished page.
- Produces: shipped state; docs consistent with the repo rule "when state changes, fix the affected docs in the same pass".

- [ ] **Step 1: Update docs**

In `docs/product-architecture.md`, find the section describing routes/instrument structure and add one line: the MIU instrument carries lecture notes at `/form-and-meaning/miu/notes` — static prose, full proofs, no engine wiring. In `README.md`, add the same fact in one sentence where the MIU instrument is described. Match each document's existing tone; do not add sections.

- [ ] **Step 2: Full verification**

Run: `npm run check`
Expected: PASS.

Run: `npm run test`
Expected: PASS (no tests were added or changed; the suite must still be green).

Run: `npm run build`
Expected: build succeeds, the notes route prerenders/builds without errors.

- [ ] **Step 3: Visual pass at full width**

Run the dev server. With the browser at ≥1700px width, screenshot `/form-and-meaning/miu/notes` top to bottom, plus the overture of `/form-and-meaning/miu` and the lab index entry. Check: displayed blocks do not overflow (`.displaybox` scrolls internally), tables render with borders, the reading measure (`72ch`) holds, no orphaned headings, both links visible and correctly worded. Fix and re-check anything that fails; wide-viewport review before showing is the documented failure mode this step exists to prevent.

- [ ] **Step 4: Commit**

```bash
git add docs/product-architecture.md README.md
git commit -m "docs: record the MIU lecture-notes route"
```
