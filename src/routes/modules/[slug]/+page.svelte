<script lang="ts">
	import { browser } from '$app/environment';
	import type { DialogueResult } from '$lib/dialogue/types';
	import SurfacePanel from '$lib/components/SurfacePanel.svelte';
	import type { ModuleSummary } from '$lib/content/modules';
	import {
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
		tracePathToNode
	} from '$lib/miu/graph';
	import {
		GRAPH_DEPTH_OPTIONS,
		GRAPH_NODE_LIMIT_OPTIONS,
		SURFACE_SEQUENCE,
		createModule1Draft,
		normalizeModule1Draft,
		readModule1Draft,
		writeModule1Draft,
		type DialogueMode,
		type Module1Draft,
		type SurfaceId
	} from '$lib/state/module1';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const module = $derived(data.module as ModuleSummary);
	const dialogueModes: DialogueMode[] = ['Explain-Back Examiner', 'Socratic Partner'];
	const surfaceCopy: Record<SurfaceId, string> = {
		sandbox: 'The deterministic rule surface for legal MIU moves.',
		trace: 'Ordered derivations that can later branch without corrupting history.',
		graph: 'Reachability structure, bounded by explicit exploration controls.',
		invariants: 'Candidate preserved quantities, counterexamples, and non-reachability hints.',
		dialogue: 'Socratic or explain-back coaching grounded in module state.',
		artifacts: 'Saved notes, traces, and reflections that survive reload.'
	};
	const boundaryLabels = [
		{
			tone: 'verified',
			label: 'verified',
			body: 'Rule legality and future derivation checks belong here.'
		},
		{
			tone: 'computed',
			label: 'computed',
			body: 'Graph search, helper transforms, and bounded exploration live here.'
		},
		{
			tone: 'coaching',
			label: 'coaching',
			body: 'Dialogue is guidance, not certification.'
		}
	] as const;

	const timestampFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	interface SavedArtifactSummary {
		id: number;
		artifactType: string;
		title: string;
		createdAt: string;
	}

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let lastEditedLabel = $state('No local edits yet');
	let snapshotStatus = $state('SQLite snapshot not loaded yet.');
	let artifactStatus = $state('SQLite artifact list not loaded yet.');
	let savedArtifacts = $state<SavedArtifactSummary[]>([]);
	let dialogueStatus = $state('No dialogue run yet.');
	let dialogueRunning = $state(false);
	const currentTraceStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentTraceStep.value);
	const legalMoves = $derived(enumerateMiuMoves(currentString));
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

	function selectSurface(surface: SurfaceId) {
		const visited = draft.visitedSurfaces.includes(surface)
			? draft.visitedSurfaces
			: [...draft.visitedSurfaces, surface];

		patchDraft({
			activeSurface: surface,
			visitedSurfaces: visited
		});
	}

	function updateQuestion(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		patchDraft({ workingQuestion: target.value });
	}

	function updateInvariant(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		patchDraft({
			activeSurface: 'invariants',
			invariantCandidate: target.value,
			visitedSurfaces: ensureVisited('invariants')
		});
	}

	function updateNotes(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		patchDraft({ notes: target.value });
	}

	function updateDialogueMode(mode: DialogueMode) {
		patchDraft({
			dialogueMode: mode,
			activeSurface: 'dialogue',
			visitedSurfaces: ensureVisited('dialogue')
		});
	}

	function applyMove(move: MiuMove) {
		patchDraft({
			activeSurface: 'sandbox',
			trace: applyMoveToTrace(draft.trace, move),
			visitedSurfaces: ensureVisited('sandbox', 'trace')
		});
	}

	function jumpToStep(index: number) {
		patchDraft({
			activeSurface: 'trace',
			trace: jumpToTraceStep(draft.trace, index),
			visitedSurfaces: ensureVisited('trace')
		});
	}

	function undoMove() {
		patchDraft({
			activeSurface: 'trace',
			trace: stepBackTrace(draft.trace),
			visitedSurfaces: ensureVisited('trace')
		});
	}

	function restartFromInitial() {
		patchDraft({
			activeSurface: 'sandbox',
			trace: restartTrace(draft.trace),
			visitedSurfaces: ensureVisited('sandbox', 'trace')
		});
	}

	function ensureVisited(...surfaces: SurfaceId[]): SurfaceId[] {
		return Array.from(new Set([...draft.visitedSurfaces, ...surfaces]));
	}

	function updateGraphDepth(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		patchDraft({
			activeSurface: 'graph',
			graphDepth: Number(target.value),
			visitedSurfaces: ensureVisited('graph')
		});
	}

	function updateGraphNodeLimit(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		patchDraft({
			activeSurface: 'graph',
			graphNodeLimit: Number(target.value),
			visitedSurfaces: ensureVisited('graph')
		});
	}

	function selectGraphNode(nodeId: string) {
		patchDraft({
			activeSurface: 'graph',
			selectedGraphNode: nodeId,
			visitedSurfaces: ensureVisited('graph')
		});
	}

	function applyBuiltInInvariant() {
		patchDraft({
			activeSurface: 'invariants',
			invariantCandidate: 'count(I) mod 3 != 0',
			visitedSurfaces: ensureVisited('invariants')
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
				const artifactPayload = (await artifactsResponse.json()) as {
					artifacts: SavedArtifactSummary[];
				};
				savedArtifacts = artifactPayload.artifacts;
				artifactStatus =
					artifactPayload.artifacts.length > 0
						? `Loaded ${artifactPayload.artifacts.length} saved artifact${artifactPayload.artifacts.length === 1 ? '' : 's'}.`
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

			const result = (await response.json()) as { artifact: SavedArtifactSummary };
			savedArtifacts = [result.artifact, ...savedArtifacts];
			artifactStatus = `Saved ${artifactType} artifact to SQLite at ${formatTimestamp(result.artifact.createdAt)}.`;
		} catch {
			artifactStatus = `Saving ${artifactType} artifact failed.`;
		}
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

	function updateDialogueInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		patchDraft({
			activeSurface: 'dialogue',
			dialogueInput: target.value,
			visitedSurfaces: ensureVisited('dialogue')
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
				artifact?: SavedArtifactSummary;
			};

			if (!response.ok || !payload.dialogue) {
				dialogueStatus = payload.error ?? 'Dialogue request failed.';
				return;
			}

			patchDraft({
				activeSurface: 'dialogue',
				lastDialogue: payload.dialogue,
				visitedSurfaces: ensureVisited('dialogue', 'artifacts')
			});

			if (payload.artifact) {
				savedArtifacts = [payload.artifact, ...savedArtifacts];
			}

			dialogueStatus = payload.dialogue.costUsd
				? `Dialogue finished. Cost: $${payload.dialogue.costUsd.toFixed(4)}.`
				: 'Dialogue finished.';
			artifactStatus = payload.artifact
				? `Saved dialogue artifact to SQLite at ${formatTimestamp(payload.artifact.createdAt)}.`
				: artifactStatus;
		} catch {
			dialogueStatus = 'Dialogue request failed.';
		} finally {
			dialogueRunning = false;
		}
	}
</script>

<svelte:head>
	<title>Strange Loops Lab | {module.title}</title>
</svelte:head>

{#if module.slug === 'module-1'}
	<section class="module-hero">
		<div class="module-hero__copy">
			<p class="eyebrow">Module {module.index}</p>
			<h1>{module.title}</h1>
			<p>
				The scaffold is now in place for the first serious instrument: a stable route, persistent
				local notebook state, explicit work surfaces, and a visible epistemic boundary between
				rule checking and coaching.
			</p>

			<div class="status-row">
				<span class="status-pill" data-status={module.status}>live module shell</span>
				<span class="status-pill" data-status="scaffolding">local persistence ready</span>
			</div>
		</div>

		<div class="module-hero__meta">
			<p class="eyebrow">Current shell state</p>
			<ul class="ledger">
				<li>
					<strong>Active surface</strong>
					<span>{draft.activeSurface}</span>
				</li>
				<li>
					<strong>Surfaces touched</strong>
					<span>{draft.visitedSurfaces.length} / {SURFACE_SEQUENCE.length}</span>
				</li>
				<li>
					<strong>Last edited</strong>
					<span>{lastEditedLabel}</span>
				</li>
			</ul>
		</div>
	</section>

	<section class="module-layout">
		<div class="module-column">
			<SurfacePanel title="Question Frame" eyebrow="Persistent module context" badge="local notebook">
				<div class="field-grid">
					<label class="field-label" for="working-question">
						Current question
						<input
							id="working-question"
							class="text-field"
							type="text"
							value={draft.workingQuestion}
							oninput={updateQuestion}
						/>
					</label>

					<label class="field-label" for="invariant-candidate">
						Candidate invariant
						<input
							id="invariant-candidate"
							class="text-field"
							type="text"
							value={draft.invariantCandidate}
							oninput={updateInvariant}
						/>
					</label>
				</div>
				<p class="field-note">
					The notebook state is persisted, but the MIU sandbox below is now driven by the same
					deterministic rule engine the tests exercise.
				</p>
			</SurfacePanel>

			<SurfacePanel title="MIU Sandbox" eyebrow="Inside the system" badge="verified rules">
				<div class="current-string-panel">
					<p class="eyebrow">Current string</p>
					<div class="current-string">{currentString}</div>
					<p class="field-note">
						Only legal next moves are shown. Applying one appends to the derivation trace and
						preserves exact rule metadata.
					</p>
				</div>

				<div class="status-row">
					<button class="button button--ghost" type="button" onclick={undoMove}>Step back</button>
					<button class="button button--ghost" type="button" onclick={restartFromInitial}>
						Restart from MI
					</button>
				</div>

				<div class="move-grid">
					{#if legalMoves.length > 0}
						{#each legalMoves as move}
							<button class="move-card" type="button" onclick={() => applyMove(move)}>
								<div class="move-card__top">
									<strong>{move.ruleLabel}</strong>
									<span>{move.result}</span>
								</div>
								<p>{move.detail}</p>
								<small>Span {move.start + 1}-{move.end}</small>
							</button>
						{/each}
					{:else}
						<p class="placeholder-copy">No legal moves exist from this state.</p>
					{/if}
				</div>
			</SurfacePanel>

			<SurfacePanel title="Derivation Trace" eyebrow="Ordered history" badge="branchable">
				<div class="trace-list">
					{#each draft.trace.steps as step, index}
						<button
							class="trace-step"
							type="button"
							data-active={index === draft.trace.currentIndex}
							onclick={() => jumpToStep(index)}
						>
							<div class="trace-step__meta">
								<strong>Step {index}</strong>
								<span>{step.via ? step.via.ruleLabel : 'Initial state'}</span>
							</div>
							<div class="trace-step__value">{step.value}</div>
							{#if step.via}
								<small>{step.via.detail} Span {step.via.start + 1}-{step.via.end}.</small>
							{:else}
								<small>Starting point for the derivation.</small>
							{/if}
						</button>
					{/each}
				</div>
				<p class="field-note">
					Click any earlier step, then apply a legal move from the sandbox to branch from that
					point instead of mutating later history in place.
				</p>
			</SurfacePanel>

			<SurfacePanel title="Reachability Explorer" eyebrow="Outside the system" badge="computed graph">
				<div class="control-grid">
					<label class="field-label" for="graph-depth">
						Max depth
						<select
							id="graph-depth"
							class="select-field"
							value={draft.graphDepth}
							onchange={updateGraphDepth}
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
							value={draft.graphNodeLimit}
							onchange={updateGraphNodeLimit}
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
						<strong>{reachabilityGraph.truncatedBy ?? 'full'}</strong>
						<span>bound status</span>
					</div>
				</div>

				<div class="graph-layout">
					<div class="graph-node-list">
						{#each reachabilityGraph.nodes as node}
							<button
								class="graph-node"
								type="button"
								data-active={node.id === selectedGraphNodeId}
								onclick={() => selectGraphNode(node.id)}
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

			<SurfacePanel title="Invariant Explorer" eyebrow="Meta-level proof move" badge="verified arithmetic">
				<div class="invariant-stack">
					<div class="invariant-card invariant-card--built-in">
						<div class="surface-panel__header">
							<div>
								<p class="eyebrow">Built-in argument</p>
								<h3>count(I) mod 3 != 0</h3>
							</div>
							<span class="badge" data-tone={builtInInvariant.preserved ? 'verified' : 'coaching'}>
								{builtInInvariant.preserved ? 'preserved' : 'fails'}
							</span>
						</div>
						<p class="field-note">
							Starting from MI, the I-count begins at 1. Rule 1 and Rule 4 leave it alone, Rule 3
							subtracts 3, and Rule 2 doubles it, flipping 1 and 2 modulo 3 without ever producing
							0.
						</p>
						{#if builtInInvariant.consequence}
							<p class="placeholder-copy">{builtInInvariant.consequence}</p>
						{/if}
						<button class="button button--ghost" type="button" onclick={applyBuiltInInvariant}>
							Use built-in candidate
						</button>
					</div>

					<div class="invariant-card">
						<div class="surface-panel__header">
							<div>
								<p class="eyebrow">Custom candidate</p>
								<h3>{draft.invariantCandidate}</h3>
							</div>
							{#if candidateInvariant.kind === 'supported'}
								<span
									class="badge"
									data-tone={candidateInvariant.preserved ? 'verified' : 'coaching'}
								>
									{candidateInvariant.preserved ? 'preserved' : 'counterexample found'}
								</span>
							{/if}
						</div>

						{#if candidateInvariant.kind === 'supported'}
							<p class="field-note">{candidateInvariant.description}</p>
							<div class="graph-summary">
								<div class="graph-metric">
									<strong>{candidateInvariant.currentICount}</strong>
									<span>I count in current string</span>
								</div>
								<div class="graph-metric">
									<strong>{candidateInvariant.currentSatisfied ? 'yes' : 'no'}</strong>
									<span>candidate holds now</span>
								</div>
								<div class="graph-metric">
									<strong>{candidateInvariant.preserved ? 'yes' : 'no'}</strong>
									<span>preserved under rules</span>
								</div>
							</div>

							<div class="rule-result-list">
								{#each candidateInvariant.ruleResults as result}
									<div class="rule-result">
										<div class="rule-result__top">
											<strong>{result.ruleLabel}</strong>
											<span class="badge" data-tone={result.preserved ? 'verified' : 'coaching'}>
												{result.preserved ? 'preserved' : 'fails'}
											</span>
										</div>
										<p class="field-note">{result.explanation}</p>
										{#if result.witness}
											<small>
												Witness: {result.witness.source} -> {result.witness.result}
											</small>
										{/if}
									</div>
								{/each}
							</div>

							{#if candidateInvariant.consequence}
								<p class="placeholder-copy">{candidateInvariant.consequence}</p>
							{/if}
						{:else}
							<p class="placeholder-copy">{candidateInvariant.unsupportedReason}</p>
							<p class="field-note">
								Supported forms: <code>count(I) mod 3 != 0</code>, <code>count(I) mod 4 = 1</code>.
							</p>
						{/if}
					</div>
				</div>
			</SurfacePanel>

			<SurfacePanel title="Dialogue Mode" eyebrow="Claude agent team" badge="coaching only">
				<label class="field-label" for="dialogue-input">
					Your explanation or question
					<textarea
						id="dialogue-input"
						class="text-area"
						oninput={updateDialogueInput}
					>{draft.dialogueInput}</textarea>
				</label>
				<div class="status-row">
					<button
						class="button button--ghost"
						type="button"
						onclick={runDialogue}
						disabled={dialogueRunning}
					>
						{dialogueRunning ? 'Running...' : 'Run dialogue'}
					</button>
				</div>
				<p class="field-note">{dialogueStatus}</p>

				{#if draft.lastDialogue}
					<div class="dialogue-transcript">
						{#each draft.lastDialogue.messages as message}
							<div class="dialogue-turn" data-agent={message.agent}>
								<div class="dialogue-turn__top">
									<strong>{message.agent === 'examiner' ? 'Examiner' : 'Proof Coach'}</strong>
									<span class="badge" data-tone="coaching">coaching</span>
								</div>
								<p>{message.content}</p>
							</div>
						{/each}

						<div class="dialogue-final">
							<p class="eyebrow">Final response</p>
							<p>{draft.lastDialogue.finalResponse}</p>
							{#if draft.lastDialogue.sessionId}
								<small>Claude session {draft.lastDialogue.sessionId}</small>
							{/if}
						</div>
					</div>
				{/if}
			</SurfacePanel>

			<SurfacePanel title="Work Surfaces" eyebrow="Module shell">
				<div class="surface-pill-row">
					{#each SURFACE_SEQUENCE as surface}
						<button
							class="surface-pill"
							type="button"
							data-active={draft.activeSurface === surface}
							onclick={() => selectSurface(surface)}
						>
							<strong>{surface}</strong>
							<small>{surfaceCopy[surface]}</small>
						</button>
					{/each}
				</div>
				<p class="placeholder-copy">{surfaceCopy[draft.activeSurface]}</p>
			</SurfacePanel>

			<SurfacePanel title="Artifact Notebook" eyebrow="Persistence">
				<label class="field-label" for="module-notes">
					Notes and reflections
					<textarea
						id="module-notes"
						class="text-area"
						value={draft.notes}
						oninput={updateNotes}
					></textarea>
				</label>
				<div class="status-row">
					<button class="button button--ghost" type="button" onclick={saveSnapshotToDatabase}>
						Save snapshot to SQLite
					</button>
					<button class="button button--ghost" type="button" onclick={saveNoteArtifact}>
						Save note artifact
					</button>
					<button class="button button--ghost" type="button" onclick={saveTraceArtifact}>
						Save trace artifact
					</button>
				</div>
				<p class="field-note">{snapshotStatus}</p>
				<p class="field-note">{artifactStatus}</p>
				{#if savedArtifacts.length > 0}
					<ul class="ledger">
						{#each savedArtifacts as artifact}
							<li>
								<strong>{artifact.title}</strong>
								<span>{artifact.artifactType} · {formatTimestamp(artifact.createdAt)}</span>
							</li>
						{/each}
					</ul>
				{/if}
				<p class="field-note">
					Local storage still keeps the working draft responsive, but SQLite now holds durable
					snapshots and explicit saved artifacts.
				</p>
			</SurfacePanel>
		</div>

		<aside class="module-sidebar">
			<SurfacePanel title="Dialogue Mode" eyebrow="Agent shell">
				<div class="dialogue-row">
					{#each dialogueModes as mode}
						<button
							class="dialogue-chip"
							type="button"
							data-active={draft.dialogueMode === mode}
							onclick={() => updateDialogueMode(mode)}
						>
							<strong>{mode}</strong>
							<small>
								{mode === 'Explain-Back Examiner'
									? 'Probe the user explanation until the weak step becomes explicit.'
									: 'Keep the answer budget low and sharpen the next question instead.'}
							</small>
						</button>
					{/each}
				</div>
			</SurfacePanel>

			<SurfacePanel title="Epistemic Boundary" eyebrow="Product contract">
				<div class="sidebar-stack">
					{#each boundaryLabels as boundary}
						<div>
							<span class="badge" data-tone={boundary.tone}>{boundary.label}</span>
							<p class="field-note">{boundary.body}</p>
						</div>
					{/each}
				</div>
			</SurfacePanel>

			<SurfacePanel title="Immediate Reachability" eyebrow="Computed preview">
				<ul class="ledger">
					{#each uniqueReachableStates as move}
						<li>
							<strong>{move.result}</strong>
							<span>{move.ruleLabel}</span>
						</li>
					{/each}
				</ul>
				<p class="field-note">
					This is a bounded preview of the next reachable layer, not the full graph explorer yet.
				</p>
			</SurfacePanel>

			<SurfacePanel title="Scaffold Ledger" eyebrow="What exists now">
				<ul class="ledger">
					<li>
						<strong>Route shell</strong>
						<span>ready</span>
					</li>
					<li>
						<strong>Module registry</strong>
						<span>ready</span>
					</li>
					<li>
						<strong>Persistent notebook</strong>
						<span>{hydrated ? 'hydrated' : 'waiting for browser'}</span>
					</li>
					<li>
						<strong>MIU engine</strong>
						<span>ready</span>
					</li>
				</ul>
			</SurfacePanel>
		</aside>
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
