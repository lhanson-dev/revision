# Learner Shell and Home Brand Migration

**Status:** implementation evidence for Brand System Increment B

## Purpose

Record the first learner-surface migration onto the approved Revision Brand System after Brand Token / REV Motion Increment A.

This increment applies the existing visual authority to the canonical signed-in learner shell and conversation-first Home. It does **not** change product behaviour, information architecture, planner logic, REV capability, evidence semantics or the approved REV motion timings.

## Authority

The implementation follows:

- `20-brand-and-experience/Visual Brand System.md`;
- `20-brand-and-experience/Identity Asset Usage Rules.md`;
- `10-product-governance/Information Architecture.md`;
- `20-brand-and-experience/Product UX Principles.md`; and
- `docs/technical/Brand Tokens and REV Motion Implementation Plan.md`.

No new recurring brand grammar is introduced by this increment.

## Scope

### Learner shell

The canonical `PlannerRuntime` shell retains the governed global destinations:

1. Home
2. Plan
3. REV
4. Progress
5. Subjects

Desktop continues to use persistent top navigation. Mobile and supported tablet widths continue to use a fixed five-item bottom navigation with REV in the centre. Account, theme and menu utilities remain secondary.

The shell migration:

- uses the canonical full Revision wordmark SVG in desktop and mobile top chrome instead of visually presenting a reconstructed text lock-up;
- swaps automatically between the approved light and dark wordmark variants;
- uses role-based Calm Teal tokens from `src/app/brand-tokens.css`;
- uses approved 44px control targets, 14px control radii and restrained Flat/Raised depth;
- keeps the rounded-line navigation icon language;
- preserves an elevated Living E treatment for the centre mobile REV destination; and
- preserves keyboard, touch and visible-focus behaviour.

The existing code-built REV lock-up remains in the DOM as a hidden fallback inside the brand button during this migration. It is not the presented production identity.

### Home

Home remains conversation-first and preserves the governed greeting:

`Hey {first name}, what shall we do today?`

The migration keeps the Living E, greeting and REV input as the dominant opening hierarchy, with supporting workspace content available by scrolling rather than competing above the fold.

The Home migration:

- aligns the greeting to the approved Display L hierarchy;
- keeps generous breathing room around the Living E;
- uses a 16px prompt input and a 52px Primary Teal send action with Graphite text/icon colour;
- applies approved Standard-surface radii and restrained elevation to supporting cards;
- replaces symbolic quick-action glyph presentation with the governed rounded-line icon language;
- increases supporting learner copy toward the approved readable role scale;
- retains Plan, recent-context, resource and Progress quick actions; and
- preserves existing planner guidance, Today content and evidence-derived behaviour.

## Implementation files

- `src/app/learner-shell-home.css` — Increment B shell/Home visual migration layer.
- `src/main.tsx` — loads the Increment B layer after the existing brand and Living E styles.
- `src/app/PlannerRuntime.tsx` — unchanged behavioural owner of global learner navigation and utilities.
- `src/app/PlannerHomeScreen.tsx` — unchanged behavioural owner of the conversation-first Home.
- `tests/e2e/learner-shell-home-brand.spec.ts` — dedicated responsive and theme assurance for this increment.

Canonical identity assets are consumed from `assets/brand/exports/`; they are not redrawn in the learner implementation.

## Assurance

The Increment B browser checks cover:

- canonical Revision identity presentation in the shell;
- exact Home / Plan / REV / Progress / Subjects navigation hierarchy;
- desktop top-navigation behaviour;
- tablet and phone five-item bottom navigation;
- centre REV presence and touch sizing;
- exact conversation-first Home greeting and REV prompt;
- four supporting quick actions and line-icon treatment;
- light/dark theme continuity and Primary Teal action contrast;
- absence of horizontal page overflow at representative desktop, tablet and phone widths; and
- continued reliance on the Increment A reduced-motion and REV-state assurance.

The ordinary repository CI suite remains the merge gate. A failure in build, typecheck, lint, unit tests, browser assurance or protected-service/database checks blocks completion.

## Follow-on boundary

This increment deliberately stops at the learner shell and Home. Subsequent governed migrations should apply the same token/component system to REV conversation, Plan/Progress, Subjects/course navigation and focused Learn/Practice/Exam Prep surfaces in controlled increments.

Legacy compatibility aliases and older prototype CSS are not removed merely because this surface is migrated. Removal requires repository-wide evidence that no live consumer remains.
