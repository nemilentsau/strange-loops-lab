import { describe, expect, it } from 'vitest';

import { buildProofDocument, grammarSurvivors, residueWheel } from './module1Proof';

describe('residueWheel', () => {
	it('seals the built-in candidate: minus-3 self-loops, doubling swaps 1 and 2', () => {
		const wheel = residueWheel('count(I) mod 3 != 0')!;

		expect(wheel.modulus).toBe(3);
		expect(wheel.allowed).toEqual([false, true, true]);
		expect(wheel.arrows).toContainEqual({ from: 1, to: 2, map: 'double', escapes: false });
		expect(wheel.arrows).toContainEqual({ from: 2, to: 1, map: 'double', escapes: false });
		expect(wheel.arrows).toContainEqual({ from: 1, to: 1, map: 'minus3', escapes: false });
		expect(wheel.arrows.every((arrow) => !arrow.escapes)).toBe(true);
	});

	it('draws the escaping arrows for a breaking candidate', () => {
		const wheel = residueWheel('count(I) mod 2 != 0')!;

		expect(wheel.allowed).toEqual([false, true]);
		// Both maps send the only allowed remainder onto the forbidden one.
		expect(wheel.arrows).toEqual([
			{ from: 1, to: 0, map: 'double', escapes: true },
			{ from: 1, to: 0, map: 'minus3', escapes: true }
		]);
	});

	it('returns null for an uncheckable form', () => {
		expect(residueWheel('all strings are nice')).toBeNull();
	});
});

describe('grammarSurvivors', () => {
	it('finds exactly one candidate in the whole grammar', () => {
		expect(grammarSurvivors()).toEqual(['count(I) mod 3 != 0']);
	});
});

describe('buildProofDocument', () => {
	it('builds the complete argument for the built-in candidate', () => {
		const doc = buildProofDocument('count(I) mod 3 != 0', 'MII');

		expect(doc.supported).toBe(true);
		expect(doc.definition).toBe('P(s): ' + doc.candidateLabel);
		expect(doc.clauses).toHaveLength(5);
		expect(doc.clauses.every((clause) => clause.stamp === 'pass')).toBe(true);
		expect(doc.clauses[0]!.head).toBe('Base. The axiom satisfies P.');
		expect(doc.clauses[2]!.pattern).toBe('Mx → Mxx');
		expect(doc.clauses[2]!.text).toContain('1 → 2 and 2 → 1');
		expect(doc.conclusion?.stamp).toBe('pass');
		expect(doc.conclusion?.head).toContain('∎');
		expect(doc.conclusion?.head).toContain('MU does not, since count(I) = 0');
	});

	it('renders a failing rule with its counterexample as the clause content', () => {
		const doc = buildProofDocument('count(I) mod 2 != 0', 'MII');
		const r2 = doc.clauses.find((clause) => clause.pattern === 'Mx → Mxx')!;

		expect(r2.stamp).toBe('fail');
		expect(r2.head).toBe('R2 breaks P.');
		expect(r2.witness).toContain('MI ·R2· MII');
		expect(r2.witness).toContain('count(I): 1 → 2');
		expect(r2.witness).toContain('2 mod 2 = 0');
		expect(doc.conclusion?.stamp).toBe('fail');
		expect(doc.conclusion?.text).toContain('P says nothing about MU');
	});

	it('fails at the base when the axiom itself violates the candidate', () => {
		const doc = buildProofDocument('count(I) mod 3 = 0', 'MI');

		expect(doc.clauses[0]!.stamp).toBe('fail');
		expect(doc.clauses[0]!.head).toBe('Base. The axiom fails P.');
		expect(doc.conclusion?.stamp).toBe('fail');
		expect(doc.conclusion?.text).toContain('The property must hold at the axiom');
	});

	it('explains an uncheckable form instead of building clauses', () => {
		const doc = buildProofDocument('all strings are nice', 'MI');

		expect(doc.supported).toBe(false);
		expect(doc.definition).toBeNull();
		expect(doc.unsupportedReason).toContain('count(I) mod k = r');
		expect(doc.clauses).toEqual([]);
		expect(doc.conclusion).toBeNull();
	});

	it('checks the current string against the candidate in one line', () => {
		expect(buildProofDocument('count(I) mod 3 != 0', 'MII').currentLine).toBe(
			'Current string MII: count(I) = 2 — satisfies P.'
		);
		expect(buildProofDocument('count(I) mod 2 != 0', 'MII').currentLine).toBe(
			'Current string MII: count(I) = 2 — violates P.'
		);
	});
});
