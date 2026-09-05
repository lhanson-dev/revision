# ADR-0024 — Foundation external completeness baseline

**Status:** Proposed for Founder approval with PR #318  
**Date:** 5 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Foundation Completeness Amendment.md`

## Context

The retained AQA A-level Business 7132 Foundation passed deterministic assurance and fresh-context independent AI review, then failed qualified human review because material curriculum/exam requirements were missing or incorrectly scoped.

The prior controls had correctly proved internal integrity: exact artifact fingerprints, governed source rights, Board Alignment consistency, exact coverage-to-Course-Truth reconciliation, Exam Truth reconciliation and fresh review context.

They had not proved that the requirement set entering Foundation coverage was itself complete against the applicable external specification.

The independent reviewer was deliberately bounded to supplied Foundation artifacts and rights-safe source metadata, so an obligation omitted upstream could remain absent from reviewer context. The qualified-human package similarly contained the exact Foundation artifacts but no first-class independently established specification-to-Foundation completeness baseline.

A richer AQA source/coverage record already existed in the repository, demonstrating that this was also a migration failure: coverage knowledge was not carried forward as an enforced Foundation input.

## Decision

Foundation completeness requires a first-class **Foundation Requirement Baseline** established independently of the semantic Course Truth seed.

For the exact course/cohort, the baseline records every applicable curriculum and assessment obligation needed to judge completeness, with source provenance and one governed disposition:

- required Course Truth;
- required Exam Truth;
- required in both;
- explicit specification boundary; or
- not applicable.

Every required obligation must reconcile to exact Foundation artifact identities before `coverage complete` or `courseTruthCompleteness: complete` can be trusted.

The semantic seed remains a bounded generative input and must not become the completeness denominator for itself.

## Assurance consequence

Deterministic Foundation assurance must verify the exact baseline/reconciliation and fail when any applicable obligation is unmapped or points to absent Course/Exam Truth.

Fresh-context independent review receives the baseline as review evidence and challenges substantive satisfaction of mapped obligations.

The qualified-human review package includes the exact baseline/reconciliation and explicitly asks the reviewer to challenge both:

1. whether the Foundation satisfies the mapped obligations; and
2. whether the baseline itself is complete and cohort-correct.

A material defect in either requires `fail_hold`.

## Rights boundary

The baseline is an assurance/control artifact, not learner content or a generative source. Existing source-rights rules continue to govern what awarding-body material may be stored, summarised, referenced or passed to AI workers.

This decision does not authorise protected specification prose to be copied into generative Course Truth context.

## AQA 7132 consequence

The retained AQA Business Foundation remains failed/held. Its existing semantic seed and Foundation artifacts must be reconciled against a new cohort-correct baseline derived from current official 7132 curriculum/exam authority and the pre-existing repository coverage record as migration evidence.

Historical retained candidates, proof runs and prior ADRs are not rewritten.

## Deliberately excluded

This ADR does not:

- concern learner-facing Learn, Practice or Exam Prep production;
- establish fixed quantities of content or artifacts;
- weaken no-invention generative controls;
- replace qualified-human review; or
- make the current AQA Foundation approved.

## Consequences

- Foundation compilation gains an external completeness input distinct from the semantic seed.
- Internal coverage consistency remains necessary but is no longer sufficient.
- The approval package becomes materially stronger because human reviewers receive the completeness baseline, not only Revision's resulting Foundation model.
- Migration of an existing course must explicitly reconcile richer prior coverage evidence rather than silently narrow it.
