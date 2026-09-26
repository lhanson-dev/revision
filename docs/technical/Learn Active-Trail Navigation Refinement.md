# Learn Active-Trail Navigation Refinement

**Status:** Implemented on governed feature branch; pending PR assurance and Founder merge approval  
**Date:** 26 September 2026  
**Authority:** `10-product-governance/Global Learner Navigation.md`, `10-product-governance/Learn MVP Experience.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `ContextualLearnerNavigation` / `CourseExperienceScreen` → `LearnReadingWorkspace`

## Purpose

Record the implementation refinement that keeps Revision's existing learner rail/drawer but prevents deep course contents from becoming an unreadable, permanently indented sitemap.

The change implements the already-governed progressive-disclosure rule more strictly. It does not create a new navigation model, a second Learn contents rail or a new learner-wide destination.

## Problem corrected

The previous Learn implementation expanded the active chapter and then rendered every group and every teaching page inside that chapter simultaneously. Combined with separate indentation at course, section, chapter, group and page levels, this made the left rail progressively narrower and harder to scan as content depth increased.

That behaviour was broader than the product authority's intended minimum-context expansion.

## Active-trail behaviour

The learner navigation now uses this resting model inside Learn:

`Courses → selected course → Learn → chapters → active chapter groups → active group pages`

Rules:

- all chapters remain discoverable in academic order;
- only one chapter is expanded at a time;
- only one group inside that chapter is expanded at a time;
- the current teaching page receives `aria-current="page"` and the strongest local active treatment;
- sibling groups and their teaching pages stay collapsed until the learner deliberately opens them;
- changing teaching page reconstructs the active chapter/group trail from route state;
- desktop and tablet/mobile use the same hierarchy through the existing shared `ContextualLearnerNavigation` component;
- long labels wrap instead of being compressed into a narrow ellipsis-only tree; and
- visual indentation is bounded so semantic depth is conveyed through typography, disclosure controls, guide lines and active state rather than a new horizontal offset at every level.

## Disclosure semantics

Chapter and group rows are disclosure controls, not teaching-page destinations.

Selecting a chapter expands or collapses its groups. Selecting a group expands or collapses its teaching pages. Only a teaching-page row changes the learner's route.

This removes the previous surprise behaviour where selecting a chapter could implicitly navigate to the first teaching page in that chapter.

Disclosure controls expose `aria-expanded` and use the shared chevron icon. Reduced-motion preference disables the chevron transition through the existing Interface System motion rules.

## Course and subject hierarchy

No new Subject navigation hop is introduced.

The canonical learner route remains `Courses → saved course → focused section`. Subject remains academic identity/discovery metadata, consistent with current navigation authority.

The selected course receives stronger context treatment while its focused sections remain visually subordinate. This preserves course identity without representing every semantic level as another deep indent.

## Teaching-page orientation

The Learn article retains lightweight orientation above the page title and now explicitly begins with `Learn`, followed by the current chapter and group.

This complements the rail/drawer rather than creating another navigation system. The existing course identity and `Overview / Learn / Practice / Exam Prep / Progress` chrome remain the surrounding frame.

## Sequential navigation and scroll position

Previous/Next remains the normal sequential Learn continuation.

When a learner selects Previous or Next, Revision navigates to the adjacent teaching page and resets the window reading position to the top. Direct teaching-page selection from the contextual rail/drawer applies the same top-of-page reset.

This prevents learners landing midway down a newly selected article because the browser retained the previous page's scroll position.

## Responsive and viewport behaviour

The existing responsive navigation model is unchanged:

- desktop uses the persistent learner rail;
- when the desktop course hierarchy exceeds the viewport, the navigation region scrolls independently so lower chapters remain reachable while REV identity, Ask REV and account access remain stable;
- tablet/mobile use the governed navigation drawer;
- selecting a teaching page on tablet/mobile navigates and closes the drawer through the existing shell behaviour;
- reopening the drawer reconstructs the active trail from the new route; and
- the rail/drawer must not develop horizontal overflow as labels or hierarchy depth increase.

Touch targets remain at least the existing governed mobile navigation size.

## Implementation files

- `src/app/ContextualLearnerNavigation.tsx` — active-trail state, chapter/group disclosure semantics, exact-page navigation and route reconstruction.
- `src/app/contextual-navigation.css` — bounded contextual hierarchy, selected-course treatment, wrapping, disclosure layout and desktop overflow reachability.
- `src/app/learn-navigation.css` — Learn-specific active-trail visual hierarchy with capped indentation.
- `src/app/LearnReadingWorkspace.tsx` — `Learn → chapter → group` location context and top reset for sequential navigation.
- `tests/e2e/learn-active-trail-navigation.spec.ts` — phone/tablet/desktop assurance for active trail, non-navigating disclosure controls, current-page reconstruction, scroll reset and overflow/reachability protection.

## Assurance requirement

The governed PR must pass normal exact-head Revision CI and the targeted Playwright coverage across phone, tablet and desktop.

The targeted test proves:

- the current chapter is expanded;
- the current group is expanded;
- sibling groups do not dump their pages into the rail;
- chapter/group disclosure does not change route;
- lower desktop chapters remain reachable when the course hierarchy exceeds the viewport;
- Previous/Next lands on the new teaching page at the top;
- route changes rebuild the correct active trail; and
- the rail/drawer does not horizontally overflow.

## Documentation impact

No new normative navigation model is introduced. The active product authorities already require progressive disclosure, the active chapter/group/page hierarchy, one shared rail/drawer and avoidance of an always-expanded sitemap. This change is therefore an implementation clarification of existing approved authority rather than a competing authority change.

Historical design and assurance evidence remains unchanged. This record documents the current implementation refinement alongside the existing Learn reading and Interface System technical records.
