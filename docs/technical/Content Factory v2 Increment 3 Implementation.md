# Content Factory v2 Increment 3 Implementation

**Status:** In implementation  
**Initiative:** Issue #169 — Content Factory v2  
**Implementation increment:** Course Knowledge Model → Learning Blueprint → governed Learn/Practice work units and collateral  
**Canonical runtime / operational entry point:** `/app/` → role-gated Admin / Content Operations → protected Content Factory job creation  
**Base:** `main` at `786b98332a1b98ec141645de1619f540f186122b`

## Purpose

Implement the third material Content Factory v2 slice after Increment 2 established the rights-safe path from course request to a durable Course Knowledge Model.

This increment makes the learning/practice part of the factory executable as a provider-neutral, restartable pipeline. It turns a mapped Course Knowledge Model and coverage map into a deliberate Learning Blueprint, then generates structured Revision-owned Learn and Practice collateral for governed work units.

It does not yet implement the live external model/provider adapter, final learner content-pack projection, assessment generation, Marking Packs, independent review, expert handoff or publication.

## Governing rules implemented

This increment implements the current requirements in:

- `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`;
- `80-company-workflows/Content Pack Production and Assurance Workflow.md`;
- `10-product-governance/Course Content and Assessment Component Placement.md`;
- `20-brand-and-experience/Product UX Principles.md`; and
- `docs/technical/Content Factory v2 Implementation Plan.md`.

In particular:

- the Learning Blueprint chooses educationally appropriate modes rather than forcing every topic into identical notes, flashcards and quizzes;
- Learn output is structured as explanation/reading collateral rather than an arbitrary grid of interchangeable cards;
- Practice output is task-and-feedback collateral and each generated activity must correspond to a mode explicitly selected by the blueprint;
- shared syllabus requirements that apply across multiple assessment components remain course-scoped by default rather than being duplicated into paper-specific Learn/Practice work units;
- Learn/Practice workers consume structured Course Knowledge Model facts, not raw protected source material;
- source/provenance references are inherited deterministically from the exact knowledge nodes used for the work unit rather than invented by the generation worker;
- worker failures become durable blockers;
- completed collateral is reused on resume and rerun rather than regenerated; and
- the job remains in `generating` after Increment 3 because Assessment Blueprint / Question Families / Marking Packs are still required before deterministic validation.

## New implementation module

`src/content-factory/learning-and-practice.ts` provides:

- an executable Learning Blueprint contract with requirement bindings, knowledge-node bindings, deliberate learning modes, output classes and course/component scope;
- provider-neutral worker contracts for Learning Blueprint planning, Learn collateral generation and Practice collateral generation;
- structured Learn collateral and Practice collateral Zod contracts;
- safe worker-input projections that omit source text and source metadata from Course Knowledge Model nodes;
- deterministic cross-reference and mode validation;
- deterministic course-vs-component placement checks for shared requirements;
- inherited source provenance on generated artifacts;
- restart/idempotency checks over persisted work-unit artifacts; and
- `runLearningAndPracticeFactory(...)`.

The module is exported through `src/content-factory/index.ts`.

## Execution sequence

For a schema-v2 job that has completed Increment 2:

```text
mapped + Course Knowledge Model + coverage map
  ↓
Learning Blueprint planner
  ↓
validate knowledge-node / coverage requirement bindings
  ↓
validate deliberate learning modes and course/component scope
  ↓
persist Learning Blueprint
  ↓
create governed generation work units
  ↓
generating
  ↓
for each work unit:
  ├── Learn collateral worker when required
  └── Practice collateral worker when required
  ↓
persist structured artifacts + provenance
  ↓
mark work unit complete when all required outputs exist
  ↓
remain generating for Increment 4 assessment work
```

The existing v2 state-machine guard remains authoritative. Increment 3 supplies the Learning Blueprint and work units required for `mapped → generating`; it deliberately does not weaken `generating → validating`, which still requires complete generation work, a content-pack reference and the assessment artifacts added by the next increment.

## Executable Learning Blueprint

The existing durable Learning Blueprint concept is retained. Increment 3 adds execution bindings needed for repeatable work-unit orchestration:

- `requirementIds` — coverage requirements owned by the work unit;
- `knowledgeNodeIds` — exact Course Knowledge Model nodes used;
- `learningModes` — only the modes deliberately selected for this unit;
- `requiredOutputs` — `learning`, `practice` or both;
- `scope` — `course` or `component`; and
- `componentIds` when the unit is genuinely component-specific.

The executable contract remains compatible with the existing base Learning Blueprint schema while adding the bindings the runner needs.

### Learning modes in this increment

Learn modes:

- `explanation`;
- `worked_example`.

General Practice modes:

- `retrieval`;
- `flashcard`;
- `short_answer`;
- `application`;
- `quantitative`.

`exam_practice` is deliberately excluded from this increment. Exam-style assessment belongs to the governed Assessment Blueprint / Question Family / Marking Pack sequence in Increment 4.

The runner does not require every work unit to use every mode. A blueprint that chooses explanation plus application/retrieval, for example, does not need to create flashcards merely to fill a schema.

## Course-level placement guard

`Course Content and Assessment Component Placement.md` requires shared syllabus learning to appear once at course/specification level when the same requirement is assessed across multiple components.

Increment 3 applies a deterministic safeguard:

- a work unit marked `course` must not carry component IDs;
- a work unit marked `component` must identify a component; and
- a coverage requirement that explicitly spans multiple components cannot be converted into a component-scoped Learn/Practice work unit.

Where a qualification genuinely has distinct component-owned content, the upstream coverage model should represent genuinely distinct component requirements rather than duplicating one shared requirement downstream.

## Learn collateral contract

Learn output is structured for a reading/explanation experience. It can contain:

- title and short introduction;
- explanation sections with key points;
- worked examples only when the blueprint selects that mode;
- misconception/correction pairs; and
- a clear next action.

The runner rejects generated explanation sections or worked examples when the Learning Blueprint did not select those modes, and it rejects missing required output when a selected mode was not produced.

This is an internal content-production artifact, not a final page composition contract. The learner UI remains governed separately by the journey-led experience work and Interface System.

## Practice collateral contract

Practice output contains:

- title and brief instructions;
- one or more activities;
- explicit activity mode;
- prompt;
- expected response;
- explanatory feedback; and
- an improvement action.

For every practice mode selected by the blueprint, at least one matching activity must be generated. The runner rejects unplanned activity modes. This prevents a worker from silently turning every topic into the same exercise mix.

This increment does not claim exam-marking fidelity. Written exam questions and Marking Packs remain Increment 4 scope.

## Source and AI safety boundary

The worker boundary is deliberately narrower than the persisted Course Knowledge Model.

Generation workers receive only the structured educational fields needed to teach or practise the concept:

- node ID and kind;
- summary;
- formulas;
- misconceptions;
- application contexts;
- depth; and
- valid evidence types.

They do not receive raw source text, Source Licence Register entries, source URLs or Board Alignment source prose.

The generated artifact's `sourceRefs` are added by deterministic code from the exact Course Knowledge Model nodes used. This preserves provenance without asking a model to infer or fabricate citations.

The job must retain `sourceRightsStatus = approved` before this pipeline can execute.

## Restartability and idempotency

The runner accepts durable schema-v2 jobs at `mapped` or `generating`.

### New run

A `mapped` job without a Learning Blueprint:

1. plans and validates the blueprint;
2. persists it;
3. creates governed work units;
4. advances to `generating`; and
5. generates only the outputs required by each work unit.

### Resume after failure

Worker failure or infrastructure failure is recorded in `workerRuns` and becomes a durable blocker through the existing `blockJob(...)` mechanism.

After the blocker is deliberately resolved with `resumeJob(...)`, the runner inspects persisted work-unit output artifacts. Valid Learn/Practice artifacts tied to the same job, work unit and Course Knowledge Model fingerprint are reused.

For example, if Learn succeeds and Practice fails, the resumed job runs Practice only. It does not regenerate the already-persisted Learn output.

### Completed rerun

If all required artifacts for a work unit already exist and match the current knowledge-model fingerprint, the runner creates no duplicate artifacts or worker runs.

## Artifact persistence

Increment 3 introduces three artifact kinds through an injected store boundary:

- `learning_blueprint`;
- `learning_collateral`;
- `practice_collateral`.

The existing Increment 2 Course Knowledge Model and coverage artifacts are read through the same provider-neutral persistence shape.

This increment intentionally does **not** add these intermediate artifacts to `contentPackRefs`. `contentPackRefs` should represent assembled learner content packs rather than being used to pretend intermediate generation artifacts are already publishable content. Final pack projection is a later implementation responsibility.

## Assurance added

`src/content-factory/learning-and-practice.test.ts` covers:

- successful `mapped → generating` execution from a Course Knowledge Model;
- complete Learn and Practice artifacts for a governed work unit;
- safe worker inputs that omit source references/source metadata;
- deterministic inherited provenance on persisted collateral;
- no forced flashcard mode when the blueprint does not select flashcards;
- rejection of paper/component duplication for a shared multi-component requirement;
- rejection of unplanned practice modes;
- blocker/resume after Practice failure without regenerating successful Learn collateral; and
- idempotent rerun after the required Learn/Practice artifacts already exist.

Repository exact-head CI remains the final assurance gate for the PR.

## Security and privacy impact

No learner personal data is introduced.

No provider credentials, browser secrets or new privileged client path are introduced. A future concrete model adapter must remain server-side and must obey the worker contracts and Source Licence Register boundary already established by v2.

## User-facing impact

None in this increment.

There is no learner page change and no new Admin route. The practical improvement is internal: the factory can now turn the governed knowledge model into a deliberate, restartable set of Learn and Practice work products without conversational prompt coordination.

## Deliberate non-scope / next increment

Not included:

- concrete live model/provider adapter;
- final projection into `content/**/index.ts` learner packs;
- Assessment Blueprint;
- Question Families;
- original exam-style assessment/simulations;
- Marking Packs;
- deterministic content assurance;
- independent review/remediation;
- expert export/import;
- Admin status UI changes;
- automated merge/publication.

Increment 4 is the Assessment Blueprint → Question Families → original exam-style assessment → Marking Pack factory. It should extend the existing `generating` job rather than replacing or bypassing the Learn/Practice work already persisted here.

## Documentation impact check

No new normative product or workflow rule is introduced. This increment implements already-approved authority and adds a current technical implementation record. Historical v0.1 / Increment 1 / Increment 2 records remain unchanged.
