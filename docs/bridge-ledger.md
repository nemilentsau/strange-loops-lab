# Bridge Ledger

The record of the connection gate (`docs/strange-loops-vision.md` §5) run over
candidate bridges. Each entry names the bridge, the gate class it claims
(shared template, construction, obstruction, or invariant), the construction
that would earn it, and its status. Rejections are kept, with the test they
failed: a rejected bridge is a verified negative of the investigation, the
method's own MU verdict.

Statuses: **built** (instrument shipped) · **next** (construction identified,
scheduled) · **identified** (construction identified, unscheduled) ·
**deferred** (no small worked example yet) · **sidebar** (labeled analogy;
suggestive, not binding) · **rejected** (failed the gate; reason recorded).

## Built

### MIU derivation length ↔ Kolmogorov complexity
- **Gate class:** shared construction — a derivation is a program: axiom as
  input, ⟨rule, site⟩ choices as instructions, the string as output. K_MIU(s)
  is the length of the shortest such program over the fixed four-rule machine.
- **Construction:** the K_MIU reading of the MIU instrument at `/`
  (`src/lib/miu/complexity.ts`, `MiuBridge.svelte`). The fixed machine is named
  as fixed; replacing it with a universal machine gives Kolmogorov complexity,
  and that step is explicitly not taken by this instrument.
- **Status:** built.

## Next

### pq / modular addition ↔ grokking Fourier circuits
- **Gate class:** shared construction — characters of a cyclic group, built in
  two settings. The residue wheel draws the characters of ℤ/3; a one-layer
  transformer trained on addition mod p learns the characters of ℤ/p (Nanda et
  al. 2023, "Progress measures for grokking via mechanistic interpretability").
- **Construction:** train the small model offline (mod 97, one layer, minutes
  of compute), ship the weights and the extracted Fourier components as
  artifacts, and display them against the wheel. Training results are measured,
  not verified; the character extraction is deterministic given the weights.
- **Status:** next. Double duty: it builds the pq site of the Arc 1 contrast
  set and upgrades the strongest ML analogy in the arc to a structural
  connection. First instrument with a measured surface.

## Identified

### Invariant ↔ expressivity wall (Minsky–Papert)
- **Gate class:** shared template — impossibility by a quantity every step of
  the system respects. MIU side: each rule preserves #I (mod 3), so MU is
  unreachable. ML side: the Minsky–Papert group-invariance theorem — a
  perceptron of bounded order cannot compute parity; symmetrize over the
  input-permutation group, reduce the discriminant to a univariate polynomial
  in |x|, and bound its degree.
- **Caution, recorded:** modern soft-attention limitation results (Hahn 2020)
  are continuity/Lipschitz arguments, and PARITY ∉ AC⁰ is a random-restriction
  argument. Neither shares the invariant template; building the far side on
  them would fail the gate. Minsky–Papert is the far side that matches.
- **Status:** identified; second in the build order.

### Derivation length ↔ chain of thought as a resource
- **Gate class:** shared invariant — steps as the resource that decides
  reachability. MIU side: K_MIU is the least number of moves reaching a target.
  ML side: transformers with t steps of intermediate decoding simulate time-t
  computation, while constant-depth transformers without intermediate steps sit
  in uniform TC⁰ (Merrill–Sabharwal).
- **Construction:** an extension of the built K_MIU instrument, not a new site:
  the shortest derivation read as the least reasoning budget that reaches the
  target.
- **Status:** identified.

### Generation against verification
- **Gate class:** shared obstruction — the asymmetry between finding a
  derivation and checking one (figure against ground; recursively enumerable
  against recursive).
- **Construction:** an LLM proposes derivations; the deterministic layer checks
  every step; found lengths sit against K_MIU from exhaustive search. Only
  checked derivations are reported as results. This is the identified re-entry
  path for the dormant dialogue layer — the LLM as proposer, not coach — and
  the verified/measured separation is itself the exhibit.
- **Status:** identified.

### Language model as compressor
- **Gate class:** shared construction — arithmetic coding turns a predictor
  into a compressor; code length is −log₂ of the predicted probability, an
  upper bound on description length.
- **Construction:** two stages. Stage 1: a deterministic predictor (n-gram or
  PPM) driving an arithmetic coder — mechanically checkable, verified register,
  gzip as baseline, the specimen-string contrast carried over. Stage 2: an LLM
  as the predictor (Delétang et al. 2023, "Language Modeling Is Compression"),
  measured register.
- **Status:** identified. This is the honest step from K_MIU toward Kolmogorov
  and Solomonoff already named by the built instrument.

## Backlog (off the logic spine)

### Tropical geometry ↔ ReLU networks
- **Gate class:** shared construction in the strictest sense — a ReLU network
  with integer weights *is* a tropical rational function (Zhang–Naitzat–Lim
  2018). Linear regions correspond to the dual subdivision of the Newton
  polytope.
- **Construction, buildable small:** a two-input ReLU net, its tropical
  polynomial, the Newton polytope with its dual subdivision, and the
  linear-region count, side by side.
- **Status:** identified, unscheduled. ML-side anchor with the mathematics as
  the destination.

## Deferred

### Singular learning theory
- **Claim to test:** the real log canonical threshold as the effective
  parameter count of a singular model (Watanabe); the free-energy asymptotics
  as the reduction shared with model selection.
- **Why deferred:** no small worked example yet that fits an instrument — the
  admission test requires one. Re-examine when a two-parameter singular model
  with a computable RLCT can be exhibited end to end.

## Sidebar

### Random-matrix spectra of trained weights
- **Claim:** Marchenko–Pastur against the empirical spectral density of weight
  matrices, and deviations from it after training.
- **Why sidebar:** an observation, not a shared template, construction,
  obstruction, or invariant. Stays a labeled analogy unless a construction
  earns more.

## Rejected

None yet. A rejection is recorded here with the gate test it failed and the
construction attempt that failed it.
