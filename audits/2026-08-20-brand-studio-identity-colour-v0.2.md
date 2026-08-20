# Brand Studio Identity, Typography and Colour Confirmation v0.2 — 20 August 2026

**Status:** In progress / Founder confirmation required  
**Authority:** Audit evidence only  
**Related PR:** #75  
**Visual workspace:** `research/brand-studio/`

## Purpose

Continue the Brand Studio visual-confirmation process by stress-testing the parts of the system most likely to make Revision distinctive across product and external channels: identity, the relationship between Revision and REV, typography strategy, semantic colour and expressive colour.

This record does not approve a logo, typeface, expressive palette or subject colour. Those choices remain research until deliberately promoted through the governed Brand System.

## Current authority and implementation evidence

The active Visual Brand System on `main` already approves the broad learner-facing direction: focused energy, Deep Ink, Revision Indigo, Deep Indigo, Bright Lime, Canvas, Muted text, Surface border, readable modern sans-serif typography, rounded surfaces, and a non-human REV identity using orb/pulse/waveform/halo motifs.

Current implementation evidence shows:

- Inter/system-sans as the global application typography baseline;
- a `Revision` wordmark with a separate Bright Lime star in the signed-in learner shell;
- Revision Indigo as the dominant branded action colour after the newer visual layer is applied;
- an indigo/cyan REV orb and glow treatment; and
- substantial legacy/local presentation values that should not be promoted merely because they exist in code.

The current `Revision✦` treatment is therefore implementation evidence, not proof of a finished corporate identity.

## Visual artifacts added in v0.2

### Identity and typography

`research/brand-studio/brand-studio-identity-typography-v0.2.svg`

This board compares:

1. the current `Revision✦` treatment as transition/implementation evidence;
2. an experimental **E-stack / book-stack** device integrated into the Revision wordmark and usable as a compact mark; and
3. a contextual **Revision + REV** companion lock-up for moments where REV is genuinely present or being described.

It also proposes a two-layer typography strategy:

- highly readable product/learning/Admin body and interaction typography; and
- a more distinctive display voice for marketing, social and video, selected through a proper live-font test rather than inferred from SVG fallback rendering.

### Expressive colour and status

`research/brand-studio/brand-studio-expressive-colour-status-v0.2.svg`

This board separates colour into three jobs:

- approved core source palette;
- candidate semantic feedback roles; and
- experimental expressive colours for REV, illustration, editorial/campaign work and restrained subject recognition.

## v0.2 recommendations

### Identity architecture

**Recommended principle:** Revision owns the company/product identity. REV is the companion intelligence. The two should be visually related without becoming interchangeable.

The core Revision mark must work without the REV orb. The REV orb may appear when the assistant is genuinely part of the experience, story or media asset.

This avoids making the entire company visually dependent on an AI-assistant motif while preserving REV as a strong differentiated product presence.

### E-stack / book-stack direction

The experimental three-line `E` device is the strongest v0.2 identity direction to develop because it can plausibly work as:

- the `e` in Revision;
- a compact app/favicon/social mark;
- a book-stack reference without literal illustration;
- a signal/motion motif; and
- a bridge to the responsive/animated character of REV without becoming the REV orb itself.

This is a recommendation to develop, not approval of final geometry, lettering or lock-up.

### Typography

**Recommended strategy:** retain a highly readable modern sans baseline for learning, forms, navigation and Admin. Do not yet lock Inter as the entire brand voice simply because it is already implemented.

For marketing, social and video, test a stronger display family or custom typographic treatment that is:

- recognisable at headline scale;
- strong with numerals and mixed-case copy;
- contemporary without being childish;
- not institutional or generic SaaS; and
- clean beside the product body type.

The exact display family needs live rendering, licensing and accessibility review before approval.

### Semantic feedback colours

The v0.2 board tests these candidate foreground/background pairs:

- success: `#137A53` on `#EAF8F2` — calculated contrast approximately `4.88:1`;
- warning: `#8A5A00` on `#FFF8E6` — approximately `5.59:1`;
- danger: `#A43850` on `#FFF0F3` — approximately `5.83:1`; and
- information: Revision Indigo `#3349F4` on `#EEF1FF` — approximately `5.49:1`.

The calculations meet WCAG AA normal-text contrast thresholds, but real component states, focus, disabled behaviour, icons, dark/bright contexts and touch interactions still require implementation-level assurance before these are approved tokens.

### Expressive colour

The board proposes four experimental expressive directions:

- REV Cyan `#7BF3FF` — preferred experiment for REV/AI signal, glow and related art direction;
- Electric Violet `#7C66FF` — editorial/illustration candidate;
- Coral `#FF7A7A` — warmer human/editorial energy candidate; and
- Gold `#FFD45C` — warm illustration/editorial candidate.

Only REV Cyan currently has strong implementation evidence through the existing REV orb. None of these values is approved as a reusable cross-channel palette yet.

### Subject differentiation

Subject recognition should use small accents, icons and soft surfaces rather than full subject themes.

A subject accent must not:

- replace the subject name/context;
- imply attainment/readiness;
- redefine success/warning/error; or
- make each subject feel like a different application.

## Decisions deliberately still open

The following remain unresolved and should not be inferred from the visuals:

- final wordmark geometry and lettering;
- whether the E-stack becomes the final core mark;
- final app icon/favicon/social avatar export;
- final display typeface and licensing model;
- exact full type scale;
- full semantic token palette;
- final expressive palette;
- final subject-to-accent mapping;
- dark-background and print/export rules; and
- production implementation.

## Recommended next tranche

After Founder feedback on v0.2 identity/colour direction, continue with:

1. form anatomy and validation/loading/disabled states;
2. final shape/radius/elevation stress test across learner and Admin contexts;
3. reusable social format families;
4. video title/lower-third/caption/motion treatment; and
5. asset-source/export governance.

## Documentation-impact check

This file is audit evidence only. No production styling or technical documentation is changed. The proposed cross-channel Brand System in PR #75 should be refined only after the visual direction receives Founder confirmation. Historical v0.1 evidence remains unchanged.