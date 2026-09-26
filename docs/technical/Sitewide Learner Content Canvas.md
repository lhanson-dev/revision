# Sitewide Learner Content Canvas

**Status:** Active implementation record  
**Date:** 26 September 2026  
**Authority:** `20-brand-and-experience/Learner Content Canvas Standard.md`, `20-brand-and-experience/Product UX Principles.md`, `20-brand-and-experience/Visual Brand System.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime`

## Purpose

Record the implementation of one stable horizontal content canvas across Revision's learner application.

The change corrects a Learn-specific implementation assumption that narrowed the complete teaching article to approximately `760px`. That assumption caused the body content to move inward when a learner switched from other course sections into Learn, despite the surrounding course surface already using the shared width.

## Shared canvas contract

At the same viewport and learner-shell state, the main learner page canvas keeps the same horizontal boundaries across:

- Home;
- Plan;
- Progress;
- Courses;
- Course Overview;
- Learn;
- Practice;
- Exam Prep; and
- course Progress.

The canonical learner page uses the existing `1100px` maximum desktop canvas and the existing responsive page padding. This is a shared layout boundary, not a requirement for every page to use the same internal composition.

## Learn correction

`LearnReadingWorkspace` continues to use the shared bordered course-section surface and reading-first educational treatments.

The top-level `article.learn-reading-page` no longer imposes a separate `760px` maximum width or automatic centring. It fills the available inner width of the shared Learn surface so its left/right alignment matches sibling course sections.

Readable line length may still be managed locally inside the article through paragraph/text-block composition, columns, visual treatments or other educational layout decisions. That local treatment must not redefine the page or section canvas.

## Implementation

`src/app/interface-content-canvas.css` owns the shared learner canvas geometry and is loaded after feature composition styles so individual feature maximum-width declarations cannot silently redefine the governed outer canvas.

It establishes:

- one `--learner-content-canvas-max` value matching the existing canonical desktop learner canvas;
- stable `page-screen` width/alignment;
- full-width `paper-section-content` inside the governed course page;
- full-width Learn outer workspace; and
- full-width Learn teaching article inside the workspace's normal padding.

This layer owns geometry only. It does not override feature colour, typography, educational treatments, cards, interaction patterns or responsive content composition.

## Assurance

`tests/e2e/sitewide-content-canvas.spec.ts` protects two invariants across phone, tablet and desktop browser projects:

1. representative learner destinations keep the same main horizontal canvas at a fixed viewport; and
2. Overview, Learn, Practice, Exam Prep and Progress use the same section body alignment, with the Learn article filling its containing surface rather than introducing a narrower top-level column.

Existing Learn visual-regression coverage remains responsible for the detailed appearance of the reading experience.

## Documentation correction

The previous technical record `docs/technical/Learn Active-Trail Navigation Refinement.md` described the `760px` article measure as retained behaviour. That statement is superseded by this record and the `Learner Content Canvas Standard`.

This correction does not change Learn's reading-first purpose, teaching-page anatomy, navigation model, educational treatments, content completeness or Practice handoff. It changes only the governed horizontal layout invariant.
