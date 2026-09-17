# Content Factory Foundation Expert Review Contract

**Status:** Qualified-human contract released under the existing runtime; AI-assured predecessor state proposed by ADR-0024 and not yet implemented
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the qualified-human Foundation review boundary. AI assurance must not stand in for the human gate.

Under ADR-0024 the target model separates two decisions:

- `ai_assured`: exact Candidate has passed the governed machine/AI assurance chain and may support controlled internal asset derivation;
- `foundation_approved`: the exact fingerprint has additionally passed qualified-human subject/assessment review and may support learner-publication eligibility.

The released runtime on `main` does not yet contain `ai_assured`; until implementation lands, existing fail-closed expert-review and asset gates remain operational truth.

## Approval-ready human package

A qualified-human package requires, for the same exact Foundation fingerprint:

- passing deterministic Foundation assurance;
- passing fresh-context independent Foundation review;
- passing fresh-context external-source challenge against the current required Source Universe;
- no unresolved blocking/material Foundation findings;
- exact resolved Foundation artifacts/fingerprints;
- complete source-led curriculum and exam reconciliation; and
- a neutral human-decision submission requiring genuine subject and assessment qualification evidence.

These are prerequisites for human review, not substitutes for it.

When the ADR-0024 runtime lands, the package must additionally prove that the supplied exact fingerprint is the current `ai_assured` Candidate. Human review being pending must remain a pending state rather than being converted into `fail_hold`.

## Human review task

The qualified reviewer or reviewer set must cover both subject and assessment expertise and provide qualification evidence references. The reviewer inspects the explicit source-led curriculum/exam reconciliation and the exact Foundation artifacts to which it maps.

The review challenges requirement-universe correctness, Course Truth coverage/accuracy/depth, Exam Truth and assessment structure, question/response families, assessment-objective demand, quantitative requirements, response/marking expectations, pre-calibration boundaries, factual/conceptual accuracy, internal consistency, source-boundary interpretation and missing applicable requirements.

Prior deterministic, independent-AI, external-source or `ai_assured` PASS evidence must not be treated as qualified-human approval.

A blocking or material human finding requires hold/remediation. A pass is valid only when no blocking or material findings remain.

## Fingerprint consequence

Human approval is valid only for the exact reviewed fingerprint. If review requires a material correction, the corrected Candidate receives a new fingerprint and must return through the applicable assurance chain before approval. Any pre-production assets bound to the superseded fingerprint remain release-ineligible and must follow the ADR-0024 invalidation/re-assurance rule.

If the reviewer approves the exact AI-assured fingerprint unchanged, the Foundation may become `foundation_approved`. This does not by itself publish assets; asset-specific assurance and release controls still apply.

## Historical evidence

Historical AQA packages, PASS/`fail_hold` results and proof records remain evidence of their exact implementation state. They are not rewritten to claim that `ai_assured` existed before ADR-0024 or that an AI PASS was human approval.

## Documentation impact

This document records the target qualified-human boundary while explicitly preserving current implementation truth. Runtime/schema/orchestration changes and tests are still required before `ai_assured` can be treated as released.