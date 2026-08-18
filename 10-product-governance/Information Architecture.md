# Information Architecture

**Status:** Draft authority candidate — v0.3  
**Purpose:** Define the top-level structure and scalable learner hierarchy of the Revision student experience.

## Principle

The information architecture should make the product feel clear, calm and purposeful.

The student should not have to understand the internal complexity of Revision in order to use it. The global structure should reflect the highest-level jobs they are trying to do: understand what matters now, move between subjects, understand overall progress and get guidance from REV.

Learning, practice and exam-preparation tools should then appear in the context of the subject, course, paper/component or topic they apply to rather than competing as global destinations before that context is known.

Navigation should remain recognisable and relatively flat. Avoid deep nesting, competing entry points and unnecessary menu complexity.

## Primary global navigation

The primary learner navigation is:

1. Home
2. Subjects
3. Progress
4. REV

These destinations operate across the learner's wider revision programme rather than one particular paper or activity.

Practice and Exam Prep remain core product capabilities, but they are contextual capabilities within a selected subject/course rather than primary global navigation destinations.

Account, settings, subject management and similar utilities remain secondary.

## Learner hierarchy

Revision should be designed from the outset for a learner with multiple subjects and multiple assessment components, even when the first live content catalogue is narrower.

The conceptual hierarchy is:

```text
Learner
└── Subject
    └── Course / specification
        └── Paper / component where applicable
            └── Topic / specification area
                └── Learning, practice or exam-preparation activity
                    └── Evidence and feedback
```

Not every qualification must expose every level. Some specifications may use components, themes, texts, skills or other exam-board structures rather than numbered papers. Revision should preserve the official structure where it matters without forcing every subject into the current Business model.

The learner should normally be able to move from a global recommendation to useful work in a small number of understandable steps.

## Home

Home is the default signed-in landing area and should answer the most important question first:

> What should I do now?

Home operates at the learner-wide level. REV's recommendation on Home should consider the student's wider revision picture across all enrolled subjects, including evidence, coverage, recent activity, relative weaknesses and exam context where known.

A Home recommendation may therefore first identify the subject that deserves attention before selecting a deeper activity.

For example:

> Business would be the best use of your time today. Shall I take you there?

The learner remains free to ignore the recommendation and choose another subject.

Home may also provide a small number of quiet supporting signals and signposts, such as:

- the learner's enrolled subjects;
- high-level progress across subjects;
- recent activity;
- relevant warnings or encouragement; and
- routes into Subjects, Progress and REV.

Home should not assume that the learner has only one course or paper merely because the current catalogue is limited.

Home should remain focused. It should not become a busy activity feed or dashboard full of competing widgets. The learner should be able to scan Home quickly and identify the main action without reading long explanatory text. Secondary detail may be progressively disclosed rather than competing with the main task.

## Subjects

Subjects is the learner's structured view of all subjects they have added.

Students with more than one subject must be able to switch between them easily.

Selecting a subject opens a subject Home rather than dropping immediately into one activity or paper.

### Subject Home

Subject Home answers:

> What should I work on in this subject?

It should show the learner's course/specification context within that subject and provide direct access to the official underlying structure.

Subject Home may include:

- the learner's course/specification and exam board;
- relevant paper/component structure;
- subject-level progress and coverage;
- weaknesses or under-covered areas;
- recent subject activity;
- REV guidance scoped to that subject; and
- routes into learning, practice and exam-preparation work.

REV remains visible or contextually available on Subject Home. It is the same assistant relationship as global REV, but the current subject becomes explicit context.

For example:

> For Business, I’d continue with Paper 2. Marketing is currently the area where I have least evidence.

### Course / specification and paper / component

Within a subject, the learner should be able to browse the official course/specification structure and see topic-by-topic coverage and progress rather than having the syllabus hidden behind recommendations.

Where a course has papers or components, these provide a useful next level of organisation. Where it does not, Revision should use the appropriate official structure instead of inventing a paper hierarchy.

At this level, Revision should surface the learning and assessment capabilities relevant to the selected context, including:

- concise learning content and explanations;
- flashcards and active recall;
- quizzes and topic tests;
- exam questions;
- timed practice;
- full-paper/component practice where appropriate; and
- the Exam Simulator where the specification supports it.

The specification structure should remain understandable on mobile and should avoid requiring the student to navigate several nested levels before reaching useful work.

## Practice and Exam Prep

Practice and Exam Prep are core capabilities, not global organising destinations.

### Practice

Practice includes active revision and assessment activities such as:

- flashcards;
- quizzes;
- topic tests;
- exam questions; and
- other active-recall formats.

Practice should normally inherit the current subject/course/topic context. It should feed evidence back into the wider student model and provide useful explanatory feedback, not just scores.

### Exam Prep

Exam Prep includes activity specifically intended to prepare the student for exam conditions, including:

- timed practice;
- full papers/components;
- targeted exam-question work; and
- the Exam Simulator.

As an exam approaches, REV may increasingly recommend these activities from Home or a Subject Home, but the activity itself remains attached to the relevant course/paper/component context.

## Progress

Progress is a global destination that helps the student understand the bigger picture across subjects.

It should support progressive drill-down:

```text
All subjects → Subject → Course/specification → Paper/component → Topic
```

Progress may include:

- specification coverage;
- understanding/mastery;
- weaknesses;
- recent progress; and
- exam readiness where supported by sufficient evidence.

Progress should provide confidence when the student is on track and constructive direction when they are not.

Progress views should prioritise meaning over dashboard density: show the learner what a signal means and what action follows from it rather than presenting unexplained metrics.

## REV

REV is the dedicated space for the ongoing AI tutor relationship and is also contextually available throughout the product.

REV operates at three useful scopes:

### Global REV

On Home and in the dedicated REV area, REV can use the learner's subjects, progress, activity and exam context across the whole revision programme.

### Subject-scoped REV

On a Subject Home, REV keeps the learner's wider picture available but treats the selected subject as the immediate working context.

### Activity-context REV

While the learner is viewing a topic, completing practice, reviewing feedback or preparing for an exam, REV can use the current content/activity as additional context for explanation and guidance.

These are not separate assistants. They are contextual scopes of the same REV relationship.

REV should be able to recommend, explain and guide while preserving student agency. A student should always be able to choose a different subject, topic or activity.

## Navigation model

### Desktop

Desktop primary navigation should expose:

- Home
- Subjects
- Progress
- REV

Contextual navigation within a Subject Home or course/paper area may expose Practice, Exam Prep and other relevant activities without promoting them to global navigation.

### Mobile

Mobile should use:

- Revision wordmark at the top left;
- a burger/menu control at the top right for account and secondary utilities; and
- fixed bottom navigation for Home, Subjects, Progress and REV.

The fifth mobile slot should not be filled merely to match a conventional five-tab pattern. A context-specific action may be used later only where usability evidence supports it.

## Supporting experiences

Account, settings, adding/removing subjects and similar utility functions should remain secondary to the main revision journey.

Parent and teacher experiences should be treated as separate role-specific journeys when developed, rather than being inserted into the student's everyday navigation.

Help, privacy and account explanations should be easy to find without displacing the primary revision navigation.

## Design guardrails

The information architecture should:

- keep the learner-wide recommended next action prominent on Home;
- support fast switching between multiple subjects;
- make Subject Home the bridge between global guidance and subject-specific work;
- preserve the official specification structure rather than hard-coding one subject's hierarchy;
- keep the specification transparent and browsable;
- make REV available globally and in context;
- keep global navigation relatively flat and recognisable;
- keep Practice and Exam Prep contextual to relevant academic content;
- avoid excessive dashboard density;
- preserve student freedom to navigate and choose their own activity;
- use progressive disclosure for secondary detail;
- remain fully usable on mobile; and
- allow future subjects, courses and components to be added without redesigning Home.
