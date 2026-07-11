# MIU Exactness and Bridge Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the four accepted MIU exactness repairs, fold the review into the binding project contract, and leave pq/grokking as the single next instrument.

**Architecture:** Add four focused deterministic modules: theoremhood decides membership and constructs a witness, coding defines an executable prefix code and literal baseline, bit complexity performs weighted search, and characters constructs the dual of Z/3. Keep bounded shortest-step and shortest-bit searches separate from theoremhood. The Svelte page composes those results without re-deriving mathematics, and the binding docs replace the advisory review as source of truth.

**Tech Stack:** TypeScript, Svelte 5, SvelteKit, Vitest, npm, static HTML mockups for the visual approval gate.

---

## Scope and stopping rule

Execute this plan in an isolated git worktree after the current documentation
artifacts have been committed or otherwise preserved. Do not begin execution in
a dirty checkout.

This is the entire MIU completion time-box. Work not named below is out of
scope. In particular, do not:

- train the modular-addition model or build the pq route;
- add an LLM proposer, compressor, dialogue surface, or persistence wiring;
- create a generic cross-instrument framework;
- implement sparse autoencoders, singular learning theory, interactive proofs,
  tropical geometry, or the Minsky–Papert instrument;
- redesign the worksheet beyond the minimum changes required to expose the two
  witness types;
- add another MIU visualization after the character construction is legible.

The branch is complete when Tasks 1–10 pass. Any additional idea becomes a
separate issue or plan. The next planning artifact after this one is a
pq/grokking instrument design and implementation plan.

## Accepted decisions carried from the review

1. MIU theoremhood is decided by the complete characterization, independently
   of bounded shortest-path search.
2. The constructive proof supplies a valid witness; it need not be shortest.
3. `K_steps` is shortest derivation length. `K_bits` is minimum encoded length
   under the executable code specified below.
4. The MIU side constructs the characters of Z/3 before the pq/Fourier bridge
   is called structural.
5. `computed` is a provenance qualifier, not a fourth epistemic register.
   Deterministic transforms inherit the register of their inputs.
6. Derivation length / chain of thought is demoted to a labeled analogy until a
   reduction or controlled experiment earns it.
7. MIU proposer/verifier work is search-versus-checking, not the
   recursively-enumerable-versus-recursive obstruction.
8. Sparse coding / superposition and interactive proofs enter the ledger as
   identified candidates, not implementation work.
9. Singular learning theory remains conditional. The questioned source exists
   as Cullen et al., *A Basin-Selection Perspective on Grokking via Singular
   Learning Theory*, arXiv:2603.01192v3, revised May 7, 2026. Reproducibility at
   this project's scale is still unverified.
10. The advisory review is retired after its accepted decisions and source
    corrections are transferred to binding docs.

## Encoding fixed by this plan

`K_bits` uses one fixed, executable, prefix-free code. Do not invent another
code during implementation.

### Program branch

- The first bit is `0`, selecting a derivation program.
- Every opcode is three bits:
  - `000` = halt;
  - `001` = R1;
  - `010` = R2;
  - `011` = R3;
  - `100` = R4.
- After a rule opcode, enumerate the legal sites for that rule in the order
  returned by `enumerateMiuMoves(current)`.
- If the rule has `m` legal sites, encode the selected site's ordinal in
  `ceil(log2(m))` bits. A unique site uses zero site bits.
- Unused ordinals when `m` is not a power of two are invalid programs.
- The decoder applies the selected move, then reads the next opcode.

Therefore

```text
K_bits(s) = 1 + 3 + min_path sum(3 + ceil(log2(site_count_at_step)))
              mode halt
```

The minimization is over valid MIU derivations from `MI` to `s`. Because edge
costs are nonuniform, `K_bits` is computed with Dijkstra's algorithm, not by
encoding whichever path minimizes `K_steps`.

### Literal branch

- The first bit is `1`, selecting a literal MIU string.
- Encode the positive tail length `n` with Elias gamma code.
- Encode the tail with one bit per symbol: `I = 0`, `U = 1`. The leading `M` is
  implicit.

```text
L_literal(s) = 1 + (2 floor(log2(n)) + 1) + n
```

Only compare `K_bits` with `L_literal`. Never call `K_steps < |s|`
compression.

## File map

### Create

- `src/lib/miu/theoremhood.ts` — complete MIU membership decision and
  constructive witness.
- `src/lib/miu/theoremhood.spec.ts` — decision and construction equivalence
  classes.
- `src/lib/miu/coding.ts` — executable path encoding, decoding metadata, and
  literal baseline.
- `src/lib/miu/coding.spec.ts` — prefix-code and replay tests.
- `src/lib/miu/bitComplexity.ts` — bounded Dijkstra search for `K_bits`.
- `src/lib/miu/bitComplexity.spec.ts` — weighted-search outcomes and bounds.
- `src/lib/miu/characters.ts` — exact Z/3 character table, rule actions, and
  forbidden-residue Fourier identity.
- `src/lib/miu/characters.spec.ts` — exact table and pullback tests.
- `src/lib/components/miu/MiuCharacters.svelte` — learner-facing character
  construction.

### Modify

- `src/lib/miu/complexity.ts` — shortest-step search accepts theorem targets
  only and reports `found` or `exhausted`.
- `src/lib/miu/complexity.spec.ts` — remove theoremhood assertions and retain
  shortest-step branches and bounds.
- `src/lib/miu/witness.spec.ts` — import the renamed shortest-step function.
- `src/lib/miu/examples.ts` — retain specimens, but make their intended
  step/bit comparison explicit.
- `src/lib/miu/examples.spec.ts` — assert both cost-model outcomes.
- `src/lib/components/miu/MiuProduce.svelte` — display decision, constructive
  witness, and shortest-step result separately.
- `src/lib/components/miu/MiuSheet.svelte` — label the active witness as
  constructive or shortest.
- `src/lib/components/miu/MiuBridge.svelte` — show `K_steps`, `K_bits`, literal
  bits, and executable instructions.
- `src/lib/components/miu/MiuInvariant.svelte` — derive pass/fail mathematics
  from deterministic modules and place the character construction.
- `src/routes/+page.svelte` — compose decision, construction, and two bounded
  optimization searches without duplicating their logic.
- `src/app.css` — style only the approved new readouts and replace obsolete
  computed-register comments.
- `README.md`, `agents.md`, `docs/strange-loops-vision.md`,
  `docs/bridge-ledger.md`, `docs/product-architecture.md`, and
  `docs/agent-behavior.md` — fold accepted decisions into binding docs and
  describe the completed contract accurately.

### Delete after transfer

- `docs/research-directions-review.md` — remove after every accepted decision
  has a binding home.
- The README bullet pointing to that advisory review.
- `docs/mockups/miu-exactness.html` and its screenshots after the approved UI
  ships; these are gitignored working artifacts.

---

### Task 1: Fold the review into the binding contract

**Files:**

- Modify: `docs/strange-loops-vision.md`
- Modify: `docs/bridge-ledger.md`
- Modify: `docs/product-architecture.md`
- Modify: `docs/agent-behavior.md`
- Modify: `README.md`
- Modify: `agents.md`
- Delete: `docs/research-directions-review.md`

- [ ] **Step 1: Rewrite every active ledger entry to the adversarial schema**

Each entry must contain these exact fields:

```markdown
- **Exact claim:** one sentence that can be false.
- **Gate class:** shared template, construction, obstruction, or invariant.
- **Shared object:** the object that appears on both sides.
- **Smallest build:** the minimum construction that tests the claim.
- **Falsifier:** the observation that demotes or rejects the claim.
- **Evidence:** primary sources and repo artifact paths.
- **Status:** built, next, identified, deferred, sidebar, or rejected.
```

Apply these dispositions:

```text
MIU derivation program / description length    built; K_bits extension is next in this plan
pq / modular addition / grokking               next; blocked on actual Z/3 characters
Minsky–Papert expressivity wall                identified
language model as compressor                   identified
sparse coding / superposition                  identified
interactive proofs / scalable oversight        identified
singular learning theory                       deferred; source verified, reproduction not verified
tropical geometry / ReLU                       identified, off spine
random-matrix spectra                          sidebar
derivation length / chain of thought           sidebar
MIU search/checking experiment                 identified, narrowed claim
```

Record the following rejected claims, preserving their narrower survivors:

```markdown
### The residue display already constructs characters of Z/3
- **Failed test:** the shipped surface contains residues and rule actions but no
  dual group or character table.
- **Disposition:** rejected as a claim about the current build. The pq bridge
  remains next, conditional on constructing the characters.

### Derivation length and chain of thought share an invariant
- **Failed test:** derivation length is a complexity measure, not a preserved
  quantity.
- **Disposition:** rejected gate class. The connection remains a sidebar until
  a reduction or controlled experiment supplies a structural class.

### MIU generation/checking instantiates r.e. versus recursive figure/ground
- **Failed test:** Th(MIU) is recursive; the complete characterization decides
  membership.
- **Disposition:** rejected for MIU. A narrower search-versus-checking
  experiment remains identified; the computability obstruction requires a
  later system with undecidable word problem.
```

- [ ] **Step 2: Correct the SLT source before citing it in binding docs**

Use the current primary-source metadata:

```markdown
[Cullen et al., *A Basin-Selection Perspective on Grokking via Singular
Learning Theory*](https://arxiv.org/abs/2603.01192), arXiv v3, revised May 7,
2026. The paper derives analytic LLC formulas for shallow quadratic networks
and reports empirical LLC trajectories; reproduction at this project's scale
has not been attempted.
```

- [ ] **Step 3: Collapse computed into provenance**

In `docs/product-architecture.md`, replace the four output classes with the
three binding registers. Preserve this rule verbatim:

```markdown
A deterministic transform inherits the register of its inputs. A transform of
verified formal state remains verified when the transform and claim are
checked. A deterministic analysis of trained weights remains measured because
the weights are empirical artifacts.
```

Update every current-data-flow reference from “verified, computed, and
coaching” to the appropriate three-register language. Do not change dormant
`Module1Draft` phase metadata in this task; it is not a live output contract.

- [ ] **Step 4: Put the time-box and build order into the vision and README**

The binding order must be:

```text
1. MIU exactness pass: theoremhood construction, K_bits, Z/3 characters,
   register/source-of-truth cleanup.
2. pq / modular addition / grokking.
3. No further MIU extension until pq has tested the method on a second site.
```

Demote chain of thought and narrow proposer/verifier everywhere they appear in
the vision, README, architecture, agent behavior, and agent instructions.

- [ ] **Step 5: Retire the advisory review**

Delete `docs/research-directions-review.md` and its README bullet only after a
search confirms that each accepted decision appears in a binding document.

Run:

```bash
rg -n "chain of thought|proposer|verifier|computed|2603.01192|superposition|interactive proofs|MIU exactness" README.md agents.md docs --glob '!docs/superpowers/plans/**'
```

Expected: every hit agrees with the dispositions above; no binding doc uses the
old Cullen title or treats computed as a fourth register.

- [ ] **Step 6: Verify documentation hygiene**

Run:

```bash
git diff --check
rg -n "TBD|TODO|PLACEHOLDER" README.md agents.md docs --glob '!docs/superpowers/plans/**'
```

Expected: `git diff --check` exits 0; the placeholder scan has no new hit in the
edited documents.

- [ ] **Step 7: Commit the binding decision transfer**

```bash
git add README.md agents.md docs
git commit -m "docs: fold research review into binding direction"
```

---

### Task 2: Add the complete theoremhood decision and constructive witness

**Files:**

- Create: `src/lib/miu/theoremhood.ts`
- Create: `src/lib/miu/theoremhood.spec.ts`
- Modify: `src/lib/miu/complexity.ts`
- Modify: `src/lib/miu/complexity.spec.ts`
- Modify: `src/lib/miu/witness.spec.ts`

- [ ] **Step 1: Write the decision and construction tests**

Create `src/lib/miu/theoremhood.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyMiuMove, MIU_INITIAL_STRING, type MiuMove } from './core';
import { constructMiuDerivation, decideMiuTheorem } from './theoremhood';

function replay(path: MiuMove[]): string {
	return path.reduce((value, move) => applyMiuMove(value, move), MIU_INITIAL_STRING);
}

describe('MIU theoremhood', () => {
	it('rejects strings outside the MIU grammar', () => {
		expect(decideMiuTheorem('M')).toMatchObject({ outcome: 'invalid' });
		expect(decideMiuTheorem('MX')).toMatchObject({ outcome: 'invalid' });
	});

	it('decides residue-zero strings as non-theorems', () => {
		expect(decideMiuTheorem('MU')).toEqual({ outcome: 'non-theorem', residue: 0 });
		expect(decideMiuTheorem('MIII')).toEqual({ outcome: 'non-theorem', residue: 0 });
	});

	it('decides both permitted residue classes as theorems', () => {
		expect(decideMiuTheorem('MI')).toEqual({ outcome: 'theorem', residue: 1 });
		expect(decideMiuTheorem('MII')).toEqual({ outcome: 'theorem', residue: 2 });
	});

	it('constructs the direct witnesses for MI and MII', () => {
		expect(constructMiuDerivation('MI')).toEqual([]);
		expect(replay(constructMiuDerivation('MII'))).toBe('MII');
	});

	it('constructs a mixed target when excess triples produce an odd U count', () => {
		const path = constructMiuDerivation('MIIUII');
		expect(replay(path)).toBe('MIIUII');
		expect(path.some((move) => move.ruleId === 'append-u')).toBe(true);
	});

	it('constructs a mixed target when excess triples produce an even U count', () => {
		const path = constructMiuDerivation('MIUUU');
		expect(replay(path)).toBe('MIUUU');
		expect(path.filter((move) => move.ruleId === 'delete-uu')).toHaveLength(1);
	});

	it('refuses to construct invalid strings and non-theorems', () => {
		expect(() => constructMiuDerivation('M')).toThrow('Invalid MIU target');
		expect(() => constructMiuDerivation('MU')).toThrow('not a theorem');
	});
});
```

- [ ] **Step 2: Run the new tests and verify they fail**

Run:

```bash
npm run test:unit -- --run src/lib/miu/theoremhood.spec.ts
```

Expected: FAIL because `./theoremhood` does not exist.

- [ ] **Step 3: Implement the characterization and construction**

Create `src/lib/miu/theoremhood.ts` with this public API and construction:

```ts
import {
	MIU_INITIAL_STRING,
	enumerateMiuMoves,
	isValidMiuString,
	type MiuMove,
	type MiuRuleId
} from './core';
import { countI } from './invariants';

export type MiuTheoremDecision =
	| { outcome: 'invalid'; reason: string }
	| { outcome: 'non-theorem'; residue: 0 }
	| { outcome: 'theorem'; residue: 1 | 2 };

export function decideMiuTheorem(target: string): MiuTheoremDecision {
	if (!isValidMiuString(target)) {
		return {
			outcome: 'invalid',
			reason: 'A MIU string starts with M and has a nonempty tail over {I, U}.'
		};
	}

	const residue = countI(target) % 3;
	return residue === 0
		? { outcome: 'non-theorem', residue: 0 }
		: { outcome: 'theorem', residue: residue as 1 | 2 };
}

export function constructMiuDerivation(target: string): MiuMove[] {
	const decision = decideMiuTheorem(target);
	if (decision.outcome === 'invalid') {
		throw new Error(`Invalid MIU target: ${target}`);
	}
	if (decision.outcome === 'non-theorem') {
		throw new Error(`${target} is not a theorem of MIU`);
	}
	if (target === MIU_INITIAL_STRING) {
		return [];
	}

	const tail = target.slice(1);
	const iCount = countI(target);
	const uCount = Array.from(tail).filter((char) => char === 'U').length;
	const expandedLength = iCount + 3 * uCount;
	let power = 1;
	let doublings = 0;

	while (power < expandedLength || power % 3 !== expandedLength % 3) {
		power *= 2;
		doublings += 1;
	}

	const path: MiuMove[] = [];
	let current = MIU_INITIAL_STRING;
	const apply = (move: MiuMove) => {
		path.push(move);
		current = move.result;
	};

	for (let index = 0; index < doublings; index += 1) {
		apply(selectMove(current, 'double-tail'));
	}

	const excessUCount = (power - expandedLength) / 3;
	const directReplacements = excessUCount % 2 === 0 ? excessUCount : excessUCount - 1;

	for (let index = 0; index < directReplacements; index += 1) {
		apply(selectMove(current, 'replace-iii', 1 + expandedLength + index));
	}

	if (excessUCount % 2 === 1) {
		apply(selectMove(current, 'append-u'));
		apply(selectMove(current, 'replace-iii', 1 + expandedLength + directReplacements));
	}

	const removableUCount = excessUCount % 2 === 0 ? excessUCount : excessUCount + 1;
	for (let index = 0; index < removableUCount / 2; index += 1) {
		apply(selectMove(current, 'delete-uu', 1 + expandedLength));
	}

	let cursor = 1;
	for (const char of tail) {
		if (char === 'I') {
			cursor += 1;
			continue;
		}
		apply(selectMove(current, 'replace-iii', cursor));
		cursor += 1;
	}

	if (current !== target) {
		throw new Error(`Constructed ${current}, expected ${target}`);
	}

	return path;
}

function selectMove(source: string, ruleId: MiuRuleId, start?: number): MiuMove {
	const move = enumerateMiuMoves(source).find(
		(candidate) => candidate.ruleId === ruleId && (start === undefined || candidate.start === start)
	);
	if (!move) {
		throw new Error(`Construction has no ${ruleId} move at ${start ?? 'the unique site'} in ${source}`);
	}
	return move;
}
```

The proof behind this code is the constructive “if” direction: expand each
target `U` to `III`, grow a compatible power-of-two I-run, remove the excess in
triples and U-pairs, then contract the target's triples in place.

- [ ] **Step 4: Run the theoremhood tests**

Run:

```bash
npm run test:unit -- --run src/lib/miu/theoremhood.spec.ts
```

Expected: 7 tests PASS.

- [ ] **Step 5: Restrict shortest-step search to theorem targets**

In `src/lib/miu/complexity.ts`:

- rename `shortestDerivation` to `shortestTheoremDerivation`;
- import `decideMiuTheorem` instead of `countI`;
- change `ShortestDerivationOutcome` to `'found' | 'exhausted'`;
- throw ``Expected theorem target, got ${decision.outcome}: ${target}`` unless the decision is
  `theorem`;
- retain the breadth-first search, `maxDepth`, `maxNodes`, and honest horizon.

Use this precondition block:

```ts
const decision = decideMiuTheorem(target);
if (decision.outcome !== 'theorem') {
	throw new Error(`Expected theorem target, got ${decision.outcome}: ${target}`);
}
```

Update `complexity.spec.ts` and `witness.spec.ts` to use the new name. Replace
the old MU outcome test with:

```ts
it('refuses to optimize a non-theorem', () => {
	expect(() => shortestTheoremDerivation('MU')).toThrow(
		'Expected theorem target, got non-theorem: MU'
	);
});
```

- [ ] **Step 6: Run all deterministic MIU tests**

Run:

```bash
npm run test:unit -- --run src/lib/miu
```

Expected: all MIU test files PASS.

- [ ] **Step 7: Commit theoremhood separation**

```bash
git add src/lib/miu
git commit -m "feat: separate MIU theoremhood from shortest search"
```

---

### Task 3: Construct the characters of Z/3 in deterministic code

**Files:**

- Create: `src/lib/miu/characters.ts`
- Create: `src/lib/miu/characters.spec.ts`

- [ ] **Step 1: Write exact character-table tests**

Create `src/lib/miu/characters.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
	Z3_CHARACTER_TABLE,
	characterExponent,
	deltaZeroFromCharacters,
	pullbackCharacterUnderDoubling,
	residueAfterRule
} from './characters';

describe('characters of Z/3', () => {
	it('constructs the exact character table as powers of omega', () => {
		expect(Z3_CHARACTER_TABLE).toEqual([
			[0, 0, 0],
			[0, 1, 2],
			[0, 2, 1]
		]);
		expect(characterExponent(2, 2)).toBe(1);
	});

	it('pulls doubling back to the swap of nontrivial characters', () => {
		expect(pullbackCharacterUnderDoubling(0)).toBe(0);
		expect(pullbackCharacterUnderDoubling(1)).toBe(2);
		expect(pullbackCharacterUnderDoubling(2)).toBe(1);
	});

	it('keeps R1, R3, and R4 fixed on residues while R2 doubles', () => {
		expect(residueAfterRule('append-u', 2)).toBe(2);
		expect(residueAfterRule('replace-iii', 2)).toBe(2);
		expect(residueAfterRule('delete-uu', 2)).toBe(2);
		expect(residueAfterRule('double-tail', 2)).toBe(1);
	});

	it('reconstructs the forbidden-residue indicator from all three characters', () => {
		expect(([0, 1, 2] as const).map(deltaZeroFromCharacters)).toEqual([1, 0, 0]);
	});
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
npm run test:unit -- --run src/lib/miu/characters.spec.ts
```

Expected: FAIL because `./characters` does not exist.

- [ ] **Step 3: Implement the exact finite-group model**

Create `src/lib/miu/characters.ts`:

```ts
import type { MiuRuleId } from './core';

export type Z3Residue = 0 | 1 | 2;
export type Z3Character = 0 | 1 | 2;
export type OmegaExponent = 0 | 1 | 2;

export const Z3_CHARACTER_TABLE: OmegaExponent[][] = [
	[0, 0, 0],
	[0, 1, 2],
	[0, 2, 1]
];

export function characterExponent(character: Z3Character, residue: Z3Residue): OmegaExponent {
	return mod3(character * residue);
}

export function pullbackCharacterUnderDoubling(character: Z3Character): Z3Character {
	return mod3(2 * character);
}

export function residueAfterRule(ruleId: MiuRuleId, residue: Z3Residue): Z3Residue {
	return ruleId === 'double-tail' ? mod3(2 * residue) : residue;
}

export function deltaZeroFromCharacters(residue: Z3Residue): 0 | 1 {
	const exponents = ([0, 1, 2] as const).map((character) =>
		characterExponent(character, residue)
	);
	if (exponents.every((exponent) => exponent === 0)) {
		return 1;
	}
	const ordered = [...exponents].sort();
	if (ordered[0] === 0 && ordered[1] === 1 && ordered[2] === 2) {
		return 0;
	}
	throw new Error(`Unexpected Z/3 character exponents: ${exponents.join(',')}`);
}

function mod3(value: number): Z3Residue {
	return (((value % 3) + 3) % 3) as Z3Residue;
}
```

The table stores `omega^exponent`, so row `k`, column `n` is `chi_k(n)`.
`deltaZeroFromCharacters` implements the exact identity
`delta_0(n) = (chi_0(n) + chi_1(n) + chi_2(n)) / 3` using
`1 + omega + omega^2 = 0`.

- [ ] **Step 4: Run the character tests**

```bash
npm run test:unit -- --run src/lib/miu/characters.spec.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the character construction**

```bash
git add src/lib/miu/characters.ts src/lib/miu/characters.spec.ts
git commit -m "feat: construct the characters of Z3"
```

---

### Task 4: Define the executable prefix code

**Files:**

- Create: `src/lib/miu/coding.ts`
- Create: `src/lib/miu/coding.spec.ts`

- [ ] **Step 1: Write the coding tests**

Create `src/lib/miu/coding.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { enumerateMiuMoves } from './core';
import { encodeDerivation, literalMiuBitLength } from './coding';
import { shortestTheoremDerivation } from './complexity';

describe('MIU prefix code', () => {
	it('encodes the empty program as mode plus halt', () => {
		expect(encodeDerivation([])).toMatchObject({ bitLength: 4, instructions: [] });
	});

	it('charges no site bits for a unique site', () => {
		const path = shortestTheoremDerivation('MII').path!;
		expect(encodeDerivation(path)).toMatchObject({ bitLength: 7 });
		expect(encodeDerivation(path).instructions[0]).toMatchObject({
			opcode: '010',
			siteOrdinal: 0,
			siteCount: 1,
			siteBits: ''
		});
	});

	it('encodes a site ordinal when a rule has several sites', () => {
		const source = 'MIIII';
		const move = enumerateMiuMoves(source).filter((candidate) => candidate.ruleId === 'replace-iii')[1]!;
		const encoded = encodeDerivation([
			...shortestTheoremDerivation(source).path!,
			move
		]);
		expect(encoded.instructions.at(-1)).toMatchObject({
			opcode: '011',
			siteOrdinal: 1,
			siteCount: 2,
			siteBits: '1'
		});
	});

	it('uses a gamma-coded literal branch', () => {
		expect(literalMiuBitLength('MI')).toBe(3);
		expect(literalMiuBitLength('MII')).toBe(6);
		expect(literalMiuBitLength(`M${'I'.repeat(8)}`)).toBe(16);
	});

	it('makes the repeated I-run shorter as a program than as a literal', () => {
		const target = `M${'I'.repeat(8)}`;
		const path = shortestTheoremDerivation(target).path!;
		expect(encodeDerivation(path).bitLength).toBe(13);
		expect(encodeDerivation(path).bitLength).toBeLessThan(literalMiuBitLength(target));
	});
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
npm run test:unit -- --run src/lib/miu/coding.spec.ts
```

Expected: FAIL because `./coding` does not exist.

- [ ] **Step 3: Implement the fixed code exactly**

Create `src/lib/miu/coding.ts` with these exports:

```ts
import {
	MIU_INITIAL_STRING,
	MIU_RULES,
	applyMiuMove,
	enumerateMiuMoves,
	isValidMiuString,
	type MiuMove,
	type MiuRuleId
} from './core';

const OPCODES: Record<MiuRuleId, string> = {
	'append-u': '001',
	'double-tail': '010',
	'replace-iii': '011',
	'delete-uu': '100'
};

export interface EncodedInstruction {
	ruleId: MiuRuleId;
	opcode: string;
	siteOrdinal: number;
	siteCount: number;
	siteBits: string;
	display: string;
}

export interface EncodedDerivation {
	bitLength: number;
	bitString: string;
	instructions: EncodedInstruction[];
}

export function encodeMove(source: string, move: MiuMove): EncodedInstruction {
	const sites = enumerateMiuMoves(source).filter((candidate) => candidate.ruleId === move.ruleId);
	const siteOrdinal = sites.findIndex((candidate) => candidate.key === move.key);
	if (siteOrdinal < 0) {
		throw new Error(`Move is not legal from ${source}`);
	}
	const width = sites.length <= 1 ? 0 : Math.ceil(Math.log2(sites.length));
	const siteBits = width === 0 ? '' : siteOrdinal.toString(2).padStart(width, '0');
	const ruleNumber = MIU_RULES.indexOf(move.ruleId) + 1;
	return {
		ruleId: move.ruleId,
		opcode: OPCODES[move.ruleId],
		siteOrdinal,
		siteCount: sites.length,
		siteBits,
		display: sites.length === 1 ? `R${ruleNumber}` : `R${ruleNumber}@${siteOrdinal + 1}/${sites.length}`
	};
}

export function encodeDerivation(path: MiuMove[]): EncodedDerivation {
	let current = MIU_INITIAL_STRING;
	const instructions: EncodedInstruction[] = [];
	for (const move of path) {
		const instruction = encodeMove(current, move);
		instructions.push(instruction);
		current = applyMiuMove(current, move);
	}
	const payload = instructions.map((instruction) => instruction.opcode + instruction.siteBits).join('');
	const bitString = `0${payload}000`;
	return { bitLength: bitString.length, bitString, instructions };
}

export function instructionBitLength(source: string, move: MiuMove): number {
	const instruction = encodeMove(source, move);
	return instruction.opcode.length + instruction.siteBits.length;
}

export function literalMiuBitLength(value: string): number {
	if (!isValidMiuString(value)) {
		throw new Error(`Invalid MIU literal: ${value}`);
	}
	const tailLength = value.length - 1;
	const gammaLength = 2 * Math.floor(Math.log2(tailLength)) + 1;
	return 1 + gammaLength + tailLength;
}
```

- [ ] **Step 4: Run the coding tests**

```bash
npm run test:unit -- --run src/lib/miu/coding.spec.ts
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit the executable code**

```bash
git add src/lib/miu/coding.ts src/lib/miu/coding.spec.ts
git commit -m "feat: define executable MIU prefix code"
```

---

### Task 5: Compute minimum bit length with bounded Dijkstra search

**Files:**

- Create: `src/lib/miu/bitComplexity.ts`
- Create: `src/lib/miu/bitComplexity.spec.ts`

- [ ] **Step 1: Write weighted-search tests**

Create `src/lib/miu/bitComplexity.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { encodeDerivation } from './coding';
import { shortestBitProgram } from './bitComplexity';

describe('K_bits', () => {
	it('returns mode plus halt for MI', () => {
		expect(shortestBitProgram('MI')).toMatchObject({
			outcome: 'found',
			bitLength: 4,
			path: []
		});
	});

	it('returns an executable minimum-bit path', () => {
		const result = shortestBitProgram('MUI');
		expect(result.outcome).toBe('found');
		expect(result.path).not.toBeNull();
		expect(encodeDerivation(result.path!).bitLength).toBe(result.bitLength);
	});

	it('reports node-budget exhaustion without changing theoremhood', () => {
		expect(shortestBitProgram('MUI', { maxNodes: 1 })).toMatchObject({
			outcome: 'exhausted',
			bitLength: null,
			path: null,
			maxNodes: 1
		});
	});

	it('clamps the node budget to the supported boundaries', () => {
		expect(shortestBitProgram('MI', { maxNodes: 0 }).maxNodes).toBe(1);
		expect(shortestBitProgram('MI', { maxNodes: 9_000_000 }).maxNodes).toBe(5_000_000);
	});

	it('refuses to optimize a non-theorem', () => {
		expect(() => shortestBitProgram('MU')).toThrow(
			'Expected theorem target, got non-theorem: MU'
		);
	});
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
npm run test:unit -- --run src/lib/miu/bitComplexity.spec.ts
```

Expected: FAIL because `./bitComplexity` does not exist.

- [ ] **Step 3: Implement the bounded weighted search**

Create `src/lib/miu/bitComplexity.ts` with this contract:

```ts
import { MIU_INITIAL_STRING, enumerateMiuMoves, type MiuMove } from './core';
import { instructionBitLength } from './coding';
import { decideMiuTheorem } from './theoremhood';

export interface BitProgramOptions { maxNodes?: number }
export type BitProgramResult =
	| { outcome: 'found'; target: string; bitLength: number; path: MiuMove[]; maxNodes: number }
	| { outcome: 'exhausted'; target: string; bitLength: null; path: null; maxNodes: number };

interface QueueItem { value: string; cost: number }
interface Link { from: string; move: MiuMove }

export function shortestBitProgram(
	target: string,
	options: BitProgramOptions = {}
): BitProgramResult {
	const decision = decideMiuTheorem(target);
	if (decision.outcome !== 'theorem') {
		throw new Error(`Expected theorem target, got ${decision.outcome}: ${target}`);
	}
	const requestedMaxNodes = options.maxNodes ?? 200_000;
	const finiteMaxNodes = Number.isFinite(requestedMaxNodes) ? Math.trunc(requestedMaxNodes) : 1;
	const maxNodes = Math.min(5_000_000, Math.max(1, finiteMaxNodes));
	if (target === MIU_INITIAL_STRING) {
		return { outcome: 'found', target, bitLength: 4, path: [], maxNodes };
	}

	const queue = new MinHeap();
	const best = new Map<string, number>([[MIU_INITIAL_STRING, 0]]);
	const links = new Map<string, Link>();
	queue.push({ value: MIU_INITIAL_STRING, cost: 0 });
	let expanded = 0;

	while (queue.size > 0 && expanded < maxNodes) {
		const current = queue.pop()!;
		if (current.cost !== best.get(current.value)) continue;
		if (current.value === target) {
			const path = reconstruct(links, target);
			return { outcome: 'found', target, bitLength: 1 + current.cost + 3, path, maxNodes };
		}
		expanded += 1;

		for (const move of enumerateMiuMoves(current.value)) {
			const cost = current.cost + instructionBitLength(current.value, move);
			if (cost >= (best.get(move.result) ?? Number.POSITIVE_INFINITY)) continue;
			best.set(move.result, cost);
			links.set(move.result, { from: current.value, move });
			queue.push({ value: move.result, cost });
		}
	}

	return { outcome: 'exhausted', target, bitLength: null, path: null, maxNodes };
}
```

Add these private helpers in the same file; do not add a dependency:

```ts
function reconstruct(links: Map<string, Link>, target: string): MiuMove[] {
	const path: MiuMove[] = [];
	let cursor = target;
	while (cursor !== MIU_INITIAL_STRING) {
		const link = links.get(cursor);
		if (!link) throw new Error(`Broken bit-program chain at ${cursor}`);
		path.push(link.move);
		cursor = link.from;
	}
	return path.reverse();
}

class MinHeap {
	private items: QueueItem[] = [];

	get size(): number {
		return this.items.length;
	}

	push(item: QueueItem): void {
		this.items.push(item);
		let index = this.items.length - 1;
		while (index > 0) {
			const parent = Math.floor((index - 1) / 2);
			if (this.items[parent]!.cost <= item.cost) break;
			this.items[index] = this.items[parent]!;
			index = parent;
		}
		this.items[index] = item;
	}

	pop(): QueueItem | undefined {
		if (this.items.length === 0) return undefined;
		const root = this.items[0]!;
		const last = this.items.pop()!;
		if (this.items.length === 0) return root;

		let index = 0;
		while (true) {
			const left = 2 * index + 1;
			const right = left + 1;
			if (left >= this.items.length) break;
			const cheaper =
				right < this.items.length && this.items[right]!.cost < this.items[left]!.cost
					? right
					: left;
			if (this.items[cheaper]!.cost >= last.cost) break;
			this.items[index] = this.items[cheaper]!;
			index = cheaper;
		}
		this.items[index] = last;
		return root;
	}
}
```

Add one direct heap test only if the queue cannot be validated through the four
public search branches above; do not export the heap solely for testing.

- [ ] **Step 4: Run weighted-search and coding tests**

```bash
npm run test:unit -- --run src/lib/miu/bitComplexity.spec.ts src/lib/miu/coding.spec.ts
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit K_bits search**

```bash
git add src/lib/miu/bitComplexity.ts src/lib/miu/bitComplexity.spec.ts
git commit -m "feat: compute minimum MIU program bits"
```

---

### Task 6: Pass the learner-facing visual gate before UI code

**Files:**

- Create temporarily: `docs/mockups/miu-exactness.html`
- Create temporarily: screenshot files under `docs/mockups/`
- Do not commit these files.

- [ ] **Step 1: Mock the theorem query in a grown theorem state**

Show one target for which membership is decided but the bounded shortest search
is exhausted. The readout must contain three separate lines:

```text
THEOREM       MIIUII in Th(MIU) — #I(MIIUII) = 1 modulo 3
WITNESS       constructed derivation, 11 moves           [show construction]
MINIMUM       K_steps(MIIUII) not determined within 1 string
```

The theorem stamp must remain a solid verified result. The search horizon must
not replace it with an ellipsis verdict.

- [ ] **Step 2: Mock the description table with common units**

Use these columns:

```text
string | literal bits | K_steps | K_bits | one minimum-bit program | reading
```

At least one program must include a site-qualified instruction such as
`R3@2/4`. Do not label a `K_steps`/symbol comparison as compression.

- [ ] **Step 3: Mock the character construction**

Show all three objects in one formal block:

```text
character table          chi_k(n) = omega^(kn)
rule pullbacks           R2*: chi_1 ↔ chi_2; R1*, R3*, R4* fixed
forbidden indicator      delta_0 = (chi_0 + chi_1 + chi_2) / 3
```

The character table must be readable without color. No learner action is added
unless it changes a mathematical quantity used elsewhere.

- [ ] **Step 4: Render played states and obtain approval**

Run the mockup locally, inspect it at desktop width and below 860px, and present
the screenshots for approval. Do not begin Tasks 7–9 until the theorem-query,
table, and character block are approved on sight.

Expected approval criteria:

- the theorem decision survives an exhausted optimizer;
- construction and shortest witness cannot be confused;
- every program is executable from the displayed notation;
- the Z/3 character object, not a decorative wheel, is visually primary;
- long target strings wrap without changing the rules rail behavior.

---

### Task 7: Separate decision, construction, and shortest witness in the UI

**Files:**

- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/components/miu/MiuProduce.svelte`
- Modify: `src/lib/components/miu/MiuSheet.svelte`
- Modify: `src/app.css`

- [ ] **Step 1: Compose the three results on the page**

Replace the single `theoremQuery` derived value with:

```ts
const theoremDecision = $derived(
	validProduceTarget ? decideMiuTheorem(trimmedProduceTarget) : decideMiuTheorem('')
);
const constructedPath = $derived(
	theoremDecision.outcome === 'theorem' ? constructMiuDerivation(trimmedProduceTarget) : null
);
const shortestStepResult = $derived(
	theoremDecision.outcome === 'theorem'
		? shortestTheoremDerivation(trimmedProduceTarget, {
				maxDepth: MIU_QUERY_BOUNDS.maxDepth,
				maxNodes: queryMaxNodes
			})
		: null
);
```

Replace `witnessTarget`/`witnessPath` state with:

```ts
type WitnessKind = 'constructed' | 'shortest';
let witnessKind = $state<WitnessKind | null>(null);
const witnessPath = $derived(
	witnessKind === 'constructed'
		? constructedPath
		: witnessKind === 'shortest' && shortestStepResult?.outcome === 'found'
			? shortestStepResult.path
			: null
);

function toggleWitness(kind: WitnessKind) {
	witnessKind = witnessKind === kind ? null : kind;
}
```

Changing the target or resetting the session must set `witnessKind = null`.
Pass `witnessTarget={witnessKind ? trimmedProduceTarget : null}` and
`{witnessKind}` to `MiuSheet`; pass `onShowWitness={toggleWitness}` to
`MiuProduce`. Delete `toggleShortestWitness` and the old witness-state branches.

- [ ] **Step 2: Replace MiuProduce's merged verdict props**

Use this prop contract:

```ts
{
	target: string;
	decision: MiuTheoremDecision;
	constructedLength: number | null;
	shortest: ShortestDerivation | null;
	queryMaxNodes: number;
	witnessKind: 'constructed' | 'shortest' | null;
	onUpdateTarget: (target: string) => void;
	onUpdateMaxNodes: (maxNodes: number) => void;
	onShowWitness: (kind: 'constructed' | 'shortest') => void;
}
```

Render the branches with this formal copy:

```text
invalid:
  {trimmed} is not a MIU string.
  The tail after M must be nonempty and contain only I and U.

non-theorem:
  {trimmed} not in Th(MIU).
  I({trimmed}) = {targetICount} = 0 (mod 3); the invariant excludes it.

theorem, shortest found:
  {trimmed} in Th(MIU).
  constructed witness: {constructedLength} moves [show construction]
  K_steps({trimmed}) = {shortest.length} [show shortest derivation]

theorem, shortest exhausted:
  {trimmed} in Th(MIU).
  constructed witness: {constructedLength} moves [show construction]
  K_steps({trimmed}) not determined within {shortest.maxNodes} strings; theoremhood follows from the
  characterization. [increase bound]
```

Use mathematical symbols in the rendered component as the existing surface
does; the text form above fixes meaning, not typography.

- [ ] **Step 3: Label the active witness in MiuSheet**

Add `witnessKind` to `MiuSheet` and replace “shortest derivation for” with:

```svelte
{witnessKind === 'shortest' ? 'shortest derivation' : 'constructed derivation'}
for {ellipsizeMiddle(witnessTarget ?? trimmedTarget)}
```

The existing `nextWitnessStep` mechanics remain unchanged.

- [ ] **Step 4: Run checks and targeted tests**

```bash
npm run check
npm run test:unit -- --run src/lib/miu/theoremhood.spec.ts src/lib/miu/complexity.spec.ts src/lib/miu/witness.spec.ts
```

Expected: Svelte check, dead CSS, and all targeted tests PASS.

- [ ] **Step 5: Commit theorem query separation**

```bash
git add src/routes/+page.svelte src/lib/components/miu/MiuProduce.svelte src/lib/components/miu/MiuSheet.svelte src/app.css
git commit -m "feat: separate MIU decision and witness searches"
```

---

### Task 8: Replace the description table with K_steps and K_bits

**Files:**

- Modify: `src/lib/miu/examples.ts`
- Modify: `src/lib/miu/examples.spec.ts`
- Modify: `src/lib/components/miu/MiuBridge.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `src/app.css`

- [ ] **Step 1: Extend specimen expectations to both cost models**

For every `DESCRIPTION_LENGTH_EXAMPLES` row, compute:

```ts
const stepResult = shortestTheoremDerivation(value, MIU_QUERY_BOUNDS);
const bitResult = shortestBitProgram(value, { maxNodes: MIU_QUERY_BOUNDS.maxNodes });
const literalBits = literalMiuBitLength(value);
```

Update `examples.spec.ts` so one specimen satisfies
`bitResult.bitLength < literalBits` and one satisfies
`bitResult.bitLength >= literalBits`. Do not assert compression from
`stepResult.length` versus `value.length`.

- [ ] **Step 2: Run the example tests and verify the old expectations fail**

```bash
npm run test:unit -- --run src/lib/miu/examples.spec.ts
```

Expected: FAIL until the example contract and component are updated.

- [ ] **Step 3: Replace the bridge definition with declared units**

Render this displayed definition in `MiuBridge.svelte`:

```text
program       0 · encoded ⟨rule, site⟩ instructions · 000
K_steps(s)    minimum number of rewrite moves MI => s
K_bits(s)     minimum program length under the code above
L_literal(s)  1 + |gamma(|tail(s)|)| + |tail(s)| bits
```

The table columns are exactly:

```text
string | L_literal | K_steps | K_bits | one minimum-bit program | reading
```

Use `encodeDerivation(bitResult.path).instructions[].display` for the program
column. Do not reconstruct rule or site labels in the component.

- [ ] **Step 4: Replace the claim above the table**

Use formal display, not flowing proof prose:

```text
Claim.
For s in Th(MIU):
  K_steps(s) is computable by breadth-first enumeration.
  K_bits(s) is computable by cost-ordered enumeration under the fixed code.
Both quantities are relative to the four-rule MIU machine and the stated code.
```

Keep the universal-machine/Chaitin coda as an exit bridge. Do not move its full
content into the lede.

- [ ] **Step 5: Run the example tests and frontend checks**

```bash
npm run test:unit -- --run src/lib/miu/examples.spec.ts src/lib/miu/coding.spec.ts src/lib/miu/bitComplexity.spec.ts
npm run check
```

Expected: all targeted tests and Svelte/dead-CSS checks PASS.

- [ ] **Step 6: Commit the two cost models**

```bash
git add src/lib/miu/examples.ts src/lib/miu/examples.spec.ts src/lib/components/miu/MiuBridge.svelte src/routes/+page.svelte src/app.css
git commit -m "feat: expose MIU step and bit complexity"
```

---

### Task 9: Put the character construction behind the invariant

**Files:**

- Create: `src/lib/components/miu/MiuCharacters.svelte`
- Modify: `src/lib/components/miu/MiuInvariant.svelte`
- Modify: `src/lib/miu/invariants.spec.ts`
- Modify: `src/app.css`

- [ ] **Step 1: Make candidate verdicts use the deterministic invariant layer**

Replace hard-coded `holds` values with analyses created by
`analyzeInvariantCandidate(form, 'MI')`. Keep the authored per-case `why` text,
but derive the stamp from:

```ts
const holds = analysis.kind === 'supported' && analysis.currentSatisfied && analysis.preserved;
```

Also compute `const certificate = builtInInvariantAnalysis('MI')` and render
the base/result stamp plus every R1–R4 preservation stamp from
`certificate.ruleResults`. Keep the formal, per-rule explanatory sentences
authored in the component; do not derive reader copy from generic engine
messages.

Add an invariants test that runs the four displayed candidate forms and expects
exactly `[false, false, false, true]`. This covers the learner-visible verdicts
without snapshotting prose.

- [ ] **Step 2: Implement the formal character block**

`MiuCharacters.svelte` must import only deterministic values/functions from
`characters.ts` and render:

```text
Characters of Z/3
chi_k(n) = omega^(kn), omega^3 = 1, 1 + omega + omega^2 = 0

        n=0   n=1   n=2
chi_0    1     1     1
chi_1    1     omega omega^2
chi_2    1     omega^2 omega

R2*: chi_k -> chi_2k, hence chi_1 ↔ chi_2.
R1*, R3*, R4* fix every character.

delta_0(n) = (chi_0(n) + chi_1(n) + chi_2(n)) / 3.
The forbidden residue is therefore visible in the same Fourier basis used by
the modular-addition experiment.
```

Place this after the structural-induction certificate and before “Why modulus
3.” It is the bridge prerequisite, not a replacement for the proof that MU is
not a theorem.

- [ ] **Step 3: Style the mathematical object, not a card**

Use the existing document grammar:

- table rules, no decorative container shadow;
- solid graphite for verified equalities;
- monospaced symbols and tabular alignment;
- no new accent color except focus/action states;
- horizontal overflow only on the table wrapper below narrow widths.

Update the CSS header comment to the three registers:

```css
/* Epistemic register is carried by form:
 * verified -> solid rule/frame and proof stamps
 * measured -> dashed rule plus run configuration
 * coaching -> dotted rule and margin-note typography
 * Deterministic transforms inherit the register of their inputs.
 */
```

Remove comments that call the bridge or horizon “computed/coaching.” A named
unbuilt construction is reference prose, not coaching.

- [ ] **Step 4: Run deterministic and frontend checks**

```bash
npm run test:unit -- --run src/lib/miu/characters.spec.ts src/lib/miu/invariants.spec.ts
npm run check
```

Expected: all targeted tests PASS; no dead CSS.

- [ ] **Step 5: Run the approved played-state review**

Start the production preview and exercise:

1. invalid target;
2. residue-zero non-theorem;
3. theorem with shortest witness found;
4. the approved `MIIUII` exhausted state in the temporary component harness
   with `maxNodes = 1`, so membership remains decided while the optimizer is
   exhausted;
5. constructed witness advanced several steps;
6. shortest witness advanced several steps;
7. a long derivation that wraps;
8. description table at desktop and below 860px;
9. character table in grayscale and below 640px.

Do not approve the pass from the fresh page alone.

- [ ] **Step 6: Commit the character surface**

```bash
git add src/lib/components/miu/MiuCharacters.svelte src/lib/components/miu/MiuInvariant.svelte src/lib/miu/invariants.spec.ts src/app.css
git commit -m "feat: expose the Z3 character construction"
```

---

### Task 10: Close the time-box and verify the full repository

**Files:**

- Modify: `README.md`
- Modify: `agents.md`
- Modify: `docs/strange-loops-vision.md`
- Modify: `docs/bridge-ledger.md`
- Modify: `docs/product-architecture.md`
- Modify: `docs/agent-behavior.md`
- Delete temporary: `docs/mockups/miu-exactness.html` and screenshots

- [ ] **Step 1: Update binding docs from planned to built**

The final state must say:

```text
MIU theoremhood: decided by the complete I-count characterization
constructive witness: available for every theorem
K_steps: bounded BFS surface with honest exhaustion
K_bits: bounded Dijkstra surface under the stated executable code
Z/3 characters: built and used as the prerequisite object for pq/grokking
registers: verified / measured / coaching; computed is provenance
next instrument: pq / modular addition / grokking
```

Do not mark pq/grokking or any new candidate built.

- [ ] **Step 2: Delete working artifacts**

Remove the mockup and screenshots after comparing the shipped played states
against them. Confirm no scratch output appears in `git status`.

- [ ] **Step 3: Run the full static and unit validation**

```bash
npm run check
npm run test
npm run build
```

Expected:

- Svelte check: 0 errors and 0 warnings;
- dead CSS: all classes referenced;
- Vitest: all test files and tests PASS;
- Vite production build exits 0.

- [ ] **Step 4: Run the full smoke suite against production preview**

Terminal 1:

```bash
npm run preview -- --host 127.0.0.1 --port 4175
```

Terminal 2:

```bash
npm run smoke:all -- http://127.0.0.1:4175
```

Expected: persistence, dialogue, and aggregate smoke checks PASS. These dormant
layers are not rewired; the smoke proves the exactness pass did not break them.

- [ ] **Step 5: Run final drift and hygiene searches**

```bash
rg -n "residue wheel.*characters|shared invariant.*chain|recursively enumerable.*MIU|four distinct output classes|computed/coaching" README.md agents.md docs src --glob '!docs/superpowers/plans/**' --glob '!docs/mockups/**'
git diff --check
git status --short
```

Expected:

- no stale claim survives in active docs or live code comments;
- `git diff --check` exits 0;
- only intended source, test, and binding-doc changes remain.

- [ ] **Step 6: Commit the completed exactness pass**

```bash
git add README.md agents.md docs src
git commit -m "docs: close MIU exactness pass"
```

- [ ] **Step 7: Stop**

Do not begin pq model training or another MIU extension on this branch. Create a
new pq/grokking design artifact from the now-built Z/3 character object, then a
separate implementation plan.

---

## Plan self-review checklist

Before execution begins, confirm:

- Every accepted review decision maps to Task 1 or Tasks 2–10.
- The Cullen source uses the current title and remains explicitly unreplicated.
- The theoremhood constructor covers invalid, non-theorem, direct, odd-excess,
  and even-excess branches.
- `K_steps` and `K_bits` have distinct algorithms and types.
- Programs include site ordinals and halt; literals use gamma-coded length.
- The character table, R2 pullback, and forbidden indicator are deterministic
  and tested.
- UI work cannot start before mockup approval.
- No task implements pq, an LLM feature, or a generic instrument framework.
- The advisory review is not left as a second source of truth.
- The final task returns the project to one clear next step: pq/grokking.
