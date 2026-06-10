# Module 1 Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Tasks are numbered in execution order. Execute them top-down; do not reorder.
>
> Checkboxes prefixed **User:** are human-judgment gates. An executing agent must
> stop at those steps and hand control back to the user. It must not self-certify
> them, simulate the user, or fabricate the user's findings.

**Goal:** Make Module 1 more pedagogically forceful, reusable as a learning notebook, and easier to maintain without expanding beyond the current SvelteKit architecture.

**Architecture:** Keep the project as a single root SvelteKit app. Preserve the deterministic MIU/verifier layer in `src/lib/miu`, keep SQLite persistence in `src/lib/server/persistence.ts`, and keep LLM dialogue clearly framed as coaching. Refactor only where current Module 1 pressure justifies it, especially the large controller role in `src/routes/modules/[slug]/+page.svelte`.

**Tech Stack:** TypeScript, SvelteKit, Svelte 5, Vitest, better-sqlite3, local Claude Code dialogue runner.

---

## Relationship to Canonical Docs

This file is the execution-level expansion of the improvement plan in
`docs/strange-loops-module-1.md` section 13. That document remains the canonical
source of truth for Module 1 scope and priorities. If the two disagree, the
canonical doc wins and this file should be corrected to match.

When this plan completes, fold the resulting status changes back into
`docs/strange-loops-module-1.md` and delete or archive this file, so two
competing improvement plans do not drift apart.

Mapping and deliberate deferrals against the canonical priorities:

- Task 1 (controller refactor) has no canonical priority of its own; it is an
  enabling maintainability task that de-risks the rest.
- Canonical Priority 1 → Task 2. Priority 3 (Map half) → Task 3. Priority 4 →
  Task 4. Priority 5 → Task 5. Priority 6 → Task 6.
- Canonical Priority 2 (invalid-move workbench refinement) is **deliberately
  deferred**: the canonical doc itself says to test whether people actually use
  the workbench before expanding it, and that evidence arrives in Task 6.
- The Explore guided-task tuning half of canonical Priority 3 is **deliberately
  deferred** for the same reason; Task 3 below covers only the Map/graph half.

Both deferrals should be revisited when Task 6 produces real usage notes.

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
- `npm run build` passes, with a Svelte/Rollup chunking warning (explicitly deferred; see Non-Steps).
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

## Task 1: Reduce `+page.svelte` Controller Weight

**Purpose:** Keep the Module 1 page maintainable as notebook, graph, and dialogue logic grow, and make the later tasks in this plan safer.

**Files:**
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Create: `src/lib/client/module1Api.ts`
- Create: `src/lib/client/module1Api.spec.ts`
- Create: `src/lib/state/module1Artifacts.ts`
- Create: `src/lib/state/module1Artifacts.spec.ts`
- Modify: `src/lib/state/module1.ts`
- Modify: `docs/product-architecture.md` (it records ownership of `src/lib/miu` and `src/lib/server`; record the new `src/lib/client` layer the same way)
- Test: `npm run test -- src/lib/client/module1Api.spec.ts src/lib/state/module1Artifacts.spec.ts src/lib/state/module1.spec.ts`
- Test: `npm run check`

Naming note: the client helper is deliberately `module1Api.ts`, not
`module1Persistence.ts`, to avoid confusion with the server-side
`src/lib/server/persistence.ts`.

Extraction map (symbol names as they exist in the current `+page.svelte`):

- To `src/lib/client/module1Api.ts`: the fetch logic inside
  `hydrateFromPersistence` (snapshot GET and artifacts GET, split into two
  helpers), `saveSnapshotToDatabase` (snapshot PUT), `createArtifact`
  (artifacts POST), and `runDialogue` (dialogue POST). Helpers take `fetch` as
  a parameter, return normalized domain types via the existing
  `normalizeModule1Draft` / `normalizeModule1Artifact(s)` functions, and
  signal failure with typed results — they must not set UI status strings.
- To `src/lib/state/module1Artifacts.ts`: `noteArtifactTitle`,
  `proofArtifactTitle`, and the inline payload objects from
  `saveNoteArtifact`, `saveTraceArtifact`, `saveInvariantArtifact`, and
  `saveProofArtifact`, reshaped as pure builders returning
  `{ artifactType, title, payload }`.
- To `src/lib/state/module1.ts`: `pickNewestDraft` and `draftTimestamp`
  (pure draft-selection logic, currently untestable inside the page).
- Stays in `+page.svelte`: `patchDraft`, phase/surface transition handlers,
  `ensureVisited` / `ensureVisitedPhases`, `phaseCueFor`, all status-message
  strings, the guard checks that produce status messages (empty note,
  unsupported invariant candidate), `formatTimestamp`, and
  `findRepeatedGraphNodeId`.

- [ ] Extract snapshot/artifact/dialogue fetch calls into `src/lib/client/module1Api.ts`, following the extraction map above.
- [ ] Keep fetch helpers small and explicit:
  - load snapshot;
  - save snapshot;
  - list artifacts;
  - create artifact;
  - run dialogue.
- [ ] Extract artifact title and payload builders (note, trace, invariant-run, proof-attempt) into `src/lib/state/module1Artifacts.ts`. This task owns the creation of that module; Task 4 extends it later.
- [ ] Keep phase transitions and UI event wiring in `+page.svelte`.
- [ ] Do not move deterministic MIU or invariant logic into client API helpers.
- [ ] Add focused tests for the artifact title and payload builders; this is where the real logic lives.
- [ ] Add at most one happy-path and one error-path test per fetch helper, with `fetch` injected or stubbed. The persistence smoke already exercises these paths end-to-end, so do not duplicate broader coverage. Note: Vitest runs a single `server` project in a node environment (`vite.config.ts`); there is no jsdom project, so design the helpers to take `fetch` as an injectable dependency.
- [ ] Run focused tests.
- [ ] Run `npm run check`.

Acceptance criteria:
- `+page.svelte` reads mostly as page composition plus event wiring.
- API details are not repeated across UI handlers.
- Artifact payload construction is testable without rendering Svelte.
- No behavior changes are introduced by the extraction.

---

## Task 2: Strengthen Object-Level / Meta-Level Framing

**Purpose:** Make the central learning distinction visible in the interface, not only in prose.

> **Completion note (superseded by the UX reboot).** Task 2's *visual* outcome —
> the dark grid/void object/meta treatment and the ~375px narrow-viewport gate —
> was superseded by the Module 1 UX reboot. The reboot's design and plan are
> `docs/superpowers/specs/2026-06-10-module1-ux-reboot-design.md` and
> `docs/superpowers/plans/2026-06-10-module1-ux-reboot.md`. Task 2's **User:**
> sign-off gate is closed by the reboot's final visual-sign-off gate instead of
> being run here. What *survived* is Task 2's SEMANTICS: the object/meta level
> distinction (`PHASE_META.level`, `LEVEL_PRESENTATION`) and the
> verified/computed/coaching register system are carried forward by the reboot —
> now expressed by form (graphite/parchment, ruled vs double-framed paper, the
> command bar's level tag) rather than by the old dark hues. `ContextStrip` and
> `PhaseNav` no longer exist (folded into `CommandBar`). Checkboxes below: the
> semantic items are done; the dark-visual / small-viewport items are marked done
> as *superseded*, not as separately delivered.

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

- [x] Add a stronger visual distinction between `Explore` / `Map` and `Prove` / `Reflect`. *(delivered by the reboot: object/meta level tag + ruled vs double-framed parchment.)*
- [x] Make verified, computed, and coaching surfaces visually distinct without adding noisy explanation text. *(semantics survived; registers now carried by form, not hue.)*
- [x] Ensure the `Prove` phase reads as a deliberate shift outside the MIU system. *(delivered by the reboot's meta canvas treatment.)*
- [x] Keep the current phase flow free-navigation, not a locked wizard. *(preserved through the reboot.)*
- [x] ~~Verify layout with browser screenshots of all four phases at a narrow (~375px) and a desktop (~1280px) viewport~~ — *superseded: the reboot is desktop-first and retired the 375px gate; verification is at 1280px and 1536px instead.*
- [x] Run `npm run check`.
- [x] Run `npm run build`.
- [x] **User:** ~~review the four phases and confirm the framing acceptance criteria~~ — *closed by the reboot's final visual-sign-off gate (`docs/superpowers/plans/2026-06-10-module1-ux-reboot.md`, Task 7), not run here.*

Acceptance criteria:
- A first-time user can tell when they are applying MIU rules versus proving facts about all derivations. (Human judgment — verified by the **User:** gate, not self-certified.)
- The UI makes the object/meta distinction visible before the user reads detailed copy. (Human judgment — verified by the **User:** gate.)
- No deterministic result is presented with coaching styling, and no coaching output is styled as verified proof.

---

## Task 3: Improve Graph Pedagogy

**Purpose:** Make `Map` teach search pressure, bounded exploration, repeated states, and why search is not proof.

**Files:**
- Modify: `src/lib/miu/graph.ts`
- Modify: `src/lib/miu/graph.spec.ts`
- Modify: `src/lib/components/phases/PhaseMap.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Modify: `src/app.css`
- Test: `npm run test -- src/lib/miu/graph.spec.ts`
- Test: `npm run check`

- [ ] Add graph summary helpers if needed, such as branching counts, repeated-discovery counts, or frontier/truncation summaries. `ReachabilityGraph` already exposes `truncatedBy: 'depth' | 'node-limit' | null`, `maxDepth`, and `maxNodes`; build on those rather than re-deriving truncation.
- [ ] Add focused tests for any new graph summary helper.
- [ ] Replace generic graph metrics with pedagogical observations that expose:
  - bounded search;
  - state growth;
  - repeated discovery;
  - the gap between “not found here” and “unreachable.”
  Observations must stay phrased as computed facts about the explored region (counts, bounds, absences), never as conclusions about reachability.
- [ ] Add a direct bridge from the `Map` phase into the `Prove` phase, triggered by computed graph state only: show it when `graph.truncatedBy !== null` and `MU` is not among the explored nodes (`!graphNodeExists(graph, nodeIdFor('MU'))`). Do not gate it on any LLM judgment, and do not show it before the user has hit a search bound — the invariant should still feel discovered (`docs/strange-loops-module-1.md` section 7.2).
- [ ] Run graph-specific tests.
- [ ] Run `npm run check`.

Acceptance criteria:
- The graph is useful even without being visually impressive.
- The `Map` phase motivates invariant reasoning instead of competing with it.
- Users are not invited to treat finite bounded search as a proof of impossibility.

---

## Task 4: Deepen Artifacts Into a Real Notebook

**Purpose:** Make saved work easier to review, reuse, compare, and curate across multiple sessions.

**Files:**
- Modify: `src/lib/state/module1.ts`
- Modify: `src/lib/state/module1Artifacts.ts` (created in Task 1)
- Modify: `src/lib/state/module1Artifacts.spec.ts`
- Modify: `src/lib/components/phases/PhaseReflect.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Modify only if a storage-level change proves necessary (default expectation: no change): `src/lib/server/persistence.ts`, `src/lib/server/persistence.spec.ts`, `src/routes/api/modules/[slug]/artifacts/+server.ts`
- Test: `npm run test -- src/lib/state/module1.spec.ts src/lib/state/module1Artifacts.spec.ts src/lib/server/persistence.spec.ts`
- Test: `npm run smoke:persistence -- http://127.0.0.1:4175` (see Verification Checklist for server and temp-database setup)

- [ ] Define a clearer artifact taxonomy for `note`, `trace`, `invariant-run`, `proof-attempt`, and `dialogue`, extending the `module1Artifacts.ts` module created in Task 1. (Title and payload construction already moved out of `+page.svelte` in Task 1 — do not redo it.)
- [ ] Add notebook filters by artifact type. Filter client-side over the already-loaded artifact list; with a single local user and small artifact counts there is no reason to grow the API surface.
- [ ] Add compact review metadata, such as restore target, current string, candidate invariant, and created time. Derive these from the stored payload at read time; do not change the storage schema for them.
- [ ] Consider optional confidence or confusion tagging only if it supports reflection; do not add score-like metrics.
- [ ] Add tests for artifact normalization, filtering, title construction, and restore-target behavior.
- [ ] Only if a storage schema change proves genuinely necessary: version it with `pragma user_version` inside `createPersistenceStore`, migrate conservatively, and add a test asserting that rows written in the current format still load after the migration.
- [ ] Run focused state and persistence tests.
- [ ] Run persistence smoke against a preview server and a temporary database path.

Acceptance criteria:
- A user with many saved artifacts can find the relevant one without scanning an undifferentiated list.
- Restoring an artifact makes it clear what live surface changed.
- The notebook stores evidence of understanding, not fake understanding scores.

---

## Task 5: Evaluate and Tune Dialogue Quality

**Purpose:** Determine whether dialogue improves understanding rather than merely adding plausible coaching text.

**Files:**
- Modify: `src/lib/server/dialogue/team.ts`
- Modify: `src/lib/server/dialogue/team.spec.ts`
- Modify: `scripts/smoke_dialogue.mjs`
- Create: `docs/dialogue-evaluation.md`
- Modify if behavior changes: `docs/agent-behavior.md`
- Test: `npm run test -- src/lib/server/dialogue/team.spec.ts`
- Test: `npm run smoke:dialogue -- http://127.0.0.1:4175`

Cost note: every dialogue run shells out to local Claude Code and incurs real
cost and latency. Evaluation must be bounded, not looped until satisfied.

- [ ] Create a small dialogue evaluation rubric in `docs/dialogue-evaluation.md` focused on:
  - invariant preservation;
  - search versus proof;
  - object-level versus meta-level confusion;
  - whether the transcript is worth saving.
- [ ] Draft 5–8 representative learner explanations in `docs/dialogue-evaluation.md`, each annotated with the conceptual weakness it is meant to probe. Synthetic prompts are acceptable for this pass — no real learner transcripts exist until Task 6 — and should be revisited against real transcripts afterward.
- [ ] **User:** review and approve the prompt set and rubric before any tuning runs.
- [ ] Evaluate current dialogue outputs against the rubric, running each approved prompt once, and record transcripts and scores in `docs/dialogue-evaluation.md`.
- [ ] Tune `buildDialoguePrompt` to push on the weakest recurring conceptual step. Limit this pass to at most two evaluate-tune iterations, and record before/after rubric scores.
- [ ] Keep the user-facing mode as one honest `Explain-Back Examiner`.
- [ ] Add tests that assert the prompt includes the key verifier facts and epistemic boundaries.
- [ ] Run focused dialogue tests.
- [ ] Run dialogue smoke only when local Claude Code is installed and authenticated.
- [ ] **User:** review the recorded transcripts and scores, and decide whether dialogue quality is good enough to stop tuning for this pass.

Acceptance criteria:
- Dialogue asks sharper questions about the learner’s actual weak step.
- Dialogue never claims to certify proof correctness.
- Saved dialogue transcripts are useful as reflection artifacts.

---

## Task 6: Run a Module 1 Pedagogical Evaluation Loop

**Purpose:** Decide what actually helped before expanding scope.

> **This task is user-driven.** The evaluation evidence must come from the user
> actually using Module 1. An executing agent must not simulate learner
> sessions, fabricate usage notes, or answer the feedback questions itself —
> that would contaminate exactly the evidence this task exists to produce. The
> agent's role is limited to the steps marked `Agent:`, working strictly from
> the user's recorded notes.

**Files:**
- Create or modify: `docs/module-1-evaluation-notes.md`
- Modify if priorities change: `docs/strange-loops-module-1.md`
- Modify if UX direction changes: `docs/module-1-ux-vision.md`
- Modify if dialogue contract changes: `docs/agent-behavior.md`

- [ ] **User:** use Module 1 from a fresh session and record where understanding improved or stalled.
- [ ] **User:** answer the feedback questions from `docs/strange-loops-module-1.md` section 12.
- [ ] **User:** classify interactions as essential, useful, ornamental, or confusing.
- [ ] Agent: transcribe the user's notes into `docs/module-1-evaluation-notes.md` without editorializing or filling gaps.
- [ ] **User:** decide, with agent support, whether graph, invariant, dialogue, and notebook surfaces deserve further refinement, and whether the deferred items (invalid-move workbench refinement, Explore guided-task tuning) are now warranted.
- [ ] Agent: update Module 1 docs with the evidence-based next priorities, and fold this plan's outcome back into `docs/strange-loops-module-1.md` per the Relationship to Canonical Docs section.
- [ ] Keep Module 2 deferred unless Module 1 has reached durable value.

Acceptance criteria:
- The next roadmap decision is based on observed Module 1 use, not speculative module breadth.
- The evaluation notes record actual user sessions, not simulated ones.
- The docs continue to reflect the actual implementation state.
- Future module planning remains blocked on learning value, not on unresolved Module 1 UX gaps.

---

## Execution Order Reasoning

Tasks are numbered in execution order; no separate ordering applies.

- Task 1 first: the page controller extraction is the smallest maintainability investment that lowers risk for everything after it — Tasks 2, 3, and 4 all touch `+page.svelte`.
- Task 2 next: object/meta framing is the central learning goal.
- Task 3: graph pedagogy should motivate proof rather than decorate the module.
- Tasks 4 and 5: notebook and dialogue quality matter most once the core learning arc is clearer.
- Task 6 last: evaluation determines whether Module 1 is ready for further investment or pruning, and feeds the deferred items.

---

## Verification Checklist

Run after each implementation slice:

```bash
npm run check
npm run test
npm run build
```

Run when persistence behavior changes. Build first; the preview server blocks,
so run it in the background or a second terminal and leave it running while the
smoke script executes. Point it at a temporary database so smoke runs never
touch `data/strange-loops.db`:

```bash
npm run build
STRANGE_LOOPS_DB_PATH="$(mktemp -d)/smoke.db" npm run preview -- --host 127.0.0.1 --port 4175 &
npm run smoke:persistence -- http://127.0.0.1:4175
# stop the preview server when done
```

Run deliberately when local Claude Code is installed and authenticated (it
invokes the local Claude Code CLI and incurs real cost), against the same
running preview server:

```bash
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
- Do not wire LLM calls or LLM judgment into the `Explore` or `Map` surfaces; those phases stay verified/computed only.
- Do not chase the Svelte/Rollup build chunking warning in this pass; it is a known, benign baseline condition.
