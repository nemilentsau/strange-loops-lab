# Module 1 Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Module 1 more pedagogically forceful, reusable as a learning notebook, and easier to maintain without expanding beyond the current SvelteKit architecture.

**Architecture:** Keep the project as a single root SvelteKit app. Preserve the deterministic MIU/verifier layer in `src/lib/miu`, keep SQLite persistence in `src/lib/server/persistence.ts`, and keep LLM dialogue clearly framed as coaching. Refactor only where current Module 1 pressure justifies it, especially the large controller role in `src/routes/modules/[slug]/+page.svelte`.

**Tech Stack:** TypeScript, SvelteKit, Svelte 5, Vitest, better-sqlite3, local Claude Code dialogue runner.

---

## Current State Summary

The project is a healthy first-pass implementation of Module 1, `Formal Systems & Their Walls`.

Already implemented:
- MIU rule engine, derivation traces, invalid proposal analysis, and deterministic verifier feedback.
- Bounded reachability graph with provenance and repeated-state inspection.
- Modular invariant explorer with the built-in `count(I) mod 3 != 0` argument.
- Phase flow: `Explore -> Map -> Prove -> Reflect`.
- SQLite-backed latest snapshot and saved artifacts.
- Artifact restore/reopen flow for notes, traces, invariant runs, proof attempts, and dialogue.
- One honest Claude Code-backed dialogue mode: `Explain-Back Examiner`.

Known verification baseline:
- `npm run check` passes.
- `npm run test` passes with 44 tests.
- `npm run build` passes, with a Svelte/Rollup chunking warning.
- `npm run smoke:persistence -- http://127.0.0.1:4175` passes against a running preview server.
- `npm run smoke:dialogue -- http://127.0.0.1:4175` exists but should be run deliberately because it invokes local Claude Code.

The remaining work is refinement, not raw feature completion.

---

## Main Maintainability Pressure

`src/routes/modules/[slug]/+page.svelte` is currently the main pressure point.

It is doing too much:
- loading local draft state from `localStorage`;
- hydrating snapshots and artifacts from API routes;
- choosing between local and remote drafts;
- managing phase and surface transitions;
- creating note, trace, invariant, proof, and dialogue artifacts;
- restoring artifacts into live surfaces;
- running dialogue requests;
- managing graph selection and guided-task state;
- rendering the Module 1 page shell.

At about 780 lines, this is still workable for a first pass, but it will become brittle if notebook, dialogue, and graph pedagogy all keep growing inside the same file.

Refactor target:
- Keep `+page.svelte` as the page shell and wiring layer.
- Move reusable state and API orchestration into small TypeScript modules.
- Avoid a broad architectural split or new backend service.

---

## Guiding Constraints

- Keep Module 1 as the active implementation focus.
- Do not start Module 2 yet.
- Do not introduce a separate Python service or separate frontend app.
- Preserve the epistemic contract:
  - deterministic MIU and invariant results are verified;
  - graph summaries are computed;
  - dialogue is coaching, not proof certification.
- Prefer small, testable improvements over broad redesign.
- Update docs in the same pass if architecture, module scope, or agent responsibilities change.

---

## Task 1: Strengthen Object-Level / Meta-Level Framing

**Purpose:** Make the central learning distinction visible in the interface, not only in prose.

**Files:**
- Modify: `src/lib/components/ContextStrip.svelte`
- Modify: `src/lib/components/PhaseNav.svelte`
- Modify: `src/lib/components/phases/PhaseExplore.svelte`
- Modify: `src/lib/components/phases/PhaseMap.svelte`
- Modify: `src/lib/components/phases/PhaseProve.svelte`
- Modify: `src/lib/components/phases/PhaseReflect.svelte`
- Modify: `src/app.css`
- Test: `npm run check`
- Test: `npm run build`

- [ ] Add a stronger visual distinction between `Explore` / `Map` and `Prove` / `Reflect`.
- [ ] Make verified, computed, and coaching surfaces visually distinct without adding noisy explanation text.
- [ ] Ensure the `Prove` phase reads as a deliberate shift outside the MIU system.
- [ ] Keep the current phase flow free-navigation, not a locked wizard.
- [ ] Verify no mobile or desktop text overlaps are introduced.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.

Acceptance criteria:
- A first-time user can tell when they are applying MIU rules versus proving facts about all derivations.
- The UI makes the object/meta distinction visible before the user reads detailed copy.
- No deterministic result is presented with coaching styling, and no coaching output is styled as verified proof.

---

## Task 2: Improve Graph Pedagogy

**Purpose:** Make `Map` teach search pressure, bounded exploration, repeated states, and why search is not proof.

**Files:**
- Modify: `src/lib/miu/graph.ts`
- Modify: `src/lib/miu/graph.spec.ts`
- Modify: `src/lib/components/phases/PhaseMap.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Modify: `src/app.css`
- Test: `npm run test -- src/lib/miu/graph.spec.ts --run`
- Test: `npm run check`

- [ ] Add graph summary helpers if needed, such as branching counts, repeated-discovery counts, or frontier/truncation summaries.
- [ ] Add focused tests for any new graph summary helper.
- [ ] Replace generic graph metrics with pedagogical observations that expose:
  - bounded search;
  - state growth;
  - repeated discovery;
  - the gap between “not found here” and “unreachable.”
- [ ] Add a direct bridge from a graph observation into the `Prove` phase when the user has reached the search-limit insight.
- [ ] Run graph-specific tests.
- [ ] Run `npm run check`.

Acceptance criteria:
- The graph is useful even without being visually impressive.
- The `Map` phase motivates invariant reasoning instead of competing with it.
- Users are not invited to treat finite bounded search as a proof of impossibility.

---

## Task 3: Deepen Artifacts Into a Real Notebook

**Purpose:** Make saved work easier to review, reuse, compare, and curate across multiple sessions.

**Files:**
- Modify: `src/lib/state/module1.ts`
- Create or modify: `src/lib/state/module1Artifacts.ts`
- Create or modify: `src/lib/state/module1Artifacts.spec.ts`
- Modify: `src/lib/components/phases/PhaseReflect.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Modify: `src/routes/api/modules/[slug]/artifacts/+server.ts`
- Modify: `src/lib/server/persistence.ts`
- Modify: `src/lib/server/persistence.spec.ts`
- Test: `npm run test -- src/lib/state/module1.spec.ts src/lib/state/module1Artifacts.spec.ts src/lib/server/persistence.spec.ts --run`
- Test: `npm run smoke:persistence -- http://127.0.0.1:4175`

- [ ] Define a clearer artifact taxonomy for `note`, `trace`, `invariant-run`, `proof-attempt`, and `dialogue`.
- [ ] Centralize artifact title and payload construction outside `+page.svelte`.
- [ ] Add notebook filters by artifact type.
- [ ] Add compact review metadata, such as restore target, current string, candidate invariant, and created time.
- [ ] Consider optional confidence or confusion tagging only if it supports reflection; do not add score-like metrics.
- [ ] Add tests for artifact normalization, filtering, title construction, and restore-target behavior.
- [ ] If persistence schema changes, add conservative migration logic inside `createPersistenceStore`.
- [ ] Run focused state and persistence tests.
- [ ] Run persistence smoke against a preview server and a temporary database path.

Acceptance criteria:
- A user with many saved artifacts can find the relevant one without scanning an undifferentiated list.
- Restoring an artifact makes it clear what live surface changed.
- The notebook stores evidence of understanding, not fake understanding scores.

---

## Task 4: Evaluate and Tune Dialogue Quality

**Purpose:** Determine whether dialogue improves understanding rather than merely adding plausible coaching text.

**Files:**
- Modify: `src/lib/server/dialogue/team.ts`
- Modify: `src/lib/server/dialogue/team.spec.ts`
- Modify: `scripts/smoke_dialogue.mjs`
- Consider create: `docs/dialogue-evaluation.md`
- Modify if behavior changes: `docs/agent-behavior.md`
- Test: `npm run test -- src/lib/server/dialogue/team.spec.ts --run`
- Test: `npm run smoke:dialogue -- http://127.0.0.1:4175`

- [ ] Create a small dialogue evaluation rubric focused on:
  - invariant preservation;
  - search versus proof;
  - object-level versus meta-level confusion;
  - whether the transcript is worth saving.
- [ ] Collect a few real or representative learner prompts.
- [ ] Evaluate current dialogue outputs against the rubric.
- [ ] Tune `buildDialoguePrompt` to push on the weakest recurring conceptual step.
- [ ] Keep the user-facing mode as one honest `Explain-Back Examiner`.
- [ ] Add tests that assert the prompt includes the key verifier facts and epistemic boundaries.
- [ ] Run focused dialogue tests.
- [ ] Run dialogue smoke only when local Claude Code is installed and authenticated.

Acceptance criteria:
- Dialogue asks sharper questions about the learner’s actual weak step.
- Dialogue never claims to certify proof correctness.
- Saved dialogue transcripts are useful as reflection artifacts.

---

## Task 5: Reduce `+page.svelte` Controller Weight

**Purpose:** Keep the Module 1 page maintainable as notebook, graph, and dialogue logic grow.

**Files:**
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Create: `src/lib/client/module1Persistence.ts`
- Create: `src/lib/client/module1Persistence.spec.ts`
- Create or modify: `src/lib/state/module1Artifacts.ts`
- Create or modify: `src/lib/state/module1Artifacts.spec.ts`
- Modify: `src/lib/state/module1.ts`
- Test: `npm run test -- src/lib/client/module1Persistence.spec.ts src/lib/state/module1Artifacts.spec.ts src/lib/state/module1.spec.ts --run`
- Test: `npm run check`

- [ ] Extract snapshot/artifact/dialogue fetch calls into `src/lib/client/module1Persistence.ts`.
- [ ] Keep fetch helpers small and explicit:
  - load snapshot;
  - save snapshot;
  - list artifacts;
  - create artifact;
  - run dialogue.
- [ ] Extract artifact title and payload builders into `src/lib/state/module1Artifacts.ts`.
- [ ] Keep phase transitions and UI event wiring in `+page.svelte`.
- [ ] Do not move deterministic MIU or invariant logic into client API helpers.
- [ ] Add tests for fetch helper behavior using mocked `fetch`.
- [ ] Add tests for artifact payload builders.
- [ ] Run focused tests.
- [ ] Run `npm run check`.

Acceptance criteria:
- `+page.svelte` reads mostly as page composition plus event wiring.
- API details are not repeated across UI handlers.
- Artifact payload construction is testable without rendering Svelte.
- No behavior changes are introduced by the extraction.

---

## Task 6: Run a Module 1 Pedagogical Evaluation Loop

**Purpose:** Decide what actually helped before expanding scope.

**Files:**
- Create or modify: `docs/module-1-evaluation-notes.md`
- Modify if priorities change: `docs/strange-loops-module-1.md`
- Modify if UX direction changes: `docs/module-1-ux-vision.md`
- Modify if dialogue contract changes: `docs/agent-behavior.md`

- [ ] Use Module 1 from a fresh session and record where understanding improved or stalled.
- [ ] Answer the feedback questions from `docs/strange-loops-module-1.md`.
- [ ] Classify interactions as essential, useful, ornamental, or confusing.
- [ ] Decide whether graph, invariant, dialogue, and notebook surfaces deserve further refinement.
- [ ] Update Module 1 docs with evidence-based next priorities.
- [ ] Keep Module 2 deferred unless Module 1 has reached durable value.

Acceptance criteria:
- The next roadmap decision is based on observed Module 1 use, not speculative module breadth.
- The docs continue to reflect the actual implementation state.
- Future module planning remains blocked on learning value, not on unresolved Module 1 UX gaps.

---

## Recommended Order

1. Task 5: reduce `+page.svelte` controller weight enough to make the next changes safer.
2. Task 1: strengthen object/meta framing.
3. Task 2: improve graph pedagogy.
4. Task 3: deepen the artifact notebook.
5. Task 4: evaluate and tune dialogue.
6. Task 6: run the pedagogical evaluation loop and update docs.

Reasoning:
- The page controller extraction is the smallest maintainability investment that lowers risk for the rest.
- Object/meta framing is the central learning goal.
- Graph pedagogy should motivate proof rather than decorate the module.
- Notebook and dialogue quality matter most once the core learning arc is clearer.
- Evaluation should determine whether Module 1 is ready for further investment or pruning.

---

## Verification Checklist

Run after each implementation slice:

```bash
npm run check
npm run test
npm run build
```

Run when persistence behavior changes:

```bash
npm run preview -- --host 127.0.0.1 --port 4175
npm run smoke:persistence -- http://127.0.0.1:4175
```

Run deliberately when local Claude Code is available:

```bash
npm run preview -- --host 127.0.0.1 --port 4175
npm run smoke:dialogue -- http://127.0.0.1:4175
```

---

## Explicit Non-Steps

- Do not start Module 2.
- Do not add a separate backend service.
- Do not add a Python service for MIU logic.
- Do not expand invariant families unless repeated use shows the current narrow modular family is blocking understanding.
- Do not add points, badges, scores, or opaque understanding metrics.
- Do not present LLM output as verifier-backed proof.
