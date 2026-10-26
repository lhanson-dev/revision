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

**Automated deployment fail-closed:** PR #679 checks the ordinary production backend and the separate v2 owner-only exam access readiness contract and protected Edge services before publishing. There is no separately maintained GitHub registration/privacy-signoff variable. Hosted Supabase Auth's Before User Created hook is the actual server-side registration boundary: with its code gate disabled, new registrations remain denied even after a frontend release. Authenticate valid synthetic new users and confirm bypass protection before any real family invitation; record the simple pre-use controller decision separately.

### Actual local GoTrue hook invocation assurance

A separate CI job named **Real Auth private signup admission assurance** now temporarily enables the hook in an isolated local Supabase stack, activates only its ephemeral generated code, and calls the real Auth `signUp()` route. The job must prove that missing/forged proofs are rejected while a valid code results in a normal sign-in without feature claims. The random local secret is masked in CI; no production secret is used. This closes the former test gap where pgTAP proved the hook function but not hosted-GoTrue invocation. It still does **not** prove that the provider hook is configured in the live Supabase project.

**Verified CI defect and correction (25 October 2026):** calling the SQL hook under a privileged pgTAP role masked missing `extensions`-schema privileges in real GoTrue. Actual Auth returned HTTP 500 (`SQLSTATE 42501`) while evaluating HMAC. The migration now grants only `USAGE` on the existing `extensions` schema to `supabase_auth_admin`; no learner role receives this grant. Dedicated GoTrue hook integration must pass before the feature may be activated.

### Provider activation status (25 October 2026)

The private schema and Auth hook SQL from PR #684 are installed, the Founder has enabled the hosted Auth hook and a live unauthorised registration was denied and corroborated in Auth logs. The private admission control remains `enabled=false`. The provider activation runbook and synthetic positive/negative proof are in `docs/technical/Private Admission Backend Preparation.md`. No new account can be described as privately admitted until the hosted configuration and control are independently checked.

## Proposed switch back to ordinary registration — 26 October 2026 (#665)

**Candidate until a specific merge/release is verified.** The Founder has repeated that normal email/password Create Account must not require a private code, special learner flag or operator approval. The candidate removes the private-code input and short-lived HMAC proof from `src/app/AuthGate.tsx`; registration sends only normal first-name metadata. The forward-only migration `20261026120000_standard_registration.sql` redefines the still-hosted `public.revision_before_user_created(jsonb)` hook to return `{}`, so Supabase Auth no longer blocks otherwise valid provider-created accounts when the old `revision_private.family_signup_control.enabled=false` value remains. The legacy private control table stays non-readable by learner roles but has **no remaining enforcement effect** after this migration. Existing login, any enabled-provider email verification and owner-only learning data are unchanged. The old private proof module and bespoke valid/forged-code checks are removed; CI now proves actual normal signup and subsequent sign-in using isolated GoTrue, and browser tests require no special field.

**Deployment sequence:** merge only after exact-head CI and specific Founder approval; the production backend migration must apply with or ahead of the new frontend, then verify hosted email signup with a synthetic account and delete the fixture. Do not declare registration usable merely from CI or from `revision_learner_feature_readiness()`. No public launch or real-child-data compliance sign-off is implied. **Risk:** the internet-reachable site will accept unrelated registrations too. Public readiness #663 remains unapproved and the family-only access claim must be withdrawn if the signup change is released.
