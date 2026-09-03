<script lang="ts">
	import { browser } from '$app/environment';
	import MiuProduce from '$lib/components/miu/MiuProduce.svelte';
	import MiuSheet from '$lib/components/miu/MiuSheet.svelte';
	import MiuInvariant from '$lib/components/miu/MiuInvariant.svelte';
	import MiuBridge from '$lib/components/miu/MiuBridge.svelte';
	import MiuDials from '$lib/components/miu/MiuDials.svelte';
	import { readDerivationTrace } from '$lib/miu/traceReadings';
	import {
		analyzeMiuRuleAvailability,
		applyMoveToTrace,
		isValidMiuString,
		jumpToTraceStep,
		type MiuMove
	} from '$lib/miu/core';
	import {
		MIU_QUERY_BOUNDS,
		queryMaxNodesForTarget,
		type ShortestDerivation
	} from '$lib/miu/complexity';
	import SearchWorker from '$lib/miu/searchWorker?worker';
	import type { SearchRequest, SearchResponse } from '$lib/miu/searchWorker';
	import type { BitProgramResult } from '$lib/miu/bitComplexity';
	import { encodeDerivation } from '$lib/miu/coding';
	import { constructMiuDerivation, decideMiuTheorem } from '$lib/miu/theoremhood';
	import {
		createModule1Draft,
		readModule1Draft,
		writeModule1Draft,
		type Module1Draft
	} from '$lib/state/module1';
	import { onMount } from 'svelte';

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let produceTarget = $state('MUI');
	type WitnessKind = 'constructed' | 'shortest';
	let witnessKind = $state<WitnessKind | null>(null);
	let queryMaxNodes = $state<number>(MIU_QUERY_BOUNDS.maxNodes);

	const currentStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentStep.value);
	const ruleAvailability = $derived(analyzeMiuRuleAvailability(currentString));
	const trimmedProduceTarget = $derived(produceTarget.trim());
	const validProduceTarget = $derived(isValidMiuString(trimmedProduceTarget));
	const theoremDecision = $derived(
		validProduceTarget ? decideMiuTheorem(trimmedProduceTarget) : decideMiuTheorem('')
	);
	const traceReading = $derived(readDerivationTrace(draft.trace));
	const reachedTarget = $derived(
		trimmedProduceTarget !== '' && currentString === trimmedProduceTarget
	);
	const targetResidue = $derived(
		theoremDecision.outcome === 'invalid' ? null : theoremDecision.residue
	);
	const constructedPath = $derived(
		theoremDecision.outcome === 'theorem' ? constructMiuDerivation(trimmedProduceTarget) : null
	);
	// The K_steps search runs in a worker so typing never blocks the page: each
	// query spawns a fresh worker, and the effect cleanup terminates it, which
	// cancels the search the moment the target or budget changes. `searchRuledOut`
	// mirrors the search's completed frontier layers while it runs.
	let shortestStepResult = $state<ShortestDerivation | null>(null);
	let searchRunning = $state(false);
	let searchRuledOut = $state<number | null>(null);

	$effect(() => {
		const searchTarget = trimmedProduceTarget;
		const maxNodes = queryMaxNodes;

		if (!browser || theoremDecision.outcome !== 'theorem') {
			shortestStepResult = null;
			searchRunning = false;
			searchRuledOut = null;
			return;
		}

		shortestStepResult = null;
		searchRunning = true;
		searchRuledOut = null;

		const worker = new SearchWorker();
		worker.onmessage = (event: MessageEvent<SearchResponse>) => {
			const message = event.data;
			if (message.kind === 'progress') {
				searchRuledOut = message.completedDepth;
			} else if (message.kind === 'result') {
				shortestStepResult = message.result;
				searchRunning = false;
			} else if (message.kind === 'error') {
				console.error(`K_steps search failed for ${searchTarget}: ${message.message}`);
				searchRunning = false;
			}
		};
		worker.postMessage({
			kind: 'steps',
			target: searchTarget,
			maxDepth: MIU_QUERY_BOUNDS.maxDepth,
			maxNodes
		} satisfies SearchRequest);

		return () => worker.terminate();
	});
	const constructedBits = $derived(
		constructedPath ? encodeDerivation(constructedPath).bitLength : null
	);
	let bitResult = $state<BitProgramResult | null>(null);
	let bitSearchRunning = $state(false);

	$effect(() => {
		const searchTarget = trimmedProduceTarget;
		const maxNodes = queryMaxNodes;

		if (!browser || theoremDecision.outcome !== 'theorem') {
			bitResult = null;
			bitSearchRunning = false;
			return;
		}

		bitResult = null;
		bitSearchRunning = true;

		const worker = new SearchWorker();
		worker.onmessage = (event: MessageEvent<SearchResponse>) => {
			const message = event.data;
			if (message.kind === 'bits-result') {
				bitResult = message.result;
				bitSearchRunning = false;
			} else if (message.kind === 'error') {
				console.error(`K_bits search failed for ${searchTarget}: ${message.message}`);
				bitSearchRunning = false;
			}
		};
		worker.postMessage({ kind: 'bits', target: searchTarget, maxNodes } satisfies SearchRequest);

		return () => worker.terminate();
	});
	// Not read anywhere yet; Task 9 wires these into MiuBridge. Kept live here so
	// noUnusedLocals doesn't fail this task's check before that wiring lands.
	$effect(() => {
		void constructedBits;
		void bitResult;
		void bitSearchRunning;
	});
	const witnessPath = $derived(
		witnessKind === 'constructed'
			? constructedPath
			: witnessKind === 'shortest' && shortestStepResult?.outcome === 'found'
				? shortestStepResult.path
				: null
	);
	onMount(() => {
		if (!browser) {
			return;
		}
		draft = readModule1Draft(window.localStorage);
		hydrated = true;
	});

	$effect(() => {
		if (!browser || !hydrated) {
			return;
		}
		writeModule1Draft(window.localStorage, draft);
	});

	function patchDraft(next: Partial<Module1Draft>) {
		draft = { ...draft, ...next, lastEditedAt: new Date().toISOString() };
	}

	function applyMove(move: MiuMove) {
		patchDraft({ trace: applyMoveToTrace(draft.trace, move) });
	}

	function jumpToStep(index: number) {
		patchDraft({ trace: jumpToTraceStep(draft.trace, index) });
	}

	function updateTarget(nextTarget: string) {
		produceTarget = nextTarget;
		queryMaxNodes = queryMaxNodesForTarget(nextTarget, queryMaxNodes);
		witnessKind = null;
	}

	function setQueryMaxNodes(maxNodes: number) {
		queryMaxNodes = maxNodes;
	}

	function toggleWitness(kind: WitnessKind) {
		witnessKind = witnessKind === kind ? null : kind;
	}

	function resetSession() {
		const fresh = createModule1Draft();
		draft = { ...fresh, lastEditedAt: new Date().toISOString() };
		witnessKind = null;
		if (browser) {
			writeModule1Draft(window.localStorage, draft);
		}
	}
</script>

<svelte:head>
	<title>Strange Loops Lab | MIU</title>
</svelte:head>

<nav class="instrument-breadcrumb" aria-label="Instrument location">
	<a href="/">Strange Loops Lab</a>
	<span aria-hidden="true">/</span>
	<a href="/#form-and-meaning">Form and meaning</a>
	<span aria-hidden="true">/</span>
	<span aria-current="page">MIU</span>
</nav>

<header class="instrument-header">
	<h1>MIU system</h1>
	<p>One object, three readings: derivation, invariant, program.</p>
</header>

<div class="overture">
	<blockquote class="epigraph">
		<p>
			It is an inherent property of intelligence that it can jump out of the task which it is
			performing, and survey what it has done; it is always looking for, and often finding,
			patterns.
		</p>
		<cite>— <i>Gödel, Escher, Bach</i>, chapter I</cite>
	</blockquote>
	<p class="overture__reading">
		The object below is a single derivation in the MIU system, read three ways at rising
		altitude. <b>As a derivation.</b> The four rules act on a string, and the worksheet records
		each application. <b>As an invariant.</b> Each string carries its number of Is mod 3; the
		four rules preserve nonzero residue, so every derivation from MI keeps it while
		<span class="o">MU</span> has residue 0. <b>As a program.</b> The rule-and-site choices are a
		finite record that can be coded in bits; the length of the shortest such code is a
		description length relative to this fixed machine.
	</p>
	<p class="overture__notes">
		<a href="/form-and-meaning/miu/notes">Lecture notes</a> — full statements and proofs, with
		the surrounding theory.
	</p>
</div>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Theoremhood</h2>
		<span class="movement__altitude">as a derivation</span>
	</div>

	<MiuProduce
		target={produceTarget}
		decision={theoremDecision}
		constructedLength={constructedPath?.length ?? null}
		shortest={shortestStepResult}
		{searchRunning}
		{searchRuledOut}
		queryMaxNodes={queryMaxNodes}
		{witnessKind}
		onUpdateTarget={updateTarget}
		onUpdateMaxNodes={setQueryMaxNodes}
		onShowWitness={toggleWitness}
	/>

	<MiuSheet
		trace={draft.trace}
		{traceReading}
		{currentString}
		{ruleAvailability}
		target={produceTarget}
		witnessTarget={witnessKind ? trimmedProduceTarget : null}
		{witnessPath}
		{witnessKind}
		onApplyMove={applyMove}
		onJumpToStep={jumpToStep}
		onReset={resetSession}
	>
		<MiuDials {traceReading} target={trimmedProduceTarget} {targetResidue} {reachedTarget} />
	</MiuSheet>
</section>

<section class="movement" id="invariant">
	<div class="movement__head">
		<h2 class="movement__title">Invariant certificate</h2>
		<span class="movement__altitude">across all derivations</span>
	</div>

	<p class="movement__turn">
		A derivation is a witness for membership; non-membership has no such witness. That no
		derivation reaches <span class="o">MU</span> is a claim about every derivation at once, so
		no finite search settles it — it is settled by a property the four rules preserve.
	</p>

	<MiuInvariant />
</section>

<section class="movement" id="description-length">
	<div class="movement__head">
		<h2 class="movement__title">Description length</h2>
		<span class="movement__altitude">as a program</span>
	</div>

	<p class="movement__turn">
		Each worksheet step was a choice of rule and site, so a derivation carries two lengths: the
		count of its choices, and the bits needed to write them down. Written in bits, a derivation
		is a program for this machine — and the verdict above was already bounding the step count.
	</p>

	<MiuBridge />

	<div class="coda">
		<p class="microlabel">→ the next machine</p>
		<p class="coda__body">
			What changes next is the machine. With a universal machine, shortest descriptions become
			<b>Kolmogorov complexity</b> <span class="mv">K</span>, and producibility becomes the
			halting question. In formal systems strong enough to reason about those descriptions,
			<b>Chaitin</b> obtains incompleteness from a ceiling on provable lower bounds: each sound
			system fixes a constant <span class="mv">c</span> beyond which it proves no bound
			<span class="mv">K(s)</span> &gt; <span class="mv">c</span> — though infinitely many such
			bounds are true. Both legs of the instrument above break at that machine: the residue that
			decided membership has no analogue once producibility is the halting question, and the
			exhaustion that proved bounds like <span class="mv">K</span><sub>steps</sub> &gt; 10 cannot
			terminate — which is exactly the ceiling on provable lower bounds.
		</p>
		<p class="coda__note">Those are the next constructions, named here, not claimed by MIU.</p>
	</div>
</section>
