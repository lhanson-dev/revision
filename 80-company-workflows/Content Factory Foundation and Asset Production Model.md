# Content Factory Foundation and Asset Production Model

**Status:** Active v1.1 — proposed Founder governance update for AI-assured pre-production
**Owner:** Founder / Product / Content Operations

## Purpose

Establish and approve a trusted course foundation before learner publication, while allowing controlled internal asset production once the Foundation has passed the complete machine/AI assurance boundary.

The governing sequence is:

`exact course request → Course Truth + Exam Truth → deterministic assurance → independent AI review/remediation → fresh external-source challenge → AI Foundation Assurance Gate → internal asset production/assurance → qualified foundation approval → Approved Course Foundation → publication eligibility`

The core principle remains **truth → assurance → approval → release**. AI assurance and qualified-human approval are deliberately different gates.

## Foundation Factory

The Foundation Factory establishes the exact educational and assessment dependency set for a course. It resolves course identity and cohort, source rights, Board Alignment, coverage, Course Truth, Exam Truth and Question Families, then applies deterministic assurance, fresh-context independent review, remediation and the required fresh external-source challenge.

### AI Foundation Assurance Gate

A Foundation Candidate becomes `ai_assured` only when, for the same exact Foundation fingerprint:

- identity and cohort are resolved;
- source rights are approved;
- coverage, Course Truth and Exam Truth are complete;
- deterministic assurance passes;
- fresh independent AI review has no unresolved blocking or material finding;
- the required fresh external-source challenge passes against the governed source universe; and
- known limitations and any minor findings are explicit.

`ai_assured` means the exact Candidate is sufficiently evidenced for controlled downstream **internal** derivation. It does not mean qualified-human reviewed, Foundation approved, publication approved or learner safe.

A blocking or material defect in the evidence, or unresolved uncertainty that makes downstream derivation unsafe, places AI assurance in `fail_hold`. Absence of qualified-human review is not itself a `fail_hold`; it is a pending lifecycle gate.

### Qualified Foundation Approval Gate

Qualified subject/assessment review remains mandatory for final Foundation approval unless a deliberately governed equivalent approval is later established through a separate Founder-approved authority change.

A Foundation becomes `foundation_approved` only when the exact AI-assured fingerprint has also received qualified subject/assessment approval, with reviewer evidence and limitations recorded. Only then does it become an **Approved Course Foundation**.

AI review must not be represented as qualified-human review or as final Foundation approval.

## Controlled pre-production from an AI-assured Candidate

An exact `ai_assured` Candidate may be used for:

- Learn, Practice and Exam Prep asset generation in an internal/pre-production state;
- deterministic and independent asset assurance;
- site construction and integration work; and
- internal testing using those assets.

It may not by itself authorize learner publication, production release, claims of human review, or claims that the Candidate is an Approved Course Foundation.

Every pre-production asset must bind to the exact Candidate fingerprint from which it was derived and remain release-ineligible until that exact fingerprint becomes `foundation_approved`.

If qualified-human review changes material Foundation truth, the Candidate receives a new fingerprint. Assets derived from the superseded fingerprint are stale and must not be promoted. Affected assets must be regenerated or deterministically re-derived and re-assured against the new fingerprint.

If qualified-human review approves the exact fingerprint unchanged, already-assured internal assets may proceed to the normal publication/release controls without being regenerated solely because the human gate completed.

## Asset Factories

Learn, Practice and Exam Prep remain separate asset factories. Foundation assurance does not make derived assets automatically trustworthy. Each asset factory applies its own Content Accuracy Assurance Gate, deterministic controls, independent review/remediation and publication controls.

Asset status must distinguish internal/pre-production derivation from publication eligibility. No asset may be published unless its exact Foundation dependency is `foundation_approved` and the asset itself has passed all applicable asset assurance and release gates.

## Lifecycle

The Foundation lifecycle is:

`requested → compiling → assuring → ai_assured → expert_review → foundation_approved`

Exception states remain:

- `blocked` — operational interruption or a fail-closed assurance condition, resumable only through the governed path;
- `superseded` — terminal record for a replaced Candidate/version.

The `ai_assured` state is the production-start gate for internal asset derivation. The `foundation_approved` state is the trust/release gate for learner publication.

## Approved Course Foundation record

An Approved Course Foundation records the exact course/cohort, Source Licence Register, Board Alignment, coverage, Course Truth, Exam Truth, Question Families, deterministic assurance, independent review, external-source challenge, qualified reviewer/approver evidence, limitations, approval status/date and durable Foundation fingerprint.

Approved records are immutable. Changed material Foundation truth requires a new Candidate/fingerprint and version.

## Migration and compatibility

Existing historical proof, challenge, review and `fail_hold` evidence remains historically true for the contract and fingerprint that produced it. Do not rewrite historical records to apply this new lifecycle retrospectively.

Implementation must introduce the `ai_assured` boundary without treating historical AI PASS evidence as human approval. Existing approval contracts remain fail closed for `foundation_approved`.

## Documentation impact

This document is the normative sequencing authority for Foundation versus asset production. Technical lifecycle contracts, schemas, orchestration, tests and Content Factory implementation documentation must be updated to implement the two-gate model. Historical ADRs and retained evidence must not be rewritten; a new ADR records this change.