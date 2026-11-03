# Issue #703 — course-local and global Progress use one FI-001 next action

**State:** Governed implementation candidate; not merged or live. **Base:** approved main `f0951c14ddc1d2cfaed034a4eba90b1d897adb6f` (3 November 2026). **Canonical runtime:** `/revision/app/`, hash routes `#/progress`, `#/courses/:courseId/progress`, and applicable `#/courses/:courseId/components/:moduleId/progress`.

## Observed defect on approved main

After merged #797, global Progress projected the current FI-001 scheduled Home next action, but `CourseExperienceScreen.ProgressPanel` still called `nextProgressAction` from `progress-summary.ts`. That legacy helper invoked `rankSuggestions` with **only one course**, empty examination input, and no accepted appointments/Not-now preference. It could contradict Home, Plan, REV and global Progress, even when displaying genuine course-specific progress measures. It also offered a generic Practice action rather than the canonical scheduled task's Start.

## Bounded correction

- `useProgrammeFi001Progress` loads the **authenticated learner's entire active programme**: published adapters, owner-only scored evidence, Learn exposures, planner setup and bounded accepted sessions. It reuses the exact existing `buildPlannerSnapshot → homeToday → todayRecommendations → progressActionFromPlannerTask` path already used for global Progress. There is no new ranking, no new engine or persistence schema.
- Both global and course-local Progress project **the same programme-wide next action and recommendation ID**, with same-day Not-now treatment. The Start button routes to **Home**, where the real task is launched, not to an arbitrary course Practice screen.
- Course-local topic list, topic status, coverage and readiness remain **course-only**. Displaying a cross-course next action does not credit another course. Missing planner data or failed evidence reads fail closed with a bounded notice; historical scores remain untouched.
- Removed the legacy Progress-only topic ranker. No alteration to student marks, confidence, mastery claims, answer identity, exam paper/option scope or task selection rules.

## Tests and remaining assurance

- The isolated real-GoTrue/PostgREST browser journey `tests/e2e/learner-value-journey.spec.ts` now checks the **same named Business next task** in Home, REV, global Progress **and course-local Progress**, and verifies both Progress action buttons return to the actual Home task before the separately persisted independent checks.
- `progress-summary.test.ts` no longer legitimises the independent Progress ranker; it checks exact task ID projection. Existing FI-001/Progress tests and full CI remain required on the PR head.
- **Not proven by this scoped correction:** two educationally distinct repairs, real Psychology independent diagnosis→repair→retest, post-retest comparison of all surfaces on hosted production, three paper-option scope, time/capacity/missed-session stress, or calibrated written marking. These remain #703/#705/#706/#698 acceptance. One correct final number still does not prove a calculation method or durable mastery.

## Documentation impact

Existing approved Course Learning Blueprint, Adaptive Revision Planning (single FI-001 priority), Claims and Progress Governance and REV guidance already require the behaviour; this corrects implementation drift. Technical note, INDEX, route wiring and tests are in this one PR. No normative policy amendment, ADR or database migration is required. Retain the 2 November historical acceptance matrix as evidence at its original cut; update later acceptance additively after exact-head CI and fresh release/learner checks. **Specific Founder merge approval is required.**
