---
title: "Learner Content Canvas Amendment"
document_id: "revision-learner-content-canvas-amendment"
document_type: "domain-authority-amendment"
authority: "product-governance / brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-26"
last_reviewed: "2026-09-26"
content_review_status: "founder-approved-correction"
source_of_truth_for: ["learner application outer content canvas", "course-section body alignment", "long-form prose measure interpretation"]
depends_on: ["Product UX Principles", "Visual Brand System", "Learn MVP Experience"]
amends: ["Learn MVP Experience"]
---
# Learner Content Canvas Amendment

## Purpose

Correct a design interpretation that was incorrectly recorded as Founder-approved during the Learn navigation refinement.

The Founder did **not** approve a separate centred approximately `760px` Learn page inside the wider course/product content area. Revision requires professional, stable product geometry across the learner application while allowing each destination to use different internal composition appropriate to its job.

## Governing decision

Revision uses one stable learner content canvas.

For ordinary learner screens, the principal body region must use the same governed horizontal canvas, alignment and responsive gutters so navigating between Home, Plan, Progress, Courses and course-level Overview / Learn / Practice / Exam Prep / Progress does not make the page visibly jump, shrink or widen.

The visual rule is:

`shared outer learner canvas → job-specific internal composition`

not:

`page-by-page outer widths → local attempts at visual consistency`

## Learn correction

The `Learn MVP Experience` remains authoritative for Learn being reading-first, comprehensive and textbook-like, but any wording that requires the **entire teaching article** to be centred at approximately `760px` is superseded by this amendment.

A Learn teaching page must occupy the same top-level content canvas as the other course sections. Its title, orientation, teaching treatments, navigation and wider educational elements belong to that shared body geometry.

Long-form prose may still use a shorter readable line measure where that improves comprehension. That is an **internal typographic measure**, not a separate page width. It should normally remain aligned to the shared content grid rather than centring the whole Learn experience inside a narrower column.

This allows Learn to use the wider canvas professionally for diagrams, comparisons, examples, worked treatments, tables, relationship visuals, recap/navigation and other pedagogically useful composition while keeping ordinary prose readable.

## Consistency without sameness

This rule does not make all Revision screens visually identical.

- Learn may use sustained teaching prose, editorial hierarchy, purposeful educational treatments and visuals.
- Practice may use task-led controls, response areas and feedback.
- Exam Prep may use performance-oriented structures and paper-specific work.
- Progress may use interpretation, evidence and next-action views.
- Home and Plan may use recommendation and planning compositions.

Their internal design can and should differ. Their outer canvas must not drift accidentally.

## Responsive rule

Phone, tablet and desktop may use different governed gutters and may reflow internal content, but the canvas rule remains shared at each breakpoint. Feature-local breakpoints must not create arbitrary horizontal jumps between destinations.

## Exceptions

A deliberate full-screen or specialist surface may depart from the ordinary learner canvas only when its job genuinely requires it, such as a dedicated timed exam/performance state. Such exceptions must be explicit in the relevant authority/technical contract and browser-assured.

Operational Admin may also use denser or wider layouts where its separate job requires them; that does not redefine the learner application canvas.

## Documentation correction

This amendment supersedes the Learn-specific `~760px centred article` interpretation introduced in the 26 September 2026 Learn framing work. The corresponding production CSS, browser assurance and technical implementation record must be updated in the same governed change.

Historical evidence is not rewritten: this amendment records the corrected Founder direction from 26 September 2026 onward.
