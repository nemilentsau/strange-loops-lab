# Derivation page figures — design

Date: 2026-09-02
Status: approved in conversation; mockups pending (design law rule 7)

This file and its plan are working artifacts. Delete both when the build
ships (repo hygiene rule in `CLAUDE.md`).

## Problem

The MIU page at `/form-and-meaning/miu` promises one derivation read three
ways. Only the worksheet reads the reader's derivation. The invariant section
reads MU, a fixed example. The description-length section reads four fixed
specimen strings. The reader's object appears in the later sections only as two
footer lines under the worksheet. The page is three essays stacked, joined by
transition paragraphs.

There is no figure on the page. Three proof steps are pictures set as prose or
tables. The characters-of-ℤ/3 block is the notes' Definition 2.6 through
Proposition 2.8 restated as a static grid; it responds to nothing and, by the
notes' own Remark 2.9, proves nothing the induction did not. Its justification
is the pq comparison, which does not exist yet.

## Decision

1. Remove the characters block from the instrument. Keep `characters.ts`, its
   tests, and notes §2.6–2.9. The display returns on the pq page as a
   two-column comparison when the measured table exists.
2. Remove the bit-breakdown popover under the worksheet. The instruction column
   of the spine already shows the same bits per step.
3. Make readings two and three take the reader's derivation and the target as
   input, through three figures, each a proof step drawn and each computed by
   the formal layer:
   - **the residue figure** (invariant section): ℤ/3 as three points; R2 as
     the arrows swapping 1 and 2; R1, R3, R4 as loops; 0 with its own loops and
     no arrow entering from {1, 2}. The reader's active derivation traces its
     residue path on it; the target's residue is ringed.
   - **the depth figure** (description-length section): derivation length n on
     the axis, the number of strings first reached at length n as bars, and the
     target's `K_steps` as an exact tick or as a bracket: ruled-out lengths
     shaded, the construction's length as the upper tick. The shading advances
     while the search runs.
   - **the length figure** (description-length section): bits against tail
     length on a log₂ axis. The literal cost `L_literal` as a curve, the I-run
     family `M·I^(2^k)` as program points, the target as a ring at
     (`|t|`, `K_bits`) or as a bracket, and the reader's derivation as a mark
     at its own program length, an exhibited upper bound.
4. Docs are corrected in the same pass and shipped working artifacts are
   deleted.

## Facts each figure teaches (design law rule 9)

- Residue figure: {1, 2} is closed under the four rules and 0 is not entered
  from it; that closure is the induction step of Theorem 2.3.
- Depth figure: a lower bound on `K_steps` is proved by exhausting finite
  layers; on this machine the exhaustion terminates. The bars say why it gets
  expensive.
- Length figure: the literal grows with `|t|`, the program for an I-run grows
  with `log₂|t|`; structure compresses. One witness gives an upper bound; the
  search gives the floor.

## Layout

Revised after the played mockup review: a dial three screens below the
control it reads from is useless.

- The three figures form a dial row inside the worksheet, directly under the
  current string, replacing the two footer lines ("invariant reading",
  "program reading"). Everything that reacts to a click is on one screen: the
  rules rail on the right, the current string, and the dials under it. The
  rail stays sticky. The dials are not controls; the inputs remain the rail
  and the target field. Marks move with a short transition so the eye
  follows a change.
- Each dial caption opens with a mark key and ends with one link into the
  section that explains it (`#invariant`, `#description-length`).
- The invariant and description-length sections keep their prose, boxes, and
  the specimen table; the characters block is gone. Trimming those sections
  behind disclosures is a separate decision, not taken in this pass.
- Theoremhood section: unchanged except the popover removal.

## Figure conventions

- Inline SVG in Svelte, viewBox-scaled, monochrome graphite. Marks are told
  apart by form and direct label, never by hue: literal curve = thin line,
  program family = filled dots joined by a dashed line, target = ring, reader =
  filled diamond, ruled-out region = light fill. The oxblood accent is not used
  in figures; nothing in them is actionable.
- The specimen table is the table view of the length figure. No hover layer.
- Every figure has a caption written per case (found / bracket / running /
  target reached / target not reached / residue 0 / invalid target). Captions
  state facts; they never explain how to use a control.
- Grown state: the reader's string can exceed the axis. A mark beyond the y
  range sits at the top edge with an arrowhead and its value; beyond the x
  range, at the right edge. The depth axis extends to the construction length
  when that exceeds the bar range.

## Register

Every number on a figure is verified formal state or a checked deterministic
transform of it. Bracket cases carry their horizon (the node budget) in the
caption, as the verdict does today.

## Copy

Prose skill applies. Captions are formal statements about this machine. No
antithesis, no personified searches, no hand-holding.

## Out of scope

- The theorem-query layout (the void under the verdict at full width).
- Any animation of rewriting or an explorer of the rewrite graph.
- A pq page or any measured surface.
- Reworking `MiuProduce`'s inline bracket copy to use the new helper.
