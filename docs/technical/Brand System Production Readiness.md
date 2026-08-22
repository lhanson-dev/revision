# Brand System Production Readiness

**Status:** identity/token foundations ready; B1, B2 and B2.5 live; B3 Subjects/course migration in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 plus `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** canonical assets, production implementation foundations and migration sequencing; this document does not redefine brand authority

## Purpose

Track the controlled move from the approved Revision Brand System into production assets and runtime implementation without silently reinterpreting the approved grammar.

Revision has an explicit enterprise design-system chain:

`Visual Brand System → brand tokens → shared CSS primitives → reusable React components/icons/assets → feature composition`

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
- phone/tablet/desktop responsive assurance; and
- reduced-motion and accessibility rules preserved through migration.

## Readiness matrix

| Area | Current evidence | Status | Next action |
| --- | --- | --- | --- |
| Primary Revision wordmark | Canonical master + light/dark/mono exports under `assets/brand/` | **Ready** | Consume through canonical helper/package |
| Wordmark usage | `Identity Asset Usage Rules.md` | **Ready** | Preserve clear space/minimum size |
| REV / Living E vector master | Canonical master + resting/nav/mono exports | **Ready** | Keep identity separate from generic icons |
| App/browser identity | App-icon master + favicon exports | **Ready** | Generate future platform derivatives from master |
| Manrope provenance | Runtime source + OFL provenance record | **Ready** | Keep current if delivery changes |
| Runtime design tokens | `src/app/brand-tokens.css` | **Implemented/live** | Remain single implementation source for reusable values |
| Shared CSS primitives | `src/app/interface-system.css` | **Implemented/live** | Extend centrally only for proven recurring jobs |
| Reusable React components | `src/app/ui/index.ts` | **Implemented/live via PR #116** | Reuse for new/extracted components |
| Shared component anatomy | `src/app/ui/ui-components.css` | **Implemented/live via PR #116** | Keep token-driven; no page palette/theme fork |
| Controlled product icon registry | `src/app/ui/Icon.tsx` | **Implemented/live via PR #116** | Add recurring icons centrally with assurance |
| Runtime canonical identity helper | `src/app/ui/BrandAsset.tsx` | **Implemented/live via PR #116** | Use approved theme-paired assets |
| Contributor component reference | `docs/technical/Interface System Component Registry.md` | **Established/live** | Maintain when public component contract changes |
| Interface operating standard | `docs/technical/Interface System Operating Standard.md` | **Established** | Apply to every migrated surface |
| Automated design-system governance | `scripts/assurance/interface-system-governance.test.mjs` | **Established/expanding** | B3 adds subject/course drift protection |
| Component semantic tests | `src/app/ui/ui-components.test.tsx` | **Implemented/live** | Protect component anatomy/semantics |
| Account workspace | B1 primitive consumer | **Migrated/live** | Move onto wrappers when relevant, not for churn alone |
| Plan | B2 visual migration; B2.5 React component proof consumer | **Migrated/live** | Preserve planner behaviour |
| Global Progress | B2 token/surface composition | **Migrated/live** | Preserve evidence/readiness semantics |
| Subjects / Subject Home | B3 `interface-subjects-course.css` | **Migration in progress** | Complete responsive/light-dark assurance |
| Course/specification overview | B3 `interface-subjects-course.css` | **Migration in progress** | Complete responsive/light-dark assurance |
| Learn / Practice | legacy/mixed styling remains | **Future B4** | Use hardened foundations/components |
| Exam Prep / exam experience | legacy/mixed styling remains | **Future B5** | Apply exam/performance family and governed pause/stop behaviour |
| Admin | shared foundations not yet fully migrated | **Future B6** | Reuse same system at appropriate density |
| Compatibility aliases | bounded legacy bridge | **Intentional debt** | Retire in B7 only after zero-live-consumer evidence |
| Social/video editable masters | governed families exist; editable masters do not | **Deferred** | Create after principal product grammar stabilises |

## B2.5 production evidence

PR #116 is no longer a candidate. It merged to `main` as `2369b33fa35414556096d0287100c1df8dbec8d7` after Revision CI #689 passed on exact PR head `5a1e18ad39fdd9f2ee1088a63abc1475404094e0`.

That merge established the reusable component/icon/asset foundation required before B3.

## B3 implementation direction

B3 covers Subjects, Subject Home and course/specification presentation. The dedicated migration layer is `src/app/interface-subjects-course.css`.

It uses the same semantic tokens and component grammar as the earlier migration rather than creating a subject-specific theme. The current compatibility renderer remains inside the canonical runtime; structural extraction is not required merely to restyle the surface and compatibility retirement remains B7.

Detailed scope and assurance are recorded in `docs/technical/Interface System B3 Subjects and Course Migration.md`.

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

## Production sequence

1. **Canonical identity assets — complete.**
2. **Token and REV-motion foundation — live.**
3. **B1 shared primitive/account/overlay foundation — live.**
4. **B2 Plan/Progress migration + central typography/icon roles — live.**
5. **B2.5 reusable component/icon/asset hardening — live via PR #116.**
6. **B3 Subjects/Subject Home/course migration — in progress.**
7. **B4–B6 remaining bounded page-family migration.**
8. **B7 compatibility retirement.** Remove aliases/redundant feature CSS only after zero-live-consumer assurance.
9. **Cross-channel editable masters.** Produce when principal interface grammar is stable.

## Assurance

Every migration increment must preserve the central source-of-truth model and include risk-appropriate assurance. For B3 this includes:

- typecheck and lint;
- unit/component tests;
- production build;
- interface-system governance assurance including `interface-subjects-course.css`;
- Subjects/Subject Home/course phone/tablet/desktop regression;
- light/dark semantic-surface checks;
- keyboard/focus and applicable accessibility coverage; and
- governed production smoke/path-to-live after merge.

## Documentation impact

B2.5 and B3 implement the existing Visual Brand System, Identity Asset Usage Rules and Product UX Principles. They do not change approved brand direction or product behaviour, so no normative authority change or ADR is required.

Current implementation records are updated with each governed migration. Historical brand research/audits remain historical and are not rewritten.
