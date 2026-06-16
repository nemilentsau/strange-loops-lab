## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# Agent Instructions

## Current stage

The phase-based Module 1 (Explore / Map / Prove / Reflect) is retired. The app
is now a single MIU instrument at the root route — one object, the derivation,
read three ways:

- manipulate it (the worksheet: the four rules always on screen, each with the
  exact reason it cannot fire when it cannot);
- see the wall (the residue wheel on ℤ/3; MU rejected by the invariant — a
  verified negative, not a search limit);
- read the derivation as a program (K_MIU, the shortest-derivation length:
  compressible vs. incompressible, with Kolmogorov complexity and Chaitin named
  as the next instrument, not claimed by this one).

See `docs/strange-loops-vision.md` for the direction and
`docs/module-1-postmortem.md` for the build this replaced and the binding design
law it produced.

The deterministic layer stays and grew a descriptional-complexity module
(`src/lib/miu/complexity.ts`). The persistence and dialogue layers are kept but
**dormant** — present in the repo, not wired to the instrument. Avoid
hard-coding assumptions from a conventional `frontend/` + `backend/` split
unless the repo actually grows that structure.

Current focus:
- the GEB → modern-math / ML bridge investigation, with the builder as the
  learner: build both sides of a candidate bridge and check for a shared
  invariant, template, or reduction — the connection gate is the method, not
  just a guardrail. First built bridge: MIU ↔ Kolmogorov complexity (a
  derivation is a program; K_MIU is its shortest length). Next candidate:
  invariant ↔ expressivity wall.
- persistence/artifact/notebook model and the verifier-vs-LLM boundary, kept
  dormant until an instrument re-earns them.

## Primary references

Read only the files relevant to the task:

- Product vision: `README.md`, `docs/strange-loops-vision.md`
- Architecture: `docs/product-architecture.md`
- Agent behavior: `docs/agent-behavior.md`
- Module 1 build postmortem and binding design law: `docs/module-1-postmortem.md`
- Guidance on keeping agent instructions lean: `coding-agents-guide.md`

If you change architecture, module scope, or agent responsibilities, update the
corresponding docs in the same pass.

## Working rules

- Keep setup conservative. Prefer decisions that preserve fast iteration for Module 1.
- Do not assume a separate Python service or a separate frontend app already exists just because the architecture doc allows for one later.
- Preserve the epistemic contract: mechanically checked results and LLM coaching must stay clearly separated.
- Add new local skills only when a workflow becomes repeated, specialized, and hard to recover from repo context alone.
- Keep the repo clean: no stale docs, no obsolete writings. Working artifacts (mockups, screenshots, scratch output) are gitignored, never committed, and deleted as soon as the build they served ships. When state changes, fix the affected docs in the same pass.

## Design law (binding for all learner-facing work)

The audience is a graduate-level mathematical reader; this is a laboratory,
not an education game. The binding rules are the design law in
`docs/module-1-postmortem.md` — read them before any UI, copy, or pedagogy
change. The ones violated most often:

- no gamification vocabulary or chrome; write like a serious textbook
- every element must name the mathematical fact it teaches, or be deleted
- no lede may explain control use; if prose is needed to operate a control,
  redesign the control. Ledes may state definitions, scope, or motivation;
  labels, verdicts, actions, and captions carry interaction.
- mockups must show played states (mid-session, completed, expanded,
  rejection), not just the fresh page
- copy is written per case, never templated from engine data shapes
- name the real mathematics (rewriting systems, reachability, invariants)
  when the connection is structurally real

Critically re-derive the design at every step: ask what the element teaches
and whether a mathematician would respect it. Do not default to cards,
checklists, or friendly-app idioms; that is the documented failure mode this
law exists to stop.

Before writing or editing any reader-facing copy, read
`.agents/skills/prose/SKILL.md` — the plain-register rules and the banned
faux-profound / friendly-app tics.

## Dependencies and commands

The current scaffold is a root SvelteKit app managed with `npm`.

- Install dependencies: `npm install`
- Run the app: `npm run dev`
- Run frontend checks: `npm run check` (includes the dead-CSS gate; standalone: `npm run check:dead-css`)
- Run unit tests: `npm run test`
- Build production output: `npm run build`
- Run the full smoke suite against a running server: `npm run smoke:all -- http://127.0.0.1:4175`
- Run the dialogue smoke test against a running server: `npm run smoke:dialogue -- http://127.0.0.1:4175`
- Run the persistence smoke test against a running server: `npm run smoke:persistence -- http://127.0.0.1:4175`
- SQLite persistence lives at `data/strange-loops.db` unless `STRANGE_LOOPS_DB_PATH` is set
- Dialogue mode shells out to local Claude Code; configurable via `CLAUDE_CLI_PATH`, `CLAUDE_DIALOGUE_MODEL`, `CLAUDE_DIALOGUE_TIMEOUT_MS`, and `CLAUDE_DIALOGUE_EFFORT`

There is no separate Python service yet.

- If Python dependencies are introduced later, use `uv`.
- Keep new commands documented here and in `README.md` as the scaffold grows.

## Local skills

Current repo-local skills worth keeping:

- `.agents/skills/testing/SKILL.md` — read before adding or restructuring tests
- `.agents/skills/ux-design/SKILL.md` — use for distinctive UI work when building the module experience
- `.agents/skills/prose/SKILL.md` — read before writing or editing any reader-facing copy; the plain-register rules and the banned faux-profound / friendly-app tics

Removed or avoid-for-now categories:
- data-analysis / dashboard-specific skills from the old project
- backend-framework-specific procedures not supported by this repo yet
- speculative skills for workflows that have not repeated here
