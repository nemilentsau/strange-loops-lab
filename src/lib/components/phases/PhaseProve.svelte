<script lang="ts">
	import {
		buildProofDocument,
		grammarSurvivors,
		residueWheel,
		type WheelArrow
	} from '$lib/state/module1Proof';
	import { PHASE_META, LEVEL_PRESENTATION } from '$lib/state/module1';

	let {
		currentString,
		invariantCandidate,
		artifactStatus,
		onApplyBuiltIn,
		onSaveInvariantArtifact,
		onSaveProofArtifact,
		onUpdateInvariant
	}: {
		currentString: string;
		invariantCandidate: string;
		artifactStatus: string;
		onApplyBuiltIn: () => void;
		onSaveInvariantArtifact: () => void;
		onSaveProofArtifact: () => void;
		onUpdateInvariant: (event: Event) => void;
	} = $props();

	const level = PHASE_META.prove.level;
	const levelPresentation = LEVEL_PRESENTATION[level];

	/* The whole page re-derives from the candidate: editing it rewrites the
	 * argument live. Every stamp is the verifier's. */
	const doc = $derived(buildProofDocument(invariantCandidate, currentString));

	/* The candidate seen as remainders: the rules act on Z/k (R2 doubles,
	 * R3 subtracts 3), and preservation is closure — no arrow out of an
	 * allowed remainder may land on a forbidden one. */
	const wheel = $derived(residueWheel(invariantCandidate));
	const wheelBroken = $derived(wheel?.arrows.some((arrow) => arrow.escapes) ?? false);

	/* The uniqueness line is computed live by the same closure check across
	 * the whole grammar — the page never asserts what it has not run. */
	const survivors = $derived(grammarSurvivors());

	/* Wheel geometry: dots on a circle, chord arrows bowed apart per map,
	 * self-loops drawn outward. */
	const WHEEL_R = 78;
	const WHEEL_C = 110;

	function dotAt(residue: number, modulus: number): { x: number; y: number } {
		const angle = -Math.PI / 2 + (2 * Math.PI * residue) / modulus;

		return { x: WHEEL_C + WHEEL_R * Math.cos(angle), y: WHEEL_C + WHEEL_R * Math.sin(angle) };
	}

	function labelAt(residue: number, modulus: number): { x: number; y: number } {
		const angle = -Math.PI / 2 + (2 * Math.PI * residue) / modulus;

		return {
			x: WHEEL_C + (WHEEL_R + 18) * Math.cos(angle),
			y: WHEEL_C + (WHEEL_R + 18) * Math.sin(angle) + 4
		};
	}

	function arrowPath(arrow: WheelArrow, modulus: number): string {
		const from = dotAt(arrow.from, modulus);

		if (arrow.from === arrow.to) {
			// Self-loop, drawn outward from the circle.
			const ux = (from.x - WHEEL_C) / WHEEL_R;
			const uy = (from.y - WHEEL_C) / WHEEL_R;
			const ax = from.x + 6 * ux;
			const ay = from.y + 6 * uy;

			return `M ${ax} ${ay} a 8 8 0 1 1 ${0.5 + 2 * ux} ${0.5 + 2 * uy}`;
		}

		const to = dotAt(arrow.to, modulus);
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.hypot(dx, dy) || 1;
		// Bow the two map families to opposite sides so they never overlap.
		const side = arrow.map === 'double' ? 1 : -1;
		const px = (-dy / length) * 16 * side;
		const py = (dx / length) * 16 * side;
		const startX = from.x + (dx / length) * 7;
		const startY = from.y + (dy / length) * 7;
		const endX = to.x - (dx / length) * 9;
		const endY = to.y - (dy / length) * 9;

		return `M ${startX} ${startY} Q ${(startX + endX) / 2 + px} ${(startY + endY) / 2 + py} ${endX} ${endY}`;
	}

	function arrowMark(arrow: WheelArrow, modulus: number): { x: number; y: number } {
		const from = dotAt(arrow.from, modulus);
		const to = dotAt(arrow.to, modulus);
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.hypot(dx, dy) || 1;
		const side = arrow.map === 'double' ? 1 : -1;

		return {
			x: (from.x + to.x) / 2 + (-dy / length) * 14 * side,
			y: (from.y + to.y) / 2 + (dx / length) * 14 * side
		};
	}
</script>

<div class="phase-canvas phase-canvas--{level} phase-prove">
	<span class="phase-canvas__rim">
		<span class="phase-canvas__rim-glyph" aria-hidden="true">{levelPresentation.glyph}</span>
		{levelPresentation.label}
	</span>

	<div class="proof-doc">
		<p class="worksheet__label">A proof about every derivation — verified arithmetic</p>

		<p class="proof-claim">
			<span class="proof-claim__word">Claim</span>MU is not derivable in the MIU system.
		</p>
		<p class="proof-claim-note">
			Search can't settle this — there are infinitely many derivations to check. But suppose
			some property holds for MI and no rule can break it. Then every derivable string has it,
			no matter how it was derived. If MU lacks that property, MU is unreachable.
		</p>

		<div class="proof-candidate">
			<div class="proof-candidate__row">
				<span class="proof-candidate__word">Candidate invariant</span>
				<input
					class="proof-candidate__input"
					type="text"
					aria-label="Candidate invariant"
					placeholder="count(I) mod 3 != 0"
					value={invariantCandidate}
					oninput={onUpdateInvariant}
				/>
				<button class="proof-candidate__builtin" type="button" onclick={onApplyBuiltIn}>
					⟲ use the built-in candidate
				</button>
			</div>
			{#if doc.supported}
				<p class="proof-purpose">
					The built-in settles the claim. The field is for the better question — why that one?
					Try the neighbors and watch where each snaps: every failure is a constraint the rules
					impose.
				</p>
				<p class="proof-candidate__note">
					supported forms: <code>count(I) mod k = r</code> · <code>count(I) mod k != r</code> —
					editing rewrites the argument below, live
				</p>
				<p class="proof-candidate__now">{doc.currentLine}</p>
			{:else}
				<p class="proof-candidate__note">{doc.unsupportedReason}</p>
			{/if}
		</div>

		{#if wheel}
			<div class="proof-wheel">
				<svg
					class="proof-wheel__figure"
					width="220"
					height="220"
					viewBox="0 0 220 220"
					role="img"
					aria-label={`The candidate's remainders mod ${wheel.modulus}: allowed remainders filled, with doubling and minus-3 arrows${wheelBroken ? '; a marked arrow escapes the allowed set' : '; every arrow stays inside the allowed set'}.`}
				>
					<defs>
						<marker id="wheel-head" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
							<path d="M0,0.5 L7,4 L0,7.5" fill="none" stroke="var(--line-strong)" stroke-width="1.5" />
						</marker>
						<marker id="wheel-head-escape" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
							<path d="M0,0.5 L7,4 L0,7.5" fill="none" stroke="var(--ink)" stroke-width="1.8" />
						</marker>
					</defs>

					{#each wheel.arrows as arrow (`${arrow.map}:${arrow.from}`)}
						<path
							class="wheel-arrow"
							class:wheel-arrow--minus3={arrow.map === 'minus3'}
							class:wheel-arrow--escape={arrow.escapes}
							d={arrowPath(arrow, wheel.modulus)}
							marker-end={arrow.escapes ? 'url(#wheel-head-escape)' : 'url(#wheel-head)'}
						/>
						{#if arrow.escapes && arrow.from !== arrow.to}
							{@const mark = arrowMark(arrow, wheel.modulus)}
							<text class="wheel-x" x={mark.x} y={mark.y}>✗</text>
						{/if}
					{/each}

					{#each wheel.allowed as isAllowed, residue (residue)}
						{@const dot = dotAt(residue, wheel.modulus)}
						{@const label = labelAt(residue, wheel.modulus)}
						<circle
							class="wheel-dot"
							class:wheel-dot--forbidden={!isAllowed}
							cx={dot.x}
							cy={dot.y}
							r="5"
						/>
						<text class="wheel-label" class:wheel-label--forbidden={!isAllowed} x={label.x} y={label.y}>
							{residue}
						</text>
					{/each}
				</svg>
				<div class="proof-wheel__side">
					<p class="worksheet__label">The candidate, seen as remainders mod {wheel.modulus}</p>
					<p class="proof-wheel__legend">
						<span class="proof-wheel__solid">⟶</span> doubling (R2) ·
						<span class="proof-wheel__dashed">⇢</span> minus 3 (R3) · filled = allowed
					</p>
					<p class="proof-wheel__caption">
						{#if wheelBroken}
							A marked arrow leaves the allowed set — that is the counterexample below, seen as
							remainders.
						{:else}
							Both maps keep the allowed remainders inside the allowed set — that is the whole
							proof, seen at once.
						{/if}
					</p>
				</div>
			</div>
		{/if}

		{#if doc.supported}
			<ol class="proof-clauses">
				{#each doc.clauses as clause (clause.num)}
					<li class="proof-clause" data-stamp={clause.stamp}>
						<span class="proof-clause__num">{clause.num}</span>
						<div class="proof-clause__body">
							<p class="proof-clause__head">
								{clause.head}{#if clause.pattern}<span class="proof-clause__pat"
										>{clause.pattern}</span
									>{/if}
							</p>
							<p class="proof-clause__text">{clause.text}</p>
							{#if clause.witness}
								<p class="proof-clause__witness">{clause.witness}</p>
							{/if}
						</div>
						<span class="proof-clause__stamp" aria-label={clause.stamp === 'pass' ? 'verified' : 'fails'}>
							{clause.stamp === 'pass' ? '✓' : '✗'}
						</span>
					</li>
				{/each}

				{#if doc.conclusion}
					<li class="proof-clause proof-clause--conclusion" data-stamp={doc.conclusion.stamp}>
						<span class="proof-clause__num">∴</span>
						<div class="proof-clause__body">
							<p class="proof-clause__head">{doc.conclusion.head}</p>
							<p class="proof-clause__text">{doc.conclusion.text}</p>
						</div>
						<span
							class="proof-clause__stamp"
							aria-label={doc.conclusion.stamp === 'pass' ? 'verified' : 'fails'}
						>
							{doc.conclusion.stamp === 'pass' ? '✓' : '✗'}
						</span>
					</li>
				{/if}
			</ol>

			<p class="proof-unique">
				Checked across every property of this form up to mod 12: {survivors.length === 1
					? `exactly one survives the four rules and excludes MU — ${survivors[0]}${
							doc.conclusion?.stamp === 'pass' ? '. You are holding it.' : '.'
						}`
					: `${survivors.length} survive the four rules and exclude MU.`}
			</p>
		{/if}

		<div class="proof-foot">
			<button type="button" onclick={onSaveInvariantArtifact}>save this invariant run</button>
			<button type="button" onclick={onSaveProofArtifact}>save this proof attempt</button>
			<span class="proof-foot__status">{artifactStatus}</span>
		</div>
	</div>
</div>
