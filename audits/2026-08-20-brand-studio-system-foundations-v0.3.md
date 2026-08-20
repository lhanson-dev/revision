# Brand Studio system foundations v0.3 — audit record

**Date:** 20 August 2026  
**Status:** Point-in-time design-system evidence  
**Authority:** None; proposals require deliberate Founder confirmation and promotion

## Context

The Founder-confirmed visual direction is now Manrope + Calm Teal + Living E / soft halo + first-class light/dark themes + the responsive REV-led homepage hierarchy.

This audit records the next reusable-system proposal so later decisions can distinguish confirmed foundations from v0.3 candidates.

## Scope reviewed

- active Product UX Principles on `main`;
- draft cross-channel Brand System in PR #75;
- current Brand Studio index and prior visual explorations;
- the Founder-confirmed Calm Teal palette and homepage/REV boards supplied on 20 August 2026.

## v0.3 proposal created

Two rendered boards and one detailed specification were added:

- `research/brand-studio/brand-studio-foundations-v0.3.svg`;
- `research/brand-studio/brand-studio-controls-forms-v0.3.svg`; and
- `research/brand-studio/brand-studio-foundations-controls-v0.3.md`.

The proposal defines a candidate Manrope type scale, 4px spacing rhythm, responsive gutters/content widths, `12 / 14 / 20 / 32 / pill` radius families, restrained elevation levels, 44/52px control sizing, button variants and complete form-state anatomy.

## Accessibility finding

The draft Brand System currently maps Primary Teal `#2BB6A3` to white action text.

Calculated contrast:

- white on Primary Teal: approximately **2.52:1** — insufficient for normal text;
- Graphite Ink `#132026` on Primary Teal: approximately **6.59:1** — suitable for AA normal text; and
- white on Deep Teal Ink `#0F2F36`: approximately **14.19:1**.

Therefore the v0.3 proposal keeps Primary Teal as a confirmed brand/action colour but recommends **Graphite Ink for ordinary text/icons on Primary Teal**, with Deep Teal + white available as a strong/inverse primary treatment.

This is an accessibility-driven usage correction and does not require changing the confirmed Calm Teal source palette.

## Functional-colour finding

The confirmed Success, Warning, Error and Information source colours are useful as accents/borders/fills but should not automatically become small foreground text on white.

Candidate stronger foreground derivatives were therefore proposed for status messaging:

- Success strong `#2D7A5D` — ~5.18:1 on white;
- Warning strong `#826C31` — ~5.07:1 on white;
- Error strong `#AD504D` — ~5.21:1 on white; and
- Information strong `#3C72A2` — ~5.10:1 on white.

These are candidates only until confirmed.

## Authority impact

No v0.3 candidate has been promoted into normative Brand System authority yet. The current draft Brand System still needs its action-text mapping corrected before merge if the v0.3 accessibility recommendation is accepted.

## Next decision

Founder confirmation is needed on the reusable-system direction before promotion:

1. type scale;
2. spacing/gutters;
3. radius family;
4. elevation model;
5. control sizing;
6. accessible primary-action treatment;
7. form anatomy/state model; and
8. accessible semantic foreground derivatives.

After confirmation, the next visual tranche should cover card/surface families, iconography/graphic language, subject accents and data visualisation.