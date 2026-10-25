# Authentication Implementation

Status: Implemented on `main`; Google OAuth enabled in production Supabase Auth on 2026-08-19. B7.1 authentication identity consolidation is proposed on the current governed branch.

## Canonical surface

Revision authentication is served by the canonical learner runtime at `/app/`.

`src/main.tsx` wraps `src/app/PlannerRuntime.tsx` in `src/app/AuthGate.tsx`. `AuthGate` is the canonical unauthenticated entry experience and owns:

- session detection before the learner application is rendered;
- sign-in vs create-account mode;
- email/password sign-in;
- email account creation with `first_name` user metadata;
- Google OAuth initiation when the provider is enabled;
- password-reset request and recovery completion; and
- the unauthenticated light/dark theme boundary used by the shared Interface System.

The existing authentication branch inside `src/app/App.tsx` remains compatibility code while `App` continues to participate in legacy internal rendering paths. It is not a second user-facing entry point and must not become one. B7 compatibility retirement should remove duplicate unauthenticated ownership once zero live dependency is proved.

## Authentication identity ownership

Authentication uses the canonical Revision identity package rather than reconstructing the brand in page markup.

`AuthGate` consumes:

```text
BrandAsset asset="wordmark"
```

through the public `src/app/ui/` Interface System registry. The light/dark exports come from the canonical brand asset package registered under `assets/brand/manifest.json`.

The shared BrandAsset anatomy responds to any enclosing `data-theme="dark"` boundary, so the same component works for both the unauthenticated `AuthGate` shell and the authenticated learner runtime. Authentication must not reintroduce live-text wordmarks, decorative `✦` identity substitutes or page-local light/dark asset switching.

This closes the authentication-specific ownership problem identified as DAR-007 in the 23 August 2026 Design Acceptance Review. Shell/navigation identity and icon consolidation remain separate B7 increments so this change stays bounded.

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

Recovery uses the same canonical Revision wordmark and theme boundary as sign-in/account creation rather than maintaining separate identity markup.

## Assurance

Authentication changes require at least:

- TypeScript and lint checks;
- unit coverage for provider capability detection;
- responsive browser assurance for sign-in and create-account modes;
- verification that First name appears only where required;
- verification that Google is shown only when the provider is enabled;
- verification that authentication consumes the canonical wordmark and does not reconstruct Revision identity locally;
- verification that the correct light/dark wordmark export is the visible asset for the current authentication theme;
- regression assurance that an existing authenticated learner still reaches the ordinary `/app/` hierarchy;
- verification that an authenticated learner can update their own first-name metadata and see the revised learner-facing name; and
- verification that profile editing cannot alter database-owned administrator classification.

PR #66 additionally uses synthetic Auth users inside the isolated Supabase CI stack to prove authenticated learner persistence/reload and protected Admin/Planner authorization boundaries without production learner data.

Provider enablement must still be verified against live Supabase Auth configuration before Google can be considered production-ready. Production verification on 2026-08-19 confirmed the live Google login path is operational.

Supabase Security Advisor currently reports leaked-password protection disabled. That project-level Auth setting remains an external production hardening action until deliberately enabled and reverified; isolated CI assurance does not close that warning.

## B7 documentation impact

This bounded B7.1 increment changes implementation ownership rather than authentication behaviour. It updates this technical implementation record in the same branch. No normative authentication/product/brand authority change or ADR is required because the approved Visual Brand System and Interface System already require canonical asset use. The historical Design Acceptance Review remains unchanged.

## C3 learner-entry visual-role reconciliation — pending governed PR (10 October 2026)

The sole public learner entry remains `/app/ → AuthGate`. The `auth-v2.css` sign-in/create-account/recovery presentation is migrated to centrally owned learner action, inverse REV, display, focus and radius roles; no AuthGate, provider capability, form submission, recovery or identity semantics change. The two desktop Light/Dark visual review slots are fail-closed pending Founder approval; existing authentication/browser security contracts remain. This work does not adopt proposed Student lifecycle changes from unmerged PR #590.

## Issue #665 — private tester registration admission (proposed, 25 October 2026)

Canonical `AuthGate` email registration accepts one private testing code, shared by the Founder, not individually provisioned account permissions. The UI uses WebCrypto HMAC-SHA256 and sends only an email- and minute-bound short-lived proof in `user_metadata`. The 32-character random code itself is **never transmitted or saved in browser storage, GitHub or user metadata**. The signed proof is not a grant to read any user data; it only allows one Auth signup attempt for the same address within two minutes. It should not be logged and it expires rapidly. Existing email/Google sign-ins and password resets are unchanged. New Google OAuth registrations are denied while private admission is enforced; the Google button is shown only in sign-in mode.

`revision_private.family_signup_control` has a randomly generated 128-bit code and starts with `enabled=false` (no usable admission until explicitly activated). Only database operators and Supabase's `supabase_auth_admin` hook role may read it. `public.revision_before_user_created(event jsonb)` is a **security-invoker** Supabase Auth Before User Created Postgres hook: it checks email provider, normal non-anonymous user, secret-backed HMAC, email binding and expiry. Function EXECUTE is denied to ordinary `anon` and `authenticated` SQL roles. Every supported learner receives identical feature access after signup; no per-account entitlement is introduced.

**Critical deployment requirement:** adding this SQL function does NOT activate Supabase Auth hooks. In the hosted Supabase project, Authentication → Hooks → Before User Created must be pointed to `public.revision_before_user_created` and enabled, and an operator must separately set `revision_private.family_signup_control.enabled=true` only after private pre-use authorization. It is NOT safe to install only the frontend and leave publicly permissive signup. The code is generated only server-side; an authorized operator reads it once over the secure Supabase SQL editor and shares it privately with testers; do not include it in PR comments. Test negative signup directly against the live Auth API with synthetic accounts before live child usage. Confirm the hook does not interfere with existing Google sign-in. A temporarily accessible production database does not prove the hosted Auth hook has been configured.

Local `config.toml` hook remains disabled for unrelated legacy synthetic fixtures; isolated pgTAP tests directly exercise both allow/deny branches under `supabase_auth_admin`, and client unit tests verify HMAC proof generation. Actual Auth-hook integration and live admission remain **OPEN** until a dedicated configured test environment and production-equivalent negative-signup check pass. This is not a completed private-admission release.

**Automated deployment fail-closed:** PR #679 adds release-only GitHub Actions variable `REVISION_PRIVATE_ADMISSION_VERIFIED=true` as a prerequisite in `deploy-pages.yml` after independently checking the hosted hook and private admission. A missing variable blocks publishing. This does not configure the Auth hook by itself, nor does it become a feature flag. Clear this variable if live admission proof is revoked; provider-side code rotation/disabling remains necessary for the existing live service.
