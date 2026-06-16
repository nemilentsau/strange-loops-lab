<script lang="ts">
	import { browser } from '$app/environment';
	import MiuProduce from '$lib/components/miu/MiuProduce.svelte';
	import MiuSheet from '$lib/components/miu/MiuSheet.svelte';
	import MiuInvariant from '$lib/components/miu/MiuInvariant.svelte';
	import MiuBridge from '$lib/components/miu/MiuBridge.svelte';
	import {
		analyzeMiuRuleAvailability,
		applyMoveToTrace,
		createDerivationTrace,
		isValidMiuString,
		jumpToTraceStep,
		type MiuMove
	} from '$lib/miu/core';
	import { shortestDerivation } from '$lib/miu/complexity';
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

	const currentStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentStep.value);
	const iCount = $derived((currentString.match(/I/g) || []).length);
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

	function updateTarget(event: Event) {
		produceTarget = (event.currentTarget as HTMLInputElement).value;
	}

	// Walk the workspace to the shortest derivation of the target (the help).
	function showShortestPath() {
		const trimmed = produceTarget.trim();
		if (!isValidMiuString(trimmed)) {
			return;
		}
		const result = shortestDerivation(trimmed, { maxNodes: 40_000, maxDepth: 32 });
		if (result.outcome !== 'found' || !result.path) {
			return;
		}
		let trace = createDerivationTrace();
		for (const move of result.path) {
			trace = applyMoveToTrace(trace, move);
		}
		patchDraft({ trace });
	}

	function resetSession() {
		const fresh = createModule1Draft();
		draft = { ...fresh, lastEditedAt: new Date().toISOString() };
		if (browser) {
			writeModule1Draft(window.localStorage, draft);
		}
	}
</script>

<svelte:head>
	<title>Strange Loops Lab | MIU</title>
</svelte:head>

<div class="ibar">
	<div class="ibar__brand">
		<span class="ibar__wordmark">Strange Loops</span>
		<span class="ibar__sub">MIU · algorithmic information theory</span>
	</div>
	<div class="ibar__facts">
		<span class="ibar__fact ibar__fact--string"
			><span>string</span> <b title={currentString}
				>{currentString.length > 22 ? currentString.slice(0, 21) + '…' : currentString}</b
			></span
		>
		<span class="ibar__fact"><span>length</span> <b>{currentString.length}</b></span>
		<span class="ibar__fact"><span>#I mod 3</span> <b>{iCount % 3}</b></span>
	</div>
	<button class="ibar__reset" type="button" onclick={resetSession}>Reset to MI</button>
</div>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Produce a string</h2>
		<span class="movement__altitude">▦ in the system</span>
	</div>
	<p class="lede">
		Name a string and the system answers at once: is it a theorem — derivable from MI by the four
		rules — and if so, in how few steps. Then build it yourself. The answer is never hidden;
		<em>how</em> to reach it is yours to find, or to ask for.
	</p>

	<MiuProduce target={produceTarget} onUpdateTarget={updateTarget} onShowPath={showShortestPath} />

	<MiuSheet
		trace={draft.trace}
		{currentString}
		{ruleAvailability}
		target={produceTarget}
		onApplyMove={applyMove}
		onJumpToStep={jumpToStep}
		onShowPath={showShortestPath}
	/>
</section>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Why some strings are not theorems</h2>
		<span class="movement__altitude">◉ about the system</span>
	</div>
	<p class="lede">
		Type <em>MU</em> and the oracle answers <em>not a theorem</em> — and it is certain, not a search
		that gave out. No derivation reaches MU, because every rule preserves a quantity MU violates.
		This is Hofstadter's puzzle, and its resolution is an invariant.
	</p>

	<MiuInvariant {currentString} invariantCandidate={draft.invariantCandidate} />
</section>

<section class="movement">
	<div class="movement__head">
		<h2 class="movement__title">Description length</h2>
		<span class="movement__altitude">↗ about all such systems</span>
	</div>
	<p class="lede">
		The step-count the oracle reports is not bookkeeping. A derivation is a program: MI is the input,
		each rule-and-site choice an instruction, the string the output. The shortest such program is the
		string's description length against this machine.
	</p>

	<MiuBridge {sessionStrings} />
</section>
