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

<section class="movement movement--invariant">
	<div class="movement__head">
		<h2 class="movement__title">Invariant certificate</h2>
		<span class="movement__altitude">about the system</span>
	</div>
	<p class="lede">
		To prove <span class="m">s &isin; Th(MIU)</span>, give a derivation
		<span class="m">MI &rArr; s</span>. To prove <span class="m">s &notin; Th(MIU)</span>, give a
		certificate: a property that holds at <span class="m">MI</span>, is preserved by
		<span class="m">R1</span>–<span class="m">R4</span>, and fails for <span class="m">s</span>.
		For <span class="m">MU</span>, the certificate is the count of <b>I</b>'s modulo 3.
	</p>

	<MiuInvariant />
</section>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Description length</h2>
		<span class="movement__altitude">about all such systems</span>
	</div>

	<div class="claim">
		<p class="claim__head"><b>Claim.</b></p>
		<div class="claim__display">
			<span>For <span class="m">s &isin; Th(MIU)</span>:</span>
			<span><span class="m">K_steps(s)</span> is computable by breadth-first enumeration.</span>
			<span><span class="m">K_bits(s)</span> is computable by cost-ordered enumeration under the fixed code.</span>
			<span>Both quantities are relative to the four-rule MIU machine and the stated code.</span>
		</div>
	</div>

	<MiuBridge />

	<div class="coda">
		<p class="coda__altitude">→ the next machine</p>
		<p class="coda__body">
			What changes next is the machine. With a universal machine, shortest descriptions become
			<b>Kolmogorov complexity</b> K, and producibility becomes the halting question. In formal
			systems strong enough to reason about those descriptions, <b>Chaitin</b> obtains
			incompleteness from a ceiling on provable lower bounds: each sound system fixes a constant
			c beyond which it proves no bound K(s) &gt; c — though infinitely many such bounds are true.
		</p>
		<p class="coda__note">Those are the next constructions, named here, not claimed by MIU.</p>
	</div>
</section>
