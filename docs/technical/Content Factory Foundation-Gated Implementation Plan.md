# Content Factory Foundation-Gated Implementation Plan

**Status:** Proposed target implementation plan  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decision:** `decisions/ADR-0020-content-factory-foundation-gate.md`  
**Related previous initiative:** GitHub Issue #169 (superseded end-to-end v2 programme)

## Purpose

Implement the new Content Factory as a staged production system where an exact course reaches an approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

This plan deliberately does not treat the existing v2 orchestrator as the structure to extend. The current `src/content-factory/` implementation is useful implementation evidence and a source of reusable components, but the new orchestration should be designed around the new authority first.

## Current implementation truth

The current v2 implementation on `main` remains an end-to-end course-build system. Its orchestration runs intake/knowledge modelling, then combined Learn + Practice generation, then assessment/marking generation, then assurance and expert-review packaging.

Its job lifecycle is built around one course job moving through generic states such as `mapped`, `generating`, `validating`, `independent_review` and `expert_review_ready`.

That implementation does not provide a separate approved-foundation gate before learner-asset generation.

The previous live programme also did not achieve a final real-course `expert_review_ready` pass. The new architecture therefore does not depend on proving or completing the old end-to-end confirmation-pilot sequence.

## Migration rule

Reuse a previous component only when all three are true:

1. its responsibility remains valid under the new authority;
2. its contract can be understood without importing the old end-to-end state machine; and
3. reuse is simpler and safer than implementing the same bounded responsibility cleanly.

If any of those conditions fail, implement a new boundary and port only the relevant lesson/control.

## Reusable implementation candidates

The following existing areas should be assessed for direct reuse or thin adaptation:

- source-rights classification and Source Licence Register construction;
- exact identity/cohort resolution;
- Board Alignment compilation;
- curriculum coverage compilation;
- Course Knowledge Model schema and validation;
- Assessment Blueprint schema/compiler;
- Question Family schema/compiler;
- deterministic arithmetic/cross-reference/coverage validation utilities;
- fresh-context independent-review contracts;
- artifact fingerprinting;
- dependency-aware invalidation/reuse utilities;
- worker provenance and cost telemetry; and
- candidate recovery utilities for high-variability generative boundaries.

Reuse should occur at function/schema/service boundaries, not by calling the old end-to-end orchestrator from the new one.

## Do not carry forward by default

Do not make these old structures prerequisites for the new process:

- the v2 whole-course state transition map;
- the single `generating` state;
- combined Learn/Practice work units;
- `continueContentFactoryToExpertReviewReady` as the normal entry point;
- old Q1–Q8 qualification sequencing;
- full-course confirmation-pilot eligibility as a prerequisite to Foundation work;
- old expert-review packaging that requires all Learn/Practice/assessment collateral to exist;
- checkpoint compatibility assumptions tied to the old whole-course topology.

Historical tests can remain as regression evidence for reusable utilities, but the new staged process needs its own tests and proof contracts.

## Target domain model

### Course Foundation candidate

A Foundation candidate contains references to the exact version of:

- course identity/cohort;
- Source Licence Register;
- Board Alignment;
- coverage model;
- Course Truth / Course Knowledge Model;
- Exam Truth / Assessment Blueprint;
- Question Families where applicable;
- deterministic assurance;
- independent review;
- expert review; and
- known limitations.

### Approved Course Foundation

The approved artifact adds:

- `foundationVersion`;
- `foundationFingerprint`;
- approval status;
- approval date;
- reviewer evidence/reference; and
- exact constituent artifact fingerprints.

The approved artifact is immutable. A changed dependency creates a new candidate/version.

### Asset job

An asset-production job is separate from the Foundation job and records at minimum:

- asset job ID;
- asset type: `learn`, `practice` or `exam_prep`;
- course identity;
- approved `foundationVersion` / `foundationFingerprint`;
- coverage obligations / knowledge-node scope;
- generated artifact refs;
- assurance status;
- remediation/provenance; and
- publication state where applicable.

## Target Foundation lifecycle

Keep the lifecycle small and responsibility-specific.

A practical target is:

`requested → identified → sourced → foundation_compiled → foundation_validating → foundation_independent_review → foundation_expert_review → foundation_approved`

Optional exception states:

- `foundation_remediation`;
- `blocked`.

The implementation may use more granular internal worker events, but those should not become operator-facing lifecycle states unless they represent a distinct decision or recovery boundary.

### Transition rules

`requested → identified`
- exact course/cohort resolved;
- unresolved learner/course options fail closed.

`identified → sourced`
- Source Licence Register complete;
- source rights approved for intended use.

`sourced → foundation_compiled`
- Board Alignment complete;
- coverage complete for declared scope;
- Course Truth complete;
- Exam Truth complete;
- all constituent artifacts tied to the current source/dependency fingerprints.

`foundation_compiled → foundation_validating`
- complete constituent artifact set exists.

`foundation_validating → foundation_independent_review`
- deterministic foundation assurance passes.

`foundation_independent_review → foundation_expert_review`
- no unresolved blocking/material independent-review finding remains.

`foundation_expert_review → foundation_approved`
- qualified reviewer approves the exact candidate version;
- known limitations are explicit;
- approved foundation fingerprint is frozen.

No asset-generation transition exists inside this lifecycle.

## Implementation slices

### Slice 1 — Foundation schema and state only

Goal: create the new domain boundary without generating content.

Implement:

- Foundation candidate/approved schemas;
- minimal Foundation lifecycle;
- constituent fingerprint calculation;
- explicit `foundation_approved` transition guard;
- unit tests for immutability/version changes;
- no provider calls;
- no learner asset generation;
- no dependency on old `expert_review_ready` state.

Success proof:

A synthetic/stored Foundation candidate can move through the lifecycle only when the required exact-version evidence is present, and a changed constituent fingerprint cannot masquerade as the approved version.

### Slice 2 — Foundation compilation

Goal: create Course Truth + Exam Truth through the new boundary.

Assess and port/reuse:

- identity resolution;
- source rights;
- Board Alignment;
- coverage;
- Course Knowledge Model;
- Assessment Blueprint;
- Question Families.

Do not call Learn, Practice or assessment-item generation.

Success proof:

A real governed course can reach `foundation_compiled` with complete Course Truth and Exam Truth without producing learner collateral.

### Slice 3 — Foundation assurance and approval

Goal: make `foundation_approved` a trustworthy gate.

Implement/port:

- foundation-specific deterministic validator;
- fresh-context independent foundation review;
- targeted foundation remediation;
- portable foundation expert-review contract/package;
- structured expert findings import or equivalent review evidence;
- final approved Foundation artifact.

Success proof:

One real course reaches `foundation_approved`, with the exact approved version and reviewer evidence retained, before any learner asset is generated.

This is the first major milestone of the new Content Factory.

### Slice 4 — Learn Factory

Goal: produce learner teaching assets from an approved Foundation.

Implement:

- Learn asset planning by canonical Course Truth nodes;
- coverage-driven generation;
- deterministic content/coverage checks;
- independent A2 educational review;
- targeted remediation;
- foundation fingerprint linkage.

Success proof:

Learn can be regenerated or changed without changing the approved Foundation when Course Truth is unchanged.

### Slice 5 — Practice Factory

Goal: produce valid evidence-generating Practice assets from an approved Foundation.

Implement:

- node-level valid-evidence mappings;
- format capability constraints;
- coverage/variation planning without fixed universal quotas;
- flashcard/retrieval/quiz/application/calculation/topic-test production as appropriate;
- answer/explanation contracts;
- assurance and remediation;
- learner-evidence metadata compatible with Exam Readiness governance.

Success proof:

A course can achieve complete Practice obligations through the set of formats educationally appropriate to its nodes, without requiring every format to test every skill.

### Slice 6 — Exam Prep Factory

Goal: produce assessment-authentic assets from approved Course Truth + Exam Truth.

Implement:

- exam-technique assets;
- assessment-item production by Question Family;
- timed sections;
- mock/simulation assembly;
- Marking Packs;
- stronger A3/A4 deterministic and independent assurance;
- representative whole-paper checks for trusted mocks;
- foundation fingerprint linkage.

Candidate recovery from ADR-0019 should be reused at Assessment/Marking boundaries if it remains the simplest robust mechanism.

Success proof:

Exam Prep assets can be regenerated/calibrated without modifying Course Truth/Exam Truth unless assurance reveals a genuine Foundation defect.

### Slice 7 — Content Operations presentation

Goal: make the staged model obvious to an operator.

Minimum view:

```text
Foundation
Course Truth     APPROVED
Exam Truth       APPROVED
Foundation       APPROVED v1.0

Assets
Learn            assured
Practice         generating
Exam Prep        not started
```

Internal retries/candidates/checkpoint details remain available for diagnostics but are not the primary operator journey.

### Slice 8 — Repeatability qualification

The new system needs a new staged qualification model rather than inheriting old Q1–Q8 whole-course gates.

Qualification should prove separately:

- Foundation reliability across materially different course shapes;
- Learn production reliability;
- Practice production reliability;
- Exam Prep/Marking reliability;
- dependency-aware invalidation;
- restart/reuse and cost controls; and
- fail-closed behaviour.

Only after each stage is reliable should routine multi-course/batch production be considered.

## First real-course proof

The first real implementation proof should use a course where Revision already has useful source/assessment learnings, but it must not be treated as a requirement to preserve the old pilot job.

AQA Business may be a sensible validation course because earlier work exposed many useful failure classes. The new Foundation should be built as a **new Foundation job/version**, not by resuming the old end-to-end Issue #281 job.

The proof criterion is not “finish Pilot #21.” It is:

> Can Revision establish complete Course Truth and Exam Truth, assure them independently, obtain qualified approval of the exact version, and freeze an Approved Course Foundation before generating assets?

## Assurance approach

For every slice:

- schema/unit tests for lifecycle and invariants;
- deterministic validator tests including simultaneous defects where relevant;
- dependency invalidation tests;
- no cross-stage hidden mutation of approved Foundation artifacts;
- explicit provider-call/cost boundaries;
- independent-review context separation;
- historical defect regressions only where they exercise a retained component; and
- exact-head CI before governed merge.

Do not port the complete historical reliability corpus into every new stage. Carry forward only defects relevant to a reused boundary.

## Cost approach

The new process should reduce wasted generation cost by moving the expensive asset factories after Foundation approval.

Track cost independently for:

- Foundation compilation;
- Foundation assurance;
- Learn;
- Practice;
- Exam Prep/Marking.

This allows Revision to understand the marginal cost of adding or refreshing each asset class without rebuilding the full course.

Existing per-course and provider spend guardrails remain relevant until deliberately replaced, but old paid-pilot eligibility mechanics are not the new production lifecycle.

## Documentation migration

As implementation lands:

- update `docs/technical/Content Factory Architecture.md` to describe the new target/current state;
- retain old pilot/remediation documents as history;
- mark old end-to-end implementation documents as legacy/superseded when they no longer describe current runtime;
- update Content Operations technical documentation when the operator surface changes;
- update reliability authority with a staged replacement before routine paid/batch production; and
- update `INDEX.md` as current implementation ownership changes.

## Immediate next implementation PR

After the governing authority/ADR is merged and the new initiative has explicit Definition-of-Ready approval, the first code PR should be **Slice 1 only: Foundation schema, fingerprint and lifecycle**.

It should not include Learn, Practice, Exam Prep, provider integration, Admin UI or migration of the old v2 orchestrator.