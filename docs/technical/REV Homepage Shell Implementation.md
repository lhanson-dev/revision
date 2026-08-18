# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the implemented Revision learner shell in the governed React application at `/app/`, including the REV-led Home, catalogue-driven subject/course hierarchy and focused learning screens.

## Canonical learner route

The governed learner product is the Vite/React application published at:

`/revision/app/`

The repository root `/revision/` is not a second learner application. Until a future public marketing/editorial site occupies `/`, the root contains only a lightweight redirect into `/revision/app/`.

## Runtime and entry point

The canonical runtime is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/App.tsx`

The Pages deployment publishes the built Vite `dist/` artifact.

## Learner screen hierarchy

Global learner navigation is:

1. **Home** — learner-wide REV guidance and high-level subject/progress signposts.
2. **Subjects** — the current learner catalogue grouped by subject and course/specification.
3. **Progress** — learner-wide evidence with drill-down into subject/paper context.
4. **REV** — the dedicated global REV space.

Selecting a subject opens a Subject Home. Selecting a published paper/component opens an Overview hub with the focused sections supported by that content pack:

- Overview
- Learn
- Practice where practice content exists
- Exam Prep where exam-preparation content exists
- Progress

The Overview remains a hub. It does not render all learning tools on one page.

## Catalogue-driven implementation

The shared React learner shell does not enumerate Business, Spanish, Maths or other subjects as route/page definitions.

`src/engine/content/content-registry.ts` automatically discovers `content/**/index.ts` with Vite `import.meta.glob`. Each content-pack entry point must default-export its validated pack. Only packs whose manifest is marked `available` enter the current learner catalogue.

`src/app/catalogue-model.ts` then groups available adapters into subjects and courses, calculates each module's evidence/readiness state and determines which focused sections are meaningful for that pack.

This means an ordinary new subject/paper can appear in Home, Subjects, Subject Home, Progress and REV without adding a subject-specific React page or route constant.

## Client-side route model

GitHub Pages does not provide a general SPA rewrite for arbitrary deep learner URLs. The current implementation therefore uses reloadable hash routes beneath `/app/`.

The generic route pattern is:

`#/subjects/:subjectId/modules/:moduleId/:section`

Examples using the current Business pack are:

- `/revision/app/#/home`
- `/revision/app/#/subjects`
- `/revision/app/#/subjects/business`
- `/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/overview`
- `/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/learn`
- `/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/practice`
- `/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/exam-prep`
- `/revision/app/#/subjects/business/modules/business-aqa-as-paper-2/progress`
- `/revision/app/#/progress`
- `/revision/app/#/rev`

`src/app/navigation.ts` also accepts the short-lived Business hashes introduced by PR #35 and maps them into the generic route model so recent links do not fail immediately after this change.

Hash routing is a hosting-compatible implementation choice, not product authority. A later hosting change may replace it without changing the governed hierarchy.

## REV behaviour

REV remains the first primary surface after sign-in and the same assistant identity across scopes.

### Global Home

The learner shell loads evidence for every currently published module. It builds an independent learning state for each module and uses the shared deterministic engine to identify the least-supported or lowest-readiness useful focus.

The cross-module selector currently prioritises:

1. modules that do not yet have enough evidence for readiness over modules that already do;
2. lower evidence coverage/fewer scored activities when readiness is unavailable;
3. the lower supported readiness score when multiple modules have readiness; and
4. stable subject/paper ordering only as a tie-break.

The selected module's own recommendation engine then supplies the deeper topic/activity suggestion. This preserves the distinction between choosing **which subject/paper deserves attention** and choosing **what to do inside it**.

Accepting a Home recommendation opens the recommended **Subject Home**, preserving the governed staged hierarchy rather than jumping straight into an activity.

### Subject Home

Subject Home filters the same module-state model to the selected subject. REV can recommend the most useful currently published paper/component within that subject and route the learner into its Overview or Progress.

### Paper/component context

The selected module receives its content through the generic `LearningContentAdapter`. The same focused learning components and evidence services operate regardless of subject identity.

### Dedicated REV screen

The dedicated REV screen uses the same cross-catalogue deterministic context and routes into the recommended subject or the full Subjects view. A conversational tutor layer can later build on this context model without redesigning the information architecture.

## Focused learning capabilities

`src/app/FocusedLearningWorkspace.tsx` is content-adapter driven.

### Learn

- topic notes/explanations;
- topic connections/linking.

### Practice

Where supported by the content pack:

- flashcards;
- quick checks;
- guided case/application practice;
- self-assessed exam questions;
- formulas and data drills.

### Exam Prep

Where supported by the content pack:

- exam-answer technique/blueprints;
- full timed exam simulation using the pack's primary exam.

### Progress

Module Progress keeps evidence coverage, scored activity and readiness distinct, shows recent evidence and allows topic-level evidence inspection.

Global Progress aggregates coverage/activity across published modules while keeping each module's readiness result separate. It does not manufacture a single cross-subject readiness percentage.

## Pilot catalogue and enrolment boundary

There is currently **no persisted per-user subject/course enrolment model** in the repository.

For the current Jamie pilot:

- all content packs marked `available` are treated as part of the authenticated learner catalogue;
- `preview` and `planned` packs remain hidden; and
- adding a new `available` content pack is sufficient for the generic learner shell to discover and render it after the governed build/deployment.

This is deliberately a pilot publication rule, not the long-term enrolment model. Future per-user enrolment should filter the published catalogue before it reaches the learner shell. It must not reintroduce subject-specific routes or engine logic.

## Data and claim boundaries

The learner shell displays only information supported by current product data. It does not invent:

- exam dates;
- grade forecasts;
- generic “on track” claims; or
- readiness where the governed evidence thresholds have not been met.

A newly published subject with no evidence may be prioritised to establish a baseline. That is presented as a coverage/evidence recommendation, not as a claim that the learner is weak in that subject.

## Motion and accessibility

REV retains the restrained abstract orb/waveform treatment and optional typing motion.

Motion:

- is non-essential to understanding;
- stops under `prefers-reduced-motion`;
- does not flash; and
- does not block navigation or learning work.

The global and contextual navigation remain keyboard/touch operable and subject to the project's WCAG 2.2 AA target.

## Implementation files

- `src/app/App.tsx` — authentication, generic learner shell, REV scopes, evidence loading and route-aware rendering.
- `src/app/catalogue-model.ts` — subject/course grouping, module learning states, supported sections and cross-module priority.
- `src/app/navigation.ts` — generic reloadable hash-route model beneath `/app/`.
- `src/app/FocusedLearningWorkspace.tsx` — focused Learn / Practice / Exam Prep capability composition.
- `src/app/hierarchy.css` — subject/paper hierarchy and focused-screen presentation.
- `src/app/rev-home.css` — core REV visual system and responsive global navigation baseline.
- `src/app/ExamSimulator.tsx` — full timed exam experience.
- `src/engine/content/content-registry.ts` — automatic content-pack discovery and publication filtering.
- `src/engine/content/content-adapter.ts` — generic learning-content interface and catalogue metadata.
- `src/engine/readiness/readiness.ts` — shared deterministic readiness and next-activity recommendation logic.
- `tests/e2e/app-responsive.spec.ts` — phone/tablet/desktop assurance for the global/contextual navigation and learning/exam journeys.

## GitHub Pages deployment

The Pages workflow builds the Vite learner application into `dist/` and deploys that artifact. Content-pack discovery therefore happens inside the governed build. `/app/` changes only through that build/deployment process.

Production smoke continues to verify that the root points into `/app/`, `/app/` serves the built Vite bundle, and retired legacy learner routes remain unavailable.

## Next technical steps

The next content expansion can add Jamie's additional subjects/papers as validated content packs and use the existing shell without React subject-page work.

After the pilot catalogue is proven with multiple subjects, the next structural product-data step is persisted learner enrolment so different learners can see different subsets of the published catalogue.

A later REV programme can add genuine conversation on top of the same subject/paper/topic/activity context and governed evidence services rather than developing a parallel interpretation of learner progress.
