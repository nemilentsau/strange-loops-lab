<script lang="ts">
	import LabDesk from '$lib/components/LabDesk.svelte';
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import { GRAPH_DEPTH_OPTIONS, GRAPH_NODE_LIMIT_OPTIONS, PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';
	import {
		graphNodeExists,
		nodeIdFor,
		summarizeReachabilityGraph,
		type ReachabilityGraph,
		type ReachabilityNode,
		type ProvenanceStep
	} from '$lib/miu/graph';

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
		workingQuestion,
		onUpdateGraphDepth,
		onUpdateGraphNodeLimit,
		onSelectGraphNode,
		onUpdateQuestion,
		onUseGuideTask,
		onBridgeToProve
	}: {
		reachabilityGraph: ReachabilityGraph;
		selectedGraphNodeId: string;
		selectedGraphNode: ReachabilityNode;
		selectedGraphPath: ProvenanceStep[];
		repeatedGraphNodeId: string | null;
		graphDepth: number;
		graphNodeLimit: number;
		workingQuestion: string;
		onUpdateGraphDepth: (event: Event) => void;
		onUpdateGraphNodeLimit: (event: Event) => void;
		onSelectGraphNode: (nodeId: string) => void;
		onUpdateQuestion: (event: Event) => void;
		onUseGuideTask: (question: string, nodeId?: string) => void;
		onBridgeToProve: () => void;
	} = $props();

	const level = PHASE_META.map.level;
	const levelPresentation = LEVEL_PRESENTATION[level];
	const metaPresentation = LEVEL_PRESENTATION.meta;

	const summary = $derived(summarizeReachabilityGraph(reachabilityGraph));
	const muReached = $derived(graphNodeExists(reachabilityGraph, nodeIdFor('MU')));

	// The bridge is a computed affordance: it appears only once the learner has hit
	// a search bound and MU is still absent from the explored region. It is never
	// gated on any LLM judgment, and it stays hidden while the search is unbounded
	// so the invariant still feels discovered rather than announced.
	const showProveBridge = $derived(reachabilityGraph.truncatedBy !== null && !muReached);

	const boundFact = $derived(
		reachabilityGraph.truncatedBy === 'depth'
			? `Bound hit: depth ${summary.maxDepth}.`
			: reachabilityGraph.truncatedBy === 'node-limit'
				? `Bound hit: node limit (${summary.maxNodes}).`
				: 'No bound hit — this region is fully enumerated.'
	);

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

	// Compact guided-task rows expand on click to reveal body text. Kept as a
	// tiny local toggle (presentational only — no draft state), matching Explore.
	let expandedTask = $state<number | null>(null);

	function toggleTask(index: number) {
		expandedTask = expandedTask === index ? null : index;
	}
</script>

<div class="phase-canvas phase-canvas--{level} phase-map">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<LabDesk>
		{#snippet guide()}
			<label class="working-question" for="working-question-input">
				<span class="working-question__label">Your working question</span>
				<input
					id="working-question-input"
					class="text-field working-question__input"
					type="text"
					placeholder="What are you trying to find out?"
					value={workingQuestion}
					oninput={onUpdateQuestion}
				/>
			</label>

			<SurfacePanel title="Guided Tasks" eyebrow="Map with intent">
				<div class="task-list">
					{#each guideTasks as task, index}
						<div class="task-row" data-expanded={expandedTask === index}>
							<div class="task-row__head">
								<button
									class="task-row__toggle"
									type="button"
									aria-expanded={expandedTask === index}
									onclick={() => toggleTask(index)}
								>
									<span class="task-row__caret" aria-hidden="true">
										{expandedTask === index ? '▾' : '▸'}
									</span>
									<span class="task-row__title">{task.title}</span>
								</button>
								<button
									class="button button--ghost button--sm task-row__use"
									type="button"
									onclick={() => onUseGuideTask(task.question, task.nodeId ?? undefined)}
									disabled={task.title === 'Find repetition' && !task.nodeId}
								>
									{task.nodeId ? 'Focus' : 'Use'}
								</button>
							</div>
							{#if expandedTask === index}
								<p class="task-row__body">{task.body}</p>
							{/if}
						</div>
					{/each}
				</div>
			</SurfacePanel>

			<SurfacePanel title="Search Bounds" eyebrow="Tune the exploration">
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
			</SurfacePanel>
		{/snippet}

		{#snippet instrument()}
			<SurfacePanel title="Reachability Explorer" eyebrow="The boundary" badge="computed graph" tone="computed" instrument>
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
		{/snippet}

		{#snippet evidence()}
			<SurfacePanel title="What the search shows so far" eyebrow="Computed observations" tone="computed">
				<ul class="observations" data-tone="computed">
					<li class="observation">
						<strong>{summary.nodeCount} strings reached</strong>
						<span>
							within depth {summary.maxDepth}{#if summary.frontierGrowth !== null}, depth {summary.deepestDepth}
								{#if summary.frontierGrowth > 0}adds {summary.frontierGrowth} more than depth {summary.deepestDepth - 1}{:else if summary.frontierGrowth === 0}matched the count at depth {summary.deepestDepth - 1}{:else}was cut off by the bound before completing — it is smaller than depth {summary.deepestDepth - 1}{/if}{/if}.
						</span>
					</li>
					<li class="observation">
						{#if summary.repeatedDiscoveryCount > 0}
							<strong>{summary.repeatedDiscoveryCount} rule application{summary.repeatedDiscoveryCount === 1 ? '' : 's'} circled back</strong>
							<span>onto a string already reached — paths converge, the set grows slower than the moves.</span>
						{:else}
							<strong>No path has circled back yet</strong>
							<span>every legal move so far reached a string not seen before.</span>
						{/if}
					</li>
					<li class="observation">
						<strong>{boundFact}</strong>
						<span>
							{#if reachabilityGraph.truncatedBy !== null}
								The search stopped at a bound, not at the edge of the reachable set.
							{:else}
								No further strings are reachable from here.
							{/if}
						</span>
					</li>
					<li class="observation observation--absence">
						<strong>{muReached ? 'MU is present in this region.' : `MU is not among the ${summary.nodeCount} strings reached.`}</strong>
						<span>
							{#if muReached}
								MU appears in the explored region.
							{:else}
								Absence in a bounded region is a fact about this search, not a verdict on MU —
								a finite map cannot show that no path anywhere reaches it.
							{/if}
						</span>
					</li>
				</ul>
			</SurfacePanel>

			{#if showProveBridge}
				<div class="prove-bridge" data-level="meta">
					<span class="prove-bridge__glyph" aria-hidden="true">{metaPresentation.glyph}</span>
					<div class="prove-bridge__body">
						<p class="prove-bridge__eyebrow">{metaPresentation.label}</p>
						<p class="prove-bridge__text">
							You hit a search bound and MU never appeared. Whether MU is reachable
							<em>at all</em> is a question this map cannot settle. To answer it you have to
							step outside the system and reason about every string at once.
						</p>
						<button class="button button--ghost button--sm prove-bridge__action" type="button" onclick={onBridgeToProve}>
							Go to Prove
						</button>
					</div>
				</div>
			{/if}
		{/snippet}
	</LabDesk>
</div>
