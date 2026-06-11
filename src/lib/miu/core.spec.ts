import { describe, expect, it } from 'vitest';

	import {
		analyzeMiuProposal,
		analyzeMiuRuleAvailability,
		applyMiuMove,
		applyMoveToTrace,
		createDerivationTrace,
	enumerateMiuMoves,
	jumpToTraceStep,
	normalizeTrace,
	restartTrace,
	stepBackTrace
} from './core';

describe('MIU engine', () => {
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
