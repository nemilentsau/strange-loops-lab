<script lang="ts">
	import { browser } from '$app/environment';
	import MiuSheet from '$lib/components/miu/MiuSheet.svelte';
	import MiuBridge from '$lib/components/miu/MiuBridge.svelte';
	import {
		analyzeMiuRuleAvailability,
		applyMoveToTrace,
		jumpToTraceStep,
		type MiuMove
	} from '$lib/miu/core';
	import {
		createModule1Draft,
		readModule1Draft,
		writeModule1Draft,
		type Module1Draft
	} from '$lib/state/module1';
	import { onMount } from 'svelte';

	let draft = $state(createModule1Draft());
	let hydrated = $state(false);
	let reachTarget = $state('MU');

	const currentStep = $derived(
		draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0] ?? draft.trace.steps.at(-1)!
	);
	const currentString = $derived(currentStep.value);
	const iCount = $derived((currentString.match(/I/g) || []).length);
	const ruleAvailability = $derived(analyzeMiuRuleAvailability(currentString));

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

	function updateReachTarget(event: Event) {
		reachTarget = (event.currentTarget as HTMLInputElement).value;
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
		<span class="ibar__sub">MIU</span>
	</div>
	<div class="ibar__facts">
		<span class="ibar__fact ibar__fact--string"
			><span>string</span> <b title={currentString}
				>{currentString.length > 22 ? currentString.slice(0, 21) + '…' : currentString}</b
			></span
		>
		<span class="ibar__fact"><span>length</span> <b>{currentString.length}</b></span>
		<span class="ibar__fact"><span>#I</span> <b>{iCount}</b></span>
		<span class="ibar__fact"><span>#I mod 3</span> <b>{iCount % 3}</b></span>
	</div>
	<button class="ibar__reset" type="button" onclick={resetSession}>Reset to MI</button>
</div>

<MiuSheet
	trace={draft.trace}
	{currentString}
	{ruleAvailability}
	invariantCandidate={draft.invariantCandidate}
	{reachTarget}
	onApplyMove={applyMove}
	onJumpToStep={jumpToStep}
	onUpdateReachTarget={updateReachTarget}
/>

<MiuBridge {currentString} userSteps={draft.trace.currentIndex} />
