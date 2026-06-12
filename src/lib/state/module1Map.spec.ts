import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph, nodeIdFor } from '$lib/miu/graph';

import { layoutReachabilityGraph } from './module1Map';

describe('layoutReachabilityGraph', () => {
	// The default Map view: 11 nodes, one reconvergence (MIIII →R3→ MIU).
	const layout = layoutReachabilityGraph(buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 }));

	function rowOf(value: string): number {
		return layout.nodes.find((node) => node.id === nodeIdFor(value))!.row;
	}

	it('lays out every node with one tree edge per non-root node', () => {
		expect(layout.nodes).toHaveLength(11);
		expect(layout.treeEdges).toHaveLength(10);
		expect(layout.depthCount).toBe(4);
	});

	it('separates the reconvergence edge from the tree', () => {
		expect(layout.returnEdges).toHaveLength(1);
		expect(layout.returnEdges[0]!.from).toBe(nodeIdFor('MIIII'));
		expect(layout.returnEdges[0]!.to).toBe(nodeIdFor('MIU'));
	});

	it('gives leaves sequential integer rows and parents the midpoint of their children', () => {
		expect(layout.rowCount).toBe(5);
		expect(rowOf('MIIIIIIII')).toBe(0);
		expect(rowOf('MIIIIU')).toBe(1);
		expect(rowOf('MUI')).toBe(2);
		expect(rowOf('MIIUIIU')).toBe(3);
		expect(rowOf('MIUIUIUIU')).toBe(4);
		expect(rowOf('MIIII')).toBe(1);
		expect(rowOf('MII')).toBe(2);
		expect(rowOf('MIU')).toBe(4);
		expect(rowOf('MI')).toBe(3);
	});

	it('keeps the doubling trap visible as a bare chain', () => {
		// MIU's subtree is a chain: every layer adds exactly one node.
		const chain = ['MIU', 'MIUIU', 'MIUIUIUIU'];

		for (const value of chain) {
			expect(layout.treeEdges.filter((edge) => edge.from === nodeIdFor(value))).toHaveLength(
				value === 'MIUIUIUIU' ? 0 : 1
			);
		}
	});

	it('handles a single-node graph', () => {
		const single = layoutReachabilityGraph(buildReachabilityGraph({ maxDepth: 0, maxNodes: 1 }));

		expect(single.nodes).toHaveLength(1);
		expect(single.rowCount).toBe(1);
		expect(single.treeEdges).toHaveLength(0);
	});
});
