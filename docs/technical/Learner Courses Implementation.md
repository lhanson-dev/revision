# Learner Courses Implementation

**Status:** implementation candidate complete; exact-head assurance and production backend enablement pending  
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

Migration `supabase/migrations/20260822193800_add_learner_courses.sql` creates:

### `public.learner_courses`

- `user_id uuid` → `auth.users(id)`;
- `course_id text` using the stable catalogue course identity;
- `created_at timestamptz`;
- primary key `(user_id, course_id)` preventing duplicate membership.

The browser client receives only `select`, `insert` and `delete`. RLS requires `(select auth.uid()) = user_id` for authenticated learners. Anonymous access is revoked.

The protected server-side `service_role` receives **read-only `select`** access so authorised operations/assurance can inspect programme state without creating a second service-level mutation path. FI-020 does not grant `service_role` insert, update or delete on learner-course membership.

### `public.learner_course_events`

A bounded telemetry table records FI-020 adoption/assurance events such as Add Course opened, course added/removed, course opened and catalogue-integrity exceptions. It is not learning evidence.

Learners may insert/select only their own event rows. They cannot update/delete telemetry through the client. Protected server-side operations receive read-only `select` access for aggregate/assurance inspection and no FI-020 service-role mutation grants.

## Existing-user compatibility

Before FI-020, the runtime treated the full current pilot catalogue as the programme. The migration therefore seeds users who already exist when the migration runs with exactly the two courses that were already presented as their programme:

- `aqa:aqa-a-level:7132`;
- `aqa:aqa-as:7131`.

The seed is one-time only. Future users and future published courses are not automatically enrolled.

Removing a course deletes only active membership. Learning evidence and previous attempts are stored independently and remain intact.

## Programme scoping

The following learner-wide surfaces use only active saved courses:

- Home recommendations;
- adaptive Plan candidate construction and assessment selection;
- global Progress aggregation;
- REV wider-programme context; and
- Courses contextual navigation.

Planner candidates now carry `courseId`. This prevents a multi-course subject such as Business from routing a recommendation to an arbitrary qualification merely because its `subject_id` matches.

Pre-FI-020 subject-only assessments are accepted only when the active programme makes their course scope unambiguous. Ambiguous legacy scope fails safely rather than guessing.

## Course management

`CoursesScreen.tsx` provides:

- saved active course list;
- Add Course discovery over the supported published catalogue;
- duplicate prevention;
- confirmed Remove Course;
- no-course empty state;
- unknown-course integrity warning; and
- bounded course-management telemetry.

Adding/removing membership changes active programme scope immediately in the shell.

## Release dependency

The GitHub Pages workflow does **not** execute production Supabase migrations.

FI-020 advances `revision_release_readiness()` to contract `courses-v1`, which includes `learner_courses` and `learner_course_events`, and `.github/workflows/deploy-pages.yml` expects that contract before building/deploying the frontend.

Therefore production deployment will fail closed until the governed FI-020 migration has been applied and verified on the production Supabase project. The migration is applied only after exact-head branch database/CI assurance passes and before the Founder-approved implementation merge is released.

The readiness function remains `SECURITY INVOKER`; extending the contract must not recreate the previously closed elevated-execution defect.

## Implemented assurance

The PR carries repeatable assurance for:

- migration replay in isolated Supabase;
- authenticated owner-only membership RLS and explicit browser grants;
- anonymous and cross-user membership denial;
- protected service-role read access with no FI-020 service-role insert/update/delete grants;
- composite-key duplicate prevention;
- own-row course-event insert/select with update/delete denied;
- `courses-v1` readiness and `SECURITY INVOKER` security mode;
- authenticated learner-course service round-trip and cross-user rejection;
- canonical Courses routes and legacy subject-route normalisation;
- active-programme filtering in learner-programme/planner tests;
- responsive global navigation using Courses and saved-course expansion; and
- a database-backed browser journey covering new-learner empty state → Add Course → reload → Practice evidence → Remove Course → evidence retained → reload → re-add.

Exact-head CI remains dynamic evidence and must be green for the final PR head before merge readiness is declared.

## Production completion boundary

FI-020 is **not Live** merely because implementation exists on PR #130 or because branch CI passes.

Before the PR may be presented for Founder merge approval:

1. final exact-head CI must pass;
2. current `main` must be revalidated/integrated as required;
3. the forward-safe FI-020 production database migration must be applied;
4. production `revision_release_readiness()` must independently report `contract: courses-v1` and `ready: true`; and
5. the PR documentation/assurance/lifecycle record must describe the same candidate state.

After explicit Founder approval and merge, the resulting `main` revision must still pass governed release-lineage, backend readiness, Pages deployment, production smoke and durable `revision/path-to-live` evidence before FI-020 can move from **In Progress** to **Live**.

## Documentation impact

README, Target System Architecture, Production Backend Readiness Gate, Assurance Coverage Register and INDEX are aligned on this implementation branch. This document additionally records the least-privilege service-role read boundary discovered and corrected during final browser-backed assurance. Temporary branch-only scope/status/CI-trigger files have been removed. The canonical product lifecycle records state **In Progress** while PR #130 remains unmerged; historical Design Acceptance evidence remains historical and is not rewritten.