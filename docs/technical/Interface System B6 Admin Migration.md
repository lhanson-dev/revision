# Interface System B6 — Admin Migration

**Status:** in progress on governed B6 branch  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `docs/technical/Interface System Operating Standard.md`  
**Depends on:** B5 Exam Prep/exam experience live via PR #121  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → role-gated compatibility `App` → Admin routes

## Purpose

Migrate Revision Admin and operations surfaces onto the approved Interface System without changing operational metrics, authorization, assurance semantics, Content Factory behaviour or backend service contracts.

Admin remains recognisably Revision but is deliberately denser than the learner product. The governing Brand System requires functional, restrained operations UI where tables are first-class, compact controls are allowed where useful, Primary Teal denotes action/selection rather than decoration, and Unknown remains visibly distinct from Healthy.

## Canonical Admin surfaces

B6 covers the role-gated Admin capabilities served inside the canonical learner runtime:

- `#/admin` — Operations Dashboard;
- `#/admin/users` — Users;
- `#/admin/activity` — Learning Activity;
- `#/admin/health` — System Health;
- `#/admin/assurance` — Founder Assurance;
- `#/admin/content` — Content Operations; and
- planner-specific assurance where exposed by the current Admin implementation.

There is no separate Admin application bootstrap. Admin is a protected secondary utility within the same runtime.

## Existing behaviour preserved

B6 does not alter:

- database-backed admin role ownership;
- browser role-gating or server-side re-authorization;
- aggregate operational metric definitions;
- learner/test/admin account exclusion rules;
- Healthy / Attention needed / Unknown semantics;
- Assurance Coverage Register projection;
- defect evidence semantics;
- Content Factory intake or job-state logic;
- planner assurance meaning;
- learner evidence, persistence or recommendation behaviour; or
- release/deployment architecture.

The migration is presentational and implementation-governance work, not a new product feature.

## Admin / operations visual contract

The B6 layer follows the active Brand System Admin profile:

- Manrope typography from central roles;
- neutral and Soft Surface foundations;
- compact readable hierarchy using Body S / Caption roles where density helps;
- Primary Teal for action, selected state and neutral chart/progress emphasis;
- standard semantic Success / Warning / Error roles for operational meaning;
- Unknown using neutral roles, never success styling;
- first-class tables with compact grouping and sticky headings where useful;
- 36px compact controls in dense pointer/keyboard contexts, with 44px controls retained where touch use requires it;
- 48px standard form fields;
- restrained surface depth with borders rather than decorative shadows; and
- no Living E halo except where a real REV/AI function exists.

## Implementation

`src/app/interface-admin.css` is the bounded B6 migration layer. It loads after legacy Admin/Founder Assurance styles and after the previous Interface System increments.

It migrates:

- Admin page headings and refresh actions;
- Admin section navigation;
- system-health summary and status badges;
- operational metric cards;
- Needs attention and other operational panels;
- definition lists and trends;
- Content Operations forms and feedback;
- first-class operational tables with sticky headings;
- health-check rows;
- Founder Assurance summary cards;
- assurance coverage badges and tables;
- Planner Assurance panels;
- mobile/tablet/desktop layout;
- keyboard-visible focus; and
- reduced-motion behaviour.

The layer contains no local hex, RGB or RGBA palette values. It consumes the existing semantic colour, typography, spacing, radius, elevation, control, status, focus and motion roles in `brand-tokens.css`.

Legacy Admin CSS remains temporarily available beneath the B6 layer so B7 can retire compatibility only after repository-wide zero-live-consumer assurance.

## Responsive behaviour

Admin remains operationally useful across supported sizes rather than becoming desktop-only:

- desktop may use denser multi-column summaries and wide first-class tables;
- tablet reduces summary density while retaining evidence and controls;
- mobile stacks summary groups, provides full-width primary utility controls, and keeps wide operational tables inside explicit table scroll containers rather than creating horizontal page overflow;
- touch targets remain appropriate on constrained devices even where compact desktop controls are permitted.

## Assurance required before Founder merge approval

B6 requires:

- exact canonical route/runtime confirmation;
- typecheck;
- lint;
- unit/component tests;
- Interface System governance assurance including `interface-admin.css`;
- no-local-palette assurance;
- production build;
- existing Admin operations browser journey assurance;
- responsive phone/tablet/desktop Admin assurance;
- light/dark semantic-role verification;
- table overflow/sticky-header regression checks;
- keyboard/focus/accessibility checks;
- Content Operations form/error/success regression checks;
- Founder Assurance truthfulness regression checks;
- protected Admin service/database assurance from the normal CI suite; and
- current-main integration before merge.

After merge, `revision/path-to-live` must succeed on the resulting merge commit before B6 is described as live.

## Documentation impact

B6 implements existing Visual Brand System and technical Interface System authority. It does not change what Admin should report, who may access it or how protected data is authorised, so no normative authority amendment or ADR is required.

This record, the Interface System implementation record, B5 production-state record and `INDEX.md` are maintained with the change. The public reusable component registry does not change because B6 introduces no new cross-product component family, icon source or identity asset. Historical audits/research are not rewritten.