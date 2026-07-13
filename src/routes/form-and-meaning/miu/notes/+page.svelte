<svelte:head>
	<title>Strange Loops Lab | MIU notes</title>
</svelte:head>

<nav class="instrument-breadcrumb" aria-label="Instrument location">
	<a href="/">Strange Loops Lab</a>
	<span aria-hidden="true">/</span>
	<a href="/#form-and-meaning">Form and meaning</a>
	<span aria-hidden="true">/</span>
	<a href="/form-and-meaning/miu">MIU</a>
	<span aria-hidden="true">/</span>
	<span aria-current="page">Notes</span>
</nav>

<header class="instrument-header">
	<h1>MIU system — notes</h1>
	<p>Full statements and proofs behind the instrument</p>
</header>

<div class="notes">
	<div class="notes-front">
		<p class="microlabel">What is checked, what is cited</p>
		<p>
			Two kinds of statement appear below. Statements about this machine — the characterization
			of Th(MIU), the invariant, the program code, the search bounds — are implemented and
			mechanically checked in the instrument's source (<span class="o">src/lib/miu</span>).
			Classical theorems — Kraft's inequality, the invariance theorem, Chaitin's incompleteness
			— are cited with sources and proved elsewhere; nothing this machine does establishes them.
		</p>
	</div>

	<section class="notes-section" id="the-system">
		<h2>§0 The system</h2>
	</section>

	<section class="notes-section" id="theoremhood">
		<h2>§1 Theoremhood and construction</h2>
	</section>

	<section class="notes-section" id="invariant">
		<h2>§2 The invariant and the characters of ℤ/3</h2>
	</section>

	<section class="notes-section" id="programs">
		<h2>§3 Programs and description length</h2>
	</section>

	<section class="notes-section" id="universality">
		<h2>§4 The passage to universality</h2>
	</section>
</div>
