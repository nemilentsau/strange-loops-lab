import { enumerateMiuMoves, isDeadBranch } from '$lib/miu/core';
import { nodeIdFor, type ReachabilityEdge, type ReachabilityGraph } from '$lib/miu/graph';

/**
 * The legibility horizon: a layer is drawn while it holds this many strings
 * or fewer; bigger layers collapse into counted bands. The space grows
 * exponentially and labels do not shrink — past this point the individual
 * string stops teaching and the aggregate takes over.
 */
export const LAYER_DRAW_LIMIT = 8;

export interface MapLayer {
	depth: number;
	/** Strings first reached at this depth. */
	count: number;
	/** Rule applications from the previous layer that landed on an already-reached string. */
	reconvergences: number;
	/** Strings in this layer that are provably closed (only R2 will ever apply). */
	deadChainCount: number;
	/** True while every layer up to and including this one fits the horizon. */
	drawn: boolean;
}

export interface MapProfile {
	layers: MapLayer[];
	/** Deepest drawn layer; layers beyond it are counted, not drawn. */
	drawnDepthLimit: number;
	nodeCount: number;
	/** Rule applications recorded inside the explored region (discoveries + reconvergences). */
	recordedMoves: number;
	totalReconvergences: number;
}

/**
 * The layer-by-layer account of the explored region: how many strings each
 * depth adds, how many moves circled back building it, how much of it is
 * dead chains — and where the drawing must stop. Every number is a count
 * over the verifier's graph, never re-derived.
 */
export function mapLayerProfile(graph: ReachabilityGraph): MapProfile {
	const depthOf = new Map(graph.nodes.map((node) => [node.id, node.depth]));
	const maxDepth = graph.nodes.reduce((max, node) => Math.max(max, node.depth), 0);

	const counts = Array.from({ length: maxDepth + 1 }, () => 0);
	const dead = Array.from({ length: maxDepth + 1 }, () => 0);

	for (const node of graph.nodes) {
		counts[node.depth] += 1;

		if (isDeadBranch(node.value)) {
			dead[node.depth] += 1;
		}
	}

	// Every recorded edge leaves a node at depth d and lands at depth d+1
	// (a discovery) or on an already-reached string (a reconvergence, while
	// building layer d+1). Edges whose target was never added (the move
	// that tripped the node limit) are not part of the explored region.
	const edgesInto = Array.from({ length: maxDepth + 2 }, () => 0);
	let recordedMoves = 0;

	for (const edge of graph.edges) {
		const from = depthOf.get(edge.from);

		if (from === undefined || !depthOf.has(edge.to)) {
			continue;
		}

		edgesInto[from + 1] = (edgesInto[from + 1] ?? 0) + 1;
		recordedMoves += 1;
	}

	let drawnDepthLimit = 0;

	while (drawnDepthLimit < maxDepth && (counts[drawnDepthLimit + 1] ?? 0) <= LAYER_DRAW_LIMIT) {
		drawnDepthLimit += 1;
	}

	const layers: MapLayer[] = counts.map((count, depth) => ({
		depth,
		count,
		reconvergences: depth === 0 ? 0 : Math.max(0, (edgesInto[depth] ?? 0) - count),
		deadChainCount: dead[depth] ?? 0,
		drawn: depth <= drawnDepthLimit
	}));

	return {
		layers,
		drawnDepthLimit,
		nodeCount: graph.nodes.length,
		recordedMoves,
		totalReconvergences: Math.max(0, recordedMoves - (graph.nodes.length - 1))
	};
}

export interface FanGroup {
	/** Short rule name as written in the ledger: R1…R4. */
	ruleLabel: string;
	results: { value: string; known: boolean }[];
}

/**
 * One string's moves, grouped by rule, for the counted region's
 * draw-a-fan-on-demand: the local neighborhood the page can always afford
 * to show, even where it cannot draw the whole layer. `known` marks
 * results already inside the explored region.
 */
export function fanForString(graph: ReachabilityGraph, value: string): FanGroup[] {
	const knownIds = new Set(graph.nodes.map((node) => node.id));
	const groups = new Map<string, FanGroup>();

	for (const move of enumerateMiuMoves(value)) {
		const ruleLabel = move.ruleLabel.replace('Rule ', 'R');
		const group = groups.get(ruleLabel);
		const result = { value: move.result, known: knownIds.has(nodeIdFor(move.result)) };

		if (group) {
			group.results.push(result);
		} else {
			groups.set(ruleLabel, { ruleLabel, results: [result] });
		}
	}

	return [...groups.values()];
}

/**
 * Deterministic layout for the Map phase's derivation tree: depth layers as
 * columns, rows assigned by a post-order walk of the discovery tree so every
 * subtree occupies a contiguous band and parents sit at the midpoint of
 * their children. Reconvergence edges (a rule application landing on an
 * already-discovered string) are returned separately — they are drawn as
 * curves back into the tree, not as tree structure.
 *
 * The discovery tree uses the same parent extraction as `tracePathToNode`
 * (first edge into each node in the graph's sorted edge order), so the
 * drawn tree and the "shortest known path" agree.
 */
export interface MapLayoutNode {
	id: string;
	value: string;
	depth: number;
	/** Fractional row inside the depth-layer grid; multiply by a row height. */
	row: number;
}

export interface MapLayout {
	nodes: MapLayoutNode[];
	treeEdges: ReachabilityEdge[];
	returnEdges: ReachabilityEdge[];
	/** Number of integer leaf rows; the grid's height. */
	rowCount: number;
	/** Number of depth columns present (max depth + 1). */
	depthCount: number;
}

/**
 * Name the bound that is actually governing the search, and what that means
 * for the other control. The two bounds interact — the tighter one wins —
 * and without this line the slack control appears simply dead (raising
 * depth past a binding node limit changes nothing on screen).
 */
export interface ActiveBoundNote {
	/** The clause to set strong: which bound governs. */
	lead: string;
	/** The consequence, appended after the lead. */
	detail: string;
}

export function describeActiveBound(
	graph: ReachabilityGraph,
	deepestDepth: number
): ActiveBoundNote {
	if (graph.truncatedBy === 'node-limit') {
		return {
			lead: `the ${graph.maxNodes}-string limit is the active bound`,
			detail: ` — it cut the search at depth ${deepestDepth}; raising depth alone changes nothing.`
		};
	}

	if (graph.truncatedBy === 'depth') {
		return {
			lead: `the depth bound is the active bound`,
			detail: ` — every string within ${graph.maxDepth} moves is drawn; raising the string limit alone changes nothing.`
		};
	}

	return {
		lead: 'no bound is active',
		detail: ' — this region is fully enumerated.'
	};
}

export function layoutReachabilityGraph(graph: ReachabilityGraph): MapLayout {
	const nodeIds = new Set(graph.nodes.map((node) => node.id));
	const parentEdges = new Map<string, ReachabilityEdge>();
	const returnEdges: ReachabilityEdge[] = [];

	for (const edge of graph.edges) {
		if (!nodeIds.has(edge.to)) {
			// The move that tripped the node limit: its target was never added.
			continue;
		}

		if (edge.to === graph.rootId || parentEdges.has(edge.to)) {
			returnEdges.push(edge);
			continue;
		}

		parentEdges.set(edge.to, edge);
	}

	// Children in the graph's node order (sorted by depth, then value).
	const children = new Map<string, string[]>();

	for (const node of graph.nodes) {
		const parent = parentEdges.get(node.id);

		if (!parent) {
			continue;
		}

		const siblings = children.get(parent.from);

		if (siblings) {
			siblings.push(node.id);
		} else {
			children.set(parent.from, [node.id]);
		}
	}

	/* Rows: each depth column packs its nodes densely from the top, ordered
	 * by their parent's row (barycenter-lite, so edges stay short and mostly
	 * planar). Top-aligned packing anchors the axiom and the early fans in
	 * the first screenful at any size — a global row per leaf, or centered
	 * columns, would open a 64-string search onto mostly-empty paper. */
	const depthCount = graph.nodes.reduce((max, node) => Math.max(max, node.depth), 0) + 1;
	const columns: typeof graph.nodes[] = Array.from({ length: depthCount }, () => []);

	for (const node of graph.nodes) {
		columns[node.depth]!.push(node);
	}

	const rowCount = columns.reduce((max, column) => Math.max(max, column.length), 1);
	const rows = new Map<string, number>();

	for (const [depth, column] of columns.entries()) {
		if (depth > 0) {
			column.sort((left, right) => {
				const leftParent = rows.get(parentEdges.get(left.id)?.from ?? '') ?? 0;
				const rightParent = rows.get(parentEdges.get(right.id)?.from ?? '') ?? 0;

				return leftParent - rightParent || left.value.localeCompare(right.value);
			});
		}

		for (const [index, node] of column.entries()) {
			rows.set(node.id, index);
		}
	}

	return {
		nodes: graph.nodes.map((node) => ({
			id: node.id,
			value: node.value,
			depth: node.depth,
			row: rows.get(node.id) ?? 0
		})),
		treeEdges: [...parentEdges.values()],
		returnEdges,
		rowCount,
		depthCount
	};
}
