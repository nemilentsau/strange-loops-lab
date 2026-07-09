<script lang="ts">
	import MiuCharacters from './MiuCharacters.svelte';
	import {
		analyzeInvariantCandidate,
		builtInInvariantAnalysis
	} from '$lib/miu/invariants';
	import type { MiuRuleId } from '$lib/miu/core';

	const certificate = builtInInvariantAnalysis('MI');
	const certificateHolds =
		certificate.kind === 'supported' && certificate.currentSatisfied && certificate.preserved;

	const RULE_PROOF: Array<{ ruleId: MiuRuleId; pattern: string; why: string }> = [
		{ ruleId: 'append-u', pattern: 'xI → xIU', why: 'r unchanged' },
		{ ruleId: 'double-tail', pattern: 'Mx → Mxx', why: 'r: 1 and 2 swap' },
		{ ruleId: 'replace-iii', pattern: 'III → U', why: 'I drops by 3; r unchanged' },
		{ ruleId: 'delete-uu', pattern: 'UU → ∅', why: 'r unchanged' }
	];

	const CANDIDATES = [
		{
			input: 'count(I) mod 2 != 0',
			form: 'I(s) mod 2 is nonzero',
			why: 'R2 can send residue 1 to residue 0.'
		},
		{
			input: 'count(I) mod 4 != 0',
			form: 'I(s) mod 4 is nonzero',
			why: 'R2 can send residue 2 to residue 0.'
		},
		{
			input: 'count(I) mod 5 != 0',
			form: 'I(s) mod 5 is nonzero',
			why: 'R3 subtracts 3, so residue 3 becomes 0.'
		},
		{
			input: 'count(I) mod 3 != 0',
			form: 'I(s) mod 3 is 1 or 2',
			why: 'R2 swaps 1 and 2; R1, R3, and R4 leave the residue fixed.'
		}
	].map((candidate) => {
		const analysis = analyzeInvariantCandidate(candidate.input, 'MI');
		return {
			...candidate,
			holds:
				analysis.kind === 'supported' && analysis.currentSatisfied && analysis.preserved
		};
	});

	function rulePreserved(ruleId: MiuRuleId): boolean {
		return certificate.ruleResults.find((result) => result.ruleId === ruleId)?.preserved ?? false;
	}

	function ruleNumber(ruleId: MiuRuleId): number {
		return ['append-u', 'double-tail', 'replace-iii', 'delete-uu'].indexOf(ruleId) + 1;
	}
</script>

<p class="inv-notation">
	<span class="m">I(s)</span> = the number of <b>I</b>'s in <b>s</b>.
	<span class="m">r(s)</span> = <span class="m">I(s)</span> mod 3.
</p>

<div class="result">
	<p class="result__line">
		<span class="result__label">Result</span>
		<span class="certificate-line"><span class="certificate-stamp" aria-label={certificateHolds ? 'verified' : 'failed'}>{certificateHolds ? '✓' : '✗'}</span><span>No derivation from <b>MI</b> reaches <b>MU</b>.</span></span>
	</p>
	<p class="result__line">
		<span class="result__label">Certificate</span>
		<span><span class="m">r(s)</span> is invariant under the four rules. Every theorem has
			<span class="m">r(s) &isin; {'{'}1, 2{'}'}</span>, while <span class="m">r(MU) = 0</span>.</span>
	</p>
</div>

<div class="inv-proof">
	<div class="inv-proof__row">
		<span class="inv-proof__label">Base</span>
		<p class="certificate-line"><span class="certificate-stamp" aria-label={certificate.currentSatisfied ? 'verified' : 'failed'}>{certificate.currentSatisfied ? '✓' : '✗'}</span><span><span class="m">MI</span> has one <b>I</b>, so <span class="m">I(MI) = 1</span> and
			<span class="m">r(MI) = 1</span>.</span></p>
	</div>
	<div class="inv-proof__row inv-proof__row--step">
		<span class="inv-proof__label">Step</span>
		<div class="inv-rules">
			{#each RULE_PROOF as rule (rule.ruleId)}
				<div>
					<span class="m">R{ruleNumber(rule.ruleId)}</span>
					<span class="m">{rule.pattern}</span>
					<span class="inv-rules__why"><span class="certificate-stamp" aria-label={rulePreserved(rule.ruleId) ? 'preserved' : 'failed'}>{rulePreserved(rule.ruleId) ? '✓' : '✗'}</span>{rule.why}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="inv-proof__row">
		<span class="inv-proof__label">Conclusion</span>
		<p><span class="m">{'{'}1, 2{'}'}</span> is closed under all four rules. Since
			<span class="m">r(MI) = 1</span>, every derivation from <span class="m">MI</span> stays outside
			residue 0.</p>
	</div>
</div>

<div class="nontheorems">
	<p class="worksheet__label">Strings ruled out by the invariant</p>
	<p class="nontheorems__list">MU · MUU · MIII · MUIIIU · MIIIUUU · …</p>
	<p class="nontheorems__def">
		If <span class="m">I(s) &equiv; 0 (mod 3)</span>, then
		<span class="m">s &notin; Th(MIU)</span>.
	</p>
	<p class="nontheorems__note">
		Among strings of the form <span class="m">M{'{'}I,U{'}'}<sup>+</sup></span>, the converse
		also holds. A constructive witness expands each target U to III, grows a compatible
		power-of-two I-run, removes excess triples and U-pairs, and contracts the target triples.
	</p>
</div>

<MiuCharacters />

<div class="candidates-wrap">
	<p class="worksheet__label">Why modulus 3</p>
	<div class="candidates">
		{#each CANDIDATES as candidate (candidate.form)}
			<div class="candidate" data-holds={candidate.holds}>
				<span class="candidate__stamp" aria-hidden="true">{candidate.holds ? '✓' : '✗'}</span>
				<span class="candidate__form">{candidate.form}</span>
				<span class="candidate__why">{candidate.why}</span>
			</div>
		{/each}
	</div>
</div>
