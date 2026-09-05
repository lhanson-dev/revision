# ADR-0022 — Foundation pre-calibration assessment assembly boundary

**Status:** Accepted — Founder-approved and released through PR #309  
**Date:** 4 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`

## Context

The fifth retained AQA A-level Business 7132 Foundation proof reached the governed three-cycle remediation limit after the technical review/remediation machinery itself had operated correctly. One final material finding showed that targeted remediation had converted the verified Paper 3 fact — one compulsory case study followed by approximately six questions — into a rigid `5/10/15/20/25/25` constituent mark sequence with matching `6/12/18/24/30/30` minute guidance while the Question Family still declared `not_calibrated`.

That detail was not supported by Board Alignment and had not been established by qualified human calibration. It was generative precision rather than governed Exam Truth.

The same ownership issue applies to Paper 2: Board Alignment verifies a 100-mark, 120-minute paper with three compulsory data-response questions worth approximately 33 marks each. That supports aggregate paper shape, not an invented exact sub-question/timing template.

## Decision

For the Foundation-native AQA A-level Business 7132 / 2027 proof profile, Paper 2 and Paper 3 Question Families remain **aggregate-only before qualified calibration**.

While their `calibrationStatus` is `not_calibrated`:

- exact Board Alignment component totals and timings remain compiler-owned and enforceable;
- verified approximate paper shape remains enforceable;
- the Question Family mark envelope is the component-wide range `1..component mark total`, not a claim about a calibrated constituent-question range;
- the compiler owns an explicit response-shape statement that says constituent mark and timing allocations remain unfixed until qualified calibration;
- provider-authored exact constituent mark/timing allocations outside that compiler-owned response shape fail closed; and
- targeted remediation passes through the same deterministic boundary before a replacement can be retained.

For AQA 7132 the current compiler-owned shapes are:

- **Paper 2:** three compulsory data-response questions; constituent mark and timing allocations remain unfixed until qualified calibration.
- **Paper 3:** one compulsory case study followed by approximately six questions; constituent mark and timing allocations remain unfixed until qualified calibration.

This does not weaken the verified component facts. Paper 2 and Paper 3 remain exactly 100 marks and 120 minutes each, and the Board Alignment source requirements remain unchanged.

## Why the guard is profile-specific

The fifth proof established this boundary for the exact AQA 7132 / 2027 assessment evidence currently governed in Revision. It does not establish that every qualification should use the same Paper 2/Paper 3 rule or the same pre-calibration mark envelope.

The implementation therefore remains tied to the AQA 7132 Foundation profile. A future generic abstraction should be promoted only when multiple materially different course profiles demonstrate the same invariant.

## Assurance consequence

The pre-calibration boundary applies at both generative entry points:

1. initial Question Family compilation before persistence; and
2. targeted Question Family remediation before a replacement is retained.

Regression assurance must prove that:

- a rigid Paper 3 mark/timing sequence is removed from the compiler-owned response shape;
- exact constituent allocations hidden in other provider-authored Question Family fields fail closed;
- Paper 2 and Paper 3 retain the aggregate component totals/shape established by Exam Truth; and
- the resulting Question Families remain `not_calibrated`.

The next paid proof must compile a fresh Foundation Candidate after both ADR-0021 semantic-seed hardening and this assembly-boundary hardening are released.

## Deliberately excluded

This ADR does not:

- define a permanent calibrated Paper 2 or Paper 3 internal mark scheme;
- claim that every individual question can validly take any mark between 1 and 100;
- permit generated full papers before Foundation approval;
- replace Slice 3C qualified subject/assessment review;
- raise the three-cycle remediation limit;
- weaken fresh-context independent review; or
- globalise the AQA 7132 rule to other courses without evidence.

The `1..100` Question Family mark envelope is explicitly a **pre-calibration non-claim**: it prevents the Foundation from asserting unsupported constituent precision. Later qualified calibration may replace it with a narrower governed range or richer assembly contract.

## Consequences

- The next AQA 7132 Foundation compile will use the enriched semantic seed plus the pre-calibration assembly guard.
- A new Foundation fingerprint/version is expected because the semantic seed changed under ADR-0021; historical retained candidates are not mutated.
- Remediation capacity is no longer spent manufacturing unsupported exact Paper 2/Paper 3 constituent patterns merely to satisfy a request for structural precision.
- If independent or expert review later establishes a supported calibrated constituent pattern, that becomes a new governed Foundation change rather than an implicit model invention.

## Implementation clarification — Slice 3B Run #19, 5 September 2026

The first post-release Slice 3B proof showed that this decision also requires a deterministic distinction between an exact **aggregate component fact** and an exact **constituent allocation**.

The phrase `component-level 120-minute response-time envelope` is an allowed reference to the already-verified whole-component timing. It must not be rejected merely because it contains an exact numeric timing. By contrast, a statement such as `each data-response set should use a 40-minute allocation` remains a forbidden constituent timing claim before qualified calibration.

The same distinction applies to independent review. A reviewer may challenge contradictions with verified component totals, timings, compulsory shape or supported approximate structure, but the deliberate absence of exact constituent mark/timing calibration is not itself a material defect while the Question Family remains governed as `not_calibrated`. A reviewer must not require unsupported exact constituent precision simply to make the family appear more operationally specific.

This clarification does not change the ADR decision. It makes the existing ownership boundary explicit for deterministic classification and reviewer instructions.
