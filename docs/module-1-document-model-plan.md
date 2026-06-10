# Module 1 Document-Model Rework Plan

## Document status

**Awaiting user approval. Nothing happens until then — no mockups, no code.**

Once the plan is approved, each phase follows the same loop:
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

## Phase B — Map: the derivation tree

The reachable space drawn as an actual tree (SVG), not a node list:

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
