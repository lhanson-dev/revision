# Brand Tokens and REV Motion Implementation Plan

**Status:** Increment A implemented; Increment B/C planned  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v0.9 and `20-brand-and-experience/Identity Asset Usage Rules.md` v1.0  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

Define and track the controlled implementation sequence that aligns the learner runtime with the approved Calm Teal token system and REV motion ranges without changing product behaviour or reopening brand decisions.

Increment A establishes the central token source and exact governed drift fixes. Increment B migrates learner surfaces in bounded groups. Increment C removes transitional compatibility aliases only after live consumers have been eliminated.

## Increment A implementation state

Increment A introduces `src/app/brand-tokens.css` and loads it in `src/main.tsx` before feature/component CSS.

The runtime now has one central source for:

- Calm Teal and neutral foundations;
- light/dark theme role tokens;
- approved semantic status foreground/surface pairs;
- approved radius and depth roles;
- theme-derived REV halo roles; and
- a bounded compatibility bridge for unchanged legacy CSS.

`src/app/living-e.css` and `src/app/living-e-accessibility.css` consume the role-based token layer instead of defining their own competing palette values.

The governed dark canvas is implemented as `#0F2024` rather than the previous `#0E2024` drift.

## Implemented token architecture

### 1. Foundation brand tokens

The central source defines the approved invariant foundations:

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

The approved Sage, Stone Blue, Warm Sand and Mist accents plus functional Success, Warning, Error and Information source colours are also exposed centrally for future governed consumers.

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

The dark background correction is implementation alignment with existing authority, not a new design decision.

### 3. Semantic status roles

The central source exposes the approved strong foreground + pale surface pairs:

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

The central source exposes the approved reusable shape/depth roles:

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

Increment A does not force every existing surface to adopt these immediately. That controlled surface migration belongs to Increment B.

## Compatibility migration rule

Increment A deliberately avoids an unsafe big-bang rewrite.

`brand-tokens.css` temporarily preserves compatibility aliases including the current `--ink`, `--canvas`, `--surface`, `--surface-soft`, `--muted`, `--line` and legacy identity-style aliases needed by unchanged CSS.

Rules:

- new code uses the role-based tokens;
- `--indigo`, `--lime`, `--navy`, `--green` and similar legacy colour-identity aliases must not be introduced by new work;
- feature CSS migrates incrementally during Increment B;
- compatibility aliases are transitional implementation debt, not part of the Brand System API; and
- removal happens only in Increment C after repository search proves no live consumer remains.

## REV motion alignment implemented in Increment A

The governed REV states remain Resting, Listening, Thinking, Responding and Completed. The component's internal `complete` key remains an implementation name that maps unambiguously to Completed.

Implemented web timings:

| Governed state | Web treatment | Timing |
| --- | --- | --- |
| Resting | subtle halo breathe; bars stable | **7s** ease-in-out infinite |
| Listening | gentle halo/equalisation rhythm | **1.5s** loop while genuinely listening |
| Thinking | controlled stagger across bars + halo activity | **1.8s** loop with restrained phase offsets |
| Responding | state-entry pulse returning to neutral | **0.8s** one-shot |
| Completed | brief settle/halo expansion returning to neutral | **0.85s** one-shot |

This removes the previous implementation drift:

- Resting `5.8s` → `7s`;
- Listening halo `2.2s` and mixed bar durations → common `1.5s` rhythm;
- Thinking halo `2.7s` / bars `1.55s` → `1.8s` rhythm while preserving small phase offsets;
- Responding continuous loops → one-shot `0.8s` state-entry pulse; and
- Completed halo/mark → common `0.85s` settle.

Bar movement remains restrained. Motion does not imply progress percentage, elapsed time or remaining response time.

## Reduced motion

The existing `prefers-reduced-motion: reduce` contract remains in place: looping and decorative REV animation is removed.

State text/context and ARIA labels continue to make the state understandable without motion.

## Implementation sequence

### Increment A — central token source + exact governed drift fixes

**Implemented.**

- `brand-tokens.css` is loaded before feature CSS;
- central brand/theme/semantic/shape roles are established;
- dark canvas is corrected to `#0F2024`;
- a bounded compatibility bridge preserves unchanged surfaces;
- `living-e.css` and `living-e-accessibility.css` consume role tokens;
- REV timings are aligned to the approved values;
- existing state wiring, ARIA semantics and reduced-motion behaviour are preserved; and
- targeted Playwright assurance is added in `tests/e2e/brand-token-motion.spec.ts`.

### Increment B — learner surface migration

**Planned next after Increment A is merged and production evidence is healthy.**

Migrate learner feature CSS in bounded groups to role tokens, approved radii and surface families. Do not combine this with unrelated product-feature changes.

Suggested order:

1. learner shell/navigation and Home;
2. REV conversation surfaces;
3. Plan and Progress;
4. Subjects/course/paper surfaces;
5. Learn/Practice/Exam Prep and remaining supporting components.

Each bounded group should preserve product behaviour, evidence semantics, entitlement behaviour, accessibility and responsive hierarchy.

### Increment C — remove compatibility aliases

**Planned after all live consumers migrate.**

- repository-search every compatibility alias;
- remove aliases with zero live consumers; and
- retain migration evidence in technical documentation / PR history.

## Increment A assurance

`tests/e2e/brand-token-motion.spec.ts` provides direct browser assertions across the existing phone, tablet and desktop Playwright projects for:

- light canvas `#FAFCFB`;
- corrected dark canvas `#0F2024`;
- Primary Teal action surface with Graphite action text;
- exact motion durations and infinite versus one-shot behaviour;
- genuine `listening` state when the real REV conversation input is focused; and
- reduced-motion animation removal.

The existing responsive journey assurance continues to cover Home, Plan, REV, Progress, Subjects, course/practice/exam-prep navigation and horizontal overflow.

Normal CI still requires typecheck, lint, unit tests, production build, browser assurance and database/protected-service assurance before merge readiness.

## Documentation impact

Increment A updates current implementation only. `docs/technical/REV Living E Implementation.md` records the resulting runtime behaviour. `docs/technical/Brand System Production Readiness.md` records that the production-readiness definition has now moved into implementation.

No normative Brand System change is required because the implementation follows existing approved authority.
