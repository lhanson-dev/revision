# Content Factory Architecture

**Status:** Foundation-gated architecture active; deterministic Foundation assurance released; independent review/remediation in PR #298  
**Normative workflow:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Implementation owner:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the current technical architecture for Revision content production while preserving the canonical learner application boundary.

The Content Factory is a separate production plane upstream of learner publication. Its architecture is **Foundation-first**: establish Course Truth and Exam Truth, assure and approve that exact Foundation, then manufacture learner-facing assets from the approved version.

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
      deterministic re-assurance
      fresh independent re-review
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

The aggregate Foundation fingerprint identifies material educational/assessment dependencies, not storage locations, review timestamps, evidence refs or worker context IDs. A material truth change requires a new Foundation fingerprint/version.

Foundation provenance additionally retains generation and assurance context IDs so fresh-context independence remains provable after persistence/resume without changing educational identity.

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

The Foundation live path uses:

- `foundation-source-rights-registry.ts` — reusable rights-policy registry with an approved-main trust boundary;
- `foundation-live-adapter.ts` — source preflight, governed real-course profile and Foundation-native provider workers;
- `OpenAIStructuredWorkerClient` — selectively reused low-level structured Responses API transport; and
- `content-factory-foundation-live-proof.yml` — main-only manual live proof.

The low-level provider client is reusable because it already provides bounded structured output, fresh run/context identity, `store: false`, retries, cost accounting and spend ceilings without importing legacy orchestration.

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

A feature branch cannot authorise its own live source rules. The loader requires approved-main source-rights authority for paid proof.

Awarding-body source prose classified `REFERENCE_ONLY` is not passed into generative or independent-review context. Controlled structured facts may support Board Alignment where the licensing standard permits that use.

## Worker architecture

### Compilation workers

`FoundationCompilationWorkers` is the canonical compilation worker interface. Each material worker execution records worker/stage identity, context identity where provider-backed, contract version, provider/model, retry count, usage/cost and input/output references.

The compiler, not the model, owns final schema/cross-reference acceptance.

For the AQA Business Foundation proof:

- identity/cohort — deterministic controlled profile plus live source preflight;
- source discovery — deterministic controlled source set plus live availability/licence-marker checks;
- Board Alignment — controlled structured evidence;
- Foundation coverage — deterministic;
- Course Truth — bounded model synthesis from permitted curriculum inputs;
- Exam Truth enrichment — bounded model synthesis while governed components/objectives/requirements remain deterministic; and
- Question Families — bounded model generation plus compiler reconciliation.

### Independent-review/remediation workers

`foundation-independent-review.ts` adds the provider-neutral Slice 3B worker boundary.

An independent-review run is accepted only when its returned context ID is not present in retained generation/review/remediation provenance. Worker-name separation alone is insufficient.

Review is bound to the exact Foundation fingerprint, deterministic assurance report and implementation commit. The reviewer receives rights-safe structured source metadata plus the exact Foundation artifacts; it is not authorised to browse or reconstruct protected awarding-body prose.

Material remediation is constrained to a deterministic dependency closure:

```text
Course Truth finding
  → Course Truth
  → Exam Truth
  → all Question Families

Exam Truth finding
  → Exam Truth
  → all Question Families

Question Family finding
  → affected Question Family

Source Rights / Board Alignment / Foundation coverage finding
  → BLOCK
  → reopen governed Foundation compilation
```

The remediation worker cannot redefine canonical upstream truth. The runtime owns replacement refs/fingerprints, creates a new candidate when material truth changes, resets assurance/review evidence and deterministically re-assures before another fresh independent review.

## Artifact and persistence architecture

Foundation stores are replaceable contracts. Artifact storage refs remain auditable but do not define aggregate Foundation identity.

Live proof artifacts and candidates are retained as workflow evidence. A later operational persistence adapter may move these artifacts to a durable production store without changing Foundation identity semantics.

GitHub Issue #289 remains the programme-level operational record for the current staged proof. Operational records are evidence only; they cannot override content authority, source-rights rules, assurance or Founder approval.

Slice 3B additionally persists:

- `foundation_independent_review_report` — exact fingerprint/commit/reviewer provenance and machine-readable findings; and
- `foundation_remediation_record` — source/remediated candidate fingerprints, corrected dependency refs, worker provenance, resolution notes and deterministic re-assurance evidence.

Historical review/remediation evidence remains immutable even after a new candidate supersedes its result.

## Foundation assurance boundary

### Deterministic assurance — Slice 3A

`foundation-assurance.ts` re-reads the exact persisted Candidate dependencies and checks artifact identity, source rights, alignment, coverage, Course Truth, Exam Truth and Question Family relationships. It retains complete deterministic diagnostics and binds PASS/FAIL to an exact Foundation fingerprint and reviewed commit.

The retained AQA A-level Business 7132 / 2027 Foundation passed this boundary on approved `main` with zero learner assets.

### Independent review and remediation — Slice 3B

`foundation-independent-review.ts` ensures deterministic PASS exists for the exact current fingerprint/implementation commit before review. It then enforces fresh-context independent educational/assessment review, machine-readable severity, bounded remediation, new-fingerprint invalidation and deterministic re-assurance.

Minor findings are retained as known limitations. Blocking/material findings may not be waved through. Repeated self-repair is bounded; unresolved findings ultimately block rather than lowering the threshold.

A model review is independent assurance evidence, not qualified-human approval.

### Qualified approval — Slice 3C

Slice 3C owns qualified subject/assessment expert-review evidence and immutable Approved Course Foundation persistence. It begins only after the exact Foundation version has deterministic PASS and independent-review PASS.

A live provider run, compiler-complete candidate or AI-review PASS is not an approved course and is not sufficient for learner publication.

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

Governed implementation changes use branches and PRs. Exact-head CI, review and explicit Founder merge approval remain independent from educational Foundation approval.

The Content Factory must never infer Founder approval from mergeability or successful CI.

Production release remains:

```text
governed PR
  → explicit Founder merge approval
  → exact-head merge
  → main CI
  → deployment / production verification where applicable
```

Main-only paid Content Factory proof follows release because provider spend and source-rights authority must run from approved `main`. Proof evidence supplements the release chain; it does not bypass it.

## Legacy implementation status

The repository still contains the previous end-to-end Content Factory modules, tests and pilot workflows. They are retained as implementation/history evidence and for selectively reusable controls while migration continues.

They are **not** the canonical Foundation architecture and must not be invoked as a shortcut from the new path.

Legacy topology includes:

- old `ContentFactoryJob` whole-course state machine;
- old `generating` orchestration;
- learner-coupled coverage;
- combined Learn/Practice work-unit sequencing;
- old whole-course Q1–Q8 qualification / confirmation-pilot flow; and
- expert-review packaging that assumes learner assets already exist.

Historical ADRs and audit evidence remain intact; this current technical document reflects active architecture rather than rewriting historical records.

## Security and operational controls

- provider credentials are server/workflow secrets only, never learner-browser inputs;
- provider requests use bounded structured contracts and explicit spend ceilings;
- source-rights ambiguity fails closed;
- protected `REFERENCE_ONLY` prose is not passed to generative/review workers merely because it is visible to a human operator;
- exact worker/model/cost/context provenance is recorded;
- context reuse across generation/review/remediation fails closed;
- material remediation must change the material Foundation fingerprint;
- deterministic re-assurance is mandatory after material correction;
- live proof is manual/main-only rather than automatically spending on every merge;
- generated artifacts do not become learner content merely because a provider call or AI review succeeded; and
- no workflow may merge a governed PR automatically under current governance.

## Current implementation sequence

1. **Slice 1 — lifecycle:** released through PR #291.
2. **Slice 2A — compiler:** released through PR #292.
3. **Slice 2B — live runtime / real-course proof:** released through PR #293/#294; proof successful.
4. **Slice 3A — deterministic Foundation assurance:** released through PR #295/#296; retained AQA Business proof passed.
5. **Slice 3B — independent review/remediation:** implementation in PR #298; main-only retained real-course proof follows release.
6. **Slice 3C — qualified expert review / immutable Foundation approval.**
7. **Slice 4 — Learn Factory.**
8. **Slice 5 — Practice Factory.**
9. **Slice 6 — Exam Prep / Marking Factory.**
10. **Slice 7 — Content Operations presentation.**
11. **Slice 8 — staged repeatability qualification.**

See the Foundation-gated implementation plan for slice-level acceptance evidence and current status.
