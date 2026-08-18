# Auth Provider Production Enablement

## Google OAuth

The learner application is capable of Google OAuth but deliberately displays `Continue with Google` only when the live Supabase Auth settings report Google as enabled.

To enable Google in production, operations must:

1. create or select the appropriate Google OAuth web application;
2. register the Supabase Auth callback URL required by the live project;
3. configure the Google client ID and client secret in Supabase Auth provider settings;
4. ensure the canonical Revision `/app/` URL is permitted as a post-authentication redirect;
5. verify the live Supabase Auth settings report Google enabled;
6. smoke-test new-account and returning-account Google flows on the production Revision runtime.

OAuth client secrets must remain in provider/Supabase configuration and must never be committed to the Revision repository or delivered to the browser.

## Current implementation behaviour

No deploy-time feature flag is required. `src/services/auth/auth-capabilities.ts` reads the public Auth provider settings at runtime and fails closed to email/password if the settings request fails or Google is not enabled.
