# Module 1 UX Vision

## Document status

This is a supporting UX-direction document.

The source of truth for Module 1 implementation status, scope, and priorities is
`docs/strange-loops-module-1.md`.

## Purpose

Module 1 should feel like a disciplined lab, not a dashboard of unrelated widgets.
The user should move through a sequence:

1. operate inside the MIU system,
2. feel the limits of search,
3. step outside into invariant reasoning,
4. explain the proof in their own words,
5. leave with a durable artifact.

The UX should make that progression obvious without hard-locking the user into a rigid wizard.

---

## Core design stance

The module should privilege **conceptual pacing** over feature exposure.

That means:

- do not front-load the invariant before the user feels the need for one,
- make the object-level / meta-level shift visible in the layout,
- turn `Prove` into a proof-construction surface rather than a passive inspector,
- turn `Reflect` into guided synthesis rather than a generic notebook.

The UI should still allow free movement, but it should clearly suggest the intended arc:

`Explore -> Map -> Prove -> Reflect`

---

## Problems in the previous UX

### 1. The invariant appeared too early
The global strip exposed the invariant input from the start.
That weakens the pedagogical requirement that the invariant should feel discovered rather than merely announced.

### 2. Prove was still mostly inspection
The invariant surface showed useful evidence, but did not help the user assemble a proof:

- claim,
- candidate,
- per-rule preservation,
- conclusion.

### 3. Reflect lacked scaffolding
Dialogue and persistence existed, but the user was not prompted to articulate:

- why search is insufficient,
- what the invariant actually says,
- where the meta-level move happens.

---

## Intended flow

## Explore

The user should stay close to the object level:

- current string,
- legal moves,
- derivation trace,
- immediate reachable next layer.

This phase should feel crisp and local.

## Map

The user should see the derivation space as a graph:

- bounded search,
- repeated states,
- branching structure,
- provenance of a chosen node.

This is the transition from local manipulation to global structure.

## Prove

This phase should explicitly ask the user to build an argument:

1. state the claim,
2. propose the invariant,
3. test whether it holds now,
4. check whether each rule preserves it,
5. conclude what this blocks.

This is where the “outside the system” move becomes operational.

## Reflect

This phase should help the user convert the proof into understanding:

- explain why brute-force search is not enough,
- explain the key weak step in their own words,
- explain the object-level / meta-level split,
- preserve notes and artifacts.

Dialogue mode should remain clearly labeled as coaching, not proof.

---

## Concrete UX decisions

### Command bar (replaces the old context strip + phase nav)
- collapse the hero, context strip, and two-realm phase nav into one slim command bar
- keep the current string and compact deterministic facts visible on the right
- carry free phase navigation as four tabs on the left, clustered ▦ (Explore, Map) / ◉ (Prove, Reflect)
- show the object/meta level tag (▦ "in the system" / ◉ "about the system") in the bar
- move the editable working question into the guide rail of every phase
- never expose the invariant input globally; it lives in `Prove`

Reason:
- the previous stacked chrome pushed the actual instrument below the fold
- preserve orientation with one quiet bar instead of four competing blocks
- avoid prematurely telling the user what the proof idea is

### Prove phase
- add an explicit proof scaffold
- move custom invariant editing into the Prove surface
- keep the built-in invariant available as a fallback

Reason:
- the proof should be assembled where it belongs, not leaked into the global frame

### Reflect phase
- add guided reflection prompts with one-click seeding into notes
- keep dialogue and artifacts together, since both are about synthesis and retention

Reason:
- reflection works better with structure than with a blank textarea

---

## Shipped visual direction (June 10, 2026 reboot)

The earlier build was visually noisy, and worse, its hierarchy was inverted:
stacked chrome pushed the actual instrument below the fold. A full visual reboot
replaced it. The detailed record lives in
`docs/superpowers/specs/2026-06-10-module1-ux-reboot-design.md`; the summary:

### Graphite & parchment
- warm parchment grounds and panels, graphite ink; no drop shadows, gradients,
  or texture ornament
- serif (Georgia stack) for headings and meta-level annotations, system sans for
  UI copy, monospace strictly for MIU strings
- exactly one accent — oxblood `#8a3b2e` — whose single meaning is "you can act
  here" (buttons, links, the active phase tab, the instrument frame, focused
  inputs). One hue per screen. It never marks epistemic status.

### Registers by form, never by hue
The three epistemic registers used to compete as three hues (teal/gold/rose),
which read as rainbow noise. They are now carried by form:
- verified (deterministic MIU/invariant results): solid graphite left-rule or
  frame with ✓/✗ stamps, upright text
- computed (graph/search summaries): dashed pencil-gray rules
- coaching (LLM dialogue): dotted rules + italic serif, a margin note; never a
  stamp, never the accent

The `data-tone` / `data-verdict` attribute contract is retained; only the CSS
expression changed. The split survives a grayscale screenshot.

### One command bar
The hero, context strip, phase nav, and welcome banner collapse into a single
slim command bar (see the Command bar decision above). The welcome banner became
a dismissible first-run hint card at the top of the Explore guide rail.

### Lab-desk grammar (all phases)
Every phase recomposes into a three-zone "lab desk" (~0.9 / 2 / 0.9 columns at
≥1200px):
- guide rail (left, quiet): the editable working question plus phase guidance
- instrument (center, the main event, wearing the oxblood frame)
- evidence rail (right): history, verdicts, observations, or the notebook

Per phase: Explore's instrument is the bench (current string, legal moves,
propose-a-string with verifier verdicts inline); Map's is the reachability graph
with node inspector; Prove's is the invariant workbench and proof scaffold;
Reflect's is the notes editor and explain-back examiner. Nothing was dropped —
every capability relocated into one of the three zones.

### Object vs meta in light language
- object phases (Explore, Map): faint ruled-paper tint on the ground, ▦ tag
- meta phases (Prove, Reflect): warmer parchment ground, a double-rule frame
  around the desk, serif-italic panel titles, ◉ tag
- reuses `PHASE_META.level` and `LEVEL_PRESENTATION` unchanged

### Desktop-first stance
The design target is ≥1200px. Between ~900–1200px the rails stack (instrument
first, evidence, guide) as a cheap fallback. A real mobile pass is deferred until
the desktop experience proves itself; there are no small-viewport gates.

---

## What is implemented now

- the graphite & parchment reboot has shipped across all four phases, with the
  lab-desk three-zone layout and the single oxblood action accent
- the command bar replaces the old hero + context strip + phase nav stack; it
  carries free navigation, the deterministic readout, and the object/meta level
  tag, and never exposes an invariant input up front
- the editable working question lives in the guide rail of every phase
- the phase-based flow exists as `Explore -> Map -> Prove -> Reflect`
- object-level vs meta-level is now carried by the interface: the bar's level
  tag, ruled-paper vs double-framed-parchment grounds, and the register grammar
- the three registers (verified / computed / coaching) are distinguished by form,
  not hue, and stay distinguishable in grayscale
- the `Explore` phase includes a verifier workbench, with verdicts inline under
  the propose-a-string input on the bench
- the `Explore` and `Map` phases include guided tasks (compact, expand-on-click)
- the `Prove` phase includes a proof scaffold and custom-candidate input
- the `Prove` phase can save invariant runs and proof attempts as distinct
  artifacts
- the `Reflect` phase includes guided reflection prompts and the artifact
  notebook with type filters, payload-derived metadata, and restore actions
- persistence and artifact controls are integrated into `Reflect`
- saved artifacts can reopen into the corresponding live phase surfaces
- dialogue mode has been simplified to one honest coaching mode

---

## What still remains

- a real mobile / small-viewport pass (deferred during the desktop-first reboot)
- better tuning of which guided tasks genuinely help
- better artifact review and curation once multiple saved sessions accumulate
- evaluation of whether the dialogue mode materially improves understanding
- the broader Module 1 evaluation loop that decides the next refinement pass

---

## Success criteria

This UX direction is successful if a first-time user can:

1. derive a few MIU strings,
2. feel that search alone is not enough,
3. use the Prove phase to assemble the invariant argument,
4. explain the proof in Reflect without the UI pretending that coaching is verification,
5. save a meaningful artifact and return later.
