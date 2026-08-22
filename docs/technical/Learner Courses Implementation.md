# Learner Courses Implementation

**Status:** implementation candidate complete; production backend enabled and independently verified; final post-reconciliation exact-head CI pending  
**Feature:** FI-020 — Learner Courses and Course Membership  
**Lifecycle:** In Progress  
**Implementation PR:** #130  
**Canonical runtime:** `/app/` → `src/main.tsx` → `src/app/PlannerRuntime.tsx`  
**Authority:** `10-product-governance/Global Learner Navigation.md`, `10-product-governance/Information Architecture.md`, `10-product-governance/Core User Journeys.md`, `10-product-governance/Adaptive Revision Planning.md`

## Purpose

FI-020 replaces the learner-facing `Subjects` destination with **Courses** and introduces a persisted authenticated learner-course programme set.

A published catalogue course and a learner's active course membership are separate concepts. The application must never infer that a learner studies every course Revision publishes.

Course membership is programme context. It is not learning, mastery, readiness, coverage or confidence evidence.

## Runtime architecture

`PlannerRuntime.tsx` owns the authenticated learner shell and loads `learner_courses` before rendering learner-wide programme-dependent surfaces.

The runtime projects memberships through the published catalogue using `learner-programme.ts`:

`persisted course IDs → catalogue resolution → active learner programme`

Unknown saved course IDs are not silently mapped. They are excluded from new study/recommendation actions, historical evidence remains untouched and the integrity condition is surfaced to the learner/telemetry.

Programme-dependent surfaces fail closed if membership cannot be loaded. They do not fall back to the complete published catalogue.

## Canonical routes

New user-facing routes are:

- `#/courses` — learner course index and course management;
- `#/courses/:courseId/:section` — course Overview/Learn/Practice/Exam Prep/Progress; and
- `#/courses/:courseId/components/:moduleId/:section` — component-specific work where a course cannot use one shared learning scope.

Old `#/subjects/...` hash routes are compatibility inputs only. `navigation.ts` can parse them, while `PlannerRuntime.tsx` replaces the URL with the corresponding canonical Courses route.

## Persistence

Production records the FI-020 database change as two forward migrations:

- `supabase/migrations/20260822215525_add_learner_courses.sql` — creates course membership/telemetry, seeds existing users and advances release readiness to `courses-v1`;
- `supabase/migrations/20260822215631_restrict_learner_course_service_role.sql` — removes Supabase production's inherited broad `service_role` table ACLs and restores the intended read-only protected-operations boundary.

### `public.learner_courses`

- `user_id uuid` → `auth.users(id)`;
- `course_id text` using the stable catalogue course identity;
- `created_at timestamptz`;
- primary key `(user_id, course_id)` preventing duplicate membership.

The browser client receives only `select`, `insert` and `delete`. RLS requires `(select auth.uid()) = user_id` for authenticated learners. Anonymous access is revoked.

The protected server-side `service_role` has explicit **read-only `select`** access after the hardening migration. FI-020 does not retain explicit insert, update or delete ACLs for `service_role` on learner-course membership.

### `public.learner_course_events`

A bounded telemetry table records FI-020 adoption/assurance events such as Add Course opened, course added/removed, course opened and catalogue-integrity exceptions. It is not learning evidence.

Learners may insert/select only their own event rows. They cannot update/delete telemetry through the client. Protected server-side operations have explicit read-only `select` access after the hardening migration.

## Existing-user compatibility

Before FI-020, the runtime treated the full current pilot catalogue as the programme. The migration therefore seeds users who already exist when the migration runs with exactly the two courses that were already presented as their programme:

- `aqa:aqa-a-level:7132`;
- `aqa:aqa-as:7131`.

Production verification on 2026-08-22 found 3 existing users and exactly 6 seeded membership rows, with no unexpected course IDs. The seed is one-time only. Future users and future published courses are not automatically enrolled.

Removing a course deletes only active membership. Learning evidence and previous attempts are stored independently and remain intact.

## Programme scoping

The following learner-wide surfaces use only active saved courses:

- Home recommendations;
- adaptive Plan candidate construction and assessment selection;
- global Progress aggregation;
- REV wider-programme context; and
- Courses contextual navigation.

Planner candidates carry `courseId`. This prevents a multi-course subject from routing a recommendation to an arbitrary qualification merely because its `subject_id` matches.

Pre-FI-020 subject-only assessments are accepted only when the active programme makes their course scope unambiguous. Ambiguous legacy scope fails safely rather than guessing.

## Course management

`CoursesScreen.tsx` provides saved active courses, Add Course discovery over the supported published catalogue, duplicate prevention, confirmed removal, a no-course empty state, unknown-course integrity handling and bounded course-management telemetry.

Adding/removing membership changes active programme scope immediately in the shell.

## Release dependency and production state

The GitHub Pages workflow does **not** execute production Supabase migrations.

FI-020 advances `revision_release_readiness()` to `courses-v1`, including `learner_courses` and `learner_course_events`, while `.github/workflows/deploy-pages.yml` requires the same contract before building/deploying the frontend.

Production backend preparation was completed on 2026-08-22 after Revision CI #779 had passed the then-exact implementation head. Independent production verification confirmed:

- `revision_release_readiness()` returns `contract: "courses-v1"`;
- `ready: true` with all required capability flags true;
- both FI-020 tables have RLS enabled;
- the readiness function remains `SECURITY INVOKER`;
- authenticated browser ACLs remain bounded to the intended operations;
- explicit `service_role` ACLs are `SELECT` only on both FI-020 tables after the forward hardening migration; and
- the bounded existing-user seed contains exactly the intended two courses per pre-existing user.

The Supabase Security Advisor reported no FI-020-specific new finding. The project still has the separate pre-existing Auth warning that leaked-password protection is disabled.

Because repository migration-version reconciliation and this documentation update changed the PR head after CI #779, one new exact-head CI run is still required before merge readiness.

## Implemented assurance

The PR carries repeatable assurance for migration replay, owner-only RLS, browser grants, anonymous/cross-user denial, service-role read-only expectations, composite-key duplicate prevention, telemetry ownership, `courses-v1` readiness, `SECURITY INVOKER`, authenticated service round-trip, canonical Courses routes, active-programme filtering, responsive navigation and the database-backed browser journey:

`new learner empty state → Add Course → reload → Practice evidence → Remove Course → evidence retained → reload → re-add`.

## Production completion boundary

FI-020 is **not Live** merely because implementation exists on PR #130, branch CI passes or the backend is prepared.

Before the PR may be presented for Founder merge approval:

1. final exact-head CI must pass after production-ledger reconciliation;
2. current `main` must still match or be mechanically integrated/revalidated as required;
3. production must remain `courses-v1`, `ready: true`; and
4. the PR documentation/assurance/lifecycle record must describe the same candidate state.

After explicit Founder approval and merge, the resulting `main` revision must still pass governed release-lineage, backend readiness, Pages deployment, production smoke and durable `revision/path-to-live` evidence before FI-020 can move from **In Progress** to **Live**.

## Documentation impact

README, Target System Architecture, Production Backend Readiness Gate, Assurance Coverage Register and INDEX are aligned on this implementation branch. This record now also captures the applied production migration versions and the production-only default-privilege hardening discovered during final preparation. Historical evidence is not rewritten; FI-020 remains **In Progress** while PR #130 is unmerged.