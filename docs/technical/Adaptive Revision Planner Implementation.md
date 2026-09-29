# Adaptive Revision Planner Implementation

**Status:** FI-001 live on `main`; Plan experience refresh live, with the 29 September 2026 task-rationale presentation refinement proposed on `fix/remove-plan-why-this`  
**Owner:** Product / Engineering  
**Canonical product surface:** `/app/` React/Vite learner runtime, published under GitHub Pages as `/revision/app/`  
**Governed product authority:** `10-product-governance/Adaptive Revision Planning.md`

## Purpose

Record the current implementation truth for FI-001 Adaptive Revision Planning in the canonical learner runtime. Normative planner behaviour remains governed by `10-product-governance/Adaptive Revision Planning.md`; this document describes how that authority is implemented, including the 27 September 2026 Plan experience refresh and the proposed 29 September 2026 removal of repeated inline task rationale text.

## Canonical runtime and route

The authenticated learner product is the React/Vite application at `/app/`, published under GitHub Pages as `/revision/app/`.

Current implementation entry points include:

- `src/app/navigation.ts` — learner route model and hash-route parsing;
- `src/app/PlannerRuntime.tsx` and `src/app/App.tsx` — learner shell, Home, Plan, REV and shared learner experience;
- `src/app/PlanScreen.tsx` — canonical `#/plan` experience;
- `src/engine/planning/**` — deterministic planning domain logic;
- `src/app/planner-model.ts` — bridge from learner evidence/assessments/availability into planner candidates and days;
- `src/services/planning/**` — planner persistence adapters and loading/saving boundaries;
- `supabase/migrations/**` — version-controlled learner planner persistence and protected Admin aggregates.

The retired static learner runtime and legacy/compatibility surfaces are not implementation targets.

## Implemented product behaviour

FI-001 is live in the canonical learner runtime. Governed learner-wide destinations are:

- Home;
- Plan;
- Progress; and
- Courses.

Ask REV is the persistent global action rather than a peer navigation destination. Desktop uses the governed left learner rail; tablet/mobile use the governed menu/drawer with the persistent Ask REV dock.

### Home

Home is led by REV and answers the immediate question **What should I do now?**. When planner context is available, Home presents the current recommendation and Today’s revision plan rather than a static timetable.

### Plan

`#/plan` is the wider adaptive-programme surface. The 27 September 2026 refresh keeps the existing learner shell and stable learner canvas but changes the internal Plan composition from equal setup/management panels to a schedule-first experience.

The refreshed Plan implementation provides:

- a compact shared learner-header Ask REV route using the existing contextual conversation layer rather than a second chat implementation;
- a plain-English **Your plan adapts as you go** explanation without exposing internal weights or treating passive activity as learning evidence;
- setup-first empty states when exams and/or recurring availability are missing;
- known course/paper choices for adding public examinations plus a secondary route for mocks/topic tests/other assessments;
- recurring Monday-Sunday realistic capacity controls;
- concise programme context for the next exam, current-week capacity and normal/prioritising state;
- secondary **Manage exams** and **Plan settings** controls once setup exists;
- **Day / Week / Month** views with **Week as the default**;
- structured recommendation reasons retained for contextual explanation through REV without repeating them beneath every Plan task;
- restrained governed subject accents for task/exam recognition; and
- an upcoming-exam milestone treatment.

The plan remains recalculated rather than maintained as a task-debt ledger. Missed work creates new planning information; it is not mechanically moved forward as overdue work.

#### View precision

The deterministic schedule supplies the near-term Day/Week views. Day is the most specific execution view. Week shows the current seven-day adaptive forecast. Month groups the following four weeks into broader subject/time focus plus exam milestones rather than rendering a falsely precise 30-day task grid.

All views are representations of the same adaptive planner, not separate manual calendars.

### REV

REV receives structured planner context and can explain why work is being recommended, discuss learner priorities and apply bounded temporary planning preferences. REV does not own the scheduling calculation and does not turn preferences into mastery or readiness evidence.

## Deterministic planning core

Planning authority lives in pure TypeScript domain logic under `src/engine/planning/**`, not in an LLM call.

The planner consumes context including:

- active assessments and dates;
- assessment importance and scope;
- recurring Monday-Sunday realistic revision capacity and date-specific exceptions;
- specification/course work candidates;
- learning evidence, coverage, readiness and evidence confidence;
- recent planner/activity state; and
- bounded learner planning preferences.

It produces ordered priority candidates, a deterministic multi-day schedule, current-day items, capacity state, structured reason codes and calculation metadata.

The implementation uses an explainable weighted heuristic rather than a trained planning model. Versioned implementation parameters are tested and are not shown to learners as scores.

### Multi-day schedule allocation

`buildAdaptivePlan()` allocates useful ranked candidates across the available planner days in deterministic priority order. Each candidate is allocated at most once in the current derived schedule. A day retains its remaining/unallocated capacity rather than being filled with invented low-value work.

`today` remains the first scheduled day's items, so Home/existing today consumers continue to use the same deterministic source rather than a separate schedule calculation.

The schedule is derived state. It is rebuilt from current assessments, evidence, availability and preferences; individual future task placements are not persisted as immutable appointments.

### Current reason vocabulary

The implemented planner uses bounded reason codes including:

- `ASSESSMENT_SOON`;
- `HIGH_IMPORTANCE_ASSESSMENT`;
- `LOW_EVIDENCE`;
- `WEAK_EVIDENCE`;
- `UNDER_COVERED`;
- `EXAM_PRACTICE_DUE`;
- `HIGH_MARK_OPPORTUNITY`;
- `ALREADY_STRONG`;
- `LEARNER_PRIORITY`;
- `COMPETING_PRIORITY`;
- `CAPACITY_CONSTRAINED`.

The reason codes remain planner truth and are available to REV for plain-language explanation. The Plan task cards themselves do not repeat a **Why this?** line beneath every entry; the page-level adaptive-plan explanation provides the routine context and REV can explain a specific recommendation when useful.

## Capacity and prioritising state

The engine compares remaining useful work with realistic remaining capacity. When useful workload materially exceeds capacity, Revision enters a calm `prioritising` state and concentrates on the highest-value candidates rather than presenting an impossible full-coverage timetable.

Workload estimates are deliberately coarse. They are not represented as precise predictions of study time.

## Recalculation behaviour

The implementation can recalculate after material changes including:

- assessment create/edit/archive;
- recurring weekly availability or date-specific exception changes;
- new validated learning evidence;
- reliable planner-linked activity completion;
- material learner planning-preference changes;
- meaningful external-revision reconciliation; and
- establishing a new local day/current-plan view.

Minor navigation events do not create learner-visible plan churn.

## Persistence

Planner persistence is implemented in Supabase using learner-owned tables including:

- `revision_assessments`;
- `revision_availability_profiles`;
- `revision_availability_exceptions`;
- `revision_planning_preferences`;
- `revision_activity_events`.

These tables reference the authenticated learner, use RLS, deny anonymous access and expose owner-scoped authenticated operations only.

### Recurring weekly availability migration

`20260927161359_add_recurring_weekly_planner_availability.sql` adds `monday_minutes` through `sunday_minutes` to the existing learner-owned availability profile. The filename is reconciled to the exact production Supabase migration-ledger version. Existing rows are backfilled from the former weekday/weekend values:

- Monday-Friday inherit `weekday_minutes`;
- Saturday-Sunday inherit `weekend_minutes`.

The legacy aggregate columns remain for backwards compatibility. New saves persist the seven daily values and refresh the aggregate compatibility values. Existing row ownership/RLS remains unchanged because the migration extends the existing protected table rather than creating a new learner-data surface.

Production enablement on 27 September 2026 verified `planner-week-v1` with `ready: true`, all seven capability checks present, the existing availability row correctly backfilled, RLS still enabled with the existing learner-owner policy, and the readiness RPC still `SECURITY INVOKER`. Pre/post Security and Performance Advisor findings were unchanged and introduced no Plan-specific finding.

The current plan remains derived state. Revision persists learner/context inputs and relevant activity state, then recomputes planning outputs.

## Activity and evidence boundary

Planner activity supports states such as offered, started, meaningfully engaged, completed and chosen alternative.

Planner events, availability and preferences are planning/behaviour context only. They do not become mastery/readiness evidence simply because an item was opened, selected, scheduled or completed. Learning evidence must come through the governed evidence model.

## Admin and operational evidence

Planner operational evidence is exposed through protected server-side paths. `planner-operations` is deployed in production with JWT verification, and privileged planner aggregates are not executable by browser roles.

Current Admin/Founder Assurance can surface planner coverage and operational evidence without treating missing telemetry as Healthy.

## Assurance implemented / required for this refresh

FI-001 is high-risk because it touches persisted learner data, deterministic guidance and protected operational evidence.

Repeatable assurance includes:

- unit tests for planner prioritisation/capacity/reason behaviour;
- unit assurance that multi-day allocation is deterministic, does not duplicate one candidate across days and leaves genuinely unused capacity visible;
- planner-model tests for distinct recurring daily capacity and date exceptions;
- responsive Playwright coverage across Plan and the existing learner shell;
- isolated database migration replay and pgTAP RLS/privilege assurance;
- authenticated Supabase persistence/reload integration;
- protected Edge-function assurance;
- production backend-readiness checks for the required planner database contract; and
- typecheck, lint, unit tests and production build in GitHub Actions.

The Plan refresh visual/browser assurance covers configured Week-view Plan and the missing-exam / missing-availability setup treatment across the governed responsive matrix. The approved Plan light/dark visual captures are pinned exactly after manual inspection rather than accepted through a broad tolerance.

PR #403 exact head `0c98256dcc2e79d7526e115058fb1daeaca30f42` passed Revision CI before the production-ledger/documentation reconciliation. Because that reconciliation changes the PR head, final merge readiness still requires fresh exact-head CI for the final candidate.

The Assurance Coverage Register retains qualified gaps that are outside this Plan change and must not be overstated as closed.

## Backend release contract

The Plan refresh advances the required production readiness contract from `plan-state-v1` to **`planner-week-v1`**.

`planner-week-v1` requires the existing learner-plan capabilities plus the seven recurring availability columns on `revision_availability_profiles`. `.github/workflows/deploy-pages.yml` expects the same contract.

Production was enabled and independently verified on 27 September 2026 before merge. The live database reports `planner-week-v1` with `ready: true`; the production migration ledger records version `20260927161359`; backfill/RLS/function posture are verified; and post-change advisor results match the preflight baseline.

Production is therefore backend-ready for the refreshed Plan release. The product change remains pending until final exact-head CI, explicit Founder merge approval, merge, governed deployment and production smoke complete.

This readiness proof confirms required backend capability presence; it does not replace end-to-end persistence, security or journey assurance.

## Documentation impact

The 29 September 2026 task-rationale presentation refinement updates the normative adaptive-planning authority, this implementation record, `PlanScreen` and configured-Plan browser assurance in the same governed change. It removes only the repeated inline rationale text from Plan task cards; structured reason codes, planner calculation, REV explanation capability, persistence, backend contracts and historical evidence are unchanged.
