# GJ-03 Course Overview Implementation

**Status:** implementation candidate — PR #361, rebased on current `main`  
**Journey:** Issue #360 under Issue #141 Task 4  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → `CourseExperienceScreen`

## Purpose

Record the implementation boundary for the Founder-approved Course Overview redesign so review and follow-on changes remain inside the approved Revision Interface System rather than redefining the learner shell.

## Fixed visual and interaction foundations

The Overview reuses the live Revision foundations:

- desktop persistent learner rail;
- tablet/mobile top bar, navigation drawer and persistent Ask REV dock;
- canonical Revision wordmark and identity assets;
- canonical Living E through `RevPresence` for REV visual presence;
- Manrope typography;
- Calm Teal role tokens and the existing Light/Dark theme mechanism;
- existing course navigation for Overview / Learn / Practice / Exam Prep / Progress;
- existing spacing, radius, control, focus and surface roles.

No alternate REV mascot, robot, face or character is introduced.

## Overview composition

For shared-learning courses, `CourseExperienceScreen` renders Overview in this order:

1. course/specification orientation;
2. existing course section navigation;
3. REV-led next-step guidance surface;
4. concise course-position summary;
5. course topics.

The previous duplicated Learn / Practice / Exam Prep / Progress choice-card row is removed from Overview because the same destinations are already represented in course navigation.

## REV recommendation treatment

Overview uses the existing deterministic recommendation from `createCourseLearningState` / `recommendNextActivity`.

The visual layer does not change recommendation ranking or evidence calculation. It translates the result into learner-facing coaching language and renders the canonical Living E on a governed REV/feature surface.

The primary action routes to the existing Practice or Exam Prep section according to the recommendation activity. Persistent Ask REV remains owned by `PlannerRuntime`; Overview does not create a second chat implementation.

## Course-position semantics

The Overview must not fabricate data to resemble a mock-up.

The current implementation can truthfully expose:

- course readiness when the existing readiness model has sufficient evidence;
- `Building` when readiness is not yet supportable;
- evidence coverage as topics with at least one recorded learning result;
- topic-level evidence-presence indicators.

The current catalogue/course model does **not** expose a governed learner exam-date field or a true Reviewed percentage. Those values therefore remain absent from the live Overview until a separately governed data source and semantic contract exist.

## Responsive behaviour

The same hierarchy is preserved across supported layouts:

- desktop: Living E and recommendation copy sit side-by-side inside the REV feature surface; course-position signals use two columns;
- tablet: the recommendation contracts while retaining side-by-side identity/copy where space permits;
- phone: Living E, coaching copy and action stack vertically; course-position signals become one column;
- existing course navigation remains horizontally scrollable where required;
- persistent mobile/tablet Ask REV remains outside the page composition and is unchanged.

## Theme behaviour

New styles consume existing role tokens rather than defining a new palette. Light and Dark are therefore the same composition translated through the existing `data-theme` token system.

The recommendation uses the approved inverse Deep Teal surface with Primary Teal action treatment, while ordinary position/topic surfaces remain governed product surfaces.

## Deliberate exclusions

This increment does not:

- redesign the global shell;
- change recommendation/readiness algorithms;
- introduce exam-date storage;
- introduce a Reviewed evidence model;
- redesign Learn, Practice, Exam Prep or Progress;
- change subscription/entitlement behaviour; or
- create a second REV conversation implementation.

## Main synchronization

Before merge, current `main` advanced through PRs #362 and #363 to `c5d288347a50c176394efd5e7a124655dc4c83df`. PR #361 was rebased onto that approved `main`; neither intervening PR touched any of the four GJ-03 implementation files, so the approved Course Overview design content was preserved unchanged while inheriting current repository state.

## Assurance

PR #361 is expected to pass the repository's standard CI, responsive browser assurance, theme/interface integrity checks and existing identity controls before Founder merge approval.

Production review occurs only after explicit Founder approval for PR #361, merge to `main`, governed GitHub Pages deployment and production verification.