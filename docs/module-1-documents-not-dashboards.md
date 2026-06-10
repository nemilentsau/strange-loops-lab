# Module 1: Documents, Not Dashboards

## Document status

Design postmortem and replacement interaction model, written June 10, 2026,
after hands-on use of the rebooted Module 1 exposed it as unusable in
practice despite passing every planned review.

This document defines the current interaction-design direction for Module 1.
The documents behind the failed passes (the lab-desk UX vision and the June
2026 reboot spec and plan) have been deleted rather than kept as superseded
layers; their one surviving decision — the user-approved visual language
(graphite & parchment, single oxblood action accent, registers by form) — is
recorded in section 4 and lives in the implementation (`src/app.css`). The
execution plan for this direction is `docs/module-1-document-model-plan.md`.
`docs/strange-loops-module-1.md` remains the canonical scope document.

---

## 1. What happened

Module 1's Explore page went through two redesign passes:

1. An object/meta framing pass on the original dark theme (visual registers,
   level cues, guided tasks).
2. A full visual reboot: parchment language, single command bar, and a
   three-column "lab desk" (guide rail / instrument / evidence rail) applied
   to all four phases.

Both passes were implemented through subagent pipelines with per-task spec
reviews and code-quality reviews. Every review passed. Verification included
fold measurements, register audits, grayscale checks, accessibility checks,
and live click-throughs.

Then the user actually used the page, and it failed within minutes:

- The four MIU rules were nowhere on screen. After a few moves only Rule 2
  applied, and the interface showed a single "legal move" card with no
  explanation of why the other rules had disappeared.
- Rule 2 doubles the string. By step 5 the current string was 25+ characters
  and unwrapped monospace text blew the layout apart — overflowing cards,
  overlapping columns, horizontal scroll.
- A pre-seeded "MU" in the propose-a-string input meant a permanent wall of
  rejection diagnostics occupied the bench from the first second, uninvited.
- The guided tasks, when clicked, wrote a sentence into a text box. Nothing
  else happened, because nothing else was wired to happen.
- The derivation trace was a column of fat cards, each re-printing the full
  rule sentence, advertising "branchable" behavior it never visualized.

None of this was caught by two rounds of multi-agent review.

---

## 2. Why the previous approach failed

### 2.1 Wrong primitive: dashboard grammar for a mathematical object

The interface was assembled from cards and panels — the grammar of
dashboards, which exists for browsing heterogeneous collections (products,
articles, widgets) where each item needs visual containment because items
are unrelated.

Nothing in Module 1 is heterogeneous. The content is a string, four tiny
rewrite rules, and a sequence of steps: homogeneous, sequential, textual.
Wrapping line-sized content in box-sized containers collapsed information
density. A four-line fact (the rule set) cost four cards. A ten-step
derivation cost ten paragraphs. The learner scrolled constantly and saw
little.

### 2.2 The subject of the module was invisible

The system's rules are what the module is *about*, and they were never on
screen — only their current applications. The most instructive moments
(three of four rules silently inapplicable) rendered as an absence instead
of an explanation. The "why not" of each rule is the pedagogy, and the
interface threw it away.

### 2.3 Interactions without mechanics

Several elements looked interactive but did nothing mechanical:

- Guided tasks set a text label. No system component read it.
- The "working question" box stored metadata stamped onto saved artifacts;
  on the Explore page it functioned as decoration.
- "Branchable" was a badge, not a behavior anyone could see.

A rebuild rule of "functionality parity" then faithfully preserved these
dead interactions through two redesigns. Parity is the wrong rule when the
function being preserved never functioned.

### 2.4 Never tested by playing

All acceptance criteria were structural: bench above the fold at 1280×800,
one hue per screen, registers distinguishable in grayscale, zero console
errors. Every reviewer verified the spec; reviewers exercised one or two
moves from MI with short strings.

Nobody played eight moves. Eight moves in, Rule 2's doubling produces the
long strings, the single-rule deserts, and the layout collapse that the
user hit immediately. The missing acceptance criterion was experiential:
*can a person sit down, understand what to do, and keep doing it as the
state grows.* Spec-compliance review verifies the plan; nothing in the
pipeline verified the experience. The one gate designed to catch this —
hands-on pedagogical evaluation — was scheduled last, and by the time it
ran (informally, by an angry user), two full passes had been built on sand.

---

## 3. The replacement: the document model

One principle replaces the dashboard grammar:

> **Each phase is the canonical mathematical document for its altitude, and
> the page is the object itself — not chrome around it.**

Mathematics already has document forms for everything this module does.
GEB itself presents MIU derivations as numbered line lists and the
derivation space as a drawn tree. The interface should be those documents,
made live.

| Phase | Document | Altitude |
|---|---|---|
| Explore | A **derivation**: numbered lines down a worksheet | Operate inside the system |
| Map | The **tree of all derivations**, your path highlighted | See the system's whole space |
| Prove | A **proof**: numbered clauses, verifier-stamped | Step outside the system |
| Reflect | The **notebook's closing page**: account + kept documents | Own what you learned |

### 3.1 Explore: the derivation worksheet

Single column. The page is the derivation:

- Steps as thin numbered lines (step · string · rule), newest at the bottom.
  Click an earlier line to jump back; the worksheet visibly continues from
  there. History is the page; no separate trace panel.
- The current string rendered large, wrapping at any length. When a rule
  matches in several places, the matching spans highlight in the string and
  the learner clicks the span to apply. The string is the interface.
- A fixed four-row **rules ledger**, always visible: pattern → result, and a
  live status per rule — *applies*, or *why it doesn't* ("no III in this
  string"). Rule availability, the heart of the lesson, is permanently on
  screen at the cost of four lines.
- "Test a target string" collapsed to one quiet line, empty by default. The
  MU experiment is something the learner chooses to run, not a standing
  error wall.
- Guided tasks return only as **verifier-checked challenges**: each task is
  a predicate the engine detects against the live derivation ("make Rule 3
  possible" completes when the string contains III; "reach the same string
  two ways" completes when the history shows it). Completion is detected,
  never self-declared. No task whose only effect is setting a label.

### 3.2 Map: the derivation tree

The reachable space drawn as an actual tree, depth by depth — not a node
list. Edges are rule applications; reconvergence is drawn where branches
meet; the search bound is a visibly faded/cut frontier, making "the search
stopped at a bound, not at the edge of the reachable set" something you can
see. The learner's own derivation from Explore is highlighted as a path
through the tree: the zoom-out made literal. Computed observations shrink
from cards to captions under the tree. The bridge to Prove keeps its
computed trigger.

### 3.3 Prove: the proof document

The existing scaffold re-set as one continuous numbered argument: claim,
candidate invariant, base case, one clause per rule (the same four rules
from the ledger, now reasoned about instead of used), conclusion — each
deterministic clause carrying its verifier stamp inline. Three panels
become one document.

### 3.4 Reflect: the notebook

Notes and dialogue as manuscript (coaching register unchanged); the
artifact notebook as an index of saved documents — derivations, search
summaries, proof attempts — rather than a card gallery.

### 3.5 The threads that make it one arc

- **The learner's derivation is the recurring object.** Explore writes it;
  Map locates it inside the space of all derivations; Prove explains why no
  derivation anywhere reaches MU; Reflect files it.
- **The four-rule ledger recurs at escalating stance**: controls in Explore,
  edge labels in Map, proof cases in Prove. Use them → watch them generate a
  world → reason about all of them at once. The object-level/meta-level
  shift is carried by this recurrence structurally, not by captions.
- The epistemic registers and object/meta paper treatments survive
  unchanged: derivation lines and proof stamps are verified; the tree and
  its captions are computed; dialogue remains a coaching margin note.

---

## 4. What survives from the previous passes

The failures above are interaction-design failures. These parts are sound
and stay:

- The deterministic MIU engine, verifier, invariant analysis, and graph
  builder (`src/lib/miu`) — correct, tested, untouched by any of this.
- Persistence, artifacts, and the notebook data model.
- The epistemic contract and its form-based registers.
- The parchment/oxblood visual language (user-approved by mockup).
- The single command bar (chrome compression was right).
- The desktop-first stance.

---

## 5. Design rules going forward

1. **Mechanics or absence.** Every interactive element must change something
   the system knows about. No label-setters.
2. **A box must earn its border.** Default to a line; promote to a box only
   when a real document would box it.
3. **The object is the interface.** Click the string, not a card describing
   the string.
4. **Design for step 10, not step 1.** MIU doubles strings by design. Every
   string surface wraps; every layout is judged mid-session, with long
   state.
5. **Completion is detected.** Challenges and statuses come from the
   verifier, never from the learner clicking "done," never from an LLM.
6. **Acceptance is a played session.** No pass ships on structural checks
   alone. Reviewing a phase means playing it: eight-plus moves, the MU
   attempt, a jump-back, a save. The experiential gate runs first, not
   last.
7. **Mockup before code.** Interaction changes are approved on sight by the
   user before implementation (standing instruction).

## 6. Sequencing

Explore first (the worksheet validates the document language on the page
that failed hardest), then Map (the tree is the largest genuine build),
then Prove (re-setting existing bones), then Reflect (lightest). Each page
lands separately, gated on the user actually using it — rule 6 — before the
next begins.
