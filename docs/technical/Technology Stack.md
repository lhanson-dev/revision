# Technology Stack

**Status:** Current implemented technical stack and approved baseline. PRs #66, #67 and #68 are merged on `main`; chained commit-level production release evidence is now live and has completed its first successful governed production run.

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
- Browser Supabase URL/publishable-key configuration defaults to production public configuration, with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` overrides for isolated browser CI only

## Testing and assurance
- TypeScript checks and linting
- Vitest unit/domain tests
- isolated Supabase migration replay and pgTAP database/RLS assurance
- authenticated service-level learner evidence and planner persistence/reload integration
- deterministic persisted planner-state reuse through the real planning engine
- protected Edge Function 401/403/admin-success integration against repository function source
- database-backed Playwright Practice → reload → Progress persistence assurance
- Playwright responsive browser journeys
- pinned `@axe-core/playwright` automated WCAG A/AA assurance across critical learner surfaces
- governed P0/P1/P2 Defect Register projected into Founder Assurance
- fail-closed PR-head CI / Founder approval / merge / deployment lineage correlation in protected `admin-operations`
- machine-readable exact-base/head risk/assurance plan before main CI suites
- repository privileged-secret/config scan across tracked non-binary files before downstream CI
- pre-deploy governed-lineage verifier plus durable chained `revision/path-to-live` commit status

The isolated integration stack uses synthetic Auth users only. Production learner data is not used for CI integration assurance.

## CI/CD and hosting
- GitHub Actions
- GitHub Pages is the current production frontend host
- CI and Pages production build use Node 24.18.0 with npm 11.19.0 pinned explicitly
- `package-lock.json` is committed and dependency installation uses `npm ci`
- the repository package engine remains `node >=22.12.0`; the stricter CI pin is a build-system reliability control
- Pages deployment is gated by governed PR/CI/Founder lineage, the production `planner-v1` backend-readiness contract and required protected Edge Function probes before publication
- production smoke remains mandatory after Pages deployment
- deployment publishes `revision/path-to-live` on the exact `main` commit as `pending` during verification and `success` only when lineage, readiness, build, deploy and smoke all pass; after the bootstrap release the immediately previous main revision must already carry a successful status
- PR #68 merge `2f4eb8f9166ca658ae19a8b72400e26488d5c16a` completed the first observed full production chain successfully in release run `32304142083`
- PR #66's `admin-operations` lineage implementation is deployed to production as Edge Function version 2 with JWT verification enabled
- PR #67's assurance-plan v1 is intentionally `conservative-full`: it classifies and records risk but does not skip either existing CI suite while the classifier is calibrated

## Deliberate exclusions for now
- no full-stack React framework
- no CMS
- no second production environment unless justified
- no heavyweight monitoring service unless usage/risk justifies it

The isolated Supabase instance created by CI is an assurance dependency, not a second production environment.

## External controls / commercial boundaries

GitHub `main` branch protection/ruleset remains an external repository setting and is not currently enabled. PR #68 provides a verified compensating production fail-closed release chain, but repository protection remains required defence in depth because an administrator could otherwise alter repository history or the workflow itself.

Supabase Security Advisor currently reports managed leaked-password protection disabled. Revision is currently on the Supabase Free plan, while that managed control requires Pro. The warning remains visible and is not represented as solved by application CI. Enable/reverify it before broad external learner acquisition or when Revision moves to Pro for another justified reason, whichever occurs first; this future launch/security control is tracked in Issue #69.

## Maintenance rule

Material changes to the implemented stack, dependency installation model, hosting path, authentication provider model, assurance execution model or production backend boundary must update this document and any affected engineering authority/ADR in the same governed change where required.
