import {
	analyzeMiuProposal,
	analyzeMiuRuleAvailability,
	type MiuMove,
	type MiuProposalAnalysis,
	type MiuRuleId
} from '$lib/miu/core';
import { buildReachabilityGraph, graphNodeExists, nodeIdFor, tracePathToNode } from '$lib/miu/graph';
import { ellipsizeMiddle } from './module1';

/**
 * The worksheet's margin query: "from <current string>, can <target> be
 * reached within ≤ k moves?" — answered by bounded search over the verifier's
 * own reachability graph, never re-derived. Found targets return the actual
 * shortest derivation (walkable, every move legal); not-found verdicts print
 * the search's honest limitation, which is the module's thesis in
 * instrument form: bounded search can refute or stay silent, never prove.
 *
 * At bound 1 the answer keeps the per-rule anatomy: one compact clause per
 * rule, reusing the ledger's availability reasons verbatim. This module owns
 * that copy so it is testable (design rule 11: copy is written, not
 * templated).
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
	bound: number;
	syntaxValid: boolean;
	/** True when the target is reachable from the current string within the bound. */
	ok: boolean;
	/** Sentence after the ✓/✗ stamp. */
	verdict: string;
	/** Honest-limitation sentence for the not-found case at bound > 1. */
	detail: string | null;
	/** The verified moves to walk when found; empty when the target IS the current string. */
	path: MiuMove[] | null;
	/** Strings searched, reported for the bound > 1 not-found case. */
	searched: number | null;
	/** Per-rule anatomy, kept only at bound 1. */
	clauses: TargetQueryClause[];
}

export function buildTargetQuery(
	source: string,
	proposedInput: string,
	bound: number,
	maxNodes = 250
): TargetQuery {
	const analysis = analyzeMiuProposal(source, proposedInput);
	const shortProposed = ellipsizeMiddle(analysis.proposed);

	if (!analysis.syntaxValid) {
		return {
			proposed: analysis.proposed,
			bound,
			syntaxValid: false,
			ok: false,
			verdict: 'not a valid MIU string — states start with M and then use only I and U.',
			detail: null,
			path: null,
			searched: null,
			clauses: []
		};
	}

	const graph = buildReachabilityGraph({ start: source, maxDepth: bound, maxNodes });
	const targetId = nodeIdFor(analysis.proposed);
	const clauses = bound === 1 ? buildClauses(source, analysis, shortProposed) : [];

	if (graphNodeExists(graph, targetId)) {
		const path = tracePathToNode(graph, targetId)
			.slice(1)
			.map((step) => step.via!);

		return {
			proposed: analysis.proposed,
			bound,
			syntaxValid: true,
			ok: true,
			verdict:
				path.length === 0
					? 'already the current string.'
					: `reachable — ${path.length} move${path.length === 1 ? '' : 's'}.`,
			detail: null,
			path,
			searched: null,
			clauses
		};
	}

	if (bound === 1) {
		return {
			proposed: analysis.proposed,
			bound,
			syntaxValid: true,
			ok: false,
			verdict: `rejected — no rule produces ${shortProposed} from here.`,
			detail: null,
			path: null,
			searched: null,
			clauses
		};
	}

	return {
		proposed: analysis.proposed,
		bound,
		syntaxValid: true,
		ok: false,
		verdict: `not within ${bound} moves — ${graph.nodes.length} strings searched.`,
		detail:
			graph.truncatedBy === 'node-limit'
				? 'The search was cut at the node limit before exhausting the bound.'
				: graph.truncatedBy === 'depth'
					? 'Beyond the bound, this instrument cannot see.'
					: 'Nothing further is reachable from here at all.',
		path: null,
		searched: graph.nodes.length,
		clauses: []
	};
}

function buildClauses(
	source: string,
	analysis: MiuProposalAnalysis,
	shortProposed: string
): TargetQueryClause[] {
	const reasons = new Map(
		analyzeMiuRuleAvailability(source).map((row) => [row.ruleId, row.reason])
	);

	return analysis.ruleChecks.map((check): TargetQueryClause => {
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
}
