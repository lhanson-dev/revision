# ADR-0008 — Supabase security foundation

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will keep the existing Supabase project and regularise it as the platform data/auth foundation.

## Rules
- RLS enforces learner-data ownership at database level.
- No privileged secret may ship to the browser or be committed to Git.
- Database schema changes are version-controlled through migrations.
- Security/ownership policies receive automated tests.
- Supabase Auth remains the default authentication mechanism.
- Learner-data integrity changes are high risk.
