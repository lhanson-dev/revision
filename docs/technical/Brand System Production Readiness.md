# Brand System Production Readiness

**Status:** identity/token foundations ready; B1 and B2 live; B2.5 reusable component/icon/asset foundation implemented by PR #116 candidate  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 plus `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** canonical assets, production implementation foundations and migration sequencing; this document does not redefine brand authority

## Purpose

Track the controlled move from the approved Revision Brand System into production assets and runtime implementation without silently reinterpreting the approved grammar.

Revision now has an explicit enterprise design-system chain:

`Visual Brand System → brand tokens → shared CSS primitives → reusable React components/icons/assets → feature composition`

Later learner/Admin/marketing surfaces should reuse this chain rather than add page-local design systems.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

B2.5 is an implementation consolidation inside this runtime. It does not change routes, persistence, planner/evidence semantics or entitlement behaviour.

## Current production direction

The approved/current direction includes:

- Manrope as the product typeface with central responsive type roles;
- first-class light and dark modes from one semantic role model;
- Calm Teal semantic colour roles and governed dark canvas `#0F2024`;
- central spacing, radius, control, field, icon, motion, overlay and focus roles;
- named surface/control/status families implemented as reusable primitives;
- Living E identity kept separate from generic UI iconography;
- canonical identity assets registered under `assets/brand/manifest.json`;
- reusable component anatomy under `src/app/ui/` in B2.5;
- controlled rounded-line product icon registry in B2.5;
- theme-paired runtime identity helpers in B2.5;
- phone/tablet/desktop responsive assurance; and
- reduced-motion and accessibility rules preserved through migration.

## Readiness matrix

| Area | Current evidence | Status | Next action |
| --- | --- | --- | --- |
| Primary Revision wordmark | Canonical master + light/dark/mono exports under `assets/brand/` | **Ready** | Consume through canonical helper/package |
| Wordmark usage | `Identity Asset Usage Rules.md` | **Ready** | Preserve clear space/minimum size |
| REV / Living E vector master | Canonical master + resting/nav/mono exports | **Ready** | Keep identity separate from generic icons |
| App/browser identity | App-icon master + favicon SVG/32/16 exports | **Ready** | Generate future platform derivatives from master |
| Manrope provenance | Runtime source + OFL provenance record | **Ready** | Keep current if delivery changes |
| Runtime design tokens | `src/app/brand-tokens.css` | **Implemented** | Remain single implementation source for reusable values |
| Shared CSS primitives | `src/app/interface-system.css` | **Implemented — B1/B2** | Extend centrally only for proven recurring jobs |
| Reusable React components | `src/app/ui/index.ts` | **Implemented by B2.5 candidate** | Require B2.5 live before B3 adoption |
| Shared component anatomy | `src/app/ui/ui-components.css` | **Implemented by B2.5 candidate** | Keep token-driven; no page palette/theme fork |
| Controlled product icon registry | `src/app/ui/Icon.tsx` | **Implemented by B2.5 candidate** | Add recurring icons centrally with assurance |
| Runtime canonical identity helper | `src/app/ui/BrandAsset.tsx` | **Implemented by B2.5 candidate** | Use for approved theme-paired wordmark/Living E exports |
| Contributor component reference | `docs/technical/Interface System Component Registry.md` | **Established by B2.5 candidate** | Maintain when public component contract changes |
| Interface operating standard | `docs/technical/Interface System Operating Standard.md` | **Established** | Apply to every migrated surface |
| Automated design-system governance | `scripts/assurance/interface-system-governance.test.mjs` | **Expanded by B2.5 candidate** | Extend with future shared contract changes |
| Component semantic tests | `src/app/ui/ui-components.test.tsx` | **Implemented by B2.5 candidate** | Protect component anatomy/semantics |
| Account workspace | B1 explicit primitive consumer | **Migrated/live** | Move onto React wrappers when relevant, not for churn alone |
| Plan | B2 visual migration; B2.5 React component proof consumer | **B2 live; B2.5 candidate** | Preserve planner behaviour through deployment |
| Global Progress | B2 token/surface composition | **Migrated/live** | Preserve evidence/readiness semantics |
| Dark-theme role drift | central dark roles | **Resolved** | Continue browser assurance |
| REV motion | governed timings + reduced-motion handling | **Resolved** | Preserve state truth and motion rules |
| Compatibility aliases | bounded legacy bridge | **Intentional debt** | Retire in B7 only after zero-live-consumer evidence |
| Subjects/course surfaces | legacy/mixed styling remains | **Not yet B3 migrated** | Start B3 only after B2.5 is live |
| Learn/Practice/Exam | legacy/mixed styling remains | **Future B4/B5** | Consume hardened registry |
| Admin | shared foundations not yet fully migrated | **Future B6** | Reuse same system at appropriate density |
| Social/video editable masters | governed families exist; editable masters do not | **Deferred** | Create after principal product grammar stabilises |

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

The brand package is the source-of-truth asset package, not a licence to redraw identity marks in page code. B2.5 `BrandAsset` consumes approved exports rather than creating new geometry.

## Light and dark mode implementation

Light/dark are the same Revision system translated through semantic roles. Components render the same structure in both themes.

Ordinary interface components consume roles such as `--color-bg`, `--color-surface`, `--color-text`, `--color-border` and semantic status roles. They do not define local dark palettes.

For identity artwork whose approved export differs by theme, B2.5 `BrandAsset` renders the registered light/dark pair and central component CSS switches visibility from the runtime `data-theme` state. Feature pages do not implement their own asset/theme switch.

## Production sequence

1. **Canonical identity assets — complete.**
2. **Token and REV-motion foundation — live.**
3. **B1 shared primitive/account/overlay foundation — live.**
4. **B2 Plan/Progress migration + central typography/icon roles — live.** Production verified on merge `609fc1247afa32d7d70fb32a87316dc1ce8939b7` with `revision/path-to-live = success`.
5. **B2.5 reusable component/icon/asset hardening — PR #116 candidate.** Must pass governed merge and production evidence before B3 begins.
6. **B3–B6 bounded page-family migration.** Consume the hardened system.
7. **B7 compatibility retirement.** Remove aliases/redundant feature CSS only after zero-live-consumer assurance.
8. **Cross-channel editable masters.** Produce when principal interface grammar is stable.

## Assurance

B2.5 is treated as Level 3 / high risk because it changes shared runtime UI infrastructure and moves Plan onto reusable components.

Assurance includes:

- typecheck and lint;
- unit/component tests;
- production build;
- `scripts/assurance/interface-system-governance.test.mjs` token/component/icon/asset checks;
- `src/app/ui/ui-components.test.tsx` semantic/render checks;
- Plan/Progress phone/tablet/desktop regression;
- light/dark semantic-surface checks;
- applicable accessibility coverage; and
- governed production smoke/path-to-live after merge.

## Documentation impact

B2.5 implements the existing Visual Brand System, Identity Asset Usage Rules and Product UX Principles. It does not change approved brand direction or product behaviour, so no normative authority change or ADR is required.

The Interface System Implementation, Operating Standard, Component Registry, readiness record and INDEX are maintained in the same governed branch. Historical brand research/audits remain historical and are not rewritten.
