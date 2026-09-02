import { MIU_INITIAL_STRING, enumerateMiuMoves, type MiuMove } from './core';
import { instructionBitLength } from './coding';
import { decideMiuTheorem } from './theoremhood';

export interface BitProgramOptions {
	maxNodes?: number;
}

export type BitProgramResult =
	| { outcome: 'found'; target: string; bitLength: number; path: MiuMove[]; maxNodes: number }
	| {
			outcome: 'exhausted';
			target: string;
			bitLength: null;
			path: null;
			/**
			 * Certified floor: K_bits(target) ≥ lowerBound. Dijkstra expands strings
			 * in nondecreasing payload cost, so when the node budget stops it every
			 * unexpanded string costs at least the cheapest live queue entry, and any
			 * program for the target passes through one of them.
			 */
			lowerBound: number;
			maxNodes: number;
	  };

interface QueueItem {
	value: string;
	cost: number;
}

interface Link {
	from: string;
	move: MiuMove;
}

export function shortestBitProgram(
	target: string,
	options: BitProgramOptions = {}
): BitProgramResult {
	const decision = decideMiuTheorem(target);
	if (decision.outcome !== 'theorem') {
		throw new Error(`Expected theorem target, got ${decision.outcome}: ${target}`);
	}
	const requestedMaxNodes = options.maxNodes ?? 200_000;
	const finiteMaxNodes = Number.isFinite(requestedMaxNodes) ? Math.trunc(requestedMaxNodes) : 1;
	const maxNodes = Math.min(5_000_000, Math.max(1, finiteMaxNodes));
	if (target === MIU_INITIAL_STRING) {
		return { outcome: 'found', target, bitLength: 4, path: [], maxNodes };
	}

	const queue = new MinHeap();
	const best = new Map<string, number>([[MIU_INITIAL_STRING, 0]]);
	const links = new Map<string, Link>();
	queue.push({ value: MIU_INITIAL_STRING, cost: 0 });
	let expanded = 0;

	while (queue.size > 0 && expanded < maxNodes) {
		const current = queue.pop()!;
		if (current.cost !== best.get(current.value)) continue;
		if (current.value === target) {
			const path = reconstruct(links, target);
			return { outcome: 'found', target, bitLength: 1 + current.cost + 3, path, maxNodes };
		}
		expanded += 1;

		for (const move of enumerateMiuMoves(current.value)) {
			const cost = current.cost + instructionBitLength(current.value, move);
			if (cost >= (best.get(move.result) ?? Number.POSITIVE_INFINITY)) continue;
			best.set(move.result, cost);
			links.set(move.result, { from: current.value, move });
			queue.push({ value: move.result, cost });
		}
	}

	while (queue.size > 0 && queue.peek()!.cost !== best.get(queue.peek()!.value)) {
		queue.pop();
	}
	const frontier = queue.peek();
	if (!frontier) {
		throw new Error(`Search frontier emptied without reaching theorem ${target}`);
	}
	return {
		outcome: 'exhausted',
		target,
		bitLength: null,
		path: null,
		lowerBound: 1 + frontier.cost + 3,
		maxNodes
	};
}

function reconstruct(links: Map<string, Link>, target: string): MiuMove[] {
	const path: MiuMove[] = [];
	let cursor = target;
	while (cursor !== MIU_INITIAL_STRING) {
		const link = links.get(cursor);
		if (!link) throw new Error(`Broken bit-program chain at ${cursor}`);
		path.push(link.move);
		cursor = link.from;
	}
	return path.reverse();
}

class MinHeap {
	private items: QueueItem[] = [];

	get size(): number {
		return this.items.length;
	}

	peek(): QueueItem | undefined {
		return this.items[0];
	}

	push(item: QueueItem): void {
		this.items.push(item);
		let index = this.items.length - 1;
		while (index > 0) {
			const parent = Math.floor((index - 1) / 2);
			if (this.items[parent]!.cost <= item.cost) break;
			this.items[index] = this.items[parent]!;
			index = parent;
		}
		this.items[index] = item;
	}

	pop(): QueueItem | undefined {
		if (this.items.length === 0) return undefined;
		const root = this.items[0]!;
		const last = this.items.pop()!;
		if (this.items.length === 0) return root;

		let index = 0;
		while (true) {
			const left = 2 * index + 1;
			const right = left + 1;
			if (left >= this.items.length) break;
			const cheaper =
				right < this.items.length && this.items[right]!.cost < this.items[left]!.cost
					? right
					: left;
			if (this.items[cheaper]!.cost >= last.cost) break;
			this.items[index] = this.items[cheaper]!;
			index = cheaper;
		}
		this.items[index] = last;
		return root;
	}
}
