# Revision brand assets

This directory contains canonical production-source brand assets and their metadata.

Normative visual rules live in `20-brand-and-experience/Visual Brand System.md` and the specialised `20-brand-and-experience/Identity Asset Usage Rules.md`. Files here implement those approved rules; they do not create new brand authority by themselves.

## Directory model

- `source/` — editable/vector masters that should be changed deliberately and reviewed.
- `exports/` — portable derived assets generated from an approved master.
- `manifest.json` — lifecycle, source, export, channel and licensing metadata.

This directory is intentionally not Vite's `public/` directory. Adding an asset here does not automatically publish it to the learner application.

## Naming

Use the Brand System pattern:

`revision-{asset}-{variant}-{theme}-{size}.{ext}`

Do not add `final`, `v7`, dates or similar pseudo-versioning to ordinary production filenames. Git history owns version history.

## Current package boundary

The production-readiness package contains canonical portable vector sources for:

- the REV / Living E identity;
- the primary full Revision wordmark supplied by the Founder; and
- the primary 1024×1024 Revision app-icon framing.

It also contains a canonical favicon SVG with 32×32 and 16×16 raster fallbacks.

Editable social/video masters remain later cross-channel production work. Runtime consumption of these assets remains a separate governed implementation change.

## Revision wordmark source rule

`source/revision-wordmark-primary-master.svg` is the canonical portable vector master for the full **REVISION** wordmark with the Living E replacing the letter E.

Derived exports are:

- `exports/revision-wordmark-primary-light.svg`
- `exports/revision-wordmark-primary-dark.svg`
- `exports/revision-wordmark-mono-dark.svg`
- `exports/revision-wordmark-mono-light.svg`

The source master retains the approved 1600×400 working size and transparent background. Production use should scale the SVG proportionally; do not rasterise it merely to change display size.

Identity usage is governed by `20-brand-and-experience/Identity Asset Usage Rules.md`, including:

- 2x wordmark clear space, where x is one teal E-bar height;
- 160px digital / 35mm print full-wordmark minimum size; and
- use of compact REV/Living E below that threshold rather than compressing the full wordmark.

## Living E source rule

`source/revision-rev-living-e-master.svg` is the canonical portable vector master for the three-bar Living E with soft halo.

The existing learner runtime currently constructs the same identity as inline SVG + CSS in `src/app/RevPresence.tsx` and `src/app/living-e.css`. Until a later implementation PR deliberately consumes these assets or a shared geometry module, the repository therefore has:

- a canonical portable master for asset production; and
- a current runtime construction for interactive motion/state behaviour.

They must remain visually aligned.

For standalone use outside a control/app-icon safe area, the Living E keeps 1e clear space outside the outer halo, where e is one bar height in the canonical master.

## App icon source rule

`source/revision-app-icon-master.svg` is the canonical 1024×1024 primary app-icon master.

It uses:

- full-bleed Deep Teal Ink `#0F2F36`;
- the canonical Living E centred within a 760×760 identity frame;
- no baked outer corner radius;
- no wordmark or text; and
- a central 66% essential-content safe region for platform masking.

Do not redraw individual platform sizes. Generate platform-specific exports from the canonical master and preserve the Living E geometry.

## Favicon rule

The browser/favicon package is:

- `exports/revision-favicon.svg`
- `exports/revision-favicon-32.png`
- `exports/revision-favicon-16.png`

At these small sizes, use the three centred Primary Teal bars on full-bleed Deep Teal. The halo is intentionally omitted from the 16×16 and 32×32 treatment so recognition is not lost to blur/detail.

## Static states and reduced motion

The approved semantic REV states are Resting, Listening, Thinking, Responding and Completed. In reduced-motion contexts the product may use the same static Living E geometry while text/context carries the state meaning. Separate static files are only required when a state has a materially different approved still treatment.

## Lifecycle vocabulary

Use only:

- `Recommended`
- `Alternative`
- `Experimental`
- `Deprecated`
- `Do not use`

Items that are required but not yet supplied are recorded in the manifest with an explicit readiness status rather than being represented by invented placeholder artwork.
