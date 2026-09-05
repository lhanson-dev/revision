# Content Factory Foundation Completeness Amendment

**Status:** Proposed — requires Founder approval  
**Date:** 5 September 2026  
**Parent authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`

## Purpose

Clarify the Foundation completeness gate after qualified human review of AQA A-level Business 7132 exposed that an internally consistent Foundation can still be incomplete against the applicable curriculum and exam specification.

This amendment applies only to Foundation production and approval. It does not govern learner-asset quantities.

## Governing rule

A Foundation may claim curriculum/specification completeness only when the complete applicable requirement universe for the exact course and cohort has been established independently of the Course Truth semantic seed and reconciled to the Foundation.

The requirement universe is represented by a first-class **Foundation Requirement Baseline**.

The baseline must cover, where applicable:

- curriculum/specification knowledge and skill obligations;
- required models, methods, theories, processes and quantitative methods;
- exam/component structure and assessment obligations;
- assessment-objective and response-demand requirements;
- cross-cutting and synoptic requirements;
- explicit scope boundaries, including requirements that are interpretation-only or otherwise constrained; and
- deliberately not-applicable or removed requirements where recording the boundary is necessary to prevent stale content from being reintroduced.

The baseline is an assurance/control artifact. It is not learner-facing content and does not itself authorise protected source prose for generative use.

## Independence from the semantic seed

The Foundation Requirement Baseline must not be derived solely from the semantic Course Truth seed that it is intended to test.

A semantic seed may be complete only relative to itself. Therefore:

- the baseline establishes **what must be covered**;
- the semantic seed/Course Truth establishes **Revision's permitted representation of that truth**; and
- deterministic reconciliation proves the second satisfies the first.

A missing obligation in the semantic seed must remain visible as a failed baseline reconciliation rather than disappearing from the completeness denominator.

## Completeness condition

`coverage complete` requires zero applicable unmapped baseline obligations.

Each baseline obligation must have one of these governed dispositions:

1. mapped to Course Truth;
2. mapped to Exam Truth / Board Alignment;
3. mapped to both Course Truth and Exam Truth;
4. recorded as an explicit scope boundary; or
5. recorded as not applicable with evidence.

No Foundation Candidate may progress to qualified-human approval when an applicable baseline obligation is unresolved.

## Deterministic assurance requirement

Foundation deterministic assurance must validate the exact Foundation Requirement Baseline and its reconciliation against the exact Foundation fingerprint under review.

Internal consistency between the coverage model and Course Truth is necessary but not sufficient for completeness.

## Independent review requirement

Fresh-context independent review must receive the requirement baseline and reconciliation as part of the reviewable Foundation evidence.

The reviewer must challenge whether the Foundation meaningfully satisfies the mapped obligation, while deterministic controls own mechanical mapping completeness.

## Qualified-human approval package

The qualified-human review package must include the exact Foundation Requirement Baseline and its reconciliation alongside Course Truth, Exam Truth and existing Foundation artifacts.

Human instructions must make clear that the reviewer is judging curriculum and assessment completeness against this external requirement baseline, not merely checking whether Revision's supplied artifacts are internally coherent.

A human reviewer remains free to identify requirements missing from or incorrectly represented in the baseline. Such a finding is a Foundation defect and requires `fail_hold`.

## Migration rule

When a course already has a prior governed source/coverage record, migration into the Foundation-native path must reconcile that record explicitly. The new Foundation path must not silently replace a richer previous coverage record with a narrower seed.

Historical proof evidence remains unchanged.

## Documentation impact

Implementation must update current Foundation compilation, deterministic assurance, independent-review and expert-review packaging documentation. Historical ADRs and retained proof evidence must not be rewritten.