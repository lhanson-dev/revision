# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — authority approved via PR #290; Issue #289 In Progress  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Source-rights authority:** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related previous initiative:** GitHub Issue #169 (superseded end-to-end v2 programme)

## Purpose

Implement the Content Factory as a staged production system where an exact course reaches an approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

The historical v2 factory remains implementation evidence and a source of reusable controls. It is not the orchestration shape to extend.

## Current implementation truth

The canonical Foundation runtime is now separate from the legacy `ContentFactoryJob` topology.

Released through PR #291 and PR #292:

- `foundation-schema.ts` — Foundation Candidate / Approved Course Foundation contracts;
- `foundation-lifecycle.ts` — the small Foundation lifecycle and exact-fingerprint/version controls;
- `foundation-compilation.ts` — provider-neutral Foundation compilation and deterministic reconciliation; and
- Foundation-specific coverage, Course Truth, Exam Truth and Question Family boundaries with zero learner-asset dependency.

Slice 2B via PR #293 adds the live Foundation runtime:

- `foundation-source-rights-registry.ts` — versioned reusable source-rights rules with a governed-main trust boundary;
- `foundation-live-adapter.ts` — Foundation-native live source/profile/provider workers;
- `foundation-live-adapter.test.ts` — provider-boundary/fail-closed regression assurance;
- `foundation-live-proof.integration.test.ts` — real-course live proof harness; and
- `.github/workflows/content-factory-foundation-live-proof.yml` — main-only manual paid proof workflow.

The legacy orchestrator and old worker factories remain in the repository during migration but are not canonical Foundation runtime dependencies.

## Migration rule

Reuse a previous component only when all three are true:

1. its responsibility remains valid under the new authority;
2. its contract can be used without importing the old end-to-end state machine; and
3. reuse is simpler and safer than implementing the bounded responsibility cleanly.

If any condition fails, create a clean boundary and port only the useful control or learning.

Current selective reuse includes the Source Licence Register concepts, identity/Board/CKM/assessment schemas, deterministic cross-reference controls, worker provenance/cost telemetry and the low-level OpenAI structured Responses API transport. The old combined Learn/Practice/assessment worker factory is not reused by the Foundation path.

## Legacy coverage incompatibility and replacement

The legacy `coverageMapSchema` treats a requirement as complete only when it references learner-content artifacts. That conflicts with Foundation-first authority.

`foundationCoverageModelSchema` instead requires:

- every governed curriculum requirement exactly once;
- preserved official/source/component scope;
- mapping to one or more canonical Course Truth knowledge/skill node IDs; and
- permitted curriculum source rights.

It contains no learner-content refs and no Learn/Practice/Exam Prep completion dependency.

## Do not carry forward by default

Do not make these legacy structures prerequisites for the new process:

- the v2 whole-course state transition map;
- the single `generating` state;
- combined Learn/Practice work units;
- `continueContentFactoryToExpertReviewReady`;
- old Q1–Q8 whole-course qualification sequencing;
- full-course confirmation-pilot eligibility;
- expert-review packages requiring all learner collateral; or
- checkpoint assumptions tied to the old end-to-end topology.

Historical tests and ADRs remain evidence only where a retained boundary still uses the same contract.

## Foundation domain model

A Foundation Candidate is the complete pre-approval dependency set for an exact course. It records exact course/cohort, Source Licence Register, Board Alignment, Foundation coverage, Course Truth, Exam Truth, Question Families, assurance/review status, blockers/limitations and provenance.

It contains no Learn, Practice, Exam Prep, mock or Marking Pack requirement.

An Approved Course Foundation adds stable Foundation identity/version, deterministic aggregate fingerprint, the exact embedded candidate, qualified reviewer/approver evidence and known limitations. The approved record is immutable; changed material Foundation truth requires a new fingerprint and newer version.

## Approved Foundation lifecycle

The canonical lifecycle is intentionally small:

`requested → compiling → assuring → expert_review → foundation_approved`

Exception states:

- `blocked` — operational interruption, resumable to the exact prior working stage after blockers resolve;
- `superseded` — terminal record for a replaced candidate/version.

Identity, rights, Board Alignment, coverage, Course Truth and Exam Truth are activities within `compiling`. Deterministic assurance, independent review and bounded remediation are activities within `assuring`.

No learner-asset generation transition exists inside this lifecycle.

## Foundation fingerprint/version invariant

The aggregate Foundation fingerprint is deterministic SHA-256 over material educational/assessment dependency identity:

- exact course/cohort;
- Source Licence Register fingerprint;
- Board Alignment fingerprint;
- coverage fingerprint;
- Course Truth fingerprint;
- Exam Truth fingerprint;
- Question Family fingerprints; and
- source-set fingerprint.

Artifact storage refs, review timestamps and assurance evidence refs do not define educational identity.

For the same `foundationId`:

- same material fingerprint → same `foundationVersion`;
- changed material fingerprint → newer version.

## Implementation slices

### Slice 1 — Foundation schema and lifecycle

**Status: released through PR #291; storage-location repeatability clarified in PR #292.**

Implemented Foundation schemas, lifecycle, blocker/resume behaviour, material fingerprint, exact-fingerprint assurance/review binding, approval guard, mandatory version lineage, integrity checks and unit assurance.

### Slice 2 — Foundation compilation

Goal: create Course Truth + Exam Truth behind the new Foundation boundary with zero learner-facing assets.

#### Slice 2A — compiler core and contracts

**Status: released and production-verified through PR #292 / `60269b9d96d6cce75f5decde30a727301f446d03`.**

Implemented:

- Foundation-native identity/source/evidence worker contracts;
- deterministic source-rights classification;
- Board Alignment validation/fingerprinting;
- Foundation-specific coverage;
- Course Truth reconciliation against exact coverage node IDs;
- Exam Truth bound to exact Board Alignment + Course Truth fingerprints and governed assessment requirements;
- Question Family reconciliation;
- Foundation-only artifact/provenance contracts; and
- provider-free proof of a complete Foundation Candidate with zero learner assets.

#### Slice 2B — live adapter and real-course proof

**Status: implementation in progress via PR #293.**

Implement:

- governed loading of reusable source-rights rules and approval evidence;
- current-source/licence preflight;
- exact identity/cohort and controlled structured evidence;
- Foundation-native live provider workers;
- bounded live Course Truth, Exam Truth enrichment and Question Families;
- provider spend/provenance evidence; and
- one new real governed Foundation job.

The first proof profile is **AQA A-level Business 7132 for the 2027 examination cohort**. It is a new Foundation job and not a continuation of superseded Issue #281.

AQA material is conservatively `REFERENCE_ONLY` under the proposed registry: controlled structured alignment facts may be used, but AQA source prose must not enter generative context. Curriculum truth supplied to generative workers must come from OPEN/owned/licensed sources.

The source-rights registry is a proposed rule set until PR #293 is Founder-approved and merged. The runtime deliberately refuses live registry use outside `refs/heads/main`. Therefore the paid real-course proof occurs **after** approved merge and production verification, using the exact governed `main` version.

Success proof for completion of Slice 2:

- a new real course Foundation job reaches a compiler-complete Foundation Candidate;
- Course Truth and Exam Truth are complete against the exact governed requirement set;
- exact worker/provider/cost/rights-registry evidence is retained; and
- learner-facing artifact count is zero.

This does not constitute Foundation assurance or expert approval.

### Slice 3 — Foundation assurance and approval

Goal: make the Foundation approval gate operationally trustworthy.

Implement/port:

- Foundation-specific deterministic assurance;
- fresh-context independent Foundation review;
- targeted Foundation remediation;
- qualified expert-review package/contract;
- structured expert findings/evidence; and
- durable immutable Approved Course Foundation persistence.

Success proof: one real course reaches `foundation_approved` before any learner asset is generated.

### Slice 4 — Learn Factory

Generate and assure teaching assets from approved Course Truth. Every Learn asset carries the approved Foundation fingerprint/version.

### Slice 5 — Practice Factory

Generate coverage-driven Practice assets against canonical knowledge/skill nodes and valid learner-evidence mappings, without universal quantity quotas or mandatory completion lanes.

### Slice 6 — Exam Prep Factory

Generate assessment-authentic technique, questions, timed work, mocks/simulations and Marking Packs from approved Course Truth + Exam Truth. Representative full mocks receive higher assurance.

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

Internal candidates/retries remain diagnostics rather than the primary workflow.

### Slice 8 — staged repeatability qualification

Separately prove Foundation reliability, Learn reliability, Practice reliability, Exam Prep/Marking reliability, dependency invalidation, restart/reuse/cost controls and fail-closed behaviour across materially different course shapes.

Do not inherit the old full-course Q1–Q8 sequence merely for compatibility.

## First real-course proof and larger proof question

Slice 2B answers the first operational question: can a live governed runtime produce a Foundation Candidate containing Course Truth + Exam Truth without manufacturing learner assets?

The larger programme proof remains:

> Can Revision establish complete Course Truth and Exam Truth, assure them independently, obtain qualified approval of the exact version, and freeze an Approved Course Foundation before generating assets?

Slice 3 completes that larger proof.

## Assurance approach

For every slice:

- schema/unit tests for lifecycle and invariants;
- deterministic validator tests including simultaneous defects where relevant;
- dependency invalidation tests;
- no hidden mutation of approved Foundation artifacts;
- explicit provider-call/cost boundaries;
- fresh-context review separation where review exists;
- historical regressions only for retained components; and
- exact-head CI before governed merge.

Paid live proof evidence supplements these controls; it does not replace exact-head CI or Founder approval.

## Documentation migration

As implementation lands:

- maintain this plan as the staged implementation owner;
- maintain Foundation Lifecycle and Foundation Compilation implementation records;
- keep `docs/technical/Content Factory Architecture.md` aligned to the current Foundation runtime rather than legacy orchestration;
- retain pilot/remediation records as history;
- mark old end-to-end implementation docs legacy/superseded where appropriate;
- update Content Operations documentation when that surface changes; and
- update `INDEX.md` only when implementation ownership materially changes.

## Immediate next step

Complete PR #293 implementation, documentation, exact-head CI and review. After explicit Founder approval, merge and production-verify the runtime. Then run the main-only AQA 7132 live proof and retain the exact evidence. Slice 2 is complete only when that proof succeeds.