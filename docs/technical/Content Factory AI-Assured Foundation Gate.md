# Content Factory AI-Assured Foundation Gate

**Status:** Active implementation contract  
**Implementation:** PR #344 (runtime); PR #345 (retained real-course `ai_assured` proof surface)  
**Authority:** `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`  
**Decision:** `decisions/ADR-0024-ai-assured-foundation-preproduction-gate.md`

## Purpose

Define the implemented two-gate Foundation runtime without conflating AI assurance with qualified-human approval.

This document supersedes only the lifecycle, asset-start and expert-progression clauses in `Content Factory Foundation-Gated Implementation Plan.md` that still describe direct `assuring → expert_review` progression or prohibit all downstream asset derivation before qualified-human approval. The historical proof chronology, remediation findings and prior run evidence in that plan remain historically accurate.

## Runtime contract

The Foundation lifecycle is:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

Entry to `ai_assured` requires exact-fingerprint PASS evidence for deterministic assurance, fresh independent review and the required fresh external-source challenge, with no unresolved candidate blocker. The runtime persists the external-source challenge on the current Candidate and validates candidate identity, implementation commit, fresh-context exclusions, the mandatory governed source-universe profile/source list and the exact Foundation fingerprint before the state can advance.

`ai_assured` is entered only through the dedicated lifecycle guard. Generic lifecycle advancement cannot bypass the AI-assurance checks or jump directly from `assuring` to `expert_review`.

Qualified-human review remains a distinct next stage. `foundation_approved` continues to require exact-fingerprint qualified approval evidence.

`fail_hold` remains an assurance decision for a blocking/material defect or unsafe unresolved uncertainty. It is not a Foundation lifecycle state. A Candidate with independent-review or external-source-challenge `fail_hold` remains in `assuring`, retains the failure evidence and cannot enter `ai_assured`. Qualified-human review merely being pending is represented by the legitimate `ai_assured` lifecycle condition rather than a false failure.

## Current implementation surfaces

The canonical runtime surfaces are:

- `src/content-factory/foundation-schema.ts` — includes `ai_assured`, optional persisted external-source challenge evidence for backward-compatible Candidate reading, and state invariants;
- `src/content-factory/foundation-lifecycle.ts` — records the exact external-source challenge, requires the governed source-universe contract, enforces `assuring → ai_assured → expert_review`, prevents direct bypass and preserves exact-fingerprint approval/version invariants;
- `src/content-factory/foundation-external-source-challenge.ts` — validates fresh-context, exact-candidate, exact-commit, exact-fingerprint and required-source challenge evidence while allowing a valid `fail_hold` report to be retained before progression;
- `src/content-factory/foundation-external-source-challenge-live.ts` — performs the AQA 7132 reference-only live source check, hashes fresh official-source bytes without placing protected AQA prose into a generative worker, and reconciles the exact Candidate against the independent governed curriculum/exam profiles;
- `.github/workflows/content-factory-foundation-ai-assured-proof.yml` — binds retained live-proof and independent-review artifacts, runs the fresh external-source challenge, records the challenge through the lifecycle guard, enters `ai_assured` only on PASS, and retains explicit human-review/publication status;
- `src/content-factory/foundation-expert-review.ts` — retains the qualified-human review package/submission boundary;
- `src/content-factory/foundation-derived-asset.ts` — defines the controlled pre-production asset record, exact Foundation fingerprint binding, asset-assurance state and fail-closed learner-release eligibility guard; and
- the associated unit/integration tests — prove allowed/prohibited transitions, historical readability, source-rights/fresh-source challenge behaviour and stale-fingerprint invalidation.

The legacy end-to-end `ContentFactoryJob` orchestrator remains non-canonical for Foundation state and must not be used to bypass these guards.

## Retained real-course AI-assurance proof

The operational proof workflow consumes only successful retained evidence from the exact real-course Foundation live proof and independent-review proof. It verifies workflow/artifact identity, digest and exact source/review commits before using the retained Candidate.

For AQA 7132, the fresh external-source challenge is deliberately **REFERENCE_ONLY**:

- every governed AQA source must remain classified `REFERENCE_ONLY` with generative source-text input disabled;
- the challenge retrieves each current official AQA reference only through approved AQA hosts, records response metadata and a SHA-256 digest, and does not retain or supply the protected source body to a generative worker;
- the exact Candidate is independently reconciled against the governed source-led curriculum and exam profiles;
- the challenge uses a fresh context identifier and explicitly excludes all retained generation, independent-review and remediation contexts; and
- any source-universe, source-rights, source-currency or governed reconciliation defect produces `fail_hold` and prevents `ai_assured`.

A passing proof artifact records `finalState: ai_assured`, while also retaining `humanReviewStatus: pending`, `foundationApprovalStatus: not_approved` and `learnerPublicationEligible: false`. This artifact is the operational evidence that controlled internal asset generation/site testing may begin; it is not qualified-human review evidence.

## Asset derivation and release

Internal/pre-production Learn, Practice and Exam Prep derivation may start from `ai_assured`. A derived asset records the exact Foundation fingerprint plus Candidate ID for provenance.

Internal derivation from `ai_assured` or `expert_review` re-checks that deterministic assurance, independent review and the external-source challenge all passed against that exact material fingerprint. This prevents an asset caller from treating a structurally labelled state as sufficient without the underlying evidence.

Already qualified-human `foundation_approved` historical Foundations remain valid downstream sources after this amendment. They are integrity-checked against their approved fingerprint and approval evidence; they are not required to invent an external-source challenge record that did not exist when they were legitimately approved.

Asset assurance is separate from Foundation assurance. A derived asset begins `pending` and can become asset-assured only with retained asset-assurance evidence.

Learner-release eligibility fails closed unless all of these are true:

1. the asset's own assurance status is `pass` with retained evidence;
2. the Foundation job is `foundation_approved` through qualified-human approval; and
3. the approved Foundation fingerprint exactly equals the asset's persisted Foundation fingerprint.

Candidate ID is retained as provenance but is not a release identity. This matters because a recompiled Candidate may have a different operational ID while representing exactly the same Foundation fingerprint. The governing rule is the approved material fingerprint: unchanged fingerprint preserves otherwise-valid asset assurance; changed fingerprint invalidates prior-fingerprint assets for learner release.

A material Foundation correction creates a new fingerprint and makes prior-fingerprint assets stale for learner release. They must be regenerated/re-derived and re-assured as applicable. If qualified-human review approves the exact AI-assured fingerprint unchanged, otherwise-valid asset assurance remains valid; the human gate does not itself force redundant asset re-assurance.

## Backward compatibility

Historical Candidates and Approved Course Foundations created before this gate did not persist external-source challenge evidence inside the Candidate schema. Those records remain readable: `externalSourceChallenge` is optional at the storage/schema boundary.

Backward readability does not imply retrospective qualification. New transitions into `ai_assured` and new qualified approval through the current lifecycle require the current complete AI-assurance chain. Historical PASS records are never silently relabelled `ai_assured`. Separately, an already qualified-human approved historical Foundation remains usable according to the approval it genuinely received.

## Required assurance proof

The implementation tests must prove, at minimum, that:

- deterministic + independent PASS without the fresh external-source challenge cannot create `ai_assured`;
- independent-review and external-challenge `fail_hold` remain in `assuring`, are durably retained and block AI assurance;
- challenge recording fails closed without the governed source-universe profile and non-empty required source list;
- a fresh challenge with a stale fingerprint is rejected;
- direct `assuring → expert_review` progression is rejected;
- pending qualified-human review is a valid `ai_assured` condition rather than `fail_hold`;
- internal Learn, Practice and Exam Prep records can be derived from `ai_assured` and persist the exact fingerprint;
- learner release is rejected before qualified-human approval even when asset assurance passes;
- exact unchanged qualified-human approval preserves otherwise-valid asset assurance even if a recompiled Candidate has a different Candidate ID;
- material Foundation change/new fingerprint makes prior-fingerprint assets release-ineligible;
- Foundation approval alone cannot bypass asset assurance;
- already qualified-human approved historical Foundations remain valid downstream dependencies;
- REFERENCE_ONLY AQA sources remain excluded from generative source-text input during the fresh external challenge;
- the retained operational proof binds exact live/review artifacts, performs current official-source retrieval, excludes all prior contexts and can enter `ai_assured` only through the lifecycle guard; and
- historical records remain parseable without retrospective rewriting.

Repository CI remains the implementation assurance gate for code changes. A fresh real-course AQA A-level Business 7132 — 2027 proof must run on released `main`; previous historical PASS evidence must not be promoted into `ai_assured` by assumption.

## Documentation impact

The Founder-approved normative amendment and ADR remain unchanged. This document is the current implementation contract for the two-gate runtime and its retained live-proof surface and takes precedence over conflicting pre-amendment lifecycle/asset-start statements in older technical implementation plans. Historical proof records remain untouched.
