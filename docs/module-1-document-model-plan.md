# Module 1 Document-Model Rework Plan

## Document status

**Approved and in execution.** Phase A shipped (commit `ca6bf4c`) and was
played by the user on June 11, 2026. The played review produced the Phase A
rework list below (landed June 12, including a played-review bug fix on
exercise latching); Phase B is implemented and awaits played acceptance.
(Mockups are ephemeral working artifacts — local only, gitignored, deleted
once their phase ships.)

Each phase follows the same loop:
visual mockup → user approves on sight → implement → user plays it → next
phase. The "user plays it" gate is the acceptance test (design rule 6 in
`docs/module-1-documents-not-dashboards.md`); structural checks alone never
ship a phase again.

Why this plan exists: `docs/module-1-documents-not-dashboards.md` — the
postmortem of the two failed interface passes and the definition of the
document model this plan executes.

## Goal

Rebuild the interaction layer of Module 1's four phases so each page is the
canonical mathematical document for its altitude:

- Explore — a **derivation worksheet** (numbered lines down a page)
- Map — the **derivation tree** (drawn, with the learner's path highlighted)
- Prove — a **proof document** (numbered clauses, verifier-stamped)
- Reflect — the **notebook's closing page** (account + kept documents)

## What is not touched

- The deterministic engine: `src/lib/miu` (rules, verifier, invariants,
  graph builder). New pure helpers may be added; existing behavior is not
  changed.
- Persistence, artifacts, the client API layer, and the dialogue stack.
- The epistemic contract: verified / computed / coaching, carried by form.
- The approved visual language (graphite & parchment, single oxblood action
  accent) as implemented in `src/app.css`.
- The command bar.
- Desktop-first stance (design at ≥1200px; no mobile work).

---

## Phase A — Explore: the derivation worksheet

The page that failed hardest goes first and validates the document language.

Single column. The page is the derivation:

1. **Derivation spine.** Each step is one thin line: step number · string ·
   rule that produced it. The current string is the last line, written
   large. Clicking an earlier line jumps back; the worksheet visibly
   continues from that line. The separate trace panel is gone — history is
   the page.
2. **The string is the interface.** The current string wraps at any length
   (MIU doubles strings by design; everything must survive step 10+). When
   a rule matches in several places, the matching spans highlight in the
   string and the learner clicks the span to apply.
3. **The rules ledger.** A fixed four-row ledger, always visible: pattern →
   result, plus a live status per rule — *applies (n places)* or *why it
   does not* ("no III in this string"). Requires one new pure helper in
   `src/lib/miu/core.ts` (per-rule availability with reasons and match
   sites), written test-first.
4. **Target tester.** "Test a target string…" collapsed to one quiet line,
   empty by default. The `MU` pre-seed in the default draft is removed. The
   rejection diagnostics render only when the learner opens the tester and
   types something.
5. **Challenges (replacing guided tasks).** Each challenge is a predicate
   the engine detects against the live derivation — e.g. *make Rule 3
   possible* (completes when the string contains III), *reach the same
   string by two routes* (completes when the history shows it), *run the MU
   test* (completes when the tester has shown the four-rule rejection).
   Completion is detected by the verifier, never clicked. Pure predicate
   helpers, written test-first. No element whose only effect is setting a
   label; the working-question box leaves this page (the draft field stays
   for Reflect and artifacts).
6. **Robustness hardening.** Wrapping and min-width guards on every string
   surface; no fixed-width boxes around growing content.

Played acceptance: 8+ moves including long-string states, an MU attempt via
the tester, a jump-back continuation, a saved trace — performed by the user.
Structural gates: `npm run check` 0 errors, full test suite green (current
count plus new helper tests), `npm run build`.

### Phase A rework (from the June 11, 2026 played review)

The user's played session rejected four surfaces. The rework below is
**implemented** (mockup approved on sight June 11, then built; structural
gates green) and awaits the user's played acceptance; Phase B stays parked
behind that gate. The scope, as approved:

1. **Per-rule status copy.** R1/R2 are global rewrites (suffix / whole tail
   — structurally at most one site); never print a site count for them:
   preview + Apply only. R3/R4 match local subwords, so counts are
   information: "applies at n places — click a site." Ledger previews
   middle-ellipsize past ~24 characters.
2. **Rule anatomy disclosure.** A quiet typographic disclosure under the
   RULES label — not a card — stating the real structure: R1/R2 match the
   string globally, R3/R4 match local subwords; this is why site counts
   vary, why R2 drives growth, and what "string rewriting system" means
   here. Exact form (disclosure line, dropdown, footnote) decided at mockup.
3. **Challenges re-set as textbook exercises.** Open state prints the
   observation each exists to produce; the detected state becomes a written
   line with its step stamp ("noticed at step 2 — III appeared and Rule 3
   opened"). Verifier-detected, never clicked, honest regression kept. If
   they still read as chrome after the rework, delete them.
4. **Revisit notes in the spine.** When a move lands on a string already in
   the trace, the line says so ("— same as step 6"). The system's degeneracy
   becomes a written observation that sets up Map's reconvergence instead of
   silent frustration.
5. **Tester re-set as a margin query.** Visibly bound to the focal string
   ("from MUIIUUIIU, can one move reach …?"); verdict is one stamped line
   plus four compact mono clauses in the ledger's register. No paragraphs,
   no badge chips, no legacy dashboard components.

### Phase A rework 2 (from the June 12, 2026 played review)

Playing rework 1 surfaced a real mathematical fact the page wasted — the
`M(IU)ᵏ`-style absorbing orbits (one R1 from MI traps the derivation in
doubling forever) — plus three pedagogy gaps. Implemented same day,
mockup-first; awaiting played acceptance:

1. **Dead-branch note.** A verified note when the current string is provably
   closed (`isDeadBranch`: only R2 applies and the tail starts with I — the
   closure proof lives on the helper): the one-sentence why plus a real
   jump-back action to the last open line. States whose tail starts with U
   are not flagged — doubling reopens R4 at the seam.
2. **Bounded target query.** "Can ⟨target⟩ be reached within ≤ k moves?"
   over the verifier's reachability graph from the current string. Found →
   the shortest derivation, printed and walkable. Not found → searched
   count plus the honest limitation ("beyond the bound, this instrument
   cannot see"). Bound 1 keeps the per-rule clause anatomy.
3. **Puzzle-aimed exercises** replacing the rework-1 set: open every rule
   (with verifier-written progress) · make the I-count go down (the
   invariant's raw material: only R3 lowers it, only R2 raises it) · the
   one-way door (irreversibility, wired to the dead-branch detector) · the
   MU test (re-grounded in the bounded query). "One string, two routes"
   leaves Explore; reconvergence belongs to Map's drawing.
4. **Query header middle-ellipsizes** the current string (the focal line is
   the object; the header is a reference).
5. **Detections latch** (June 12 bug fix). Exercise detections are notebook
   entries: facts persisted in the draft (`ExerciseLatch`, merge-only) that
   survive branch truncation and reload. The one-way door's own remedy —
   jump back and branch — discards the steps that detected it; without the
   latch it uncheck itself. Live trace detections win the step-stamped copy;
   latch-only detections are stamped "noticed earlier" (their step numbers
   refer to discarded branches). Rule-usage progress is likewise the union
   across branches.

## Phase B — Map: the derivation tree

**Implemented June 12, 2026** (mockup approved June 11), awaiting played
acceptance. Beyond the approved scope, the captions gained one line earned
by the rework-2 mathematics: a count of one-way doors in view
(`isDeadBranch` over the drawn nodes), tying Explore's trap note to the
bare chains in the drawing. Node click selects and prints the node's full
string with its shortest route under the tree (replacing the old
inspector). From the June 12 played review: the active bound is named at
the controls themselves ("the 16-string limit is the active bound — raising
depth alone changes nothing") and the last depth column ticks "cut by the
string limit" when the node limit governs — the slack control must never
read as simply dead.

The figure's visual grammar (June 12 second played review — "no visual
hierarchy, everything pale, gets worse with more strings"): hierarchy by
role — strings are the objects and carry the ink (14.5px, weight 600);
edges are structure and stay light (dashed, 55% opacity, so wide fans read
as texture); rule labels are metadata, one per rule per fan ("R3 ×14"),
clustered at the departure point; learner-path edges keep individual
labels. The figure renders at a fixed type scale and scrolls — more
strings never means smaller strings. Columns are exactly as wide as their
longest label; depth columns pack densely from the top, ordered by parent
row, so the axiom and the early fans always fill the first screenful. The
figure sits on clean panel ground, not the ruled paper.

The legibility horizon (June 12 third played review — "unusable past depth
3; what value are we extracting?"): an extensional drawing cannot beat
exponential growth, and past the horizon the individual string stops
teaching — the aggregate does. The instrument now degrades from drawing
into counting: a layer is drawn while it holds ≤ 8 strings
(`LAYER_DRAW_LIMIT`); bigger layers collapse into fixed-size counted bands
(new strings · reconvergences · dead chains · MU absent), each with a
draw-a-string's-fan-on-demand local view. The horizon is stated on the
page ("the page draws a layer while it fits — beyond that it can only
count; the territory keeps going either way"). A growth strip — strings
per depth, drawn layers solid, counted layers hatched — makes the
explosion the first-class artifact (the true profile is 1, 2, 3, 5, 14,
44, 181…), and the bound options now run to depth 8 / 250 strings because
counting is cheap. Helpers `mapLayerProfile` and `fanForString` are pure
and test-first.

Layout engine (June 12 fourth played review — "impossible to say what edge
is R1/R2/R3; we can't keep manually adding text on graphs"): graph geometry
is owned by ELK (`elkjs`, the layered/Sugiyama engine) — node positions,
polyline edge routing, and inline edge-label placement all come from the
layout, so a label stays visually attached to its edge (ELK reserves label
space while routing, which no hand layout can). `buildElkGraph` (pure,
test-first) declares structure only: depth partitions pin layers, learner-
path edges always carry their own label, other fans get one carrier label
per rule ("R3 ×6"), back edges are marked "↩". Rendering stays our own SVG
and registers. This is the reusable graph primitive for later modules'
drawings (the architecture doc's "graph explorer").

The approved scope:

1. Depth layers top-down or left-right; nodes are strings; edges are rule
   applications (the same four rules, now edge labels).
2. Reconvergence drawn where branches meet a known string; repeats visibly
   marked.
3. The search bound rendered as a literal faded/cut frontier — "stopped at
   a bound, not at the edge of the reachable set," visible instead of
   captioned.
4. **The learner's own derivation highlighted as a path through the tree**
   — the zoom-out from Explore made literal. Requires a pure helper mapping
   the current trace onto graph node ids (test-first).
5. The computed observations shrink from cards to captions under the tree
   (same copy, computed register). The bridge to Prove keeps its computed
   trigger unchanged.

Played acceptance: grow the bounds, find a repeat, locate your own path,
hit the bound, take the bridge.

## Phase C — Prove: the proof document

The existing scaffold re-set as one continuous numbered argument:

1. Claim · candidate invariant · base case (MI) · one clause per rule
   (the ledger's four rules, now reasoned about) · conclusion — a single
   document, each deterministic clause carrying its verifier ✓/✗ stamp
   inline, counterexamples rendered as the failing clause's content.
2. Candidate input integrated into the document (editing the candidate
   rewrites the argument live). Built-in candidate remains one action.
3. Save invariant-run / proof-attempt stay; three panels become one page.

Played acceptance: apply the built-in candidate, try a failing custom
candidate and read its counterexample, save both artifact types.

## Phase D — Reflect: the notebook page

1. Notes and dialogue as manuscript (coaching register unchanged: dotted,
   italic serif, margin-note feel; the examiner stays the only coaching
   surface).
2. The artifact notebook becomes a document index — one line per saved
   document with its type, recognizing metadata, and restore destination —
   not a card gallery. Filters stay.

Played acceptance: seed a prompt, save a note, filter, restore.

## Final pass — purge and docs

- Delete components and CSS orphaned by the rework as their last consumers
  go (the lab-desk layout components, task-list rows, etc.).
- Update `docs/product-architecture.md` (component layer) and the canonical
  doc's current-build notes to the shipped state.

## Process rules (binding for every phase)

1. Mockup in the visual companion first; the user approves on sight before
   any code.
2. New engine helpers are pure and test-first; UI work changes no engine
   behavior.
3. The user plays each phase before the next phase begins. A phase the user
   rejects gets reworked, not argued for.
4. Each phase is one commit series on this branch, kept green
   (check / test / build) throughout.

## Out of scope

- Dialogue evaluation and tuning (parked separately at its own approval
  gate in `docs/dialogue-evaluation.md`).
- Module 2. Mobile. Any persistence or schema changes.
