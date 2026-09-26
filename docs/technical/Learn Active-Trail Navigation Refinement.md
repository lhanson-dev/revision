# Learn Active-Trail Navigation Refinement

**Status:** Active implementation record  
**Date:** 26 September 2026  
**Authority:** `10-product-governance/Global Learner Navigation.md`, `10-product-governance/Learn MVP Experience.md`, `10-product-governance/Learner Content Canvas Amendment.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `ContextualLearnerNavigation` / `CourseExperienceScreen` → `LearnReadingWorkspace`

## Purpose

Record the implementation refinement that keeps Revision's existing learner rail/drawer but prevents deep course contents from becoming an unreadable, permanently indented sitemap, while keeping the Learn reading surface aligned to the same stable learner content canvas as the rest of the product.

The change extends the governed progressive-disclosure rule without creating a new navigation model, a second Learn contents rail or a new learner-wide destination. It also aligns Learn with the shared Interface System while preserving its reading-first teaching composition.

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
- the Learn article began directly on the page background while Practice and the other focused sections used the shared full-width bordered course-section surface.

Those issues were corrected by making the active Learn row a route-preserving disclosure and giving Learn the shared outer course-section surface.

A subsequent Founder review identified that the implementation had incorrectly retained a centred approximately `760px` **top-level Learn article** inside that surface. That was an implementation/design assumption, not approved Founder direction. The corrected rule is now site-wide: ordinary learner destinations share one stable outer content canvas, while shorter long-form line length is only an internal typographic treatment.

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

Disclosure controls expose `aria-expanded` and use the shared chevron icon. The Learn chevron reflects its collapsed/expanded state in the same way as chapter/group disclosure icons. Direct singleton teaching-page links do not expose `aria-expanded`. Reduced-motion preference disables disclosure-chevron transitions through the existing Interface System motion rules.

## Shared learner and course-section canvas

Learn keeps its reading-first internal composition but inherits both the shared learner canvas and the same outer course-section surface grammar as Practice and the other focused course sections:

- the enclosing learner screen uses the shared `--layout-learner-canvas-max` geometry;
- the course section uses full available width within the existing `paper-section-content` frame;
- the governed `var(--color-surface)` background, border and `var(--radius-surface)` treatment are retained;
- desktop section padding uses `var(--space-8)` and compact/mobile padding uses `var(--space-5)`; and
- no additional raised shadow is introduced.

Inside that outer frame, `article.learn-reading-page` uses the full available inner section width and begins on the same left content grid as the equivalent Practice workspace content. Learn must not create a second centred page canvas.

Long-form prose may still use `--layout-prose-measure` (currently `760px`) to keep line length readable. That restriction is applied to prose itself, aligned to the shared content grid. Educational treatments, diagrams, comparisons, worked examples, relationship visuals, navigation and other content may use more of the available section width where their teaching job benefits from it.

Educational treatment surfaces keep their governed semantic styling. The shared frame is shell containment, not another educational treatment or generic dashboard card.

## Site-wide learner canvas

The shared canvas is not Learn-specific. Ordinary learner destinations are expected to resolve through the same outer `main.dashboard` geometry so Home, Plan, Progress, Courses and course pages do not jump horizontally when the learner changes destination.

The shared layout role is implemented centrally rather than by feature-local widths. Dedicated specialist exceptions, such as a deliberately full-screen timed performance experience, must be explicit in their own contract.

## Course and subject hierarchy

No new Subject navigation hop is introduced.

The canonical learner route remains `Courses → saved course → focused section`. Subject remains academic identity/discovery metadata, consistent with current navigation authority.

The selected course is represented as course identity rather than a nested destination button while its focused sections form the first actionable contextual level.

## Teaching-page orientation

The Learn article retains lightweight orientation above the page title and explicitly begins with `Learn`, followed by the current chapter and group.

This complements the rail/drawer rather than creating another navigation system. The existing course identity and `Overview / Learn / Practice / Exam Prep / Progress` chrome remain the surrounding frame.

## Sequential navigation and scroll position

Previous/Next remains the normal sequential Learn continuation.

When a learner selects Previous or Next, Revision navigates to the adjacent teaching page and resets the window reading position to the top. Direct teaching-page selection from the contextual rail/drawer applies the same top-of-page reset.

## Responsive and viewport behaviour

The existing responsive navigation model is unchanged:

- desktop uses the persistent learner rail;
- when the desktop course hierarchy exceeds the viewport, the navigation region scrolls independently so lower chapters remain reachable while REV identity, Ask REV and account access remain stable;
- scrollability must not stretch navigation rows vertically: the navigation grid remains top-aligned with compact intrinsic row heights;
- tablet/mobile use the governed navigation drawer;
- while the drawer is open, selecting the already-active Learn row collapses/reopens its nested contents without closing the drawer;
- selecting a teaching page on tablet/mobile navigates and closes the drawer through the existing shell behaviour;
- reopening the drawer reconstructs the expanded active trail from the current route;
- the Learn outer surface uses the same responsive section padding as the shared focused workspace;
- prose line measure naturally collapses to the available content width on smaller viewports; and
- the rail/drawer must not develop horizontal overflow as labels or hierarchy depth increase.

Touch targets remain at least the existing governed mobile navigation size.

## Implementation files

- `src/app/ContextualLearnerNavigation.tsx` — selected-course identity reset, active Learn disclosure state, section ordering, active-trail state, chapter/group disclosure semantics, redundant singleton compression, exact-page navigation and route reconstruction.
- `src/app/contextual-navigation.css` — compact top-aligned rail rows, selected-course hierarchy reset, Learn disclosure-chevron state, course identity treatment, bounded contextual hierarchy, wrapping and desktop overflow reachability.
- `src/app/learn-navigation.css` — Learn-specific active-trail visual hierarchy with progressive but capped indentation beneath Learn.
- `src/app/LearnReadingWorkspace.tsx` — `Learn → chapter → group` location context and top reset for sequential navigation.
- `src/app/brand-tokens.css` — shared learner canvas and prose-measure roles.
- `src/app/interface-layout.css` — shared ordinary learner-screen canvas implementation.
- `src/app/learn-reading.css` — shared outer course-section frame, full-width Learn article alignment, internal prose measure and Learn educational treatments.
- `tests/e2e/learn-active-trail-navigation.spec.ts` — phone/tablet/desktop assurance for disclosure, hierarchy, scroll reset, shared section/content canvas and site-wide learner-canvas stability.

## Assurance requirement

The governed PR must pass normal exact-head Revision CI and targeted Playwright coverage across phone, tablet and desktop.

The targeted tests prove:

- global navigation rows do not stretch apart when the Courses branch is active;
- the selected course is presented as identity rather than another indented destination;
- course sections appear in the expected order and the Learn tree is nested directly beneath Learn;
- active Learn opens expanded by default and can collapse/reopen without route change;
- identical singleton group/page labels render once while meaningful parent/child labels are preserved;
- academic descendants indent progressively beneath Learn while the course-section level remains reset;
- lower desktop chapters remain reachable when the course hierarchy exceeds the viewport;
- Previous/Next lands on the new teaching page at the top;
- Learn and Practice use equivalent outer course-section surface geometry;
- the Learn article and Practice workspace content start/end on the same section content grid;
- ordinary Learn prose remains bounded by the internal readable-measure role without centring the whole page; and
- Home, Plan, Progress, Courses and course pages retain one outer learner-canvas geometry at each tested breakpoint.

## Documentation impact

The 26 September 2026 centred-`760px` Learn article wording was not valid Founder-approved direction. The active `Learner Content Canvas Amendment` records the correction without rewriting historical evidence. Product UX authority, shared layout implementation, Learn technical documentation and browser assurance now distinguish a stable site-wide canvas from an internal readable prose measure.

The changes do not alter the canonical learning-content hierarchy, teaching-page identity, Course Truth, Practice/Exam Prep semantics or readiness evidence model.
