# product-architecture.md

## Purpose

This document defines the product architecture for **Strange Loops**.

It is a system-boundary document, not a low-level implementation guide.
The goal is to make component ownership, data flow, and architectural
constraints explicit early, so the project can grow without collapsing into
either:
- an overengineered backend-heavy application, or
- a UI-heavy prototype with no clean path to deeper formal machinery.

This architecture is designed for iterative development:
start with scaffolding and Module 1, then expand only when the product proves
where complexity is justified.

---

## 1. Architectural stance

The recommended architecture is:

- **SvelteKit as the application shell**
- **A separate Python computation engine**
- **A persistence layer for user state and artifacts**
- **A mechanical verifier / rule engine for checkable claims**
- **An AI agent layer for dialogue and conceptual guidance**

### Core principle
The project is an **interactive product first**, not a generic theorem API,
and not a chatbot with some widgets attached.

That means:
- SvelteKit owns the product experience,
- Python owns computation that genuinely benefits from Python,
- the verifier owns deterministic correctness checks,
- and the AI agent owns guidance, not formal truth.

---

## 2. High-level subsystem map

The system should be thought of as five cooperating layers.

### 2.1 Application layer
**Owned by:** SvelteKit

Responsibilities:
- routing and page/module structure,
- layouts and navigation,
- rendering expository content,
- rendering interactive instruments,
- coordinating user actions,
- managing session-aware product behavior,
- exposing app-facing endpoints,
- integrating persistence and backend services,
- and presenting verifier / agent outputs coherently.

This is the product shell. It should remain the center of gravity.

---

### 2.2 Computation engine
**Owned by:** Python service

Responsibilities:
- symbolic or formal computations that are more natural in Python,
- graph/search tasks once they become nontrivial,
- parser/transform utilities,
- encoding/decoding logic for later modules,
- evaluator/reducer helpers for formal systems,
- and other computation-heavy logic that benefits from Python libraries.

The Python service is **not** the entire backend.
It is a specialized engine.

It should expose narrow, purposeful capabilities rather than generic CRUD ownership.

---

### 2.3 Verifier / deterministic formal layer
**Owned by:** mechanical engine, wherever most appropriate

Responsibilities:
- rule application validation,
- derivation-step validation,
- deterministic evaluator/reducer stepping,
- invariant-preservation checking when algorithmically defined,
- and any claim the system can check without heuristic language modeling.

This layer exists to protect epistemic integrity.
If something can be mechanically checked, it should be.

For Module 1, this layer is especially important because:
- MIU rule validity is fully checkable,
- derivation correctness is fully checkable,
- and candidate invariant testing can be explicit.

---

### 2.4 Agent layer
**Owned by:** AI service / orchestration layer

Responsibilities:
- Socratic questioning,
- explain-back probing,
- proof coaching,
- artifact-aware reflection,
- and structurally justified cross-domain connections.

The agent is a guide, not a verifier.

It should receive structured runtime context from the application layer and,
where appropriate, verifier outputs so it can reason within explicit boundaries.

---

### 2.5 Persistence layer
**Owned by:** app infrastructure

Responsibilities:
- user progress,
- module completion / visitation state,
- sandbox states,
- dialogue transcripts,
- saved artifacts,
- user notes,
- self-assessed confidence if included,
- and lightweight configuration state.

Persistence should support continuity without forcing a heavyweight data model too early.

---

## 3. Ownership rules

These rules are important because the project can otherwise drift into messy responsibility overlap.

### 3.1 SvelteKit owns the product
SvelteKit should own:
- route structure,
- page composition,
- interaction orchestration,
- user-facing APIs,
- session-level behavior,
- and the integration point between instruments, persistence, verifier, and agent.

It should not become a thin display wrapper around a monolithic backend.

### 3.2 Python owns specialized computation
Python should own logic when at least one of the following is true:
- the computation materially benefits from Python libraries,
- the logic is formal/symbolic and likely to grow in complexity,
- the engine will be reused across modules,
- or the computation deserves its own boundary for clarity.

Python should not automatically own every feature just because it is powerful.

### 3.3 The verifier owns correctness checks
Any claim that can be checked deterministically should be owned by the verifier layer.
The AI agent must not silently assume verifier authority.

### 3.4 The agent owns interpretation and pedagogy
The agent should own:
- questions,
- conceptual feedback,
- explanation sharpening,
- and connection surfacing under the connection-quality gate.

The agent should not own:
- formal validity,
- persistence logic,
- or broad orchestration of product state.

---

## 4. Why this architecture instead of the alternatives

### 4.1 Why not SvelteKit-only?
A pure SvelteKit architecture is simpler in the short term, but risks pain later if:
- symbolic computation grows,
- graph/search tooling deepens,
- proof-related utilities expand,
- or you want to leverage Python’s math/logic ecosystem.

The project vision points toward at least some meaningful Python-backed capabilities.
Ignoring that now would create migration friction later.

### 4.2 Why not full Svelte frontend + FastAPI backend from day one?
That architecture is cleaner for a conventional product, but too heavy for the current exploratory phase.

Risks:
- backend-first overdesign,
- unnecessary CRUD/API ceremony,
- blurred ownership between app shell and backend,
- slower iteration on module UX,
- and premature infrastructure complexity.

The project does not need “a backend” so much as it needs:
- a coherent app shell,
- and a clean computation boundary.

### 4.3 Why the hybrid is the right fit
This architecture preserves:
- **fast iteration now**,
- **room for formal depth later**,
- **clear product ownership**,
- and **epistemic separation between guidance and correctness**.

---

## 5. Request and data flow

### 5.1 User interaction flow
1. The user interacts with a module instrument in the UI.
2. The application layer updates the local interaction state.
3. If deterministic validation is needed, the application invokes the verifier/mechanical layer.
4. If deeper computation is needed, the application calls the Python engine.
5. If dialogue support is needed, the application assembles structured context and calls the AI agent.
6. Results are rendered back into the module experience with explicit distinction between:
   - verified outputs,
   - computed outputs,
   - and AI guidance.
7. Relevant artifacts or progress may be persisted.

### 5.2 Important distinction
The UI should never flatten these different output types into one undifferentiated response channel.

The product should make it visually and conceptually clear whether the user is seeing:
- a mechanically checked fact,
- a computed transformation/result,
- or a coaching response from the agent.

---

## 6. Context passed to the agent

The agent should not be given raw chat alone.
It should receive structured context such as:

- current module identifier,
- current subview / instrument,
- recent user actions,
- current sandbox summary,
- relevant verifier outputs,
- relevant saved artifacts,
- active dialogue mode,
- and the user’s current question or explanation.

This improves grounding and reduces generic tutoring behavior.

---

## 7. Module 1 architecture implications

Module 1 should shape the first version of the architecture.

### Module 1 requires:
- an MIU state model,
- rule application validation,
- derivation graph exploration,
- invariant testing support,
- one agent mode,
- and artifact persistence.

### Likely ownership for Module 1
**Application layer / SvelteKit**
- page structure,
- MIU UI,
- derivation graph presentation,
- artifact UX,
- mode switching,
- persistence orchestration.

**Verifier / formal layer**
- whether a rule application is valid,
- derivation-step correctness,
- candidate transformation legality.

**Python engine**
Optional for the earliest cut, but useful if you want:
- search strategies,
- reusable graph analysis,
- or clean separation of formal state-space exploration logic.

**AI agent**
- explain-back or Socratic guidance,
- grounded in actual user exploration state.

### Important note
Module 1 does **not** require a fully developed Python-heavy backend.
The architecture should allow Python to exist without forcing everything through it.

---

## 8. Persistence model guidance

Persistence should focus on meaningful continuity.

Recommended persisted categories:
- module progress,
- last-opened state per module,
- sandbox snapshots,
- derivation traces,
- saved user explanations,
- confusion notes,
- dialogue transcripts or summaries,
- and lightweight preferences.

### Persistence design principle
Persist **artifacts**, not noise.

The system should prefer saving:
- a refined explanation,
- a useful derivation trace,
- a marked confusion,
- or an insight note

over storing every tiny transient event forever.

---

## 9. Verifier design guidance

The verifier is a conceptual role even if implemented across multiple pieces.

### Verifier responsibilities should include:
- exact rule legality,
- exact transition legality,
- formal syntax constraints where relevant,
- deterministic evaluator semantics,
- and any unambiguous finite check the system can perform.

### Verifier design principle
If the system labels something as valid, it should be valid for a precise reason.

For Module 1, verifier-backed guarantees should be especially visible.
This sets the intellectual tone for the whole project.

---

## 10. Python engine design guidance

The Python engine should be narrow and purposeful.

### Good early candidates for Python ownership
- graph expansion/search helpers,
- invariant search experimentation,
- symbolic transformations,
- encoding helpers for future modules,
- structured formal-object utilities,
- and reusable engines that are awkward or brittle in TypeScript.

### Anti-pattern to avoid
Do not turn the Python service into:
- the owner of user/session state,
- a giant generic REST surface,
- or the place where all logic gets dumped by default.

The Python service should feel like a computation engine, not the app’s political center.

---

## 11. Agent integration guidance

The agent should be invoked as part of the module experience, not as a detached global chat.

### Good invocation pattern
The application layer collects:
- current module context,
- recent user actions,
- verifier outputs,
- artifact summaries,
- and current dialogue mode,

then passes this to the agent.

### Agent design principle
The agent should respond to **what the user is doing now**, not to an abstract imagined learner.

### UI requirement
Agent responses should visually reflect their mode:
- Socratic,
- Explain-back,
- Proof coach,
- Connection.

This makes the interaction legible and prevents “one blob of AI text” syndrome.

---

## 12. Connection architecture

Because the project explicitly wants non-gimmicky links to mathematics and computer science,
the architecture should support structured connections.

### Suggested model
Connections should be represented with metadata such as:
- source module,
- target domain/topic,
- connection type,
- mapping summary,
- strength classification,
- and unlock conditions.

### Connection types
- shared invariant,
- shared proof template,
- shared fixed-point construction,
- reduction,
- direct theorem relation,
- weak analogy.

Only the strong types should appear in core module flow.
Weak analogy belongs in a clearly labeled sidebar or optional note.

---

## 13. UI architecture principles

### 13.1 Make epistemic status visible
The product should make it easy to tell:
- what is verified,
- what is computed,
- what is explanatory,
- and what is speculative.

### 13.2 The instrument should remain primary
The user should be interacting with the mathematical object or formal process,
not just reading explanations.

### 13.3 Dense but readable
The design can be typographically rich and serious, but the interaction must remain legible.
A mathematically mature aesthetic is good; obscurity is not.

### 13.4 Artifacts matter
The UI should let users retain the outputs of their thinking:
- explanations,
- derivations,
- notes,
- and conceptual distinctions.

---

## 14. Deployment and scaling stance

This project should begin with a deployment posture optimized for iteration.

### Early-stage priorities
- simplicity,
- observability,
- low-friction updates,
- and preserving clean boundaries.

### Scaling principle
Scale the Python engine and formal machinery when module demands justify it,
not because the architecture is trying to look impressive from day one.

---

## 15. Architectural non-goals

For the early phases, the architecture should explicitly avoid:

- backend-heavy abstraction for its own sake,
- turning the AI agent into the source of formal truth,
- coupling all logic to one service boundary,
- premature theorem prover integration,
- arbitrary code execution infrastructure,
- and social/product complexity that does not improve the learning experience.

---

## 16. Acceptance criteria

The architecture is successful if:

1. The product still feels like a coherent interactive application rather than a stitched-together collection of services.

2. It is clear which subsystem owns:
   - product flow,
   - deterministic correctness,
   - specialized computation,
   - dialogue,
   - and persistence.

3. Module 1 can be built without unnecessary infrastructure drag.

4. The system has a clean path to later modules involving encoding, fixed points, incompleteness, and information theory.

5. The agent and verifier remain epistemically distinct.

6. Python can be added where it helps without swallowing the whole product.

7. The architecture supports iterative learning from real usage rather than enforcing a rigid backend-first design.

---

## 17. Recommended near-term implementation posture

For the next phase, the practical posture should be:

- build the product shell in SvelteKit,
- define a narrow computation boundary for Python,
- make verifier-backed checks explicit,
- wire in one dialogue mode with structured context,
- persist a small number of meaningful artifacts,
- and let Module 1 teach you what the next architectural pressure points actually are.

This keeps the architecture honest.

The project should earn its complexity.
