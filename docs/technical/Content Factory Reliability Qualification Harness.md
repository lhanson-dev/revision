# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for the Q6 increment is `37b0d053cc7c8d5355b2b47f19705c9a3f1ba053`. That head contains the merged Q1–Q5 reliability corrections and evidence.

Current gate position on this branch:

- **Q1 — PASS:** worker-contract ownership is inventoried and prior generic blockers remain preserved as resolved evidence.
- **Q2 — PASS:** material provider boundaries have provider-free contract evidence with no open Q2 gap.
- **Q3 — PASS:** all five governed subject/course shapes use the same controlled contract-integration pipeline to `expert_review_ready`.
- **Q4 — PASS:** a complete provider-free course build traverses the governed pipeline, performs targeted remediation, revalidates, independently re-reviews and stops at expert review.
- **Q5 — PASS:** durable restart reuses unchanged successful work across compatible heads using semantic dependency fingerprints and invalidates only genuine dependants while preserving truthful spend/retry provenance.
- **Q6 — PASS on this branch:** Q3, Q4 and the governed Q5 restart/reuse scenario set pass three complete repetitions on one exact implementation head with stable outcomes and no new contract-class failure.
- **Overall qualification — paused.**
- **Paid confirmation pilot — not eligible.**

Q1–Q6 PASS do not themselves authorize another paid pilot. A separate governed Q7 qualification-status PR is required to change the overall machine-readable status to `qualified` and `livePilotEligible: true`.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` because a Practice exact-evidence check failed. Pilot #10 had already addressed the same broad failure class by moving Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Its reappearance showed that repeated paid whole-course probing was lower-value evidence than systematic provider-free qualification.

Historical Pilot #10–#15 evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. `content-factory/reliability-qualification.json` deliberately remains:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The reliability work changes the Content Factory behind that gate; it does not weaken or bypass the gate.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` inventories the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

The two generic issues identified during inventory remain preserved as resolved evidence:

- Practice exact-evidence comparison now checks actual generated string leaves rather than JSON-serialized representations;
- structured Marking Pack aggregate AO arithmetic is derived deterministically from validated subquestion allocations rather than duplicated by the provider.

Provider-free regressions remain in the Q2 contract tests.

## Q2 — provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json` and records `q2Pass: true` with `paidPilotEligible: false`.

The matrix covers the material worker boundaries and includes valid first-pass behaviour, malformed output, invalid/duplicate references, invalid locators, exact-evidence paraphrase, inconsistent totals and cross-references, demand mismatch, bounded repair where permitted, repair failure, fail-closed behaviour and no unnecessary provider call for valid output.

## Q3 — subject-shape matrix

The Q3 machine-readable record is `content-factory/reliability-q3-subject-shape-matrix.json`.

Executable evidence is:

- `src/content-factory/q3-subject-shape-fixtures.ts`;
- `src/content-factory/q3-subject-shape-matrix.test.ts`;
- shared orchestration in `src/content-factory/end-to-end-proof.ts`.

The five governed shapes are quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text. Every fixture reaches `expert_review_ready` through the same contract-integration path with controlled provider-style executions, zero observed provider cost, zero retries, complete Marking Pack coverage and no human intervention.

These synthetic fixtures prove process compatibility only. They are not factual, pedagogical or assessment-quality approval and do not prove live external-adapter behaviour.

## Q4 — deterministic full-pipeline simulation

The Q4 machine-readable record is `content-factory/reliability-q4-deterministic-pipeline-simulation.json`.

Executable evidence is:

- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

The simulation traverses:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

It proves deterministic validation before review, targeted Learn and assessment-item remediation, dependent Marking Pack replacement only where genuinely required, retention of unaffected artifacts, corrected-head persistence, fresh independent re-review and expert-review packaging. The final manifest remains `factory_generated_unassured`, with no learner-publication side effect.

## Q5 — restart, reuse and dependency-aware invalidation

The Q5 machine-readable record is `content-factory/reliability-q5-restart-reuse-invalidation.json`.

Implementation and executable evidence are:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`.

New semantic worker-cache records use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than treating the entire Git implementation head as a universal semantic invalidation key. The original execution head remains provenance.

Provider-free Q5 evidence proves:

- unchanged completed executions can be reused after a head-only change;
- a Practice contract change invalidates Practice and assurance dependants without invalidating Course Knowledge Model, Learn or independent assessment generation;
- an Assessment Blueprint change invalidates its assessment branch and assurance dependants without invalidating Learn/Practice;
- a Coverage contract change propagates through genuinely coverage-dependent learning and assessment work while retaining unrelated identity/source/Board Alignment work;
- retry and usage-cost provenance survives reuse;
- cumulative course spend is not double charged by reuse;
- a changed-head late-stage job is replayed from the original governed request so current deterministic orchestration executes rather than trusting stale state.

Legacy schema-v1 cache entries contain no dependency fingerprint and therefore remain same-head-only until safely migrated. That is deliberate fail-closed compatibility behaviour.

## Q6 — repeated qualification stability

The Q6 machine-readable record is `content-factory/reliability-q6-repeated-stability.json`.

Executable evidence is:

- `src/content-factory/q6-repeated-qualification-fixture.ts`;
- `src/content-factory/q6-repeated-qualification-stability.test.ts`;
- the existing Q3, Q4 and Q5 implementation harnesses listed above.

### Repetition count and exact evidence

Q6 executes **three complete repetitions** inside one executable qualification suite on one checked-out implementation head.

Each repetition includes:

1. all five Q3 subject-shape fixtures through `runQ3SubjectShape`;
2. one complete Q4 deterministic remediation simulation through `runQ4DeterministicPipelineSimulation`;
3. one complete Q5 restart/reuse scenario set covering head-only reuse, Practice invalidation, assessment invalidation, Coverage propagation, provenance/spend and semantic replay.

The resulting repeated workload is therefore:

- **15** Q3 subject-shape pipeline runs;
- **3** Q4 deterministic full-pipeline/remediation runs;
- **3** complete Q5 restart/reuse scenario sets, each covering six governed scenarios.

The Q6 regression test is the exact-head executable evidence. CI checks out one PR head and runs the repetitions from that single implementation state; the test does not combine results collected from different commits.

### Q3 repeated stability

On every repetition, all five course shapes must:

- reach `expert_review_ready`;
- retain complete Marking Pack coverage;
- use the controlled fixture route only;
- report zero observed usage cost and zero retries;
- require no human intervention;
- bind expert-review packaging to the synthetic fixture commit.

Any changed result or new subject-shape contract assumption fails Q6.

### Q4 repeated stability

On every repetition, the deterministic simulation must preserve the exact governed state trace and must again prove:

- validation decisions `pass → pass` around remediation;
- independent-review decisions `fail_hold → pass`;
- exactly the governed Learn and assessment-item remediation target classes;
- corrected-head binding to expert-review packaging;
- no human-review or expert-review-submission side effect;
- final publication status `factory_generated_unassured`.

Any change to the trace, remediation boundary or publication behaviour fails Q6.

### Q5 repeated stability

On every repetition:

- a head-only change must reuse all durable worker methods with no second-pass execution;
- the Practice, assessment and Coverage contract changes must produce the same dependency-aware invalidation sets already qualified by Q5;
- reused work must preserve the original retry count and usage cost;
- cumulative course spend must remain unchanged by reuse;
- a changed-head late-stage job must replay from `requested` while preserving the governed request identity.

The Q6 test also compares the normalized Q3/Q4/Q5 outcome summaries across all three repetitions. A drift between repetition one, two or three is a test failure even when each individual result would otherwise look acceptable.

### Provider-free boundary

The Q6 harness makes no external model or source-provider call. Q3 uses injected controlled workers, Q4 uses stored/synthetic responses, and Q5 uses an in-memory durable checkpoint client with controlled worker executions.

The repeated suite therefore demonstrates deterministic operational stability without incurring another paid course run.

### Q6 limitations

Q6 demonstrates repeated provider-free operational reliability. It does not prove educational correctness, live external-adapter reliability, learner publication quality or awarding-body endorsement.

Q6 also does not change the global qualification status. That is deliberately reserved for Q7.

## Q7 — paid confirmation eligibility

With Q1–Q6 passing, the next governed increment is a separate qualification-status PR.

That PR may set `content-factory/reliability-qualification.json` to `qualified` and `livePilotEligible: true` only after its own exact-head assurance and explicit Founder approval. The next paid end-to-end run is then a confirmation pilot, not a debugging probe.

The confirmation pilot must still obey source rights, educational assurance, spend limits, expert/human review and publication governance.

## Documentation impact

The Q6 increment adds current provider-free repeated-stability evidence and updates this indexed technical qualification record. It does not change normative authority, educational policy, learner-facing behaviour or paid-pilot eligibility.

Updated together:

- `content-factory/reliability-q6-repeated-stability.json`;
- `src/content-factory/q6-repeated-qualification-fixture.ts`;
- `src/content-factory/q6-repeated-qualification-stability.test.ts`;
- this technical qualification record.

No change is required to the active Reliability Qualification Standard because it already defines Q6 and Q7. No `INDEX.md` change is required because the indexed qualification-harness source of truth remains this document. Historical Pilot #10–#15 evidence remains unchanged. Overall reliability status and paid-pilot eligibility remain deliberately paused until Q7 is separately governed and approved.
