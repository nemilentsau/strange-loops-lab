# Derivation Page Figures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MIU page read the reader's own derivation in all three sections through three computed figures, remove the static characters block and the bit-breakdown popover, and bring the docs back to the current state.

**Architecture:** Three pure data modules under `src/lib/miu` (`residueFigure.ts`, `depthFigure.ts`, `lengthFigure.ts`) compute everything a figure draws and are unit-tested; three Svelte components render inline SVG from that data. The page lifts the trace reading to page level and passes it down, and the existing search worker gains a `K_bits` request so the target's bit minimum is computed off-thread like `K_steps`. Docs are corrected in the same commits as the code they describe.

**Tech Stack:** SvelteKit (Svelte 5 runes), TypeScript, vitest (node project only; no component tests), plain CSS in `src/app.css` with the dead-CSS gate, inline SVG.

**Spec:** `docs/superpowers/specs/2026-09-02-derivation-page-figures-design.md` — read it first; the plan argues from it. Both files are working artifacts and are deleted in the final task.

## Global Constraints

- Design law, `docs/module-1-postmortem.md` "Binding design law", binds every task: mechanics or absence; a box must earn its border; every element names the fact it teaches; mock every state; copy written per case; the accent (`--act`) means "you can act here" and is never used in a figure.
- Prose skill `.agents/skills/prose/SKILL.md` binds every caption and doc sentence: no antithesis, no personified searches, no hand-holding, formal statements displayed not prosed.
- Figures are monochrome graphite. Marks are distinguished by form and direct label, never by hue. No hover layer; the specimen table is the length figure's table view.
- Rules never live in source comments (`CLAUDE.md`). A comment may say what a line does locally.
- Dead-CSS gate: every class added to `src/app.css` is used in `src/` in the same commit. `npm run check` and `npm run test` pass at every commit.
- Register: every number drawn is verified formal state or a checked deterministic transform; bracket captions carry their horizon.
- Math markup in Svelte: `.mv` spans for variables, `.o` spans for object strings, Unicode symbols, `<sub>`/`<sup>`. No new dependencies.
- Numbers used in tests below were computed from the engine on 2026-09-02 with `maxNodes` 200 000: BFS layer sizes from `MI` for lengths 0–9 are `1, 2, 3, 5, 14, 44, 213, 1448, 14155, 194220`; the I-run family `M·I^(2^k)`, k = 0..5, has `L_literal` = `3, 6, 10, 16, 26, 44` and `K_bits` = `4, 7, 10, 13, 16, 19` with `K_steps` = `0..5`; `MUIIU` has `L_literal` 10, `K_bits` 23, `K_steps` 5; `MIIIUIU` has `L_literal` 12, `K_bits` 35, `K_steps` 8.
- Commit messages end with the attribution trailer the session prescribes.

---

### Task 1: Docs audit — delete shipped working artifacts, fix stale references

**Files:**
- Delete: `docs/superpowers/plans/2026-07-11-lab-index-and-inline-derivation-readings.md`
- Delete: `docs/superpowers/plans/2026-07-13-miu-lecture-notes.md`
- Delete: `docs/superpowers/specs/2026-07-11-lab-index-and-derivation-readings-design.md`
- Delete: `docs/superpowers/specs/2026-07-13-miu-lecture-notes-design.md`
- Modify: `docs/agent-behavior.md` (the "It replaces the older split" sentence and the date)
- Modify: `.agents/skills/testing/SKILL.md` (the `agents.md` reference)
- Modify: `README.md` (the dialogue line in Quick start)

**Interfaces:** none.

- [ ] **Step 1: Delete the four shipped spec/plan files**

Both July builds shipped (routes `/`, `/form-and-meaning/miu`, `/form-and-meaning/pq`, `/form-and-meaning/miu/notes` exist and were merged). The repo hygiene rule says working artifacts are deleted when the build they served ships.

```bash
git rm docs/superpowers/plans/2026-07-11-lab-index-and-inline-derivation-readings.md \
       docs/superpowers/plans/2026-07-13-miu-lecture-notes.md \
       docs/superpowers/specs/2026-07-11-lab-index-and-derivation-readings-design.md \
       docs/superpowers/specs/2026-07-13-miu-lecture-notes-design.md
```

- [ ] **Step 2: Remove the reference to files that no longer exist in `docs/agent-behavior.md`**

Delete this paragraph entirely (it is the only paragraph naming `docs/spec.md`):

```markdown
It replaces the older split between `docs/spec.md` and
`docs/agents-prompt.md`.
```

Change `Last updated: July 9, 2026.` to `Last updated: September 2, 2026.`

- [ ] **Step 3: Fix the instructions file name in the testing skill**

In `.agents/skills/testing/SKILL.md`, replace

```markdown
- If you add a new command or test location, update `agents.md` so future work can discover it quickly.
```

with

```markdown
- If you add a new command or test location, update `CLAUDE.md` so future work can discover it quickly.
```

- [ ] **Step 4: Move the dialogue sentence out of Quick start in `README.md`**

Delete the line `Dialogue mode expects a local Claude Code installation and authentication.` from the Quick start section. In the "Optional dialogue env:" block's preceding line, change `Optional dialogue env:` to:

```markdown
The dormant dialogue layer shells out to a local Claude Code installation; the instrument does not use it. Optional dialogue env:
```

- [ ] **Step 5: Verify nothing else references the deleted files**

Run: `grep -rn "2026-07-11\|2026-07-13\|docs/spec.md\|agents-prompt" README.md CLAUDE.md docs .agents`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add -A docs .agents README.md
git commit -m "docs: delete shipped July specs and plans; fix stale references"
```

---

### Task 2: Mockups of the played states — STOP for approval

Design law rule 7: interaction changes are approved on sight before implementation. This task produces the mockup and then halts. **Do not begin Task 3 until the user has approved the screenshots.**

**Files:**
- Create: `docs/mockups/derivation-figures.html` (gitignored via `docs/mockups/`; never committed)

**Interfaces:** none.

- [ ] **Step 1: Write the standalone mockup**

One HTML file, no external CSS (app.css imports Tailwind and cannot be linked standalone). Copy the token block from `src/app.css` `:root` into a `<style>` and reuse the page's typography (Georgia serif, ui-monospace labels, `#f1efea` ground, `#2b2a27` ink, `#dedbd3` lines). The mockup shows, at 1800 px width, four played states of the two changed sections stacked one after another, each headed by a `microlabel` naming the state:

1. **Mid-session, target not reached.** Trace `MI → MII → MIIII → MIIIIU → MIIIIUIIIIU` (residues 1 → 2 → 1 → 1 → 2, 4 moves, 16 bits), target `MUIIU` (residue 2, `K_steps` 5, `K_bits` 23, `L_literal` 10, construction 5 moves).
2. **Target reached.** Trace ending at `MUIIU` after 5 moves with a 23-bit program (the shortest), so the reader mark and the target ring coincide.
3. **Residue-zero target.** Target `MUIIIU` (3 I's, residue 0): ring at 0, verdict ✗, no depth or length bracket, captions for the non-theorem case.
4. **Exhausted bracket.** A deep target with the search stopped: ruled out 7, construction 9, so the depth figure shades 0–7 and ticks 9; the length figure shows the floor-to-upper segment 31 → 46. No shipped example string exhausts the default budget, so every number in this state is illustrative; say so in the state's microlabel.

Draw the three figures as literal SVG with the geometry from Tasks 5, 9 (copy the `<svg>` markup from those tasks and fill in numbers by hand). Show the invariant section as its two-column grid with the residue figure at the top of the right column, and the description-length section with the figure pair above the specimen table.

- [ ] **Step 2: Screenshot every state at full width**

Use the Playwright MCP browser tools: `browser_resize` to 1800 × 1100, `browser_navigate` to `file:///…/docs/mockups/derivation-figures.html`, `browser_take_screenshot` with `fullPage: true` saved to `.playwright-mcp/derivation-figures-1800.png`. Then resize to 1100 × 900 and screenshot again to `.playwright-mcp/derivation-figures-1100.png` (the figure pair must stack below 1180 px).

- [ ] **Step 3: Look at both screenshots and fix collisions before showing them**

Check: no label overlaps another label or a mark; the literal curve exits the frame cleanly; the depth bars' count labels fit in their 48 px columns; the residue figure's gap label does not touch the 0 node.

- [ ] **Step 4: Halt and present**

Report to the user with both screenshot paths and the four states listed. Wait for approval. Record any requested change in the relevant task below before continuing.

---

### Task 3: Remove the characters block and the bit-breakdown popover; correct the docs

**Files:**
- Delete: `src/lib/components/miu/MiuCharacters.svelte`
- Delete: `src/lib/miu/programEncoding.ts`, `src/lib/miu/programEncoding.spec.ts`
- Modify: `src/lib/components/miu/MiuInvariant.svelte` (import line 2 and the final `<MiuCharacters />`)
- Modify: `src/lib/components/miu/MiuSheet.svelte` (popover state, action, window handler, markup)
- Modify: `src/app.css` (`.characters*`, `.character-table*`, `.forward-reference*`, `.bit-explainer*`, `.bit-breakdown*`, and their media-query entries)
- Modify: `CLAUDE.md`, `README.md`, `docs/product-architecture.md`, `docs/strange-loops-vision.md`, `docs/bridge-ledger.md`, `docs/module-1-postmortem.md`, `src/routes/form-and-meaning/miu/notes/+page.svelte`

**Interfaces:** none; later tasks add components where this one removes them.

- [ ] **Step 1: Remove the characters component**

```bash
git rm src/lib/components/miu/MiuCharacters.svelte
```

In `src/lib/components/miu/MiuInvariant.svelte` delete the line `import MiuCharacters from './MiuCharacters.svelte';` and the final line `<MiuCharacters />`.

- [ ] **Step 2: Remove the popover from the worksheet**

In `src/lib/components/miu/MiuSheet.svelte`:

Delete the import `import { describeProgramEncoding } from '$lib/miu/programEncoding';`.

Delete the block from `let showBitBreakdown = $state(false);` through the end of the `clickOutside` function (the `$effect` that closes the breakdown, its two comment lines, and `clickOutside`).

Delete `const programBreakdown = $derived(describeProgramEncoding(traceReading.activeMoves));`.

Delete the whole `<svelte:window onkeydown={...} />` element.

Replace the program-reading claim, from `<span class="bit-explainer" use:clickOutside=…>` through its closing `</span>` (the element that contains the `bit-explainer__trigger` button and the `bit-breakdown` group), with:

```svelte
{traceReading.activeProgram.bitLength} encoded bits
```

so the claim reads `4 steps · 16 encoded bits` as plain text. The step column of the spine already shows each instruction's bits.

Delete the module:

```bash
git rm src/lib/miu/programEncoding.ts src/lib/miu/programEncoding.spec.ts
```

Confirm nothing else imports it: `grep -rn programEncoding src` → no output.

- [ ] **Step 3: Delete the dead CSS**

In `src/app.css` delete every rule whose selector starts with `.characters`, `.character-table`, `.forward-reference`, `.bit-explainer`, or `.bit-breakdown`, including the copies inside the `@media` blocks (search for each prefix; there are entries near the `1180px`, `860px`, and `640px` blocks). Run the gate to be sure nothing is left:

Run: `npm run check:dead-css`
Expected: passes with no reported class.

Also grep the reverse direction: `grep -n "characters__\|bit-breakdown\|bit-explainer\|forward-reference" src/app.css` → no output.

- [ ] **Step 4: Update the docs that described the removed block**

`CLAUDE.md`, "Current stage" list — replace

```markdown
- see the wall (MU rejected by the I-count invariant, followed by the character
  table, rule pullbacks, and forbidden-residue indicator of ℤ/3);
```

with

```markdown
- see the wall (MU rejected by the I-count invariant, with the rule action on
  ℤ/3 drawn as a figure the reader's own derivation traces);
```

`README.md`, "Current focus" invariant bullet — replace the sentence `The proof constructs all three characters of ℤ/3, their rule pullbacks, and the Fourier indicator of the forbidden residue.` with:

```markdown
  The rule action on ℤ/3 is drawn: R2 swaps residues 1 and 2, the other rules
  fix every residue, and no arrow enters 0 from {1, 2}; the reader's derivation
  traces its path on that figure. The characters of ℤ/3 are built in the formal
  layer and proved in the notes; they are displayed when the pq instrument has
  a measured table to set beside them.
```

`README.md`, "Status" first paragraph — replace `invariant certificate, character construction, and two explicit description-length costs` with `invariant certificate with its residue figure, the ℤ/3 characters in the formal layer, and two explicit description-length costs`.

`docs/product-architecture.md` §2.1 — replace the `MiuInvariant.svelte` and `MiuCharacters.svelte` bullet with:

```markdown
- `MiuInvariant.svelte` and `MiuResidueFigure.svelte` — the wall. The I-count
  certificate rejects residue zero; the residue figure draws the rule action on
  ℤ/3 and traces the reader's active derivation on it. The characters of ℤ/3
  stay in the formal layer (`characters.ts`) for the pq bridge and are not
  displayed on this instrument.
```

Also in §2.1 `MiuSheet.svelte` bullet, no change. In §4 item 3 replace `and `invariants.ts` plus `characters.ts` supply the wall and its Fourier form` with `and `invariants.ts` supplies the wall while `residueFigure.ts` supplies the drawn rule action on ℤ/3`. Change `Last updated: July 12, 2026.` to `Last updated: September 2, 2026.`

`docs/strange-loops-vision.md` §11 — replace `The invariant certificate excludes residue zero, and the same surface constructs the character table of ℤ/3, the rule pullbacks, and the Fourier indicator of the forbidden residue.` with:

```markdown
The invariant certificate excludes residue zero and draws the rule action on
ℤ/3 with the reader's derivation traced on it. The character table, rule
pullbacks, and forbidden indicator of ℤ/3 are built in the formal layer and
proved in the lecture notes, held for the pq comparison.
```

`docs/bridge-ledger.md`, pq entry, "Evidence" — replace `and `src/lib/components/miu/MiuCharacters.svelte` for the shipped prerequisite.` with:

```markdown
  and §2 of the MIU lecture notes for the built prerequisite. The instrument's
  character display was removed on 2026-09-02: a built table with no measured
  table beside it teaches nothing the induction did not (notes, Remark 2.9).
```

`docs/module-1-postmortem.md`, "What is sound and stays" — replace `The wheel itself was later replaced by the explicit ℤ/3 character table (`MiuCharacters.svelte`); what stayed is the lesson that the algebra of the invariant is where attention lives.` with `The wheel was replaced by a character table in July 2026 and, in September 2026, by a drawn rule action on ℤ/3 that the reader's derivation traces; what stayed is the lesson that the algebra of the invariant is where attention lives.`

`src/routes/form-and-meaning/miu/notes/+page.svelte`, Proposition 2.7 — replace `This is the identity the instrument's indicator row computes.` with `This identity is computed by <span class="o">deltaZeroFromCharacters</span> in the instrument's source and exercised by its tests.`

- [ ] **Step 5: Run checks and tests**

Run: `npm run check && npm run test`
Expected: both pass; the test count drops by the `programEncoding.spec.ts` cases only.

Run: `grep -rn "MiuCharacters\|indicator row\|character table" CLAUDE.md README.md docs src --include=*.md --include=*.svelte --include=*.ts | grep -v "bridge-ledger\|notes/+page\|postmortem\|vision"`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove the characters block and the bit-breakdown popover from the MIU page"
```

---

### Task 4: Residue figure data — rule arrows and the reader's trajectory

**Files:**
- Create: `src/lib/miu/residueFigure.ts`
- Test: `src/lib/miu/residueFigure.spec.ts`

**Interfaces:**
- Consumes: `residueAfterRule(ruleId, residue)` and `Z3Residue` from `./characters`; `MIU_RULES`, `MiuRuleId` from `./core`.
- Produces:
  - `toZ3Residue(value: number): Z3Residue` — throws unless 0, 1, or 2.
  - `residueArrows(): ResidueArrow[]` with `ResidueArrow = { ruleId: MiuRuleId; from: Z3Residue; to: Z3Residue }`, twelve entries, rules in `MIU_RULES` order, residues 0, 1, 2 within each rule.
  - `residueTrajectory(residues: number[]): ResidueTrajectory` with `ResidueTrajectory = { start: Z3Residue; current: Z3Residue; transits: ResidueTransit[] }` and `ResidueTransit = { from: Z3Residue; to: Z3Residue; count: number }`, transits in first-seen order.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/miu/residueFigure.spec.ts
import { describe, expect, it } from 'vitest';
import { residueArrows, residueTrajectory, toZ3Residue } from './residueFigure';

describe('residue figure data', () => {
	it('draws twelve arrows: R2 swaps 1 and 2 and fixes 0; R1, R3, R4 fix every residue', () => {
		const arrows = residueArrows();
		expect(arrows).toHaveLength(12);
		const doubling = arrows.filter((arrow) => arrow.ruleId === 'double-tail');
		expect(doubling.map((arrow) => [arrow.from, arrow.to])).toEqual([
			[0, 0],
			[1, 2],
			[2, 1]
		]);
		for (const arrow of arrows.filter((arrow) => arrow.ruleId !== 'double-tail')) {
			expect(arrow.to).toBe(arrow.from);
		}
	});

	it('has no arrow entering 0 from a nonzero residue', () => {
		const entering = residueArrows().filter((arrow) => arrow.to === 0 && arrow.from !== 0);
		expect(entering).toEqual([]);
	});

	it('counts each ordered transit of the reader path in first-seen order', () => {
		expect(residueTrajectory([1, 2, 1, 1, 2])).toEqual({
			start: 1,
			current: 2,
			transits: [
				{ from: 1, to: 2, count: 2 },
				{ from: 2, to: 1, count: 1 },
				{ from: 1, to: 1, count: 1 }
			]
		});
	});

	it('reads the bare axiom as a trajectory with no transits', () => {
		expect(residueTrajectory([1])).toEqual({ start: 1, current: 1, transits: [] });
	});

	it('rejects an empty path and a value outside Z/3', () => {
		expect(() => residueTrajectory([])).toThrow('at least the axiom residue');
		expect(() => toZ3Residue(3)).toThrow('Not a residue mod 3: 3');
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run src/lib/miu/residueFigure.spec.ts`
Expected: FAIL — cannot resolve `./residueFigure`.

- [ ] **Step 3: Implement the module**

```ts
// src/lib/miu/residueFigure.ts
import { MIU_RULES, type MiuRuleId } from './core';
import { residueAfterRule, type Z3Residue } from './characters';

export interface ResidueArrow {
	ruleId: MiuRuleId;
	from: Z3Residue;
	to: Z3Residue;
}

export interface ResidueTransit {
	from: Z3Residue;
	to: Z3Residue;
	count: number;
}

export interface ResidueTrajectory {
	start: Z3Residue;
	current: Z3Residue;
	transits: ResidueTransit[];
}

const RESIDUES: readonly Z3Residue[] = [0, 1, 2];

export function toZ3Residue(value: number): Z3Residue {
	if (value === 0 || value === 1 || value === 2) {
		return value;
	}
	throw new Error(`Not a residue mod 3: ${value}`);
}

export function residueArrows(): ResidueArrow[] {
	return MIU_RULES.flatMap((ruleId) =>
		RESIDUES.map((from) => ({ ruleId, from, to: residueAfterRule(ruleId, from) }))
	);
}

export function residueTrajectory(residues: number[]): ResidueTrajectory {
	if (residues.length === 0) {
		throw new Error('A trajectory needs at least the axiom residue');
	}
	const path = residues.map(toZ3Residue);
	const transits = new Map<string, ResidueTransit>();
	for (let index = 1; index < path.length; index += 1) {
		const from = path[index - 1]!;
		const to = path[index]!;
		const key = `${from}>${to}`;
		const transit = transits.get(key) ?? { from, to, count: 0 };
		transit.count += 1;
		transits.set(key, transit);
	}
	return { start: path[0]!, current: path[path.length - 1]!, transits: [...transits.values()] };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest --run src/lib/miu/residueFigure.spec.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/miu/residueFigure.ts src/lib/miu/residueFigure.spec.ts
git commit -m "feat: residue figure data — rule arrows on Z/3 and the reader's trajectory"
```

---

### Task 5: The residue figure component, wired to the reader's derivation and target

**Files:**
- Create: `src/lib/components/miu/MiuResidueFigure.svelte`
- Modify: `src/lib/components/miu/MiuInvariant.svelte` (props; render the figure at the top of `cert-side`)
- Modify: `src/lib/components/miu/MiuSheet.svelte` (take `traceReading` as a prop instead of computing it)
- Modify: `src/routes/form-and-meaning/miu/+page.svelte` (lift the trace reading; pass new props)
- Modify: `src/app.css` (figure classes)

**Interfaces:**
- Consumes: `residueArrows`, `residueTrajectory` from Task 4; `readDerivationTrace` and `DerivationTraceReading` from `$lib/miu/traceReadings`; `Z3Residue` from `$lib/miu/characters`; `ellipsizeMiddle` from `$lib/state/module1`.
- Produces: `MiuResidueFigure` props `{ residues: number[]; moves: number; targetResidue: Z3Residue | null; targetLabel: string | null; reachedTarget: boolean }`. `MiuInvariant` takes the same five props and forwards them. `MiuSheet` gains the prop `traceReading: DerivationTraceReading`. The page exposes `traceReading`, `targetResidue`, and `reachedTarget` for Task 9.

- [ ] **Step 1: Lift the trace reading to the page**

In `src/routes/form-and-meaning/miu/+page.svelte` add the imports

```ts
import { readDerivationTrace } from '$lib/miu/traceReadings';
```

and, directly after the `theoremDecision` declaration, add

```ts
const traceReading = $derived(readDerivationTrace(draft.trace));
const reachedTarget = $derived(
	trimmedProduceTarget !== '' && currentString === trimmedProduceTarget
);
const targetResidue = $derived(
	theoremDecision.outcome === 'invalid' ? null : theoremDecision.residue
);
```

(`decideMiuTheorem` already returns the residue as `0 | 1 | 2`, which is `Z3Residue`.)

Pass `{traceReading}` to `<MiuSheet … />` and replace `<MiuInvariant />` with

```svelte
<MiuInvariant
	residues={traceReading.activeResidues}
	moves={traceReading.activeMoves.length}
	{targetResidue}
	targetLabel={theoremDecision.outcome === 'invalid' ? null : trimmedProduceTarget}
	{reachedTarget}
/>
```

- [ ] **Step 2: Make the worksheet take the reading as a prop**

In `src/lib/components/miu/MiuSheet.svelte`: delete `import { readDerivationTrace } from '$lib/miu/traceReadings';` and add `import type { DerivationTraceReading } from '$lib/miu/traceReadings';`. Add `traceReading` to the destructured props and its type `traceReading: DerivationTraceReading;`. Delete the line `const traceReading = $derived(readDerivationTrace(trace));`.

- [ ] **Step 3: Write the figure component**

```svelte
<!-- src/lib/components/miu/MiuResidueFigure.svelte -->
<script lang="ts">
	import type { Z3Residue } from '$lib/miu/characters';
	import { residueArrows, residueTrajectory } from '$lib/miu/residueFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		residues,
		moves,
		targetResidue,
		targetLabel,
		reachedTarget
	}: {
		residues: number[];
		moves: number;
		targetResidue: Z3Residue | null;
		targetLabel: string | null;
		reachedTarget: boolean;
	} = $props();

	const NODE: Record<Z3Residue, { x: number; y: number }> = {
		1: { x: 120, y: 120 },
		2: { x: 240, y: 120 },
		0: { x: 400, y: 120 }
	};
	const LOOP: Record<Z3Residue, string> = {
		1: 'M 108 110 a 16 16 0 1 0 0 20',
		2: 'M 252 110 a 16 16 0 1 1 0 20',
		0: 'M 390 108 a 16 16 0 1 1 20 0'
	};
	const SWAP = 'M 136 120 L 224 120';
	const ORDER: Z3Residue[] = [1, 2, 0];
	const LOOP_LABEL: Record<Z3Residue, { x: number; y: number; anchor: string; text: string }> = {
		1: { x: 70, y: 124, anchor: 'end', text: 'R1 R3 R4' },
		2: { x: 292, y: 124, anchor: 'start', text: 'R1 R3 R4' },
		0: { x: 400, y: 62, anchor: 'middle', text: 'R1 R2 R3 R4' }
	};

	const trajectory = $derived(residueTrajectory(residues));
	const swapCount = $derived(
		trajectory.transits
			.filter((transit) => transit.from !== transit.to)
			.reduce((sum, transit) => sum + transit.count, 0)
	);
	function loopCount(residue: Z3Residue): number {
		return (
			trajectory.transits.find((transit) => transit.from === residue && transit.to === residue)
				?.count ?? 0
		);
	}
	function traversedWidth(count: number): number {
		return 1 + Math.min(count, 3);
	}
	const arrowsEnteringZero = $derived(
		residueArrows().filter((arrow) => arrow.to === 0 && arrow.from !== 0).length
	);
	const shortTarget = $derived(targetLabel ? ellipsizeMiddle(targetLabel) : null);
</script>

<figure class="figure" aria-label="The rule action on residues mod 3">
	<svg viewBox="0 0 460 210" role="img">
		<defs>
			<marker id="residue-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
				<path d="M 0 0 L 8 4 L 0 8 z" class="fig-arrowhead" />
			</marker>
		</defs>

		<path d={SWAP} class="fig-edge" marker-start="url(#residue-arrow)" marker-end="url(#residue-arrow)" />
		{#if swapCount > 0}
			<path d={SWAP} class="fig-edge fig-edge--traversed" stroke-width={traversedWidth(swapCount)} />
		{/if}
		<text x="180" y="108" class="fig-label" text-anchor="middle">R2</text>

		{#each ORDER as residue (residue)}
			<path d={LOOP[residue]} class="fig-edge" marker-end="url(#residue-arrow)" />
			{#if loopCount(residue) > 0}
				<path d={LOOP[residue]} class="fig-edge fig-edge--traversed" stroke-width={traversedWidth(loopCount(residue))} />
			{/if}
			<text x={LOOP_LABEL[residue].x} y={LOOP_LABEL[residue].y} class="fig-label" text-anchor={LOOP_LABEL[residue].anchor}>{LOOP_LABEL[residue].text}</text>
		{/each}

		<line x1="336" y1="66" x2="336" y2="174" class="fig-sep" />
		<text x="336" y="196" class="fig-text" text-anchor="middle">{arrowsEnteringZero === 0 ? 'no arrow enters 0 from {1, 2}' : `${arrowsEnteringZero} arrows enter 0`}</text>

		{#each ORDER as residue (residue)}
			{#if targetResidue === residue}
				<circle cx={NODE[residue].x} cy={NODE[residue].y} r="23" class="fig-ring" />
			{/if}
			<circle cx={NODE[residue].x} cy={NODE[residue].y} r="16" class="fig-node" class:fig-node--current={trajectory.current === residue} />
			<text x={NODE[residue].x} y={NODE[residue].y} class="fig-node-text" class:fig-node-text--current={trajectory.current === residue}>{residue}</text>
		{/each}

		<text x={NODE[1].x} y="156" class="fig-text" text-anchor="middle">MI</text>
		{#if targetResidue !== null && shortTarget}
			<text x={NODE[targetResidue].x} y="172" class="fig-text" text-anchor="middle">{shortTarget}</text>
		{/if}
	</svg>
	<figcaption class="figure__caption">
		{#if targetResidue === 0 && targetLabel}
			<span class="o">{shortTarget}</span> has residue 0. No arrow enters 0 from {'{'}1, 2{'}'}, so
			no derivation reaches it. Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}.
		{:else if reachedTarget && targetLabel}
			Your derivation ends at <span class="o">{shortTarget}</span>, residue {trajectory.current},
			after {moves} {moves === 1 ? 'move' : 'moves'}; every string on the way stayed in {'{'}1, 2{'}'}.
		{:else if targetResidue !== null && targetLabel}
			Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}. <span class="o">{shortTarget}</span> has residue
			{targetResidue}; both lie in {'{'}1, 2{'}'}.
		{:else}
			Your derivation is at residue {trajectory.current} after {moves}
			{moves === 1 ? 'move' : 'moves'}; every string on the way stayed in {'{'}1, 2{'}'}.
		{/if}
	</figcaption>
</figure>
```

- [ ] **Step 4: Render it in the invariant section**

In `src/lib/components/miu/MiuInvariant.svelte` add

```ts
import MiuResidueFigure from './MiuResidueFigure.svelte';
import type { Z3Residue } from '$lib/miu/characters';

let {
	residues,
	moves,
	targetResidue,
	targetLabel,
	reachedTarget
}: {
	residues: number[];
	moves: number;
	targetResidue: Z3Residue | null;
	targetLabel: string | null;
	reachedTarget: boolean;
} = $props();
```

and, as the first child of `<div class="cert-side">`, before the `ruledout` block:

```svelte
<div>
	<p class="microlabel">The rule action on ℤ/3</p>
	<MiuResidueFigure {residues} {moves} {targetResidue} {targetLabel} {reachedTarget} />
</div>
```

- [ ] **Step 5: Add the figure CSS**

Append to `src/app.css` before the `/* Collapse points` media blocks:

```css
.figure {
	margin: 0;
	min-width: 0;
}

.figure svg {
	display: block;
	width: 100%;
	height: auto;
	overflow: visible;
}

.figure__caption {
	margin: 8px 0 0;
	color: var(--muted);
	font-size: var(--t-caption);
	line-height: 1.55;
	max-width: var(--measure);
}

.fig-edge {
	fill: none;
	stroke: var(--ink);
	stroke-width: 1;
}

.fig-edge--traversed {
	stroke-linecap: round;
}

.fig-arrowhead {
	fill: var(--ink);
}

.fig-sep {
	stroke: var(--faint);
	stroke-dasharray: 2 4;
}

.fig-node {
	fill: var(--panel);
	stroke: var(--ink);
	stroke-width: 1.5;
}

.fig-node--current {
	fill: var(--ink);
}

.fig-node-text {
	fill: var(--ink);
	font-family: var(--mono);
	font-size: 12px;
	text-anchor: middle;
	dominant-baseline: central;
}

.fig-node-text--current {
	fill: var(--panel);
}

.fig-ring {
	fill: none;
	stroke: var(--ink);
	stroke-width: 1.25;
}

.fig-label {
	fill: var(--ink);
	font-family: var(--serif);
	font-size: 12px;
}

.fig-text {
	fill: var(--muted);
	font-family: var(--mono);
	font-size: 10px;
	letter-spacing: 0.04em;
}
```

- [ ] **Step 6: Check, test, and play**

Run: `npm run check && npm run test`
Expected: pass.

Start `npm run dev`, open `/form-and-meaning/miu` at 1800 px wide, and play: apply `→ MII`, `→ MIIII`, `→ MIIIIU`, then double again. The R2 edge and the loop on 1 thicken, the current disc fills, the residue caption updates. Type target `MUIIIU`: the ring moves to 0 and the caption states the residue-0 case. Type `MUIIU`: the ring sits on 2. Screenshot at full page to `.playwright-mcp/residue-figure-played.png` and inspect it.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "feat: draw the rule action on Z/3 and trace the reader's derivation on it"
```

---

### Task 6: `K_bits` for the target, off the main thread

**Files:**
- Modify: `src/lib/miu/searchWorker.ts`
- Modify: `src/routes/form-and-meaning/miu/+page.svelte`

**Interfaces:**
- Consumes: `shortestBitProgram`, `BitProgramResult` from `$lib/miu/bitComplexity`; `encodeDerivation` from `$lib/miu/coding`.
- Produces: worker protocol
  ```ts
  export type SearchRequest =
  	| { kind: 'steps'; target: string; maxDepth: number; maxNodes: number }
  	| { kind: 'bits'; target: string; maxNodes: number };
  export type SearchResponse =
  	| { kind: 'progress'; completedDepth: number }
  	| { kind: 'result'; result: ShortestDerivation }
  	| { kind: 'bits-result'; result: BitProgramResult }
  	| { kind: 'error'; message: string };
  ```
  and page state `bitResult: BitProgramResult | null`, `bitSearchRunning: boolean`, `constructedBits: number | null` for Task 9.

- [ ] **Step 1: Extend the worker**

Replace the body of `src/lib/miu/searchWorker.ts` below the doc comment with:

```ts
import { shortestBitProgram, type BitProgramResult } from './bitComplexity';
import { shortestTheoremDerivation, type ShortestDerivation } from './complexity';

export type SearchRequest =
	| { kind: 'steps'; target: string; maxDepth: number; maxNodes: number }
	| { kind: 'bits'; target: string; maxNodes: number };

export type SearchResponse =
	| { kind: 'progress'; completedDepth: number }
	| { kind: 'result'; result: ShortestDerivation }
	| { kind: 'bits-result'; result: BitProgramResult }
	| { kind: 'error'; message: string };

self.onmessage = (event: MessageEvent<SearchRequest>) => {
	const request = event.data;

	try {
		if (request.kind === 'bits') {
			const result = shortestBitProgram(request.target, { maxNodes: request.maxNodes });
			self.postMessage({ kind: 'bits-result', result } satisfies SearchResponse);
			return;
		}

		const result = shortestTheoremDerivation(request.target, {
			maxDepth: request.maxDepth,
			maxNodes: request.maxNodes,
			onLayerComplete: (completedDepth) => {
				self.postMessage({ kind: 'progress', completedDepth } satisfies SearchResponse);
			}
		});
		self.postMessage({ kind: 'result', result } satisfies SearchResponse);
	} catch (error) {
		self.postMessage({
			kind: 'error',
			message: error instanceof Error ? error.message : String(error)
		} satisfies SearchResponse);
	}
};
```

Keep the existing `/// <reference lib="webworker" />` line and the doc comment; amend the comment's first sentence to `Off-thread host for the K_steps and K_bits searches.`

- [ ] **Step 2: Send the `steps` kind from the page and add the bits effect**

In `src/routes/form-and-meaning/miu/+page.svelte`, change the existing `worker.postMessage({ target: searchTarget, maxDepth: …, maxNodes })` to

```ts
worker.postMessage({
	kind: 'steps',
	target: searchTarget,
	maxDepth: MIU_QUERY_BOUNDS.maxDepth,
	maxNodes
} satisfies SearchRequest);
```

and change the import to `import type { SearchRequest, SearchResponse } from '$lib/miu/searchWorker';`. Add imports

```ts
import type { BitProgramResult } from '$lib/miu/bitComplexity';
import { encodeDerivation } from '$lib/miu/coding';
```

After the `K_steps` effect add:

```ts
const constructedBits = $derived(
	constructedPath ? encodeDerivation(constructedPath).bitLength : null
);
let bitResult = $state<BitProgramResult | null>(null);
let bitSearchRunning = $state(false);

$effect(() => {
	const searchTarget = trimmedProduceTarget;
	const maxNodes = queryMaxNodes;

	if (!browser || theoremDecision.outcome !== 'theorem') {
		bitResult = null;
		bitSearchRunning = false;
		return;
	}

	bitResult = null;
	bitSearchRunning = true;

	const worker = new SearchWorker();
	worker.onmessage = (event: MessageEvent<SearchResponse>) => {
		const message = event.data;
		if (message.kind === 'bits-result') {
			bitResult = message.result;
			bitSearchRunning = false;
		} else if (message.kind === 'error') {
			console.error(`K_bits search failed for ${searchTarget}: ${message.message}`);
			bitSearchRunning = false;
		}
	};
	worker.postMessage({ kind: 'bits', target: searchTarget, maxNodes } satisfies SearchRequest);

	return () => worker.terminate();
});
```

- [ ] **Step 3: Check and confirm in the browser**

Run: `npm run check`
Expected: pass.

In the dev server, open the page with the browser console visible and type target `MIIIUIU`. No console error. (The result is consumed in Task 9; this task only proves the protocol compiles and runs.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/miu/searchWorker.ts src/routes/form-and-meaning/miu/+page.svelte
git commit -m "feat: run the K_bits search for the target in the search worker"
```

---

### Task 7: Length figure data — the literal curve, the I-run family, and the bit bracket

**Files:**
- Create: `src/lib/miu/lengthFigure.ts`
- Test: `src/lib/miu/lengthFigure.spec.ts`

**Interfaces:**
- Consumes: `shortestBitProgram`, `BitProgramResult` from `./bitComplexity`; `literalMiuBitLength` from `./coding`; `MIU_QUERY_BOUNDS` from `./complexity`.
- Produces:
  - `I_RUN_TAIL_LENGTHS = [1, 2, 4, 8, 16, 32]`.
  - `iRunPoints(): LengthPoint[]` with `LengthPoint = { value: string; tailLength: number; literalBits: number; programBits: number }`.
  - `literalCurve(maxTailLength: number): { tailLength: number; bits: number }[]` for tail lengths 1..max.
  - `bitBracket(result: BitProgramResult | null, constructedBits: number): BitBracket` with
    ```ts
    export type BitBracket =
    	| { kind: 'exact'; bits: number }
    	| { kind: 'bracket'; floor: number; upper: number; maxNodes: number }
    	| { kind: 'pending'; upper: number };
    ```

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/miu/lengthFigure.spec.ts
import { describe, expect, it } from 'vitest';
import { bitBracket, iRunPoints, literalCurve } from './lengthFigure';

describe('length figure data', () => {
	it('prices the I-run family: the literal grows with the tail, the program by 3 bits per doubling', () => {
		const points = iRunPoints();
		expect(points.map((point) => point.value)).toEqual([
			'MI',
			'MII',
			'MIIII',
			'MIIIIIIII',
			'MIIIIIIIIIIIIIIII',
			'MIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII'
		]);
		expect(points.map((point) => point.literalBits)).toEqual([3, 6, 10, 16, 26, 44]);
		expect(points.map((point) => point.programBits)).toEqual([4, 7, 10, 13, 16, 19]);
	});

	it('has the program overtake the literal exactly at tail length 4', () => {
		const points = iRunPoints();
		const shorter = points.filter((point) => point.programBits < point.literalBits);
		expect(shorter.map((point) => point.tailLength)).toEqual([8, 16, 32]);
		expect(points.find((point) => point.tailLength === 4)).toMatchObject({
			literalBits: 10,
			programBits: 10
		});
	});

	it('samples the literal cost at every tail length from 1', () => {
		expect(literalCurve(4)).toEqual([
			{ tailLength: 1, bits: 3 },
			{ tailLength: 2, bits: 6 },
			{ tailLength: 3, bits: 7 },
			{ tailLength: 4, bits: 10 }
		]);
	});

	it('reports a found search as exact', () => {
		expect(
			bitBracket({ outcome: 'found', target: 'MUI', bitLength: 14, path: [], maxNodes: 200000 }, 14)
		).toEqual({ kind: 'exact', bits: 14 });
	});

	it('closes the bracket when the certified floor meets the construction', () => {
		expect(
			bitBracket(
				{ outcome: 'exhausted', target: 'x', bitLength: null, path: null, lowerBound: 31, maxNodes: 200000 },
				31
			)
		).toEqual({ kind: 'exact', bits: 31 });
	});

	it('keeps the bracket open between the floor and the construction', () => {
		expect(
			bitBracket(
				{ outcome: 'exhausted', target: 'x', bitLength: null, path: null, lowerBound: 31, maxNodes: 200000 },
				46
			)
		).toEqual({ kind: 'bracket', floor: 31, upper: 46, maxNodes: 200000 });
	});

	it('reports a missing result as pending under the construction bound', () => {
		expect(bitBracket(null, 46)).toEqual({ kind: 'pending', upper: 46 });
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run src/lib/miu/lengthFigure.spec.ts`
Expected: FAIL — cannot resolve `./lengthFigure`.

- [ ] **Step 3: Implement the module**

```ts
// src/lib/miu/lengthFigure.ts
import { shortestBitProgram, type BitProgramResult } from './bitComplexity';
import { literalMiuBitLength } from './coding';
import { MIU_QUERY_BOUNDS } from './complexity';

export const I_RUN_TAIL_LENGTHS = [1, 2, 4, 8, 16, 32] as const;

export interface LengthPoint {
	value: string;
	tailLength: number;
	literalBits: number;
	programBits: number;
}

export type BitBracket =
	| { kind: 'exact'; bits: number }
	| { kind: 'bracket'; floor: number; upper: number; maxNodes: number }
	| { kind: 'pending'; upper: number };

export function iRunPoints(): LengthPoint[] {
	return I_RUN_TAIL_LENGTHS.map((tailLength) => {
		const value = `M${'I'.repeat(tailLength)}`;
		const result = shortestBitProgram(value, { maxNodes: MIU_QUERY_BOUNDS.maxNodes });
		if (result.outcome !== 'found') {
			throw new Error(`K_bits search exhausted on the I-run ${value}`);
		}
		return { value, tailLength, literalBits: literalMiuBitLength(value), programBits: result.bitLength };
	});
}

export function literalCurve(maxTailLength: number): { tailLength: number; bits: number }[] {
	const curve: { tailLength: number; bits: number }[] = [];
	for (let tailLength = 1; tailLength <= maxTailLength; tailLength += 1) {
		curve.push({ tailLength, bits: literalMiuBitLength(`M${'I'.repeat(tailLength)}`) });
	}
	return curve;
}

export function bitBracket(result: BitProgramResult | null, constructedBits: number): BitBracket {
	if (result === null) {
		return { kind: 'pending', upper: constructedBits };
	}
	if (result.outcome === 'found') {
		return { kind: 'exact', bits: result.bitLength };
	}
	if (result.lowerBound === constructedBits) {
		return { kind: 'exact', bits: constructedBits };
	}
	return { kind: 'bracket', floor: result.lowerBound, upper: constructedBits, maxNodes: result.maxNodes };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest --run src/lib/miu/lengthFigure.spec.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/miu/lengthFigure.ts src/lib/miu/lengthFigure.spec.ts
git commit -m "feat: length figure data — literal curve, I-run family, bit bracket"
```

---

### Task 8: Depth figure data — layer sizes and the step bracket

**Files:**
- Create: `src/lib/miu/depthFigure.ts`
- Test: `src/lib/miu/depthFigure.spec.ts`

**Interfaces:**
- Consumes: `MIU_INITIAL_STRING`, `enumerateMiuMoves` from `./core`; `ShortestDerivation` from `./complexity`.
- Produces:
  - `MIU_LAYER_SIZES = [1, 2, 3, 5, 14, 44, 213, 1448, 14155, 194220]` — strings first reached at derivation length n, n = 0..9.
  - `countMiuLayers(maxDepth: number): number[]` — recomputes the same by BFS.
  - `stepBracket(shortest, ruledOut, constructedLength, running): StepBracket` with
    ```ts
    export type StepBracket =
    	| { kind: 'exact'; steps: number }
    	| { kind: 'bracket'; ruledOut: number; upper: number; running: boolean };
    ```

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/miu/depthFigure.spec.ts
import { describe, expect, it } from 'vitest';
import type { ShortestDerivation } from './complexity';
import { MIU_LAYER_SIZES, countMiuLayers, stepBracket } from './depthFigure';

const base = { target: 'x', maxDepth: 64, maxNodes: 200000 };

function found(length: number): ShortestDerivation {
	return { ...base, outcome: 'found', length, path: [], stoppedBy: null, completedDepth: null };
}

function exhausted(completedDepth: number): ShortestDerivation {
	return { ...base, outcome: 'exhausted', length: null, path: null, stoppedBy: 'nodes', completedDepth };
}

describe('depth figure data', () => {
	it('recomputes the recorded layer sizes by breadth-first search from MI', () => {
		expect(countMiuLayers(9)).toEqual([...MIU_LAYER_SIZES]);
	});

	it('reports the axiom as exactly zero moves', () => {
		expect(stepBracket(null, null, 0, true)).toEqual({ kind: 'exact', steps: 0 });
	});

	it('reports a found search as exact', () => {
		expect(stepBracket(found(5), null, 5, false)).toEqual({ kind: 'exact', steps: 5 });
	});

	it('closes the bracket when exhaustion reaches one below the construction', () => {
		expect(stepBracket(exhausted(8), null, 9, false)).toEqual({ kind: 'exact', steps: 9 });
	});

	it('keeps the bracket open otherwise', () => {
		expect(stepBracket(exhausted(7), null, 9, false)).toEqual({
			kind: 'bracket',
			ruledOut: 7,
			upper: 9,
			running: false
		});
	});

	it('advances the bracket with the running search progress', () => {
		expect(stepBracket(null, 3, 9, true)).toEqual({ kind: 'bracket', ruledOut: 3, upper: 9, running: true });
		expect(stepBracket(null, null, 9, true)).toEqual({ kind: 'bracket', ruledOut: 0, upper: 9, running: true });
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run src/lib/miu/depthFigure.spec.ts`
Expected: FAIL — cannot resolve `./depthFigure`.

- [ ] **Step 3: Implement the module**

```ts
// src/lib/miu/depthFigure.ts
import type { ShortestDerivation } from './complexity';
import { MIU_INITIAL_STRING, enumerateMiuMoves } from './core';

export const MIU_LAYER_SIZES = [1, 2, 3, 5, 14, 44, 213, 1448, 14155, 194220] as const;

export type StepBracket =
	| { kind: 'exact'; steps: number }
	| { kind: 'bracket'; ruledOut: number; upper: number; running: boolean };

export function countMiuLayers(maxDepth: number): number[] {
	const seen = new Set<string>([MIU_INITIAL_STRING]);
	let frontier = [MIU_INITIAL_STRING];
	const sizes = [1];
	for (let depth = 1; depth <= maxDepth; depth += 1) {
		const next: string[] = [];
		for (const value of frontier) {
			for (const move of enumerateMiuMoves(value)) {
				if (!seen.has(move.result)) {
					seen.add(move.result);
					next.push(move.result);
				}
			}
		}
		sizes.push(next.length);
		frontier = next;
	}
	return sizes;
}

export function stepBracket(
	shortest: ShortestDerivation | null,
	ruledOut: number | null,
	constructedLength: number,
	running: boolean
): StepBracket {
	if (constructedLength === 0) {
		return { kind: 'exact', steps: 0 };
	}
	if (shortest?.outcome === 'found' && shortest.length !== null) {
		return { kind: 'exact', steps: shortest.length };
	}
	if (shortest?.outcome === 'exhausted') {
		const completed = shortest.completedDepth ?? 0;
		if (completed === constructedLength - 1) {
			return { kind: 'exact', steps: constructedLength };
		}
		return { kind: 'bracket', ruledOut: completed, upper: constructedLength, running: false };
	}
	return { kind: 'bracket', ruledOut: ruledOut ?? 0, upper: constructedLength, running };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest --run src/lib/miu/depthFigure.spec.ts`
Expected: PASS, 6 tests; the layer recomputation takes about one second.

- [ ] **Step 5: Commit**

```bash
git add src/lib/miu/depthFigure.ts src/lib/miu/depthFigure.spec.ts
git commit -m "feat: depth figure data — layer sizes from MI and the step bracket"
```

---

### Task 9: The depth and length figures, wired into the description-length section

**Files:**
- Create: `src/lib/components/miu/MiuDepthFigure.svelte`
- Create: `src/lib/components/miu/MiuLengthFigure.svelte`
- Modify: `src/lib/components/miu/MiuBridge.svelte` (props; section order; figure pair)
- Modify: `src/routes/form-and-meaning/miu/+page.svelte` (pass props to `MiuBridge`)
- Modify: `src/app.css` (figure-pair and plot classes; media query)

**Interfaces:**
- Consumes: `stepBracket`, `StepBracket`, `MIU_LAYER_SIZES` (Task 8); `bitBracket`, `BitBracket`, `iRunPoints`, `literalCurve`, `LengthPoint` (Task 7); page state `shortestStepResult`, `searchRuledOut`, `searchRunning`, `constructedPath`, `constructedBits`, `bitResult`, `bitSearchRunning`, `traceReading`, `reachedTarget`, `theoremDecision`, `currentString` (Tasks 5–6); `literalMiuBitLength` from `$lib/miu/coding`; `ellipsizeMiddle` from `$lib/state/module1`.
- Produces: `MiuBridge` props
  ```ts
  {
  	target: string;
  	isTheorem: boolean;
  	shortest: ShortestDerivation | null;
  	searchRuledOut: number | null;
  	searchRunning: boolean;
  	constructedLength: number | null;
  	constructedBits: number | null;
  	bitResult: BitProgramResult | null;
  	reader: { value: string; steps: number; bits: number; atTarget: boolean };
  }
  ```
  `MiuDepthFigure` props `{ target: string; bracket: StepBracket | null; reader: { steps: number; atTarget: boolean } }`.
  `MiuLengthFigure` props `{ family: LengthPoint[]; literal: { tailLength: number; bits: number }[]; target: { value: string; tailLength: number; literalBits: number; bracket: BitBracket } | null; reader: { value: string; tailLength: number; bits: number; steps: number; atTarget: boolean } }`.

- [ ] **Step 1: Pass the props from the page**

Replace `<MiuBridge />` in `src/routes/form-and-meaning/miu/+page.svelte` with:

```svelte
<MiuBridge
	target={trimmedProduceTarget}
	isTheorem={theoremDecision.outcome === 'theorem'}
	shortest={shortestStepResult}
	{searchRuledOut}
	{searchRunning}
	constructedLength={constructedPath?.length ?? null}
	{constructedBits}
	{bitResult}
	reader={{
		value: currentString,
		steps: traceReading.activeMoves.length,
		bits: traceReading.activeProgram.bitLength,
		atTarget: reachedTarget
	}}
/>
```

- [ ] **Step 2: Write the depth figure**

```svelte
<!-- src/lib/components/miu/MiuDepthFigure.svelte -->
<script lang="ts">
	import { MIU_LAYER_SIZES, type StepBracket } from '$lib/miu/depthFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		target,
		bracket,
		reader
	}: {
		target: string;
		bracket: StepBracket | null;
		reader: { steps: number; atTarget: boolean };
	} = $props();

	const STEP = 48;
	const LEFT = 40;
	const BASE = 150;
	const TOP = 40;
	const BAR_MAX = BASE - TOP;
	const LOG_MAX = Math.log10(MIU_LAYER_SIZES[MIU_LAYER_SIZES.length - 1]);

	const upperMark = $derived(
		bracket === null ? 0 : bracket.kind === 'exact' ? bracket.steps : bracket.upper
	);
	const columns = $derived(
		Math.max(MIU_LAYER_SIZES.length + 2, upperMark + 2, reader.atTarget ? reader.steps + 2 : 0)
	);
	const width = $derived(LEFT + STEP * columns + 8);
	function x(n: number): number {
		return LEFT + STEP * n + STEP / 2;
	}
	function barHeight(size: number): number {
		return (Math.log10(size) / LOG_MAX) * BAR_MAX + 4;
	}
	const shortTarget = $derived(ellipsizeMiddle(target));
	const formatCount = (size: number) => size.toLocaleString('en-US').replace(/,/g, ' ');
</script>

<figure class="figure" aria-label="Derivation length and the strings first reached at each length">
	<svg viewBox={`0 0 ${width} 200`} role="img">
		{#if bracket?.kind === 'bracket'}
			<rect x={LEFT} y={TOP - 12} width={STEP * (bracket.ruledOut + 1)} height={BASE - TOP + 12} class="fig-shade" />
		{/if}

		{#each MIU_LAYER_SIZES as size, n (n)}
			<rect x={x(n) - 10} y={BASE - barHeight(size)} width="20" height={barHeight(size)} class="fig-bar" />
			<text x={x(n)} y={BASE - barHeight(size) - 4} class="fig-text" text-anchor="middle">{formatCount(size)}</text>
		{/each}

		<line x1={LEFT} y1={BASE} x2={width - 8} y2={BASE} class="fig-axis" />
		{#each Array.from({ length: columns }, (_, n) => n) as n (n)}
			<text x={x(n)} y={BASE + 16} class="fig-text" text-anchor="middle">{n}</text>
		{/each}
		<text x={LEFT} y={BASE + 34} class="fig-text">n = derivation length; bar = strings first reached at n (log scale)</text>

		{#if bracket?.kind === 'exact'}
			<path d={`M ${x(bracket.steps) - 6} ${BASE + 2} L ${x(bracket.steps) + 6} ${BASE + 2} L ${x(bracket.steps)} ${BASE - 8} z`} class="fig-tick" />
			<text x={x(bracket.steps)} y={TOP - 18} class="fig-label" text-anchor="middle">K<tspan class="fig-sub">steps</tspan> = {bracket.steps}</text>
		{:else if bracket?.kind === 'bracket'}
			<path d={`M ${x(bracket.upper) - 6} ${BASE + 2} L ${x(bracket.upper) + 6} ${BASE + 2} L ${x(bracket.upper)} ${BASE - 8} z`} class="fig-tick fig-tick--hollow" />
			<text x={x(bracket.upper)} y={TOP - 18} class="fig-label" text-anchor="middle">construction: {bracket.upper}</text>
			<text x={x(bracket.ruledOut) + STEP / 2} y={TOP - 4} class="fig-text" text-anchor="end">ruled out ≤ {bracket.ruledOut}</text>
		{/if}

		{#if reader.atTarget && bracket !== null}
			<path d={`M ${x(reader.steps)} ${BASE - 26} l 6 6 l -6 6 l -6 -6 z`} class="fig-diamond" />
			<text x={x(reader.steps)} y={BASE - 32} class="fig-text" text-anchor="middle">your derivation</text>
		{/if}
	</svg>
	<figcaption class="figure__caption">
		{#if bracket === null}
			{#if target === ''}
				No target is set; the axis shows how fast the layers grow.
			{:else}
				No derivation reaches <span class="o">{shortTarget}</span>: the invariant above excludes it,
				so <span class="mv">K</span><sub>steps</sub> is undefined for it.
			{/if}
		{:else if bracket.kind === 'exact'}
			<span class="mv">K</span><sub>steps</sub>(<span class="o">{shortTarget}</span>) = {bracket.steps}:
			the shortest derivation has {bracket.steps} {bracket.steps === 1 ? 'move' : 'moves'}.
			{#if reader.atTarget}
				Your derivation has {reader.steps}{reader.steps === bracket.steps ? ' and is minimal.' : `; the minimum is ${bracket.steps}.`}
			{/if}
		{:else if bracket.running}
			Derivations of at most {bracket.ruledOut} {bracket.ruledOut === 1 ? 'move' : 'moves'} are ruled
			out and the search is still running; the construction gives
			<span class="mv">K</span><sub>steps</sub> ≤ {bracket.upper}.
		{:else}
			Derivations of at most {bracket.ruledOut} {bracket.ruledOut === 1 ? 'move' : 'moves'} are ruled
			out and the construction has {bracket.upper}: {bracket.ruledOut} &lt;
			<span class="mv">K</span><sub>steps</sub> ≤ {bracket.upper}. The search stopped at its budget
			before ruling out {bracket.ruledOut + 1}.
			{#if reader.atTarget}
				Your derivation has {reader.steps} {reader.steps === 1 ? 'move' : 'moves'}.
			{/if}
		{/if}
	</figcaption>
</figure>
```

- [ ] **Step 3: Write the length figure**

```svelte
<!-- src/lib/components/miu/MiuLengthFigure.svelte -->
<script lang="ts">
	import type { BitBracket, LengthPoint } from '$lib/miu/lengthFigure';
	import { ellipsizeMiddle } from '$lib/state/module1';

	let {
		family,
		literal,
		target,
		reader
	}: {
		family: LengthPoint[];
		literal: { tailLength: number; bits: number }[];
		target: { value: string; tailLength: number; literalBits: number; bracket: BitBracket } | null;
		reader: { value: string; tailLength: number; bits: number; steps: number; atTarget: boolean };
	} = $props();

	const LEFT = 50;
	const RIGHT = 600;
	const TOP = 20;
	const BASE = 220;
	const LOG_MAX = 10;
	const BITS_MAX = 64;

	function x(tailLength: number): number {
		return LEFT + (Math.log2(Math.max(1, tailLength)) / LOG_MAX) * (RIGHT - LEFT);
	}
	function y(bits: number): number {
		return BASE - (bits / BITS_MAX) * (BASE - TOP);
	}
	function place(tailLength: number, bits: number): { x: number; y: number; clipped: boolean } {
		const clippedX = tailLength > 2 ** LOG_MAX;
		const clippedY = bits > BITS_MAX;
		return {
			x: clippedX ? RIGHT : x(tailLength),
			y: clippedY ? TOP : y(bits),
			clipped: clippedX || clippedY
		};
	}
	const FAMILY_LABELS = ['MI', 'MII', 'MIIII', 'MI⁸', 'MI¹⁶', 'MI³²'];
	const literalPath = $derived(
		literal.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.tailLength)} ${y(point.bits)}`).join(' ')
	);
	const familyPath = $derived(
		family.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.tailLength)} ${y(point.programBits)}`).join(' ')
	);
	const literalExit = $derived(literal.find((point) => point.bits > BITS_MAX) ?? null);
	const targetMark = $derived(
		target === null
			? null
			: target.bracket.kind === 'exact'
				? place(target.tailLength, target.bracket.bits)
				: place(target.tailLength, target.bracket.upper)
	);
	const targetFloor = $derived(
		target !== null && target.bracket.kind === 'bracket' ? place(target.tailLength, target.bracket.floor) : null
	);
	const readerMark = $derived(place(reader.tailLength, reader.bits));
	const familyLast = $derived(family[family.length - 1] ?? null);
	const shortTarget = $derived(target ? ellipsizeMiddle(target.value) : null);
	const shortReader = $derived(ellipsizeMiddle(reader.value));
	const X_TICKS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
	const Y_TICKS = [0, 16, 32, 48, 64];
</script>

<figure class="figure" aria-label="Bits against tail length: the literal, the I-run programs, the target, and the reader's derivation">
	<svg viewBox="0 0 620 262" role="img">
		<defs>
			<clipPath id="length-plot">
				<rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BASE - TOP} />
			</clipPath>
		</defs>

		{#each Y_TICKS as bits (bits)}
			<line x1={LEFT} y1={y(bits)} x2={RIGHT} y2={y(bits)} class="fig-grid" />
			<text x={LEFT - 8} y={y(bits) + 3} class="fig-text" text-anchor="end">{bits}</text>
		{/each}
		{#each X_TICKS as tailLength (tailLength)}
			<text x={x(tailLength)} y={BASE + 16} class="fig-text" text-anchor="middle">{tailLength}</text>
		{/each}
		<line x1={LEFT} y1={BASE} x2={RIGHT} y2={BASE} class="fig-axis" />
		<text x={RIGHT} y={BASE + 34} class="fig-text" text-anchor="end">|t| = tail length after M (log₂ axis)</text>
		<text x={LEFT - 8} y={TOP - 6} class="fig-text" text-anchor="end">bits</text>

		<path d={literalPath} class="fig-literal" clip-path="url(#length-plot)" />
		{#if literalExit}
			<text x={x(literalExit.tailLength) + 6} y={TOP + 10} class="fig-label">L<tspan class="fig-sub">literal</tspan></text>
		{/if}

		<path d={familyPath} class="fig-family" />
		{#each family as point, index (point.value)}
			<circle cx={x(point.tailLength)} cy={y(point.programBits)} r="4" class="fig-dot" />
			<text x={x(point.tailLength) + 7} y={y(point.programBits) + 12} class="fig-text">{FAMILY_LABELS[index]}</text>
		{/each}
		{#if familyLast}
			<text x={x(familyLast.tailLength) + 10} y={y(familyLast.programBits) - 4} class="fig-label">K<tspan class="fig-sub">bits</tspan> of M·I<tspan class="fig-sup">2ᵏ</tspan></text>
		{/if}

		{#if targetFloor && targetMark}
			<line x1={targetMark.x} y1={targetFloor.y} x2={targetMark.x} y2={targetMark.y} class="fig-bracket" />
			<line x1={targetMark.x - 5} y1={targetFloor.y} x2={targetMark.x + 5} y2={targetFloor.y} class="fig-bracket" />
			<line x1={targetMark.x - 5} y1={targetMark.y} x2={targetMark.x + 5} y2={targetMark.y} class="fig-bracket" />
		{/if}
		{#if targetMark && target}
			<circle cx={targetMark.x} cy={targetMark.y} r="7" class="fig-ring" class:fig-ring--pending={target.bracket.kind === 'pending'} />
			<text x={targetMark.x} y={targetMark.y - 12} class="fig-label" text-anchor="middle">{shortTarget}{targetMark.clipped ? ' ↑' : ''}</text>
		{/if}

		<path d={`M ${readerMark.x} ${readerMark.y - 7} l 7 7 l -7 7 l -7 -7 z`} class="fig-diamond" />
		<text x={readerMark.x} y={readerMark.y + 22} class="fig-text" text-anchor="middle">your derivation{readerMark.clipped ? ` (${reader.bits} bits)` : ''}</text>
	</svg>
	<figcaption class="figure__caption">
		{#if target === null}
			No program prints a non-theorem, so <span class="mv">K</span><sub>bits</sub> is undefined for the
			target.
		{:else if target.bracket.kind === 'exact'}
			<span class="mv">K</span><sub>bits</sub>(<span class="o">{shortTarget}</span>) = {target.bracket.bits}
			against a literal of {target.literalBits} bits:
			{#if target.bracket.bits < target.literalBits}
				the program is shorter by {target.literalBits - target.bracket.bits}.
			{:else if target.bracket.bits > target.literalBits}
				the literal is shorter by {target.bracket.bits - target.literalBits}.
			{:else}
				the two costs are equal.
			{/if}
		{:else if target.bracket.kind === 'bracket'}
			No program under {target.bracket.floor} bits prints <span class="o">{shortTarget}</span>, and the
			construction's program has {target.bracket.upper}: {target.bracket.floor} ≤
			<span class="mv">K</span><sub>bits</sub> ≤ {target.bracket.upper}. The search stopped at
			{target.bracket.maxNodes.toLocaleString('en-US')} stored strings; the literal costs
			{target.literalBits}.
		{:else}
			The construction's program for <span class="o">{shortTarget}</span> has {target.bracket.upper}
			bits; the search for <span class="mv">K</span><sub>bits</sub> is running.
		{/if}
		{#if reader.atTarget && target}
			Your derivation is a program of {reader.bits} bits for the same string{target.bracket.kind === 'exact'
				? reader.bits === target.bracket.bits
					? ' and is minimal.'
					: `; the minimum is ${target.bracket.bits}.`
				: '.'}
		{:else}
			Your derivation, at <span class="o">{shortReader}</span> after {reader.steps}
			{reader.steps === 1 ? 'move' : 'moves'}, is a program of {reader.bits} bits.
		{/if}
	</figcaption>
</figure>
```

- [ ] **Step 4: Restructure `MiuBridge`**

Replace the `<script>` of `src/lib/components/miu/MiuBridge.svelte` with:

```svelte
<script lang="ts">
	import MiuDepthFigure from './MiuDepthFigure.svelte';
	import MiuLengthFigure from './MiuLengthFigure.svelte';
	import { shortestBitProgram, type BitProgramResult } from '$lib/miu/bitComplexity';
	import { encodeDerivation, literalMiuBitLength } from '$lib/miu/coding';
	import { MIU_QUERY_BOUNDS, shortestTheoremDerivation, type ShortestDerivation } from '$lib/miu/complexity';
	import { stepBracket } from '$lib/miu/depthFigure';
	import { DESCRIPTION_LENGTH_EXAMPLES } from '$lib/miu/examples';
	import { bitBracket, iRunPoints, literalCurve } from '$lib/miu/lengthFigure';
	import { constructMiuDerivation } from '$lib/miu/theoremhood';

	let {
		target,
		isTheorem,
		shortest,
		searchRuledOut,
		searchRunning,
		constructedLength,
		constructedBits,
		bitResult,
		reader
	}: {
		target: string;
		isTheorem: boolean;
		shortest: ShortestDerivation | null;
		searchRuledOut: number | null;
		searchRunning: boolean;
		constructedLength: number | null;
		constructedBits: number | null;
		bitResult: BitProgramResult | null;
		reader: { value: string; steps: number; bits: number; atTarget: boolean };
	} = $props();

	const family = iRunPoints();
	const literal = literalCurve(1024);

	const depthBracket = $derived(
		isTheorem && constructedLength !== null
			? stepBracket(shortest, searchRuledOut, constructedLength, searchRunning)
			: null
	);
	const lengthTarget = $derived(
		isTheorem && constructedBits !== null
			? {
					value: target,
					tailLength: target.length - 1,
					literalBits: literalMiuBitLength(target),
					bracket: bitBracket(bitResult, constructedBits)
				}
			: null
	);
	const lengthReader = $derived({
		value: reader.value,
		tailLength: reader.value.length - 1,
		bits: reader.bits,
		steps: reader.steps,
		atTarget: reader.atTarget
	});

	// the existing `const specimenRows = DESCRIPTION_LENGTH_EXAMPLES.map(...)` block follows here, unchanged
</script>
```

The existing `const specimenRows = …` block (from `const specimenRows` through its closing `});`) stays exactly as it is in the file today, directly below `lengthReader`; only the imports and props above it change. Then in the markup, move the `<p class="microlabel">Specimen strings</p>` table below a new block inserted directly after the closing `</div>` of `.defs`:

```svelte
<div class="figure-pair">
	<div>
		<p class="microlabel">Moves: <span class="mv">K</span><sub>steps</sub> on the length axis</p>
		<MiuDepthFigure {target} bracket={depthBracket} reader={{ steps: reader.steps, atTarget: reader.atTarget }} />
	</div>
	<div>
		<p class="microlabel">Bits: <span class="mv">K</span><sub>bits</sub> against the literal</p>
		<MiuLengthFigure {family} {literal} target={lengthTarget} reader={lengthReader} />
	</div>
</div>
```

The figures compute the target's `K_bits` only via the worker result passed in; the family's six searches run once at component creation, like the specimen rows.

- [ ] **Step 5: Add the plot CSS**

Append to `src/app.css` after the figure rules from Task 5:

```css
.figure-pair {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	gap: var(--space-2xl);
	margin: 0 0 var(--space-xl);
}

.figure-pair > div {
	min-width: 0;
}

.fig-axis {
	stroke: var(--line-strong);
	stroke-width: 1;
}

.fig-grid {
	stroke: var(--line);
	stroke-width: 1;
}

.fig-shade {
	fill: var(--line);
	opacity: 0.55;
}

.fig-bar {
	fill: var(--line-strong);
}

.fig-tick {
	fill: var(--ink);
	stroke: var(--ink);
}

.fig-tick--hollow {
	fill: var(--panel);
}

.fig-diamond {
	fill: var(--ink);
}

.fig-literal {
	fill: none;
	stroke: var(--ink);
	stroke-width: 1.25;
}

.fig-family {
	fill: none;
	stroke: var(--ink);
	stroke-width: 1;
	stroke-dasharray: 3 3;
}

.fig-dot {
	fill: var(--ink);
}

.fig-ring--pending {
	stroke-dasharray: 2 2;
}

.fig-bracket {
	stroke: var(--ink);
	stroke-width: 1.25;
}

.fig-sub {
	font-size: 8px;
	baseline-shift: sub;
}

.fig-sup {
	font-size: 8px;
	baseline-shift: super;
}
```

Inside the existing `@media (max-width: 1180px)` block add:

```css
	.figure-pair {
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}
```

- [ ] **Step 6: Check, test, and play every state**

Run: `npm run check && npm run test`
Expected: pass; the dead-CSS gate reports nothing.

In the dev server at 1800 px, play through and screenshot each to `.playwright-mcp/`:
1. Fresh page (`MUI`): depth tick at 3, length ring for `MUI` at (2, 14) above the literal, reader diamond at `MI` (1, 4).
2. Type `MUIIU`, show the shortest derivation and apply it to the end (5 moves): the depth caption states that your derivation is minimal; the length caption compares your program's bits with `K_bits` = 23 (the move-shortest derivation need not be the bit-shortest one, so the two marks may sit apart on the length figure).
3. Type `MUIIIU`: both captions state the non-theorem case; no marks for the target.
4. Type `MIUIIIIIUIIII`: the depth shading advances while the search runs, then settles to the tick at 5; the length figure shows the ring at (12, 22).
5. From `MI`, keep applying moves past 20 (for instance alternate R1 and R2) until the program exceeds 64 bits and the tail exceeds 1024: the diamond clips to the top edge and then to the right edge, and its label carries the bit count.

Resize to 1100 px and confirm the pair stacks.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "feat: draw K_steps and K_bits as brackets against the reader's derivation"
```

---

### Task 10: Final played review, docs pass, delete the working artifacts

**Files:**
- Modify: `README.md`, `docs/product-architecture.md`, `CLAUDE.md`
- Delete: `docs/superpowers/specs/2026-09-02-derivation-page-figures-design.md`, `docs/superpowers/plans/2026-09-02-derivation-page-figures.md`, `docs/mockups/derivation-figures.html` (untracked)

**Interfaces:** none.

- [ ] **Step 1: Play the whole page once more at full width**

Fresh page, mid-session with a tail past 64 characters, target reached, residue-zero target, exhausted bracket. Check every caption reads as a formal statement, no label collides, nothing scrolls horizontally. Fix anything found in the component it belongs to, and commit that fix separately with a `fix:` message.

- [ ] **Step 2: Bring the docs to the shipped state**

`README.md`, "Current focus", description-length bullet — append after `gamma-length-prefixed literal code.`:

```markdown
  Both minima are drawn as brackets on their length axes, beside the reader's
  own derivation as an exhibited upper bound.
```

`README.md`, "Current focus" theoremhood bullet — the sentence `Each active trace is annotated in place with its I-count residue and executable instruction code, so the same derivation is visible in all three readings before later movements generalize them.` becomes `Each active trace is annotated in place with its I-count residue and executable instruction code, and the two later sections read the same derivation through their figures.`

`docs/product-architecture.md` §2.1 — replace the `MiuBridge.svelte` bullet with:

```markdown
- `MiuBridge.svelte`, `MiuDepthFigure.svelte`, and `MiuLengthFigure.svelte` —
  the derivation read as a program. The depth figure draws `K_steps` for the
  target as a tick or a bracket over the layer sizes of the rewrite graph; the
  length figure draws `K_bits` against the literal cost on a log₂ tail-length
  axis with the I-run family and the reader's own program marked. The specimen
  table remains the figures' table view. Kolmogorov complexity and Chaitin are
  later destinations, not claims made here.
```

§2.2, the `complexity.ts` bullet: after `so the UI can display the lower bound as it rises,` add ` and the same worker answers `K_bits` requests for the target,`. Add to the list:

```markdown
- the figure data — the rule arrows on ℤ/3 and the reader's residue
  trajectory (`residueFigure.ts`), the layer sizes from `MI` and the step
  bracket (`depthFigure.ts`), the literal curve, the I-run family, and the bit
  bracket (`lengthFigure.ts`),
```

§4 item 3: after `Each reading renders directly from those results.` add ` The three figures render from `residueFigure.ts`, `depthFigure.ts`, and `lengthFigure.ts` applied to the same state.`

`CLAUDE.md`, "Current stage" third bullet — after `compared with a gamma-length-prefixed literal)` add `, each drawn as a bracket figure beside the reader's own derivation`.

- [ ] **Step 3: Delete the working artifacts**

```bash
git rm docs/superpowers/specs/2026-09-02-derivation-page-figures-design.md \
       docs/superpowers/plans/2026-09-02-derivation-page-figures.md
rm -f docs/mockups/derivation-figures.html
rmdir docs/mockups 2>/dev/null || true
```

- [ ] **Step 4: Final verification**

Run: `npm run check && npm run test && npm run build`
Expected: all pass.

Run: `git status --short`
Expected: only the intended modifications and deletions; no screenshots or mockups staged.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: record the derivation page figures; delete the shipped spec and plan"
```
