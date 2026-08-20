# Scope and Capability Taxonomy

**Status:** Draft authority candidate — v0.3  
**Purpose:** Define Revision's principal product capability areas and distinguish core product scope from later commercial evolution.

## Product capability model

Revision should organise capabilities around the jobs the product performs for the student rather than around individual content formats.

### 1. Understand

Capabilities that establish who the student is studying for and build the evidence base needed for useful guidance.

Includes:

- qualification and subject setup;
- exam board and specification selection;
- syllabus/specification mapping;
- baseline and diagnostic assessment;
- ongoing evidence collection from student activity; and
- maintenance of the student's broader learning picture.

### 2. Guide

Capabilities that turn evidence into useful direction.

Includes:

- personalised priorities;
- recommended next actions;
- adaptive revision planning across assessments and subjects;
- realistic availability and remaining-time awareness;
- proactive guidance from the AI tutor;
- balancing priorities across topics and subjects;
- explaining why a recommendation matters;
- supporting deliberate learner choices and short-term priority changes; and
- support, encouragement and explanation when the student is unsure what to do.

Guidance should use the wider evidence picture rather than react disproportionately to one isolated result.

Adaptive planning should recalculate from reality as evidence, learner choices, availability and assessment context change rather than preserve an obsolete timetable. Detailed planner behaviour is governed by `Adaptive Revision Planning.md`.

### 3. Learn

Capabilities that help students understand curriculum content using different learning formats.

Includes:

- concise explanations;
- revision notes;
- worked examples;
- visual material;
- video where appropriate;
- audio or podcast-style material where appropriate; and
- other learning formats that improve accessibility or engagement.

Flashcards, video, audio and similar formats are learning methods within the product rather than separate strategic capability areas.

### 4. Practise and Test

Capabilities that help students retrieve knowledge, apply it and learn from assessment.

Includes:

- flashcards;
- quizzes;
- topic tests;
- exam-style questions;
- active-recall activities;
- marking and scoring where appropriate; and
- useful feedback that explains mistakes and helps the student improve.

Assessment should create new learning evidence and should teach, not merely produce a score.

### 5. Prepare for the Exam

Capabilities that help students move from topic knowledge to real exam performance.

Includes:

- timed practice;
- realistic exam questions;
- full-paper practice;
- exam technique support; and
- the Exam Simulator.

The **Exam Simulator is a core product capability and should form part of the first serious product version**, not a distant future enhancement.

### 6. Progress and Readiness

Capabilities that make progress visible and help students understand whether they are on track.

Includes:

- specification coverage;
- understanding/mastery indicators;
- weaknesses and priority areas;
- progress over time;
- exam-readiness indicators where supported by sufficient evidence; and
- constructive guidance when the student is not currently on track.

## First serious product version

The first serious version should be capable of proving the central Revision proposition rather than simply demonstrating individual study tools.

It should include, at minimum:

- subject, qualification and exam-board setup;
- assessment dates/context and realistic learner availability sufficient to support useful planning;
- specification coverage tracking;
- student evidence model;
- personalised priorities and recommendations;
- an adaptive revision plan that can recalculate as evidence, time and learner choices change;
- a clear today-focused experience plus wider Plan visibility;
- proactive AI tutor guidance and explanation of meaningful planning decisions;
- core learning content;
- multiple learning formats where useful and feasible;
- quizzes and tests;
- useful assessment feedback;
- exam-style questions;
- progress and weakness tracking; and
- the Exam Simulator.

Individual formats may initially have limited breadth, but the end-to-end system must demonstrate the loop from understanding the student to planning/recommending work, learning, testing, feedback, updated evidence and recalculated guidance.

## Explicitly not first-release scope

Revision should not initially expand into:

- general homework management;
- coursework management;
- generic calendar or task-management functionality unrelated to adaptive revision planning;
- teaching entire subjects from first principles as a replacement for school;
- school behaviour management;
- university admissions support;
- teacher lesson planning; or
- a general-purpose school learning-management system.

These exclusions do not permanently prohibit future adjacent capabilities. They protect the initial product from losing focus before the core revision proposition is proven.

## Commercial capability evolution

Revision is designed to operate across **Free, Paid and Premium** product tiers.

Exact global plan names, prices and final entitlement boundaries are not defined by this document and must be governed separately through product/commercial authority.

However, every material learner-facing feature must be explicitly considered across Free, Paid and Premium before it is implementation-ready, following `80-company-workflows/Feature Definition and Measurement Workflow.md`.

The product-level commercial principle is:

**Free proves the value. Paid compounds the value. Premium maximises the value.**

This means:

- **Free** must provide genuine standalone student value and demonstrate Revision's core proposition rather than act as a broken demo.
- **Paid** should unlock a materially stronger repeat-use benefit through additional depth, scale, intelligence, personalisation, convenience or capability.
- **Premium** should provide the fullest/highest-value experience, particularly where advanced intelligence, personalisation or higher cost-to-serve creates a defensible step up.

A feature may legitimately be identical across tiers where safety, evidence integrity, accessibility, core operation or product coherence requires it. Tiering is a commercial design decision, not an obligation to create artificial restrictions.

Paid value should be discoverable in context so learners can understand why an upgrade would be useful, but Revision must not manufacture conversion by making Free intentionally frustrating, obscuring educational truth, exploiting exam anxiety, using false scarcity or degrading safety/accessibility/evidence behaviour for non-paying students.

Revision should also work towards a **student referral system** in which successful referrals can earn benefits such as free subscription months. Referral mechanics are not required for version 1 and must not distract from proving core student value first.

## Scope decision rule

A proposed capability should be considered core when it materially improves Revision's ability to:

1. understand the student's position;
2. identify and explain the most useful next action;
3. help the student use the time available effectively;
4. help the student learn or practise effectively;
5. generate useful evidence and feedback;
6. improve exam preparation; or
7. increase justified confidence that the student is on track.

Capabilities that do not strengthen this loop should normally remain secondary until the core proposition is proven.
