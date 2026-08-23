---
title: "Revision Identity Asset Usage Rules"
document_id: "revision-identity-asset-usage-rules"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.1"
owner: "Founder"
effective_date: "2026-08-23"
last_reviewed: "2026-08-23"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["Revision wordmark clear space", "Revision wordmark minimum size", "Living E clear space", "Living E control-surface contrast", "Ask REV CTA identity treatment", "app icon framing", "favicon treatment", "identity asset safe areas"]
depends_on: ["Revision Brand System"]
supersedes: null
---
# Revision Identity Asset Usage Rules

## Purpose

Define the production usage rules that the Revision Brand System requires for the canonical full Revision wordmark, standalone Living E, branded product-control treatment and app/browser icon framing.

These rules specialise the approved Brand System. They do not change the approved Manrope, Calm Teal, Living E or light/dark identity direction.

## Canonical sources

The production source package lives under `assets/brand/`.

The canonical full Revision wordmark geometry is `assets/brand/source/revision-wordmark-primary-master.svg`.

The canonical standalone Living E geometry is `assets/brand/source/revision-rev-living-e-master.svg`.

Do not redraw, re-space, stretch, condense, rotate or otherwise reconstruct either identity from memory when a canonical source exists.

## Revision wordmark clear space

Define **x** as the visible height of one teal horizontal E bar in the canonical full Revision wordmark.

The minimum clear space around the visible wordmark artwork is **2x on every side**.

Rules:

- measure from the visible artwork bounds, not from the SVG artboard bounds;
- no text, icon, image edge, container edge, crop, rule, badge or competing mark may enter the 2x exclusion zone;
- backgrounds may continue through the clear-space area provided they do not impair contrast or legibility;
- more clear space is encouraged in marketing, editorial, video and presentation use;
- do not reduce the exclusion zone in order to force the full wordmark into compact product chrome.

At the supplied 1600×400 working master, one E-bar height is approximately 40px, so the practical clear-space reference is approximately 80px around the visible mark. The proportional 2x rule is authoritative; the pixel figure is only a working reference.

## Revision wordmark minimum size

The full Revision wordmark must not be reproduced below:

- **160px wide in digital interfaces or raster exports**; or
- **35mm wide in print**.

Below that size, use an approved compact REV treatment or the standalone Living E rather than compressing or simplifying the full `REVISION` wordmark.

Minimum size is measured on the visible wordmark width, not the source artboard width.

The light, dark and monochrome variants use identical geometry. Only the approved colour treatment changes.

## Standalone Living E clear space

For standalone Living E use outside an app icon or a control that already defines its own safe area, define **e** as the height of one Living E bar in the canonical 240×240 master.

Keep at least **1e of clear space outside the visible outer halo** on all sides.

The halo is part of the identity treatment. It may be simplified at compact sizes, but the three horizontal bars must remain visually centred and recognisable.

## Primary app icon framing

The canonical Revision app icon uses the Living E, not the full wordmark.

### Canvas

- master canvas: **1024×1024**;
- background: **Deep Teal Ink `#0F2F36`**, full bleed to every edge;
- no transparent outer margin;
- do **not** bake rounded outer corners into the master; iOS, Android, PWA and other platforms apply their own masks;
- no wordmark, letters or additional text inside the icon.

### Living E placement

Use the canonical 240×240 Living E artwork, scaled proportionally into a **760×760 identity frame** centred on the 1024×1024 canvas.

This is equivalent to a 132px inset on each side of the master frame.

Do not resize the bars, halo core or halo ring independently. The canonical group scales as one unit.

The resulting treatment deliberately keeps the three bars well inside the central safe area while allowing the soft outer halo to remain atmospheric rather than visually dominant.

### Platform masking and safe area

The three teal bars and the recognisable halo core must remain inside the central **66% safe region** of the icon so they survive common rounded-square, circle and adaptive masks.

The faint outer halo may extend beyond that region and may be clipped by a platform mask without changing the identity.

Do not move the Living E off-centre to compensate for a particular operating-system mask. Platform-specific optical corrections require an explicit derived asset, not a change to the canonical master.

## Favicon treatment

At favicon sizes the three bars take priority over the halo.

The canonical favicon treatment is:

- full-bleed Deep Teal Ink `#0F2F36` background;
- three centred Primary Teal `#2BB6A3` rounded bars;
- no wordmark text;
- no halo required at 16×16 or 32×32, because blur/detail at those sizes reduces recognition;
- SVG is the preferred scalable browser asset, with 32×32 and 16×16 PNG fallbacks.

## Colour variants

The primary app icon is the Deep Teal + Primary Teal treatment above.

A platform may require monochrome, tinted or adaptive variants. Those variants must be derived from the same Living E geometry and must not replace the canonical primary icon without deliberate brand review.

### Product-control inverse treatment

The Living E is an identity mark rather than a generic UI icon. Its colour treatment may therefore adapt independently from the surrounding control label when necessary to keep the identity recognisable.

On **Primary Teal or another saturated brand-filled control surface where the normal Primary Teal bars would visually merge into the background**, use the approved **inverse-on-brand Living E**:

- preserve the canonical three-bar geometry and spacing exactly;
- use a light neutral treatment for the three bars, with **Neutral 0 / `#FFFFFF`** as the canonical product-control implementation;
- keep the surrounding action label on its normal governed foreground token, including Graphite Ink on Primary Teal where required for text contrast;
- simplify or remove the soft halo at compact control sizes when the halo reduces edge clarity or makes the mark appear blurred;
- do not add glow, outline, gradient, shadow or decorative effects merely to manufacture contrast; and
- return to the normal Living E treatment on surfaces where the canonical Primary Teal bars remain clearly separated from the background.

The inverse treatment is a colour/surface adaptation of the same Living E, not a new logo or mascot.

### Ask REV CTA

Persistent **Ask REV** is one branded CTA pattern across desktop, tablet and mobile learner shells.

The control must use:

- the same Primary Teal CTA surface family;
- the same explicit `Ask REV` label;
- the inverse-on-brand Living E defined above;
- the same underlying identity geometry and visual grammar at every breakpoint; and
- responsive dimensions, placement and safe-area spacing appropriate to desktop rail, tablet and mobile layouts.

Breakpoint changes may resize or reposition the CTA, but must not create separate desktop, tablet and mobile Ask REV identities. At compact CTA scale, the three bars take priority over halo detail so the mark remains crisp and immediately recognisable.

## Prohibited treatments

Do not:

- change the spacing between the three E bars;
- replace the rounded bar ends with square ends;
- recolour the bars with semantic Success, Warning or Error colours;
- add gradients, neon effects, particles, text or decorative symbols that compete with the Living E;
- put the full `REVISION` wordmark inside the app icon;
- create hand-tuned icon sizes by redrawing the mark; or
- use a rounded-corner master that risks double-masking on platforms.

## Documentation impact

Version 1.1 adds the surface-adaptive inverse Living E and establishes Ask REV as one responsive CTA identity pattern across desktop, tablet and mobile. Production implementation and technical documentation must use this rule rather than defining local breakpoint-specific REV treatments. The app-icon and favicon rules remain unchanged.