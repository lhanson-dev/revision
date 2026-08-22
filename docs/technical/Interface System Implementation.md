# Revision Interface System Implementation

**Status:** Increment B1 foundation live; Increment B2 Plan/Progress migration implemented by this increment; B2.5 foundation hardening required before B3  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Scope:** current learner-runtime interface primitives, migration rules and bounded rollout sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so new features inherit a coherent visual and interaction language instead of creating local cards, buttons, modals, menus, fields, radii, shadows, typography rules or motion rules.

The goal is not to imitate another product's visual identity. Revision may take interaction-quality cues from polished conversational products such as ChatGPT — restrained surfaces, predictable overlays, progressive disclosure, stable geometry, quiet motion and strong responsive behaviour — while continuing to use Revision's own Calm Teal palette, Manrope typography, Living E, rounded-line iconography and learner experience principles.

Enterprise consistency is an implementation requirement, not a visual preference. Shared foundations must be central, reusable and testable; page composition is the flexible layer.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The interface-system layer is loaded by `src/main.tsx` after compatibility/feature styles so migrated primitives can provide the final governed treatment while older surfaces are moved in bounded increments.

This is an implementation consolidation inside the approved `app` boundary. It does not create a new runtime, route, service or persistence model.

### B2 canonical surfaces

Increment B2 keeps the existing canonical routes and runtime ownership unchanged:

- **Plan:** `#/plan` → `PlannerRuntime` → `PlanScreen`;
- **Progress:** `#/progress` → `PlannerRuntime` → compatibility `App` → `renderGlobalProgress()`.

Progress remains a canonical learner destination even though its current rendering is still delegated through `App`. B2 deliberately does not extract or restructure that large compatibility component merely to satisfy a visual migration. Instead, the canonical Progress route is migrated at the final composition/style layer using tightly scoped selectors and central roles. Any later runtime/component consolidation must be separately justified and must preserve evidence semantics and route behaviour.

## Implementation model

The production interface system follows the four-level Brand System model:

1. **Foundation roles** — central CSS custom properties in `src/app/brand-tokens.css`.
2. **Reusable primitives/components** — production classes in `src/app/interface-system.css`, with the reusable React component registry established during B2.5.
3. **Surface families** — composition of primitives into Standard, Quiet, Interactive, Feature, Status, REV and other governed surface families.
4. **Feature composition** — page-specific layout and educational interaction may vary without redefining the lower levels.

Feature CSS may own layout and genuinely feature-specific composition. It must not create a parallel design system.

`src/app/interface-plan-progress.css` is the bounded B2 composition layer. It consumes the central roles and B1 primitives and is intentionally scoped to Plan and Progress. It introduces no new design-token namespace.

## Central foundation roles

`brand-tokens.css` is the implementation single source for reusable learner-runtime roles including:

- Calm Teal and neutral foundations;
- light/dark semantic colour roles;
- semantic status roles;
- Manrope font-family role;
- approved responsive typography roles from Display XL through Caption;
- radius and elevation families;
- governed 4px spacing rhythm;
- compact / standard / large control heights;
- standard field, icon-button and recurring icon sizes/stroke roles;
- shared interaction durations/easing;
- overlay backdrop, blur and radius;
- menu/menu-item radii; and
- common focus-ring treatment.

New shared components must consume these roles. Migrated interface layers must not create page-local colour palettes or type scales. Do not create a second token namespace inside a feature stylesheet.

## Primitive contract

Increment B1 establishes the following reusable production classes.

### Surfaces

- `.ui-surface-standard` — ordinary content grouping.
- `.ui-surface-quiet` — lower-priority supporting context.
- `.ui-surface-interactive` — actionable/selectable grouping with restrained hover/focus elevation.
- `.ui-surface-feature` — exceptional feature/editorial treatment.
- `.ui-floating-surface` — popovers and compact floating menus.

### Overlays

- `.ui-overlay-backdrop` — shared dim/blur layer.
- `.ui-overlay-surface` — modal/overlay frame treatment.

Placement, dimensions and internal layout remain feature responsibilities. Surface treatment does not.

### Controls

- `.ui-button` with `--primary`, `--strong`, `--secondary`, `--tertiary`, `--destructive`, `--compact` and `--large` variants.
- `.ui-icon-button` — standard 44×44 icon/close action.
- `.ui-menu` and `.ui-menu-item` — recurring menu/progressive-disclosure pattern.
- `.ui-field` — standard learner field anatomy.
- `.ui-segmented-control` — bounded segmented selection container.

### Feedback

- `.ui-status` with Success, Warning, Error and Information variants using the governed semantic roles.

## Increment B1 migrated reference surfaces

The Profile/Settings account workspace is the first explicit adopter of the primitive classes:

- account backdrop → shared overlay backdrop;
- account modal frame → shared overlay surface;
- account section navigation → shared menu/menu-item primitives;
- modal close action → shared icon-button primitive;
- editable first-name field → shared field primitive;
- save action → shared primary button primitive;
- appearance selector → shared segmented-control/button primitives; and
- profile identity panel → shared Quiet surface family.

Existing canonical overlay surfaces are also bridged onto the same foundation roles so the visual grammar is immediately consistent while their markup migrates in later bounded work:

- desktop account popover;
- tablet/mobile navigation drawer and backdrop; and
- contextual Ask REV overlay/backdrop.

The bridge is transitional. New code should use explicit `.ui-*` primitives rather than adding another compatibility selector.

## Increment B2 migrated surfaces

B2 applies the interface grammar to the two learner-wide planning/evidence surfaces without changing their product behaviour.

### Plan

`PlanScreen` now explicitly consumes the B1 primitives:

- page title/intro use the B2 shared page-header rhythm and central typography roles;
- ordinary planner groupings use Standard surfaces;
- constrained-capacity guidance uses a Quiet surface;
- load/save/error-information messaging uses shared Status treatment;
- learner actions use Primary/Tertiary button primitives;
- availability and assessment inputs/selects use the shared 48px Field primitive; and
- loading and empty states use calm, bounded supporting treatments rather than generic card/shadow styling.

The planner calculation, reason codes, assessments, availability, persistence, activity events and navigation behaviour are unchanged.

### Progress

Global Progress keeps its existing evidence calculations and canonical `#/progress` route. The B2 composition layer:

- applies the same central page-header/type rhythm as Plan;
- removes redundant outer card treatment from section wrappers so the page is not a stack of nested cards;
- renders evidence-summary tiles and subject summaries as flat Standard surfaces with central radii, borders and theme roles;
- aligns the existing subject action to the shared Primary control contract;
- treats the no-activity state as a Quiet supporting state;
- aligns contextual progress-load errors with the semantic Error surface; and
- preserves existing evidence, readiness, confidence and recent-activity language.

The legacy Progress markup is not rewritten merely for styling. This keeps B2 bounded and avoids coupling a visual migration to a large compatibility-component refactor.

### Control/state boundary

Plan and Progress do not currently contain a product-justified segmented-control interaction, so B2 does not invent one simply to exercise the primitive. Segmented controls remain available from B1 for surfaces that genuinely need bounded mutually exclusive selection.

B2 covers only states that exist truthfully in the current implementation: Plan loading/information/empty states, Progress no-activity state, and existing contextual progress error state. It does not fabricate a separate Progress loading model or alter the evidence-loading contract.

## Migration rules

For a surface group to be considered migrated:

1. colour, typography, border, radius, elevation, spacing, control sizing and standard motion must use central roles or interface primitives/components;
2. new local hard-coded design values require a documented reason tied to feature-specific composition, not convenience;
3. interaction states must include keyboard focus and cannot depend on hover alone;
4. light and dark mode must use the same semantic roles and component structure rather than page-specific theme values;
5. reduced-motion behaviour must remain valid;
6. responsive behaviour must preserve the same hierarchy rather than merely shrink desktop UI;
7. recurring icons and identity assets must come from controlled shared sources;
8. legacy compatibility aliases may remain only where unmigrated live consumers still exist; and
9. migration must not change educational logic, evidence semantics, entitlement behaviour or learner data contracts unless separately governed.

`docs/technical/Interface System Operating Standard.md` is the detailed enterprise implementation gate for these rules.

## Bounded rollout sequence

The interface system should be migrated in small governed increments so Revision remains usable and regressions are attributable.

### B1 — foundation, account and overlay grammar

**Implemented and live.**

- central spacing/control/motion/overlay roles;
- reusable surface/control/feedback primitives;
- Profile/Settings modal explicit adoption;
- overlay/popover/drawer compatibility bridge;
- targeted responsive browser assurance; and
- technical migration contract.

### B2 — Plan and Progress

**Implemented by this increment.**

- shared Plan/Progress page-header rhythm;
- central responsive typography roles added to `brand-tokens.css` and consumed by the shared interface layer;
- Plan explicit adoption of Standard/Quiet/Status surfaces, Primary/Tertiary buttons and shared fields;
- global Progress flat Standard-surface composition with redundant outer cards removed;
- truthful loading/empty/error treatments using shared semantic roles;
- first-class light/dark treatment from central semantic roles;
- phone/tablet/desktop responsive assurance;
- interface-system governance tests that prevent migrated layers from defining local colour palettes and verify central typography roles; and
- no planner, evidence, readiness, entitlement, persistence or route changes.

### B2.5 — foundation hardening before B3

**Required next; no wider page-family migration should start before this is complete.**

- establish a small reusable React component registry under `src/app/ui/` for recurring page/field/action/status/overlay anatomy;
- establish one controlled rounded-line icon registry/wrapper using the approved icon roles;
- provide approved runtime identity-asset helpers where theme/size selection is needed rather than redrawing assets;
- provide a contributor/reference surface or equivalent examples sufficient to choose the correct existing component before creating a new variant;
- expand CI/test guardrails for token/theme/component consistency; and
- confirm light/dark behaviour is role/component driven rather than page patched.

### B3 — Subjects, Subject Home and course/specification pages

- interactive subject/course surfaces;
- contextual hierarchy visual alignment;
- course-section controls; and
- subject accent rules without decorative card proliferation.

### B4 — Learn and Practice

- focused working surface;
- activity/answer/feedback/status patterns;
- field and choice controls;
- result explanation and next-action treatment; and
- progressive disclosure of secondary learning detail.

### B5 — Exam Prep and exam experience

- retain the distinct Exam/Performance surface family;
- standardise controls, confirmations and feedback without making timed work feel like an ordinary dashboard; and
- protect pause/stop/full-screen interaction requirements where governed.

### B6 — Admin

- reuse the same foundation/primitive/component grammar at higher information density;
- keep learner visual identity recognisable without forcing learner-page composition onto operational workflows.

### B7 — compatibility retirement

After all live consumers have migrated:

- repository-search old aliases and local visual constants;
- remove only aliases with zero live consumers;
- collapse redundant feature CSS;
- update production-readiness documentation; and
- retain historical audit/decision evidence unchanged.

## Quality gate for future UI PRs

Every material learner-interface PR should explicitly check:

- typography role;
- spacing rhythm;
- surface family;
- radius/elevation role;
- shared control/component;
- icon treatment/source;
- canonical asset usage where applicable;
- light/dark behaviour;
- phone/tablet/desktop behaviour;
- keyboard/focus/accessibility;
- loading, empty, error and disabled states where applicable; and
- motion/reduced-motion behaviour.

This is a design-system coherence check, not a requirement to make every screen visually identical.

## Assurance classification

Because the interface layer is loaded across the shared learner runtime and B2 changes two primary learner destinations, B2 is **Level 3 / high risk** under the Testing & Assurance Standard even though intended behaviour is visual-only.

Required assurance includes:

- typecheck;
- lint;
- unit tests, including interface-system governance checks;
- production build;
- targeted B2 interface checks in `tests/e2e/interface-plan-progress.spec.ts`;
- full relevant responsive learner regression across phone/tablet/desktop;
- light/dark semantic-surface checks;
- automated accessibility coverage already declared for affected journeys; and
- production smoke after merge.

Database/security behaviour is not changed by B2, but the repository's risk-classified CI may still run the existing database/RLS/protected-service suite because the shared learner runtime is affected.

## Documentation impact

B1 and B2 implement existing Brand System, Product UX, planner and claims/evidence authority rather than changing normative product or visual direction. No ADR is required because canonical routes, runtime ownership and architectural boundaries are unchanged.

`Brand System Production Readiness.md` reflects B2 progress. `Interface System Operating Standard.md` operationalises the enterprise consistency requirements and is indexed from `INDEX.md`. Historical audits/research remain unchanged.
