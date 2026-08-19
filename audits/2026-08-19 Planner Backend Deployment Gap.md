# Planner Backend Deployment Gap — 2026-08-19

## Status

Point-in-time operational finding. This is evidence/history, not normative authority.

## What happened

After FI-001 Adaptive Revision Planner was merged and the Pages frontend deployed, saving learner availability failed with:

`Could not find the table 'public.revision_availability_profiles' in the schema cache`

Production inspection confirmed that the FI-001 planner tables had not been applied to the live Supabase database even though the frontend requiring them was already live.

A separate check also found that no Supabase Edge Functions were deployed, including the PR #58 `planner-operations` function used by protected planner assurance.

## Immediate remediation

The already Founder-approved FI-001 database migrations were applied to the production Revision Supabase project:

- planner foundation tables/RLS;
- planner Admin aggregate function.

The already Founder-approved `planner-operations` Edge Function was deployed with JWT verification enabled.

The planner tables and owner-scoped RLS policies were then verified in production.

## Root cause

The GitHub Pages release workflow validated and deployed only the static React artifact. It did not have a pre-deploy dependency gate proving that separately deployed Supabase schema/functions required by that frontend were present.

The release standards correctly stated that frontend deployment does not prove backend enablement, but the path-to-live automation did not enforce that rule.

## Corrective action

PR following this finding adds:

- a narrow production database readiness RPC;
- a fail-closed Pages pre-deploy backend-readiness job;
- required protected Edge Function deployment/authentication probes;
- updated Release & Deployment authority;
- a new PTL-03 assurance-control record; and
- technical documentation describing how future backend-dependent features extend the contract.

## Additional finding during reconciliation

While the corrective branch was being reconciled with the subsequently merged Founder Assurance v1 implementation, production was also found to be missing the already-approved `admin_operations_metrics()` database RPC and `admin-operations` Edge Function required by the protected Founder Operations/Assurance UI.

Those already-approved backend components were enabled in production and `admin-operations` was deployed with JWT verification enabled. The corrective readiness gate was expanded to require both `admin-operations` and `planner-operations`, and to include both Admin aggregate RPCs in the database readiness contract.

## Residual assurance

The new readiness gate proves required backend capability presence before frontend publication. It does not replace database/RLS integration tests, authenticated Admin integration coverage or post-deployment production smoke.
