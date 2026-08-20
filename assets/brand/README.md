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

The initial production-readiness package formalises the approved REV / Living E geometry and portable static exports that can be derived without inventing new identity rules.

It does not fabricate the missing canonical full Revision wordmark, final app-icon framing or editable social/video masters. Those remain explicit readiness items in `docs/technical/Brand System Production Readiness.md`.

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

Items that are required but not yet supplied are recorded in the manifest with `readiness: blocked` rather than being represented by invented placeholder artwork.