<script lang="ts">
	import { browser } from '$app/environment';
	import type { DialogueResult } from '$lib/dialogue/types';
	import ContextStrip from '$lib/components/ContextStrip.svelte';
	import PhaseNav from '$lib/components/PhaseNav.svelte';
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
		LAB_PHASES,
		PHASE_META,
		PHASE_SURFACES,
		createModule1Draft,
		normalizeModule1Artifact,
		normalizeModule1Artifacts,
		normalizeModule1Draft,
		readModule1Draft,
		restoreModule1Artifact,
		writeModule1Draft,
		type LabPhase,
		type Module1Artifact,
		type Module1Draft,
		type SurfaceId
	} from '$lib/state/module1';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const module = $derived(data.module as ModuleSummary);
	const reflectionPrompts = [
		{
			title: 'Why search fails',
			text: 'Explain why exploring more derivations cannot by itself prove that MU is unreachable.'
		},
		{
			title: 'Weak step in the proof',
			text: 'State the single rule you had to justify most carefully, and explain why it preserves the invariant.'
		},
		{
			title: 'Object vs meta',
			text: 'Describe the difference between applying an MIU rule and proving a fact about all MIU derivations.'
		}
	] as const;

	const timestampFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let lastEditedLabel = $state('No local edits yet');
	let snapshotStatus = $state('SQLite snapshot not loaded yet.');
	let artifactStatus = $state('SQLite artifact list not loaded yet.');
	let savedArtifacts = $state<Module1Artifact[]>([]);
	let dialogueStatus = $state('No dialogue run yet.');
	let dialogueRunning = $state(false);
	const currentTraceStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentTraceStep.value);
	const iCount = $derived((currentString.match(/I/g) || []).length);
	const mod3Class = $derived(iCount % 3);
	const activePhaseMeta = $derived(PHASE_META[draft.activePhase]);
	const activePhaseCue = $derived(phaseCueFor(draft.activePhase));
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

		function phaseCueFor(phase: LabPhase): string {
			switch (phase) {
			case 'explore':
				return 'Work inside the system first. Follow legal rules and feel the local mechanics.';
			case 'map':
				return 'Zoom out. The graph shows the reachable boundary, not just one derivation.';
			case 'prove':
				return 'Step outside the system. Build an argument about all reachable strings.';
			case 'reflect':
				return 'Turn the proof into understanding, then preserve what you learned.';
			}
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
		try {
			const [snapshotResponse, artifactsResponse] = await Promise.all([
				fetch(`/api/modules/${module.slug}/snapshot`),
				fetch(`/api/modules/${module.slug}/artifacts`)
			]);

			if (snapshotResponse.ok) {
				const snapshotPayload = (await snapshotResponse.json()) as {
					snapshot: { payload: unknown; updatedAt: string } | null;
				};
				const remoteDraft = snapshotPayload.snapshot?.payload
					? normalizeModule1Draft(snapshotPayload.snapshot.payload)
					: null;

				if (remoteDraft) {
					const chosenDraft = pickNewestDraft(localDraft, remoteDraft);
					draft = chosenDraft;
					snapshotStatus =
						chosenDraft === remoteDraft
							? `Loaded SQLite snapshot from ${formatTimestamp(snapshotPayload.snapshot?.updatedAt ?? null)}.`
							: 'Kept newer local draft and left the older SQLite snapshot untouched.';
				} else {
					snapshotStatus = 'No SQLite snapshot saved yet.';
				}
			} else {
				snapshotStatus = 'SQLite snapshot request failed.';
			}

			if (artifactsResponse.ok) {
				const artifactPayload = (await artifactsResponse.json()) as { artifacts?: unknown };
				savedArtifacts = normalizeModule1Artifacts(artifactPayload.artifacts);
				artifactStatus =
					savedArtifacts.length > 0
						? `Loaded ${savedArtifacts.length} saved artifact${savedArtifacts.length === 1 ? '' : 's'}.`
						: 'No saved SQLite artifacts yet.';
			} else {
				artifactStatus = 'SQLite artifact request failed.';
			}
		} catch {
			snapshotStatus = 'SQLite persistence is unavailable in this session.';
			artifactStatus = 'SQLite persistence is unavailable in this session.';
		}
	}

	async function saveSnapshotToDatabase() {
		try {
			const response = await fetch(`/api/modules/${module.slug}/snapshot`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ draft })
			});

			if (!response.ok) {
				snapshotStatus = 'Failed to save SQLite snapshot.';
				return;
			}

			const payload = (await response.json()) as { snapshot: { updatedAt: string } };
			snapshotStatus = `SQLite snapshot saved at ${formatTimestamp(payload.snapshot.updatedAt)}.`;
		} catch {
			snapshotStatus = 'SQLite snapshot save failed.';
		}
	}

	async function saveNoteArtifact() {
		if (!draft.notes.trim()) {
			artifactStatus = 'Add a note before saving a note artifact.';
			return;
		}

		await createArtifact('note', noteArtifactTitle(), {
			notes: draft.notes,
			currentString,
			lastEditedAt: draft.lastEditedAt
		});
	}

	async function saveTraceArtifact() {
		await createArtifact('trace', `Trace to ${currentString}`, {
			trace: draft.trace,
			currentString
		});
	}

	async function saveInvariantArtifact() {
		if (candidateInvariant.kind !== 'supported') {
			artifactStatus = 'Use a supported invariant candidate before saving an invariant artifact.';
			return;
		}

		await createArtifact('invariant-run', `Invariant run: ${candidateInvariant.label}`, {
			currentString,
			workingQuestion: draft.workingQuestion,
			trace: draft.trace,
			candidate: candidateInvariant,
			builtIn: builtInInvariant
		});
	}

	async function saveProofArtifact() {
		await createArtifact('proof-attempt', proofArtifactTitle(), {
			claim: 'MU is unreachable from MI.',
			currentString,
			workingQuestion: draft.workingQuestion,
			trace: draft.trace,
			candidate: candidateInvariant,
			notes: draft.notes,
			conclusion: candidateInvariant.consequence
		});
	}

	async function createArtifact(artifactType: string, title: string, payload: unknown) {
		try {
			const response = await fetch(`/api/modules/${module.slug}/artifacts`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ artifactType, title, payload })
			});

			if (!response.ok) {
				artifactStatus = `Failed to save ${artifactType} artifact.`;
				return;
			}

			const result = (await response.json()) as { artifact?: unknown };
			const artifact = normalizeModule1Artifact(result.artifact);

			if (!artifact) {
				artifactStatus = `Saved ${artifactType} artifact, but the response payload was malformed.`;
				return;
			}

			savedArtifacts = [artifact, ...savedArtifacts];
			artifactStatus = `Saved ${artifactType} artifact to SQLite at ${formatTimestamp(artifact.createdAt)}.`;
		} catch {
			artifactStatus = `Saving ${artifactType} artifact failed.`;
		}
	}

	function restoreArtifact(artifact: Module1Artifact) {
		const restored = restoreModule1Artifact(draft, artifact);
		artifactStatus = restored.status;

		if (!restored.ok) {
			return;
		}

		draft = restored.draft;
	}

	function pickNewestDraft(localDraft: Module1Draft, remoteDraft: Module1Draft): Module1Draft {
		return draftTimestamp(remoteDraft) > draftTimestamp(localDraft) ? remoteDraft : localDraft;
	}

	function draftTimestamp(candidate: Module1Draft): number {
		return candidate.lastEditedAt ? Date.parse(candidate.lastEditedAt) || 0 : 0;
	}

	function formatTimestamp(value: string | null): string {
		return value ? timestampFormatter.format(new Date(value)) : 'an unknown time';
	}

	function noteArtifactTitle(): string {
		const preview = draft.notes.trim().slice(0, 36);
		return preview ? `Note: ${preview}` : 'Module 1 note';
	}

	function proofArtifactTitle(): string {
		const preview = draft.invariantCandidate.trim();
		return preview ? `Proof attempt: ${preview}` : 'Proof attempt';
	}

	function resetSession() {
		const fresh = createModule1Draft();
		draft = { ...fresh, lastEditedAt: new Date().toISOString() };
		writeModule1Draft(window.localStorage, draft);
		snapshotStatus = 'Session reset. SQLite snapshot unchanged.';
		artifactStatus = 'Session reset. Saved artifacts still in SQLite.';
		dialogueStatus = 'No dialogue run yet.';
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

	async function runDialogue() {
		const userInput = draft.dialogueInput.trim();

		if (!userInput) {
			dialogueStatus = 'Enter an explanation or question before running dialogue mode.';
			return;
		}

		dialogueRunning = true;
		dialogueStatus = 'Running Claude Code agent team...';

		try {
			const response = await fetch(`/api/modules/${module.slug}/dialogue`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ userInput, draft })
			});

			const payload = (await response.json()) as {
				error?: string;
				dialogue?: DialogueResult;
				artifact?: unknown;
			};

			if (!response.ok || !payload.dialogue) {
				dialogueStatus = payload.error ?? 'Dialogue request failed.';
				return;
			}

			patchDraft({
				activePhase: 'reflect',
				activeSurface: 'dialogue',
				lastDialogue: payload.dialogue,
				visitedSurfaces: ensureVisited('dialogue', 'artifacts'),
				visitedPhases: ensureVisitedPhases('reflect')
			});

			const artifact = normalizeModule1Artifact(payload.artifact);

			if (artifact) {
				savedArtifacts = [artifact, ...savedArtifacts];
			}

			dialogueStatus = payload.dialogue.costUsd
				? `Dialogue finished. Cost: $${payload.dialogue.costUsd.toFixed(4)}.`
				: 'Dialogue finished.';
			artifactStatus = artifact
				? `Saved dialogue artifact to SQLite at ${formatTimestamp(artifact.createdAt)}.`
				: artifactStatus;
		} catch {
			dialogueStatus = 'Dialogue request failed.';
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
	<section class="module-hero module-hero--compact">
		<div class="module-hero__copy">
			<p class="eyebrow">Module {module.index}</p>
			<h1>{module.title}</h1>
		</div>

		<div class="module-hero__actions">
			<span class="module-hero__edited">{lastEditedLabel}</span>
			<button class="button button--ghost button--sm" type="button" onclick={resetSession}>
				Reset session
			</button>
		</div>
	</section>

		<ContextStrip
			{currentString}
			stepCount={draft.trace.currentIndex}
			{iCount}
			{mod3Class}
			phaseLabel={activePhaseMeta.label}
			phaseEpistemicLabel={activePhaseMeta.epistemicLabel}
			phaseCue={activePhaseCue}
			phaseTone={activePhaseMeta.tone}
			workingQuestion={draft.workingQuestion}
			onUpdateQuestion={updateQuestion}
		/>

	<PhaseNav
		activePhase={draft.activePhase}
		visitedPhases={draft.visitedPhases}
		onSelectPhase={selectPhase}
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
						onApplyMove={applyMove}
						onApplyProposalMatch={applyProposalMatch}
						onJumpToStep={jumpToStep}
						onUndo={undoMove}
						onRestart={restartFromInitial}
						onUpdateProposal={updateProposalInput}
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
						onUpdateGraphDepth={updateGraphDepth}
						onUpdateGraphNodeLimit={updateGraphNodeLimit}
						onSelectGraphNode={selectGraphNode}
						onUseGuideTask={useMapGuideTask}
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
						onApplyBuiltIn={applyBuiltInInvariant}
						onSaveInvariantArtifact={saveInvariantArtifact}
						onSaveProofArtifact={saveProofArtifact}
						onUpdateInvariant={updateInvariant}
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
