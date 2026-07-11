<script lang="ts">
	import {
		Z3_CHARACTER_TABLE,
		deltaZeroFromCharacters,
		pullbackCharacterUnderDoubling,
		type OmegaExponent,
		type Z3Character,
		type Z3Residue
	} from '$lib/miu/characters';

	const RESIDUES = [0, 1, 2] as const satisfies readonly Z3Residue[];
	const CHARACTERS = [0, 1, 2] as const satisfies readonly Z3Character[];
	const R2_PULLBACK = CHARACTERS.map(pullbackCharacterUnderDoubling);
	const FORBIDDEN_INDICATOR = RESIDUES.map(deltaZeroFromCharacters);

	function omegaPower(exponent: OmegaExponent): string {
		if (exponent === 0) return '1';
		return exponent === 1 ? 'ω' : 'ω²';
	}
</script>

<div class="characters">
	<div class="characters__head">
		<h3>Characters of ℤ/3</h3>
		<p>
			<span class="mv">χ<sub>k</sub>(n)</span> = <span class="mv">ω<sup>kn</sup></span>,
			<span class="mv">ω</span> = <span class="mv">e</span><sup>2π<span class="mv">i</span>/3</sup>
		</p>
	</div>
	<div class="characters__body">
		<p class="characters__lede">
			The certificate used one fact about the residue: {'{'}1, 2{'}'} is closed under the rule
			action. The full action is stated in one line: R2 multiplies the residue by 2, and R1, R3,
			R4 fix it. The characters of ℤ/3 diagonalize it — R2 pulls
			<span class="mv">χ<sub>k</sub></span> back to <span class="mv">χ<sub>2k</sub></span> — and
			the indicator of the forbidden residue expands as <span class="mv">δ<sub>0</sub></span> =
			(<span class="mv">χ<sub>0</sub></span> + <span class="mv">χ<sub>1</sub></span> +
			<span class="mv">χ<sub>2</sub></span>)/3. Networks trained on modular arithmetic converge
			on this same Fourier basis; the table below is the fixed object those measurements will be
			set against.
		</p>
		<div class="characters__grid">
			<div class="characters__part">
				<p class="microlabel">Character table</p>
				<div class="character-table-wrap">
					<table class="character-table">
						<thead>
							<tr><th></th>{#each RESIDUES as residue}<th>n={residue}</th>{/each}</tr>
						</thead>
						<tbody>
							{#each CHARACTERS as character}
								<tr>
									<th><span class="mv">χ<sub>{character}</sub></span></th>
									{#each Z3_CHARACTER_TABLE[character] as exponent}
										<td>{omegaPower(exponent)}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="characters__part">
				<p class="microlabel">Rule pullbacks</p>
				<p>
					<span class="mv">R2*</span>: <span class="mv">χ<sub>k</sub></span> ↦
					<span class="mv">χ<sub>2k</sub></span>, so
					<span class="mv">χ<sub>{R2_PULLBACK[2]}</sub></span> ↔
					<span class="mv">χ<sub>{R2_PULLBACK[1]}</sub></span>.
				</p>
				<p>
					<span class="mv">R1*</span>, <span class="mv">R3*</span>, <span class="mv">R4*</span>
					fix every character.
				</p>
			</div>

			<div class="characters__part characters__part--indicator">
				<p class="microlabel">Forbidden indicator</p>
				<p>
					<span class="mv">δ<sub>0</sub>(n)</span> = (<span class="mv">χ<sub>0</sub>(n)</span> +
					<span class="mv">χ<sub>1</sub>(n)</span> +
					<span class="mv">χ<sub>2</sub>(n)</span>)/3, so
					<span class="mv">δ<sub>0</sub></span>(0, 1, 2) = ({FORBIDDEN_INDICATOR.join(', ')})
					<span class="characters__aside">— exactly the residue the invariant forbids.</span>
				</p>
			</div>
		</div>
	</div>
</div>
