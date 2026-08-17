# ADR-0007 — Risk-based CI/CD and deployment

Status: Draft pending merge
Date: 2026-08-17

## Decision
GitHub Actions will provide CI/CD. Required checks will be selected by change risk rather than forcing the heaviest regression suite on every change.

## Risk model
- Low: docs/copy/style-only changes → lightweight checks.
- Medium: UI, navigation, learning interaction or content structure → targeted tests plus relevant browser checks.
- High: auth, Supabase, progress, readiness, exams, migrations or shared engine → full regression.

Merges to main still require explicit Founder approval. Successful merge triggers a validated production build/deployment and post-deployment smoke checks.
