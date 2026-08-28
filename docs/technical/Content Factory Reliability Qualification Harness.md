# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability gate is now in its post-Pilot-16 qualification-status transition.

The original course-agnostic Q1–Q7 qualification enabled Confirmation Pilot #16 from approved `main` `47c30e95c49c1951d0dd31c48b63a1d15506529f`. Pilot #16 ran as workflow `33214478392` and durable job Issue `#226`. Its qualification preflight passed and the paid pipeline reached fresh-context independent educational review. Independent review returned `fail_hold` with material content and assessment-integrity findings, so the course did not reach `expert_review_ready` and no learner content was published.

PR #227 remediated the Pilot #16 defect classes and merged as approved `main` `9f4d86dbeaca5a6fac13884bf8b161964a68ec88`. Because that remediation changed generation, marking and durable-reuse quality assumptions, global paid-pilot eligibility was deliberately returned to `paused`.

PR #228 then completed provider-free requalification and merged as approved `main` `3f6493be1424e281f26a8f0e14855c26ed9a999e`. The current requalification evidence is:

`content-factory/reliability-post-pilot16-requalification.json`

That record proves Q1–Q6 on the corrected implementation while deliberately leaving paid-pilot permission false. This separate Q7-style qualification-status change now restores the global machine-readable state to `qualified` only because the requalification evidence is already on approved `main`.

Current position:

- **Pilot #16:** historical `fail_hold` evidence retained unchanged.
- **Pilot #16 remediation:** merged and approved.
- **Post-Pilot-16 Q1–Q6 requalification:** merged on approved `main` `3f6493be1424e281f26a8f0e14855c26ed9a999e`.
- **Global qualification:** `qualified` once this governed status PR is merged.
- **Next paid run:** eligible only as a fresh confirmation pilot after this status PR receives exact-head assurance and explicit Founder merge approval.

The governing standard is unchanged. This document records current implementation and qualification evidence; it does not replace `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

## Post-Pilot-16 requalification result

Provider-free requalification challenged the first Pilot #16 remediation against the course-agnostic design rule before another paid course was dispatched. It found two unsafe generic post-generation mutations:

1. a Learn cleaner could remove legitimate non-Latin target-language content;
2. a Practice repair encoded an exact Business/cash-flow phrase at a generic worker boundary.

PR #228 replaced both with generic generation contracts:

- Learn must avoid unrelated contamination while preserving legitimate target-language, transliterated, quoted and prescribed-text wording;
- Practice prompts must remain semantically consistent with their own expected responses and phrase uncertain conditions conditionally rather than presupposing the result.

The affected durable worker semantics advanced to:

- `generateLearningCollateral` → `3+output-integrity-v2`;
- `generatePracticeCollateral` → `3+output-integrity-v2`.

This prevents pre-v2 outputs from being reused across the correction while preserving unrelated compatible work.

## Qualification evidence model

Historical qualification records are not rewritten. The evidence model is layered:

- original Q1–Q6 JSON records remain historical evidence for the implementation originally qualified;
- `content-factory/reliability-post-pilot16-requalification.json` records current post-Pilot-16 Q1–Q6 evidence;
- `content-factory/reliability-qualification.json` is the machine-readable current global eligibility state consumed by the paid live-pilot preflight.

The global record now binds qualification to approved `main` `3f6493be1424e281f26a8f0e14855c26ed9a999e`, references the post-Pilot-16 requalification record, records all six passed gates, records three Q6 repetitions and classifies the next paid run as `confirmation_pilot`.

Pilot #16 remains the trigger evidence for why the second qualification cycle was required. Restoring eligibility does not convert that failed run into a success.

## Q1 — worker-contract inventory

The original machine-readable inventory remains `content-factory/reliability-contract-inventory.json`. Post-Pilot-16 requalification layers the changed ownership classes without rewriting history.

Current ownership additions include:

- known mechanically unambiguous formula representation → **deterministically derived**;
- learner-language coherence and target-language preservation → **generative judgement**;
- Practice prompt/expected-response semantic consistency → **generative judgement**;
- multi-question MCQ correct-option distribution → **deterministically derived**;
- operational per-subquestion Marking Pack rubric coverage → **targeted repair eligible**, with one bounded repair then fail closed.

## Q2 — provider-free contract matrix

The original Q2 evidence remains `content-factory/reliability-q2-contract-matrix.json`. Current provider-free regressions additionally prove:

- deterministic percentage-change canonicalisation without changing unrelated formulas;
- preservation of legitimate non-Latin target-language content;
- generic anti-contamination guidance without blind script deletion;
- generic Practice prompt/answer consistency without Business-specific phrase mutation;
- deterministic MCQ correct-position distribution without changing answer or distractor content;
- generic assessment-premise sufficiency;
- operational Marking Pack coverage for structured subquestions with one bounded repair then fail closed;
- no unnecessary extra provider call for valid output.

## Q3 — subject-shape matrix

The five required course shapes remain:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language/prescribed-text.

Synthetic fixtures prove process compatibility only. They do not constitute factual, pedagogical or awarding-body approval. Requalification includes a direct adapter-level language regression so the generic integrity layer cannot silently force Latin-only content.

## Q4 — deterministic pipeline simulation

The provider-free full-pipeline simulation continues to traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

It proves deterministic validation at the intended boundary, targeted remediation, dependent-stage invalidation, fresh independent re-review, expert-review package assembly and no publication side effect.

## Q5 — restart, reuse and dependency-aware invalidation

Semantic worker-cache compatibility continues to use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than Git head alone.

The post-Pilot-16 requalification proves that the Learn/Practice `output-integrity-v2` change invalidates those affected branches and their genuine dependants while unrelated identity, source, coverage and independent assessment-generation work remains reusable when dependency closure is unchanged.

Pilot #16 Issue #226 remains blocked historical evidence and is not resumed across this semantic correction. The next paid proof must be a fresh course job.

## Q6 — repeated qualification stability

Q6 remains three complete provider-free repetitions:

- 15 subject-shape runs;
- three deterministic pipeline simulations;
- three complete restart/reuse scenario sets.

The post-Pilot-16 requalification executes these against the current durable dependency policy and current generic integrity contracts. Q6 demonstrates operational stability, not educational correctness or live-provider reliability.

## Q7 — paid confirmation eligibility

The original Q7 transition correctly enabled Confirmation Pilot #16 and remains historical governance evidence.

After Pilot #16, Q7 was intentionally reset by PR #227. PR #228 then re-established Q1–Q6 PASS on approved `main` without granting paid-run permission. This separate governed status transition restores:

- `status: qualified`;
- `livePilotEligible: true`;
- `qualifiedEvidence.qualificationEvidenceMainSha: 3f6493be1424e281f26a8f0e14855c26ed9a999e`;
- all six Q1–Q6 gates in `qualifiedEvidence.passedGates`;
- `q6RepetitionCount: 3`;
- `nextPaidRunClass: confirmation_pilot`.

The live-pilot workflow remains fail closed:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. The preflight requires both `status === "qualified"` and `livePilotEligible === true`, requires `qualifiedEvidence`, and rejects any qualified record missing a required passed gate.

The next paid run is therefore eligible only after this status transition is merged to approved `main`. It remains a **confirmation pilot**, not a debugging probe, and must still obey:

- source-rights and approved-source rules;
- the US$20 per-course spend ceiling and cumulative spend controls;
- deterministic validation;
- independent educational review;
- expert/human review authority;
- the Content Accuracy Assurance Gate;
- publication governance and no automatic learner publication.

Reliability qualification does not constitute educational correctness, awarding-body endorsement or publication approval.

## Documentation impact

This status transition updates:

- `content-factory/reliability-qualification.json`;
- `src/content-factory/q7-qualification-status.test.ts`;
- this indexed technical qualification record.

No normative authority or `INDEX.md` change is required. The active Reliability Qualification Standard already defines Q7 as the separate governed transition from Q1–Q6 PASS to paid confirmation eligibility, and this document remains the indexed implementation source for the qualification harness.

Historical Pilot #10–#16 evidence, Issue #226 and the original Q1–Q6 machine-readable records remain unchanged.
