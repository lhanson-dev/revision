# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — authority approved via PR #290; Issue #289 In Progress  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Related previous initiative:** GitHub Issue #169 (superseded end-to-end v2 programme)

## Purpose

Implement the Content Factory as a staged production system where an exact course reaches an approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

The existing v2 factory is implementation evidence and a source of reusable controls. It is not the orchestration shape to extend.

## Current implementation truth

The legacy implementation under `src/content-factory/` still contains the old end-to-end `ContentFactoryJob` and orchestrator used by the historical v2 programme. That path couples foundation modelling with learner-asset generation and final package assurance.

Issue #289 introduces a separate Foundation boundary. The first implementation slice is deliberately isolated from the legacy state machine so the old topology does not become a dependency of the new process.

The new Foundation modules are:

- `src/content-factory/foundation-schema.ts`;
- `src/content-factory/foundation-lifecycle.ts`; and
- `src/content-factory/foundation-lifecycle.test.ts`.

The legacy orchestrator remains present during migration but is not the canonical Foundation runtime.

## Migration rule

Reuse a previous component only when all three are true:

1. its responsibility remains valid under the new authority;
2. its contract can be understood without importing the old end-to-end state machine; and
3. reuse is simpler and safer than implementing the bounded responsibility cleanly.

If any condition fails, create a clean boundary and port only the useful control or learning.

## Reusable implementation candidates

Strong candidates for selective reuse are:

- source-rights classification and Source Licence Register construction;
- exact identity/cohort resolution;
- Board Alignment compilation;
- Course Knowledge Model concepts and validators;
- Assessment Blueprint and Question Family concepts;
- deterministic cross-reference and completeness validators;
- fresh-context independent-review contracts;
- durable artifact fingerprints and dependency-aware invalidation;
- worker provenance and cost telemetry; and
- bounded candidate recovery where generative variability genuinely requires it.

Reuse should occur at schema/function/service boundaries, never by calling the old end-to-end orchestrator from the new Foundation process.

## Known legacy incompatibility

The legacy `coverageMapSchema` treats a requirement as `complete` only when it references learner-content artifacts.

That contract is incompatible with the new authority because the Course Foundation must be approvable before Learn, Practice or Exam Prep assets exist.

The new Foundation Candidate therefore references a Foundation coverage-model artifact and its fingerprint without importing the legacy learner-content completeness rule. Slice 2 must establish the replacement Foundation coverage contract explicitly.

## Do not carry forward by default

Do not make these old structures prerequisites for the new process:

- the v2 whole-course state transition map;
- the single `generating` state;
- combined Learn/Practice work units;
- `continueContentFactoryToExpertReviewReady` as the normal entry point;
- old Q1–Q8 whole-course qualification sequencing;
- full-course confirmation-pilot eligibility;
- old expert-review packaging that requires all learner collateral to exist; or
- checkpoint assumptions tied to the old whole-course topology.

Historical tests remain historical/regression evidence only where a retained boundary still uses the same contract.

## Foundation domain model

### Foundation Candidate

A Foundation Candidate is the complete pre-approval dependency set for an exact course. It records:

- exact course identity and cohort;
- Source Licence Register ref/fingerprint;
- Board Alignment ref/fingerprint;
- Foundation coverage-model ref/fingerprint;
- Course Truth / Course Knowledge Model ref/fingerprint;
- Exam Truth / Assessment Blueprint ref/fingerprint;
- Question Family refs/fingerprints where applicable;
- deterministic Foundation assurance;
- independent Foundation review;
- unresolved blockers and known limitations; and
- provenance/source-set fingerprint.

It contains no Learn, Practice, Exam Prep, mock or Marking Pack requirement.

### Approved Course Foundation

The approved artifact adds:

- stable `foundationId`;
- positive `foundationVersion`;
- deterministic `foundationFingerprint`;
- exact embedded Foundation Candidate;
- qualified reviewer and approver identities;
- review/approval timestamps and evidence refs; and
- known limitations.

The approved record is immutable. A changed Course Truth, Exam Truth or other material Foundation dependency requires a different fingerprint and newer version for the same foundation ID.

## Approved Foundation lifecycle

The canonical Foundation lifecycle is intentionally small:

`requested → compiling → assuring → expert_review → foundation_approved`

Exception states:

- `blocked` — operational interruption; resumes to the exact prior working stage after all blockers are resolved;
- `superseded` — terminal record for a replaced candidate/version.

The working states deliberately group internal worker details. Identity, source-rights, Board Alignment, coverage, Course Truth and Exam Truth compilation are activities within `compiling`, not additional operator lifecycle states.

Deterministic validation, independent review and bounded remediation are activities within `assuring`.

### Transition rules

`requested → compiling`
- Foundation work may begin for the exact requested course.

`compiling → assuring`
- a complete Foundation Candidate exists with exact dependency refs/fingerprints.

`assuring → expert_review`
- deterministic Foundation assurance is `pass`;
- independent Foundation review is `pass`;
- candidate-level blockers are empty; and
- operational blockers are resolved.

`expert_review → foundation_approved`
- transition is available only through the dedicated Foundation approval function;
- qualified reviewer/approver evidence is present;
- the exact candidate fingerprint is calculated and frozen; and
- the approved version is recorded.

`foundation_approved → superseded`
- permitted only when a later governed Foundation version replaces the approved record.

No learner-asset generation transition exists inside this lifecycle.

## Foundation fingerprint and version invariant

The Foundation fingerprint is deterministic SHA-256 over the educational/assessment dependency set rather than operational review metadata.

It includes the exact course/cohort, source/foundation artifact refs and fingerprints, Course Truth, Exam Truth, Question Families and source-set fingerprint.

It excludes review timestamps and assurance evidence refs so re-reviewing identical educational inputs does not create artificial content versions.

Required invariant for the same `foundationId`:

- same Foundation fingerprint → same `foundationVersion`;
- changed Foundation fingerprint → newer `foundationVersion`.

An Approved Course Foundation must also be re-checkable against its embedded candidate to detect fingerprint drift/tampering.

## Implementation slices

### Slice 1 — Foundation schema and lifecycle

**Status: implementation in progress via Issue #289.**

Implement:

- Foundation Candidate schema;
- Approved Course Foundation schema;
- Foundation job/lifecycle schema;
- small lifecycle and blocker/resume behaviour;
- deterministic Foundation fingerprint;
- explicit `foundation_approved` approval guard;
- version/integrity invariant;
- unit/schema assurance;
- public Content Factory exports; and
- current technical implementation documentation.

Explicitly exclude provider calls and all learner-asset generation.

Success proof:

A synthetic Foundation Candidate can reach `foundation_approved` only with passing assurance and exact qualified approval evidence; changed Course Truth or Exam Truth changes the Foundation fingerprint and cannot masquerade as the same approved version.

### Slice 2 — Foundation compilation

Goal: create Course Truth + Exam Truth behind the new boundary.

Assess and selectively port/rebuild:

- identity/cohort resolution;
- source discovery and rights;
- Board Alignment;
- Foundation-specific curriculum coverage;
- Course Knowledge Model / Course Truth;
- Assessment Blueprint / Exam Truth; and
- Question Families.

Do not call Learn, Practice, assessment-item or Marking Pack generation.

Success proof:

A real governed course reaches a complete Foundation Candidate with Course Truth and Exam Truth and zero learner-facing assets.

### Slice 3 — Foundation assurance and approval

Goal: make the Foundation approval gate operationally trustworthy.

Implement/port:

- Foundation-specific deterministic assurance;
- fresh-context independent Foundation review;
- targeted Foundation remediation;
- qualified expert-review package/contract;
- structured expert findings/evidence; and
- durable approved Foundation persistence.

Success proof:

One real course reaches `foundation_approved` before any learner asset is generated.

### Slice 4 — Learn Factory

Generate and assure teaching assets from approved Course Truth. Every Learn asset must carry the approved Foundation fingerprint/version.

### Slice 5 — Practice Factory

Generate coverage-driven Practice assets against canonical knowledge/skill nodes and valid learner-evidence mappings, without universal quantity quotas or mandatory completion lanes.

### Slice 6 — Exam Prep Factory

Generate assessment-authentic technique, questions, timed work, mocks/simulations and Marking Packs from approved Course Truth + Exam Truth, with higher assurance for representative mocks.

Candidate recovery from ADR-0019 should be reused only where it remains the simplest robust mechanism.

### Slice 7 — Content Operations presentation

Present the operator journey primarily as:

```text
Foundation
Course Truth     APPROVED
Exam Truth       APPROVED
Foundation       APPROVED v1

Assets
Learn            not started / generating / assured / published
Practice         not started / generating / assured / published
Exam Prep        not started / generating / assured / published
```

Internal candidates/retries remain diagnostics, not the primary workflow.

### Slice 8 — staged repeatability qualification

Create a staged reliability model that separately proves:

- Foundation reliability across materially different course shapes;
- Learn reliability;
- Practice reliability;
- Exam Prep/Marking reliability;
- dependency invalidation;
- restart/reuse and cost controls; and
- fail-closed behaviour.

Do not inherit the old full-course Q1–Q8 sequence merely for compatibility.

## First real-course proof

AQA Business remains a useful validation candidate because earlier pilots exposed many reusable failure classes, but the new proof must be a new Foundation job/version rather than a continuation of Issue #281.

The proof question is:

> Can Revision establish complete Course Truth and Exam Truth, assure them independently, obtain qualified approval of the exact version, and freeze an Approved Course Foundation before generating assets?

## Assurance approach

For every slice:

- schema/unit tests for lifecycle and invariants;
- deterministic validator tests including simultaneous defects where relevant;
- dependency invalidation tests;
- no hidden mutation of approved Foundation artifacts;
- explicit provider-call/cost boundaries;
- fresh-context review separation;
- historical regressions only for retained components; and
- exact-head CI before governed merge.

## Cost approach

Track cost independently for:

- Foundation compilation;
- Foundation assurance;
- Learn;
- Practice; and
- Exam Prep/Marking.

Moving expensive asset generation after Foundation approval should reduce waste when foundational defects are discovered.

## Documentation migration

As implementation lands:

- maintain this plan as the current staged implementation source;
- maintain `docs/technical/Content Factory Foundation Lifecycle Implementation.md` for Slice 1 implementation truth;
- update `docs/technical/Content Factory Architecture.md` as the new runtime replaces legacy topology;
- retain pilot/remediation records as history;
- mark old end-to-end implementation docs legacy/superseded when appropriate;
- update Content Operations documentation when that surface changes;
- create staged reliability authority before routine paid/batch production; and
- update `INDEX.md` when implementation ownership materially changes.

## Immediate next step

Complete Slice 1 through its governed PR and exact-head assurance. After production verification, begin Slice 2 as a separate short PR. Do not combine Foundation compilation or provider work into the Slice 1 PR.