<script lang="ts">
	import MiuCharacters from './MiuCharacters.svelte';
	import { analyzeInvariantCandidate, builtInInvariantAnalysis } from '$lib/miu/invariants';
	import type { MiuRuleId } from '$lib/miu/core';

	const certificate = builtInInvariantAnalysis('MI');
	const certificateHolds =
		certificate.kind === 'supported' && certificate.currentSatisfied && certificate.preserved;

	const RULE_PROOF: Array<{ ruleId: MiuRuleId; pattern: string; why: string }> = [
		{ ruleId: 'append-u', pattern: 'xI → xIU', why: 'I unchanged' },
		{ ruleId: 'double-tail', pattern: 'Mx → Mxx', why: 'r doubles — residues 1 and 2 swap' },
		{ ruleId: 'replace-iii', pattern: 'III → U', why: 'I drops by 3 — r unchanged' },
		{ ruleId: 'delete-uu', pattern: 'UU → ∅', why: 'I unchanged' }
	];

	const CANDIDATES = [
		{
			input: 'count(I) mod 2 != 0',
			modulus: 2,
			why: 'fails — R2 doubles the count, sending every residue to 0.'
		},
		{
			input: 'count(I) mod 4 != 0',
			modulus: 4,
			why: 'fails — R2 sends residue 2 to 0.'
		},
		{
			input: 'count(I) mod 5 != 0',
			modulus: 5,
			why: 'fails — R3 subtracts 3, sending residue 3 to 0.'
		},
		{
			input: 'count(I) mod 3 != 0',
			modulus: 3,
			why: 'holds — R2 swaps residues 1 and 2; R1, R3, R4 fix the residue.'
		}
	].map((candidate) => {
		const analysis = analyzeInvariantCandidate(candidate.input, 'MI');
		return {
			...candidate,
			holds: analysis.kind === 'supported' && analysis.currentSatisfied && analysis.preserved
		};
	});

	function rulePreserved(ruleId: MiuRuleId): boolean {
		return certificate.ruleResults.find((result) => result.ruleId === ruleId)?.preserved ?? false;
	}

	function ruleNumber(ruleId: MiuRuleId): number {
		return ['append-u', 'double-tail', 'replace-iii', 'delete-uu'].indexOf(ruleId) + 1;
	}
</script>

<div class="cert-grid">
	<div class="cert-main">
		<p class="lede">
			To prove <span class="mv">s</span> <span class="mv">∈</span> Th(MIU), give a derivation
			<span class="o">MI</span> <span class="mv">⇒</span> <span class="mv">s</span>. To prove
			<span class="mv">s</span> <span class="mv">∉</span> Th(MIU), give a certificate: a property
			that holds at <span class="o">MI</span>, is preserved by R1–R4, and fails for
			<span class="mv">s</span>. For <span class="o">MU</span>, the certificate is the count of
			<span class="o">I</span>'s modulo&nbsp;3. Write <span class="mv">I(s)</span> for that count
			and <span class="mv">r(s)</span> = <span class="mv">I(s)</span> mod 3.
		</p>

		<div class="result">
			<p>
				<span class="stamp" aria-label={certificateHolds ? 'verified' : 'failed'}
					>{certificateHolds ? '✓' : '✗'}</span
				>
				<span class="leadin"><b>Theorem.</b></span> No derivation from <span class="o">MI</span>
				reaches <span class="o">MU</span>.
			</p>
			<p>
				<span class="leadin">Certificate.</span> <span class="mv">r</span> is invariant under the
				four rules; every theorem has <span class="mv">r(s)</span> ∈ {'{'}1, 2{'}'}, while
				<span class="mv">r(</span><span class="o">MU</span><span class="mv">)</span> = 0.
			</p>
		</div>

		<div class="proof">
			<p>
				<span class="leadin">Proof.</span> <span class="leadin">Base.</span>
				<span class="o">MI</span> has one <span class="o">I</span>, so
				<span class="mv">r(</span><span class="o">MI</span><span class="mv">)</span> = 1.
				<span class="stamp" aria-label={certificate.currentSatisfied ? 'verified' : 'failed'}
					>{certificate.currentSatisfied ? '✓' : '✗'}</span
				>
			</p>
			<p>
				<span class="leadin">Step.</span> Each rule preserves <span class="mv">r(s)</span> ∈
				{'{'}1, 2{'}'}:
			</p>
			<div class="proof-rules">
				{#each RULE_PROOF as rule (rule.ruleId)}
					<div>
						<span class="mv">R{ruleNumber(rule.ruleId)}</span>
						<span class="o">{rule.pattern}</span>
						<span class="proof-why"
							><span
								class="stamp"
								aria-label={rulePreserved(rule.ruleId) ? 'preserved' : 'failed'}
								>{rulePreserved(rule.ruleId) ? '✓' : '✗'}</span
							>{rule.why}</span
						>
					</div>
				{/each}
			</div>
			<p>
				<span class="leadin">Conclusion.</span> {'{'}1, 2{'}'} is closed under the four rules and
				<span class="mv">r(</span><span class="o">MI</span><span class="mv">)</span> = 1, so every
				derivation from <span class="o">MI</span> stays outside residue 0. Since
				<span class="mv">r(</span><span class="o">MU</span><span class="mv">)</span> = 0,
				<span class="o">MU</span> is unreachable. ∎
			</p>
		</div>
	</div>

	<div class="cert-side">
		<div class="ruledout">
			<p class="microlabel">Strings ruled out by the invariant</p>
			<p class="ruledout__list">MU · MUU · MIII · MUIIIU · MIIIUUU · …</p>
			<p class="ruledout__def">
				If <span class="mv">I(s)</span> ≡ 0 (mod 3), then <span class="mv">s</span>
				<span class="mv">∉</span> Th(MIU).
			</p>
			<p class="ruledout__note">
				Among strings of the form <span class="o">M{'{'}I,U{'}'}</span><sup>+</sup>, the converse
				also holds: a constructive witness expands each target <span class="o">U</span> to
				<span class="o">III</span>, grows a compatible power-of-two <span class="o">I</span>-run,
				removes excess triples and <span class="o">U</span>-pairs, and contracts the target
				triples.
			</p>
		</div>

		<div>
			<p class="microlabel">Why modulus 3</p>
			<div class="candidates">
				{#each CANDIDATES as candidate (candidate.modulus)}
					<div class="candidate" data-holds={candidate.holds}>
						<span class="stamp" aria-hidden="true">{candidate.holds ? '✓' : '✗'}</span>
						<span class="candidate__form"
							><span class="mv">I(s)</span> ≢ 0 (mod {candidate.modulus})</span
						>
						<span class="candidate__why">{candidate.why}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<MiuCharacters />
