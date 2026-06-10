# Module 1 UX Reboot — Design Spec

## Status

Approved direction from a visual brainstorming session on June 10, 2026 (mockups
in `.superpowers/brainstorm/97297-1781102846/content/`, gitignored session
artifacts). This spec supersedes the *visual* outcome of improvement-plan.md
Task 2 — the dark grid/void treatment — while preserving its semantics
(`PHASE_META.level`, `LEVEL_PRESENTATION`, the epistemic register system, and
the register-correctness fixes). It feeds a new implementation plan via the
writing-plans workflow.

## Problem

User verdict on the current build: visually noisy and ugly; worse, the
hierarchy is inverted. On entering Explore, four stacked chrome blocks (hero,
context strip, two-realm phase nav, welcome banner) plus a full-width Guided
Tasks panel push the actual instrument — the current string and the legal rule
moves — below the fold. The learner cannot tell where to start; the thing the
module is *about* is the last thing they find. Separately, the three epistemic
registers were carried by three competing hues (teal/gold/rose), which reads
as rainbow noise.

## Decisions (chosen interactively from mockups)

1. Scope: full visual reboot — structure, chrome, and aesthetic, all four phases.
2. Visual language: "Graphite & parchment" (option A3) with an oxblood accent
   (chosen over slate in a side-by-side).
3. Page structure: "Lab desk" (option L2) — guide rail / instrument / evidence.
4. Desktop-first: do not constrain the desktop design for mobile (user
   directive). Mobile is deferred, not forbidden.

## Visual language

Surfaces and ink:

- Page ground: warm parchment `#f1efea` (object phases carry a faint ruled-paper
  tint; see Object/meta below).
- Panel surface: `#faf9f6` (meta phases: `#fbf8f0` on `#f5f1e6` ground).
- Hairlines: `#dedbd3`; stronger structure: `#b9b4a6`.
- Ink: graphite `#2b2a27`; muted ink: `#5f5b4e`; faint: `#85816f`.
- Radius 8px on panels and cards. No drop shadows, no texture ornament, no
  gradients.

Typography:

- Serif (Georgia/`ui-serif` stack) for page/panel headings and meta-level
  annotations.
- System sans for UI copy and labels.
- Monospace strictly for MIU strings (current string, moves, trace values,
  node labels).

Accent discipline:

- Exactly one accent: oxblood `#8a3b2e`.
- Its single meaning is "you can act here": buttons, links, the active phase
  tab, the instrument-panel frame, focused inputs. It never marks epistemic
  status.
- Hue count on any one screen: one.

Epistemic registers (carried by form, never by hue):

- Verified (deterministic MIU/invariant results): solid graphite left-rule or
  frame, ✓/✗ stamps, upright text.
- Computed (graph/search summaries): dashed pencil-gray rules.
- Coaching (LLM dialogue): dotted rules + italic serif, visually a margin
  note. May sit on a slightly warmer paper tint; never gets the accent, never
  gets stamps.
- The existing `data-tone` / `data-verdict` attribute contract is retained;
  only the CSS expression changes.

## Chrome: one command bar

The hero, ContextStrip, PhaseNav realms, and welcome banner are replaced by a
single slim command bar:

- Left: wordmark ("MIU Lab" scale, not a hero) + the four phase tabs.
  Free navigation preserved; active tab in oxblood; tabs grouped visually into
  ▦ (Explore, Map) and ◉ (Prove, Reflect) clusters with a thin divider.
- Right: current string (mono) · step count · I-count · mod-3 · level tag
  (▦ "in the system" / ◉ "about the system") · reset.
- The working question moves into the guide rail (editable there).
- The welcome banner becomes a dismissible first-run hint card at the top of
  the Explore guide rail (same session-scoped dismissal semantics as today's
  banner; no new persistence).

## Layout: the lab desk (all phases)

Three-zone grammar, ~0.9 / 2 / 0.9 column ratio at ≥1200px: guide rail (left,
quiet), instrument (center, the main event, oxblood frame), evidence/history
(right). The editable working question sits at the top of the guide rail on
every phase (it is global state, as today).

- Explore — guide: working question, three guided tasks (compact, collapsible),
  first-run hint. Instrument: THE BENCH — current string large, legal move
  cards, propose-a-string input with verifier verdicts appearing inline
  beneath it (the workbench is no longer a separate stacked panel). Evidence:
  derivation trace (branchable, jump/undo/restart) + computed
  next-reachable-layer preview.
- Map — guide: map guided tasks + depth/node bound controls. Instrument: the
  reachability graph explorer with node inspector. Evidence: "What the search
  shows so far" computed observations + the Map→Prove bridge card (computed
  trigger unchanged: `truncatedBy !== null && !graphNodeExists(graph,
  nodeIdFor('MU'))`).
- Prove — guide: the claim ("MU is unreachable from MI"), built-in invariant
  entry point. Instrument: invariant workbench — candidate input + proof
  scaffold (claim → candidate → holds now → per-rule preservation →
  conclusion). Evidence: per-rule preservation verdicts (verified register),
  save invariant-run / proof-attempt actions.
- Reflect — guide: reflection prompts + snapshot/save controls. Instrument:
  synthesis — notes editor + explain-back examiner (coaching register).
  Evidence: artifact notebook (type filters with counts, payload-derived
  metadata, "Restore to …" buttons).

No capability is dropped; everything currently on a phase surface relocates
into one of its three zones.

## Object level vs meta level, in light language

- Object phases (Explore, Map): page ground carries a faint ruled-paper tint
  (horizontal hairlines, the kind of paper you compute on); ▦ tag in the bar.
- Meta phases (Prove, Reflect): plain, slightly warmer parchment ground
  (`#f5f1e6`), the desk wrapped in a double-rule frame (frame around the
  frame), serif-italic panel titles; ◉ tag in the bar.
- Implementation reuses `PHASE_META.level` and `LEVEL_PRESENTATION` unchanged.

## Desktop-first stance

Design target is ≥1200px. Between ~900–1200px the rails may stack (bench
first, evidence second, guide last) as a cheap fallback so nothing breaks; no
design effort below that, no mobile-driven compromises to the desk, and no
small-viewport verification gates in the implementation plan. A real mobile
pass is explicitly deferred until the desktop experience proves itself.

## Constraints

- Presentational and compositional change only: no state-shape, persistence,
  dialogue, or MIU-logic changes. The 104-test suite stays green; `npm run
  check` stays at 0 errors.
- The epistemic contract is non-negotiable: verified, computed, and coaching
  remain visually distinct (by form), and coaching never resembles
  verification.
- Free phase navigation is preserved (no locked wizard).
- Functionality parity: guided tasks, verifier workbench, reachability
  preview, graph inspector, observations, bridge, proof scaffold, notebook
  filters/metadata/restore, dialogue, statuses — all survive relocation.

## Out of scope

- Feature additions or behavior changes (including dialogue tuning — Task 5
  continues independently).
- Mobile design.
- Module 2.

## Verification

- `npm run check`, `npm run test`, `npm run build` after each slice.
- Playwright screenshots of all four phases at 1280px and 1536px; layout
  inspection for overlap/wrapping.
- Acceptance: on opening Module 1, the current string and legal moves are
  visible and obviously primary without scrolling at 1280×800; guidance is
  present but visually subordinate; per-screen hue count is one; registers
  distinguishable in grayscale.
- Final gate: user visual sign-off (replaces the unfinished Task 2 gate).

## Relationship to improvement-plan.md

- Supersedes Task 2's visual outcome; Task 2's User gate is closed by this
  spec's final gate instead.
- Tasks 1, 3, 4 outcomes (API/builder extraction, graph pedagogy, notebook)
  are unaffected and must survive restyling.
- Task 5 (dialogue evaluation) and Task 6 (pedagogical evaluation) continue
  as planned after this rework lands.
