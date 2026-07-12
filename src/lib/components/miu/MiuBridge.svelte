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
				: 'unresolved at this search bound';

		return {
			...example,
			literalBits: literalMiuBitLength(example.value),
			stepLength: stepResult.outcome === 'found' ? stepResult.length : null,
			bitLength: bitResult.bitLength,
			program
		};
	});
</script>

<p class="lede">
	Both minima are bounded the same way: exhibiting one program bounds from above; ruling out
	every shorter one bounds from below. Upper bounds cost one witness. Lower bounds cost
	exhaustion — and on this four-rule machine the exhaustion terminates, so they are provable.
</p>

<div class="defs">
	<div class="defs__cols">
		<div class="defs__col">
			<div class="defs__row">
				<span class="defs__term">the machine</span>
				<span>start <span class="o">MI</span>; rules R1–R4.</span>
			</div>
			<div class="defs__row">
				<span class="defs__term">a program</span>
				<div>
					<span class="o">0</span> · <span class="mv">op</span><sub>1</sub>
					<span class="mv">site</span><sub>1</sub> ⋯ <span class="mv">op</span><sub>n</sub>
					<span class="mv">site</span><sub>n</sub> · <span class="o">000</span>
					<p class="defs__gloss">
						flag <span class="o">0</span>: a derivation follows. Each <span class="mv">op</span>
						is a 3-bit rule code; each <span class="mv">site</span> is ⌈log₂
						<span class="mv">m</span>⌉ bits choosing among the <span class="mv">m</span> legal
						sites, empty when <span class="mv">m</span> = 1. <span class="o">000</span> halts.
					</p>
				</div>
			</div>
			<div class="defs__row">
				<span class="defs__term">a literal</span>
				<div>
					<span class="o">1</span> · <span class="mv">γ</span>(|<span class="mv">t</span>|) ·
					<span class="mv">t</span>
					<p class="defs__gloss">
						flag <span class="o">1</span>: the string itself follows. <span class="mv">t</span>
						is the tail after <span class="o">M</span>, one bit per symbol;
						<span class="mv">γ</span> is the Elias gamma code.
					</p>
				</div>
			</div>
		</div>
		<div class="defs__col defs__col--measures">
			<div class="defs__row">
				<span class="defs__term"
					><span class="mv">K</span><sub>steps</sub>(<span class="mv">s</span>)</span
				>
				<span
					>the least <span class="mv">n</span> with <span class="o">MI</span>
					<span class="mv">⇒</span><sup><span class="mv">n</span></sup>
					<span class="mv">s</span> — the quantity the verdict above brackets.</span
				>
			</div>
			<div class="defs__row">
				<span class="defs__term"
					><span class="mv">K</span><sub>bits</sub>(<span class="mv">s</span>)</span
				>
				<span
					>the least |<span class="mv">p</span>| among derivation programs
					<span class="mv">p</span> printing <span class="mv">s</span>.</span
				>
			</div>
			<div class="defs__row">
				<span class="defs__term"
					><span class="mv">L</span><sub>literal</sub>(<span class="mv">s</span>)</span
				>
				<span
					>1 + |<span class="mv">γ</span>(|<span class="mv">t</span>|)| + |<span class="mv"
						>t</span
					>| — the cost of writing <span class="mv">s</span> down.</span
				>
			</div>
			<p class="defs__rel">Both minima are relative to this machine and this code.</p>
		</div>
	</div>
</div>

<p class="microlabel">Specimen strings</p>
<div class="ait-table-wrap">
	<table class="ait-table">
		<thead>
			<tr>
				<th>string</th>
				<th class="num">L<sub>literal</sub></th>
				<th class="num">K<sub>steps</sub></th>
				<th class="num">K<sub>bits</sub></th>
				<th>one minimum-bit derivation program</th>
				<th>reading</th>
			</tr>
		</thead>
		<tbody>
			{#each specimenRows as row (row.value)}
				<tr>
					<td class="o">{row.value}</td>
					<td class="num">{row.literalBits}</td>
					<td class="num">{row.stepLength ?? '—'}</td>
					<td class="num">{row.bitLength ?? '—'}</td>
					<td class="program">{row.program}</td>
					<td class="reading">{row.reading}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
