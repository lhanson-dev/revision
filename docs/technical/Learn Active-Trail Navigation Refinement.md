# Learn Active-Trail Navigation Refinement

**Status:** Active implementation record  
**Date:** 26 September 2026  
**Authority:** `10-product-governance/Global Learner Navigation.md`, `10-product-governance/Learn MVP Experience.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `ContextualLearnerNavigation` / `CourseExperienceScreen` → `LearnReadingWorkspace`

## Purpose

Record the implementation refinement that keeps Revision's existing learner rail/drawer but prevents deep course contents from becoming an unreadable, permanently indented sitemap.

The change implements the already-governed progressive-disclosure rule more strictly. It does not create a new navigation model, a second Learn contents rail or a new learner-wide destination.

## Problem corrected

The previous Learn implementation expanded the active chapter and then rendered every group and every teaching page inside that chapter simultaneously. Combined with separate indentation at course, section, chapter, group and page levels, this made the left rail progressively narrower and harder to scan as content depth increased.

That behaviour was broader than the product authority's intended minimum-context expansion.

A production regression after the first active-trail implementation also exposed two layout defects:

- the desktop navigation grid was allowed to stretch its rows vertically after the contextual course branch made the rail independently scrollable, creating large gaps between otherwise compact navigation links; and
- the selected course was still represented as another indented navigation button, while the Learn contents tree was appended after all course sections rather than nested directly beneath Learn.

The corrected implementation therefore treats the selected course as a hierarchy reset rather than another level of indented navigation.

A further production review exposed an unnecessary hierarchy level where legacy fallback learning sections are represented internally as a group containing one teaching page with the same title. Rendering both levels produced rows such as `Objectives, cash & profit → Objectives, cash & profit`, while authored structures such as `Break-even and profitability → Understanding break-even` correctly used different parent and child labels.

The navigation now compresses only the redundant singleton case. The underlying content hierarchy and teaching-page routes remain unchanged.

## Course hierarchy reset

Inside a selected course, the contextual rail/drawer uses this visual and structural model:

```text
Courses

SUBJECT
Qualification · Exam board · Specification

Overview
Learn
  chapter
    group
      teaching page
Practice
Exam Prep
Progress
```

Rules:

- `Courses` remains the learner-wide destination and route back to the course index;
- the selected course is shown as a non-clickable identity heading using subject plus qualification / exam-board / specification metadata;
- course sections restart from the first contextual navigation level rather than inheriting another course-level indent;
- the Learn academic tree is rendered directly beneath Learn, before the sibling Practice / Exam Prep / Progress rows;
- only academic descendants beneath Learn add progressive indentation; and
- desktop contextual navigation is top-aligned so making the rail independently scrollable cannot stretch row spacing to fill the viewport.

This is the intended interpretation of the governed `Courses → learner course → focused section → contextual academic contents` hierarchy: semantic nesting remains clear, but visual indentation is reset at the selected-course boundary so the rail stays readable.

## Active-trail behaviour

The learner navigation now uses this resting model inside Learn:

`Courses → selected course identity → Learn → chapters → active chapter groups → active group pages`

Rules:

- all chapters remain discoverable in academic order;
- only one chapter is expanded at a time;
- only one meaningful multi-level group inside that chapter is expanded at a time;
- a group containing exactly one teaching page with the same normalized title is rendered once as a direct teaching-page link at group depth rather than as a disclosure followed by a duplicate child;
- a singleton group whose teaching-page title is meaningfully different remains a disclosure with its child teaching page, preserving structures such as `Break-even and profitability → Understanding break-even`;
- the current teaching page receives `aria-current="page"` and the strongest local active treatment;
- sibling groups and their teaching pages stay collapsed until the learner deliberately opens them;
- changing teaching page reconstructs the active chapter/group trail from route state;
- desktop and tablet/mobile use the same hierarchy through the existing shared `ContextualLearnerNavigation` component;
- long labels wrap instead of being compressed into a narrow ellipsis-only tree; and
- visual indentation is bounded so semantic depth is conveyed through typography, disclosure controls, guide lines and active state rather than a new horizontal offset at every level.

## Disclosure semantics

Chapter rows and meaningful group rows are disclosure controls, not teaching-page destinations.

Selecting a chapter expands or collapses its groups. Selecting a meaningful group expands or collapses its teaching pages. Only a teaching-page row changes the learner's route.

There is one presentation exception: when a group exists only to contain one teaching page with the same normalized label, the redundant disclosure level is omitted and that visible row acts directly as the teaching-page destination. This is a visual/navigation compression only; it does not rewrite the canonical Learn content model, page identity, sequencing or route.

This removes both the previous surprise behaviour where selecting a chapter could implicitly navigate to the first teaching page in that chapter and the later duplicate-label behaviour where an internal fallback wrapper was exposed as a meaningful learner choice.

Disclosure controls expose `aria-expanded` and use the shared chevron icon. Direct singleton teaching-page links do not expose `aria-expanded`. Reduced-motion preference disables the chevron transition through the existing Interface System motion rules.

## Course and subject hierarchy

No new Subject navigation hop is introduced.

The canonical learner route remains `Courses → saved course → focused section`. Subject remains academic identity/discovery metadata, consistent with current navigation authority.

The selected course is represented as course identity rather than a nested destination button while its focused sections form the first actionable contextual level. This preserves course identity without representing every semantic level as another deep indent.

## Teaching-page orientation

The Learn article retains lightweight orientation above the page title and explicitly begins with `Learn`, followed by the current chapter and group.

This complements the rail/drawer rather than creating another navigation system. The existing course identity and `Overview / Learn / Practice / Exam Prep / Progress` chrome remain the surrounding frame.

## Sequential navigation and scroll position

Previous/Next remains the normal sequential Learn continuation.

When a learner selects Previous or Next, Revision navigates to the adjacent teaching page and resets the window reading position to the top. Direct teaching-page selection from the contextual rail/drawer applies the same top-of-page reset.

This prevents learners landing midway down a newly selected article because the browser retained the previous page's scroll position.

## Responsive and viewport behaviour

The existing responsive navigation model is unchanged:

- desktop uses the persistent learner rail;
- when the desktop course hierarchy exceeds the viewport, the navigation region scrolls independently so lower chapters remain reachable while REV identity, Ask REV and account access remain stable;
- scrollability must not stretch navigation rows vertically: the navigation grid remains top-aligned with compact intrinsic row heights;
- tablet/mobile use the governed navigation drawer;
- selecting a teaching page on tablet/mobile navigates and closes the drawer through the existing shell behaviour;
- reopening the drawer reconstructs the active trail from the new route; and
- the rail/drawer must not develop horizontal overflow as labels or hierarchy depth increase.

Touch targets remain at least the existing governed mobile navigation size.

## Implementation files

- `src/app/ContextualLearnerNavigation.tsx` — selected-course identity reset, section ordering, active-trail state, chapter/group disclosure semantics, redundant singleton compression, exact-page navigation and route reconstruction.
- `src/app/contextual-navigation.css` — compact top-aligned rail rows, selected-course hierarchy reset, course identity treatment, bounded contextual hierarchy, wrapping, disclosure layout and desktop overflow reachability.
- `src/app/learn-navigation.css` — Learn-specific active-trail visual hierarchy with progressive but capped indentation beneath Learn.
- `src/app/LearnReadingWorkspace.tsx` — `Learn → chapter → group` location context and top reset for sequential navigation.
- `tests/e2e/learn-active-trail-navigation.spec.ts` — phone/tablet/desktop assurance for active trail, redundant singleton compression, preservation of meaningful parent/child groups, current-page reconstruction, scroll reset and overflow/reachability protection.
- `tests/e2e/course-navigation-hierarchy.spec.ts` — regression assurance for compact desktop navigation spacing, selected-course hierarchy reset, section ordering and increasing Learn descendant indentation.

## Assurance requirement

The governed PR must pass normal exact-head Revision CI and the targeted Playwright coverage across phone, tablet and desktop.

The targeted tests prove:

- global navigation rows do not stretch apart when the Courses branch is active;
- the selected course is presented as identity rather than another indented destination;
- course sections appear in the expected order and the Learn tree is nested directly beneath Learn;
- the current chapter is expanded;
- identical singleton group/page labels render once as a direct page link with no redundant disclosure control;
- meaningfully different singleton group/page labels preserve the parent disclosure and child page;
- meaningful chapter/group disclosure does not change route;
- academic descendants indent progressively beneath Learn while the course-section level remains reset;
- lower desktop chapters remain reachable when the course hierarchy exceeds the viewport;
- Previous/Next lands on the new teaching page at the top;
- route changes rebuild the correct active trail; and
- the rail/drawer does not horizontally overflow.

## Documentation impact

No new normative navigation model is introduced. The active product authorities already require progressive disclosure, the active chapter/group/page hierarchy, one shared rail/drawer, minimum necessary hierarchy and avoidance of an always-expanded sitemap. Compressing a redundant singleton wrapper is an implementation clarification of those rules, not a change to the canonical learning-content hierarchy.

Historical design and assurance evidence remains unchanged. This record documents the current implementation refinement alongside the existing Learn reading and Interface System technical records.
