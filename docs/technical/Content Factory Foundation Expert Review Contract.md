# Content Factory Foundation Expert Review Contract

**Status:** Slice 3C implementation record — qualified-human contract released through PR #312; retained AQA expert-review packaging released through PR #313; proof parser repaired through PR #316; retained package proof passed; qualified human review returned blocking/material curriculum/exam coverage findings; reconciliation hardening proposed in PR #318  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the Slice 3C qualified-human Foundation review boundary and record the assurance correction exposed by the first retained AQA A-level Business 7132 human review.

AI review must not stand in for the human gate. A human package must also give the reviewer enough source-led evidence to judge whether Course Truth and Exam Truth cover the complete applicable curriculum and exam requirements.

## Assurance correction — 5 September 2026

Qualified-human review of the retained AQA Foundation exposed that the retained package was exact and internally consistent but did not itself prove that the underlying Foundation represented the complete applicable curriculum and exam requirement universe.

The package resolved the exact Foundation artifacts supplied by the Candidate, but it did not include a separately verified source-led reconciliation showing:

- the complete applicable curriculum hierarchy and every lowest-level requirement mapped to Course Truth; and
- the complete applicable exam/marking requirement set mapped to Exam Truth.

This allowed a narrower semantic seed to flow through deterministic assurance, independent review and packaging without an upstream source-to-Foundation completeness proof.

PR #318 therefore proposes a new prerequisite for future expert-review packaging: a Foundation may be packaged as approval-ready only when exact Curriculum Coverage Map and Exam Coverage Map evidence has already reconciled to zero applicable unmapped requirements.

This correction does not generate Learn, Practice or Exam Prep material and does not alter the historical retained package. After remediation a fresh Foundation fingerprint and a new expert-review package will be required.

## Previous Slice 3B evidence

The governed **Content Factory Foundation Independent Review Proof** workflow run `33956520875` completed successfully on released `main` commit `2f2ae89f8280e3b0c1091346258e56f993f61f77`.

The retained proof is bound to source workflow run `33938173128` and Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

At that time the evidence recorded deterministic assurance `pass`, independent review `pass`, zero independent-review findings, zero remediation cycles, zero unresolved blockers and zero learner-facing assets.

Those results remain historically true for the then-current implementation. The later qualified-human findings demonstrate that the source-to-Foundation completeness boundary was insufficient; they do not require rewriting the historical proof.

## Released qualified-human contract

Released through PR #312, `src/content-factory/foundation-expert-review.ts` defines the durable package and submission contracts.

A package currently requires the exact Foundation Candidate to have passing deterministic assurance, passing independent review, no unresolved blockers and matching exact Foundation fingerprints.

Under PR #318 hardening, those conditions remain necessary but are no longer sufficient for a new approval-ready package. Future packaging must additionally prove that the exact Candidate is reconciled to the complete applicable Curriculum Coverage Map and Exam Coverage Map.

Required qualified-human coverage remains `subject` and `assessment`. One suitably qualified person may cover both scopes, or multiple reviewers may collectively cover them. Reviewer qualification evidence remains mandatory.

A submitted human review records exact package identity, reviewer identity/qualification evidence, `pass` or `fail_hold`, structured findings, evidence references, limitations and review timestamp. Blocking/material findings require `fail_hold`.

## Retained AQA package

`src/content-factory/foundation-expert-review-packaging.ts` packages the exact retained AQA Foundation into a portable review bundle and verifies artifact identities/fingerprints.

The retained package combined the live Foundation proof and independent-review proof and successfully produced the exact generated Foundation artifact set for the human reviewer.

That packaging integrity remains useful. The defect was not that the artifacts were stale or missing from the bundle; the defect was that the bundle lacked a separate complete source-led curriculum/exam reconciliation against which the generated Foundation could be judged.

The governed packaging workflow remains `.github/workflows/content-factory-foundation-expert-review-package.yml`. Future hardening must add the two coverage maps to the approval-ready evidence boundary and fail closed before packaging if either map has an applicable unmapped requirement.

## Previous retained-package proof

The successful retained package was produced by workflow run `33979898534` on packaging commit `721cf14431d06857a3e483f9fadc1e103056c348`, for Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

It confirmed exact packaging, required subject/assessment scopes, zero learner-facing assets and `foundationApprovalStatus: not_approved`.

That package is now historical review evidence. It must not be reused as the approval package for the corrected Foundation because remediation will create a new Foundation fingerprint.

## Neutral human-decision handoff

The handoff template uses a neutral `<pass-or-fail_hold>` placeholder and requires the qualified reviewer to select the decision after review. That control remains valid.

## Deliberately excluded

This work does not:

- perform or simulate qualified human review;
- invent reviewer credentials;
- approve the retained failing Foundation;
- create Approved Course Foundation v1;
- generate Learn, Practice or Exam Prep assets; or
- rewrite historical proof evidence.

## Next governed step

The human findings have reopened the Foundation before approval. The next sequence is:

1. establish the exact cohort-correct Curriculum Coverage Map;
2. establish the exact cohort-correct Exam Coverage Map;
3. reconcile both against the Foundation and remediate every blocking/material gap;
4. compile a fresh Foundation Candidate and fingerprint;
5. rerun deterministic assurance and fresh-context independent review using those maps;
6. package the maps plus exact Foundation artifacts for qualified-human review; and
7. only after a passing human submission, create immutable Approved Course Foundation v1.

## Documentation impact

PR #318 changes the Foundation assurance boundary and therefore updates the normative coverage amendment, ADR-0023 and current technical documentation. Historical proof evidence remains unchanged.
