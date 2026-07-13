# MIU lecture notes — design

Date: 2026-07-13
Status: approved

## Goal

A lecture-notes page for the MIU instrument: the full narrative for readers
who want to dig deeper than the page's own copy. Full proofs of everything the
instrument asserts, plus the surrounding mathematics each fact instantiates.
Audience: the graduate-level mathematical reader of the design law.

## Placement and navigation

- New route: `src/routes/form-and-meaning/miu/notes/+page.svelte`.
- Breadcrumb: `Strange Loops Lab / Form and meaning / MIU / Notes`.
- One link from the instrument page's overture, stating what the notes
  contain (full proofs and the surrounding theory).
- A `notes` link on the MIU entry in the lab index (`src/routes/+page.svelte`).
- Every section of the notes carries an `id` anchor so the instrument's
  movements can deep-link later without redesign.

## Content

Five sections mirroring the instrument's structure, each with numbered
Definition / Theorem / Proof / Remark blocks.

### §0 The system

MIU as a string rewriting (semi-Thue) system with anchored rules; the exact
rule patterns (R1 `xI → xIU`, R2 `Mx → Mxx`, R3 `III → U`, R4 `UU → ∅`);
well-formedness `M[IU]+`; the reachability graph; `Th(MIU)` defined as the set
reachable from `MI`; the decision problem stated precisely.

### §1 Theoremhood and construction

The characterization theorem:

> `s ∈ Th(MIU)` ⟺ `s ∈ M{I,U}⁺` and `I(s) ≢ 0 (mod 3)`.

Forward direction deferred to §2 (the invariant). Converse proved in full via
the expand–double–contract construction implemented in
`src/lib/miu/theoremhood.ts`:

1. Define the expanded length `E = I(s) + 3·U(s)` (every target `U`
   re-expanded to `III`); `E ≡ I(s) ≢ 0 (mod 3)`.
2. A power of two `2^k ≥ E` with `2^k ≡ E (mod 3)` always exists because
   `2^k mod 3` alternates 1, 2 and `E mod 3 ∈ {1, 2}`.
3. Grow: `k` applications of R2 from `MI` give `M I^(2^k)`.
4. Shed: the surplus `2^k − E` is a multiple of 3; convert surplus `III`
   triples to `U` by R3, with the odd/even parity fix (one extra R1 append
   when the surplus-U count is odd) so R4 can delete the `U`s in pairs.
5. Contract: walk the target tail left to right, applying R3 at each target
   `U` position to reproduce the exact `I`/`U` pattern.

Ends with the explicit step-count upper bound the construction yields, and
the remark that theoremhood is decided outright — the verdict never searches.

### §2 The invariant and the characters of ℤ/3

- Residue `r(s) = I(s) mod 3` as a map to ℤ/3; each rule induces a map on
  residues — three identities (R1, R3, R4) and one doubling (R2).
- `{1, 2}` is closed under the generated action and `r(MI) = 1`, `r(MU) = 0`;
  hence `MU ∉ Th(MIU)`.
- Why modulus 3 and no other: the witness analysis the instrument computes
  for mod 2, 4, 5 (doubling or subtract-3 sends some admissible residue
  to 0).
- Character theory: the dual group of ℤ/3, orthogonality, the pullback
  `χ_k ↦ χ_{2k}` diagonalizing the doubling rule,
  `δ₀ = (χ₀ + χ₁ + χ₂)/3` as the Fourier form of the forbidden-residue
  indicator.
- The honest statement of why this machinery for so small a group: it is the
  exact form pq/grokking will measure for ℤ/p.

### §3 Programs and description length

- The program format from `src/lib/miu/coding.ts`: flag bit `0`, 3-bit
  opcodes with `000` reserved as terminator, site selectors of width
  `⌈log₂ #sites⌉`.
- The key subtlety: site-selector width depends on decoder state, so
  decodability rests on the decoder simulating the machine — this is what
  "executable prefix code" means.
- Kraft's inequality and self-delimitation; the Elias-gamma literal
  (`1 · γ(|t|) · t`) as the alternative description.
- `K_steps` (unit-cost bidirectional BFS) and `K_bits` (weighted Dijkstra)
  as different optima over the same graph.
- The bounding asymmetry: upper bounds cost one witness; lower bounds cost
  exhaustion, and on this machine exhaustion provably terminates per depth,
  giving the bracket `d < K ≤ c`.

### §4 The passage to universality

What the instrument's coda names without claiming, stated as theorems about
other machines: the invariance theorem (`K_bits → K` up to O(1)),
producibility → halting, Chaitin's incompleteness on provable lower bounds —
each paired with the exact point where MIU's argument fails to transfer
(exhaustion no longer terminates). And what survives: upper bounds still cost
one witness.

## Epistemic register

A short front note separates the two kinds of statement in the notes:

- results about this machine, mechanically checked by the instrument's code
  (verified register);
- standard mathematics (Kraft, invariance theorem, Chaitin) cited as theorems
  with named sources, proved elsewhere.

A cited classical theorem must never read as something this machine
established.

## Rendering

- Plain HTML math per the existing convention: `.mv` / `.o` spans, Unicode,
  `<sub>` / `<sup>`, HTML tables. No KaTeX, no markdown pipeline, no new
  dependencies.
- Full-width standalone prose per the existing layout.
- Numbered theorem blocks are styled HTML sections; styling added in
  `src/app.css` alongside existing prose styles.
- The prose skill (`.agents/skills/prose/SKILL.md`) is read before writing
  any copy; the design law in `docs/module-1-postmortem.md` binds.

## Deliberate exclusions

- No interactive elements. The instrument is the interactive object; the
  notes are fixed text. Tables in the notes (character table, specimen
  comparison) are written by hand and cross-checked against the engine's
  output at writing time, not wired to it.
- No new unit tests — the page is static prose with no logic.

## Verification

- `npm run check` (includes the dead-CSS gate).
- Manual wide-viewport screenshot pass per the design-review rule.
- Hand-written tables cross-checked against engine output before shipping.

## Docs updated in the same pass

- `docs/product-architecture.md` — mention the notes route.
- `README.md` — mention the notes route.
