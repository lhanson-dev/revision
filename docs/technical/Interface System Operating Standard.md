# Revision Interface System Operating Standard

**Status:** active technical implementation standard; B2.5 reusable component layer implemented by PR #116 candidate  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`  
**Applies to:** learner application, Admin and future marketing/product surfaces that consume the shared product interface system  
**Purpose:** make visual consistency enforceable in implementation rather than dependent on individual page design judgement

## Operating principle

Revision is implemented as one coherent design system, not a collection of independently styled pages.

A page may have a different composition because its job is different. It must not invent its own font family, type scale, colours, spacing rhythm, radius family, controls, icon language, modal treatment, status language or light/dark theme behaviour.

The system separates:

1. **Normative visual authority** — what Revision should look and feel like.
2. **Central design tokens** — the approved reusable values used by code.
3. **Reusable primitives and components** — the implementation building blocks used across features.
4. **Canonical assets** — approved identity and visual assets with lifecycle metadata.
5. **Feature composition** — the only layer where page-specific layout is expected.

This is the operating discipline expected from a mature enterprise product design system: central foundations, controlled components, explicit variants, theme translation, reusable assets and automated regression controls.

## Single sources of truth

### Visual authority

`20-brand-and-experience/Visual Brand System.md`

This remains authoritative for Manrope typography, Calm Teal palette, light/dark themes, spacing, radii/elevation, controls/forms, surface families, iconography, responsive treatment, REV/Living E presentation, data visualisation and asset lifecycle.

### Runtime design tokens

`src/app/brand-tokens.css`

This is the implementation source for shared semantic colour/theme roles, responsive typography, 4px spacing, radii/elevation, control/field/icon sizes, motion/focus/overlay roles and REV-derived roles.

Feature styles must consume these roles rather than re-declaring equivalent values locally.

### Shared CSS primitives

`src/app/interface-system.css`

This provides controlled visual variants for shared surfaces, buttons, fields, overlays, menus, icon actions, segmented controls and semantic statuses.

`src/app/ui/ui-components.css` provides shared component anatomy that sits on those primitives and tokens. Neither file is a feature-owned style namespace.

### Reusable React components

`src/app/ui/index.ts`

This is the public implementation registry. B2.5 establishes:

- `PageHeader`;
- `Surface` with Standard, Quiet, Interactive, Feature and Floating variants;
- `Button` / `IconButton`;
- `TextField` / `SelectField`;
- `Status`;
- `EmptyState` / `LoadingState`;
- `ModalShell` / `DrawerShell` / `PopoverShell`;
- `Menu` / `MenuItem`;
- `SegmentedControl`;
- `Icon`; and
- `BrandAsset`.

Feature code should import through the registry rather than internal files unless it is itself maintaining the shared system.

The component layer does not replace feature composition. It prevents features from rebuilding the same interface anatomy with subtly different markup and styling.

### Contributor component reference

`docs/technical/Interface System Component Registry.md`

This records the supported jobs/variants and extension rules so contributors can choose an existing pattern before proposing a new one.

### Canonical identity assets

`assets/brand/manifest.json`

The manifest records approved asset masters, exports, lifecycle status, supported channels, theme rules, provenance and licensing. Pages and channels must use approved assets rather than redrawing the wordmark, Living E or app/browser identity independently.

`BrandAsset` is the runtime helper for approved theme-paired wordmark and Living-E exports. The same component structure is used in light and dark mode; theme selection occurs centrally.

## Non-negotiable implementation rules

### Typography

- Manrope is the product typeface.
- Shared type roles come from `brand-tokens.css`.
- Migrated surfaces must not introduce page-local type scales.
- Body copy remains 16px minimum for ordinary learner content.
- Responsive type changes use central role tokens rather than page-specific mobile values.

### Colour and themes

- Migrated interface layers use semantic roles such as `--color-surface`, `--color-text`, `--color-border` and semantic status roles.
- Do not hard-code a separate light or dark palette inside a feature stylesheet or component.
- Light and dark modes use the same component markup and role names; theme translation occurs centrally.
- Primary Teal remains the branded action role. Success/Warning/Error/Information retain governed meanings.
- Distinct exported identity artwork may be theme-paired only through the canonical asset helper/package rather than page-local switching.

### Spacing, shape and elevation

- Shared spacing uses the 4px role set.
- Controls use approved radius and height roles.
- Ordinary surfaces use the 20px surface role.
- Feature/REV surfaces use 32px only where the surface family justifies it.
- Shadows are not decorative defaults; standard surfaces are Flat unless a governed floating/raised relationship exists.

### Controls and states

- Common controls come from the shared primitive/component family.
- Controls provide keyboard focus, disabled state and relevant hover/pressed/loading behaviour.
- Feature code must not create a visually similar but structurally separate version of an existing shared control.
- Field anatomy uses a visible label and shared hint/error treatment.
- `Status` includes visible semantic wording and a controlled icon as well as colour.

### Icons

- Use the approved rounded-line language and central icon-size/stroke roles.
- Recurring product icons come through `Icon`, not mixed libraries or page-local interpretations.
- Icons use `currentColor` and rounded caps/joins.
- The Living E is identity and is deliberately excluded from the generic icon registry.

### Assets

- Approved wordmark, Living E and app/browser assets come from the canonical brand package.
- A new reusable identity asset must be entered in the asset manifest with lifecycle, source/export, channels, theme rules and provenance before being treated as canonical.
- Deprecated assets remain for transition/history but must not be used for new work.

### Responsive behaviour

- Phone, tablet and desktop preserve the same product hierarchy.
- Layout may reflow, stack or reduce density; design foundations do not change by breakpoint.
- Core learner journeys must not depend on hover or horizontal page scrolling.

## Enterprise design-system gate for every migrated surface

A surface is not considered migrated merely because it visually resembles the approved design. Before a UI PR is ready for Founder merge approval, affected surfaces must pass all applicable checks:

1. typography comes from approved roles;
2. colours come from central semantic/theme roles;
3. spacing follows the central rhythm;
4. radii/elevation match a named surface/control role;
5. shared controls use shared primitives/components;
6. recurring icons/assets come from controlled sources;
7. light and dark modes both work from the same component structure;
8. phone, tablet and desktop preserve hierarchy and usability;
9. keyboard/focus/accessibility remain valid;
10. loading, empty, error, disabled and saving states are deliberately handled where applicable;
11. reduced-motion behaviour remains valid where motion exists; and
12. no new local design-system fork has been introduced.

## Automated enforcement

Human review alone is not sufficient. Current enforcement includes:

- exact central token checks;
- no local hex/RGB palettes in migrated interface/component layers;
- central typography-role consumption;
- expected public component-registry exports;
- controlled `currentColor` icon-registry checks;
- proof that generic icons do not absorb the Living E identity;
- proof that runtime identity helpers reference assets present in the canonical brand manifest;
- component render/semantic tests;
- light/dark semantic-surface browser assurance; and
- responsive browser assurance across supported phone/tablet/desktop projects.

Primary files:

- `scripts/assurance/interface-system-governance.test.mjs`;
- `src/app/ui/ui-components.test.tsx`; and
- `tests/e2e/interface-plan-progress.spec.ts` plus subsequent migrated-surface browser assurance.

Enforcement should expand when the shared contract expands; it should not become a second source of design authority.

## Migration sequence

### B1 — foundation and overlays

**Live.** Central roles, CSS primitives, account workspace and overlay grammar.

### B2 — Plan and Progress

**Live.** First major learner destinations use the governed typography/surface/control/theme grammar.

### B2.5 — reusable component foundation

**Implemented by PR #116 candidate; not live until governed merge and production evidence succeed.**

The increment establishes:

- public React component registry under `src/app/ui/`;
- controlled rounded-line icon registry;
- canonical identity-asset helpers;
- contributor component registry/reference;
- expanded CI/component guardrails;
- same-markup semantic light/dark implementation; and
- `PlanScreen` as the first proof consumer of the React component layer without changing planner behaviour.

### B3 onward

B3 may begin only after B2.5 is live. Subjects, Learn/Practice, Exam, Admin and later surfaces should consume the hardened shared layer rather than expanding page-local systems.

## Design-process rule

When designing or implementing a new Revision page:

1. identify the page's product job and relevant surface family;
2. select existing type, spacing, surface, control, icon and asset roles;
3. select existing reusable components from the public registry;
4. compose the page responsively in light and dark mode;
5. add a new shared variant only if the existing system genuinely cannot express the required recurring job;
6. add assurance and update the component registry when the public shared contract changes; and
7. run the enterprise design-system gate before calling the surface complete.

The default response to a page-level styling problem is **reuse or extend the shared system**, not **add another local style**.

## Documentation impact

This standard operationalises existing Visual Brand System and Product UX authority. B2.5 changes implementation structure, not approved brand or product behaviour. The component registry and current implementation/readiness records are maintained in the same governed branch. Historical research/audits are not rewritten.
