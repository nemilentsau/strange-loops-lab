# Strange Loops Lab — Vision and Build Reference

Strange Loops Lab is a set of interactive instruments that use the structural
ideas of *Gödel, Escher, Bach* as a bridge from formal systems to modern
mathematics and machine learning.

It is not a summary of GEB and not a gamified learning product. The audience is a
graduate-level mathematical reader. The goal is operational intuition built by
construction and manipulation — derivations you run, interpretations you test,
proofs you assemble — rather than intuition absorbed by reading.

GEB supplies the spine: formal systems, invariants, interpretation,
diagonalization, encoding, self-reference, fixed points, incompleteness,
computability, compression. The destination is the far side of each idea, in
applied mathematics and in ML/AI. GEB is the bridge, not the boundary. A
connection to another field enters the work only when it is structurally real
(§5).

## 1. The project is a graph, not a syllabus

GEB is a book, so it follows one linear path through its material. The material
underneath is not linear: it is a dependency graph. Incompleteness requires
encoding and self-reference; diagonalization requires enumeration; reflection
requires a provability predicate. These prerequisites are fixed. The order in
which we visit them is not.

So the project keeps the dependency order and chooses its own traversal. Two
graphs sit on top of each other:

- the **concept-dependency graph** — what must be understood before what;
- the **bridge graph** — each concept joined to its counterpart in modern
  mathematics or ML/AI.

The two do not coincide. Some bridges are **vertical**: reachable from a single
concept, early, with nothing else assembled — the shortest description of a
string under a rewriting system already reaches Kolmogorov complexity. Others
need a whole arc in place — a Löbian self-trust argument needs encoding,
self-reference, and a provability predicate first.

Build order follows bridge strength and where understanding actually forms, not
chapter order. A strong vertical bridge may be previewed early to motivate the
work that formalizes it later.

## 2. The method is one move, run as an investigation

This is a research instrument for one reader — the builder — to find out whether
the structural ideas of GEB have real counterparts in modern mathematics and
ML/AI. The audience is not a stranger to be taught; it is the builder, who does
not yet know which bridges are real. That is what makes the builder's own
engagement a valid signal: the unknown lives on the far side of each idea, not in
the formal system itself.

The instruments share one move, used as a method of investigation, not a lesson
to be delivered:

```
move:  manipulate inside a system
       → interpret the system
       → characterize the form/meaning relationship
```

The first two steps are constant. The third is the question each instrument
exists to answer, and its answer differs by system:

```
coheres      form captures meaning exactly        (sound and complete)
wall         a true fact is unreachable           (an invariant excludes it)
asymmetry    the figure is generable, the ground may not be
contingent   coherence depends on the interpretation
```

A formal system is a **site** where the move is run, not a self-contained
module. The third step is the connection gate (§5) run live: "characterize the
relationship" is "decide which structural connection to modern math or ML is real
here, and build both sides to find out." It is a hypothesis tested by
construction, not an assumption — and with no external reader, the gate is the
discipline that separates a real bridge from one the builder merely wants.

## 3. The four arcs

Each arc carries a question, a set of GEB sites, the ML/AI bridges it reaches, and
a hinge to the next. The arcs are paths through small instruments; they are not
four large modules.

An arc's question is comparative, so an arc is a **contrast set** of systems, not
one system. A single system can exhibit only one answer to "when does form
capture meaning"; the contrast is what makes the question real.

### Arc 1 — Form and meaning ↔ representation and expressivity
- **Question:** when does a system's form capture a truth, and where is the gap?
- **GEB sites:** MIU (a wall exposed by an invariant) · pq (an interpretation
  isomorphic to addition; sound and complete) · tq and figure/ground (recursively
  enumerable against recursive; the negative space) · consistency (when an
  interpretation coheres).
- **Bridges:** MIU's derivation length ↔ Kolmogorov complexity (a derivation is a
  program; its shortest length is a description length — **built**, the first
  bridge) · pq ↔ grokking — the construction that earns it is identified: a
  one-layer transformer trained on addition mod p learns the characters of ℤ/p
  (the Fourier features of Nanda et al. 2023), and the residue wheel already
  draws the characters of ℤ/3, so the gate class is shared construction; it
  enters the main flow when built · invariants ↔ expressivity walls, with the
  far side pinned to the Minsky–Papert group-invariance theorem so the proof
  template matches exactly (see the ledger) · derivation length ↔ chain of
  thought as a resource (t steps of intermediate decoding simulate t-time
  computation — Merrill–Sabharwal; the shortest derivation is the least budget
  that reaches the target) · figure/ground ↔ generation against verification,
  with its construction identified: an LLM proposes derivations, the verifier
  checks every step, and found lengths are compared against K_MIU from
  exhaustive search.
- **Hinge out:** figure/ground introduces enumeration and the complement problem,
  which sets up diagonalization.

### Arc 2 — Self-reference ↔ self-training and fixed points
- **Question:** how does a system come to refer to itself, and what happens at the
  fixed point?
- **GEB sites:** recursion (recursive transition networks, recursive definitions)
  · diagonalization as a construction · quines · fixed points.
- **Bridges:** fixed points ↔ training on a model's own output and model collapse
  · quines ↔ self-replicating prompts · in-context learning as iterated inference.
- **Hinge out:** diagonalization together with the need to encode syntax leads to
  Gödel numbering.
- The arc is constructive: build an object that refers to itself.

### Arc 3 — Reflection and incompleteness ↔ self-modeling and self-trust
- **Question:** what happens when a system that can describe itself reasons about
  its own provability?
- **GEB sites:** Gödel numbering · the diagonal lemma applied to a provability
  predicate · the incompleteness theorems · Löb · Tarski. Consistency, defined in
  Arc 1, becomes the hypothesis here.
- **Bridges:** Löb ↔ self-trust in agents that reason about themselves · Tarski ↔
  a model cannot fully hold its own truth predicate · reflection ↔ models
  reasoning about their own verifiers.
- The arc is metatheoretic, and it combines Arc 1 (the form/meaning gap) with Arc
  2 (self-reference): a system that encodes itself and applies the fixed-point
  construction to its own provability predicate. This is the strange loop.

### Arc 4 — Limits of computation and information ↔ undecidable properties and compression
- **Question:** what is fundamentally uncomputable or incompressible, and what
  does that say about prediction?
- **GEB and adjacent:** the halting problem · Rice's theorem · reductions ·
  Kolmogorov complexity · Chaitin · Ω.
- **Bridges:** Rice ↔ verification hardness for learned models · Kolmogorov ↔
  compression equals prediction ↔ a language model as a lossless compressor ↔
  Solomonoff induction as the ideal predictor.

Arc 4 is a **destination plane, not a sequential arc.** Its results are reached
from several earlier arcs as their bridges mature, rather than visited once in
order. It carries the highest risk of decorative connection, so its admission
test (§5) is strict.

### Seams
- **Consistency | recursion** is a hinge, not a wall. Consistency closes Arc 1:
  when does an interpretation cohere with the system? Recursion opens Arc 2: how
  does a system fold structure back into itself?
- **Arc 2 and Arc 3 stay separate.** Constructing self-reference and reasoning
  about provability are related but experientially different — one builds a
  self-referential object, the other studies what such a system can and cannot
  prove about itself.

## 4. The epistemic contract

The product separates three kinds of claim and never blurs them.

- **Verified.** Mechanically checkable claims — rule application, derivation
  validity, reduction steps, invariant preservation, parser and encoder behavior
  — may be asserted as correct, with the check standing behind them.
- **Measured.** Results of an empirical run — a training curve, weights and the
  structure extracted from them, a compression ratio. Reported as observations
  together with the configuration that produced them, reproducible from that
  configuration, and never promoted to verified claims. This register exists
  because several bridges have an experiment on the far side; it is also where
  the builder's own learning signal is strongest, since the outcome of a run is
  not known in advance (the postmortem's validation limit does not apply to it).
- **Coaching.** Anything an LLM produces is questioning and commentary: surfacing
  confusion, probing an explanation, suggesting where a gap may be. It is never
  presented as formal verification.

The app must not present LLM output as a proof check, and must not present a
measurement as a theorem. Correctness is claimed only where correctness is
mechanically established.

## 5. The connection gate

A connection to another field enters the main flow only if it passes at least one
structural test:

- **shared template** — the same proof or construction (invariant,
  diagonalization, fixed point, reduction, reflection) appears in both;
- **shared construction** — the same object is built and reinterpreted in two
  settings;
- **shared obstruction** — the same impossibility mechanism does the work;
- **shared invariant** — the reasoning depends on the same preserved quantity.

Two classes appear in the interface: a **structural connection** (main flow) and
an **analogy** (a clearly labeled sidebar, suggestive but not binding).

**Admission test.** A connection enters the main flow only through a buildable
construction — arithmetic coding that runs, a reduction that is exhibited — not a
named theorem attached to a slogan. If the mapping cannot be stated crisply with a
small worked example, it is deferred.

A construction may be empirical: a training run whose extracted structure is set
against the formal side. Its results live in the measured register (§4), and the
bridge is structural only when the same object — an invariant, a character, a
proof template — appears on both sides, not when the curves look alike.

The gate's output is recorded in `docs/bridge-ledger.md`: every candidate, the
gate class it claims, its status, and every rejection with the test it failed. A
rejected bridge is a verified negative of the investigation and is kept, not
deleted.

ML/AI is the destination of the project and also the easiest place to ship hype,
so the gate applies there at full strength. Banned regardless of framing: the
claim that incompleteness shows an AI cannot do some thing. Self-reference about
AI has a formal home (Löb, Arc 3); the slogan does not.

## 6. Reusable structural templates

These are the deep patterns the dependency graph is built from. Instruments
should expose them directly.

- **Invariant.** Local rules evolve a system; some quantity is preserved; the
  preserved quantity decides reachability.
- **Diagonalization.** Assume a listing or decider exists; build an object that
  differs from the nth at the nth place; contradiction.
- **Fixed point / self-reference.** Encode programs as data; build a
  transformation on such data; obtain an object that refers to itself.
- **Reduction.** Encode a known-hard problem as an instance of a target; a
  solution to the target would transfer back; conclude hardness.
- **Reflection.** Represent syntax arithmetically; define a provability
  predicate; reflect statements about proofs into the system.

## 7. Build principles

- **Instruments, not dashboards.** Each instrument is small and sharp and teaches
  one move. The interface is the mathematical object itself — the string, the
  term, the tree — not chrome describing it.
- **Contrast sets.** A comparative question needs at least two systems — for Arc
  1, MIU's wall against pq's coherence. The contrast is a goal of the arc, built
  once the strongest single-site bridges (§11) are in hand.
- **Shape each instrument by its bridge.** An instrument is shaped first by the
  bridge it tests, not forced into a shared cross-site template. Where sites
  happen to share an interaction shape — manipulate the object, interpret it,
  read off the relationship — that makes "same move, different outcome" legible,
  but it is a convenience, not a constraint to design toward.
- **Earn abstractions from instances.** Build two or three concrete sites before
  extracting any shared framework, or the framework overfits the first system.
- **Artifacts over scores.** Persist derivations, interpretations tested, proofs
  attempted, explanations given. No points, badges, or understanding scores.
- **Design for the grown state.** These systems generate large objects; every
  surface is judged mid-session, with long state, not on the fresh page.

The binding tactical rules for interface, copy, and pedagogy — and the record of
why they exist — are in the Module 1 postmortem (`docs/module-1-postmortem.md`)
and the prose skill (`.agents/skills/prose/SKILL.md`).

## 8. Audience and register

The reader is comfortable with formal notation, proof structure, and abstract
reasoning. The product does not flatten the material; it makes it tangible.

Register is plain. Formal content — a definition, a rule check, a proof — is
displayed as it would appear in lecture notes. Motivation is written as precise
prose. The real mathematics is named directly: structural induction, recursive
enumerability, soundness, Post's word problem, Kolmogorov complexity.

## 9. Anti-goals

The project should not become a chatbot with GEB branding, a gamified app, a
proof-assistant clone, a theorem encyclopedia, or a collection of disconnected
visual toys.

The standing risks are decorative connections presented as deep (held off by §5),
the LLM used as authority (held off by §4), and overbuilding before learning what
helps (held off by §7 and by building one arc at a time, validated by use).

## 10. Connection backlog

Structurally real connections to draw on as prerequisites and a construction come
into place:

- **Rewriting and formal languages.** Semi-Thue and term rewriting systems; the
  word problem and its decidability boundary; automata views of string
  predicates; algebraic invariants on syntactic systems.
- **Computability and recursion theory.** Diagonalization; halting; Rice's
  theorem; the recursion theorem; reducibility as the transport mechanism.
- **Programming languages.** Lambda calculus; fixed-point combinators; quines;
  interpreters and metacircularity; code as data.
- **Logic and proof theory.** Provability; reflection; consistency; completeness
  against incompleteness; undefinability of truth.
- **Algorithmic information theory.** Kolmogorov complexity; the incompressibility
  method; Chaitin incompleteness; Ω.
- **Machine learning.** Compression as prediction; expressivity bounds on fixed
  architectures; verification hardness (Rice); fixed-point dynamics in models
  trained on their own output; Löbian self-trust in self-reasoning agents.
- **Off the logic spine (ML-side anchors).** GEB is the bridge, not the
  boundary, and this list should not stay confined to logic and its suburbs. A
  bridge may be anchored from the ML side, with the mathematics as the
  destination: representation theory of finite groups ↔ grokked modular
  arithmetic (characters of ℤ/p; Arc 1) · tropical geometry ↔ ReLU networks (a
  ReLU network is a tropical rational function — Zhang–Naitzat–Lim; shared
  construction, buildable small) · singular learning theory (the real log
  canonical threshold as effective parameter count — deferred until a small
  worked example exists) · random-matrix spectra of trained weights
  (Marchenko–Pastur — an observation, not a template; sidebar unless a
  construction earns more). Gate status for each is in the ledger.

Connections that are easy to overstate — physics-and-observer analogies,
Gödel-to-minds arguments — stay in labeled sidebars unless a real construction
makes them structural.

## 11. Where to start — and what is built

The first instrument is built: the **MIU site with its bridge to Kolmogorov
complexity**. The derivation is manipulated directly (the four rules always on
screen, each with the reason it cannot fire when it cannot); the invariant
#I mod 3 is the wall that excludes MU; and the derivation is then read as a
program, where K_MIU — the length of the shortest derivation — makes
descriptional complexity tangible in the sandbox: a doubled I-run compresses to a
few instructions, an irregular string of the same length does not. Kolmogorov
complexity and Chaitin are named as the next instrument, not claimed by this one.
This is the strongest vertical bridge from §1, built first because both sides are
proofs about the same object.

Next candidates, in order of bridge strength and what each buys:

1. **pq ↔ grokking** — the pq site built together with its bridge: a one-layer
   transformer trained on addition mod p, its Fourier components extracted and
   set against the residue wheel's characters of ℤ/3. Shared construction —
   characters of a cyclic group, built in two settings. This does double duty
   (it builds the Arc 1 contrast set and the strongest ML bridge in the arc) and
   it is the first instrument with a measured surface, where the outcome of the
   run is not known to the builder in advance. Precompute the run; ship weights
   and extracted components as artifacts.
2. **Invariant ↔ expressivity wall** — the MU invariant against the
   Minsky–Papert group-invariance theorem: a bounded-order perceptron cannot
   compute parity, proved by symmetrizing over the input-permutation group and
   bounding the degree of the resulting univariate polynomial. That proof is
   invariant-shaped, so the shared template is exact. Continuity and Lipschitz
   limit arguments (soft-attention bounds) do not share the template and would
   fail the gate; the ledger records this.
3. **Extensions of the built K_MIU instrument**, each small: derivation length ↔
   chain of thought as a resource (Merrill–Sabharwal) · generation against
   verification (an LLM proposes derivations, the verifier checks every step,
   found lengths sit against exhaustive-search K_MIU — the identified re-entry
   path for the dormant dialogue layer, as proposer rather than coach) · the
   language model as compressor, in two stages: first a deterministic
   predictor (n-gram/PPM) driving an arithmetic coder, mechanically checkable;
   then an LLM as the predictor, reported in the measured register.

Each new site is built only as far as the bridge it tests requires.
