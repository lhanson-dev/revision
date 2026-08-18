# Authentication Implementation

Status: Implemented on `main`; Google OAuth enabled in production Supabase Auth on 2026-08-19.

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

## First-name metadata

Email signup passes:

```text
user_metadata.first_name
```

to Supabase Auth. The learner greeting already resolves `first_name`, `given_name` or `name`, so email signup and Google identities can feed the same learner-facing personalisation without adding a new profile-table column solely for the greeting.

## Google provider capability detection

`src/services/auth/auth-capabilities.ts` reads the public Supabase Auth settings endpoint with the existing publishable key.

Google is displayed only when the returned provider configuration reports:

```text
external.google = true
```

If the settings request fails or Google is disabled, Revision fails closed and continues to offer email/password rather than presenting a broken Google button.

The Supabase URL and publishable key are browser-public configuration. OAuth client secrets remain provider/Supabase-side secrets and must never be committed or shipped to the client.

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
- regression assurance that an existing authenticated learner still reaches the ordinary `/app/` hierarchy.

Provider enablement must also be verified against the live Supabase Auth configuration before Google can be considered production-ready. Production verification on 2026-08-19 confirmed the live Google login path is operational.
