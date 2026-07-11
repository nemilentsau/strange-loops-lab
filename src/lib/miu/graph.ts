import { MIU_INITIAL_STRING, clampBound, enumerateMiuMoves, type MiuMove } from './core';

export interface ReachabilityNode {
	id: string;
	value: string;
	depth: number;
}

export interface ReachabilityEdge {
	id: string;
	from: string;
	to: string;
	move: MiuMove;
}

export interface ReachabilityGraph {
	rootId: string;
	nodes: ReachabilityNode[];
	edges: ReachabilityEdge[];
	truncatedBy: 'depth' | 'node-limit' | null;
	maxDepth: number;
	maxNodes: number;
}

export interface ReachabilityGraphOptions {
	start?: string;
	maxDepth: number;
	maxNodes: number;
}

export function buildReachabilityGraph(options: ReachabilityGraphOptions): ReachabilityGraph {
	const start = options.start ?? MIU_INITIAL_STRING;
	const maxDepth = clampBound(options.maxDepth, 0, 8);
	const maxNodes = clampBound(options.maxNodes, 1, 250);
	const rootId = nodeIdFor(start);
	const nodes = new Map<string, ReachabilityNode>([[rootId, { id: rootId, value: start, depth: 0 }]]);
	const edges = new Map<string, ReachabilityEdge>();
	const queue: ReachabilityNode[] = [{ id: rootId, value: start, depth: 0 }];
	let truncatedBy: ReachabilityGraph['truncatedBy'] = null;

	while (queue.length > 0) {
		const current = queue.shift()!;

		if (current.depth >= maxDepth) {
			truncatedBy ??= 'depth';
			continue;
		}

		for (const move of enumerateMiuMoves(current.value)) {
			const targetId = nodeIdFor(move.result);
			const edge = createEdge(current.id, targetId, move);

			if (!edges.has(edge.id)) {
				edges.set(edge.id, edge);
			}

			if (nodes.has(targetId)) {
				continue;
			}

			if (nodes.size >= maxNodes) {
				truncatedBy = 'node-limit';
				queue.length = 0;
				break;
			}

			const nextNode = {
				id: targetId,
				value: move.result,
				depth: current.depth + 1
			};

			nodes.set(targetId, nextNode);
			queue.push(nextNode);
		}
	}

	return {
		rootId,
		nodes: Array.from(nodes.values()).sort(compareNodes),
		edges: Array.from(edges.values()).sort(compareEdges),
		truncatedBy,
		maxDepth,
		maxNodes
	};
}

function nodeIdFor(value: string): string {
	return `state:${value}`;
}

function createEdge(from: string, to: string, move: MiuMove): ReachabilityEdge {
	return {
		id: `${from}->${to}:${move.key}`,
		from,
		to,
		move
	};
}

function compareNodes(left: ReachabilityNode, right: ReachabilityNode): number {
	return left.depth - right.depth || left.value.localeCompare(right.value);
}

function compareEdges(left: ReachabilityEdge, right: ReachabilityEdge): number {
	return left.from.localeCompare(right.from) || left.to.localeCompare(right.to) || left.id.localeCompare(right.id);
}
