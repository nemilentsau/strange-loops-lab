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
		<p><span class="m">χ<sub>k</sub>(n) = ω<sup>kn</sup></span>, <span class="m">ω³ = 1</span>, <span class="m">1 + ω + ω² = 0</span></p>
	</div>

	<div class="characters__grid">
		<div class="characters__part">
			<p class="worksheet__label">character table</p>
			<div class="character-table-wrap">
				<table class="character-table">
					<thead>
						<tr><th></th>{#each RESIDUES as residue}<th>n={residue}</th>{/each}</tr>
					</thead>
					<tbody>
						{#each CHARACTERS as character}
							<tr>
								<th>χ<sub>{character}</sub></th>
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
			<p class="worksheet__label">rule pullbacks</p>
			<p class="characters__formula">
				<span class="m">R2*: χ<sub>k</sub> ↦ χ<sub>2k</sub></span>; hence
				<span class="m">χ<sub>{R2_PULLBACK[2]}</sub> ↔ χ<sub>{R2_PULLBACK[1]}</sub></span>.
			</p>
			<p class="characters__formula">
				<span class="m">R1*, R3*, R4*</span> fix every character.
			</p>
		</div>

		<div class="characters__part">
			<p class="worksheet__label">forbidden indicator</p>
			<p class="characters__identity">
				<span class="m">δ<sub>0</sub>(n) = (χ<sub>0</sub>(n) + χ<sub>1</sub>(n) + χ<sub>2</sub>(n)) / 3</span>.
			</p>
			<p class="characters__values">
				<span class="m">δ<sub>0</sub>(0,1,2) = ({FORBIDDEN_INDICATOR.join(', ')})</span>.
			</p>
			<p class="characters__note">
				The forbidden residue is visible in the Fourier basis used by the modular-addition experiment.
			</p>
		</div>
	</div>
</div>
