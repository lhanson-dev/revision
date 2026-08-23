# Interface Theme Integrity — Pre-B7

**Status:** historical pre-B7 production checkpoint; final compatibility bridge retired by B7.5 / PR #148 candidate  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0, `50-engineering-standards/Testing & Assurance Standard.md` and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** preserve the pre-B7 light/dark hardening rationale and evidence; current post-B7 implementation truth is recorded in `docs/technical/Interface System B7 Final Acceptance.md`

## B7.5 disposition

This document records a historical implementation checkpoint. Its description of `src/app/interface-theme-integrity.css` below explains why the bridge existed before B7; it is no longer the target/current design.

B7.5 deletes that stylesheet and removes its `src/main.tsx` import. The Practice recommendation semantic contract moves into `interface-learn-practice.css`, retained runtime styles are classified by named live composition consumer, and fail-closed assurance prevents the final catch-all bridge from returning.

The original reasoning is retained below rather than rewritten to pretend the pre-B7 state never existed.

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 could prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translated between light and dark modes, but older compatibility styles could still win individual cascades.

The production hardening sequence was:

- PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227`: initial pre-B7 theme hardening;
- PR #124 / merge `66e9213ac3e4b3815e27039fb7c264fafd1496bd`: course Overview and Exam Prep paper follow-up;
- PR #125 / merge `988f67d0dfbf5f3a83820eff3216899b72edec5d`: site-wide theme classification, learner/Admin/auth rendered sweeps, sign-in theming and accessibility fixes; `revision/path-to-live = success`.

Founder production review after PR #125 still found the visible Practice `REV recommends` card rendering as a white surface in Dark mode.

The important assurance finding was that route coverage is not the same as visual-state coverage. The Practice route was visited by the site-wide sweep, but the test did not make the recommendation card itself a named contractual surface with an explicit expected semantic token. The generic descendant blacklist was therefore insufficient evidence for that material state.

This follow-up had to be production-verified before B7 compatibility deletion could proceed.

## Pre-B7 implementation

Before B7.5, `src/app/interface-theme-integrity.css` was the final compatibility layer after migrated Interface System layers.

The Practice recommendation was explicitly classified as a Guidance surface in that final layer:

- `.planner-runtime .focused-practice .recommendation-card` used `--color-surface-soft`;
- border used governed action/border roles;
- primary text used `--color-text`;
- supporting text used `--color-text-secondary`; and
- the `REV recommends` eyebrow used `--color-accent-text`.

That explicit selector prevented older recommendation-card styling from winning the cascade while compatibility CSS remained present.

B7.5 now owns that rule in `interface-learn-practice.css`, so the material state remains explicit without relying on a final masking layer.

## Assurance model at the checkpoint

Theme integrity used three complementary controls.

### 1. Static style-governance gate

`scripts/assurance/site-theme-integrity.test.mjs` originally:

- required migrated shared guidance/auth styles to avoid local colour palettes;
- classified every stylesheet loaded by the canonical runtime;
- verified the final compatibility integrity layer remained last in the authenticated semantic cascade; and
- required the Practice `REV recommends` surface to have an explicit semantic contract in that final compatibility layer.

B7.5 updates the same gate so the deleted bridge/import must remain absent and the Practice contract must live in its owning B4 semantic layer.

### 2. Browser-wide rendered integrity sweep

`tests/e2e/site-theme-integrity.spec.ts` audits Home, Plan, Progress, Courses, course Overview, Learn, Practice, Exam Prep, expanded paper content, course Progress, REV and Account/Profile/Settings in Dark mode.

The generic descendant scan remains useful for broad regression detection, but it is not treated as sufficient for material conditional states.

### 3. Material-state assertions

Practice has a named state assertion that requires the real `REV recommends` card to be visible and verifies its computed values against runtime semantic tokens:

- card background resolves to `--color-surface-soft`;
- recommendation heading resolves to `--color-text`; and
- `REV recommends` eyebrow resolves to `--color-accent-text`.

This is deliberately stronger than checking that the card is merely “not white”.

The same principle applies whenever a route contains materially different conditional visual states: tests must render the state and assert its semantic contract rather than assuming a route visit covers it.

## Existing assurance retained after B7

- `tests/e2e/admin-theme-integrity.spec.ts` covers Admin dashboard, Users, Activity, System Health, Founder Assurance and Content Operations.
- `tests/e2e/auth-entry.spec.ts` covers Dark-mode sign-in and account creation.
- `tests/e2e/course-dark-theme.spec.ts` covers course Overview and Exam Prep paper roles.
- accessibility and responsive assurance continue across phone, tablet and desktop projects.
- B7.5 adds `tests/e2e/interface-visual-regression.spec.ts`, a bounded 18-state fixed-clock Light/Dark screenshot matrix.
- B7.5 adds fail-closed assertions that `interface-theme-integrity.css` and its runtime import do not return.

## Documentation impact

The pre-B7 work was implementation and assurance hardening of existing dual-theme visual authority and the existing Testing & Assurance Standard. No normative product/brand authority change or ADR was required.

B7.5 updates only the checkpoint status/disposition so current technical documentation does not imply the retired bridge remains live. Historical Design Acceptance evidence is unchanged.
