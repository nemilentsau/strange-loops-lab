---
name: prose
description: How to write learner-facing copy in this app — phase documents, claims, definitions, captions, exercises, any string a reader sees. Read before writing or editing reader copy, especially proof and exposition text, and whenever reaching for elevated, profound-sounding, or casual/conversational phrasing.
user-invocable: false
---

## Audience and register

The reader is a graduate-level mathematician. Two things hold always; the register depends on what the sentence is doing.

**Always:** name the real objects directly — structural induction, the inductively-defined theorem set, soundness, decidability, Post's word problem, Gödel. No rhetorical scaffolding. Copy is written per surface and per case, never templated from engine data; engine vocabulary (node, draft, snapshot) never reaches the reader.

**Register by content:**
- **Formal content — a definition, theorem, claim, base case, inductive step, rule check, a model.** Display it, structured, the way a clean proof writeup or lecture notes would. Do **not** dissolve it into flowing prose.
- **Motivation and bridges — intuition, why it matters, the link to Gödel or to LLMs.** Connected, precise prose. Nothing to display here; just don't make it folksy.

The "read it aloud" instinct belongs to motivation only; it does not license dissolving a definition or a proof into chatty prose. The common failure is **under-formalizing**: writing proof content conversationally because it reads friendlier. For this reader the formal statement is the clearer one.

## Three registers — only the third ships for proof content

| Register | Example | Verdict |
|---|---|---|
| Childish / friendly-app | "there are infinitely many derivations to check, but suppose some property holds…" | banned |
| Conversational | "structural induction, not a search — you check MI and that no rule breaks it" | too informal for a proof; fine only as a one-line motivating aside |
| Formal exposition | the displayed block below | ship |

```
Proof, by structural induction on derivations.
Define  P(s):  #I(s) ≢ 0 (mod 3).
Base:   MI has one I, so P(MI).
Step:   each rule preserves P —
        R2:  k → 2k      (2 is a unit mod 3, so ≢0 stays ≢0)
        R3:  k → k − 3   (residue unchanged)
        R1, R4: k unchanged.
Hence every theorem satisfies P. MU has #I = 0, so MU is not a theorem.
```

## Banned tics (every register)

| Tic | Banned | Fix |
|---|---|---|
| Antithesis reach | "Settled, not merely unobserved" | state the fact |
| Personified objects | "the argument was not a search that gave up" | "the proof is not an enumeration" |
| Portentous vagueness | "the one step that takes a mathematician", "a local mercy" | name it: "finding the invariant"; "MIU is decidable" |
| Hand-holding | "But suppose some property holds…" | state the method |
| Gamification / praise | "Nice work — you've unlocked…" | delete |

## Tests before shipping

- Is this a formal statement? Display it; don't prose-ify it.
- Is it motivation? Is it precise, or just atmosphere? Cut atmosphere.
- Does the sentence carry information, or only sound good? Cut the second kind.
- Would it appear, as written, in a clean writeup or lecture notes for this reader? Too casual or too cute → rewrite.

## Red flags — STOP

- A proof or definition written as a flowing sentence instead of displayed structure
- An "X, not Y" / "not merely" construction
- An argument, rule, or proof that "wants", "gives up", "tries"
- Adjectives of significance with no content ("profound", "a mercy", "the real question")
- A sentence kept because it sounded good
- Explaining something this reader already owns
