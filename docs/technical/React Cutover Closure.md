# React Cutover Closure

**Status:** GO for legacy learner runtime retirement  
**Date:** 2026-08-18

## Purpose

Record the evidence that closes the migration gates defined by `React Cutover Parity Audit.md` without rewriting that historical audit.

## Canonical learner runtime

The governed learner product is the React/Vite application at `/revision/app/`.

The repository-root learner Home and the static `subjects/` runtime are no longer required for learner continuity and may be removed from production. The root may remain as a lightweight redirect into `/app/` until the future public marketing/editorial site is introduced.

## Gate closure

### Product parity — PASS

The historical parity audit recorded the required React capabilities as implemented, including authentication, responsive learner shell, shared typed content, learning/practice modes, evidence-driven recommendations, written exam practice, full Paper 2 simulation, Recent Activity and evidence-aware readiness.

The final learner gaps were closed before this cutover and browser regression assurance covers the core React journey.

### Production React deployment — PASS

The Pages deployment now builds and publishes the Vite `dist/` artifact. `/app/` is served from built `/revision/assets/*` output rather than raw TypeScript.

After the REV Home merge, the Founder manually confirmed the new React Home was visible at `/revision/app/`. Supabase API logs from the deployed session also show successful password authentication and successful Data API reads of `learning_evidence` from the learner application.

### Evidence persistence and RLS — PASS

Production contains a profile explicitly marked as a test user. Test evidence is isolated from live profiles.

Cutover verification performed on 2026-08-18 established:

- the marked test user can insert its own `learning_evidence` row while operating as `authenticated`;
- the same test user can read that row;
- an attempted insert for a different user is rejected by the row-level security policy;
- the temporary verification row was removed after the smoke test;
- the production policies restrict learner evidence SELECT and INSERT to `auth.uid() = user_id`.

No live learner evidence row was modified for this verification.

### Browser and build assurance — PASS

The latest React Home PR passed:

- TypeScript checking;
- lint;
- unit tests;
- production Vite build; and
- Chromium responsive browser assurance at phone, tablet and desktop viewports.

The browser suite retains coverage for authentication, evidence-aware recommendation, learning/practice modes, progress surfaces and timed exam launch.

## Cutover decision

**GO.** The remaining legacy learner runtime can be retired.

The cutover change should:

1. keep `/revision/app/` as the only learner runtime;
2. replace the root compatibility Home with a lightweight redirect to `/app/`;
3. stop publishing the legacy `subjects/` routes;
4. remove the obsolete root Home assets;
5. update deployment smoke so the canonical React app must pass while retired legacy routes must return 404; and
6. update current technical documentation to describe the post-cutover architecture.

## Post-cutover release gate

After the deletion PR merges, the production deployment must pass its new smoke checks. If `/app/` fails, the root redirect is wrong, or legacy retirement breaks the governed learner journey, revert the cutover merge and redeploy.

## Historical record

`React Cutover Parity Audit.md` remains the point-in-time pre-cutover audit and must not be rewritten to pretend the earlier NO-GO decision did not exist. This closure document records the later evidence that satisfied those gates.
