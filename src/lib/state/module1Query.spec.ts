import { describe, expect, it } from 'vitest';

import { analyzeMiuRuleAvailability } from '$lib/miu/core';

import { buildTargetQuery } from './module1Query';

describe('buildTargetQuery', () => {
	it('rejects an invalid MIU string without per-rule clauses', () => {
		const query = buildTargetQuery('MI', 'XYZ');

		expect(query.syntaxValid).toBe(false);
		expect(query.ok).toBe(false);
		expect(query.clauses).toEqual([]);
		expect(query.verdict).toContain('not a valid MIU string');
	});

	it('marks a reachable target legal and offers the producing move', () => {
		const query = buildTargetQuery('MI', 'MIU');

		expect(query.ok).toBe(true);
		expect(query.verdict).toBe('legal — R1 produces it from here.');
		expect(query.match?.ruleId).toBe('append-u');
		expect(query.clauses[0]).toMatchObject({ ruleLabel: 'R1', ok: true, text: 'produces MIU' });
	});

	it('reuses the ledger reason verbatim for an unavailable rule', () => {
		const query = buildTargetQuery('MIU', 'MU');
		const ledgerReason = analyzeMiuRuleAvailability('MIU').find(
			(row) => row.ruleId === 'append-u'
		)!.reason;

		const r1 = query.clauses.find((clause) => clause.ruleId === 'append-u')!;

		expect(r1.ok).toBe(false);
		expect(r1.text).toBe(ledgerReason);
	});

	it('names the single different result an available rule would give', () => {
		const query = buildTargetQuery('MIU', 'MU');
		const r2 = query.clauses.find((clause) => clause.ruleId === 'double-tail')!;

		expect(r2.ok).toBe(false);
		expect(r2.text).toBe('gives MIUIU');
		expect(query.verdict).toBe('rejected — no rule produces MU from here.');
	});

	it('counts results when an available rule has several, none matching', () => {
		// MUUIUU: Rule 4 can delete UU at two sites with distinct results.
		const query = buildTargetQuery('MUUIUU', 'MU');
		const r4 = query.clauses.find((clause) => clause.ruleId === 'delete-uu')!;

		expect(r4.ok).toBe(false);
		expect(r4.text).toBe('2 results — none is MU');
	});

	it('middle-ellipsizes long results in clauses', () => {
		const source = `M${'IU'.repeat(13)}`;
		const query = buildTargetQuery(source, 'MU');
		const r2 = query.clauses.find((clause) => clause.ruleId === 'double-tail')!;

		expect(r2.text.startsWith('gives ')).toBe(true);
		expect(r2.text).toContain('…');
		expect(r2.text.replace('gives ', '')).toHaveLength(25);
	});
});
