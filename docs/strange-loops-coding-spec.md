# Strange Loops Companion — Module 1 Coding Spec for Coding Agents

## Purpose of this spec
This document defines **requirements, behavioral expectations, and validation criteria** for implementing the initial scaffolding and Module 1.

It is intentionally **not** a prescriptive implementation guide.

Coding agents are free to choose internal structure, patterns, and decomposition, provided the delivered system satisfies:
- the functional requirements,
- the epistemic contract,
- the persistence requirements,
- and the test/verification criteria in this document.

---

## 1. Deliverables

The implementation target for this phase includes:

1. application scaffolding sufficient to host modules,
2. persistent state support for module progress and saved artifacts,
3. a working Module 1,
4. one LLM-assisted dialogue mode,
5. a test suite or equivalent verification coverage proving the required behaviors.

---

## 2. Non-negotiable product constraints

## 2.1 Epistemic labeling
The system must distinguish between:
- mechanically verified results,
- LLM-generated coaching or probing.

LLM-only outputs must not be presented as formal proof verification.

## 2.2 Persistence
User work must survive refresh/reload in a way consistent with the chosen architecture.

At minimum, the system must preserve:
- current module state,
- saved derivations,
- invariant exploration artifacts,
- dialogue transcript,
- notes/reflections.

## 2.3 Serious UX
The implementation must support a serious reading/working environment:
- no gamification,
- no scoring systems as primary product logic,
- no decorative interactions that obscure the mathematical workflow.

---

## 3. Functional requirements

## 3.1 Module shell / navigation
The application must provide a stable module container with support for:
- entering Module 1,
- displaying module content and instruments,
- preserving user state,
- extending to future modules without architectural dead ends.

Validation target:
- Module 1 can be entered from a stable root/navigation context,
- returning to the module restores prior state or saved artifacts according to the persistence design.

## 3.2 MIU rule engine
A deterministic rule engine must exist for the MIU system.

Required behaviors:
- represent the current string state,
- enumerate or validate legal next moves,
- apply valid rule transformations correctly,
- reject invalid transformations,
- preserve an auditable record of transitions.

Validation target:
- every legal move supported by the specified MIU rules transforms the string correctly,
- every illegal move is rejected or blocked,
- repeated application produces consistent results.

## 3.3 Derivation trace
The system must maintain an ordered derivation trace.

Required behaviors:
- append each successful transition,
- retain rule identity and application location or equivalent explanatory metadata,
- support stepping backward or jumping to prior states,
- support branching from prior points in a trace.

Validation target:
- trace order is stable,
- restored prior states exactly match historical data,
- branching does not corrupt existing history.

## 3.4 Reachability graph
The system must support graph-based visualization or exploration of reachable states.

Required behaviors:
- unique node identity for identical strings,
- directed edges corresponding to rule applications,
- bounded exploration controls to prevent uncontrolled blowup,
- ability to inspect how a node was reached.

Validation target:
- node duplication does not occur for the same string within a graph snapshot,
- edge labels correspond to actual valid transitions,
- expansion bounds are respected.

## 3.5 Invariant explorer
The system must support invariant-related exploration.

Minimum requirements:
- expose at least one built-in candidate invariant relevant to MU non-reachability,
- evaluate whether candidate properties are preserved under rule application,
- provide explicit evidence when a candidate fails,
- connect preserved invariants to reachability implications in the UI.

Validation target:
- built-in invariant logic returns correct preservation status,
- false candidates produce concrete, valid counterexamples,
- preserved candidates remain preserved across tested transitions.

## 3.6 Dialogue mode
One dialogue mode must exist and be integrated into module context.

Permitted options:
- Explain-Back Examiner
- Socratic Partner

Required behaviors:
- access relevant module context,
- ground prompts in the current conceptual task,
- preserve transcript history,
- clearly label the dialogue as coaching/probing rather than proof certification.

Validation target:
- transcript persists,
- dialogue mode is accessible from Module 1,
- UI labeling distinguishes coaching from verification.

## 3.7 Artifact persistence
The system must persist meaningful user artifacts.

Required artifacts:
- derivation path(s) or saved trace snapshots,
- invariant exploration result(s),
- dialogue transcript,
- user notes or reflection text.

Validation target:
- saved artifacts remain available after reload,
- artifacts remain associated with Module 1,
- artifact restoration does not corrupt the active state.

---

## 4. Non-functional requirements

## 4.1 Determinism where appropriate
The MIU engine and any invariant-verification logic must be deterministic.

Validation target:
- same input state and same rule application always produce the same output.

## 4.2 Bounded behavior
Graph expansion and any potentially explosive exploration must be bounded by explicit controls.

Validation target:
- configured node/depth limits are enforced,
- the UI remains usable under expected exploration patterns.

## 4.3 Explainability
Mechanically verified actions must be inspectable.

Examples:
- why a transition is valid,
- which rule fired,
- where in the string the rule applied,
- why a candidate invariant failed.

Validation target:
- there is no “black box accepted/rejected” behavior for core module actions.

## 4.4 Extensibility
The architecture must not make future modules significantly harder through hard-coded Module 1 assumptions.

Validation target:
- module shell and persistence model can accommodate new modules without structural rewrite,
- core primitives are separated enough to be reusable if needed.

---

## 5. Required test coverage

The implementation must include validation for the following behaviors. The exact test framework and structure are up to the implementation.

## 5.1 MIU engine tests

### Required cases
- initial state is represented correctly,
- each individual MIU rule works on valid examples,
- invalid rule applications are rejected,
- multiple applicable rule locations are handled correctly,
- repeated applications remain consistent,
- edge-case strings do not silently produce invalid transformations.

### Minimum confidence goal
A reader should be able to trust that if the UI says a move is valid, it is valid.

## 5.2 Trace consistency tests

### Required cases
- trace appends in correct order,
- prior states are reconstructible,
- stepping backward restores exact prior state,
- branching creates a new valid continuation without mutating original history.

### Minimum confidence goal
Derivations are stable artifacts, not fragile UI state.

## 5.3 Graph integrity tests

### Required cases
- identical strings map to the same logical node within a graph instance,
- edge metadata correctly identifies source, target, and transition basis,
- bounded expansion respects depth/node limits,
- node inspection returns at least one valid provenance path.

### Minimum confidence goal
The graph represents the derivation structure faithfully.

## 5.4 Invariant logic tests

### Required cases
- built-in invariant relevant to MU is correctly identified as preserved,
- a known non-invariant candidate is correctly rejected,
- counterexample generation or reporting is correct and inspectable,
- preserved status is stable across repeated evaluation.

### Minimum confidence goal
Invariant exploration is mathematically trustworthy at the supported level.

## 5.5 Persistence tests

### Required cases
- saved derivation reloads correctly,
- saved notes reload correctly,
- saved dialogue transcript reloads correctly,
- partially completed work survives refresh/restart per the chosen persistence strategy.

### Minimum confidence goal
The module can serve as an actual working notebook rather than a disposable demo.

## 5.6 Epistemic-labeling tests

### Required cases
- mechanically verified outputs are labeled distinctly from LLM outputs,
- LLM dialogue surfaces cannot be mistaken for formal verification surfaces,
- UI wording does not misrepresent LLM conclusions as certainty.

### Minimum confidence goal
The product does not accidentally lie about what it knows.

## 5.7 Interaction sanity tests

### Required cases
- users can reach the core workflows without dead ends,
- invalid operations produce intelligible feedback,
- graph exploration remains usable within bounded limits,
- the system does not lose work during ordinary navigation.

### Minimum confidence goal
The module is robust enough to be used repeatedly while reading.

---

## 6. Suggested acceptance scenarios

These are end-to-end behavior scenarios the implementation should satisfy.

## Scenario A — Basic derivation workflow
1. User enters Module 1.
2. User starts from MI.
3. User applies several valid rules.
4. Trace updates after each step.
5. User saves or leaves the module.
6. User returns and the derivation remains available.

**Pass condition:** no state corruption; prior work is restorable and legible.

## Scenario B — Invalid move handling
1. User attempts a move that does not correspond to any legal rule application.
2. System rejects or prevents the move.
3. System provides intelligible feedback.

**Pass condition:** invalid moves cannot silently enter the trace or graph.

## Scenario C — Reachability exploration
1. User expands the reachable graph from MI.
2. Repeated strings do not create duplicate logical nodes.
3. User inspects how a chosen node was reached.
4. Expansion remains within limits.

**Pass condition:** graph is faithful, bounded, and inspectable.

## Scenario D — Invariant discovery workflow
1. User explores the system.
2. User inspects or tests candidate invariants.
3. System identifies the built-in relevant invariant as preserved.
4. User views or constructs the argument linking the invariant to MU non-reachability.

**Pass condition:** the system supports the full conceptual move from search to proof.

## Scenario E — Explain-back workflow
1. User opens the dialogue mode.
2. User explains why MU is unreachable.
3. System asks probing questions or highlights missing pieces.
4. Transcript is saved with the module artifacts.

**Pass condition:** dialogue is contextual, persistent, and clearly non-authoritative.

---

## 7. UI/behavior requirements that matter for correctness

These are not aesthetic preferences; they affect whether the module teaches the right thing.

## 7.1 Object-level vs meta-level distinction must be visible
The implementation must make it possible to tell when the user is:
- applying rules inside the formal system,
- versus reasoning externally about the entire reachable set.

This can be achieved in different ways, but it must be clear in the product.

## 7.2 Core actions must be inspectable
When something happens, the user should be able to see:
- what rule was used,
- what changed,
- why it was allowed,
- or why it failed.

## 7.3 Graph should not degrade into noise
If a chosen graph approach becomes unreadable under realistic use, the implementation is not done even if it technically renders nodes and edges.

A usable bounded exploration strategy is part of correctness here.

---

## 8. Out-of-scope guardrails for coding agents

Do not expand this phase into:
- full generalized formal-system builders,
- arbitrary-code execution environments,
- proof-assistant integrations,
- multi-user collaboration,
- scoring or gamification layers,
- later-module concepts unless explicitly requested.

The correct bias is:
- robust,
- bounded,
- inspectable,
- pedagogically honest.

---

## 9. Definition of done

This phase is done when:

1. the app shell is usable,
2. Module 1 is usable as a real study instrument,
3. MIU mechanics are trustworthy,
4. graph exploration is bounded and legible,
5. invariant exploration supports the MU insight,
6. one LLM dialogue mode works and is clearly labeled,
7. user artifacts persist reliably,
8. the tests or validation suite demonstrate the required behaviors.

A visually attractive demo without these guarantees is **not done**.
