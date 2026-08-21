# Authentication Implementation

Status: Implemented on `main`; Google OAuth enabled in production Supabase Auth on 2026-08-19. PR #66 adds isolated browser-auth assurance configuration without changing production defaults.

## Canonical surface

Revision authentication is served by the canonical learner runtime at `/app/`.

`src/main.tsx` wraps the learner `App` in `src/app/AuthGate.tsx`. `AuthGate` is the canonical unauthenticated entry experience and owns:

- session detection before the learner application is rendered;
- sign-in vs create-account mode;
- email/password sign-in;
- email account creation with `first_name` user metadata;
- Google OAuth initiation when the provider is enabled;
- password-reset request and recovery completion.

The existing authentication branch inside `src/app/App.tsx` remains a compatibility fallback during this slice because `App` still subscribes to Supabase auth for sign-out/session changes. It is not a second user-facing entry point. A later cleanup may remove the duplicate unauthenticated rendering logic once the outer gate has proved stable.

## Public Supabase configuration

The Supabase URL and publishable key are browser-public configuration. Production defaults remain the Revision production project URL and current publishable key.

PR #66 allows these public values to be overridden at build time with:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

This exists so database-backed browser assurance can build the real learner app against the isolated CI Supabase stack. It does not introduce a second production environment and must never be used to supply a service-role key, database password or other privileged credential to browser code.

OAuth client secrets remain provider/Supabase-side secrets and must never be committed or shipped to the client.

## First-name metadata

Email signup passes:

```text
user_metadata.first_name
```

to Supabase Auth. The learner greeting resolves `first_name` or `given_name`, with provider `name` and email-local-part fallbacks, so email signup and Google identities can feed the same learner-facing personalisation without adding a profile-table column solely for the greeting.

The centred Profile account modal also allows the authenticated learner to correct the first name Revision uses. The save action calls Supabase Auth `updateUser` for the signed-in identity's own `user_metadata.first_name`; the returned Auth user replaces the learner-shell user state so the greeting, account-menu name and avatar initial update immediately.

This self-service edit deliberately does **not** write to `public.profiles`. That table remains database-owned classification state such as `is_test_user` and `is_admin`, readable to the owning user but not client-editable. Profile editing therefore cannot be used to alter administrator permission.

Email remains read-only in the current Profile modal because changing an authentication email requires a separately designed verification/recovery journey.

## Google provider capability detection

`src/services/auth/auth-capabilities.ts` reads the public Supabase Auth settings endpoint with the configured public Supabase URL/publishable key.

Google is displayed only when the returned provider configuration reports:

```text
external.google = true
```

If the settings request fails or Google is disabled, Revision fails closed and continues to offer email/password rather than presenting a broken Google button.

## Google OAuth flow

When enabled, `Continue with Google` uses Supabase Auth `signInWithOAuth` with provider `google` and redirects back to the canonical `/app/` URL.

Google OAuth was enabled in the production Supabase Auth configuration on 2026-08-19 and a live Google sign-in was confirmed successful. Google-linked identities remain ordinary Supabase users and receive no administrator privilege merely because they use Google.

The repository does not contain the Google OAuth client secret.

## Password recovery

Forgot-password requests use the canonical `/app/` URL as the recovery redirect. `AuthGate` listens for the Supabase `PASSWORD_RECOVERY` auth event and presents the new-password form in the same application.

## Assurance

Authentication changes require at least:

- TypeScript and lint checks;
- unit coverage for provider capability detection;
- responsive browser assurance for sign-in and create-account modes;
- verification that First name appears only where required;
- verification that Google is shown only when the provider is enabled;
- regression assurance that an existing authenticated learner still reaches the ordinary `/app/` hierarchy;
- verification that an authenticated learner can update their own first-name metadata and see the revised learner-facing name; and
- verification that profile editing cannot alter database-owned administrator classification.

PR #66 additionally uses synthetic Auth users inside the isolated Supabase CI stack to prove authenticated learner persistence/reload and protected Admin/Planner authorization boundaries without production learner data.

Provider enablement must still be verified against live Supabase Auth configuration before Google can be considered production-ready. Production verification on 2026-08-19 confirmed the live Google login path is operational.

Supabase Security Advisor currently reports leaked-password protection disabled. That project-level Auth setting remains an external production hardening action until deliberately enabled and reverified; isolated CI assurance does not close that warning.
