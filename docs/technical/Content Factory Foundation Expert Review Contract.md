# Content Factory Foundation Expert Review Contract

**Status:** Slice 3C implementation record — qualified-human contract released through PR #312; retained AQA expert-review package increment in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the Slice 3C boundary after the exact retained AQA A-level Business 7132 Foundation completed deterministic assurance and fresh-context independent review successfully.

Slice 3C must produce a portable exact-version package for a genuinely qualified human subject/assessment review, validate the returned human evidence, and only then permit immutable Foundation approval. AI review must not stand in for this human gate.

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

This completed Slice 3B. It does **not** make the Foundation approved.

## Released qualified-human contract

Released through PR #312, `src/content-factory/foundation-expert-review.ts` defines the durable package and submission contracts.

### Foundation expert-review package

A package may be created only when the exact Foundation Candidate has:

- deterministic assurance `pass`;
- independent review `pass`;
- no unresolved candidate blockers;
- deterministic assurance bound to the recomputed Foundation fingerprint; and
- independent review bound to the same exact fingerprint.

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

## Current retained-package increment

The next implementation step packages the exact retained AQA Foundation into a form a human can actually inspect rather than presenting only artifact references.

`src/content-factory/foundation-expert-review-packaging.ts` adds a bundle boundary that requires every packaged artifact reference, type and fingerprint to have an exact resolved value. Missing, mismatched or extra artifact values fail closed.

The retained package proof combines two already-retained evidence sources:

1. Foundation Live Proof run `33938173128`, which contains the 10 persisted Foundation artifacts and their values;
2. independent-review proof run `33956520875`, which contains the exact final Candidate plus deterministic and independent-review PASS evidence.

This is valid for the retained AQA candidate because Run `33956520875` completed with zero remediation cycles and the final Foundation fingerprint remained `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`. The implementation also overlays any retained review/remediation artifact writes before resolving package content so stale source values cannot silently win.

The governed packaging workflow is `.github/workflows/content-factory-foundation-expert-review-package.yml`. It:

- runs only from approved `main` or the exact Founder/owner Issue #289 command `revision-run-foundation-expert-review-package:v1`;
- verifies the exact retained source and independent-review artifact digests before use;
- verifies source head, reviewed commit and Foundation fingerprint;
- recomputes the final Candidate fingerprint;
- confirms deterministic and independent review remain PASS with zero blockers and zero learner assets;
- resolves all 10 exact reviewable Foundation artifacts;
- writes a single `expert-review-bundle.json` plus split artifact files;
- writes `review-instructions.md` for the qualified reviewer;
- writes `submission-template.json` with placeholders rather than fabricated reviewer data;
- writes a manifest explicitly recording `humanReviewStatus: pending` and `foundationApprovalStatus: not_approved`; and
- uses no AI/provider call and therefore adds no model spend.

The package workflow itself does not approve, calibrate or remediate educational content. It is a deterministic handoff step only.

## Deliberately excluded

This increment does **not**:

- perform or simulate qualified human review;
- invent reviewer credentials or qualification evidence;
- import a completed human submission;
- remediate future human findings;
- transition a persisted Foundation job to `foundation_approved`;
- create Approved Course Foundation v1;
- provide an Admin reviewer-assignment UI; or
- generate Learn, Practice or Exam Prep assets.

## Next governed step

After this retained-package increment is released and its main-only proof succeeds:

1. provide the exact retained package to a real qualified subject/assessment reviewer or reviewer set;
2. collect a completed structured submission plus qualification and review evidence;
3. import and validate that submission against the exact package;
4. if blocking/material findings exist, reopen only affected Foundation truth and rerun required deterministic + independent assurance on the resulting fingerprint;
5. if expert review passes, persist exact qualified approval evidence and create immutable Approved Course Foundation v1 through the existing lifecycle/version-lineage gate; and
6. prove learner-facing asset count remains zero at `foundation_approved`.

## Documentation impact

This is an implementation/technical-documentation increment under existing Content Factory authority. It does not change normative policy and does not require a new ADR. The active staged implementation plan already identifies Slice 3C as the current increment, so no authority/index relocation is required.
