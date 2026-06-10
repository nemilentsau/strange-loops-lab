# Module 1 UX Reboot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Tasks are numbered in execution order; execute top-down. Checkboxes prefixed
> **User:** are human-judgment gates — stop and hand back; never self-certify.

**Goal:** Replace Module 1's dark, chrome-heavy UI with the approved "graphite & parchment lab desk": the rule-applying bench visible immediately, guidance demoted to a quiet rail, one oxblood action accent, epistemic registers carried by form.

**Architecture:** Presentational and compositional rework only. No state-shape, persistence, dialogue, or MIU-logic changes; the 104-test suite stays green throughout. A shared `LabDesk` layout component plus a `CommandBar` replace the stacked chrome; each phase recomposes into guide/instrument/evidence rails.

**Tech Stack:** Svelte 5, handwritten CSS in `src/app.css` (custom properties + BEM-ish classes), Playwright MCP for screenshot verification.

**Source of truth:** `docs/superpowers/specs/2026-06-10-module1-ux-reboot-design.md` — read it before every task. Where this plan and the spec disagree, the spec wins.

---

## Standing constraints (every task)

- Epistemic contract: verified = solid graphite + ✓/✗ stamps; computed = dashed; coaching = dotted + italic serif. Never by hue. The `data-tone`/`data-verdict` attribute contract is retained.
- Oxblood `#8a3b2e` means "you can act here" and nothing else. One hue per screen.
- Free phase navigation always.
- Functionality parity — nothing currently on a surface is dropped, only relocated.
- Desktop-first: design at ≥1200px; simple stacking fallback 900–1200px; NO small-viewport gates (the old 375px screenshot requirement is retired).
- After each task: `npm run check` (0 errors), `npm run test` (104 passing), `npm run build`, commit with trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Screenshot verification per task via Playwright MCP at 1280px (and 1536px in Task 7), saved under `/tmp/ux-reboot/<task>/`.

---

## Task 1: Parchment theme foundation

**Purpose:** Flip the token layer and every base surface to the new language so later tasks work in the real material. Old layout temporarily wears new clothes — acceptable transitional state.

**Files:**
- Modify: `src/app.css` (heavy)
- Test: `npm run check`, `npm run test`, `npm run build`

New token block (replaces the dark tokens — `--void`, `--grid-paper`, `--grid-ground`, `--rim-bg` and friends are deleted along with their texture/animation consumers):

```css
:root {
	/* ground & surfaces */
	--page: #f1efea;
	--page-meta: #f5f1e6;
	--panel: #faf9f6;
	--panel-meta: #fbf8f0;
	--line: #dedbd3;
	--line-strong: #b9b4a6;
	/* ink */
	--ink: #2b2a27;
	--muted: #5f5b4e;
	--faint: #85816f;
	/* the one accent: actionable only */
	--act: #8a3b2e;
	--act-ink: #faf9f6; /* text on filled accent */
	/* type */
	--serif: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
	--sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	--mono: ui-monospace, 'SF Mono', Menlo, monospace;
	--radius: 8px;
}
```

- [ ] Replace the token block as above; sweep `src/app.css` updating every consumer of removed tokens. Page ground `--page`; panels `--panel` with `--line` hairlines; headings `--serif`; UI copy `--sans`; MIU strings `--mono`. No shadows, gradients, or texture backgrounds anywhere.
- [ ] Re-express the register grammar in light ink: `[data-tone='verified']` solid `--ink` left-rule/frame + existing ✓/✗ stamp chips in graphite; `[data-tone='computed']` dashed `--faint`; coaching (dialogue surfaces) dotted + `--serif` italic. Strip teal/gold/rose hues from all register styling.
- [ ] Restyle interactive elements (buttons, links, inputs, move cards, trace steps, filter chips, tabs): rest state is ink-on-panel with `--line-strong` borders; hover/focus/primary use `--act`. Filled primary buttons: `--act` bg, `--act-ink` text.
- [ ] Re-express the level canvases: `.phase-canvas--object` sits on `--page` with a faint ruled-paper tint (`background-image: linear-gradient(var(--line) 1px, transparent 1px); background-size: 100% 1.4rem;` at low opacity); `.phase-canvas--meta` sits on `--page-meta` with a double-rule frame (border + offset outline) and serif-italic panel titles. Delete the dark grid/void/specimen treatments and the meta pull-back animation (keep `prefers-reduced-motion` guard for whatever motion remains).
- [ ] Dialogue transcript: coaching register only (dotted, italic serif, slightly warmer paper tint allowed); roles distinguished by edge style, never hue.
- [ ] Verify legibility/contrast by screenshotting all four phases at 1280px; confirm per-screen hue count is one (oxblood) and registers are distinguishable in grayscale.
- [ ] `npm run check` (0 errors) · `npm run test` (104) · `npm run build`.
- [ ] Commit.

Acceptance: the app is parchment-and-ink everywhere with oxblood marking only actions; no dark tokens remain in `app.css`; tests/check/build green.

---

## Task 2: Command bar replaces the chrome stack

**Purpose:** Collapse hero + ContextStrip + PhaseNav into one slim bar; reclaim ~400px.

**Files:**
- Create: `src/lib/components/CommandBar.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte`
- Delete: `src/lib/components/ContextStrip.svelte`, `src/lib/components/PhaseNav.svelte`
- Modify: `src/app.css` (bar styles; remove hero/strip/nav styles)
- Test: `npm run check`, `npm run test`, `npm run build`

- [ ] Build `CommandBar.svelte` per spec: left — wordmark (small, serif) + four phase tabs (buttons, free navigation, active tab oxblood) visually clustered ▦ (Explore, Map) | ◉ (Prove, Reflect) with a thin divider; right — current string (mono) · step · I-count · mod-3 · level tag from `LEVEL_PRESENTATION[PHASE_META[active].level]` · Reset button. Props mirror what ContextStrip + PhaseNav received today (string, counts, active phase, visited, `onSelectPhase`, reset handler); no new state.
- [ ] Recompose `+page.svelte`: replace the hero section, `<ContextStrip>`, and `<PhaseNav>` with `<CommandBar>`. The welcome banner STAYS for now (it moves into the guide rail in Task 3). The working question input is intentionally absent from the bar; it returns in the guide rail in Task 3 (one-commit gap, draft state untouched).
- [ ] Delete `ContextStrip.svelte` and `PhaseNav.svelte` and their now-orphaned styles (`.context-strip*`, `.phase-nav*`, `.module-hero*` for module-1).
- [ ] Keep the non-module-1 route branch rendering correctly (it uses `.module-hero` — keep a minimal generic style for it or scope the deletion to module-1's compact hero only).
- [ ] Screenshot all four phases at 1280px: bar present, free navigation works, level tag flips ▦/◉ correctly.
- [ ] `npm run check` · `npm run test` (104 — `module1.spec.ts` untouched) · `npm run build`.
- [ ] Commit.

Acceptance: exactly one chrome block above phase content; all bar facts live-update; navigation unrestricted.

---

## Task 3: Lab desk + Explore recomposition

**Purpose:** The bench becomes the first thing on screen; guidance becomes a quiet rail.

**Files:**
- Create: `src/lib/components/LabDesk.svelte`
- Modify: `src/lib/components/phases/PhaseExplore.svelte`
- Modify: `src/routes/modules/[slug]/+page.svelte` (banner removal, question prop into Explore guide rail)
- Modify: `src/app.css`
- Test: `npm run check`, `npm run test`, `npm run build`

`LabDesk.svelte` skeleton (Svelte 5 snippets):

```svelte
<script lang="ts">
	let { guide, instrument, evidence } = $props();
</script>

<div class="lab-desk">
	<aside class="lab-desk__guide">{@render guide()}</aside>
	<section class="lab-desk__instrument">{@render instrument()}</section>
	<aside class="lab-desk__evidence">{@render evidence()}</aside>
</div>
```

```css
.lab-desk { display: grid; grid-template-columns: 0.9fr 2fr 0.9fr; gap: 16px; align-items: start; }
@media (max-width: 1200px) { .lab-desk { grid-template-columns: 1fr; } /* stack: instrument, evidence, guide via order */ }
```

- [ ] Create `LabDesk.svelte` as above; instrument panel carries the oxblood frame (`--act` border) marking the main event. In the stacked fallback, order = instrument, evidence, guide.
- [ ] Recompose `PhaseExplore.svelte` into the desk: **guide** = editable working question (moves here from old ContextStrip; new `workingQuestion`/`onUpdateQuestion` props), dismissible first-run hint card (replaces the page-level welcome banner; same session-scoped dismissal — pass `isNewSession`/dismiss handling down or keep the flag in the page and pass props), the three guided tasks as compact single-line rows with expand-on-click detail. **instrument** = THE BENCH: current string large (mono), legal move cards, propose-a-string input with the verifier verdicts rendering INLINE beneath it (the old separate Verifier Workbench panel content relocates here; same verdict components/registers). **evidence** = derivation trace (jump/undo/restart) + the computed next-reachable preview (dashed register).
- [ ] Remove the welcome banner from `+page.svelte`.
- [ ] All existing callbacks keep their names and flow; no handler logic changes in the page beyond prop wiring.
- [ ] Screenshot Explore at 1280×800: current string + legal moves fully visible without scrolling, guidance visually subordinate. Also capture 1280 full-page.
- [ ] `npm run check` · `npm run test` (104) · `npm run build`.
- [ ] Commit.

Acceptance: at 1280×800 the bench is on screen and obviously primary on load; tasks/question/hint live in the left rail; trace on the right; workbench verdicts appear under the propose input.

---

## Task 4: Map recomposition

**Files:** Modify `src/lib/components/phases/PhaseMap.svelte`, `src/app.css`. Test: check, test, build.

- [ ] Desk mapping: **guide** = working question (same prop pattern as Explore) + map guided tasks (compact rows) + depth/node-bound selects. **instrument** = reachability graph explorer + node inspector (provenance) on select. **evidence** = "What the search shows so far" observations (computed register, unchanged copy) + the Map→Prove bridge card at the rail's bottom (trigger condition untouched: `truncatedBy !== null && !graphNodeExists(graph, nodeIdFor('MU'))`; meta double-rule framing, ◉, no verified styling).
- [ ] Screenshot Map at 1280px below and at the truncation bound (bridge hidden/visible).
- [ ] check · test (104) · build · commit.

Acceptance: graph is the visual center; observations readable without competing; bridge appears only at a bound.

---

## Task 5: Prove recomposition

**Files:** Modify `src/lib/components/phases/PhaseProve.svelte`, `src/app.css`. Test: check, test, build.

- [ ] Desk mapping: **guide** = working question + the claim ("MU is unreachable from MI.") + built-in invariant entry button. **instrument** = invariant workbench: candidate input + the proof scaffold (claim → candidate → holds now → per-rule preservation → conclusion). **evidence** = per-rule preservation verdicts (verified register, ✓/✗ stamps) + save invariant-run / save proof-attempt actions + artifact status line.
- [ ] Meta canvas treatment applies (plain `--page-meta`, double-rule frame, serif-italic titles).
- [ ] Screenshot Prove at 1280px with the built-in invariant applied (verdicts populated).
- [ ] check · test (104) · build · commit.

Acceptance: the proof scaffold reads as the instrument; verdicts are evidence, visually verified-register; saves are oxblood actions.

---

## Task 6: Reflect recomposition

**Files:** Modify `src/lib/components/phases/PhaseReflect.svelte`, `src/app.css`. Test: check, test, build.

- [ ] Desk mapping: **guide** = working question + reflection prompts (compact, one-click seed into notes) + save-progress/save-note/save-trace controls + snapshot status. **instrument** = synthesis: notes editor + explain-back examiner (input, run button, transcript — coaching register: dotted, italic serif; roles by edge style). **evidence** = artifact notebook: type filter chips with counts, artifact entries with payload-derived metadata and "Restore to …" buttons, artifact status line.
- [ ] Meta canvas treatment applies.
- [ ] Screenshot Reflect at 1280px with several artifacts present (restore a few via dev seed or create note/trace artifacts live).
- [ ] check · test (104) · build · commit.

Acceptance: notes + dialogue are the instrument; the notebook is a calm right-rail ledger; nothing coaching-styled outside the transcript.

---

## Task 7: Purge, docs, and final gate

**Files:**
- Modify: `src/app.css` (dead-rule purge)
- Modify: `docs/module-1-ux-vision.md`, `docs/strange-loops-module-1.md` (sections 6.5/9 status notes), `docs/product-architecture.md` (CommandBar/LabDesk in the component layer), `improvement-plan.md` (Task 2 gate superseded by this plan's final gate; pointer to the spec)
- Test: full suite + build + full screenshot set

- [ ] Sweep `src/app.css` for orphaned rules (old realm/nav/strip/hero/banner/dark-era selectors; grep each removed class against `src/`); delete dead rules and any unused keyframes.
- [ ] Update the four docs listed above to reflect the shipped direction (the ux-vision doc gets the graphite-parchment/lab-desk direction recorded as current; keep `strange-loops-module-1.md` canonical-status language consistent).
- [ ] Full verification: `npm run check` (0 errors) · `npm run test` (104) · `npm run build` · screenshots of all four phases at 1280px AND 1536px to `/tmp/ux-reboot/final/`.
- [ ] Grayscale check: convert one screenshot per register-bearing phase to grayscale and confirm verified/computed/coaching remain distinguishable.
- [ ] **User:** final visual sign-off across all four phases (this closes the gate that previously belonged to improvement-plan.md Task 2).
- [ ] Commit.

Acceptance: no dead styles; docs match reality; the user has signed off on the reboot.

---

## Verification quick-reference

```bash
npm run check
npm run test     # 104 passing, throughout
npm run build
npm run dev      # background, for Playwright screenshots
```

Persistence/dialogue smoke are unaffected by this plan (no server-side changes) — run `npm run smoke:persistence` once at the end as a sanity check if desired.

## Explicit non-steps

- No state, persistence, dialogue, or MIU-logic changes; no new features.
- No mobile design work; no small-viewport verification gates.
- No register-by-hue styling anywhere; no second accent color.
- Do not break the non-module-1 module route shell.
