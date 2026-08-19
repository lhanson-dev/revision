# Technology Stack

**Status:** Current implemented technical stack and approved baseline.

## Application
- React
- TypeScript with strict checking
- Vite

## Content
- TypeScript-authored content packs
- Zod validation

## Data and authentication
- Supabase production project
- Supabase Auth
- Email/password authentication with password recovery
- Google OAuth as the first approved social provider, displayed only when enabled in Supabase Auth
- PostgreSQL / Supabase data APIs protected by RLS
- Version-controlled Supabase migrations

## Testing
- TypeScript checks
- linting
- Vitest unit/domain tests
- isolated Supabase migration replay and pgTAP database/RLS assurance
- Playwright browser journeys
- automated accessibility checks are required by the Testing & Assurance Standard and remain an identified implementation gap until added

## CI/CD and hosting
- GitHub Actions
- GitHub Pages is the current production frontend host
- CI and the Pages production build use Node 24.18.0 with npm 11.19.0 pinned explicitly. This avoids the npm 10 Arborist peer-dependency resolver null-dereference that previously prevented dependency installation before Revision's assurance suite could run.
- `package-lock.json` is committed and both CI and the Pages production build use `npm ci` so dependency resolution is deterministic for the pinned lockfile.
- The repository package engine remains `node >=22.12.0`; the stricter CI toolchain pin is a build-system reliability control rather than a learner-runtime requirement.
- Pages deployment is gated by the production `planner-v1` backend-readiness contract and required protected Edge Function probes before the frontend artifact is published.

## Deliberate exclusions for now
- no full-stack React framework
- no CMS
- no second environment unless justified
- no heavyweight monitoring service unless usage/risk justifies it

## Maintenance rule

Material changes to the implemented stack, dependency installation model, hosting path, authentication provider model or production backend boundary must update this document and any affected engineering authority/ADR in the same governed change where required.
