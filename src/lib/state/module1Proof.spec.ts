import { describe, expect, it } from 'vitest';

import { buildProofDocument } from './module1Proof';

describe('buildProofDocument', () => {
	it('builds the complete argument for the built-in candidate', () => {
		const doc = buildProofDocument('count(I) mod 3 != 0', 'MII');

		expect(doc.supported).toBe(true);
		expect(doc.clauses).toHaveLength(5);
		expect(doc.clauses.every((clause) => clause.stamp === 'pass')).toBe(true);
		expect(doc.clauses[0]!.head).toBe('Base — the axiom satisfies it.');
		expect(doc.clauses[2]!.pattern).toBe('Mx → Mxx');
		expect(doc.clauses[2]!.text).toContain('1 → 2 and 2 → 1');
		expect(doc.conclusion?.stamp).toBe('pass');
		expect(doc.conclusion?.head).toContain('∎');
		expect(doc.conclusion?.head).toContain('MU has count(I) = 0, which violates it');
	});

	it('renders a failing rule with its counterexample as the clause content', () => {
		const doc = buildProofDocument('count(I) mod 2 != 0', 'MII');
		const r2 = doc.clauses.find((clause) => clause.pattern === 'Mx → Mxx')!;

		expect(r2.stamp).toBe('fail');
		expect(r2.head).toBe('R2 breaks it.');
		expect(r2.witness).toContain('MI ·R2· MII');
		expect(r2.witness).toContain('count(I): 1 → 2');
		expect(r2.witness).toContain('2 mod 2 is 0');
		expect(doc.conclusion?.stamp).toBe('fail');
		expect(doc.conclusion?.text).toContain('This candidate proves nothing about MU');
	});

	it('fails at the base when the axiom itself violates the candidate', () => {
		const doc = buildProofDocument('count(I) mod 3 = 0', 'MI');

		expect(doc.clauses[0]!.stamp).toBe('fail');
		expect(doc.clauses[0]!.head).toBe('Base — the axiom already fails it.');
		expect(doc.conclusion?.stamp).toBe('fail');
		expect(doc.conclusion?.text).toContain('It fails at the axiom');
	});

	it('explains an uncheckable form instead of building clauses', () => {
		const doc = buildProofDocument('all strings are nice', 'MI');

		expect(doc.supported).toBe(false);
		expect(doc.unsupportedReason).toContain('count(I) mod k = r');
		expect(doc.clauses).toEqual([]);
		expect(doc.conclusion).toBeNull();
	});

	it('checks the current string against the candidate in one line', () => {
		expect(buildProofDocument('count(I) mod 3 != 0', 'MII').currentLine).toBe(
			'your current string MII has count(I) = 2 — it satisfies the candidate'
		);
		expect(buildProofDocument('count(I) mod 2 != 0', 'MII').currentLine).toBe(
			'your current string MII has count(I) = 2 — it already violates the candidate'
		);
	});
});
