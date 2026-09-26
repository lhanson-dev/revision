# Learn Active-Trail Navigation Refinement

**Status:** Active implementation record  
**Date:** 26 September 2026  
**Authority:** `10-product-governance/Global Learner Navigation.md`, `10-product-governance/Learn MVP Experience.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `ContextualLearnerNavigation` / `CourseExperienceScreen` → `LearnReadingWorkspace`

## Purpose

Record the implementation refinement that keeps Revision's existing learner rail/drawer but prevents deep course contents from becoming an unreadable, permanently indented sitemap, while keeping the Learn reading surface visually contained within the same course-section frame as the other focused sections.

The change extends the governed progressive-disclosure rule without creating a new navigation model, a second Learn contents rail or a new learner-wide destination. It also aligns the Learn workspace's outer surface with the shared Interface System while preserving the reading-first teaching article and its restrained measure.

## Problems corrected

The previous Learn implementation expanded the active chapter and then rendered every group and every teaching page inside that chapter simultaneously. Combined with separate indentation at course, section, chapter, group and page levels, this made the left rail progressively narrower and harder to scan as content depth increased.

That behaviour was broader than the product authority's intended minimum-context expansion.

A production regression after the first active-trail implementation also exposed two layout defects:

- the desktop navigation grid was allowed to stretch its rows vertically after the contextual course branch made the rail independently scrollable, creating large gaps between otherwise compact navigation links; and
- the selected course was still represented as another indented navigation button, while the Learn contents tree was appended after all course sections rather than nested directly beneath Learn.

The corrected implementation therefore treats the selected course as a hierarchy reset rather than another level of indented navigation.

A further production review exposed an unnecessary hierarchy level where legacy fallback learning sections are represented internally as a group containing one teaching page with the same title. Rendering both levels produced rows such as `Objectives, cash & profit → Objectives, cash & profit`, while authored structures such as `Break-even and profitability → Understanding break-even` correctly used different parent and child labels.

The navigation now compresses only the redundant singleton case. The underlying content hierarchy and teaching-page routes remain unchanged.

Founder review before merge then identified two remaining consistency issues:

- the active Learn row exposed a long nested hierarchy but could not itself collapse/reopen that hierarchy like other disclosure controls; and
- the Learn article began directly on the page background while Practice and the other focused sections used the shared full-width bordered course-section surface, making Learn look narrower and visually detached even though its narrower prose measure was intentional.

The active Learn row is now a route-preserving disclosure, and the Learn workspace now uses the shared outer course-section surface while retaining the centred approximately `760px` reading column.

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

The learner navigation now uses this default model inside Learn:

`Courses → selected course identity → Learn → chapters → active chapter groups → active group pages`

Rules:

- Learn opens expanded by default when it is the active focused section;
- selecting the already-active Learn row collapses or reopens its nested contents without changing route, current teaching page or reading position;
- leaving Learn and entering it again reconstructs the route-derived hierarchy expanded by default;
- all chapters remain discoverable in academic order while Learn is expanded;
- only one chapter is expanded at a time;
- only one meaningful multi-level group inside that chapter is expanded at a time;
- a group containing exactly one teaching page with the same normalized title is rendered once as a direct teaching-page link at group depth rather than as a disclosure followed by a duplicate child;
- a singleton group whose teaching-page title is meaningfully different remains a disclosure with its child teaching page, preserving structures such as `Break-even and profitability → Understanding break-even`;
- the current teaching page receives `aria-current="page"` and the strongest local active treatment;
- sibling groups and their teaching pages stay collapsed until the learner deliberately opens them;
- changing teaching page reconstructs the active chapter/group trail from route state where the Learn section is expanded;
- desktop and tablet/mobile use the same hierarchy through the existing shared `ContextualLearnerNavigation` component;
- long labels wrap instead of being compressed into a narrow ellipsis-only tree; and
- visual indentation is bounded so semantic depth is conveyed through typography, disclosure controls, guide lines and active state rather than a new horizontal offset at every level.

## Disclosure semantics

The active Learn row, chapter rows and meaningful group rows are disclosure controls. Chapter/group disclosures are not teaching-page destinations; the active Learn disclosure also does not navigate when toggled.

Selecting the already-active Learn row expands or collapses the complete Learn contents branch while preserving the current route. Selecting a chapter expands or collapses its groups. Selecting a meaningful group expands or collapses its teaching pages. Only a teaching-page row changes the learner's teaching-page route.

There is one presentation exception: when a group exists only to contain one teaching page with the same normalized label, the redundant disclosure level is omitted and that visible row acts directly as the teaching-page destination. This is a visual/navigation compression only; it does not rewrite the canonical Learn content model, page identity, sequencing or route.

This removes both the previous surprise behaviour where selecting a chapter could implicitly navigate to the first teaching page in that chapter and the later duplicate-label behaviour where an internal fallback wrapper was exposed as a meaningful learner choice.

Disclosure controls expose `aria-expanded` and use the shared chevron icon. The Learn chevron now reflects its collapsed/expanded state in the same way as chapter/group disclosure icons. Direct singleton teaching-page links do not expose `aria-expanded`. Reduced-motion preference disables disclosure-chevron transitions through the existing Interface System motion rules.

## Shared course-section framing

Learn keeps its reading-first internal composition but now inherits the same outer course-section surface grammar as Practice and the other focused course sections:

- full available width within the existing `paper-section-content` course frame;
- the governed `var(--color-surface)` background;
- `1px` governed border;
- shared `var(--radius-surface)` radius;
- shared desktop section padding (`var(--space-8)`);
- shared compact/mobile section padding (`var(--space-5)`); and
- no additional raised shadow.

Inside that outer frame, `article.learn-reading-page` remains centred at `min(100%, 760px)`. The outer frame therefore creates course-level visual consistency without making prose span the full desktop width or wrapping ordinary paragraphs in cards.

Educational treatment surfaces inside the article keep their governed semantic styling. The new outer frame is shell containment, not another educational treatment or generic dashboard card.

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
- while the drawer is open, selecting the already-active Learn row collapses/reopens its nested contents without closing the drawer;
- selecting a teaching page on tablet/mobile navigates and closes the drawer through the existing shell behaviour;
- reopening the drawer reconstructs the expanded active trail from the current route;
- the Learn outer surface uses the same responsive section padding as the shared focused workspace while the article itself remains readable; and
- the rail/drawer must not develop horizontal overflow as labels or hierarchy depth increase.

Touch targets remain at least the existing governed mobile navigation size.

## Implementation files

- `src/app/ContextualLearnerNavigation.tsx` — selected-course identity reset, active Learn disclosure state, section ordering, active-trail state, chapter/group disclosure semantics, redundant singleton compression, exact-page navigation and route reconstruction.
- `src/app/contextual-navigation.css` — compact top-aligned rail rows, selected-course hierarchy reset, Learn disclosure-chevron state, course identity treatment, bounded contextual hierarchy, wrapping and desktop overflow reachability.
- `src/app/learn-navigation.css` — Learn-specific active-trail visual hierarchy with progressive but capped indentation beneath Learn.
- `src/app/LearnReadingWorkspace.tsx` — `Learn → chapter → group` location context and top reset for sequential navigation.
- `src/app/learn-reading.css` — shared outer course-section frame around the centred reading-first article, plus existing Learn educational treatment and responsive styles.
- `tests/e2e/learn-active-trail-navigation.spec.ts` — phone/tablet/desktop assurance for Learn section collapse/reopen, active trail, redundant singleton compression, preservation of meaningful parent/child groups, current-page reconstruction, scroll reset, shared outer surface/readable measure and overflow/reachability protection.
- `tests/e2e/course-navigation-hierarchy.spec.ts` — regression assurance for compact desktop navigation spacing, selected-course hierarchy reset, section ordering and increasing Learn descendant indentation.

## Assurance requirement

The governed PR must pass normal exact-head Revision CI and the targeted Playwright coverage across phone, tablet and desktop.

The targeted tests prove:

- global navigation rows do not stretch apart when the Courses branch is active;
- the selected course is presented as identity rather than another indented destination;
- course sections appear in the expected order and the Learn tree is nested directly beneath Learn;
- active Learn opens expanded by default and can collapse/reopen without route change;
- the current chapter is expanded when Learn contents are visible;
- identical singleton group/page labels render once as a direct page link with no redundant disclosure control;
- meaningfully different singleton group/page labels preserve the parent disclosure and child page;
- meaningful chapter/group disclosure does not change route;
- academic descendants indent progressively beneath Learn while the course-section level remains reset;
- lower desktop chapters remain reachable when the course hierarchy exceeds the viewport;
- Previous/Next lands on the new teaching page at the top;
- route changes rebuild the correct active trail;
- Learn and Practice use equivalent outer course-section surface geometry while Learn preserves a maximum approximately `760px` article measure; and
- the rail/drawer does not horizontally overflow.

## Documentation impact

This refinement updates the active navigation and Learn composition authorities because learner-controlled collapse of the active focused-section descendants and shared outer course-section framing are explicit Founder-approved interaction/composition decisions.

The changes do not alter the canonical learning-content hierarchy, teaching-page identity, Course Truth, Practice/Exam Prep semantics or readiness evidence model. Historical design and assurance evidence remains unchanged; this record documents the current implementation refinement alongside the existing Learn reading and Interface System technical records.