import {
	analyzeMiuProposal,
	analyzeMiuRuleAvailability,
	type MiuMove,
	type MiuRuleId
} from '$lib/miu/core';
import { ellipsizeMiddle } from './module1';

/**
 * The worksheet's margin query: "from <current string>, can one legal move
 * reach <target>?" — answered by the verifier as one stamped verdict plus
 * one compact clause per rule, in the ledger's register. This module owns
 * that copy so it is testable (design rule 11: copy is written, not
 * templated); the verdicts themselves come from `analyzeMiuProposal` and
 * the per-rule reasons from `analyzeMiuRuleAvailability`, never re-derived.
 */
export interface TargetQueryClause {
	ruleId: MiuRuleId;
	/** Short rule name as written in the ledger: R1…R4. */
	ruleLabel: string;
	ok: boolean;
	text: string;
}

export interface TargetQuery {
	proposed: string;
	syntaxValid: boolean;
	/** True when one legal move from the current string produces the target. */
	ok: boolean;
	/** Sentence after the ✓/✗ stamp. */
	verdict: string;
	/** The move to offer for application when `ok`; null otherwise. */
	match: MiuMove | null;
	clauses: TargetQueryClause[];
}

export function buildTargetQuery(source: string, proposedInput: string): TargetQuery {
	const analysis = analyzeMiuProposal(source, proposedInput);
	const shortProposed = ellipsizeMiddle(analysis.proposed);

	if (!analysis.syntaxValid) {
		return {
			proposed: analysis.proposed,
			syntaxValid: false,
			ok: false,
			verdict: 'not a valid MIU string — states start with M and then use only I and U.',
			match: null,
			clauses: []
		};
	}

	const reasons = new Map(
		analyzeMiuRuleAvailability(source).map((row) => [row.ruleId, row.reason])
	);
	const match = analysis.exactMatches[0] ?? null;

	const clauses = analysis.ruleChecks.map((check): TargetQueryClause => {
		const ruleLabel = check.ruleLabel.replace('Rule ', 'R');

		if (check.status === 'matches') {
			return { ruleId: check.ruleId, ruleLabel, ok: true, text: `produces ${shortProposed}` };
		}

		if (check.status === 'unavailable') {
			return {
				ruleId: check.ruleId,
				ruleLabel,
				ok: false,
				text: reasons.get(check.ruleId) ?? check.explanation
			};
		}

		const results = check.legalResults;

		return {
			ruleId: check.ruleId,
			ruleLabel,
			ok: false,
			text:
				results.length === 1
					? `gives ${ellipsizeMiddle(results[0]!)}`
					: `${results.length} results — none is ${shortProposed}`
		};
	});

	return {
		proposed: analysis.proposed,
		syntaxValid: true,
		ok: match !== null,
		verdict: match
			? `legal — ${match.ruleLabel.replace('Rule ', 'R')} produces it from here.`
			: `rejected — no rule produces ${shortProposed} from here.`,
		match,
		clauses
	};
}
