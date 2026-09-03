import type { ShortestDerivation } from './complexity';
import { MIU_INITIAL_STRING, enumerateMiuMoves } from './core';

export const MIU_LAYER_SIZES = [1, 2, 3, 5, 14, 44, 213, 1448, 14155, 194220] as const;

export type StepBracket =
	| { kind: 'exact'; steps: number }
	| { kind: 'bracket'; ruledOut: number; upper: number; running: boolean };

export function countMiuLayers(maxDepth: number): number[] {
	const seen = new Set<string>([MIU_INITIAL_STRING]);
	let frontier = [MIU_INITIAL_STRING];
	const sizes = [1];
	for (let depth = 1; depth <= maxDepth; depth += 1) {
		const next: string[] = [];
		for (const value of frontier) {
			for (const move of enumerateMiuMoves(value)) {
				if (!seen.has(move.result)) {
					seen.add(move.result);
					next.push(move.result);
				}
			}
		}
		sizes.push(next.length);
		frontier = next;
	}
	return sizes;
}

export function stepBracket(
	shortest: ShortestDerivation | null,
	ruledOut: number | null,
	constructedLength: number,
	running: boolean
): StepBracket {
	if (constructedLength === 0) {
		return { kind: 'exact', steps: 0 };
	}
	if (shortest?.outcome === 'found' && shortest.length !== null) {
		return { kind: 'exact', steps: shortest.length };
	}
	if (shortest?.outcome === 'exhausted') {
		const completed = shortest.completedDepth ?? 0;
		if (completed === constructedLength - 1) {
			return { kind: 'exact', steps: constructedLength };
		}
		return { kind: 'bracket', ruledOut: completed, upper: constructedLength, running: false };
	}
	return { kind: 'bracket', ruledOut: ruledOut ?? 0, upper: constructedLength, running };
}
