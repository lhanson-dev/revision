# Foundation Health Review — 2026-08-19

**Document type:** Point-in-time audit / historical evidence  
**Status:** Stabilisation in progress  
**Scope:** Repository governance, documentation truth, PR hygiene, CI/dependency reproducibility, production Supabase state, assurance coverage and pre-feature foundation controls  
**Authority:** None. This record does not replace active product, engineering, security or assurance authority.

## Purpose

Record the foundation-health review performed after a rapid sequence of product, content, Admin, authentication, adaptive-planner, release-readiness and assurance changes.

The goal is to establish a stable, organised baseline before additional product features are started.

## Repository state observed

At review start, `main` was at merge commit `2959e395c4ab3c3a179c310cbd6bb93f2d102ad7` after PR #63.

The latest integrated PR head had a successful Revision CI run covering:

- dependency installation;
- TypeScript typecheck;
- lint;
- unit tests;
- production build;
- responsive Playwright assurance; and
- isolated Supabase migration replay plus database/RLS pgTAP assurance.

The codebase was therefore not treated as broadly broken. The primary findings were documentation/current-state drift, repository-control gaps and incomplete assurance layers.

## Production Supabase verification

Direct production verification on 2026-08-19 established:

- project status `ACTIVE_HEALTHY`;
- `revision_release_readiness()` returns contract `planner-v1` with `ready: true`;
- the public readiness RPC runs as `SECURITY INVOKER`;
- production migration ledger contains `20260819162037_harden_release_readiness_security`;
- repository migration history was reconciled to that same version by PR #63;
- `admin-operations` is ACTIVE with JWT verification enabled;
- `planner-operations` is ACTIVE with JWT verification enabled;
- current learner-owned/public application tables inspected have RLS enabled.

Supabase Security Advisor no longer reports the readiness RPC elevated-execution issue. The remaining security warning observed is that leaked-password protection is disabled in Supabase Auth.

Performance Advisor reported two informational unused-index findings. These were not classified as release blockers because the product is new and index usage evidence is immature; removal should not be performed merely to silence the advisor.

## Documentation findings

The review found current-state documentation lagging behind the final production actions:

1. `docs/technical/Production Backend Readiness Gate.md` still described the readiness-hardening migration as pending and referenced the pre-application filename.
2. `90-governance-registers/Assurance Coverage Register.md` still described application/reverification of that migration as outstanding.
3. `docs/technical/Adaptive Revision Planner Implementation.md` still read as a future implementation plan despite FI-001 being live.
4. `docs/technical/Founder Assurance Implementation.md` still described merged database/RLS work in future/change language.
5. `10-product-governance/backlog/Product Feature Backlog.md` still marked FI-001 Approved with runtime implementation not started.

These are being reconciled in PR #64. Historical audits and decisions are not being rewritten.

## Product-backlog / PR hygiene findings

Two stale open PRs were found:

- PR #22 — older Personal Tutor/Luna proposal superseded by current REV direction/FI-003;
- PR #57 — initial diagnostic proposal based on stale `main` and using FI-004, which is already allocated to Student Confidence Tracking.

During stabilisation:

- PR #22 was closed as superseded historical proposal evidence;
- PR #57 was closed without rejecting the concept;
- the diagnostic/check-in concept is being re-entered on current `main` as FI-006 with its evidence-strength guardrails preserved.

## Dependency reproducibility finding

The repository had no committed `package-lock.json`, and both CI and Pages deployment used `npm install`.

This was considered avoidable supply-chain/build nondeterminism because dependency resolution had already caused a prior npm Arborist CI incident.

PR #64 bootstraps a lockfile from the repository's pinned Node 24.18.0 / npm 11.19.0 environment. The intended final state is:

- committed `package-lock.json`;
- CI uses `npm ci`;
- production Pages build uses `npm ci`;
- temporary lockfile-bootstrap mechanics removed before merge.

## Assurance findings

The current Assurance Coverage Register is intentionally not fully green. High-value remaining gaps observed include:

- learner evidence persistence/reload through the real client/database boundary;
- planner persistence/reload/replan integration;
- protected Admin/Planner Edge Function 401/403/authorised-success integration;
- automated accessibility assurance for critical learner journeys;
- exact CI → Founder-approved merge → backend readiness → deployment → production smoke lineage correlation; and
- durable P0/P1/P2 defect aggregation.

These gaps should be closed through repeatable evidence rather than by weakening the coverage requirements.

## Repository-control finding

At review start, GitHub reported `main` as unprotected with no required status checks.

This conflicts operationally with the intent of the repository authority requiring governed PRs, CI and explicit Founder merge approval. Governance remains authoritative, but technical enforcement should be added so accidental direct push/bypass is harder.

The connected GitHub capability available during this review does not expose branch-protection/ruleset writes. This therefore remains an explicit repository-settings action rather than being falsely reported as completed through code.

## Security hardening finding

Supabase Auth leaked-password protection is currently disabled and reported as a Security Advisor warning.

The connected Supabase capability available during this review exposes the advisory but not a safe Auth configuration write for this setting. Enabling it remains an explicit project-settings action and should be rechecked with Security Advisor afterwards.

## Stabilisation sequence

The approved working sequence is:

1. reconcile source-of-truth documentation and backlog state;
2. clean stale PR estate;
3. establish deterministic dependency installation;
4. apply repository branch-protection/ruleset enforcement;
5. enable leaked-password protection and recheck security advisors;
6. add missing persistence and protected-boundary integration assurance;
7. add automated accessibility assurance;
8. establish durable defect tracking/aggregation;
9. correlate path-to-live lineage;
10. perform a final current-main health review before new feature development.

## Current conclusion

At the start of stabilisation Revision had a functioning technical foundation with green core CI and a healthy production Supabase project, but it did not yet justify a fully clean foundation declaration because current-state documentation, deterministic dependency resolution, technical merge enforcement and several declared assurance layers were incomplete.

The stabilisation work should be completed before starting the next product feature. This audit remains the point-in-time record of why that work was initiated and must not be rewritten later to pretend the gaps were never present.
