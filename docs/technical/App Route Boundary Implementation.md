# App Route Boundary Implementation

## Status
Implemented as a pre-cutover foundation. No legacy production route has been removed or redirected.

## Decision implemented
Revision reserves two permanent web surfaces:

- `/` and other public routes: future SEO-led marketing, editorial and acquisition content.
- `/app/`: authenticated learner product.

The React learner application now has a dedicated Vite entry at `app/index.html`. Local development opens `/app/` by default. The build emits both the new learner entry and the temporary foundation entry during migration.

## Why this is being done before cutover
Moving the learner product to `/app/` now avoids a later URL migration when the public marketing site becomes substantial. It also lets the marketing rendering/hosting strategy evolve independently for SEO without forcing changes to learner routes, Supabase progress identifiers or authenticated application navigation.

## Current production boundary
The existing root `index.html` and legacy Business routes remain the live learner implementation. This slice does not redirect users, change auth, change Supabase, alter progress data, or delete legacy runtime files.

## Cutover exit conditions
The legacy site can be retired only after the React `/app/` implementation has equivalent or better support for:

- authentication and account flows
- Revision Hub / My Revision / catalogue
- Business AQA AS Paper 2 learning activities
- assessments, case studies, quantitative practice and exam simulation
- progress, evidence, readiness and explanations
- Supabase save/sync/recovery
- mobile, tablet and desktop core journeys
- accessibility and production smoke checks

After successful production verification, public `/` can become the marketing site and the legacy learner files can be deleted from the runtime while remaining available in Git history.
