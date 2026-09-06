# Content Factory Foundation Source Universe Challenge

**Status:** Proposed implementation with ADR-0024  
**Parent initiative:** Issue #289 — Content Factory foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`

## Purpose

Prevent Foundation assurance from proving completeness against an incomplete source denominator, and prevent a Foundation from being described or packaged as expert-review-ready until a separate fresh-context external-source challenge has passed for the exact Foundation fingerprint.

## Current implementation in this branch

The branch adds:

- `foundation-source-universe.ts` — reusable deterministic Source Universe assurance primitive;
- `aqa-a-level-business-7132-2027-source-universe.ts` — independently declared AQA 7132 / 2027 source requirements;
- `foundation-aqa7132-source-universe-guard.ts` — AQA live compilation guard;
- AQA Formulae and key data plus the September-2023 specification-update notice as mandatory `REFERENCE_ONLY` sources;
- source-rights registry support for awarding-body `quantitative_or_skills_annex` and `amendment_or_notice` resources;
- deterministic injection of structured quantitative alignment facts into the Foundation compilation input;
- live-proof evidence asserting both new sources are retained in the exact Source Licence Register;
- independent-review fail-closed checks preventing review/remediation when the required Source Universe is incomplete;
- `foundation-external-source-challenge.ts` — a portable exact-fingerprint external-source challenge contract; and
- expert-review package schema v2, which requires a passing challenge bound to the exact job, Candidate, implementation commit, Foundation fingerprint and Source Universe before packaging can succeed.

Historical schema-v1 expert packages remain readable as historical evidence. New expert packages are schema v2 and cannot be created through the old deterministic-plus-independent-review boundary.

## AQA quantitative remediation

The structured alignment facts added from the current AQA Formulae and key data resource cover the specific defects found by the 6 September AI pre-review:

- market capitalisation calculation;
- added-value calculation;
- return-on-investment calculation;
- gross profit / operating profit / profit-for-year calculations;
- gross, operating and profit-for-year margin calculations;
- AQA recommended variance convention: budgeted figure minus actual figure; and
- AQA recommended labour-turnover denominator, while preserving the board's note that alternative formulae may be valid where appropriate.

The same compilation guard also strengthens the retained critical-path semantic input so the path is identified as the longest-duration start-to-finish route that determines minimum project completion time.

These are structured alignment facts only. Protected AQA source prose is not supplied to generative workers.

## External-source challenge boundary

ADR-0024 requires a fresh-context external-source challenge before the Founder is told that a Foundation is ready for qualified expert review. That challenge is deliberately different from the ordinary independent artifact review: it assumes the Source Universe and requirement universe may themselves be incomplete.

The external challenge report must:

- cover the exact Foundation job, Candidate, implementation commit and aggregate fingerprint;
- identify the exact Source Universe profile and every required source challenged;
- use a reviewer context distinct from all retained Foundation generation and assurance contexts;
- explicitly record those excluded earlier contexts;
- return `fail_hold` for any blocking or material finding; and
- retain evidence references for the challenge.

`buildFoundationExpertReviewPackage` now fails closed unless that challenge passes and covers every source required by the supplied Source Universe. Stale challenge evidence, an omitted required source, the wrong Source Universe profile or reused context all prevent expert packaging.

The retained package proof also requires `CONTENT_FACTORY_FOUNDATION_EXTERNAL_SOURCE_CHALLENGE_PATH`. The package workflow no longer supports the old issue-comment shortcut; a main-branch workflow dispatch must provide the structured challenge report JSON explicitly. This makes challenge evidence a required input rather than an advisory instruction.

The challenge contract does not change source rights. `REFERENCE_ONLY` AQA source text remains outside generative worker contexts. Challenge evidence must be produced through an approved external browsing/reference-only process and imported as structured evidence.

## Regression strategy

Normal CI must prove:

- the complete AQA source universe passes;
- omission of the Formulae and key data source fails closed;
- an incorrect source-rights classification fails closed;
- a material external-source challenge finding blocks expert packaging;
- stale challenge evidence fails closed;
- omission of a required challenged source fails closed;
- reuse of an earlier Foundation context fails closed; and
- existing Foundation compilation/review and historical-package readability remain green.

After merge, no historical AQA Candidate may be reused. A fresh main-only AQA 7132 / 2027 Foundation compilation is required because the source set and Course Truth dependency set are materially changed. That fresh fingerprint must then rerun deterministic assurance and independent review, receive a new fresh-context external-source challenge, and only then be eligible for qualified-human review packaging.

## Documentation impact

Normative change is proposed in the existing Requirement-Led Coverage Amendment and ADR-0024. Historical proof/review evidence remains unchanged. The active Foundation implementation plan should be updated with the final exact-head/released evidence once the implementation is complete and released.
