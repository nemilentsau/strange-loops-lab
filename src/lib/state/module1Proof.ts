import {
	analyzeInvariantCandidate,
	countI,
	parseInvariantCandidate,
	type ParsedInvariantCandidate
} from '$lib/miu/invariants';
import { ellipsizeMiddle } from './module1';

/**
 * The Prove page's proof document: claim, candidate, base case, one clause
 * per rule, conclusion — every stamp from the verifier, every sentence
 * written the way a person explains an argument aloud (design rule 8: a
 * human voice, one claim per sentence; no compressed logician's
 * aphorisms). This module owns the copy so it is testable.
 *
 * Verdicts come from `analyzeInvariantCandidate`, never re-derived; the
 * base case (the axiom, count(I) = 1) and the MU separation (count(I) = 0)
 * are the two endpoints the engine's per-rule checks don't state, computed
 * here from the same parsed candidate.
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
	/** One quiet line checking the learner's current string against the candidate. */
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
				"That's not a form the verifier can check. It can check properties shaped like count(I) mod k = r or count(I) mod k != r — try one of those.",
			candidateLabel: input.trim(),
			currentLine: `your current string ${shortCurrent} has count(I) = ${currentCount}`,
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
			head: basePasses ? 'Base — the axiom satisfies it.' : 'Base — the axiom already fails it.',
			pattern: null,
			text: basePasses
				? `MI has count(I) = 1, and 1 mod ${parsed.modulus} is ${1 % parsed.modulus} — which the candidate allows.`
				: `MI has count(I) = 1, and 1 mod ${parsed.modulus} is ${1 % parsed.modulus} — which the candidate forbids.`,
			stamp: basePasses ? 'pass' : 'fail',
			witness: null
		},
		...analysis.ruleResults.map((result, index): ProofClause => {
			const short = result.ruleLabel.replace('Rule ', 'R');

			return {
				num: String(index + 2),
				head: result.preserved ? `${short} preserves it.` : `${short} breaks it.`,
				pattern: RULE_PATTERNS[result.ruleId] ?? null,
				text: result.preserved
					? preservedText(parsed, result.ruleId)
					: brokenText(result.ruleId),
				stamp: result.preserved ? 'pass' : 'fail',
				witness: result.witness
					? `${ellipsizeMiddle(result.witness.source, 18)} ·${short}· ${ellipsizeMiddle(
							result.witness.result,
							18
						)} — count(I): ${result.witness.iCountBefore} → ${result.witness.iCountAfter}, and ${
							result.witness.iCountAfter
						} mod ${parsed.modulus} is ${result.witness.iCountAfter % parsed.modulus}`
					: null
			};
		})
	];

	const allPass = clauses.every((clause) => clause.stamp === 'pass');

	return {
		supported: true,
		unsupportedReason: null,
		candidateLabel: parsed.label,
		currentLine: `your current string ${shortCurrent} has count(I) = ${currentCount} — it ${
			satisfies(parsed, currentCount) ? 'satisfies the candidate' : 'already violates the candidate'
		}`,
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
			head: `So every derivable string satisfies ${parsed.label}. MU doesn't — its I-count is 0. No derivation can ever reach it. ∎`,
			text: 'Searching could only ever check derivations one at a time. The invariant covers them all — that is the step outside the system.',
			stamp: 'pass'
		};
	}

	// A preserved invariant that MU also satisfies can't separate MU from the
	// reachable strings. (No candidate in the current grammar reaches this
	// branch — only mod-3 ≠ 0 survives all four rules — but the copy must
	// exist if the grammar ever grows.)
	if (allPass) {
		return {
			head: 'A true invariant — but it does not separate MU.',
			text: 'Every rule preserves this property, but MU satisfies it too: count(I) = 0 is allowed. To rule MU out, the property has to fail for MU.',
			stamp: 'fail'
		};
	}

	if (!basePasses) {
		return {
			head: 'The argument does not go through.',
			text: "It fails at the very first string: MI doesn't satisfy the candidate, so there is nothing to preserve. You need a property MI actually has.",
			stamp: 'fail'
		};
	}

	return {
		head: 'The argument does not go through.',
		text: 'It only takes one breakable rule: a derivation can run through the counterexample above and come out the other side without the property. So this candidate tells us nothing about MU.',
		stamp: 'fail'
	};
}

function preservedText(parsed: ParsedInvariantCandidate, ruleId: string): string {
	switch (ruleId) {
		case 'append-u':
			return 'Appending a U leaves the I-count unchanged.';
		case 'delete-uu':
			return 'Deleting UU leaves the I-count unchanged.';
		case 'double-tail':
			return `Doubling takes the I-count from n to 2n. Mod ${parsed.modulus}, that sends ${residueStory(
				parsed,
				(n) => 2 * n
			)} — every result is still allowed.`;
		case 'replace-iii':
			return parsed.modulus === 3
				? 'Removing III takes 3 away from the I-count — and subtracting 3 changes nothing mod 3.'
				: `Removing III takes 3 away from the I-count. Mod ${parsed.modulus}, that sends ${residueStory(
						parsed,
						(n) => n - 3
					)} — every result is still allowed.`;
		default:
			return 'Preserved.';
	}
}

function brokenText(ruleId: string): string {
	switch (ruleId) {
		case 'double-tail':
			return 'Doubling can land on the forbidden remainder. For example:';
		case 'replace-iii':
			return 'Removing III can land on the forbidden remainder. For example:';
		default:
			return 'This rule can break the property. For example:';
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
