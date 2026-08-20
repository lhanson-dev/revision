# Revision brand assets

This directory contains canonical production-source brand assets and their metadata.

Normative visual rules remain in `20-brand-and-experience/Visual Brand System.md`. Files here implement those approved rules; they do not create new brand authority by themselves.

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

The production-readiness package now contains canonical portable vector sources for:

- the REV / Living E identity; and
- the primary full Revision wordmark supplied by the Founder.

The full wordmark package contains light, dark and monochrome variants. The supplied artwork is path-based SVG with no embedded raster or live-font dependency. The light treatment uses Graphite Ink `#132026` plus Primary Teal `#2BB6A3`; the dark treatment uses white plus Primary Teal.

Final app-icon framing, favicon exports and editable social/video masters remain explicit readiness items in `docs/technical/Brand System Production Readiness.md`.

## Revision wordmark source rule

`source/revision-wordmark-primary-master.svg` is the canonical portable vector master for the full **REVISION** wordmark with the Living E replacing the letter E.

Derived exports are:

- `exports/revision-wordmark-primary-light.svg`
- `exports/revision-wordmark-primary-dark.svg`
- `exports/revision-wordmark-mono-dark.svg`
- `exports/revision-wordmark-mono-light.svg`

The source master retains the approved 1600×400 working size and transparent background. Production use should scale the SVG proportionally; do not rasterise it merely to change display size.

## Living E source rule

`source/revision-rev-living-e-master.svg` is the canonical portable vector master for the three-bar Living E with soft halo.

The existing learner runtime currently constructs the same identity as inline SVG + CSS in `src/app/RevPresence.tsx` and `src/app/living-e.css`. Until a later implementation PR deliberately consumes these assets or a shared geometry module, the repository therefore has:

- a canonical portable master for asset production; and
- a current runtime construction for interactive motion/state behaviour.

They must remain visually aligned.

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
