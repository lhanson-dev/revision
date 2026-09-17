# Content Factory AI Foundation and Human Expert Gate Amendment

**Status:** Proposed Founder-directed authority change — activates only when the governing PR is Founder-approved and merged  
**Decision date:** 17 September 2026  
**Decision owner:** Founder  
**Applies to:** Foundation Factory assurance, expert review, downstream asset-production eligibility, preview/release controls and Content Operations status semantics

## Purpose

Revision will distinguish the technical decision that a Foundation is substantively safe to continue from the separate governance decision that a qualified human expert has approved that exact Foundation.

This amendment deliberately changes the sequencing in `Content Factory Foundation and Asset Production Model.md` and ADR-0020 where those sources currently require `foundation_approved` before any learner-asset factory may start. It does **not** remove the qualified-human approval gate and does **not** permit AI approval to be represented as human-expert approval.

Where this amendment conflicts with the earlier sequencing, this amendment governs after activation.

## Governing two-gate model

### Gate 1 — AI Foundation Gate

The AI Foundation Gate evaluates the exact Foundation Candidate after deterministic assurance and a genuinely fresh, independent review context.

Allowed outcomes:

- **PASS** — no unresolved blocking or material Foundation defect remains. Minor findings may remain when they are explicitly recorded, bounded and do not make the Foundation unsafe for provisional downstream work.
- **FAIL-HOLD** — one or more unresolved blocking or material Foundation defects make the Foundation unsafe to proceed.

A missing qualified-human sign-off is **not** a reason to record AI `FAIL-HOLD`. Human review status is represented separately.

An AI PASS must remain fingerprint-bound to the exact Foundation Candidate and may not be reused after a material Foundation change.

### Gate 2 — Qualified Human Expert Gate

The Qualified Human Expert Gate remains the final Foundation approval gate.

Allowed outcomes/statuses:

- **PENDING** — the AI Foundation Gate has passed but qualified-human approval has not yet been obtained for the exact Foundation fingerprint.
- **PASS** — the required qualified subject/assessment expert review has approved the exact Foundation fingerprint and the Foundation may enter `foundation_approved` when all other approval controls pass.
- **FAIL-HOLD** — the qualified reviewer has identified one or more unresolved blocking or material defects requiring remediation and re-review.

AI systems, automated assurance and AI-authored workbooks cannot satisfy this gate. Revision must not claim that a Foundation is "human expert reviewed", "expert approved" or equivalent while this gate is PENDING.

## Lifecycle semantics

The current lifecycle seam is retained rather than creating a second approval state:

`requested → compiling → assuring → expert_review → foundation_approved`

For this model:

- transition from `assuring` to `expert_review` means **AI Foundation Gate = PASS**;
- while in `expert_review`, **Qualified Human Expert Gate = PENDING or in progress** unless an explicit human `FAIL-HOLD` has blocked the job;
- transition from `expert_review` to `foundation_approved` still requires exact qualified-human approval evidence;
- `foundation_approved` must never be entered from AI review alone.

The lifecycle name `expert_review` therefore means the human-expert gate is pending/in progress, not that human approval already exists.

## Provisional downstream work after AI PASS

A Foundation in `expert_review` may authorize provisional downstream work only when all of the following remain true:

1. deterministic Foundation assurance is PASS for the exact current fingerprint;
2. independent AI Foundation review is PASS for the same exact fingerprint;
3. no candidate blocking/material defect remains unresolved;
4. no unresolved operational blocker exists; and
5. the provisional asset records the exact Foundation fingerprint it was derived from.

When those conditions hold, Revision may perform:

- Learn, Practice and Exam Prep content generation;
- site/page construction against the candidate Foundation;
- internal QA, automated testing and integration testing;
- asset assurance that does not falsely depend on completed human approval; and
- controlled preview where the preview is non-public, access-controlled where appropriate, non-indexed and clearly not represented as qualified-human approved.

This is **provisional build authorization**, not Foundation approval.

## Restrictions while the Human Expert Gate is PENDING

Until the Qualified Human Expert Gate passes for the exact Foundation fingerprint:

- the Foundation remains outside `foundation_approved`;
- public/production release of Foundation-dependent learner content is prohibited;
- production authorization must not be inferred from AI PASS;
- Revision must not make a human-expert-review claim;
- provisional assets must remain traceable to the candidate Foundation fingerprint; and
- any separate calibration boundary remains fully in force.

In particular, a Question Family marked `not_calibrated` must not be treated as calibrated assessment truth or used for unrestricted final learner-owned assessment generation merely because the AI Foundation Gate passed.

## Human review batching

Revision may operationally batch several AI-passed Foundations for qualified-human review to reduce cost and coordination overhead.

Batching does not create shared approval. Each Foundation must still receive an explicit decision bound to its own exact Foundation fingerprint/version and evidence. No fixed batch size is mandated by this authority.

## Invalidation and remediation

If qualified-human review identifies a blocking/material Foundation defect:

1. record Human Expert Gate = FAIL-HOLD;
2. block release/promotion of all provisional assets derived from the affected fingerprint;
3. remediate the Foundation through the governed Foundation lifecycle;
4. rerun deterministic and independent AI assurance on the changed Foundation where required;
5. obtain qualified-human approval on the new exact fingerprint; and
6. revalidate, regenerate or invalidate provisional downstream assets according to dependency impact before promotion.

A human reviewer may also record minor findings without forcing FAIL-HOLD when the Foundation remains safe and the finding is explicitly bounded.

## `FAIL-HOLD` semantics

Across both review gates, `FAIL-HOLD` means the reviewer has identified an unresolved blocking/material defect or safety problem in the Foundation under that gate's remit.

`PENDING` means a required review has not yet completed.

These states must not be conflated. Using `FAIL-HOLD` to represent a merely outstanding human review corrupts assurance telemetry and makes it impossible to distinguish defective Foundations from Foundations awaiting a governance step.

## Business 7132 / 2027 transition disposition

The completed independent AI review for the current AQA A-level Business 7132 / 2027 Foundation is transition evidence for this policy, not human approval.

Under this two-gate model its intended status is:

- **AI Foundation Gate: PASS — minor non-blocking finding**;
- **Qualified Human Expert Gate: PENDING**;
- the recorded Paper 2 Question Family granularity issue remains a minor correction before calibration/unrestricted assessment generation; and
- the historical completed workbook is preserved as evidence of the previous gate semantics and must not be rewritten to pretend that its original `FAIL-HOLD` decision meant a substantive Foundation defect.

## Relationship to existing authority

After activation this amendment supersedes only the conflicting parts of:

- `80-company-workflows/Content Factory Foundation and Asset Production Model.md`;
- `80-company-workflows/Content Pack Production and Assurance Workflow.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`; and
- ADR-0020's sequencing statement that all downstream asset production waits for `foundation_approved`.

Those sources remain authoritative for all non-conflicting controls, including provenance, exact-course identity, source rights, completeness, assessment truth, dependency fingerprints, assurance, human approval and final publication restrictions.

The older `Content Factory v2 Expert Review Ready Amendment.md` remains historical/legacy sequencing; this amendment does not reactivate the superseded v2 orchestration.

## Documentation and implementation requirements

The same governed PR implementing this change must:

- add a technical contract for provisional-build authorization;
- add deterministic tests proving provisional authorization is available only after the AI Foundation Gate passes and remains fingerprint-current;
- preserve `foundation_approved` as the qualified-human-approved state;
- record the architectural decision in a new ADR;
- update `INDEX.md` so the two-gate amendment is discoverable as current Content Factory authority; and
- avoid rewriting prior review evidence or historical ADRs to simulate the new policy having existed earlier.
