# Content Factory Reliability v2-D Provider-Free Qualification

## Status

Reliability v2-D is the same-head provider-free qualification step for Content Factory gates Q1-Q6.

The qualification is bound to the governed V2-D branch created from approved `main` at `7082331dc280ec8bd8b8223475180fa25b796d00`. The governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0 and the implementation sequence is recorded in `docs/technical/Content Factory Reliability Qualification Harness.md`.

V2-D does **not** restore full-course live-pilot eligibility. `content-factory/reliability-qualification.json` remains `status: paused`, `qualifiedEvidence: null` and `livePilotEligible: false`. A bounded live-worker soak remains required as Q7, followed by the separate Q8 eligibility transition.

## Qualification model

All Q1-Q6 evidence executes on one exact implementation head through normal CI. No external provider call belongs in this qualification.

The evidence model is:

1. consolidate current compiler/worker ownership for Q1;
2. retain and re-run the V2-B historical contract-failure corpus for Q2;
3. retain and re-run the V2-C adversarial mutation matrix across all five governed subject shapes for Q3;
4. re-run the deterministic full-pipeline simulation for Q4;
5. re-run restart/reuse/dependency invalidation for Q5;
6. repeat the complete Q2-Q5 provider-free test set three times with distinct governed shuffle seeds for Q6.

## Q1 — compiler/worker ownership inventory

The pre-v2 machine-readable inventory remains historical evidence rather than being silently rewritten. Its unaffected boundaries are carried forward through:

- `content-factory/reliability-contract-inventory.json`;
- `content-factory/reliability-v2-d-q1-ownership-consolidation.json`.

The legacy Marking Pack field classifications are deliberately superseded by the V2-A ownership record:

- `content-factory/reliability-v2-a-marking-pack-ownership.json`;
- `src/content-factory/openai-marking-pack-v2-compiler.ts`.

The effective Marking Pack boundary is compiler-first:

- subquestion target IDs are bounded references;
- subquestion maximum marks are injected from the validated assessment;
- structured aggregate AO totals are derived by Revision;
- provider-authored structured aggregate AO arithmetic is outside the provider contract;
- rubric educational quality descriptors remain generative judgement;
- rubric IDs and numeric mark bands are compiled deterministically;
- the entire parseable candidate is diagnosed before the one permitted targeted repair;
- the whole repaired artifact is revalidated once and any remaining defect fails closed.

The Q1 consolidation also records an explicit compiler-ownership challenge for every governed worker boundary so mechanically constructible representation is not left model-authored by default.

## Q2 — historical failure replay corpus

V2-B remains the durable source for Pilots #1-#18:

- `content-factory/reliability-v2-b-historical-failure-corpus.json`;
- `src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts`.

The corpus contains 19 reusable engineering defect classes and preserves the distinction between exact historical output and synthetic reproduction. Historical pilot records are not rewritten.

V2-D resolves the replay-test paths from the corpus itself and includes every referenced permanent regression in each repeated Q6 execution. Operational or educational incidents that are not contract classes remain explicit exclusions rather than being converted into artificial replay fixtures.

## Q3 — adversarial subject matrix

V2-C remains the source of the adversarial catalogue:

- `content-factory/reliability-v2-c-adversarial-mutation-matrix.json`;
- `src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts`.

The matrix covers 12 mutation classes across all five governed subject shapes, producing 60 mutation/shape cases in each repeated qualification run. The production assessment integrity, bounded-locator and Marking Pack compiler/diagnostic paths are exercised with fake provider transport only.

## Q4 — deterministic full-pipeline simulation

The existing deterministic pipeline fixture is re-run without alteration:

- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

It continues to prove the governed state progression through `expert_review_ready`, deterministic validation, independent-review fail/pass behavior, targeted remediation and exact-version expert-package binding without a learner-publication side effect.

## Q5 — restart, reuse and dependency invalidation

The existing dependency-aware durability implementation and assurance remain the Q5 evidence:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`.

V2-D re-runs the suite on every Q6 repetition so compatible work remains reusable across heads, semantic contract changes invalidate only affected downstream work, and retry/spend provenance is preserved truthfully.

## Q6 — repeated provider-free stability

The v1 Q6 record is retained as historical evidence, but its repeated immutable Q3/Q4/Q5 fixture is not treated as sufficient v2 evidence.

V2-D uses three distinct mutation/order seeds from the V2-C governed seed inventory:

- `17`;
- `73`;
- `149`.

For each seed, `src/content-factory/reliability-v2-d-provider-free-qualification.test.ts` launches a fresh Vitest run containing:

- every permanent regression referenced by the V2-B corpus;
- the V2-B corpus-integrity test;
- the complete V2-C adversarial matrix;
- the Q4 deterministic pipeline simulation;
- the Q5 dependency-aware restart/reuse suite.

Vitest shuffles both files and tests using the governed seed. Therefore Q2-Q5 are not merely asserted from one earlier green run: they execute three times under different deterministic orders on the same implementation head.

The normal repository unit suite also runs once in the parent CI job, so the repeated qualification is additive to ordinary foundation assurance rather than replacing it.

## Machine-readable result

The V2-D result is recorded at:

`content-factory/reliability-v2-d-provider-free-qualification.json`

It records:

- Q1-Q6 `pass`;
- `providerCallsUsed: false`;
- three repeated executions with seeds `17`, `73`, `149`;
- Q7 bounded-live-soak eligibility;
- `q7Passed: false`;
- `overallReliabilityV2Passed: false`;
- `livePilotEligible: false`;
- next work item `V2-E`.

The current global qualification record is updated only with Q1-Q6 gate progress. It remains paused for full-course live execution.

## Limitations

Provider-free qualification proves engineering process-contract behavior under the governed deterministic, historical and adversarial test set. It does not prove educational correctness, live provider behavior, or routine course-production maturity.

V2-D also does not claim that the 12 mutation classes enumerate every possible model output. The purpose of seeded repetition is to reduce order-coupling and repeat the complete known/adversarial boundary suite, not to convert finite tests into a statistical proof of correctness.

## Documentation impact

This work implements the already-approved Reliability v2 method. It does not change normative authority.

Documentation/evidence impact:

- adds this V2-D technical record;
- adds the V2-D Q1 ownership consolidation;
- adds the V2-D machine-readable provider-free qualification result;
- advances the current machine-readable gate status to Q1-Q6 PASS / Q7 pending while preserving `status: paused` and `livePilotEligible: false`;
- preserves V1 qualification records and Pilots #1-#18 unchanged as historical evidence;
- requires no ADR because it applies the approved Reliability v2 qualification architecture rather than selecting a new architecture;
- requires no `INDEX.md` change because the existing indexed Reliability Qualification Standard and Qualification Harness remain the canonical entry points.
