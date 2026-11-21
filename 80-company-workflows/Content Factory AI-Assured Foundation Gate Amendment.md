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

## One-off 9BS0 Market feasibility lane — limited internal exception

**Scope:** Pearson Edexcel A-level Business 9BS0, Market section 1.2, with at most one further comparable section for repeatability. This exception is effective only after the specific governed PR receives Founder approval and merges. It is not a general alternative to `ai_assured`.

Before an exact-course Foundation is `ai_assured`, engineering may **only** turn already-authored, Revision-original provisional section specimens into an isolated, schema-validated, test-only ContentPack and exercise the existing generic learner adapter in automated tests. Keep those trial fixtures **outside** `content/**/index.ts`, which Vite eagerly discovers. Do not add a public or family-facing route, record learner evidence, enable exam scoring, or make a candidate available in the catalogue. Mark graph construction, missing obligations, unreviewed marking and incomplete Exam Truth explicitly as gaps. This exception does not assert that an original specimen is educationally correct or rights-cleared for publication.

One capped **live AI section-production** experiment may subsequently run using the existing production workers only when **all** of the following are recorded: (1) exactly identified section and assessment cohort; (2) verified, sufficiently atomic *section-level* Course Truth and relevant Exam Truth, with independent factual/assessment challenge and unresolved gaps excluded from positive claims; (3) affirmative operation-specific rights for *every input supplied to AI*, with Pearson `REFERENCE_ONLY` prose, cases, images and mark schemes withheld from workers; (4) an isolated runner which cannot forge `ai_assured`, `foundation_approved`, asset-assurance PASS or publication status; and (5) a hard model-spend cap, retained source/input fingerprints, per-call costs, retries, review findings and manual effort. An unresolved permission or material truth gap prevents that paid run; it is not waived by this exception. A Research or candidate output must not be described as qualified accepted course content.

Outputs of this lane are **research/engineering candidates only**, irrespective of whether structural checks pass. The normal exact-course `ai_assured` requirement continues for ordinary internal factory derivation; the exact `foundation_approved`, asset assurance, full-course/assessment completeness and learner-release gates remain unchanged for student access. No worker or release guard may be weakened to treat this lane as a successful Foundation. A second section may reuse the same adapter/production runner only after the first section's missing obligations, errors and costs have been logged. The exception expires after the two named trial sections or a subsequent Founder decision; it does not licence full-course scaling or production publication.

## Historical evidence and rollout

Do not rewrite historical proof, review, challenge or `fail_hold` records. Existing historical AI PASS evidence must not automatically be relabelled `ai_assured`. A Candidate may acquire the new state only through runtime evidence that satisfies the exact-state contract or through a fresh proof under that contract.

Implementation truth remains governed by code and current technical documentation. Historical records that pre-date this amendment remain readable as history without retrospective promotion to `ai_assured`.

## Documentation impact

This targeted amendment changes only the sequencing/gate clauses described above. The parent authority and its detailed existing content remain intact. ADR-0024 records the decision and `docs/technical/Content Factory AI-Assured Foundation Gate.md` defines the runtime contract. Historical technical documents remain historically accurate rather than being rewritten.