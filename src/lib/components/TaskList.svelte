<script lang="ts">
	// Compact guided-task rows shared by every phase's guide rail. One line each
	// (caret + title + a quiet action affordance); body text reveals on click.
	// Untoned — these are prompts, not verified results.
	//
	// Tasks arrive as data. The per-row action label, disabled state, and click
	// handler all ride on the task object, so this component stays presentational
	// and owns nothing but the expand/collapse toggle.
	export interface TaskListItem {
		title: string;
		body: string;
		/** Label for the per-row action button (e.g. "Use", "Focus"). */
		actionLabel: string;
		/** Data-driven disable for the action (e.g. no node to focus yet). */
		disabled?: boolean;
		/** Invoked when the learner triggers the row's action. */
		onUse: () => void;
	}

	let { tasks, idPrefix }: { tasks: TaskListItem[]; idPrefix: string } = $props();

	// Which row is expanded. Presentational only — no draft state.
	let expandedTask = $state<number | null>(null);

	function toggleTask(index: number) {
		expandedTask = expandedTask === index ? null : index;
	}
</script>

<div class="task-list">
	{#each tasks as task, index}
		<div class="task-row" data-expanded={expandedTask === index}>
			<div class="task-row__head">
				<button
					class="task-row__toggle"
					type="button"
					aria-expanded={expandedTask === index}
					aria-controls="{idPrefix}-task-body-{index}"
					onclick={() => toggleTask(index)}
				>
					<span class="task-row__caret" aria-hidden="true">
						{expandedTask === index ? '▾' : '▸'}
					</span>
					<span class="task-row__title">{task.title}</span>
				</button>
				<button
					class="button button--ghost button--sm task-row__use"
					type="button"
					onclick={task.onUse}
					disabled={task.disabled}
				>
					{task.actionLabel}
				</button>
			</div>
			{#if expandedTask === index}
				<p class="task-row__body" id="{idPrefix}-task-body-{index}">{task.body}</p>
			{/if}
		</div>
	{/each}
</div>
