# Returning Student Home Implementation

**Status:** current implementation description  
**Updated:** 2026-10-08

## Purpose

Describe the current canonical signed-in Returning Student Home implementation and its relationship to the governed Home authority.

Normative product/experience authority remains:

- `10-product-governance/Returning Student Home Experience.md`;
- `10-product-governance/Adaptive Revision Planning.md`;
- `20-brand-and-experience/Learner Design System.md`;
- `20-brand-and-experience/REV Guidance and Conversation Pattern.md`;
- `20-brand-and-experience/Identity Asset Usage Rules.md`; and
- `20-brand-and-experience/Subject Accent Colour System.md`.

This file records implementation truth. Where the current page composition is still behind the normative Home authority, that remains implementation debt rather than a competing design rule.

## Canonical target and runtime

The user-facing target is:

`/revision/app/#/home`

The runtime path is:

`app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `PlannerHomeScreen`

`PlannerHomeScreen` is the canonical signed-in Home renderer. Older Home/REV compatibility rendering in `src/app/App.tsx` is not the production Home.

## Current Home composition

The current `PlannerHomeScreen` renders:

1. the current date and personalised `Hey {name}. Here’s what I’d do today.` heading;
2. a compact contextual `Ask REV anything` control;
3. one deterministic REV suggestion card when a useful recommendation exists;
4. an honest setup, loading, error or “nothing else today” state when that is the truthful state;
5. active learner course tiles with subject identity, Topics covered and Understanding;
6. a Next exam summary when an assessment is known; and
7. a concise Your plan summary with a route to Plan.

Starting the promoted flashcard or Quick check replaces Home with `HomeFocusedActivity` for the exact selected course/topic/activity and returns to refreshed Home afterwards.

This composition is intentionally preserved by C3.1. The current Home authority still governs any later page-composition reconciliation; C3.1 is a design-system migration, not a Home information-architecture redesign.

## Deterministic recommendation and planning behaviour

REV does not choose the Home recommendation through unconstrained model judgement.

Home uses the governed deterministic recommendation stack:

- current learner programme;
- current learning evidence;
- planner setup and assessment/availability context where present;
- accepted planned sessions where available; and
- deterministic recommendation/ranking code.

`src/app/rev-suggestions.ts` ranks available suggestions. `Not now` and `Suggest something else` operate on that deterministic candidate set. The LLM is not the authority calculating the priority order.

If a planner item resolves to `exam-question` without a paper identity, Home routes to the governed course Exam Prep surface rather than inventing a paper.

## Evidence behaviour

Home does not create a separate evidence model.

`HomeFocusedActivity` uses the existing learning-content and evidence services. Completing supported Home activity writes the normal governed evidence and then refreshes Home so later recommendations can use it.

Quick check remains governed by the Educational Treatment and Claims/Progress rules: it is unscored and must not create progress evidence where the authority prohibits that.

## Learner design-system ownership

Phase C3.1 moves Home presentation fully onto the canonical learner design roles.

Current ownership is:

- `src/app/brand-tokens.css` — semantic colours, learner display typography, spacing, radii, focus and theme translation;
- `src/app/home-v2.css` — Home-only composition using those canonical roles;
- `src/app/ui/RevSuggestionCard.tsx` and shared UI primitives — reusable component anatomy;
- `src/app/subject-palette.ts` / `SubjectBadge` — governed subject mark and hue identity; and
- shared `RevPresence` / Living E implementation — REV identity.

`home-v2.css` must not consume `--rv-*` compatibility tokens. Ordinary surfaces use the canonical 20px surface radius, major feature surfaces use 28px, controls use 14px unless a genuine pill/circle treatment is intended, and Home display hierarchy consumes the central learner H1/H2/H3/hero roles.

The older `returning-home.css` / `returning-home-fidelity.css` files remain loaded for retained compatibility selectors, but they are not the canonical owner of the current `home-v2` page composition.

## REV identity

The learner app uses the governed four-state Living E model only:

- Waiting / Resting;
- Listening;
- Thinking; and
- Responding.

There is no learner-facing Completed REV state.

Persistent shell Ask REV remains owned by the shared shell. The Home `Ask REV anything` control is contextual page access and opens the same governed conversation experience rather than creating another assistant.

## Responsive and theme behaviour

Home must remain usable from 320px through desktop without horizontal scrolling.

The current composition:

- collapses its two-column content layout at constrained widths;
- keeps learner controls at governed touch sizes;
- preserves subject identity without using colour alone;
- uses the same semantic roles in Light and Dark; and
- preserves reduced-motion behaviour for REV.

The C3.1 migration deliberately changes some raster output because the old v2 background/surface palette is being retired in favour of the canonical Canvas/Surface roles. This is expected visual change, not a data or behaviour change.

## Key files

- `src/app/PlannerHomeScreen.tsx` — canonical Home composition and behaviour.
- `src/app/HomeFocusedActivity.tsx` — direct useful activity launched from Home.
- `src/app/rev-suggestions.ts` — deterministic REV suggestion ordering.
- `src/app/home-task.ts` — planner/recommendation task projection.
- `src/app/home-view.ts` — course-tile and next-exam view projection.
- `src/app/home-v2.css` — current Home composition styling.
- `src/app/brand-tokens.css` — canonical learner design roles.
- `src/app/subject-palette.ts` — central subject identity mapping.
- `tests/e2e/returning-home.spec.ts` — behavioural Home assurance.
- `tests/e2e/interface-visual-regression.spec.ts` — exact Home visual contracts.

## Assurance

Home remains covered by:

- typecheck, lint, unit tests and production build;
- returning-student behavioural tests;
- direct promoted-task start;
- deterministic Suggest something else / Not now behaviour;
- accessibility and horizontal-overflow assurance;
- Light/Dark and responsive shell checks; and
- exact phone/desktop Light/Dark screenshot digests.

C3.1 intentionally invalidates the previous four Home visual hashes. CI must retain the resulting captures for Founder review. Only explicitly reviewed C3.1 hashes may replace the existing approved digests.

## Documentation impact

This document is current technical implementation truth. Historical prototypes, earlier screenshots and prior PR evidence remain historical evidence and are not rewritten.

C3.1 changes implementation ownership only. It does not change Returning Student Home product authority, deterministic recommendation behaviour, evidence semantics, planner logic or entitlements.
