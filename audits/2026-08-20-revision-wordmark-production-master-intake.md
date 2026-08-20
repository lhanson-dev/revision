# Revision wordmark production-master intake — 20 August 2026

**Status:** point-in-time production-asset intake evidence  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9  
**Branch:** `chore/brand-system-production-readiness`

## Purpose

Record the receipt and validation of the final full Revision wordmark SVGs so the production-readiness record can distinguish supplied identity artwork from previously missing source material.

## Source received

The Founder supplied two final SVG treatments:

- light-background wordmark;
- dark-background wordmark.

Both use the full **REVISION** wordmark with the three-bar Living E replacing the letter E.

## Validation

The supplied SVGs were inspected before repository intake.

Confirmed:

- working dimensions: **1600×400**;
- transparent background;
- vector path geometry;
- no embedded raster `<image>` content;
- no live `<text>` element or runtime font dependency;
- light treatment uses Graphite Ink `#132026` for the lettering and Primary Teal `#2BB6A3` for the Living E;
- dark treatment uses white for the lettering and Primary Teal `#2BB6A3` for the Living E.

The source geometry was preserved and normalised only for portable SVG formatting. No identity redesign, spacing reinterpretation or new colour role was introduced.

## Canonical repository package

Added:

- `assets/brand/source/revision-wordmark-primary-master.svg`
- `assets/brand/exports/revision-wordmark-primary-light.svg`
- `assets/brand/exports/revision-wordmark-primary-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-dark.svg`
- `assets/brand/exports/revision-wordmark-mono-light.svg`

The monochrome exports are derived from the same supplied geometry by applying one approved foreground colour throughout.

## Readiness impact

The previous production-readiness blocker for the full Revision wordmark source is closed.

Remaining identity-production gaps are:

1. numeric clear-space and minimum-size guidance, which is a brand-governance decision rather than something implementation should invent;
2. final app-icon/favicon framing and generated export package; and
3. Manrope source/licensing metadata.

REV motion/token alignment and wider learner styling remain separate implementation work.

## Documentation-impact check

This audit records new evidence and does not change the approved brand grammar. `docs/technical/Brand System Production Readiness.md`, `assets/brand/README.md` and `assets/brand/manifest.json` have been updated in the same branch. The historical baseline audit remains unchanged.
