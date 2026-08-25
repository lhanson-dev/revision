# Revision

A personalised revision platform for GCSE and A-level students, built around evidence-aware guidance, adaptive planning, practice and exam preparation.

## Current learner application

The governed learner product is the React application at:

`/revision/app/`

Its signed-in Home is led by **REV**, Revision's non-human intelligent study-guide identity. Home answers the immediate question **What should I do today?** through a prominent REV hero followed directly by **Today’s revision plan**, where one useful first task is promoted and the rest of today’s work remains easy to scan. When full planner setup is incomplete, Home can use the existing deterministic evidence recommendation model rather than blocking useful revision on missing assessment or availability data.

The adaptive planner uses deterministic, testable logic rather than an AI-model call to calculate priorities. It combines assessment dates, realistic learner availability, specification/topic coverage, existing learning/readiness evidence and bounded learner planning preferences. REV explains and discusses those priorities but does not replace the planner calculation.

Global learner navigation is:

- Home
- Plan
- Progress
- Courses

**Ask REV** remains the persistent global action rather than a peer navigation destination. Desktop uses the left rail; tablet/mobile use the compact menu/drawer for learner destinations with the prominent Ask REV action retained separately.

The Courses branch projects only the authenticated learner's saved active courses. Selecting a saved course expands its applicable Overview / Learn / Practice / Exam Prep / Progress sections without forcing a Subject navigation hop.

### Adaptive Plan

`#/plan` is the learner's wider adaptive programme. The current implementation supports:

- learner-owned assessments with exact active-course identity, type, date and importance;
- realistic weekday/weekend revision capacity;
- date-specific capacity exceptions in the persistence model;
- deterministic topic-level priority candidates derived from the same learning evidence used by Progress;
- a current-day plan with plain-English recommendation reasons;
- calm **Prioritising** behaviour when useful remaining workload exceeds realistic capacity;
- bounded learner/REV planning preferences that can reshape sequencing without changing mastery/readiness evidence;
- planner activity states including start, completion and deliberate alternative choice; and
- automatic reconciliation of planner starts with later validated learning evidence where the match is reliable.

The plan is a current forecast, not a fixed timetable or task-debt ledger. Missed recommendations are not manually moved forward; Revision recalculates from the learner's latest state.

Learner-wide planning considers only the learner's active saved courses. Published courses that the learner has not selected cannot enter new programme-wide recommendations.

### REV and the planner

The dedicated Ask REV experience opens contextually with the learner's current planner/programme picture rather than as a menu of AI features. A learner can question the recommendation or ask to change the short-term balance. REV explains relevant cross-course consequences before a bounded planning preference is applied.

Planning preference is planning context only. It does not improve objective progress, mastery or readiness by itself.

Course membership is also programme context only. Adding a course does not create learning evidence, and removing a course does not delete historical learning evidence.

Full generative tutoring/orchestration remains governed through the wider REV capability; FI-001 keeps the scheduling authority deterministic and explainable.

## Courses and academic hierarchy

The learner-facing programme starts from **Courses**. `#/courses` shows the authenticated learner's saved active courses and provides Add Course and confirmed Remove Course actions.

Subject remains academic/catalogue metadata and may organise Add Course discovery, but it is not a required everyday navigation hop.

When several exam papers assess the same syllabus, the shared course exposes:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

The syllabus is learned and practised once at course level. Individual papers/components sit inside **Exam Prep**, where their targeted written questions and timed/full simulations belong. If a qualification genuinely gives components different syllabus content, those components can retain their own learning contexts.

This prevents the same topic from appearing as several separate learning gaps merely because it can be examined on several papers.

The current GitHub Pages host cannot serve arbitrary SPA deep paths directly, so the learner hierarchy uses reloadable hash routes beneath `/revision/app/`. Canonical learner-facing routes use stable course identities, for example:

`/revision/app/#/courses/aqa%3Aaqa-a-level%3A7132/practice`

and, where a course genuinely requires component-specific learning:

`/revision/app/#/courses/:courseId/components/:moduleId/:section`

Previous `#/subjects/...` hashes are compatibility inputs only and are normalised to canonical Courses routes by the learner runtime.

The repository root `/revision/` remains a lightweight redirect into `/revision/app/` until the future public marketing/editorial site is introduced.

See:

- `10-product-governance/Returning Student Home Experience.md` — governing Returning Student Home hierarchy and direct first-task launch.
- `20-brand-and-experience/Subject Accent Colour System.md` — governed subject accent mapping and usage.
- `10-product-governance/Adaptive Revision Planning.md` — governing adaptive planner and REV/planner behaviour.
- `10-product-governance/Information Architecture.md` — governing learner hierarchy and primary navigation.
- `10-product-governance/Global Learner Navigation.md` — governing desktop/responsive global navigation and Ask REV behaviour.
- `10-product-governance/Course Content and Assessment Component Placement.md` — authority for shared course learning versus paper/component Exam Prep.
- `20-brand-and-experience/Visual Brand System.md` — governing visual and REV experience authority.
- `docs/technical/Returning Student Home Implementation.md` — current Home runtime, fallback, subject accents and direct useful-activity implementation.
- `docs/technical/Learner Courses Implementation.md` — FI-020 learner-course membership, routing and programme-scope implementation.
- `docs/technical/Adaptive Revision Planner Implementation.md` — current FI-001 technical design and implementation boundary.
- `docs/technical/Target System Architecture.md` — current/target technical architecture.
- `decisions/ADR-0012-course-level-learning-and-exam-paper-placement.md` — implementation decision history for the course-first learning model.

## Repository structure

```text
/
├── app/                               # Vite entry HTML for the governed React learner app
├── src/
│   ├── app/                           # learner runtime, Courses, adaptive Plan/Home/REV, navigation, focused screens and exam simulator
│   ├── engine/                        # typed content, evidence, readiness and deterministic planning logic
│   └── services/                      # Supabase learner-course, auth, progress and platform services
├── content/                           # governed typed learning content packs
├── supabase/                          # migrations, verification, Edge Functions and database support
└── index.html                         # temporary redirect from /revision/ to /revision/app/
```

## Content model, learner membership and automatic catalogue discovery

The current typed content manifest represents storage/publishing units as:

`Subject → Qualification / Exam Board → Paper or Area`

The learner shell does not assume those storage units are the correct everyday navigation hierarchy. It groups published packs into stable courses/specifications and projects the learner experience from the intersection of:

`published supported catalogue × authenticated learner course membership`

For a shared-syllabus course the learner experience is:

`Learner → Courses → saved course/specification → Learn/Practice/Progress → Exam Prep → Paper/component`

For a qualification with genuinely component-specific content, the relevant component may own its own Learn/Practice/Progress context beneath the saved course.

Content packs live beneath `content/**/index.ts`. Each validated pack default-exports itself. The Vite content registry discovers those pack entry points automatically at build time.

A pack with `manifest.status: 'available'` enters the supported published catalogue automatically. The shared React runtime then derives:

- subjects as academic/catalogue metadata;
- courses/specifications and stable course IDs;
- whether learning is shared across current paper/component packs;
- course or component routes;
- focused Learn / Practice / Exam Prep / Progress sections;
- course-level evidence aggregation for shared syllabuses; and
- the published choices available to Add Course.

Persisted `learner_courses` then determines which of those published courses belong to the learner's active programme. Home, Plan, global Progress and learner-wide REV project from that active course set rather than the complete catalogue.

Adding a new subject or paper should not require a subject-specific React page or route branch. Content production must still establish from the official specification whether syllabus learning is course-wide or component-specific.

### Current Business catalogue

**AQA A-level Business 7132** has three available paper packs. All three can assess the same ten course areas, so Revision presents those topics once at AQA A-level Business course level. Exam Prep contains Paper 1, Paper 2 and Paper 3.

**AQA AS Business 7131** currently has one assured Paper 2 pack. The six AS areas are presented once at AQA AS Business course level because both official AS papers assess all content. Exam Prep currently shows Paper 2 only; Revision does not imply that an assured Paper 1 pack exists.

### Learner-course membership boundary

`public.learner_courses` stores authenticated learner-owned active course membership using `(user_id, course_id)` as the duplicate-safe identity. RLS restricts browser access to the learner's own rows.

Before FI-020, the pilot runtime treated all available Business courses as the learner programme. The FI-020 migration therefore performs one bounded compatibility seed for users who already exist when the migration is applied, using exactly the two course identities that the previous pilot runtime exposed. Future users and future published courses are not automatically enrolled.

Removing membership changes active programme scope only. Historical learning evidence and exam attempts remain independently retained and can contribute again if the course is later re-added, subject to the normal evidence rules.

If a saved course ID no longer resolves to the published catalogue, Revision does not silently map it to another course. It preserves historical evidence, excludes the unresolved course from new study/recommendation actions and surfaces an integrity condition.

## Progress and planner evidence principle

Progress is based on evidence rather than clicks. Revision distinguishes coverage, scored understanding evidence and readiness. Readiness is withheld until the required breadth and variety of evidence exists and is accompanied by a confidence level and explanation.

For shared-syllabus courses, evidence recorded under different paper/module IDs is combined into one course-level topic evidence picture. Paper-specific exam attempts retain their paper identity while contributing to that wider course picture.

Planner context and course membership remain separate from learning evidence. Assessment dates, availability, learner preferences, planner starts, time-related signals and active-course membership may affect what Revision recommends, but they do not become mastery/readiness evidence by themselves.

## Planner and course operations

Planner and learner-course persistence are protected by learner-owner Supabase RLS. Course-management telemetry is stored separately from learning evidence. Aggregate operational evidence remains protected through Admin/service boundaries; missing operational evidence is reported as **Unknown**, never Healthy.

## Hosting and release readiness

GitHub Pages deploys the Vite `dist/` build from `main` using `.github/workflows/deploy-pages.yml`. The workflow publishes the React learner application plus the temporary root redirect, then smoke-tests the canonical `/app/` route and confirms retired legacy learner routes are no longer published.

The frontend does not apply Supabase migrations itself. FI-020 advances the production backend-readiness contract to `courses-v1`; the Pages deployment must fail closed until production exposes the learner-course tables and the matching readiness contract.