import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph, nodeIdFor } from '$lib/miu/graph';

import { describeActiveBound, layoutReachabilityGraph } from './module1Map';

describe('describeActiveBound', () => {
	it('names the node limit as governing and the depth control as idle', () => {
		// Depth 5 with a 16-string limit: the limit binds first.
		const graph = buildReachabilityGraph({ maxDepth: 5, maxNodes: 16 });
		const note = describeActiveBound(graph, 4);

		expect(graph.truncatedBy).toBe('node-limit');
		expect(note.lead).toBe('the 16-string limit is the active bound');
		expect(note.detail).toContain('raising depth alone changes nothing');
	});

	it('names the depth bound as governing when the region fits the limit', () => {
		const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 });
		const note = describeActiveBound(graph, 3);

		expect(graph.truncatedBy).toBe('depth');
		expect(note.lead).toBe('the depth bound is the active bound');
		expect(note.detail).toContain('raising the string limit alone changes nothing');
	});

	it('reports full enumeration when no bound was hit', () => {
		// Every MIU node has moves, so the builder never exhausts; exercise
		// the branch directly.
		const exhausted = { ...buildReachabilityGraph({ maxDepth: 0, maxNodes: 1 }), truncatedBy: null };
		const note = describeActiveBound(exhausted, 0);

		expect(note.lead).toBe('no bound is active');
	});
});

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

	it('packs each depth column densely from the top, ordered by parent row', () => {
		expect(layout.rowCount).toBe(5);
		expect(rowOf('MI')).toBe(0);
		expect(rowOf('MII')).toBe(0);
		expect(rowOf('MIU')).toBe(1);
		expect(rowOf('MIIII')).toBe(0);
		expect(rowOf('MIIU')).toBe(1);
		expect(rowOf('MIUIU')).toBe(2);
		// Depth 3, parent-then-value order.
		expect(rowOf('MIIIIIIII')).toBe(0);
		expect(rowOf('MIIIIU')).toBe(1);
		expect(rowOf('MUI')).toBe(2);
		expect(rowOf('MIIUIIU')).toBe(3);
		expect(rowOf('MIUIUIUIU')).toBe(4);
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
