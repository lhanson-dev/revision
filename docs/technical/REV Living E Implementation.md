# REV Living E Implementation

**Status:** current implementation description

## Purpose

Describe how the approved Calm Teal, Manrope and Living E visual system is implemented in the canonical signed-in learner runtime.

Normative visual authority remains `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Identity Asset Usage Rules.md` v1.2. This document records implementation truth only.

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

`src/app/living-e.css` consumes central brand/theme roles and owns the base web motion treatment for the interactive Living E.

The governed base timings are implemented as:

- **Resting:** 7s subtle halo breathe, looping while resting; bars remain stable.
- **Listening:** 1.5s halo/equalisation rhythm, looping only while genuinely listening.
- **Thinking:** 1.8s halo/bar loop with restrained phase offsets.
- **Responding:** 0.8s one-shot state-entry pulse. It does not loop as a progress indicator and does not delay response content.
- **Completed:** 0.85s one-shot settle returning to the neutral mark.

High-emphasis Resting surfaces may specialise the base Resting presentation without changing its meaning. The learner Home hero and persistent Ask REV CTA use a more visible slow halo breathe plus very small whole-mark movement so REV feels awake and available. **Resting never animates the three bars independently.** Independent bar movement remains reserved for genuine Listening, Thinking and Responding states.

Motion does not represent response percentage, elapsed time or remaining time and does not imply background AI work.

`prefers-reduced-motion: reduce` disables the Living E animations while preserving the static mark, visible resting halo and non-motion text/status cues.

## Ask REV CTA implementation

Persistent Ask REV uses one visual contract across desktop, tablet and mobile rather than separate breakpoint-specific identity treatments.

`src/app/ask-rev-cta.css` is a classified semantic runtime layer. It is loaded after the existing learner-shell layout styles and before `src/app/rev-resting-presence.css` and the final `interface-theme-integrity.css` compatibility layer. It owns Ask REV CTA appearance and compact inverse Living E styling, while the existing responsive layout files continue to own breakpoint visibility, placement and available width. The final compatibility layer remains last in the cascade and does not redefine Ask REV.

The shared CTA contract is:

- Primary Teal action surface using the existing `--color-action` role;
- Graphite action label using the existing `--color-action-text` role;
- the same explicit `Ask REV` label at every breakpoint;
- the same compact Living E geometry at every breakpoint;
- **Neutral 0 / white bars** when the Living E sits on the Primary Teal CTA, implementing the governed inverse-on-brand identity treatment;
- a restrained white/Soft Aqua halo around the bars rather than bloom over them, so the E stays crisp;
- a 5.8s low-amplitude Resting loop for halo breathing plus very small whole-mark drift/scale;
- no independent bar animation while Resting; and
- responsive height, floating depth, width and safe-area placement where the tablet/mobile dock requires them.

Desktop uses a 52px minimum CTA height in the persistent left rail. Tablet/mobile retain the existing bounded dock placement and width behaviour, with a 58px minimum height and floating depth appropriate to a persistent bottom action. These are responsive size adaptations of one CTA design, not separate identities.

When reduced motion is requested, the CTA keeps the inverse white bars and a visible static halo but removes the Resting animation.

The generic `RevPresence` nav treatment remains available for other compact navigation contexts. The Ask REV CTA applies its inverse/sizing/resting treatment contextually so normal Living E uses are not recoloured globally.

## Home implementation

`src/app/PlannerHomeScreen.tsx` implements Home as a conversation-first surface.

The opening viewport is deliberately spacious and contains, in order:

1. the Living E + soft halo;
2. `Hey {first name}, what shall we do today?`;
3. the REV input; and
4. a quiet status / route into the wider workspace.

Planner recommendations, course/resource routes and progress information remain available below the opening surface rather than competing with REV above the fold.

`src/app/rev-resting-presence.css` is a classified semantic layer dedicated to the high-emphasis Home Resting treatment. When the Home Living E is genuinely Resting it uses:

- a 6.4s stronger but still slow halo breathe;
- a restrained outer-halo pulse;
- a very small whole-mark vertical/scale drift; and
- no independent bar animation.

The treatment is deliberately more noticeable than the base 7s Resting animation because the Home hero is an explicit invitation to interact with REV. Focusing the Home prompt switches the component into the genuine `listening` state and therefore hands motion ownership back to the semantic Listening animation. Loading can use `thinking`; submitting/transitioning can use the existing completed behaviour.

Reduced-motion users receive the same visible static halo without the looping Home motion.

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

The canonical learner shell is owned by `PlannerRuntime`.

Desktop uses a persistent left rail containing:

- REV identity;
- the branded Ask REV CTA;
- Home;
- Plan;
- Progress; and
- Courses, with route-scoped contextual course expansion where applicable.

Tablet/mobile do not use the retired five-item persistent bottom navigation. They use the governed top bar + drawer pattern and retain Ask REV as the only persistent bottom learner action.

The tablet/mobile Ask REV dock uses the same CTA visual contract as desktop while adapting its width, floating depth and safe-area spacing to the viewport. The control is hidden while the contextual REV layer is already open and on surfaces excluded by the learner-shell navigation rules.

The top-left runtime brand uses the same three-bar E construction so the wordmark, hero, conversation and navigation share one visual identity.

## Styling boundary after Increment A

`src/app/living-e.css` no longer defines a competing light/dark palette. It consumes the central role tokens and continues to own base Living E motion, Home layout, REV conversation treatment and responsive overrides.

`src/app/living-e-accessibility.css` also consumes central role tokens for accessible accent text, selected navigation/tab treatments and high-contrast tag presentation instead of defining a separate teal-text palette.

`src/app/ask-rev-cta.css` is intentionally narrow: it owns only the shared persistent Ask REV CTA visual treatment, inverse compact Living E treatment and CTA-specific Resting motion. It does not redefine breakpoint visibility/placement, Home, the REV conversation workspace, ordinary navigation icons or general button primitives.

`src/app/rev-resting-presence.css` is also intentionally narrow: it owns only the stronger high-emphasis Resting presentation on the learner Home hero. It does not alter semantic Listening/Thinking/Responding motion or general Living E geometry.

Both files are classified by `scripts/assurance/site-theme-integrity.test.mjs` as semantic runtime layers rather than compatibility debt and are loaded before the final compatibility layer.

Other imported learner styles may still consume the temporary compatibility aliases or contain local values. Those surfaces are intentionally deferred to the bounded Increment B learner-surface migration rather than being changed in a big-bang rewrite.

## Assurance

`tests/e2e/app-responsive.spec.ts` verifies the canonical learner shell and responsive critical journeys across the representative phone, tablet and desktop projects.

`tests/e2e/brand-token-motion.spec.ts` verifies the light/dark theme roles, Primary Teal action foreground contract, base Living E state timings and reduced-motion behaviour.

`tests/e2e/ask-rev-cta.spec.ts` provides targeted responsive assurance for the persistent Ask REV CTA. Across phone, tablet and desktop it verifies:

- exactly one visible Ask REV control for the active breakpoint;
- the Living E is present with all three bars and the obsolete `✦` glyph cannot return;
- the CTA uses the canonical Primary Teal surface and Graphite label;
- the Living E bars use the inverse Neutral 0 treatment;
- the compact halo remains visibly present around the crisp bars;
- the 5.8s Resting halo and whole-mark animations are active under normal motion preferences;
- reduced-motion removes the loop while preserving the visible static halo;
- the same 40px compact mark treatment is used across breakpoints; and
- desktop vs tablet/mobile minimum height/radius adaptations remain within the governed responsive pattern.

`tests/e2e/rev-resting-presence.spec.ts` verifies the learner Home hero specifically:

- the settled Home state becomes `resting`;
- the stronger 6.4s halo and whole-mark Resting animations are active;
- independent bar animation remains off while Resting;
- focusing the REV prompt changes the component to genuine `listening` motion; and
- reduced-motion disables the loop while keeping a visible static halo.

The normal repository CI remains the path-to-live gate for typecheck, lint, unit tests, production build, responsive browser assurance and database/protected-service assurance.

## Key implementation files

- `src/app/brand-tokens.css` — central Calm Teal, theme-role, semantic, radius/depth and transitional compatibility tokens.
- `src/app/RevPresence.tsx` — reusable Living E visual component and semantic state contract.
- `src/app/living-e.css` — base Living E motion, Home layout, REV conversation surface and responsive visual overrides consuming central roles.
- `src/app/ask-rev-cta.css` — canonical responsive Ask REV CTA visual contract, inverse-on-brand compact Living E and CTA Resting presence.
- `src/app/rev-resting-presence.css` — stronger high-emphasis Resting presence for the learner Home hero.
- `src/app/living-e-accessibility.css` — accessible role-based accent and selected-state treatments.
- `src/app/PlannerRuntime.tsx` — learner shell owner that renders the desktop Ask REV control and tablet/mobile dock.
- `src/app/PlannerHomeScreen.tsx` — conversation-first Home, semantic REV state transitions and prompt handoff into REV.
- `src/app/PlannerRevScreen.tsx` — Living E conversation treatment and genuine UI-state mapping.
- `app/index.html` — Manrope webfont loading with fallbacks.
- `tests/e2e/app-responsive.spec.ts` — responsive learner-shell journey assurance.
- `tests/e2e/brand-token-motion.spec.ts` — exact theme-token, base motion and reduced-motion assurance.
- `tests/e2e/ask-rev-cta.spec.ts` — targeted cross-breakpoint Ask REV CTA visual/motion assurance.
- `tests/e2e/rev-resting-presence.spec.ts` — targeted Home Resting presence and semantic-state assurance.

## Documentation impact

The Resting-presence refinement changes the specific identity-usage rule and current runtime implementation, so `Identity Asset Usage Rules.md` v1.2 and this technical description are updated together. The broader Visual Brand System already defines the Living E as a soft-halo identity with **Resting — calm and ready**, so no higher-level brand-system amendment is required. No learner destination, route, REV conversation capability, entitlement rule or evidence semantic changes. Historical Design Acceptance evidence remains unchanged.