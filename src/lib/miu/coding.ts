import {
	MIU_INITIAL_STRING,
	MIU_RULES,
	applyMiuMove,
	enumerateMiuMoves,
	isValidMiuString,
	type MiuMove,
	type MiuRuleId
} from './core';

const OPCODES: Record<MiuRuleId, string> = {
	'append-u': '001',
	'double-tail': '010',
	'replace-iii': '011',
	'delete-uu': '100'
};

export interface EncodedInstruction {
	ruleId: MiuRuleId;
	opcode: string;
	siteOrdinal: number;
	siteCount: number;
	siteBits: string;
	display: string;
}

export interface EncodedDerivation {
	bitLength: number;
	bitString: string;
	instructions: EncodedInstruction[];
}

export function encodeMove(source: string, move: MiuMove): EncodedInstruction {
	const sites = enumerateMiuMoves(source).filter((candidate) => candidate.ruleId === move.ruleId);
	const siteOrdinal = sites.findIndex((candidate) => candidate.key === move.key);
	if (siteOrdinal < 0) {
		throw new Error(`Move is not legal from ${source}`);
	}
	const width = sites.length <= 1 ? 0 : Math.ceil(Math.log2(sites.length));
	const siteBits = width === 0 ? '' : siteOrdinal.toString(2).padStart(width, '0');
	const ruleNumber = MIU_RULES.indexOf(move.ruleId) + 1;
	return {
		ruleId: move.ruleId,
		opcode: OPCODES[move.ruleId],
		siteOrdinal,
		siteCount: sites.length,
		siteBits,
		display: sites.length === 1 ? `R${ruleNumber}` : `R${ruleNumber}@${siteOrdinal + 1}/${sites.length}`
	};
}

export function encodeDerivation(path: MiuMove[]): EncodedDerivation {
	let current = MIU_INITIAL_STRING;
	const instructions: EncodedInstruction[] = [];
	for (const move of path) {
		const instruction = encodeMove(current, move);
		instructions.push(instruction);
		current = applyMiuMove(current, move);
	}
	const payload = instructions.map((instruction) => instruction.opcode + instruction.siteBits).join('');
	const bitString = `0${payload}000`;
	return { bitLength: bitString.length, bitString, instructions };
}

export function instructionBitLength(source: string, move: MiuMove): number {
	const instruction = encodeMove(source, move);
	return instruction.opcode.length + instruction.siteBits.length;
}

export function literalMiuBitLength(value: string): number {
	if (!isValidMiuString(value)) {
		throw new Error(`Invalid MIU literal: ${value}`);
	}
	const tailLength = value.length - 1;
	const gammaLength = 2 * Math.floor(Math.log2(tailLength)) + 1;
	return 1 + gammaLength + tailLength;
}
