# Information Architecture

**Status:** Draft authority candidate — v0.4  
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

The conceptual academic hierarchy is:

```text
Learner
└── Subject
    └── Course / specification
        └── Paper / component where applicable
            └── Topic / specification area
                └── Learning, practice or exam-preparation activity
                    └── Evidence and feedback
```

The experience hierarchy within a selected course, paper or component is different from the academic hierarchy. Where sufficient content exists, the learner should normally move through focused contextual sections:

```text
Course / paper / component
├── Overview
├── Learn
├── Practice
├── Exam Prep
└── Progress
```

These sections are first-class parts of the learner hierarchy. They should not be collapsed into one long all-purpose course or paper page containing learning content, flashcards, quizzes, exam simulation and progress one after another.

Topics and specification areas cut across these sections. A topic such as Marketing may therefore be reached through Learn, Practice, Exam Prep or Progress without creating separate duplicated versions of the topic.

Not every qualification must expose every academic level or every contextual section. Some specifications may use components, themes, texts, skills or other exam-board structures rather than numbered papers. Revision should preserve the official structure where it matters without forcing every subject into the current Business model.

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
- routes into the relevant course, paper or component.

REV remains visible or contextually available on Subject Home. It is the same assistant relationship as global REV, but the current subject becomes explicit context.

For example:

> For Business, I’d continue with Paper 2. Marketing is currently the area where I have least evidence.

### Course / specification and paper / component

Within a subject, the learner should be able to browse the official course/specification structure and see topic-by-topic coverage and progress rather than having the syllabus hidden behind recommendations.

Where a course has papers or components, these provide a useful next level of organisation. Where it does not, Revision should use the appropriate official structure instead of inventing a paper hierarchy.

A course, paper or component Home should be an overview and launch point, not the place where every learning capability is rendered in full. It should orient the learner, show the most useful next action and provide direct access to the focused contextual sections that apply.

## Contextual course / paper sections

Where the selected academic context has enough depth to justify them, the standard contextual sections are:

### Overview

Overview answers:

> Where am I in this course, paper or component, and what should I do next?

It may include:

- the official specification/paper context;
- REV's recommendation for this context;
- recent activity;
- concise coverage/readiness signals;
- the main topics/specification areas; and
- clear routes into Learn, Practice, Exam Prep and Progress.

Overview must remain a hub. It should not duplicate the full contents of the other sections.

### Learn

Learn answers:

> Help me understand this.

It may include:

- concise revision notes;
- explanations;
- worked examples;
- visual material;
- audio/video where useful and justified; and
- topic/specification browsing for learning purposes.

### Practice

Practice answers:

> Help me test whether I know this.

It includes active revision and assessment activities such as:

- flashcards and active recall;
- quick checks and quizzes;
- topic tests;
- case/application practice where relevant;
- exam-style questions; and
- other validated practice formats.

Practice should feed evidence back into the wider student model and provide useful explanatory feedback, not just scores.

### Exam Prep

Exam Prep answers:

> Help me perform in the real exam.

It includes activity intended to prepare the learner for exam conditions, including:

- targeted exam-question work;
- timed questions or sections;
- exam technique support;
- full-paper/component practice where appropriate; and
- the Exam Simulator where the specification supports it.

As an exam approaches, REV may increasingly recommend Exam Prep activities from Home, Subject Home or the selected course/paper Overview.

### Progress

Contextual Progress answers:

> How am I doing here, and what needs attention?

It may include:

- specification coverage;
- understanding/mastery;
- weak or under-covered areas;
- recent evidence; and
- exam readiness where supported by sufficient evidence.

This contextual Progress view is a drill-down of the global Progress model, not a separate progress system.

## Focused-section rule

Learn, Practice, Exam Prep and contextual Progress should normally be distinct navigable sections or focused screen states when the course/paper/component contains meaningful depth.

Implementation may use routes, tabs or another accessible navigation pattern, but the learner must be able to understand which section they are in and move between sections without scrolling through unrelated capabilities.

The design should preserve deep linking or equivalent addressability where practical so REV recommendations and progress signals can take the learner directly to the relevant focused work.

A small or simple academic context may combine sections where doing so genuinely reduces friction, but combining sections must not become the default simply because a single-page implementation is easier to build.

## Topic and specification-area behaviour

Topics are cross-cutting academic entities rather than children of only one contextual section.

For example, a learner may reach Marketing through:

```text
Paper 2 → Learn → Marketing
Paper 2 → Practice → Flashcards → Marketing
Paper 2 → Practice → Exam questions → Marketing
Paper 2 → Progress → Marketing
```

These routes should refer to the same underlying topic/specification identity and evidence model.

A topic view may itself expose relevant actions such as Learn, Flashcards, Quick Check, Exam Questions or Progress, allowing the learner to change learning mode without losing academic context.

## Progress

Progress is also a global destination that helps the student understand the bigger picture across subjects.

It should support progressive drill-down:

```text
All subjects → Subject → Course/specification → Paper/component → Topic
```

Global and contextual Progress views should use the same underlying evidence model. Global Progress answers how the learner is doing across revision as a whole; contextual Progress answers the same question within the selected academic scope.

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

Within a course/paper section, topic or activity, REV can use the current academic context, selected section and current content/feedback as additional context for explanation and guidance.

These are not separate assistants. They are contextual scopes of the same REV relationship.

REV should be able to recommend transitions between sections when useful. For example, a weak Practice result may lead REV to recommend a specific Learn explanation before returning the learner to Practice.

REV should preserve student agency. A student should always be able to choose a different subject, topic, section or activity.

## Navigation model

### Desktop

Desktop primary navigation should expose:

- Home
- Subjects
- Progress
- REV

Within a Subject Home or course/paper/component area, contextual navigation should expose the focused sections that apply, normally:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

### Mobile

Mobile should use:

- Revision wordmark at the top left;
- a burger/menu control at the top right for account and secondary utilities; and
- fixed bottom navigation for Home, Subjects, Progress and REV.

Contextual course/paper navigation must remain easy to use on small screens without replacing or obscuring the learner-wide navigation model. Its exact mobile treatment may use tabs, a compact selector or another accessible pattern supported by usability evidence.

The fifth global mobile slot should not be filled merely to match a conventional five-tab pattern.

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
- use focused Overview, Learn, Practice, Exam Prep and Progress sections where the selected academic context has meaningful depth;
- avoid turning course/paper pages into long collections of unrelated tools;
- keep topics/specification areas consistent across learning modes rather than duplicating them;
- keep the specification transparent and browsable;
- make REV available globally and in context;
- keep global navigation relatively flat and recognisable;
- avoid excessive dashboard density;
- preserve student freedom to navigate and choose their own section or activity;
- use progressive disclosure for secondary detail;
- remain fully usable on mobile; and
- allow future subjects, courses and components to be added without redesigning Home or forcing them into the current Business structure.
