import { describe, expect, it } from 'vitest';

import { analyzeMiuRuleAvailability } from '$lib/miu/core';

import { buildTargetQuery } from './module1Query';

describe('buildTargetQuery', () => {
	it('rejects an invalid MIU string without searching', () => {
		const query = buildTargetQuery('MI', 'XYZ', 4);

		expect(query.syntaxValid).toBe(false);
		expect(query.ok).toBe(false);
		expect(query.clauses).toEqual([]);
		expect(query.verdict).toContain('not a valid MIU string');
	});

	it('finds a one-move target and keeps the per-rule anatomy at bound 1', () => {
		const query = buildTargetQuery('MI', 'MIU', 1);

		expect(query.ok).toBe(true);
		expect(query.verdict).toBe('reachable — 1 move.');
		expect(query.path?.map((move) => move.ruleId)).toEqual(['append-u']);
		expect(query.clauses[0]).toMatchObject({ ruleLabel: 'R1', ok: true, text: 'produces MIU' });
	});

	it('reuses the ledger reason verbatim for an unavailable rule at bound 1', () => {
		const query = buildTargetQuery('MIU', 'MU', 1);
		const ledgerReason = analyzeMiuRuleAvailability('MIU').find(
			(row) => row.ruleId === 'append-u'
		)!.reason;

		const r1 = query.clauses.find((clause) => clause.ruleId === 'append-u')!;

		expect(r1.ok).toBe(false);
		expect(r1.text).toBe(ledgerReason);
		expect(query.verdict).toBe('rejected — no rule produces MU from here.');
	});

	it('names the single different result an available rule would give at bound 1', () => {
		const query = buildTargetQuery('MIU', 'MU', 1);
		const r2 = query.clauses.find((clause) => clause.ruleId === 'double-tail')!;

		expect(r2.ok).toBe(false);
		expect(r2.text).toBe('gives MIUIU');
	});

	it('counts results when an available rule has several, none matching, at bound 1', () => {
		// MUUIUU: Rule 4 can delete UU at two sites with distinct results.
		const query = buildTargetQuery('MUUIUU', 'MU', 1);
		const r4 = query.clauses.find((clause) => clause.ruleId === 'delete-uu')!;

		expect(r4.ok).toBe(false);
		expect(r4.text).toBe('2 results — none is MU');
	});

	it('middle-ellipsizes long results in clauses', () => {
		const source = `M${'IU'.repeat(13)}`;
		const query = buildTargetQuery(source, 'MU', 1);
		const r2 = query.clauses.find((clause) => clause.ruleId === 'double-tail')!;

		expect(r2.text.startsWith('gives ')).toBe(true);
		expect(r2.text).toContain('…');
	});

	it('finds a multi-move target with its shortest walkable path and no clauses', () => {
		const query = buildTargetQuery('MI', 'MIIIIU', 4);

		expect(query.ok).toBe(true);
		expect(query.verdict).toBe('reachable — 3 moves.');
		expect(query.path?.map((move) => move.ruleId)).toEqual([
			'double-tail',
			'double-tail',
			'append-u'
		]);
		expect(query.path?.at(-1)?.result).toBe('MIIIIU');
		expect(query.clauses).toEqual([]);
	});

	it('reports the searched count and the bound limitation when not found', () => {
		const query = buildTargetQuery('MI', 'MU', 3);

		expect(query.ok).toBe(false);
		expect(query.verdict).toBe('not within 3 moves — 11 strings searched.');
		expect(query.detail).toBe('Beyond the bound, this instrument cannot see.');
		expect(query.clauses).toEqual([]);
	});

	it('reports the node-limit cut when the search is truncated before the bound', () => {
		const query = buildTargetQuery('MI', 'MU', 3, 4);

		expect(query.ok).toBe(false);
		expect(query.detail).toBe('The search was cut at the node limit before exhausting the bound.');
	});

	it('treats the current string as trivially reached with no walkable path', () => {
		const query = buildTargetQuery('MI', 'MI', 4);

		expect(query.ok).toBe(true);
		expect(query.verdict).toBe('already the current string.');
		expect(query.path).toEqual([]);
	});
});
