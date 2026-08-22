# FI-020 — Learner Courses and Course Membership Analysis

**Document type:** product feature analysis  
**Authority:** non-authoritative supporting analysis; approved product direction is promoted through the linked product authorities  
**Lifecycle status:** Ready  
**Captured:** 2026-08-22  
**Owner:** Product / Founder  
**Capability fit:** Understand; Guide; Learn; Practise and Test; Prepare for the Exam; Progress and Readiness  
**Founder decision evidence:** On 2026-08-22, during Design Acceptance Review Group A, the Founder approved replacing the global `Subjects` destination with `Courses`, showing the learner's own courses beneath Courses in contextual navigation, showing those courses on the Courses page, and providing an `Add Course` action. This recorded the human decision that the capability belongs in Revision (`New → To Do`). Active analysis then began (`To Do → Analyse`). On 2026-08-22 the Founder explicitly approved FI-020 after the complete Definition-of-Ready assessment, recording `Analyse → Ready` and authorising governed implementation once the approved authority change is integrated into `main`.

## 1. Student problem and target user — PASS

### Target user
Authenticated Revision learners managing one or more supported qualifications/courses.

### Problem
The current product forces a learner through a subject-first navigation hierarchy even when the thing they actually recognise and study is a specific course/specification. It also treats the entire published catalogue as the learner's programme because Revision does not yet persist a genuine learner-course membership set.

That creates three problems:

1. a learner cannot move directly to a course they already study;
2. Revision cannot truthfully distinguish `available in Revision` from `this learner studies it`; and
3. wider guidance, planning and progress can accidentally reason over published content rather than the learner's real programme.

Revision is the appropriate product to solve this because course membership is foundational learner context for navigation, planning, REV guidance and progress.

## 2. Strategic case — PASS

This change improves the core product loop rather than adding a peripheral feature:

`learner's courses → plan / REV guidance → study → evidence → progress → revised guidance`

The alternative of retaining `Subjects` and adding `Courses` as another peer destination was rejected because the two concepts overlap and make the global rail less clear. The approved direction is one learner-facing global destination: **Courses**.

The alternative of merely relabelling the current catalogue page `Courses` without persisting learner membership is also rejected because it would present published catalogue content as though it belonged to the learner.

The opportunity cost is justified because the course set becomes reusable context for Home, Plan, Progress and REV and removes a known Design Acceptance failure in the principal learner shell.

## 3. User-value hypothesis — PASS

**Hypothesis:** if Revision presents the learner's actual courses directly in global navigation and lets the learner add supported courses themselves, learners will reach intended study content with fewer navigation steps and Revision's recommendations will be based on a more truthful programme context.

Expected observable effects:

- more direct course opens from the global shell;
- high completion of Add Course when a learner has no/currently incomplete course set;
- fewer returns to the course index immediately after opening it;
- reduced navigation ambiguity in qualitative acceptance; and
- no recommendations generated from courses the learner has not selected.

## 4. Experience and simplicity — PASS

### Global navigation
The learner-wide destinations become:

1. Home
2. Plan
3. Progress
4. Courses

Ask REV remains the persistent global action and is not a peer destination.

### Courses page
Selecting **Courses** opens the learner's course index.

The page:

- is titled **Courses**;
- shows the learner's currently selected/saved courses, not every published course;
- identifies each course clearly enough to avoid ambiguity, using subject plus qualification/exam-board/specification context where needed;
- lets the learner open a course directly;
- exposes a clear **Add Course** action; and
- provides an empty state that makes Add Course the obvious next step when no courses are selected.

The page should remain calm rather than becoming a catalogue dashboard.

### Left navigation / responsive drawer
When the active route belongs to Courses, the Courses destination expands to show the learner's saved courses directly beneath it.

The normal projection is:

```text
Courses
├── Course A
│   ├── Overview
│   ├── Learn
│   ├── Practice where available
│   ├── Exam Prep where available
│   └── Progress
├── Course B
└── Course C
```

Only the selected course expands into its focused sections. Other courses remain collapsed. Subject remains academic metadata but is not an extra navigation hop in the learner's everyday course path.

The same conceptual hierarchy applies in the tablet/mobile drawer using progressive disclosure. The global four destinations remain recognisable; the drawer must not become an always-expanded catalogue tree.

### Add Course
Selecting **Add Course** opens a bounded course-selection workspace (modal/sheet or equivalent responsive treatment) over the current Courses page.

The learner can browse/search the **published supported course catalogue**, with enough identity to choose correctly. The scalable discovery model is:

- subject;
- qualification/level;
- exam board; and
- course/specification code where needed.

The product may group/filter in that order, but the learner should not have to understand internal content identifiers.

Adding a course:

- persists membership to the authenticated learner;
- prevents duplicates;
- updates the Courses page immediately;
- updates the expanded navigation immediately; and
- makes the course available to Plan, Progress and REV programme context.

### Removing / changing a course
Course membership must be manageable, even though the Founder only explicitly requested Add Course. Without a removal path, a mistaken selection becomes permanent and the learner programme becomes untrustworthy.

MVP therefore includes **Remove course** as a secondary course-management action with confirmation.

Removing a course:

- removes it from the learner's active course set;
- does **not** delete historic learning evidence, attempts or activity;
- stops the removed course influencing new programme-wide recommendations/planning;
- allows the learner to re-add it later without losing historical evidence; and
- if the learner removes the course they are currently viewing, returns them safely to Courses.

### Existing learners
The production runtime currently treats the published catalogue as the temporary learner programme. Migration must therefore avoid making existing learners appear to lose the course(s) they were already using.

For the current production catalogue, implementation should perform a bounded legacy transition that seeds existing learners with the course(s) that the production runtime previously treated as their programme. This is a one-time compatibility migration, not a future rule that every learner automatically receives every published course.

New learners after FI-020 is live start with a truthful saved course set. If no onboarding selection exists yet, Courses provides the recovery path through its empty state and Add Course.

### Unavailable/retired catalogue course
If a saved course ID is no longer present in the published catalogue, the application must not silently substitute another course. It should exclude the unavailable course from study actions, preserve historical data, and create an operationally visible integrity exception so the mapping/content issue can be resolved.

### Accessibility and responsive behaviour
- Add Course and course-management controls must be keyboard and assistive-technology usable.
- Course identity must not rely on colour alone.
- Touch targets follow the Interface System minimums.
- Desktop, tablet and mobile use the same information model.
- Modal/sheet focus, Escape/backdrop behaviour and screen-reader labelling follow the shared Interface System.

## 5. Evidence / intelligence model — PASS

Course membership is **learner programme context**, not learning/mastery/readiness evidence.

It may determine which courses are considered when Revision:

- creates learner-wide recommendations;
- generates/adapts Plan;
- summarises global Progress;
- scopes REV's wider programme context; and
- offers direct navigation.

Adding a course must not create mastery, readiness, coverage or confidence evidence.

Removing a course must not erase or reinterpret historical learning evidence.

Historical evidence may become active programme context again if the course is re-added, subject to normal evidence recency/confidence rules.

## 6. REV role — PASS

REV uses the saved learner course set as structured context. REV may:

- recognise which courses the learner studies;
- recommend work only from active learner courses at learner-wide scope;
- help explain course choice where useful; and
- route the learner into an active course.

REV is deliberately **not required** to add/remove a course conversationally in the MVP. Course membership changes remain explicit learner actions with visible confirmation because they change programme scope.

## 7. MVP boundary — PASS

### Included
- rename the global learner destination from Subjects to Courses;
- canonical Courses index showing saved learner courses;
- direct saved-course expansion beneath Courses in desktop and responsive navigation;
- selected-course focused-section expansion;
- Add Course course-selection experience;
- persisted authenticated learner-course membership;
- duplicate prevention;
- Remove course with confirmation;
- programme-wide filtering of Home/Plan/Progress/REV to active learner courses;
- safe empty state;
- safe handling of unavailable saved course IDs;
- legacy transition for existing learners;
- compatible handling of existing subject-first deep links; and
- assurance and operational visibility.

### Explicitly excluded from MVP
- learner-created/custom courses;
- unsupported exam boards/specifications;
- school-managed enrolment or teacher assignment;
- parent-managed course editing;
- importing a course from timetable/school systems;
- automatic course inference from browsing behaviour;
- AI deciding to add/remove courses without explicit learner action;
- entitlement-based limits on number of courses; and
- deleting historical evidence when a course is removed.

## 8. Free / Paid / Premium value ladder — PASS (same foundational capability)

Course membership is foundational context required for Revision to operate truthfully. It should therefore **not** be degraded by payment tier.

- **Free:** can add, view, open and remove supported courses and receive a truthful active course set.
- **Paid:** same course-management capability; paid value comes from separately governed deeper product capabilities, not from withholding programme identity.
- **Premium:** same course-management capability; premium value comes from deeper/personalised intelligence and higher-cost capabilities, not an artificial course-count gate.

No course-count limit is part of FI-020. If commercial packaging ever proposes such a limit, it requires a separate FI-002 entitlement decision and must preserve a genuinely useful Free product.

Cost-to-serve is primarily low-cost database/storage and UI state rather than a variable AI workload.

## 9. Upgrade / conversion hypothesis — N/A

FI-020 is not an upgrade mechanism. It improves the truth and usability of the core product for all tiers. Indirect retention/commercial benefit may arise because better programme setup makes Revision more useful, but no paywall or upgrade prompt belongs in this feature.

## 10. Measurement contract — PASS

### Primary hypothesis
Learners can establish and navigate their real Revision programme with less friction, and global intelligence uses only active learner courses.

### Product events
At minimum instrument or otherwise measure:

- `courses_index_viewed`;
- `add_course_opened`;
- `course_added`;
- `course_add_failed`;
- `course_removed`;
- `course_remove_cancelled`;
- `course_opened_from_global_navigation`;
- `course_opened_from_courses_index`; and
- `course_membership_integrity_exception` where operationally appropriate.

### Success indicators
- proportion of active learners with at least one valid saved course;
- Add Course start → success completion rate;
- median/typical number of active courses per learner (descriptive, not a target to maximise);
- direct course navigation usage;
- no-course empty-state rate and recovery rate; and
- zero programme-wide recommendations referencing courses outside the learner's active set.

### Guardrails
Do not optimise for number of courses added. More courses is not inherently better.

## 11. Admin / Founder assurance — PASS

Founder/Admin should be able to detect at minimum:

- learners with zero active courses;
- distribution of valid active course counts;
- saved course IDs that no longer resolve to published catalogue entries;
- Add/Remove persistence failures if material;
- legacy transition/backfill completion; and
- any planner/recommendation integrity defect where a non-member course influences learner-wide output.

This may initially be assurance-query/register coverage rather than a new dashboard card if dashboard work would be disproportionate.

## 12. Risk / trust / accessibility — PASS

### Privacy
Course membership is educational-profile data tied to an authenticated learner. Store only the supported course identifier and minimal operational timestamps needed for the feature.

### Authorization
Learners may read/write only their own membership rows. Any exposed Supabase table requires RLS and explicit ownership policies; client-side filtering is not an authorization boundary.

### Educational truth
Course membership must never be interpreted as evidence that a learner understands or has studied the course.

### Data retention
Removing membership does not delete historical learning evidence. Evidence deletion remains governed by its own data/privacy rules.

### Integrity
Unknown/retired course IDs fail safely and visibly rather than mapping to a different course.

### Accessibility
All new controls use shared Interface System primitives and meet existing responsive, keyboard, focus, contrast and assistive-technology standards.

## 13. Technical feasibility and dependencies — PASS

### Canonical runtime
The production learner entry point is `/app/`, served by `PlannerRuntime.tsx`; the academic content body currently delegates into `App.tsx`. `navigation.ts` owns the hash-route contract and `catalogue-model.ts` builds stable course identities from published content manifests.

### Current implementation constraint
The runtime currently derives programme scope directly from the full published catalogue and has no persisted learner-course membership table. `Global Learner Navigation.md` explicitly describes that as temporary.

### Proposed persistence model
A small user-owned association table is sufficient conceptually:

`learner_courses(user_id, course_id, created_at)`

with a unique/primary key across `(user_id, course_id)`.

`course_id` references the stable published catalogue identity used by the runtime. Because the current catalogue is code/content-manifest driven rather than a database course table, this is an application-level referential relationship; integrity must be validated against the published catalogue at runtime/assurance boundaries.

Before implementation, the exact schema/migration must be checked against current Supabase/Postgres guidance and the repository's established migration/RLS patterns. The exposed table must use row-level security with ownership predicates based on authenticated `auth.uid()`, and API grants must remain explicit where required by current Supabase configuration.

### Canonical route recommendation
Do not keep `#/subjects` as the canonical user-facing route after the product has renamed the destination to Courses.

Recommended canonical routes:

- `#/courses` — learner course index;
- `#/courses/:courseId/:section` — course focused section; and
- a course-scoped component/paper route beneath that course where component-specific content genuinely requires it.

Existing `#/subjects/...` routes should become compatibility inputs that resolve/redirect to the new canonical course route where possible so bookmarks and plan/REV links do not break abruptly. Subject identity remains in catalogue metadata rather than being required as a learner-facing URL hop.

### Downstream dependencies
Implementation must update/filter:

- global shell/contextual navigation;
- Courses index;
- learner-wide Home recommendation scope;
- adaptive planner subject/course inputs;
- global Progress aggregation;
- REV wider-programme context;
- browser test session fixtures/API stubs;
- any technical docs that still describe the published catalogue as the learner programme; and
- production data migration/backfill for existing users.

### Complexity
Moderate. The persistence model is small, but the feature is cross-cutting because programme scope affects several existing capabilities. No fundamental architecture blocker has been identified.

## 14. Test and assurance approach — PASS

Before merge, implementation should prove:

### Database / RLS
- authenticated learner can select own memberships;
- learner can insert/delete own memberships;
- learner cannot read/write another user's memberships;
- duplicate membership is prevented;
- unauthenticated access is denied as intended;
- migration/backfill behaves deterministically; and
- integrity handling for unknown catalogue IDs is safe.

### Unit / service
- catalogue filtering by membership;
- empty membership behaviour;
- re-add after removal;
- unavailable ID classification;
- legacy route resolution; and
- no learner-wide recommendation may select a non-member course.

### Browser
- desktop Courses destination replaces Subjects;
- mobile/tablet drawer uses Courses;
- Courses page shows only saved courses;
- Add Course adds and immediately surfaces a course;
- duplicate add is impossible/truthfully handled;
- Remove course confirms and removes without deleting historic evidence;
- active Courses branch lists saved courses directly;
- selected course expands focused sections only;
- empty state is usable;
- light/dark parity;
- keyboard/focus/assistive labels; and
- no horizontal overflow/regression in supported responsive layouts.

### Integration / production
- exact canonical `/app/` runtime consumes persisted membership;
- existing learner migration verified;
- production smoke verifies Courses navigation, persisted reload and Add Course; and
- release/path-to-live evidence follows normal governed release controls.

## 15. Documentation and authority impact — PASS

The approved core direction conflicts with current authority that names `Subjects` as the fourth global destination. This is an explicit Founder-approved authority change, not an implementation interpretation.

Before or as FI-020 becomes Ready, update:

- `10-product-governance/Global Learner Navigation.md` — Courses as global destination and saved-course expansion;
- `10-product-governance/Information Architecture.md` — learner-facing Courses model while preserving Subject as academic metadata/hierarchy;
- `10-product-governance/Core User Journeys.md` where subject/course discovery is described;
- `10-product-governance/Adaptive Revision Planning.md` where programme scope assumes subjects/catalogue;
- relevant privacy/data authority if needed to classify learner-course membership explicitly;
- `README.md` and `docs/technical/` after implementation to reflect current route/runtime/data truth;
- assurance/register evidence as required by the implemented risk controls; and
- this backlog record/lifecycle state.

`INDEX.md` does not require a new authority-location entry if the behaviour remains governed by the existing named product authorities; the FI-020 analysis file is supporting product-management evidence, not a new normative source of truth.

Historical Design Acceptance evidence must be appended/superseded, not rewritten to pretend the earlier Subjects implementation was never observed.

## 16. Blocking decisions resolved — NONE

The following product choices are resolved for the approved MVP:

- global label is **Courses**, not My Courses;
- Courses replaces Subjects as the fourth global destination rather than being added as a fifth;
- Courses page shows the learner's saved course set;
- Courses page has **Add Course**;
- active Courses navigation shows the learner's saved courses directly;
- selected course expands its focused sections;
- Subject remains academic metadata/discovery grouping, not a required everyday navigation hop;
- course membership is persisted and user-owned;
- Remove Course is included so programme truth can be corrected;
- removing membership does not delete historic learning evidence;
- course membership is foundational and not tier-gated;
- learner-wide Plan/Progress/REV/Home use only active learner courses; and
- canonical user-facing routing moves to `#/courses` with legacy subject routes retained only for compatibility.

No fundamental product, commercial, evidence/trust or technical decision remains that development would need to invent.

## 17. Human Definition-of-Ready approval — APPROVED

On 2026-08-22 the Founder explicitly approved FI-020 after the Product/AI readiness assessment had passed every applicable criterion and reported no blocking decisions.

This records the human `Analyse → Ready` lifecycle transition required by `80-company-workflows/Feature Definition and Measurement Workflow.md` and `70-ai-operating-system/AI Agent Constitution.md`.

FI-020 is therefore authorised for governed implementation after the approved normative authority change is merged into current `main`. This approval does **not** approve PR #129 for merge and does not remove the repository-wide requirement for explicit Founder approval of each merge.

## Readiness summary

- Student problem — **PASS**
- Strategic case — **PASS**
- User value — **PASS**
- Experience — **PASS**
- Evidence / intelligence — **PASS**
- REV role — **PASS**
- MVP boundary — **PASS**
- Free / Paid / Premium — **PASS** (same foundational capability)
- Upgrade hypothesis — **N/A**
- Measurement — **PASS**
- Founder/Admin assurance — **PASS**
- Risk / trust / accessibility — **PASS**
- Technical feasibility — **PASS**
- Test / assurance approach — **PASS**
- Documentation / authority impact — **PASS**
- Blocking decisions — **NONE**
- Human Ready approval — **APPROVED 2026-08-22**

**Next governed step:** integrate the approved authority/readiness record through PR #129, then begin FI-020 implementation from current approved `main` under the Governed Implementation Workflow.
