# Content Factory Foundation Compilation Implementation

**Status:** Slice 2A released through PR #292; Slice 2B live runtime in progress via PR #293  
**Governing authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Source-rights authority:** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Record the current technical implementation of Foundation compilation: the bounded process that turns an exact governed course request into a complete `FoundationCandidate` containing Course Truth and Exam Truth before Foundation assurance or any learner-facing asset generation begins.

This document describes implementation truth. It does not change product or governance authority.

## Canonical Foundation runtime boundary

The current Foundation path is deliberately separate from the legacy end-to-end Content Factory topology.

Core runtime:

- `src/content-factory/foundation-schema.ts` — Foundation Candidate / Approved Course Foundation contracts;
- `src/content-factory/foundation-lifecycle.ts` — `requested → compiling → assuring → expert_review → foundation_approved` lifecycle;
- `src/content-factory/foundation-compilation.ts` — provider-neutral compilation contracts, deterministic reconciliation and candidate assembly;
- `src/content-factory/foundation-source-rights-registry.ts` — governed reusable source-rights rule set and main-only trust boundary;
- `src/content-factory/foundation-live-adapter.ts` — Foundation-native live source/profile/provider adapter;
- `src/content-factory/foundation-compilation.test.ts` and `src/content-factory/foundation-live-adapter.test.ts` — provider-free regression assurance; and
- `.github/workflows/content-factory-foundation-live-proof.yml` plus `foundation-live-proof.integration.test.ts` — main-only real-course proof path.

The legacy `ContentFactoryJob`, `orchestrator.ts`, `runIntakeToKnowledgeModel`, Learn/Practice work units and old assessment-generation sequence are not runtime dependencies of the Foundation compiler or Slice 2B live adapter.

## Compilation sequence

Within the single operator lifecycle state `compiling`, the compiler performs:

```text
exact request
  → identity/cohort resolution
  → source discovery + current-source preflight
  → governed source-rights rule loading
  → deterministic source-rights classification
  → controlled structured evidence
  → Board Alignment
  → Foundation coverage model
  → Course Truth / Course Knowledge Model
  → Exam Truth / Assessment Blueprint
  → Question Families where required
  → complete Foundation Candidate
```

The result remains in `compiling`. Deterministic Foundation assurance and independent review remain `pending`; Slice 3 owns those controls.

## Foundation coverage replacement

The legacy `coverageMapSchema` is intentionally not reused because it requires learner-content references before a requirement can be marked complete.

`foundationCoverageModelSchema` instead requires each governed curriculum requirement to preserve its official reference, summary, knowledge/skill description, component scope, revision area and exact permitted source references, then map to one or more canonical `knowledgeNodeIds` with `coverageStatus: complete`.

Completeness means **the Foundation has a complete governed requirement-to-Course-Truth contract**. It does not mean Learn, Practice or Exam Prep assets exist, and it is not equivalent to qualified educational approval.

## Fail-closed reconciliation

The compiler rejects a candidate when any of these conditions occur:

- course options remain unresolved;
- a source has no unique approved rights rule or is prohibited;
- curriculum evidence relies on a source without permitted derived-use rights;
- Board Alignment identity/cohort/components do not match the resolved course;
- a resolved component contract drifts;
- Board Alignment evidence is not verified;
- Foundation coverage omits, adds or mutates a governed curriculum requirement;
- Foundation coverage uses unknown components or disallowed sources;
- Course Truth does not contain the exact canonical node set established by Foundation coverage;
- a Course Truth node lacks valid Board Alignment relevance or governed source trace;
- Exam Truth is not bound to the exact Board Alignment and Course Truth fingerprints;
- Exam Truth does not preserve the exact governed component, objective and assessment-requirement sets;
- governed marks, timing, objective weighting, assessment-requirement summary or component scope drift; or
- Question Family IDs, component scope, objective references or mark ranges conflict with Exam Truth.

Provider-supplied Board Alignment and Course Truth fingerprint strings are not trusted. The compiler recalculates durable fingerprints from validated canonical content.

## Artifact boundary

Foundation compilation permits only:

- `source_licence_register`;
- `board_alignment`;
- `foundation_coverage_model`;
- `course_knowledge_model`;
- `assessment_blueprint`; and
- `question_family`.

There is deliberately no Foundation-compilation artifact type for Learn, Practice, assessment items, mocks or Marking Packs. The resulting candidate stores exact ref/fingerprint pairs and source-set/implementation provenance.

## Slice 2B live-provider boundary

Slice 2B selectively reuses `OpenAIStructuredWorkerClient`, the existing low-level Responses API transport. It retains structured JSON-schema output, `store: false`, fresh run/context identity, retries, bounded spend and provider/model/cost provenance.

The old `createOpenAIModelAssistedWorkers` factory is not reused because it is coupled to the retired Learn/Practice/assessment pipeline.

The first live profile is **AQA A-level Business 7132 for the 2027 examination cohort**. It is a new Foundation job and does not resume superseded Issue #281.

Responsibilities are deliberately split:

- exact course/cohort identity — controlled governed profile plus live source preflight;
- source discovery — controlled list plus runtime availability/licence-marker checks;
- Board Alignment — controlled structured facts;
- Foundation coverage — deterministic mapping of the governed requirement set;
- Course Truth — bounded live model synthesis from permitted curriculum inputs, with source/alignment references attached deterministically;
- Exam Truth — bounded live model enrichment from structured Board Alignment + Course Truth, while components/objectives/requirements remain deterministic; and
- Question Families — bounded live model generation reconciled by the released compiler.

No live provider worker receives copied AQA specification prose.

## Source-rights policy trust boundary

`sourceRightsRules` is a control-plane input, never an AI legal judgement.

`FOUNDATION_SOURCE_RIGHTS_REGISTRY` is a versioned proposed reusable rule set while PR #293 is unmerged. It cannot authorise a live Foundation job from the feature branch. `loadGovernedFoundationSourceRightsRules()` rejects any execution not running from `refs/heads/main` in `lhanson-dev/revision` and requires an exact commit SHA.

If PR #293 is Founder-approved and merged, the exact registry version on governed `main` becomes the reusable approved policy-rule implementation for this runtime. The live job still revalidates required external source/licence markers before applying the rules; a missing/changed marker fails closed.

Current rules conservatively classify:

- DfE GOV.UK Business subject content — `OPEN`, subject to Open Government Licence revalidation;
- Ofqual GOV.UK Business assessment objectives — `OPEN`, subject to Open Government Licence revalidation;
- LibreTexts Business Fundamentals — `OPEN`, subject to CC BY 4.0 / terms revalidation; and
- AQA specification/assessment/subject-content material — `REFERENCE_ONLY` unless broader rights are separately recorded.

AQA `REFERENCE_ONLY` material may inform controlled Board Alignment facts. It is not passed as source text to generative workers and does not become reusable curriculum truth by paraphrasing.

The durable live-proof evidence records the registry fingerprint, exact approved-main SHA and authority reference used for the run.

## Real-course proof boundary

`.github/workflows/content-factory-foundation-live-proof.yml` is deliberately `workflow_dispatch` and main-only. It cannot run the paid live proof from PR #293.

After the implementation is Founder-approved, merged and production-verified, the workflow may execute one new AQA A-level Business 7132 Foundation job against that exact approved `main`. The proof must retain:

- exact `main` SHA;
- exact registry fingerprint / authority evidence;
- Foundation job and candidate IDs;
- aggregate Foundation fingerprint;
- worker provenance and provider spend;
- Foundation artifact ledger;
- Course Truth and Exam Truth compiler-completeness status; and
- learner-facing artifact count.

Success for Slice 2B requires a compiler-complete Foundation Candidate with Course Truth + Exam Truth and **zero learner-facing assets**. It does not claim educational assurance, expert approval or `foundation_approved`.

## First-proof limitations

The AQA 7132 profile uses a deliberately bounded governed requirement set derived from permitted subject-truth sources plus controlled awarding-body alignment facts. Compiler completeness therefore means completeness against that exact governed set.

Whether the resulting Foundation is sufficiently complete, accurate and assessment-authentic for product use is a Slice 3 assurance question. The real-course proof must not be described as an approved course, approved curriculum or learner-ready content.

## Selective reuse decision

Retained where useful:

- Source Licence Register shapes and source-rights semantics;
- exact identity/cohort and Board Alignment schemas;
- Course Knowledge Model, Assessment Blueprint and Question Family concepts;
- deterministic fingerprinting and cross-reference validation;
- OpenAI structured-provider transport; and
- worker provenance/cost telemetry.

Not retained:

- old end-to-end orchestration sequence/state machine;
- learner-coupled coverage;
- Learn/Practice generation topology;
- assessment-item / Marking Pack sequencing; or
- old pilot qualification ceremony.

## Assurance

Slice 2A provider-free assurance was released through PR #292. Slice 2B regressions additionally prove that:

- the rights registry cannot clear a feature-branch live job;
- AQA is classified `REFERENCE_ONLY` under the proposed registry;
- a Foundation-native provider boundary can compile the real-course profile to a candidate without invoking legacy learner factories;
- source-preflight failure stops before provider execution or artifact writes; and
- the artifact ledger contains zero learner-facing asset types.

The paid real-course execution is intentionally deferred until the implementation and rights registry are on Founder-approved `main`.

## Documentation impact

No normative authority change is introduced by Slice 2B. The implementation operationalises the Foundation Production Model and Educational Content Source Licensing and Provenance Standard.

`docs/technical/Content Factory Architecture.md` is updated in the same governed change because Slice 2B establishes the new live Foundation provider/runtime path and the previous document still described legacy orchestration as the current implementation.

`INDEX.md` remains unchanged: the already-indexed Foundation-gated implementation plan remains the implementation owner; this document is subordinate implementation truth.

## Next increment

After the live real-course proof succeeds and its evidence is retained, Slice 2 is complete. Slice 3 then adds Foundation-specific deterministic assurance, fresh-context independent review/remediation, qualified expert review and immutable Approved Course Foundation persistence. No learner asset factory starts before that approval gate is proven.