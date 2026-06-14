---
name: prose
description: How to write learner-facing copy in this app — phase documents, claims, captions, exercises, dialogue, any string a reader sees. Read before writing or editing reader copy, especially when reaching for elevated or profound-sounding phrasing.
user-invocable: false
---

## Core rule

Write app copy in the same plain, declarative voice you'd use explaining the idea to a working mathematician in conversation. State the math and stop.

The audience is graduate-level (design law §5 in `docs/module-1-documents-not-dashboards.md`, rules 8/11/12). Hard-to-parse is not the same as deep. Reaching for profundity produces fog, and this reader sees through it.

**Test every sentence: would you say it out loud to a colleague? If not, rewrite it or cut it.**

## The failure this skill exists to stop

Writing "for an app" triggers the LLM-essay reflex — dressing plain facts in elevated structure. Every tic below was shipped into this app and rejected by the reader. None of them carry information.

| Tic | Banned | Fix |
|-----|--------|-----|
| Antithesis reach ("X, not merely Y") | "Settled, not merely unobserved" | "The I-count mod 3 is preserved by every rule, and MU has count 0." |
| Personified arguments/objects | "The argument was not a search that gave up" | "This is structural induction, not a search." |
| Portentous vagueness | "the one step that takes a mathematician", "a local mercy", "that luck runs out" | Name it: "the only real work is finding the invariant"; "MIU is decidable". |
| Hand-holding narration | "there are infinitely many derivations to check. But suppose some property holds…" | "No search settles a statement about all derivations. Structural induction does: …" |
| Gamification / praise | "Nice work — you've unlocked…" | Delete it. |

The first three are the LLM-profound register; the last two are the friendly-app register. Both are banned.

## Bad → good

**Childish hand-holding → plain peer-level:**

> ✗ Search can't settle this — there are infinitely many derivations to check. But suppose some property holds for MI and no rule can break it. Then every derivable string has it, no matter how it was derived. If MU lacks that property, MU is unreachable.

> ✓ No search settles a statement about all derivations — there are infinitely many. Structural induction does: the theorems come from MI by the four rules, so any property that holds at MI and is preserved by every rule holds for every theorem. The work is finding such a property that MU fails.

**Faux-profound → plain:**

> ✗ The argument was not a search that gave up. … the one step that takes a mathematician is finding the property.

> ✓ This is structural induction, not a search. … the only real work is finding the invariant.

> ✗ Derivability in MIU is a local mercy; change the rules and that luck runs out.

> ✓ MIU is decidable. For string-rewriting systems in general, derivability is undecidable (Post, 1947).

## Also write it, don't dress it

- Name the real objects directly — structural induction, model/soundness, decidability, Post's word problem, Gödel. Don't gesture at them.
- Connected prose: real verbs, pronouns that track their referents, the paragraph as the unit. Not telegraphic fragments, not clause-stacked aphorisms.
- Copy is written per surface and per case, never templated from engine data shapes; engine vocabulary (node, draft, snapshot) never reaches the reader.

## Red flags — STOP and rewrite

- An "X, not Y" or "not merely" construction
- An argument, rule, or proof that "wants", "gives up", "tries", "refuses"
- Adjectives of significance with no content behind them ("profound", "remarkable", "a mercy", "the real question")
- A sentence you kept because it sounded good
- Explaining something this reader already owns
