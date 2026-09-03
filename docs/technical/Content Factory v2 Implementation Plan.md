# Content Factory v2 Implementation Plan

**Status:** Proposed implementation plan — implementation must not begin until Founder-approved `Ready`  
**Related initiative:** GitHub Issue #169  
**Normative authority:** `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md` and `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`

## Purpose

Define the technical path from the existing Content Factory v0.1 foundation to a repeatable, restartable course-production system that takes one exact course request to `expert_review_ready` with minimal human intervention.

This document describes implementation truth/plan. It does not override normative source, educational, assessment or approval authority.

## Canonical runtime and boundaries

The existing product/runtime boundaries remain:

- canonical application runtime: `/app/`;
- Founder entry point: role-gated Admin / Content Operations within the canonical app;
- privileged course-job creation: trusted server-side Supabase boundary with database-backed admin revalidation;
- durable v0.x operational job state: one GitHub Issue per course job;
- canonical learner content/evidence: governed repository files and PR history;
- learner catalogue: existing validated `content/**/index.ts` architecture;
- merge: never automated under current governance;
- qualified expert review: external/portable initially, with structured import of findings.

Content Factory workers remain upstream production-plane services and must not become a second learner runtime.

## Technical outcome

The target execution path is:

```text
Admin: Add Course
  ↓
Durable course job
  ↓
Identity resolution
  ↓
Source discovery + Source Licence Register
  ↓
Board Alignment + coverage map
  ↓
Course Knowledge Model (Course Truth)
  ↓
Assessment Blueprint + Question Families (Exam Truth)
  ↓
Learning Blueprint
  ↓
Learn + Practice work units
  ↓
Exam Prep questions + timed sets + representative mocks
  ↓
Marking Packs
  ↓
Learner-evidence mapping
  ↓
Deterministic validators
  ↓
Independent fresh-context review
  ↓
Targeted remediation / revalidation
  ↓
Expert Review Contract + portable package
  ↓
expert_review_ready
```

The key sequencing invariant is that **Course Truth and Exam Truth are established before high-volume learner collateral generation**. Generated mocks/questions must never become the authority from which curriculum teaching scope is inferred.

## Durable artifact contracts

Add or maintain versioned schemas under `src/content-factory/` for at least:

### `SourceLicenceRecord`

Structured source identity, role, version, use class, permission basis, AI-input permission, derived-use permission, attribution/restrictions and revalidation metadata.

### `BoardAlignment`

Structured course/spec/component facts with source references and verification status. It must not require copied awarding-body prose to flow into generation.

### `CourseKnowledgeModel`

Stable concept/skill nodes, relationships, misconceptions, formulas, application contexts, source/alignment references and valid evidence types. This is the operational Course Truth.

### `AssessmentBlueprint`

Assessment objective/skill model, component structure, question families, mark/timing constraints, quantitative/synoptic requirements and other generation constraints. Together with validated Question Families, this is the operational Exam Truth.

### `QuestionFamily`

Reusable assessment archetype with skill/AO profile, response demands, constraints and compatible Marking Pack template.

### `LearningBlueprint`

Requirement/cluster → deliberately selected Learn, Practice and Exam Prep modes plus work-unit plan. It must carry enough coverage/evidence metadata to prove that asset quantity is derived from curriculum and assessment need rather than fixed quotas.

### `LearnerEvidenceMap`

For every scored Practice and Exam Prep asset, record:

```text
asset_id
section
activity_type
knowledge_skill_node_ids[]
assessment_demand_or_family_refs[]
evidence_type
strength_class
can_affect_reviewed
can_affect_exam_readiness
```

The map must enforce the product/evidence semantics that Learn exposure may affect `Reviewed` but does not directly increase Exam Readiness, while validated Practice and Exam Prep results may update readiness only for the knowledge/skills they genuinely assess.

### `RepresentativeMockContract`

For each trusted full mock/simulation, record enough whole-assessment metadata to validate:

- component identity;
- marks and duration;
- curriculum/skill coverage profile;
- question-family / command-demand mix;
- assessment-objective profile where applicable;
- difficulty/representativeness state;
- marking-pack completeness;
- independent-review and expert-calibration status.

### `MarkingPack`

Question-specific governed assessment contract including rubric/level logic, legitimate reasoning routes, misconceptions, anchors/calibration state, feedback/improvement rules and confidence/ambiguity policy.

### `ExpertReviewContract`

Exact reviewed version, package reference and machine-readable expert findings with severity, type, affected artifact/work unit, required correction and disposition.

## Lifecycle delta

The state machine must guard `expert_review_ready` on:

- resolved exact identity;
- no unresolved source-rights blocker;
- complete Course Truth for intended scope;
- complete Exam Truth for applicable assessment scope;
- required Learn/Practice/Exam Prep artifacts present and version-compatible;
- representative mock contracts green where required;
- Marking Packs for all items represented as markable;
- learner-evidence mappings complete and valid;
- green deterministic validation;
- no unresolved blocking/material independent-review findings;
- expert package tied to the exact reviewed content version;
- explicit known limitations.

## Worker contract architecture

Recommended worker boundaries:

1. identity resolver;
2. source discovery;
3. source-rights classifier using approved reusable policy rules only;
4. Board Alignment compiler;
5. coverage compiler;
6. Course Knowledge Model compiler;
7. Assessment Blueprint compiler;
8. Question Family generator/instantiator;
9. Learning Blueprint planner;
10. Learn collateral generator;
11. Practice generator;
12. Exam Prep / representative mock generator;
13. Marking Pack generator;
14. learner-evidence-map compiler/validator;
15. independent educational/assessment reviewer;
16. targeted remediation worker;
17. expert-review package generator/importer.

Workers return schema-valid output or an explicit blocker/failure. Free-form prose is not a durable stage result.

## Model routing strategy

Use the cheapest route that passes the quality threshold for the worker class.

- **deterministic/no-model:** IDs, coverage/reference checks, arithmetic, totals, evidence mappings, lifecycle gating and whole-mock structural checks;
- **low-cost bounded generation:** flashcard/quiz variants and straightforward transformations after benchmark evidence supports the route;
- **mid/high reasoning:** Course Knowledge Model, Assessment Blueprint, substantial assessment generation and Marking Packs;
- **strong independent reasoning:** adversarial educational/assessment review and difficult remediation.

Do not encode a permanent model name in the domain schema. Record actual provider/model/configuration in worker-run provenance.

## Practice generation principle

Practice is not a checklist of mandatory formats.

Generation should create enough content for each appropriate technique to cover the full curriculum scope that the technique can validly assess. The number of flashcards, quizzes or practice questions is therefore computed from coverage need and useful variation rather than a universal target.

The implementation must not infer that one technique can prove skills it cannot assess. For example, retrieval performance can contribute recall evidence but cannot substitute for extended-response, application, evaluation, practical or other incompatible evidence.

## Representative mock principle

Full mocks and Exam Simulator papers are a higher-assurance asset class than ordinary practice questions.

A mock may be accepted only after whole-assessment validation against Exam Truth. The implementation should optimise first for trust and calibration, not mock count. Scaling the number of mock variants must preserve the same contract and assurance gates.

## Marking Pack implementation principle

The worker sequence is:

```text
Assessment Blueprint
  → validated Question Family
  → Revision-owned question
  → question-specific Marking Pack
  → deterministic validation
  → independent challenge
  → expert calibration/anchors
```

Runtime learner-answer interpretation can then consume the exact known question + assessment context + Marking Pack, matching the existing FI-007 governed marking contract.

## Deterministic assurance services

Minimum v2 checks include:

- schema and required-field validity;
- stable IDs / broken references;
- source-use permission prerequisites;
- Course Truth coverage completeness;
- Exam Truth completeness;
- Learning Blueprint coverage;
- learner-evidence-map validity and permitted semantics;
- formulas/arithmetic/percentages/ratios/units;
- answer-key validity;
- case numerical consistency where computable;
- question/section/exam mark totals;
- stored AO totals/constraints;
- Assessment Blueprint ↔ Question Family compatibility where computable;
- whole-mock structure/coverage/demand compatibility where computable;
- Marking Pack ↔ question identity/max-mark/AO consistency;
- Marking Pack presence for all markable written items;
- duplicate/contradictory answer/rule detection;
- exact-version linkage among generation, review and expert package.

## Independent review and remediation

Generation and final AI review must use separate worker-run contexts.

Independent review returns structured findings. Material findings reopen the smallest safe affected work unit. Downstream artifacts/assurance depending on that unit are invalidated by dependency references/fingerprints.

For trusted mocks, independent review must consider whole-paper representativeness as well as item-level correctness.

Do not overwrite prior review evidence; append remediation/revalidation evidence.

## Expert-review handoff

The export generator assembles one readable package containing:

- exact course identity/version;
- Source Licence Register references;
- Board Alignment and Course Truth coverage summary;
- Assessment Blueprint and Question Families / Exam Truth summary;
- substantial Learn and Practice content;
- representative exam-style simulations/mocks;
- learner-evidence mapping summary;
- Marking Packs and calibration anchors in scope;
- automated assurance results and known limitations;
- structured issue/sign-off form.

## Founder/Admin assurance

Content Operations should eventually show, for each course job:

- exact course;
- current state and stage completion without false precision;
- current blocker and required human action;
- source-rights health;
- Course Truth coverage completeness;
- Exam Truth completeness;
- generated artifact counts by class as descriptive output, not quality targets;
- representative mock assurance status;
- deterministic assurance status;
- independent-review material findings;
- remediation state;
- total model usage/cost;
- expert-review readiness/status;
- branch/PR/CI/deployment status where applicable.

## Test strategy

### Contract/unit

- artifact schemas;
- source-use class transitions;
- `expert_review_ready` state guards;
- invalid version/cross-reference rejection;
- dependency invalidation and resume rules;
- Course Truth / Exam Truth completeness guards;
- learner-evidence semantics guards;
- representative-mock contract guards;
- Marking Pack coverage guards.

### Content/evaluation

- representative gold sets for subject/assessment workers;
- factual defect detection;
- assessment authenticity review;
- coverage-based Practice generation rather than fixed-volume behaviour;
- evidence-map tests proving Learn does not create readiness and incompatible activity formats cannot overclaim evidence;
- representative mock whole-paper evaluation;
- Marking Pack alternative-valid-reasoning tests;
- human calibration agreement for judgement-heavy marking.

## Implementation sequence

Use short governed PRs after Founder-approved `Ready`:

1. schemas + state-machine/source-rights guard;
2. rights-safe identity/source/Board Alignment/coverage/Course Knowledge Model workers;
3. Assessment Blueprint + Question Families / Exam Truth;
4. Learning Blueprint + Learn/Practice workers + evidence mappings;
5. Exam Prep generation + trusted mock contracts + Marking Packs;
6. deterministic assurance + independent review + targeted remediation;
7. expert-review packaging/import + `expert_review_ready` Admin status;
8. prove end-to-end on materially different qualification shapes;
9. batch/concurrency/spend controls and operational hardening.

Each PR updates relevant implementation documentation and exact-head assurance. No PR merges without explicit Founder approval.

## Proof criteria for enterprise repeatability

Before calling v2 mature, demonstrate at least:

- restart after interruption without duplicated outputs;
- one course request can reach expert review without conversational coordination;
- source-rights blockers are correctly surfaced and resumed;
- Course Truth and Exam Truth completeness are mechanically enforced before collateral generation;
- Practice asset quantities emerge from coverage rather than fixed universal counts;
- learner-evidence mapping preserves Reviewed versus Exam Readiness semantics;
- representative mocks satisfy whole-assessment assurance;
- complete Marking Pack presence is mechanically enforced;
- material independent-review findings trigger targeted remediation;
- qualified expert can review from a portable package without GitHub access;
- expert findings round-trip to machine-readable remediation;
- at least several materially different course structures complete the pipeline;
- model/provider route can be changed behind worker contracts without rewriting domain state;
- per-course cost and human-intervention count are observable.

## Documentation impact

This plan is the technical implementation companion for Content Factory v2. The 3 September 2026 strategy clarification changes sequencing and adds explicit learner-evidence and trusted-mock contracts. `docs/technical/Content Factory Architecture.md`, current implementation records and relevant ADRs must be updated as those implementation increments land. Historical v0.1 implementation records remain historically accurate.