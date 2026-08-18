# Content Operations Admin Implementation

Status: Implemented on governed branch, pending merge and production enablement.

## Purpose

Record the first protected internal Content Operations surface for Revision and its connection to the approved Content Factory job model.

This is an operational administration surface. It does not alter the canonical learner runtime at `/app/`.

## Route and runtime boundary

- Learner product: `/app/`
- Internal Content Operations: `/admin/`
- Public root: `/`

`/admin/` is a separate Vite HTML entry point (`admin/index.html`) backed by `src/admin/`. It is built into the same governed Pages artifact but is not included in learner navigation.

## Authentication and admin assignment

The Admin UI uses the existing Supabase Auth session.

`public.profiles` gains a database-owned `is_admin boolean not null default false` classification. The existing authenticated-user profile policy permits a user to read only their own profile, while authenticated browser clients retain no INSERT/UPDATE/DELETE grant on `profiles`.

The migration conditionally assigns `is_admin = true` to the existing auth account whose email is `leehanson@hotmail.com`.

Future admin membership is changed in the database, not by hard-coding emails into the React application.

## Privileged action boundary

The browser does not receive a GitHub write token.

Add Course invokes the Supabase Edge Function:

`content-factory-intake`

The function:

1. requires an authenticated JWT;
2. resolves the authenticated user through Supabase Auth;
3. reads that user's own `profiles.is_admin` value under RLS;
4. returns `403` unless the database admin flag is true;
5. validates the submitted HTTPS URL and optional instruction;
6. creates a schema-compatible Content Factory `requested` job payload;
7. creates one GitHub Issue in `lhanson-dev/revision` using the approved `revision-content-factory-job:v1` marker; and
8. returns the job ID, issue number and issue URL to the Admin UI.

The function requires a server-side deployment secret named:

`GITHUB_CONTENT_FACTORY_TOKEN`

The token should be narrowly scoped to the Revision repository with the minimum Issue write access needed by this function. It must not be committed to Git.

`GITHUB_CONTENT_FACTORY_REPO` may optionally override the default `lhanson-dev/revision` repository name.

## Current Add Course experience

The protected screen currently provides:

- official awarding-body URL;
- optional Founder instruction;
- Add course action; and
- confirmation with the resulting durable GitHub Issue job record.

It deliberately does not yet implement course identity/source/coverage workers. A successfully submitted job remains `requested` until the next Content Factory implementation slice processes it.

## Build and deployment

`vite.config.ts` now builds `admin/index.html` alongside the learner and foundation entries.

The Pages production smoke verifies that `/admin/` is present as a built Vite artifact and is not serving raw `src/admin/main.tsx` source.

Supabase database migration and Edge Function deployment remain separate production changes from the static Pages artifact. They must be applied/deployed from the approved merged revision before Add Course can be considered operational in production.

## Assurance

Repository assurance includes:

- TypeScript/lint/build coverage for `src/admin/`;
- responsive Playwright verification that the Admin entry point loads but does not expose Add Course before sign-in;
- read-only SQL verification queries for `profiles.is_admin`, RLS and browser mutation privileges; and
- Pages post-deploy smoke for the built `/admin/` entry point.

Server-side authorization is intentionally duplicated with UI gating: hiding Admin controls in React is not treated as security.

## Next Content Factory slice

After this intake surface is operational, the next factory implementation should consume `requested` job issues and automate:

`requested → identified → sourced → mapped`

including official-source resolution, source-register persistence, machine-readable coverage compilation, coherent generation work units and deterministic source/coverage validation.
