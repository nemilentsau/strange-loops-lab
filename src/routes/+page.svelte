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
	import { MIU_QUERY_BOUNDS, queryMaxNodesForTarget, shortestDerivation } from '$lib/miu/complexity';
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
	let witnessTarget = $state<string | null>(null);
	let witnessPath = $state<MiuMove[] | null>(null);
	let queryMaxNodes = $state<number>(MIU_QUERY_BOUNDS.maxNodes);

	const currentStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentStep.value);
	const ruleAvailability = $derived(analyzeMiuRuleAvailability(currentString));
	// "What you produced this session": the distinct strings the derivation has
	// passed through, each carrying its own description length in Movement 3.
	const sessionStrings = $derived(Array.from(new Set(draft.trace.steps.map((step) => step.value))));

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
		if (nextTarget.trim() !== witnessTarget) {
			witnessTarget = null;
			witnessPath = null;
		}
	}

	function setQueryMaxNodes(maxNodes: number) {
		queryMaxNodes = maxNodes;
	}

	function toggleShortestWitness() {
		const trimmed = produceTarget.trim();
		if (!isValidMiuString(trimmed)) {
			return;
		}

		if (witnessTarget === trimmed && witnessPath) {
			witnessTarget = null;
			witnessPath = null;
			return;
		}

		const result = shortestDerivation(trimmed, {
			maxDepth: MIU_QUERY_BOUNDS.maxDepth,
			maxNodes: queryMaxNodes
		});
		if (result.outcome !== 'found' || !result.path) {
			witnessTarget = null;
			witnessPath = null;
			return;
		}
		witnessTarget = trimmed;
		witnessPath = result.path;
	}

	function resetSession() {
		const fresh = createModule1Draft();
		draft = { ...fresh, lastEditedAt: new Date().toISOString() };
		witnessTarget = null;
		witnessPath = null;
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
		queryMaxNodes={queryMaxNodes}
		witnessOpen={witnessTarget === produceTarget.trim() && witnessPath !== null}
		onUpdateTarget={updateTarget}
		onUpdateMaxNodes={setQueryMaxNodes}
		onToggleWitness={toggleShortestWitness}
	/>

	<MiuSheet
		trace={draft.trace}
		{currentString}
		{ruleAvailability}
		target={produceTarget}
		{witnessTarget}
		{witnessPath}
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
		<p class="claim__head">
			<b>Claim.</b> For the fixed MIU system, theoremhood is decidable; for theorems,
			shortest derivation length is computable.
		</p>
		<ol class="claim__list">
			<li>
				<b>Theoremhood is decidable.</b> #I mod 3 is invariant under the four rules and separates
				MU (residue 0) from every theorem (residue 1 or 2).
			</li>
			<li>
				<b>K_MIU(s) is computable for theorems.</b> Once <span class="m">s &isin; Th(MIU)</span>,
				breadth-first search over derivations ordered by length returns a shortest derivation.
			</li>
		</ol>
	</div>

	<p class="lede">
		<span class="m">K_MIU(s)</span> is the length of the shortest derivation of
		<span class="m">s</span>. A derivation can be read as a program: <span class="m">MI</span> is
		the input, each rule-and-site choice is an instruction, and the final string is the output.
		Thus <span class="m">K_MIU(s)</span> is a description length relative to this rewrite system.
	</p>

	<MiuBridge {sessionStrings} />

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
