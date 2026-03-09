# Agent Instructions

## Dependencies

This project uses **uv** for Python dependency management. To install or add packages:

```bash
uv pip install <package>                         # install into .venv
uv pip install -r requirements.txt               # sync from requirements file
```

Never use `pip` directly — always use `uv pip`.

## Backend checks

After backend code edits:

1. The virtualenv lives at the repo root: `.venv/`.
2. Run type and lint checks from the `backend/` folder (ignore `scripts/`).
3. Use `../.venv/bin/pyright .` in `backend/`.
4. Use `../.venv/bin/ruff check` in `backend/`.
5. Report any errors and fix them before proceeding.

## Tests

Run tests from `backend/`:

```bash
../.venv/bin/python -m pytest tests/ -v
```

**Zero failures policy:** The full test suite must pass with zero failures. Any failing test — whether related to your changes or not — must be investigated and fixed before finishing. Do not dismiss pre-existing failures; they indicate either stale tests or regressions that need attention.

Run relevant tests based on what you changed:

| Changed | Run |
|---------|-----|
| `contracts/models.py` | `pytest tests/test_contracts.py` then `python scripts/gen_schemas.py` (updates validate_output.sh, prompts.py, contracts.ts, runs consistency test) |
| `.cursor/hooks/validate_output.sh` | `pytest tests/test_validate_output_hook.py` |
| Routing logic, state management, orchestrator flow | `pytest tests/test_routing.py tests/test_graph_topology.py tests/test_cursor_runner.py` |
| `step_critique.py`, `cursor/prompts.py` (critique prompt builders) | `pytest tests/test_critique_prompts.py` |

Before writing new tests, read `.claude/skills/testing/SKILL.md`.

## Frontend checks

After frontend-only changes (backend checks not required):

1. Run checks from the `frontend/` folder.
2. Use `npm run check` in `frontend/`.
3. Report any errors and fix them before proceeding.

## Reference

Architecture: see `docs/DESIGN.md`
Context flow between agents: `docs/context_flow.md` (authoritative — update when pipeline changes)
Backend conventions and procedures: `.claude/skills/backend/`
Frontend patterns (Svelte 5 runes, SSE): `.claude/skills/frontend/`
Cursor orchestrator deep-dive: `.claude/skills/cursor-backend/`
Testing conventions: `.claude/skills/testing/`
Doc maintenance (which docs to update for which changes): `.claude/skills/docs/`
Trace analysis during improvement loops: `.claude/skills/trace-analysis/` (defines which tools to use — Read/Glob/Grep only, never Bash)
Backend docs: `docs/backends/langgraph.md`, `docs/backends/cursor.md`
