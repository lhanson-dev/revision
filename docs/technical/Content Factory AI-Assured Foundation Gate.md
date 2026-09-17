# Content Factory AI-Assured Foundation Gate

**Status:** Proposed implementation contract
**Authority:** `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`
**Decision:** `decisions/ADR-0024-ai-assured-foundation-preproduction-gate.md`

## Purpose

Define the implementation delta for the two-gate Foundation model without conflating AI assurance with qualified-human approval.

## Required runtime contract

Target lifecycle:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

Entry to `ai_assured` requires exact-fingerprint PASS evidence for deterministic assurance, fresh independent review and the required fresh external-source challenge, with no unresolved blocking/material finding. Expert review consumes that same exact fingerprint. `foundation_approved` continues to require a valid qualified-human submission for it.

`fail_hold` means assurance has identified a blocking/material defect or unsafe unresolved uncertainty. `humanReviewStatus: pending` is not a failure condition.

## Asset derivation and release

Internal/pre-production asset orchestration may accept `ai_assured`. Every derived asset persists the exact Foundation fingerprint and remains release-ineligible until that fingerprint resolves to `foundation_approved` and the asset's own assurance/release gates pass.

A material Foundation correction creates a new fingerprint and invalidates affected prior-fingerprint assets for release. They must be regenerated/re-derived and re-assured. Exact unchanged human approval does not require otherwise-valid asset assurance to be repeated solely because the human gate completed.

## Required implementation surfaces

Foundation schema/state and persistence; lifecycle transitions/guards; external-source challenge completion; expert-review readiness; internal asset-factory entry guards; asset Foundation-fingerprint persistence; learner-publication/release guards; backward-compatible historical record reading; and unit/integration proof of all allowed/prohibited transitions.

## Required tests

Prove that AI-chain PASS can create `ai_assured` but not `foundation_approved`; blocking/material findings cannot create `ai_assured`; pending human review does not create `fail_hold`; internal asset generation accepts `ai_assured` while learner publication rejects it without human approval; exact unchanged human approval preserves valid asset assurance; new Foundation fingerprints invalidate affected prior-fingerprint release eligibility; and historical records remain readable without retrospective rewriting.

## Rollout

Do not migrate historical PASS evidence into `ai_assured` by assumption. The current runtime must prove the required exact-fingerprint evidence under the new contract or run a fresh proof.

## Current implementation truth

The released runtime on `main` still uses the pre-amendment lifecycle and gates. This is a target implementation contract only. Existing implementation plans and expert-review records remain unchanged until the runtime implementation slice lands.