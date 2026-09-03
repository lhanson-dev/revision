# ADR-0020 — Content Factory foundation gate and staged asset production

**Status:** Accepted via Founder-approved PR #290  
**Date:** 3 September 2026  
**Decision owner:** Founder  
**Applies to:** Content Factory orchestration, course-foundation approval, Learn/Practice/Exam Prep production and migration from the v2 end-to-end factory

## Context

Revision's earlier Content Factory v2 programme pursued one automated course-build path from course intake through Learn, Practice, assessment, Marking Packs, independent review and `expert_review_ready`.

That programme produced substantial reusable engineering and assurance learning, including rights-safe source handling, structured Course Knowledge Models, Board Alignment, Assessment Blueprints, Question Families, deterministic validation, independent review, durable restart/reuse, compiler-owned deterministic structure and candidate recovery.

However, the old programme did not achieve a final real-course end-to-end expert-review-ready pass. More importantly, the product/content strategy has now been clarified: Revision needs to establish and approve the **base course content and exam information first**, then use that approved foundation to manufacture learner assets.

The previous orchestration makes that distinction difficult because Learn, Practice and assessment generation are coupled inside one course job and one eventual package gate.

## Decision

Revision will replace the old end-to-end Content Factory target with a staged architecture separated by a mandatory **Approved Course Foundation** gate.

The governing architecture is:

`course request → Course Truth + Exam Truth → foundation assurance → qualified foundation approval → Approved Course Foundation → independent Learn / Practice / Exam Prep factories → asset assurance → publication`

### 1. Foundation Factory is the first production system

The Foundation Factory establishes:

- exact course identity and cohort;
- source rights/provenance;
- Board Alignment;
- complete curriculum/specification coverage;
- Course Truth through the Course Knowledge Model or successor;
- Exam Truth through the Assessment Blueprint, validated Question Families and related assessment contracts;
- deterministic foundation assurance;
- fresh-context independent review; and
- qualified subject/assessment approval.

It may complete successfully without generating any learner-facing asset.

### 2. Approved Course Foundation is a first-class durable artifact

The approved artifact records the exact dependency set and its approval evidence, including fingerprints/versions for Course Truth, Exam Truth, sources, coverage and review evidence.

Downstream assets must reference this approved foundation version.

A material foundation change creates a new foundation version and deliberately invalidates only affected downstream assets.

### 3. Learner assets are derived products

Learn, Practice and Exam Prep are separate downstream manufacturing responsibilities.

- **Learn** teaches approved Course Truth.
- **Practice** creates valid retrieval/application/testing opportunities against approved Course Truth and the learner-evidence model.
- **Exam Prep** combines approved Course Truth and Exam Truth to create exam technique, exam-style work, timed work, mocks/simulations and governed marking assets.

Generated assets cannot redefine the foundation.

### 4. Reuse is selective, not architectural inheritance

Existing v2 components may be ported when they clearly improve the new staged process.

Likely reusable components include source-rights classification, identity resolution, Board Alignment, coverage compilation, Course Knowledge Model schemas/workers, Assessment Blueprint/Question Family contracts, deterministic validators, independent-review contracts, durable fingerprints, dependency-aware invalidation, cost/provenance telemetry and bounded candidate recovery where useful.

The new system will not preserve the old state machine, end-to-end qualification sequence, Learn/Practice coupling or old pilot mechanics solely for compatibility.

When reuse would materially complicate the new process, a clean boundary is preferred.

### 5. Historical evidence is preserved

Merged PRs, pilot issues, failure records, reliability records and earlier ADRs remain historical evidence of what was learned and implemented at that time.

They are not rewritten to claim the new Foundation Gate existed previously.

Unmerged work whose purpose is only to continue proving the superseded end-to-end target may be closed as superseded.

## Why this architecture

### Educational trust

Course definition and exam definition become independently reviewable before high-volume collateral is produced. This reduces the risk of generating large quantities of internally consistent but foundationally wrong material.

### Simplicity

Operators reason about two clear questions:

1. Is the course foundation approved?
2. Which derived asset sets have been produced and assured from it?

This is easier to understand than one long course state machine where truth modelling, collateral generation, assessment production and publication readiness are interleaved.

### Cost and remediation

Foundation defects are found before paying to generate large quantities of downstream assets. Later asset defects can normally be remediated locally against a stable approved foundation.

### Personalisation and evidence

A canonical approved knowledge/skill model provides a stable target for Learn, Practice, Exam Prep and learner evidence. Multiple asset formats can map to the same node without becoming competing definitions of the curriculum.

## Consequences

Positive:

- base course content and exam structure can be explicitly approved before asset production;
- downstream asset factories become independently evolvable;
- Practice can be expanded without regenerating Learn or redefining the course;
- Exam Prep can carry stronger assessment-specific assurance without forcing the same burden on simple Learn assets;
- source/foundation changes have explicit dependency impact;
- previous engineering learnings can be reused without preserving previous orchestration complexity;
- the operating model becomes easier for the Founder and Content Operations to understand.

Costs and risks:

- a new Foundation artifact/state model is required;
- current v2 orchestration cannot simply be renamed; some code should be retired or bypassed;
- existing durable checkpoint data belongs to the old topology and should not be assumed reusable without explicit compatibility mapping;
- the new process requires its own reliability qualification focused on each staged boundary rather than inheriting the old full-course confirmation sequence;
- the first migration course will need careful comparison to prove that useful controls were retained while unnecessary coupling was removed.

## Implementation direction

Implementation should proceed in short governed increments:

1. Foundation schema + lifecycle + approval artifact, with no learner-asset generation.
2. Reuse/port intake, rights, Board Alignment, coverage, Course Truth and Exam Truth workers behind the new Foundation boundary.
3. Foundation deterministic/independent/expert assurance and versioned `foundation_approved` gate.
4. Learn Factory against an approved foundation.
5. Practice Factory against an approved foundation and canonical evidence mappings.
6. Exam Prep Factory + Marking Pack path against an approved foundation.
7. Content Operations status/controls for Foundation and each asset factory.
8. Cross-course repeatability qualification.

Do not start by porting the old orchestrator wholesale.

## Relationship to ADR-0019

ADR-0019 remains valid as a reusable reliability lesson for generative boundaries: rejected AI candidates can be normal manufacturing scrap and should be recovered at the smallest safe scope within bounded limits.

ADR-0019 does **not** require the new staged factory to preserve the previous full-course orchestration or candidate-state topology everywhere. Candidate recovery should be adopted only at worker boundaries where it materially improves reliability.

## Documentation impact

`80-company-workflows/Content Factory Foundation and Asset Production Model.md` is the new sequencing authority.

`INDEX.md` must point to it as the current Content Factory production model.

Current technical documentation must distinguish:

- legacy/current v2 implementation evidence; and
- the new staged target architecture and migration plan.

Earlier Content Factory operating, v2 amendment and reliability documents remain non-conflicting control/history sources until later consolidation or archival. Their end-to-end sequencing is superseded by the new model.