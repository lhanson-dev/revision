# Technology Stack

Status: Approved target pending implementation.

## Application
- React
- TypeScript with strict checking
- Vite

## Content
- TypeScript-authored content packs
- Zod validation

## Data and authentication
- Existing Supabase project
- Supabase Auth
- Email/password authentication with password recovery
- Google OAuth as the first approved social provider, displayed only when enabled in Supabase Auth
- PostgreSQL / Supabase data APIs protected by RLS
- Version-controlled Supabase migrations

## Testing
- TypeScript checks
- linting
- unit/integration tests (runner selected during implementation)
- Playwright browser journeys
- automated accessibility checks where practical

## CI/CD and hosting
- GitHub Actions
- GitHub Pages remains default hosting unless implementation proves a concrete need to change
- CI and the Pages production build use Node 24.18.0 with npm 11.19.0 pinned explicitly. This avoids the npm 10 Arborist peer-dependency resolver null-dereference that previously prevented dependency installation before Revision's assurance suite could run.
- The repository package engine remains `node >=22.12.0`; the stricter CI toolchain pin is a build-system reliability control rather than a learner-runtime requirement.

## Deliberate exclusions for now
- no full-stack React framework
- no CMS
- no second environment unless justified
- no heavyweight monitoring service unless usage/risk justifies it
