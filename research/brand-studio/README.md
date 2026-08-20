# Brand Studio — visual confirmation workspace

**Status:** Founder-confirmed visual foundations; v0.3 reusable-system confirmation in progress  
**Authority:** This folder is visual evidence/reference. Canonical policy lives in `20-brand-and-experience/Visual Brand System.md`.  
**Related PR:** #75

## Purpose

Provide a single visual place to inspect Revision's approved brand grammar, remaining open design-system decisions and channel-specific examples.

## Founder-confirmed foundations — 20 August 2026

The Founder has locked:

- **Typeface:** Manrope.
- **Core visual palette:** Calm Teal.
- **REV identity:** Living E — three horizontal bars with a soft halo.
- **REV states:** Resting, Listening, Thinking, Responding and Completed.
- **Themes:** light and dark are both first-class applications of one brand system.
- **Homepage:** spacious REV-led composition across mobile, tablet and desktop, with greeting/prompt, REV input, quick actions and continue/recent context beneath.
- **Mobile navigation:** Home / Plan / REV / Progress / Subjects with Living E in the centre.
- **Cross-audience intent:** contemporary and student-relevant while remaining calm, credible and trustworthy for parents/supporting adults.

### Approved Calm Teal palette

Core:

- Deep Teal Ink `#0F2F36`
- Primary Teal `#2BB6A3`
- Soft Aqua Accent `#E6FBF4`
- Canvas Off-White `#FAFCFB`
- Soft Surface Tint `#F1FAF8`
- Graphite Ink `#132026`

Supporting:

- Sage `#BCE8CF`
- Stone Blue `#C7D9EE`
- Warm Sand `#F2E9D9`
- Mist `#E9EEF2`

Functional source colours:

- Success `#3BAA7A`
- Warning `#DDAA3A`
- Error `#E0605A`
- Information `#4A8ECB`

See the canonical Brand System for the current light/dark theme token mapping.

## v0.3 — reusable system foundations

### Typography, spacing, shape and depth

![Brand Studio foundations v0.3](brand-studio-foundations-v0.3.svg)

Current proposal:

- a small Manrope type-role hierarchy rather than local font sizes;
- 16px default learner/product body text;
- a 4px base spacing rhythm;
- mobile/tablet/desktop gutters of 16 / 24 / 32–40px;
- `12 / 14 / 20 / 32 / pill` radius families;
- border/whitespace-first depth with Flat / Raised / Floating / Overlay elevation levels; and
- 1200px general product width with narrower reading/form widths.

### Controls and forms

![Brand Studio controls and forms v0.3](brand-studio-controls-forms-v0.3.svg)

Current proposal:

- 44px standard controls and 52px major CTAs;
- 14px control radius;
- Primary Teal + Graphite Ink as the default accessible primary action treatment;
- Deep Teal + white as a strong/inverse primary alternative;
- consistent default/focus/pressed/loading/disabled states;
- visible field labels and 16px input text;
- shared error/warning/success/loading anatomy across learner, marketing and Admin; and
- derived stronger semantic foreground colours for accessible status text.

The detailed proposal and contrast notes are in [`brand-studio-foundations-controls-v0.3.md`](brand-studio-foundations-controls-v0.3.md).

### Accessibility finding to resolve before promotion

The earlier branch token mapping used white text on Primary Teal. That combination is only about **2.52:1**, so it cannot be the default normal-text button treatment under the WCAG 2.2 AA target.

The v0.3 proposal keeps the confirmed Primary Teal colour but changes the normal action text to Graphite Ink (`#132026`), approximately **6.59:1** contrast. White text remains viable on Deep Teal Ink.

This is a usage correction, not a reopening of the confirmed Calm Teal palette.

## Current Founder confirmation queue

The next approval should confirm or adjust the v0.3 reusable-system direction:

1. Manrope type-role scale;
2. 4px spacing rhythm and responsive gutters;
3. `12 / 14 / 20 / 32 / pill` radius family;
4. four-level elevation model;
5. 44px standard / 52px large control sizing;
6. Primary Teal + Graphite as the default accessible primary action;
7. form anatomy/state model; and
8. stronger semantic foreground derivatives for accessible status text.

Once confirmed, these recurring rules should be promoted into the Brand System and the next tranche should move to **card/surface families, iconography/graphic language, subject accents and data visualisation**.

## Navigation clarification

The supplied responsive homepage board is approved for visual layout, but concept artwork does not override product Information Architecture.

The governed desktop and mobile destinations remain:

**Home / Plan / REV / Progress / Subjects**

A desktop mock-up that omits a separate REV navigation label is a visual concept only; production must preserve the genuine REV destination.

## Remaining system work after v0.3

1. production logo/REV asset masters, lock-ups, clear-space and minimum-size rules;
2. card and surface families with `use when` / `avoid when` guidance;
3. iconography and illustration/graphic-language rules;
4. subject-accent strategy and exact mapping if needed;
5. data visualisation and progress/status treatment;
6. marketing-site pattern families;
7. Admin/operations pattern families;
8. social format families;
9. video/motion title, lower-third, caption and transition rules;
10. REV motion timing/easing and reduced-motion equivalents; and
11. canonical asset naming, export sizes/formats, editable-source and licensing rules.

## Pattern status vocabulary

Use:

- **Recommended** — default for the stated job;
- **Alternative** — approved when context justifies it;
- **Experimental** — visible for evaluation but not reusable authority;
- **Deprecated** — retained during migration/history but not for new work; or
- **Do not use** — rejected/non-compliant.

## Previous exploration boards — design history

Earlier v0.1/v0.2 boards remain as exploration/history but no longer represent the leading brand direction where they conflict with the Founder-confirmed Calm Teal system.

### v0.2 — identity and typography

![Brand Studio identity and typography v0.2](brand-studio-identity-typography-v0.2.svg)

### v0.2 — expressive colour and semantic status

![Brand Studio expressive colour and status v0.2](brand-studio-expressive-colour-status-v0.2.svg)

### v0.1 — foundations and primitives

![Brand Studio visual confirmation v0.1](brand-studio-visual-confirmation-v0.1.svg)

### v0.1 — cross-channel expression

![Brand Studio channel expressions v0.1](brand-studio-channel-expressions-v0.1.svg)

These artifacts remain valid design-history evidence. Calm Teal, Manrope and Living E take precedence where they differ.