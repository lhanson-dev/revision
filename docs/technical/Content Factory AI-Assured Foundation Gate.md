# Content Factory AI-Assured Foundation Gate

**Status:** Proposed implementation contract
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`
**Decision:** `decisions/ADR-0024-ai-assured-foundation-preproduction-gate.md`

## Purpose

Define the implementation delta for the two-gate Foundation model without conflating AI assurance with qualified-human approval.

## Required runtime contract

The canonical Foundation lifecycle becomes:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

The transition into `ai_assured` must require exact-fingerprint PASS evidence for deterministic assurance, fresh independent review and the required fresh external-source challenge, with no unresolved blocking/material finding.

The transition into `expert_review` must consume the same exact AI-assured fingerprint. The transition into `foundation_approved` continues to require a valid qualified-human submission for that exact fingerprint.

`fail_hold` from an assurance stage means the Candidate cannot enter `ai_assured`. `humanReviewStatus: pending` is not a failure condition and must not be translated to `fail_hold`.

## Asset derivation contract

Asset orchestration may accept an `ai_assured` Foundation Candidate for internal/pre-production generation. Every derived asset must persist the exact Foundation fingerprint.

Before any learner publication/release transition, orchestration must verify:

1. the asset's exact Foundation fingerprint resolves to `foundation_approved`;
2. the asset remains bound to that unchanged fingerprint; and
3. the asset's own assurance/release gates pass.

A material Foundation correction creates a new fingerprint and makes assets derived from the prior fingerprint stale/release-ineligible. Reuse is allowed only where deterministic dependency analysis proves the asset is unaffected and the governed asset contract explicitly supports that reuse; otherwise regenerate and re-assure.

## Implementation surfaces

The change is expected to affect at least:

- Foundation schema/state enum and persisted status;
- Foundation lifecycle transitions and guards;
- external-source-challenge completion handling;
- expert-review readiness/package checks;
- asset-factory entry guards;
- asset Foundation-fingerprint persistence;
- publication/release eligibility guards;
- unit/integration tests for allowed and prohibited transitions; and
- technical implementation-plan/current-state documentation.

## Required tests

Tests must prove that:

- deterministic/independent/external challenge PASS can create `ai_assured` but not `foundation_approved`;
- blocking/material assurance findings cannot create `ai_assured`;
- pending human review does not itself create `fail_hold`;
- internal asset generation accepts `ai_assured` and rejects a merely `assuring` Candidate;
- learner publication rejects `ai_assured` without human approval;
- human approval of the exact unchanged fingerprint makes correctly assured assets eligible for subsequent release controls;
- a material human-review correction/new fingerprint invalidates prior-fingerprint asset release eligibility; and
- historical records remain readable without retrospective state rewriting.

## Rollout rule

Do not migrate historical PASS evidence into `ai_assured` by assumption. A Candidate may use the new state only when the current runtime can prove the required exact-fingerprint evidence under the new contract.

The AQA 7132 Candidate may therefore be recorded as AI-assured only after the implementation is released and its existing retained evidence is explicitly validated as satisfying the new state contract, or after a fresh proof under the new runtime.

## Documentation impact

This contract requires corresponding updates to the active Foundation-Gated Implementation Plan and Expert Review Contract when runtime implementation lands. Those documents must not claim the new lifecycle is released until the code/tests are actually merged and proved.