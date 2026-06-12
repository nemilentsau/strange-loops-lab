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
 * Build the ELK input for the drawn region. Layout — node positions, edge
 * routing, and edge-label placement — is owned by the ELK layered engine
 * (the standard Sugiyama implementation), not hand-placed: ELK reserves
 * space for labels while routing, which is what keeps a label visually
 * attached to ITS edge. We only declare structure here; rendering keeps
 * the worksheet's own SVG and registers.
 *
 * Labels stay sparse by design: a learner-path edge always carries its own
 * rule label; other edges are grouped per (parent, rule) and only the
 * group's carrier is labeled ("R3 ×6"); an edge that lands on an
 * already-discovered string (depth does not increase) is marked "↩".
 * Depth columns are pinned with ELK partitions so layers stay layers.
 */
export interface ElkSize {
	width: number;
	height: number;
}

export interface ElkEdgeMeta {
	/** True when the edge lands on an already-discovered string. */
	back: boolean;
}

export function buildElkGraph(
	graph: ReachabilityGraph,
	learnerEdgeIds: ReadonlySet<string>,
	nodeSize: (value: string) => ElkSize,
	labelSize: (text: string) => ElkSize
): { root: object; edgeMeta: Map<string, ElkEdgeMeta> } {
	const depthOf = new Map(graph.nodes.map((node) => [node.id, node.depth]));
	const edgeMeta = new Map<string, ElkEdgeMeta>();

	// One label per rule per fan; path edges always labeled individually.
	const labels = new Map<string, string>();
	const fans = new Map<string, ReachabilityEdge[]>();

	for (const edge of graph.edges) {
		if (!depthOf.has(edge.to)) {
			continue;
		}

		const back = (depthOf.get(edge.to) ?? 0) <= (depthOf.get(edge.from) ?? 0);
		edgeMeta.set(edge.id, { back });

		const shortLabel = edge.move.ruleLabel.replace('Rule ', 'R');

		if (learnerEdgeIds.has(edge.id) || back) {
			labels.set(edge.id, back ? `${shortLabel} ↩` : shortLabel);
			continue;
		}

		const key = `${edge.from}:${edge.move.ruleId}`;
		const fan = fans.get(key);

		if (fan) {
			fan.push(edge);
		} else {
			fans.set(key, [edge]);
		}
	}

	for (const fan of fans.values()) {
		const carrier = fan[Math.floor(fan.length / 2)]!;
		const shortLabel = carrier.move.ruleLabel.replace('Rule ', 'R');

		labels.set(carrier.id, fan.length > 1 ? `${shortLabel} ×${fan.length}` : shortLabel);
	}

	const root = {
		id: 'root',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': 'RIGHT',
			'elk.partitioning.activate': 'true',
			'elk.edgeRouting': 'POLYLINE',
			'elk.edgeLabels.inline': 'true',
			'elk.spacing.nodeNode': '18',
			'elk.spacing.edgeNode': '14',
			'elk.spacing.edgeEdge': '10',
			'elk.spacing.edgeLabel': '4',
			'elk.layered.spacing.nodeNodeBetweenLayers': '90',
			'elk.layered.spacing.edgeNodeBetweenLayers': '24'
		},
		children: graph.nodes.map((node) => ({
			id: node.id,
			...nodeSize(node.value),
			layoutOptions: { 'elk.partitioning.partition': String(node.depth) }
		})),
		edges: graph.edges
			.filter((edge) => depthOf.has(edge.to))
			.map((edge) => {
				const text = labels.get(edge.id);

				return {
					id: edge.id,
					sources: [edge.from],
					targets: [edge.to],
					labels: text ? [{ text, ...labelSize(text) }] : []
				};
			})
	};

	return { root, edgeMeta };
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

