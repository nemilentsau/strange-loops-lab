import { describe, expect, it } from 'vitest';

import {
	applyMoveToTrace,
	createDerivationTrace,
	enumerateMiuMoves,
	type DerivationTrace
} from './core';

import {
	buildReachabilityGraph,
	graphNodeExists,
	nodeIdFor,
	summarizeReachabilityGraph,
	traceGraphPath,
	tracePathToNode
} from './graph';

function deriveTrace(values: string[]): DerivationTrace {
	let trace = createDerivationTrace();

	for (const value of values) {
		const move = enumerateMiuMoves(trace.steps[trace.currentIndex]!.value).find(
			(candidate) => candidate.result === value
		);

		if (!move) {
			throw new Error(`No legal move to ${value} in test setup`);
		}

		trace = applyMoveToTrace(trace, move);
	}

	return trace;
}

describe('traceGraphPath', () => {
	const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 });

	it('maps the active branch onto drawn nodes and edges', () => {
		const path = traceGraphPath(graph, deriveTrace(['MII', 'MIIII']));

		expect(path.nodeIds).toEqual([nodeIdFor('MI'), nodeIdFor('MII'), nodeIdFor('MIIII')]);
		expect(path.edgeIds).toHaveLength(2);
	});

	it('includes a rediscovery edge the graph records', () => {
		// MIIII →R3→ MIU lands on a node first discovered from MI.
		const path = traceGraphPath(graph, deriveTrace(['MII', 'MIIII', 'MIU']));

		expect(path.nodeIds).toContain(nodeIdFor('MIU'));
		expect(path.edgeIds).toHaveLength(3);
	});

	it('ignores steps ahead of the current index', () => {
		const trace = deriveTrace(['MII', 'MIIII']);
		const jumpedBack = { ...trace, currentIndex: 1 };

		const path = traceGraphPath(graph, jumpedBack);

		expect(path.nodeIds).toEqual([nodeIdFor('MI'), nodeIdFor('MII')]);
		expect(path.edgeIds).toHaveLength(1);
	});

	it('skips strings and moves that lie outside the explored region', () => {
		// MIUIUIUIU is depth 3; its doubling leaves the bounded region.
		const path = traceGraphPath(
			graph,
			deriveTrace(['MIU', 'MIUIU', 'MIUIUIUIU', 'MIUIUIUIUIUIUIUIU'])
		);

		expect(path.nodeIds).toHaveLength(4);
		expect(path.edgeIds).toHaveLength(3);
	});
});

describe('MIU reachability graph', () => {
	it('uses unique node identities for identical strings', () => {
		const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 20 });
		const miuNodeId = nodeIdFor('MIU');

		expect(graph.nodes.filter((node) => node.id === miuNodeId)).toHaveLength(1);
		expect(graph.edges.filter((edge) => edge.to === miuNodeId)).toHaveLength(2);
	});

	it('stores edge metadata for legal transitions', () => {
		const graph = buildReachabilityGraph({ maxDepth: 1, maxNodes: 10 });
		const edge = graph.edges.find((candidate) => candidate.move.ruleId === 'append-u');

		expect(edge?.from).toBe(nodeIdFor('MI'));
		expect(edge?.to).toBe(nodeIdFor('MIU'));
		expect(edge?.move.ruleLabel).toBe('Rule 1');
	});

	it('respects node limits during expansion', () => {
		const graph = buildReachabilityGraph({ maxDepth: 6, maxNodes: 4 });

		expect(graph.nodes.length).toBe(4);
		expect(graph.truncatedBy).toBe('node-limit');
	});

	it('reconstructs a valid provenance path to an inspected node', () => {
		const graph = buildReachabilityGraph({ maxDepth: 4, maxNodes: 30 });
		const path = tracePathToNode(graph, nodeIdFor('MUI'));

		expect(path.map((step) => step.value)).toEqual(['MI', 'MII', 'MIIII', 'MUI']);
		expect(path.at(-1)?.via?.ruleId).toBe('replace-iii');
	});

	it('reports whether a selected node exists in the current snapshot', () => {
		const graph = buildReachabilityGraph({ maxDepth: 2, maxNodes: 10 });

		expect(graphNodeExists(graph, nodeIdFor('MIU'))).toBe(true);
		expect(graphNodeExists(graph, nodeIdFor('MU'))).toBe(false);
		expect(graphNodeExists(graph, null)).toBe(false);
	});
});

describe('summarizeReachabilityGraph', () => {
	it('counts nodes and edges across the explored region', () => {
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 }));

		expect(summary.nodeCount).toBe(11);
		expect(summary.edgeCount).toBe(11);
	});

	it('reports per-depth counts and the deepest reached frontier', () => {
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 4, maxNodes: 64 }));

		expect(summary.nodesByDepth).toEqual([1, 2, 3, 5, 14]);
		expect(summary.deepestDepth).toBe(4);
		expect(summary.frontierCount).toBe(14);
	});

	it('reports frontier growth relative to the previous depth', () => {
		// depth 4 holds 14 strings, depth 3 holds 5: the frontier grew by 9.
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 4, maxNodes: 64 }));

		expect(summary.frontierGrowth).toBe(9);
	});

	it('reports negative frontier growth when the node limit cuts the deepest layer short', () => {
		// maxNodes: 8 fills depths [1, 2, 3, 2] — the search hits the limit partway
		// through depth 3, leaving only 2 nodes there vs 3 at depth 2 → growth is -1.
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 3, maxNodes: 8 }));

		expect(summary.frontierGrowth).toBe(-1);
	});

	it('has no frontier growth when only the root has been reached', () => {
		// maxDepth 0 keeps just MI: there is no previous depth to compare against.
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 0, maxNodes: 16 }));

		expect(summary.nodesByDepth).toEqual([1]);
		expect(summary.deepestDepth).toBe(0);
		expect(summary.frontierCount).toBe(1);
		expect(summary.frontierGrowth).toBeNull();
	});

	it('counts rule applications that rediscover an already-found string', () => {
		// At depth 3 one edge lands on a string reached earlier by another path.
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 }));

		expect(summary.repeatedDiscoveryCount).toBe(1);
	});

	it('reports zero rediscovery before any paths converge', () => {
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 2, maxNodes: 16 }));

		expect(summary.repeatedDiscoveryCount).toBe(0);
	});

	it('excludes the bound-tripping edge from rediscovery when truncated by node limit', () => {
		// The edge that hits the node limit points at a string that was never added,
		// so it is neither a discovery nor a rediscovery of an explored node.
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 6, maxNodes: 4 }));

		expect(summary.nodeCount).toBe(4);
		expect(summary.repeatedDiscoveryCount).toBe(0);
	});

	it('passes through the depth bound as the truncation cause', () => {
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 2, maxNodes: 64 }));

		expect(summary.truncatedBy).toBe('depth');
		expect(summary.maxDepth).toBe(2);
		expect(summary.maxNodes).toBe(64);
	});

	it('passes through the node bound as the truncation cause', () => {
		const summary = summarizeReachabilityGraph(buildReachabilityGraph({ maxDepth: 6, maxNodes: 4 }));

		expect(summary.truncatedBy).toBe('node-limit');
		expect(summary.maxNodes).toBe(4);
	});

	it('rejects a custom root outside the MIU theorem-candidate grammar', () => {
		expect(() => buildReachabilityGraph({ start: 'M', maxDepth: 8, maxNodes: 64 })).toThrow(
			/Invalid MIU string/
		);
	});
});
