<script lang="ts">
	import { browser } from '$app/environment';
	import MiuProduce from '$lib/components/miu/MiuProduce.svelte';
	import MiuSheet from '$lib/components/miu/MiuSheet.svelte';
	import MiuInvariant from '$lib/components/miu/MiuInvariant.svelte';
	import MiuBridge from '$lib/components/miu/MiuBridge.svelte';
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
		shortestTheoremDerivation
	} from '$lib/miu/complexity';
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
	const constructedPath = $derived(
		theoremDecision.outcome === 'theorem' ? constructMiuDerivation(trimmedProduceTarget) : null
	);
	const shortestStepResult = $derived(
		theoremDecision.outcome === 'theorem'
			? shortestTheoremDerivation(trimmedProduceTarget, {
					maxDepth: MIU_QUERY_BOUNDS.maxDepth,
					maxNodes: queryMaxNodes
				})
			: null
	);
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

<header class="instrument-header">
	<h1>MIU system</h1>
	<p>One derivation, read as theoremhood, invariant, and description length.</p>
</header>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Theoremhood</h2>
		<span class="movement__altitude">in the system</span>
	</div>

	<MiuProduce
		target={produceTarget}
		decision={theoremDecision}
		constructedLength={constructedPath?.length ?? null}
		shortest={shortestStepResult}
		queryMaxNodes={queryMaxNodes}
		{witnessKind}
		onUpdateTarget={updateTarget}
		onUpdateMaxNodes={setQueryMaxNodes}
		onShowWitness={toggleWitness}
	/>

	<MiuSheet
		trace={draft.trace}
		{currentString}
		{ruleAvailability}
		target={produceTarget}
		witnessTarget={witnessKind ? trimmedProduceTarget : null}
		{witnessPath}
		{witnessKind}
		onApplyMove={applyMove}
		onJumpToStep={jumpToStep}
		onReset={resetSession}
	/>
</section>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Invariant certificate</h2>
		<span class="movement__altitude">about the system</span>
	</div>

	<MiuInvariant />
</section>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Description length</h2>
		<span class="movement__altitude">about all such systems</span>
	</div>

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
			bounds are true.
		</p>
		<p class="coda__note">Those are the next constructions, named here, not claimed by MIU.</p>
	</div>
</section>
