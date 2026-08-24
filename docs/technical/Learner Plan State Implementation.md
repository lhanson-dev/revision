# Learner Plan State Implementation

**Feature:** FI-022 — Learner Plan State Foundation  
**Status:** Current implementation source for the FI-022 foundation; production availability is determined by the governed `revision/path-to-live` evidence for the merged revision  
**Canonical learner surface:** `/revision/app/`  
**Canonical runtime:** `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

FI-022 establishes durable learner plan identity before Revision activates real paid packaging. It deliberately does not implement Stripe, checkout, paywalls, paid entitlement differences or a learner-facing upgrade journey.

The implementation follows `10-product-governance/Pre-Commercial Subscription Foundation.md`:

- plan tiers are structurally real as `free | paid | premium`;
- new Auth users receive Free automatically;
- users that existed before the migration receive a compatibility Free plan;
- a protected Founder/Admin service can manually assign Free, Paid or Premium;
- assignment provenance is retained;
- ordinary learners can read only their own effective plan state and cannot mutate it; and
- all three tiers resolve to the same current core Student capability set during this phase.

## Durable database state

`public.learner_plan_state` is the current plan projection for an Auth identity.

Columns:

- `user_id` — one row per `auth.users` identity;
- `tier` — `free | paid | premium`;
- `assignment_source` — `registration_default | compatibility_default | admin_manual`;
- `assigned_by` — nullable actor for manual assignment;
- `created_at`; and
- `updated_at`.

`public.learner_plan_assignment_events` is append-only audit evidence for protected manual plan changes. It retains the target user, previous tier, resulting tier, assigning Admin identity and timestamp.

Plan state is commercial/account context only. Neither table is learning evidence and neither changes course membership, readiness, mastery, primary experience, Admin authorization, payer identity or supporter permission.

## New-user default and existing-user compatibility

A dedicated private Auth trigger function, `revision_private.handle_new_auth_user_plan()`, inserts a Free `registration_default` row after a new `auth.users` record is created.

The migration also backfills every Auth identity that exists at migration time with Free / `compatibility_default`, using conflict-safe insertion so an existing plan row is never overwritten.

This trigger is separate from the existing profile-creation trigger. `public.profiles` therefore remains responsible for database-owned account classification such as `is_admin` and `is_test_user`; FI-022 does not overload it with commercial state.

Because primary Student / Parent / Teacher experience persistence is not yet the source used during Auth creation, the default row is attached to the Auth identity rather than attempting to infer an experience role from editable Auth metadata. Plan state still grants no role or permission. Admin/test identities are excluded from learner plan assurance counts.

## RLS and privilege boundary

`public.learner_plan_state` has RLS enabled with one browser policy:

- authenticated users may select only the row where `auth.uid() = user_id`.

Authenticated browser roles receive no INSERT, UPDATE or DELETE privilege. They cannot self-upgrade or create/delete plan state.

`public.learner_plan_assignment_events` has RLS enabled and no learner policy. Browser roles receive no table privileges.

Protected server operations use `service_role` only after re-authorizing the caller as an Admin. Explicit table grants are limited to the reads/writes needed by that server boundary.

## Central plan resolver

`src/services/subscriptions/learner-plan-service.ts` is the single application plan-resolution boundary introduced by FI-022.

It returns:

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

Missing, unreadable or invalid state resolves safely to Free plus `fallback_missing_or_invalid`. Because Free itself has full current core access in this phase, this integrity fallback cannot create a false learner paywall.

Learning features must not introduce scattered plan-name conditionals. Future FI-002 work replaces the package/entitlement mapping behind this boundary rather than teaching every feature about subscription names.

## Protected Founder/Admin operation

`supabase/functions/learner-plan-operations/index.ts` is the FI-022 protected operational boundary.

The function requires a valid JWT, re-reads the caller through Supabase Auth, and then verifies `public.profiles.is_admin = true` using the caller's RLS-bound client before creating a service-role client.

Supported operations:

### Summary

Default request / `action: "summary"` returns bounded operational assurance:

- learner count;
- counts by Free / Paid / Premium;
- missing plan-state count; and
- recent manual assignment provenance.

Admin and test accounts are excluded from learner counts.

### Manual assignment

`action: "assign"` requires:

- a valid target Auth user UUID; and
- `tier: "free" | "paid" | "premium"`.

The service verifies that the target Auth user and Revision profile exist and refuses to treat an Admin account as a learner assignment target.

The database RPC `public.assign_learner_plan(uuid, text, uuid)` performs the state change and audit append atomically. The function is `SECURITY INVOKER`, is not executable by browser roles, and is granted only to `service_role`.

This operation is for controlled testing and product development. It is not evidence of a payment or paid contract.

## Production backend readiness

FI-022 advances `public.revision_release_readiness()` to the `plan-state-v1` contract. In addition to all earlier capabilities, the contract requires:

- `public.learner_plan_state`;
- `public.learner_plan_assignment_events`; and
- `public.assign_learner_plan(uuid,text,uuid)`.

The Pages production backend-readiness gate must also prove that `learner-plan-operations` is deployed and rejects an unauthenticated request with HTTP 401 before a frontend artifact can be released.

This follows Revision's forward-safe backend deployment model: the additive database/function capability is enabled and independently verified before a frontend revision that requires the new contract is allowed through path-to-live.

## Assurance

FI-022 is Level 3 / High risk because it changes persistence, RLS, Auth-trigger behaviour and a privileged Edge Function.

Required automated evidence includes:

- migration replay from a clean isolated Supabase stack;
- RLS enabled on both plan tables;
- authenticated own-row SELECT only for current plan state;
- browser INSERT/UPDATE/DELETE denial;
- no learner access to assignment audit events;
- service-role-only execution of the assignment RPC;
- new synthetic Auth user receives exactly one Free `registration_default` row;
- plan resolution maps all three tiers to full current core access;
- invalid/missing resolution fails safely to Free/full-current-core and exposes integrity state;
- non-admin callers cannot use the plan operations Edge Function;
- an Admin can assign a target learner and the new tier persists;
- manual assignment writes audit provenance; and
- production backend readiness probes the new database contract and protected function before Pages deployment.

Supabase Security and Performance Advisors must be reviewed after the production migration is applied. Pre-existing unrelated findings remain separate and must not be represented as FI-022 defects.

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
