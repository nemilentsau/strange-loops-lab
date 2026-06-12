<script lang="ts">
	import { isDeadBranch, type DerivationTrace } from '$lib/miu/core';
	import {
		graphNodeExists,
		nodeIdFor,
		summarizeReachabilityGraph,
		traceGraphPath,
		type ProvenanceStep,
		type ReachabilityEdge,
		type ReachabilityGraph
	} from '$lib/miu/graph';
	import {
		describeActiveBound,
		layoutReachabilityGraph,
		type MapLayoutNode
	} from '$lib/state/module1Map';
	import {
		GRAPH_DEPTH_OPTIONS,
		GRAPH_NODE_LIMIT_OPTIONS,
		PHASE_META,
		LEVEL_PRESENTATION,
		ellipsizeMiddle
	} from '$lib/state/module1';

	let {
		reachabilityGraph,
		trace,
		selectedGraphNodeId,
		selectedGraphPath,
		graphDepth,
		graphNodeLimit,
		onUpdateGraphDepth,
		onUpdateGraphNodeLimit,
		onSelectGraphNode,
		onBridgeToProve
	}: {
		reachabilityGraph: ReachabilityGraph;
		trace: DerivationTrace;
		selectedGraphNodeId: string;
		selectedGraphPath: ProvenanceStep[];
		graphDepth: number;
		graphNodeLimit: number;
		onUpdateGraphDepth: (event: Event) => void;
		onUpdateGraphNodeLimit: (event: Event) => void;
		onSelectGraphNode: (nodeId: string) => void;
		onBridgeToProve: () => void;
	} = $props();

	const level = PHASE_META.map.level;
	const levelPresentation = LEVEL_PRESENTATION[level];
	const metaPresentation = LEVEL_PRESENTATION.meta;

	const summary = $derived(summarizeReachabilityGraph(reachabilityGraph));
	const layout = $derived(layoutReachabilityGraph(reachabilityGraph));
	const nodeById = $derived(new Map(layout.nodes.map((node) => [node.id, node])));

	/* The learner's own derivation, mapped onto the drawing: the zoom-out from
	 * Explore made literal. Solid ink through the dashed computed search. */
	const learner = $derived(traceGraphPath(reachabilityGraph, trace));
	const learnerNodes = $derived(new Set(learner.nodeIds));
	const learnerEdges = $derived(new Set(learner.edgeIds));
	const currentValue = $derived(trace.steps[trace.currentIndex]?.value ?? 'MI');
	const currentInView = $derived(graphNodeExists(reachabilityGraph, nodeIdFor(currentValue)));

	const returnTargets = $derived(new Set(layout.returnEdges.map((edge) => edge.to)));
	const muReached = $derived(graphNodeExists(reachabilityGraph, nodeIdFor('MU')));
	const closedCount = $derived(
		reachabilityGraph.nodes.filter((node) => isDeadBranch(node.value)).length
	);

	// The bridge is a computed affordance: it appears only once the learner has
	// hit a search bound and MU is still absent from the explored region. It is
	// never gated on any LLM judgment, and it stays hidden while the search is
	// unbounded so the invariant still feels discovered rather than announced.
	const showProveBridge = $derived(reachabilityGraph.truncatedBy !== null && !muReached);

	/* ── Drawing geometry. Rows and columns come from the pure layout; only
	 * scaling lives here. Labels are middle-ellipsized; the full string of the
	 * selected node is written under the tree. */
	const PAD_LEFT = 16;
	const PAD_TOP = 44;
	const ROW_H = 46;
	const COL_W = 230;
	const CHAR_W = 7.8;

	const frontier = $derived(reachabilityGraph.truncatedBy !== null);
	const svgWidth = $derived(PAD_LEFT + layout.depthCount * COL_W + (frontier ? 130 : 40));
	const svgHeight = $derived(PAD_TOP + layout.rowCount * ROW_H + 8);
	const deepestNodes = $derived(layout.nodes.filter((node) => node.depth === layout.depthCount - 1));

	function nodeLabel(value: string): string {
		return ellipsizeMiddle(value, 24);
	}

	function labelWidth(value: string): number {
		return nodeLabel(value).length * CHAR_W;
	}

	function nx(node: MapLayoutNode): number {
		return PAD_LEFT + node.depth * COL_W;
	}

	function ny(node: MapLayoutNode): number {
		return PAD_TOP + node.row * ROW_H + 14;
	}

	interface EdgeLine {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}

	function edgeLine(edge: ReachabilityEdge): EdgeLine | null {
		const from = nodeById.get(edge.from);
		const to = nodeById.get(edge.to);

		if (!from || !to) {
			return null;
		}

		return {
			x1: nx(from) + labelWidth(from.value) + 8,
			y1: ny(from) - 4,
			x2: nx(to) - 8,
			y2: ny(to) - 4
		};
	}

	/* A reconvergence edge runs back into the tree: drawn as a curve from the
	 * top of its source to the right edge of its (already-discovered) target. */
	function returnCurve(edge: ReachabilityEdge): { d: string; lx: number; ly: number } | null {
		const from = nodeById.get(edge.from);
		const to = nodeById.get(edge.to);

		if (!from || !to) {
			return null;
		}

		const x1 = nx(from) + labelWidth(from.value) / 2;
		const y1 = ny(from) - 16;
		const x2 = nx(to) + labelWidth(to.value) + 10;
		const y2 = ny(to) - 4;
		const cx = (x1 + x2) / 2;
		const cy = Math.min(y1, y2) - 44;

		return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, lx: cx, ly: cy + 14 };
	}

	function shortRule(ruleLabel: string): string {
		return ruleLabel.replace('Rule ', 'R');
	}

	function nodeKeydown(event: KeyboardEvent, nodeId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelectGraphNode(nodeId);
		}
	}

	const selectedNode = $derived(nodeById.get(selectedGraphNodeId) ?? null);
	/* Which bound actually governs the search — without this, the slack
	 * control appears dead (raising depth past a binding node limit changes
	 * nothing on screen). */
	const activeBound = $derived(describeActiveBound(reachabilityGraph, summary.deepestDepth));

	const boundCaption = $derived(
		reachabilityGraph.truncatedBy === 'depth'
			? `Bound hit: depth ${summary.maxDepth}. The drawing fades where the search stopped — at a bound, not at the edge of the reachable set.`
			: reachabilityGraph.truncatedBy === 'node-limit'
				? `Bound hit: node limit (${summary.maxNodes}). The search was cut before exhausting the depth bound.`
				: 'No bound hit — this region is fully enumerated; no further strings are reachable from it.'
	);
</script>

<div class="phase-canvas phase-canvas--{level} phase-map">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<div class="map-sheet">
		<div class="map-head">
			<p class="worksheet__label">The derivation tree — every legal move from MI</p>
			<p class="map-bounds">
				searched to depth
				<select
					class="map-bound"
					aria-label="Maximum search depth"
					value={graphDepth}
					onchange={onUpdateGraphDepth}
				>
					{#each GRAPH_DEPTH_OPTIONS as option (option)}
						<option value={option}>{option}</option>
					{/each}
				</select>
				· at most
				<select
					class="map-bound"
					aria-label="Maximum strings searched"
					value={graphNodeLimit}
					onchange={onUpdateGraphNodeLimit}
				>
					{#each GRAPH_NODE_LIMIT_OPTIONS as option (option)}
						<option value={option}>{option}</option>
					{/each}
				</select>
				strings
			</p>
		</div>

		<p class="map-bound-note"><strong>{activeBound.lead}</strong>{activeBound.detail}</p>

		<svg
			class="map-tree"
			viewBox="0 0 {svgWidth} {svgHeight}"
			role="img"
			aria-label={`The derivation tree from MI: ${summary.nodeCount} strings within depth ${summary.maxDepth}. Your derivation is drawn solid; reconvergence edges curve back into the tree; the drawing fades at the search bound.`}
		>
			<defs>
				<marker id="map-arrow-ink" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
					<path d="M0,0.5 L7.5,4 L0,7.5" fill="none" stroke="currentColor" stroke-width="1.6" class="map-marker-ink" />
				</marker>
				<marker id="map-arrow-gray" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
					<path d="M0,0.5 L7.5,4 L0,7.5" fill="none" stroke-width="1.4" class="map-marker-gray" />
				</marker>
				<linearGradient id="map-erase" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stop-color="var(--panel)" stop-opacity="0" />
					<stop offset="0.6" stop-color="var(--panel)" stop-opacity="0.92" />
					<stop offset="1" stop-color="var(--panel)" stop-opacity="1" />
				</linearGradient>
			</defs>

			{#each Array.from({ length: layout.depthCount }) as _, depth (depth)}
				<text class="tree-tick" x={PAD_LEFT + depth * COL_W} y="18">
					DEPTH {depth}{depth !== layout.depthCount - 1
						? ''
						: reachabilityGraph.truncatedBy === 'depth'
							? ' — AT THE BOUND'
							: reachabilityGraph.truncatedBy === 'node-limit'
								? ' — CUT BY THE STRING LIMIT'
								: ''}
				</text>
			{/each}

			{#each layout.treeEdges as edge (edge.id)}
				{@const line = edgeLine(edge)}
				{#if line}
					<line
						class="tree-edge"
						class:tree-edge--path={learnerEdges.has(edge.id)}
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						marker-end={learnerEdges.has(edge.id) ? 'url(#map-arrow-ink)' : 'url(#map-arrow-gray)'}
					/>
					<text
						class="tree-edge-label"
						class:tree-edge-label--path={learnerEdges.has(edge.id)}
						x={(line.x1 + line.x2) / 2}
						y={(line.y1 + line.y2) / 2 - 5}
					>
						{shortRule(edge.move.ruleLabel)}
					</text>
				{/if}
			{/each}

			{#each layout.returnEdges as edge (edge.id)}
				{@const curve = returnCurve(edge)}
				{#if curve}
					<path
						class="tree-edge tree-return"
						class:tree-edge--path={learnerEdges.has(edge.id)}
						d={curve.d}
						marker-end={learnerEdges.has(edge.id) ? 'url(#map-arrow-ink)' : 'url(#map-arrow-gray)'}
					/>
					<text class="tree-edge-label" x={curve.lx} y={curve.ly}>
						{shortRule(edge.move.ruleLabel)} · circles back
					</text>
				{/if}
			{/each}

			{#if frontier}
				{#each deepestNodes as node (node.id)}
					<line
						class="tree-stub"
						x1={nx(node) + labelWidth(node.value) + 8}
						y1={ny(node) - 6}
						x2={nx(node) + labelWidth(node.value) + 95}
						y2={ny(node) - 18}
					/>
					<line
						class="tree-stub"
						x1={nx(node) + labelWidth(node.value) + 8}
						y1={ny(node) - 2}
						x2={nx(node) + labelWidth(node.value) + 95}
						y2={ny(node) + 10}
					/>
				{/each}
			{/if}

			{#each layout.nodes as node (node.id)}
				<g
					class="tree-node"
					class:tree-node--path={learnerNodes.has(node.id)}
					class:tree-node--selected={node.id === selectedGraphNodeId}
					role="button"
					tabindex="0"
					aria-pressed={node.id === selectedGraphNodeId}
					aria-label={`${node.value}, depth ${node.depth}`}
					onclick={() => onSelectGraphNode(node.id)}
					onkeydown={(event) => nodeKeydown(event, node.id)}
				>
					<text class="tree-node__value" x={nx(node)} y={ny(node)}>{nodeLabel(node.value)}</text>
					{#if node.id === selectedGraphNodeId}
						<line
							class="tree-node__underline"
							x1={nx(node)}
							y1={ny(node) + 4}
							x2={nx(node) + labelWidth(node.value)}
							y2={ny(node) + 4}
						/>
					{/if}
					{#if node.id === reachabilityGraph.rootId}
						<text class="tree-again" x={nx(node)} y={ny(node) + 14}>axiom</text>
					{:else if returnTargets.has(node.id)}
						<text class="tree-again" x={nx(node)} y={ny(node) + 14}>reached twice ↩</text>
					{/if}
				</g>
			{/each}

			{#if frontier}
				<rect
					x={svgWidth - 140}
					y="26"
					width="140"
					height={svgHeight - 26}
					fill="url(#map-erase)"
					pointer-events="none"
				/>
			{/if}
		</svg>

		<p class="map-legend">
			{#if learner.nodeIds.length > 1}
				<span class="map-legend__solid">──</span> your derivation, drawn solid ·
				<span class="map-legend__dashed">┄┄</span> the computed search{currentInView
					? ''
					: ' — your current string lies beyond this bound'}
			{:else}
				<span class="map-legend__dashed">┄┄</span> the computed search — make moves in Explore
				and your derivation draws solid here
			{/if}
		</p>

		{#if selectedNode}
			<p class="map-route">
				<span class="map-route__value">{selectedNode.value}</span>
				{#if selectedGraphPath.length > 1}
					— shortest route: {#each selectedGraphPath as step, index (step.nodeId)}{#if index > 0}{' '}<span
								class="query__via">·{shortRule(step.via!.ruleLabel)}·</span
							>{' '}{/if}{ellipsizeMiddle(step.value)}{/each}
				{:else}
					— the axiom; every derivation starts here.
				{/if}
			</p>
		{/if}

		<div class="map-captions">
			<p class="worksheet__label">What the search shows — computed</p>
			<p class="map-caption">
				<strong>{summary.nodeCount} strings reached</strong>
				within depth {summary.maxDepth}{#if summary.frontierGrowth !== null}; depth {summary.deepestDepth}
					{#if summary.frontierGrowth > 0}adds {summary.frontierGrowth} more than depth {summary.deepestDepth - 1}{:else if summary.frontierGrowth === 0}matched the count at depth {summary.deepestDepth - 1}{:else}was cut off by the bound before completing{/if}{/if}.
			</p>
			<p class="map-caption">
				{#if summary.repeatedDiscoveryCount > 0}
					<strong>
						{summary.repeatedDiscoveryCount} rule application{summary.repeatedDiscoveryCount === 1
							? ''
							: 's'} circled back
					</strong>
					onto a string already reached — paths converge; the set grows slower than the moves.
				{:else}
					<strong>No path has circled back yet</strong> — every legal move so far reached a new string.
				{/if}
			</p>
			<p class="map-caption"><strong>{boundCaption.split('.')[0]}.</strong>{boundCaption.slice(boundCaption.indexOf('.') + 1)}</p>
			{#if closedCount > 0}
				<p class="map-caption">
					<strong>{closedCount} of these strings {closedCount === 1 ? 'is a one-way door' : 'are one-way doors'}</strong>
					— from {closedCount === 1 ? 'it' : 'them'}, only R2 ever applies again. They draw as bare chains.
				</p>
			{/if}
			<p class="map-caption">
				<strong>
					{muReached ? 'MU is present in this region.' : `MU is not among the ${summary.nodeCount} strings reached.`}
				</strong>
				{#if !muReached}
					Absence in a bounded region is a fact about this search, not a verdict on MU — a finite
					map cannot show that no path anywhere reaches it.
				{/if}
			</p>
		</div>
	</div>

	{#if showProveBridge}
		<div class="prove-bridge" data-level="meta">
			<span class="prove-bridge__glyph" aria-hidden="true">{metaPresentation.glyph}</span>
			<div class="prove-bridge__body">
				<p class="prove-bridge__eyebrow">{metaPresentation.label}</p>
				<p class="prove-bridge__text">
					You hit a search bound and MU never appeared. Whether MU is reachable
					<em>at all</em> is a question this map cannot settle. To answer it you have to step
					outside the system and reason about every string at once.
				</p>
				<button class="button button--ghost button--sm prove-bridge__action" type="button" onclick={onBridgeToProve}>
					Go to Prove
				</button>
			</div>
		</div>
	{/if}
</div>
