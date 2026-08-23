# Brand System Production Readiness

**Status:** identity/token/component foundations live; B1–B6 and B7.1–B7.4 live; B7.5 final Interface System acceptance pending exact-head assurance and Founder-approved merge  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 plus `20-brand-and-experience/Identity Asset Usage Rules.md`  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Final B7 record:** `docs/technical/Interface System B7 Final Acceptance.md`  
**Scope:** canonical assets, production implementation foundations and migration/readiness state; this document does not redefine brand authority

## Purpose

Track the controlled move from the approved Revision Brand System into production assets and runtime implementation without silently reinterpreting the approved grammar.

Revision has an explicit enterprise design-system chain:

`Visual Brand System → brand tokens → shared CSS primitives → reusable React components/icons/assets → semantic surface layers → feature composition`

Learner, Admin and future marketing surfaces reuse this chain rather than add page-local design systems.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The interface migration does not change routes, persistence, planner/evidence semantics or entitlement behaviour.

## Current production direction

The approved/current direction includes:

- Manrope as the product typeface with central responsive type roles;
- first-class light and dark modes from one semantic role model;
- Calm Teal semantic colour roles and governed dark canvas;
- central spacing, radius, control, field, icon, motion, overlay and focus roles;
- named surface/control/status families implemented as reusable primitives;
- Living E identity kept separate from generic UI iconography;
- canonical identity assets registered under `assets/brand/manifest.json`;
- reusable component anatomy under `src/app/ui/`;
- controlled rounded-line product icon registry;
- theme-paired runtime identity helpers;
- shared modal/drawer focus and inertness contract;
- phone/tablet/desktop responsive assurance;
- reduced-motion and accessibility rules;
- fail-closed component/icon/asset ownership assurance; and
- bounded Light/Dark screenshot regression for high-value canonical states.

## Readiness matrix

| Area | Current evidence | Status | Ongoing rule |
| --- | --- | --- | --- |
| Primary Revision wordmark | canonical master + Light/Dark/mono exports | **Ready/live** | consume through canonical helper/package |
| Wordmark usage | `Identity Asset Usage Rules.md` | **Ready/live** | preserve clear space/minimum size |
| REV / Living E vector master | canonical master + resting/nav/mono exports | **Ready/live** | keep identity separate from generic icons |
| App/browser identity | app-icon master + favicon exports | **Ready/live** | generate future derivatives from master |
| Manrope provenance | runtime source + OFL provenance record | **Ready/live** | retain provenance if delivery changes |
| Runtime design tokens | `src/app/brand-tokens.css` | **Implemented/live** | remain single implementation source for reusable values |
| Shared CSS primitives | `src/app/interface-system.css` | **Implemented/live** | extend centrally only for proven recurring jobs |
| Reusable React components | `src/app/ui/index.ts` | **Implemented/live** | reuse before local recreation |
| Shared component anatomy | `src/app/ui/ui-components.css` | **Implemented/live** | token-driven; no page palette/theme fork |
| Controlled product icon registry | `src/app/ui/Icon.tsx` | **Implemented/live** | add recurring icons centrally with assurance |
| Runtime canonical identity helper | `src/app/ui/BrandAsset.tsx` | **Implemented/live** | use approved theme-paired assets |
| Contributor component reference | `Interface System Component Registry.md` | **Established/live** | maintain when public contract changes |
| Interface operating standard | `Interface System Operating Standard.md` | **Established/live** | apply to every interface change |
| Automated design-system governance | Interface/B7 assurance scripts | **Established/live** | fail closed on ownership/theme regressions |
| Component semantic tests | `src/app/ui/ui-components.test.tsx` | **Implemented/live** | protect component anatomy/semantics |
| Authentication identity | PR #140 | **Consolidated/live** | canonical assets only |
| Learner shell recurring icons | PR #142 | **Consolidated/live** | shared Icon registry only |
| Overlay/focus ownership | PR #144 | **Consolidated/live** | shared ModalShell/DrawerShell contract |
| Shell/Home/Account recurring identity/glyphs | PR #147 | **Consolidated/live** | no local identity/generic glyph families |
| Plan / Progress | B2 + B2.5 | **Migrated/live** | preserve planner/evidence semantics |
| Courses / course overview | B3 | **Migrated/live** | preserve product/course hierarchy |
| Learn / Practice | B4 + B7.5 common-control/reading correction | **Migrated; final B7 acceptance candidate** | shared common controls; job-specific composition |
| Exam Prep / timed exam | B5 + B7.3/B7.5 | **Migrated; final B7 acceptance candidate** | shared focus; timed viewport suppresses global dock |
| Admin | B6 + B7.5 common-control consolidation | **Migrated; final B7 acceptance candidate** | shared common controls; dense operational composition retained |
| Final theme compatibility bridge | `interface-theme-integrity.css` | **Retired by B7.5 candidate** | must not return; fix theme at owning layer |
| Retained feature styles | B7.5 named-consumer inventory | **Deliberately retained where live** | structural composition only; no parallel foundation |
| Visual regression | 18-state fixed-clock Playwright matrix | **B7.5 acceptance gate** | inspect/commit baselines; changes fail CI |
| Social/video editable masters | governed families exist; editable masters do not | **Deferred** | create when cross-channel production requires them |

## Migration evidence

The interface migration is no longer at B3. The production sequence is:

1. **Canonical identity assets — complete.**
2. **Token and REV-motion foundation — live.**
3. **B1 shared primitive/account/overlay foundation — live.**
4. **B2 Plan/Progress migration — live.**
5. **B2.5 reusable component/icon/asset hardening — live via PR #116 / merge `2369b33fa35414556096d0287100c1df8dbec8d7`.**
6. **B3 Courses/course migration — live via PR #118.**
7. **B4 Learn/Practice — live via PR #119.**
8. **B5 Exam Prep / exam experience — live via PR #121.**
9. **B6 Admin — live via PR #122.**
10. **B7.1–B7.4 identity/icon/overlay ownership consolidation — live via PRs #140, #142, #144 and #147.**
11. **B7.5 final compatibility retirement / visual acceptance — PR #148 candidate; exact-head CI, screenshot evidence, Founder approval and path-to-live still required.**

Detailed B7.5 consumer inventory, Design Acceptance dispositions and visual matrix are recorded in `docs/technical/Interface System B7 Final Acceptance.md`.

## Canonical identity package

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

The brand package is the source-of-truth asset package, not a licence to redraw identity marks in page code.

## Light and dark mode implementation

Light/dark are the same Revision system translated through semantic roles. Components and migrated surfaces render the same structure in both themes.

Ordinary interface components consume roles such as `--color-bg`, `--color-surface`, `--color-text`, `--color-border` and semantic status roles. They do not define local dark palettes.

Identity artwork whose approved export differs by theme is consumed through `BrandAsset`; feature pages do not implement local identity/theme switching.

B7.5 removes the final theme-integrity catch-all layer. Future theme defects must be corrected in the token/shared/semantic feature owner rather than by adding another final override.

## Assurance

Every material interface increment preserves the central source-of-truth model and includes risk-appropriate assurance. Current controls include:

- typecheck and lint;
- unit/component tests;
- production build;
- interface-system and B7 governance assurance;
- phone/tablet/desktop browser regression;
- semantic Light/Dark rendered checks;
- bounded 18-state Light/Dark screenshot regression;
- keyboard/focus/accessibility coverage;
- persistent-dock overlap/timed-exam suppression checks; and
- governed production smoke/path-to-live after merge.

## Documentation impact

The migration implements existing Visual Brand System, Identity Asset Usage Rules and Product UX Principles. B7.5 does not change approved brand direction or product behaviour, so no normative authority change or ADR is required.

Current implementation/readiness records are reconciled in PR #148. Historical brand research and Design Acceptance audits remain historical; B7.5 adds separate current evidence rather than rewriting them.
