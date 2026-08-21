# Revision Interface System Implementation

**Status:** Increment B1 foundation implemented on the governed branch  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Scope:** current learner-runtime interface primitives, migration rules and bounded rollout sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so new features inherit a coherent visual and interaction language instead of creating local cards, buttons, modals, menus, fields, radii, shadows and motion rules.

The goal is not to imitate another product's visual identity. Revision may take interaction-quality cues from polished conversational products such as ChatGPT — restrained surfaces, predictable overlays, progressive disclosure, stable geometry, quiet motion and strong responsive behaviour — while continuing to use Revision's own Calm Teal palette, Manrope typography, Living E, rounded-line iconography and learner experience principles.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The interface-system layer is loaded by `src/main.tsx` after compatibility/feature styles so migrated primitives can provide the final governed treatment while older surfaces are moved in bounded increments.

This is an implementation consolidation inside the approved `app` boundary. It does not create a new runtime, route, service or persistence model.

## Implementation model

The production interface system follows the four-level Brand System model:

1. **Foundation roles** — central CSS custom properties in `src/app/brand-tokens.css`.
2. **Reusable primitives** — production classes in `src/app/interface-system.css`.
3. **Surface families** — composition of primitives into Standard, Quiet, Interactive, Feature, Status, REV and other governed surface families.
4. **Feature composition** — page-specific layout and educational interaction may vary without redefining the lower levels.

Feature CSS may own layout and genuinely feature-specific composition. It must not create a parallel design system.

## Central foundation roles

`brand-tokens.css` is the single source for reusable learner-runtime roles including:

- Calm Teal and neutral foundations;
- light/dark semantic colour roles;
- semantic status roles;
- radius and elevation families;
- governed 4px spacing rhythm;
- compact / standard / large control heights;
- standard field and icon-button sizes;
- shared interaction durations/easing;
- overlay backdrop, blur and radius;
- menu/menu-item radii; and
- common focus-ring treatment.

New shared components must consume these roles. Do not create a second token namespace inside a feature stylesheet.

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

## Migration rules

For a surface group to be considered migrated:

1. colour, border, radius, elevation, spacing, control sizing and standard motion must use central roles or interface primitives;
2. new local hard-coded design values require a documented reason tied to feature-specific composition, not convenience;
3. interaction states must include keyboard focus and cannot depend on hover alone;
4. light and dark mode must use the same semantic roles rather than page-specific theme values;
5. reduced-motion behaviour must remain valid;
6. responsive behaviour must preserve the same hierarchy rather than merely shrink desktop UI;
7. legacy compatibility aliases may remain only where unmigrated live consumers still exist; and
8. migration must not change educational logic, evidence semantics, entitlement behaviour or learner data contracts unless separately governed.

## Bounded rollout sequence

The interface system should be migrated in small governed increments so Revision remains usable and regressions are attributable.

### B1 — foundation, account and overlay grammar

**Implemented by this increment.**

- central spacing/control/motion/overlay roles;
- reusable surface/control/feedback primitives;
- Profile/Settings modal explicit adoption;
- overlay/popover/drawer compatibility bridge;
- targeted responsive browser assurance; and
- technical migration contract.

### B2 — Plan and Progress

- standard page-header rhythm;
- ordinary/quiet/guidance surface adoption;
- button/field/segmented controls;
- loading/empty/error treatment; and
- remove local values made redundant in those surfaces.

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

- reuse the same foundation/primitive grammar at higher information density;
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
- control primitive;
- icon treatment;
- light/dark behaviour;
- phone/tablet/desktop behaviour;
- keyboard/focus/accessibility;
- loading, empty, error and disabled states where applicable; and
- motion/reduced-motion behaviour.

This is a design-system coherence check, not a requirement to make every screen visually identical.

## Assurance classification

Because the interface layer is loaded across the shared learner runtime and can affect multiple critical journeys, foundation changes are **Level 3 / high risk** under the Testing & Assurance Standard even when intended behaviour is visual-only.

Required assurance for a foundation change therefore includes:

- typecheck;
- lint;
- unit tests;
- production build;
- targeted interface-system browser checks;
- full relevant responsive learner regression across phone/tablet/desktop;
- automated accessibility coverage already declared for affected journeys; and
- production smoke after merge.

Database/security behaviour is not changed by B1, but the repository's risk-classified CI may still run the existing database/RLS/protected-service suite because the shared runtime is affected.

## Documentation impact

B1 implements existing Brand System authority rather than changing normative product or visual direction. No ADR is required because the canonical runtime and architectural boundaries are unchanged; the change creates a shared implementation layer within the existing `app` boundary.

`Brand System Production Readiness.md` and `INDEX.md` must point to this implementation contract and reflect the start of Increment B learner-surface migration. Historical audits/research remain unchanged.
