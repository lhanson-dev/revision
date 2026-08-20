# Brand System Production Readiness

**Status:** production foundations ready; Increment A implementation established  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9 plus `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Scope:** canonical assets, production implementation foundations and migration sequencing; this document does not redefine brand authority

## Purpose

Track the controlled move from the approved Revision Brand System into production assets and learner-runtime implementation without silently reinterpreting the approved grammar.

Canonical identity assets and production rules were established before runtime migration. Brand Token / REV Motion Increment A then introduced the central token source and exact governed motion/theme corrections. Wider learner-surface migration remains incremental work.

## Canonical user-facing runtime

The governed learner application is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the signed-in learner shell, global navigation, theme state and Home / Plan / REV routing. The Living E implementation is shared through `src/app/RevPresence.tsx`, with central roles in `src/app/brand-tokens.css` and component treatment in `src/app/living-e.css` plus `src/app/living-e-accessibility.css`.

The repository root `/revision/` is a redirect into the learner application until the public marketing/editorial site is introduced.

## Current production evidence

The approved direction is represented in the canonical learner runtime through:

- Manrope loaded from Google Fonts with a system-sans fallback;
- first-class light and dark modes;
- a central Calm Teal role-token source loaded before feature CSS;
- governed dark canvas `#0F2024`;
- `RevPresence` rendering the Living E as inline SVG with three rounded horizontal bars;
- soft halo and state motion driven by CSS;
- governed REV timing/loop behaviour for Resting, Listening, Thinking, Responding and Completed;
- Home using the approved conversation-first hierarchy and exact greeting;
- five governed destinations remaining Home / Plan / REV / Progress / Subjects; and
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
| Central learner token foundation | `src/app/brand-tokens.css` imported before feature CSS | **Implemented — Increment A** | Migrate bounded learner surface groups in Increment B |
| Dark theme drift | Governed `#0F2024` role is central | **Resolved — Increment A** | Protect with browser assurance |
| REV motion | Exact governed timings and one-shot/loop behaviour implemented | **Resolved — Increment A** | Protect state wiring/reduced motion during later styling work |
| Accessibility colour correction layer | Uses central role tokens rather than separate teal palette values | **Aligned — Increment A** | Fold patterns into migrated components during Increment B where appropriate |
| Compatibility aliases | Bounded bridge remains for unchanged CSS | **Intentional transitional debt** | Remove only after Increment B proves no live consumers |
| Wider learner surface styling | Mixed legacy/local values remain outside the refreshed runtime/Home/REV layer | **Migration required** | Increment B in bounded groups |
| Social/video editable masters | Brand grammar exists; editable masters do not | **Deferred** | Produce after learner token foundations stabilise |
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

## Increment A — implementation alignment

`docs/technical/Brand Tokens and REV Motion Implementation Plan.md` defines the implementation contract. Increment A implements it through:

1. `src/app/brand-tokens.css` loaded before feature CSS;
2. central foundation, theme-role, semantic and shape/depth tokens;
3. governed dark canvas `#0F2024`;
4. a bounded compatibility bridge for unchanged CSS;
5. role-token consumption in `living-e.css` and `living-e-accessibility.css`;
6. REV motion aligned to **7s Resting / 1.5s Listening / 1.8s Thinking / 0.8s one-shot Responding / 0.85s Completed**; and
7. direct Playwright assurance in `tests/e2e/brand-token-motion.spec.ts`.

The implementation preserves existing REV state wiring, ARIA semantics, responsive navigation and reduced-motion behaviour.

## Remaining implementation debt after Increment A

Increment A intentionally does not attempt a repository-wide styling rewrite.

Remaining migration work includes:

- feature styles that still consume compatibility aliases such as `--ink`, `--surface`, `--muted` or legacy identity aliases;
- local hard-coded colour/radius/elevation decisions outside the refreshed runtime/Home/REV layer;
- wider component adoption of approved surface families and reusable shape/depth roles; and
- eventual removal of the compatibility bridge after every live consumer migrates.

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

**Increment A implemented.** The learner runtime now has central brand roles and governed REV timing behaviour.

### Stage 3 — learner styling migration

**Next.** Migrate learner surfaces incrementally using the approved token, primitive and surface-family model. Avoid a big-bang visual rewrite.

Recommended bounded sequence remains:

1. learner shell/navigation and Home;
2. REV conversation surfaces;
3. Plan and Progress;
4. Subjects/course/paper surfaces;
5. Learn/Practice/Exam Prep and remaining supporting components.

Each group must preserve product behaviour, evidence semantics, entitlement behaviour, accessibility and responsive navigation.

### Stage 4 — compatibility cleanup

After every live consumer has migrated, repository-search the compatibility aliases and remove only those with zero consumers.

### Stage 5 — cross-channel production masters

Create social, video and marketing/Admin templates after the learner token foundations and principal component grammar are stable, so those assets do not encode temporary implementation drift.

## Assurance

Increment A adds targeted Playwright checks across phone, tablet and desktop for:

- light/dark token translation including the corrected dark canvas;
- branded action surface/text pairing;
- exact REV animation duration and iteration behaviour;
- genuine Listening state from the real REV conversation input; and
- reduced-motion animation removal.

Existing responsive journey assurance continues to cover Home, Plan, REV, Progress, Subjects and deeper course/exam flows without horizontal overflow.

The normal repository CI and governed path-to-live remain required before production use.

## Documentation impact

Canonical asset/readiness documentation, the REV implementation description and the token/motion implementation plan are aligned with Increment A.

No normative brand, product, evidence or entitlement authority changes are introduced by Increment A. Historical Brand Studio research and audits remain historical evidence and are not rewritten.
