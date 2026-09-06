# Content Factory Foundation Remediation Evidence

**Status:** Current implementation record — no-change remediation evidence hardening in progress  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Applies to:** Foundation independent review and targeted remediation

## Purpose

Preserve exact assurance evidence when a blocking or material independent-review finding reaches targeted remediation but the proposed correction normalises back to the same governed Foundation.

The Foundation remains fail-closed. An unchanged Foundation may not be treated as having resolved a blocking or material finding.

## Problem exposed on 6 September 2026

After PR #331 was released on `main` `8bdab69f2c68f59964450c009af03a7247d4775a`, the retained AQA A-level Business 7132 / 2027 Foundation from source proof run `34049089770` and fingerprint `4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d` passed deterministic re-assurance in run `34056770372`.

A genuinely fresh independent-review run `34056805756` then reached targeted remediation and failed on the invariant:

`Blocking/material Foundation remediation must produce a materially different Foundation fingerprint`

The invariant was correct. The implementation defect was that the exception occurred before the proof could retain the final review/remediation diagnostics in its normal evidence package. The exact reviewer finding therefore could not be recovered from the final proof artifact.

## Implementation boundary

When targeted remediation returns an apparent correction but the recomputed Foundation fingerprint is identical to the source fingerprint, Revision now:

1. keeps the original Foundation Candidate and its independent-review `fail_hold` state;
2. does not mark any blocking/material finding as resolved;
3. writes a `foundation_remediation_no_change_record` containing the exact source fingerprint, triggering review reference, attempted finding IDs, remediation worker provenance, resolution notes and attempted artifact replacement fingerprints;
4. records the remediation context in assurance provenance;
5. blocks the Foundation with a diagnostic that links both the triggering review and no-change remediation evidence; and
6. returns control to the proof layer so retained evidence and the Issue #289 operational summary can still be written before the proof remains failed/held.

A no-change record is diagnostic evidence only. It is not a successful remediation record, deterministic re-assurance result, approval or permission to progress.

## Assurance rule

The existing safety invariant remains unchanged:

> A blocking or material finding cannot be considered resolved by a Foundation that is materially identical to the version the reviewer rejected.

The hardening changes failure observability, not educational truth or approval policy.

## Regression coverage

`src/content-factory/foundation-independent-review-no-change.test.ts` proves that an exact semantic no-op remediation:

- leaves the Foundation fingerprint unchanged;
- leaves independent review at `fail_hold`;
- blocks the Foundation;
- retains the exact independent-review report;
- retains a dedicated no-change remediation record and worker context;
- links both evidence references in the operational blocker; and
- never creates a successful remediation record.

Full repository CI remains mandatory before merge.

## Documentation impact check

No normative authority or ADR change is required. The active Foundation production model already requires blocking/material independent-review findings to be corrected and re-assured before progression. This change makes the implementation fail closed with better retained evidence when a proposed correction produces no material change.

Historical failed proof outcomes are not rewritten.

## User/product impact

None. No learner-facing assets, product UI or approved course content are changed by this hardening.

## Next governed step

After this implementation is exact-head assured, Founder-approved, merged and production-verified:

1. rerun deterministic assurance against the retained exact AQA Foundation candidate;
2. run a genuinely fresh independent Foundation review;
3. if remediation again normalises to no material change, inspect the newly retained review and no-change remediation evidence to determine whether the finding is a genuine Foundation defect, a reviewer/governance-boundary collision, or another implementation issue;
4. do not progress to external-source challenge or qualified expert packaging until the exact Foundation passes independent review.
