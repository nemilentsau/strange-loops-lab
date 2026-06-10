<script lang="ts">
	import { browser } from '$app/environment';
	import CommandBar from '$lib/components/CommandBar.svelte';
	import PhaseExplore from '$lib/components/phases/PhaseExplore.svelte';
	import PhaseMap from '$lib/components/phases/PhaseMap.svelte';
	import PhaseProve from '$lib/components/phases/PhaseProve.svelte';
	import PhaseReflect from '$lib/components/phases/PhaseReflect.svelte';
	import type { ModuleSummary } from '$lib/content/modules';
	import {
		analyzeMiuProposal,
		applyMoveToTrace,
		enumerateMiuMoves,
		jumpToTraceStep,
		restartTrace,
		stepBackTrace,
		type MiuMove
	} from '$lib/miu/core';
	import {
		analyzeInvariantCandidate,
		builtInInvariantAnalysis
	} from '$lib/miu/invariants';
	import {
		buildReachabilityGraph,
		graphNodeExists,
		tracePathToNode,
		type ReachabilityGraph
	} from '$lib/miu/graph';
	import {
		PHASE_SURFACES,
		createModule1Draft,
		pickNewestDraft,
		readModule1Draft,
		restoreModule1Artifact,
		writeModule1Draft,
		type LabPhase,
		type Module1Artifact,
		type Module1Draft,
		type SurfaceId
	} from '$lib/state/module1';
	import {
		buildInvariantArtifact,
		buildNoteArtifact,
		buildProofArtifact,
		buildTraceArtifact,
		type ArtifactBlueprint
	} from '$lib/state/module1Artifacts';
	import {
		createArtifact,
		listArtifacts,
		loadSnapshot,
		runDialogue as runDialogueApi,
		saveSnapshot
	} from '$lib/client/module1Api';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const module = $derived(data.module as ModuleSummary);
	const reflectionPrompts = [
		{
			title: 'Why search fails',
			subtitle: 'Even infinite patience wouldn\'t help. Why?',
			text: 'Explain why exploring more derivations cannot by itself prove that MU is unreachable.',
			colorClass: 'reflection-prompt--rose'
		},
		{
			title: 'Weak step in the proof',
			subtitle: 'Which rule was hardest to check?',
			text: 'State the single rule you had to justify most carefully, and explain why it preserves the invariant.',
			colorClass: 'reflection-prompt--teal'
		},
		{
			title: 'Object vs meta',
			subtitle: 'Two different kinds of reasoning.',
			text: 'Describe the difference between applying an MIU rule and proving a fact about all MIU derivations.',
			colorClass: 'reflection-prompt--gold'
		}
	] as const;

	const timestampFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let lastEditedLabel = $state('No local edits yet');
	let snapshotStatus = $state('Your saved progress will appear here.');
	let artifactStatus = $state('Your saved work will appear here.');
	let savedArtifacts = $state<Module1Artifact[]>([]);
	let dialogueStatus = $state('Submit your explanation above to get coaching feedback.');
	let dialogueRunning = $state(false);
	let welcomeDismissed = $state(false);
	const isNewSession = $derived(
		draft.trace.steps.length <= 1 &&
		draft.visitedPhases.length <= 1 &&
		draft.visitedPhases[0] === 'explore'
	);
	const currentTraceStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentTraceStep.value);
	const iCount = $derived((currentString.match(/I/g) || []).length);
	const mod3Class = $derived(iCount % 3);
	const legalMoves = $derived(enumerateMiuMoves(currentString));
	const proposalAnalysis = $derived(
		draft.proposalInput.trim() ? analyzeMiuProposal(currentString, draft.proposalInput) : null
	);
	const uniqueReachableStates = $derived(
		Array.from(new Map(legalMoves.map((move) => [move.result, move])).values())
	);
	const reachabilityGraph = $derived(
		buildReachabilityGraph({
			maxDepth: draft.graphDepth,
			maxNodes: draft.graphNodeLimit
		})
	);
	const selectedGraphNodeId: string = $derived(
		graphNodeExists(reachabilityGraph, draft.selectedGraphNode)
			? (draft.selectedGraphNode as string)
			: reachabilityGraph.rootId
	);
	const selectedGraphNode = $derived(
		reachabilityGraph.nodes.find((node) => node.id === selectedGraphNodeId) ?? reachabilityGraph.nodes[0]!
	);
	const repeatedGraphNodeId = $derived(findRepeatedGraphNodeId(reachabilityGraph));
	const selectedGraphPath = $derived(tracePathToNode(reachabilityGraph, selectedGraphNodeId));
	const builtInInvariant = $derived(builtInInvariantAnalysis(currentString));
	const candidateInvariant = $derived(analyzeInvariantCandidate(draft.invariantCandidate, currentString));

	onMount(() => {
		if (module.slug !== 'module-1' || !browser) {
			return;
		}

		const localDraft = readModule1Draft(window.localStorage);
		draft = localDraft;
		hydrated = true;
		lastEditedLabel =
			draft.lastEditedAt === null
				? 'No local edits yet'
				: timestampFormatter.format(new Date(draft.lastEditedAt));
		void hydrateFromPersistence(localDraft);
	});

	$effect(() => {
		if (module.slug !== 'module-1' || !browser || !hydrated) {
			return;
		}

		writeModule1Draft(window.localStorage, draft);
		lastEditedLabel =
			draft.lastEditedAt === null
				? 'No local edits yet'
				: timestampFormatter.format(new Date(draft.lastEditedAt));
	});

	// The lab desk wants more room than the default 1280px shell. Widen the shell
	// for the Module 1 route only so the three rails breathe on large displays
	// (no effect at ≤1440px viewports, including the 1280 acceptance shot). The
	// class is removed on navigation away (effect cleanup).
	$effect(() => {
		if (!browser || module.slug !== 'module-1') {
			return;
		}

		document.body.classList.add('module1-wide');
		return () => document.body.classList.remove('module1-wide');
	});

	function patchDraft(next: Partial<Module1Draft>) {
		draft = {
			...draft,
			...next,
			lastEditedAt: new Date().toISOString()
		};
	}

	function selectPhase(phase: LabPhase) {
		const visitedPhases = draft.visitedPhases.includes(phase)
			? draft.visitedPhases
			: [...draft.visitedPhases, phase];
		const primarySurface = PHASE_SURFACES[phase][0];

		patchDraft({
			activePhase: phase,
			visitedPhases,
			activeSurface: primarySurface,
			visitedSurfaces: ensureVisited(primarySurface)
		});
	}

		function updateQuestion(event: Event) {
			const target = event.currentTarget as HTMLInputElement;
			patchDraft({ workingQuestion: target.value });
		}

		function updateProposalInput(event: Event) {
			const target = event.currentTarget as HTMLInputElement;
			patchDraft({
				activePhase: 'explore',
				activeSurface: 'sandbox',
				proposalInput: target.value,
				visitedSurfaces: ensureVisited('sandbox'),
				visitedPhases: ensureVisitedPhases('explore')
			});
		}

	function updateInvariant(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		patchDraft({
			activePhase: 'prove',
			activeSurface: 'invariants',
			invariantCandidate: target.value,
			visitedSurfaces: ensureVisited('invariants'),
			visitedPhases: ensureVisitedPhases('prove')
		});
	}

	function updateNotes(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		patchDraft({ notes: target.value });
	}

	function seedReflectionPrompt(prompt: string) {
		const seeded = draft.notes.trim()
			? `${draft.notes.trim()}\n\n${prompt}\n`
			: `${prompt}\n`;

		patchDraft({
			activePhase: 'reflect',
			activeSurface: 'artifacts',
			notes: seeded,
			visitedSurfaces: ensureVisited('artifacts'),
			visitedPhases: ensureVisitedPhases('reflect')
		});
	}

		function applyMove(move: MiuMove) {
		patchDraft({
			activePhase: 'explore',
			activeSurface: 'sandbox',
			trace: applyMoveToTrace(draft.trace, move),
			visitedSurfaces: ensureVisited('sandbox', 'trace'),
			visitedPhases: ensureVisitedPhases('explore')
			});
		}

		function applyProposalMatch(move: MiuMove) {
			applyMove(move);
		}

		function useExploreGuideTask(question: string, proposal?: string) {
			patchDraft({
				activePhase: 'explore',
				activeSurface: 'sandbox',
				workingQuestion: question,
				proposalInput: proposal ?? draft.proposalInput,
				visitedSurfaces: ensureVisited('sandbox', 'trace'),
				visitedPhases: ensureVisitedPhases('explore')
			});
		}

		function useMapGuideTask(question: string, nodeId?: string) {
			patchDraft({
				activePhase: 'map',
				activeSurface: 'graph',
				workingQuestion: question,
				selectedGraphNode: nodeId ?? draft.selectedGraphNode,
				visitedSurfaces: ensureVisited('graph'),
				visitedPhases: ensureVisitedPhases('map')
			});
		}

	function jumpToStep(index: number) {
		patchDraft({
			activePhase: 'explore',
			activeSurface: 'trace',
			trace: jumpToTraceStep(draft.trace, index),
			visitedSurfaces: ensureVisited('trace'),
			visitedPhases: ensureVisitedPhases('explore')
		});
	}

	function undoMove() {
		patchDraft({
			activePhase: 'explore',
			activeSurface: 'trace',
			trace: stepBackTrace(draft.trace),
			visitedSurfaces: ensureVisited('trace'),
			visitedPhases: ensureVisitedPhases('explore')
		});
	}

	function restartFromInitial() {
		patchDraft({
			activePhase: 'explore',
			activeSurface: 'sandbox',
			trace: restartTrace(draft.trace),
			visitedSurfaces: ensureVisited('sandbox', 'trace'),
			visitedPhases: ensureVisitedPhases('explore')
		});
	}

	function ensureVisited(...surfaces: SurfaceId[]): SurfaceId[] {
		return Array.from(new Set([...draft.visitedSurfaces, ...surfaces]));
	}

	function ensureVisitedPhases(...phases: LabPhase[]): LabPhase[] {
		return Array.from(new Set([...draft.visitedPhases, ...phases]));
	}

	function updateGraphDepth(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		patchDraft({
			activePhase: 'map',
			activeSurface: 'graph',
			graphDepth: Number(target.value),
			visitedSurfaces: ensureVisited('graph'),
			visitedPhases: ensureVisitedPhases('map')
		});
	}

	function updateGraphNodeLimit(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		patchDraft({
			activePhase: 'map',
			activeSurface: 'graph',
			graphNodeLimit: Number(target.value),
			visitedSurfaces: ensureVisited('graph'),
			visitedPhases: ensureVisitedPhases('map')
		});
	}

	function selectGraphNode(nodeId: string) {
		patchDraft({
			activePhase: 'map',
			activeSurface: 'graph',
			selectedGraphNode: nodeId,
			visitedSurfaces: ensureVisited('graph'),
			visitedPhases: ensureVisitedPhases('map')
		});
	}

	function applyBuiltInInvariant() {
		patchDraft({
			activePhase: 'prove',
			activeSurface: 'invariants',
			invariantCandidate: 'count(I) mod 3 != 0',
			visitedSurfaces: ensureVisited('invariants'),
			visitedPhases: ensureVisitedPhases('prove')
		});
	}

	async function hydrateFromPersistence(localDraft: Module1Draft) {
		const [snapshotResult, artifactsResult] = await Promise.all([
			loadSnapshot(fetch, module.slug),
			listArtifacts(fetch, module.slug)
		]);

		if (!snapshotResult.ok && snapshotResult.reason === 'network') {
			snapshotStatus = 'Saving is unavailable in this session.';
			artifactStatus = 'Saving is unavailable in this session.';
			return;
		}

		if (snapshotResult.ok) {
			const remoteDraft = snapshotResult.draft;

			if (remoteDraft) {
				const chosenDraft = pickNewestDraft(localDraft, remoteDraft);
				draft = chosenDraft;
				snapshotStatus =
					chosenDraft === remoteDraft
						? `Loaded saved progress from ${formatTimestamp(snapshotResult.updatedAt)}.`
						: 'Kept newer local draft.';
			} else {
				snapshotStatus = 'Your saved progress will appear here.';
			}
		} else {
			snapshotStatus = 'Could not load saved progress.';
		}

		if (!artifactsResult.ok && artifactsResult.reason === 'network') {
			snapshotStatus = 'Saving is unavailable in this session.';
			artifactStatus = 'Saving is unavailable in this session.';
			return;
		}

		if (artifactsResult.ok) {
			savedArtifacts = artifactsResult.artifacts;
			artifactStatus =
				savedArtifacts.length > 0
					? `Loaded ${savedArtifacts.length} saved artifact${savedArtifacts.length === 1 ? '' : 's'}.`
					: 'Your saved work will appear here.';
		} else {
			artifactStatus = 'Could not load saved work.';
		}
	}

	async function saveSnapshotToDatabase() {
		const result = await saveSnapshot(fetch, module.slug, draft);

		if (!result.ok) {
			snapshotStatus = 'Failed to save progress.';
			return;
		}

		snapshotStatus = `Progress saved at ${formatTimestamp(result.updatedAt)}.`;
	}

	async function saveNoteArtifact() {
		if (!draft.notes.trim()) {
			artifactStatus = 'Add a note before saving a note artifact.';
			return;
		}

		const blueprint = buildNoteArtifact(draft.notes, currentString, draft.lastEditedAt);
		await saveArtifactBlueprint(blueprint);
	}

	async function saveTraceArtifact() {
		const blueprint = buildTraceArtifact(draft.trace, currentString);
		await saveArtifactBlueprint(blueprint);
	}

	async function saveInvariantArtifact() {
		if (candidateInvariant.kind !== 'supported') {
			artifactStatus = 'Use a supported invariant candidate before saving an invariant artifact.';
			return;
		}

		const blueprint = buildInvariantArtifact(
			currentString,
			draft.workingQuestion,
			draft.trace,
			candidateInvariant,
			builtInInvariant
		);
		await saveArtifactBlueprint(blueprint);
	}

	async function saveProofArtifact() {
		const blueprint = buildProofArtifact(
			currentString,
			draft.workingQuestion,
			draft.trace,
			candidateInvariant,
			draft.notes,
			draft.invariantCandidate
		);
		await saveArtifactBlueprint(blueprint);
	}

	async function saveArtifactBlueprint(blueprint: ArtifactBlueprint) {
		const result = await createArtifact(fetch, module.slug, blueprint.artifactType, blueprint.title, blueprint.payload);

		if (!result.ok) {
			artifactStatus =
				result.reason === 'network'
					? `Saving ${blueprint.artifactType} artifact failed.`
					: `Failed to save ${blueprint.artifactType} artifact.`;
			return;
		}

		const artifact = result.artifact;

		if (!artifact) {
			artifactStatus = `Saved ${blueprint.artifactType} artifact, but the response payload was malformed.`;
			return;
		}

		savedArtifacts = [artifact, ...savedArtifacts];
		artifactStatus = `Saved ${blueprint.artifactType} artifact at ${formatTimestamp(artifact.createdAt)}.`;
	}

	function restoreArtifact(artifact: Module1Artifact) {
		const restored = restoreModule1Artifact(draft, artifact);
		artifactStatus = restored.status;

		if (!restored.ok) {
			return;
		}

		draft = restored.draft;
	}

	function formatTimestamp(value: string | null): string {
		return value ? timestampFormatter.format(new Date(value)) : 'an unknown time';
	}

	function resetSession() {
		const fresh = createModule1Draft();
		draft = { ...fresh, lastEditedAt: new Date().toISOString() };
		writeModule1Draft(window.localStorage, draft);
		snapshotStatus = 'Session reset. Saved progress unchanged.';
		artifactStatus = 'Session reset. Saved artifacts still available.';
		dialogueStatus = 'Submit your explanation above to get coaching feedback.';
		lastEditedLabel = timestampFormatter.format(new Date());
	}

	function updateDialogueInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		patchDraft({
			activePhase: 'reflect',
			activeSurface: 'dialogue',
			dialogueInput: target.value,
			visitedSurfaces: ensureVisited('dialogue'),
			visitedPhases: ensureVisitedPhases('reflect')
		});
	}

	function populateDialogueSuggestion(text: string) {
		patchDraft({
			activePhase: 'reflect',
			activeSurface: 'dialogue',
			dialogueInput: text,
			visitedSurfaces: ensureVisited('dialogue'),
			visitedPhases: ensureVisitedPhases('reflect')
		});
	}

	async function runDialogue() {
		const userInput = draft.dialogueInput.trim();

		if (!userInput) {
			dialogueStatus = 'Enter an explanation or question before running dialogue mode.';
			return;
		}

		dialogueRunning = true;
		dialogueStatus = 'Getting coaching feedback...';

		try {
			const result = await runDialogueApi(fetch, module.slug, userInput, draft);

			if (!result.ok) {
				dialogueStatus = result.error;
				return;
			}

			patchDraft({
				activePhase: 'reflect',
				activeSurface: 'dialogue',
				lastDialogue: result.dialogue,
				visitedSurfaces: ensureVisited('dialogue', 'artifacts'),
				visitedPhases: ensureVisitedPhases('reflect')
			});

			if (result.artifact) {
				savedArtifacts = [result.artifact, ...savedArtifacts];
			}

			dialogueStatus = result.dialogue.costUsd
				? `Feedback received. Cost: $${result.dialogue.costUsd.toFixed(4)}.`
				: 'Feedback received.';
			artifactStatus = result.artifact
				? `Saved dialogue artifact at ${formatTimestamp(result.artifact.createdAt)}.`
				: artifactStatus;
		} finally {
			dialogueRunning = false;
		}
	}

		function findRepeatedGraphNodeId(graph: ReachabilityGraph): string | null {
			const incomingCounts = new Map<string, number>();
			for (const edge of graph.edges) {
				incomingCounts.set(edge.to, (incomingCounts.get(edge.to) ?? 0) + 1);
			}
			for (const node of graph.nodes) {
				if ((incomingCounts.get(node.id) ?? 0) > 1) {
					return node.id;
				}
			}
			return null;
		}
	</script>

<svelte:head>
	<title>Strange Loops Lab | {module.title}</title>
</svelte:head>

{#if module.slug === 'module-1'}
	<CommandBar
		{currentString}
		stepCount={draft.trace.currentIndex}
		{iCount}
		{mod3Class}
		activePhase={draft.activePhase}
		visitedPhases={draft.visitedPhases}
		{lastEditedLabel}
		onSelectPhase={selectPhase}
		onReset={resetSession}
	/>

	<section class="module-phases">
		{#if draft.activePhase === 'explore'}
			<div class="phase-content" data-phase="explore">
					<PhaseExplore
						{currentString}
						{legalMoves}
						proposalInput={draft.proposalInput}
						{proposalAnalysis}
						{uniqueReachableStates}
						trace={draft.trace}
						workingQuestion={draft.workingQuestion}
						{isNewSession}
						{welcomeDismissed}
						onApplyMove={applyMove}
						onApplyProposalMatch={applyProposalMatch}
						onJumpToStep={jumpToStep}
						onUndo={undoMove}
						onRestart={restartFromInitial}
						onUpdateProposal={updateProposalInput}
						onUpdateQuestion={updateQuestion}
						onDismissWelcome={() => { welcomeDismissed = true; }}
						onUseGuideTask={useExploreGuideTask}
					/>
				</div>
			{:else if draft.activePhase === 'map'}
			<div class="phase-content" data-phase="map">
				<PhaseMap
					{reachabilityGraph}
					{selectedGraphNodeId}
						{selectedGraphNode}
						{selectedGraphPath}
						{repeatedGraphNodeId}
						graphDepth={draft.graphDepth}
						graphNodeLimit={draft.graphNodeLimit}
						workingQuestion={draft.workingQuestion}
						onUpdateGraphDepth={updateGraphDepth}
						onUpdateGraphNodeLimit={updateGraphNodeLimit}
						onSelectGraphNode={selectGraphNode}
						onUpdateQuestion={updateQuestion}
						onUseGuideTask={useMapGuideTask}
						onBridgeToProve={() => selectPhase('prove')}
					/>
				</div>
			{:else if draft.activePhase === 'prove'}
			<div class="phase-content" data-phase="prove">
				<PhaseProve
					{currentString}
					invariantCandidate={draft.invariantCandidate}
						{builtInInvariant}
						{candidateInvariant}
						{artifactStatus}
						workingQuestion={draft.workingQuestion}
						onApplyBuiltIn={applyBuiltInInvariant}
						onSaveInvariantArtifact={saveInvariantArtifact}
						onSaveProofArtifact={saveProofArtifact}
						onUpdateInvariant={updateInvariant}
						onUpdateQuestion={updateQuestion}
					/>
				</div>
		{:else if draft.activePhase === 'reflect'}
			<div class="phase-content" data-phase="reflect">
				<PhaseReflect
					dialogueInput={draft.dialogueInput}
					dialogueMode={draft.dialogueMode}
					lastDialogue={draft.lastDialogue}
					{dialogueRunning}
					{dialogueStatus}
					notes={draft.notes}
					{snapshotStatus}
					{artifactStatus}
					{savedArtifacts}
					{reflectionPrompts}
					onUpdateDialogueInput={updateDialogueInput}
					onRunDialogue={runDialogue}
					onUpdateNotes={updateNotes}
					onUseReflectionPrompt={seedReflectionPrompt}
					onSaveSnapshot={saveSnapshotToDatabase}
					onSaveNote={saveNoteArtifact}
					onSaveTrace={saveTraceArtifact}
					onRestoreArtifact={restoreArtifact}
					onPopulateSuggestion={populateDialogueSuggestion}
					{formatTimestamp}
				/>
			</div>
		{/if}
	</section>
{:else}
	<section class="module-hero">
		<div class="module-hero__copy">
			<p class="eyebrow">Module {module.index}</p>
			<h1>{module.title}</h1>
			<p>{module.excerpt}</p>
		</div>

		<div class="module-hero__meta">
			<p class="eyebrow">Status</p>
			<ul class="ledger">
				<li>
					<strong>Current state</strong>
					<span>{module.status}</span>
				</li>
				<li>
					<strong>Planned surfaces</strong>
					<span>{module.surfaces.length}</span>
				</li>
			</ul>
		</div>
	</section>

	<section class="panel">
		<p class="eyebrow">Planned shell</p>
		<h2>Reserved for later passes</h2>
		<p class="placeholder-copy">
			This route exists so the module registry and navigation scale cleanly, but implementation
			work stays disciplined around Module 1 until the first instrument proves useful.
		</p>
	</section>
{/if}
