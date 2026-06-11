## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# Agent Instructions

## Current stage

This repository is in a working first-pass state with Module 1 as the active
implementation focus.

Treat the docs as the source of truth for product direction, and avoid
hard-coding assumptions from a conventional `frontend/` + `backend/` split
unless the repo actually grows that structure.

Current implementation focus:
- Module 1 (`MIU`) refinement
- persistence/artifact/notebook model
- verifier vs. LLM boundary
- graph pedagogy and dialogue quality evaluation

## Primary references

Read only the files relevant to the task:

- Product vision: `README.md`, `docs/strange-loops-vision.md`
- Architecture: `docs/product-architecture.md`
- Agent behavior: `docs/agent-behavior.md`
- Module 1 scope and status: `docs/strange-loops-module-1.md`
- Module 1 interaction-design direction and postmortem: `docs/module-1-documents-not-dashboards.md`
- Active Module 1 rework plan: `docs/module-1-document-model-plan.md`
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
not an education game. The binding rules are
`docs/module-1-documents-not-dashboards.md` §5 — read them before any UI,
copy, or pedagogy change. The ones violated most often:

- no gamification vocabulary or chrome; write like a serious textbook
- every element must name the mathematical fact it teaches, or be deleted
- mockups must show played states (mid-session, completed, expanded,
  rejection), not just the fresh page
- copy is written per case, never templated from engine data shapes
- name the real mathematics (rewriting systems, reachability, invariants)
  when the connection is structurally real

Critically re-derive the design at every step: ask what the element teaches
and whether a mathematician would respect it. Do not default to cards,
checklists, or friendly-app idioms; that is the documented failure mode this
law exists to stop.

## Dependencies and commands

The current scaffold is a root SvelteKit app managed with `npm`.

- Install dependencies: `npm install`
- Run the app: `npm run dev`
- Run frontend checks: `npm run check`
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

Removed or avoid-for-now categories:
- data-analysis / dashboard-specific skills from the old project
- backend-framework-specific procedures not supported by this repo yet
- speculative skills for workflows that have not repeated here
