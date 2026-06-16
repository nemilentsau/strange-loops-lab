# Strange Loops Lab — Product Architecture

## Document status

This document describes the **current architecture** of the project and the
constraints that should guide the next refinement passes.

It is not a speculative service map. It should match the repo as it exists now
while keeping room for later expansion only where there is a clear reason.

Last updated: June 14, 2026.

---

## 1. Current architectural stance

The product is currently a **single SvelteKit application** running one MIU
instrument, with:

- a TypeScript deterministic formal layer for MIU logic,
- Svelte components and page state for the instrument (the derivation read
  three ways),
- localStorage for trace continuity,
- and a dormant persistence/dialogue stack — server routes, SQLite, and a
  Claude Code-backed coaching path — present in the repo but not wired to the
  instrument.

There is **no separate Python service** in the current implementation.
Future computation boundaries should be earned by concrete complexity pressure,
not introduced because the architecture once imagined them.

---

## 2. Current subsystem map

### 2.1 Application shell
Owned by the SvelteKit app.

Responsibilities:

- the single MIU instrument at the root route `/`,
- composition of the three readings of one object — the derivation,
- local draft/session state and its continuity across reloads,
- and preserving the visual distinction between verified, computed, and coaching surfaces.

The phase-based interaction layer (Explore / Map / Prove / Reflect and its
lab-desk components) is deleted. The app is now a single instrument:
`src/routes/+page.svelte` at `/`, wrapped by a minimal
`src/routes/+layout.svelte` (no site topbar, no module navigation). The page
holds one object — the derivation — and reads it three ways with three
components under `src/lib/components/miu`:

- `MiuSheet.svelte` — manipulate. The page is the derivation: a numbered
  spine, the current string written large with its rule sites as in-string
  click targets, and the four rules always on screen with the exact reason any
  rule cannot fire. It carries `MiuInvariant` in its margin.
- `MiuInvariant.svelte` — the wall. The residue wheel on ℤ/3 with reachability;
  MU is rejected by the invariant (#I ≡ 0 mod 3), a verified negative held
  distinct from a search-bound limit.
- `MiuBridge.svelte` — the bridge. The derivation read as a program, with
  K_MIU as the shortest-derivation length and the compressible/incompressible
  contrast; Kolmogorov and Chaitin are named as the next instrument, not
  claimed here.

This is a presentational and compositional change, not a boundary move: no
state-shape, persistence, dialogue, or MIU-logic boundary shifted. The
phase-based build is superseded as a direction (see
`docs/strange-loops-vision.md` for the architecture going forward and
`docs/module-1-postmortem.md` for the build it replaces and the binding design
law).

### 2.2 Deterministic formal layer
Owned by TypeScript library modules under `src/lib/miu`: `core.ts`, `graph.ts`,
`invariants.ts`, and `complexity.ts`.

Responsibilities:

- MIU rule legality and move enumeration (`core.ts`),
- derivation trace behavior (`core.ts`),
- bounded reachability exploration (`graph.ts`),
- invariant analysis for supported candidates (`invariants.ts`),
- shortest-derivation / descriptional complexity (`complexity.ts`):
  `shortestDerivation` computes K_MIU by bounded BFS over the rewrite graph and
  returns one of three outcomes — `found` with the shortest path,
  `unreachable-invariant` as a verified negative, or `exhausted` as an honest
  search horizon tagged with which bound stopped it (`depth` or `nodes`),
- and explicit rejection of invalid user proposals.

This layer is the current verifier boundary. If the UI says something is a
legal MIU move or a preserved supported invariant, this layer should be the
reason that claim is trustworthy.

### 2.3 Client API layer (dormant)
Owned by TypeScript modules under `src/lib/client` (`module1Api.ts`). Present
in the repo but not wired to the instrument.

Responsibilities (as built):

- wrapping each server API call (snapshot GET/PUT, artifacts GET/POST, dialogue POST) in a small typed helper that takes `fetch` as a parameter,
- normalizing API responses into domain types via the existing `normalizeModule1Draft` / `normalizeModule1Artifact(s)` functions,
- and signalling success or failure with typed discriminated-union results so a caller can map them to status strings without embedding fetch logic inline.

This layer does not set UI status strings or contain reactive state. The
instrument does not call it today; it persists continuity through localStorage
(see §4).

### 2.4 Persistence layer (dormant)
Owned by server-side TypeScript under `src/lib/server` (`persistence.ts`) and
the API routes `src/routes/api/modules/[slug]/{snapshot,artifacts}`, backed by
SQLite at `data/strange-loops.db`. The state shim is
`src/lib/state/module1Artifacts.ts`. Present in the repo but not wired to the
instrument.

Responsibilities (as built):

- SQLite-backed draft snapshots,
- saved artifacts,
- artifact listing and creation,
- and restoring saved work into a Module 1 surface.

The persistence model is intentionally artifact-first rather than event-log
heavy. The goal is continuity of thinking, not exhaustive telemetry. When it is
re-wired (see §6), it should keep that posture.

### 2.5 Dialogue layer (dormant)
Owned by server-side orchestration around local Claude Code under
`src/lib/server/dialogue` (`team.ts`), reached through
`src/routes/api/modules/[slug]/dialogue`. Present in the repo but not wired to
the instrument.

Responsibilities (as built):

- collect structured Module 1 context,
- run the coaching flow,
- persist dialogue transcripts as artifacts,
- and return coaching output clearly separated from verifier-backed results.

This layer is pedagogical, not authoritative. It must not silently claim
verifier status.

---

## 3. Output classes

The architecture must preserve three distinct output classes:

### Verified
Mechanically checked results from the formal layer.

Examples:

- legal MIU moves,
- derivation transitions,
- bounded graph edges,
- supported invariant preservation results.

### Computed
Deterministic but model-like outputs that summarize or restructure verified
state rather than asserting new formal truth.

Examples:

- bounded graph views,
- node/path summaries,
- the residue and shortest-derivation readouts derived from current state.

### Coaching
LLM-driven questioning, reflection, and proof-sharpening.

Examples:

- explain-back prompts,
- dialogue follow-ups,
- clarification of a likely weak step.

The UI should never flatten these into one undifferentiated “assistant”
channel.

---

## 4. Current data flow

1. The user manipulates the derivation in the instrument: applies a rule at a
   site, jumps to a step, or sets the reachability target.
2. Page state updates the local draft (`Module1Draft`).
3. Deterministic MIU logic runs in-process: `core.ts` for legality and trace,
   `invariants.ts` for the residue, `complexity.ts` for the shortest
   derivation. Each reading renders directly from that result.
4. On change, the page writes a continuity subset of the draft to localStorage
   (`writeModule1Draft`) and reads it back on load (`readModule1Draft`), so a
   reload restores the trace in progress.
5. The verified, computed, and coaching distinction is preserved in the UI, but
   only verified and computed surfaces are live; the instrument produces no
   coaching output today.

The persistence and dialogue routes (§2.4, §2.5) still exist and still work,
but the instrument does not call them; continuity is localStorage-only. Any new
boundary should make this flow clearer or more reliable, not merely more
“architectural.”

---

## 5. Ownership rules

### 5.1 The app shell owns product flow
SvelteKit should remain the center of gravity for:

- route structure,
- page composition,
- instrument composition,
- API endpoints,
- and user-facing orchestration.

It should not become a thin wrapper around a speculative backend split.

### 5.2 The formal layer owns checkable truth
Any claim that can be checked mechanically should live in deterministic code,
not in the dialogue layer.

### 5.3 Persistence owns continuity, not pedagogy
Persistence should retain meaningful artifacts and drafts. It should not decide
what the proof means or which explanation is correct.

### 5.4 Dialogue owns probing and reflection
Dialogue may question, summarize, or sharpen reasoning. It does not certify
proofs or define the formal rules of the module.

---

## 6. Current implementation posture

The project is no longer just scaffolding. The current architecture supports:

- a single MIU instrument at `/` — the derivation read three ways
  (manipulate / wall / bridge),
- a functioning formal engine, now including shortest-derivation / K_MIU,
- localStorage continuity for the trace in progress,
- and a dormant persistence and dialogue stack kept whole behind the API
  routes, not wired to the instrument.

The instrument is built. The next work is the next architectural pressure, not
expansion of the current one:

- the next candidate bridge — the invariant ↔ expressivity wall — and whether a
  second instrument (pq, tq) can share enough structure to extract a boundary
  without bending the single-object shape,
- and whether and when to re-wire persistence (and, after it, dialogue) to the
  instrument, or to let localStorage continuity stand until a second instrument
  forces the question.

---

## 7. Rules for future expansion

### 7.1 Do not add a separate computation service by default
Introduce a Python or other external computation boundary only if at least one
of the following becomes true:

- the deterministic formal logic becomes materially harder to maintain in TypeScript,
- the project needs a library ecosystem that TypeScript cannot provide cleanly,
- the computation cost or isolation need clearly exceeds in-process execution,
- or multiple modules start sharing a formal engine that deserves its own boundary.

### 7.2 Let current instruments force architecture
Architecture changes should solve observed pressure from the current MIU
instrument or the next Arc 1 instrument. Future module ideas do not justify
premature service decomposition.

### 7.3 Preserve artifact-first persistence
If persistence grows, it should still privilege reusable artifacts, drafts, and
reflection notes over fine-grained behavioral exhaust.

### 7.4 Keep epistemic separation visible
If future modules add richer search, encoders, evaluators, or proof scaffolds,
the architecture should still keep deterministic truth and coaching visibly distinct.

---

## 8. Architectural non-goals

For the current stage, avoid:

- backend-heavy decomposition for its own sake,
- a generic theorem API,
- a Python service that becomes the political center of the app,
- collapsing verifier and dialogue responsibilities,
- treating artifact persistence as analytics infrastructure,
- or adding infrastructure for future modules before an instrument earns it.

---

## 9. Active document map

Use the docs as follows:

- `README.md`: high-level project overview and current build posture
- `docs/strange-loops-vision.md`: the vision and build reference (dependency graph, four arcs, the conceptual move)
- `docs/module-1-postmortem.md`: the Module 1 build postmortem and binding design law
- `docs/agent-behavior.md`: current agent role, boundaries, and prompt contract

This architecture doc should stay synchronized with that smaller current set.
