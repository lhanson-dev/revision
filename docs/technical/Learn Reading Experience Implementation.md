# Learn Reading Experience Implementation

**Status:** In Progress under Issue #381  
**Authority:** `10-product-governance/Learn MVP Experience.md`, `10-product-governance/Course Learning Blueprint.md`, `10-product-governance/Global Learner Navigation.md`, `20-brand-and-experience/Educational Treatment System.md`  
**Founder Ready approval:** 24 September 2026  
**Canonical route:** `/revision/app/#/courses/:courseId/learn`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `CourseExperienceScreen` → `LearnReadingWorkspace`

## Purpose

Record the current implementation of the Founder-approved reading-first Learn experience. The implementation replaces the legacy Learn presentation inside `FocusedLearningWorkspace` while preserving the existing learner shell, course chrome, Practice/Exam Prep evidence semantics and Content Factory publication gates.

Learn is implemented as a coherent teaching article, not as a mode selector followed by disconnected note cards.

## Runtime boundary

The existing Revision shell remains canonical. `CourseExperienceScreen` continues to own the course identity and the `Overview / Learn / Practice / Exam Prep / Progress` navigation.

For Learn specifically, `CourseExperienceScreen` now mounts `LearnReadingWorkspace`. It no longer asks the learner to pass through the legacy Learn-only workspace heading, local topic selector, `Topic notes / Link topics` mode switch or generic `Learning activity` framing before reading.

`FocusedLearningWorkspace` remains the current Practice and supporting Exam Prep implementation. This change does not alter Practice scoring, evidence recording, readiness calculation or Exam Prep behaviour except that a Learn → Practice handoff can preserve the exact topic in the route.

## Route context

The governed course route can carry reading/practice context:

- `#/courses/:courseId/learn/:pageId`
- `#/courses/:courseId/practice/:topicId`
- equivalent component routes where component-specific learning applies.

The active Learn page is therefore durable in navigation state rather than hidden inside page-local component state. A contextual Practice handoff routes the learner directly to the relevant topic while retaining the existing Practice implementation.

## Learn content contract

`content/learn-schema.ts` defines learner-facing semantic content independently from page-local styling.

The initial content blocks are:

- `explanation`
- `key-idea`
- `example`
- `worked-example`
- `relationship`
- `comparison`
- `quantitative`
- `misconception`
- `recap`

The schema also defines the learner-visible hierarchy:

`course → chapter/topic → group → teaching page → blocks`

Content selects the educational meaning. The Interface System owns the presentation.

## Whole-course migration boundary

The implementation does not require the course to be rewritten page by page before the reading experience can operate.

`LearningContentAdapter` builds a complete Learn hierarchy for every existing topic. Where richer authored/generated Learn content exists, it is merged into the appropriate topic. Existing sections not yet represented by a richer teaching page remain available through a deterministic reading-page fallback.

This fallback is a migration bridge, not a quality claim that historical section bullet content is equivalent to final Content Factory teaching prose. It prevents navigation/content loss while assured richer Learn assets are integrated progressively.

The Business validation set deliberately exercises representative treatment families rather than manually rebuilding all chapters in this implementation PR.

## Educational treatment renderer

`src/app/ui/EducationalTreatment.tsx` is the shared Interface System wrapper for recurring educational treatments. `LearnReadingWorkspace` consumes that component for Key Ideas, Examples, Worked Examples, relationship visuals, comparisons, quantitative visuals, misconceptions and recaps.

Normal explanatory prose remains outside a treatment card and is the default page surface.

The treatment presentation follows these rules:

- subject accent is a restrained recognition cue rather than a replacement brand colour;
- Primary Teal remains Revision/REV/action colour;
- misconceptions do not borrow Warning/Error semantics merely because the concept can be misunderstood;
- visual hierarchy reflects educational meaning rather than template position; and
- treatments appear only when supplied by the governed content contract.

## Native teaching visuals

The MVP renderer includes structured native visuals where the meaning can be represented without a baked image asset.

### Relationship visual

`relationship` renders a labelled causal/process chain. Desktop may use a horizontal flow where space supports it; constrained screens recompose the same sequence vertically. The semantic order remains in normal HTML list structure.

### Comparison

`comparison` renders two or three governed comparison columns. At narrow widths the same content stacks vertically rather than shrinking into an unreadable table.

### Quantitative visual

`quantitative` renders an inline SVG chart from structured series/point data, together with text labels, a series legend, an accessible data disclosure and explanatory caption where provided.

Chart styling does not rely on colour alone: additional series use distinct line patterns. The SVG is a presentation of structured data rather than the source of educational truth.

## Reading-page flow

`LearnReadingWorkspace` implements the approved flow:

`context → title/orientation → explanation/treatments → contextual REV → recap → previous/next → Practice handoff`

Previous/next is the normal sequential continuation. Practice remains a clear secondary handoff.

The contextual REV prompt uses the current teaching-page title and opens the existing shared Ask REV conversation route. It is not a second persistent assistant.

## Navigation

`ContextualLearnerNavigation` now expands only the active Learn branch:

- chapters are visible in governed academic order;
- the active chapter reveals its groups;
- groups reveal their teaching pages;
- the exact teaching page receives `aria-current="page"`;
- sibling course sections remain separate; and
- tablet/mobile reuse the existing learner drawer rather than adding a Learn-specific drawer.

`src/app/learn-navigation.css` owns the progressive-disclosure presentation inside the existing navigation grammar.

## Responsive behaviour

`src/app/learn-reading.css` owns the teaching-page composition only. The existing shell continues to own desktop rail and responsive drawer behaviour.

The Learn article uses the existing restrained long-form measure (approximately 760px). On smaller screens:

- prose remains full-depth rather than being shortened;
- relationship chains change from horizontal to vertical;
- comparison columns stack;
- contextual REV and Practice handoffs stack;
- previous/next can stack when width is constrained; and
- ordinary Learn content does not require horizontal scrolling.

## Business representative treatment set

`content/business/aqa-a-level/shared/learn.ts` supplies a bounded representative set across shared AQA A-level Business content to prove the renderer against materially different educational jobs:

- aims/objectives — prose, definitions, applied example, causal relationship, misconception;
- revenue/cost/profit — definitions and worked calculation;
- limited companies/shareholders — prose, definitions, structured comparison, misconception; and
- break-even — explanation, worked calculation and native quantitative chart.

The shared Learn object is attached consistently to all three paper packs because Learn owns shared course knowledge. Paper-specific assessment differences remain in Exam Prep.

This representative content is implementation/visual proof. It does not replace the retained Content Factory assurance process or imply that every current fallback page has reached the final comprehensive teaching-content standard.

## Evidence and publication safety

This implementation does not change learner-evidence semantics.

- Reading Learn may support Reviewed state where separately instrumented/governed.
- Viewing a page does not prove Topic Knowledge, mastery or Exam Readiness.
- Scored Practice/Exam Prep evidence remains the basis for demonstrated-performance claims.

The implementation does **not** publish the retained pre-production Content Factory Business bundle. Current Foundation/asset assurance and qualified-human approval gates remain unchanged. A retained Content Factory asset must still be release eligible before it can become learner-facing course truth.

## Accessibility

The implementation inherits the WCAG 2.2 AA Interface System baseline and specifically preserves:

- semantic headings and article structure;
- visible navigation labels/current-page state;
- keyboard-operable actions;
- readable learner body text;
- treatment meaning not conveyed by colour alone;
- responsive reflow rather than microscopic visual scaling; and
- structured/text equivalents for quantitative visuals.

## Assurance

The governed PR for Issue #381 must pass the repository exact-head Revision CI, which runs the normal `npm run validate` chain including TypeScript, lint, unit tests and production build, plus applicable repository assurance jobs.

Targeted browser/visual assurance must cover at least:

- canonical course Learn route;
- nested Learn navigation and exact-page state;
- previous/next route continuity;
- Learn → Practice topic continuity;
- representative treatment rendering;
- relationship/comparison/quantitative responsive behaviour;
- contextual REV handoff;
- Light/Dark behaviour; and
- desktop/tablet/mobile layouts.

## Deliberate exclusions

This implementation does not:

- publish unassured Content Factory assets;
- redesign the learner shell or course header;
- redesign Practice or Exam Prep;
- change readiness/evidence calculations;
- create a new Learn-only navigation system;
- add stock photography or decorative AI imagery;
- introduce audio/video/alternative-format selectors; or
- make generated image assets the default visual mechanism.

## Documentation impact

Issue #381 introduces a new current implementation boundary for Learn. The governed PR therefore updates the Interface System Learn/Practice technical record and shared component registry alongside this focused implementation record. The merged Educational Treatment System authority metadata is also corrected where its frontmatter still describes the already-merged direction as pending.
