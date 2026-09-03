# Module 1 Postmortem

## What this is

A consolidated record of the Module 1 build — the attempts to turn the MIU system
into a learning module — together with the durable lessons and the binding design
law they produced.

The architecture going forward (the dependency graph, the four arcs, the
conceptual move) lives in `docs/strange-loops-vision.md`. This document is the
record of what was learned and the rules that resulted.

## What was built

Module 1 was a phase-based module over the MIU system, with four phases — Explore,
Map, Prove, Reflect — backed by a deterministic MIU engine (rules, verifier,
invariant analysis, graph builder), SQLite persistence, an artifact notebook, and
one Claude Code dialogue path.

The interface went through three interaction designs:

1. an object/meta framing pass on a dark theme;
2. a full visual reboot into a three-column "lab desk" (guide rail, instrument,
   evidence rail) applied to all four phases;
3. a "document model," where each phase is the canonical mathematical document for
   its altitude — Explore a derivation worksheet, Map a derivation tree, Prove a
   proof, Reflect a notebook.

## What happened

The first two designs were built through multi-agent pipelines with per-task spec
reviews and code-quality reviews. Every review passed. Verification covered fold
measurements, register audits, grayscale checks, accessibility checks, and short
click-throughs.

Hands-on use failed within minutes:

- the four MIU rules were never on screen — only their current applications, so
  the most instructive moments (three of four rules silently inapplicable)
  rendered as an absence;
- Rule 2 doubles the string, so within a few steps the current string overflowed
  fixed-width cards and broke the layout;
- a pre-seeded MU in the target input put a wall of rejection diagnostics on the
  page from the first second;
- several elements looked interactive but changed nothing the system read (guided
  tasks set a text label; the "working question" box was decoration);
- the derivation trace was a column of cards, each re-printing the full rule
  sentence.

The document model corrected these and was itself revised repeatedly through
played review — the derivation worksheet, the drawn tree with a counting horizon
past the point a drawing can hold, the proof document with a residue wheel for the
algebra of the invariant, the notebook with an authored coda in place of a live
examiner.

## Root causes

1. **The structure overfit one system.** Explore → Map → Prove → Reflect is
   generic pedagogy applied to a single small formal system. The natural unit is
   not a phase but a conceptual move (manipulate → interpret → characterize the
   relationship), and that move becomes legible only across a contrast of systems.
   A single system answers a comparative question — when does form capture meaning
   — with one data point. MIU was asked to carry an entire experience it can only
   half-show.
2. **Dashboard grammar for a mathematical object.** The interface was built from
   cards and panels, the grammar of heterogeneous collections. MIU's content is
   homogeneous, sequential, textual — a string, four rules, a sequence of steps.
   Boxing line-sized content collapsed information density.
3. **The subject was invisible.** The rules are what the module is about; they
   were never on screen. The "why not" of an inapplicable rule is the pedagogy,
   and the interface discarded it.
4. **Interactions without mechanics.** Elements looked interactive but changed
   nothing the system knew. A later "functionality parity" rule then preserved
   these dead interactions through redesigns — parity is the wrong rule when the
   function never functioned.
5. **Acceptance tested the spec, not the experience.** All acceptance criteria
   were structural — bench above the fold, one hue per screen, no console errors —
   and reviewers exercised one or two moves. Nobody played far enough for the
   string-doubling, the single-rule deserts, and the layout collapse to appear.
   The one gate that would have caught it — playing the thing — ran last.

Behind all of this is a validation limit: the only person who can play the module
is the builder, who already knows MIU completely. Played review by the builder
catches craft defects but cannot measure whether the work teaches someone who does
not already know it. This is why the form-and-meaning material has to reach
unfamiliar ground — contrasts between systems, and the bridges to modern
mathematics and ML — where the builder's own engagement is a valid signal.

## Binding design law

These rules are binding for all learner-facing work — interface, copy, pedagogy.

1. **Mechanics or absence.** Every interactive element must change something the
   system knows. No label-setters.
2. **A box must earn its border.** Default to a line; promote to a box only when a
   real document would box it.
3. **The object is the interface.** Manipulate the string or term, not a card
   describing it.
4. **Design for the grown state.** These systems generate large objects; every
   surface wraps, and every layout is judged mid-session with long state.
5. **Completion is detected.** Statuses and exercise completion come from the
   verifier — never from the learner clicking "done," never from an LLM.
6. **Acceptance is a played session.** No pass ships on structural checks alone.
   Reviewing a surface means using it to the point its state grows. This gate runs
   first.
7. **Mockup before code.** Interaction changes are approved on sight before
   implementation.
8. **Written for the reader.** Copy is plain, named, and per-case. The full
   standard — register by content, the banned tics — is the prose skill
   (`.agents/skills/prose/SKILL.md`); read it before writing any reader-facing
   text. Gamification vocabulary and chrome are banned.
9. **Every element names the fact it teaches.** Each element answers, in one
   sentence, what mathematical fact it teaches. No answer means delete it, not
   restyle it.
10. **Mock every state.** Approval requires the played states — mid-session with
    long objects, completed, expanded, rejection — not only the fresh page.
11. **Copy is written, not templated.** Reader text is drafted per surface and
    case; engine vocabulary (node, draft, snapshot) never reaches the reader.
12. **Name the real mathematics when it is earned.** Where a surface touches a
    structurally real connection, state it in those terms.

The higher architectural lessons — the conceptual move as the unit, contrast
sets, instruments over dashboards, earning abstractions from instances, and the
construction admission test for connections — are carried in
`docs/strange-loops-vision.md`.

## What is sound and stays

- The deterministic MIU engine, verifier, invariant analysis, and graph builder
  (`src/lib/miu`).
- Persistence, artifacts, and the notebook data model.
- The epistemic contract and its form-based registers.
- The graphite-and-parchment visual language with a single action accent.
- The instinct behind the residue-wheel interaction — the one place the build
  reached the structural mathematics and held attention. The wheel was
  replaced by a character table in July 2026 and, in September 2026, by a
  drawn rule action on ℤ/3 that the reader's derivation traces; what stayed is
  the lesson that the algebra of the invariant is where attention lives.
- The desktop-first stance.

## Going forward

The work is no longer "finish Module 1." It is "build the Arc 1 prototype" — the
form-and-meaning contrast set described in `docs/strange-loops-vision.md`, with
MIU as the first site (a wall exposed by an invariant), not the whole experience.
