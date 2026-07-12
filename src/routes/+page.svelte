<svelte:head>
	<title>Strange Loops Lab</title>
	<meta
		name="description"
		content="Interactive instruments testing structural connections between Gödel, Escher, Bach, modern mathematics, and machine learning."
	/>
</svelte:head>

<header class="lab-index__header">
	<div class="lab-index__masthead">
		<p class="microlabel">Interactive companion to Gödel, Escher, Bach</p>
		<h1>Strange Loops Lab</h1>
	</div>
	<div class="lab-index__introduction">
		<p>
			Strange Loops Lab is a set of interactive instruments testing structural connections
			between <i>Gödel, Escher, Bach</i>, modern mathematics, and machine learning.
		</p>
		<p>
			A connection enters only through a shared invariant, construction, obstruction, or proof
			template.
		</p>
	</div>
</header>

<div class="arc-index">
	<section class="arc-index__arc" id="form-and-meaning">
		<div class="arc-index__identity">
			<h2>Form and meaning</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				When does a system's form capture a truth, and where is the gap?
			</p>
			<ul class="instrument-list">
				<li class="instrument-entry instrument-entry--built">
					<a href="/form-and-meaning/miu">
						<span class="instrument-name">MIU</span>
						<span class="instrument-status">built</span>
					</a>
				</li>
				<li class="instrument-entry instrument-entry--next">
					<a href="/form-and-meaning/pq">
						<span class="instrument-name">pq</span>
						<span class="instrument-status">next</span>
					</a>
				</li>
				<li><span class="instrument-name">tq</span></li>
				<li><span class="instrument-name">consistency</span></li>
			</ul>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Self-reference</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				How does a system refer to itself, and what happens at a fixed point?
			</p>
			<ul class="instrument-list">
				<li><span class="instrument-name">recursion</span></li>
				<li><span class="instrument-name">quines</span></li>
				<li><span class="instrument-name">fixed points</span></li>
			</ul>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Reflection and incompleteness</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				What happens when a system reasons about its own provability?
			</p>
			<ul class="instrument-list">
				<li><span class="instrument-name">Gödel numbering</span></li>
				<li><span class="instrument-name">diagonal lemma</span></li>
				<li><span class="instrument-name">Löb</span></li>
				<li><span class="instrument-name">Tarski</span></li>
			</ul>
		</div>
	</section>

	<section class="arc-index__arc">
		<div class="arc-index__identity">
			<h2>Computation and information</h2>
		</div>
		<div class="arc-index__body">
			<p class="arc-index__question">
				What is uncomputable or incompressible, and what does that say about prediction?
			</p>
			<ul class="instrument-list">
				<li><span class="instrument-name">halting problem</span></li>
				<li><span class="instrument-name">Rice</span></li>
				<li><span class="instrument-name">Kolmogorov</span></li>
				<li><span class="instrument-name">Chaitin</span></li>
			</ul>
		</div>
	</section>
</div>
