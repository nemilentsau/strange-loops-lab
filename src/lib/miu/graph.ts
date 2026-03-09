import { MIU_INITIAL_STRING, enumerateMiuMoves, type MiuMove } from './core';

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

export interface ProvenanceStep {
	nodeId: string;
	value: string;
	via: MiuMove | null;
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

export function tracePathToNode(graph: ReachabilityGraph, nodeId: string): ProvenanceStep[] {
	const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
	const target = nodeMap.get(nodeId);

	if (!target) {
		throw new Error(`Node ${nodeId} is not part of the graph`);
	}

	const parentEdgeByNode = new Map<string, ReachabilityEdge>();

	for (const edge of graph.edges) {
		const targetNode = nodeMap.get(edge.to);

		if (!targetNode || parentEdgeByNode.has(edge.to)) {
			continue;
		}

		parentEdgeByNode.set(edge.to, edge);
	}

	const path: ProvenanceStep[] = [];
	let cursor: ReachabilityNode | undefined = target;

	while (cursor) {
		const parentEdge: ReachabilityEdge | null = parentEdgeByNode.get(cursor.id) ?? null;

		path.push({
			nodeId: cursor.id,
			value: cursor.value,
			via: parentEdge?.move ?? null
		});

		if (cursor.id === graph.rootId) {
			break;
		}

		cursor = parentEdge ? nodeMap.get(parentEdge.from) : undefined;
	}

	return path.reverse();
}

export function graphNodeExists(graph: ReachabilityGraph, nodeId: string | null | undefined): boolean {
	if (!nodeId) {
		return false;
	}

	return graph.nodes.some((node) => node.id === nodeId);
}

export function nodeIdFor(value: string): string {
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

function clampBound(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) {
		return min;
	}

	return Math.min(max, Math.max(min, Math.trunc(value)));
}

function compareNodes(left: ReachabilityNode, right: ReachabilityNode): number {
	return left.depth - right.depth || left.value.localeCompare(right.value);
}

function compareEdges(left: ReachabilityEdge, right: ReachabilityEdge): number {
	return left.from.localeCompare(right.from) || left.to.localeCompare(right.to) || left.id.localeCompare(right.id);
}
