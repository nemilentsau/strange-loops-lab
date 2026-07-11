# Strange Loops Lab

An interactive companion to *Gödel, Escher, Bach*.

This project is not a summary of GEB. It is a computational companion:
a place to build intuition through interaction, experiment with formal systems,
and connect Hofstadter’s ideas to mathematics and computer science without
turning them into gimmicks.

The goal is simple: make abstract ideas tangible.

---

## Quick start

The current scaffold is a root **SvelteKit** app.

Dialogue mode expects a local Claude Code installation and authentication.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run check
npm run test
npm run build
```

`npm run check` includes a dead-CSS gate (any class defined in `src/app.css`
but referenced nowhere in `src/` fails the check; standalone:
`npm run check:dead-css`).

SQLite persistence is created automatically at `data/strange-loops.db`.

Dialogue smoke test against a running app server:

```bash
npm run preview -- --host 127.0.0.1 --port 4175
npm run smoke:all -- http://127.0.0.1:4175
npm run smoke:dialogue -- http://127.0.0.1:4175
npm run smoke:persistence -- http://127.0.0.1:4175
```

Optional dialogue env:

```bash
CLAUDE_CLI_PATH=claude
CLAUDE_DIALOGUE_MODEL=sonnet
CLAUDE_DIALOGUE_TIMEOUT_MS=120000
CLAUDE_DIALOGUE_EFFORT=low
```

---

## What this is

**Strange Loops Lab** is a research instrument for testing whether the
constructions in GEB have real counterparts in modern mathematics and in
ML/AI. The method is to build both sides of a candidate bridge and check for a
shared invariant, proof template, or reduction — the connection gate decides
whether the bridge is real or decorative.

The GEB ideas it draws on:

- formal systems
- meta-level vs object-level reasoning
- invariants
- diagonalization
- self-reference
- fixed points
- incompleteness
- computability
- information-theoretic limits

Each construction is built as an **instrument**, not a toy: the mathematical
object itself — the string, the derivation, the residue — is the interface, and
you manipulate, inspect, and reason with it directly.

---

## Current focus

The first built bridge is **MIU derivation programs ↔ description length
relative to a fixed machine**, shipped as a single MIU instrument at the root
route. One object — the derivation — read three ways:

- **Manipulate** (the worksheet): the derivation spine, the current string with
  its rule sites in the string itself, and the four MIU rules always on screen,
  each showing the exact reason it cannot fire when it cannot. The theorem
  query decides membership by the complete I-count characterization, constructs
  a witness for every theorem, and keeps bounded shortest-witness search
  separate.
- **The wall**: the invariant `#I ≢ 0 (mod 3)` rejects MU and every residue-zero
  target. The proof now constructs all three characters of ℤ/3, their rule
  pullbacks, and the Fourier indicator of the forbidden residue.
- **The bridge**: the derivation read as a program under a fixed executable
  prefix code. `K_steps` is minimum rewrite-move count by bounded bidirectional
  BFS (forward from MI, backward from the target under the inverse rules); `K_bits`
  is minimum encoded length by bounded Dijkstra search. Both searches report an
  honest exhaustion horizon. Compression is asserted only by comparing
  `K_bits` with the gamma-length-prefixed literal code.

This is the Arc 1 minimal case: a wall exposed by an invariant, carried through
to a descriptional-complexity reading of the same derivations.

The MIU exactness pass is complete. Deterministic transforms inherit the
register of their inputs; the binding registers are verified, measured, and
coaching. The next instrument is pq / modular addition / grokking, using the
built ℤ/3 character object as the formal-side prerequisite. No further MIU
extension is scheduled before that second site tests the bridge method.

---

## Design principles

### 1. Instruments, not toys
Interactive elements should feel like mathematical tools.

### 2. No fake rigor
If something is mechanically verified, it should say so.
If something is LLM feedback, it should be presented as coaching, not proof.

### 3. Connections must be earned
Connections to other areas of math and computer science are included only when
they are structurally real: shared invariants, shared proof templates,
shared fixed-point constructions, or explicit reductions.

### 4. The reward is understanding
No badges. No streaks. No gamified fluff.

---

## The bridge program

The project is organized as a dependency graph of small instruments, not a
linear syllabus, grouped into four arcs that carry it from formal systems to
ML/AI. Each arc poses a comparative question over a contrast set of systems and
names the ML/AI bridges it reaches. The full program — the concept-dependency
graph, the four arcs, and the recurring form→meaning move they share — is in
`docs/strange-loops-vision.md`. The MIU instrument is the first built bridge of
Arc 1 (form and meaning ↔ representation and expressivity).

---

## Structural connections

This project is especially interested in real connections to other parts of
math and computer science, including:

- term rewriting systems
- automata and formal languages
- graph search and state-space explosion
- diagonalization in computability and complexity
- lambda calculus fixed points
- Kleene’s recursion theorem
- proof theory and reflection
- Rice’s theorem and undecidability
- Kolmogorov complexity and MDL
- representation theory of finite groups (characters of ℤ/p in grokked
  modular arithmetic)
- tropical geometry (a ReLU network as a tropical rational function)

These are included only when they clarify the same underlying structure; the
last two are anchored from the ML side, with the mathematics as the
destination.

---

## Epistemic contract

This project distinguishes between:

- **Verified behavior**  
  Rule application, derivation validity, evaluator/reducer behavior, and other
  mechanically checkable claims.

- **Measured results**  
  Outputs of an empirical run — a training curve, extracted weights and the
  structure found in them, a compression ratio. Reported with the
  configuration that produced them and reproducible from it; never promoted to
  verified claims.

- **LLM coaching**  
  Socratic dialogue, explain-back prompts, conceptual nudges, gap detection,
  and feedback on reasoning structure.

The app should never pretend a language model has formally verified something
when it has not, and should never present a measurement as a theorem.
Deterministic transforms inherit the register of their inputs: checked
transforms of formal state remain verified, while deterministic analysis of
trained weights remains measured.

---

## Status

The MIU instrument is built: the worksheet, complete theoremhood decision,
constructive witnesses, invariant certificate, character construction, and two
explicit description-length costs.

Built now:
- the deterministic MIU layer: rule engine and derivation trace (`core`),
  reachability/rewrite graph (`graph`), the `#I (mod 3)` invariant
  (`invariants`), the complete membership decision and constructor
  (`theoremhood`), bounded `K_steps` optimization (`complexity`), the executable
  prefix code (`coding`), bounded `K_bits` optimization (`bitComplexity`), and
  the character table and pullbacks of ℤ/3 (`characters`)
- the single-route instrument: the three readings of one derivation, with the
  object itself as the interface

Present but dormant (in the repo, not wired to the instrument):
- persistence: SQLite at `data/strange-loops.db`, the
  `/api/modules/[slug]/{snapshot,artifacts}` routes, and the client API
- dialogue: the Claude Code path under `src/lib/server/dialogue` and its API
  route

These layers are kept against later instruments rather than removed; they do not
back the MIU instrument as it stands.

The build direction is in `docs/strange-loops-vision.md`; the retired
phase-based Module 1 build that preceded this instrument, and the binding design
law it produced, are in `docs/module-1-postmortem.md`.

## Current docs

The active docs set is intentionally small:

- `README.md` for project overview and current build posture
- `docs/strange-loops-vision.md` for the vision and build reference (the dependency graph, the four arcs, the conceptual move)
- `docs/bridge-ledger.md` for the record of the connection gate: every candidate bridge, its gate class, its status, and rejections kept as verified negatives
- `docs/module-1-postmortem.md` for the Module 1 build postmortem and the binding design law
- `docs/product-architecture.md` for the current implementation architecture and subsystem boundaries
- `docs/agent-behavior.md` for the current dialogue/agent contract

Older first-pass implementation specs and duplicate agent-behavior docs have
been retired so the current state lives in fewer places.

---

## Who this is for

Readers comfortable with abstract reasoning, formal notation, and mathematical
structure — especially those reading GEB and wanting something more interactive
than a static companion text.

This is not aimed at maximal simplification.
It is aimed at making difficult ideas more tangible.

---

## Near-term roadmap

- [x] build the deterministic MIU layer (engine, graph, invariant)
- [x] build the MIU instrument: the three readings of one derivation
- [x] reach the first bridge — executable MIU programs as descriptional
      complexity over a fixed machine, with Kolmogorov and Chaitin named as
      later destinations
- [x] complete the MIU exactness pass: decide theoremhood constructively, expose
      `K_steps` and executable-code `K_bits` separately, construct the
      characters of ℤ/3, and finish the three-register cleanup
- [ ] build the next Arc 1 bridge: pq ↔ grokking — the pq site together with a
      one-layer transformer trained on addition mod p, its Fourier components
      set against the explicit character table of ℤ/3 (the first measured
      surface; also the Arc 1 contrast set)
- [ ] build invariant ↔ expressivity wall, with the far side pinned to the
      Minsky–Papert group-invariance theorem (parity for bounded-order
      perceptrons) so the proof template matches exactly
- [ ] revisit the identified language-model compression, sparse-coding /
      superposition, and interactive-proof candidates after the Arc 1 builds;
      keep derivation length / chain of thought as a sidebar analogy
- [ ] decide whether and where to wire the dormant persistence and dialogue
      layers back in; the only identified MIU proposer experiment is a bounded
      search-versus-checking comparison, not a computability obstruction

---

## Non-goals (for now)

- full formal proof assistant integration
- arbitrary code execution
- social/community features
- overextended physics analogies
- broad coverage before a single arc proves durable value

---

## Why this exists

GEB is full of ideas people can recognize without fully internalizing.

This project is an attempt to close that gap.

Not by simplifying the ideas,
but by giving them a place to move.
