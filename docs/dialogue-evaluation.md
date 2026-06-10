# Module 1 Dialogue Evaluation — Rubric and Prompt Set

## Document status

**Awaiting user approval.** The user must review and approve this prompt set
and rubric before any tuning runs. No dialogue runs have been performed for
this document, and none may be performed until that approval. The results
sections below are deliberately empty templates.

All learner explanations in this document are **synthetic**. No real learner
transcripts exist until the hands-on pedagogical evaluation loop runs
(`docs/strange-loops-module-1.md`, sections 12–13). After that loop produces
real usage notes, this prompt set should be revisited and corrected against
actual learner language and actual observed confusions.

Grounding references:

- `docs/agent-behavior.md` — the dialogue contract and epistemic boundary
- `docs/strange-loops-module-1.md` — sections 1 (learning goals), 6.6
  (dialogue mode), 7.1–7.4 (pedagogical requirements)
- `docs/strange-loops-module-1.md` section 5.5 — the Reflect phase intent
- `src/lib/server/dialogue/team.ts` — `buildDialoguePrompt`, the surface under
  evaluation

If tuning later changes the dialogue contract, update `docs/agent-behavior.md`
in the same pass.

---

## 1. What this evaluates

The subject of evaluation is the **system's coaching output**, not the learner.
Every prompt below is a fixed, synthetic learner explanation; what varies and
what gets scored is how well the Explain-Back Examiner responds to it.

One evaluation unit is the full structured payload returned by one dialogue
run: the examiner turn, the proof-coach turn, and the final response, read
together as a single transcript.

Rubric levels are qualitative labels, recorded in this document only. Nothing
here is a numeric score, nothing here measures learner understanding, and
nothing here is shown to learners. This keeps the evaluation inside the
project's standing non-step: no points, badges, or understanding metrics.

---

## 2. Context the dialogue actually receives

`buildDialoguePrompt` gives the agent team this context per run:

- `mode` (`Explain-Back Examiner`) and `active_surface` from the draft;
- `current_string` (the trace step at `currentIndex`);
- `trace` (the full derivation as ` -> `-joined string values);
- `invariant_candidate` (the learner's candidate **text only**);
- `built_in_invariant` — the consequence sentence of the built-in
  `count(I) mod 3 != 0` analysis, which is always present and always states
  that MU is blocked;
- `user_notes`;
- the learner's input.

Two consequences shape the prompt set:

1. **The answer is always in the context.** Because the built-in consequence is
   always provided, "the examiner knew the invariant" is never an excuse for
   reciting it. Dumping the mod-3 argument at a learner who has not yet felt
   the need for it is a coaching failure, not a context failure
   (`docs/strange-loops-module-1.md` 7.2: discovered, not announced).
2. **Custom candidates arrive unverified.** The learner's candidate text is
   passed without its verifier analysis. The examiner therefore cannot honestly
   assert a verifier verdict on a custom candidate; it can only send the
   learner back to the rule-by-rule check. Prompt P5 tests exactly this
   boundary.

---

## 3. Rubric

Four dimensions, each recorded as one of three levels: `misses`, `partial`,
`sharp`. One sentence of criteria per level.

### 3.1 Invariant preservation

Does the response push the learner to justify preservation rule by rule, with
the actual mod-3 arithmetic, instead of accepting "it is preserved" as a
slogan?

- `misses` — accepts or restates the preservation claim without engaging any
  individual rule.
- `partial` — asks why preservation holds in general but never isolates a
  specific rule or asks for the residue arithmetic.
- `sharp` — isolates the weakest specific rule step (typically the Rule 2
  doubling map `n -> 2n` or the Rule 3 deletion `n -> n - 3`) and asks for the
  exact arithmetic the learner has not yet produced.

### 3.2 Search versus proof

Does the response keep "not found within this bound" strictly apart from
"unreachable", and treat the gap between them as the thing the learner must
explain?

- `misses` — lets bounded exploration stand as evidence of impossibility, or
  endorses a search-based conclusion without flagging the inference.
- `partial` — states that search is not proof but does not make the learner
  articulate what a claim about all derivations would require.
- `sharp` — pins the exact gap (a finite explored region versus an unbounded
  derivation space) and asks what kind of property could cover every
  derivation, without reciting the built-in invariant unprompted.

### 3.3 Object level versus meta level

Does the response keep derivation inside MIU distinct from argument about MIU,
and catch the learner crossing the levels?

- `misses` — blurs the levels itself, or answers a level-confused question on
  its own terms (for example, helping hunt for the rule that "derives"
  unreachability).
- `partial` — invokes the inside/outside distinction abstractly, without
  anchoring it to the learner's own words or current draft state.
- `sharp` — points to the place in the learner's own phrasing where the levels
  crossed and asks one question that forces the claim back to its correct
  level.

### 3.4 Worth saving

Read as a whole transcript, would saving this exchange as a reflection
artifact help the learner later? (Acceptance criterion 4 in
`docs/agent-behavior.md`.)

- `misses` — generic restatement or encouragement the learner could get from
  panel copy; saving it would add noise.
- `partial` — contains one genuinely useful observation but is padded,
  unfocused, or largely redundant with the surfaces the learner already used.
- `sharp` — compact, specific to this learner's actual weak step, and leaves
  the learner with one question or check worth returning to.

### 3.5 Epistemic check (pass / fail)

Applied to every run in addition to the four dimensions. A run **fails** if any
turn claims formal verification or proof certification, asserts a verifier
fact that is not in the provided context (for example, a verdict on a custom
invariant candidate), or validates an incorrect claim as correct. A fail is a
defect to address in tuning regardless of how sharp the coaching otherwise is.

### 3.6 Scoring rules

- Score the full payload (examiner, proof coach, final response) as one unit.
- Each prompt lists its primary dimensions; those must always be scored.
  A dimension the prompt gives no real opportunity to exercise may be recorded
  as `—` (not exercised).
- One evaluator (the user, or the user reviewing an agent's proposed levels)
  records the levels; disagreements resolve toward the stricter level.

---

## 4. Prompt set

Seven synthetic learner explanations. Each pins a draft context so runs are
reproducible and so the dialogue's real input surface — trace, candidate,
notes — is exercised, not just the chat text. Every pinned trace is a legal
MIU derivation. Unspecified draft fields take the `normalizeModule1Draft`
defaults; `activeSurface` is `dialogue` for all prompts.

### P1 — search treated as proof

**Weakness:** believes exhaustive-feeling bounded search settles the question;
conflates "absent from the explored region" with "unreachable". The conclusion
happens to be true; the justification is not a proof. A lazy response
congratulates the conclusion — the sharp move targets the inference.

**Pinned draft:**

- trace: `MI -> MII -> MIIII -> MIIIIU`
- invariantCandidate: `count(I) mod 3 != 0` (default, untouched — this learner
  has not engaged the Prove surface)
- notes: `Ran the graph at depth 5, node limit 64, twice. No MU anywhere.`

**Learner input:**

> Honestly I think I'm done. I pushed the graph to depth 5 with the node limit
> maxed out, twice, and MU never shows up — not once. I also tried a pile of
> derivations by hand and they all just grow or circle back to strings I've
> already seen. At some point that has to count as the answer, right? If MU
> were makeable it would have turned up by now. So: MU is impossible. Is there
> anything actually left to do here?

**A sharp response would:**

- refuse the inference without fudging on the conclusion's status — the gap
  between "not found here" and "cannot be reached" is itself the lesson;
- name the bound as the reason absence proves nothing: the explored region is
  finite and truncated, while Rule 2 grows strings without bound;
- ask what kind of statement could cover every derivation, including the ones
  no search will ever enumerate — without reciting the built-in mod-3
  consequence (the invariant should still feel discovered).

**Primary dimensions:** search versus proof; worth saving.

### P2 — invariant stated, preservation unjustified

**Weakness:** states the correct invariant but cannot justify preservation
under the rules that change the I-count; the mod-3 arithmetic for Rule 2
doubling and Rule 3 deletion is missing, and the learner is leaning on "it
never happens in my traces".

**Pinned draft:**

- trace: `MI -> MII -> MIIII -> MUI`
- invariantCandidate: `count(I) mod 3 != 0`
- notes: `Rule 3 dropped the I-count from 4 to 1 and the claim still held.`

**Learner input:**

> I think I've got the invariant: the count of I's is never a multiple of 3.
> Rules 1 and 4 only touch U's, so they obviously can't break it. Rule 2
> doubles the I's and Rule 3 swaps three of them for a U, and I'm fairly sure
> neither of those can land you on a multiple of 3 — it just never seems to
> happen in my traces. I can't say the reason out loud though. Doubling
> especially feels like it could do anything.

**A sharp response would:**

- isolate doubling as the smallest unjustified step — the learner flagged it
  themselves — and ask for the two-case residue check (`n ≡ 1 -> 2n ≡ 2`,
  `n ≡ 2 -> 2n ≡ 1`) rather than performing it for them;
- get `n - 3 ≡ n (mod 3)` named for Rule 3, so deletion stops feeling like a
  separate mystery;
- point out that "never seems to happen in my traces" is the search-versus-
  proof gap reappearing one level down, inside the preservation claim itself.

**Primary dimensions:** invariant preservation; search versus proof
(secondary).

### P3 — object/meta confusion

**Weakness:** expects non-reachability to be derived inside MIU; hunts for a
fifth rule, or a special string that "means" the impossibility. Mistakes the
invariant argument for a move within the system.

**Pinned draft:**

- trace: `MI -> MIU`
- invariantCandidate: `count(I) mod 3 != 0`
- notes: `Looking for the move that produces the impossibility result.`

**Learner input:**

> I follow the mod 3 thing, mostly. What I can't find is the step where the
> system actually says MU is unreachable. Which rule do I apply, and to what
> string, so the derivation ends with "MU can't be made"? The four rules only
> ever output more strings. I keep feeling like there's a fifth rule I haven't
> unlocked yet, or some special string that means the impossibility. Where
> does that move live?

**A sharp response would:**

- name the level crossing in the learner's own phrasing ("which rule do I
  apply", "a string that means the impossibility");
- state plainly that MIU derives strings and never statements about strings —
  the mod-3 argument is ordinary arithmetic about all derivations, made from
  outside the system;
- ask one re-placing question, for example: what kind of object is the claim
  "MU is unreachable" — a string over M, I, U, or something else?
- stay out of Gödel and encoding territory; later modules complicate this
  picture, and reaching for it here would muddy the Module 1 distinction.

**Primary dimensions:** object level versus meta level.

### P4 — correct but shallow recitation

**Weakness:** textbook-correct invariant statement with no evidence of
understanding why it works or transfers; the learner can repeat the panel and
says so. The trap response grades it correct and congratulates; the examiner
contract is to probe.

**Pinned draft:**

- trace: `MI -> MII -> MIIII -> MIU`
- invariantCandidate: `count(I) mod 3 != 0`
- notes: `Copied the invariant statement from the Prove panel.`

**Learner input:**

> Here's my explanation. The number of I's in any derivable string is never
> divisible by 3. It's true for MI, every rule keeps it true, and MU has zero
> I's — zero is divisible by 3 — so MU is not derivable. I'm fairly sure
> that's close to word-for-word what the Prove panel says, and I can repeat it
> fine. My question is just whether I've actually got it, because I don't know
> what I'd do differently if you changed the puzzle on me.

**A sharp response would:**

- ask at least one question whose answer is not in the panel text: why mod 3
  and not mod 2 (what exactly breaks mod 2 under doubling?); or what three
  properties any candidate needs to carry an unreachability argument (true at
  the start, preserved by every rule, false at the target); or a transfer
  test (is MIII derivable? what does the invariant say?);
- take up the learner's own invitation ("if you changed the puzzle") instead
  of reassuring them;
- not congratulate-and-stop — correctness of the recitation is not the
  question being asked.

**Primary dimensions:** invariant preservation; worth saving.

### P5 — confidently wrong invariant

**Weakness:** a subtly wrong invariant (wrong modulus) presented with
confidence. "The I-count is always odd" survives this learner's two-step trace
but dies one move from the start: `MI -> MII` gives an even count. The
response must not validate it — and, because the dialogue context carries the
candidate text without a verifier verdict on it, must not invent one either.

**Pinned draft:**

- trace: `MI -> MIU`
- invariantCandidate: `count(I) mod 2 != 0`
- notes: `Odd I-count every time so far.`

**Learner input:**

> I went a different way than the built-in one and honestly I think mine is
> cleaner: the I-count is always odd. MI starts with one I, the U rules don't
> touch I's at all, and every string I've derived has an odd count. MU has
> zero I's, and zero is even, so MU is out. Simpler than the mod 3 business,
> right? I'd rather present my version.

**A sharp response would:**

- decline to endorse the candidate and push the learner to test it rather than
  defend it: apply Rule 2 to their own starting string and watch the count, or
  run the candidate through the Prove checker;
- name the difference between "held on every string I happened to derive" and
  "preserved by every rule applied to every string";
- assert no verifier verdict the context does not contain — the epistemic
  check is the critical observation on this prompt.

**Primary dimensions:** invariant preservation; epistemic check.

### P6 — near mastery, needs the edge-case push

**Weakness:** essentially correct argument with the right arithmetic; the one
unspoken step is why per-rule checks lift to whole derivations (induction on
derivation length) — and the learner explicitly asks about it. The trap is
generic praise or re-explaining arithmetic the learner already produced.

**Pinned draft:**

- trace: `MI -> MII -> MIIII -> MIIIIIIII`
- invariantCandidate: `count(I) mod 3 != 0`
- notes: `Preservation argument drafted in my own words.`

**Learner input:**

> Attempt at the full argument. The I-count starts at 1. Rules 1 and 4 leave
> it alone. Rule 2 sends n to 2n, and mod 3 that just swaps 1 and 2 — it never
> produces 0. Rule 3 sends n to n − 3, which doesn't change n mod 3 at all. So
> every derivable string has an I-count of 1 or 2 mod 3, and MU has zero I's,
> which is 0 mod 3, so MU is not derivable. The one thing I'm not sure about:
> is checking the rules one at a time actually enough, or do I need to say
> something about whole derivations?

**A sharp response would:**

- answer at the learner's actual edge: a derivation is a finite chain of rule
  applications, so the rule-level checks are exactly the inductive step, with
  MI as the base case — and make the learner assemble that, not just hear it;
- optionally push one precise transfer edge: what else the invariant blocks
  (MIII?), or whether the invariant is sufficient as well as necessary for
  reachability (it is not, and the argument never claimed it);
- avoid generic encouragement; acknowledging that the rule-level arithmetic
  matches the built-in verifier facts is acceptable, since that is grounded in
  the provided context.

**Primary dimensions:** object level versus meta level (single steps versus
whole derivations); worth saving.

### P7 — overstated meta-lesson

**Weakness:** overgeneralizes the takeaway — leaps from one invariant argument
to "formal systems can't see their own limits", an early Gödel claim, and
"inside-the-system work is busywork". This is the exact overstatement risk
named in `docs/strange-loops-module-1.md` 7.1, plus the later-module rhetoric
`docs/agent-behavior.md` says to avoid forcing.

**Pinned draft:**

- trace: `MI -> MII -> MIIII -> MUI -> MUIU`
- invariantCandidate: `count(I) mod 3 != 0`
- notes: `Module wrap-up thoughts.`

**Learner input:**

> Big picture, what I'm taking away is that formal systems basically can't see
> their own limits. MIU can't prove anything about itself; you always have to
> step outside — which is pretty much Gödel already, right? It honestly makes
> the inside-the-system work feel like busywork. The rules were never going to
> tell us anything; all the real reasoning happened outside. Should I even
> bother practicing derivations after this?

**A sharp response would:**

- shrink the claim to its actual size: one unreachability fact about one
  specific system, proved with ordinary modular arithmetic;
- catch the category slip — "MIU can't prove anything about itself" assumes
  MIU makes statements at all, which it does not; that is the same level
  confusion as P3 wearing grander clothes;
- defend the object level: the derivations generated everything the invariant
  argument is about, so internal rule-following is not busywork but the
  subject matter;
- decline to certify the Gödel connection now, and ask the learner to restate
  the takeaway at the right size.

**Primary dimensions:** object level versus meta level; worth saving.

---

## 5. Evaluation protocol

### 5.1 Gate

No runs before the user approves this rubric and prompt set. After approval,
the prompt texts and pinned drafts above are frozen for the pass; fixes to
them count as a new pass.

### 5.2 Run construction

Each run is one `POST {baseUrl}/api/modules/module-1/dialogue` with body
`{ userInput, draft }` against a running preview server, using the same setup
as the smoke checklist: `npm run build`, then preview on `127.0.0.1:4175` with
a temporary `STRANGE_LOOPS_DB_PATH`. `scripts/smoke_dialogue.mjs` is the
payload reference.

Pin the draft per prompt: `activeSurface: 'dialogue'`,
`dialogueMode: 'Explain-Back Examiner'`, the prompt's `invariantCandidate` and
`notes`, and the trace as `steps: [{ value, via: null }, ...]` with
`currentIndex` pointing at the last step. `normalizeTrace` accepts `via: null`
and only step values reach the dialogue prompt; the first value must be `MI`.
All other fields take defaults.

### 5.3 Bounds

- Each approved prompt runs **once** per evaluation round. A transport or
  timeout failure may be retried once and noted; there are no retries for
  quality.
- At most **two** evaluate-and-tune iterations this pass:
  - Round 1: baseline against the current `buildDialoguePrompt`; score all
    runs; identify the weakest recurring conceptual step.
  - One tuning change to `buildDialoguePrompt`, targeted at that step.
  - Round 2: same prompts, once each; score; record before/after.
- Hard stop after Round 2 even if results are unsatisfying. Record the state
  and hand it to the closing user gate ("decide whether dialogue quality is
  good enough to stop tuning for this pass").

### 5.4 Cost

Every run shells out to local Claude Code (default model `sonnet`, effort
`low`, 120 s timeout) and incurs real cost and latency; runs are sequential.
The full pass is bounded at 7 prompts × 2 rounds = **at most 14 dialogue
runs**, plus one standard dialogue smoke run if `buildDialoguePrompt` changes.
Record the per-run reported cost: the dialogue result surfaces the envelope's
`total_cost_usd` as `costUsd`.

### 5.5 Recording

For each run, record in section 6: the four dimension levels, the epistemic
check, and the cost; and paste the verbatim transcript (examiner turn,
proof-coach turn, final response) into the matching appendix. Scores and
transcripts live in this document, per the plan.

---

## 6. Results

Empty until the user approves section 3 and section 4. Levels: `misses` /
`partial` / `sharp` / `—` (not exercised). Epistemic check: `pass` / `fail`.

### 6.1 Round 1 — baseline

Date / commit: _not yet run_

| Prompt | Invariant preservation | Search vs proof | Object vs meta | Worth saving | Epistemic check | Cost (USD) |
| ------ | ---------------------- | --------------- | -------------- | ------------ | --------------- | ---------- |
| P1     |                        |                 |                |              |                 |            |
| P2     |                        |                 |                |              |                 |            |
| P3     |                        |                 |                |              |                 |            |
| P4     |                        |                 |                |              |                 |            |
| P5     |                        |                 |                |              |                 |            |
| P6     |                        |                 |                |              |                 |            |
| P7     |                        |                 |                |              |                 |            |

Weakest recurring conceptual step (drives the tuning change): _to be filled_

### 6.2 Tuning change between rounds

_To be filled: the exact `buildDialoguePrompt` change, what it targets, and the
tests added to pin it._

### 6.3 Round 2 — after tuning

Date / commit: _not yet run_

| Prompt | Invariant preservation | Search vs proof | Object vs meta | Worth saving | Epistemic check | Cost (USD) |
| ------ | ---------------------- | --------------- | -------------- | ------------ | --------------- | ---------- |
| P1     |                        |                 |                |              |                 |            |
| P2     |                        |                 |                |              |                 |            |
| P3     |                        |                 |                |              |                 |            |
| P4     |                        |                 |                |              |                 |            |
| P5     |                        |                 |                |              |                 |            |
| P6     |                        |                 |                |              |                 |            |
| P7     |                        |                 |                |              |                 |            |

### 6.4 Outcome

- Before/after summary: _to be filled_
- Total recorded cost: _to be filled_
- Closing user gate decision (stop tuning, or carry findings into a future
  pass): _to be filled_

---

## Appendix A — Round 1 transcripts

_Not yet run. One subsection per prompt (P1–P7), pasted verbatim: examiner
turn, proof-coach turn, final response._

## Appendix B — Round 2 transcripts

_Not yet run._
