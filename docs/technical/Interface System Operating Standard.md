# Revision Interface System Operating Standard

**Status:** active technical implementation standard  
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

This is the same operating discipline expected from a mature enterprise product design system: central foundations, controlled components, explicit variants, theme translation, reusable assets and automated regression controls.

## Single sources of truth

### Visual authority

`20-brand-and-experience/Visual Brand System.md`

This remains authoritative for:

- Manrope typography;
- Calm Teal palette;
- light and dark themes;
- spacing;
- radii and elevation;
- controls and fields;
- surface families;
- iconography;
- responsive navigation treatment;
- REV / Living E presentation;
- data visualisation; and
- asset lifecycle.

### Runtime design tokens

`src/app/brand-tokens.css`

This is the implementation source for shared role values. It contains:

- semantic light/dark colour roles;
- approved typography roles and responsive type values;
- 4px spacing roles;
- radius/elevation roles;
- control/field/icon sizes;
- motion/focus/overlay roles; and
- REV-specific derived roles.

Feature styles must consume these roles rather than re-declaring equivalent values locally.

### Shared interface primitives

`src/app/interface-system.css`

This provides controlled variants for shared surfaces, buttons, fields, overlays, menus, icon actions, segmented controls and semantic statuses.

A recurring pattern must be added or improved here (or in the reusable component layer described below) rather than independently recreated on several pages.

### Canonical identity assets

`assets/brand/manifest.json`

The manifest records approved asset masters, exports, lifecycle status, supported channels, theme rules, provenance and licensing. Pages and channels must use approved assets rather than redrawing the wordmark, Living E or app/browser identity independently.

## Reusable component layer

Before the interface migration proceeds beyond B2, Revision will establish a small reusable React component layer under `src/app/ui/` for recurring page structures that benefit from semantic markup as well as shared CSS.

The initial registry should cover, where there is a real recurring need:

- PageHeader;
- Surface / QuietSurface / InteractiveSurface;
- Button / IconButton;
- Field and field-label anatomy;
- Status / inline feedback;
- EmptyState;
- LoadingState;
- Modal / Drawer / Popover shells;
- Menu / MenuItem;
- SegmentedControl;
- shared icon wrapper/registry; and
- approved identity asset helpers where runtime asset selection is needed.

The component layer does not replace feature composition. It prevents features from rebuilding the same interface anatomy with subtly different markup and styling.

Component variants should be intentionally small. If a feature needs a new shared variant, the variant should be justified against the Brand System before it becomes reusable.

## Non-negotiable implementation rules

### Typography

- Manrope is the product typeface.
- Shared type roles come from `brand-tokens.css`.
- Migrated surfaces must not introduce page-local type scales.
- Body copy remains 16px minimum for ordinary learner content.
- Responsive type changes use the central role tokens rather than separate page-specific mobile values.

### Colour and themes

- Migrated interface layers use semantic roles such as `--color-surface`, `--color-text`, `--color-border` and semantic status roles.
- Do not hard-code a separate light or dark palette inside a feature stylesheet.
- Light and dark modes use the same component markup and role names; theme translation occurs centrally.
- Primary Teal remains the branded action role. Semantic Success/Warning/Error/Information colours keep their governed meanings.

### Spacing, shape and elevation

- Shared spacing uses the 4px role set.
- Controls use the approved 14px radius and standard height roles.
- Ordinary surfaces use the approved 20px surface radius.
- Feature/REV surfaces use 32px only where the surface family justifies it.
- Shadows are not decorative defaults; standard surfaces are Flat unless a governed floating/raised relationship exists.

### Controls and states

- Common controls come from the shared primitive/component family.
- All controls provide keyboard focus, disabled state and relevant hover/pressed/loading behaviour.
- Feature code must not create a visually similar but structurally separate version of an existing shared control.

### Icons

- Use the approved rounded-line language and central icon-size/stroke roles.
- Recurring product icons should come through one controlled icon registry/wrapper rather than mixed libraries or page-local visual interpretations.
- The Living E is identity, not a general-purpose UI icon.

### Assets

- Approved wordmark, Living E and app/browser assets come from the canonical brand package.
- A new reusable asset must be entered in the asset manifest with lifecycle status, source/export path, supported channels, theme rules and provenance before being treated as canonical.
- Deprecated assets remain available for transition/history but must not be used for new work.

### Responsive behaviour

- Phone, tablet and desktop preserve the same product hierarchy.
- Layout may reflow, stack or reduce density; design foundations do not change by breakpoint.
- Core learner journeys must not depend on hover or horizontal page scrolling.

## Enterprise design-system gate for every migrated surface

A surface is not considered migrated merely because it visually resembles the approved design.

Before a UI PR is ready for Founder merge approval, the affected surface must pass all applicable checks:

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

Human review alone is not sufficient for foundational consistency.

The implementation should progressively enforce the following in CI/tests:

- central token presence and exact approved role values;
- no feature-local colour palette in migrated interface-system layers;
- shared typography-role consumption in migrated interface layers;
- light/dark semantic-surface browser assurance;
- responsive browser assurance at phone/tablet/desktop breakpoints;
- accessibility checks for material journeys;
- component/asset lifecycle checks where automation is practical; and
- regression checks before compatibility aliases are retired.

`src/app/interface-system-governance.test.ts` begins this enforcement for the shared interface layers.

## Migration sequencing change

The existing B1–B7 migration remains valid, but the foundation is hardened before B3.

### B1 — foundation and overlays

Implemented: central roles, primitives, account workspace and overlay grammar.

### B2 — Plan and Progress

Current increment: first major learner destinations migrated onto the interface system.

### B2.5 — foundation hardening before wider rollout

Required before B3:

- reusable React component registry under `src/app/ui/`;
- controlled shared icon registry/wrapper;
- canonical identity-asset consumption helpers where needed;
- interface-system reference/examples sufficient for contributors to choose the correct primitive/component without inventing a new one;
- CI/test guardrails for token/theme/component consistency; and
- confirmation that light/dark behaviour is component-driven rather than page-patched.

### B3 onward

Subjects, Learn/Practice, Exam, Admin and later surfaces should consume the hardened shared layer rather than expanding page-local style systems.

## Design-process rule

When designing or implementing a new Revision page, the order is:

1. identify the page's product job and relevant surface family;
2. select existing type, spacing, surface, control, icon and asset roles;
3. select existing reusable components;
4. compose the page responsively in light and dark mode;
5. add a new shared variant only if the existing system genuinely cannot express the required job;
6. if a new variant becomes reusable, add it to the shared system and its assurance before using it broadly; and
7. run the enterprise design-system gate before calling the surface complete.

The default answer to a page-level styling problem is therefore **reuse or extend the shared system**, not **add another local style**.

## Documentation impact

This standard implements and operationalises the existing Visual Brand System. It does not change the approved brand direction or product behaviour.

The document should be updated when the shared component registry, asset model or enforcement approach materially changes. Historical design research and superseded implementation evidence should not be rewritten to match the current state.
