# Brand System Production Readiness

**Status:** identity/token foundations ready; B1–B6 Interface System migration live; pre-B7 theme integrity live through PR #126; B7 compatibility retirement not started  
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
| Automated design-system governance | Interface-system + site-theme assurance scripts | **Established/live** | Keep recurring roles and material conditional states protected |
| Component semantic tests | `src/app/ui/ui-components.test.tsx` | **Implemented/live** | Protect component anatomy/semantics |
| Account workspace / overlays | B1 primitive consumer + later theme-integrity coverage | **Migrated/live** | Preserve shared overlay/account grammar |
| Plan | B2 visual migration; B2.5 React component proof consumer | **Migrated/live** | Preserve planner behaviour |
| Global Progress | B2 token/surface composition | **Migrated/live** | Preserve evidence/readiness semantics |
| Subjects / Subject Home | B3 via PR #118 | **Migrated/live** | Preserve contextual hierarchy and active-state clarity |
| Course/specification overview | B3 via PR #118; dark-theme follow-up PR #124 | **Migrated/live** | Preserve course hierarchy and semantic theme roles |
| Learn / Practice | B4 via PR #119; site/theme follow-ups #125–#126 | **Migrated/live** | Preserve focused learning/task hierarchy and explicit conditional-state assurance |
| Exam Prep / exam experience | B5 via PR #121; dark-theme follow-ups #124–#125 | **Migrated/live** | Preserve calm exam/performance grammar and pause/stop interaction contract |
| Admin | B6 via PR #122; site-wide theme coverage PR #125 | **Migrated/live** | Preserve operational density and truthful status semantics |
| Pre-B7 theme-integrity bridge | PRs #123–#126; final merge `6a40afc95dabd55d0a76a758ea722d5108c571ea` has `revision/path-to-live = success` | **Complete/live** | Retain until B7 proves legacy sources can be removed safely |
| Compatibility aliases / legacy CSS | bounded legacy bridge still present | **Intentional debt** | Retire in B7 only after zero-live-consumer evidence |
| Holistic Design Acceptance | `audits/2026-08-22-design-acceptance-review.md` | **Review in progress** | Founder reviews representative live surfaces; this is not a normative B7 gate unless separately governed |
| Social/video editable masters | governed families exist; editable masters do not | **Deferred** | Create after principal product grammar stabilises |

## Migration evidence

The bounded Interface System migration is production-live through B6:

- B1 established shared interface foundations and account/overlay grammar.
- B2 migrated Plan and Progress.
- B2.5 established reusable React components, controlled icons and identity helpers through PR #116.
- B3 migrated Subjects, Subject Home and course surfaces through PR #118.
- B4 migrated Learn and Practice through PR #119.
- B5 migrated Exam Prep and timed exam experience through PR #121.
- B6 migrated Admin through PR #122.
- PRs #123–#126 then closed observed light/dark compatibility leaks without beginning B7 deletion work.

The final pre-B7 follow-up, PR #126, passed Revision CI #722 at exact head `d800a06b3aa8c53562eceacb42a86fa0802de9b6`, merged as `6a40afc95dabd55d0a76a758ea722d5108c571ea`, and has `revision/path-to-live = success`.

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

The temporary `interface-theme-integrity.css` bridge remains loaded last while compatibility CSS still exists. It is not a second design system; it translates remaining live compatibility descendants onto the same semantic roles until B7 can remove the underlying legacy sources safely.

## Production sequence

1. **Canonical identity assets — complete.**
2. **Token and REV-motion foundation — live.**
3. **B1 shared primitive/account/overlay foundation — live.**
4. **B2 Plan/Progress migration + central typography/icon roles — live.**
5. **B2.5 reusable component/icon/asset hardening — live via PR #116.**
6. **B3 Subjects/Subject Home/course migration — live via PR #118.**
7. **B4 Learn/Practice migration — live via PR #119.**
8. **B5 Exam Prep/exam experience migration — live via PR #121.**
9. **B6 Admin migration — live via PR #122.**
10. **Pre-B7 light/dark integrity hardening — live through PR #126.**
11. **B7 compatibility retirement — not started.** Remove aliases/redundant legacy CSS only after zero-live-consumer assurance from the then-current `main`.
12. **Cross-channel editable masters — deferred.** Produce when principal interface grammar is stable and channel work requires them.

A holistic Design Acceptance Review may assess the production result before or alongside the next technical increment. Unless separately promoted through governance, it is a point-in-time Founder review rather than an automatic release/B7 prerequisite.

## Assurance

Every material interface change must preserve the central source-of-truth model and include risk-appropriate assurance. Current recurring expectations include:

- typecheck and lint;
- unit/component tests;
- production build;
- Interface System/static style governance;
- representative phone/tablet/desktop browser regression;
- light/dark semantic-surface checks;
- explicit rendered-state checks for materially conditional states where needed;
- keyboard/focus and applicable accessibility coverage;
- normal database/RLS/protected-service regression where the runtime surface depends on them; and
- governed production smoke/path-to-live after merge.

Automation demonstrates objective implementation contracts. It does not replace human visual acceptance of hierarchy, density, coherence and product feel.

## Documentation impact

This document is reconciled to the current production state through PR #126. It does not change approved brand direction, product behaviour, B7 deletion rules or the canonical runtime. No normative authority update or ADR is required.

Historical brand research and audits remain historical and are not rewritten.