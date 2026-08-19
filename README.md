# Revision

A personalised revision platform for GCSE and A-level students, built around evidence-aware guidance, adaptive planning, practice and exam preparation.

## Current learner application

The governed learner product is the React application at:

`/revision/app/`

Its signed-in Home is led by **REV**, Revision's non-human intelligent study-guide identity. Home answers the immediate question **What matters today?** and combines REV's concise guidance with a smaller **Today's plan** summary.

The adaptive planner uses deterministic, testable logic rather than an AI-model call to calculate priorities. It combines assessment dates, realistic learner availability, specification/topic coverage, existing learning/readiness evidence and bounded learner planning preferences. REV explains and discusses those priorities but does not replace the planner calculation.

Global learner navigation is:

- Home
- Plan
- REV
- Progress
- Subjects

On mobile the same five destinations remain persistently available in bottom navigation, with REV in the centre and given modest visual prominence. Profile, account, Admin and other utilities remain secondary rather than taking a learner navigation slot.

### Adaptive Plan

`#/plan` is the learner's wider adaptive programme. The current implementation supports:

- learner-owned assessments with type, date and importance;
- realistic weekday/weekend revision capacity;
- date-specific capacity exceptions in the persistence model;
- deterministic topic-level priority candidates derived from the same learning evidence used by Progress;
- a current-day plan with plain-English recommendation reasons;
- calm **Prioritising** behaviour when useful remaining workload exceeds realistic capacity;
- bounded learner/REV planning preferences that can reshape sequencing without changing mastery/readiness evidence;
- planner activity states including start, completion and deliberate alternative choice; and
- automatic reconciliation of planner starts with later validated learning evidence where the match is reliable.

The plan is a current forecast, not a fixed timetable or task-debt ledger. Missed recommendations are not manually moved forward; Revision recalculates from the learner's latest state.

### REV and the planner

The dedicated REV destination opens contextually with the current planner picture rather than as a menu of AI features. A learner can question the recommendation or ask to change the short-term balance, for example by focusing more heavily on one subject for a week. REV explains relevant cross-subject consequences before a bounded planning preference is applied.

Planning preference is planning context only. It does not improve objective progress, mastery or readiness by itself.

Full generative tutoring/orchestration remains governed through the wider REV capability; FI-001 keeps the scheduling authority deterministic and explainable.

## Subject and course hierarchy

Selecting a subject opens a Subject Home. The learner then enters the relevant course/specification.

When several exam papers assess the same syllabus, the shared course exposes:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

The syllabus is learned and practised once at course level. Individual papers/components sit inside **Exam Prep**, where their targeted written questions and timed/full simulations belong. If a qualification genuinely gives components different syllabus content, those components can retain their own learning contexts.

This prevents the same topic from appearing as several separate learning gaps merely because it can be examined on several papers.

The current GitHub Pages host cannot serve arbitrary SPA deep paths directly, so the learner hierarchy uses reloadable hash routes beneath `/revision/app/`. Shared course routes are generated from catalogue identities, for example:

`/revision/app/#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/practice`

The repository root `/revision/` remains a lightweight redirect into `/revision/app/` until the future public marketing/editorial site is introduced.

See:

- `10-product-governance/Adaptive Revision Planning.md` — governing adaptive planner and REV/planner behaviour.
- `10-product-governance/Information Architecture.md` — governing learner hierarchy and primary navigation.
- `10-product-governance/Course Content and Assessment Component Placement.md` — authority for shared course learning versus paper/component Exam Prep.
- `20-brand-and-experience/Visual Brand System.md` — governing visual and REV experience authority.
- `docs/technical/Adaptive Revision Planner Implementation.md` — current FI-001 technical design and implementation boundary.
- `docs/technical/Target System Architecture.md` — current/target technical architecture.
- `decisions/ADR-0012-course-level-learning-and-exam-paper-placement.md` — implementation decision history for the course-first model.

## Repository structure

```text
/
├── app/                               # Vite entry HTML for the governed React learner app
├── src/
│   ├── app/                           # learner runtime, adaptive Plan/Home/REV, navigation, focused screens and exam simulator
│   ├── engine/                        # typed content, evidence, readiness and deterministic planning logic
│   └── services/                      # Supabase and persistence services
├── content/                           # governed typed learning content packs
├── supabase/                          # migrations, verification, Edge Functions and database support
└── index.html                         # temporary redirect from /revision/ to /revision/app/
```

## Content model and automatic catalogue discovery

The current typed content manifest represents storage/publishing units as:

`Subject → Qualification / Exam Board → Paper or Area`

The learner shell does not assume those storage units are the correct learning hierarchy. It groups published packs into courses/specifications and determines whether their learning payload is shared or genuinely component-specific.

For a shared-syllabus course the learner experience is:

`Learner → Subject → Course/specification → Learn/Practice/Progress → Exam Prep → Paper/component`

For a qualification with genuinely component-specific content, the relevant component may own its own Learn/Practice/Progress context.

Content packs live beneath `content/**/index.ts`. Each validated pack default-exports itself. The Vite content registry discovers those pack entry points automatically at build time.

A pack with `manifest.status: 'available'` enters the current pilot catalogue automatically. The shared React runtime then derives:

- the Subjects list;
- Subject Homes;
- courses/specifications;
- whether learning is shared across current paper/component packs;
- course or component routes;
- focused Learn / Practice / Exam Prep / Progress sections;
- course-level evidence aggregation for shared syllabuses;
- global Progress;
- topic-level adaptive-planner work candidates; and
- REV's evidence-aware planner explanation.

Adding a new subject or paper should not require a subject-specific React page or route branch. Content production must still establish from the official specification whether syllabus learning is course-wide or component-specific.

### Current Business catalogue

**AQA A-level Business 7132** has three available paper packs. All three can assess the same ten course areas, so Revision presents those topics once at AQA A-level Business course level. Exam Prep contains Paper 1, Paper 2 and Paper 3.

**AQA AS Business 7131** currently has one assured Paper 2 pack. The six AS areas are presented once at AQA AS Business course level because both official AS papers assess all content. Exam Prep currently shows Paper 2 only; Revision does not imply that an assured Paper 1 pack exists.

### Pilot catalogue boundary

Revision does **not yet persist per-user subject/course enrolments**. During the current Jamie pilot, all packs marked `available` are treated as part of the authenticated learner catalogue; `preview` and `planned` packs remain hidden.

Future learner enrolment should be implemented as a user-specific filter over the published catalogue. It should not require returning subject knowledge or route definitions to shared React code.

## Progress and planner evidence principle

Progress is based on evidence rather than clicks. Revision distinguishes coverage, scored understanding evidence and readiness. Readiness is withheld until the required breadth and variety of evidence exists and is accompanied by a confidence level and explanation.

For shared-syllabus courses, evidence recorded under different paper/module IDs is combined into one course-level topic evidence picture. Paper-specific exam attempts retain their paper identity while contributing to that wider course picture.

Planner context remains separate from learning evidence. Assessment dates, availability, learner preferences, planner starts and time-related signals may affect what Revision recommends, but they do not become mastery/readiness evidence by themselves.

## Planner operations

Planner persistence is protected by learner-owner Supabase RLS. Aggregate planner adoption/activity metrics are exposed only through a protected service-role Admin path after database-backed administrator verification. Missing planner-failure telemetry is reported as **Unknown**, never Healthy.

## Hosting

GitHub Pages deploys the Vite `dist/` build from `main` using `.github/workflows/deploy-pages.yml`. The workflow publishes the React learner application plus the temporary root redirect, then smoke-tests the canonical `/app/` route and confirms retired legacy learner routes are no longer published.
