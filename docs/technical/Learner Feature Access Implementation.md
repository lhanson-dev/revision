# Issue #665 — standard signed-in learner feature access

**25 October 2026 · Candidate branch only until PR merge and live verification**

Canonical runtime: `/revision/app/`, `src/main.tsx` → `AuthGate` → `PlannerRuntime` → Home/Plan/REV/Courses → Learn/Practice/Exam Prep/Progress. Previous `#/subjects` and other compatibility routes are not independently governed learner apps.

## Exact former blockers

- FI-001 required server-side `app_metadata.revision_fi001_pilot` (or Admin exception) before the programme-first planner replaced baseline planning.
- `fi001RestrictedContent` blocked Exam Prep and filtered original exam-question opportunities **even for cohort-enabled users** in production.
- REC-10 required separate `app_metadata.revision_rec10_pilot` both in `PlannerRuntime` and in all four `learner_exam_attempts` database policies.
- Two production-equivalent Playwright suites and pgTAP asserted the *old* entitlement behaviour.

## Proposed implementation

An authenticated learner session enables programme-first Home/Plan/REV and the supported Exam Prep route. The baseline-versus-pilot planner forks, `pilotEnabled` props, original-question filters and former claim-gate helpers are removed rather than retained as dead feature flags. The old baseline algorithm remains only as separately retained comparison/evidence code; it is not a learner-runtime gate. The existing retained Business mock's single-question untimed practice is unblocked; this is not a newly implemented full-paper untimed mode. Explicit learner owner permission for exam drafts is enforced by `auth.uid() = user_id` in SELECT/INSERT/UPDATE/DELETE, with unexpired SELECT/UPDATE. Anonymous Auth sessions (which also use the `authenticated` database role) are explicitly excluded; standard email or OAuth accounts need no pilot claims. The existing trigger protects immutable owner/course/paper/attempt identity, revisions, timer and submission transitions; original creation caps raw drafts at 14 days and hourly pg_cron deletes expired rows. No new Admin permission or student-data broad read is introduced.

Migration: `20261025080000_standard_learner_exam_attempt_access.sql` is backward-compatible with the old frontend and atomically installs owner-only policies and a separate `revision_learner_feature_readiness()` v2 RPC. Existing `revision_release_readiness()` v1 remains unchanged so prior frontend deployments still succeed. Pages checks both; CI requires the existing v1 contract. **Do not merge before the new migration has been separately approved/applied, RLS/cron verified and the admission/privacy safety decision resolved.**

Tests: production-mode Playwright must show no FI-001 gate with missing metadata; both subjects must enter Exam Prep; normal timed mock must create a durable checkpoint; pgTAP must verify owner/no-flag access and other-user isolation while preserving expiry/state guards. Fresh exact-head CI must pass, including the new local-Supabase real-signup and two-identity owner-isolation integration test. A full real-browser 14-step learner journey is still required before acceptance. A mocked browser account does not constitute real Auth proof.

## Known boundary and unverified acceptance

Open Create Account means the site is not demonstrably private-only: verify live Supabase signup/admission configuration. CI additionally reads the public Auth `/auth/v1/settings` response (without creating an account) and reports `disable_signup`/email-provider status as non-gating evidence; a missing field, ambiguous response or enabled signup still requires a controller admission decision. Feature entitlement is deliberately **not** admission. The separate privacy preflight retains baseline real-child-data obligations; public self-signup may require #663 before launch. No new admittance flags/allowlists have been added. No professional legal approval or student educational acceptance is represented as completed. This change leaves the existing planner algorithm, content inventory, assessment grade disclaimers, course options and the timed-versus-untimed mock recovery contract unchanged.

## Admission decision (Founder, 25 October 2026): private testing

The separate private admission surface adds one backend-validated shared registration code, **not per-account learner flags or a paywall**. Implementation: `src/services/auth/private-signup-proof.ts`, `AuthGate.tsx`, `supabase/migrations/20261025110000_add_private_registration_admission.sql`, and pgTAP security checks. A strong secret is generated in a non-exposed database schema and is never placed into source code. A two-minute email-specific signed proof is sent with Supabase Auth email registration; the secret is not transmitted. The hosted `Before User Created` hook must be separately activated by an operator. Existing users sign in normally; first-time Google OAuth users are rejected while the private gate is in force. This extra single admission step does not restrict any signed-in learner feature.

**Unresolved:** production Auth currently reports open email signup, not a verified private boundary. The hook is dormant and will not protect new accounts until configured and tested at the provider. CI SQL/function checks do not imply live Auth enforcement. After private admission/children's pre-use authorisation, apply backend ahead of frontend, run negative and valid synthetic signup, two-user isolation and the full learner journey, and then request the separate Founder PR merge approval. Issue #663 public market assurance stays open.

**Deployment:** new Pages releases fail closed unless repository variable `REVISION_PRIVATE_ADMISSION_VERIFIED=true` is present; this marker may only be set by an accountable operator after the hosted hook, real negative/positive signup verification and pre-use controller decision. This release marker is not account-specific feature control. A green CI without the variable still must not deploy.

**Auth hook test refinement:** isolated CI has a separate real-GoTrue signup/denial job with the Auth hook truly enabled, in addition to direct pgTAP function calls; passing neither implies the hosted hook has been activated.
