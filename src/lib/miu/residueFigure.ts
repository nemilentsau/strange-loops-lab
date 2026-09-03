import { MIU_RULES, type MiuRuleId } from './core';
import { residueAfterRule, type Z3Residue } from './characters';

export interface ResidueArrow {
	ruleId: MiuRuleId;
	from: Z3Residue;
	to: Z3Residue;
}

export interface ResidueTransit {
	from: Z3Residue;
	to: Z3Residue;
	count: number;
}

export interface ResidueTrajectory {
	start: Z3Residue;
	current: Z3Residue;
	transits: ResidueTransit[];
}

const RESIDUES: readonly Z3Residue[] = [0, 1, 2];

export function toZ3Residue(value: number): Z3Residue {
	if (value === 0 || value === 1 || value === 2) {
		return value;
	}
	throw new Error(`Not a residue mod 3: ${value}`);
}

export function residueArrows(): ResidueArrow[] {
	return MIU_RULES.flatMap((ruleId) =>
		RESIDUES.map((from) => ({ ruleId, from, to: residueAfterRule(ruleId, from) }))
	);
}

export function residueTrajectory(residues: number[]): ResidueTrajectory {
	if (residues.length === 0) {
		throw new Error('A trajectory needs at least the axiom residue');
	}
	const path = residues.map(toZ3Residue);
	const transits = new Map<string, ResidueTransit>();
	for (let index = 1; index < path.length; index += 1) {
		const from = path[index - 1]!;
		const to = path[index]!;
		const key = `${from}>${to}`;
		const transit = transits.get(key) ?? { from, to, count: 0 };
		transit.count += 1;
		transits.set(key, transit);
	}
	return { start: path[0]!, current: path[path.length - 1]!, transits: [...transits.values()] };
}
