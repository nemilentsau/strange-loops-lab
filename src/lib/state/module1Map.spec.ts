import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph, nodeIdFor } from '$lib/miu/graph';

import {
	buildElkGraph,
	describeActiveBound,
	fanForString,
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

describe('buildElkGraph', () => {
	// The default Map view: 11 nodes, one reconvergence (MIIII →R3→ MIU).
	const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 16 });
	const size = () => ({ width: 60, height: 30 });
	const labelSize = (text: string) => ({ width: text.length * 6, height: 11 });

	interface ElkChild {
		id: string;
		layoutOptions: Record<string, string>;
	}
	interface ElkEdge {
		id: string;
		sources: string[];
		targets: string[];
		labels: { text: string }[];
	}

	it('declares every node pinned to its depth partition', () => {
		const { root } = buildElkGraph(graph, new Set(), size, labelSize);
		const children = (root as { children: ElkChild[] }).children;

		expect(children).toHaveLength(11);
		expect(
			children.find((child) => child.id === nodeIdFor('MUI'))!.layoutOptions[
				'elk.partitioning.partition'
			]
		).toBe('3');
	});

	it('labels one carrier per rule per fan and marks back edges', () => {
		const { root, edgeMeta } = buildElkGraph(graph, new Set(), size, labelSize);
		const edges = (root as { edges: ElkEdge[] }).edges;
		const texts = edges.flatMap((edge) => edge.labels.map((label) => label.text));

		// MI's fan: one R2, one R1 — each its own group's carrier.
		expect(texts).toContain('R2');
		expect(texts).toContain('R1');
		// The reconvergence MIIII →R3→ MIU is always labeled and marked.
		expect(texts).toContain('R3 ↩');

		const backEdge = edges.find((edge) => edge.labels.some((label) => label.text === 'R3 ↩'))!;
		expect(backEdge.sources).toEqual([nodeIdFor('MIIII')]);
		expect(backEdge.targets).toEqual([nodeIdFor('MIU')]);
		expect(edgeMeta.get(backEdge.id)?.back).toBe(true);
	});

	it('counts a multi-edge rule group on its single carrier label', () => {
		// At depth 4, MIIIIIIII fans R3 across 6 sites.
		const deep = buildReachabilityGraph({ maxDepth: 4, maxNodes: 64 });
		const { root } = buildElkGraph(deep, new Set(), size, labelSize);
		const texts = (root as { edges: ElkEdge[] }).edges.flatMap((edge) =>
			edge.labels.map((label) => label.text)
		);

		expect(texts).toContain('R3 ×6');
		expect(texts.filter((text) => text === 'R3 ×6')).toHaveLength(1);
	});

	it('always labels learner-path edges individually', () => {
		const pathEdge = graph.edges.find(
			(edge) => edge.from === nodeIdFor('MI') && edge.to === nodeIdFor('MII')
		)!;
		const { root } = buildElkGraph(graph, new Set([pathEdge.id]), size, labelSize);
		const edges = (root as { edges: ElkEdge[] }).edges;
		const labeled = edges.find((edge) => edge.id === pathEdge.id)!;

		expect(labeled.labels.map((label) => label.text)).toEqual(['R2']);
	});
});
