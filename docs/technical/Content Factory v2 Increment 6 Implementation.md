# Content Factory v2 Increment 6 Implementation

**Status:** Implemented on `implementation/content-factory-v2-expert-handoff` pending governed PR merge.  
**Initiative:** Issue #169 — Content Factory v2 — automated course build to expert review.  
**Governing authority:** `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `80-company-workflows/Content Operations Admin v0.1 Amendment.md`, and the educational content licensing/provenance standard.

## Purpose

Implement the v2 expert handoff increment:

`clean independent review → exact-version expert package → expert_review_ready → portable qualified-expert review → machine-readable import → human_review or targeted expert remediation`

This increment does not publish learner content and does not replace qualified subject/assessment review with AI.

## Canonical runtime and entry point

- canonical application runtime remains `/app/`;
- Founder/Content Operations entry remains the role-gated Admin capability at `/app/#/admin/content`;
- qualified review remains external/portable initially rather than creating an in-browser reviewer portal;
- Content Factory job state remains durable outside chat memory and is the source for Admin presentation.

The existing Content Operations job list already renders the current machine-readable job state generically. A job advanced to `expert_review_ready` therefore appears as **Expert Review Ready** on the canonical Admin Content Operations screen without introducing a duplicate route or parallel status model.

## New domain module

`src/content-factory/expert-review-handoff.ts` adds the deterministic expert handoff boundary.

### Expert review package

`expertReviewPackageSchema` produces a portable structured package tied to one exact independently reviewed commit. It contains:

- exact course identity;
- Source Licence Register reference and rights-safe source summary;
- Board Alignment;
- coverage map;
- Course Knowledge Model;
- Learning Blueprint;
- substantial Revision-authored Learn and Practice artifacts;
- Assessment Blueprint;
- Question Families;
- Revision-authored assessment items;
- question-specific Marking Packs;
- the current course-content-pack manifest;
- deterministic validation evidence;
- independent-review evidence;
- known limitations; and
- explicit reviewer instructions, including the non-endorsement boundary.

The package is assembled deterministically. No AI/model call is required merely to copy already-assured Revision artifacts into the portable review package.

### Export contract

The package is accompanied by the existing versioned `ExpertReviewContract` with:

- exact `jobId`;
- exact reviewed commit;
- immutable package reference;
- exact artifact reference set;
- known limitations;
- pending decision; and
- machine-readable findings array.

The Content Factory advances through `expert_review_packaging` to `expert_review_ready` only after the package and contract are successfully persisted and the existing lifecycle guard confirms the exact independently reviewed version.

Repeated packaging of an already-ready job is idempotent and reuses the persisted package/contract rather than creating duplicates.

## Qualified expert import

`qualifiedExpertReviewSubmissionSchema` adds the portable reviewer-return envelope around the existing expert finding contract. The submission records:

- package/job/exact-commit linkage;
- the unchanged exported artifact set and known limitations;
- reviewer identity, role and qualification summary;
- review timestamp;
- PASS / CONDITIONAL PASS / FAIL decision; and
- machine-readable item-level findings.

Import fails closed when:

- job, package or commit differs from the export;
- artifact references differ from the immutable exported contract;
- known limitations are altered in transit;
- a finding targets an artifact outside the package;
- a finding names an unknown work unit;
- a PASS retains open findings; or
- a non-FAIL decision retains an open blocking finding.

A valid import first enters `human_review`.

- PASS remains in `human_review` with zero unresolved blocking/material findings and is eligible for the existing separate benchmark-approval transition.
- CONDITIONAL PASS / FAIL with blocking or material findings creates `remediation.trigger = expert_review`, records the qualified review artifact and advances to the governed `remediation` state so downstream remediation can act from structured expert findings rather than a free-text backlog.

The importer does not automatically declare `benchmark_approved` and does not bypass subsequent CI, Founder merge approval or publication controls.

## Admin status

No new Admin route is required.

`src/app/ContentOperations.tsx` already reads the protected server-side Content Factory job projection and displays `state` using the generic state label renderer. Therefore `expert_review_ready` is presented as **Expert Review Ready** automatically once the durable job reaches that state.

This preserves the bounded Admin architecture and avoids a second reviewer/workflow UI. The existing GitHub job link remains the operational detail link until a later justified Admin detail increment exists.

## Assurance

Focused unit tests cover:

- exact independently reviewed content packaging;
- source-rights summary and Learn/Practice/assessment/Marking Pack inclusion;
- exact commit/package contract linkage;
- idempotent repeat packaging;
- qualified PASS import;
- material expert finding round-trip into `expert_review` remediation state; and
- rejection of findings outside the immutable exported package.

Repository CI continues to provide TypeScript, lint, unit, build, responsive browser, database/RLS and protected-service assurance.

## Deliberate non-scope

This increment does not add:

- an in-browser subject-expert reviewer portal;
- automated qualification of a reviewer;
- automated benchmark approval;
- automated merge or publication;
- learner-facing content changes;
- learner-answer marking changes;
- a concrete external artifact storage/provider adapter where one is not already supplied by the production execution plane;
- cross-course-shape proof; or
- batch/concurrency/spend hardening.

The next governed increment is scale proof across materially different qualification/course shapes before batch/concurrency/spend hardening.

## Documentation impact

This document records the Increment 6 implementation boundary. No normative authority change is required: the implementation follows the already-approved expert-review-ready operating contract and the existing bounded Admin authority. Historical implementation and assurance records are not rewritten.
