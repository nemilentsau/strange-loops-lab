<script lang="ts">
	import { isValidMiuString } from '$lib/miu/core';
	import { countI } from '$lib/miu/invariants';
	import { shortestDerivation } from '$lib/miu/complexity';

	/**
	 * Movement 1's goal: name a string to produce. The oracle answers at once —
	 * is it a theorem (derivable from MI), and if so the length of the shortest
	 * derivation (its K_MIU). The answer is never withheld; "show the path"
	 * reveals how, on request.
	 */
	let {
		target,
		onUpdateTarget,
		onShowPath
	}: {
		target: string;
		onUpdateTarget: (event: Event) => void;
		onShowPath: () => void;
	} = $props();

	const trimmed = $derived(target.trim());
	const valid = $derived(isValidMiuString(trimmed));
	const oracle = $derived(valid ? shortestDerivation(trimmed) : null);
	const targetICount = $derived(valid ? countI(trimmed) : 0);
</script>

<div class="goal">
	<div class="goal__field">
		<label class="goal__label" for="produce-target">Produce</label>
		<input
			id="produce-target"
			class="goal__input"
			type="text"
			value={target}
			oninput={onUpdateTarget}
			aria-label="String to produce"
			spellcheck="false"
			autocomplete="off"
		/>
	</div>

	<div class="oracle">
		{#if !trimmed}
			<p class="oracle__fact">name a string to produce.</p>
		{:else if !valid}
			<p class="oracle__fact">not a MIU string — start with M, then write at least one I or U.</p>
		{:else if oracle?.outcome === 'unreachable-invariant'}
			<div class="oracle__verdict">
				<span class="stamp" aria-hidden="true">✗</span>{trimmed} is not a theorem.
			</div>
			<p class="oracle__fact">#I = {targetICount} ≡ 0 (mod 3) — excluded by the invariant.</p>
		{:else if oracle?.outcome === 'found'}
			<div class="oracle__verdict">
				<span class="stamp" aria-hidden="true">✓</span>{trimmed} is a theorem.
			</div>
			<p class="oracle__fact">
				shortest derivation: <b>{oracle.length}</b> step{oracle.length === 1 ? '' : 's'}{#if (oracle.length ?? 0) > 0}
					· <button class="oracle__path" type="button" onclick={onShowPath}>show the path</button>{/if}
			</p>
		{:else}
			<p class="oracle__fact">
				no derivation found within the search horizon ({oracle?.stoppedBy === 'depth'
					? `depth ${oracle.maxDepth}`
					: `${oracle?.maxNodes} strings`}) — a bound, not a verdict.
			</p>
		{/if}
	</div>
</div>
