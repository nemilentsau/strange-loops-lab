<script lang="ts">
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import { GRAPH_DEPTH_OPTIONS, GRAPH_NODE_LIMIT_OPTIONS, PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';
	import type { ReachabilityGraph, ReachabilityNode, ProvenanceStep } from '$lib/miu/graph';

	interface MapGuideTask {
		title: string;
		body: string;
		question: string;
		nodeId?: string | null;
	}

	let {
		reachabilityGraph,
		selectedGraphNodeId,
		selectedGraphNode,
		selectedGraphPath,
		repeatedGraphNodeId,
		graphDepth,
		graphNodeLimit,
		onUpdateGraphDepth,
		onUpdateGraphNodeLimit,
		onSelectGraphNode,
		onUseGuideTask
	}: {
		reachabilityGraph: ReachabilityGraph;
		selectedGraphNodeId: string;
		selectedGraphNode: ReachabilityNode;
		selectedGraphPath: ProvenanceStep[];
		repeatedGraphNodeId: string | null;
		graphDepth: number;
		graphNodeLimit: number;
		onUpdateGraphDepth: (event: Event) => void;
		onUpdateGraphNodeLimit: (event: Event) => void;
		onSelectGraphNode: (nodeId: string) => void;
		onUseGuideTask: (question: string, nodeId?: string) => void;
	} = $props();

	const level = PHASE_META.map.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	const guideTasks = $derived<MapGuideTask[]>([
		{
			title: 'Find repetition',
			body: 'Inspect a node with more than one incoming edge and decide what repeated discovery really means.',
			question: 'What does it mean when two different legal paths converge on the same node?',
			nodeId: repeatedGraphNodeId
		},
		{
			title: 'Push the boundary',
			body: 'Raise depth or node count and watch how quickly the reachable space grows.',
			question: 'How fast does the state space grow as I raise the exploration bounds?'
		},
		{
			title: 'Search is not proof',
			body: 'Use the graph to feel the limit of exploration, then state what still remains unproven.',
			question: 'Even if MU never appears in this graph, what would still be missing from a proof?'
		}
	]);
</script>

<div class="phase-canvas phase-canvas--{level} phase-map">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>
	<SurfacePanel title="Reachability Explorer" eyebrow="The boundary" badge="computed graph" tone="computed">
	<div class="guide-grid">
		{#each guideTasks as task}
			<div class="guide-card guide-card--map">
				<div>
					<strong>{task.title}</strong>
					<p>{task.body}</p>
				</div>
				<button
					class="button button--ghost button--sm"
					type="button"
					onclick={() => onUseGuideTask(task.question, task.nodeId ?? undefined)}
					disabled={task.title === 'Find repetition' && !task.nodeId}
				>
					{task.nodeId ? 'Focus task' : 'Use as question'}
				</button>
			</div>
		{/each}
	</div>

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
			{#if reachabilityGraph.truncatedBy}
				<strong>{reachabilityGraph.truncatedBy}</strong>
				<span>truncated by</span>
			{:else}
				<span class="graph-metric__none">no truncation</span>
			{/if}
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
</div>
