<script lang="ts">
	import { MIU_QUERY_BOUNDS, shortestDerivation } from '$lib/miu/complexity';
	import { DESCRIPTION_LENGTH_EXAMPLES } from '$lib/miu/examples';
	import type { MiuMove } from '$lib/miu/core';

	/**
	 * Movement 3 — description length. Shortest derivation length is a description
	 * length: a derivation is a program, K_MIU(s) its shortest. Fixed specimen
	 * strings carry the compressible-vs-incompressible split; session strings
	 * can be compared against them.
	 */
	let { sessionStrings }: { sessionStrings: string[] } = $props();

	const specimenRows = $derived(
		DESCRIPTION_LENGTH_EXAMPLES.map((example) => ({
			...rowFor(example.value),
			reading: example.reading,
			note: example.note
		}))
	);

	const sessionRows = $derived(
		sessionStrings
			.filter((value) => value !== 'MI' && !DESCRIPTION_LENGTH_EXAMPLES.some((example) => example.value === value))
			.map((value) => {
				const row = rowFor(value);
				return {
					...row,
					reading: readingFor(row.len, row.k),
					note: 'from the current derivation'
				};
			})
	);

	function rowFor(value: string) {
		const result = shortestDerivation(value, MIU_QUERY_BOUNDS);

		return {
			value,
			len: value.length,
			k: result.outcome === 'found' ? result.length : null,
			bound: result.maxDepth,
			program: result.path ? programFor(result.path) : 'not found within bound'
		};
	}

	function programFor(path: MiuMove[]): string {
		return path.length === 0 ? 'axiom' : path.map((move) => ruleName(move.ruleId)).join(' ');
	}

	function ruleName(ruleId: MiuMove['ruleId']): string {
		switch (ruleId) {
			case 'append-u':
				return 'R1';
			case 'double-tail':
				return 'R2';
			case 'replace-iii':
				return 'R3';
			case 'delete-uu':
				return 'R4';
		}
	}

	function readingFor(len: number, k: number | null): string {
		if (k === null) {
			return 'beyond bound';
		}

		if (k * 2 <= len) {
			return 'compressible';
		}

		return k >= len ? 'as long as itself' : 'near length';
	}

	function shown(value: string): string {
		return value.length > 30 ? value.slice(0, 29) + '…' : value;
	}
</script>

<div class="bridge__def">input         MI
instructions  ⟨rule, site⟩ at each step
output        the string
K_MIU(s)      the fewest moves in any derivation MI ⇒ s</div>

<p class="worksheet__label">Specimen strings</p>
<table class="ait-table">
	<thead>
		<tr>
			<th>string</th>
			<th class="num">|s|</th>
			<th class="num">K_MIU</th>
			<th>one shortest derivation</th>
			<th>&nbsp;</th>
		</tr>
	</thead>
	<tbody>
		{#each specimenRows as row (row.value)}
			<tr>
				<td>{shown(row.value)}</td>
				<td class="num">{row.len}</td>
				{#if row.k !== null}
					<td class="num" class:ratio-low={row.k * 2 <= row.len}>{row.k}</td>
					<td class="program">{row.program}</td>
					<td class="note note--reading">
						<b>{row.reading}</b>
						<span>{row.note}</span>
					</td>
				{:else}
					<td class="num">&gt; {row.bound}</td>
					<td class="program">{row.program}</td>
					<td class="note">beyond the search bound</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>

{#if sessionRows.length > 0}
	<p class="worksheet__label">From this derivation</p>
	<table class="ait-table">
		<thead>
			<tr>
				<th>string</th>
				<th class="num">|s|</th>
				<th class="num">K_MIU</th>
				<th>&nbsp;</th>
			</tr>
		</thead>
		<tbody>
			{#each sessionRows as row (row.value)}
				<tr>
					<td>{shown(row.value)}</td>
					<td class="num">{row.len}</td>
					{#if row.k !== null}
						<td class="num" class:ratio-low={row.k * 2 <= row.len}>{row.k}</td>
						<td class="note">{row.reading}</td>
					{:else}
						<td class="num">&gt; {row.bound}</td>
						<td class="note">beyond the search bound</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<p class="observation">
	The comparison is relative to this rewrite system. <code>MIIIUIU</code> is short as a string
	but has no shorter MIU description; <code>MIUIIIIIUIIII</code> is longer as a string but has
	a shorter derivation.
</p>
