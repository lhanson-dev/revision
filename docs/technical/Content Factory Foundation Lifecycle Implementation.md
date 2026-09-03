# Content Factory Foundation Lifecycle Implementation

**Status:** Slice 1 released through PR #291; repeatability clarification implemented in PR #292  
**Date:** 3 September 2026  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md` and ADR-0020

## Purpose

Record the production implementation of the foundation-gated Content Factory lifecycle boundary.

Slice 1 established the architectural boundary required before Course Truth or Exam Truth workers are connected. PR #292 retains that boundary while clarifying that the aggregate Foundation identity represents material dependency content rather than artifact storage location.

## Canonical runtime boundary

The current implementation boundary is the typed Content Factory domain under `src/content-factory/`.

The new Foundation lifecycle is implemented separately from the legacy end-to-end `ContentFactoryJob` / `orchestrator.ts` path. The legacy orchestrator remains implementation evidence and may continue to support historical tooling, but it does not govern the new Foundation process.

Foundation lifecycle modules:

- `src/content-factory/foundation-schema.ts` — Foundation Candidate, Approved Course Foundation and Foundation job contracts;
- `src/content-factory/foundation-lifecycle.ts` — small lifecycle, blocking/resume, deterministic fingerprinting, assurance/review binding, approval guard and version invariant;
- `src/content-factory/foundation-lifecycle.test.ts` — focused boundary and invariant assurance; and
- `src/content-factory/foundation-fingerprint.test.ts` — storage-location independence and material-dependency fingerprint regression coverage.

The public `src/content-factory/index.ts` exports the new Foundation contracts alongside legacy exports during migration.

## Implemented lifecycle

The Foundation path is intentionally small:

`requested → compiling → assuring → expert_review → foundation_approved`

`blocked` is an operational interruption state that resumes to its exact prior working stage. `superseded` is terminal for a replaced candidate/approved version.

The generic advance function cannot enter `foundation_approved`. Approval must use the dedicated approval function with qualified review evidence.

## Foundation Candidate

A Foundation Candidate records the trusted dependency set without learner-facing assets:

- exact course identity and cohort;
- Source Licence Register ref/fingerprint;
- Board Alignment ref/fingerprint;
- coverage-model ref/fingerprint;
- Course Knowledge Model / Course Truth ref/fingerprint;
- Assessment Blueprint / Exam Truth ref/fingerprint;
- Question Family refs/fingerprints where applicable;
- deterministic assurance result;
- independent-review result;
- unresolved blockers and known limitations; and
- provenance/source-set fingerprint.

The candidate retains both refs and fingerprints because refs locate the exact immutable evidence/artifact while fingerprints establish dependency identity.

The new candidate contract deliberately does **not** reuse the legacy `coverageMapSchema` as its Foundation completeness contract. The legacy schema treats `complete` coverage as requiring learner-content references, which conflicts with the approved rule that the Foundation must be approvable before Learn, Practice or Exam Prep assets exist.

Foundation dependencies may be changed only while the job is in `compiling`. Entering `assuring` freezes the educational/assessment dependency set for that candidate. If Course Truth, Exam Truth or another Foundation dependency needs to change after assurance has started, the candidate must return through a new compiling/assurance path rather than retaining earlier review evidence.

## Exact-version assurance binding

Deterministic assurance and independent review are not accepted as generic `pass` flags.

Each completed assurance/review result must record the exact SHA-256 Foundation fingerprint that it assessed. The lifecycle verifies that supplied fingerprint against the current Foundation dependency set before recording the result.

Consequences:

- stale deterministic assurance cannot be attached to changed Course Truth or Exam Truth;
- stale independent review cannot be reused after a Foundation dependency changes;
- deterministic assurance and independent review must refer to the same Foundation fingerprint; and
- a serialized Approved Course Foundation is invalid unless both results are bound to its exact approved fingerprint.

## Approval guard

A Foundation can enter `foundation_approved` only when:

- the job is at `expert_review`;
- deterministic Foundation assurance is `pass` and bound to the exact current Foundation fingerprint;
- independent Foundation review is `pass` and bound to the exact current Foundation fingerprint;
- candidate-level blockers are empty;
- operational blockers are resolved;
- qualified reviewer/approver evidence explicitly identifies the same exact Foundation fingerprint; and
- version lineage is supplied to the approval function.

For version lineage:

- an initial Approved Course Foundation must explicitly declare no previous approved version and start at `foundationVersion: 1`; and
- a replacement Foundation must supply the previous Approved Course Foundation so the mandatory approval path can enforce the version invariant itself.

The resulting Approved Course Foundation embeds the exact candidate plus exact-fingerprint approval evidence. After approval, the job retains one canonical frozen candidate only inside the Approved Course Foundation.

## Fingerprint and version invariant

The Foundation fingerprint is deterministic SHA-256 over the material educational/assessment dependency identity. It uses the exact dependency **fingerprints** for the Source Licence Register, Board Alignment, coverage model, Course Truth, Exam Truth and Question Families, together with exact course/cohort and source-set identity.

Artifact refs remain on the immutable Foundation Candidate for retrieval and traceability, but storage paths are deliberately excluded from the aggregate Foundation fingerprint. Moving an immutable artifact to another valid ref therefore does not invent a new educational Foundation version.

The aggregate fingerprint also deliberately excludes review timestamps and assurance evidence references.

Consequences:

- identical material Foundation inputs produce the same fingerprint even when immutable artifact refs or Question Family ordering differ;
- refreshed assurance of identical educational inputs does not create a different content fingerprint;
- a Course Truth, Exam Truth or other material dependency fingerprint change produces a different Foundation fingerprint;
- changed inputs require a newer `foundationVersion` for the same `foundationId` inside the mandatory approval path;
- an initial Foundation cannot start at an arbitrary later version; and
- a stored Approved Course Foundation can be rechecked against its embedded candidate and exact review/approval bindings to detect dependency fingerprint tampering or stale evidence.

The standalone version assertion remains available as a reusable integrity check, but approval correctness no longer depends on callers remembering to invoke it separately.

## Deliberately excluded from the lifecycle slice

The lifecycle boundary itself does not implement:

- Course Truth or Exam Truth provider generation;
- Learn generation;
- Practice generation;
- Exam Prep or mocks;
- Marking Packs;
- provider integration;
- Content Operations UI;
- learner publication; or
- migration of the old end-to-end orchestrator.

Foundation compilation is added separately by Slice 2A without changing these lifecycle responsibilities.

## Assurance

Focused tests cover:

- Foundation completeness without learner-asset dependencies;
- the small lifecycle and exact blocker resume;
- Foundation dependency immutability once assurance begins;
- fail-closed assurance before expert review;
- exact-fingerprint deterministic assurance and independent-review binding;
- stale review evidence after a Course Truth / Exam Truth change;
- dedicated `foundation_approved` approval path;
- deterministic fingerprint stability;
- storage-location independence for identical dependency fingerprints;
- Course Truth / Exam Truth fingerprint changes;
- mandatory version-lineage enforcement inside approval;
- initial-version enforcement; and
- approved-record integrity checking.

Full repository CI remains the merge gate.

## Documentation impact

This document records how the approved Foundation lifecycle boundary is implemented. The storage-location correction aligns implementation with the existing authority rule that a new Foundation version is required when a **material** source, curriculum, Course Truth or Exam Truth dependency changes; it does not create a new normative rule. Historical Content Factory pilot and reliability records remain unchanged.
