# Content Factory Reliability Qualification Harness

## Status

The original course-agnostic reliability qualification completed Q1–Q6 and Q7 on approved `main`, which correctly enabled Confirmation Pilot #16. Pilot #16 ran from approved `main` `47c30e95c49c1951d0dd31c48b63a1d15506529f` as workflow run `33214478392` and durable job Issue `#226`.

The qualification preflight passed and the paid pipeline reached fresh-context independent educational review. Independent review returned `fail_hold` with material content and assessment-integrity findings, so the course did not reach `expert_review_ready` and no learner content was published.

PR #227 remediated the seven Pilot #16 findings and merged as approved `main` `9f4d86dbeaca5a6fac13884bf8b161964a68ec88`. Because that remediation changed generation, marking and durable-reuse quality assumptions, global paid-pilot eligibility was deliberately returned to `paused`.

The current provider-free requalification layer is:

`content-factory/reliability-post-pilot16-requalification.json`

It preserves the original Q1–Q6 JSON records as historical evidence and records the current Q1–Q6 evidence that must pass together through exact-head CI on the corrected implementation. It does not itself restore paid-pilot eligibility.

Current gate position:

- **Original Q1–Q6 — historical PASS evidence retained:** the merged machine-readable records remain evidence of the implementation originally qualified.
- **Pilot #16 remediation — merged:** approved main is `9f4d86dbeaca5a6fac13884bf8b161964a68ec88`.
- **Post-Pilot-16 Q1–Q6 requalification — current evidence layer:** provider-free contract, subject-shape, deterministic-pipeline, dependency-aware restart and repeated-stability suites are rerun together on the exact candidate head.
- **Current global qualification — paused:** `content-factory/reliability-qualification.json` remains bound to Pilot #16 fail-hold evidence with `qualifiedEvidence: null` and `livePilotEligible: false`.
- **Next paid pilot — not eligible:** a separate governed qualification-status transition remains required after requalification is merged to approved `main`.

The governing standard is not changed. This document records current implementation and qualification evidence; it does not replace that authority.

## Requalification defect discovered before another paid run

Provider-free requalification challenged the Pilot #16 remediation against the governing course-agnostic design rule and found two unsafe generic post-generation mutations before another paid course was dispatched:

1. the Learn cleaner could remove a legitimate trailing non-Latin word from a language or prescribed-text course;
2. the Practice correction matched an exact cash-flow phrase, making a generic worker boundary Business-shaped.

Those mutations are removed in the requalification candidate. They are replaced by generic provider-payload guardrails:

- Learn must avoid unrelated contamination while explicitly preserving legitimate target-language, transliterated, quoted and prescribed-text wording;
- Practice prompts must remain internally consistent with their own expected response and must phrase uncertain conditions conditionally rather than presupposing the result.

The semantic ownership is intentionally different from the deterministic formula/MCQ controls: language coherence and prompt/answer consistency remain **generative judgement** with independent educational review as the fail-closed backstop. Revision does not pretend it can deterministically delete or rewrite semantically valid language.

The affected durable semantic versions advance to:

- `generateLearningCollateral` → `3+output-integrity-v2`;
- `generatePracticeCollateral` → `3+output-integrity-v2`.

This prevents pre-v2 outputs from being reused across the correction while preserving unrelated completed work where dependency fingerprints remain compatible.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` because a Practice exact-evidence check failed. Pilot #10 had already addressed the same broad failure class by moving Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Its reappearance showed that repeated paid whole-course probing was lower-value evidence than systematic provider-free qualification.

Q1–Q7 then completed through governed PRs. Confirmation Pilot #16 proved that the reliability gate was effective: preflight passed, the live pipeline executed under the spend ceiling, and educational assurance—not metadata drift—became the stopping boundary.

Pilot #16 nevertheless exposed material generated-output defects. The response remains the governed pattern: classify reusable defect classes, correct the smallest reusable process boundaries, add provider-free regressions, rerun qualification on the changed implementation, and only then permit another paid confirmation run.

Historical Pilot #10–#16 evidence remains unchanged.

## Live-pilot boundary

The live-pilot workflow remains:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass.

The current global record remains:

- `status: paused`;
- `livePilotEligible: false`;
- `qualifiedEvidence: null`;
- trigger evidence Pilot `16`, workflow run `33214478392`, durable Issue `#226`, failed prior `main` `47c30e95c49c1951d0dd31c48b63a1d15506529f`;
- all six Q1–Q6 gates still required before a new Q7 transition.

The pause is deliberate. Neither the remediation merge nor provider-free test success alone authorizes a paid run.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` remains the original Q1 PASS evidence. The post-Pilot-16 requalification record layers the changed ownership classes without rewriting that historical evidence.

Current ownership additions are:

- known mechanically unambiguous formula representation → **deterministically derived**;
- learner-language coherence / target-language preservation → **generative judgement**;
- Practice prompt/expected-response semantic consistency → **generative judgement**;
- multi-question MCQ correct-option distribution → **deterministically derived**;
- operational per-subquestion Marking Pack rubric coverage → **targeted repair eligible**, with one bounded repair then fail closed.

The original inventory continues to cover Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

## Q2 — provider-free contract matrix

`content-factory/reliability-q2-contract-matrix.json` remains the original Q2 PASS evidence. The current requalification adds `src/content-factory/openai-output-integrity-compiler.test.ts` and `src/content-factory/post-pilot16-requalification.test.ts` to the provider-free evidence layer.

The added defect-class coverage proves:

- deterministic percentage-change canonicalisation without changing unrelated formulas;
- preservation of legitimate non-Latin target-language text through the live-adapter worker contract;
- generic learner-language anti-contamination guidance without blind script deletion;
- generic Practice prompt/expected-response consistency guidance with no Business-specific phrase mutation;
- deterministic MCQ correct-position distribution without changing answer/distractor content;
- generic assessment-premise sufficiency instructions;
- operational per-subquestion Marking Pack coverage with one bounded repair then fail closed;
- no unnecessary extra provider call for valid Learn/Practice output.

## Q3 — subject-shape matrix

`content-factory/reliability-q3-subject-shape-matrix.json` remains the original Q3 PASS evidence.

Executable evidence remains:

- `src/content-factory/q3-subject-shape-fixtures.ts`;
- `src/content-factory/q3-subject-shape-matrix.test.ts`;
- shared orchestration in `src/content-factory/end-to-end-proof.ts`.

The five governed shapes remain quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text. Requalification reruns all five on the corrected implementation and adds a direct adapter-level language regression so the generic integrity layer cannot silently force Latin-only content.

Synthetic fixtures prove process compatibility only. They are not factual, pedagogical or assessment-quality approval and do not prove live external-provider behaviour.

## Q4 — deterministic full-pipeline simulation

`content-factory/reliability-q4-deterministic-pipeline-simulation.json` remains the original Q4 PASS evidence.

Executable evidence remains:

- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

The simulation traverses:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

It proves deterministic validation before review, targeted remediation, correct dependent-stage replacement, fresh independent re-review and no publication side effect. Requalification reruns this simulation on the current candidate head without provider calls.

## Q5 — restart, reuse and dependency-aware invalidation

`content-factory/reliability-q5-restart-reuse-invalidation.json` remains the original Q5 PASS evidence.

Implementation and executable evidence are:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`;
- `src/content-factory/post-pilot16-requalification.test.ts`.

Semantic worker-cache records continue to use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than treating the Git implementation head as a universal semantic invalidation key.

The requalification advances only Learn and Practice integrity semantics to `output-integrity-v2`. Their genuine assurance dependants become incompatible with older cache records; unrelated assessment-generation work remains independent of Learn/Practice in its dependency closure.

Pilot #16 Issue #226 remains blocked educational evidence and is not resumed across this semantic correction. Any later paid proof must be a fresh course job.

## Q6 — repeated qualification stability

`content-factory/reliability-q6-repeated-stability.json` remains the original Q6 PASS evidence with `repetitionCount: 3` and `providerCallsUsed: false`.

Executable evidence remains:

- `src/content-factory/q6-repeated-qualification-fixture.ts`;
- `src/content-factory/q6-repeated-qualification-stability.test.ts`;
- the current Q3, Q4 and Q5 harnesses.

Q6 executes three complete repetitions inside the exact-head qualification suite: 15 subject-shape runs, three deterministic pipeline simulations and three complete restart/reuse scenario sets. Because the fixture imports the current durable dependency policy, requalification exercises the current Learn/Practice semantic versions rather than the historical ones.

Q6 demonstrates operational stability rather than educational correctness or live-provider reliability.

## Q7 — paid confirmation eligibility

The original Q7 transition through PR #225 correctly enabled Confirmation Pilot #16. That historical governed decision is not rewritten.

After Pilot #16, the current status is deliberately paused. Provider-free Q1–Q6 requalification must first be merged to approved `main`. Restoring `qualified` and `livePilotEligible: true` then requires a **separate governed qualification-status PR** with exact-head assurance and Founder approval.

The next paid run remains a **confirmation pilot**, not a debugging probe. It must still obey:

- approved-source and source-rights rules;
- the US$20 per-course spend ceiling and cumulative spend controls;
- deterministic validation and independent review;
- expert/human review authority;
- content accuracy assurance;
- publication governance and no automatic learner publication.

A reliability PASS does not constitute educational correctness, awarding-body endorsement or publication approval.

## Documentation impact

The post-Pilot-16 requalification updates:

- `content-factory/reliability-post-pilot16-requalification.json`;
- `src/content-factory/openai-output-integrity-compiler.ts` and its provider-free regressions;
- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/post-pilot16-requalification.test.ts`;
- `docs/technical/Content Factory Pilot 16 Remediation.md`;
- this indexed technical qualification record.

No normative authority change is required because the active Reliability Qualification Standard already requires course-agnostic correction, provider-free requalification after changed quality assumptions, dependency-aware invalidation and fail-closed paid eligibility. No `INDEX.md` change is required because this document remains the indexed current technical source for the reliability harness.

Historical Pilot #10–#16 evidence and the original Q1–Q6 records are not rewritten.
