<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import { GRAPH_DEPTH_OPTIONS, GRAPH_NODE_LIMIT_OPTIONS } from '$lib/state/module1';
	import type { ReachabilityGraph, ReachabilityNode, ProvenanceStep } from '$lib/miu/graph';

	let {
		reachabilityGraph,
		selectedGraphNodeId,
		selectedGraphNode,
		selectedGraphPath,
		graphDepth,
		graphNodeLimit,
		onUpdateGraphDepth,
		onUpdateGraphNodeLimit,
		onSelectGraphNode
	}: {
		reachabilityGraph: ReachabilityGraph;
		selectedGraphNodeId: string;
		selectedGraphNode: ReachabilityNode;
		selectedGraphPath: ProvenanceStep[];
		graphDepth: number;
		graphNodeLimit: number;
		onUpdateGraphDepth: (event: Event) => void;
		onUpdateGraphNodeLimit: (event: Event) => void;
		onSelectGraphNode: (nodeId: string) => void;
	} = $props();
</script>

<SurfacePanel title="Reachability Explorer" eyebrow="The boundary" badge="computed graph" tone="computed">
	<div class="control-grid">
		<label class="field-label" for="graph-depth">
			Max depth
			<select
				id="graph-depth"
				class="select-field"
				value={graphDepth}
				onchange={onUpdateGraphDepth}
			>
				{#each GRAPH_DEPTH_OPTIONS as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>

		<label class="field-label" for="graph-node-limit">
			Node limit
			<select
				id="graph-node-limit"
				class="select-field"
				value={graphNodeLimit}
				onchange={onUpdateGraphNodeLimit}
			>
				{#each GRAPH_NODE_LIMIT_OPTIONS as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="graph-summary">
		<div class="graph-metric">
			<strong>{reachabilityGraph.nodes.length}</strong>
			<span>nodes</span>
		</div>
		<div class="graph-metric">
			<strong>{reachabilityGraph.edges.length}</strong>
			<span>edges</span>
		</div>
		<div class="graph-metric">
			<strong>{reachabilityGraph.truncatedBy ? `by ${reachabilityGraph.truncatedBy}` : 'none'}</strong>
			<span>truncation</span>
		</div>
	</div>

	<div class="graph-layout">
		<div class="graph-node-list">
			{#each reachabilityGraph.nodes as node}
				<button
					class="graph-node"
					type="button"
					data-active={node.id === selectedGraphNodeId}
					onclick={() => onSelectGraphNode(node.id)}
				>
					<div class="graph-node__top">
						<strong>{node.value}</strong>
						<span>depth {node.depth}</span>
					</div>
					<small>{node.id === reachabilityGraph.rootId ? 'Root state' : 'Inspectable node'}</small>
				</button>
			{/each}
		</div>

		<div class="graph-inspector">
			<div class="graph-inspector__section">
				<p class="eyebrow">Selected node</p>
				<h3>{selectedGraphNode.value}</h3>
				<p class="field-note">
					Depth {selectedGraphNode.depth}. First-class node identity is based on the MIU string,
					so repeated discoveries do not create duplicate nodes.
				</p>
			</div>

			<div class="graph-inspector__section">
				<p class="eyebrow">Shortest known path</p>
				<ol class="path-list">
					{#each selectedGraphPath as step, index}
						<li>
							<strong>{step.value}</strong>
							<span>{index === 0 ? 'Initial state' : step.via?.ruleLabel}</span>
						</li>
					{/each}
				</ol>
			</div>

			<div class="graph-inspector__section">
				<p class="eyebrow">Incoming edges</p>
				<ul class="ledger">
					{#each reachabilityGraph.edges.filter((edge) => edge.to === selectedGraphNodeId) as edge}
						<li>
							<strong>{edge.move.ruleLabel}</strong>
							<span>{edge.move.source} -> {edge.move.result}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</SurfacePanel>
