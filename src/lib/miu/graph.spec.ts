import { describe, expect, it } from 'vitest';

import { buildReachabilityGraph } from './graph';

describe('MIU reachability graph', () => {
	it('uses unique node identities for identical strings and records rediscovery edges', () => {
		const graph = buildReachabilityGraph({ maxDepth: 3, maxNodes: 20 });
		const miuNodes = graph.nodes.filter((node) => node.value === 'MIU');

		expect(miuNodes).toHaveLength(1);
		// MIU is reached from MI (R1) and rediscovered from MIIII (R3): one node, two edges.
		expect(graph.edges.filter((edge) => edge.to === miuNodes[0]!.id)).toHaveLength(2);
	});

	it('stores edge metadata for legal transitions', () => {
		const graph = buildReachabilityGraph({ maxDepth: 1, maxNodes: 10 });
		const edge = graph.edges.find((candidate) => candidate.move.ruleId === 'append-u');
		const nodeValue = (id: string) => graph.nodes.find((node) => node.id === id)?.value;

		expect(nodeValue(edge!.from)).toBe('MI');
		expect(nodeValue(edge!.to)).toBe('MIU');
		expect(edge?.move.ruleLabel).toBe('Rule 1');
	});

	it('respects node limits during expansion', () => {
		const graph = buildReachabilityGraph({ maxDepth: 6, maxNodes: 4 });

		expect(graph.nodes.length).toBe(4);
		expect(graph.truncatedBy).toBe('node-limit');
	});

	it('reports the depth bound as the truncation cause when nodes remain', () => {
		const graph = buildReachabilityGraph({ maxDepth: 2, maxNodes: 64 });

		expect(graph.truncatedBy).toBe('depth');
		expect(graph.maxDepth).toBe(2);
	});

	it('clamps non-finite bounds to the minimum instead of looping', () => {
		const graph = buildReachabilityGraph({ maxDepth: Number.NaN, maxNodes: Number.POSITIVE_INFINITY });

		expect(graph.nodes.map((node) => node.value)).toEqual(['MI']);
		expect(graph.maxDepth).toBe(0);
		expect(graph.maxNodes).toBe(1);
	});

	it('rejects a custom root outside the MIU theorem-candidate grammar', () => {
		expect(() => buildReachabilityGraph({ start: 'M', maxDepth: 8, maxNodes: 64 })).toThrow(
			/Invalid MIU string/
		);
	});
});
