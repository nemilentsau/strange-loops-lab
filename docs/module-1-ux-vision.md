# Module 1 UX Vision

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

### Global context strip
- keep the current string and compact metrics visible
- keep the working question editable
- replace the global invariant input with a phase/lens cue

Reason:
- preserve orientation
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

## What is implemented in this pass

- the context strip no longer asks for an invariant up front
- the context strip now shows the current phase lens
- the Prove phase now includes a proof scaffold and custom-candidate input
- the Reflect phase now includes guided reflection prompts
- test SQLite data is cleared so the next run starts with a clean persistence state

---

## What still remains after this pass

- invalid-move demonstration with explicit verifier rejection
- stronger task-based onboarding inside Explore and Map
- better artifact taxonomy, especially for proof attempts
- evaluation of whether the dialogue mode materially improves understanding

---

## Success criteria

This UX direction is successful if a first-time user can:

1. derive a few MIU strings,
2. feel that search alone is not enough,
3. use the Prove phase to assemble the invariant argument,
4. explain the proof in Reflect without the UI pretending that coaching is verification,
5. save a meaningful artifact and return later.
