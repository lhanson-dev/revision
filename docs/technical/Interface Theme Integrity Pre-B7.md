# Interface Theme Integrity — Pre-B7

**Status:** site-wide integrity baseline live via PR #125; Practice recommendation follow-up in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0, `50-engineering-standards/Testing & Assurance Standard.md` and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** close light/dark visual gaps and make theme regressions automatically detectable before compatibility retirement

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 can prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translate between light and dark modes, but older compatibility styles can still win individual cascades.

The production hardening sequence is:

- PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227`: initial pre-B7 theme hardening;
- PR #124 / merge `66e9213ac3e4b3815e27039fb7c264fafd1496bd`: course Overview and Exam Prep paper follow-up;
- PR #125 / merge `988f67d0dfbf5f3a83820eff3216899b72edec5d`: site-wide theme classification, learner/Admin/auth rendered sweeps, sign-in theming and accessibility fixes; `revision/path-to-live = success`.

Founder production review after PR #125 still found the visible Practice `REV recommends` card rendering as a white surface in Dark mode.

The important assurance finding is that route coverage is not the same as visual-state coverage. The Practice route was visited by the site-wide sweep, but the test did not make the recommendation card itself a named contractual surface with an explicit expected semantic token. The generic descendant blacklist was therefore insufficient evidence for that material state.

B7 remains blocked until this follow-up is merged and production-verified.

## Implementation

`src/app/interface-theme-integrity.css` remains the final compatibility layer after all migrated Interface System layers.

The Practice recommendation is now explicitly classified as a Guidance surface in that final layer:

- `.planner-runtime .focused-practice .recommendation-card` uses `--color-surface-soft`;
- border uses governed action/border roles;
- primary text uses `--color-text`;
- supporting text uses `--color-text-secondary`; and
- the `REV recommends` eyebrow uses `--color-accent-text`.

This explicit selector prevents older recommendation-card styling from winning the cascade in either theme while compatibility CSS remains present.

## Assurance model

Theme integrity now uses three complementary controls.

### 1. Static style-governance gate

`scripts/assurance/site-theme-integrity.test.mjs`:

- requires migrated shared guidance/auth styles to avoid local colour palettes;
- classifies every stylesheet loaded by the canonical runtime;
- verifies the final compatibility integrity layer remains last in the authenticated semantic cascade; and
- now requires the Practice `REV recommends` surface to have an explicit semantic contract in the final compatibility layer.

### 2. Browser-wide rendered integrity sweep

`tests/e2e/site-theme-integrity.spec.ts` continues to audit Home, Plan, Progress, Subjects, Subject Home, course Overview, Learn, Practice, Exam Prep, expanded paper content, course Progress, REV and Account/Profile/Settings in Dark mode.

The generic descendant scan remains useful for broad regression detection, but it is no longer treated as sufficient for material conditional states.

### 3. Material-state assertions

Practice now has a named state assertion that requires the real `REV recommends` card to be visible and verifies its computed values against the actual runtime semantic tokens:

- card background must resolve exactly to `--color-surface-soft`;
- recommendation heading must resolve to `--color-text`; and
- `REV recommends` eyebrow must resolve to `--color-accent-text`.

This is deliberately stronger than checking that the card is merely “not white”.

The same principle should be applied whenever a route contains materially different conditional visual states: tests must render the state and assert its semantic contract, rather than assuming a route visit covers it.

## Existing assurance retained

- `tests/e2e/admin-theme-integrity.spec.ts` covers Admin dashboard, Users, Activity, System Health, Founder Assurance and Content Operations.
- `tests/e2e/auth-entry.spec.ts` covers Dark-mode sign-in and account creation.
- `tests/e2e/course-dark-theme.spec.ts` covers course Overview and Exam Prep paper roles.
- accessibility and responsive assurance continue across phone, tablet and desktop projects.

## Documentation impact

This is implementation and assurance hardening of existing dual-theme visual authority and the existing Testing & Assurance Standard. No normative product/brand authority change or ADR is required.

The technical checkpoint is updated because PR #125 demonstrated that “site-wide” must mean coverage of materially distinct rendered states, not just routes and generic descendant scans.

Historical evidence is unchanged. B7 must not begin compatibility deletion until this follow-up is merged and production-verified, then its zero-live-consumer dependency scan must run against the resulting `main`.
