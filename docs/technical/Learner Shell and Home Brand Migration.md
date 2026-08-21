# Learner Shell and Home Brand Migration

**Status:** implementation evidence for Brand System Increment B

## Purpose

Record the first learner-surface migration onto the approved Revision Brand System after Brand Token / REV Motion Increment A.

This increment applies the approved visual system to the canonical signed-in learner shell and conversation-first Home and implements the Founder-confirmed responsive REV access distinction: mobile keeps REV in persistent navigation, while desktop uses contextual floating Ask REV access.

## Authority

The implementation follows:

- `20-brand-and-experience/Visual Brand System.md`;
- `20-brand-and-experience/REV Responsive Access Pattern.md`;
- `20-brand-and-experience/Identity Asset Usage Rules.md`;
- `10-product-governance/Information Architecture.md`;
- `20-brand-and-experience/Product UX Principles.md`; and
- `docs/technical/Brand Tokens and REV Motion Implementation Plan.md`.

The responsive REV access rule is a deliberate Founder-approved refinement to the earlier v0.9 desktop treatment; the Living E identity, Calm Teal foundations and REV motion contract are unchanged.

## Scope

### Learner shell

The learner-wide jobs remain Home, Plan, REV, Progress and Subjects, but their navigation treatment is responsive.

Desktop top navigation contains:

1. Home
2. Plan
3. Progress
4. Subjects

REV is intentionally absent from desktop top navigation. Instead, a floating **Ask REV** control is available at the right-hand side of non-Admin learner screens. Opening it keeps the current screen visible and opens a contained contextual chat panel.

Mobile and supported tablet widths continue to use a fixed five-item bottom navigation:

1. Home
2. Plan
3. REV
4. Progress
5. Subjects

REV remains the differentiated centre Living E destination on mobile/tablet.

The shell migration:

- uses the canonical full Revision wordmark SVG in desktop and mobile top chrome instead of visually presenting a reconstructed text lock-up;
- swaps automatically between the approved light and dark wordmark variants;
- uses role-based Calm Teal tokens from `src/app/brand-tokens.css`;
- uses approved 44px control targets, 14px control radii and restrained Flat/Raised depth;
- keeps the rounded-line navigation icon language;
- preserves an elevated Living E treatment for the centre mobile REV destination;
- adds a desktop floating Ask REV control and right-side conversation panel;
- closes the desktop REV panel on Escape or route change; and
- preserves keyboard, touch and visible-focus behaviour.

The existing code-built REV lock-up remains in the DOM as a hidden fallback inside the brand button during this migration. It is not the presented production identity.

### Contextual desktop REV

The desktop Ask REV panel reuses the existing governed REV planning conversation rather than creating a second assistant.

The panel receives the current route context from `PlannerRuntime`:

- Home, Plan, Progress and Subjects expose their learner-wide screen context;
- Subject, course and component routes pass the current subject ID;
- course/component routes also expose the focused section label; and
- when the current route already identifies a subject, REV may use that subject as the conversation target without forcing the learner to type its name again.

The implementation does not fabricate context it does not know. Existing planner/evidence limitations remain in force.

### Home

Home remains conversation-first and preserves the governed greeting pattern:

`Hey {first name}, what shall we do today?`

`{first name}` is resolved from the signed-in learner identity by `PlannerRuntime`; names used in design concepts and browser fixtures are examples only and are not hard-coded product copy.

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
- `src/app/desktop-rev-access.css` — desktop floating Ask REV and contextual panel treatment.
- `src/main.tsx` — loads the Increment B visual layers after the existing brand and Living E styles.
- `src/app/PlannerRuntime.tsx` — owns responsive global navigation, current-route REV context and the desktop Ask REV panel.
- `src/app/PlannerRevScreen.tsx` — supports the existing full REV route plus an embedded context-aware panel mode.
- `src/app/PlannerHomeScreen.tsx` — continues to own the conversation-first Home and receives the resolved learner first name.
- `tests/e2e/learner-shell-home-brand.spec.ts` — dedicated responsive, context and theme assurance for this increment.

Canonical identity assets are consumed from `assets/brand/exports/`; they are not redrawn in the learner implementation.

## Assurance

The Increment B browser checks cover:

- canonical Revision identity presentation in the shell;
- desktop Home / Plan / Progress / Subjects top-navigation hierarchy with no REV top-nav item;
- desktop floating Ask REV visibility and contextual panel behaviour;
- preservation of the current route while the desktop REV panel is open;
- tablet and phone five-item Home / Plan / REV / Progress / Subjects bottom navigation;
- centre mobile REV presence and touch sizing;
- personalised conversation-first Home greeting pattern and REV prompt;
- four supporting quick actions and line-icon treatment;
- light/dark theme continuity and Primary Teal action contrast;
- absence of horizontal page overflow at representative desktop, tablet and phone widths; and
- continued reliance on the Increment A reduced-motion and REV-state assurance.

The ordinary repository CI suite remains the merge gate. A failure in build, typecheck, lint, unit tests, browser assurance or protected-service/database checks blocks completion.

## Follow-on boundary

This increment deliberately stops at the learner shell and Home plus the cross-shell desktop REV access pattern. Subsequent governed migrations should apply the same token/component system to the dedicated REV conversation surface, Plan/Progress, Subjects/course navigation and focused Learn/Practice/Exam Prep surfaces in controlled increments.

Legacy compatibility aliases and older prototype CSS are not removed merely because this surface is migrated. Removal requires repository-wide evidence that no live consumer remains.
