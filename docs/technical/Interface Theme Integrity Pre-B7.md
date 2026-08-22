# Interface Theme Integrity — Pre-B7

**Status:** Complete and production-live through PR #126  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0, `50-engineering-standards/Testing & Assurance Standard.md` and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** close light/dark visual gaps and make theme regressions automatically detectable before compatibility retirement

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 can prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translate between light and dark modes, but older compatibility styles could still win individual cascades.

The production hardening sequence is:

- PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227`: initial pre-B7 theme hardening;
- PR #124 / merge `66e9213ac3e4b3815e27039fb7c264fafd1496bd`: course Overview and Exam Prep paper follow-up;
- PR #125 / merge `988f67d0dfbf5f3a83820eff3216899b72edec5d`: site-wide theme classification, learner/Admin/auth rendered sweeps, sign-in theming and accessibility fixes; and
- PR #126 / merge `6a40afc95dabd55d0a76a758ea722d5108c571ea`: Practice `REV recommends` semantic-contract fix and material-state assurance hardening. Its exact head `d800a06b3aa8c53562eceacb42a86fa0802de9b6` passed Revision CI #722, and the merge has `revision/path-to-live = success` through deployment run `32585745336`.

Founder production review after PR #125 had still found the visible Practice `REV recommends` card rendering as a white surface in Dark mode.

The important assurance finding was that route coverage is not the same as visual-state coverage. The Practice route was visited by the site-wide sweep, but the test did not make the recommendation card itself a named contractual surface with an explicit expected semantic token. The generic descendant blacklist was therefore insufficient evidence for that material state.

PR #126 closed that known defect and production-verification condition. The pre-B7 theme-integrity blocker is therefore satisfied. B7 itself remains not started and must still prove zero live compatibility consumers before deletion.

## Implementation

`src/app/interface-theme-integrity.css` remains the final compatibility layer after all migrated Interface System layers.

The Practice recommendation is explicitly classified as a Guidance surface in that final layer:

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
- requires the Practice `REV recommends` surface to have an explicit semantic contract in the final compatibility layer.

### 2. Browser-wide rendered integrity sweep

`tests/e2e/site-theme-integrity.spec.ts` audits Home, Plan, Progress, Subjects, Subject Home, course Overview, Learn, Practice, Exam Prep, expanded paper content, course Progress, REV and Account/Profile/Settings in Dark mode.

The generic descendant scan remains useful for broad regression detection, but it is not treated as sufficient for material conditional states.

### 3. Material-state assertions

Practice has a named state assertion that requires the real `REV recommends` card to be visible and verifies its computed values against the actual runtime semantic tokens:

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

## B7 hand-off

The pre-B7 production-verification condition is complete on current `main` at merge `6a40afc95dabd55d0a76a758ea722d5108c571ea`.

B7 must still:

- begin from the then-current `main`;
- inventory compatibility aliases and legacy CSS consumers;
- prove zero live dependency before each deletion class;
- preserve current light/dark semantics and material-state assurance;
- run the normal risk-appropriate regression and current-main integration checks; and
- avoid treating compatibility removal as permission to redesign product surfaces.

A separate holistic Design Acceptance Review may run alongside this hand-off. Unless governance explicitly changes, that review does not silently redefine the existing B7 technical gate.

## Documentation impact

This record now closes the implementation/assurance checkpoint using observed PR #126 production evidence. It does not alter product behaviour, brand authority, routes, data contracts or evidence semantics. No normative product/brand amendment or ADR is required.

Historical findings from PR #125 remain historically true and have not been rewritten.