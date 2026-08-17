# ADR-0010 — Observability and Admin Operations

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will use lightweight, automation-first observability and a protected Admin / Operations Dashboard.

## Dashboard purpose
It must answer, in simple language:
1. Is Revision healthy?
2. Is it being used?
3. Is learner progress/readiness functioning?
4. Does anything need attention?

Initial areas: system health, real-user usage, learning-system health, actionable problems.

## Rules
- Test/synthetic activity is excluded from live stats by default.
- Health is evidence-based; missing evidence is Unknown, not Healthy.
- Learner-facing failures explain what happened, whether work is safe and what happens next.
- Progress-save failures must be recoverable and never silently discard work.
