# REV Living E Implementation

**Status:** current implementation description

## Purpose

Describe how the approved Calm Teal, Manrope and Living E visual system is implemented in the canonical signed-in learner runtime.

Normative visual authority remains `20-brand-and-experience/Visual Brand System.md` v0.9 and `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0. This document records implementation truth only.

## Canonical runtime

The implementation applies to the governed learner route:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` remains the owner of the learner-wide shell, responsive global navigation and Home / Plan / REV routing.

The repository root `/revision/` remains a redirect into the canonical learner app. Legacy learner routes are not alternate implementations of this visual system.

## Theme and token implementation

The learner runtime supports one Calm Teal visual system in light and dark treatments.

`src/app/brand-tokens.css` is the central learner token source and is imported by `src/main.tsx` before feature/component styles. It owns:

- canonical Calm Teal and neutral foundations;
- light/dark theme role tokens;
- approved semantic status foreground/surface pairs;
- reusable radius and elevation roles;
- REV halo/theme-derived roles; and
- a bounded compatibility bridge for unchanged legacy styles that have not yet completed Increment B migration.

`PlannerRuntime` owns the current `light` / `dark` theme state.

- The preference is persisted under `revision:theme` in browser local storage.
- If no explicit preference exists, the initial theme follows `prefers-color-scheme`.
- The runtime exposes the theme through `data-theme` so the same component tree is styled with role tokens rather than separate light/dark implementations.
- Desktop exposes a secondary theme toggle in the top bar. Mobile/tablet exposes the same control inside the utility/account drawer.
- The governed dark canvas is `#0F2024`.

The theme choice changes presentation only. It does not alter learning state, progress evidence, planning behaviour or entitlement.

### Compatibility boundary

Increment A deliberately does not remove every existing CSS alias. `brand-tokens.css` temporarily preserves the established `--ink`, `--canvas`, `--surface`, `--surface-soft`, `--muted`, `--line` and related legacy aliases so unchanged surfaces remain stable.

New work must consume role-based tokens such as `--color-text`, `--color-bg`, `--color-surface`, `--color-border`, `--color-action` and `--color-accent-text`. Legacy identity aliases are implementation debt and are removed only after Increment B migration proves there are no live consumers.

## Typography

`app/index.html` loads Manrope from Google Fonts with system sans-serif fallbacks. `src/app/living-e.css` applies Manrope to the canonical learner runtime and its controls.

Typeface source and SIL OFL-1.1 provenance are recorded in `assets/brand/manrope-source-and-license.md`. No font binaries are redistributed in the repository asset package.

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

`complete` is the implementation key for the governed **Completed** state.

Supported display sizes are:

- `hero`
- `conversation`
- `compact`
- `nav`

The component may be decorative when the surrounding control already supplies the accessible name. Otherwise it exposes a text alternative describing the current REV state.

## REV motion implementation

`src/app/living-e.css` consumes central brand/theme roles and owns the web motion treatment for the interactive Living E.

The governed web timings are implemented as:

- **Resting:** 7s subtle halo breathe, looping while resting; bars remain stable.
- **Listening:** 1.5s halo/equalisation rhythm, looping only while genuinely listening.
- **Thinking:** 1.8s halo/bar loop with restrained phase offsets.
- **Responding:** 0.8s one-shot state-entry pulse. It does not loop as a progress indicator and does not delay response content.
- **Completed:** 0.85s one-shot settle returning to the neutral mark.

Motion does not represent response percentage, elapsed time or remaining time.

`prefers-reduced-motion: reduce` disables the Living E animations while preserving the static mark and non-motion text/status cues.

## Home implementation

`src/app/PlannerHomeScreen.tsx` implements Home as a conversation-first surface.

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

The current deterministic planning conversation remains unchanged in authority and evidence semantics. The visual system does not claim a new general-purpose AI capability.

## Responsive navigation

Desktop retains the governed five destinations:

- Home
- Plan
- REV
- Progress
- Subjects

Mobile/tablet retain the fixed five-item bottom navigation. The centre REV destination renders the compact Living E.

The top-left runtime brand uses the same three-bar E construction so the wordmark, hero, conversation and navigation share one visual identity.

## Styling boundary after Increment A

`src/app/living-e.css` no longer defines a competing light/dark palette. It consumes the central role tokens and continues to own Living E motion, Home layout, REV conversation treatment and responsive overrides.

`src/app/living-e-accessibility.css` also consumes central role tokens for accessible accent text, selected navigation/tab treatments and high-contrast tag presentation instead of defining a separate teal-text palette.

Other imported learner styles may still consume the temporary compatibility aliases or contain local values. Those surfaces are intentionally deferred to the bounded Increment B learner-surface migration rather than being changed in a big-bang rewrite.

## Assurance

`tests/e2e/app-responsive.spec.ts` verifies the Home greeting/input, Living E hero and conversation instances, mobile centre-navigation treatment, responsive five-destination hierarchy and absence of horizontal page overflow while continuing through Plan, REV, Subjects, course, practice and exam-prep journeys.

`tests/e2e/brand-token-motion.spec.ts` adds targeted Increment A assurance across the phone, tablet and desktop Playwright projects. It verifies:

- the light canvas and corrected dark canvas are driven by the central theme roles;
- Primary Teal actions use governed Graphite action text;
- exact Resting / Listening / Thinking / Responding / Completed motion timings and loop/one-shot behaviour;
- focusing the real REV conversation input produces the genuine `listening` state; and
- reduced-motion removes REV animation.

The normal repository CI remains the path-to-live gate for typecheck, lint, unit tests, production build, responsive browser assurance and database/protected-service assurance.

## Key implementation files

- `src/app/brand-tokens.css` — central Calm Teal, theme-role, semantic, radius/depth and transitional compatibility tokens.
- `src/app/RevPresence.tsx` — reusable Living E visual component and semantic state contract.
- `src/app/living-e.css` — Living E motion, Home layout, REV conversation surface and responsive visual overrides consuming central roles.
- `src/app/living-e-accessibility.css` — accessible role-based accent and selected-state treatments.
- `src/app/PlannerRuntime.tsx` — theme state, wordmark, desktop utilities and mobile/tablet centre REV navigation.
- `src/app/PlannerHomeScreen.tsx` — conversation-first Home and prompt handoff into REV.
- `src/app/PlannerRevScreen.tsx` — Living E conversation treatment and genuine UI-state mapping.
- `app/index.html` — Manrope webfont loading with fallbacks.
- `tests/e2e/app-responsive.spec.ts` — responsive visual/navigation journey assurance.
- `tests/e2e/brand-token-motion.spec.ts` — exact theme-token, motion and reduced-motion assurance.

## Documentation impact

Increment A changes current runtime implementation only. It does not change the normative Brand System, product journeys, evidence semantics or entitlement behaviour.

`docs/technical/Brand Tokens and REV Motion Implementation Plan.md` remains the sequencing source for the later Increment B learner-surface migration and Increment C compatibility-alias removal.
