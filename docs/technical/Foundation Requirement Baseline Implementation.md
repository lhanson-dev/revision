# Foundation Requirement Baseline Implementation

**Status:** Draft implementation for PR #318  
**Date:** 5 September 2026  
**Authority:** `80-company-workflows/Content Factory Foundation Completeness Amendment.md`

## Purpose

Record the technical implementation needed to ensure Foundation approval proves external curriculum/exam completeness rather than only internal consistency.

## Required runtime boundary

A Foundation Candidate must carry a first-class `foundation_requirement_baseline` artifact established independently of the semantic Course Truth seed.

The baseline contains cohort-correct obligations and their governed dispositions:

- required Course Truth;
- required Exam Truth;
- required in both;
- explicit specification boundary; or
- not applicable.

The baseline may use structured summaries and source references under the existing source-rights controls. It is an assurance/control artifact and is not passed into generative Course Truth workers as protected awarding-body prose.

## Compilation

Before Course Truth can be declared complete:

1. establish the requirement baseline for the exact course/cohort;
2. resolve the semantic Course Truth seed and Board/Exam Truth inputs;
3. map every applicable baseline obligation to canonical Course Truth node IDs and/or Exam Truth references;
4. fail closed if any required mapping is absent; and
5. persist the exact baseline/reconciliation with a fingerprint in the Foundation Candidate.

The current `foundationCoverageModel` remains useful for internal requirement-to-node reconciliation, but it is no longer sufficient on its own to prove specification completeness.

## Deterministic assurance

Deterministic Foundation assurance must load the baseline artifact and prove:

- fingerprint integrity;
- exact course/cohort/source-set binding;
- unique obligation IDs;
- valid dispositions;
- every required Course Truth mapping resolves to the exact Course Knowledge Model;
- every required Exam Truth mapping resolves to Board Alignment / Assessment Blueprint / Question Families as applicable; and
- there are zero applicable unresolved baseline obligations.

A candidate may be structurally perfect relative to its coverage model and still fail this check.

## Independent AI review

The independent reviewer receives the baseline and reconciliation as supplied review evidence. It does not need unrestricted web browsing to discover the curriculum because the external requirement universe is now a governed input.

The independent reviewer challenges whether the mapped Foundation content materially satisfies the obligation; deterministic assurance owns the existence and identity of the mapping.

## Qualified-human package

`foundation_expert_review_package` and the resolved expert bundle must include the exact requirement-baseline artifact and fingerprint.

The reviewer instructions must explicitly ask the reviewer to:

- check that the baseline itself appears complete for the exact course/cohort;
- verify that each material mapped obligation is substantively satisfied by Course Truth/Exam Truth;
- identify stale, removed or incorrectly scoped requirements; and
- return `fail_hold` for any blocking/material omission or incorrect mapping.

This provides two independent protections:

1. machine reconciliation catches missing mappings from a known baseline;
2. qualified human review can still catch omissions or errors in the baseline itself.

## AQA 7132 remediation

For AQA A-level Business 7132 / 2027, build the initial Foundation Requirement Baseline by reconciling:

- the current official 7132 subject-content and scheme-of-assessment sources;
- the applicable 2023 specification-change boundary for exams from summer 2025 onward; and
- the existing repository `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` record as migration evidence.

Do not treat the existing semantic seed as the completeness denominator.

The current Foundation must remain `FAIL-HOLD` until this baseline is complete and the seed/Foundation artifacts are regenerated and reassured against it.

## Documentation impact

This implementation changes Foundation compilation, assurance and expert-review packaging behavior. The current Foundation technical docs must be updated in the same governed PR. Historical proof records remain unchanged.