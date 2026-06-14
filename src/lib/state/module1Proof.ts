import {
	analyzeInvariantCandidate,
	countI,
	parseInvariantCandidate,
	type ParsedInvariantCandidate
} from '$lib/miu/invariants';
import { ellipsizeMiddle } from './module1';

/**
 * The Prove page's proof document: a structural induction on derivations —
 * the predicate P (the candidate), the base case (the axiom MI), one clause
 * per rule (the inductive step), and the conclusion. Every verdict comes from
 * `analyzeInvariantCandidate`, never re-derived; the base case (count(I) = 1)
 * and the MU separation (count(I) = 0) are the two endpoints the engine's
 * per-rule checks do not state, computed here from the same parsed candidate.
 *
 * Copy is the formal register (see `.agents/skills/prose/SKILL.md`): the
 * predicate, base case, and inductive step are stated and displayed, not
 * dissolved into conversational prose.
 */
export interface ProofClause {
	num: string;
	head: string;
	/** The ledger pattern, e.g. "Mx → Mxx"; null for the base case. */
	pattern: string | null;
	text: string;
	stamp: 'pass' | 'fail';
	/** The verifier's counterexample, rendered as one mono line; null when preserved. */
	witness: string | null;
}

export interface ProofConclusion {
	head: string;
	text: string;
	stamp: 'pass' | 'fail';
}

export interface ProofDocument {
	supported: boolean;
	/** Human prompt shown at the candidate line when the form is not checkable. */
	unsupportedReason: string | null;
	candidateLabel: string;
	/** The predicate under induction, e.g. "P(s): count(I) mod 3 != 0"; null when unsupported. */
	definition: string | null;
	/** One quiet line checking the learner's current string against P. */
	currentLine: string;
	clauses: ProofClause[];
	conclusion: ProofConclusion | null;
}

const RULE_PATTERNS: Record<string, string> = {
	'append-u': 'xI → xIU',
	'double-tail': 'Mx → Mxx',
	'replace-iii': 'III → U',
	'delete-uu': 'UU → ∅'
};

export function buildProofDocument(input: string, currentString: string): ProofDocument {
	const parsed = parseInvariantCandidate(input);
	const currentCount = countI(currentString);
	const shortCurrent = ellipsizeMiddle(currentString, 18);

	if (parsed === null) {
		return {
			supported: false,
			unsupportedReason:
				'The verifier checks predicates of the form count(I) mod k = r or count(I) mod k != r. Restate the candidate in that form.',
			candidateLabel: input.trim(),
			definition: null,
			currentLine: `Current string ${shortCurrent}: count(I) = ${currentCount}.`,
			clauses: [],
			conclusion: null
		};
	}

	const analysis = analyzeInvariantCandidate(input, currentString);
	const basePasses = satisfies(parsed, 1);
	const muExcluded = !satisfies(parsed, 0);

	const clauses: ProofClause[] = [
		{
			num: '1',
			head: basePasses ? 'Base. The axiom satisfies P.' : 'Base. The axiom fails P.',
			pattern: null,
			text: basePasses
				? `MI has count(I) = 1, and 1 mod ${parsed.modulus} = ${1 % parsed.modulus} — which P allows.`
				: `MI has count(I) = 1, and 1 mod ${parsed.modulus} = ${1 % parsed.modulus} — which P forbids.`,
			stamp: basePasses ? 'pass' : 'fail',
			witness: null
		},
		...analysis.ruleResults.map((result, index): ProofClause => {
			const short = result.ruleLabel.replace('Rule ', 'R');

			return {
				num: String(index + 2),
				head: result.preserved ? `${short} preserves P.` : `${short} breaks P.`,
				pattern: RULE_PATTERNS[result.ruleId] ?? null,
				text: result.preserved ? preservedText(parsed, result.ruleId) : brokenText(result.ruleId),
				stamp: result.preserved ? 'pass' : 'fail',
				witness: result.witness
					? `${ellipsizeMiddle(result.witness.source, 18)} ·${short}· ${ellipsizeMiddle(
							result.witness.result,
							18
						)} — count(I): ${result.witness.iCountBefore} → ${result.witness.iCountAfter}; ${
							result.witness.iCountAfter
						} mod ${parsed.modulus} = ${result.witness.iCountAfter % parsed.modulus}`
					: null
			};
		})
	];

	const allPass = clauses.every((clause) => clause.stamp === 'pass');

	return {
		supported: true,
		unsupportedReason: null,
		candidateLabel: parsed.label,
		definition: `P(s): ${parsed.label}`,
		currentLine: `Current string ${shortCurrent}: count(I) = ${currentCount} — ${
			satisfies(parsed, currentCount) ? 'satisfies P' : 'violates P'
		}.`,
		clauses,
		conclusion: buildConclusion(parsed, allPass, basePasses, muExcluded)
	};
}

function buildConclusion(
	parsed: ParsedInvariantCandidate,
	allPass: boolean,
	basePasses: boolean,
	muExcluded: boolean
): ProofConclusion {
	if (allPass && muExcluded) {
		return {
			head: `Every theorem satisfies P; MU does not, since count(I) = 0. So MU is not derivable in MIU. ∎`,
			text: 'A search inspects derivations one at a time and never terminates; the induction settles all of them at once, because every rule preserves P.',
			stamp: 'pass'
		};
	}

	// A preserved invariant that MU also satisfies cannot separate MU from the
	// reachable strings. (No candidate in the current grammar reaches this
	// branch — only mod-3 != 0 survives all four rules — but the copy must
	// exist if the grammar ever grows.)
	if (allPass) {
		return {
			head: 'A genuine invariant — but it does not separate MU.',
			text: 'Every rule preserves P, yet MU satisfies it too: count(I) = 0 is allowed. To exclude MU, P must fail at MU.',
			stamp: 'fail'
		};
	}

	if (!basePasses) {
		return {
			head: 'The induction has no base.',
			text: 'MI does not satisfy P, so there is nothing to preserve. The property must hold at the axiom.',
			stamp: 'fail'
		};
	}

	return {
		head: 'The inductive step fails.',
		text: 'At least one rule breaks P (above), so a derivation can pass through it and emerge without the property. P says nothing about MU.',
		stamp: 'fail'
	};
}

function preservedText(parsed: ParsedInvariantCandidate, ruleId: string): string {
	switch (ruleId) {
		case 'append-u':
			return 'Appending U leaves count(I) unchanged.';
		case 'delete-uu':
			return 'Deleting UU leaves count(I) unchanged.';
		case 'double-tail':
			return `Doubling sends count(I) from n to 2n. Mod ${parsed.modulus}: ${residueStory(
				parsed,
				(n) => 2 * n
			)} — all allowed.`;
		case 'replace-iii':
			return parsed.modulus === 3
				? 'Removing III subtracts 3 from count(I); subtracting 3 changes nothing mod 3.'
				: `Removing III subtracts 3 from count(I). Mod ${parsed.modulus}: ${residueStory(
						parsed,
						(n) => n - 3
					)} — all allowed.`;
		default:
			return 'Preserved.';
	}
}

function brokenText(ruleId: string): string {
	switch (ruleId) {
		case 'double-tail':
			return 'Doubling can land on the forbidden residue:';
		case 'replace-iii':
			return 'Removing III can land on the forbidden residue:';
		default:
			return 'This rule can break P:';
	}
}

/** "1 → 2 and 2 → 1" — the map on allowed residues. */
function residueStory(parsed: ParsedInvariantCandidate, map: (n: number) => number): string {
	const allowed: number[] = [];

	for (let residue = 0; residue < parsed.modulus; residue += 1) {
		if (satisfies(parsed, residue)) {
			allowed.push(residue);
		}
	}

	const steps = allowed.map((residue) => `${residue} → ${mod(map(residue), parsed.modulus)}`);

	if (steps.length <= 2) {
		return steps.join(' and ');
	}

	return `${steps.slice(0, -1).join(', ')}, and ${steps.at(-1)}`;
}

function satisfies(parsed: ParsedInvariantCandidate, iCount: number): boolean {
	const residue = mod(iCount, parsed.modulus);

	return parsed.kind === 'mod-equals' ? residue === parsed.residue : residue !== parsed.residue;
}

function mod(value: number, modulus: number): number {
	return ((value % modulus) + modulus) % modulus;
}

/**
 * The candidate, seen as remainders: strip the strings away and the rules
 * act on Z/k — R2 is n → 2n, R3 is n → n − 3, R1 and R4 are the identity.
 * A candidate is an allowed set of remainders, and preservation is exactly
 * closure: no arrow out of an allowed remainder may land on a forbidden
 * one. An escaping arrow is the abstract form of the failing clause's
 * counterexample.
 */
export interface WheelArrow {
	from: number;
	to: number;
	map: 'double' | 'minus3';
	/** True when the arrow leaves the allowed set — the break, drawn. */
	escapes: boolean;
}

export interface ResidueWheel {
	modulus: number;
	/** Index = residue; true when the candidate allows it. */
	allowed: boolean[];
	/** Arrows out of every allowed residue, both maps. */
	arrows: WheelArrow[];
}

export function residueWheel(input: string): ResidueWheel | null {
	const parsed = parseInvariantCandidate(input);

	if (parsed === null) {
		return null;
	}

	const allowed = Array.from({ length: parsed.modulus }, (_, residue) =>
		satisfies(parsed, residue)
	);
	const arrows: WheelArrow[] = [];

	for (let residue = 0; residue < parsed.modulus; residue += 1) {
		if (!allowed[residue]) {
			continue;
		}

		for (const [map, target] of [
			['double', mod(2 * residue, parsed.modulus)],
			['minus3', mod(residue - 3, parsed.modulus)]
		] as const) {
			arrows.push({ from: residue, to: target, map, escapes: !allowed[target] });
		}
	}

	return { modulus: parsed.modulus, allowed, arrows };
}

/**
 * Every candidate the grammar can express, checked for the full argument:
 * closure of the allowed remainders under both maps, the axiom satisfying
 * it, and MU violating it. Run live (never hardcoded) so the page's
 * uniqueness line is the verifier's own result.
 */
export function grammarSurvivors(maxModulus = 12): string[] {
	const survivors: string[] = [];

	for (let modulus = 2; modulus <= maxModulus; modulus += 1) {
		for (let residue = 0; residue < modulus; residue += 1) {
			for (const operator of ['=', '!='] as const) {
				const allowed = Array.from({ length: modulus }, (_, n) =>
					operator === '=' ? n === residue : n !== residue
				);
				const closed = allowed.every(
					(isAllowed, n) =>
						!isAllowed || (allowed[mod(2 * n, modulus)] && allowed[mod(n - 3, modulus)])
				);

				if (closed && allowed[1 % modulus] && !allowed[0]) {
					survivors.push(`count(I) mod ${modulus} ${operator} ${residue}`);
				}
			}
		}
	}

	return survivors;
}
