# Technical Refactor Plan

## Objective
Move the current Revision site directly to the approved scalable architecture without running a permanent V1/Beta split.

## Guardrails
- Keep the site usable between PRs.
- Preserve existing accounts/progress wherever practical.
- Do not guess Supabase schema/RLS; inspect first.
- No large behavioural redesign inside structural refactor PRs unless explicitly approved.

## Proposed sequence
1. Establish React/TypeScript/Vite build, CI baseline and initial app shell while preserving current routes/experience.
2. Inspect and baseline Supabase schema, RLS, auth and current data; introduce version-controlled migrations safely.
3. Define Zod content schema and extract Business AQA AS Paper 2 into the first validated content pack.
4. Extract shared learning/recall/assessment functionality into engine modules with automated tests.
5. Extract progress/readiness/recommendations with explicit evidence rules and regression coverage.
6. Extract exam simulation/AO handling into reusable engine capability.
7. Add protected lightweight Admin/Operations dashboard and operational health signals.
8. Retire old paper-specific application files only after parity/replacement is proven.

## Release principle
Each implementation PR receives risk-appropriate automated assurance and still requires explicit Founder approval before merge.
