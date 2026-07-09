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
		reading: 'literal code is shorter',
		note: '35 program bits; 12 literal bits.'
	},
	{
		value: 'MIUIIIIIUIIII',
		reading: 'literal code is shorter',
		note: 'Five moves, but 22 program bits against 20 literal bits.'
	},
	{
		value: 'MIUIUIUIU',
		reading: 'MIU program is shorter',
		note: '13 program bits against 16 literal bits.'
	}
] as const;
