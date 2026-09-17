# Content Factory Foundation and Asset Production Model

**Status:** Active v1.0 — Founder-approved via PR #290  
**Owner:** Founder / Product / Content Operations  
**Decision date:** 3 September 2026  
**Purpose:** Define the Content Factory process that establishes and approves a trusted course foundation before Revision generates learner-facing Learn, Practice or Exam Prep assets.

## Governing decision

Revision will operate content production as two distinct systems separated by a mandatory approval gate:

1. **Foundation Factory** — establish and approve the trusted educational and assessment foundation for an exact course.
2. **Asset Factories** — generate learner-facing Learn, Practice and Exam Prep assets only from an approved foundation version.

The governing sequence is:

`exact course request → Course Truth + Exam Truth → foundation assurance → qualified foundation approval → Approved Course Foundation → Learn / Practice / Exam Prep asset production → asset assurance → publication`

Learner-facing assets are derived products. They are not the source of curriculum or assessment truth.

## Supersession and relationship to earlier Content Factory work

This model deliberately changes the sequencing and completion unit described by the earlier Content Factory Operating Model, Content Factory v2 Expert Review Ready Amendment and the v2 end-to-end pilot programme.

Where those sources describe one continuous course job that generates Learn, Practice, assessment and marking material before a single final `expert_review_ready` gate, this document supersedes that sequencing.

Earlier work remains useful only where it strengthens the new model without forcing the old workflow shape upon it.

Revision will carry forward these proven controls and learnings where applicable:

- exact course identity and cohort resolution;
- source-rights classification and provenance;
- Board Alignment separated from reusable course knowledge;
- structured coverage and Course Knowledge Model concepts;
- Assessment Blueprint and Question Family concepts;
- deterministic ownership of mechanically provable structure;
- complete deterministic diagnostics where practical;
- fresh-context independent review;
- targeted remediation at the smallest safe scope;
- durable fingerprints, dependency-aware invalidation and reuse;
- bounded retries, cost controls and operational provenance;
- candidate-based recovery where generative variability makes it useful; and
- qualified human subject/assessment review before strong trust claims.

Revision will **not** preserve old orchestration, state-machine complexity, qualification ceremony or pilot mechanics merely because they already exist. A component must earn its place in the new process by making the staged model safer, simpler, cheaper or more reliable.

Historical v2 pilot, reliability and failure evidence remains historically true. It must not be rewritten to imply the Foundation Gate existed during those runs.

## Core production principle

The Content Factory first establishes **what the course requires and how it is assessed**. Only after that foundation is approved does Revision manufacture learner assets.

The mandatory hierarchy is:

**truth → assurance → approval → assets**

not:

**generate everything → review the package → infer whether the underlying course model was right**.

Generated notes, flashcards, quizzes, questions, mocks, mark schemes or other learner assets must never redefine Course Truth or Exam Truth.

## Course Truth

Course Truth is the complete governed model of what the learner must know and be able to do for the exact course.

It includes, where applicable:

- exact curriculum/specification requirements;
- concepts, definitions, facts and relationships;
- formulas and quantitative rules;
- processes and methods;
- required learner skills;
- prerequisites and conceptual relationships;
- common misconceptions;
- application contexts;
- required depth and difficulty;
- course/topic structure;
- board/component mappings;
- source/provenance references; and
- valid evidence types capable of testing each knowledge or skill node.

Every material examinable curriculum requirement must be represented. Generated asset volume cannot compensate for a missing Course Truth requirement.

Course Truth should normally be represented through the coverage model and Course Knowledge Model or their successor schemas.

## Exam Truth

Exam Truth is the complete governed model of how Course Truth is assessed for the exact qualification and components.

It includes, where applicable:

- paper/component structure;
- marks, timings and weightings;
- assessment objectives and skills;
- question/response families;
- command and cognitive demands;
- quantitative, practical, synoptic or source-handling requirements;
- response expectations;
- application, analysis and evaluation behaviour;
- marking/rubric principles;
- valid alternative reasoning routes where relevant; and
- rules needed to create authentic Revision-owned assessment material.

Exam Truth should normally be represented through Board Alignment, an Assessment Blueprint, Question Families and other structured assessment contracts.

Course Truth and Exam Truth are siblings derived from approved sources and governed structured evidence. Neither may be inferred from generated Revision assets.

## Foundation Factory

The normal Foundation Factory flow is:

1. **Course request** — exact course/specification pointer received.
2. **Identity resolution** — subject, qualification, awarding body, specification, cohort and genuine learner/course options resolved.
3. **Source discovery and rights** — Source Licence Register completed; unresolved rights fail closed.
4. **Board Alignment** — qualification/component facts verified without treating protected source prose as reusable learner content.
5. **Coverage compilation** — every material curriculum/specification requirement represented.
6. **Course Truth compilation** — Course Knowledge Model completed and reconciled to coverage.
7. **Exam Truth compilation** — Assessment Blueprint and validated Question Families completed and reconciled to Board Alignment and Course Truth.
8. **Foundation deterministic assurance** — mechanically provable completeness, consistency, cross-reference and assessment-shape rules checked.
9. **Foundation independent review** — fresh-context educational and assessment challenge of Course Truth and Exam Truth.
10. **Foundation remediation** — blocking/material findings corrected at the smallest safe scope and affected assurance rerun.
11. **Foundation expert review** — suitably qualified subject/assessment reviewer verifies the exact foundation version.
12. **Foundation approval** — the exact Course Truth + Exam Truth version becomes the Approved Course Foundation.

The Foundation Factory stops at foundation approval. It does not need to generate learner-facing Learn, Practice or Exam Prep collateral in order to prove that the foundation is complete and trustworthy.

## Approved Course Foundation

The **Approved Course Foundation** is a first-class durable artifact and approval record.

At minimum it records:

- exact course identity and cohort;
- Source Licence Register reference/fingerprint;
- Board Alignment reference/fingerprint;
- coverage model reference/fingerprint;
- Course Truth / Course Knowledge Model reference/fingerprint;
- Exam Truth / Assessment Blueprint reference/fingerprint;
- validated Question Family references/fingerprints where applicable;
- deterministic assurance result and exact version;
- independent-review result and exact version;
- expert-review identity/status and exact version;
- known limitations;
- approval status;
- approval date; and
- a single durable **foundation fingerprint/version** representing the approved dependency set.

A useful operator representation is:

```text
AQA A-level Business 7132
Foundation version: 1.0
Course Truth: approved
Exam Truth: approved
Foundation status: APPROVED
```

The exact implementation identifier may differ, but downstream asset jobs must be able to prove which approved foundation version they use.

## Foundation approval rule

No learner-facing asset factory may start production from an unapproved or stale foundation.

`foundation_approved` means:

- exact course identity is resolved;
- source rights are approved;
- curriculum/specification coverage is complete for the declared course scope;
- Course Truth is complete for that scope;
- Exam Truth is complete for the applicable assessment scope;
- applicable deterministic checks pass;
- no unresolved blocking/material independent-review finding remains;
- qualified subject/assessment review has approved the exact foundation version or a deliberately governed equivalent approval has been recorded; and
- known limitations are explicit.

Foundation approval is educational/content approval. It does **not** replace repository Founder merge approval, publication approval or production deployment verification.

## Change and invalidation rule

An Approved Course Foundation is versioned and immutable as an approved record.

When a material source, curriculum, Course Truth or Exam Truth change occurs:

1. create a new foundation candidate/version;
2. rerun the affected foundation assurance and approval;
3. preserve the earlier approved version as history;
4. identify downstream assets whose dependency fingerprints are affected; and
5. regenerate/reassure only genuinely affected assets.

Do not silently mutate the foundation underneath published assets.

A change to one Practice generator or asset format does not invalidate Course Truth, Exam Truth or unrelated Learn assets unless a real dependency change exists.

## Asset production model

Once a foundation is approved, Revision may create independent asset-production jobs.

Every asset job must reference the Approved Course Foundation fingerprint/version and the canonical knowledge/skill nodes it covers.

The three principal learner asset factories are:

### Learn Factory

Purpose:

> Teach and explain approved Course Truth clearly and accurately.

It may create, where educationally useful:

- explanations and revision notes;
- worked examples;
- definitions and key concepts;
- formulas and quantitative explanations;
- diagrams/visual specifications;
- applications and examples;
- misconception explanations;
- topic relationships; and
- other validated learning formats.

The Learn Factory does not decide what belongs in the curriculum. It transforms approved Course Truth into learner-facing teaching material.

Learn completion contributes to the learner's Reviewed signal under Claims and Progress Governance. It does not automatically establish Exam Readiness.

### Practice Factory

Purpose:

> Give the learner sufficient opportunities to retrieve, apply and demonstrate approved Course Truth, producing valid evidence for the learner model.

It may create, where educationally appropriate:

- flashcards and retrieval prompts;
- quick checks;
- quizzes;
- short-answer work;
- calculations and data drills;
- application/case exercises;
- topic questions;
- mixed-topic practice; and
- topic tests.

Practice volume is **coverage-driven, not quota-driven**.

For each canonical knowledge/skill node the factory should determine:

1. what evidence is needed;
2. which Practice formats can validly provide that evidence;
3. what breadth, variation and difficulty are educationally useful; and
4. how much material is required to provide sufficient practice.

A Practice format must not claim to test a skill it cannot validly assess. A learner must not be forced through every Practice format merely to complete a progress bar.

Practice results feed Exam Readiness according to the evidence strength, breadth, authenticity, recency and consistency rules in Claims and Progress Governance.

### Exam Prep Factory

Purpose:

> Prepare the learner to perform against approved Exam Truth using approved Course Truth.

It may create:

- exam technique;
- paper/component guidance;
- command/response-shape guidance;
- targeted exam-style questions;
- cases, data sets and source material;
- timed sections;
- mixed/synoptic exam practice;
- full-paper/component simulations;
- Exam Simulator assets; and
- governed Marking Packs and diagnostic feedback contracts.

Exam Prep uses both Course Truth and Exam Truth.

Full mocks and representative simulations are a higher-assurance asset class than ordinary practice. They must be checked for whole-paper/component representativeness, marks, timing, assessment demand, curriculum distribution and marking behaviour before being treated as trusted simulations.

## Asset assurance

Foundation approval does not make every later generated asset automatically trustworthy.

Each asset factory must apply the Content Accuracy Assurance Gate appropriate to its content class.

At minimum:

- deterministic checks should prove mechanically provable structure;
- independent review must be separate from generation context;
- blocking/material educational findings must be remediated and revalidated;
- scored/markable assets must have valid answer/marking contracts;
- learner-facing claims must match retained assurance evidence; and
- publication state remains separate from operational generation state.

The important simplification is that asset assurance validates **a derived asset against an already approved foundation**. It does not reopen the whole course definition unless the asset exposes evidence that the foundation itself is wrong or incomplete.

If an asset reveals a credible foundation defect, stop the affected asset work and reopen the foundation through a new version rather than silently patching the learner asset around incorrect truth.

## Reuse of previous Content Factory implementation

The existing Content Factory code is implementation evidence and a source of reusable components. It is not the required shape of the new process.

### Reuse by default when it is clearly useful

Potentially reusable boundaries include:

- source-rights classifier;
- identity resolution;
- Board Alignment compiler;
- coverage compiler;
- Course Knowledge Model schemas/workers;
- Assessment Blueprint and Question Family schemas/workers;
- deterministic validators;
- independent-review contracts;
- durable artifact fingerprints;
- dependency-aware invalidation;
- cost/provenance telemetry; and
- generic candidate recovery at high-variability generative boundaries.

### Do not reuse by default

The new process should not inherit merely for compatibility:

- the old single end-to-end course state machine;
- a single `generating` state covering different educational responsibilities;
- the requirement to generate Learn + Practice + assessment before foundational approval;
- the old full-course confirmation-pilot sequence;
- qualification controls whose only purpose is proving the superseded orchestration shape;
- legacy work-unit coupling between Learn and Practice; or
- old artifact compatibility requirements that do not serve the new staged dependency model.

When reuse makes the new design materially harder to understand or operate, prefer a clean new boundary and port only the proven control or lesson.

## Operational simplicity rule

The Content Operations view should make the staged process obvious.

For a course it should be possible to see, at minimum:

```text
Foundation
  Course Truth      APPROVED
  Exam Truth        APPROVED
  Foundation        APPROVED v1.0

Assets
  Learn             not started / generating / assured / published
  Practice          not started / generating / assured / published
  Exam Prep         not started / generating / assured / published
```

Do not expose internal worker taxonomy, candidate numbering, retry mechanics or dependency graphs to an operator unless action is required.

## Founder interaction

The intended Founder interaction is deliberately simple:

1. request an exact course;
2. intervene only on genuine source/identity/policy blockers;
3. receive a concise foundation assurance decision;
4. see when the Course Foundation is approved;
5. initiate or oversee Learn, Practice and Exam Prep production; and
6. retain normal explicit Founder merge approval for governed repository changes.

The Founder should not have to coordinate model prompts, generation contexts, individual worker calls, retries or review-package assembly.

## Measures

Success is not raw content volume.

The staged model should be assessed using measures such as:

- percentage of requested courses reaching `foundation_approved` without engineering intervention;
- foundation completeness defects found by independent/expert review;
- time and cost to approved foundation;
- asset production cost by factory and course;
- asset assurance failure/remediation rate;
- percentage of asset coverage obligations satisfied;
- downstream regeneration caused by foundation changes;
- reuse rate for unaffected approved artifacts; and
- number of generic engineering interventions required across materially different courses.

## Migration from the old v2 process

The v2 end-to-end Content Factory programme is retired as the forward production target.

Migration should proceed as follows:

1. stop new paid full-course confirmation runs whose purpose is to prove the old end-to-end path;
2. preserve old pilot issues, PRs, ADRs and technical records as historical evidence;
3. close unmerged forward work that exists only to continue the old proof programme, marking it superseded;
4. build the new foundation schema/state and Foundation Factory using clean boundaries;
5. port proven worker/validator components only where they fit naturally;
6. prove one real course can reach `foundation_approved` without generating learner assets;
7. build/qualify the Learn Factory against that approved foundation;
8. build/qualify the Practice Factory against that approved foundation;
9. build/qualify the Exam Prep Factory and Marking Pack path against that approved foundation; and
10. then prove repeatability across materially different courses.

The previous factory did not achieve a final end-to-end expert-review-ready pass. That history is a reason to simplify the orchestration, not a reason to discard the substantial engineering and assurance learning it produced.

## Documentation impact

This document is the current sequencing authority for Content Factory course production.

It supersedes conflicting sequencing in:

- `80-company-workflows/Content Factory Operating Model.md`;
- `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`; and
- the end-to-end progression assumptions in `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

Those sources remain useful for non-conflicting controls and historical context until deliberately consolidated or archived.

Implementation changes must update current technical Content Factory documentation and create a new architecture decision record rather than rewriting historical ADRs. `INDEX.md` must identify this model as the current Content Factory production authority.