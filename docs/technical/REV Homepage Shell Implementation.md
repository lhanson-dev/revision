# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the governed React learner shell at `/app/`, including the REV-led Home, catalogue-driven subject/course hierarchy, course-level shared learning, paper-specific Exam Prep and evidence-aware guidance.

## Canonical learner route and runtime

The governed learner product is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/App.tsx`

The repository root `/revision/` remains a lightweight redirect into `/revision/app/` until a future public marketing/editorial site is introduced. GitHub Pages publishes the built Vite `dist/` artifact.

## Learner hierarchy

Global navigation remains:

1. Home
2. Subjects
3. Progress
4. REV

Subject Home groups published material by course/specification.

The shell now distinguishes two academic shapes.

### Shared-syllabus course

When several paper/component packs expose the same learning content, Revision presents one course-level learning scope:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

Learn, general Practice and course/topic Progress appear once. Exam Prep contains the individual papers/components and their paper-specific written-question and timed/full-paper practice.

### Distinct-content component

If components genuinely expose different syllabus content, each component can retain its own Overview / Learn / Practice / Exam Prep / Progress context.

This behaviour implements `10-product-governance/Course Content and Assessment Component Placement.md`; storage boundaries do not determine the learner hierarchy.

## Catalogue and shared-learning detection

`src/engine/content/content-registry.ts` discovers validated `content/**/index.ts` packs using Vite `import.meta.glob`. Only `available` packs enter the current pilot catalogue.

`src/app/catalogue-model.ts` groups packs into subjects and courses using awarding body, qualification and specification identity.

For each course it compares the validated learning payload represented by:

- topics;
- formulas;
- topic links;
- flashcards;
- quick-check questions;
- case/application material; and
- quantitative/data drills.

Exam simulations and exam-technique records are not used to decide whether the underlying syllabus is shared.

If all current course packs have the same learning payload, the course is treated as a shared-learning course. A course with one published component is also presented at course level because the component pack does not make its syllabus component-owned by itself.

This inference is generic and contains no Business-specific route branch.

## Routes

GitHub Pages does not provide arbitrary SPA rewrites, so the learner hierarchy uses reloadable hash routes.

Course-level shared learning uses:

`#/subjects/:subjectId/courses/:courseId/:section`

For example:

- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/overview`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/learn`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/practice`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/exam-prep`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/progress`

Component routes remain available for genuinely distinct content:

`#/subjects/:subjectId/modules/:moduleId/:section`

Recent module URLs are preserved for compatibility. If such a module belongs to a shared-learning course, the screen resolves to that course-level experience rather than exposing a duplicate syllabus.

## REV and evidence behaviour

The learner shell still loads evidence by the existing persisted `module_id` because paper/component IDs remain useful for provenance and exam attempts.

For a shared-learning course, `createCourseLearningState`:

1. gathers evidence recorded under every published paper/component module ID in the course;
2. normalises those records to the course's canonical learning adapter for the readiness/recommendation calculation;
3. counts topic coverage once; and
4. returns one course-level recommendation/readiness state.

This means AQA A-level Business does not appear to REV as three separate copies of Marketing, Finance or Strategic Change merely because the same syllabus can be assessed on Papers 1, 2 and 3.

Global Progress and REV use these course-level states. Paper-specific exam attempts remain attributable to their paper module and feed back into the combined course evidence picture.

## Focused learning capabilities

`src/app/FocusedLearningWorkspace.tsx` remains adapter-driven.

### Learn

Course-level Learn presents shared topic explanations and topic links.

### Practice

For a shared-syllabus course, general Practice includes:

- flashcards;
- quick checks;
- guided case/application practice; and
- formulas/data drills.

Paper-specific written exam questions are intentionally excluded from general course Practice.

### Exam Prep

Exam Prep contains:

- shared exam technique where appropriate; and
- a paper/component selector.

Each published paper expands to expose its own `ExamSimulator`. The simulator supports both:

- targeted single-question written practice with self-assessed AO evidence; and
- the full timed simulation.

`ExamSimulator` derives the paper label from the exam metadata and no longer contains an AS Paper 2 / Harbour Home assumption, so the same component works for A-level Papers 1, 2 and 3 and future packs.

### Progress

Shared course Progress aggregates course/topic evidence once across paper module IDs. It does not multiply topic totals by the number of exam papers.

## Current Business behaviour

### AQA A-level Business 7132

The three available packs share the same ten-area learning payload. The learner therefore sees one **AQA A-level Business** course with one Learn, one Practice and one Progress experience.

Exam Prep contains:

- Paper 1: Business 1;
- Paper 2: Business 2; and
- Paper 3: Business 3.

Each retains its own simulation and exam evidence identity.

### AQA AS Business 7131

The currently available AS pack is stored under Paper 2, but AQA's six AS subject areas are treated as **AQA AS Business** course learning rather than as a Paper 2-owned syllabus.

The learner therefore sees one AS course-level Learn/Practice/Progress experience. Exam Prep currently exposes Paper 2 because that is the only assured AS paper pack in the repository.

Revision does not invent or display an AS Paper 1 simulation until an assured Paper 1 pack is produced and published.

## Pilot catalogue boundary

There is still no persisted per-user course enrolment model. During the Jamie pilot all `available` packs are discoverable; `preview` and `planned` packs remain hidden.

Future enrolment should filter the published course catalogue rather than reintroducing subject-specific or paper-specific routing logic.

## Key implementation files

- `src/app/App.tsx` — global shell, Subject Home, course/component rendering, REV and progress aggregation.
- `src/app/catalogue-model.ts` — course grouping, shared-learning detection and course learning state.
- `src/app/navigation.ts` — course and component hash routes.
- `src/app/FocusedLearningWorkspace.tsx` — shared Learn/Practice and exam-technique activities.
- `src/app/ExamSimulator.tsx` — targeted question and timed paper practice.
- `src/app/course-exam.css` — paper selector presentation inside Exam Prep.
- `src/engine/content/content-registry.ts` — automatic pack discovery/publication filtering.
- `src/engine/content/content-adapter.ts` — generic validated learning-content interface.
- `src/engine/readiness/readiness.ts` — deterministic readiness/recommendation logic.
- `tests/e2e/app-responsive.spec.ts` — responsive hierarchy assurance.

## Documentation and decision record

Normative placement authority is `10-product-governance/Course Content and Assessment Component Placement.md`.

Architecture decision history is recorded in `decisions/ADR-0012-course-level-learning-and-exam-paper-placement.md`.

Historical content assurance records are unchanged because this implementation reorganises already-assured content rather than rewriting the educational material.