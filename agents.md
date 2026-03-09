## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# Agent Instructions

## Current stage

This repository is still in the specification and scaffolding phase.

Treat the docs as the source of truth for product direction, and avoid
hard-coding assumptions from a conventional `frontend/` + `backend/` split
unless the repo actually grows that structure.

Current implementation focus:
- project scaffolding
- Module 1 (`MIU`) interaction design
- persistence/artifact model
- verifier vs. LLM boundary

## Primary references

Read only the files relevant to the task:

- Product vision: `README.md`, `docs/strange-loops-vision.md`
- Architecture: `docs/product-architecture.md`
- Agent behavior: `docs/spec.md`, `docs/agents-prompt.md`
- Module 1 scope: `docs/strange-loops-module-1.md`
- Build requirements for the first implementation pass: `docs/strange-loops-coding-spec.md`
- Guidance on keeping agent instructions lean: `coding-agents-guide.md`

If you change architecture, module scope, or agent responsibilities, update the
corresponding docs in the same pass.

## Working rules

- Keep setup conservative. Prefer decisions that preserve fast iteration for Module 1.
- Do not assume a separate Python service or a separate frontend app already exists just because the architecture doc allows for one later.
- Preserve the epistemic contract: mechanically checked results and LLM coaching must stay clearly separated.
- Add new local skills only when a workflow becomes repeated, specialized, and hard to recover from repo context alone.

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
