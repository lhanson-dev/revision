# Revision Interface System Implementation

**Status:** B1 foundation live; B2 Plan/Progress live; B2.5 reusable component foundation implemented by PR #116 candidate  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** current learner-runtime interface foundations, reusable components and bounded migration sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so new features inherit a coherent visual and interaction language instead of creating local fonts, colours, cards, buttons, modals, menus, fields, radii, shadows, icons or theme rules.

Revision may take interaction-quality cues from polished conversational products such as ChatGPT — restrained surfaces, predictable overlays, progressive disclosure, stable geometry, quiet motion and strong responsive behaviour — while retaining Revision's own Calm Teal palette, Manrope typography, Living E and learner experience principles.

Enterprise consistency is an implementation requirement. Shared foundations and reusable anatomy are central; feature composition is the flexible layer.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

B2/B2.5 do not create a new runtime, route, service or persistence model.

Canonical learner-wide destinations relevant to this migration remain:

- Plan: `#/plan` → `PlannerRuntime` → `PlanScreen`;
- Progress: `#/progress` → `PlannerRuntime` → compatibility `App` → `renderGlobalProgress()`.

Progress remains canonical even though its current renderer is delegated through the compatibility `App`. Interface migration does not require a large component extraction merely for styling.

## Implementation stack

The production interface system now has five explicit layers:

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Feature composition** — bounded feature/page CSS and product-specific markup/logic.

Feature CSS may own layout and genuinely feature-specific composition. It must not create a parallel design system.

## Central foundation roles

`brand-tokens.css` is the single implementation source for reusable learner-runtime roles including:

- Calm Teal and neutral foundations;
- light/dark semantic colour roles;
- semantic status roles;
- Manrope font-family role;
- approved responsive type roles from Display XL through Caption;
- radius/elevation families;
- governed 4px spacing rhythm;
- compact/standard/large control heights;
- standard field/icon-button/icon sizes and stroke role;
- motion/easing;
- overlay/focus roles; and
- REV-derived roles.

New shared components consume these roles. Migrated interface layers must not create page-local palettes or type scales.

## Shared CSS primitive contract

`interface-system.css` supplies:

- Standard, Quiet, Interactive, Feature and Floating surfaces;
- overlay surface/backdrop treatment;
- Primary, Strong, Secondary, Tertiary, Destructive, Compact and Large button rules;
- standard icon-button treatment;
- menu/menu-item grammar;
- field anatomy;
- segmented controls;
- Success/Warning/Error/Information statuses; and
- reduced-motion treatment.

Compatibility selectors remain only for still-unmigrated live consumers and are retired in B7 after zero-live-consumer assurance.

## B2.5 reusable React layer

`src/app/ui/index.ts` is the public component import boundary. The initial registry contains:

- `PageHeader`;
- `Surface`;
- `Button` / `IconButton`;
- `TextField` / `SelectField`;
- `Status`;
- `EmptyState` / `LoadingState`;
- `ModalShell` / `DrawerShell` / `PopoverShell`;
- `Menu` / `MenuItem`;
- `SegmentedControl`;
- `Icon`; and
- `BrandAsset`.

`src/app/ui/ui-components.css` owns shared component anatomy but consumes the existing token/primitive system. It contains no separate light/dark palette.

### Controlled icon source

`src/app/ui/Icon.tsx` is the single general-purpose rounded-line product icon registry established by B2.5.

The registry:

- renders inline SVG with `currentColor`;
- uses central icon sizes/stroke role;
- uses rounded caps/joins;
- keeps product icons semantically neutral until used by their containing control/content; and
- deliberately excludes the Living E because the Living E is identity, not a generic UI icon.

A missing recurring icon should be added here with assurance rather than imported ad hoc from a second library.

### Canonical runtime identity assets

`src/app/ui/BrandAsset.tsx` binds runtime use to approved assets already registered in `assets/brand/manifest.json`.

Current helper variants cover:

- primary Revision wordmark light/dark exports;
- Living E Resting light/dark exports; and
- Living E navigation light/dark exports.

Both theme sources live in the same component structure; runtime `data-theme` plus central CSS selects the visible treatment. Pages do not invent local identity artwork or local dark-mode asset rules.

### First proof consumer

`PlanScreen` is the first learner page to move from CSS-class-only primitive consumption to the reusable React registry. It now uses shared PageHeader, Surface, Status, Empty/Loading, Button and Field components.

The planner calculation, reason codes, assessments, availability, persistence, activity events, labels and navigation behaviour are unchanged.

## B1 and B2 current production state

### B1 — foundation/account/overlay grammar

**Live.** Established central spacing/control/motion/overlay roles, shared primitive CSS, account workspace adoption and overlay compatibility bridge.

### B2 — Plan and Progress

**Live.** Established central responsive typography/icon roles and migrated Plan/Progress visual composition onto the governed page/surface/control/theme grammar. Production was verified on merge commit `609fc1247afa32d7d70fb32a87316dc1ce8939b7` with durable `revision/path-to-live = success`.

## B2.5 current candidate state

**Implemented on PR #116 branch; not live until Founder-approved merge and successful production evidence.**

B2.5 provides the reusable component/icon/asset foundation required before B3:

- React component registry;
- controlled icon registry;
- theme-paired canonical identity helper;
- contributor component reference;
- Plan proof adoption;
- component semantic/render tests; and
- expanded governance assurance for tokens, local palette drift, registry exports, icon rules and canonical asset references.

## Migration rules

A surface group is migrated only when:

1. colour, typography, border, radius, elevation, spacing, control sizing and standard motion use central roles/components;
2. new local hard-coded design values have a documented feature-specific reason;
3. interaction states include keyboard focus and do not depend on hover alone;
4. light/dark use the same semantic roles and component structure;
5. reduced motion remains valid;
6. phone/tablet/desktop preserve hierarchy;
7. recurring icons and identity assets use controlled shared sources;
8. compatibility aliases remain only for unmigrated live consumers; and
9. educational logic, evidence, entitlement and learner data contracts do not change unless separately governed.

## Bounded rollout

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live.
- **B2.5 — reusable component/icon/asset foundation:** PR #116 candidate; required before B3.
- **B3 — Subjects, Subject Home, course/specification:** may begin only after B2.5 is live.
- **B4 — Learn and Practice:** focused work, answer/feedback and progressive disclosure patterns.
- **B5 — Exam Prep / exam experience:** Exam/Performance family and governed pause/stop/timed interactions.
- **B6 — Admin:** same foundations/components at appropriate operational density.
- **B7 — compatibility retirement:** remove aliases/redundant feature CSS only after repository search and regression prove zero live dependency.

## Quality gate for future UI PRs

Every material interface PR checks:

- typography role;
- spacing rhythm;
- surface family;
- radius/elevation;
- reusable component/control;
- icon source;
- canonical asset usage where applicable;
- light/dark behaviour;
- phone/tablet/desktop behaviour;
- keyboard/focus/accessibility;
- loading/empty/error/disabled/saving states where relevant; and
- motion/reduced motion.

This is a coherence requirement, not a requirement that every page use the same composition.

## Assurance

B2.5 remains Level 3 / high risk because it changes a shared runtime implementation layer and refactors a primary learner surface onto reusable components.

Required assurance includes:

- typecheck;
- lint;
- unit tests including `src/app/ui/ui-components.test.tsx`;
- interface-system governance tests in `scripts/assurance/interface-system-governance.test.mjs`;
- production build;
- existing Plan/Progress responsive browser assurance across phone/tablet/desktop;
- light/dark semantic-role assurance;
- applicable accessibility coverage; and
- production smoke/path-to-live after merge.

## Documentation impact

B2.5 implements existing Visual Brand System and Product UX authority rather than changing normative visual/product direction. No ADR is required because canonical runtime, routes and architecture boundaries remain unchanged.

The Operating Standard, Component Registry, Brand System Production Readiness and INDEX are maintained with the implementation. Historical audits/research remain unchanged.
