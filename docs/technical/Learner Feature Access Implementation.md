# Issue #665 — standard signed-in learner feature access

**25 October 2026 · Candidate branch only until PR merge and live verification**

Canonical runtime: `/revision/app/`, `src/main.tsx` → `AuthGate` → `PlannerRuntime` → Home/Plan/REV/Courses → Learn/Practice/Exam Prep/Progress. Previous `#/subjects` and other compatibility routes are not independently governed learner apps.

## Exact former blockers

- FI-001 required server-side `app_metadata.revision_fi001_pilot` (or Admin exception) before the programme-first planner replaced baseline planning.
- `fi001RestrictedContent` blocked Exam Prep and filtered original exam-question opportunities **even for cohort-enabled users** in production.
- REC-10 required separate `app_metadata.revision_rec10_pilot` both in `PlannerRuntime` and in all four `learner_exam_attempts` database policies.
- Two production-equivalent Playwright suites and pgTAP asserted the *old* entitlement behaviour.

## Proposed implementation

An authenticated learner session enables programme-first Home/Plan/REV and the supported Exam Prep route. Legacy `pilotEnabled` props and the obsolete helper are compatibility-only (unconditional nonrestriction) pending harmless future cleanup. The legacy metadata helper modules and claim-gate unit tests are removed. The existing retained Business mock's single-question untimed practice is unblocked; this is not a newly implemented full-paper untimed mode. Explicit learner owner permission for exam drafts is enforced by `auth.uid() = user_id` in SELECT/INSERT/UPDATE/DELETE, with unexpired SELECT/UPDATE. The existing trigger protects immutable owner/course/paper/attempt identity, revisions, timer and submission transitions; original creation caps raw drafts at 14 days and hourly pg_cron deletes expired rows. No new Admin permission or student-data broad read is introduced.

Migration: `20261025080000_standard_learner_exam_attempt_access.sql` is backward-compatible with the old frontend and atomically installs owner-only policies and a separate `revision_learner_feature_readiness()` v2 RPC. Existing `revision_release_readiness()` v1 remains unchanged so prior frontend deployments still succeed. Pages checks both; CI requires the existing v1 contract. **Do not merge before the new migration has been separately approved/applied, RLS/cron verified and the admission/privacy safety decision resolved.**

Tests: production-mode Playwright must show no FI-001 gate with missing metadata; both subjects must enter Exam Prep; normal timed mock must create a durable checkpoint; pgTAP must verify owner/no-flag access and other-user isolation while preserving expiry/state guards. Fresh exact-head CI must pass, including the new local-Supabase real-signup and two-identity owner-isolation integration test. A full real-browser 14-step learner journey is still required before acceptance. A mocked browser account does not constitute real Auth proof.

## Known boundary and unverified acceptance

Open Create Account means the site is not demonstrably private-only: verify live Supabase signup/admission configuration. Feature entitlement is deliberately **not** admission. The separate privacy preflight retains baseline real-child-data obligations; public self-signup may require #663 before launch. No new admittance flags/allowlists have been added. No professional legal approval or student educational acceptance is represented as completed. This change leaves the existing planner algorithm, content inventory, assessment grade disclaimers, course options and the timed-versus-untimed mock recovery contract unchanged.
