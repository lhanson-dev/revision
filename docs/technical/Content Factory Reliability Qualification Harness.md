# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification has completed Q1–Q6 on approved `main` and this Q7 branch proposes the governed status transition from `paused` to `qualified`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for Q7 is `0a288a6bd7885782fed884d468fa040f337e873a`, which contains the merged Q1–Q6 reliability corrections and evidence.

Current gate position on this Q7 branch:

- **Q1 — PASS:** worker-contract ownership is inventoried and prior generic blockers remain preserved as resolved evidence.
- **Q2 — PASS:** material provider boundaries have provider-free contract evidence with no open Q2 gap.
- **Q3 — PASS:** all five governed subject/course shapes use the same controlled contract-integration pipeline to `expert_review_ready`.
- **Q4 — PASS:** a complete provider-free course build traverses the governed pipeline, performs targeted remediation, revalidates, independently re-reviews and stops at expert review.
- **Q5 — PASS:** durable restart reuses unchanged successful work across compatible heads using semantic dependency fingerprints and invalidates only genuine dependants while preserving truthful spend/retry provenance.
- **Q6 — PASS:** Q3, Q4 and the governed Q5 restart/reuse scenario set pass three complete repetitions on one exact implementation head with stable outcomes and no new contract-class failure.
- **Q7 — PASS if this PR is merged:** the machine-readable qualification status is `qualified`, every required Q1–Q6 gate is mapped to its merged evidence record, and `livePilotEligible` is `true` for the next governed confirmation pilot.

Q7 does not itself execute the confirmation pilot. Eligibility becomes effective only after this governed PR is merged to approved `main` with exact-head assurance and explicit Founder approval.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` because a Practice exact-evidence check failed. Pilot #10 had already addressed the same broad failure class by moving Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Its reappearance showed that repeated paid whole-course probing was lower-value evidence than systematic provider-free qualification.

Historical Pilot #10–#15 evidence remains unchanged.

## Live-pilot boundary

The live-pilot workflow remains:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. Q7 changes only the machine-readable eligibility state and adds assurance around that state; it does not remove or reorder the preflight.

The Q7 `content-factory/reliability-qualification.json` candidate records:

- `status: qualified`;
- `livePilotEligible: true`;
- `qualificationEvidenceMainSha: 0a288a6bd7885782fed884d468fa040f337e873a`;
- all six required gates in `passedGates`;
- an exact machine-readable evidence record for each gate;
- Q6 repetition count `3`;
- `nextPaidRunClass: confirmation_pilot`.

The evidence SHA is the approved `main` containing Q1–Q6. The Q7 branch changes only qualification state, qualification assurance and this technical record; it does not alter the qualified worker contracts, orchestration or live-adapter implementation.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` records `status: complete` and `q1Pass: true`.

The inventory covers the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Mechanically checked representations are classified using the governed ownership vocabulary: generative judgement, deterministically derived, bounded locator/reference, targeted repair eligible or fail closed.

The two generic ownership issues found during Q1 remain preserved as resolved evidence rather than erased.

## Q2 — provider-free contract matrix

`content-factory/reliability-q2-contract-matrix.json` records `status: complete` and `q2Pass: true`.

The matrix covers the material worker boundaries and tests valid first-pass behaviour, malformed output, invalid/duplicate references, invalid locators, exact-evidence paraphrase, inconsistent totals and cross-references, demand mismatch, bounded repair where permitted, repair failure, fail-closed behaviour and no unnecessary provider call for valid output.

## Q3 — subject-shape matrix

`content-factory/reliability-q3-subject-shape-matrix.json` records `q3Pass: true`.

Executable evidence is:

- `src/content-factory/q3-subject-shape-fixtures.ts`;
- `src/content-factory/q3-subject-shape-matrix.test.ts`;
- shared orchestration in `src/content-factory/end-to-end-proof.ts`.

The five governed shapes are quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text. Every fixture reaches `expert_review_ready` through the same contract-integration path with controlled provider-style executions, zero observed provider cost, zero retries, complete Marking Pack coverage and no human intervention.

These synthetic fixtures prove process compatibility only. They are not factual, pedagogical or assessment-quality approval and do not prove live external-adapter behaviour.

## Q4 — deterministic full-pipeline simulation

`content-factory/reliability-q4-deterministic-pipeline-simulation.json` records `q4Pass: true`.

Executable evidence is:

- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

The simulation traverses:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

It proves deterministic validation before review, targeted Learn and assessment-item remediation, dependent Marking Pack replacement only where required, retention of unaffected artifacts, corrected-head persistence, fresh independent re-review and expert-review packaging. The final manifest remains `factory_generated_unassured`, with no learner-publication side effect.

## Q5 — restart, reuse and dependency-aware invalidation

`content-factory/reliability-q5-restart-reuse-invalidation.json` records `q5Pass: true` and `providerCallsUsed: false`.

Implementation and executable evidence are:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`.

Semantic worker-cache records use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than treating the whole Git implementation head as a universal semantic invalidation key. Provider-free evidence proves head-only reuse, bounded Practice and assessment invalidation, Coverage propagation, truthful retry/cost provenance, cumulative spend preservation and current-pipeline replay after a changed-head resume.

Legacy schema-v1 cache entries remain same-head-only until safely migrated. That is deliberate fail-closed compatibility behaviour.

## Q6 — repeated qualification stability

`content-factory/reliability-q6-repeated-stability.json` records `q6Pass: true`, `repetitionCount: 3` and `providerCallsUsed: false`.

Executable evidence is:

- `src/content-factory/q6-repeated-qualification-fixture.ts`;
- `src/content-factory/q6-repeated-qualification-stability.test.ts`;
- the existing Q3, Q4 and Q5 harnesses.

Q6 executes three complete repetitions inside one qualification suite on one checked-out implementation head. Across those repetitions it performs:

- **15** Q3 subject-shape pipeline runs;
- **3** Q4 deterministic full-pipeline/remediation runs;
- **3** complete Q5 restart/reuse scenario sets.

Normalized Q3/Q4/Q5 outcomes must remain identical across repetitions. Any changed state trace, remediation boundary, invalidation set, provenance/spend result or new contract-class failure causes the suite to fail.

Q6 remains provider-free and demonstrates operational stability rather than educational correctness or live-provider reliability.

## Q7 — paid confirmation eligibility

The Q7 status transition is implemented in `content-factory/reliability-qualification.json` and enforced by `src/content-factory/q7-qualification-status.test.ts`.

The Q7 regression proves that:

- every Q1–Q6 machine-readable record is complete and PASS;
- Q5 and Q6 remain provider-free evidence;
- Q6 records three complete repetitions;
- `requiredGates` and `qualifiedEvidence.passedGates` are exactly aligned;
- every required gate maps to its exact merged evidence file;
- the same `scripts/content-factory-live-pilot-qualification.mjs` preflight used by the manual live workflow accepts the qualified record;
- qualification preflight remains before the paid live-adapter execution step.

After this Q7 PR is merged, the next paid end-to-end Content Factory run is eligible as a **confirmation pilot**. It is not a new debugging probe and is not automatically started by Q7.

The confirmation pilot must still obey:

- approved-source and source-rights rules;
- the US$20 per-course spend ceiling and cumulative spend controls;
- deterministic validation and independent review;
- expert/human review authority;
- content accuracy assurance;
- publication governance and no automatic learner publication.

A reliability PASS does not constitute educational correctness, awarding-body endorsement or publication approval.

## Documentation impact

Q7 changes the current machine-readable reliability status and therefore updates this indexed technical qualification record in the same governed PR.

Updated together:

- `content-factory/reliability-qualification.json`;
- `src/content-factory/q7-qualification-status.test.ts`;
- this technical qualification record.

No normative authority change is required because the active Reliability Qualification Standard already defines the Q7 transition and confirmation-pilot rule. No `INDEX.md` change is required because the indexed qualification-harness source of truth remains this document. The live-pilot workflow itself is unchanged. Historical Pilot #10–#15 evidence remains unchanged.
