# #703 — global Progress consumes the shared FI-001 next action

**State:** Governed candidate PR, not merged or live. **Canonical app:** `/revision/app/#/progress` via `PlannerRuntime → ProgrammeProgressScreen`. **Baseline:** approved main `5b27ab3c25ac34015d033dd6d38a3722ffa81312`. Human FI-001 Gate B Ready was granted 29 October 2026 in PR #711; the approved Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance are unchanged.

## Observed discrepancy and correction

- Before this candidate, global Progress called `nextProgressAction(allStates, programme.courses, now)`, which read a **separate topic-only** `rankSuggestions` adapter with no learner's configured exam scope, capacity, actual booked sessions, next scheduled question or Not now choice. It could contradict Home/Plan/REV.
- Global Progress now loads the owner's existing planner setup and bounded 60-day accepted-commitment window, uses the same 14-day FI-001 `buildPlannerSnapshot`, `homeToday` and `todayRecommendations` as Home, and **only projects** that already selected task into the Progress introduction. No new ranking logic, activity, grader, evidence, schema, planner or persist operation is added. The action links to Home for the genuine Start journey, rather than misleadingly starting a generic course Practice activity.
- Existing source-backed `skillFocus` gets Plan's same `planSkillFocusLabel`; missing source identity or student-booked tasks do not invent atomic diagnoses. An accepted session and same-day Not now are included in the identical selection contract. Status/coverage/understanding/readiness are still computed solely from the governed evidence engine, independently of plan setup.
- On failed plan/setup/accepted-session loading, no replacement topic is ranked; current Progress evidence is retained, and a bounded warning explains the recommendation is unavailable. No private learner identifiers, exam results, or owner data are introduced into logs.

## Bounded assurance and open gaps

- New `progress-fi001-next-action.test.ts` projects production-published Business/Psychology ContentPacks through the real FI-001 scheduler and verifies action identity, Not now, fail-closed null, and honest exact-skill labeling. Existing full CI/RLS/browser quality gates must pass for this candidate and it then requires separate Founder approval and production verification.
- **Not accepted by this PR:** the course-local Progress tab still uses its legacy course-filtered `nextProgressAction`, so that surface can show an unscheduled local exercise. Authenticated cross-route browser proof must include *global* Progress recommendation identity after real saved evidence and after reload, as well as subsequent course-tab alignment. The Home/REV exact-skill presentation is separately proposed in #790 and remains independent until approved and merged.
- This cannot prove two educationally adequate repairs, Psychology real-parity rechecks, full multiweek validity, complete #698 specification alignment, calibrated written marking or student learning gain. #703/#704/#705/#706 remain open.

## Documentation impact

No normative behaviour is newly decided: the existing FI-001 authority explicitly requires one recommendation source across Progress, Home, Plan and REV. This PR corrects a conflicting implementation and updates this current technical description, INDEX and deterministic regression together. No ADR/migration or historical audit rewrite is required.
