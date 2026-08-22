# Brand System Production Readiness

**Status:** production foundations ready; Increment A token/motion foundation established; Increment B1 interface-system foundation and Increment B2 Plan/Progress migration implemented  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 plus `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Scope:** canonical assets, production implementation foundations and migration sequencing; this document does not redefine brand authority

## Purpose

Track the controlled move from the approved Revision Brand System into production assets and learner-runtime implementation without silently reinterpreting the approved grammar.

Canonical identity assets and production rules were established before runtime migration. Brand Token / REV Motion Increment A introduced the central colour/theme/shape source and exact governed REV motion. Interface System Increment B1 turned those foundations into reusable production primitives. Increment B2 now applies that grammar to the primary Plan and Progress surfaces without changing planner or evidence behaviour.

## Canonical user-facing runtime

The governed learner application is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the signed-in learner shell, global navigation, theme state and canonical Home / Plan / contextual REV entry. Deeper Subjects/course/learning surfaces remain delegated where documented. Global Progress remains the canonical `#/progress` destination and is currently rendered through the compatibility `App` component under `PlannerRuntime`; B2 does not change that runtime relationship. The Living E implementation is shared through `src/app/RevPresence.tsx`, with central roles in `src/app/brand-tokens.css` and component treatment in `src/app/living-e.css` plus `src/app/living-e-accessibility.css`.

The repository root `/revision/` is a redirect into the learner application until the public marketing/editorial site is introduced.

## Current production direction

The approved direction is represented in the canonical learner runtime through:

- Manrope as the approved product typeface with a system-sans fallback;
- first-class light and dark modes;
- a central Calm Teal role-token source loaded before feature CSS;
- governed dark canvas `#0F2024`;
- central spacing, control-size, motion, overlay and focus roles for shared UI primitives;
- `RevPresence` rendering the Living E as inline SVG with three rounded horizontal bars;
- soft halo and state motion driven by CSS;
- governed REV timing/loop behaviour for Resting, Listening, Thinking, Responding and Completed;
- Home using the approved conversation-first hierarchy and exact greeting;
- four learner-wide destinations — Home / Plan / Progress / Subjects — with persistent contextual Ask REV access;
- Plan using explicit shared interface primitives for surfaces, status, buttons and fields;
- global Progress using the shared flat-surface/page-header grammar while preserving its evidence model;
- tablet/mobile top-left drawer navigation rather than a five-item bottom navigation bar;
- route-scoped contextual academic navigation within Subjects; and
- reduced-motion support.

Implementation evidence does not replace the Brand System and does not make later learner-surface migration optional.

## Readiness and implementation status

| Area | Current evidence | Status | Next action |
| --- | --- | --- | --- |
| Primary Revision wordmark | Founder-supplied outlined source plus light/dark/mono exports under `assets/brand/` | **Ready** | Consume canonical assets where the runtime moves from constructed to asset-based identity |
| Wordmark clear space / minimum size | `Identity Asset Usage Rules.md` defines 2x clear space, 160px digital minimum and 35mm print minimum | **Ready** | Apply consistently |
| REV / Living E vector master | Canonical portable master and static exports exist | **Ready** | Keep portable geometry aligned with interactive construction |
| Living E clear space | 1e outside the outer halo | **Ready** | Preserve identity treatment; simplify only where permitted |
| App icon framing | Canonical 1024×1024 master with 760×760 identity frame | **Ready** | Generate platform derivatives from master |
| Favicon | SVG plus 32×32 and 16×16 fallbacks | **Ready** | Use simplified three-bar treatment at small sizes |
| Manrope provenance | Runtime source, project source and SIL OFL-1.1 record captured | **Ready** | Keep provenance current if delivery changes |
| Central learner token foundation | `src/app/brand-tokens.css` contains theme, semantic, shape, spacing, control, motion and overlay roles | **Implemented — Increment A + B1** | Keep new reusable UI roles central |
| Shared interface primitives | `src/app/interface-system.css` provides surface, overlay, button, icon-action, menu, field, segmented-control and status primitives | **Implemented — Increment B1** | Continue bounded learner surface adoption |
| Account workspace | Profile/Settings modal explicitly consumes shared overlay/menu/control/field primitives | **Migrated — Increment B1** | Preserve as reference pattern |
| Overlay/popover/drawer grammar | Account popover, responsive drawer and contextual REV overlay bridge to the shared surface roles | **Aligned bridge — Increment B1** | Move markup to explicit primitives during relevant bounded migrations |
| Plan | `PlanScreen` consumes shared page-header, Standard/Quiet/Status surfaces, Primary/Tertiary buttons and shared fields | **Migrated — Increment B2** | Preserve planner behaviour while later features reuse the same grammar |
| Global Progress | Canonical `#/progress` composition uses central page-header, Standard/Quiet/error roles and removes redundant outer card treatment | **Migrated — Increment B2** | Preserve evidence/readiness semantics; component extraction is not required by the visual migration |
| Dark theme drift | Governed `#0F2024` role is central | **Resolved — Increment A** | Protect with browser assurance |
| REV motion | Exact governed timings and one-shot/loop behaviour implemented | **Resolved — Increment A** | Protect state wiring/reduced motion during later styling work |
| Accessibility colour correction layer | Uses central role tokens rather than separate teal palette values | **Aligned — Increment A** | Fold patterns into migrated components during Increment B |
| Compatibility aliases | Bounded bridge remains for unchanged CSS | **Intentional transitional debt** | Remove only after migration proves no live consumers |
| Wider learner surface styling | Plan/Progress are migrated; Subjects/course, learning/practice/exam and supporting components still contain mixed legacy/local values | **Migration in progress** | Continue Increment B3 onward |
| Social/video editable masters | Brand grammar exists; editable masters do not | **Deferred** | Produce after learner interface grammar stabilises |
| Asset registry | `assets/brand/manifest.json` records canonical source/export/provenance metadata | **Established** | Maintain with asset changes |
| Brand Studio live reference surface | Repository reference boards exist | **Optional** | Build only if contributor workflow justifies it |

## Revision wordmark production package

The supplied light and dark SVGs were validated before intake:

- working size: **1600×400**;
- transparent background;
- vector path geometry rather than embedded raster artwork;
- no live `<text>` element or font dependency;
- light treatment: Graphite Ink `#132026` + Primary Teal `#2BB6A3`;
- dark treatment: white + Primary Teal `#2BB6A3`.

Canonical package:

- `assets/brand/source/revision-wordmark-primary-master.svg`
- `assets/brand/exports/revision-wordmark-primary-light.svg`
- `assets/brand/exports/revision-wordmark-primary-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-light.svg`

## Identity usage rules

`20-brand-and-experience/Identity Asset Usage Rules.md` governs:

- full Revision wordmark clear space: **2x**, where x is one teal E-bar height;
- full-wordmark minimum: **160px digital / 35mm print**;
- standalone Living E clear space: **1e** outside the outer halo;
- app icon: **1024×1024** full-bleed Deep Teal `#0F2F36`;
- Living E placement in a centred **760×760** identity frame;
- no baked rounded app-icon corners;
- essential bars/halo core within the central **66%** safe region; and
- three-bar favicon treatment without relying on halo detail at 16/32px.

## Manrope provenance

The approved typeface remains Manrope. `app/index.html` loads weights 400, 500, 600, 700 and 800 from Google Fonts.

`assets/brand/manrope-source-and-license.md` records:

- runtime stylesheet source;
- canonical project source;
- Copyright 2018 The Manrope Project Authors; and
- SIL Open Font License 1.1 (OFL-1.1).

No font binaries are stored or redistributed in the brand asset package. A future self-hosting/bundling change must handle the applicable font-software licence and notice obligations.

## Increment A — token and REV-motion alignment

`docs/technical/Brand Tokens and REV Motion Implementation Plan.md` defines the Increment A contract. It established:

1. `src/app/brand-tokens.css` loaded before feature CSS;
2. central foundation, theme-role, semantic and shape/depth tokens;
3. governed dark canvas `#0F2024`;
4. a bounded compatibility bridge for unchanged CSS;
5. role-token consumption in `living-e.css` and `living-e-accessibility.css`;
6. REV motion aligned to **7s Resting / 1.5s Listening / 1.8s Thinking / 0.8s one-shot Responding / 0.85s Completed**; and
7. direct Playwright assurance in `tests/e2e/brand-token-motion.spec.ts`.

## Increment B1 — interface-system foundation

`docs/technical/Interface System Implementation.md` is the current migration contract.

B1 establishes:

1. central governed spacing, control-size, motion, overlay and focus roles in `brand-tokens.css`;
2. `src/app/interface-system.css` as the reusable production primitive layer;
3. explicit Standard, Quiet, Interactive, Feature and Floating surface primitives;
4. overlay, button, icon-button, menu, field, segmented-control and semantic-status primitives;
5. Profile/Settings account workspace migration onto explicit primitives;
6. a transitional bridge aligning the desktop account popover, responsive navigation drawer and contextual REV overlay to the same surface roles; and
7. targeted responsive browser assurance for the shared interface contract.

The interface system is intentionally loaded after compatibility feature CSS during migration so explicit shared primitives can provide the final governed treatment. Once migration completes, redundant compatibility CSS should be removed rather than relying on permanent override layering.

## Increment B2 — Plan and Progress

B2 applies the shared grammar to the canonical Plan and Progress destinations:

1. adds `src/app/interface-plan-progress.css` as a bounded composition layer loaded after the B1 primitive layer;
2. applies a shared H1/intro page-header rhythm to Plan and Progress;
3. migrates `PlanScreen` markup explicitly onto Standard, Quiet, Status, Button and Field primitives;
4. aligns Plan loading, empty, constrained-capacity and information states with central semantic roles;
5. removes redundant outer card treatment from global Progress sections while preserving useful inner evidence groupings;
6. aligns global Progress summary tiles, subject summaries, learner action and no-activity state with central roles;
7. preserves the existing `#/progress` compatibility rendering path rather than coupling visual migration to a large `App` extraction;
8. provides light/dark and phone/tablet/desktop targeted browser assurance in `tests/e2e/interface-plan-progress.spec.ts`; and
9. changes no planner calculation, evidence model, readiness/confidence semantics, persistence, entitlement or route behaviour.

Plan and Progress do not currently require a segmented-control interaction, so B2 does not invent one. The primitive remains available for later surfaces where the interaction is product-justified.

## Remaining implementation debt after B2

B2 intentionally does not attempt a repository-wide visual rewrite.

Remaining migration work includes:

- feature styles that still consume compatibility aliases such as `--ink`, `--surface`, `--muted` or legacy identity aliases;
- local hard-coded colour/radius/elevation/control decisions in older learner surfaces;
- Subjects/course/paper adoption of interactive/contextual surface grammar;
- Learn/Practice/Exam Prep migration to focused working, feedback and exam/performance surfaces;
- Admin alignment at an appropriate operational density; and
- eventual removal of compatibility aliases and redundant feature CSS after every live consumer migrates.

The older Plan/Progress declarations in broad compatibility stylesheets may remain while other live consumers depend on those files; `interface-plan-progress.css` supplies the final governed B2 treatment. Redundant compatibility declarations should be removed during B7 only when repository search and regression assurance prove they are no longer required.

These are implementation gaps, not permission to diverge from Brand System authority.

## Canonical brand-asset source package

Repository source location:

`assets/brand/`

The directory is intentionally outside Vite's deployed `public/` surface. It is the source-of-truth package for approved production assets and metadata, not an automatic deployment mechanism.

### Revision wordmark

- `assets/brand/source/revision-wordmark-primary-master.svg`
- `assets/brand/exports/revision-wordmark-primary-light.svg`
- `assets/brand/exports/revision-wordmark-primary-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-light.svg`

### Living E

- `assets/brand/source/revision-rev-living-e-master.svg`
- `assets/brand/exports/revision-rev-living-e-resting-light.svg`
- `assets/brand/exports/revision-rev-living-e-resting-dark.svg`
- `assets/brand/exports/revision-rev-living-e-nav-light.svg`
- `assets/brand/exports/revision-rev-living-e-nav-dark.svg`
- `assets/brand/exports/revision-rev-living-e-mono-dark.svg`
- `assets/brand/exports/revision-rev-living-e-mono-light.svg`

### App/browser

- `assets/brand/source/revision-app-icon-master.svg`
- `assets/brand/exports/revision-favicon.svg`
- `assets/brand/exports/revision-favicon-32.png`
- `assets/brand/exports/revision-favicon-16.png`

### Typeface provenance

- `assets/brand/manrope-source-and-license.md`

### Registry

- `assets/brand/manifest.json`

## Production sequence

### Stage 1 — canonical identity assets

**Complete.** Wordmark, Living E, identity usage rules, app-icon master, favicon treatment and Manrope provenance are recorded.

### Stage 2 — token and motion foundation

**Increment A implemented.** The learner runtime has central brand roles and governed REV timing behaviour.

### Stage 3 — learner interface migration

**In progress. Increments B1 and B2 establish the shared primitive foundation and migrate Plan/Progress.**

The bounded sequence is governed technically by `Interface System Implementation.md`:

1. **B1** — shared primitives, account workspace and overlay grammar — implemented;
2. **B2** — Plan and Progress — implemented by this increment;
3. **B3** — Subjects, Subject Home and course/specification pages;
4. **B4** — Learn and Practice;
5. **B5** — Exam Prep and exam experience;
6. **B6** — Admin; and
7. **B7** — compatibility retirement.

Each group must preserve product behaviour, evidence semantics, entitlement behaviour, accessibility and responsive navigation.

### Stage 4 — compatibility cleanup

After every live consumer has migrated, repository-search compatibility aliases and local design constants; remove only values with zero live consumers and collapse redundant feature CSS.

### Stage 5 — cross-channel production masters

Create social, video and marketing/Admin templates after the learner token foundations and principal component grammar are stable, so those assets do not encode temporary implementation drift.

## Assurance

Increment A protects theme and REV-motion roles through `tests/e2e/brand-token-motion.spec.ts`.

Increment B1 adds targeted interface-system assurance. Increment B2 adds `tests/e2e/interface-plan-progress.spec.ts` covering shared Plan/Progress hierarchy, page-header roles, Standard/Quiet surfaces, 48px fields, 44px/14px actions, restrained Progress composition, dark-theme semantic surfaces and page overflow across phone/tablet/desktop.

Because shared learner-runtime styling affects primary learner journeys, B2 is treated as Level 3 / high risk under the Testing & Assurance Standard. Full responsive learner regression and production build remain required before merge; production smoke remains required after deployment.

The normal repository CI, current-`main` integration check, Founder approval status and governed path-to-live remain required before production use.

## Documentation impact

`Visual Brand System.md` remains the normative authority. `Interface System Implementation.md` governs the production migration contract, and this readiness record now reflects B1 plus B2 progress.

No normative brand, product, evidence or entitlement authority change is introduced by B2. `INDEX.md` requires no update because no source-of-truth location changed. Historical Brand Studio research and audits remain historical evidence and are not rewritten.
