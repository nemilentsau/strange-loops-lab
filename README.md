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

**Strange Loops Lab** is a multi-module interactive learning environment built
around the core ideas in GEB:

- formal systems
- meta-level vs object-level reasoning
- invariants
- diagonalization
- self-reference
- fixed points
- incompleteness
- computability
- information-theoretic limits

Each module is designed as an **instrument**, not a toy:
something you can manipulate, inspect, and reason with.

---

## Current focus

This project is being built iteratively while reading GEB.

### Active build phase
Scaffolding + **Module 1: Formal Systems & Their Walls**

Module 1 is the only active implementation focus for the foreseeable future.
Module 2 remains part of the long-term vision, but it is not the next build
target.

Current Module 1 goals:

- sharpen the proof-building workflow around invariants
- make the object-level / meta-level split more explicit in the UI
- improve invalid-move pedagogy rather than only preventing illegal moves
- turn persistence into a stronger learning notebook with reusable artifacts
- evaluate whether dialogue actually improves understanding

The purpose of Module 1 is not just to “solve the MU puzzle,” but to make one
foundational idea intuitive:

> Sometimes you cannot understand the limits of a formal system from inside
> the system alone. You need to step outside it.

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

## Planned modules

### Module 1 — Formal Systems & Their Walls
MIU system, derivation graphs, invariants, unreachable targets.

### Module 2 — Diagonalization
Cantor, halting, Russell, and Gödel through a shared structural template.

### Module 3 — Gödel Numbering
Encoding syntax as arithmetic; making “math talking about math” tangible.

### Module 4 — Self-Reference & Fixed Points
Quines, lambda calculus, diagonal lemma, recursion theorem.

### Module 5 — Incompleteness
Interactive construction of the incompleteness theorems.

### Module 6 — Halting & Undecidability
Programs, reductions, Rice’s theorem, impossibility in code.

### Module 7 — Chaitin & Information
Compression, Kolmogorov complexity, Ω, and incompleteness via information.

### Module 8 — Beyond GEB
Löb, Rosser, Tarski, Goodstein, and the broader landscape.

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

Working first pass with Module 1 live and under refinement.

Implemented now:
- shared SvelteKit scaffolding
- MIU rule engine and derivation trace core
- bounded reachability explorer
- invariant explorer for MU non-reachability
- SQLite-backed snapshots and saved artifacts
- artifact restore/reopen flow back into live Module 1 surfaces
- Claude Code dialogue path

Current refinement work:
- stronger object-level / meta-level framing
- evaluating whether the new proof workflow actually teaches better
- improving graph pedagogy beyond basic bounded exploration
- improving notebook review and curation beyond the first-pass restore flow
- testing whether the interactions actually deepen understanding

Module 1 status and next-work priorities are tracked in:
- `docs/strange-loops-module-1.md`
- `docs/module-1-ux-vision.md`

## Current docs

The active docs set is intentionally small:

- `README.md` for project overview and current build posture
- `docs/strange-loops-module-1.md` for canonical Module 1 scope, status, and improvement priorities
- `docs/module-1-ux-vision.md` for supporting Module 1 UX direction
- `docs/product-architecture.md` for the current implementation architecture and subsystem boundaries
- `docs/agent-behavior.md` for the current dialogue/agent contract
- `docs/strange-loops-vision.md` for the long-term conceptual roadmap

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

- [x] establish project scaffolding
- [x] build Module 1 MIU sandbox
- [x] build derivation graph explorer
- [x] build invariant explorer
- [x] add artifact persistence
- [x] add first dialogue mode
- [x] surface the phase/lens cue in Module 1
- [x] add explicit invalid-move explanation
- [x] improve guided tasks, proof artifacts, and reflection support
- [ ] continue tightening object-level / meta-level framing
- [ ] evaluate what actually helped through repeated Module 1 use
- [ ] keep Module 2 deferred until Module 1 proves durable value

---

## Non-goals (for now)

- full formal proof assistant integration
- arbitrary code execution
- social/community features
- overextended physics analogies
- broad content coverage before Module 1 is genuinely useful

---

## Why this exists

GEB is full of ideas people can recognize without fully internalizing.

This project is an attempt to close that gap.

Not by simplifying the ideas,
but by giving them a place to move.
