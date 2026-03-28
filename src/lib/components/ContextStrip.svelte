<script lang="ts">
	let {
		currentString,
		stepCount,
		iCount,
		mod3Class,
		phaseLabel,
		phaseEpistemicLabel,
		phaseCue,
		phaseTone,
		workingQuestion,
		onUpdateQuestion,
	}: {
		currentString: string;
		stepCount: number;
		iCount: number;
		mod3Class: number;
		phaseLabel: string;
		phaseEpistemicLabel: string;
		phaseCue: string;
		phaseTone: 'verified' | 'computed' | 'coaching';
		workingQuestion: string;
		onUpdateQuestion: (event: Event) => void;
	} = $props();
</script>

<div class="context-strip">
	<div class="context-strip__state">
		<div class="context-strip__string">{currentString}</div>
		<div class="context-strip__metrics">
			<span class="context-metric" data-tone="verified" title="Number of derivation steps from MI">
				<span class="context-metric__label">steps</span>
				<span class="context-metric__value">{stepCount}</span>
			</span>
			<span class="context-metric" data-tone="verified" title="Number of I characters in the current string">
				<span class="context-metric__label">I-count</span>
				<span class="context-metric__value">{iCount}</span>
			</span>
			<span class="context-metric" data-tone={mod3Class === 0 ? 'coaching' : 'verified'} title="I-count modulo 3 — key to the unreachability proof">
				<span class="context-metric__label">mod 3</span>
				<span class="context-metric__value">{mod3Class}</span>
			</span>
		</div>
	</div>

	<div class="context-strip__lens" data-tone={phaseTone}>
		<div class="context-strip__lens-top">
			<span class="badge" data-tone={phaseTone}>{phaseLabel}</span>
			<small>{phaseEpistemicLabel}</small>
		</div>
		<p>{phaseCue}</p>
	</div>

	<div class="context-strip__fields">
		<label class="context-field" for="ctx-question">
			<span class="context-field__label">Question</span>
			<input
				id="ctx-question"
				class="context-field__input"
				type="text"
				placeholder="e.g., Can we reach MU?"
				value={workingQuestion}
				oninput={onUpdateQuestion}
			/>
		</label>
	</div>
</div>
