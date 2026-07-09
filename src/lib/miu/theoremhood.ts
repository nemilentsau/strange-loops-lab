import {
	MIU_INITIAL_STRING,
	enumerateMiuMoves,
	isValidMiuString,
	type MiuMove,
	type MiuRuleId
} from './core';
import { countI } from './invariants';

export type MiuTheoremDecision =
	| { outcome: 'invalid'; reason: string }
	| { outcome: 'non-theorem'; residue: 0 }
	| { outcome: 'theorem'; residue: 1 | 2 };

export function decideMiuTheorem(target: string): MiuTheoremDecision {
	if (!isValidMiuString(target)) {
		return {
			outcome: 'invalid',
			reason: 'A MIU string starts with M and has a nonempty tail over {I, U}.'
		};
	}

	const residue = countI(target) % 3;
	return residue === 0
		? { outcome: 'non-theorem', residue: 0 }
		: { outcome: 'theorem', residue: residue as 1 | 2 };
}

export function constructMiuDerivation(target: string): MiuMove[] {
	const decision = decideMiuTheorem(target);
	if (decision.outcome === 'invalid') {
		throw new Error(`Invalid MIU target: ${target}`);
	}
	if (decision.outcome === 'non-theorem') {
		throw new Error(`${target} is not a theorem of MIU`);
	}
	if (target === MIU_INITIAL_STRING) {
		return [];
	}

	const tail = target.slice(1);
	const iCount = countI(target);
	const uCount = Array.from(tail).filter((char) => char === 'U').length;
	const expandedLength = iCount + 3 * uCount;
	let power = 1;
	let doublings = 0;

	while (power < expandedLength || power % 3 !== expandedLength % 3) {
		power *= 2;
		doublings += 1;
	}

	const path: MiuMove[] = [];
	let current = MIU_INITIAL_STRING;
	const apply = (move: MiuMove) => {
		path.push(move);
		current = move.result;
	};

	for (let index = 0; index < doublings; index += 1) {
		apply(selectMove(current, 'double-tail'));
	}

	const excessUCount = (power - expandedLength) / 3;
	const directReplacements = excessUCount % 2 === 0 ? excessUCount : excessUCount - 1;

	for (let index = 0; index < directReplacements; index += 1) {
		apply(selectMove(current, 'replace-iii', 1 + expandedLength + index));
	}

	if (excessUCount % 2 === 1) {
		apply(selectMove(current, 'append-u'));
		apply(selectMove(current, 'replace-iii', 1 + expandedLength + directReplacements));
	}

	const removableUCount = excessUCount % 2 === 0 ? excessUCount : excessUCount + 1;
	for (let index = 0; index < removableUCount / 2; index += 1) {
		apply(selectMove(current, 'delete-uu', 1 + expandedLength));
	}

	let cursor = 1;
	for (const char of tail) {
		if (char === 'I') {
			cursor += 1;
			continue;
		}
		apply(selectMove(current, 'replace-iii', cursor));
		cursor += 1;
	}

	if (current !== target) {
		throw new Error(`Constructed ${current}, expected ${target}`);
	}

	return path;
}

function selectMove(source: string, ruleId: MiuRuleId, start?: number): MiuMove {
	const move = enumerateMiuMoves(source).find(
		(candidate) => candidate.ruleId === ruleId && (start === undefined || candidate.start === start)
	);
	if (!move) {
		throw new Error(`Construction has no ${ruleId} move at ${start ?? 'the unique site'} in ${source}`);
	}
	return move;
}
