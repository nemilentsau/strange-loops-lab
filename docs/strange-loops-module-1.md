# Strange Loops Lab — Module 1 Specification, Status, and Improvement Plan

## Document status
This document is the canonical source of truth for Module 1.

It serves three purposes:

- the conceptual specification for Module 1,
- the implementation status tracker for the current build,
- the prioritized improvement plan for the next passes.

Supporting docs such as `README.md`,
`docs/module-1-documents-not-dashboards.md`, and
`docs/module-1-document-model-plan.md` should stay consistent with this
document rather than carrying competing status snapshots.

Last updated: June 12, 2026.

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
- phase-based module flow: `Explore -> Map -> Prove -> Reflect`
- visible phase/level cue in the command bar (object/meta tag)
- deterministic MIU rule engine
- `Explore` as a single-column derivation worksheet: the trace is the page
  (thin numbered spine lines, current string written large), with jump-back
  and branching from any prior line
- always-visible four-rule ledger with per-rule availability — local rules
  (R3/R4) show site counts, global rules (R1/R2) show only their result
  preview (their site count is structurally constant), unavailable rules the
  exact reason — plus a quiet rule-anatomy disclosure naming the
  global/local matching split and the string-rewriting framing
- previews of derived strings middle-ellipsize past ~24 characters; the
  derivation itself always renders strings in full, wrapping
- rule application through the string itself: matching spans highlight,
  hover previews the result, click applies (single-site rules apply from
  their ledger row)
- the bounded target query in the worksheet margin (empty by default),
  visibly bound to the current string: "can ⟨target⟩ be reached within ≤ k
  moves?" — found targets print their shortest walkable derivation;
  not-found verdicts print the searched count and the bound's honest
  limitation; bound 1 keeps one compact verifier clause per rule
- verifier-detected exercises in the worksheet margin, aimed at the puzzle's
  structure (open every rule · make the I-count go down · the one-way door ·
  the MU test); detection comes from the trace and query state, never from
  clicking "done"; each prints the observation it exists to produce and,
  once detected, the step stamp where it was noticed
- a verified dead-branch note when the current string is provably closed
  (only R2 will ever apply again): the one-sentence proof plus a jump-back
  action to the last open line
- revisit notes in the derivation spine ("↩ same as step 5") whenever a move
  lands on a string already in the trace
- `Map` as the drawn derivation tree (SVG): depth columns, edges labeled by
  rule, the learner's own derivation drawn solid through the dashed
  computed search, reconvergence curving back into the tree with revisited
  nodes marked, one-way doors counted in the captions, and the search bound
  rendered as an erased frontier; node click prints the full string and its
  shortest route; computed observations are captions under the drawing
- invariant explorer with:
  - built-in MU non-reachability argument,
  - custom modular candidates of the form `count(I) mod k = r` and `!= r`,
  - concrete counterexamples when a candidate fails
- `Prove` as the proof document: claim, inline-editable candidate invariant
  (editing rewrites the argument live), base case, one verifier-stamped
  clause per rule, and a conclusion that states the MU separation; failing
  candidates render their counterexample as the failing clause's content;
  copy in a human voice (design rule 8)
- first-class invariant-run and proof-attempt artifacts
- guided reflection prompts in the `Reflect` phase
- SQLite-backed snapshots and saved artifacts
- artifact restore/reopen actions from the notebook back into live module phases
- one honest Claude Code dialogue mode
- local smoke scripts for persistence and dialogue flows

### June 11, 2026 played review (Phase A)

The user played the new Explore worksheet end to end. The mechanics held
(spine, jump-back branching, in-string rule application, detection); four
surfaces were rejected on register and communication grounds:

- the "challenges" strip read as gamified chrome with its rationale missing,
- the templated rule status copy ("applies — one way") carries no information,
- the expanded tester is the old dashboard panel pasted into the worksheet,
- revisits to already-seen strings pass silently, wasting the system's
  degeneracy as a teaching moment.

The binding rework list lives in `docs/module-1-document-model-plan.md`
("Phase A rework"). This review also produced the binding design-law
extension in `docs/module-1-documents-not-dashboards.md` §5 (rules 8–12).

### June 12, 2026 played review (Phase A rework)

Playing rework 1 produced a second round: the learner can walk into a
provable doubling trap (one R1 from MI) with no help from the page; the
one-move target query is too weak to address the module's actual question;
"one string, two routes" carries no insight before Map draws reconvergence;
and "make Rule 3 possible" points at chrome rather than the puzzle's
quantity (the I-count). The rework-2 list in the plan doc answers all four
(dead-branch note, bounded query, puzzle-aimed exercises, header ellipsis);
implemented June 12 along with a latch fix from its played review
(detections are notebook entries — they survive branching and reload).
Phase B (Map as the drawn derivation tree) is implemented behind it; both
await played acceptance.

### Present but still shallow
- object-level vs meta-level framing exists in phase labels, copy, and panel structure, but it is still not forceful enough in the interface
- dialogue mode is usable, but still needs quality evaluation and refinement against real learner transcripts
- artifact persistence now includes first-pass restore/reopen flow, but notebook review and curation are still thin
- the graph explorer is accurate and inspectable, but still needs stronger teaching structure so it does more than expose state growth

### Highest-priority remaining work
- land the Phase A rework (see the plan doc), then resume the document-model
  phases: Map, Prove, Reflect
- stronger UI treatment of the object-level / meta-level split
- better review and reuse flow for saved artifacts
- dialogue quality evaluation against real learner transcripts
- graph pedagogy refinement so the `Map` phase teaches more than bounded expansion
- repeated pedagogical evaluation before any serious move toward later modules

### Roadmap stance
There is no near-term plan to move on to Module 2.

Module 2 remains part of the long-term map, but Module 1 should continue to be
refined until it is both intellectually honest and demonstrably useful while
reading.

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
- explicit proof assembly and reflective prompts now exist in first-pass form
- the remaining work is to make them more effective in practice and more reusable across sessions

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
- the affected substring is highlighted and click-to-apply on matching
  regions is implemented; all four rules stay on screen with live
  availability (site counts or the exact reason a rule cannot fire)
- history branching is implemented through the derivation spine (click an
  earlier line to continue from it); session restart lives in the command bar
- invalid moves can be proposed explicitly in the collapsed target tester and
  rejected with rule-level explanations

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
- guided tasks now help direct attention toward repetition, search pressure, and the difference between exploration and proof
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
- after the June 10, 2026 UX reboot the split is now carried by the interface
  itself, not by prose alone: the command bar's object/meta level tag, the
  ruled-paper (object) vs double-rule-framed parchment (meta) grounds, and the
  per-phase register grammar (verified / computed / coaching by form, never hue)
- the phase-based structure and the lab-desk layout make the shift visible on
  entry; `Prove` and `Reflect` read as a deliberate step outside the system
- whether this framing is forceful enough is now a question for the pedagogical
  evaluation loop rather than an obvious interface gap

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
- the UI now keeps to one honest dialogue mode instead of promising mode differentiation that the backend does not yet implement

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
- note, trace, dialogue, invariant-run, and proof-attempt artifacts exist
- notes and graph/invariant state are included in persisted draft state
- saved artifacts can now reopen their corresponding live surfaces
- artifact taxonomy, review, and curation still need work

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

Current build notes:
- the June 10, 2026 UX reboot implemented this suggestion as a three-zone
  "lab desk"; hands-on use then showed that dashboard-style interaction layer
  fails in practice, and a rework to the document model (one canonical
  mathematical document per phase) is the active plan
- the interaction-design record is `docs/module-1-documents-not-dashboards.md`;
  the rework plan is `docs/module-1-document-model-plan.md`

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

The answers to these questions should determine the next Module 1 refinement
pass. Module 2 should remain deferred until Module 1 proves durable learning
value through actual use.

---

## 13. Improvement plan

The next pass on Module 1 should focus on depth, coherence, and pedagogical
evidence rather than on adding new module breadth.

### Priority 1: strengthen the object-level / meta-level split
Make the interface itself do more of the teaching.

Target changes:
- make the boundary between `Explore` / `Map` and `Prove` more visually explicit
- clarify when the user is seeing verified rule behavior, computed structure, or coaching

Why this comes first:
- this distinction is the central learning goal of the module
- the current build gestures at it, but still relies too much on prose and panel titles

### Priority 2: add an invalid-move workbench
This work now exists in first-pass form (the collapsed target tester). The
June 11 played review rejected its expanded form — legacy dashboard
typography, no visible binding to the current string. The active expression
of this priority is rework item 5 in the plan doc: re-set the tester as a
margin query in the worksheet's own register.

Target changes:
- improve the explanation wording so it teaches the rule boundary even more clearly
- decide whether the workbench should support span-sensitive proposal help or stay string-level
- test whether people actually use it before expanding it further

Why this matters:
- prevention is safe but not always educational
- understanding why a move fails is part of understanding the system boundary

### Priority 3: make `Explore` and `Map` teach more actively
In `Explore`, guided tasks were replaced by verifier-detected exercises in
Phase A; the played review rejected their checkbox presentation, and the
rework re-sets them as textbook exercises that print the observation each
exists to produce (plan doc, rework item 3). `Map`'s guided tasks are slated
for removal when Phase B recomposes that page as the derivation tree.

Target changes:
- keep only the exercises that create real search pressure, with their
  rationale printed on the page
- refine exercise wording based on actual use
- add stronger links from `Map` observations into the `Prove` phase when warranted

Why this matters:
- the graph is justified only if it helps the user feel the limits of search
- the invariant should feel motivated rather than dropped in from above

### Priority 4: deepen artifact persistence into a real notebook
First-pass restore/reopen flow now exists. The next pass should improve review,
curation, and notebook quality rather than basic reopen mechanics.

Target changes:
- clearer artifact titles and reuse paths
- optional confidence or confusion tagging only if it supports reflection rather than fake scoring
- better artifact review, comparison, and filtering once several sessions accumulate

Why this matters:
- the product philosophy is artifacts over noise
- the current persistence layer is reliable and now reusable, but the notebook model is still too coarse

### Priority 5: clean up dialogue mode honesty and quality
The mode honesty cleanup is now done. The remaining work is dialogue quality.

Target changes:
- evaluate transcript quality against real learner use
- tune prompts around the exact Module 1 weak points: invariant preservation, search vs proof, and object/meta confusion

Why this matters:
- dialogue is already integrated, so the next question is whether it improves learning
- the product should not imply deeper mode specialization than the current system actually has

### Priority 6: run a Module 1 evaluation loop
Use the module repeatedly while reading and record what changed understanding.

Target changes:
- answer the feedback questions in Section 12 with actual usage notes
- identify which interactions felt essential, ornamental, or actively confusing
- revise Module 1 again before reopening later-module planning

Exit condition:
- Module 1 should feel stable enough that later work is blocked by new conceptual needs, not by unresolved local UX and pedagogy problems
