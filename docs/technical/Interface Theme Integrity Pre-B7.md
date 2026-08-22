# Interface Theme Integrity — Pre-B7

**Status:** production baseline live via PR #124; site-wide integrity follow-up in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0, `50-engineering-standards/Testing & Assurance Standard.md` and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** close light/dark visual gaps and make site-wide theme regressions automatically detectable before compatibility retirement

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 can prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translate between light and dark modes, but several older compatibility styles still contain literal light-mode foregrounds and backgrounds.

The first production hardening pass shipped through PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227`. Founder production review then identified remaining course-page defects. PR #124 / merge `66e9213ac3e4b3815e27039fb7c264fafd1496bd` corrected course Overview and Exam Prep paper surfaces and is production-live with `revision/path-to-live = success`.

A further production review identified that Practice and Exam Prep still contained wrong dark-mode styling. The root cause is broader than those two screens: `guidance.css` remained a live shared stylesheet with light-only recommendation/technique surfaces and fixed slate text. Descendant selectors could therefore override otherwise-correct semantic B4/B5 parent styling.

This proves that selector-specific browser checks are insufficient as the primary theme-integrity control. The required control is site-wide: all live theme-capable surfaces must be classified, shared active styling must use semantic roles, and browser assurance must inspect the rendered application rather than only selected cards.

The unauthenticated `AuthGate` surface is part of the same site contract. Sign-in, account creation, loading and password-recovery surfaces now consume the same central theme tokens and stored/system theme selection as the authenticated application instead of remaining on a separate light-only styling path.

This follow-up does not retire compatibility CSS. B7 remains responsible for retirement after zero-live-consumer assurance.

## Implementation

`src/app/interface-theme-integrity.css` remains the final compatibility layer after all migrated Interface System layers.

`src/app/guidance.css` is now treated as active shared interface styling rather than unclassified legacy presentation. Its Practice recommendation and Exam Prep technique surfaces use central semantic roles for:

- surface and quiet-surface backgrounds;
- primary and secondary text;
- borders;
- action/accent treatment;
- typography roles;
- spacing and radius roles; and
- technique guidance callouts.

The file no longer carries its former local white/light-green/slate palette.

`src/app/auth-entry.css` is likewise migrated onto semantic roles. `src/app/brand-tokens.css` now exposes the same theme foundations to `.auth-shell` and `.loading-shell`, and `AuthGate` resolves the existing `revision:theme` preference (falling back to the operating-system colour scheme) before rendering signed-out or recovery UI.

## Site-wide assurance model

Theme integrity is now protected by two complementary automated controls.

### 1. Static style-governance gate

`scripts/assurance/site-theme-integrity.test.mjs`:

- requires shared `guidance.css` and `auth-entry.css` to contain no local hex/RGB/RGBA palette;
- verifies their use of central semantic surface/text/action/border roles;
- enumerates every stylesheet loaded by the canonical runtime;
- requires every loaded stylesheet to be either a governed semantic layer or explicitly classified compatibility debt; and
- verifies the final compatibility integrity layer remains last in the authenticated semantic cascade.

This prevents a new unclassified page stylesheet or a new local palette from silently entering the runtime.

### 2. Browser-wide rendered integrity sweep

`tests/e2e/site-theme-integrity.spec.ts` boots the canonical application directly in Dark mode and audits the rendered DOM across the principal live learner/application surfaces:

- Home;
- Plan;
- Progress;
- Subjects;
- Subject Home;
- course Overview;
- Learn;
- Practice;
- Exam Prep;
- expanded Exam Prep paper content;
- course Progress;
- REV; and
- Account Profile / Settings overlays.

The sweep examines visible descendants, not only top-level cards. It fails if known legacy light-only backgrounds or legacy dark/slate text values reappear in the dark runtime. This directly covers the class of defect that escaped PRs #123 and #124, including child text selectors inside recommendation and technique surfaces.

`tests/e2e/admin-theme-integrity.spec.ts` applies the same rendered descendant audit across Admin dashboard, Users, Activity, System Health, Founder Assurance and Content Operations.

`tests/e2e/auth-entry.spec.ts` now verifies Dark-mode sign-in and account creation against the central theme contract and scans those rendered descendants for the same legacy light/background and text leaks. Password recovery shares the same `auth-shell`/`auth-card` implementation and token boundary.

## Existing targeted assurance retained

The earlier route-specific checks remain useful as focused diagnostics:

- `tests/e2e/interface-system.spec.ts` validates Account theme switching and semantic overlay/field roles;
- `tests/e2e/course-dark-theme.spec.ts` validates course Overview and Exam Prep paper semantic roles;
- B4/B5/browser suites continue to exercise Practice and Exam behaviour;
- Admin behaviour remains covered separately from its theme-integrity sweep; and
- responsive assurance runs across representative phone, tablet and desktop projects.

The site-wide sweep supplements these tests; it does not replace targeted behavioural assurance.

## Production evidence

- B6 Admin: PR #122 / merge `e10aed1e05ca173e8e87e75b1b3d909d4c39451d` / `revision/path-to-live = success`.
- Initial pre-B7 theme hardening: PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227` / `revision/path-to-live = success`.
- Course-page dark-mode follow-up: PR #124 / merge `66e9213ac3e4b3815e27039fb7c264fafd1496bd` / `revision/path-to-live = success`.
- Site-wide integrity follow-up: governed branch `fix/site-wide-theme-integrity`; production evidence pending exact-head assurance, Founder approval, merge and path-to-live verification.

## Documentation impact

This is implementation and assurance hardening of already-approved dual-theme visual authority and the existing Testing & Assurance Standard. No normative product/brand authority change or ADR is required.

The technical checkpoint is updated because repeated production findings exposed an assurance-design gap: broad theme correctness must be proved by site-wide rendered inspection plus static style classification, not inferred from selected component checks.

Historical PR evidence is unchanged. B7 must not begin compatibility deletion until this site-wide follow-up is merged and production-verified, then its zero-live-consumer dependency scan must run against the resulting `main`.
