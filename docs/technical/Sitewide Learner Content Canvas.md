# Sitewide Learner Content Canvas

**Status:** Active implementation record  
**Date:** 26 September 2026  
**Authority:** `10-product-governance/Learner Content Canvas Amendment.md`, `20-brand-and-experience/Product UX Principles.md`, `20-brand-and-experience/Visual Brand System.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime`

## Purpose

Record the implementation of one stable horizontal content canvas across Revision's learner application.

The change corrects a Learn-specific implementation assumption that narrowed the complete teaching article to approximately `760px`. That assumption caused body content to move inward when a learner switched from other learner destinations or course sections into Learn.

## Shared canvas contract

At the same viewport and learner-shell state, the main learner page canvas keeps the same horizontal boundaries across:

- Home;
- Plan;
- Progress;
- Courses;
- REV;
- Course Overview;
- Learn;
- Practice;
- Exam Prep; and
- course Progress.

The canonical learner page uses the governed `1100px` maximum desktop canvas and shared responsive gutters. This is a shared layout boundary, not a requirement for every page to use the same internal composition.

Dedicated specialist experiences such as timed exam states may retain their explicitly governed layouts. Admin is an operational surface and is deliberately excluded from the learner-canvas rule.

## Learn correction

`LearnReadingWorkspace` continues to use the shared bordered course-section surface and reading-first educational treatments.

The top-level `article.learn-reading-page` no longer imposes a separate `760px` maximum width or automatic centring. It fills the available inner width of the shared Learn surface so its left/right alignment matches sibling course sections.

Readable line length is handled locally. Ordinary explanatory prose uses the governed prose-measure role while staying aligned to the shared content grid. Wider educational treatments, diagrams, comparisons, tables, navigation and other useful structures may use the wider canvas.

## Implementation

`src/app/brand-tokens.css` defines separate layout roles for:

- `--layout-learner-canvas-max`: the stable learner-page canvas; and
- `--layout-prose-measure`: the internal readable measure for long-form prose.

`src/app/interface-layout.css` owns shared learner-page geometry. It standardises ordinary learner `main.dashboard` surfaces and focused Home activity onto the same maximum width and responsive gutters while explicitly excluding Admin composition.

`src/app/learn-reading.css` then applies the Learn-specific distinction:

- the teaching article fills the shared course-section content grid;
- ordinary heading/explanation prose may use the shorter prose measure;
- educational treatments remain free to use the wider article canvas.

`paper-section-content` remains full-width inside the common course page so Overview, Learn, Practice, Exam Prep and Progress retain the same body-content alignment beneath the shared course chrome.

## Assurance

`tests/e2e/sitewide-content-canvas.spec.ts` protects the site-wide invariant across phone, tablet and desktop browser projects:

1. Home, Plan, Progress, Courses, REV and the selected-course sections retain the same main horizontal canvas at a fixed viewport; and
2. Overview, Learn, Practice, Exam Prep and course Progress use the same section-body alignment, with the Learn article filling its containing surface while only local prose is width-constrained.

`tests/e2e/learn-active-trail-navigation.spec.ts` separately verifies that Learn and Practice share the same course-section surface/body grid and that the readable measure applies to prose rather than the full teaching article.

Existing visual-regression coverage remains responsible for approving the detailed appearance of materially changed learner surfaces. Admin visual baselines must remain unchanged.

## Documentation correction

`10-product-governance/Learner Content Canvas Amendment.md` explicitly records that the previous centred `~760px` top-level Learn article was an implementation/design assumption rather than Founder-approved direction. `Product UX Principles` carries the stable learner-canvas rule as a general experience principle.

`docs/technical/Learn Active-Trail Navigation Refinement.md` is updated in the same governed change so the previous technical description does not continue to present the superseded top-level Learn width as current implementation.

Historical evidence is not rewritten. This correction does not change Learn's reading-first purpose, teaching-page anatomy, navigation model, educational treatments, content completeness or Practice handoff; it corrects the horizontal layout contract and its assurance.
