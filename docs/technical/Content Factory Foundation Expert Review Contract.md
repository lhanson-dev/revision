# Content Factory Foundation Expert Review Contract

**Status:** Slice 3C implementation record — qualified-human contract released through PR #312; retained AQA expert-review packaging released through PR #313; proof parser repaired through PR #316; retained package proof passed; qualified human review pending; curriculum/exam reconciliation hardening proposed in PR #318  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the Slice 3C boundary after the exact retained AQA A-level Business 7132 Foundation completed deterministic assurance and fresh-context independent review successfully.

Slice 3C must produce a portable exact-version package for a genuinely qualified human subject/assessment review, validate the returned human evidence, and only then permit immutable Foundation approval. AI review must not stand in for this human gate.

## Current assurance correction — 5 September 2026

Qualified-human review of the retained AQA Foundation exposed that the retained package was exact and internally consistent but did not itself prove that the underlying Foundation represented the complete applicable curriculum and exam requirement universe.

The package resolved the exact Foundation artifacts supplied by the Candidate, but it did not include a separately verified source-led reconciliation showing:

- the complete applicable curriculum hierarchy and every lowest-level requirement mapped to Course Truth; and
- the complete applicable exam/marking requirement set mapped to Exam Truth.

This allowed a narrower semantic seed to flow through deterministic assurance, independent review and packaging without an upstream source-to-Foundation completeness proof.

PR #318 therefore proposes a new prerequisite for future expert-review packaging: a Foundation may be packaged as approval-ready only when exact Curriculum Coverage Map and Exam Coverage Map evidence has already reconciled to zero applicable unmapped requirements.

This correction does not generate Learn, Practice or Exam Prep material and does not alter the historical retained package. The existing retained AQA package remains evidence of what was reviewed; after remediation a fresh Foundation fingerprint and a new expert-review package will be required.

## Slice 3B completion evidence

The governed **Content Factory Foundation Independent Review Proof** workflow run `33956520875` completed successfully on released `main` commit `2f2ae89f8280e3b0c1091346258e56f993f61f77`.

The retained proof is bound to source workflow run `33938173128` and Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

Evidence:

- deterministic assurance: `pass`;
- independent review: `pass`;
- independent-review findings: `0`;
- targeted remediation cycles: `0`;
- unresolved blockers: `0`;
- conservative independent-review spend: `$0.0731 / $12.00`;
- learner-facing assets: `0`;
- retained independent-review proof artifact id: `9966542905`;
- retained independent-review proof digest: `sha256:df5b8fd23f7ed2b4fd03c64af7a8f59cf84abc1621b7a86b9f3f42a210c9c111`.

This completed Slice 3B under the then-current assurance implementation. It did **not** make the Foundation approved, and the later qualified-human findings show that the source-to-Foundation completeness boundary must be strengthened before a replacement candidate is reviewed.

## Released qualified-human contract

Released through PR #312, `src/content-factory/foundation-expert-review.ts` defines the durable package and submission contracts.

### Foundation expert-review package

A package may be created only when the exact Foundation Candidate has:

- deterministic assurance `pass`;
- independent review `pass`;
- no unresolved candidate blockers;
- deterministic assurance bound to the recomputed Foundation fingerprint; and
- independent review bound to the same exact fingerprint.

Under the proposed PR #318 hardening, those conditions are necessary but no longer sufficient for a new approval-ready package. Future packaging must additionally prove that the exact Candidate is reconciled to the complete applicable Curriculum Coverage Map and Exam Coverage Map.

The package records exact job/candidate identity, reviewed implementation commit, Foundation fingerprint, complete Foundation Candidate, artifact index/fingerprints, assurance evidence references, known limitations, required human-review scopes and creation time.

Required qualified-human coverage is:

1. `subject`;
2. `assessment`.

One suitably qualified person may cover both scopes, or multiple reviewers may collectively cover them. Each reviewer must provide explicit qualification-evidence references. The system does not invent or self-assert professional qualification.

### Qualified expert-review submission

A human submission records:

- exact package job/candidate/commit/fingerprint identity;
- reviewer identity or identities;
- qualification scopes and qualification evidence;
- `pass` or `fail_hold` decision;
- structured blocking/material/minor findings;
- review evidence references;
- known limitations; and
- review timestamp.

Validation fails closed if the submission targets a different candidate, commit, Foundation fingerprint or artifact set, lacks subject/assessment qualification coverage, or claims `pass` while retaining a blocking/material finding.

## Retained AQA package implementation

`src/content-factory/foundation-expert-review-packaging.ts` packages the exact retained AQA Foundation into a form a human can inspect rather than presenting only artifact references.

The bundle boundary requires every packaged artifact reference, type and fingerprint to have an exact resolved value. Missing, mismatched or extra artifact values fail closed.

The retained package proof combines two retained evidence sources:

1. Foundation Live Proof run `33938173128`, which contains the 10 persisted Foundation artifacts and their values;
2. independent-review proof run `33956520875`, which contains the exact final Candidate plus deterministic and independent-review PASS evidence.

This is valid historical evidence for the retained AQA candidate because Run `33956520875` completed with zero remediation cycles and the final Foundation fingerprint remained `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`. It is not sufficient evidence for future curriculum/exam completeness without the new source-led maps.

The governed packaging workflow is `.github/workflows/content-factory-foundation-expert-review-package.yml`. It:

- runs only from approved `main` or the exact Founder/owner Issue #289 command `revision-run-foundation-expert-review-package:v1`;
- verifies the exact retained source and independent-review artifact digests before use;
- verifies source head, reviewed commit and Foundation fingerprint;
- recomputes the final Candidate fingerprint;
- confirms deterministic and independent review remain PASS with zero blockers and zero learner assets;
- resolves all exact reviewable Foundation artifacts;
- writes a single `expert-review-bundle.json` plus split artifact files;
- writes `review-instructions.md` for the qualified reviewer;
- writes `submission-template.json` with placeholders rather than fabricated reviewer data or a pre-selected decision;
- writes a manifest explicitly recording `humanReviewStatus: pending` and `foundationApprovalStatus: not_approved`; and
- uses no AI/provider call and therefore adds no model spend.

The package workflow itself does not approve, calibrate or remediate educational content. It is a deterministic handoff step only.

## Successful retained-package proof — 5 September 2026

After PR #316 was released as `main` commit `721cf14431d06857a3e483f9fadc1e103056c348`, governed **Content Factory Foundation Expert Review Package** run `33979898534` completed successfully.

The retained package proof established:

- packaging commit: `721cf14431d06857a3e483f9fadc1e103056c348`;
- Foundation fingerprint: `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`;
- reviewed assurance implementation commit: `2f2ae89f8280e3b0c1091346258e56f993f61f77`;
- source proof run: `33938173128`;
- source proof digest: `sha256:ba590273474bae9325bcc7b1a3add4e73bd5498c60d75cf1c603ed71ce56a16e`;
- independent-review proof run: `33956520875`;
- independent-review proof digest: `sha256:df5b8fd23f7ed2b4fd03c64af7a8f59cf84abc1621b7a86b9f3f42a210c9c111`;
- complete reviewable artifact count: `10`;
- required human qualification scopes: `subject` and `assessment`;
- learner-facing asset count: `0`;
- `humanReviewStatus: pending`;
- `foundationApprovalStatus: not_approved`;
- retained package artifact id: `9973432730`;
- retained package artifact digest: `sha256:e21897cb37b6885c9ca41add02696b2ca16359a438b813a6d1ed4ba9e4c21fcc`.

The artifact contains the exact review bundle, resolved Foundation artifacts, review instructions, a structured submission template and manifest. Reviewer identity and qualification evidence remain placeholders. The subsequent human review demonstrates why exact packaging must be supplemented by explicit source-led curriculum/exam reconciliation before the replacement package can be described as approval-ready.

## Neutral human-decision handoff

The handoff template uses a neutral `<pass-or-fail_hold>` placeholder and explicitly requires the qualified reviewer to choose the decision after completing the review. The final submitted evidence must still validate against the durable `pass | fail_hold` schema.

## Deliberately excluded

This Slice 3C state does **not**:

- perform or simulate qualified human review;
- invent reviewer credentials or qualification evidence;
- import a completed human submission;
- transition a persisted Foundation job to `foundation_approved`;
- create Approved Course Foundation v1;
- provide an Admin reviewer-assignment UI; or
- generate Learn, Practice or Exam Prep assets.

## Next governed step

The retained human feedback has reopened the Foundation before approval. The next governed sequence is now:

1. establish the exact cohort-correct Curriculum Coverage Map;
2. establish the exact cohort-correct Exam Coverage Map;
3. reconcile both against the Foundation and remediate every blocking/material gap;
4. compile a fresh Foundation Candidate and fingerprint;
5. rerun deterministic assurance and fresh-context independent review using those maps;
6. package the maps plus exact Foundation artifacts for qualified-human review; and
7. only after a passing human submission, create immutable Approved Course Foundation v1 through the existing lifecycle/version-lineage gate.

## Documentation impact

The proposed PR #318 changes the Foundation assurance boundary and therefore updates the normative coverage amendment, ADR-0023 and current technical documentation. Historical proof evidence remains unchanged as evidence of the earlier implementation state.
