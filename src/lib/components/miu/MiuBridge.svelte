<script lang="ts">
	import { shortestDerivation } from '$lib/miu/complexity';

	/**
	 * Reading 3 — the bridge. The same derivation read as a program: its length
	 * is a description length, and K_MIU(s) is the shortest such program. The
	 * current string is measured against the derivation the learner actually
	 * walked; two fixed strings show compressible against incompressible.
	 */
	let {
		currentString,
		userSteps
	}: {
		currentString: string;
		userSteps: number;
	} = $props();

	const current = $derived(shortestDerivation(currentString, { maxNodes: 40_000, maxDepth: 32 }));
	const currentLen = $derived(currentString.length);

	// Fixed worked examples. Generous bounds so the demonstration always resolves.
	const EXAMPLES = ['M' + 'I'.repeat(16), 'MII', 'MUI'].map((target) => ({
		target,
		k: shortestDerivation(target, { maxNodes: 60_000, maxDepth: 40 })
	}));
	const headline = EXAMPLES[0];
	const sameLength = EXAMPLES.slice(1);

	function ratio(k: number | null, len: number): 'compressible' | 'incompressible' | null {
		if (k === null) return null;
		return k * 2 <= len ? 'compressible' : 'incompressible';
	}
</script>

<section class="bridge">
	<h2 class="bridge__title">The derivation as a program</h2>
	<p class="bridge__lede">
		A derivation is a program: the axiom MI is the input, the rule and site chosen at each step are
		the instructions, and the string is the output. Its length is a description length.
	</p>

	<div class="bridge__def">input         MI
instructions  ⟨rule, site⟩ at each step
output        the string
K_MIU(s)      length of the shortest program producing s</div>

	<div class="bridge__measures">
		<div class="measure">
			<span class="measure__string">{currentString.length > 40 ? currentString.slice(0, 39) + '…' : currentString} <span class="measure__tag">the current string</span></span>
			{#if current.outcome === 'found'}
				<span class="measure__nums">|s| = <b>{currentLen}</b> · K_MIU = <b>{current.length}</b></span>
				<span class="measure__read measure__read--big">
					{#if current.length === userSteps}
						your derivation is minimal — {userSteps} step{userSteps === 1 ? '' : 's'}.
					{:else}
						you reached it in {userSteps} step{userSteps === 1 ? '' : 's'}; the shortest derivation is {current.length}.
					{/if}
				</span>
			{:else}
				<span class="measure__nums">|s| = <b>{currentLen}</b> · K_MIU ≤ <b>{userSteps}</b></span>
				<span class="measure__read">
					your derivation gives an upper bound of {userSteps}; the shortest was not found within the
					search horizon.
				</span>
			{/if}
		</div>
	</div>

	{#if headline.k.outcome === 'found'}
		<div class="bridge__measures">
			<div class="measure">
				<span class="measure__string">M followed by 16 I&nbsp;&nbsp;<span class="measure__tag">M I¹⁶</span></span>
				<span class="measure__nums">|s| = <b>{headline.target.length}</b> · K_MIU = <b>{headline.k.length}</b></span>
				<span class="measure__read measure__read--big">
					compressible: a {headline.target.length}-character string from a {headline.k.length}-instruction program ({headline.k.length} doublings).
				</span>
			</div>
		</div>
	{/if}

	<p class="bridge__contrast-head">Same length, different shortest program</p>
	<div class="bridge__measures">
		{#each sameLength as example (example.target)}
			{#if example.k.outcome === 'found'}
				<div class="measure">
					<span class="measure__string">{example.target}</span>
					<span class="measure__nums">|s| = <b>{example.target.length}</b> · K_MIU = <b>{example.k.length}</b></span>
					<span class="measure__read">
						{ratio(example.k.length, example.target.length) === 'compressible'
							? `${example.k.length} step${example.k.length === 1 ? '' : 's'} — compressible.`
							: 'no doubling route reaches it — incompressible (K_MIU = |s|).'}
					</span>
				</div>
			{/if}
		{/each}
	</div>

	<p class="bridge__note">
		Short programs are scarce: only finitely many derivations are shorter than a given length, so
		almost every string needs a program about as long as itself. The compressible strings — like
		<code>M I^(2^k)</code> — are the rare exceptions.
	</p>

	<p class="bridge__horizon">
		K_MIU measures description length against the four MIU rules — a fixed, non-universal machine.
		With a universal machine in their place, K_MIU becomes <b>Kolmogorov complexity</b> K:
		uncomputable, with a ceiling (<b>Chaitin</b> incompleteness) on the lower bounds any fixed
		system can prove about it. This instrument measures K_MIU only; that universal-machine step is
		the next instrument.
	</p>
</section>
