# AQA A-level Psychology 7182 — Practice Experience Matrix

**Status:** Experimental candidate under the Source-First Course Prototype exception. Not approved learner content.
**Specification checked:** AQA 7182 v1.4 (1 September 2025), first A-level exams Summer 2027.
**Data:** `practice-experience-matrix.json`

## What this is

The learner-experience layer that sits on top of Psychology Course Truth, Exam Truth and the Course Learning Blueprint. It adds no curriculum or assessment truth. For each of the 118 Course Truth requirements it records:

- **Formats:** the engaging practice formats to use, lead format first (for example Study Autopsy, Evaluation Duel, Apply It, The Clinic, Debate Link-up).
- **Demands:** what the student must be able to do (describe, apply, evaluate, calculate, choose a test...).
- **Named in specification:** researchers, studies, models and terms the specification requires.
- **Specification boundary:** where v1.4 is precise about scope. Examples: conformity types are internalisation and compliance only; the working memory model's named features are coding and capacity; the sign test is the only inferential test calculated in full.
- **Issues and Debates links / cross-topic links:** the synoptic connections that earn evaluation marks.
- **Scenario hook:** a Revision-authored, student-relevant situation to frame application tasks.
- **Sensitivity:** `care` topics use third-person fictional cases only, with no personal-disclosure prompts.

## Why

The Blueprint selects learning obligations mechanically from Course Truth text. It cannot tell which tasks will feel engaging, or where the specification draws a precise line. Assessment is roughly 36–38% AO3 (evaluation), 25–30% research methods and at least 10% maths. Recall-heavy practice cannot meet that mix, so this layer makes the practice formats follow the marks.

## How the site uses it

Every format maps onto Practice activity modes the learner-asset builder already produces (`scripts/content/derive-psychology-learner-assets.ts`), so no new activity runtime is needed to render a format.

The matrix travels on the optional `practiceExperience` field of each Psychology paper ContentPack. Screens can then call:

- `adapter.listPracticeFormats()`
- `adapter.listPracticeDesigns(topicId?)`
- `adapter.getPracticeDesign(topicId, sectionId)`

For Psychology-specific helpers (paper placement, Paper 3 option filtering, Issues and Debates link sets), see `content/psychology/aqa-a-level/shared/practice-experience.ts`.

**No learner screen renders this yet.** A learner-facing practice-format experience is material product-feature work and needs its own `Ready` approval under `80-company-workflows/Feature Definition and Measurement Workflow.md`.

## Assurance

`content/psychology/aqa-a-level/shared/practice-experience.test.ts` proves:

- all 118 requirements are covered exactly once;
- every design keys to an existing learner topic section;
- every format maps to existing Practice modes;
- paper, section and Paper 3 option placement are correct;
- calculation boundaries match v1.4;
- Issues and Debates tasks link to valid examples;
- option filtering works;
- sensitive topics stay third-person;
- AO3-bearing formats meet the AO3 floor.

`contentPackSchema` additionally rejects any pack design that points at an unknown topic section or format.

## Open point for the Founder

Standard deviation is ambiguous in the specification. Subject content names calculation of range, but the maths annex lists "calculate standard deviation". The matrix treats interpretation as required and calculation as a point to confirm with AQA (psychology@aqa.org.uk) before Revision sets SD calculation questions.

## Rights

AQA material is `REFERENCE_ONLY`. The matrix uses structured facts only. Named terms are listed because the specification requires them. All descriptions, hooks and format text are Revision-authored.
