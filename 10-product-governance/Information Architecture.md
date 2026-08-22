# Information Architecture

**Status:** Draft authority candidate — v1.0 proposal pending governed merge  
**Purpose:** Define the top-level structure and scalable learner hierarchy of the Revision student experience.

## Principle

The information architecture should make Revision feel clear, calm and purposeful.

The student should not need to understand the product's internal complexity. The global structure should reflect the highest-level jobs they are trying to do:

- understand what matters now;
- see and shape their wider revision plan;
- get intelligent support from REV from wherever they are;
- understand progress across their programme; and
- go directly to a course or activity they want to work on.

Learning, practice and exam-preparation tools remain contextual to the relevant course, paper/component or topic rather than competing as global destinations.

Navigation should remain recognisable and relatively flat at global scope, while the active course branch may expand progressively. Avoid duplicate entry points, unnecessary menu complexity and making learners navigate through academic metadata they do not need for the current job.

## Primary global navigation

The learner-wide destinations are:

1. **Home**
2. **Plan**
3. **Progress**
4. **Courses**

The persistent learner-wide action is:

- **Ask REV**

REV is therefore not primarily a peer destination alongside the four learner-wide destinations. It is an ongoing intelligent-coach relationship available from any learner screen.

Courses is the learner-led route into the qualifications/specifications they actually study. It represents the authenticated learner's saved course set rather than the complete published Revision catalogue.

Practice and Exam Prep remain core capabilities within a selected course/component rather than global destinations.

Account, profile, settings, plan/subscription management, help, privacy and similar utilities remain secondary. Detailed responsive and contextual-expansion behaviour is governed by `Global Learner Navigation.md`.

## Academic hierarchy versus learner navigation

Revision must preserve the official academic structure where it matters while projecting a simpler learner-facing navigation model.

The underlying academic/content hierarchy remains:

```text
Subject
└── Course / specification
    └── Paper / component where applicable
        └── Topic / specification area
            └── Learning, practice or exam-preparation activity
                └── Evidence and feedback
```

Subject therefore remains important metadata and a valid grouping for course discovery, catalogue organisation, reporting and official specification context.

The everyday learner navigation projection is deliberately flatter:

```text
Learner
└── Courses
    ├── saved course
    │   ├── Overview
    │   ├── Learn
    │   ├── Practice where available
    │   ├── Exam Prep where available
    │   └── Progress
    └── saved course
```

The learner does not need to navigate through Subject Home to reach a course already in their programme.

Where a qualification genuinely has component-specific learning rather than one shared course-level learning scope, the course may expose the relevant paper/component structure before focused sections.

Topics/specification areas are shared academic identities across Learn, Practice, Exam Prep and Progress rather than duplicated entities.

## Learner course membership

A published course and a learner's course are different concepts:

- **Published course** — supported content exists in Revision.
- **Learner course membership** — the authenticated learner has explicitly added that course to their active Revision programme.

Course membership is programme context, not learning evidence.

The learner's active course set is used to scope learner-wide Home recommendations, Plan, global Progress and REV programme context. Revision must not treat every published course as belonging to every learner.

Removing a course from the active set must not delete historical evidence or attempts. Re-adding a course may reconnect existing historical evidence subject to normal evidence quality/recency rules.

## Home

Home is the default signed-in destination and should answer:

> **What matters now, and what should I do today?**

Home operates at learner-wide scope and may consider the learner's active courses, current plan, assessment timing, evidence, coverage, recent activity, relative weaknesses, learner choices and realistic available time.

Home must not recommend work from a published course that is not in the learner's active course set.

Its strongest element should be concise REV guidance. A smaller **Today's plan** summary may show the current day's intended workload and link directly to Plan.

Home may include a prominent `Ask REV anything…` input as part of the opening composition. The learner remains free to ignore recommendations and choose work through Courses or Plan.

## Plan

Plan is a primary global destination and answers:

> **What does my current revision programme look like?**

Plan is governed in detail by `Adaptive Revision Planning.md`.

The programme scope must be based on the learner's active courses rather than the complete published catalogue. If the learner has no active courses, Plan must not fabricate a meaningful study programme; it should direct the learner to establish Courses first.

The default view should remain chronological and adaptive rather than a traditional fixed calendar grid.

## REV

REV is the ongoing intelligent-coach relationship and a persistent global action.

At learner-wide scope, REV may use:

- active saved courses;
- current plan;
- progress/activity/evidence;
- upcoming assessments; and
- other governed learner context.

Within a selected course/component/topic/activity, REV narrows to that immediate context while retaining appropriate wider learner context.

These are contextual scopes of one assistant relationship, not separate assistants.

REV must not infer that a learner studies a course merely because that course is published in Revision.

## Progress

Progress is a global destination that helps the student understand the bigger picture across their active courses.

It answers:

> **How am I doing, and what needs attention?**

It should support progressive drill-down:

```text
All active courses → Course/specification → Paper/component → Topic
```

Subject may still appear as useful grouping/metadata where multiple courses make that clearer, but the learner-facing primary set is active courses.

Global and contextual Progress views use the same underlying evidence model. Progress should distinguish coverage, understanding/mastery and exam readiness and should prioritise meaning over dashboard density.

## Courses

Courses is the learner-led route and answers:

> **What course do I want to work on?**

Selecting Courses opens a page showing the learner's saved/active courses and a clear **Add Course** action.

Each course should be identifiable using the minimum context needed to avoid ambiguity, for example subject, qualification/level, exam board and specification code.

### Add Course

Add Course lets the learner browse/search the published supported catalogue and explicitly add a course to their active Revision programme.

Course discovery may use the underlying academic hierarchy:

```text
Subject → qualification/level → exam board → specification/course
```

That hierarchy is useful for finding the right course but does not become the permanent global navigation path.

Adding a course updates the learner's active programme and makes the course available to Courses navigation, Plan, Progress, Home recommendations and REV programme context.

### Remove Course

The learner must be able to remove a course from their active programme so mistakes and genuine programme changes can be corrected.

Removal requires a clear confirmation, removes the course from active programme scope and navigation, and does not delete historical learning evidence.

### Empty state

A learner with no active courses sees a calm explanation and Add Course as the primary next action. Other programme-wide surfaces should fail safely rather than pretending a full published catalogue is the learner's programme.

## Course / specification and paper / component

A selected course opens its Overview directly rather than requiring Subject Home first.

Where enough depth exists, the standard focused sections are:

### Overview

Answers: **Where am I here, and what should I do next?**

### Learn

Answers: **Help me understand this.**

May include notes, explanations, worked examples, visual material and other justified learning formats.

### Practice

Answers: **Help me test whether I know this.**

Includes active recall, flashcards, quizzes, topic tests, application work, exam-style questions and other validated practice. Practice should feed evidence back into the wider learner model.

### Exam Prep

Answers: **Help me perform in the real exam.**

Includes targeted exam-question work, timed practice, technique support, full-paper/component work and the Exam Simulator where supported.

### Contextual Progress

Answers: **How am I doing here, and what needs attention?**

This is a drill-down of the same global evidence model, not a separate progress system.

## Focused-section rule

Learn, Practice, Exam Prep and contextual Progress should normally be distinct navigable sections or focused screen states where the academic context has meaningful depth.

The selected course/component may expose its applicable focused sections in contextual navigation. That does not make those sections learner-wide destinations.

Deep-linking/addressability should be preserved so REV and Plan can take the learner directly into relevant work.

## Topic behaviour

Topics are cross-cutting academic entities. A topic reached through Learn, Practice, Exam Prep or Progress should resolve to the same underlying topic/specification identity and evidence model.

## Navigation model

### Desktop

Desktop uses a persistent left learner rail.

The top area exposes:

- REV identity;
- prominent **Ask REV**;
- Home;
- Plan;
- Progress; and
- Courses.

When Courses is active, the rail shows the learner's saved courses directly beneath it. The selected course expands into its applicable focused sections. Other courses remain collapsed.

The bottom area exposes one compact authenticated account control. Account behaviour is governed by `Global Learner Navigation.md`.

### Tablet and mobile

Tablet and mobile use:

- a compact top bar with a two-line menu control and REV identity;
- a slide-out left navigation drawer for Home, Plan, Progress and Courses;
- contextual saved-course expansion inside the active Courses branch;
- account utilities in the lower part of that drawer; and
- a persistent bottom-anchored **Ask REV** action dock as the only persistent bottom learner action.

Profile, Settings, Upgrade, permission-gated Admin and Log out remain separate account/utility jobs.

## Course routing and compatibility

The canonical learner-facing route should reflect the governed language rather than preserving `Subjects` in the URL indefinitely.

The target canonical pattern is:

- `#/courses` for the learner course index; and
- course-scoped routes beneath `#/courses/...` for course and component work.

Existing `#/subjects/...` routes may remain as compatibility inputs during migration so bookmarks and existing Plan/REV links continue to resolve, but they are not the future product vocabulary or canonical route family.

## Design guardrails

The information architecture should:

- keep the learner-wide next action prominent on Home;
- make Today's plan visible without turning Home into the full planner;
- make Plan a genuine primary job;
- make Ask REV distinctive, contextual and available from any learner screen;
- make the learner's own courses directly reachable;
- distinguish published catalogue availability from active learner membership;
- preserve official subject/specification structure in the academic model without forcing unnecessary navigation hops;
- use focused learning/practice/exam-prep/progress sections where depth justifies them;
- avoid duplicate topic identities across learning modes;
- keep global navigation flat and recognisable when Courses is not active;
- expand only the selected course into its focused sections;
- prevent the desktop rail and responsive drawer becoming dumping grounds;
- avoid excessive dashboard density;
- use progressive disclosure for secondary detail;
- remain fully usable on mobile and with assistive technology; and
- allow future subjects, courses and components to be added without redesigning the global structure.

## FI-020 readiness boundary

FI-020 completed the governed Definition of Ready and received explicit Founder `Analyse → Ready` approval on 2026-08-22.

Material production implementation may begin only after this v1.0 authority change is integrated into current approved `main`, and must then follow the Governed Implementation Workflow.

## Documentation impact

This v1.0 proposal must remain aligned with `Global Learner Navigation.md`, `Adaptive Revision Planning.md`, applicable core journeys, the learner-course persistence model, canonical route/runtime technical documentation and responsive/browser assurance. Historical audits and earlier route evidence remain historical rather than being rewritten.
