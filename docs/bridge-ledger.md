# Bridge Ledger

This ledger records the connection gate from `docs/strange-loops-vision.md`
§5. A candidate advances only when its exact claim survives a minimum
construction. Failed claims remain here as verified negatives.

Statuses: **built** (instrument shipped) · **next** (construction scheduled) ·
**identified** (construction specified, unscheduled) · **deferred** (the
minimum construction is not yet available) · **sidebar** (labeled analogy) ·
**rejected** (the stated claim failed its gate).

## Built

### MIU derivation programs ↔ description length

- **Exact claim:** A valid MIU derivation is an executable program for its
  terminal string, so minimum encoded derivation length is a description length
  relative to the fixed MIU machine.
- **Gate class:** construction.
- **Shared object:** An instruction sequence interpreted both as a path in the
  MIU rewrite graph and as a code that outputs a string.
- **Smallest build:** Decide theoremhood constructively, expose shortest move
  count `K_steps`, minimize an executable prefix code as `K_bits`, and compare
  `K_bits` with a literal code for the same string.
- **Falsifier:** The encoded instruction sequence cannot be decoded and replayed
  to the target, or the claimed minimum is taken under an unspecified code.
- **Evidence:** `src/lib/miu/core.ts`, `src/lib/miu/complexity.ts`, and the MIU
  exactness implementation specified in
  `docs/superpowers/plans/2026-07-09-miu-exactness-foundations.md`.
- **Status:** built; the `K_bits` extension is the active exactness pass.

## Next

### pq / modular addition ↔ grokking Fourier circuits

- **Exact claim:** The characters of a cyclic group are the common basis used
  by the pq interpretation and by a trained modular-addition network's learned
  Fourier circuit.
- **Gate class:** construction.
- **Shared object:** The character table of ℤ/p and its Fourier coefficients.
- **Smallest build:** Construct the characters of ℤ/3 on the MIU side, then
  train one shallow model on addition modulo p and extract its Fourier
  components from shipped weights.
- **Falsifier:** The trained model does not use a character-basis circuit, or
  the two displays only share periodic appearance without sharing characters.
- **Evidence:** Nanda et al., [*Progress measures for grokking via mechanistic
  interpretability*](https://arxiv.org/abs/2301.05217), and
  `src/lib/miu/characters.ts` once the prerequisite construction ships.
- **Status:** next; blocked on the explicit ℤ/3 character construction in the
  MIU exactness pass.

## Identified

### Invariant ↔ expressivity wall (Minsky–Papert)

- **Exact claim:** The MIU reachability proof and the bounded-order perceptron
  parity lower bound instantiate the same template: symmetrize by a group
  action, pass to a quotient statistic, and prove the target lies outside the
  permitted class.
- **Gate class:** shared template.
- **Shared object:** A group-invariant quotient of the original state space.
- **Smallest build:** Put the MIU residue proof beside the Minsky–Papert
  symmetrization of a bounded-order parity discriminant to a polynomial in
  Hamming weight.
- **Falsifier:** The far-side proof requires a different obstruction, such as a
  Lipschitz or random-restriction argument, rather than the stated quotient
  template.
- **Evidence:** Minsky and Papert, *Perceptrons* (expanded edition, 1988), and
  `src/lib/miu/invariants.ts`.
- **Status:** identified.

### Language model as compressor

- **Exact claim:** A probabilistic next-symbol predictor can be converted into
  a lossless compressor whose code length is determined by its assigned
  probabilities.
- **Gate class:** construction.
- **Shared object:** The probability distribution used both for prediction and
  for arithmetic coding.
- **Smallest build:** Drive an arithmetic coder first with a deterministic
  n-gram or PPM predictor, verify round-trip decoding, and only then substitute
  an LLM predictor as a measured comparison.
- **Falsifier:** The decoder cannot reconstruct the input from the predictor and
  bitstream, or the reported compression number omits model and protocol
  assumptions.
- **Evidence:** Delétang et al., [*Language Modeling Is
  Compression*](https://arxiv.org/abs/2309.10668), and the fixed-code discipline
  in `docs/superpowers/plans/2026-07-09-miu-exactness-foundations.md`.
- **Status:** identified.

### Sparse coding / superposition

- **Exact claim:** Sparse coding and feature superposition can be compared
  structurally through recovery of latent directions from an overcomplete
  representation under an explicit sparsity assumption.
- **Gate class:** shared construction.
- **Shared object:** A sparse latent vector and the overcomplete dictionary that
  maps it to an observed representation.
- **Smallest build:** Generate a small synthetic sparse dictionary problem,
  recover its latent features, and compare the same identifiability conditions
  with a toy superposition model.
- **Falsifier:** The apparent features depend on a chosen visualization or basis
  and are not recovered under a stated identifiability criterion.
- **Evidence:** Olshausen and Field, “Emergence of simple-cell receptive field
  properties by learning a sparse code for natural images” (1996), and this
  ledger entry; no repo instrument exists yet.
- **Status:** identified.

### Interactive proofs / scalable oversight

- **Exact claim:** An interactive proof and a learned-prover oversight protocol
  can share a transcript whose local checks certify a claim more cheaply than
  direct construction by the verifier.
- **Gate class:** shared template.
- **Shared object:** A prover-verifier transcript with an explicit soundness
  condition.
- **Smallest build:** Implement one finite interactive-proof protocol with a
  deterministic verifier, then state which transcript and soundness property an
  oversight analogue preserves.
- **Falsifier:** The oversight protocol relies on informal persuasion without a
  corresponding transcript check or soundness statement.
- **Evidence:** Goldwasser, Micali, and Rackoff, “The Knowledge Complexity of
  Interactive Proof Systems” (1989), and Irving et al., [*AI safety via
  debate*](https://arxiv.org/abs/1805.00899); no repo instrument exists yet.
- **Status:** identified.

### MIU generation and checking

- **Exact claim:** For bounded MIU targets, a generative search heuristic and a
  deterministic checker can be compared by verified witness validity and
  search cost without changing theoremhood.
- **Gate class:** construction.
- **Shared object:** A proposed MIU derivation replayed by the deterministic
  rule engine.
- **Smallest build:** Hold a finite target set and budget fixed, compare an LLM
  proposer with deterministic search, reject every invalid step, and report
  witness validity, length, and search effort separately.
- **Falsifier:** The experiment treats unchecked text as a witness, or claims a
  recursively-enumerable-versus-recursive obstruction even though MIU
  theoremhood is decidable.
- **Evidence:** `src/lib/miu/core.ts`, the complete characterization planned for
  `src/lib/miu/theoremhood.ts`, and the dormant boundary described in
  `docs/agent-behavior.md`.
- **Status:** identified; this is a search-versus-checking experiment, not a
  figure/ground computability result.

### Tropical geometry ↔ ReLU networks

- **Exact claim:** A ReLU network with integer weights can be represented as a
  tropical rational function whose linear regions correspond to a subdivision
  of its Newton polytope.
- **Gate class:** construction.
- **Shared object:** The same piecewise-linear function represented as a neural
  network and as a tropical rational function.
- **Smallest build:** Convert one two-input integer-weight ReLU network to its
  tropical expression and show the corresponding Newton-polytope subdivision.
- **Falsifier:** The conversion does not preserve the function or the proposed
  region/subdivision correspondence on the worked example.
- **Evidence:** Zhang, Naitzat, and Lim, [*Tropical Geometry of Deep Neural
  Networks*](https://arxiv.org/abs/1805.07091); no repo instrument exists yet.
- **Status:** identified, off the logic spine.

## Deferred

### Singular learning theory

- **Exact claim:** The real log canonical threshold can replace raw parameter
  count in the asymptotic model-selection penalty of a singular statistical
  model and can be tracked empirically during grokking in a controlled shallow
  network.
- **Gate class:** shared obstruction.
- **Shared object:** The local learning coefficient in analytic asymptotics and
  in an empirical training trajectory.
- **Smallest build:** Reproduce one analytic shallow-network LLC calculation
  and its empirical trajectory at a scale supported by this project.
- **Falsifier:** The analytic value or qualitative trajectory does not reproduce
  under the stated architecture and estimator, or the example cannot separate
  the claim from ordinary loss dynamics.
- **Evidence:** Cullen et al., [*A Basin-Selection Perspective on Grokking via
  Singular Learning Theory*](https://arxiv.org/abs/2603.01192), arXiv v3,
  revised May 7, 2026. The paper derives analytic LLC formulas for shallow
  quadratic networks and reports empirical LLC trajectories; reproduction at
  this project's scale has not been attempted.
- **Status:** deferred.

## Sidebar

### Random-matrix spectra of trained weights

- **Exact claim:** Deviations of trained weight spectra from a matched
  Marchenko–Pastur baseline identify structure induced by training.
- **Gate class:** invariant.
- **Shared object:** The empirical spectral distribution under a stated random
  matrix null model.
- **Smallest build:** Compare seeded untrained and trained matrices of the same
  shape with a finite-size baseline and confidence envelope.
- **Falsifier:** The reported deviation disappears under a matched finite-size
  null or changes with arbitrary normalization choices.
- **Evidence:** Marchenko and Pastur, “Distribution of eigenvalues for some sets
  of random matrices” (1967); no repo instrument exists yet.
- **Status:** sidebar; an observation until a structural gate is earned.

### Derivation length ↔ chain of thought

- **Exact claim:** Under a fixed task and protocol, additional intermediate
  tokens can be tested as a computational resource against MIU derivation
  length as a separate, explicitly labeled analogy.
- **Gate class:** construction.
- **Shared object:** A bounded sequence of intermediate computational steps.
- **Smallest build:** Fix a finite task family and decoding protocol, vary the
  intermediate-token budget, and compare outcomes with independently minimized
  MIU derivation lengths without treating either length as invariant.
- **Falsifier:** No controlled relation survives changes in prompt, decoding, or
  target family, or the comparison is stated as a shared invariant.
- **Evidence:** Merrill and Sabharwal, [*The Expressive Power of Transformers
  with Chain of Thought*](https://arxiv.org/abs/2310.07923), and
  `src/lib/miu/complexity.ts`.
- **Status:** sidebar; analogy only until a reduction or controlled experiment
  earns a structural class.

## Rejected

### The residue display already constructs characters of ℤ/3

- **Failed test:** The shipped surface contains residues and rule actions but no
  dual group or character table.
- **Disposition:** Rejected as a claim about the current build. The pq bridge
  remains next, conditional on constructing the characters.

### Derivation length and chain of thought share an invariant

- **Failed test:** Derivation length is a complexity measure, not a preserved
  quantity.
- **Disposition:** Rejected gate class. The connection remains a sidebar until
  a reduction or controlled experiment supplies a structural class.

### MIU generation/checking instantiates r.e. versus recursive figure/ground

- **Failed test:** `Th(MIU)` is recursive; the complete characterization decides
  membership.
- **Disposition:** Rejected for MIU. A narrower search-versus-checking
  experiment remains identified; the computability obstruction requires a
  later system with undecidable word problem.
