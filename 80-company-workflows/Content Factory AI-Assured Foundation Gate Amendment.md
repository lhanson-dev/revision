# Content Factory AI-Assured Foundation Gate Amendment

**Status:** Active — Founder-approved via PR #343  
**Decision date:** 18 September 2026  
**Amends:** `Content Factory Foundation and Asset Production Model.md`  
**Decision record:** `decisions/ADR-0024-ai-assured-foundation-preproduction-gate.md`

## Purpose

Amend the active Foundation/Asset Production Model so qualified-human review remains the final Foundation approval gate without remaining a serial prerequisite to controlled internal asset production after the complete governed AI assurance chain has passed.

Where this amendment conflicts with the existing Foundation/Asset Production Model, this amendment governs the specific sequencing and gate semantics below. All unaffected requirements of the parent authority remain in force.

## Governing sequence

`exact course request → Course Truth + Exam Truth → deterministic assurance → independent AI review/remediation → fresh external-source challenge → AI Foundation Assurance Gate → controlled internal asset production/assurance → qualified foundation approval → Approved Course Foundation → learner-publication eligibility`

## AI Foundation Assurance Gate

A Foundation Candidate may enter `ai_assured` only when the same exact Foundation fingerprint has resolved identity/cohort and approved source rights; complete governed coverage, Course Truth and Exam Truth; passing deterministic assurance; passing fresh-context independent AI review with no unresolved blocking/material finding; passing fresh external-source challenge against the governed source universe; and explicit known limitations/minor findings.

`ai_assured` permits controlled internal downstream derivation. It does not mean qualified-human reviewed, Foundation approved, publication approved or learner-release eligible.

A blocking/material evidence defect, or unresolved uncertainty that makes downstream derivation unsafe, results in `fail_hold`. Qualified-human review merely being pending is a lifecycle condition and must not itself be represented as `fail_hold`.

## Qualified Foundation Approval Gate

Qualified subject/assessment review remains mandatory for `foundation_approved` unless a future deliberately governed equivalent is approved through a separate Founder authority change. Only qualified approval of the exact reviewed fingerprint creates an Approved Course Foundation. AI assurance must never be represented as qualified-human approval.

## Controlled internal asset production

An exact `ai_assured` Candidate may support internal/pre-production Learn, Practice and Exam Prep generation, asset assurance, site integration and internal testing. It may not authorize learner publication, production release, a claim of human review, or a claim that the Candidate is an Approved Course Foundation.

Every pre-production asset must persist the exact Foundation fingerprint from which it was derived and remain release-ineligible until that exact fingerprint becomes `foundation_approved` and the asset itself passes its applicable assurance/release controls.

If qualified-human review changes material Foundation truth, the corrected Candidate receives a new fingerprint. Assets derived from the superseded fingerprint are stale for release and affected assets must be regenerated or deterministically re-derived and re-assured against the new fingerprint. If qualified-human review approves the exact AI-assured fingerprint unchanged, otherwise-valid asset assurance does not need to be repeated solely because the human gate completed.

## Lifecycle amendment

The Foundation lifecycle is:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

`blocked` and `superseded` retain their existing meanings except that pending human review is not a blocking defect. `ai_assured` is the controlled internal production-start gate; `foundation_approved` remains the qualified-human trust gate required for learner-publication eligibility.

## Historical evidence and rollout

Do not rewrite historical proof, review, challenge or `fail_hold` records. Existing historical AI PASS evidence must not automatically be relabelled `ai_assured`. A Candidate may acquire the new state only through runtime evidence that satisfies the exact-state contract or through a fresh proof under that contract.

Implementation truth remains governed by code and current technical documentation. Historical records that pre-date this amendment remain readable as history without retrospective promotion to `ai_assured`.

## Documentation impact

This targeted amendment changes only the sequencing/gate clauses described above. The parent authority and its detailed existing content remain intact. ADR-0024 records the decision and `docs/technical/Content Factory AI-Assured Foundation Gate.md` defines the runtime contract. Historical technical documents remain historically accurate rather than being rewritten.