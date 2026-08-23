# Interface System B7.4 — Identity and Glyph Consolidation

**Status:** Implemented on governed branch; pending PR assurance and Founder-approved merge  
**Date:** 23 August 2026  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Identity Asset Usage Rules.md`, `20-brand-and-experience/Product UX Principles.md`  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Acceptance evidence:** `audits/2026-08-23-design-acceptance-review.md` — identity/glyph portions of DAR-002, DAR-008, DAR-010 and DAR-015  
**Parent cleanup:** Issue #137 — Task 1 / B7 foundation cleanup

## Purpose

B7.4 removes clearly reusable identity and control drawings that were still owned locally by learner-shell, Home, Account and Exam composition code.

The objective is ownership consolidation, not a page redesign. Revision should display the same intended actions and journeys while canonical identity and recurring controls come from the approved shared sources.

## Scope delivered

### Canonical learner-shell wordmark

`src/app/PlannerRuntime.tsx` no longer reconstructs REV with local text spans and three hand-built E bars.

Desktop sidebar, mobile top bar and mobile navigation drawer now consume:

```tsx
<BrandAsset asset="wordmark" ... />
```

The wordmark uses the existing theme-paired canonical package and is rendered at the governed 160px minimum digital size. Navigation behaviour is unchanged.

### Account section icons

`src/app/AccountModal.tsx` no longer maintains a local `AccountSectionIcon` SVG family.

Profile and Settings use the existing shared `user` and `settings` icon jobs, preserving the same section navigation and accessible labels.

### Home recurring controls and REV identity

`src/app/PlannerHomeScreen.tsx` removes raw text glyphs used as reusable action/navigation decoration:

- send `↑` → shared `arrow-up` icon;
- disclosure/navigation `›` → shared `chevron-right` icon;
- route `→` → shared `arrow-right` icon.

The decorative `✦ REV recommends` treatment and the arrow inside a REV-style halo are also removed. Where the visual represents REV itself, Home now uses the existing governed `RevPresence` treatment rather than inventing an alternate REV mark.

Activity-type task markers in Today's plan remain domain/composition-specific and are not silently reclassified as general-purpose product icons by this increment.

### Exam resume control

The Exam pause interruption keeps its existing Continue exam behaviour but replaces the Unicode `▶` symbol with the controlled `play` icon.

No timer, pause accounting, stop-confirm, answer, marking or evidence semantics change.

### Shared icon registry

`src/app/ui/Icon.tsx` adds:

- `arrow-up`; and
- `play`.

Both use the existing `currentColor`, rounded-line and central-size/stroke contract.

## Assurance

`src/app/PlannerRuntime.tsx` remains protected by `scripts/assurance/b7-shell-icon-ownership.test.mjs`, now extended to fail if the local `RevWordmark()` reconstruction returns or if the shell stops consuming `BrandAsset`.

`scripts/assurance/b7-identity-glyph-ownership.test.mjs` additionally fails closed if:

- Account recreates a local Profile/Settings SVG family;
- Home restores the retired raw recurring action glyphs or alternate REV recommendation marks;
- Exam restores the Unicode play glyph; or
- the `arrow-up` / `play` jobs disappear from the controlled icon registry.

The PR remains subject to the normal risk-based Revision CI, including typecheck, lint, unit/static assurance, production build and the relevant phone/tablet/desktop browser suite.

## Behaviour and risk

This is a shared-interface/identity consolidation. User-facing behavior should remain materially unchanged: the same shell destinations, Home actions, Account sections and Exam resume action remain available in the same contexts.

The visible difference is limited to use of the approved canonical wordmark/REV presence and consistent rounded-line control icons instead of locally reconstructed or Unicode glyphs.

No route, planner logic, recommendation scoring, authentication, authorization, evidence, entitlement, persistence or backend contract changes.

## Deliberately excluded

B7.4 does not claim overall B7 completion. It does not:

- redesign Learn/Admin composition or resolve broader copied common-component anatomy;
- resolve the Design Acceptance nested-card density finding;
- resolve the mobile persistent Ask REV dock overlap/suppression findings;
- retire legacy/compatibility CSS or `interface-theme-integrity.css`;
- perform the final Light/Dark screenshot acceptance gate; or
- rewrite the historical Design Acceptance Review.

Those remaining acceptance conditions must be reconciled before Issue #137 can close.

## Documentation impact

This increment implements existing brand, identity and interface authority. No normative authority amendment or ADR is required.

Updated in the same governed change:

- `docs/technical/Interface System Component Registry.md`;
- `docs/technical/Interface System Implementation.md`;
- `INDEX.md`; and
- this B7.4 implementation record.

Historical audit evidence remains unchanged.
