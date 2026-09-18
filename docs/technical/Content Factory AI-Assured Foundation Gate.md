# Content Factory AI-Assured Foundation Gate

**Status:** Active implementation contract  
**Implementation:** PR #344  
**Authority:** `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`  
**Decision:** `decisions/ADR-0024-ai-assured-foundation-preproduction-gate.md`

## Purpose

Define the implemented two-gate Foundation runtime without conflating AI assurance with qualified-human approval.

This document supersedes only the lifecycle, asset-start and expert-progression clauses in `Content Factory Foundation-Gated Implementation Plan.md` that still describe direct `assuring → expert_review` progression or prohibit all downstream asset derivation before qualified-human approval. The historical proof chronology, remediation findings and prior run evidence in that plan remain historically accurate.

## Runtime contract

The Foundation lifecycle is:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

Entry to `ai_assured` requires exact-fingerprint PASS evidence for deterministic assurance, fresh independent review and the required fresh external-source challenge, with no unresolved candidate blocker. The runtime persists the external-source challenge on the current Candidate and validates candidate identity, implementation commit, fresh-context exclusions, required source-universe coverage and the exact Foundation fingerprint before the state can advance.

`ai_assured` is entered only through the dedicated lifecycle guard. Generic lifecycle advancement cannot bypass the AI-assurance checks or jump directly from `assuring` to `expert_review`.

Qualified-human review remains a distinct next stage. `foundation_approved` continues to require exact-fingerprint qualified approval evidence.

`fail_hold` remains an assurance decision for a blocking/material defect or unsafe unresolved uncertainty. It is not a Foundation lifecycle state. A Candidate with `fail_hold` remains in `assuring` and cannot enter `ai_assured`. Qualified-human review merely being pending is represented by the legitimate `ai_assured` lifecycle condition rather than a false failure.

## Current implementation surfaces

The canonical runtime surfaces are:

- `src/content-factory/foundation-schema.ts` — includes `ai_assured`, optional persisted external-source challenge evidence for backward-compatible Candidate reading, and state invariants;
- `src/content-factory/foundation-lifecycle.ts` — records the exact external-source challenge, enforces `assuring → ai_assured → expert_review`, prevents direct bypass and preserves exact-fingerprint approval/version invariants;
- `src/content-factory/foundation-external-source-challenge.ts` — validates fresh-context, exact-candidate, exact-commit, exact-fingerprint and required-source challenge evidence;
- `src/content-factory/foundation-expert-review.ts` — retains the qualified-human review package/submission boundary;
- `src/content-factory/foundation-derived-asset.ts` — defines the controlled pre-production asset record, exact Foundation fingerprint binding, asset-assurance state and fail-closed learner-release eligibility guard; and
- the associated unit tests — prove allowed/prohibited transitions, historical readability and stale-fingerprint invalidation.

The legacy end-to-end `ContentFactoryJob` orchestrator remains non-canonical for Foundation state and must not be used to bypass these guards.

## Asset derivation and release

Internal/pre-production Learn, Practice and Exam Prep derivation may start from `ai_assured`. A derived asset records both the exact Foundation fingerprint and Candidate identity from which it was produced.

Internal derivation itself re-checks that deterministic assurance, independent review and the external-source challenge all passed against that exact material fingerprint. This prevents an asset caller from treating a structurally labelled `ai_assured` record as sufficient without the underlying evidence.

Asset assurance is separate from Foundation assurance. A derived asset begins `pending` and can become asset-assured only with retained asset-assurance evidence.

Learner-release eligibility fails closed unless all of these are true:

1. the asset's own assurance status is `pass` with retained evidence;
2. the Foundation job is `foundation_approved` through qualified-human approval;
3. the approved Foundation fingerprint exactly equals the asset's persisted Foundation fingerprint; and
4. the approved Candidate identity exactly equals the asset's persisted Candidate identity.

A material Foundation correction creates a new fingerprint and makes prior-fingerprint assets stale for learner release. They must be regenerated/re-derived and re-assured as applicable. If qualified-human review approves the exact AI-assured fingerprint unchanged, otherwise-valid asset assurance remains valid; the human gate does not itself force redundant asset re-assurance.

## Backward compatibility

Historical Candidates and Approved Course Foundations created before this gate did not persist external-source challenge evidence inside the Candidate schema. Those records remain readable: `externalSourceChallenge` is optional at the storage/schema boundary.

Backward readability does not imply retrospective qualification. New transitions into `ai_assured`, new internal derivation under this gate and new qualified approval through the current lifecycle require the current complete AI-assurance chain. Historical PASS records are never silently relabelled `ai_assured`.

## Required assurance proof

The implementation tests must prove, at minimum, that:

- deterministic + independent PASS without the fresh external-source challenge cannot create `ai_assured`;
- independent-review `fail_hold` remains in `assuring` and blocks AI assurance;
- a fresh challenge with a stale fingerprint is rejected;
- direct `assuring → expert_review` progression is rejected;
- pending qualified-human review is a valid `ai_assured` condition rather than `fail_hold`;
- internal Learn, Practice and Exam Prep records can be derived from `ai_assured` and persist the exact fingerprint;
- learner release is rejected before qualified-human approval even when asset assurance passes;
- exact unchanged qualified-human approval preserves otherwise-valid asset assurance;
- material Foundation change/new fingerprint makes prior-fingerprint assets release-ineligible;
- Foundation approval alone cannot bypass asset assurance; and
- historical records remain parseable without retrospective rewriting.

Repository CI remains the implementation assurance gate for this code change. A fresh real-course AQA A-level Business 7132 — 2027 proof must run on released `main` after this implementation is merged; previous historical PASS evidence must not be promoted into `ai_assured` by assumption.

## Documentation impact

The Founder-approved normative amendment and ADR are active. This document is the current implementation contract for the two-gate runtime and takes precedence over conflicting pre-amendment lifecycle/asset-start statements in older technical implementation plans. Historical proof records remain untouched.