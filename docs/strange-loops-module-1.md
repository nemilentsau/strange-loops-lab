# Strange Loops Lab — Module 1 Specification and Status

## Document status
This document now serves two purposes:

- the conceptual specification for Module 1,
- a status tracker for what is already implemented in the current build.

Last updated: March 9, 2026.

## Module title
**Module 1: Formal Systems & Their Walls**

## Purpose
This is the first live module and the first serious test of the entire project.

The job of Module 1 is not to be flashy. Its job is to prove that interactive scaffolding can materially improve understanding while reading GEB.

Module 1 should make the following insight tangible:

> A formal system can generate strings internally, but some truths about that system become visible only when you step outside it and reason at the meta-level.

The MIU system is the concrete vehicle for this.

---

## 0. Current implementation snapshot

### Implemented in the current build
- root SvelteKit application shell with a Module 1 route
- deterministic MIU rule engine
- MIU sandbox with legal-next-move enumeration
- derivation trace with jump, restart, undo, and branching from prior states
- bounded derivation graph explorer with provenance display
- invariant explorer with:
  - built-in MU non-reachability argument,
  - custom modular candidates of the form `count(I) mod k = r` and `!= r`,
  - concrete counterexamples when a candidate fails
- SQLite-backed snapshots and saved artifacts
- Claude Code agent-team dialogue mode
- local smoke scripts for persistence and dialogue flows

### Present but still shallow
- object-level vs meta-level framing exists in copy and panel structure, but not yet as a strong dedicated proof workflow
- dialogue mode is usable, but still needs quality evaluation and refinement against real learner transcripts
- artifact persistence works, but artifact types are still basic and not yet shaped into a strong learning notebook

### Highest-priority remaining work
- proof-mode workflow that helps the user assemble an actual invariant argument
- stronger UI treatment of the object-level / meta-level split
- explicit invalid-move demonstration instead of prevention-only UI
- task structure and reflection prompts that make the module feel more guided
- post-build pedagogical evaluation before committing to Module 2

---

## 1. Learning goals

By the end of this module, a user should be able to:

1. operate inside the MIU system by applying rules correctly,
2. explore the reachable-state space rather than only following isolated derivations,
3. distinguish between:
   - derivation within the system,
   - proof about the system,
4. understand why MU is unreachable,
5. explain the role of an invariant in proving non-reachability,
6. see the first version of the object-level / meta-level split that later powers Gödel.

This module is successful if it makes that shift feel operational rather than rhetorical.

---

## 2. Conceptual thesis of the module

The central lesson is not “here is a puzzle trick.”

The central lesson is:

- local symbolic rules can generate a large internal world,
- but the structure of that world may only become visible from a different descriptive frame,
- and that is the beginning of the strange-loop story.

The MIU system is the smallest laboratory for that move.

---

## 3. Scope

## In scope
- MIU sandbox with valid rule application
- derivation trace
- derivation graph / reachability explorer
- invariant explorer
- one LLM-supported dialogue mode
- artifact persistence
- concise exposition and conceptual framing
- connections to:
  - string rewriting systems
  - graph search / state-space explosion
  - invariants as preserved quantities

Current status:
- everything in this section exists in at least a first-pass implementation
- the main remaining gaps are pedagogical depth, proof assembly, and stronger framing rather than raw feature absence

## Out of scope for Module 1
- generalized theorem proving
- arbitrary user-defined formal systems beyond a very limited toy extension
- full connection engine UI
- multi-user features
- scoring systems
- advanced proof assistants
- later-module content like diagonalization, quines, Gödel numbering, or halting

---

## 4. User experience goals

The module should feel like a laboratory with three working surfaces:

1. **Do**
   - manipulate the MIU system,
   - apply rules,
   - generate derivations.

2. **See**
   - watch the derivation graph grow,
   - understand branching and repetition,
   - feel state-space growth.

3. **Step outside**
   - test candidate invariants,
   - compare what the system can derive versus what an external proof can establish.

The module should visibly support moving between these layers.

---

## 5. Content structure

## 5.1 Opening frame
A short opening should establish:
- what the MIU system is,
- what counts as a legal move,
- why formal systems are interesting,
- what question will anchor the module: **Can MI become MU?**

Do not over-explain. Let interaction do the work.

## 5.2 Sandbox phase
The user should be able to:
- start from MI,
- apply rules,
- build a trace,
- inspect each move.

The UI should make rule applications feel crisp and explicit.

## 5.3 Reachability phase
The user should move from a single derivation to a graph view:
- nodes are strings,
- edges are rule applications,
- repeated states should be recognized,
- graph growth should make the reachable-set structure feel concrete.

## 5.4 Invariant phase
After exploration, the module should pivot:
- maybe MU is not merely hard to find,
- maybe it is impossible,
- maybe a preserved quantity explains why.

This is where the candidate invariant workflow enters.

## 5.5 Reflection phase
The user should articulate:
- why internal exploration is insufficient,
- what the invariant is,
- why the proof lives at the meta-level.

This phase is a good fit for explain-back or Socratic dialogue.

Current status:
- dialogue-assisted reflection exists
- explicit proof assembly and reflective prompts still need to be made more structured

---

## 6. Functional features

## 6.1 MIU sandbox
Required behaviors:
- present current string,
- allow rule application only where valid,
- show exactly which rule was applied,
- maintain ordered derivation history,
- allow undo / step-back,
- allow restart from MI,
- allow branching from earlier states.

Useful extras if cheap:
- highlight the substring affected by a rule,
- support click-to-apply on matching regions,
- show all applicable next moves.

Current build notes:
- all applicable next moves are shown
- history branching, undo, and restart are implemented
- invalid moves are mostly prevented rather than entered and explained after the fact

## 6.2 Derivation trace viewer
Required behaviors:
- show the full ordered derivation path,
- label each step with rule and location,
- let the user jump back to any previous state,
- support branching from prior steps.

The trace should make derivations legible rather than ephemeral.

## 6.3 Derivation graph / reachability explorer
Required behaviors:
- represent states as nodes and rule applications as directed edges,
- prevent duplicate nodes for identical strings,
- support bounded expansion by depth / node count,
- make it easy to inspect how a node was reached,
- reveal branching structure and repeated patterns.

Nice-to-have behaviors:
- search for a target string,
- highlight shortest known path to a selected node,
- support filters by depth or rule type.

Current build notes:
- bounded exploration, deduplicated nodes, and provenance inspection are implemented
- the explorer is useful, but still needs stronger pedagogical guidance so it teaches rather than merely exposes state growth

## 6.4 Invariant explorer
Required behaviors:
- present at least one built-in invariant argument tied to the MIU problem,
- allow testing candidate invariants on rule behavior,
- display whether a candidate is preserved under each rule,
- if a candidate is not preserved, provide a concrete counterexample,
- connect invariant results back to reachability / non-reachability.

Candidate invariant families for early support:
- count(I) mod k
- parity-like properties
- simple symbol counts
- suffix/prefix predicates where relevant

The exact implementation can start narrow. What matters is that the user can experience:
- proposing a structural property,
- checking preservation,
- using that preservation to reason globally.

Current build notes:
- the implementation is intentionally narrow and focused on modular `I`-count invariants
- this is sufficient for Module 1’s main proof idea, but broader candidate families should wait until there is evidence they improve understanding

## 6.5 Meta-level framing
The UI should mark the shift between:
- **Inside the system**  
  applying formal rules

and
- **Outside the system**  
  proving facts about the full space of derivations

This distinction should not be hidden in prose alone. It should be reinforced by layout or mode.

Current build notes:
- this distinction is present conceptually, but not yet forceful enough in the interface
- a dedicated proof-mode or side-by-side object/meta panel is still needed

## 6.6 Dialogue mode
Only one LLM mode is required initially.

Recommended default:
- **Explain-Back Examiner**

Example use:
- the user explains why MU is unreachable,
- the system probes for missing logic,
- the dialogue exposes whether the user really understands:
  - the invariant,
  - preservation under rules,
  - why this is meta-level reasoning.

Alternative acceptable choice:
- Socratic mode

Do **not** implement both initially unless one is nearly free.

Current build notes:
- the current build has a functioning Claude Code dialogue path backed by a small agent team
- dialogue is persisted as an artifact
- the next issue is dialogue quality and fit, not basic availability

## 6.7 Artifact persistence
Persist at least:
- latest sandbox state,
- saved derivation paths,
- graph exploration state or snapshots,
- invariant tests attempted,
- dialogue transcript,
- notes / reflections,
- user-entered confidence note if included.

Current build notes:
- latest module snapshot persistence exists
- dialogue artifacts exist
- notes and graph/invariant state are included in persisted draft state
- artifact taxonomy and reuse still need work

---

## 7. Pedagogical requirements

## 7.1 The module must not overstate the lesson
It should not imply that formal systems are useless from the inside.

The point is subtler:
- internal derivation is real and important,
- but some global truths become visible only through meta-level reasoning.

## 7.2 The invariant should feel discovered, not merely announced
Even if the module eventually reveals the key invariant, it should first create the conditions where the user feels:
- search pressure,
- pattern suspicion,
- and the need for a global explanation.

## 7.3 The graph should teach, not decorate
The derivation graph is justified only if it helps users feel:
- branching,
- duplication,
- explosion,
- and the limits of brute-force search.

If it turns into ornament, simplify it.

## 7.4 The LLM should interrogate understanding, not impersonate certainty
Any LLM commentary should be framed as:
- questioning,
- coaching,
- identifying likely gaps,
not as final mathematical authority.

---

## 8. Connections to mathematics and CS for this module

These are the connections that belong in Module 1 because they are structurally real and immediately useful.

## 8.1 String rewriting systems
The MIU system can be presented as a string rewriting system.

Why it belongs:
- identical object type,
- identical local-rule dynamic,
- immediately clarifies that MIU is not an isolated curiosity.

Possible UI:
- optional alternate notation showing rules as rewrites,
- highlight the rewritten span on each step.

## 8.2 Graph search and state-space explosion
The derivation space is a state graph.

Why it belongs:
- this is exactly what the graph view is modeling,
- it naturally introduces search limits and combinatorial growth.

Possible UI:
- bounded BFS-like or incremental expansion,
- visual emphasis on repeated states and branching.

## 8.3 Invariants as preserved quantities
The non-reachability proof is an invariant proof.

Why it belongs:
- this is the core conceptual move of the module,
- it generalizes far beyond MIU.

Possible UI:
- test candidate properties against each rule,
- display preservation failures with counterexamples.

## 8.4 Algebraic view of invariants
A later enhancement may frame certain invariants as algebraic mappings into small structures such as modular classes.

Why it belongs:
- it explains why modular arithmetic is the right external lens,
- it previews how algebra can summarize symbolic dynamics.

This should remain lightweight in Module 1.

---

## 9. Information architecture / suggested layout

One workable layout is:

### Left pane
- concise exposition
- current question / prompt
- connection notes
- user notes

### Center pane
- primary interactive surface
- either sandbox or graph explorer depending on mode

### Right pane
- derivation trace
- invariant diagnostics
- dialogue / explain-back panel

Alternative layouts are fine, but the user must be able to move fluidly between:
- local rule application,
- global structure,
- reflective explanation.

---

## 10. Data model needs (conceptual, not implementation-specific)

Module 1 needs conceptual support for:

- **String state**
  - the current MIU string

- **Rule application record**
  - from state
  - to state
  - rule identifier
  - location / span
  - timestamp or sequence order

- **Derivation path**
  - ordered sequence of states and transitions

- **Graph state**
  - unique nodes by string
  - edges by rule applications
  - depth or discovery metadata

- **Invariant test record**
  - candidate invariant
  - preservation result by rule
  - counterexample if failed

- **Dialogue transcript**
  - prompt/response pairs
  - linked to module context

- **User notes / reflections**
  - freeform notes
  - optional confidence tag

---

## 11. Acceptance criteria

Module 1 is complete when all of the following are true:

### 11.1 Mechanical correctness
- valid MIU moves are accepted,
- invalid moves are rejected,
- derivation traces are consistent,
- graph nodes and edges accurately reflect rule applications.

### 11.2 Learning workflow completeness
A user can:
1. explore the system from MI,
2. inspect reachable states,
3. test or view an invariant argument,
4. explain why MU is unreachable,
5. save their work.

Status:
- this is substantially true in the current build
- the missing part is turning the existing surfaces into a clearer proof-building workflow

### 11.3 Conceptual clarity
The module makes the following distinction visible and usable:
- derivation inside the system,
- proof about the system.

### 11.4 Artifact quality
A user can leave the module with persistent artifacts that reflect understanding:
- a derivation,
- an invariant result,
- an explanation transcript,
- a reflection note.

### 11.5 UX sanity
The module is usable without:
- guessing how to apply rules,
- losing prior exploration,
- getting buried in graph noise,
- confusing LLM coaching with formal verification.

Status:
- persistence and epistemic separation are in place
- graph noise and proof-assembly clarity still need attention

---

## 12. Feedback questions for the post-build review

After using Module 1 while reading, evaluate:

1. Did the derivation graph genuinely help, or mostly impress visually?
2. Did the invariant explorer make the proof feel clearer, or did it front-run the insight?
3. Was explain-back useful, or was a Socratic questioner the better fit?
4. Did the object/meta distinction become clearer after using the module?
5. Which interaction most changed understanding?
6. Which interaction felt like busywork?
7. What reusable primitive emerged that will help future modules?

The answers to these questions should determine whether Module 2 expands confidently or whether Module 1 needs refinement first.

---

## 13. Recommended next work

The next pass on Module 1 should focus on depth, not breadth.

### Priority 1: proof mode
Build a dedicated flow for:
- claim,
- candidate invariant,
- per-rule preservation checks,
- conclusion about MU.

This is the most important missing piece because it turns exploration into an actual argument.

### Priority 2: stronger object/meta framing
Make the UI visibly separate:
- rule-following inside the system,
- proof about the system from outside it.

This is one of the main learning goals of the module and should not rely on prose alone.

### Priority 3: invalid-move explanation
Allow the user to propose a next string and have the verifier explain why it is invalid.

The current prevention-first interaction is efficient, but not always pedagogically strongest.

### Priority 4: guided tasks and reflection
Add a small number of prompts such as:
- find strings that seem promising but remain blocked,
- propose an invariant that fails,
- explain why search is not enough.

This would give the module a clearer arc.

### Priority 5: evaluate what actually helped
Before expanding to Module 2, test the current build against actual use and answer the feedback questions in Section 12.
