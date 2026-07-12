# Lab Index and Inline Derivation Readings

**Date:** 2026-07-11  
**Status:** Approved design; implementation not started

## Objective

Give a reader arriving without project context a title page that states the
laboratory's investigation and exposes its four conceptual arcs. Move the MIU
instrument to its canonical arc route, add a deliberately empty pq destination,
and make the worksheet derivation visibly readable as a rewrite path, invariant
calculation, and encoded program without requiring the reader to carry transient
state while scrolling.

The implementation must remain small. It must not introduce a general chapter
framework, a content registry, or pq content before the pq instrument is built.

## Information architecture

The canonical routes are:

- `/` — the laboratory title and arc index;
- `/form-and-meaning/miu` — the existing MIU instrument;
- `/form-and-meaning/pq` — the next-instrument placeholder.

The top-level route group follows the project's durable conceptual arcs rather
than generic labels such as `chapters` or `formal-systems`. `formal-systems`
would become a catch-all as the project grows; `form-and-meaning` identifies why
MIU and pq are adjacent.

MIU and pq receive one quiet breadcrumb:

```text
Strange Loops Lab / Form and meaning / MIU
Strange Loops Lab / Form and meaning / pq
```

The breadcrumb is the only chapter-level navigation introduced in this pass.
There is no reusable navigation shell or sidebar.

## Title page

The root page uses the approved editorial arc-index composition. It is a title
page for a mathematical investigation, not a dashboard or course contents page.

The opening states two facts:

1. Strange Loops Lab is a set of interactive instruments testing structural
   connections between *Gödel, Escher, Bach*, modern mathematics, and machine
   learning.
2. A connection enters only through a shared invariant, construction,
   obstruction, or proof template.

Below the opening, the four arcs appear as unnumbered regions. Each region names
its comparative question and the instruments belonging to it.

### Arc 1 — Form and meaning

Question: when does a system's form capture a truth, and where is the gap?

- MIU — linked; status `built`.
- pq — linked; status `next`.
- tq — plain text; no route.
- consistency — plain text; no route.

### Arc 2 — Self-reference

Question: how does a system refer to itself, and what happens at a fixed point?

Its named instruments remain plain text until they exist.

### Arc 3 — Reflection and incompleteness

Question: what happens when a system reasons about its own provability?

Its named instruments remain plain text until they exist.

### Arc 4 — Computation and information

Question: what is uncomputable or incompressible, and what does that say about
prediction?

Its named instruments remain plain text until they exist.

Statuses are carried by words and document form. They are not badges, progress
indicators, or colored completion states. Unbuilt instruments are not dead
links.

## MIU route and breadcrumb

The existing root MIU page moves without conceptual restructuring to
`src/routes/form-and-meaning/miu/+page.svelte`. Its persisted worksheet draft
continues to use the existing local-storage key; moving the route must not erase
the reader's current derivation.

The breadcrumb precedes the instrument header. `MIU system` remains the page
title. The strapline remains `One derivation, read as theoremhood, invariant,
and description length.` because the worksheet will now make that statement
literal.

## Inline readings of the worksheet derivation

### Rejected design

Do not reproduce transient worksheet state inside the later invariant and
description-length movements. That arrangement scatters one derivation through
a long page. A reader working in the worksheet has no reason to scroll to the
later readings, and a reader who later reaches them cannot be expected to
remember the trace that produced the state.

### Approved design

Bring the two higher readings into the worksheet while the derivation is being
made.

Each derivation row gains two non-interactive columns:

- `r(s)` — the I-count residue of that row's string modulo 3;
- `instruction` — the opcode and site bits for the move that produced the row.

The axiom row has no instruction. Every later row displays the exact encoded
instruction already determined by the executable code in `src/lib/miu/coding.ts`.
The columns are mathematical annotations, not new controls.

Directly below the trace, two compact lines summarize the active derivation:

- **Invariant reading:** the residue sequence from the axiom through the active
  row, followed by the mechanically checked statement that every value remains
  in `{1, 2}`.
- **Program reading:** the concatenated derivation program including the leading
  `0` flag and terminal `000`, followed by its step count and encoded bit length.

The summary uses the active prefix through `trace.currentIndex`. If the reader
jumps backward, preserved future rows are excluded. If the reader branches,
discarded future rows never contribute to the residue sequence or program.

Long strings wrap in the string column. Long programs wrap in the summary. The
played acceptance state must include a long doubled string, a rule with multiple
sites, a jump backward, and a new branch.

The existing rule rail remains visible and unchanged in responsibility. The
extra columns must not displace the four rule statements or their exact
inapplicability reasons.

## Later MIU movements

The invariant and description-length movements remain self-contained general
mathematics. They do not read or display transient worksheet state.

The invariant movement continues to prove the MU theorem and complete
characterization. The new worksheet residue column is a concrete instance whose
general explanation occurs here.

The description-length movement defines the code already previewed by the
worksheet instruction column. Its altitude label changes from `about all such
systems` to `as a program`, which states the actual reinterpretation without
claiming a theorem about all rewriting systems.

## `K_bits` correction

The implementation already minimizes only the derivation-program branch. The
reader-facing definition must match it:

```text
K_bits(s): the least encoded length among derivation programs printing s.
```

The specimen-table column becomes:

```text
one minimum-bit derivation program
```

`L_literal(s)` remains the separate executable literal baseline. The comparison
between `K_bits` and `L_literal` continues to determine whether derivational
structure compresses the string. The underlying Dijkstra search and its existing
results do not change.

## Forward reference to pq

The character table remains part of the MIU invariant movement because it is the
full Fourier expression of the built ℤ/3 object.

The sentence that invokes modular-arithmetic networks becomes an explicit
forward-reference link labeled:

```text
→ forward reference: pq and grokking
```

The label links to `/form-and-meaning/pq`. It marks the ML measurement as a
future construction and prevents it from appearing as an unexplained fourth MIU
movement.

## pq placeholder

The pq route contains only:

- the laboratory/arc breadcrumb;
- the title `pq system`;
- the status `Next instrument`;
- links back to the arc index and to MIU.

It contains no definition of pq, no grokking claim, no exercise, no mock data,
and no speculative description of the future experiment. The title page carries
the arc-level context until the instrument earns its own content.

## Data flow and component boundaries

The route component continues to own the persisted `DerivationTrace`.

A small pure helper projects the active derivation from that trace:

```text
active steps = trace.steps[0..currentIndex]
active moves = each active non-axiom step's `via`
residues     = countI(step.value) mod 3 for every active step
program      = encodeDerivation(active moves)
```

`MiuSheet.svelte` receives or derives only the values needed to render the two
columns and compact summaries. Encoding remains owned by `coding.ts`; invariant
calculation remains owned by `invariants.ts`. The component must not duplicate
opcode, site-bit, or residue logic.

The title and pq pages are static Svelte route components. Do not introduce a
shared content registry in this pass. The project should earn that abstraction
after more than two routed instruments exist.

## Failure and boundary behavior

- A fresh worksheet contains only the axiom: residue sequence `[1]`, zero
  rewrite steps, and the existing empty derivation program `0·000`.
- Jumping to an earlier row immediately shortens both summaries to that prefix.
- Branching from an earlier row uses the newly active trace after the existing
  trace logic discards the abandoned suffix.
- Instruction-site bits come from the legal-site set at the source string, not
  from the target row or a display-specific reimplementation.
- The forward-reference link always lands on a valid pq route even though the
  instrument is unbuilt.
- Unbuilt title-page instrument names render as text, so the title page contains
  no knowingly dead navigation.

## Verification

### Unit tests

Add focused tests for the active-derivation projection:

1. the fresh trace yields one residue, no moves, and the empty derivation code;
2. after moves followed by a jump backward, residues and encoding include only
   the active prefix.

Existing coding tests remain the authority for opcode selection, variable site
width, executable replay, and derivation bit lengths. Do not duplicate those
equivalence classes in component tests.

Static route copy and presentational layout do not require brittle string tests.

### Automated validation

Run:

```bash
npm run check
npm run test
npm run build
```

### Desktop played review

Verify in the rendered application:

1. the title page identifies the laboratory, presents four unnumbered arcs, and
   links only MIU and pq;
2. the MIU breadcrumb and route work and the existing persisted draft hydrates;
3. a long derivation keeps strings, residue annotations, instruction annotations,
   and the rule rail readable;
4. an instruction with multiple legal sites displays its actual site bits;
5. jumping backward shortens both compact summaries;
6. applying a new move after the jump updates both summaries to the new branch;
7. the invariant and description-length movements remain self-contained when
   reached without remembering the worksheet state;
8. the pq page contains only the approved placeholder elements and valid links.

## Documentation updates

Update `README.md` and `docs/product-architecture.md` in the same pass:

- replace claims that MIU occupies the root route;
- name the root title/index and the two canonical arc routes;
- record that the worksheet carries inline residue and instruction annotations;
- keep pq explicitly unbuilt.

No other architecture or agent-responsibility document requires a change.

## Out of scope

- pq mathematics, model training, measurements, or learner copy;
- a global navigation system, sidebar, or mobile navigation;
- a general route/content registry;
- dynamic coupling between transient worksheet state and later movements;
- changes to theoremhood, shortest-step search, bit-complexity search, coding,
  or persistence semantics;
- redesign of the invariant proof, character table, or specimen table beyond the
  named copy and link changes.
