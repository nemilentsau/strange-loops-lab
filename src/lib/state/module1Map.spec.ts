import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph, nodeIdFor } from '$lib/miu/graph';

import {
	describeActiveBound,
	fanForString,
	layoutReachabilityGraph,
	mapLayerProfile
} from './module1Map';

describe('mapLayerProfile', () => {
	it('profiles the default region with every layer inside the horizon', () => {
		const profile = mapLayerProfile(buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 }));

		expect(profile.layers.map((layer) => layer.count)).toEqual([1, 2, 3, 5]);
		expect(profile.layers.every((layer) => layer.drawn)).toBe(true);
		expect(profile.drawnDepthLimit).toBe(3);
		// The single rediscovery: MIIII →R3→ MIU, found while building depth 3.
		expect(profile.layers.map((layer) => layer.reconvergences)).toEqual([0, 0, 0, 1]);
		expect(profile.layers.map((layer) => layer.deadChainCount)).toEqual([0, 1, 2, 2]);
		expect(profile.nodeCount).toBe(11);
		expect(profile.recordedMoves).toBe(11);
		expect(profile.totalReconvergences).toBe(1);
	});

	it('collapses layers past the horizon in a deep search', () => {
		const profile = mapLayerProfile(buildReachabilityGraph({ maxDepth: 6, maxNodes: 250 }));

		expect(profile.layers.slice(0, 6).map((layer) => layer.count)).toEqual([1, 2, 3, 5, 14, 44]);
		expect(profile.drawnDepthLimit).toBe(3);
		expect(profile.layers[4]!.drawn).toBe(false);
		expect(profile.layers[5]!.reconvergences).toBe(14);
	});
});

describe('fanForString', () => {
	it('groups the moves of one string by rule and marks results inside the region', () => {
		const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 });
		const fan = fanForString(graph, 'MIIIIIIII');

		expect(fan.map((group) => [group.ruleLabel, group.results.length])).toEqual([
			['R1', 1],
			['R2', 1],
			['R3', 6]
		]);
		// Its children live at depth 4 — outside this region.
		expect(fan.every((group) => group.results.every((result) => !result.known))).toBe(true);
	});

	it('marks results already inside the region as known', () => {
		const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 });
		const fan = fanForString(graph, 'MIIII');
		const r3 = fan.find((group) => group.ruleLabel === 'R3')!;

		// MIIII →R3→ MUI and MIU are both drawn nodes.
		expect(r3.results.map((result) => result.known)).toEqual([true, true]);
	});
});

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
