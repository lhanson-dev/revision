# Learner Plan State Implementation

**Feature:** FI-022 — Learner Plan State Foundation  
**Status:** Live in production from 2026-08-24 after PR #159 merged and the exact production revision passed backend readiness, Pages deployment, production smoke and durable `revision/path-to-live`  
**Canonical learner surface:** `/revision/app/`  
**Canonical runtime:** `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

FI-022 establishes durable learner plan identity before Revision activates real paid packaging. It does not implement Stripe, checkout, paywalls, differentiated paid access or a learner-facing upgrade journey.

The implementation follows `10-product-governance/Pre-Commercial Subscription Foundation.md`:

- plan tiers are structurally real as `free | paid | premium`;
- new Auth users receive Free automatically;
- users that existed before the migration receive compatibility Free;
- a protected Founder/Admin service can manually assign Free, Paid or Premium;
- assignment provenance is retained;
- ordinary learners can read only their own plan state and cannot mutate it; and
- all three tiers resolve to the same current core Student capability set during this phase.

## Durable database state

`public.learner_plan_state` is the current plan projection for an Auth identity:

- `user_id` — one row per `auth.users` identity;
- `tier` — `free | paid | premium`;
- `assignment_source` — `registration_default | compatibility_default | admin_manual`;
- `assigned_by` — nullable actor for manual assignment;
- `created_at`; and
- `updated_at`.

`public.learner_plan_assignment_events` is append-only audit evidence for protected manual plan changes. It records the target user, previous tier, resulting tier, assigning Admin identity and timestamp.

Plan state is commercial/account context only. It is not learning evidence and does not change course membership, readiness, mastery, primary experience, Admin authorization, payer identity or supporter permission.

## Registration default and compatibility

`revision_private.handle_new_auth_user_plan()` runs after a new `auth.users` row and inserts Free / `registration_default` with conflict-safe semantics.

The production migration also seeded every Auth identity that existed when FI-022 was enabled with Free / `compatibility_default`. It did not overwrite any pre-existing plan row.

This trigger is separate from profile creation. `public.profiles` remains responsible for database-owned account classification such as `is_admin` and `is_test_user`; plan state is not stored in editable Auth metadata.

## RLS and privilege boundary

`public.learner_plan_state` has RLS enabled. Authenticated users receive SELECT only and the policy restricts reads to `auth.uid() = user_id`. Authenticated browser roles receive no INSERT, UPDATE or DELETE privilege.

`public.learner_plan_assignment_events` has RLS enabled, no learner policy and no browser table privileges. The resulting Supabase advisor informational notice that the table has RLS with no policy is intentional: browser access is deny-all by design.

Protected operations use `service_role` only after the calling user has been authenticated and re-authorized as an Admin.

## Central plan resolver

`src/services/subscriptions/learner-plan-service.ts` is the single application plan-resolution boundary introduced by FI-022.

It resolves:

```text
LearnerPlanContext
- tier: free | paid | premium
- capabilitySet: current_core_student_access
- integrity: valid | fallback_missing_or_invalid
```

The temporary mapping is deliberately constant:

```text
free    → current_core_student_access
paid    → current_core_student_access
premium → current_core_student_access
```

Missing, unreadable or invalid state resolves to Free plus `fallback_missing_or_invalid`. Because Free itself has full current core access in this phase, the fallback cannot create a false learner paywall.

Learning features must not introduce scattered plan-name conditionals. FI-002 will later replace the package/entitlement mapping behind this boundary.

## Protected Founder/Admin operation

`supabase/functions/learner-plan-operations/index.ts` is the protected operational boundary. Production deployment has `verify_jwt = true` and the repository records that function configuration explicitly in `supabase/config.toml`.

The function:

1. requires a valid user JWT;
2. re-reads the caller through Supabase Auth;
3. verifies `public.profiles.is_admin = true` using the caller-scoped client;
4. only then creates a service-role client; and
5. exposes bounded summary and manual-assignment operations.

Manual assignment validates the target Auth user, requires a valid Revision profile, rejects Admin accounts as learner targets and accepts only `free | paid | premium`.

`public.assign_learner_plan(uuid,text,uuid)` performs the plan update and audit append atomically. It is `SECURITY INVOKER`, is not executable by browser roles and is granted to `service_role` only.

A manual Paid/Premium assignment is a testing state, not evidence of payment or a paid contract.

## Production enablement evidence — 24 August 2026

Production Supabase project `xwwhshpmeogswxfjtpvq` recorded migration:

`20260824165737_add_learner_plan_state`

The repository migration filename is reconciled to that exact production ledger version.

Production verification established:

- `revision_release_readiness().contract = "plan-state-v1"`;
- `ready = true` with all prior and FI-022 capability checks present;
- all three Auth identities present at migration time received exactly one Free `compatibility_default` plan row;
- both plan tables have RLS enabled;
- authenticated users have own-plan SELECT but no plan INSERT/UPDATE privilege;
- authenticated users cannot read assignment events;
- authenticated users cannot execute `assign_learner_plan`;
- `service_role` can execute the assignment operation;
- `revision_release_readiness()` remains `SECURITY INVOKER`;
- a rollback-safe synthetic Auth-user check proved a new identity receives exactly one Free `registration_default` plan row alongside its normal profile;
- a rollback-safe manual assignment check proved Free → Premium persists atomically and records one audit event; and
- `learner-plan-operations` version 1 is ACTIVE in production with JWT verification enabled.

No synthetic verification user or assignment was retained because the checks were rolled back.

PR #159 merged exact head `b197f82f9a805ac407cc944e3a4914f37e8234a6` into `main` as `df7d9b520fec60d4b804c49dfc2c441498f37b99`. Production workflow run `32755286006` then passed governed release lineage, the `plan-state-v1` backend contract and protected-function checks, production build, GitHub Pages deployment, canonical production smoke and durable `revision/path-to-live = success` for that exact merge commit.

## Supabase advisor review

Post-change Security Advisor reported no new FI-022 warning-level vulnerability. It reports:

- an informational `rls_enabled_no_policy` notice for `learner_plan_assignment_events`; this is intentional deny-all browser design; and
- the pre-existing Auth warning that leaked-password protection is disabled.

Reference for the pre-existing Auth warning: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Performance Advisor reports informational unindexed-foreign-key suggestions for the new `assigned_by` references plus existing unused-index notices. At current scale these do not block FI-022. Indexing should be revisited if assignment history volume or deletion/update workload makes the foreign-key scans material.

## Production backend readiness

FI-022 advances `public.revision_release_readiness()` from `courses-v1` to `plan-state-v1`. The contract additionally requires:

- `public.learner_plan_state`;
- `public.learner_plan_assignment_events`; and
- `public.assign_learner_plan(uuid,text,uuid)`.

The Pages backend-readiness job probes `learner-plan-operations` alongside `admin-operations` and `planner-operations`. Each protected function must reject an unauthenticated POST with HTTP 401 before release proceeds.

The database/function capability was enabled and verified before the application merge, then the exact merged production revision successfully passed the required backend-readiness gate before Pages deployment. The temporary backend-ahead release window is therefore closed.

## Assurance

FI-022 is Level 3 / High risk because it changes persistence, RLS, Auth-trigger behaviour and a privileged Edge Function.

Automated evidence includes:

- migration replay from a clean isolated Supabase stack;
- dedicated pgTAP plan-state/RLS/privilege assurance;
- plan-resolution unit tests proving all tiers retain full current-core access and invalid state fails safely;
- protected Edge Function integration proving unauthenticated, ordinary-user and Admin authorization boundaries;
- atomic manual-assignment/audit verification;
- existing full typecheck, lint, unit, build and responsive browser regression; and
- production backend-readiness gating for both the database contract and required protected functions.

Final exact-head Revision CI #940 passed on `b197f82f9a805ac407cc944e3a4914f37e8234a6` before Founder-approved merge. The resulting merge commit `df7d9b520fec60d4b804c49dfc2c441498f37b99` then passed the complete production path-to-live chain in workflow run `32755286006`.

## Deliberate exclusions

FI-022 does not include:

- Stripe or another payment provider;
- checkout, invoices or customer portal;
- real paid subscription lifecycle;
- paywalls or locked features;
- plan-comparison or upgrade UI;
- differentiated AI or other usage allowances;
- payer/supporter linking;
- parent subscription dashboards; or
- final customer-facing plan names.

Those remain FI-002 responsibilities.
