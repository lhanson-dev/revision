# Returning Student Home Implementation

**Status:** implementation description for PR #167  
**Updated:** 2026-08-25

## Purpose

Describe the canonical implementation of the Founder-approved Returning Student Home experience.

For Home composition and Home-specific runtime behaviour, this document supersedes the older **Home composition** section in `docs/technical/REV Homepage Shell Implementation.md`. That wider document remains current for the learner shell, navigation, account, Admin and contextual REV architecture.

Normative product/experience authority remains:

- `10-product-governance/Returning Student Home Experience.md`;
- `20-brand-and-experience/Subject Accent Colour System.md`;
- `10-product-governance/Adaptive Revision Planning.md`; and
- `20-brand-and-experience/Product UX Principles.md`.

## Canonical target

The user-facing target is:

`/revision/app/#/home`

The runtime path is:

`app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `PlannerHomeScreen`

The older Home/REV compatibility rendering inside `src/app/App.tsx` is not the canonical signed-in Home and is not modified by this implementation.

## Home hierarchy

`PlannerHomeScreen` now renders one coherent hierarchy:

1. large Deep Teal REV hero;
2. enlarged Living E with the Home-only soft/fuzzy halo treatment;
3. personalised `Hi {first name}, what shall we do today?` greeting;
4. `Ask REV anything…` input;
5. `Today’s revision plan`;
6. one promoted **Start here** task; and
7. remaining useful activities, visually subordinate to the first task.

Home currently ends after the revision plan. It does not render the previous standalone `REV recommends` card, separate `Why this?` action, quick-prompt buttons or speculative lower dashboard modules.

The persistent learner-shell Ask REV action remains independently available on desktop and responsive layouts.

## REV visual treatment

The canonical `RevPresence` component and three-bar Living E geometry remain unchanged.

`src/app/returning-home.css` applies a Home-only feature treatment:

- larger hero scale;
- Deep Teal feature surface;
- softer radial halo whose visible falloff begins farther from the bars;
- restrained white/aqua centre;
- wider blurred outer glow; and
- the existing semantic Resting / Listening / Thinking / Responding / Completed motion states.

The treatment is scoped to `.returning-home-hero .rev-presence-hero`, so nav, conversation and other REV usages retain their existing geometry and halo treatment. Reduced-motion behaviour remains owned by the existing Living E accessibility/motion rules.

No `Powered by REV` lock-up is rendered because there is currently no approved canonical standalone REV wordmark asset. The implementation does not reconstruct one from memory.

## Deterministic Home task selection

Home first attempts to use the existing FI-001 deterministic planner snapshot.

`src/app/home-task.ts` maps planner `today` items into Home tasks without changing planner scoring or allowing REV/LLM output to determine priority.

When planner setup is incomplete or no planner `today` item can be produced, Home falls back to the existing deterministic learning-state recommendation model:

`ModuleLearningState` → `chooseRecommendedModule(...)` → existing `RevisionRecommendation`

This means missing assessment dates or revision availability do not automatically block useful Home behaviour. The fallback uses only active learner courses and their recorded evidence. It does not fabricate a schedule, assessment or weakness.

Planner items remain preferred whenever an actionable planner result exists.

## Direct useful-activity start

Flashcard and quick-check Home tasks start in one learner action through `HomeFocusedActivity`.

The focused surface:

- uses the exact recommended course/topic/activity held by the deterministic Home task;
- reads content from the existing `LearningContentAdapter`;
- records evidence through the existing `learning-evidence-service`;
- creates standard evidence through `practice-evidence.ts`; and
- refreshes Home after the learner returns so the next recommendation can use the new evidence.

It does not create a second evidence schema or AI recommendation engine.

### Exam-question boundary

Current planner `PlannerItem` records `courseId`, `topicId` and `activityType`, but does not carry a paper/module identity.

For an `exam-question` recommendation, Home therefore routes directly to the governed course **Exam Prep** surface rather than pretending that a specific paper has been selected. This is a deliberate truthfulness boundary. A future planner contract may add exact paper/activity identity; until then, production must not infer it.

## Subject accent implementation

Subject colour is implemented centrally through:

- `src/app/subject-accents.ts` — stable semantic mapping;
- `src/app/subject-accents.css` — reusable visual roles; and
- existing Brand System foundation tokens.

Current mapping:

- Business → Sage;
- Economics → Stone Blue;
- unmapped subject → neutral fallback.

Dark mode derives subject surfaces/foregrounds from the same governed accent rather than inventing an unrelated dark palette.

Home uses subject accents only for small recognition cues: subject chip, promoted-task edge and thin remaining-task marker. Activity type, duration, body text, CTA and semantic status remain neutral/brand/functional as governed.

## Free and entitlement behaviour

No subscription check is introduced by this implementation. Returning Home, the useful plan and direct Home activity start remain part of the coherent Student Free journey.

Parent, Teacher and School functionality are not dependencies.

## Responsive behaviour

The hierarchy is invariant across breakpoints:

`REV hero → Today’s revision plan → Start here → remaining activities`

Desktop uses the approved asymmetric two-column plan composition. Tablet reduces the REV graphic column while retaining the hero. Phone stacks the revision plan and keeps REV visually meaningful rather than reducing it to a generic icon.

The existing responsive learner shell and persistent bottom Ask REV dock remain authoritative and unchanged.

## Key files

- `src/app/PlannerHomeScreen.tsx` — canonical Home composition, planner/fallback selection and start behaviour.
- `src/app/home-task.ts` — deterministic mapping/fallback task model.
- `src/app/HomeFocusedActivity.tsx` — one-action flashcard/quick-check focused session using normal evidence persistence.
- `src/app/subject-accents.ts` — central subject mapping.
- `src/app/subject-accents.css` — reusable subject visual roles.
- `src/app/returning-home.css` — locked Home composition and responsive/Light/Dark treatment.
- `src/main.tsx` — loads Home/subject styles after the existing Interface System layers so the approved specialised Home treatment wins without modifying compatibility surfaces.

## Assurance

The implementation must remain covered by:

- TypeScript typecheck;
- lint;
- unit tests, including deterministic fallback/subject mapping;
- production build;
- automated accessibility baseline;
- responsive browser assurance for phone, tablet and desktop;
- Light/Dark theme assurance;
- no horizontal overflow;
- GJ-01 first-use regression assurance; and
- exact Home interaction assurance for promoted task start and evidence persistence.

## Documentation impact

This is a current technical implementation record. It does not rewrite historical GJ-01 evidence or the PR #162 governance decision. `REV Homepage Shell Implementation.md` remains the wider shell document; this file is the more specific current implementation source for Returning Student Home.
