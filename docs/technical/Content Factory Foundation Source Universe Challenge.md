# Content Factory Foundation Source Universe Challenge

**Status:** Proposed implementation with ADR-0024  
**Parent initiative:** Issue #289 — Content Factory foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`

## Purpose

Prevent Foundation assurance from proving completeness against an incomplete source denominator.

## Current implementation in this branch

The branch adds:

- `foundation-source-universe.ts` — reusable deterministic Source Universe assurance primitive;
- `aqa-a-level-business-7132-2027-source-universe.ts` — independently declared AQA 7132 / 2027 source requirements;
- `foundation-aqa7132-source-universe-guard.ts` — AQA live compilation guard;
- AQA Formulae and key data plus the September-2023 specification-update notice as mandatory `REFERENCE_ONLY` sources;
- source-rights registry support for awarding-body `quantitative_or_skills_annex` and `amendment_or_notice` resources;
- deterministic injection of structured quantitative alignment facts into the Foundation compilation input;
- live-proof evidence asserting both new sources are retained in the exact Source Licence Register; and
- independent-review fail-closed checks preventing review/remediation when the required Source Universe is incomplete.

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

ADR-0024 also requires a fresh-context external-source challenge before the Founder is told that a Foundation is ready for qualified expert review. That challenge is deliberately different from the ordinary independent artifact review: it assumes the Source Universe and requirement universe may themselves be incomplete.

The deterministic Source Universe gate implemented here is the prerequisite. The remaining implementation condition before this PR can be considered complete is to bind a fresh-context challenge result into expert-review readiness/packaging so `ready for expert review` cannot be reported from deterministic + ordinary independent review alone.

## Regression strategy

Normal CI must prove:

- the complete AQA source universe passes;
- omission of the Formulae and key data source fails closed;
- an incorrect source-rights classification fails closed; and
- existing Foundation compilation/review tests remain green.

After merge, no historical AQA Candidate may be reused. A fresh main-only AQA 7132 / 2027 Foundation compilation is required because the source set and Course Truth dependency set are materially changed. That fresh fingerprint must then rerun deterministic assurance, independent review, external-source challenge and qualified-human review packaging.

## Documentation impact

Normative change is proposed in the existing Requirement-Led Coverage Amendment and ADR-0024. Historical proof/review evidence remains unchanged. The active Foundation implementation plan should be updated with the final exact-head/released evidence once the implementation is complete and released.
