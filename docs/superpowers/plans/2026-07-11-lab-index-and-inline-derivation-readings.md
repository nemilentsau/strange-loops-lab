# Lab Index and Inline Derivation Readings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the editorial arc index and pq placeholder, move MIU to its canonical arc route, correct the `K_bits` definition, and expose each active worksheet derivation's residue and program readings beside the derivation itself.

**Architecture:** Keep route content static and local: the root index and pq placeholder are direct Svelte pages, while the existing MIU page moves intact under `/form-and-meaning/miu`. Add one pure `traceReadings.ts` projection that composes the existing trace, invariant, and coding modules; `MiuSheet.svelte` renders that projection without reimplementing mathematics. Do not add a content registry, navigation framework, or dynamic coupling to the later movements.

**Tech Stack:** TypeScript, Svelte 5, SvelteKit, Vitest, existing global CSS and browser played review.

---

## File map

- Create `src/lib/miu/traceReadings.ts`: pure projection from a persisted `DerivationTrace` to aligned row annotations and the active-prefix program.
- Create `src/lib/miu/traceReadings.spec.ts`: focused fresh-trace, jump-back, and malformed-trace behavior.
- Move `src/routes/+page.svelte` to `src/routes/form-and-meaning/miu/+page.svelte`: preserve all MIU state and search behavior under the canonical route.
- Create `src/routes/+page.svelte`: static editorial title/index page.
- Create `src/routes/form-and-meaning/pq/+page.svelte`: minimal next-instrument destination.
- Modify `src/lib/components/miu/MiuSheet.svelte`: render residue/instruction columns and two inline summaries.
- Modify `src/lib/components/miu/MiuBridge.svelte`: narrow the `K_bits` definition and table header.
- Modify `src/lib/components/miu/MiuCharacters.svelte`: label and link the pq/grokking forward reference.
- Modify `src/app.css`: title/index, breadcrumb, pq, and worksheet-reading styles.
- Modify `README.md`: replace the root-MIU claim with the new route map and inline readings.
- Modify `docs/product-architecture.md`: record the title/index and arc routes.

## Task 1: Project active derivation readings from the trace

**Files:**
- Create: `src/lib/miu/traceReadings.spec.ts`
- Create: `src/lib/miu/traceReadings.ts`

- [ ] **Step 1: Write the failing fresh-trace and jump-back tests**

Create `src/lib/miu/traceReadings.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	jumpToTraceStep,
	type DerivationTrace
} from './core';
import { readDerivationTrace } from './traceReadings';

function take(trace: DerivationTrace, result: string): DerivationTrace {
	const source = trace.steps[trace.currentIndex]!.value;
	const move = enumerateMiuMoves(source).find((candidate) => candidate.result === result);

	if (!move) throw new Error(`No move from ${source} to ${result}`);
	return applyMoveToTrace(trace, move);
}

describe('readDerivationTrace', () => {
	it('reads the axiom as residue 1 and the empty derivation program', () => {
		const reading = readDerivationTrace(createDerivationTrace());

		expect(reading.rows).toEqual([
			{
				step: { value: 'MI', via: null },
				residue: 1,
				instruction: null,
				active: true
			}
		]);
		expect(reading.activeResidues).toEqual([1]);
		expect(reading.activeMoves).toEqual([]);
		expect(reading.activeProgram).toMatchObject({ bitString: '0000', bitLength: 4 });
	});

	it('excludes preserved future steps after a jump backward', () => {
		let trace = createDerivationTrace();
		trace = take(trace, 'MII');
		trace = take(trace, 'MIIII');
		trace = jumpToTraceStep(trace, 1);

		const reading = readDerivationTrace(trace);

		expect(reading.rows.map((row) => row.active)).toEqual([true, true, false]);
		expect(reading.rows.map((row) => row.residue)).toEqual([1, 2, 1]);
		expect(reading.rows[2]!.instruction).toMatchObject({ opcode: '010' });
		expect(reading.activeResidues).toEqual([1, 2]);
		expect(reading.activeMoves).toHaveLength(1);
		expect(reading.activeProgram).toMatchObject({ bitString: '0010000', bitLength: 7 });
	});

	it('rejects a non-axiom trace step with no producing move', () => {
		const malformed: DerivationTrace = {
			steps: [
				{ value: 'MI', via: null },
				{ value: 'MII', via: null }
			],
			currentIndex: 1
		};

		expect(() => readDerivationTrace(malformed)).toThrow('Trace step 1 has no producing move');
	});
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm run test:unit -- --run src/lib/miu/traceReadings.spec.ts
```

Expected: FAIL because `./traceReadings` does not exist.

- [ ] **Step 3: Implement the pure trace projection**

Create `src/lib/miu/traceReadings.ts`:

```ts
import { encodeDerivation, type EncodedDerivation, type EncodedInstruction } from './coding';
import type { DerivationStep, DerivationTrace, MiuMove } from './core';
import { countI } from './invariants';

export interface DerivationReadingRow {
	step: DerivationStep;
	residue: number;
	instruction: EncodedInstruction | null;
	active: boolean;
}

export interface DerivationTraceReading {
	rows: DerivationReadingRow[];
	activeMoves: MiuMove[];
	activeResidues: number[];
	activeProgram: EncodedDerivation;
}

function producingMoves(steps: DerivationStep[]): MiuMove[] {
	return steps.slice(1).map((step, offset) => {
		if (!step.via) {
			throw new Error(`Trace step ${offset + 1} has no producing move`);
		}

		return step.via;
	});
}

export function readDerivationTrace(trace: DerivationTrace): DerivationTraceReading {
	const allMoves = producingMoves(trace.steps);
	const allInstructions = encodeDerivation(allMoves).instructions;
	const activeMoves = allMoves.slice(0, trace.currentIndex);
	const activeSteps = trace.steps.slice(0, trace.currentIndex + 1);

	return {
		rows: trace.steps.map((step, index) => ({
			step,
			residue: countI(step.value) % 3,
			instruction: index === 0 ? null : allInstructions[index - 1]!,
			active: index <= trace.currentIndex
		})),
		activeMoves,
		activeResidues: activeSteps.map((step) => countI(step.value) % 3),
		activeProgram: encodeDerivation(activeMoves)
	};
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm run test:unit -- --run src/lib/miu/traceReadings.spec.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Run the MIU unit suite**

Run:

```bash
npm run test:unit -- --run src/lib/miu
```

Expected: all MIU specs PASS.

- [ ] **Step 6: Commit the projection**

```bash
git add src/lib/miu/traceReadings.ts src/lib/miu/traceReadings.spec.ts
git commit -m "feat: derive inline readings from the active MIU trace"
```

## Task 2: Add the arc routes and editorial title page

**Files:**
- Move: `src/routes/+page.svelte` → `src/routes/form-and-meaning/miu/+page.svelte`
- Create: `src/routes/+page.svelte`
- Create: `src/routes/form-and-meaning/pq/+page.svelte`
- Modify: `src/app.css`

- [ ] **Step 1: Move the MIU route mechanically**

Run:

```bash
mkdir -p src/routes/form-and-meaning/miu src/routes/form-and-meaning/pq
git mv src/routes/+page.svelte src/routes/form-and-meaning/miu/+page.svelte
```

Do not change the MIU script block in this step. The local-storage key remains
`strange-loops/module-1/v2`, so the route move preserves the persisted draft.

- [ ] **Step 2: Add the MIU breadcrumb**

In `src/routes/form-and-meaning/miu/+page.svelte`, insert immediately before
`<header class="instrument-header">`:

```svelte
<nav class="instrument-breadcrumb" aria-label="Instrument location">
	<a href="/">Strange Loops Lab</a>
	<span aria-hidden="true">/</span>
	<a href="/#form-and-meaning">Form and meaning</a>
	<span aria-hidden="true">/</span>
	<span aria-current="page">MIU</span>
</nav>
```

- [ ] **Step 3: Create the editorial root page**

Create `src/routes/+page.svelte`:

```svelte
<svelte:head>
	<title>Strange Loops Lab</title>
	<meta
		name="description"
		content="Interactive instruments connecting Gödel, Escher, Bach to modern mathematics and machine learning."
	/>
</svelte:head>

<header class="lab-index__header">
	<p class="microlabel">Interactive companion to <i>Gödel, Escher, Bach</i></p>
	<div class="lab-index__masthead">
		<h1>Strange Loops Lab</h1>
		<div class="lab-index__introduction">
			<p>
				A set of interactive instruments testing structural connections between
				<i>Gödel, Escher, Bach</i>, modern mathematics, and machine learning.
			</p>
			<p>
				A connection enters only through a shared invariant, construction, obstruction,
				or proof template.
			</p>
		</div>
	</div>
</header>

<div class="arc-index" aria-label="Lab arcs">
	<section class="arc-index__arc" id="form-and-meaning">
		<div class="arc-index__identity">
			<h2>Form and meaning</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				When does a system's form capture a truth, and where is the gap?
			</p>
			<div class="instrument-list">
				<a class="instrument-entry instrument-entry--built" href="/form-and-meaning/miu">
					<span>MIU</span><small>built</small>
				</a>
				<a class="instrument-entry instrument-entry--next" href="/form-and-meaning/pq">
					<span>pq</span><small>next</small>
				</a>
				<span class="instrument-name">tq</span>
				<span class="instrument-name">consistency</span>
			</div>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Self-reference</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				How does a system refer to itself, and what happens at a fixed point?
			</p>
			<div class="instrument-list">
				<span class="instrument-name">recursion</span>
				<span class="instrument-name">quines</span>
				<span class="instrument-name">fixed points</span>
			</div>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Reflection and incompleteness</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				What happens when a system reasons about its own provability?
			</p>
			<div class="instrument-list">
				<span class="instrument-name">Gödel numbering</span>
				<span class="instrument-name">the diagonal lemma</span>
				<span class="instrument-name">Löb</span>
				<span class="instrument-name">Tarski</span>
			</div>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Computation and information</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				What is uncomputable or incompressible, and what does that say about prediction?
			</p>
			<div class="instrument-list">
				<span class="instrument-name">the halting problem</span>
				<span class="instrument-name">Rice's theorem</span>
				<span class="instrument-name">Kolmogorov complexity</span>
				<span class="instrument-name">Chaitin</span>
			</div>
		</div>
	</section>
</div>
```

- [ ] **Step 4: Create the deliberately empty pq destination**

Create `src/routes/form-and-meaning/pq/+page.svelte`:

```svelte
<svelte:head>
	<title>Strange Loops Lab | pq</title>
	<meta name="description" content="The next Form and meaning instrument in Strange Loops Lab." />
</svelte:head>

<nav class="instrument-breadcrumb" aria-label="Instrument location">
	<a href="/">Strange Loops Lab</a>
	<span aria-hidden="true">/</span>
	<a href="/#form-and-meaning">Form and meaning</a>
	<span aria-hidden="true">/</span>
	<span aria-current="page">pq</span>
</nav>

<div class="instrument-placeholder">
	<p class="microlabel">Next instrument</p>
	<h1>pq system</h1>
	<nav class="instrument-placeholder__links" aria-label="Related instruments">
		<a href="/">Arc index</a>
		<a href="/form-and-meaning/miu">MIU system</a>
	</nav>
</div>
```

- [ ] **Step 5: Add title, breadcrumb, and placeholder styles**

Append a new, labeled section to `src/app.css` before the MIU instrument section:

```css
/* ── Laboratory title and arc index ── */
.lab-index__header {
	padding: 12px 0 var(--space-xl);
	border-bottom: 2px solid var(--ink);
}

.lab-index__header > .microlabel {
	margin: 0 0 var(--space-sm);
}

.lab-index__masthead {
	display: grid;
	grid-template-columns: minmax(280px, 0.8fr) minmax(420px, 1.2fr);
	gap: var(--space-2xl);
	align-items: end;
}

.lab-index__masthead h1 {
	margin: 0;
	font-size: clamp(2.8rem, 6vw, 5.4rem);
	font-weight: 600;
	letter-spacing: -0.035em;
	line-height: 0.95;
}

.lab-index__introduction {
	max-width: var(--measure);
	color: var(--muted);
	line-height: 1.65;
}

.lab-index__introduction p {
	margin: 0;
}

.lab-index__introduction p + p {
	margin-top: var(--space-sm);
}

.arc-index__arc {
	display: grid;
	grid-template-columns: minmax(190px, 0.42fr) minmax(0, 1fr);
	gap: var(--space-2xl);
	padding: var(--space-xl) 0;
	border-bottom: 1px solid var(--line-strong);
}

.arc-index__identity h2 {
	margin: 0;
	font-size: var(--t-sub);
	font-weight: 600;
}

.arc-index__question {
	margin: 0 0 var(--space-md);
	max-width: var(--measure);
	font-size: 1.05rem;
	line-height: 1.6;
}

.instrument-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.instrument-entry,
.instrument-name {
	display: inline-flex;
	align-items: baseline;
	gap: 10px;
	color: var(--muted);
	font-family: var(--mono);
	font-size: 0.78rem;
}

.instrument-entry {
	padding: 6px 10px;
	border: 1px solid var(--line-strong);
	text-decoration: none;
}

.instrument-name {
	padding: 6px 2px;
}

a.instrument-entry {
	color: var(--ink);
}

a.instrument-entry:hover,
a.instrument-entry:focus-visible {
	border-color: var(--act);
	color: var(--act);
}

.instrument-entry small {
	color: var(--faint);
	font-size: 0.66rem;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.instrument-entry--built {
	border-color: var(--ink);
}

.instrument-entry--next {
	border-style: dashed;
}

.instrument-breadcrumb {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin: 0 0 var(--space-lg);
	color: var(--faint);
	font-family: var(--mono);
	font-size: var(--t-micro);
	letter-spacing: 0.11em;
	text-transform: uppercase;
}

.instrument-breadcrumb a {
	color: var(--muted);
	text-decoration: none;
}

.instrument-breadcrumb a:hover,
.instrument-breadcrumb a:focus-visible {
	color: var(--act);
	text-decoration: underline;
}

.instrument-placeholder {
	min-height: 62vh;
	padding: var(--space-2xl) 0;
	border-top: 2px solid var(--ink);
}

.instrument-placeholder h1 {
	margin: 6px 0 var(--space-xl);
	font-size: clamp(3rem, 8vw, 7rem);
	font-weight: 600;
	letter-spacing: -0.04em;
}

.instrument-placeholder__links {
	display: flex;
	gap: var(--space-md);
}

.instrument-placeholder__links a {
	color: var(--act);
}
```

Inside the existing `@media (max-width: 860px)` block, add:

```css
	.lab-index__masthead,
	.arc-index__arc {
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}
```

This is a conservative collapse for ordinary narrower desktop windows; do not
perform a separate phone-design pass.

- [ ] **Step 6: Run structural validation**

Run:

```bash
npm run check
npm run build
```

Expected: both commands PASS; SvelteKit emits `/`, `/form-and-meaning/miu`, and
`/form-and-meaning/pq` without compile or dead-CSS errors.

- [ ] **Step 7: Commit the route structure**

```bash
git add src/routes src/app.css
git commit -m "feat: add the lab arc index and instrument routes"
```

## Task 3: Render the two higher readings inside the worksheet

**Files:**
- Modify: `src/lib/components/miu/MiuSheet.svelte`
- Modify: `src/app.css`

- [ ] **Step 1: Wire the tested trace projection into `MiuSheet.svelte`**

Add this import:

```ts
import { readDerivationTrace } from '$lib/miu/traceReadings';
```

After the existing `revisits` derived value, add:

```ts
const traceReading = $derived(readDerivationTrace(trace));
const activeProgramParts = $derived([
	'0',
	...traceReading.activeProgram.instructions.map((instruction) =>
		instruction.siteBits
			? `${instruction.opcode} ${instruction.siteBits}`
			: instruction.opcode
	),
	'000'
]);
```

Add these local formatting helpers below `ruleNote`:

```ts
function instructionText(index: number): string {
	const instruction = traceReading.rows[index]?.instruction;
	if (!instruction) return '—';
	return instruction.siteBits ? `${instruction.opcode} ${instruction.siteBits}` : instruction.opcode;
}

function residueText(index: number): string {
	return String(traceReading.rows[index]?.residue ?? '');
}
```

- [ ] **Step 2: Add aligned annotations to past and future spine rows**

Inside the `.spine` div, before the `{#each trace.steps ...}` block, add:

```svelte
<div class="spine-reading-head" aria-hidden="true">
	<span>r(s)</span>
	<span>instruction</span>
</div>
```

In the `spineLine` snippet, insert after `spine-line__note` and before
`spine-line__jump`:

```svelte
<span class="spine-line__reading" aria-label={`Residue ${residueText(index)}`}>
	<span class="spine-line__residue">{residueText(index)}</span>
	<span class="spine-line__instruction">{instructionText(index)}</span>
</span>
```

The existing `spine-line--ahead` opacity continues to distinguish preserved
future rows. Their annotations remain visible because they are valid annotations
of those retained rows; only the compact summaries exclude them.

- [ ] **Step 3: Add annotations to the focal row**

Inside `.focal`, after `.focal__body`, add:

```svelte
<div class="focal__reading">
	<div>
		<span class="reading-column-label">r(s)</span>
		<strong>{residueText(trace.currentIndex)}</strong>
	</div>
	<div>
		<span class="reading-column-label">instruction</span>
		<code>{instructionText(trace.currentIndex)}</code>
	</div>
</div>
```

For the axiom, instruction displays `—`. For every later row it uses the
`EncodedInstruction` produced by the existing code module.

- [ ] **Step 4: Add the two compact summaries immediately below the spine**

Insert after the closing `.spine` div and before the dead-branch block:

```svelte
<div class="derivation-readings" aria-label="Two readings of the active derivation">
	<p>
		<span class="microlabel">Invariant reading</span>
		<span class="derivation-readings__sequence">
			{traceReading.activeResidues.join(' → ')}
		</span>
		<span class="derivation-readings__claim">
			<span class="stamp" aria-hidden="true">✓</span>
			every reached string remains in {'{'}1, 2{'}'}
		</span>
	</p>
	<p>
		<span class="microlabel">Program reading</span>
		<span class="derivation-readings__sequence">
			{activeProgramParts.join(' · ')}
		</span>
		<span class="derivation-readings__claim">
			{traceReading.activeMoves.length}
			{traceReading.activeMoves.length === 1 ? ' step' : ' steps'} ·
			{traceReading.activeProgram.bitLength} encoded bits
		</span>
	</p>
</div>
<p class="derivation-readings__turn">
	The invariant section proves why the residue column cannot reach 0. The
	description-length section defines the instruction code and minimizes its length.
</p>
```

- [ ] **Step 5: Add worksheet annotation styles**

In the derivation worksheet section of `src/app.css`, add:

```css
.spine-line__reading,
.focal__reading {
	display: grid;
	grid-template-columns: 3.5ch 9ch;
	gap: 12px;
	align-items: baseline;
	flex: 0 0 auto;
	font-family: var(--mono);
	font-variant-numeric: tabular-nums;
}

.spine-reading-head {
	display: grid;
	grid-template-columns: 3.5ch 9ch;
	gap: 12px;
	width: calc(12.5ch + 12px);
	margin: 0 0 4px auto;
	color: var(--faint);
	font-family: var(--mono);
	font-size: var(--t-micro);
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.spine-line__residue {
	font-weight: 700;
	text-align: center;
}

.spine-line__instruction {
	color: var(--muted);
	white-space: nowrap;
}

.focal__reading {
	padding-top: 0.45rem;
}

.focal__reading > div {
	display: grid;
	gap: 3px;
}

.focal__reading strong,
.focal__reading code {
	font-family: var(--mono);
	font-size: 0.86rem;
}

.reading-column-label {
	color: var(--faint);
	font-family: var(--mono);
	font-size: var(--t-micro);
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.derivation-readings {
	display: grid;
	grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
	gap: var(--space-xl);
	margin-top: var(--space-lg);
	padding-top: var(--space-md);
	border-top: 1px solid var(--ink);
}

.derivation-readings p {
	margin: 0;
	min-width: 0;
}

.derivation-readings .microlabel {
	display: block;
	margin-bottom: 6px;
}

.derivation-readings__sequence {
	display: block;
	font-family: var(--mono);
	font-size: 0.78rem;
	line-height: 1.65;
	overflow-wrap: anywhere;
}

.derivation-readings__claim {
	display: block;
	margin-top: 5px;
	color: var(--muted);
	font-size: var(--t-caption);
	line-height: 1.5;
}

.derivation-readings__turn {
	margin: var(--space-sm) 0 0;
	color: var(--faint);
	font-size: var(--t-caption);
	line-height: 1.55;
}
```

Inside the existing `@media (max-width: 1180px)` block, add:

```css
	.spine-line__note {
		white-space: normal;
	}
```

Inside the existing `@media (max-width: 860px)` block, add:

```css
	.derivation-readings {
		grid-template-columns: 1fr;
	}
```

- [ ] **Step 6: Run focused and structural validation**

Run:

```bash
npm run test:unit -- --run src/lib/miu/traceReadings.spec.ts
npm run check
```

Expected: focused tests PASS; Svelte and dead-CSS checks PASS.

- [ ] **Step 7: Commit the worksheet readings**

```bash
git add src/lib/components/miu/MiuSheet.svelte src/app.css
git commit -m "feat: read the worksheet derivation as invariant and program"
```

## Task 4: Correct description-length semantics and label the pq forward reference

**Files:**
- Modify: `src/lib/components/miu/MiuBridge.svelte`
- Modify: `src/lib/components/miu/MiuCharacters.svelte`
- Modify: `src/routes/form-and-meaning/miu/+page.svelte`
- Modify: `src/app.css`

- [ ] **Step 1: Correct the `K_bits` reader-facing definition**

In `MiuBridge.svelte`, replace the current `K_bits` gloss with:

```svelte
<span>
	the least |<span class="mv">p</span>| among derivation programs
	<span class="mv">p</span> printing <span class="mv">s</span>.
</span>
```

Change the specimen-table header from:

```svelte
<th>one minimum-bit program</th>
```

to:

```svelte
<th>one minimum-bit derivation program</th>
```

Do not change `shortestBitProgram`, `literalMiuBitLength`, or the specimen values.

- [ ] **Step 2: Change the third altitude label**

In `src/routes/form-and-meaning/miu/+page.svelte`, replace:

```svelte
<span class="movement__altitude">about all such systems</span>
```

with:

```svelte
<span class="movement__altitude">as a program</span>
```

- [ ] **Step 3: Separate the pq/grokking statement as a forward reference**

In `MiuCharacters.svelte`, end the mathematical lede after the forbidden
indicator formula:

```svelte
<p class="characters__lede">
	The certificate used one fact about the residue: {'{'}1, 2{'}'} is closed under the rule
	action. The full action is stated in one line: R2 multiplies the residue by 2, and R1, R3,
	R4 fix it. The characters of ℤ/3 diagonalize it — R2 pulls
	<span class="mv">χ<sub>k</sub></span> back to <span class="mv">χ<sub>2k</sub></span> — and
	the indicator of the forbidden residue expands as <span class="mv">δ<sub>0</sub></span> =
	(<span class="mv">χ<sub>0</sub></span> + <span class="mv">χ<sub>1</sub></span> +
	<span class="mv">χ<sub>2</sub></span>)/3.
	<a class="forward-reference" href="/form-and-meaning/pq">
		→ forward reference: pq and grokking
	</a>
</p>
```

Add to the character section of `src/app.css`:

```css
.forward-reference {
	display: block;
	margin-top: var(--space-md);
	color: var(--act);
	font-family: var(--mono);
	font-size: var(--t-micro);
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}
```

- [ ] **Step 4: Run the semantic regression suite**

Run:

```bash
npm run test:unit -- --run src/lib/miu/bitComplexity.spec.ts src/lib/miu/coding.spec.ts src/lib/miu/examples.spec.ts
npm run check
```

Expected: existing numerical results PASS unchanged; structural checks PASS.

- [ ] **Step 5: Commit the semantic corrections**

```bash
git add src/lib/components/miu/MiuBridge.svelte src/lib/components/miu/MiuCharacters.svelte src/routes/form-and-meaning/miu/+page.svelte src/app.css
git commit -m "fix: distinguish derivation complexity from the literal baseline"
```

## Task 5: Update durable route and architecture documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/product-architecture.md`

- [ ] **Step 1: Update the README route and worksheet descriptions**

Make these concrete changes in `README.md`:

1. Replace `shipped as a single MIU instrument at the root route` with:

```text
shipped as the first instrument under `/form-and-meaning/miu`; the root route is
the editorial index of the laboratory's four arcs.
```

2. In the Theoremhood bullet, add after the derivation spine description:

```text
Each active trace is annotated in place with its I-count residue and executable
instruction code, so the same derivation is visible at all three readings before
the later movements generalize them.
```

3. After the three-reading bullets, add the route list:

```markdown
Current reader routes:

- `/` — laboratory title and arc index;
- `/form-and-meaning/miu` — built MIU instrument;
- `/form-and-meaning/pq` — empty next-instrument destination.
```

4. Preserve the statement that pq is not built and that no further MIU extension
is scheduled before it.

- [ ] **Step 2: Update product architecture**

In `docs/product-architecture.md`, replace the bullet naming `the single MIU
instrument at the root route /` with:

```markdown
- the editorial laboratory index at `/`, grouped by the four conceptual arcs;
- the built MIU instrument at `/form-and-meaning/miu`;
- the empty pq destination at `/form-and-meaning/pq`, which holds navigation but
  no pq mathematics before that instrument is built;
```

In the MIU surface description, add:

```text
The worksheet trace carries two deterministic annotations from the same formal
state: its I-count residue and the encoded instruction that produced each row.
The active-prefix summaries exclude retained future steps after a jump.
```

Do not change persistence or dialogue ownership; both remain dormant.

- [ ] **Step 3: Check documentation for stale root-route language**

Run:

```bash
rg -n "MIU instrument at the root|single MIU instrument at the root|root route `/`" README.md docs
```

Expected: no stale statement that MIU occupies `/`.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md docs/product-architecture.md
git commit -m "docs: record the arc index and canonical instrument routes"
```

## Task 6: Full automated verification

**Files:** None unless verification exposes a defect.

- [ ] **Step 1: Run the complete unit suite**

```bash
npm run test
```

Expected: all Vitest tests PASS.

- [ ] **Step 2: Run Svelte, TypeScript, and dead-CSS checks**

```bash
npm run check
```

Expected: zero Svelte/TypeScript errors and `Dead CSS check passed`.

- [ ] **Step 3: Build production output**

```bash
npm run build
```

Expected: production build completes successfully.

- [ ] **Step 4: Confirm the worktree is intentional**

```bash
git status --short
git diff --check origin/main...HEAD
```

Expected: no uncommitted tracked files and no whitespace errors. The ignored
`.superpowers/brainstorm` mockups may remain ignored.

## Task 7: Desktop played review

**Files:** None unless played review exposes a defect.

- [ ] **Step 1: Start the built application**

```bash
npm run preview -- --host 127.0.0.1 --port 4175
```

Expected: preview server reports `http://127.0.0.1:4175`.

- [ ] **Step 2: Verify the title/index**

At `http://127.0.0.1:4175/`, confirm:

- the two-sentence laboratory definition appears before the arcs;
- four unnumbered arc regions are visible;
- MIU and pq are the only instrument links;
- MIU is labeled `built`, pq is labeled `next`;
- unbuilt instruments are plain text;
- the page reads as an editorial mathematical document, not a dashboard.

- [ ] **Step 3: Verify MIU routing and persistence**

Open `/form-and-meaning/miu` and confirm:

- the breadcrumb returns to the root and the form-and-meaning anchor;
- the existing target query, shortest/constructed witnesses, rule rail, and
  local-storage draft still work;
- reloading the new route preserves the current trace.

- [ ] **Step 4: Exercise the grown worksheet state**

Build at least four doublings from MI, then apply R3 at a state with multiple
legal sites. Confirm:

- the full long string wraps instead of truncating;
- every row shows the correct residue;
- the R3 row shows opcode `011` plus nonempty site bits;
- the residue and program summaries remain adjacent to the trace;
- the rule rail remains visible and names every inapplicable rule's reason.

- [ ] **Step 5: Exercise jump-back and branching**

Jump to an earlier row. Confirm the retained future rows remain dimmed but the
two summaries stop at the active row. Apply a different legal move and confirm
the abandoned suffix disappears and both summaries update to the new branch.

- [ ] **Step 6: Verify later movements are self-contained**

Scroll to the invariant and description-length movements without using the
worksheet annotations as memory. Confirm:

- the MU proof and complete characterization stand independently;
- the pq/grokking sentence appears only as the labeled forward-reference link;
- `K_bits` explicitly minimizes derivation programs;
- the specimen table says `one minimum-bit derivation program`;
- the third altitude label is `as a program`.

- [ ] **Step 7: Verify the pq boundary**

Open `/form-and-meaning/pq`. Confirm it contains only the approved breadcrumb,
`pq system`, `Next instrument`, and links to the root and MIU. Confirm there is
no pq definition, grokking claim, exercise, or mock result.

- [ ] **Step 8: Record defects before completion**

If any played state fails, write a failing unit test when the defect is logical,
fix it through the red-green cycle, rerun Tasks 6 and 7, and add a focused commit.
Do not declare completion from the fresh title page alone.
