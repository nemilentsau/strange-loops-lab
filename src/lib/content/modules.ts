export type ModuleStatus = 'live' | 'scaffolding' | 'planned';

export interface ModuleSummary {
	slug: string;
	index: number;
	title: string;
	subtitle: string;
	status: ModuleStatus;
	excerpt: string;
	surfaces: string[];
}

export const modules: ModuleSummary[] = [
	{
		slug: 'module-1',
		index: 1,
		title: 'Formal Systems & Their Walls',
		subtitle: 'MIU, reachability, and invariants',
		status: 'live',
		excerpt:
			'The first live instrument: manipulate the MIU system, inspect derivation structure, and make the object-level versus meta-level split operational.',
		surfaces: ['Sandbox', 'Trace', 'Graph', 'Invariants', 'Dialogue', 'Artifacts']
	},
	{
		slug: 'module-2',
		index: 2,
		title: 'Diagonalization',
		subtitle: 'A shared impossibility template',
		status: 'planned',
		excerpt:
			'Cantor, halting, Russell, and Godel through the same anti-enumeration move rather than as isolated anecdotes.',
		surfaces: ['Examples', 'Construction', 'Countermove']
	},
	{
		slug: 'module-3',
		index: 3,
		title: 'Godel Numbering',
		subtitle: 'Syntax turned into arithmetic',
		status: 'planned',
		excerpt:
			'Encoding formal syntax as data so arithmetic can begin talking about formal statements and proofs.',
		surfaces: ['Encoder', 'Decoder', 'Worked artifacts']
	},
	{
		slug: 'module-4',
		index: 4,
		title: 'Self-Reference & Fixed Points',
		subtitle: 'Quines, recursion, and self-address',
		status: 'planned',
		excerpt:
			'Expose the construction patterns that let systems encode self-reference without mystical handwaving.',
		surfaces: ['Quines', 'Lambda terms', 'Fixed-point moves']
	}
];

export function getModuleBySlug(slug: string): ModuleSummary | undefined {
	return modules.find((module) => module.slug === slug);
}
