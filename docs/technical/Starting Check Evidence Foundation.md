---
title: Starting Check Evidence Foundation
status: implementation
last_reviewed: 2026-08-24
---

# Purpose

Implement the first production-safe FI-006 dependency required by GJ-01 without activating an incomplete new-Student onboarding gate.

FI-006 is now in governed implementation on `feature/fi-006-starting-check-foundation`. FI-021 remains `Ready` until production onboarding implementation itself begins.

# Canonical boundary

GJ-01 continues to target the canonical learner runtime:

`/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

This foundation does not add a second learner runtime, course model or entitlement dependency.

# Implemented in this slice

- deterministic selection of at most five starting-check questions;
- at most one question per eligible topic;
- broad deterministic sampling across canonical topic order;
- deterministic recommendation of the earliest incorrectly sampled topic;
- all-correct, partial and skipped-check fallback to the earliest course topic without stronger normal learning evidence, then canonical course order;
- a dedicated `starting_check_evidence` persistence boundary with explicit question/topic provenance;
- append-only, owner-scoped RLS for starting-check observations; and
- unit and database assurance for deterministic behaviour and cross-user isolation.

# Evidence integrity boundary

Starting-check observations are intentionally **not** stored in `learning_evidence`.

That separation is a safety control, not a second learner evidence model. The observations are directional input for the immediate FI-006 first recommendation only. Existing coverage, mastery, readiness and grade calculations continue to consume ordinary `learning_evidence` and therefore cannot count starting-check rows by accident.

No starting-check percentage, mastery label, readiness score or grade implication is produced by this foundation.

# Free-tier boundary

Nothing in this implementation depends on subscription state. FI-006/GJ-01 remains foundational behaviour for Free, Paid and Premium as governed.

# Release sequencing

This PR does not activate the post-auth onboarding gate. Doing so before the full starting-check → recommendation → useful-activity path exists would strand new Students and violate GJ-01.

The next governed FI-021 slice should add durable account-experience/onboarding state and the locked Student/Parent/Teacher → first-course → Course-ready flow, then consume this FI-006 foundation to complete the journey before the gate is enabled.

The new database migration must pass the repository's isolated Supabase migration replay and pgTAP RLS assurance before merge. Production backend deployment remains subject to the Production Backend Readiness Gate before any frontend release consumes `starting_check_evidence`.
