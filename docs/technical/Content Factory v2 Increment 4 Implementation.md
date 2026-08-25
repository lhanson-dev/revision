# Content Factory v2 Increment 4 Implementation

**Status:** In implementation  
**Initiative:** Issue #169 — Content Factory v2  
**Implementation increment:** Assessment Blueprint → Question Families → Revision-owned exam-style assessment → Marking Packs  
**Canonical runtime / operational entry point:** `/app/` → role-gated Admin / Content Operations → protected Content Factory job creation  
**Base:** `main` at `9f6d8ac6960a9300ed300d94fcfb21c40d2ad3ac`

## Purpose

Implement the fourth executable Content Factory v2 slice after Increment 3 made Learning Blueprint, Learn collateral and Practice collateral generation restartable.

This increment completes the generation phase needed before deterministic assurance. It turns a `generating` schema-v2 course job into:

- an Assessment Blueprint aligned to the exact structured Board Alignment;
- reusable Question Families;
- Revision-owned exam-style assessment items instantiated for the relevant assessment components;
- one question-specific Marking Pack for every generated markable item; and
- an internal unassured course-content manifest joining Learn, Practice and assessment artifacts.

When all required artifacts are present, the job moves from `generating` to `validating`. Increment 5 remains responsible for deterministic assurance, fresh-context independent review and remediation.

## Governing rules implemented

This increment implements the current requirements in:

- `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`;
- `80-company-workflows/Content Pack Production and Assurance Workflow.md`;
- `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`;
- `10-product-governance/Assisted Exam Answer Marking.md`;
- `10-product-governance/Course Content and Assessment Component Placement.md`; and
- `docs/technical/Content Factory v2 Implementation Plan.md`.

The important implementation consequences are:

- assessment material is Revision-authored and must never be presented as official awarding-body content;
- workers consume structured Board Alignment and Course Knowledge Model facts, not raw protected source prose;
- a Question Family is a reusable assessment archetype, not one generated question;
- when the same Question Family is valid across multiple components, it is instantiated as a distinct original question for each component target;
- every generated item represented as markable must have a question-specific Marking Pack;
- Marking Packs retain legitimate alternative reasoning routes and treat indicative content as non-exhaustive;
- generated Marking Packs start `not_calibrated`; this increment does not manufacture expert-calibration evidence; and
- no assessment artifact becomes learner-available merely because generation completed.

## New implementation module

`src/content-factory/assessment-and-marking.ts` provides:

- executable Assessment Blueprint validation;
- provider-neutral worker contracts for Assessment Blueprint, Question Family, assessment-item and Marking Pack generation;
- Revision-owned assessment-item artifact contracts;
- question-specific Marking Pack construction and cross-reference validation;
- safe worker-input projections that omit raw source records, URLs and source-reference metadata;
- deterministic source/provenance inheritance after worker output is returned;
- Question Family reuse across assessment components with component-specific item instantiation;
- durable blocker/resume behaviour using existing Content Factory job state and worker-run records;
- persisted-output reuse to avoid regenerating successful assessment items or Marking Packs after a later failure;
- an internal course-content pack manifest with explicit `factory_generated_unassured` status; and
- `runAssessmentAndMarkingFactory(...)`.

The module is exported through `src/content-factory/index.ts`.

## Execution sequence

```text
generating + completed Learn/Practice work units
  ↓
read verified Board Alignment + coverage + Course Knowledge Model
  ↓
Assessment Blueprint worker
  ↓
validate exact components / marks / timing / AOs against Board Alignment
  ↓
persist Assessment Blueprint
  ↓
Question Family worker
  ↓
validate reusable archetypes against blueprint component/AO/mark constraints
  ↓
for each component × Question Family target
  ↓
generate a Revision-owned exam-style assessment item
  ↓
validate requirement / component / knowledge-node / mark-range bindings
  ↓
persist assessment item + deterministic provenance
  ↓
Marking Pack worker
  ↓
construct exact question-specific Marking Pack
  ↓
validate AO totals / rubric ranges / demand / alternative-reasoning contract
  ↓
persist Marking Pack + job coverage record
  ↓
assemble factory-generated unassured course-content manifest
  ↓
generating → validating
```

## Assessment Blueprint boundary

The Assessment Blueprint worker receives only structured facts required to model the qualification:

- exact course identity;
- structured component identity, marks, duration and weighting;
- structured assessment-objective identity/weighting;
- structured assessment requirements;
- Exam Prep coverage requirements; and
- safe Course Knowledge Model facts.

It does not receive Source Licence Register records, source URLs, protected awarding-body prose or raw mark schemes.

The runner validates that:

- every resolved assessment component is represented;
- component mark totals and timing match Board Alignment where those facts are known;
- component Question Family IDs are non-empty and unique within that component;
- assessment-objective IDs and known weightings match Board Alignment; and
- command-demand component references are valid.

## Reusable Question Families

Question Families remain independent of any one generated question.

A family may be referenced by more than one component when its assessment archetype is genuinely reusable. Its `componentScope` must exactly match the components that reference it in the Assessment Blueprint.

The generation target is therefore not merely `Question Family`. It is:

`assessment component × validated Question Family`

This ensures that a reusable family can produce separate component-specific questions without duplicating the family contract itself.

The runner validates:

- exact family identity;
- component scope;
- assessment-objective references;
- mark range against every component in scope; and
- existing Question Family schema requirements for response shape, context, demands and common failure modes.

## Original assessment-item contract

Every generated assessment item records:

- stable item ID and version;
- component ID;
- Question Family ID;
- coverage requirement IDs;
- Course Knowledge Model node IDs;
- question format and command;
- exact maximum mark;
- exact Revision-owned wording;
- optional Revision-owned scenario/context; and
- deterministic provenance references.

The persisted artifact is explicitly marked:

- `origin: revision_owned`; and
- `presentationLabel: Revision-authored exam-style practice`.

This is an implementation-level safeguard against accidentally representing generated material as official awarding-body content.

The runner rejects:

- a component outside the target/family scope;
- a mark allocation outside the Question Family range;
- a missing context where the family requires one;
- unknown or non-Exam-Prep coverage requirements;
- component/coverage mismatches; and
- unknown Course Knowledge Model nodes.

## Marking Pack contract

The Marking Pack worker does not control question identity, wording, maximum mark, provenance or family linkage. Those fields are constructed deterministically from the persisted Revision-owned assessment item and approved contracts.

The worker supplies the judgement-bearing material:

- AO allocation;
- rubric/level logic;
- application requirements;
- analysis requirements;
- evaluation requirements;
- legitimate valid reasoning routes;
- non-exhaustive indicative content;
- misconceptions/invalid reasoning;
- diagnostic feedback rules;
- improvement actions;
- ambiguity policy; and
- confidence policy.

The runner then constructs the final governed Marking Pack and enforces:

- exact question ID/version/wording/max mark;
- exact Question Family and Assessment Blueprint linkage;
- AO allocation matching the family and totalling the question maximum where AO marks are supplied;
- rubric ranges within the question maximum;
- preservation of family application/analysis/evaluation demand;
- at least one valid reasoning route;
- `indicativeContentPolicy: non_exhaustive`;
- `questionOrigin: revision_owned`;
- deterministic provenance inherited from the assessment item; and
- `calibrationStatus: not_calibrated` with no invented expert anchors.

Expert-calibrated anchors remain a later assurance/handoff responsibility. This increment does not claim that generated Marking Packs are already benchmark-calibrated for learner AI marking.

## Source-rights and AI boundary

The Assessment Blueprint, Question Family, assessment-item and Marking Pack workers are deliberately denied raw source records and source-reference metadata.

They receive only the structured educational/assessment facts that the preceding governed stages have made safe for generation.

After a worker returns, deterministic code attaches provenance from:

- Course Knowledge Model node source references; and
- Board Alignment source references.

This preserves traceability without making a model copy, infer or fabricate citations.

The job must retain `sourceRightsStatus = approved`; otherwise the assessment factory refuses to run.

## Restartability and idempotency

The runner uses existing durable worker-run output references, `assessmentBlueprintRef`, `questionFamilyRefs` and `markingPackCoverage` records.

If a later worker fails:

- the job is blocked through the existing durable blocker mechanism;
- successful Assessment Blueprint / Question Family / assessment-item artifacts remain persisted;
- after the blocker is deliberately resolved, matching persisted outputs are reused; and
- only missing Marking Packs or later artifacts are regenerated.

Once the stage reaches `validating`, rerunning this factory performs a consistency/readiness check and returns the unchanged job rather than repeating generation.

## Internal course-content manifest

After all assessment targets and Marking Packs exist, Increment 4 writes one internal `course_content_pack_manifest` joining:

- Learn artifact references;
- Practice artifact references;
- Assessment Blueprint reference;
- Question Family references;
- original assessment-item references;
- Marking Pack references; and
- markable assessment-item IDs.

Its publication status is fixed to:

`factory_generated_unassured`

This manifest satisfies the durable generation-stage need for a complete course-pack reference without pretending the content has passed deterministic validation, independent review, expert review or publication approval.

It is **not** the final `content/**/index.ts` learner-catalogue projection.

## State transition

Increment 3 deliberately left v2 jobs in `generating`.

Increment 4 may advance a job to `validating` only after:

- all pre-existing Learn/Practice work units are complete;
- Assessment Blueprint exists;
- all referenced Question Families exist;
- every component × Question Family target has an original assessment item;
- every generated markable item has a persisted Marking Pack; and
- the unassured course-content manifest exists.

The existing orchestrator then remains authoritative for the `generating → validating` transition.

Increment 5 must populate deterministic validation evidence; entering `validating` is not a PASS decision.

## Assurance added

`src/content-factory/assessment-and-marking.test.ts` covers:

- successful `generating → validating` execution;
- one reusable Question Family instantiated separately for multiple assessment components;
- original Revision-owned item labelling;
- safe worker inputs with no raw source references or URLs;
- deterministic provenance attachment;
- question/Question Family mark-range enforcement;
- Marking Pack AO-total enforcement;
- exact question-specific Marking Pack construction;
- non-exhaustive indicative-content policy;
- no false expert-calibration state;
- blocker/resume after Marking Pack failure without assessment-item regeneration; and
- idempotent rerun after the stage has entered `validating`.

Repository exact-head CI remains the PR assurance gate.

## Security and privacy impact

No learner personal data is introduced.

No provider credentials, browser secrets or new privileged client route are introduced.

A future live model adapter remains server-side and must obey these provider-neutral worker contracts and the existing Source Licence Register gate.

## User-facing impact

None in this increment.

No learner page, Admin route or marking runtime is changed. The improvement is internal course-production capability only.

## Deliberate non-scope / next increment

Not included:

- live external model/provider adapter;
- deterministic arithmetic/coverage/assessment assurance execution;
- fresh-context independent educational/assessment review;
- targeted remediation/invalidation;
- expert-calibrated anchor responses;
- FI-007 learner-answer marking runtime;
- final `content/**/index.ts` learner-pack projection;
- expert-review export/import;
- Admin expert-review status UI; or
- automated merge/publication.

The next governed increment is deterministic assurance + independent fresh-context review + targeted remediation.

## Documentation impact check

No new normative rule is introduced by this PR. The implementation follows already-approved Content Factory v2, assessment, marking and source-rights authority.

A new current-state technical implementation record is required and is supplied here. Historical evidence is not rewritten. `INDEX.md` does not need a new authority pointer because the canonical v2 implementation plan remains the primary technical index entry; this increment record is an implementation detail under `docs/technical/`.