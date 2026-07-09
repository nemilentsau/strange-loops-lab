# Strange Loops Lab — Research Directions Review

**Status:** advisory review, July 9, 2026. This document records suggestions; it
does not supersede `docs/strange-loops-vision.md` or
`docs/bridge-ledger.md`. If a suggestion is accepted, move the corresponding
decision into those binding documents and update this review's disposition.

## 1. Assessment

The project now has a durable identity: it is a research laboratory that tests
whether a construction from *Gödel, Escher, Bach* has a structural counterpart
in modern mathematics or ML/AI. The connection gate is the center of the work.
It is stronger than organizing the project as a sequence of lessons because it
can produce positive bridges, deferred questions, and verified failures.

The first MIU instrument also establishes an effective interaction grammar:
one mathematical object is manipulated and then read at several altitudes.
The derivation is a theorem witness, its residue exposes an obstruction, and its
length suggests a descriptional-complexity reading. This is a better base for
future work than a shared page template or phase sequence.

The main risk is that the roadmap and bridge ledger are beginning to claim more
structure than the built instruments expose. The next pass should tighten the
mathematics already on the page, then cross the ML boundary with an empirical
instrument. More candidate accumulation would be premature until the second
instrument tests whether the method transfers.

## 2. Immediate mathematical and product gaps

### 2.1 Complete the theoremhood argument

The root page states that theoremhood in MIU is decidable. The displayed
invariant proves the necessary direction:

> If the number of I's is divisible by 3, the string is not a theorem.

The invariant section then states that, among well-formed MIU strings, the
condition is also sufficient, but the construction proving the converse is not
shown. That missing construction is not a footnote. It is the piece that turns
an obstruction into a decision procedure.

The instrument should separate three questions:

1. **Decision:** is `s` in `Th(MIU)`?
2. **Search:** produce a derivation of `s` when one exists.
3. **Optimization:** produce a shortest derivation and compute `K_MIU(s)`.

This would make a useful fact visible: membership can be easy to decide even
when finding or optimizing a witness is expensive. It also gives the later LLM
proposer/verifier work a more exact experimental frame.

**Acceptance condition:** every well-formed target receives a theoremhood
verdict from the characterization, while bounded breadth-first search affects
only whether a shortest witness has been found. Search exhaustion must not
erase a theoremhood result already established by the decision procedure.

### 2.2 Make the description-length cost model explicit

The current definition calls a rule-and-site choice an instruction, but the
specimen table displays only rule names. For rules with several legal sites,
the displayed sequence is not an executable program. The comparison also sets
a number of moves against a number of string symbols without specifying a
common code.

Two quantities would expose the issue cleanly:

- `K_steps(s)`: the minimum number of rewrite moves from `MI` to `s`;
- `K_bits(s)`: the minimum encoded length of an executable sequence of
  rule-and-site instructions under a stated prefix code.

Keeping only the first quantity is defensible, but it should then be named
shortest derivation depth rather than treated as a bit-level description
length. Building both would make machine dependence, instruction coding, MDL,
and the eventual invariance theorem tangible.

**Acceptance condition:** every displayed program can be replayed without
additional choices, and any comparison called compression uses declared units.

### 2.3 Build the characters of Z/3 before claiming the Fourier bridge

The bridge ledger says that the residue wheel draws the characters of `Z/3`.
The current invariant surface is a written induction over residues; it does not
construct the dual group or display its characters. A residue diagram alone
would still not be a character construction.

The missing object is

```text
chi_k(n) = exp(2 pi i k n / 3),  k = 0, 1, 2.
```

The instrument can show how the MIU rules act on residue classes and, dually,
on characters. In particular, doubling modulo 3 swaps the two nontrivial
characters under pullback. The indicator of the forbidden residue can be
written in the Fourier basis. Once that construction is present, it can be set
against the Fourier modes learned by a model trained on addition modulo `p`.

This makes the pq/grokking bridge exact: the same group characters are computed
on both sides, rather than a residue picture being placed next to a Fourier
analysis.

**Acceptance condition:** the MIU side contains an actual character table or
equivalent discrete Fourier transform, and the pq side extracts the same kind
of object from model artifacts.

### 2.4 Settle the epistemic registers before the first measured surface

The vision and README name three registers: verified, measured, and coaching.
The architecture document also names computed as a fourth output class, while
the CSS commentary predates the measured register. Before pq/grokking, decide
whether computed is:

- a separate epistemic class; or
- a provenance qualifier within verified or measured output.

The second interpretation is cleaner. A deterministic transformation of
verified inputs can remain verified when the transformation and claim are
checked. A deterministic analysis of trained weights is still part of a
measured result because the weights arose from an empirical run.

**Acceptance condition:** training curves, supplied weights, extracted Fourier
components, deterministic transforms, and theorem-like claims each have one
unambiguous register and visual treatment.

### 2.5 Restore one source of truth for the invariant

The shipped `MiuInvariant.svelte` contains authored candidate verdicts and proof
text, while `src/lib/miu/invariants.ts` and
`src/lib/state/module1Proof.ts` retain deterministic invariant and proof
machinery. Either authored proof text or verifier-generated analysis can be the
right choice, but parallel truth sources invite drift.

The mathematical propositions should live in one deterministic boundary. The
component may still contain deliberately written exposition, but pass/fail
claims and counterexamples should be derived from that boundary or covered by
direct equivalence tests.

## 3. Recommended build order

### 3.1 MIU completion pass

This is a mathematical completion pass, not another visual-polish cycle:

1. expose the sufficiency construction and separate decision from search;
2. make displayed derivation programs executable and settle the cost model;
3. construct the characters of `Z/3`;
4. resolve the invariant source-of-truth and epistemic-register drift.

Stop when these claims are exact. Do not expand MIU into another self-contained
module.

### 3.2 pq / modular addition ↔ grokking

Keep this as the next full instrument. It is the correct second site because it
does three jobs at once:

- supplies the coherent counterpart to MIU's wall;
- creates the first measured surface;
- crosses from formal systems into an actual learned representation.

The most informative artifact is not only a trained model. Ship several
checkpoints and let the reader inspect the transition through memorization,
circuit formation, and cleanup. At each checkpoint, show:

- training and test loss;
- Fourier energy in the relevant weights or activations;
- performance after ablating the identified Fourier modes;
- the run configuration and seed.

The reader should be able to predict what structure will appear, inspect the
weights, and then test the proposed circuit by intervention. That is a
laboratory procedure, not a model demo.

Primary reference: [Nanda et al., *Progress measures for grokking via
mechanistic interpretability*](https://arxiv.org/abs/2301.05217).

### 3.3 Extensions of the MIU bridge

Prefer the language-model-as-compressor construction before the chain-of-thought
bridge. Arithmetic coding gives an exact operational connection between a
predictive distribution and code length. It can be built first with a
deterministic predictor, then repeated with an LLM as a measured experiment.

The proposer/verifier experiment is also worthwhile, but its claim should be
narrow:

- compare exhaustive search, a heuristic searcher, and an LLM proposer;
- verify every proposed derivation mechanically;
- compare validity rate, search cost, and found length against the optimum where
  it is available.

On MIU, this studies proof search and optimization. It does not by itself
instantiate the recursively-enumerable-versus-recursive obstruction. A later
universal rewriting system can carry that stronger computability claim.

The chain-of-thought bridge should remain deferred or a labeled analogy until
there is a reduction or controlled experiment connecting intermediate decoding
steps to the resource measured by a formal derivation. The relevant transformer
result is real, but step count is a resource rather than a shared invariant.

Primary reference: [Merrill and Sabharwal, *The Expressive Power of Transformers
with Chain of Thought*](https://arxiv.org/abs/2310.07923).

## 4. New bridge candidates

### 4.1 Sparse coding / compressed sensing ↔ superposition

**Recommendation:** strongest new candidate for the main backlog.

**Gate class:** shared construction and shared inverse problem.

**Small instrument:** generate sparse latent features, mix them into fewer
dimensions, and show how individual coordinates become polysemantic. Recover
the latent dictionary with sparse coding or a sparse autoencoder. Because the
synthetic ground truth is known, recovery quality can be measured exactly.
Then apply the same decomposition and interventions to activations from a small
transformer.

**Mathematical destinations:** overcomplete bases, convex geometry, mutual
coherence, sparse recovery, identifiability, phase transitions, and dictionary
learning.

**Frontier-AI destination:** sparse autoencoders and feature superposition in
language-model interpretability. The method has been demonstrated from toy
models and one-layer transformers through Claude 3 Sonnet.

**Epistemic split:** synthetic recovery against known features can be verified;
training results and decompositions of language-model activations are measured;
semantic labels for recovered features remain interpretations, not proofs.

**Kill condition:** reject or narrow the bridge if the same recovery problem is
not actually present on both sides, or if apparent feature quality survives no
causal intervention.

Primary references:

- [Elhage et al., *Toy Models of Superposition*](https://arxiv.org/abs/2209.10652)
- [Bricken et al., *Towards Monosemanticity*](https://transformer-circuits.pub/2023/monosemantic-features/)
- [Templeton et al., *Scaling Monosemanticity*](https://transformer-circuits.pub/2024/scaling-monosemanticity/)

### 4.2 Singular learning theory ↔ training phase transitions

**Recommendation:** reopen as a branch of pq/grokking, not yet as an independent
instrument.

The earlier deferral was correct because the ledger lacked a small end-to-end
example with a computable real log canonical threshold or local learning
coefficient. Recent preprint work derives closed-form local learning
coefficients for quadratic networks trained on modular arithmetic and compares
them with measured grokking dynamics. If the derivation is reproducible at the
scale of this project, it may supply the missing worked example.

This path reaches algebraic geometry of singular statistical models, Bayesian
asymptotics, effective complexity, and phase transitions while remaining tied
to the same modular-arithmetic experiment.

**Kill condition:** keep it deferred if the local learning coefficient can only
be estimated as another opaque curve, rather than derived and checked in a
small model.

Primary references:

- [Lau et al., *The Local Learning Coefficient: A Singularity-Aware Complexity
  Measure*](https://arxiv.org/abs/2308.12108)
- [Cullen et al., *Grokking as a Phase Transition between Competing Basins: a
  Singular Learning Theory Approach*](https://arxiv.org/abs/2603.01192) — 2026
  preprint; treat as current research, not settled theory.

### 4.3 Interactive proofs ↔ scalable oversight

**Recommendation:** strongest later extension of generation against
verification.

**Gate class:** shared construction — a computationally bounded verifier
interacts with a more capable but untrusted prover under a protocol with stated
soundness and completeness properties.

**Small instrument:** implement a classical protocol such as graph
non-isomorphism or sum-check. First run it with exact algorithmic provers. Then
allow an LLM or learned prover to participate while the verifier remains
deterministic. The transcript itself is the mathematical object.

This reaches randomized complexity, proof systems, zero knowledge,
prover-verifier games, debate, and scalable oversight without treating the LLM
as an authority.

**Kill condition:** do not call ordinary answer-checking an interactive proof.
The protocol must expose what interaction or randomness lets the bounded
verifier establish that it could not efficiently establish alone.

Primary reference: [Hammond and Adam-Day, *Neural Interactive
Proofs*](https://arxiv.org/abs/2412.08897).

### 4.4 Tropical geometry ↔ ReLU networks

Keep this as a visually strong side instrument. A small integer-weight ReLU
network can be translated into a tropical rational map; its linear regions can
be set against the corresponding polyhedral structure. The bridge is exact and
buildable, but it connects more directly to neural-network geometry than to
frontier language models, so it should not displace pq/grokking or
superposition on the main path.

Primary reference: [Zhang, Naitzat, and Lim, *Tropical Geometry of Deep Neural
Networks*](https://arxiv.org/abs/1805.07091).

## 5. Make the bridge ledger more adversarial

The ledger should record not only why a bridge might work, but how it could
fail. Add these fields to every active candidate:

- **Exact claim:** one sentence that can be true or false.
- **Shared object:** the invariant, character, reduction, protocol, or other
  construction that appears on both sides.
- **Smallest build:** the minimum worked example that exercises the claim.
- **Falsifier:** the observation that would demote or reject the bridge.
- **Evidence:** artifact paths, run configuration, and primary sources.
- **Disposition:** built, next, identified, deferred, sidebar, or rejected.

Suggested disposition changes:

- keep pq/grokking as **next**, after correcting the `Z/3` character claim;
- keep the Minsky–Papert expressivity wall as **identified** until its complete
  proof template is worked through in a small example;
- move derivation length / chain of thought to **deferred** or **sidebar** until
  an experiment or reduction earns it;
- keep generation against verification as **identified**, but frame the MIU
  version as search and optimization rather than recursive enumerability;
- add sparse coding / superposition as **identified**;
- reopen singular learning theory for a small-example audit;
- add interactive proofs as **identified** or **deferred**, depending on whether
  a protocol-sized first build is selected.

A gate with no recorded rejections has not yet demonstrated its selectivity.
Intentionally run at least one bridge-killing experiment. A failed connection is
not lost work; it is evidence that the method is functioning.

## 6. Keep the work fun without making it a game

Fun here should come from discovery and surprise rather than reward chrome.
Several recurring laboratory practices can create that:

- **Prediction before reveal.** Record which Fourier modes, sparse features, or
  circuits are expected before inspecting the trained artifact.
- **Checkpoint archaeology.** Scrub through training and identify when a
  mathematical object first becomes legible.
- **Intervention over resemblance.** Ablate, patch, or replace the proposed
  structure and observe whether behavior changes as predicted.
- **Bridge cemetery.** Preserve failed constructions with the exact point of
  failure; make rejected analogies browsable research results.
- **Instrument duets.** Put two small systems beside each other only when the
  same operation can be performed on both. The contrast should do explanatory
  work that neither side can do alone.
- **Field notes.** After each build, record what was expected, what was measured,
  what survived the gate, and what became a new question.

## 7. Proposed immediate decisions

1. Approve or reject the MIU completion pass before starting pq/grokking.
2. Write the exact `Z/3` character construction into the bridge ledger before
   designing the pq comparison.
3. Decide whether `K_MIU` means unit-cost derivation depth or encoded program
   length.
4. Resolve the three-register versus four-output-class distinction.
5. Add falsifiers to every `next` and `identified` ledger entry.
6. Choose one new frontier-AI bridge for the backlog. Sparse coding /
   superposition is the recommended choice.

The central constraint remains: build the second instrument before extracting a
general instrument framework. The pq/grokking build is the test of whether the
current structure is a research method rather than a description of one
successful MIU page.
