# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability programme remains **paused for full-course live execution after Confirmation Pilot #18**.

Reliability v2 implementation has now progressed through the compiler-first boundary work (V2-A), historical replay corpus (V2-B), adversarial mutation matrix (V2-C) and provider-free Q1–Q6 qualification (V2-D). The remaining reliability work is the bounded live-worker soak (Q7 / V2-E), followed by a separate Q8 eligibility transition (V2-F).

Pilot #18 proved that the v1 Q1–Q6 provider-free qualification was valuable but insufficient as a predictor of live provider robustness. The pipeline progressed materially further than earlier failures, but a Marking Pack contained more than one operational-rubric defect and the validator/repair path then in use surfaced only the first defect before the one permitted repair. After that repair, a second defect of the same class became visible and the run failed closed.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. Full-course paid pilots remain disabled until Q1–Q7 v2 evidence is complete and a separate Q8 eligibility PR restores `qualified` status.

## Pilot #18 historical evidence

Pilot #18 remains historical evidence and is not rewritten:

- approved content head: `ed3bd4c4a50dd723da38952a41ff9bad084ad68d`;
- workflow run: `33239396439` / run number `18`;
- durable job: Issue `#234`;
- final state: `blocked` from `generating`;
- failure class: generic `provider_contract_failure` in Marking Pack operational-rubric validation after targeted repair;
- cumulative provider spend: `US$1.253632`;
- remaining course budget: `US$18.746368`;
- executed workers: `45`;
- successfully persisted Marking Packs before the failing target: `4`;
- independent educational review was not reached;
- expert review was not reached;
- nothing was published.

The architectural finding was not merely that one generated rubric was wrong. The previous Marking Pack path could turn several independent defects in one parseable artifact into sequential live failures because only the first actionable diagnostic reached the one bounded repair.

## Reliability v2 objective

The factory should behave like a compiler boundary around variable model output:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is **not** perfect first-pass model output. The target is that normal model variability does not require an engineer to change TypeScript or prompts between ordinary courses.

## v2 implementation sequence

Implementation proceeds in short governed PRs against approved `main`.

### V2-A — complete-diagnostic validation and compiler ownership — implemented

Primary objective: remove the known Pilot #18 serial-defect behavior and reduce unnecessary model ownership.

Implemented behavior includes:

- repair-eligible Marking Pack validation collects the complete actionable diagnostic set for a parseable artifact;
- the complete diagnostic set is sent to the one bounded repair call;
- the complete repaired artifact is revalidated once;
- structurally unsafe/unparseable output still stops early and fails closed;
- mechanically constructible Marking Pack fields such as structured aggregate AO totals and numeric rubric bands are compiler-owned;
- affected durable worker semantics invalidate only genuine downstream dependants.

Technical record: `docs/technical/Content Factory Reliability v2-A Marking Pack Compiler.md`.

### V2-B — historical failure replay corpus — implemented

A permanent corpus now records all known Pilots #1–#18 outcomes and every reusable contract-class failure where durable evidence exists.

Evidence classes remain:

- **exact historical output** — replay a retained durable provider output unchanged where one genuinely exists;
- **synthetic reproduction** — where exact output is unavailable, encode the smallest generic reproduction and label it explicitly as synthetic.

Historical pilot records are preserved and non-contract operational/educational incidents are explicitly excluded rather than converted into artificial contract fixtures.

Technical record: `docs/technical/Content Factory Reliability v2-B Historical Failure Replay Corpus.md`.

### V2-C — adversarial mutation matrix — implemented

Provider-free qualification now extends beyond hand-authored happy-path/one-defect fixtures across all five governed subject shapes.

The matrix covers:

- blank/omitted/malformed optional values;
- duplicated/missing/reordered references;
- inconsistent totals;
- compiler-owned mark bands;
- simultaneous Marking Pack defects;
- mixed valid and invalid bounded locators;
- plausible phrasing alternatives;
- exact-evidence paraphrase;
- demand metadata mismatch;
- complete-diagnostic single repair;
- repair failure/fail closed;
- valid output with no unnecessary extra provider call.

Technical record: `docs/technical/Content Factory Reliability v2-C Adversarial Mutation Matrix.md`.

### V2-D — full provider-free qualification — complete on this evidence path

Q1–Q6 are re-run on one exact implementation head:

- Q1 compiler/worker ownership inventory;
- Q2 historical failure replay corpus;
- Q3 adversarial provider-free subject matrix;
- Q4 deterministic full-pipeline simulation;
- Q5 restart/reuse/dependency invalidation;
- Q6 repeated stability with varied mutation/test order under distinct governed seeds rather than only repeating one immutable fixture.

No live provider call belongs in Q1–Q6.

The V2-D machine-readable record is `content-factory/reliability-v2-d-provider-free-qualification.json`; the detailed technical record is `docs/technical/Content Factory Reliability v2-D Provider-Free Qualification.md`.

### V2-E — bounded live worker soak — next

Only after Q1–Q6 PASS, run Q7 as a separate bounded live-provider reliability exercise.

The soak must:

- use rights-safe synthetic/structured inputs;
- cover all five subject shapes across the sample set;
- include at least 20 live worker outputs in total;
- include multiple samples of assessment-item and Marking Pack generation plus any other boundaries Q1 classifies as high risk;
- use production compiler/validator/repair code;
- record every sample result, repair count and cost;
- stay below the governed US$5 soak ceiling;
- assemble/publish no real course;
- fail qualification on any new generic contract class the v2 boundary cannot safely handle.

Educational-content rejection that is correctly classified and fail-closed is not automatically a reliability failure. A new engineering contract class is.

### V2-F — separate Q8 eligibility transition

Only after Q1–Q7 PASS may a separate governed PR restore:

- `status: qualified`;
- `livePilotEligible: true`;
- evidence binding to the exact v2 qualification head;
- next paid run class `confirmation_pilot`.

Pilot #19 must not run before that transition merges.

## Maturity evidence after qualification

A successful Pilot #19 would be confirmation evidence, not proof that routine scaling is solved.

The factory becomes mature enough for routine course production only after **three consecutive materially different real courses** reach `expert_review_ready` on their initial full factory run without an engineering/code/worker-contract correction between those course runs.

Normal educational findings, bounded infrastructure retries and course-specific educational decisions do not break this sequence. A new generic engineering contract class does and resets the sequence after correction/requalification.

If two consecutive post-v2 confirmation-course attempts still expose new generic engineering contract classes, the Reliability Standard requires an architecture review before another full-course attempt rather than continuing a paid debugging loop.

## Current machine-readable state

`content-factory/reliability-qualification.json` remains intentionally fail closed for full-course execution:

- `status: paused`;
- Q1–Q6 gate status: `pass` after V2-D exact-head assurance;
- Q7 bounded live-worker soak: `pending`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`;
- trigger remains Pilot #18 workflow `33239396439` / Issue `#234`;
- Q8 remains a separate eligibility transition after Q7.

V2-D therefore permits only the governed next reliability exercise (V2-E/Q7). It does not permit another paid full-course run.

## Documentation impact

The normative Reliability v2 method remains governed by:

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`;
- `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

V2-D updates implementation/evidence documentation and the machine-readable gate-progress record without changing normative authority. Historical pilot and v1 qualification evidence remains unchanged. No learner-facing product behavior changes. `INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and this harness remain the canonical indexed locations.
