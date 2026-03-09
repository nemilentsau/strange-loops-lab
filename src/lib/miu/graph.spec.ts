import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph, graphNodeExists, nodeIdFor, tracePathToNode } from './graph';

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
