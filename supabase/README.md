# Supabase

Revision's database and Auth changes are governed by the active Engineering Standards and Security Standard.

## Rules
- Existing production Supabase project remains the canonical persisted learner-data platform.
- Database changes must be represented as version-controlled migrations under `supabase/migrations/`.
- Do not make casual manual production schema changes outside the governed migration process.
- RLS must protect learner-owned data.
- Privileged credentials must never be exposed to the browser or committed to Git.
- Learner-data migrations are high-risk changes and require full assurance plus explicit Founder approval.
- Test identities/data must be isolated and excluded from live reporting.

## Current state
See `docs/technical/Current Supabase Baseline.md`.

## Migration direction
See `docs/technical/Supabase Migration Plan.md`.

No migration file in this directory should be interpreted as approved for production merely because it exists in a branch or PR. Founder approval and the required checks remain mandatory.
