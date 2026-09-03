# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — authority approved via PR #290; Issue #289 In Progress  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Source-rights authority:** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Current increment:** Slice 3B fresh-context independent Foundation review + targeted remediation + deterministic re-assurance — PR #298

## Purpose

Implement the Content Factory as a staged production system where an exact course reaches an immutable Approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

The governing sequence is:

`course request → Course Truth + Exam Truth → deterministic assurance → independent review/remediation → qualified expert approval → Approved Course Foundation → learner asset factories`

The historical v2 factory remains implementation evidence and a source of reusable controls. It is not the orchestration shape to extend.

## Canonical implementation truth

The current Foundation runtime is separate from the legacy `ContentFactoryJob` topology.

Released implementation includes:

- `foundation-schema.ts` — Foundation Candidate / Approved Course Foundation contracts;
- `foundation-lifecycle.ts` — small Foundation lifecycle, exact-fingerprint assurance binding, approval gate and version-lineage invariants;
- `foundation-compilation.ts` — provider-neutral Foundation compilation and deterministic reconciliation;
- `foundation-source-rights-registry.ts` — governed-main reusable source-rights rules;
- `foundation-live-adapter.ts` — Foundation-native live source/profile/provider workers;
- `foundation-live-proof.integration.test.ts` — real-course live proof harness;
- `.github/workflows/content-factory-foundation-live-proof.yml` — main-only bounded paid proof workflow;
- `foundation-assurance.ts` — Foundation-specific deterministic assurance; and
- `foundation-assurance.test.ts` — exact-fingerprint, multi-defect and lifecycle-gate deterministic regression assurance.

Slice 3B adds through PR #298:

- `foundation-independent-review.ts` — Foundation-native independent review, fail-closed context separation, targeted remediation and deterministic re-assurance loop;
- `foundation-independent-review.test.ts` — high-risk review/remediation boundary regressions; and
- non-material Foundation provenance fields for retained generation/review/remediation context IDs.

The legacy orchestrator, old whole-course assurance factory and old worker factories remain in the repository during migration but are not canonical Foundation runtime dependencies.

## Migration rule

Reuse a previous component only when all three are true:

1. its responsibility remains valid under the new Foundation-first authority;
2. its contract can be used without importing the old end-to-end state machine; and
3. reuse is simpler and safer than implementing the bounded responsibility cleanly.

Proven controls may be ported without preserving obsolete topology. Complete deterministic diagnostics, fresh-context review separation, targeted remediation, durable fingerprints, provenance and cost telemetry remain useful. The old combined Learn/Practice/assessment assurance package does not define the new Foundation assurance boundary.

## Foundation domain model

A Foundation Candidate is the complete pre-approval dependency set for an exact course. It records:

- exact course/cohort;
- Source Licence Register;
- Board Alignment;
- Foundation coverage;
- Course Truth;
- Exam Truth;
- Question Families;
- assurance/review status;
- blockers/limitations; and
- provenance.

Operational context provenance (`generationContextIds`, `assuranceContextIds`) is retained so fresh-context separation remains provable after persistence/resume. These IDs do not form part of material educational identity and therefore do not enter the aggregate Foundation fingerprint.

A Foundation Candidate contains no Learn, Practice, Exam Prep, mock or Marking Pack requirement.

An Approved Course Foundation adds stable Foundation identity/version, the deterministic aggregate Foundation fingerprint, the exact embedded candidate, qualified reviewer/approver evidence and known limitations. An approved record is immutable; changed material Foundation truth requires a new candidate/fingerprint and newer version.

## Foundation lifecycle

The canonical lifecycle remains intentionally small:

`requested → compiling → assuring → expert_review → foundation_approved`

Exception states:

- `blocked` — operational interruption, resumable to the exact prior working stage after blockers resolve;
- `superseded` — terminal record for a replaced candidate/version.

Identity, rights, Board Alignment, coverage, Course Truth and Exam Truth are activities within `compiling`.

Deterministic assurance, independent review and bounded remediation are activities within `assuring`.

Qualified human review occurs in `expert_review`.

No learner-asset generation transition exists inside this lifecycle.

## Foundation fingerprint/version invariant

The aggregate Foundation fingerprint is deterministic SHA-256 over material educational/assessment dependency identity:

- exact course/cohort;
- Source Licence Register fingerprint;
- Board Alignment fingerprint;
- Foundation coverage fingerprint;
- Course Truth fingerprint;
- Exam Truth fingerprint;
- Question Family fingerprints; and
- source-set fingerprint.

Artifact storage refs, review timestamps, assurance evidence refs and worker context IDs do not define educational identity.

For the same `foundationId`:

- same material fingerprint → same `foundationVersion`;
- changed material fingerprint → newer version.

Source-rights revalidation timestamps remain audit metadata; a timestamp-only recheck does not create a new Foundation identity.

## Completed Slice 1 — Foundation schema and lifecycle

**Released through PR #291.**

Implemented Foundation Candidate / Approved Course Foundation schemas, the small lifecycle, blocker/resume behaviour, aggregate Foundation fingerprint, exact-fingerprint assurance binding, approval guard, mandatory version lineage and immutable approved-record integrity.

## Completed Slice 2A — Foundation compilation core

**Released and production-verified through PR #292 / `60269b9d96d6cce75f5decde30a727301f446d03`.**

Implemented Foundation-native identity/source/evidence worker contracts, deterministic source-rights classification, Board Alignment validation/fingerprinting, Foundation-specific coverage, Course Truth reconciliation, Exam Truth binding, Question Family reconciliation and provider-free proof with zero learner assets.

## Completed Slice 2B — live adapter and real-course proof

**Released through PR #293, repaired through PR #294, and successfully proved on `main`.**

Foundation Live Proof #2 / workflow run `33802600001` completed successfully on approved `main` commit `b7f5ec6f699715b41e341659e4c79e0b40c79e94` for **AQA A-level Business 7132 — 2027 cohort**.

Retained evidence established compiler-complete Course Truth and Exam Truth, governed source-rights evidence, three live OpenAI worker runs, conservative provider spend `$0.0824 / $12.00`, learner-facing assets generated `0`, and deterministic/independent assurance correctly pending.

The successful proof establishes the live Foundation compilation boundary only. It is not a claim of qualified-human curriculum completeness or Foundation approval.

## Slice 3 — Foundation assurance and approval

Goal: make the Foundation approval gate operationally trustworthy and prove one real course reaches `foundation_approved` before any learner asset is generated.

Slice 3 is deliberately decomposed into short governed increments.

### Completed Slice 3A — deterministic Foundation assurance

**Implementation released through PR #295; retained real-course proof released through PR #296.**

The Foundation-native deterministic assurance engine re-reads the exact persisted Foundation Candidate dependency set and checks artifact readability/fingerprints, source-rights safety, exact identity/cohort/alignment, Foundation coverage, Course Truth traceability, Exam Truth binding and Question Family validity.

It retains complete deterministic diagnostics and persists a `foundation_deterministic_assurance_report` bound to exact job/candidate, reviewed commit and aggregate Foundation fingerprint.

The retained AQA Business Foundation subsequently passed deterministic assurance on approved `main` with 18 checks, zero failures and zero learner assets.

Detailed implementation record: `docs/technical/Content Factory Foundation Assurance Implementation.md`.

### Current Slice 3B — fresh-context independent Foundation review and remediation

**Implementation: PR #298. Operational real-course proof follows only after release to approved `main`.**

Implement and prove:

- a Foundation-specific independent-review contract;
- exact deterministic PASS for the current Foundation fingerprint and review implementation commit before AI review;
- fresh review context not used by Foundation generation, previous independent review or remediation;
- durable context provenance that survives persistence/resume without changing Foundation identity;
- structured findings with blocking/material/minor/no-issue severity;
- review evidence bound to exact Foundation fingerprint and deterministic report;
- independent educational/assessment challenge rather than repetition of deterministic structure checks;
- minor findings retained as explicit limitations;
- smallest-safe remediation scope;
- fail-closed handling for Source Rights, Board Alignment or Foundation coverage findings that require upstream re-compilation;
- new candidate/fingerprint where material Course Truth / Exam Truth / Question Family truth changes;
- deterministic re-assurance after every material correction;
- a new fresh independent review after deterministic re-assurance; and
- a bounded remediation cycle limit rather than indefinite AI self-repair.

Dependency closure is explicit:

- Course Truth material finding → Course Truth + dependent Exam Truth + all Question Families;
- Exam Truth material finding → Exam Truth + all Question Families;
- Question Family material finding → affected family only;
- Source Rights / Board Alignment / Foundation coverage material finding → block and reopen governed Foundation compilation.

A remediation worker may not arbitrarily change canonical coverage node identity, course/job identity or upstream Board Alignment. Dependency fingerprints are compiler-owned and recomputed mechanically rather than copied from model output.

PR #298 provides deterministic regression assurance for context contamination, minor limitation handling, dependency-closure remediation, new-fingerprint creation, deterministic re-assurance, fresh re-review and upstream fail-closed behaviour.

After PR #298 is released, the retained AQA Business Foundation must be run through this exact released boundary. A real provider review PASS or retained remediation/re-assurance/re-review chain is required before Slice 3C starts.

### Slice 3C — qualified expert review and immutable approval

Implement:

- qualified subject/assessment expert-review package/contract;
- structured expert findings and evidence;
- exact reviewer/approver identity and timestamps;
- explicit known limitations;
- version-lineage validation; and
- durable immutable Approved Course Foundation persistence.

Success proof for Slice 3: the real AQA Business Foundation reaches `foundation_approved` on an exact assured/reviewed version while learner-facing asset count remains zero.

A second AI review is not expert approval. Slice 3C remains a separate human qualification gate even if Slice 3B passes cleanly.

## Subsequent implementation sequence

### Slice 4 — Learn Factory

Generate and assure teaching assets from approved Course Truth. Every Learn asset carries the approved Foundation fingerprint/version.

### Slice 5 — Practice Factory

Generate coverage-driven Practice assets against canonical knowledge/skill nodes and valid learner-evidence mappings, without universal quantity quotas or mandatory completion lanes.

### Slice 6 — Exam Prep Factory

Generate assessment-authentic technique, questions, timed work, mocks/simulations and Marking Packs from approved Course Truth + Exam Truth. Representative full mocks receive higher assurance.

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

## Documentation maintenance

As implementation lands:

- maintain this plan as the staged implementation owner;
- keep Foundation lifecycle, compilation and assurance implementation records aligned;
- keep `docs/technical/Content Factory Architecture.md` aligned to the current Foundation runtime rather than legacy orchestration;
- retain pilot/remediation records as history;
- update Content Operations documentation only when that surface changes; and
- update `INDEX.md` when implementation ownership or discoverability materially changes.

## Operational completion condition for Slice 3B

PR #298 establishes the provider-neutral independent-review/remediation control boundary and regression assurance. Slice 3B is operationally complete only after that implementation is released to approved `main` and the retained real-course AQA Business Foundation is processed through:

1. deterministic PASS bound to the exact current implementation commit and Foundation fingerprint;
2. a provider review context proven distinct from retained generation/review/remediation contexts;
3. retained structured review evidence;
4. if required, smallest-safe material remediation creating a new candidate/fingerprint;
5. deterministic re-assurance of the remediated candidate; and
6. another fresh independent review of the exact remediated fingerprint.

Only an exact Foundation version with deterministic PASS and independent-review PASS may progress to Slice 3C qualified expert review.
