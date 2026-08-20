# Brand Tokens and REV Motion Implementation Plan

**Status:** implementation plan  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9 and `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

Define the controlled implementation tranche that aligns the current learner runtime with the approved Calm Teal token system and REV motion ranges without changing product behaviour or reopening brand decisions.

This document is a technical plan. It does not itself change production styling.

## Current implementation evidence

`src/main.tsx` currently imports multiple feature CSS files, with `living-e.css` and `living-e-accessibility.css` loaded near the end of the cascade.

`living-e.css` currently owns both the REV motion implementation and a local theme/token layer. It contains approved Calm Teal values but also retains compatibility names such as `--indigo`, `--lime`, `--navy` and `--green` and defines the dark canvas as `#0E2024` rather than the governed `#0F2024`.

`living-e-accessibility.css` adds higher-contrast teal text treatments and active-state overrides that should become role-based tokens rather than remain a separate palette correction layer indefinitely.

## Target token architecture

Create a single learner brand-token source at:

`src/app/brand-tokens.css`

Load it in `src/main.tsx` **before** feature/component CSS so later files consume the shared roles rather than redefine the palette.

### 1. Foundation brand tokens

These values are invariant across light and dark themes:

```css
--brand-deep-teal: #0F2F36;
--brand-primary-teal: #2BB6A3;
--brand-soft-aqua: #E6FBF4;
--brand-canvas-off-white: #FAFCFB;
--brand-soft-surface: #F1FAF8;
--brand-graphite: #132026;
--neutral-0: #FFFFFF;
--neutral-100: #F6F8F7;
--neutral-200: #E6ECEB;
--neutral-600: #607074;
--neutral-900: #0F1416;
```

Supporting accents and functional source colours should also live here when consumed by the learner runtime rather than being re-declared locally.

### 2. Theme role tokens

Components should consume semantic roles rather than foundation colour names where the role changes by theme.

Light theme:

```css
--color-bg: #FAFCFB;
--color-surface: #FFFFFF;
--color-surface-elevated: #FFFFFF;
--color-surface-soft: #F1FAF8;
--color-border: #E6ECEB;
--color-text: #132026;
--color-text-secondary: #5B686C;
--color-action: #2BB6A3;
--color-action-text: #132026;
--color-inverse-action: #0F2F36;
--color-inverse-action-text: #FFFFFF;
--color-accent-text: #0F5D54;
```

Dark theme:

```css
--color-bg: #0F2024;
--color-surface: #13272B;
--color-surface-elevated: #173136;
--color-surface-soft: #173136;
--color-border: #24434A;
--color-text: #E6F2EF;
--color-text-secondary: #A8BCC0;
--color-action: #2BB6A3;
--color-action-text: #132026;
--color-inverse-action: #0F2F36;
--color-inverse-action-text: #FFFFFF;
--color-accent-text: #74D9CA;
```

The dark background correction from `#0E2024` to `#0F2024` is implementation alignment with existing authority, not a new design decision.

### 3. Semantic status roles

Where the learner runtime needs status treatment, use the approved strong foreground + pale surface pair rather than arbitrary local status colours:

```css
--status-success-fg: #2D7A5D;
--status-success-bg: #E7F5EF;
--status-warning-fg: #826C31;
--status-warning-bg: #FBF5E7;
--status-error-fg: #AD504D;
--status-error-bg: #FBECEB;
--status-info-fg: #3C72A2;
--status-info-bg: #E9F1F9;
```

Status meaning must continue to use text/icon semantics as well as colour.

### 4. Shape/depth roles

The initial token source should expose the approved reusable shape/depth roles so future component migration does not introduce new local values:

```css
--radius-compact: 12px;
--radius-control: 14px;
--radius-surface: 20px;
--radius-feature: 32px;
--radius-pill: 999px;
--shadow-raised: 0 2px 8px rgba(15, 47, 54, .06);
--shadow-floating: 0 10px 30px rgba(15, 47, 54, .10);
--shadow-overlay: 0 20px 50px rgba(15, 47, 54, .14);
```

Dark surfaces should continue to rely mainly on surface/border separation rather than copying light-mode shadows everywhere.

## Compatibility migration rule

Do not require an unsafe big-bang rewrite of every existing feature stylesheet.

The first implementation tranche may define temporary compatibility aliases in `brand-tokens.css`, for example:

```css
--ink: var(--color-text);
--canvas: var(--color-bg);
--surface: var(--color-surface);
--surface-soft: var(--color-surface-soft);
--muted: var(--color-text-secondary);
--line: var(--color-border);
```

However:

- new code must use the role-based tokens;
- `--indigo`, `--lime`, `--navy`, `--green` and similar legacy colour-identity aliases should not be used by new work;
- feature CSS should be migrated incrementally away from compatibility aliases;
- aliases are transitional implementation debt, not part of the Brand System API; and
- removal should happen only after repository search proves no live consumer remains.

This preserves stability while stopping further palette drift.

## REV motion alignment

The governed REV states remain Resting, Listening, Thinking, Responding and Completed. The current component's internal `complete` key may remain as an implementation name if it continues to map unambiguously to the governed Completed state.

Target web timings:

| Governed state | Target web treatment | Target timing |
| --- | --- | --- |
| Resting | subtle halo breathe; bars stable | **7s** ease-in-out infinite |
| Listening | gentle halo/ripple plus restrained bar equalisation | **1.5s** rhythm, looping while genuinely listening |
| Thinking | controlled stagger across bars + halo/ring activity | **1.8s** loop with existing small phase offsets |
| Responding | one left-to-right / centre-out entry pulse; response content is not delayed | **0.8s** entry, one-shot |
| Completed | brief settle/halo expansion returning to neutral | **0.85s** one-shot |

These values sit inside the already-approved v0.9 ranges and remove the current drift:

- Resting `5.8s` → `7s`;
- Listening halo `2.2s` → `1.5s`;
- Thinking halo `2.7s` → `1.8s`;
- Responding continuous loops → one-shot `0.8s` state-entry pulse;
- Completed remains within the approved 700–1000ms settle range.

Bar movement amplitudes should remain restrained. The implementation should not imply progress percentage, elapsed time or remaining response time.

## Reduced motion

Preserve the current `prefers-reduced-motion: reduce` contract: looping and decorative REV animation must be removed.

Where a state change still benefits from visual acknowledgement, an instant state swap or opacity transition of no more than approximately 100–150ms is permitted by authority, but the current zero-animation treatment is already compliant and may remain.

State text/context and ARIA labels must continue to make the state understandable without motion.

## Component and CSS migration sequence

### Increment A — token source + exact governed drift fixes

- add `brand-tokens.css` before feature CSS imports;
- move current root light/dark role definitions into it;
- correct dark background to `#0F2024`;
- retain only the minimum compatibility bridge needed to keep unchanged surfaces stable;
- point `living-e.css` and `living-e-accessibility.css` at role tokens;
- align REV timings to the table above;
- preserve existing product state wiring, ARIA semantics and reduced-motion behaviour.

### Increment B — learner surface migration

Migrate learner feature CSS in bounded groups to role tokens, approved radii and surface families. Do not combine this with unrelated product-feature changes.

Suggested order:

1. learner shell/navigation and Home;
2. REV conversation surfaces;
3. Plan and Progress;
4. Subjects/course/paper surfaces;
5. Learn/Practice/Exam Prep and remaining supporting components.

### Increment C — remove compatibility aliases

After all live consumers have migrated:

- repository-search every compatibility alias;
- remove aliases with zero live consumers;
- keep explicit migration evidence in the implementation PR/technical documentation.

## Assurance required for Increment A

At minimum:

- typecheck/lint/unit/build remain green;
- responsive browser assurance covers mobile/tablet/desktop;
- light and dark theme screenshots or equivalent assertions verify the corrected token source;
- Home, Plan, REV, Progress and Subjects navigation remain unchanged;
- REV state transitions continue to reflect genuine application state;
- reduced-motion disables loops;
- keyboard/focus treatments remain visible;
- no horizontal overflow is introduced; and
- no product/evidence/entitlement behaviour changes are bundled into the styling tranche.

## Documentation impact

When Increment A changes production code, update `docs/technical/REV Living E Implementation.md` and this plan/readiness record in the same implementation PR. If later migration changes reusable component implementation patterns materially, update the relevant technical documentation without changing normative Brand System authority unless the approved grammar itself changes.
