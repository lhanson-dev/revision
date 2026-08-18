# Content Operations Admin Implementation

Status: Implemented on governed branch, pending merge and production enablement.

## Purpose

Record the first protected internal Content Operations capability for Revision and its connection to the approved Content Factory job model.

Content Operations is role-gated operational functionality inside the canonical React application. It does not create a second application runtime.

## Route and runtime boundary

- Canonical application: `/app/`
- Standard learner destinations: Home / Subjects / Progress / REV
- Role-gated operational screen: `/app/#/admin`
- Public root: `/`

There is no standalone `/admin/` HTML entry point or separate Admin React bootstrap.

For a database-approved administrator, desktop primary navigation exposes an additional **Admin** item. Mobile preserves the four-item learner bottom navigation and exposes Admin through the account/additional-links drawer.

For ordinary learner accounts, the Admin item is absent.

## Authentication, password recovery and admin assignment

Learners and administrators use the same existing Supabase Auth sign-in experience in `/app/`.

The main sign-in card provides **Forgot password?**. It calls `supabase.auth.resetPasswordForEmail` with the canonical app URL as the recovery redirect. On the returned `PASSWORD_RECOVERY` session, the application asks for and confirms a new password, then updates it with `supabase.auth.updateUser` before returning to the normal application.

`public.profiles` gains a database-owned `is_admin boolean not null default false` classification. The existing authenticated-user profile policy permits a user to read only their own profile, while authenticated browser clients retain no INSERT/UPDATE/DELETE grant on `profiles`.

The migration conditionally assigns `is_admin = true` to the existing auth account whose email is `leehanson@hotmail.com`.

Future admin membership is changed in the database, not by hard-coding emails into React.

The browser uses `profiles.is_admin` only to decide whether to present the Admin entry point and screen. That UI check is not treated as privileged authorization.

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
8. returns the job ID, issue number and issue URL to the Content Operations screen.

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

`vite.config.ts` continues to build the single `app/index.html` application entry alongside the foundation page. Content Operations code is part of the same governed application bundle and is reached only through role-gated app navigation.

The Pages production smoke therefore continues to verify the canonical `/app/` Vite artifact rather than a separate Admin artifact.

Supabase database migration and Edge Function deployment remain separate production changes from the static Pages artifact. They must be applied/deployed from the approved merged revision before Add Course can be considered operational in production.

The production `/app/` URL must be permitted as a Supabase Auth redirect so password-recovery links can return to the canonical application.

## Assurance

Repository assurance includes:

- TypeScript/lint/build coverage for the in-app Content Operations component and admin route;
- responsive Playwright verification that Forgot password is present on the main login;
- browser assurance that ordinary accounts do not receive Admin navigation;
- browser assurance that database-admin accounts do receive Admin navigation and can open Content Operations;
- preservation of the four-item mobile learner bottom navigation;
- read-only SQL verification queries for `profiles.is_admin`, RLS and browser mutation privileges; and
- the existing Pages post-deploy smoke for the canonical `/app/` entry point.

Server-side authorization is intentionally duplicated behind UI gating: hiding or displaying Admin controls in React is never treated as the security boundary.

## Next Content Factory slice

After this intake surface is operational, the next factory implementation should consume `requested` job issues and automate:

`requested → identified → sourced → mapped`

including official-source resolution, source-register persistence, machine-readable coverage compilation, coherent generation work units and deterministic source/coverage validation.
