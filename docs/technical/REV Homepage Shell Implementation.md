# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the governed React learner shell at `/app/`, including the REV-led Home, adaptive Plan, catalogue-driven subject/course hierarchy, course-level shared learning, paper-specific Exam Prep and evidence-aware guidance.

## Canonical learner route and runtime

The governed learner product is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the canonical signed-in global learner shell and responsive navigation/access model. It directly renders the adaptive Home, Plan and REV experiences and delegates catalogue, subject, course/component, Progress and Admin content to `src/app/App.tsx` where required. When `App` is nested inside `PlannerRuntime`, its older embedded global navigation is suppressed so only one learner-wide navigation surface is presented.

The repository root `/revision/` remains a lightweight redirect into `/revision/app/` until a future public marketing/editorial site is introduced. GitHub Pages publishes the built Vite `dist/` artifact.

## Learner-wide jobs and responsive access

The learner-wide jobs remain:

1. Home
2. Plan
3. REV
4. Progress
5. Subjects

Their presentation differs intentionally by viewport.

Desktop top navigation presents **Home / Plan / Progress / Subjects**. REV is not a desktop top-navigation item. Instead, a floating **Ask REV** control at the right of non-Admin learner screens opens a contained contextual conversation panel while preserving the current screen.

Mobile and supported tablet widths up to 960px use the persistent five-item bottom navigation **Home / Plan / REV / Progress / Subjects**, with REV in the differentiated centre position. The Revision wordmark and secondary-utility menu remain at the top.

The desktop Ask REV panel receives the current route context from `PlannerRuntime`. Where a subject/course/component route identifies a subject reliably, that subject is passed into the embedded REV conversation so the learner does not have to restate known context. The dedicated REV route remains available for mobile navigation and deep links.

Subject Home groups published material by course/specification.

The shell distinguishes two academic shapes.

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

`#/rev` remains a valid dedicated REV route. On mobile/tablet it is the destination opened from the centre bottom-navigation item. Desktop ordinarily reaches REV through the contextual panel without changing route.

## Home personalisation

The Home greeting pattern is:

`Hey {first name}, what shall we do today?`

`PlannerRuntime` resolves the signed-in learner first name from Supabase user metadata (`first_name`, `given_name` or `name`) with a conservative email-local-part fallback. Design/example names are not hard-coded into the Home experience.

## REV and evidence behaviour

The learner shell still loads evidence by the existing persisted `module_id` because paper/component IDs remain useful for provenance and exam attempts.

For a shared-learning course, `createCourseLearningState`:

1. gathers evidence recorded under every published paper/component module ID in the course;
2. normalises those records to the course's canonical learning adapter for the readiness/recommendation calculation;
3. counts topic coverage once; and
4. returns one course-level recommendation/readiness state.

This means AQA A-level Business does not appear to REV as three separate copies of Marketing, Finance or Strategic Change merely because the same syllabus can be assessed on Papers 1, 2 and 3.

Global Progress and REV use these course-level states. Paper-specific exam attempts remain attributable to their paper module and feed back into the combined course evidence picture.

The embedded desktop REV panel reuses `PlannerRevScreen`; it is not a separate assistant implementation. When a reliable subject context is supplied, planning conversation may use that subject without requiring an explicit subject-name mention. Existing evidence and planner limitations still apply.

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

- `src/app/PlannerRuntime.tsx` — canonical signed-in learner shell, responsive global access model, current-route REV context and desktop Ask REV panel.
- `src/app/PlannerRevScreen.tsx` — full REV route plus embedded contextual desktop conversation mode.
- `src/app/learner-shell-home.css` — governed learner shell and Home visual migration layer.
- `src/app/desktop-rev-access.css` — desktop floating Ask REV and right-side panel treatment.
- `src/app/planner.css` — earlier runtime navigation styling and responsive breakpoint behaviour.
- `src/app/planner-runtime.css` — nested-shell suppression and runtime display switching.
- `src/app/App.tsx` — catalogue, Subject Home, course/component rendering, Progress and supporting legacy shell implementation when nested.
- `src/app/catalogue-model.ts` — course grouping, shared-learning detection and course learning state.
- `src/app/navigation.ts` — course and component hash routes.
- `src/app/FocusedLearningWorkspace.tsx` — shared Learn/Practice and exam-technique activities.
- `src/app/ExamSimulator.tsx` — targeted question and timed paper practice.
- `src/app/course-exam.css` — paper selector presentation inside Exam Prep.
- `src/engine/content/content-registry.ts` — automatic pack discovery/publication filtering.
- `src/engine/content/content-adapter.ts` — generic validated learning-content interface.
- `src/engine/readiness/readiness.ts` — deterministic readiness/recommendation logic.
- `tests/e2e/app-responsive.spec.ts` — responsive hierarchy and global navigation assurance.
- `tests/e2e/learner-shell-home-brand.spec.ts` — Brand System Increment B navigation, contextual REV, personalisation and visual assurance.

## Documentation and decision record

Normative navigation/access authority is `10-product-governance/Information Architecture.md`, specialised visually by `20-brand-and-experience/REV Responsive Access Pattern.md` and the wider `20-brand-and-experience/Visual Brand System.md`.

Normative placement authority is `10-product-governance/Course Content and Assessment Component Placement.md`.

Architecture decision history is recorded in `decisions/ADR-0012-course-level-learning-and-exam-paper-placement.md`.

Historical content assurance records are unchanged because this implementation reorganises already-assured content rather than rewriting the educational material.
