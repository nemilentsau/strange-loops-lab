import { enumerateMiuMoves, type MiuMove, type MiuRuleId } from './core';
import { buildReachabilityGraph } from './graph';

export interface ParsedInvariantCandidate {
	kind: 'mod-equals' | 'mod-not-equals';
	modulus: number;
	residue: number;
	label: string;
	description: string;
}

export interface InvariantWitness {
	source: string;
	result: string;
	move: MiuMove;
	iCountBefore: number;
	iCountAfter: number;
}

export interface RuleInvariantResult {
	ruleId: MiuRuleId;
	ruleLabel: string;
	preserved: boolean;
	explanation: string;
	witness: InvariantWitness | null;
}

export interface InvariantAnalysis {
	kind: 'supported' | 'unsupported';
	label: string;
	description: string;
	currentICount: number;
	currentSatisfied: boolean;
	ruleResults: RuleInvariantResult[];
	preserved: boolean;
	consequence: string | null;
	unsupportedReason: string | null;
}

const RULE_LABELS: Record<MiuRuleId, string> = {
	'append-u': 'Rule 1',
	'double-tail': 'Rule 2',
	'replace-iii': 'Rule 3',
	'delete-uu': 'Rule 4'
};

const BUILT_IN_TEXT = 'count(I) mod 3 != 0';

export function analyzeInvariantCandidate(input: string, currentString: string): InvariantAnalysis {
	const parsed = parseInvariantCandidate(input);
	const currentICount = countI(currentString);

	if (parsed === null) {
		return {
			kind: 'unsupported',
			label: input.trim() || 'Unsupported candidate',
			description: 'Supported forms are `count(I) mod k = r` and `count(I) mod k != r`.',
			currentICount,
			currentSatisfied: false,
			ruleResults: [],
			preserved: false,
			consequence: null,
			unsupportedReason: 'Use a modular candidate of the form `count(I) mod k = r` or `!= r`.'
		};
	}

	const ruleResults = analyzeRules(parsed);
	const preserved = ruleResults.every((result) => result.preserved);

	return {
		kind: 'supported',
		label: parsed.label,
		description: parsed.description,
		currentICount,
		currentSatisfied: satisfiesCandidate(parsed, currentICount),
		ruleResults,
		preserved,
		consequence: invariantConsequence(parsed, preserved),
		unsupportedReason: null
	};
}

export function builtInInvariantAnalysis(currentString: string): InvariantAnalysis {
	return analyzeInvariantCandidate(BUILT_IN_TEXT, currentString);
}

export function countI(value: string): number {
	return Array.from(value).filter((char) => char === 'I').length;
}

export function parseInvariantCandidate(input: string): ParsedInvariantCandidate | null {
	const normalized = input.trim().replace(/\s+/g, ' ');
	const match = normalized.match(/^count\(I\) mod (\d+)\s*(=|!=)\s*(\d+)$/i);

	if (!match) {
		return null;
	}

	const modulus = Number(match[1]);
	const operator = match[2];
	const residue = Number(match[3]);

	if (!Number.isInteger(modulus) || modulus < 2 || !Number.isInteger(residue) || residue < 0) {
		return null;
	}

	const normalizedResidue = residue % modulus;
	const kind = operator === '=' ? 'mod-equals' : 'mod-not-equals';

	return {
		kind,
		modulus,
		residue: normalizedResidue,
		label: `count(I) mod ${modulus} ${operator} ${normalizedResidue}`,
		description:
			kind === 'mod-equals'
				? `Track strings whose I-count is congruent to ${normalizedResidue} modulo ${modulus}.`
				: `Track strings whose I-count avoids residue ${normalizedResidue} modulo ${modulus}.`
	};
}

function analyzeRules(candidate: ParsedInvariantCandidate): RuleInvariantResult[] {
	return (['append-u', 'double-tail', 'replace-iii', 'delete-uu'] as const).map((ruleId) => {
		const witness = findInvariantWitness(candidate, ruleId);

		if (witness === null) {
			return {
				ruleId,
				ruleLabel: RULE_LABELS[ruleId],
				preserved: true,
				explanation: preservedExplanation(candidate, ruleId),
				witness: null
			};
		}

		return {
			ruleId,
			ruleLabel: RULE_LABELS[ruleId],
			preserved: false,
			explanation: `Fails on ${witness.source} -> ${witness.result}: the I-count moves from ${witness.iCountBefore} to ${witness.iCountAfter}.`,
			witness
		};
	});
}

function findInvariantWitness(
	candidate: ParsedInvariantCandidate,
	ruleId: MiuRuleId
): InvariantWitness | null {
	const reachableWitness = findReachableWitness(candidate, ruleId);

	if (reachableWitness) {
		return reachableWitness;
	}

	return findSyntheticWitness(candidate, ruleId);
}

function findReachableWitness(
	candidate: ParsedInvariantCandidate,
	ruleId: MiuRuleId
): InvariantWitness | null {
	const graph = buildReachabilityGraph({ maxDepth: 6, maxNodes: 120 });

	for (const node of graph.nodes) {
		const iCountBefore = countI(node.value);

		if (!satisfiesCandidate(candidate, iCountBefore)) {
			continue;
		}

		for (const move of enumerateMiuMoves(node.value)) {
			if (move.ruleId !== ruleId) {
				continue;
			}

			const iCountAfter = countI(move.result);

			if (satisfiesCandidate(candidate, iCountAfter)) {
				continue;
			}

			return {
				source: node.value,
				result: move.result,
				move,
				iCountBefore,
				iCountAfter
			};
		}
	}

	return null;
}

function findSyntheticWitness(
	candidate: ParsedInvariantCandidate,
	ruleId: MiuRuleId
): InvariantWitness | null {
	for (const iCountBefore of candidateRepresentatives(candidate, minimumIForRule(ruleId))) {
		if (!satisfiesCandidate(candidate, iCountBefore)) {
			continue;
		}

		const source = witnessStringFor(ruleId, iCountBefore);
		const move = enumerateMiuMoves(source).find((candidateMove) => candidateMove.ruleId === ruleId);

		if (!move) {
			continue;
		}

		const iCountAfter = countI(move.result);

		if (satisfiesCandidate(candidate, iCountAfter)) {
			continue;
		}

		return {
			source,
			result: move.result,
			move,
			iCountBefore,
			iCountAfter
		};
	}

	return null;
}

function candidateRepresentatives(candidate: ParsedInvariantCandidate, minimumI: number): number[] {
	const values: number[] = [];

	for (let residue = 0; residue < candidate.modulus; residue += 1) {
		const base = minimumI <= residue ? residue : residue + Math.ceil((minimumI - residue) / candidate.modulus) * candidate.modulus;
		values.push(base);
	}

	return values;
}

function minimumIForRule(ruleId: MiuRuleId): number {
	switch (ruleId) {
		case 'append-u':
			return 1;
		case 'replace-iii':
			return 3;
		default:
			return 0;
	}
}

function witnessStringFor(ruleId: MiuRuleId, iCount: number): string {
	switch (ruleId) {
		case 'append-u':
			return `M${'I'.repeat(Math.max(1, iCount))}`;
		case 'double-tail':
			return iCount === 0 ? 'MU' : `M${'I'.repeat(iCount)}`;
		case 'replace-iii':
			return `M${'I'.repeat(Math.max(3, iCount))}`;
		case 'delete-uu':
			return `MUU${'I'.repeat(iCount)}`;
	}
}

function satisfiesCandidate(candidate: ParsedInvariantCandidate, iCount: number): boolean {
	const residue = mod(iCount, candidate.modulus);

	if (candidate.kind === 'mod-equals') {
		return residue === candidate.residue;
	}

	return residue !== candidate.residue;
}

function invariantConsequence(candidate: ParsedInvariantCandidate, preserved: boolean): string | null {
	if (!preserved) {
		return null;
	}

	if (candidate.kind === 'mod-not-equals' && candidate.modulus === 3 && candidate.residue === 0) {
		return 'Starting from MI, the system never reaches a string with I-count congruent to 0 mod 3. MU has 0 I symbols, so this blocks MU directly.';
	}

	return 'This candidate is preserved across the MIU rules at the rule level shown here.';
}

function preservedExplanation(candidate: ParsedInvariantCandidate, ruleId: MiuRuleId): string {
	const residueExamples = candidate.kind === 'mod-equals' ? `${candidate.residue}` : `not ${candidate.residue}`;

	switch (ruleId) {
		case 'append-u':
			return `Preserved because Rule 1 does not change the I-count, so the residue class ${residueExamples} is unchanged.`;
		case 'double-tail':
			return 'Preserved for every satisfying residue class checked under the doubling map n -> 2n.';
		case 'replace-iii':
			return 'Preserved for every satisfying residue class checked under the subtraction map n -> n - 3.';
		case 'delete-uu':
			return 'Preserved because Rule 4 does not change the I-count.';
	}
}

function mod(value: number, modulus: number): number {
	return ((value % modulus) + modulus) % modulus;
}
