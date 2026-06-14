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

The first built bridge is **MIU ↔ Kolmogorov complexity**, shipped as a single
MIU instrument at the root route. One object — the derivation — read three ways:

- **Manipulate** (the worksheet): the derivation spine, the current string with
  its rule sites in the string itself, and the four MIU rules always on screen,
  each showing the exact reason it cannot fire when it cannot.
- **The wall**: the residue wheel on ℤ/3 plus a reachability check. MU is
  rejected by the invariant `#I ≡ 0 (mod 3)` — a verified negative, distinct
  from a search-bound limit.
- **The bridge**: the derivation read as a program. `K_MIU(s)` is the
  shortest-derivation length, computed by a bounded BFS; the instrument shows
  compressible against incompressible strings. Kolmogorov complexity and Chaitin
  are named as the next instrument, explicitly not claimed by this one (the four
  MIU rules are a fixed, non-universal machine).

This is the Arc 1 minimal case: a wall exposed by an invariant, carried through
to a descriptional-complexity reading of the same derivations.

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

These are included only when they clarify the same underlying structure.

---

## Epistemic contract

This project distinguishes between:

- **Verified behavior**  
  Rule application, derivation validity, evaluator/reducer behavior, and other
  mechanically checkable claims.

- **LLM coaching**  
  Socratic dialogue, explain-back prompts, conceptual nudges, gap detection,
  and feedback on reasoning structure.

The app should never pretend a language model has formally verified something
when it has not.

---

## Status

The MIU instrument is built: the worksheet, the residue-wheel wall, and the
`K_MIU` bridge, over the deterministic MIU layer.

Built now:
- the deterministic MIU layer: rule engine and derivation trace (`core`),
  reachability/rewrite graph (`graph`), the `#I (mod 3)` invariant
  (`invariants`), and the `K_MIU` shortest-derivation engine — a bounded BFS
  that reports `found`, the verified invariant negative, or an honest search
  horizon (`complexity`)
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

- [x] build the deterministic MIU layer (engine, graph, invariant, `K_MIU`)
- [x] build the MIU instrument: the three readings of one derivation
- [x] reach the first bridge — `K_MIU` as descriptional complexity over a fixed
      machine, with Kolmogorov and Chaitin named as the next instrument
- [ ] build the next Arc 1 bridge: invariant ↔ expressivity wall (a function a
      fixed architecture provably cannot compute)
- [ ] extend Arc 1 to its contrast set: pq's coherence against MIU's wall
- [ ] decide whether and where to wire the dormant persistence and dialogue
      layers back in

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
