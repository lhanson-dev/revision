# Interface System B3 — Subjects and Course Migration

**Status:** live via PR #118  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Depends on:** B2.5 reusable interface foundation merged by PR #116  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

Migrate the canonical Subjects, Subject Home and course/specification presentation onto the approved Revision Interface System without changing catalogue semantics, evidence, routes, content placement, entitlement or learner-progress logic.

## Scope

B3 covers the visual and interaction grammar for:

- Subjects catalogue;
- Subject Home;
- course/specification overview;
- course/component navigation;
- REV recommendation surfaces within these screens;
- topic/specification-area lists; and
- the shared controls used by these surfaces.

Learn, Practice and Exam Prep working experiences remain B4/B5 scope.

## Production implementation

`src/app/interface-subjects-course.css` is the dedicated B3 migration layer. It is loaded after the legacy feature styles so the canonical runtime receives the governed semantic roles while compatibility CSS remains available for still-unmigrated surfaces.

The migration replaces legacy page-local visual decisions with:

- semantic light/dark surface roles;
- approved responsive typography roles;
- the governed 4px spacing rhythm;
- controlled radius and elevation roles;
- Calm Teal action roles with the approved action foreground;
- accessible focus treatment;
- feature-surface treatment for REV recommendations;
- responsive subject/topic layout; and
- reduced-motion handling.

The B3 layer contains no local hex, RGB or RGBA palette values. Colour translation remains owned by `brand-tokens.css`.

PR #118 merged to `main` as merge commit `d44cdd85c1a175c1bc595527a0b50d98f90a9cee`. Exact-head assurance passed before merge, Founder approval evidence was recorded through the governed gate, and the post-merge `revision/path-to-live` verification completed successfully on the merge commit.

## Intentional compatibility boundary

B3 does not perform a large extraction of the legacy `App.tsx` renderer simply for structural purity. The canonical subject/course routes remain served through the compatibility `App` path inside `PlannerRuntime`.

This is deliberate:

- the user-facing canonical routes are unchanged;
- the migration changes presentation rather than learning/evidence behaviour;
- the reusable B2.5 registry is available for new/extracted components;
- compatibility retirement remains B7 and requires zero-live-consumer evidence before deletion.

Future structural extraction should occur when it reduces real complexity or is required by later work, not merely to create churn.

## Assurance completed

B3 extends `scripts/assurance/interface-system-governance.test.mjs` so the migration layer is subject to the same enterprise-consistency controls as Plan/Progress and reusable UI components.

The governed path-to-live established successful coverage for:

- typecheck;
- lint;
- unit/component tests;
- interface-system governance tests;
- production build;
- responsive browser coverage for Subjects, Subject Home and course overview on phone/tablet/desktop;
- light/dark verification;
- keyboard/focus checks; and
- regression confirmation that catalogue, routing, evidence and learning-state semantics are unchanged.

## Documentation impact

This increment implements existing authority. It does not change the Visual Brand System, Product UX Principles, Information Architecture or course/content placement authority, so no normative authority amendment or ADR was required.

B3's implementation-state records were maintained with the governed change. This document is current implementation truth and may be updated to reflect production state; historical audits and decision evidence remain unchanged.
