# Content Factory Foundation Lifecycle Implementation

**Status:** Implementation in progress on Issue #289  
**Date:** 3 September 2026  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md` and ADR-0020

## Purpose

Record the first production implementation increment of the foundation-gated Content Factory.

This increment establishes only the architectural boundary required before Course Truth or Exam Truth workers are connected.

## Canonical runtime boundary

The current implementation boundary is the typed Content Factory domain under `src/content-factory/`.

The new Foundation lifecycle is implemented separately from the legacy end-to-end `ContentFactoryJob` / `orchestrator.ts` path. The legacy orchestrator remains implementation evidence and may continue to support historical tooling, but it does not govern the new Foundation process.

New modules:

- `src/content-factory/foundation-schema.ts` — Foundation Candidate, Approved Course Foundation and Foundation job contracts;
- `src/content-factory/foundation-lifecycle.ts` — small lifecycle, blocking/resume, deterministic fingerprinting, approval guard and version invariant;
- `src/content-factory/foundation-lifecycle.test.ts` — focused boundary and invariant assurance.

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

The new candidate contract deliberately does **not** reuse the legacy `coverageMapSchema` as its Foundation completeness contract. The legacy schema treats `complete` coverage as requiring learner-content references, which conflicts with the approved rule that the Foundation must be approvable before Learn, Practice or Exam Prep assets exist.

## Approval guard

A Foundation can enter `foundation_approved` only when:

- the job is at `expert_review`;
- deterministic Foundation assurance is `pass`;
- independent Foundation review is `pass`;
- candidate-level blockers are empty;
- operational blockers are resolved; and
- exact qualified reviewer/approver evidence is supplied.

The resulting Approved Course Foundation embeds the exact candidate plus approval evidence.

## Fingerprint and version invariant

The Foundation fingerprint is deterministic SHA-256 over the educational/assessment dependency set, including Course Truth and Exam Truth fingerprints. It deliberately excludes review timestamps and assurance evidence references.

Consequences:

- identical foundation inputs produce the same fingerprint even if Question Family reference order differs;
- refreshed assurance of identical educational inputs does not create a different content fingerprint;
- a Course Truth or Exam Truth change produces a different fingerprint;
- changed inputs require a newer `foundationVersion` for the same `foundationId`; and
- a stored Approved Course Foundation can be rechecked against its embedded candidate to detect fingerprint tampering/drift.

## Deliberately excluded

This increment does not implement:

- Course Truth or Exam Truth generation/compilation workers;
- Learn generation;
- Practice generation;
- Exam Prep or mocks;
- Marking Packs;
- provider integration;
- Content Operations UI;
- learner publication; or
- migration of the old end-to-end orchestrator.

## Assurance

Focused tests cover:

- Foundation completeness without learner-asset dependencies;
- the small lifecycle and exact blocker resume;
- fail-closed assurance before expert review;
- dedicated `foundation_approved` approval path;
- deterministic fingerprint stability;
- Course Truth / Exam Truth fingerprint changes;
- version invalidation; and
- approved-record integrity checking.

Full repository CI remains the merge gate.

## Documentation impact

This document records how the first approved Foundation boundary is implemented. It does not change the normative process established by PR #290. Historical Content Factory pilot and reliability records remain unchanged.
