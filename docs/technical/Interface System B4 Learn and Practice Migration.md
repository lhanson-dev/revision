# Interface System B4 — Learn and Practice Migration

**Status:** B4 original migration live via PR #119; Learn reading-first evolution In Progress under Issue #381  
**Authority:** `10-product-governance/Learn MVP Experience.md`, `20-brand-and-experience/Educational Treatment System.md`, `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `CourseExperienceScreen`

## Purpose

Record the Interface System implementation boundary for the learner-facing Learn and Practice experiences.

The original B4 migration moved the combined `FocusedLearningWorkspace` onto the approved Interface System without changing educational/evidence behaviour. Issue #381 now evolves **Learn only** to the Founder-approved comprehensive, reading-first experience while preserving the B4 Practice task/feedback model.

## Current responsibility split

### Learn

Canonical Learn now uses `LearnReadingWorkspace` inside `CourseExperienceScreen`.

The reading-first implementation:

- begins directly beneath existing course identity/navigation;
- uses the learner hierarchy `chapter/topic → group → teaching page`;
- keeps ordinary prose as the dominant surface;
- renders selective shared educational treatments where content requires them;
- provides contextual REV help without creating a second assistant surface;
- treats previous/next teaching-page navigation as the natural continuation;
- keeps contextual Practice clearly available as a secondary handoff;
- carries the exact active teaching page in the route; and
- uses the existing learner rail/drawer for nested Learn contents rather than adding another navigation system.

The legacy Learn-specific workspace heading, local topic selector, `Topic notes / Link topics` switch and generic `Learning activity` framing are no longer the target Learn composition.

### Practice

`FocusedLearningWorkspace` remains the canonical Practice implementation.

Practice continues to own:

- topic selection/context;
- activity-mode selection;
- flashcards;
- quick checks;
- case-study work;
- formulas/data practice;
- written practice;
- task feedback;
- evidence recording; and
- recommendation continuity.

Issue #381 does not change Practice scoring, evidence meaning, readiness calculation or activity contracts. A Learn → Practice handoff may provide the exact topic in the URL so Practice opens in the intended academic context.

## Learn content and adapter boundary

`content/learn-schema.ts` defines the semantic learner-facing Learn contract. Initial block families are:

- explanation;
- key idea / definition;
- example;
- worked example;
- relationship visual;
- comparison;
- quantitative visual;
- misconception; and
- recap.

`LearningContentAdapter` exposes the complete Learn hierarchy and individual teaching pages.

For migration safety, every existing topic/section can be projected into a deterministic reading-page fallback. Richer authored/generated Learn pages can replace the appropriate sections while uncovered sections remain available. This prevents course-coverage loss during migration but does not claim that historical section bullets equal the final comprehensive Content Factory teaching standard.

## Shared educational treatments

`src/app/ui/EducationalTreatment.tsx` is the shared Interface System wrapper for recurring educational semantics.

The component owns stable treatment anatomy and allows the governed subject accent to parameterise restrained recognition cues. It does not make every page a card stack and does not repurpose Warning/Error colours for ordinary misconceptions.

Normal explanation remains ordinary article typography/whitespace rather than an `EducationalTreatment` surface.

## Native educational visuals

Issue #381 introduces structured native Learn visuals rather than defaulting to baked image assets:

- relationship/process chains;
- responsive comparison layouts; and
- quantitative charts rendered from structured series/point data.

The same educational information remains available in semantic HTML/text form where required. Responsive layouts recompose instead of shrinking labels to unreadable sizes.

## Responsive behaviour

The existing learner shell retains ownership of desktop rail and tablet/mobile drawer behaviour.

Learn-specific presentation uses:

- restrained long-form reading width (approximately 760px);
- single-column teaching hierarchy;
- horizontally arranged relationship/comparison treatments only where width permits;
- vertical relationship chains and stacked comparisons on narrow screens;
- stackable contextual REV, Practice and previous/next controls; and
- no ordinary-content horizontal scrolling requirement.

Practice retains the existing responsive B4 task-led presentation.

## Navigation and route continuity

Course Learn routes may carry a teaching-page ID:

`#/courses/:courseId/learn/:pageId`

Practice routes may carry a topic ID:

`#/courses/:courseId/practice/:topicId`

Equivalent component routes exist where learning is component-specific.

`ContextualLearnerNavigation` expands only the active Learn branch. Chapters remain visible, the active chapter reveals groups/pages and the exact page receives current-page state. Tablet/mobile use the same hierarchy in the existing drawer.

## Evidence and Content Factory boundary

Learn rendering does not change claims/progress semantics:

- viewing Learn does not prove mastery, Topic Knowledge or Exam Readiness;
- Practice/Exam Prep evidence remains the scored-performance boundary; and
- publication of retained Content Factory learner assets remains blocked until the existing assurance and Foundation approval gates pass.

The static Business representative pages included with Issue #381 prove treatment/rendering behaviour. They do not replace the retained Content Factory asset-assurance workflow.

## Original B4 history

PR #119 merged the original Learn/Practice Interface System migration as commit `41a61d3e276df8635c41f57c4e57329cc39725d7`. That increment established token-driven focused-work presentation, light/dark parity, responsive behaviour and progressive Practice task/feedback states without changing educational logic.

Those historical facts remain true. Issue #381 supersedes only the current Learn presentation boundary; it does not rewrite the earlier migration evidence.

## Assurance

The Issue #381 implementation is required to pass the repository exact-head CI, including the normal `npm run validate` chain:

`typecheck → lint → unit tests → production build`

Targeted coverage includes:

- Learn-page and Practice-topic URL round-tripping;
- complete adapter-produced Learn hierarchy;
- preservation of richer authored treatment pages and uncovered source sections;
- canonical route integration;
- nested navigation/current-page state;
- responsive treatment behaviour;
- Light/Dark and keyboard/focus behaviour; and
- existing Practice/evidence regressions.

## Documentation impact

The focused current implementation record is `docs/technical/Learn Reading Experience Implementation.md`.

Issue #381 updates this migration record and the Interface System component registry because Learn now has a reusable `EducationalTreatment` component and structured visual treatment contracts. Normative Learn/treatment authority already exists; the implementation does not redefine educational truth, evidence semantics or Content Factory release gates.
