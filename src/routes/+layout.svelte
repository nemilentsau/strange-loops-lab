<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Strange Loops Lab</title>
	<meta
		name="description"
		content="An interactive companion to Godel, Escher, Bach built as a serious mathematical laboratory."
	/>
</svelte:head>

<div class="site-shell">
	<main class="site-main">
		{@render children()}
	</main>
</div>
