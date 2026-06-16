<script lang="ts">
	import { shortestDerivation } from '$lib/miu/complexity';

	/**
	 * Movement 3 — description length. The oracle's step-count is a description
	 * length: a derivation is a program, K_MIU(s) its shortest. The session's
	 * own strings carry the compressible-vs-incompressible split; the bridge
	 * states the next question without claiming the universal-machine case here.
	 */
	let { sessionStrings }: { sessionStrings: string[] } = $props();

	const rows = $derived(
		sessionStrings.map((value) => {
			const result = shortestDerivation(value, { maxNodes: 40_000, maxDepth: 32 });
			return {
				value,
				len: value.length,
				k: result.outcome === 'found' ? result.length : null,
				bound: result.maxDepth
			};
		})
	);

	function shown(value: string): string {
		return value.length > 30 ? value.slice(0, 29) + '…' : value;
	}
</script>

<div class="bridge__def">input         MI
instructions  ⟨rule, site⟩ at each step
output        the string
K_MIU(s)      length of the shortest program producing s   (the oracle's number)</div>

<p class="worksheet__label">What you produced this session</p>
<table class="ait-table">
	<thead>
		<tr><th>string</th><th class="num">|s|</th><th class="num">K_MIU</th><th>&nbsp;</th></tr>
	</thead>
	<tbody>
		{#each rows as row (row.value)}
			<tr>
				<td>{shown(row.value)}</td>
				<td class="num">{row.len}</td>
				{#if row.k !== null}
					<td class="num" class:ratio-low={row.k * 2 <= row.len}>{row.k}</td>
					<td class="note">
						{#if row.k * 2 <= row.len}compressible{:else if row.k >= row.len}as long as itself{/if}
					</td>
				{:else}
					<td class="num">&gt; {row.bound}</td>
					<td class="note">beyond the search horizon</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>

<p class="observation">
	Programs are scarce: there are fewer than <code>b^m</code> derivations of length below
	<code>m</code>, so almost every string needs a program about as long as itself. The compressible
	strings — the doubled I-runs, where <code>K_MIU ≈ log₂|s|</code> — are the rare exceptions.
</p>

<p class="bridge__horizon">
	Here both questions are answerable. <b>K_MIU is computable</b> — the oracle just computed it — and
	<b>theoremhood is decidable</b> — the invariant decides it with a count mod 3. The next instrument
	changes the machine. With a universal machine, shortest descriptions become <b>Kolmogorov
	complexity</b> K, and producibility becomes the halting question. With formal systems strong enough
	to talk about those descriptions, <b>Chaitin</b> gives incompleteness through provable lower bounds
	on K. Those are the next constructions, named here, not claimed by MIU.
</p>
