# FI-001 — Calendar-first Plan corrective release

**Date:** 20 October 2026  
**Status:** Candidate; unmerged, unapproved for production.  
**Canonical base:** `b83db167d38ba02ff997c428f31b7f725e8b10d6` (current approved main at investigation).

## Founder live observations

- In the restricted pilot, Plan displays only one recommended activity and appears otherwise empty.
- Excessive written programme preparation explanations, especially repeated per-week commentary, overwhelm Day/Week/Month.
- Returning from another page changes the selected Plan view/date.

## Supported implementation causes

1. A far-off exam's feasible-time proportional pacing sets the first-week cumulative target below the cost of a second supported activity. The first objective is exempt, but other eligible opportunities are withheld while future weeks receive them.
2. The complete `PlanProgrammeOutlook` inventory, limitations and repeated objectives appear above the calendar. No user action requests this detailed report.
3. The selected view/date is saved using `history.replaceState` but shell nav state doesn't receive a hashchange; generic Plan navigation resets to bare `#/plan`.

## Correction

- Day/Week/Month becomes the immediate focus with Week default on fresh entry; programme explanation preserved under optional disclosure below calendar. Month shows actual grounded week priorities, not invented per-day future tasks.
- Limit initial pacing starvation when multiple real supported objectives, safe prerequisites and known daily capacity allow. Never create duplicate fictional obligations; existing exam scope, booking safety and pilot exclusions still apply.
- Restore exact selected view/date when returning through learner navigation during the same Auth session. Respect direct deep links and reset memory on account transition.

## Gate

Exact-head full CI incl. desktop/tablet/phone, production-mode restricted-pilot access, visual and accessibility expectations, educational 13-scenario comparison, source-backed multi-paper scarcity safety and specific Founder PR merge approval. The original educational review #649 remains an unrelated outstanding unrestricted-release gate.
