---
title: "Course Overview Experience"
document_id: "revision-course-overview-experience"
document_type: "domain-authority"
authority: "product-governance"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-27"
last_reviewed: "2026-08-27"
content_review_status: "founder-approved"
source_of_truth_for: ["saved Course Overview hierarchy", "Course Overview screen-purpose contract", "course REV header", "course sub-navigation", "Course Overview next-step composition", "Course Overview exam countdown", "Course Overview progress summary"]
depends_on: ["Core User Journeys", "Information Architecture", "Global Learner Navigation", "Product UX Principles", "Subject Accent Colour System", "Claims and Progress Governance", "Course Content and Assessment Component Placement"]
supersedes: ["Course Overview implementation composition that presents duplicate mode cards and a full topic-evidence grid before the learner reaches focused sections"]
---
# Course Overview Experience

## Purpose

Define the Founder-approved content hierarchy and responsive screen contract for the main page of a learner's saved course.

This authority specialises the general course Overview rules in `Core User Journeys.md`, `Information Architecture.md` and `Global Learner Navigation.md`.

The Course Overview is the persistent home/dashboard for one saved course. It must orient the learner within that course, keep REV immediately available, show the most useful next action, make exam timing visible and provide a concise course-level progress picture without turning the page into a dense analytics dashboard.

Visual polish is deliberately secondary to the content and hierarchy defined here. The final visual treatment must use the shared Interface System and approved subject-accent system rather than inventing a separate page design language.

## Central learner question

> **I'm working on this course. What should I do next, how am I doing, and how close is the next exam?**

## Screen-purpose contract

- **User goal:** orient within a saved course and start useful revision quickly.
- **Screen job:** act as the course home/dashboard by combining course identity, contextual REV access, one recommended next action, exam urgency and a concise progress interpretation.
- **Immediate understanding:** which subject/course the learner is in; the next recommended task; when the next exam is; and the current high-level progress picture.
- **Primary CTA:** start the exact recommended activity directly.
- **Secondary actions:** navigate to Learn, Practice, Exam Prep or Progress; use the course-level Ask REV field; open detailed progress; open Exam Prep from the next-exam context; browse course topics where useful.
- **Essential content:** course REV header, course identity, course sub-navigation, recommended next task, next-exam date/countdown, concise course progress and a lightweight topic summary.
- **Progressive detail:** detailed topic evidence, evidence provenance, full progress interpretation, paper details and deeper analytics belong in focused Progress or Exam Prep experiences rather than competing on Overview.
- **REV role:** remain continuously available in the current course context, use the known course/evidence/plan/exam context, and support the learner without adding redundant explanatory controls beside the recommended task.
- **Success condition:** within seconds the learner understands where they are, what to do next, how soon the next exam is and whether anything needs attention; they can start the recommended exact activity in one action.
- **Next state:** exact Learn/Practice/Exam Prep activity, or a deliberately selected focused course section.

## Locked page hierarchy

The Course Overview hierarchy is:

`course REV header → course sub-navigation → recommended next task + next exam → course progress → topic summary`

This hierarchy must survive desktop, tablet and phone. Responsive design may change the arrangement, but not the content priority.

## 1. Course REV header

Every major page within a selected course uses a consistent course-level REV header before the course sub-navigation.

The header contains:

1. the Living E / REV graphic treatment;
2. the compact `Powered by REV` treatment positioned beneath the REV graphic;
3. the **subject name as the largest course-identity text**, for example `Business`;
4. the **qualification/course level as the next text level**, for example `A Level`;
5. the **exam board and specification/course number as smaller metadata**, for example `AQA · 7132`; and
6. a **full-width `Ask REV anything…` field across the usable width of the header**, positioned beneath the graphic/course-identity row.

The Ask REV field is part of the course header because REV should understand that the learner is currently working within this course. The learner should not need to restate the course context.

The header should use the approved subject accent as restrained recognition support while preserving Primary Teal for REV/brand/action meaning. Subject colour must not become a full-page semantic colour system or replace text identity. Business therefore uses the governed Business Sage accent rather than an invented local colour. 

## 2. Course sub-navigation

Immediately below the course REV header, expose the course's focused sections in one consistent sub-navigation:

- **Overview**
- **Learn**
- **Practice** where available
- **Exam Prep** where available
- **Progress**

The sub-navigation is persistent course context. It is not repeated again as large mode cards on Overview.

The current section receives the accessible active state. The exact available items remain route/catalogue driven for the selected course/component.

### Responsive sub-navigation

- **Desktop:** visible horizontal course sub-navigation beneath the course header.
- **Tablet:** visible compact horizontal sub-navigation beneath the course header; horizontal scrolling is acceptable when genuinely needed.
- **Phone:** compact horizontal/scrollable course sub-navigation directly beneath the course header so Learn, Practice, Exam Prep and Progress remain one tap away.

Global learner navigation continues to follow `Global Learner Navigation.md`; this course sub-navigation does not become a replacement global navigation system.

## 3. Recommended next task

The first and largest content block on Course Overview is **Your next step**.

It should contain only what the learner needs to understand and act:

- exact topic/activity title;
- activity type;
- expected duration where useful;
- one concise evidence-based reason for the recommendation; and
- one dominant action-labelled CTA that starts the exact activity.

Example structure:

- `Your next step`
- `Marketing strategy`
- `Quick check · about 10 minutes`
- `Your recent answers suggest this is worth checking again before moving on.`
- `Start quick check`

A separate **Ask REV why** action is not part of the locked Course Overview composition. The concise reason should already make the recommendation understandable, while the full-width Ask REV field remains available in the course header for any deeper question.

Recommendation wording must match evidence strength. When evidence is limited, use cautious language and a deterministic starter/review activity rather than inventing a weakness.

The primary CTA must route to the exact supported activity. It must not merely open a generic section and make the learner rediscover the recommended work.

## 4. Next exam

On desktop and sufficiently wide tablet layouts, the next-exam card sits immediately to the **right of the recommended next-task card**.

It should show:

- next relevant exam/paper/component name where known;
- exact exam date; and
- a prominent **days-to-go** countdown.

It may provide a secondary route into the relevant Exam Prep context.

This card exists to provide useful urgency and planning context, not to create anxiety. Language should remain factual and calm. Where no exam date is known, do not invent a countdown; use a truthful setup/unknown state instead.

### Responsive behaviour

On phone and constrained tablet layouts, the next-exam card stacks immediately after the recommended next task. The ordering remains:

`recommended next task → next exam`

The countdown should remain easy to scan without overpowering the recommended action.

## 5. Course progress

Course Overview shows a **concise high-level progress card** after the opening task/exam row.

Its purpose is orientation, not full analytics.

It should answer in plain language:

- how the course is going overall;
- where the learner is broadly strong/developing/needs attention, where supported by evidence; and
- where to go for the detailed explanation.

A course-level progress score/readiness signal may be shown only where the evidence model supports the claim and the label accurately describes what is being measured. Any readiness/on-track wording must comply with `Claims and Progress Governance.md` and must not imply certainty from weak or incomplete evidence.

Detailed evidence counts, provenance, full topic analysis and deeper interpretation belong in contextual **Progress**.

The Overview progress card therefore includes a clear route to **View detailed progress** rather than reproducing the Progress page.

## 6. Topic summary

A lightweight **Topics at a glance** section may appear after course progress.

Its job is to provide a quick sense of the course landscape and obvious areas needing attention, not to become a complete evidence table.

It may show a restrained subset/summary of topic names and appropriately governed status language, with a route to view all topics or detailed progress.

The Overview must not recreate the previous full topic-evidence grid with system-centred labels such as `Evidence recorded` / `No scored evidence yet` as the primary learner experience.

## No duplicate mode-card grid

Course Overview must not repeat Learn / Practice / Exam Prep / Progress as a second grid of equally prominent cards beneath the sub-navigation.

The persistent course sub-navigation already provides learner control. The Overview content hierarchy should instead prioritise:

1. recommended action;
2. exam timing;
3. interpreted progress; and
4. lightweight topic orientation.

## Shared course-header rule across sections

The course-level REV header and course sub-navigation should remain structurally consistent when the learner moves between Overview, Learn, Practice, Exam Prep and Progress.

The focused page content below the sub-navigation then changes to suit that section's job:

- Learn prioritises reading/explanation/comprehension;
- Practice prioritises task/response/feedback;
- Exam Prep prioritises exam performance;
- Progress prioritises interpretation and next action.

Consistency therefore comes from shared course context and navigation, not by forcing every section into the same dashboard-card composition.

## Subject accent rule

Course pages use the centrally governed subject accent as a restrained context cue.

For Business, the approved accent is Sage `#BCE8CF`. Primary Teal remains REV/brand/action colour. Functional success/warning/error colours keep their semantic meaning.

Subject accent treatment must remain recognisable in both Light and Dark themes and must never be the only signal of subject identity.

## Responsive behaviour

The same content priority applies at all supported widths.

### Desktop

- normal persistent learner rail;
- course REV header across the course content area;
- full-width Ask REV field within the header;
- horizontal course sub-navigation;
- recommended task as the dominant left card;
- next exam/countdown as the smaller right card;
- course progress below;
- topic summary below progress.

### Tablet

- global navigation follows the governed responsive learner shell;
- the course REV header remains recognisable rather than collapsing into a generic title bar;
- full-width Ask REV field remains within the header;
- course sub-navigation remains visible/scrollable;
- task and exam may remain side-by-side when space is sufficient, otherwise stack in priority order;
- progress and topic summaries reflow without horizontal page scrolling.

### Phone

- global navigation uses the governed compact top-bar/drawer model;
- course REV header remains meaningful but proportionately compact;
- subject → course/level → exam board/specification hierarchy remains visible;
- full-width Ask REV field remains within the header;
- course sub-navigation remains directly beneath it as a compact horizontal/scrollable row;
- recommended next task comes first;
- next exam/countdown comes second;
- progress follows;
- topic summary follows;
- no material information or CTA depends on hover.

## Important states

### Limited evidence

The page must remain useful before strong personal evidence exists. Use a deterministic starter or cautious next-step recommendation and avoid unsupported strength/weakness/readiness language.

### No exam date

Do not show a fabricated countdown. Show a truthful unavailable/setup state and keep the recommended task as the dominant first action.

### No readiness score

Do not force a percentage into the progress card. Explain that Revision is still building the picture and show the most useful evidence-backed progress interpretation available.

### Course/component differences

Where a qualification genuinely has component-specific learning, preserve the governed component hierarchy. Do not force a shared-course overview structure onto academic content that genuinely belongs to separate components.

## Assurance expectations

Implementation should prove at minimum:

- correct saved-course identity;
- consistent course REV header across Overview/Learn/Practice/Exam Prep/Progress;
- full-width course-context Ask REV field;
- persistent course sub-navigation;
- exact recommended-task launch;
- next exam date and days-to-go calculation;
- truthful no-exam-date state;
- evidence-appropriate progress language;
- limited-evidence fallback;
- no duplicate mode-card grid;
- phone/tablet/desktop hierarchy;
- Light/Dark treatment;
- subject accent correctness;
- keyboard/focus/touch behaviour; and
- no ordinary page-level horizontal scrolling.

## Documentation impact

This v1.0 authority records the Founder-approved Course Overview content structure agreed on 27 August 2026. Production implementation must update the canonical Course Overview runtime, route/activity-addressing where required for exact activity launch, relevant technical documentation and browser/visual assurance in a subsequent governed implementation change.

Historical prototypes, screenshots and prior implementation evidence remain historical/current-state evidence and must not be rewritten to imply they already matched this approved hierarchy.