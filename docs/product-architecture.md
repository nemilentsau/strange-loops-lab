# Strange Loops Lab — Product Architecture

## Document status

This document describes the **current architecture** of the project and the
constraints that should guide the next refinement passes.

It is not a speculative service map. It should match the repo as it exists now
while keeping room for later expansion only where there is a clear reason.

Last updated: March 28, 2026.

---

## 1. Current architectural stance

The product is currently a **single SvelteKit application** with:

- a TypeScript deterministic formal layer for MIU logic,
- Svelte components and page state for the module experience,
- server routes for persistence and dialogue orchestration,
- SQLite for snapshots and artifacts,
- and a Claude Code-backed coaching path for dialogue.

There is **no separate Python service** in the current implementation.
Future computation boundaries should be earned by concrete complexity pressure,
not introduced because the architecture once imagined them.

---

## 2. Current subsystem map

### 2.1 Application shell
Owned by the SvelteKit app.

Responsibilities:

- route structure and module entry points,
- phase navigation and UI composition,
- local draft/session state,
- wiring deterministic outputs, persistence, and dialogue into one module flow,
- and preserving the visual distinction between verified, computed, and coaching surfaces.

### 2.2 Deterministic formal layer
Owned by TypeScript library modules under `src/lib/miu`.

Responsibilities:

- MIU rule legality,
- move enumeration,
- derivation trace behavior,
- bounded reachability exploration,
- invariant analysis for supported candidates,
- and explicit rejection of invalid user proposals.

This layer is the current verifier boundary. If the UI says something is a
legal MIU move or a preserved supported invariant, this layer should be the
reason that claim is trustworthy.

### 2.3 Persistence layer
Owned by server-side TypeScript under `src/lib/server` and API routes.

Responsibilities:

- SQLite-backed draft snapshots,
- saved artifacts,
- artifact listing and creation,
- and restoring saved work back into the live Module 1 surfaces.

The persistence model is intentionally artifact-first rather than event-log
heavy. The goal is continuity of thinking, not exhaustive telemetry.

### 2.4 Dialogue layer
Owned by server-side orchestration around local Claude Code.

Responsibilities:

- collect structured Module 1 context,
- run the current coaching flow,
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
- phase guidance derived from current state.

### Coaching
LLM-driven questioning, reflection, and proof-sharpening.

Examples:

- explain-back prompts,
- dialogue follow-ups,
- clarification of a likely weak step.

The UI should never flatten these into one undifferentiated “assistant”
channel.

---

## 4. Current Module 1 data flow

1. The user interacts with a Module 1 surface in the SvelteKit UI.
2. Page state updates the local draft.
3. Deterministic MIU or invariant logic runs in-process via TypeScript modules.
4. If persistence is requested, the app calls its server routes and stores a
   snapshot or artifact in SQLite.
5. If dialogue is requested, the app sends the current structured draft to the
   server dialogue route.
6. The dialogue route invokes the Claude-backed coaching flow and stores the
   resulting transcript as an artifact.
7. The UI renders deterministic and coaching outputs in separate labeled
   surfaces.

This flow is already sufficient for Module 1. Any new boundary should make this
flow clearer or more reliable, not merely more “architectural.”

---

## 5. Ownership rules

### 5.1 The app shell owns product flow
SvelteKit should remain the center of gravity for:

- route structure,
- page composition,
- module phase flow,
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

The project is no longer just scaffolding. The current architecture already
supports:

- a live Module 1 route,
- a functioning formal engine,
- saved artifacts and snapshots,
- notebook restore/reopen flow,
- and Claude-backed reflection/coaching.

The next work is refinement, not architectural expansion. The main architectural
pressures now are:

- making the object-level / meta-level split more visible,
- improving graph pedagogy,
- improving notebook review and artifact curation,
- and evaluating dialogue quality against real usage.

---

## 7. Rules for future expansion

### 7.1 Do not add a separate computation service by default
Introduce a Python or other external computation boundary only if at least one
of the following becomes true:

- the deterministic formal logic becomes materially harder to maintain in TypeScript,
- the project needs a library ecosystem that TypeScript cannot provide cleanly,
- the computation cost or isolation need clearly exceeds in-process execution,
- or multiple modules start sharing a formal engine that deserves its own boundary.

### 7.2 Keep Module 1 as the forcing function
Architecture changes should solve observed Module 1 problems first. Future
module ideas do not justify premature service decomposition.

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
- or adding infrastructure for future modules before Module 1 earns it.

---

## 9. Active document map

Use the docs as follows:

- `README.md`: high-level project overview and current build posture
- `docs/strange-loops-module-1.md`: canonical Module 1 specification, status, and improvement plan
- `docs/module-1-ux-vision.md`: supporting UX direction for Module 1
- `docs/agent-behavior.md`: current agent role, boundaries, and prompt contract
- `docs/strange-loops-vision.md`: long-term conceptual roadmap beyond Module 1

This architecture doc should stay synchronized with that smaller current set.
