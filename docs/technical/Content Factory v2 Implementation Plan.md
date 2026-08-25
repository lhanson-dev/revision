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
Course Knowledge Model
  ↓
Learning Blueprint + parallel learning/practice work units
  ↓
Assessment Blueprint + Question Families
  ↓
Original assessment items + Marking Packs
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

## Durable artifact contracts

Add versioned Zod schemas under `src/content-factory/` for at least:

### `SourceLicenceRecord`

```text
source_id
issuer
url_or_reference
source_type
educational_role
version_or_date
use_class
permission_basis
ai_input_permitted
derived_commercial_use_permitted
attribution_requirements
restrictions
checked_at
checker_method
source_fingerprint
revalidation_conditions
```

`use_class` supports `OPEN`, `REVISION_OWNED`, `LICENSED`, `REFERENCE_ONLY`, `PROHIBITED`, `UNKNOWN`.

### `BoardAlignment`

Structured course/spec/component facts with source references and verification status. It must not require copied awarding-body prose to flow into generation.

### `CourseKnowledgeModel`

Stable concept/skill nodes, relationships, misconceptions, formulas, application contexts, source/alignment references and valid evidence types.

### `LearningBlueprint`

Requirement/cluster → deliberately selected learning/practice modes and work-unit plan.

### `AssessmentBlueprint`

Assessment objective/skill model, component structure, question families, mark/timing constraints, quantitative/synoptic requirements and other generation constraints.

### `QuestionFamily`

Reusable assessment archetype with skill/AO profile, response demands, constraints and compatible Marking Pack template.

### `MarkingPack`

Question-specific governed assessment contract including rubric/level logic, legitimate reasoning routes, misconceptions, anchors/calibration state, feedback/improvement rules and confidence/ambiguity policy.

### `ExpertReviewContract`

Exact reviewed version, package reference and machine-readable expert findings with severity, type, affected artifact/work unit, required correction and disposition.

## Lifecycle delta

Extend the existing state machine with:

```text
...
independent_review
remediation (when required)
expert_review_packaging
expert_review_ready
human_review
benchmark_approved
```

Source-rights ambiguity should use the existing `blocked` mechanism with a stable blocker such as `source_rights_review_required`.

The state machine must guard `expert_review_ready` on:

- resolved exact identity;
- no unresolved source-rights blocker;
- complete intended coverage;
- required v2 artifacts present and version-compatible;
- Marking Packs for all items represented as markable;
- green deterministic validation;
- no unresolved blocking/material independent-review findings;
- expert package tied to the exact reviewed content version;
- explicit known limitations.

## Worker contract architecture

Each AI-assisted worker is a versioned contract with:

```text
worker_id
contract_version
input_schema
output_schema
permitted_source_classes
model_route_class
retry_policy
quality_evaluation_version
```

Workers return schema-valid output or an explicit blocker/failure. Free-form prose is not a durable stage result.

Recommended worker boundaries:

1. identity resolver;
2. source discovery;
3. source-rights classifier using approved reusable policy rules only;
4. Board Alignment compiler;
5. coverage compiler;
6. Course Knowledge Model compiler;
7. Learning Blueprint planner;
8. learning collateral generator;
9. practice generator;
10. Assessment Blueprint compiler;
11. Question Family generator/instantiator;
12. original assessment/simulation generator;
13. Marking Pack generator;
14. independent educational/assessment reviewer;
15. targeted remediation worker;
16. expert-review package generator/importer.

## AI provider boundary

Keep the domain/orchestrator model-provider neutral. Provider calls sit behind an injected worker adapter so models/providers can be changed without changing educational authority or job state.

For an initial OpenAI adapter, use the current Responses API with Structured Outputs/JSON Schema for schema-bound worker outputs rather than relying on unconstrained prose parsing. Current OpenAI models expose a cost/intelligence range suitable for task routing, but exact model selection must be driven by Revision evaluation evidence and current pricing rather than hard-coded into authority.

Provider secrets must remain server-side. Content Factory inputs must respect the Source Licence Register; a provider adapter must never receive `REFERENCE_ONLY`, `PROHIBITED` or unresolved material beyond what the approved worker contract permits.

No learner personal data is required for course-content production workers.

## Model routing strategy

Use the cheapest route that passes the quality threshold for the worker class.

Proposed evaluation classes:

- **deterministic/no-model:** IDs, coverage/reference checks, arithmetic, totals, lifecycle gating;
- **low-cost bounded generation:** flashcard/quiz variants and straightforward transformations after benchmark evidence supports the route;
- **mid/high reasoning:** Course Knowledge Model, Assessment Blueprint, substantial assessment generation and Marking Packs;
- **strong independent reasoning:** adversarial educational/assessment review and difficult remediation.

Do not encode a permanent model name in the domain schema. Record actual provider/model/configuration in worker-run provenance.

## Marking Pack implementation principle

Marking Packs should push stable assessment rules into precomputed structured contracts so runtime answer marking does not need to rediscover the rubric on every student response.

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

Create reusable validators returning machine-readable findings. Minimum v2 checks:

- schema and required-field validity;
- stable IDs / broken references;
- source-use permission prerequisites;
- coverage completeness;
- formulas/arithmetic/percentages/ratios/units;
- answer-key validity;
- case numerical consistency where computable;
- question/section/exam mark totals;
- stored AO totals/constraints;
- Assessment Blueprint ↔ question-family compatibility where computable;
- Marking Pack ↔ question identity/max-mark/AO consistency;
- Marking Pack presence for all markable written items;
- duplicate/contradictory answer/rule detection;
- exact-version linkage among generation, review and expert package.

## Independent review and remediation

Generation and final AI review must use separate worker-run contexts.

Independent review returns structured findings. Material findings reopen the smallest safe affected work unit. Downstream artifacts/assurance depending on that unit are invalidated by dependency references/fingerprints.

Do not overwrite prior review evidence; append remediation/revalidation evidence.

## Expert-review handoff

The export generator assembles one readable package containing:

- exact course identity/version;
- Source Licence Register references;
- Board Alignment and coverage summary;
- substantial learning/practice content;
- Assessment Blueprint and Question Families;
- original exam-style simulations;
- Marking Packs and calibration anchors in scope;
- automated assurance results and known limitations;
- structured issue/sign-off form.

The imported reviewer result must validate against `ExpertReviewContract` and create targeted remediation tasks rather than a free-text backlog.

## Orchestration, retries and idempotency

Every stage stores explicit input fingerprints and output references.

Rules:

- unchanged successful stages can be reused;
- transient provider/network failures may retry within bounded limits;
- curriculum/source/rights ambiguity becomes `blocked`, not repeated guessing;
- retries must not duplicate jobs, branches, PRs or content IDs;
- upstream source/alignment/contract changes invalidate dependent stages deliberately;
- worker-contract changes can trigger targeted re-evaluation when benchmark assumptions no longer hold.

## Cost controls

Content-production AI cost is operational content cost, separate from learner-tier AI envelopes in `AI Cost and Allowance Policy.md`.

Record per worker/job where available:

- provider/model/route;
- input/output usage;
- cached usage where applicable;
- retry count;
- cost estimate/actual cost;
- wall-clock stage duration;
- total automated course cost;
- expert-review cost when known.

The orchestrator must support per-job and batch ceilings plus bounded concurrency. Cost controls may route work differently but may not bypass source, accuracy or review gates.

## Founder/Admin assurance

Content Operations should eventually show, for each course job:

- exact course;
- current state and percent/stage completion without false precision;
- current blocker and required human action;
- source-rights health;
- coverage completeness;
- generated artifact counts by class;
- deterministic assurance status;
- independent-review material findings;
- remediation state;
- total model usage/cost;
- expert-review readiness/status;
- branch/PR/CI/deployment status where applicable.

The initial implementation may expose this incrementally; machine-readable job state is the source for the UI.

## Security / trust

- server-side provider/GitHub/service credentials only;
- no browser model-provider secrets;
- admin authorization revalidated server-side;
- no learner personal data needed for course factory workers;
- fail closed on source-use ambiguity;
- no substantial protected source material stored for convenience;
- worker inputs/outputs and permission provenance attributable to exact versions;
- no automated merge.

## Test strategy

### Contract/unit

- every new Zod artifact schema;
- source-use class transitions;
- `expert_review_ready` state guards;
- invalid version/cross-reference rejection;
- dependency invalidation and resume rules;
- Marking Pack coverage guards.

### Worker adapter/evaluation

- Structured Output schema conformance;
- refusal/failure handling;
- retry/idempotency behaviour;
- quality evals per worker contract;
- generator/reviewer context-separation assertions.

### Integration

- Admin intake → durable job;
- job → source-rights blocker/resume;
- job → artifacts → review → remediation;
- expert package exact-version linkage;
- GitHub branch/PR/exact-head CI handling;
- no privileged secret in browser bundle.

### Content/evaluation

- representative gold sets for subject/assessment workers;
- factual defect detection;
- assessment authenticity review;
- Marking Pack alternative-valid-reasoning tests;
- human calibration agreement for judgement-heavy marking.

### Production smoke

When user-facing Admin/job-status increments are deployed, verify the canonical `/app/` role-gated route and protected backend behaviour under normal path-to-live controls.

## Implementation sequence

Use short governed PRs after Founder-approved `Ready`:

1. schemas + state-machine/source-rights guard;
2. rights-safe identity/source/Board Alignment/coverage/knowledge-model workers;
3. Learning Blueprint + learning/practice workers;
4. Assessment Blueprint + Question Families + exam-generation + Marking Packs;
5. deterministic assurance + independent review + targeted remediation;
6. expert-review packaging/import + `expert_review_ready` Admin status;
7. prove end-to-end on materially different qualification shapes;
8. batch/concurrency/spend controls and operational hardening.

Each PR updates relevant implementation documentation and exact-head assurance. No PR merges without explicit Founder approval.

## Proof criteria for enterprise repeatability

Before calling v2 mature, demonstrate at least:

- restart after interruption without duplicated outputs;
- one course request can reach expert review without conversational coordination;
- source-rights blockers are correctly surfaced and resumed;
- complete coverage and Marking Pack presence are mechanically enforced;
- material independent-review findings trigger targeted remediation;
- qualified expert can review from a portable package without GitHub access;
- expert findings round-trip to machine-readable remediation;
- at least several materially different course structures complete the pipeline;
- model/provider route can be changed behind worker contracts without rewriting domain state;
- per-course cost and human-intervention count are observable.

## Documentation impact

This plan is the technical implementation companion for Content Factory v2. As implementation increments land, update `docs/technical/Content Factory Architecture.md`, `Content Operations Admin Implementation.md`, code-level implementation records and relevant ADRs where architecture decisions become durable. Historical v0.1 implementation records remain historically accurate.