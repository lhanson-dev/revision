# Adaptive Revision Planner Implementation

**Status:** Implemented on `main` — FI-001  
**Owner:** Product / Engineering  
**Canonical product surface:** `/app/` React/Vite learner runtime, published under GitHub Pages as `/revision/app/`  
**Governed product authority:** `10-product-governance/Adaptive Revision Planning.md`

## Purpose

Record the current implementation truth for FI-001 Adaptive Revision Planning in the canonical learner runtime. Normative planner behaviour remains governed by `10-product-governance/Adaptive Revision Planning.md`; this document describes how that authority is currently implemented.

## Canonical runtime and route

The authenticated learner product is the React/Vite application at `/app/`, published under GitHub Pages as `/revision/app/`.

Current implementation entry points include:

- `src/app/navigation.ts` — learner route model and hash-route parsing;
- `src/app/PlannerRuntime.tsx` and `src/app/App.tsx` — learner shell, Home, Plan, REV and shared learner experience;
- `src/engine/planning/**` — deterministic planning domain logic;
- `src/services/planning/**` — planner persistence adapters and loading/saving boundaries;
- `supabase/migrations/**` — version-controlled learner planner persistence and protected Admin aggregates.

The retired static learner runtime and legacy/compatibility surfaces are not implementation targets.

## Implemented product behaviour

FI-001 is live in the canonical learner runtime with five primary destinations:

- Home;
- Plan;
- REV;
- Progress;
- Subjects.

On mobile, the same five destinations remain persistently available, with REV in the centre and given the governed visual prominence.

### Home

Home is led by REV and answers the immediate question **What matters today?**. When planner context is available, Home presents the current recommendation and a smaller Today’s Plan summary rather than a static timetable.

### Plan

`#/plan` is the wider adaptive-programme surface. It presents the learner’s current programme using their latest assessments, capacity, learning evidence and bounded planning preferences.

The plan is recalculated rather than maintained as a task-debt ledger. Missed work creates new planning information; it is not mechanically moved forward as overdue work.

### REV

REV receives structured planner context and can explain why work is being recommended, discuss learner priorities and apply bounded temporary planning preferences. REV does not own the scheduling calculation and does not turn preferences into mastery or readiness evidence.

## Deterministic planning core

Planning authority lives in pure TypeScript domain logic under `src/engine/planning/**`, not in an LLM call.

The planner currently consumes context including:

- active assessments and dates;
- assessment importance and scope;
- normal revision capacity and date-specific exceptions;
- specification/course work candidates;
- learning evidence, coverage, readiness and evidence confidence;
- recent planner/activity state; and
- bounded learner planning preferences.

It produces ordered priority candidates, current-plan items, capacity state, structured reason codes and calculation metadata.

The implementation uses an explainable weighted heuristic rather than a trained planning model. Versioned implementation parameters are tested and are not shown to learners as scores.

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

Learner-facing UI/REV translates these into plain language.

## Capacity and prioritising state

The engine compares remaining useful work with realistic remaining capacity. When useful workload materially exceeds capacity, Revision enters a calm `prioritising` state and concentrates on the highest-value candidates rather than presenting an impossible full-coverage timetable.

Workload estimates are deliberately coarse. They are not represented as precise predictions of study time.

## Recalculation behaviour

The current implementation can recalculate after material changes including:

- assessment create/edit/archive;
- availability changes;
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

The current plan remains derived state. Revision persists the learner/context inputs and relevant activity state, then recomputes planning outputs.

Production verification on 2026-08-19 confirms the planner tables are present. Automated database/RLS CI can recreate the migration chain and verifies the declared owner-isolation controls. Browser/client persistence-reload remains an identified assurance gap rather than being overstated as fully covered.

## Activity and evidence boundary

Planner activity supports states such as offered, started, meaningfully engaged, completed and chosen alternative.

Planner events and preferences are planning/behaviour context only. They do not become mastery/readiness evidence simply because an item was opened, selected or completed. Learning evidence must come through the governed evidence model.

## Admin and operational evidence

Planner operational evidence is exposed through protected server-side paths. `planner-operations` is deployed in production with JWT verification, and privileged planner aggregates are not executable by browser roles.

Current Admin/Founder Assurance can surface planner coverage and operational evidence without treating missing telemetry as Healthy.

## Assurance implemented

FI-001 is high-risk because it touches shared learner navigation, persisted learner data, deterministic guidance and protected operational evidence.

Current repeatable assurance includes:

- unit tests for planner prioritisation/capacity/reason behaviour;
- planner model tests;
- responsive Playwright coverage across Home / Plan / REV and existing learner journeys;
- isolated database migration replay and pgTAP RLS/privilege assurance;
- production backend-readiness checks for the required planner database contract and protected Edge Functions;
- typecheck, lint, unit tests and production build in GitHub Actions.

The Assurance Coverage Register deliberately retains Partial/Uncovered states for evidence that is not yet proven at the required layer, including:

- database-backed planner setup/reload/replan integration;
- learner evidence persistence/reload through the real client boundary;
- authorised Edge Function success-path integration;
- automated accessibility coverage; and
- exact CI → approved merge → deployment → smoke lineage correlation.

## Current production readiness

The production `revision_release_readiness()` contract reports `planner-v1` and `ready: true`. Required planner schema capabilities and protected operational functions are present.

The readiness RPC has been least-privilege hardened to `SECURITY INVOKER`, and repository migration history is reconciled with the production Supabase migration ledger.

This proves required backend capability presence; it does not replace end-to-end persistence, security or journey assurance.

## Documentation impact

This document is implementation truth only. Any future change to what the planner **should** do must first update the relevant normative product authority. Any material implementation change must keep this document, README, deployment configuration and the Assurance Coverage Register aligned in the same governed branch/PR where required.
