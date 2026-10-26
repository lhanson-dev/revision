# Planner future-week visibility correction — Issue #694

**Status:** Candidate on governed branch; not merged or verified live.
**Canonical runtime:** React/Vite learner application at `/revision/app/#/plan`; `src/app/PlanScreen.tsx` renders Day/Week/Month from `buildPlannerSnapshot`.
**Authority:** `10-product-governance/Adaptive Revision Planning.md` and `10-product-governance/Product System Model.md`.

## Diagnosed presentation disconnect

On approved main at the investigation baseline, Plan's detailed recommendations use `DETAILED_PLANNER_HORIZON_DAYS = 14`. The full-horizon `buildLearnerPreparationProgramme` result is computed separately and rendered inside a collapsed "Explore your longer-term preparation and any gaps" disclosure. Thus the ordinary Week calendar may show no recommended tasks beyond 14 days even when the programme contains preparation objectives for that week. This does not establish that all missing work is solely a UI problem; candidate exhaustion, unmet asset coverage, availability and preparation allocation require separate end-to-end examination.

## Narrow correction

For Week navigation beyond the rolling 14-day exact-task window, show that week's existing `fullProgramme.weeks[].objectives` directly below the calendar. Display course/topic and intended treatment as **provisional objectives, not appointments**. Where no objectives are allocated, explain zero/unknown availability or absence of currently allocated supported objectives without claiming course completion. The same existing programme remains the authority; no planner calculation, persisted commitment, educational evidence or exam scope changes.

## Acceptance and remaining HOLD

- Verify configured Business 7132 and Psychology 7182 logged-in Week navigation into weeks 3+, including weeks with supported objectives and genuinely unserved objectives.
- Verify Day/Week/Month, exact Start, Home/REV agreement, session persistence and changes to capacity/progress/exam dates. The small presentation change does not satisfy these by itself.
- Run current-main integration tests, accessibility checks, responsive visual checks and production smoke after explicit Founder approval/merge.
- Investigate whether `buildPreparationProgramme` produces appropriate distributed objectives through the last paper; UI visibility is **not** proof of full programme educational completeness.

## Documentation impact

Existing normative requirements already demand a full-horizon meaningful outlook; this correction is within that authority and does not amend policy. This document records implementation behaviour and outstanding assurance. Historical reports remain untouched. Public-launch register has no new launch-specific privacy/children's-data processing obligation because this change only displays existing calculated objectives; normal launch gates remain applicable.
