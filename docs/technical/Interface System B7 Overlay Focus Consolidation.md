# Interface System B7.3 — Overlay and Focus Consolidation

**Status:** Implemented on governed branch; pending PR validation and Founder-approved merge  
**Date:** 23 August 2026  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`, `10-product-governance/Global Learner Navigation.md`  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Acceptance evidence:** `audits/2026-08-23-design-acceptance-review.md` — DAR-014 and the overlay-related subset of DAR-002  
**Parent cleanup:** Issue #137 — Task 1 / B7 foundation cleanup

## Purpose

B7.3 consolidates modal and drawer keyboard/focus behaviour into the shared Interface System so feature code no longer implements partial or conflicting focus contracts.

The increment is deliberately behavioural and structural. It does not redesign pages, change learner content, alter routes, change exam evidence semantics, or expand product scope.

## Shared overlay contract

`src/app/ui/overlays.tsx` now owns the reusable modal/drawer interaction contract for `ModalShell` and `DrawerShell`:

- initial focus moves into the opened overlay, using a consumer-supplied selector when one is required;
- `Tab` and `Shift+Tab` are contained inside the active dialog;
- focus attempts outside the active dialog are redirected back into it;
- `Escape` invokes the consumer's `onDismiss` contract where dismissal is allowed;
- background interface branches are made `inert` while the dialog is active;
- document body scrolling is locked while modal/drawer work is active;
- focus is restored after close, including responsive cases where the original trigger DOM node is replaced and a stable return-target selector is required; and
- active-dialog stacking prevents a closing overlay from stealing focus from a newly opened overlay.

`OverlayBackdrop` is excluded from keyboard tab order and is marked as an overlay backdrop so background inertness does not disable the governed pointer-dismiss target.

The shared shell owns interaction and surface semantics. Feature/channel CSS continues to own legitimate placement and composition; B7.3 removes the old reusable CSS rule that could override consumer positioning.

## Migrated consumers

### PlannerRuntime — Ask REV

The contextual Ask REV panel now consumes `DrawerShell` and `OverlayBackdrop` rather than constructing raw dialog semantics locally.

- initial focus targets the REV prompt input;
- Escape, containment, background inertness, scroll lock and focus restoration come from the shared contract;
- the close action now uses `IconButton` + the controlled `close` icon; and
- responsive focus return resolves to the visible desktop or mobile Ask REV launcher.

No REV route or conversation behaviour changes.

### PlannerRuntime — mobile navigation drawer

The mobile navigation drawer now consumes `DrawerShell` and `OverlayBackdrop`.

- initial focus targets the close control;
- the previous local body-scroll/Escape effect is removed;
- the close action now uses `IconButton` + `Icon`; and
- the account disclosure chevron now uses the controlled `chevron-right` icon.

Navigation destinations, account disclosure and responsive information architecture are unchanged.

### AccountModal

The account modal's local focus-trap/Escape/focus-return implementation is removed. It now consumes `ModalShell` and `OverlayBackdrop` and uses the controlled close `IconButton`.

The existing Profile/Settings content and update behaviour are unchanged. When the menu item that launched the modal no longer exists, focus returns to the stable visible account/menu launcher rather than falling back to the document.

### ExamSimulator — Pause and Stop

The existing Pause and Stop interruption cards now consume `ModalShell` while retaining the existing full-screen interruption composition.

- Pause initially focuses **Continue exam**;
- Stop confirmation initially focuses **Continue exam**;
- Escape resumes/cancels the interruption rather than discarding the attempt;
- the underlying timed exam is inert while the interruption is active; and
- focus returns to the Pause/Stop launcher on dismissal.

Timer accounting, answer state, self-marking, evidence persistence and stop-confirm semantics are unchanged.

## Controlled glyph ownership

B7.3 removes the recurring raw `×` close glyphs in the migrated learner/account overlays and the raw mobile account `›` chevron, replacing them with the existing controlled `Icon`/`IconButton` system.

This is **not** a claim that all recurring glyph debt is retired. The local `RevWordmark()` reconstruction and any remaining copied control anatomy/glyphs remain B7.4 scope.

## Assurance

`tests/e2e/overlay-focus.spec.ts` adds browser-level proof across the configured phone, tablet and desktop Playwright projects for:

- initial focus;
- forward and reverse tab containment;
- Escape dismissal;
- background inertness;
- body scroll locking;
- focus return for Ask REV and the mobile drawer; and
- the Pause/Stop exam interruptions without loss of the active exam state.

Existing responsive learner-journey assurance remains in force. B7.3 is a Level 3 shared-runtime/interface change under `50-engineering-standards/Testing & Assurance Standard.md`, so the PR must also pass the normal full relevant CI/build/browser regression before it can be considered merge-ready.

## Documentation impact

This increment implements existing accessibility, interaction and navigation authority. It does not change normative product/brand policy, so no authority amendment or ADR is required.

Updated technical records in the same governed change:

- `docs/technical/Interface System Component Registry.md`;
- `docs/technical/Interface System Implementation.md`;
- `INDEX.md`; and
- this B7.3 implementation record.

Historical audits remain point-in-time evidence and are not rewritten.

## Remaining B7 work

B7.3 does not close Issue #137.

The next bounded work remains:

1. **B7.4 — remaining identity/component ownership:** replace the shell-local `RevWordmark()` with the canonical `BrandAsset`, then reconcile remaining copied common control anatomy and recurring glyphs.
2. **B7.5 — final compatibility retirement and acceptance gate:** inventory compatibility consumers, remove proven-dead legacy CSS, reduce/remove `interface-theme-integrity.css`, add the bounded Light/Dark screenshot regression set, reconcile stale B7 technical records and rerun Design Acceptance.

Issue #137 should close only after those remaining acceptance conditions are proven.