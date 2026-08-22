# Learner Courses Implementation

**Status:** implementation in progress  
**Feature:** FI-020 — Learner Courses and Course Membership  
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

The client receives only `select`, `insert` and `delete`. RLS requires `(select auth.uid()) = user_id` for authenticated learners. Anonymous access is revoked.

### `public.learner_course_events`

A bounded telemetry table records FI-020 adoption/assurance events such as Add Course opened, course added/removed, course opened and catalogue-integrity exceptions. It is not learning evidence.

Learners may insert/select only their own event rows. They cannot update/delete telemetry through the client.

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

Therefore production deployment will fail closed until the governed FI-020 migration has been applied and verified on the production Supabase project. The migration must be applied only after branch database/CI assurance has passed and before the Founder-approved implementation merge is released.

## Assurance requirements

Before merge, prove at minimum:

- migration replays cleanly in isolated Supabase;
- authenticated learner can select/insert/delete own membership only;
- anonymous and cross-user membership access is denied;
- duplicate membership is prevented;
- course events are own-row insert/select only;
- bounded existing-user seed is deterministic;
- canonical Courses routes and legacy compatibility work;
- Home/Plan/Progress/REV never use a non-member course;
- Courses page Add/Remove/reload works;
- responsive navigation uses Courses and saved-course expansion;
- light/dark/responsive Interface System assurance remains green; and
- production backend readiness reports `courses-v1` before the app is allowed to deploy.

## Documentation impact

This document describes implementation truth while FI-020 is in progress. README, Target System Architecture, assurance registers and lifecycle records must be aligned before the implementation PR is declared merge-ready. Historical audit evidence remains historical and is not rewritten.
