export const THEOREM_TARGETS = [
	'MUI',
	'MIIIIU',
	'MIIIUIU',
	'MIUIUIUIU',
	'MIUIIIIIUIIII'
] as const;

export const DESCRIPTION_LENGTH_EXAMPLES = [
	{
		value: 'MIIIUIU',
		reading: 'as long as itself',
		note: 'Seven symbols; the shortest derivation has eight moves.'
	},
	{
		value: 'MIUIIIIIUIIII',
		reading: 'compressible',
		note: 'Thirteen symbols; a five-move derivation produces the repeated I-runs.'
	},
	{
		value: 'MIUIUIUIU',
		reading: 'compressible',
		note: 'Nine symbols; one append and two doublings produce four IU blocks.'
	}
] as const;
