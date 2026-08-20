# REV Living E Implementation

**Status:** current implementation description

## Purpose

Describe how the approved Calm Teal, Manrope and Living E visual system is implemented in the canonical signed-in learner runtime.

Normative visual authority remains `20-brand-and-experience/Visual Brand System.md`. This document records implementation truth only.

## Canonical runtime

The implementation applies to the governed learner route:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` remains the owner of the learner-wide shell, responsive global navigation and Home / Plan / REV routing.

## Theme implementation

The learner runtime supports one Calm Teal visual system in light and dark treatments.

- `PlannerRuntime` owns the current `light` / `dark` theme state.
- The preference is persisted under `revision:theme` in browser local storage.
- If no explicit preference exists, the initial theme follows `prefers-color-scheme`.
- The runtime exposes the theme through `data-theme` so the same component tree is styled with theme tokens rather than separate light/dark implementations.
- Desktop exposes a secondary theme toggle in the top bar. Mobile/tablet exposes the same control inside the utility/account drawer.

The theme choice changes presentation only. It does not alter learning state, progress evidence, planning behaviour or entitlement.

## Typography

`app/index.html` loads Manrope from Google Fonts with system sans-serif fallbacks. `src/app/living-e.css` applies Manrope to the canonical learner runtime and its controls.

If the remote font cannot load, the learner experience remains usable with the defined fallback stack.

## Living E component

`src/app/RevPresence.tsx` is the reusable REV visual-presence component.

It renders the three horizontal bars as inline SVG and uses CSS for the soft halo and motion. It does not use GIF, video, canvas, WebGL or a separate mascot asset.

Supported semantic states are:

- `resting`
- `listening`
- `thinking`
- `responding`
- `complete`

Supported display sizes are:

- `hero`
- `conversation`
- `compact`
- `nav`

The component may be decorative when the surrounding control already supplies the accessible name. Otherwise it exposes a text alternative describing the current REV state.

`prefers-reduced-motion: reduce` disables the Living E animations while preserving the static mark and non-motion text/status cues.

## Home implementation

`src/app/PlannerHomeScreen.tsx` now implements Home as a conversation-first surface.

The opening viewport is deliberately spacious and contains, in order:

1. the Living E + soft halo;
2. `Hey {first name}, what shall we do today?`;
3. the REV input; and
4. a quiet status / route into the wider workspace.

Planner recommendations, subject/resource routes and progress information remain available below the opening surface rather than competing with REV above the fold.

The Home input stores a submitted prompt temporarily in session storage under `revision:rev-draft` and opens the governed REV route. `PlannerRevScreen` reads that draft into its conversation input and removes the temporary value. This preserves the learner's text without inventing an AI response on Home or duplicating REV conversation logic.

## REV conversation implementation

`src/app/PlannerRevScreen.tsx` uses the same `RevPresence` component as Home and navigation.

The visual state is linked to genuine UI state:

- planner/evidence load → `thinking`
- focused REV input → `listening`
- persisted planning-preference change in progress → `responding`
- otherwise → `resting`

The current deterministic planning conversation remains unchanged in authority and evidence semantics. The visual refresh does not claim a new general-purpose AI capability.

## Responsive navigation

Desktop retains the governed five destinations:

- Home
- Plan
- REV
- Progress
- Subjects

Mobile/tablet retain the fixed five-item bottom navigation. The centre REV destination now renders the compact Living E rather than the legacy orb.

The top-left runtime brand uses the same three-bar E construction so the wordmark, hero, conversation and navigation share one visual identity.

## Styling

`src/app/living-e.css` is loaded after the legacy application styles and provides the approved Calm Teal runtime tokens, Living E animation, Home layout, REV conversation surface, theme treatments and responsive overrides.

Existing nested learner capabilities inherit the Calm Teal runtime variables where their styles already use the shared token names. Hard-coded legacy colours outside the refreshed Home/REV/runtime surfaces may still require incremental clean-up; implementation evidence must not be mistaken for permission to diverge from the approved Visual Brand System.

## Assurance

`tests/e2e/app-responsive.spec.ts` verifies the refreshed Home greeting/input, Living E hero and conversation instances, mobile centre-navigation treatment, responsive five-destination hierarchy and absence of horizontal page overflow while continuing through the existing Plan, REV, Subjects, course, practice and exam-prep journeys.

The normal repository CI remains the path-to-live gate for typecheck, lint, unit tests, production build, browser assurance and database/protected-service assurance.

## Key implementation files

- `src/app/RevPresence.tsx` — reusable Living E visual component and semantic state contract.
- `src/app/living-e.css` — Calm Teal theme tokens, Living E motion, Home layout and responsive overrides.
- `src/app/PlannerRuntime.tsx` — theme state, wordmark, desktop utilities and mobile/tablet centre REV navigation.
- `src/app/PlannerHomeScreen.tsx` — conversation-first Home and prompt handoff into REV.
- `src/app/PlannerRevScreen.tsx` — Living E conversation treatment and genuine UI-state mapping.
- `app/index.html` — Manrope webfont loading with fallbacks.
- `tests/e2e/app-responsive.spec.ts` — responsive visual/navigation assurance.

## Documentation impact

No additional normative product decision is introduced by this implementation. The governing visual decision was approved and merged before implementation in `20-brand-and-experience/Visual Brand System.md` v0.5.
