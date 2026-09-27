# Planner Week Readiness Probe Hotfix

**Status:** Production backend hotfix applied; repository reconciliation pending governed merge  
**Date:** 27 September 2026  
**Related release:** PR #403 / `planner-week-v1`  
**Governing release control:** `docs/technical/Production Backend Readiness Gate.md`

## Purpose

Record the release-blocking backend-readiness defect discovered immediately after PR #403 merged and the forward-only correction applied to the production readiness probe.

## What failed

The governed Pages deployment for merge commit `8f8ddcb121ca373063971f3fde88bd7eb8868454` passed release-lineage verification and then failed closed at **Production backend readiness**.

The response correctly identified contract `planner-week-v1`, but reported:

- `ready: false`; and
- `checks.weeklyAvailability: false`.

The seven Monday-Sunday availability columns were present in production and the Plan data migration itself was intact.

## Root cause

`public.revision_release_readiness()` deliberately runs as `SECURITY INVOKER` and is called by deployment with the anonymous/publishable role.

The original `planner-week-v1` implementation checked the seven new columns through `information_schema.columns`. PostgreSQL filters that metadata according to the current role's table privileges. The anonymous role has no direct learner-table access, so it sees zero matching `information_schema.columns` rows even though the columns exist.

Privileged preflight and migration assurance therefore passed while the actual anonymous release probe failed. The fail-closed release gate behaved correctly; the probe implementation was incomplete for its real execution role.

## Correction

Production migration `20260927182844_fix_planner_week_readiness_catalog_visibility.sql` replaces the weekly-column metadata check with `pg_catalog.pg_attribute` scoped to `public.revision_availability_profiles`.

This preserves the intended security model:

- `revision_release_readiness()` remains `SECURITY INVOKER`;
- the anonymous role receives no direct learner-table privilege;
- RLS and learner ownership are unchanged;
- the contract remains `planner-week-v1`; and
- only non-sensitive capability-presence booleans are exposed.

Independent post-fix verification under `SET ROLE anon` returned `planner-week-v1`, `ready: true` and `weeklyAvailability: true`.

## Regression assurance

Revision CI now calls `revision_release_readiness()` through the local Supabase REST endpoint using the anonymous key after isolated migration replay. The assertion requires:

- contract `planner-week-v1`;
- `ready: true`; and
- `checks.weeklyAvailability: true`.

This reproduces the same role/protocol boundary used by the production deployment instead of relying only on privileged database tests.

## Advisor review

Post-hotfix Supabase Security and Performance Advisor review introduced no hotfix-specific finding. The previously known leaked-password-protection warning and informational RLS/index findings remain separate from this change.

## Documentation impact

This hotfix changes only release-readiness implementation and assurance. It does not change Plan product behaviour, adaptive-planning authority, learner evidence semantics or the approved Plan experience. Historical PR #403/release evidence is not rewritten; this record documents the subsequent fail-closed release event and correction.
