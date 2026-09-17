# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — AI-assured two-gate lifecycle proposed in ADR-0024; runtime implementation pending
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`
**Architecture decisions:** ADR-0020 through ADR-0024, with ADR-0024 defining the proposed AI-assured pre-production gate.

## Purpose

Implement the Content Factory as a staged production system where an exact course first becomes machine/AI assured, may then support controlled internal asset derivation, and must still reach qualified-human Approved Course Foundation status before learner publication.

The target sequence is:

`course request → Course Truth + Exam Truth → deterministic assurance → independent review/remediation → fresh external-source challenge → ai_assured → internal asset generation/assurance → qualified expert approval → foundation_approved → publication eligibility`

## Current implementation truth

The released Foundation runtime on `main` predates ADR-0024. Its canonical lifecycle is still:

`requested → compiling → assuring → expert_review → foundation_approved`

and the released implementation still prevents learner-asset generation before `foundation_approved`.

The governance change therefore must not be described as implemented until the runtime, tests and release evidence prove it.

## Target lifecycle delta

Add `ai_assured` between `assuring` and `expert_review`.

Entry requires exact-fingerprint PASS evidence for deterministic assurance, fresh-context independent review and the required fresh external-source challenge, with no unresolved blocking/material finding.

`ai_assured` permits only internal/pre-production asset derivation and assurance. Qualified-human review remains the only route from the AI-assured exact fingerprint to `foundation_approved` under current authority.

Pending human review is not `fail_hold`. `fail_hold` represents a blocking/material assurance defect or unresolved uncertainty that makes progression unsafe.

## Asset dependency rule

Every asset generated from `ai_assured` must bind to the exact Foundation fingerprint and remain release-ineligible while that fingerprint is not `foundation_approved`.

If expert review changes material Foundation truth, the resulting new fingerprint invalidates prior-fingerprint release eligibility and affected assets must be regenerated/re-derived and re-assured. If the exact fingerprint is approved unchanged, valid prior internal asset assurance does not need repetition solely because the human gate completed.

## Implementation slices

1. **Lifecycle/schema:** introduce `ai_assured`, exact-evidence transition guard and backward-compatible persistence/read behaviour.
2. **Expert review:** require expert-review packaging/submission to consume an exact `ai_assured` fingerprint without treating AI assurance as human approval.
3. **Asset entry:** allow internal asset factories to start from `ai_assured`, persist Foundation fingerprint and mark outputs pre-production/release-ineligible.
4. **Release guard:** fail closed unless the exact asset dependency is `foundation_approved` and asset-specific assurance/release gates pass.
5. **Proof:** exercise a real course through the new boundary and retain evidence that zero learner publication can occur from AI assurance alone.

## AQA 7132 status

The retained AQA 7132 / 2027 Foundation evidence includes deterministic assurance, fresh independent review and fresh external-source challenge PASS evidence for an exact fingerprint, with qualified-human review still outstanding. Historical evidence remains historically true.

Do not automatically relabel that historical Candidate `ai_assured`. Once the new runtime is released, explicitly validate the retained evidence against the new exact-state contract or run a fresh proof before recording the new state.

## Documentation impact

ADR-0024 and the active Foundation/Asset Production Model define the proposed normative change. This implementation plan records that code is still pending. The Expert Review Contract and detailed implementation records must be updated as each runtime slice lands. Historical proof records are not rewritten.