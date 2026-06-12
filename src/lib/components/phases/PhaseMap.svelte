<script lang="ts">
	import ELK from 'elkjs/lib/elk.bundled.js';
	import { enumerateMiuMoves, isDeadBranch, type DerivationTrace } from '$lib/miu/core';
	import {
		graphNodeExists,
		nodeIdFor,
		summarizeReachabilityGraph,
		traceGraphPath,
		type ProvenanceStep,
		type ReachabilityGraph
	} from '$lib/miu/graph';
	import {
		LAYER_DRAW_LIMIT,
		buildElkGraph,
		describeActiveBound,
		fanForString,
		mapLayerProfile
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

	/* The drawing stops at the legibility horizon (layers of more than
	 * LAYER_DRAW_LIMIT strings collapse into counted bands); only the drawn
	 * region is laid out. */
	const profile = $derived(mapLayerProfile(reachabilityGraph));
	const drawnGraph = $derived.by(() => {
		const horizon = profile.drawnDepthLimit;
		const nodes = reachabilityGraph.nodes.filter((node) => node.depth <= horizon);
		const ids = new Set(nodes.map((node) => node.id));

		return {
			...reachabilityGraph,
			nodes,
			edges: reachabilityGraph.edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to))
		};
	});
	const bands = $derived(profile.layers.filter((layer) => !layer.drawn));
	const muDepth = $derived(
		reachabilityGraph.nodes.find((node) => node.value === 'MU')?.depth ?? null
	);

	/* Draw-a-fan-on-demand inside a counted band: the page can always afford
	 * one string's neighborhood, even where it cannot draw the layer. */
	let fanDepth = $state<number | null>(null);
	let fanSource = $state<string>('');

	const fanSources = $derived.by(() => {
		const depth = fanDepth;

		if (depth === null) {
			return [];
		}

		return reachabilityGraph.nodes
			.filter((node) => node.depth === depth - 1)
			.map((node) => node.value);
	});
	const fan = $derived(
		fanDepth !== null && fanSource ? fanForString(reachabilityGraph, fanSource) : []
	);

	function toggleFan(depth: number) {
		if (fanDepth === depth) {
			fanDepth = null;
			fanSource = '';
			return;
		}

		fanDepth = depth;
		const sources = reachabilityGraph.nodes.filter((node) => node.depth === depth - 1);
		// Default to the busiest source — the fan with the most to show.
		fanSource = sources.reduce(
			(best, node) =>
				enumerateMiuMoves(node.value).length > enumerateMiuMoves(best).length ? node.value : best,
			sources[0]?.value ?? ''
		);
	}

	/* The learner's own derivation, mapped onto the drawing: the zoom-out from
	 * Explore made literal. Solid ink through the dashed computed search. */
	const learner = $derived(traceGraphPath(reachabilityGraph, trace));
	const learnerNodes = $derived(new Set(learner.nodeIds));
	const learnerEdges = $derived(new Set(learner.edgeIds));
	const currentValue = $derived(trace.steps[trace.currentIndex]?.value ?? 'MI');
	const currentInView = $derived(graphNodeExists(drawnGraph, nodeIdFor(currentValue)));

	/* Nodes reached again by a later move (an edge that does not increase
	 * depth) get the "reached twice ↩" mark. */
	const returnTargets = $derived.by(() => {
		const depths = new Map(drawnGraph.nodes.map((node) => [node.id, node.depth]));
		const targets = new Set<string>();

		for (const edge of drawnGraph.edges) {
			if ((depths.get(edge.to) ?? 0) <= (depths.get(edge.from) ?? 0)) {
				targets.add(edge.to);
			}
		}

		return targets;
	});
	const muReached = $derived(graphNodeExists(reachabilityGraph, nodeIdFor('MU')));
	const closedCount = $derived(
		reachabilityGraph.nodes.filter((node) => isDeadBranch(node.value)).length
	);

	// The bridge is a computed affordance: it appears only once the learner has
	// hit a search bound and MU is still absent from the explored region. It is
	// never gated on any LLM judgment, and it stays hidden while the search is
	// unbounded so the invariant still feels discovered rather than announced.
	const showProveBridge = $derived(reachabilityGraph.truncatedBy !== null && !muReached);

	/* ── Drawing geometry is owned by ELK (the layered/Sugiyama engine): node
	 * positions, polyline edge routes, and inline edge-label placement all
	 * come from the layout, so a label stays visually attached to ITS edge.
	 * We declare structure (buildElkGraph) and render the result in the
	 * worksheet's own SVG registers. Layout is async; the figure state
	 * updates when it resolves. */
	const PAD_LEFT = 16;
	const PAD_TOP = 44;
	const CHAR_W = 8.8;

	const frontier = $derived(reachabilityGraph.truncatedBy !== null);
	/* Stubs leave the last drawn layer whenever the territory continues —
	 * into the counted bands, or into the erased frontier when nothing is
	 * counted beyond the drawing. */
	const continueRight = $derived(bands.length > 0 || frontier);

	function nodeLabel(value: string): string {
		return ellipsizeMiddle(value, 24);
	}

	function labelWidth(value: string): number {
		return nodeLabel(value).length * CHAR_W;
	}

	function shortRule(ruleLabel: string): string {
		return ruleLabel.replace('Rule ', 'R');
	}

	interface PlacedLabel {
		text: string;
		x: number;
		y: number;
	}

	interface PlacedEdge {
		id: string;
		points: string;
		labels: PlacedLabel[];
		path: boolean;
		back: boolean;
	}

	interface PlacedNode {
		id: string;
		value: string;
		depth: number;
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface Drawing {
		width: number;
		height: number;
		nodes: PlacedNode[];
		edges: PlacedEdge[];
	}

	const elk = new ELK();
	let drawing = $state<Drawing | null>(null);

	$effect(() => {
		const valueOf = new Map(drawnGraph.nodes.map((node) => [node.id, node.value]));
		const depthOf = new Map(drawnGraph.nodes.map((node) => [node.id, node.depth]));
		const pathEdges = learnerEdges;
		const { root, edgeMeta } = buildElkGraph(
			drawnGraph,
			pathEdges,
			(value) => ({ width: labelWidth(value) + 4, height: 34 }),
			(text) => ({ width: text.length * 6.4 + 6, height: 12 })
		);

		let cancelled = false;

		void elk
			.layout(root as Parameters<typeof elk.layout>[0])
			.then((result) => {
				if (cancelled) {
					return;
				}

				type ElkResult = {
					width?: number;
					height?: number;
					children?: { id: string; x?: number; y?: number; width?: number; height?: number }[];
					edges?: {
						id: string;
						sections?: {
							startPoint: { x: number; y: number };
							endPoint: { x: number; y: number };
							bendPoints?: { x: number; y: number }[];
						}[];
						labels?: { text?: string; x?: number; y?: number }[];
					}[];
				};
				const placed = result as ElkResult;

				drawing = {
					width: placed.width ?? 0,
					height: placed.height ?? 0,
					nodes: (placed.children ?? []).map((child) => ({
						id: child.id,
						value: valueOf.get(child.id) ?? '',
						depth: depthOf.get(child.id) ?? 0,
						x: child.x ?? 0,
						y: child.y ?? 0,
						width: child.width ?? 0,
						height: child.height ?? 0
					})),
					edges: (placed.edges ?? []).map((edge) => {
						const section = edge.sections?.[0];
						const points = section
							? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
							: [];

						return {
							id: edge.id,
							points: points.map((point) => `${point.x},${point.y}`).join(' '),
							labels: (edge.labels ?? []).map((label) => ({
								text: label.text ?? '',
								x: label.x ?? 0,
								y: label.y ?? 0
							})),
							path: pathEdges.has(edge.id),
							back: edgeMeta.get(edge.id)?.back ?? false
						};
					})
				};
			});

		return () => {
			cancelled = true;
		};
	});

	const svgWidth = $derived(PAD_LEFT + (drawing?.width ?? 0) + (continueRight ? 110 : 30));
	const svgHeight = $derived(PAD_TOP + (drawing?.height ?? 0) + 12);
	const depthTicks = $derived.by(() => {
		if (!drawing) {
			return [];
		}

		const minX = new Map<number, number>();

		for (const node of drawing.nodes) {
			minX.set(node.depth, Math.min(minX.get(node.depth) ?? Infinity, node.x));
		}

		return [...minX.entries()].sort((left, right) => left[0] - right[0]).map(([depth, x]) => ({
			depth,
			x
		}));
	});
	const horizonNodes = $derived(
		drawing?.nodes.filter((node) => node.depth === profile.drawnDepthLimit) ?? []
	);

	function nodeKeydown(event: KeyboardEvent, nodeId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelectGraphNode(nodeId);
		}
	}

	const selectedNode = $derived(
		reachabilityGraph.nodes.find((node) => node.id === selectedGraphNodeId) ?? null
	);
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

		<!-- The figure renders at a fixed type scale and scrolls horizontally —
		     a bigger search must never shrink the strings. Layers past the
		     legibility horizon are not drawn at all: they stand to the right
		     as counted bands. -->
		<div class="map-scroll">
		<div class="map-figure">
		<svg
			class="map-tree"
			width={svgWidth}
			height={svgHeight}
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

			{#if drawing}
				<g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
					<!-- The bound suffix belongs to the last drawn column only when
					     nothing is counted beyond it — otherwise the bands carry it. -->
					{#each depthTicks as tick (tick.depth)}
						<text class="tree-tick" x={tick.x} y={-26}>
							DEPTH {tick.depth}{tick.depth !== profile.drawnDepthLimit || bands.length > 0
								? ''
								: reachabilityGraph.truncatedBy === 'depth'
									? ' — AT THE BOUND'
									: reachabilityGraph.truncatedBy === 'node-limit'
										? ' — CUT BY THE STRING LIMIT'
										: ''}
						</text>
					{/each}

					{#each drawing.edges as edge (edge.id)}
						<polyline
							class="tree-edge"
							class:tree-edge--path={edge.path}
							points={edge.points}
							marker-end={edge.path ? 'url(#map-arrow-ink)' : 'url(#map-arrow-gray)'}
						/>
						{#each edge.labels as label (label.text + label.x)}
							<text
								class="tree-edge-label"
								class:tree-edge-label--path={edge.path}
								x={label.x}
								y={label.y + 9}
							>
								{label.text}
							</text>
						{/each}
					{/each}

					{#if continueRight}
						{#each horizonNodes as node (node.id)}
							<line
								class="tree-stub"
								x1={node.x + node.width + 6}
								y1={node.y + 16}
								x2={node.x + node.width + 84}
								y2={node.y + 16}
							/>
						{/each}
					{/if}

					{#each drawing.nodes as node (node.id)}
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
							<text class="tree-node__value" x={node.x + 2} y={node.y + 20}>
								{nodeLabel(node.value)}
							</text>
							{#if node.id === selectedGraphNodeId}
								<line
									class="tree-node__underline"
									x1={node.x + 2}
									y1={node.y + 25}
									x2={node.x + 2 + labelWidth(node.value)}
									y2={node.y + 25}
								/>
							{/if}
							{#if node.id === reachabilityGraph.rootId}
								<text class="tree-again" x={node.x + 2} y={node.y + 33}>axiom</text>
							{:else if returnTargets.has(node.id)}
								<text class="tree-again" x={node.x + 2} y={node.y + 33}>reached twice ↩</text>
							{/if}
						</g>
					{/each}

					{#if frontier && bands.length === 0}
						<rect
							x={drawing.width + 18}
							y={-26}
							width="100"
							height={drawing.height + 38}
							fill="url(#map-erase)"
							pointer-events="none"
						/>
					{/if}
				</g>
			{/if}
		</svg>

		{#if bands.length > 0}
			<div class="map-bands">
				{#each bands as layer (layer.depth)}
					<div class="map-band">
						<span class="map-band__tick">
							Depth {layer.depth}{layer.depth === profile.layers.length - 1 &&
							reachabilityGraph.truncatedBy === 'node-limit'
								? ' — cut'
								: ''}
						</span>
						<span class="map-band__count">+{layer.count} <small>strings</small></span>
						<p class="map-band__fact">
							<strong>{layer.reconvergences}</strong>
							circle{layer.reconvergences === 1 ? 's' : ''} back{#if layer.deadChainCount > 0}{' '}·
								<strong>{layer.deadChainCount}</strong> in dead chains{/if}
						</p>
						<p class="map-band__fact">
							{muDepth === layer.depth ? 'MU appears in this layer' : 'MU absent'}
						</p>

						{#if fanDepth === layer.depth}
							<div class="map-fan">
								<select
									class="map-bound map-fan__source"
									aria-label="String whose fan to draw"
									value={fanSource}
									onchange={(event) => (fanSource = (event.target as HTMLSelectElement).value)}
								>
									{#each fanSources as source (source)}
										<option value={source}>{ellipsizeMiddle(source, 18)}</option>
									{/each}
								</select>
								{#each fan as group (group.ruleLabel)}
									<p class="map-fan__group">
										<span class="query__via"
											>·{group.ruleLabel}{group.results.length > 1
												? ` ×${group.results.length}`
												: ''}·</span
										>
										{#each group.results as result, index (result.value)}{index > 0
												? ' · '
												: ' '}{ellipsizeMiddle(result.value, 18)}{result.known
												? ''
												: ' *'}{/each}
									</p>
								{/each}
								{#if fan.some((group) => group.results.some((result) => !result.known))}
									<p class="map-fan__note">* not yet reached by this search</p>
								{/if}
							</div>
						{/if}

						<button class="map-band__expand" type="button" onclick={() => toggleFan(layer.depth)}>
							{fanDepth === layer.depth ? '▾ close the fan' : "▸ draw a string's fan…"}
						</button>
					</div>
				{/each}
			</div>
		{/if}
		</div>
		</div>

		{#if bands.length > 0}
			<p class="map-horizon">
				<strong>The page draws a layer while it fits — {LAYER_DRAW_LIMIT} strings or fewer.</strong>
				Beyond that it can only count. The territory keeps going either way.
			</p>
		{/if}

		<p class="map-legend">
			{#if learner.nodeIds.length > 1}
				<span class="map-legend__solid">──</span> your derivation, drawn solid ·
				<span class="map-legend__dashed">┄┄</span> the computed search{currentInView
					? ''
					: ' — your current string lies beyond the drawn layers'}
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

		<div class="map-growth">
			<p class="worksheet__label">Strings per depth — computed</p>
			<div class="map-growth__bars">
				{#each profile.layers as layer (layer.depth)}
					<div class="map-gbar" class:map-gbar--counted={!layer.drawn}>
						<span class="map-gbar__count">{layer.count}</span>
						<div
							class="map-gbar__rect"
							style:height={`${Math.max(3, Math.round((110 * layer.count) / Math.max(...profile.layers.map((l) => l.count))))}px`}
						></div>
						<span class="map-gbar__tick">
							{layer.depth}{layer.depth === profile.layers.length - 1 &&
							reachabilityGraph.truncatedBy === 'node-limit'
								? ' · cut'
								: ''}
						</span>
					</div>
				{/each}
			</div>
			<p class="map-caption">
				<strong>
					{profile.nodeCount} strings reached; {profile.recordedMoves} rule applications recorded.
				</strong>
				{#if profile.totalReconvergences > 0}
					{profile.totalReconvergences} landed on strings already seen — the set grows slower than
					the moves{bands.length > 0
						? `, and still outruns the page by depth ${bands[0]!.depth}`
						: ''}.
				{:else}
					No move has landed on an already-seen string yet.
				{/if}
			</p>
		</div>

		<div class="map-captions">
			<p class="worksheet__label">What the search shows — computed</p>
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
