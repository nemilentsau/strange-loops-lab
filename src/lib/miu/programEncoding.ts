import { encodeDerivation, type EncodedInstruction } from './coding';
import type { MiuMove } from './core';

export interface ProgramEncodingRow {
	instruction: EncodedInstruction;
	/** 1-based derivation step this instruction encodes. */
	step: number;
}

export interface ProgramEncodingBreakdown {
	/** The single framing bit that selects the program branch (1 selects the literal branch). */
	tagBit: '0';
	rows: ProgramEncodingRow[];
	/** The 3-bit end-of-instructions marker; 000 is the one 3-bit word no opcode uses. */
	terminator: '000';
	/** Bits contributed by the instruction stream (opcodes plus any site selectors). */
	payloadBits: number;
	/** tag (1) + payload + terminator (3); equals encodeDerivation(moves).bitLength. */
	total: number;
}

/**
 * Decompose the bit count of a derivation's program encoding into its parts:
 * the tag bit, one instruction per move, and the terminator. Reuses
 * {@link encodeDerivation} so the reported total cannot drift from the real
 * encoding.
 */
export function describeProgramEncoding(activeMoves: MiuMove[]): ProgramEncodingBreakdown {
	const encoded = encodeDerivation(activeMoves);
	const rows = encoded.instructions.map((instruction, index) => ({
		instruction,
		step: index + 1
	}));
	const payloadBits = encoded.instructions.reduce(
		(sum, instruction) => sum + instruction.opcode.length + instruction.siteBits.length,
		0
	);
	return {
		tagBit: '0',
		rows,
		terminator: '000',
		payloadBits,
		total: encoded.bitLength
	};
}
