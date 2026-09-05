# Foundation Approval Completeness Failure — AQA Business 7132

**Status:** Active remediation note  
**Date:** 5 September 2026  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`

## What failed

The retained AQA A-level Business 7132 Foundation passed deterministic assurance and fresh-context independent AI review, and was then packaged for qualified human review. The human review exposed material curriculum/exam omissions.

The failure was not learner-asset generation. No learner-facing material had been generated at this stage.

The failure was that the assurance chain proved the Foundation was internally consistent with its own governed requirement set, but did not independently prove that the requirement set itself represented the complete applicable curriculum and exam specification.

## Root cause

The Foundation-native AQA path used a Revision-owned semantic seed as the governed curriculum input. The compiler correctly prevented model workers from inventing content outside that seed and correctly proved exact reconciliation from the seed into canonical Course Truth nodes.

That control was necessary but insufficient.

A narrower semantic seed can be internally complete while still being externally incomplete against the awarding-body specification.

The deterministic assurance path checked:

- artifact integrity and fingerprints;
- source-rights consistency;
- Board Alignment consistency;
- whether every requirement already present in the coverage model was marked complete;
- whether Course Truth exactly matched the canonical nodes established by that coverage model; and
- whether Exam Truth and Question Families reconciled to Board Alignment.

It did not compare the coverage model against a separately established complete specification obligation universe.

The fresh-context independent review was also intentionally bounded to supplied Foundation artifacts and rights-safe source metadata. It was instructed not to browse or reconstruct awarding-body prose. Therefore, an obligation absent from the supplied Foundation could also be absent from the reviewer context.

The qualified-human review package then contained the exact Foundation artifacts, but not an independently verified specification-to-Foundation requirement reconciliation. The reviewer was asked to assess curriculum scope without being given a first-class checklist proving what the complete applicable scope was.

## Migration defect

A richer AQA source/coverage record already existed at `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` before the Foundation-native proof. It records material requirements that were missing or contradicted by the later semantic seed.

The Foundation migration failed to make that coverage knowledge an enforced input to the new Foundation completeness gate. Instead, the new path established a narrower seed and then proved exact downstream consistency against it.

This is the primary defect to correct.

## Required architecture

Foundation completeness must be judged against a first-class **Foundation Requirement Baseline** established independently from the semantic Course Truth seed.

For the exact course/cohort it must capture every applicable curriculum and assessment obligation needed to judge completeness, including explicit boundaries and exclusions where relevant.

Each obligation must be reconciled to one or more of:

- Course Truth nodes;
- Exam Truth / Board Alignment items; or
- an explicit governed boundary / not-applicable disposition.

Deterministic assurance must fail if an applicable obligation has no valid reconciliation.

The qualified-human review package must include the exact requirement baseline and reconciliation alongside Course Truth and Exam Truth so the reviewer can inspect the Foundation against the external course/exam requirement universe rather than only against Revision's own generated model.

## Source-rights boundary

This does not require protected awarding-body prose to be used as generative Course Truth input.

The requirement baseline is a control/assurance artifact. It should retain source provenance and use legally permitted structured requirement summaries/references under the existing source-rights authority. Course Truth generation remains bounded to permitted generative evidence.

## Completion condition

The AQA Business Foundation may not return to qualified-human approval until:

1. the cohort-correct requirement baseline has been established;
2. all baseline obligations reconcile to Course Truth, Exam Truth or an explicit governed boundary;
3. the current semantic seed has been corrected where the baseline exposes omissions or contradictions;
4. deterministic assurance passes against that external baseline;
5. fresh-context independent review is rerun against the corrected Foundation and baseline; and
6. the human approval package contains the baseline/reconciliation and the exact corrected Foundation artifacts.

Historical retained proof evidence remains unchanged and continues to show what the prior controls proved at the time.