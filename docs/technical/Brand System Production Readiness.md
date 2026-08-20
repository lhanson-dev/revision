# Brand System Production Readiness

**Status:** implementation-readiness record  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9 plus `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Scope:** production asset readiness and implementation planning; this document does not redefine brand authority

## Purpose

Turn the approved Revision Brand System into a controlled production package and an implementation plan without silently reinterpreting the approved grammar.

This is preparatory work. It does not by itself change the learner experience or make a new product feature `In Progress`.

## Canonical user-facing runtime

The governed learner application is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the signed-in learner shell, global navigation, theme state and Home / Plan / REV routing. The current Living E implementation is shared through `src/app/RevPresence.tsx` and styled through `src/app/living-e.css` plus `src/app/living-e-accessibility.css`.

The repository root `/revision/` is a redirect into the learner application until the public marketing/editorial site is introduced.

## Current production evidence

The approved direction is already partially represented in the learner runtime:

- Manrope is loaded from Google Fonts with a system-sans fallback;
- light and dark mode are first-class runtime themes;
- `RevPresence` renders the Living E as inline SVG with three rounded horizontal bars;
- the soft halo and state motion are CSS-driven;
- Home uses the approved conversation-first hierarchy and exact greeting;
- the five governed destinations remain Home / Plan / REV / Progress / Subjects; and
- reduced-motion support is implemented.

This implementation evidence does not replace the Brand System and is not yet a complete production asset system.

## Readiness gap assessment

| Area | Current evidence | Readiness status | Required action |
| --- | --- | --- | --- |
| Primary Revision wordmark | Founder supplied final outlined light/dark SVG artwork on 20 August 2026; canonical source and light/dark/mono exports now live under `assets/brand/` | **Ready** | Preserve geometry and colour treatment; production runtime consumption is a later implementation change |
| Wordmark clear space / minimum size | `Identity Asset Usage Rules.md` defines 2x clear space, 160px digital minimum and 35mm print minimum | **Ready** | Apply consistently; use compact REV/Living E below the full-wordmark minimum |
| REV / Living E vector master | Canonical portable master and static exports exist under `assets/brand/` | **Ready** | Keep portable asset geometry aligned with the interactive runtime construction |
| Living E clear space | `Identity Asset Usage Rules.md` defines 1e clear space outside the outer halo for standalone use | **Ready** | Preserve the halo as identity, simplifying only at compact sizes where permitted |
| App icon framing | Canonical 1024×1024 SVG master now exists under `assets/brand/source/` using full-bleed Deep Teal and a centred 760×760 Living E identity frame | **Ready** | Generate platform-specific exports from this master rather than redraw the mark |
| Favicon | Canonical SVG plus 32×32 and 16×16 raster fallbacks exist | **Ready** | Use the simplified three-bar treatment at favicon sizes |
| REV motion source | CSS implementation exists and exact target alignment is now specified in `Brand Tokens and REV Motion Implementation Plan.md` | **Implementation-ready** | Implement the approved timing corrections in the separate governed runtime tranche |
| Manrope source/licensing metadata | Google Fonts runtime source and OFL-1.1 provenance are recorded in `assets/brand/manrope-source-and-license.md` and the asset manifest | **Ready** | Keep current remote-loading choice unless a later implementation decision deliberately changes delivery |
| Social/video templates | Brand grammar exists; editable masters do not | **Deferred** | Create editable SVG/template masters after token foundations are stable; not a blocker to learner implementation readiness |
| Asset registry | `assets/brand/manifest.json` records Living E, wordmark, app icon, favicon and Manrope source/licensing metadata | **Established** | Maintain it with each production asset change |
| Product token/component migration | Target central token architecture and compatibility migration are specified in `Brand Tokens and REV Motion Implementation Plan.md` | **Implementation-ready** | Implement Increment A in a separate governed runtime PR, then migrate learner surfaces incrementally |
| Brand Studio live reference surface | Repository reference boards exist | **Optional** | Do not build a live surface unless it materially improves contributor workflow |

## Revision wordmark intake validation

The supplied light and dark SVGs were inspected before intake:

- working size: **1600×400**;
- transparent background;
- vector path geometry rather than embedded raster artwork;
- no live `<text>` element or font dependency in the SVG;
- light treatment: Graphite Ink `#132026` + Primary Teal `#2BB6A3`;
- dark treatment: white + Primary Teal `#2BB6A3`.

The canonical package stores the approved light artwork as the editable/source vector and derives the theme/monochrome portable exports without changing the wordmark geometry.

## Identity usage rules now defined

The Founder-directed production rules are captured in `20-brand-and-experience/Identity Asset Usage Rules.md`:

- full Revision wordmark clear space is **2x**, where x is one teal E-bar height;
- full-wordmark minimum is **160px digital / 35mm print**;
- standalone Living E clear space is **1e** outside the outer halo, where e is one Living E bar height;
- app icon canvas is **1024×1024**, full-bleed Deep Teal `#0F2F36`;
- Living E is centred in a **760×760** identity frame;
- no rounded outer corners are baked into the app-icon master;
- essential bars/halo core remain within the central **66%** platform-safe region;
- favicon uses the three bars on Deep Teal without relying on halo detail at 16/32px.

## Manrope provenance now closed

The approved typeface remains Manrope. `app/index.html` currently loads weights 400, 500, 600, 700 and 800 from Google Fonts.

`assets/brand/manrope-source-and-license.md` now records:

- the runtime stylesheet source;
- the canonical Google Fonts repository source;
- Copyright 2018 The Manrope Project Authors; and
- SIL Open Font License 1.1 (OFL-1.1).

No font binaries are stored or redistributed in the brand asset package. If the product later self-hosts or bundles Manrope, the font-software licence/notice obligations must be handled in that implementation change.

## Confirmed implementation drift to address in the runtime tranche

The current learner styling is directionally correct but not yet a clean implementation of Brand System v0.9:

- `living-e.css` retains legacy variable names such as `--indigo`, `--lime`, `--navy` and `--green` as compatibility aliases;
- the dark background currently uses `#0E2024` while the approved token is `#0F2024`;
- several local teal text values are implementation-specific rather than role-based design tokens;
- Living E Resting uses a 5.8s loop rather than the specified 7s target within the approved 6–8s range;
- Listening and Thinking halo loops exceed the approved ranges; and
- Responding currently loops continuously rather than using the specified one-shot 0.8s state-entry treatment.

The exact target architecture, compatibility strategy, motion timings and assurance boundary are now defined in `docs/technical/Brand Tokens and REV Motion Implementation Plan.md`.

These are implementation gaps, not permission to change Brand System authority.

## Canonical brand-asset source package

Repository source location:

`assets/brand/`

The directory is intentionally outside Vite's deployed `public/` surface. It is the source-of-truth package for approved production assets and metadata, not an automatic deployment mechanism.

Current package includes:

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

## Production-readiness sequence

### Stage 1 — canonical identity assets

**Complete for learner implementation readiness.** Wordmark, Living E, identity usage rules, app-icon master, favicon treatment and Manrope source/licensing provenance are recorded.

### Stage 2 — motion and token alignment

**Specified and ready for a separate implementation PR.** The target is defined in `Brand Tokens and REV Motion Implementation Plan.md`:

1. introduce `src/app/brand-tokens.css` before feature CSS imports;
2. centralise brand, theme-role, semantic and shape/depth tokens;
3. correct the governed dark canvas to `#0F2024`;
4. use a bounded compatibility bridge rather than a big-bang rewrite;
5. align REV motion to 7s Resting / 1.5s Listening / 1.8s Thinking / 0.8s one-shot Responding / 0.85s Completed; and
6. preserve current state wiring, ARIA semantics, responsive behaviour and reduced-motion support.

### Stage 3 — learner styling migration

Migrate learner surfaces incrementally using the approved token, primitive and surface-family model. Avoid a big-bang visual rewrite. Each migrated surface must preserve product behaviour, evidence semantics, entitlement behaviour, accessibility and responsive navigation.

### Stage 4 — cross-channel production masters

Create social, video and marketing/Admin templates after the identity and token foundations are stable, so those assets do not encode temporary geometry or palette drift. These are useful follow-on production assets but are not blockers to the learner token/motion implementation tranche.

## Gate before learner styling implementation

The learner styling migration should not start until all of the following are true:

- full Revision wordmark master is available;
- Living E canonical source and required portable exports are recorded;
- app/favicon treatment is ready;
- Manrope source/licensing provenance is recorded;
- motion timing changes are specified against v0.9;
- the target token architecture is documented;
- canonical runtime/route remains `/revision/app/` through `PlannerRuntime`;
- implementation scope is separated from unrelated product-feature work; and
- assurance covers light/dark, responsive, keyboard/focus, reduced motion and no horizontal overflow.

**All production-readiness definition conditions above are now satisfied on this branch.** The next governed step after this readiness package is merged is a separate runtime implementation PR for Increment A; it must not be folded silently into this documentation/asset PR.

## Documentation impact

This work includes a narrow brand-authority addition for identity asset usage plus implementation-readiness documentation and canonical asset-source material. When the subsequent implementation PR changes runtime styling, `docs/technical/REV Living E Implementation.md`, `Brand Tokens and REV Motion Implementation Plan.md` and any affected technical docs must be updated in the same governed change.
