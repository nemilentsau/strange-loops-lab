<script lang="ts">
	import { shortestBitProgram } from '$lib/miu/bitComplexity';
	import { encodeDerivation, literalMiuBitLength } from '$lib/miu/coding';
	import { MIU_QUERY_BOUNDS, shortestTheoremDerivation } from '$lib/miu/complexity';
	import { DESCRIPTION_LENGTH_EXAMPLES } from '$lib/miu/examples';

	const specimenRows = DESCRIPTION_LENGTH_EXAMPLES.map((example) => {
		const stepResult = shortestTheoremDerivation(example.value, MIU_QUERY_BOUNDS);
		const bitResult = shortestBitProgram(example.value, {
			maxNodes: MIU_QUERY_BOUNDS.maxNodes
		});
		const program =
			bitResult.outcome === 'found'
				? encodeDerivation(bitResult.path)
						.instructions.map((instruction) => instruction.display)
						.join(' ') || 'halt'
				: `not determined within ${bitResult.maxNodes.toLocaleString()} strings`;

		return {
			...example,
			literalBits: literalMiuBitLength(example.value),
			stepLength: stepResult.outcome === 'found' ? stepResult.length : null,
			bitLength: bitResult.bitLength,
			program
		};
	});
</script>

<div class="bridge__def">program       0 · encoded ⟨rule, site⟩ instructions · 000
K_steps(s)    minimum number of rewrite moves MI ⇒ s
K_bits(s)     minimum program length under the code above
L_literal(s)  1 + |γ(|tail(s)|)| + |tail(s)| bits</div>

<p class="worksheet__label">Specimen strings</p>
<div class="ait-table-wrap">
	<table class="ait-table">
		<thead>
			<tr>
				<th>string</th>
				<th class="num">L_literal</th>
				<th class="num">K_steps</th>
				<th class="num">K_bits</th>
				<th>one minimum-bit program</th>
				<th>reading</th>
			</tr>
		</thead>
		<tbody>
			{#each specimenRows as row (row.value)}
				<tr>
					<td>{row.value}</td>
					<td class="num">{row.literalBits}</td>
					<td class="num">{row.stepLength ?? '—'}</td>
					<td class="num">{row.bitLength ?? '—'}</td>
					<td class="program">{row.program}</td>
					<td class="note note--reading">
						<b>{row.reading}</b>
						<span>{row.note}</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
