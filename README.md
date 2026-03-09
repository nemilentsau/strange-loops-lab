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

### Phase 1
Scaffolding + **Module 1: Formal Systems & Their Walls**

Initial module goals:

- MIU-system sandbox
- derivation tree / reachability graph explorer
- invariant explorer
- explicit object-level vs meta-level framing
- one dialogue mode for conceptual feedback

The purpose of Module 1 is not just to “solve the MU puzzle,” but to make
one foundational idea intuitive:

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

Early build with the application shell in place.

The current work is focused on:
- shared scaffolding
- MIU rule engine and derivation trace core
- bounded reachability explorer
- invariant explorer for MU non-reachability
- SQLite-backed snapshots and saved artifacts
- state persistence
- Module 1 interaction design
- testing whether the interactions actually deepen understanding

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
- [ ] add first dialogue mode
- [ ] evaluate what actually helped and revise before Module 2

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
