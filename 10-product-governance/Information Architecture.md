# Information Architecture

**Status:** Draft authority candidate — v0.7  
**Purpose:** Define the top-level structure and scalable learner hierarchy of the Revision student experience.

## Principle

The information architecture should make Revision feel clear, calm and purposeful.

The student should not need to understand the product's internal complexity. The global structure should reflect the highest-level jobs they are trying to do:

- understand what matters now;
- see and shape their wider revision plan;
- get intelligent support from REV from wherever they are;
- understand progress across subjects; and
- choose their own subject or activity when they want to.

Learning, practice and exam-preparation tools remain contextual to the relevant subject, course, paper/component or topic rather than competing as global destinations.

Navigation should remain recognisable and relatively flat. Avoid deep nesting, duplicate entry points and unnecessary menu complexity.

## Primary global navigation

The learner-wide destinations are:

1. **Home**
2. **Plan**
3. **Progress**
4. **Subjects**

The persistent learner-wide action is:

- **Ask REV**

REV is therefore not primarily a peer destination alongside the four learner-wide destinations. It is an ongoing intelligent-coach relationship that should remain available from any learner screen. A full REV workspace may still exist for extended conversation, but ordinary access should not require the learner to navigate away from the work they are doing.

The structure reflects the product's intended experience: orient to today, understand the wider plan, understand the evidence picture, choose work directly, or ask the intelligent coach for help at any point.

Practice and Exam Prep remain core product capabilities, but they are contextual capabilities within a selected subject/course rather than global destinations.

Account, profile, settings, plan/subscription management, help, privacy, subject management and similar utilities remain secondary. Desktop uses one compact authenticated account control at the bottom of the persistent learner rail; tablet/mobile use the secondary menu.

Detailed responsive behaviour is governed by `Global Learner Navigation.md`.

## Learner hierarchy

Revision should support a learner with multiple subjects and multiple assessment components even when the live content catalogue is narrower.

The academic hierarchy is:

```text
Learner
└── Subject
    └── Course / specification
        └── Paper / component where applicable
            └── Topic / specification area
                └── Learning, practice or exam-preparation activity
                    └── Evidence and feedback
```

The experience hierarchy within a selected course, paper or component is:

```text
Course / paper / component
├── Overview
├── Learn
├── Practice
├── Exam Prep
└── Progress
```

These focused sections should not normally be collapsed into one long all-purpose page merely because that is easier to implement.

Topics and specification areas are shared academic identities across Learn, Practice, Exam Prep and Progress rather than duplicated entities.

Not every qualification must expose every level. Revision should preserve the official structure where it matters without forcing all subjects into one paper model.

## Home

Home is the default signed-in destination and should answer:

> **What matters now, and what should I do today?**

Home operates at learner-wide scope.

Its strongest element should be concise REV guidance based on the wider learner picture. That guidance may consider enrolled subjects, current plan, assessment timing, evidence, coverage, recent activity, relative weaknesses, learner choices and realistic available time.

Home should also contain a smaller **Today's plan** summary that shows the current day's intended workload and links directly to Plan.

The REV guidance and Today's plan card are complementary:

- REV explains the most useful focus and why;
- Today's plan makes the practical workload visible.

Home may include a prominent `Ask REV anything…` input as part of the opening composition. That Home input does not replace the persistent Ask REV action elsewhere in the shell.

Home may include a small number of quiet supporting signals, but must not become a dense dashboard or activity feed.

The learner remains free to ignore the recommendation and choose work through Subjects or Plan, or ask REV for a different approach.

## Plan

Plan is a primary global destination and answers:

> **What does my current revision programme look like?**

Plan is governed in detail by `Adaptive Revision Planning.md`.

The default view should be chronological and adaptive rather than a traditional fixed calendar grid:

- Today;
- next few days;
- later this week; and
- upcoming assessments / broader priorities.

The plan is Revision's current forecast, not a commitment. Precision should reduce further into the future and the adaptive nature of the plan should be obvious.

Plan should make it possible to understand:

- what Revision currently recommends;
- why important priorities exist;
- upcoming assessments;
- current availability assumptions;
- significant plan changes;
- whether Revision is currently prioritising because time is constrained; and
- the implications of deliberate learner preferences.

Plan should not become a generic calendar, homework manager or manual task-rescheduling system.

## REV

REV is the ongoing intelligent-coach relationship and a persistent global action.

Opening Ask REV should feel context-aware and ready to respond rather than like a blank generic chatbot or a dashboard of AI functions.

REV may operate at several scopes:

### Global REV

On Home, Plan, global Progress and the expanded REV workspace, REV can use the learner's wider subjects, plan, progress, activity and assessment context.

### Subject-scoped REV

On Subject Home, the selected subject becomes the immediate working context while the wider programme remains available.

### Activity-context REV

Within a course/paper section, topic, activity or feedback view, REV may use that context to explain, coach or recommend the next useful action.

These are contextual scopes of one assistant relationship, not separate assistants.

Selecting Ask REV should preserve relevant context so the learner does not need to explain where they came from. On desktop this should normally open a substantial contextual side panel; tablet/mobile should use an appropriate overlay or sheet. A route to an expanded/full REV workspace may be available for longer conversations.

REV should support natural planning conversations, including learner preferences that temporarily reshape the plan, while keeping wider consequences visible.

## Progress

Progress is a global destination that helps the student understand the bigger picture across subjects.

It answers:

> **How am I doing, and what needs attention?**

It should support progressive drill-down:

```text
All subjects → Subject → Course/specification → Paper/component → Topic
```

Global and contextual Progress views use the same underlying evidence model.

Progress should distinguish coverage, understanding/mastery and exam readiness and may also show subjective confidence where appropriately governed.

Progress should prioritise meaning over dashboard density: explain what a signal means, how strong the evidence is where material, and what useful action follows.

## Subjects

Subjects is the learner-led route and answers:

> **What do I want to work on?**

Students must be able to switch between enrolled subjects easily.

Selecting a subject opens a Subject Home rather than dropping immediately into a single activity or paper.

### Subject Home

Subject Home answers:

> **What should I work on in this subject?**

It may include:

- course/specification and exam-board context;
- relevant paper/component structure;
- subject-level progress and coverage;
- weaknesses or under-covered areas;
- recent subject activity;
- REV guidance scoped to the subject; and
- routes into the relevant course, paper or component.

The learner can choose work directly even where Revision currently recommends something else.

## Course / specification and paper / component

Within a subject, the learner should be able to browse the official course/specification structure and see topic-by-topic coverage and progress.

A course, paper or component Home should be an overview and launch point, not the place where every learning capability is rendered in full.

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

Implementation may use routes, tabs or another accessible pattern, but the learner must understand where they are and move between sections without scrolling through unrelated capabilities.

Deep-linking or equivalent addressability should be preserved where practical so REV and Plan can take the learner directly into relevant work.

## Topic behaviour

Topics are cross-cutting academic entities.

For example:

```text
Paper 2 → Learn → Marketing
Paper 2 → Practice → Flashcards → Marketing
Paper 2 → Practice → Exam questions → Marketing
Paper 2 → Progress → Marketing
```

These routes should resolve to the same underlying topic/specification identity and evidence model.

## Navigation model

### Desktop

Desktop uses a persistent left learner rail rather than a top primary navigation bar.

The top area should expose:

- REV identity;
- a prominent **Ask REV** action;
- Home;
- Plan;
- Progress; and
- Subjects.

The bottom area should expose one compact authenticated account control showing the learner's circular avatar/initial and name. It should not repeat Profile and Settings as permanent rail rows.

Selecting that account control opens a compact menu anchored to the rail. For ordinary learners it contains Profile, Settings, the governed plan/upgrade route when available, and Log out. Profile and Settings may open a larger secondary account panel where more space is needed. Admin-only operational utilities may remain available to authorised users through the secondary account/profile experience without changing the ordinary learner information architecture.

Until FI-002 has completed the governed feature lifecycle and a real plan-comparison/upgrade route exists, an `Upgrade plan` preview must be clearly unavailable/forthcoming rather than behaving like a working purchase action.

Ask REV should receive the strongest branded emphasis in the rail. Ordinary destinations and the account control should remain visually quiet with clear accessible hover/focus/open states.

Within Subject Home or course/paper/component areas, contextual navigation should expose the focused sections that apply, normally Overview, Learn, Practice, Exam Prep and Progress.

### Tablet and mobile

Tablet and mobile should use:

- Revision wordmark at the top left;
- a burger/menu control at the top right for account and secondary utilities; and
- persistent fixed bottom navigation for **Home, Plan, REV, Progress and Subjects**.

The centre REV element is a persistent **Ask REV action**, not merely a peer page destination. It may use a modest raised/differentiated treatment because REV is a core differentiating capability.

The treatment should make REV distinctive without becoming decorative AI theatre. It must have a clear accessible label, adequate touch target and a state that does not rely only on colour.

Contextual course/paper navigation must remain easy to use on small screens without replacing or obscuring learner-wide navigation.

## Secondary menu

The secondary/burger or account menu contains utilities rather than primary learner jobs, including as applicable:

- profile;
- account;
- settings;
- current plan / plan comparison / upgrade when that commercial capability is governed and available;
- notification preferences;
- subject management;
- help;
- privacy/data controls;
- log out/sign out; and
- other secondary utilities.

Parent and teacher experiences should remain separate role-specific journeys when developed.

## Design guardrails

The information architecture should:

- keep the learner-wide next action prominent on Home;
- make Today's plan visible without turning Home into the full planner;
- make Plan a genuine primary job;
- make Ask REV distinctive, contextual and available from any learner screen;
- keep the wider learner picture available while preserving student choice;
- support fast switching between multiple subjects;
- preserve official specification structure;
- use focused learning/practice/exam-prep/progress sections where depth justifies them;
- avoid duplicate topic identities across learning modes;
- keep global navigation flat and recognisable;
- prevent the desktop rail becoming a dumping ground for contextual tools or duplicated account destinations;
- avoid excessive dashboard density;
- use progressive disclosure for secondary detail;
- remain fully usable on mobile and with assistive technology; and
- allow future subjects, courses and components to be added without redesigning the global structure.
