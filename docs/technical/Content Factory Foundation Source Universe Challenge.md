# Content Factory Foundation Source Universe Challenge

**Status:** Active implementation under ADR-0024  
**Parent initiative:** Issue #289 — Content Factory foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md` and `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`

## Purpose

Prevent Foundation assurance from proving completeness against an incomplete source denominator, and prevent a Foundation from being described or packaged as expert-review-ready until a separate fresh-context external-source challenge has passed for the exact Foundation fingerprint.

## Current implementation

The released Source Universe / challenge design includes:

- `foundation-source-universe.ts` — reusable deterministic Source Universe assurance primitive;
- `aqa-a-level-business-7132-2027-source-universe.ts` — independently declared AQA 7132 / 2027 source requirements;
- `foundation-aqa7132-source-universe-guard.ts` — AQA live compilation guard;
- AQA Formulae and key data plus the September-2023 specification-update notice as mandatory `REFERENCE_ONLY` sources;
- source-rights registry support for awarding-body `quantitative_or_skills_annex` and `amendment_or_notice` resources;
- controlled structured quantitative alignment facts in the Foundation compilation path;
- live-proof evidence asserting both new sources are retained in the exact Source Licence Register;
- independent-review fail-closed checks preventing review/remediation when the required Source Universe is incomplete;
- `foundation-external-source-challenge.ts` — a portable exact-fingerprint external-source challenge contract; and
- expert-review package schema v2, which requires a passing challenge bound to the exact job, Candidate, implementation commit, Foundation fingerprint and Source Universe before packaging can succeed.

Historical schema-v1 expert packages remain readable as historical evidence. New expert packages are schema v2 and cannot be created through the old deterministic-plus-independent-review boundary.

## Reference-only alignment boundary

Fresh main-only Live Proof #21 on 6 September 2026 correctly failed before Foundation creation because the first Source Universe implementation attached `aqa-7131-7132-formulae-key-data` directly to a curriculum requirement. The source-rights gate rejected that path with `without permitted derived curriculum rights`.

That failure establishes an important implementation boundary:

- AQA `REFERENCE_ONLY` sources may define verified structured qualification-alignment facts;
- those sources must not become curriculum `sourceRefs` and must not be treated as OPEN/derived curriculum authority;
- controlled factual conventions may be retained in Board Alignment and applied deterministically to the exact Course Truth nodes they govern;
- Course Truth retains permitted curriculum-source provenance separately and records the relevant Board Alignment IDs for qualification-specific conventions; and
- protected AQA prose remains outside generative worker inputs.

The guard therefore retains formula/convention facts as verified Board Alignment assessment requirements and deterministically binds their IDs to affected Course Truth nodes. This preserves the distinction between curriculum truth and qualification alignment required by the source-licensing authority instead of weakening the rights gate.

## AQA quantitative alignment facts

The controlled alignment facts cover the defects found by the 6 September AI pre-review:

- market capitalisation calculation;
- added-value calculation;
- return-on-investment calculation;
- gross profit / operating profit / profit-for-year calculations;
- gross, operating and profit-for-year margin calculations;
- the current AQA variance convention: budgeted figure minus actual figure;
- labour-turnover presentation, while preserving the qualification's allowance for an appropriate alternative where the supplied data support it; and
- critical-path identification as the longest-duration start-to-finish route determining minimum project completion time.

These are structured factual alignment controls. They are not copied AQA source prose and the AQA source itself remains `REFERENCE_ONLY` with generative source-text ingestion disabled.

## External-source challenge boundary

ADR-0024 requires a fresh-context external-source challenge before the Founder is told that a Foundation is ready for qualified expert review. That challenge is deliberately different from the ordinary independent artifact review: it assumes the Source Universe and requirement universe may themselves be incomplete.

The external challenge report must:

- cover the exact Foundation job, Candidate, implementation commit and aggregate fingerprint;
- identify the exact Source Universe profile and every required source challenged;
- use a reviewer context distinct from all retained Foundation generation and assurance contexts;
- explicitly record those excluded earlier contexts;
- return `fail_hold` for any blocking or material finding; and
- retain evidence references for the challenge.

`buildFoundationExpertReviewPackage` fails closed unless that challenge passes and covers every source required by the supplied Source Universe. Stale challenge evidence, an omitted required source, the wrong Source Universe profile or reused context all prevent expert packaging.

The retained package proof requires `CONTENT_FACTORY_FOUNDATION_EXTERNAL_SOURCE_CHALLENGE_PATH`. The package workflow no longer supports the old issue-comment shortcut; a main-branch workflow dispatch must provide the structured challenge report JSON explicitly.

The challenge contract does not change source rights. `REFERENCE_ONLY` AQA source text remains outside generative worker contexts. Challenge evidence must be produced through an approved external browsing/reference-only process and imported as structured evidence.

## Regression strategy

Normal CI must prove:

- the complete AQA source universe passes;
- omission of the Formulae and key data source fails closed;
- an incorrect source-rights classification fails closed;
- AQA formula/convention sources never enter curriculum requirement `sourceRefs`;
- controlled AQA quantitative facts remain attributable through Board Alignment;
- affected Course Truth nodes retain permitted curriculum sources while recording the governing Board Alignment fact IDs;
- a material external-source challenge finding blocks expert packaging;
- stale challenge evidence fails closed;
- omission of a required challenged source fails closed;
- reuse of an earlier Foundation context fails closed; and
- existing Foundation compilation/review and historical-package readability remain green.

No historical AQA Candidate may be reused. After this boundary repair is released, a new main-only AQA 7132 / 2027 Foundation compilation is required. That fresh fingerprint must rerun deterministic assurance and independent review, receive a new fresh-context external-source challenge, and only then be eligible for qualified-human review packaging.

## Documentation impact

This technical correction implements existing Founder-approved source-licensing authority and ADR-0024; it does not relax source rights or create a new product decision. Historical Live Proof #21 remains failed evidence and must not be rewritten. The active Foundation implementation plan should be updated with final released proof evidence after a fresh Foundation succeeds on the corrected main implementation.
