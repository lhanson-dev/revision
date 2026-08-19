# Adaptive Revision Planner Implementation

**Status:** Implementation design — FI-001  
**Owner:** Product / Engineering  
**Canonical product surface:** `/app/` React/Vite learner runtime, published under GitHub Pages as `/revision/app/`  
**Governed product authority:** `10-product-governance/Adaptive Revision Planning.md`

## Purpose

Define how FI-001 Adaptive Revision Planning will be implemented in the canonical learner runtime without moving planning authority into an LLM or creating a second learner surface.

## Canonical runtime and route proof

Current approved technical authority identifies `/app/` as the permanent authenticated learner-product boundary. The GitHub Pages deployment publishes that built runtime beneath the repository Pages path as `/revision/app/`.

The current implementation entry points are:

- `src/app/navigation.ts` — learner route model and hash-route parsing;
- `src/app/App.tsx` — authenticated learner shell, Home, global navigation, REV and high-level screen routing;
- `src/engine/**` — deterministic learning/evidence/readiness domain logic;
- `src/services/**` — persistence/platform boundaries;
- `supabase/migrations/**` — version-controlled persisted learner-data changes.

The retired static learner runtime and compatibility routes are not implementation targets for FI-001.

## Implementation principles

1. **Deterministic planning core.** Priority calculation and plan generation live in a testable domain engine. REV may explain or negotiate but does not own the calculation.
2. **Persist inputs and learner actions; recompute derived plans.** Assessments, availability, learner preferences and activity events are durable inputs. The current plan can be rebuilt deterministically from those inputs plus learning evidence.
3. **Explainability is first-class data.** Planner output contains reason codes and structured evidence references so learner-facing explanations do not have to reverse-engineer opaque scores.
4. **No task debt.** Uncompleted recommendations are historical activity state, not future obligations that must be manually rescheduled.
5. **RLS by default.** All learner-owned planner data is protected by Supabase RLS and only the owning authenticated user may read/write it.
6. **Minimal behavioural telemetry.** Persist only events required for planning, assurance and useful product measurement. Do not implement active-time surveillance as part of FI-001 MVP.
7. **Daily check is reconciliation, not a batch timetable generator.** A planner recalculation may occur after material events and when the app establishes a new local day/current-plan view.

## MVP domain model

### Learner assessments

Durable record of an assessment the learner is preparing for.

Required fields:

- assessment id;
- user id;
- subject id;
- optional course/module scope ids;
- assessment type (`topic_test`, `mock`, `public_exam`, `other`);
- title;
- assessment date;
- relative importance (`normal`, `high`);
- simple scope payload;
- active/archive state;
- created/updated timestamps.

### Learner availability

Two layers:

- normal weekday/weekend capacity in minutes;
- date-specific exceptions that replace normal capacity for that local date.

Capacity is deliberately a flexible daily workload, not a start/end-time schedule.

### Learner planning preferences

Temporary learner-directed planning context created directly or through REV negotiation.

Examples:

- prefer a subject for a bounded period;
- prefer an activity type such as essay/exam practice;
- temporarily reduce a subject.

Preferences are planning context only and never become mastery/readiness evidence.

### Recommendation/activity events

Minimum event states:

- `offered`;
- `started`;
- `meaningfully_engaged`;
- `completed`;
- `chosen_alternative`.

These events support replanning and the FI-001 measurement contract. They do not imply active study minutes.

## Planner engine boundary

Create `src/engine/planning/` as a pure TypeScript domain module.

Inputs:

- current date;
- active assessments;
- learner availability;
- content/catalogue work candidates;
- coverage/mastery/readiness evidence summaries;
- evidence confidence;
- recent activity/completion;
- active learner planning preferences.

Outputs:

- ordered priority candidates;
- today's plan items;
- near-term plan outlook;
- capacity state (`normal` or `prioritising`);
- structured recommendation reasons;
- planner calculation metadata/version.

### Initial explainable reason codes

The first implementation should support a bounded reason vocabulary:

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

Reason codes are implementation metadata. The UI/REV translates them into plain learner language.

## Initial prioritisation approach

The MVP should use a transparent weighted heuristic rather than a trained model.

Candidate priority should be influenced by:

- time to assessment;
- assessment importance;
- evidence-backed weakness;
- missing/low-confidence evidence;
- under-coverage;
- exam-readiness need as an assessment approaches;
- known assessment weighting/mark opportunity where content metadata supports it;
- temporary learner preference;
- recent useful activity so the engine does not repeatedly select one area without cause.

The exact weights are versioned implementation parameters and must be covered by unit tests. They are not learner-facing scores.

## Capacity and priority mode

For each active assessment, the engine estimates remaining useful workload from relevant uncovered/weak candidates and compares that with realistic remaining capacity.

Where useful work materially exceeds available capacity, the plan enters `prioritising` mode and deliberately concentrates on the highest-value candidates. It must not carry an impossible full-coverage timetable forward.

MVP workload estimates are coarse and activity-type based. They are not presented as precise study-time predictions.

## Recalculation triggers

Recalculate after:

- assessment create/edit/archive;
- availability change;
- new learning evidence;
- reliable planner-linked activity completion;
- material learner preference change;
- meaningful external-revision reconciliation; and
- first plan access on a new local day.

Minor navigation events do not trigger learner-visible plan churn.

## Application routes and UI

Add a global `plan` route to `src/app/navigation.ts` with hash `#/plan`.

Global navigation becomes:

- Home
- Plan
- REV
- Progress
- Subjects

On mobile, REV is the centre destination and receives the governed prominent treatment while remaining fully accessible.

### Home

Home keeps REV as the dominant guidance surface and replaces the current generic `Today’s picture` concept with a smaller `Today’s plan` summary when planner data exists.

### Plan

The Plan page renders:

- Today;
- Next few days;
- Later this week;
- Upcoming assessments/outlook.

Future precision reduces with distance. Empty/low-evidence/loading/error states must remain useful.

### REV

The existing dedicated REV route becomes the conversational planning/tutor surface. FI-001 MVP provides structured context and deterministic plan explanations; full generative conversational orchestration remains aligned with FI-003 and may be incrementally added without moving scheduling authority into the LLM.

## Persistence plan

Add a version-controlled migration containing learner-owned tables for:

- `revision_assessments`;
- `revision_availability_profiles`;
- `revision_availability_exceptions`;
- `revision_planning_preferences`;
- `revision_activity_events`.

All tables:

- reference `auth.users(id)`;
- enable RLS;
- expose only owner-scoped authenticated access;
- deny `anon`;
- use explicit grants;
- avoid privileged client credentials.

Derived plan snapshots are not required for the first implementation unless performance/observability evidence demonstrates a need. Planner version/reason data should be available in activity/analytics events so behaviour can be audited.

## Services

Create planner persistence adapters under `src/services/planning/` so React components do not embed Supabase query details.

The service layer should expose typed operations for:

- assessments;
- availability;
- preferences;
- activity events.

The deterministic engine consumes domain objects rather than Supabase row shapes.

## Admin and observability

The implementation should make it possible for Admin to surface, using aggregate/role-gated evidence:

- learners with active assessments/plans;
- planner calculation failures;
- plan items offered/started/completed;
- deliberate alternative choices;
- priority-mode incidence;
- replanning reasons;
- pathological concentration/churn indicators.

Unknown operational evidence remains `Unknown`, never `Healthy`.

## Assurance strategy

FI-001 is high risk because it changes learner navigation, persisted learner data, shared planning logic and progress-guidance behaviour.

Required assurance includes:

- unit tests for deterministic prioritisation and capacity states;
- unit tests for reason-code generation;
- database/RLS tests for learner ownership;
- service-boundary tests where practical;
- navigation/parser tests for `#/plan`;
- Playwright coverage for Home → Plan → activity and learner-choice flows;
- mobile/tablet/desktop responsive checks for the five-destination navigation and Plan page;
- accessibility checks for raised REV navigation treatment, chronology and status semantics;
- full typecheck/lint/unit/build CI;
- post-deploy smoke of `/revision/app/` and `#/plan` after implementation merge/deploy.

## Delivery sequence

1. **Foundation** — schema, domain types, deterministic planner engine and unit/RLS tests.
2. **Persistence integration** — planner services and load/save hooks.
3. **Navigation and Plan shell** — add `Plan` route and five-destination navigation; accessible responsive treatment.
4. **Assessment and availability setup** — simple learner input/edit journeys.
5. **Home integration** — Today recommendation + Today’s plan.
6. **Activity linkage/replanning** — offered/started/completed/alternative-choice events and recalculation.
7. **REV planner context** — explain why, discuss learner preference and preserve whole-programme consequences.
8. **Admin/analytics** — minimum operational/KPI evidence.
9. **Full assurance and technical documentation reconciliation.**

## Documentation impact

This implementation changes how the system currently works, so this document, README and any affected technical architecture/operations documentation must be updated in the same governed implementation PR. Normative product authority remains in the numbered governance folders and is not redefined here.
