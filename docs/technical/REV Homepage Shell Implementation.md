# REV Homepage Shell Implementation

**Status:** current implementation description

## Purpose

Describe the implemented Revision learner shell in the governed React application at `/app/`, including the REV-led Home, global learner navigation and focused subject/course/paper screens.

## Canonical learner route

The governed learner product is the Vite/React application published at:

`/revision/app/`

The repository root `/revision/` is not a second learner application. Until a future public marketing/editorial site occupies `/`, the root contains only a lightweight redirect into `/revision/app/`.

## Runtime and entry point

The canonical runtime is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/App.tsx`

The Pages deployment publishes the built Vite `dist/` artifact.

## Learner screen hierarchy

The React learner product now uses distinct screen states rather than one large scrolling learner page.

Global learner navigation is:

1. **Home** — learner-wide REV guidance and quiet high-level subject/progress signposts.
2. **Subjects** — the learner's subject list.
3. **Progress** — learner-wide progress with drill-down into subject/paper context.
4. **REV** — the dedicated global REV space.

The current Business path is:

`Home / Subjects → Business Subject Home → AQA AS Business → Paper 2 Overview`

Paper 2 then exposes first-class contextual sections:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

The Overview is a hub. It does not render all learning tools on one page.

## Client-side route model

GitHub Pages does not provide a general SPA rewrite for arbitrary deep learner URLs. To keep focused screens reloadable without changing the permanent `/app/` product boundary, the current implementation uses hash routes.

Examples:

- `/revision/app/#/home`
- `/revision/app/#/subjects`
- `/revision/app/#/subjects/business`
- `/revision/app/#/subjects/business/aqa-as/paper-2`
- `/revision/app/#/subjects/business/aqa-as/paper-2/learn`
- `/revision/app/#/subjects/business/aqa-as/paper-2/practice`
- `/revision/app/#/subjects/business/aqa-as/paper-2/exam-prep`
- `/revision/app/#/subjects/business/aqa-as/paper-2/progress`
- `/revision/app/#/progress`
- `/revision/app/#/rev`

`src/app/navigation.ts` is the current route model. Hash routing is a hosting-compatible implementation choice, not a product-authority decision; a later hosting change may replace it without changing the governed hierarchy.

## REV behaviour

REV remains the first primary surface after sign-in and the same assistant identity across scopes.

### Global Home

Home asks “What shall we do today?” and keeps the recommendation at learner-wide level first. Because the current live catalogue contains only Business, the implementation does not pretend to compare multiple enrolled subjects yet. It explicitly identifies Business as the current subject in the revision list, then uses the existing Paper 2 recommendation engine for the deeper topic/activity suggestion.

Accepting the Home recommendation opens **Business Subject Home** rather than jumping directly into a Paper 2 activity.

### Subject Home

Business Subject Home narrows REV context to Business, shows the learner's AQA AS/specification context and exposes the available paper structure. The learner can then open Paper 2 or review Business progress.

### Paper context

Paper 2 Overview narrows REV again and recommends a useful next action within that paper. The learner can then choose the focused section that matches their intent.

### Dedicated REV screen

The dedicated REV screen currently exposes the same deterministic evidence-aware guidance and routes into Subjects/Business. A genuine conversational tutor layer can be added on top of this context model later without redesigning the information architecture.

## Focused learning capabilities

`src/app/FocusedLearningWorkspace.tsx` reorganises the existing Business capabilities without removing them.

### Learn

- topic notes/explanations;
- topic connections/linking.

### Practice

- flashcards;
- quick checks;
- guided case/application practice;
- self-assessed exam questions;
- formulas and data drills.

### Exam Prep

- exam-answer technique/blueprints;
- the existing full timed Paper 2 Exam Simulator.

### Progress

Paper Progress keeps evidence coverage, scored activity and readiness distinct, shows recent evidence and allows topic-level evidence inspection.

Global Progress uses the same evidence model and currently shows the Business/Paper 2 evidence available. It is structurally ready for additional subjects, but cross-subject aggregation/recommendation will require implementation when a second live subject is added.

## Data and claim boundaries

The learner shell displays only information supported by current product data. It does not invent:

- additional enrolled subjects;
- exam dates;
- grade forecasts;
- generic “on track” claims; or
- readiness where the governed evidence thresholds have not been met.

The current subject list contains Business because that is the only live registered content pack. The UI and navigation are multi-subject-ready, but subject enrolment persistence and cross-subject prioritisation are not falsely represented as complete.

## Motion and accessibility

REV retains the restrained abstract orb/waveform treatment and optional typing motion.

Motion:

- is non-essential to understanding;
- stops under `prefers-reduced-motion`;
- does not flash; and
- does not block navigation or learning work.

The global and contextual navigation remain keyboard/touch operable. Focused screens reduce cognitive load compared with the previous all-in-one page and remain subject to the project's WCAG 2.2 AA target.

## Implementation files

- `src/app/App.tsx` — authentication, global learner shell, REV Home/Subject/Paper composition, evidence loading and route-aware screen rendering.
- `src/app/navigation.ts` — reloadable hash-route model beneath `/app/`.
- `src/app/FocusedLearningWorkspace.tsx` — focused Learn / Practice / Exam Prep capability composition.
- `src/app/hierarchy.css` — subject/paper hierarchy and focused-screen presentation.
- `src/app/rev-home.css` — core REV visual system and responsive global navigation baseline.
- `src/app/ExamSimulator.tsx` — full timed exam experience.
- `src/engine/readiness/readiness.ts` — shared deterministic readiness and next-activity recommendation logic.
- `tests/e2e/app-responsive.spec.ts` — phone/tablet/desktop assurance for the global and contextual navigation plus learning and exam journeys.

## GitHub Pages deployment

The Pages workflow builds the Vite learner application into `dist/` and deploys that artifact. `/app/` therefore changes only through the governed Vite build.

The workflow copies only the lightweight root redirect into the final artifact; it does not publish the retired static learner runtime or legacy `subjects/` routes.

Production smoke continues to verify:

- the root points into `/app/`;
- `/app/` references a built `/revision/assets/*.js` bundle rather than raw TypeScript source; and
- the retired legacy learner route and retired root Home asset path return 404.

## Next technical steps

The hierarchy is now separated from the Business-specific content implementation. The next expansion work can therefore add subject-enrolment persistence, a second content pack and cross-subject recommendation logic without redesigning Home or the navigation model.

A later REV programme can add genuine conversation on top of the same subject/paper/topic/activity context and governed evidence services rather than developing a parallel interpretation of learner progress.
