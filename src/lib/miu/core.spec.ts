import { describe, expect, it } from 'vitest';

import {
	analyzeMiuProposal,
	analyzeMiuRuleAvailability,
	applyMiuMove,
	applyMoveToTrace,
	createDerivationTrace,
	currentDeadBranchStart,
	doublingsToReach,
	enumerateMiuMoves,
	enumerateMiuPredecessors,
	isDeadBranch,
	isValidMiuString,
	normalizeMiuTailInput,
	jumpToTraceStep,
	normalizeTrace,
	restartTrace,
	stepBackTrace,
	traceRevisitIndices,
	type DerivationTrace
} from './core';

function deriveTrace(values: string[]): DerivationTrace {
	let trace = createDerivationTrace();

	for (const value of values) {
		const move = enumerateMiuMoves(trace.steps[trace.currentIndex]!.value).find(
			(candidate) => candidate.result === value
		);

		if (!move) {
			throw new Error(`No legal move to ${value} in test setup`);
		}

		trace = applyMoveToTrace(trace, move);
	}

	return trace;
}

// Uses all four rules: R2, R2, R1, R3, R4 — and cycles back to the axiom.
const ALL_RULES = ['MII', 'MIIII', 'MIIIIU', 'MIUU', 'MI'];

describe('currentDeadBranchStart', () => {
	it('returns null when the current string is not trapped', () => {
		expect(currentDeadBranchStart(deriveTrace(['MII']))).toBeNull();
	});

	it('returns the first step of the contiguous trapped run', () => {
		expect(currentDeadBranchStart(deriveTrace(['MIU', 'MIUIU', 'MIUIUIUIU']))).toBe(1);
	});

	it('returns null after jumping back out of the trap', () => {
		const trace = deriveTrace(['MIU', 'MIUIU']);

		expect(currentDeadBranchStart({ ...trace, currentIndex: 0 })).toBeNull();
	});
});

describe('traceRevisitIndices', () => {
	it('maps every step to null while all strings are distinct', () => {
		expect(traceRevisitIndices(deriveTrace(['MII', 'MIIII']))).toEqual([null, null, null]);
	});

	it('maps a revisited string to the index of its first appearance', () => {
		expect(traceRevisitIndices(deriveTrace(ALL_RULES))).toEqual([
			null,
			null,
			null,
			null,
			null,
			0
		]);
	});

	it('maps a third occurrence to the first appearance, not the second', () => {
		const twoCycles = deriveTrace([...ALL_RULES, ...ALL_RULES]);

		expect(traceRevisitIndices(twoCycles)[10]).toBe(0);
	});
});

describe('isDeadBranch', () => {
	it('flags the alternating trap entered by R1 from MI', () => {
		expect(isDeadBranch('MIU')).toBe(true);
		expect(isDeadBranch('MIUIU')).toBe(true);
	});

	it('flags non-alternating only-R2 states like MIIU', () => {
		expect(isDeadBranch('MIIU')).toBe(true);
	});

	it('does not flag strings ending in I (R1 is open)', () => {
		expect(isDeadBranch('MI')).toBe(false);
	});

	it('does not flag strings containing III (R3 is open)', () => {
		expect(isDeadBranch('MIIIU')).toBe(false);
	});

	it('does not flag strings containing UU (R4 is open)', () => {
		expect(isDeadBranch('MIUUIU')).toBe(false);
	});

	it('does not flag a tail starting with U — doubling reopens R4 at the seam', () => {
		expect(isDeadBranch('MUIU')).toBe(false);
	});

	it('is closed under doubling: every flagged state doubles to a flagged state', () => {
		for (const value of ['MIU', 'MIIU', 'MIUIU', 'MIIUIIU']) {
			expect(isDeadBranch(value)).toBe(true);

			const doubled = enumerateMiuMoves(value).find((move) => move.ruleId === 'double-tail')!;

			expect(isDeadBranch(doubled.result)).toBe(true);
			expect(enumerateMiuMoves(value)).toHaveLength(1);
		}
	});
});

describe('doublingsToReach', () => {
	it('returns 0 when the target is the current string', () => {
		expect(doublingsToReach('MIUIUIUIU', 'MIUIUIUIU')).toBe(0);
	});

	it('counts the doublings when the target is the tail repeated 2^k times', () => {
		expect(doublingsToReach('MIU', 'MIUIU')).toBe(1);
		expect(doublingsToReach('MIU', 'MIUIUIUIU')).toBe(2);
	});

	it('returns null when the target length is not the tail length times 2^k', () => {
		expect(doublingsToReach('MIU', 'MIUIUIU')).toBeNull();
	});

	it('returns null when the length matches but the content is not the doubled tail', () => {
		expect(doublingsToReach('MIU', 'MIUUI')).toBeNull();
		expect(doublingsToReach('MIU', 'MUI')).toBeNull();
	});

	it('returns null rather than throwing on a malformed target', () => {
		expect(doublingsToReach('MIU', 'M')).toBeNull();
		expect(doublingsToReach('MIU', '')).toBeNull();
	});
});

describe('enumerateMiuPredecessors', () => {
	it('lists the exact inverse image of MIU under the four rules', () => {
		// R1⁻¹ strips the trailing U (MIU ends in IU); R3⁻¹ expands the U at
		// position 1 back to III; R4⁻¹ inserts UU at each tail position, where
		// the two rightmost insertions coincide as MIUUU. R2⁻¹ fails: the tail
		// IU is not a doubled word.
		expect(new Set(enumerateMiuPredecessors('MIU'))).toEqual(
			new Set(['MI', 'MIIII', 'MUUIU', 'MIUUU'])
		);
	});

	it('inverts doubling exactly when the tail is a doubled word', () => {
		expect(enumerateMiuPredecessors('MIIII')).toContain('MII');
		expect(enumerateMiuPredecessors('MIUIU')).toContain('MIU');
		// Tail IIIU has even length but II ≠ IU, so no R2 predecessor exists.
		expect(
			enumerateMiuPredecessors('MIIIU').filter((p) => 'M' + p.slice(1) + p.slice(1) === 'MIIIU')
		).toEqual([]);
	});

	it('is sound and complete against the forward rules on the depth-5 universe', () => {
		// Enumerate every string within five moves of MI, then check both
		// directions of the inverse-image claim:
		//   soundness — each listed predecessor has a forward move to t;
		//   completeness — each forward move s → t lists s among t's predecessors.
		const universe = new Set<string>(['MI']);
		let frontier = ['MI'];
		for (let depth = 0; depth < 5; depth += 1) {
			const next: string[] = [];
			for (const value of frontier) {
				for (const move of enumerateMiuMoves(value)) {
					if (universe.has(move.result)) continue;
					universe.add(move.result);
					next.push(move.result);
				}
			}
			frontier = next;
		}

		for (const t of universe) {
			for (const p of enumerateMiuPredecessors(t)) {
				expect(enumerateMiuMoves(p).some((move) => move.result === t)).toBe(true);
			}
		}

		for (const s of universe) {
			for (const move of enumerateMiuMoves(s)) {
				expect(enumerateMiuPredecessors(move.result)).toContain(s);
			}
		}
	});

	it('throws on strings outside the MIU state space', () => {
		expect(() => enumerateMiuPredecessors('M')).toThrow();
		expect(() => enumerateMiuPredecessors('IX')).toThrow();
	});
});

describe('MIU engine', () => {
	it('normalizes target tails to the MIU alphabet only', () => {
		expect(normalizeMiuTailInput('iuuxM123')).toBe('IUU');
		expect(normalizeMiuTailInput('  I-u_i  ')).toBe('IUI');
		expect(normalizeMiuTailInput('mx')).toBe('');
	});

	it('starts from MI with an initial trace step', () => {
		const trace = createDerivationTrace();

		expect(trace.steps).toEqual([{ value: 'MI', via: null }]);
		expect(trace.currentIndex).toBe(0);
	});

	it('enumerates append-u when the string ends with I', () => {
		const move = enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u');

		expect(move?.result).toBe('MIU');
	});

	it('enumerates double-tail from the M-prefix form', () => {
		const move = enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail');

		expect(move?.result).toBe('MIUIU');
	});

	it('enumerates all replace-iii positions including overlaps', () => {
		const moves = enumerateMiuMoves('MIIII').filter((candidate) => candidate.ruleId === 'replace-iii');

		expect(moves.map((move) => move.start)).toEqual([1, 2]);
		expect(moves.map((move) => move.result)).toEqual(['MUI', 'MIU']);
	});

	it('enumerates all delete-uu positions including overlaps', () => {
		const moves = enumerateMiuMoves('MUUU').filter((candidate) => candidate.ruleId === 'delete-uu');

		expect(moves.map((move) => move.start)).toEqual([1, 2]);
		expect(moves.map((move) => move.result)).toEqual(['MU', 'MU']);
	});

	it('rejects illegal moves against a state', () => {
		const illegalMove = {
			key: 'replace-iii:1:4:MU',
			ruleId: 'replace-iii' as const,
			ruleLabel: 'Rule 3',
			source: 'MI',
			result: 'MU',
			start: 1,
			end: 4,
			detail: 'Replace any occurrence of III with U.'
		};

		expect(() => applyMiuMove('MI', illegalMove)).toThrow(/Illegal MIU move/);
	});

	it('rejects malformed strings before evaluation', () => {
		expect(() => enumerateMiuMoves('IU')).toThrow(/Invalid MIU string/);
	});

	it('requires a nonempty I/U tail after the initial M', () => {
		expect(isValidMiuString('M')).toBe(false);
		expect(() => enumerateMiuMoves('M')).toThrow(/Invalid MIU string/);
	});

	it('explains when a proposal matches a legal rule', () => {
		const analysis = analyzeMiuProposal('MI', 'MIU');

		expect(analysis.syntaxValid).toBe(true);
		expect(analysis.exactMatches).toHaveLength(1);
		expect(analysis.summary).toContain('Legal next step');
		expect(analysis.ruleChecks.find((check) => check.ruleId === 'append-u')?.status).toBe('matches');
	});

	it('explains why a tempting proposal is still illegal', () => {
		const analysis = analyzeMiuProposal('MI', 'MU');

		expect(analysis.syntaxValid).toBe(true);
		expect(analysis.exactMatches).toHaveLength(0);
		expect(analysis.summary).toContain('No legal MIU rule produces MU from MI');
		expect(analysis.ruleChecks.find((check) => check.ruleId === 'replace-iii')?.status).toBe(
			'unavailable'
		);
		expect(analysis.ruleChecks.find((check) => check.ruleId === 'double-tail')?.status).toBe(
			'different-result'
		);
	});

	it('rejects syntactically invalid proposals before rule analysis', () => {
		const analysis = analyzeMiuProposal('MI', 'IUU');

		expect(analysis.syntaxValid).toBe(false);
		expect(analysis.ruleChecks).toEqual([]);
		expect(analysis.summary).toContain('Not a valid MIU string');
	});
});

describe('MIU rule availability', () => {
	it('reports a mixed mid-session state with exact counts, sites, and reasons', () => {
		const rows = analyzeMiuRuleAvailability('MUUIIUUIIIIIU');
		const byRule = new Map(rows.map((row) => [row.ruleId, row]));

		const r1 = byRule.get('append-u')!;
		expect(r1.status).toBe('unavailable');
		expect(r1.reason).toBe("the string doesn't end in I");
		expect(r1.moves).toEqual([]);

		const r2 = byRule.get('double-tail')!;
		expect(r2.status).toBe('available');
		expect(r2.reason).toBeNull();
		expect(r2.moves.map((move) => move.result)).toEqual(['MUUIIUUIIIIIUUUIIUUIIIIIU']);

		const r3 = byRule.get('replace-iii')!;
		expect(r3.status).toBe('available');
		expect(r3.moves).toHaveLength(3);

		const r4 = byRule.get('delete-uu')!;
		expect(r4.status).toBe('available');
		expect(r4.moves).toHaveLength(2);
	});

	it('matches the legal-move enumeration site for site', () => {
		const rows = analyzeMiuRuleAvailability('MUUIIUUIIIIIU');
		const r3 = rows.find((row) => row.ruleId === 'replace-iii')!;
		const enumerated = enumerateMiuMoves('MUUIIUUIIIIIU').filter(
			(move) => move.ruleId === 'replace-iii'
		);

		expect(r3.moves.map((move) => move.key)).toEqual(enumerated.map((move) => move.key));
		expect(r3.moves.map((move) => move.start)).toEqual([7, 8, 9]);
	});

	it('keeps all four rules in fixed order with patterns and labels from the axiom', () => {
		const rows = analyzeMiuRuleAvailability('MI');

		expect(rows.map((row) => row.ruleId)).toEqual([
			'append-u',
			'double-tail',
			'replace-iii',
			'delete-uu'
		]);
		expect(rows.map((row) => row.ruleLabel)).toEqual(['Rule 1', 'Rule 2', 'Rule 3', 'Rule 4']);
		expect(rows.map((row) => row.pattern)).toEqual(['xI → xIU', 'Mx → Mxx', 'III → U', 'UU → ∅']);

		expect(rows[0]!.status).toBe('available');
		expect(rows[0]!.moves.map((move) => move.result)).toEqual(['MIU']);
		expect(rows[1]!.status).toBe('available');
		expect(rows[1]!.moves.map((move) => move.result)).toEqual(['MII']);
		expect(rows[2]!.status).toBe('unavailable');
		expect(rows[2]!.reason).toBe('no III in this string');
		expect(rows[3]!.status).toBe('unavailable');
		expect(rows[3]!.reason).toBe('no UU in this string');
	});

	it('reports only Rule 2 from MU', () => {
		const rows = analyzeMiuRuleAvailability('MU');

		expect(rows.find((row) => row.ruleId === 'append-u')?.status).toBe('unavailable');
		expect(rows.find((row) => row.ruleId === 'double-tail')?.moves.map((m) => m.result)).toEqual([
			'MUU'
		]);
		expect(rows.find((row) => row.ruleId === 'replace-iii')?.status).toBe('unavailable');
		expect(rows.find((row) => row.ruleId === 'delete-uu')?.status).toBe('unavailable');
	});

	it('rejects malformed strings before analysis', () => {
		expect(() => analyzeMiuRuleAvailability('IU')).toThrow(/Invalid MIU string/);
	});
});

describe('MIU trace', () => {
	it('applies a valid move to the current step', () => {
		const trace = createDerivationTrace();
		const move = enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u');

		expect(move).toBeDefined();

		const next = applyMoveToTrace(trace, move!);

		expect(next.steps.map((step) => step.value)).toEqual(['MI', 'MIU']);
		expect(next.currentIndex).toBe(1);
		expect(next.steps[1]?.via?.ruleId).toBe('append-u');
	});

	it('can jump backward without mutating trace history', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const second = applyMoveToTrace(
			first,
			enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail')!
		);

		const jumped = jumpToTraceStep(second, 0);

		expect(jumped.currentIndex).toBe(0);
		expect(jumped.steps.map((step) => step.value)).toEqual(['MI', 'MIU', 'MIUIU']);
	});

	it('branches from an earlier state by truncating future history', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const second = applyMoveToTrace(
			first,
			enumerateMiuMoves('MIU').find((candidate) => candidate.ruleId === 'double-tail')!
		);
		const branched = applyMoveToTrace(
			second,
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'double-tail')!,
			0
		);

		expect(branched.steps.map((step) => step.value)).toEqual(['MI', 'MII']);
		expect(branched.currentIndex).toBe(1);
	});

	it('steps back and restarts conservatively', () => {
		const first = applyMoveToTrace(
			createDerivationTrace(),
			enumerateMiuMoves('MI').find((candidate) => candidate.ruleId === 'append-u')!
		);
		const steppedBack = stepBackTrace(first);
		const restarted = restartTrace(first);

		expect(steppedBack.currentIndex).toBe(0);
		expect(restarted.steps.map((step) => step.value)).toEqual(['MI']);
		expect(restarted.currentIndex).toBe(0);
	});

	it('falls back to a clean initial trace when persisted input is invalid', () => {
		const trace = normalizeTrace({
			steps: [{ value: 'MU', via: null }],
			currentIndex: 9
		});

		expect(trace.steps.map((step) => step.value)).toEqual(['MI']);
		expect(trace.currentIndex).toBe(0);
	});
});
