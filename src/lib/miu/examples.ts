export const THEOREM_TARGETS = [
	'MUI',
	'MIIIIU',
	'MIIIUIU',
	'MIUIUIUIU',
	'MIUIIIIIUIIII'
] as const;

/**
 * The description-length specimens run from the axiom to a compressible
 * string: the flag-bit floor at MI, two incompressible cases where the
 * literal wins, and a doubled I-run where the program undercuts the literal.
 */
export const DESCRIPTION_LENGTH_EXAMPLES = [
	{
		value: 'MI',
		reading: 'The axiom: the empty derivation, yet the 3-bit literal is shorter still.'
	},
	{
		value: 'MIU',
		reading: 'One move — nothing to compress; the literal wins.'
	},
	{
		value: 'MUI',
		reading: 'Three moves cost more bits than writing the string.'
	},
	{
		value: 'MIIIIIIIIIIIIIIII',
		reading: 'Four doublings: the program undercuts the literal — structure compresses.'
	}
] as const;
