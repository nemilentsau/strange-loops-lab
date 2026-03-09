<script lang="ts">
	let {
		currentString,
		stepCount,
		iCount,
		mod3Class,
		workingQuestion,
		invariantCandidate,
		onUpdateQuestion,
		onUpdateInvariant
	}: {
		currentString: string;
		stepCount: number;
		iCount: number;
		mod3Class: number;
		workingQuestion: string;
		invariantCandidate: string;
		onUpdateQuestion: (event: Event) => void;
		onUpdateInvariant: (event: Event) => void;
	} = $props();
</script>

<div class="context-strip">
	<div class="context-strip__state">
		<div class="context-strip__string">{currentString}</div>
		<div class="context-strip__metrics">
			<span class="context-metric" data-tone="verified">
				<span class="context-metric__label">steps</span>
				<span class="context-metric__value">{stepCount}</span>
			</span>
			<span class="context-metric" data-tone="verified">
				<span class="context-metric__label">I-count</span>
				<span class="context-metric__value">{iCount}</span>
			</span>
			<span class="context-metric" data-tone={mod3Class === 0 ? 'coaching' : 'verified'}>
				<span class="context-metric__label">mod 3</span>
				<span class="context-metric__value">{mod3Class}</span>
			</span>
		</div>
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
		<label class="context-field" for="ctx-invariant">
			<span class="context-field__label">Invariant</span>
			<input
				id="ctx-invariant"
				class="context-field__input"
				type="text"
				placeholder="e.g., count(I) mod 3 != 0"
				value={invariantCandidate}
				oninput={onUpdateInvariant}
			/>
		</label>
	</div>
</div>
