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
	<header class="site-topbar">
		<a class="site-mark" href="/">
			<span class="site-mark__glyph">SL</span>
			<span class="site-mark__text">
				<strong>Strange Loops Lab</strong>
				<small>Interactive companion</small>
			</span>
		</a>

		<nav class="site-nav" aria-label="Primary">
			<a href="/">Overview</a>
			<a href="/modules/module-1">Module 1</a>
		</nav>
	</header>

	<main class="site-main">
		{@render children()}
	</main>
</div>
