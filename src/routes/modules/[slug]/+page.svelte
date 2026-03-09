<script lang="ts">
	import { browser } from '$app/environment';
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
		SURFACE_SEQUENCE,
		createModule1Draft,
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

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let lastEditedLabel = $state('No local edits yet');
	const currentTraceStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentTraceStep.value);
	const legalMoves = $derived(enumerateMiuMoves(currentString));
	const uniqueReachableStates = $derived(
		Array.from(new Map(legalMoves.map((move) => [move.result, move])).values())
	);

	onMount(() => {
		if (module.slug !== 'module-1' || !browser) {
			return;
		}

		draft = readModule1Draft(window.localStorage);
		hydrated = true;
		lastEditedLabel =
			draft.lastEditedAt === null
				? 'No local edits yet'
				: timestampFormatter.format(new Date(draft.lastEditedAt));
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
		patchDraft({ invariantCandidate: target.value });
	}

	function updateNotes(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		patchDraft({ notes: target.value });
	}

	function updateDialogueMode(mode: DialogueMode) {
		patchDraft({ dialogueMode: mode });
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
				<p class="field-note">
					Local persistence is wired through browser storage so refreshes do not erase the current
					module draft.
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
