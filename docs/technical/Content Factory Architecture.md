# Content Factory Architecture

**Status:** Foundation-gated architecture active; Foundation lifecycle and compiler released; live Foundation runtime in progress via PR #293  
**Normative workflow:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Implementation owner:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the current technical architecture for Revision content production while preserving the canonical learner application boundary.

The Content Factory is a separate production plane upstream of learner publication. Its current architecture is **Foundation-first**: establish Course Truth and Exam Truth, assure and approve that exact Foundation, then manufacture learner-facing assets from the approved version.

This document describes implementation architecture. Normative authority is held by the numbered governance sources above it in the repository hierarchy.

## Canonical architecture

```text
exact governed course request
        |
        v
Foundation lifecycle
requested → compiling → assuring → expert_review → foundation_approved
              |
              +--> exact identity / cohort
              +--> source discovery + rights
              +--> Board Alignment
              +--> Foundation coverage
              +--> Course Truth / CKM
              +--> Exam Truth / Assessment Blueprint
              +--> Question Families
              |
              v
      Foundation Candidate
              |
      deterministic assurance
      independent review/remediation
      qualified expert approval
              |
              v
     Approved Course Foundation
      /          |           \
     v           v            v
 Learn Factory  Practice     Exam Prep / Marking
     \           |            /
      asset-specific assurance
              |
              v
        governed publication
              |
              v
validated learner catalogue → canonical `/app/`
```

The governing dependency direction is:

**truth → assurance → approval → assets**

Learner assets cannot be used to define or silently revise Course Truth or Exam Truth.

## Current Foundation implementation

### Lifecycle and identity

`src/content-factory/foundation-schema.ts` and `foundation-lifecycle.ts` own the small Foundation lifecycle and exact-version invariants.

The aggregate Foundation fingerprint identifies material educational/assessment dependencies, not storage locations or review timestamps. A material truth change requires a new Foundation fingerprint/version.

### Compilation

`src/content-factory/foundation-compilation.ts` owns the provider-neutral compiler. It turns bounded worker outputs into one cross-reconciled `FoundationCandidate` and permits only Foundation artifact types:

- Source Licence Register;
- Board Alignment;
- Foundation coverage model;
- Course Knowledge Model;
- Assessment Blueprint; and
- Question Families.

The compiler does not call the legacy `ContentFactoryJob` orchestrator and has no Learn, Practice, assessment-item or Marking Pack dependency.

### Foundation coverage

The canonical Foundation coverage model is `foundationCoverageModelSchema`, not the legacy learner-coupled `coverageMapSchema`.

A requirement is Foundation-complete when the exact governed requirement is represented and mapped to canonical Course Truth node IDs under permitted source rights. Learner `contentRefs` are not required and cannot be used as a Foundation prerequisite.

### Live provider/runtime boundary

Slice 2B adds:

- `foundation-source-rights-registry.ts` — reusable rights-policy registry with an approved-main trust boundary;
- `foundation-live-adapter.ts` — source preflight, governed real-course profile and Foundation-native provider workers;
- `OpenAIStructuredWorkerClient` — selectively reused low-level structured Responses API transport; and
- `content-factory-foundation-live-proof.yml` — main-only manual live proof.

The low-level provider client is reused because it already provides bounded structured output, fresh run/context identity, `store: false`, retries, cost accounting and spend ceilings without importing legacy orchestration.

The old model-assisted worker factory is not a Foundation dependency because it is coupled to Learn/Practice/assessment generation.

## Source and rights architecture

Source rights are a control-plane concern, not a model judgement.

The live Foundation path applies these layers:

```text
governed reusable rights registry on approved main
        +
current external source/licence preflight
        |
        v
deterministic source-rights classification
        |
        +--> OPEN / owned / licensed → may support curriculum truth within recorded terms
        +--> REFERENCE_ONLY → controlled Board Alignment only
        +--> UNKNOWN / ambiguous / prohibited → fail closed
```

A feature branch cannot authorise its own live source rules. The Slice 2B loader requires `refs/heads/main` and an exact commit SHA. The registry version on a feature branch is therefore only a proposal until Founder-approved merge.

Awarding-body source prose classified `REFERENCE_ONLY` is not passed into generative context. Controlled structured facts may support Board Alignment where the licensing standard permits that use.

## Worker architecture

`FoundationCompilationWorkers` is the canonical compilation worker interface. Each material worker execution records:

- worker/stage identity;
- fresh context identity where provider-backed;
- contract version;
- provider/model when applicable;
- retry count;
- usage/cost where available; and
- exact input/output references in the Foundation run ledger.

Responsibilities may be deterministic or provider-backed according to the task. The compiler, not the model, owns final schema/cross-reference acceptance.

For the Slice 2B AQA Business proof:

- identity/cohort — deterministic controlled profile plus live source preflight;
- source discovery — deterministic controlled source set plus live availability/licence-marker checks;
- Board Alignment — controlled structured evidence;
- Foundation coverage — deterministic;
- Course Truth — bounded model synthesis from permitted curriculum inputs;
- Exam Truth enrichment — bounded model synthesis from structured Foundation inputs while governed components/objectives/requirements remain deterministic;
- Question Families — bounded model generation plus compiler reconciliation.

## Artifact and persistence architecture

The compiler uses a replaceable `FoundationCompilationArtifactStore` contract. Artifact storage refs remain auditable but do not define aggregate Foundation identity.

During the Slice 2B live proof, Foundation artifacts and the full candidate are retained as workflow evidence. A later operational persistence adapter may move these artifacts to a durable production store without changing Foundation identity semantics.

GitHub Issue #289 remains the programme-level operational record for the current proof. The live proof posts a bounded result summary there and uploads machine-readable evidence as a workflow artifact.

The operational record is evidence only; it cannot override content authority, source-rights rules, assurance or Founder approval.

## Foundation assurance boundary

Slice 2B stops at a complete Foundation Candidate with assurance statuses still pending.

Slice 3 owns:

- Foundation-specific deterministic assurance;
- fresh-context independent educational/assessment review;
- bounded targeted remediation;
- qualified expert-review evidence; and
- immutable Approved Course Foundation persistence.

A live provider run or compiler-complete candidate is not an approved course and is not sufficient for learner publication.

## Asset-factory architecture after Foundation approval

Only an exact current Approved Course Foundation may feed downstream factories.

### Learn

Uses approved Course Truth to manufacture teaching/explanation assets. Learn affects Reviewed/orientation, not demonstrated Exam Readiness by itself.

### Practice

Uses approved Course Truth and valid learner-evidence mappings to test retrieval/application. Quantities are coverage-driven, not universal quotas.

### Exam Prep / Marking

Uses approved Course Truth + Exam Truth to manufacture assessment-authentic technique, questions, timed work, mocks/simulations and Marking Packs. Representative full mocks require higher assurance.

Each asset carries the Foundation fingerprint/version it was derived from. A material Foundation change invalidates only affected downstream assets according to dependencies.

## Existing learner architecture remains authoritative

The Content Factory remains upstream of the learner runtime:

- validated content packs remain the learner publication mechanism;
- the content registry discovers packs automatically at build time;
- only `available` content enters ordinary learner discovery;
- ordinary subjects should not require hard-coded subject routes/shared React changes;
- the canonical learner runtime remains `/app/`; and
- merge success is not equivalent to successful production deployment.

A future Content Operations UI is an operator surface over this production plane, not a second learner application.

## GitHub governance and release boundary

Governed implementation changes continue to use branches and PRs. Exact-head CI, review and explicit Founder merge approval remain independent from educational Foundation approval.

The Content Factory must never infer Founder approval from mergeability or successful CI.

Production release remains:

```text
governed PR
  → explicit Founder merge approval
  → exact-head merge
  → main CI
  → deployment
  → production smoke/path-to-live
```

Live Content Factory proof evidence supplements this release chain; it does not bypass it.

## Main-only live proof

The Slice 2B workflow deliberately uses `workflow_dispatch` and refuses execution unless the workflow runs from `refs/heads/main`.

This ordering is intentional:

1. implement and assure the runtime on a governed PR;
2. obtain explicit Founder merge approval;
3. production-verify the merged runtime;
4. run the paid real-course proof against that exact approved `main`;
5. retain the Foundation fingerprint, rights-registry fingerprint, provider provenance/cost and zero-learner-asset evidence.

The first proof is AQA A-level Business 7132 for the 2027 examination cohort. It is a new Foundation job, not the superseded historical pilot.

## Legacy implementation status

The repository still contains the previous end-to-end Content Factory modules, tests and pilot workflows. They are retained as implementation/history evidence and for selectively reusable controls while migration continues.

They are **not** the canonical Foundation architecture and must not be invoked as a shortcut from the new path.

In particular, the following are legacy topology rather than current Foundation prerequisites:

- old `ContentFactoryJob` whole-course state machine;
- old `generating` orchestration;
- learner-coupled coverage;
- combined Learn/Practice work-unit sequencing;
- old whole-course Q1–Q8 qualification / confirmation-pilot flow; and
- expert-review packaging that assumes learner assets already exist.

Historical ADRs and audit evidence remain intact; this current technical document reflects the active architecture rather than rewriting those historical records.

## Security and operational controls

- provider credentials are server/workflow secrets only, never learner-browser inputs;
- provider requests use bounded structured contracts and explicit spend ceilings;
- source-rights ambiguity fails closed;
- exact worker/model/cost provenance is recorded;
- live proof is manual/main-only rather than automatically spending on every merge;
- generated artifacts do not become learner content merely because a provider call succeeded; and
- no workflow may merge a governed PR automatically under current governance.

## Current implementation sequence

1. **Slice 1 — lifecycle:** released through PR #291.
2. **Slice 2A — compiler:** released through PR #292.
3. **Slice 2B — live runtime / real-course proof:** PR #293 in progress; proof runs after approved release.
4. **Slice 3 — Foundation assurance / approval.**
5. **Slice 4 — Learn Factory.**
6. **Slice 5 — Practice Factory.**
7. **Slice 6 — Exam Prep / Marking Factory.**
8. **Slice 7 — Content Operations presentation.**
9. **Slice 8 — staged repeatability qualification.**

See the Foundation-gated implementation plan for slice-level acceptance evidence and current status.