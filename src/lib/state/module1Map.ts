import type { ReachabilityEdge, ReachabilityGraph } from '$lib/miu/graph';

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

	const rows = new Map<string, number>();
	let nextRow = 0;

	const assignRow = (id: string): number => {
		const kids = children.get(id) ?? [];

		if (kids.length === 0) {
			const row = nextRow;
			nextRow += 1;
			rows.set(id, row);
			return row;
		}

		const kidRows = kids.map(assignRow);
		const row = (Math.min(...kidRows) + Math.max(...kidRows)) / 2;
		rows.set(id, row);
		return row;
	};

	assignRow(graph.rootId);

	const depthCount = graph.nodes.reduce((max, node) => Math.max(max, node.depth), 0) + 1;

	return {
		nodes: graph.nodes.map((node) => ({
			id: node.id,
			value: node.value,
			depth: node.depth,
			row: rows.get(node.id) ?? 0
		})),
		treeEdges: [...parentEdges.values()],
		returnEdges,
		rowCount: Math.max(nextRow, 1),
		depthCount
	};
}
