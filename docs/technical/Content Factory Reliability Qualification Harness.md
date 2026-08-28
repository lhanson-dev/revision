# Content Factory Reliability Qualification Harness

## Status

The original course-agnostic reliability qualification completed Q1–Q6 and Q7 on approved `main`, which correctly enabled Confirmation Pilot #16. Pilot #16 ran from approved `main` `47c30e95c49c1951d0dd31c48b63a1d15506529f` as workflow run `33214478392` and durable job Issue `#226`.

The qualification preflight passed and the paid pipeline reached fresh-context independent educational review. Independent review returned `fail_hold` with material content and assessment-integrity findings, so the course did not reach `expert_review_ready` and no learner content was published.

This remediation changes generated-output integrity behaviour. In accordance with `80-company-workflows/Content Factory Reliability Qualification Standard.md`, paid live-pilot eligibility is therefore re-paused on this branch until the corrected implementation passes provider-free reliability requalification on approved `main`.

Current gate position:

- **Q1–Q6 — historical PASS evidence retained:** the merged machine-readable qualification records remain unchanged as evidence of the implementation that was originally qualified.
- **Q7 — previously PASS:** the governed Q7 transition correctly enabled Confirmation Pilot #16.
- **Current global qualification — paused:** `content-factory/reliability-qualification.json` is bound to Pilot #16 fail-hold evidence with `qualifiedEvidence: null` and `livePilotEligible: false`.
- **Next paid pilot — not eligible:** a corrected implementation must first pass provider-free requalification and a new governed qualification-status transition.

The governing standard is not changed by this remediation. This document records current implementation and qualification evidence; it does not replace that authority.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` because a Practice exact-evidence check failed. Pilot #10 had already addressed the same broad failure class by moving Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Its reappearance showed that repeated paid whole-course probing was lower-value evidence than systematic provider-free qualification.

Q1–Q7 then completed through governed PRs. Confirmation Pilot #16 proved that the reliability gate was effective: preflight passed, the live pipeline executed under the spend ceiling, and educational assurance—not metadata drift—became the stopping boundary.

Pilot #16 nevertheless exposed new material generated-output defects. The remediation response therefore remains the same governed pattern: classify the reusable defect classes, correct the smallest reusable process boundaries, add provider-free regressions, re-run qualification on the changed implementation, and only then permit another paid confirmation run.

Historical Pilot #10–#16 evidence remains unchanged.

## Live-pilot boundary

The live-pilot workflow remains:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass.

The post-Pilot-#16 remediation candidate records:

- `status: paused`;
- `livePilotEligible: false`;
- `qualifiedEvidence: null`;
- trigger evidence Pilot `16`, workflow run `33214478392`, durable Issue `#226`, exact prior `main` `47c30e95c49c1951d0dd31c48b63a1d15506529f`;
- all six Q1–Q6 gates still listed as the required requalification gates.

The pause is deliberate. The remediation changes quality assumptions at generation and marking boundaries, so the Q1–Q6 evidence for the previously qualified implementation cannot silently qualify the changed implementation head.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` records the original Q1 PASS evidence.

The inventory covers the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Mechanically checked representations are classified using the governed ownership vocabulary: generative judgement, deterministically derived, bounded locator/reference, targeted repair eligible or fail closed.

Pilot #16 adds generated-output integrity controls that must be represented by the requalification evidence before eligibility is restored.

## Q2 — provider-free contract matrix

`content-factory/reliability-q2-contract-matrix.json` retains the original Q2 PASS evidence.

The post-Pilot-#16 branch adds provider-free regressions for the defect classes exposed by the live confirmation run, including deterministic formula canonicalisation, MCQ key-position distribution, prompt/answer presupposition alignment, learner-language contamination, assessment-premise sufficiency and operational per-subquestion Marking Pack rubric coverage.

These regressions must pass together with the existing Q2 matrix before a new qualification claim is made.

## Q3 — subject-shape matrix

`content-factory/reliability-q3-subject-shape-matrix.json` retains the original Q3 PASS evidence.

Executable evidence is:

- `src/content-factory/q3-subject-shape-fixtures.ts`;
- `src/content-factory/q3-subject-shape-matrix.test.ts`;
- shared orchestration in `src/content-factory/end-to-end-proof.ts`.

The five governed shapes are quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text. Requalification must continue to prove that generic output-integrity corrections do not force every course through a Business-shaped representation.

Synthetic fixtures prove process compatibility only. They are not factual, pedagogical or assessment-quality approval and do not prove live external-adapter behaviour.

## Q4 — deterministic full-pipeline simulation

`content-factory/reliability-q4-deterministic-pipeline-simulation.json` retains the original Q4 PASS evidence.

Executable evidence is:

- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

The simulation traverses:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

It proves deterministic validation before review, targeted remediation, correct dependent-stage replacement, fresh independent re-review and no publication side effect. Requalification must run this simulation on the corrected implementation head.

## Q5 — restart, reuse and dependency-aware invalidation

`content-factory/reliability-q5-restart-reuse-invalidation.json` retains the original Q5 PASS evidence.

Implementation and executable evidence are:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`.

Semantic worker-cache records use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than treating the whole Git implementation head as a universal semantic invalidation key. Provider-free evidence proves head-only reuse, bounded Practice and assessment invalidation, Coverage propagation, truthful retry/cost provenance, cumulative spend preservation and current-pipeline replay after a changed-head resume.

Pilot #16 Issue #226 remains blocked educational evidence and is not resumed across this semantic remediation. The next paid proof, once requalified, must be a fresh course job.

## Q6 — repeated qualification stability

`content-factory/reliability-q6-repeated-stability.json` retains the original Q6 PASS evidence with `repetitionCount: 3` and `providerCallsUsed: false`.

Executable evidence is:

- `src/content-factory/q6-repeated-qualification-fixture.ts`;
- `src/content-factory/q6-repeated-qualification-stability.test.ts`;
- the existing Q3, Q4 and Q5 harnesses.

Q6 executes three complete repetitions inside one qualification suite. Requalification must again show stable normalized Q3/Q4/Q5 outcomes on the corrected implementation head without a new contract-class failure.

Q6 remains provider-free and demonstrates operational stability rather than educational correctness or live-provider reliability.

## Q7 — paid confirmation eligibility

The original Q7 transition was implemented through PR #225 and correctly enabled Confirmation Pilot #16. That historical governed decision is not rewritten.

After Pilot #16, the current status is deliberately paused because implementation semantics are changing. Restoring `qualified` and `livePilotEligible: true` now requires a new governed status transition after provider-free Q1–Q6 requalification of the corrected implementation.

The next paid run remains a **confirmation pilot**, not a debugging probe. It must still obey:

- approved-source and source-rights rules;
- the US$20 per-course spend ceiling and cumulative spend controls;
- deterministic validation and independent review;
- expert/human review authority;
- content accuracy assurance;
- publication governance and no automatic learner publication.

A reliability PASS does not constitute educational correctness, awarding-body endorsement or publication approval.

## Pilot #16 remediation scope

The remediation is recorded in `docs/technical/Content Factory Pilot 16 Remediation.md` and addresses the seven independent-review findings without weakening the review gate or enabling in-memory live remediation.

The implementation keeps `maxRemediationCycles: 0` for the paid live workflow. A material live finding still fails closed and returns to governed repository remediation.

## Documentation impact

Updated together in the post-Pilot-#16 remediation PR:

- `content-factory/reliability-qualification.json`;
- `src/content-factory/q7-qualification-status.test.ts`;
- generated-output integrity implementation and regressions;
- AQA AS Business pilot assessment-context policy and regressions;
- this indexed technical qualification record;
- `docs/technical/Content Factory Pilot 16 Remediation.md`.

No normative authority change is required because the active Reliability Qualification Standard already requires reusable defect correction, provider-free requalification after changed quality assumptions and fail-closed paid eligibility. No `INDEX.md` change is required because the indexed qualification-harness source of truth remains this document and the existing live-pilot technical source remains the runtime authority pointer.

Historical Pilot #10–#16 evidence is not rewritten.
