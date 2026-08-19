# Technology Stack

**Status:** Current implemented technical stack and approved baseline. PR #66 extends the assurance stack; those additions remain in review until merged.

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
- Browser Supabase URL/publishable-key configuration defaults to the production public configuration. PR #66 adds `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` overrides so isolated browser assurance can target the local CI Supabase stack without changing production defaults or exposing privileged credentials.

## Testing
- TypeScript checks
- linting
- Vitest unit/domain tests
- isolated Supabase migration replay and pgTAP database/RLS assurance
- authenticated service-level persistence/RLS integration against the isolated Supabase stack in PR #66
- protected Edge Function 401/403/admin-success integration against repository function source and the isolated Supabase stack in PR #66
- database-backed Playwright persistence/reload assurance against the isolated Supabase stack in PR #66
- Playwright responsive browser journeys
- `@axe-core/playwright` pinned at `4.13.0` for automated WCAG A/AA checks across critical learner surfaces in PR #66

The isolated integration stack uses synthetic Auth users only. Production learner data is not used for CI integration assurance.

## CI/CD and hosting
- GitHub Actions
- GitHub Pages is the current production frontend host
- CI and the Pages production build use Node 24.18.0 with npm 11.19.0 pinned explicitly. This avoids the npm 10 Arborist peer-dependency resolver null-dereference that previously prevented dependency installation before Revision's assurance suite could run.
- `package-lock.json` is committed and both CI and the Pages production build use `npm ci` so dependency resolution is deterministic for the pinned lockfile.
- The repository package engine remains `node >=22.12.0`; the stricter CI toolchain pin is a build-system reliability control rather than a learner-runtime requirement.
- Pages deployment is gated by the production `planner-v1` backend-readiness contract and required protected Edge Function probes before the frontend artifact is published.
- PR #66 adds exact PR-head CI / Founder-approval / merge / deployment correlation to the protected Admin operations contract. It is deliberately fail-closed and cannot report Path to live Healthy without the required evidence chain.

## Deliberate exclusions for now
- no full-stack React framework
- no CMS
- no second production environment unless justified
- no heavyweight monitoring service unless usage/risk justifies it

The isolated Supabase instance created by CI is an assurance dependency, not a second production environment.

## Maintenance rule

Material changes to the implemented stack, dependency installation model, hosting path, authentication provider model or production backend boundary must update this document and any affected engineering authority/ADR in the same governed change where required.
