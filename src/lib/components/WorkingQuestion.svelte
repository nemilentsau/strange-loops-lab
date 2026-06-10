<script lang="ts">
	// The learner's working question. Global session state, editable from the top
	// of every phase's guide rail (Explore, Map, Prove, Reflect). Presentational
	// only — the value and its handler live in the page.
	let {
		workingQuestion,
		onUpdateQuestion
	}: {
		workingQuestion: string;
		onUpdateQuestion: (event: Event) => void;
	} = $props();
</script>

<label class="working-question" for="working-question-input">
	<span class="working-question__label">Your working question</span>
	<input
		id="working-question-input"
		class="text-field working-question__input"
		type="text"
		placeholder="What are you trying to find out?"
		value={workingQuestion}
		oninput={onUpdateQuestion}
	/>
</label>
