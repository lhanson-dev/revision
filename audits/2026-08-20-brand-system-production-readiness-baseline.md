# Brand System production-readiness baseline — 20 August 2026

**Status:** point-in-time implementation/readiness audit  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9  
**Branch:** `chore/brand-system-production-readiness`

## Scope

Assess what is required to turn the Founder-approved Brand System into canonical production assets and an implementation-ready migration without reopening approved brand grammar.

## Canonical runtime confirmed

The governed learner route is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

Current Living E implementation evidence:

- `src/app/RevPresence.tsx`
- `src/app/living-e.css`
- `src/app/living-e-accessibility.css`
- `src/app/PlannerRuntime.tsx`
- `src/app/PlannerHomeScreen.tsx`
- `src/app/PlannerRevScreen.tsx`

No competing learner runtime was identified for this work.

## What is already implemented

- Manrope is loaded for the learner application.
- Calm Teal light/dark runtime treatments exist.
- REV uses the three-bar Living E and soft halo.
- Home is conversation-first and REV-led.
- REV visual states are connected to genuine UI states.
- reduced-motion handling exists.
- five-destination governed navigation remains intact.

## Material readiness gaps

### 1. Full Revision wordmark master

**Finding:** blocked.

The repository does not contain a canonical editable full Revision wordmark master. The learner runtime constructs a compact REV wordmark in JSX, but implementation evidence cannot be promoted into a different identity asset by assumption.

**Consequence:** app/browser framing, cross-channel lock-ups and social/video templates should not be declared complete until the master is supplied or deliberately created and approved.

### 2. Living E portable master

**Finding:** remediated in this branch.

The approved three-bar identity previously existed as runtime code/CSS rather than a portable asset source. This branch adds a canonical SVG master and portable light/dark/nav/mono exports under `assets/brand/`.

### 3. Motion alignment

**Finding:** implementation drift.

The current CSS is directionally consistent but not numerically aligned everywhere with Brand System v0.9:

- Resting halo: 5.8s versus approved 6–8s;
- Listening halo: 2.2s versus approved 1.2–1.8s rhythm;
- Thinking halo: 2.7s versus approved 1.4–2.2s loop;
- current Responding uses a continuous loop while authority primarily specifies 600–900ms state entry behaviour.

**Consequence:** a separate implementation PR should align the motion while preserving the semantic state contract and reduced-motion behaviour.

### 4. Token and CSS architecture

**Finding:** implementation debt.

`living-e.css` introduces the approved palette but retains compatibility aliases such as `--indigo`, `--lime`, `--navy` and `--green`, and the wider learner CSS still includes feature-local hard-coded values.

**Consequence:** do not continue layering overrides indefinitely. The implementation plan should migrate to central brand/semantic/theme tokens and then consume them from components/surface families.

### 5. Dark token drift

**Finding:** minor implementation mismatch.

Current `living-e.css` uses `#0E2024` for the dark canvas while Brand System v0.9 specifies `#0F2024`.

**Consequence:** fix in the token/motion implementation tranche rather than changing authority.

### 6. Manrope metadata

**Finding:** incomplete production record.

The current app references Google Fonts, but the repository does not yet contain a complete authoritative source/license record for the font decision.

**Consequence:** capture source/license metadata before closing production readiness; do not redistribute font files through this package.

### 7. App/favicon and media masters

**Finding:** not complete.

The Living E is approved for compact/app use, but exact app-icon framing, favicon exports and editable social/video masters are not canonical repository assets yet.

**Consequence:** complete after the primary Revision wordmark/identity master is available so the package does not encode temporary lock-ups.

## Work completed in this tranche

- created `docs/technical/Brand System Production Readiness.md`;
- created canonical `assets/brand/` source/export structure;
- added a Living E vector master;
- added static light/dark, nav and monochrome Living E exports;
- added `assets/brand/manifest.json` with lifecycle/readiness/source/export metadata;
- documented blockers rather than inventing missing identity artwork.

## Recommendation

Do not begin the wider learner CSS/component migration yet.

First close the identity-source gap: obtain or deliberately create the canonical full Revision wordmark master and confirm app-icon framing/clear-space. In parallel, the technical implementation plan can prepare the token and motion alignment tranche because those changes are already governed by Brand System v0.9.

## Documentation-impact check

This audit is historical evidence only. The production-readiness technical record and asset package are current implementation/readiness material. No normative Brand System change is required because this tranche implements and assesses existing authority rather than altering it.