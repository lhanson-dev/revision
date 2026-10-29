# Issue #694 — real-course horizon diagnostic

**Status:** non-production diagnostic candidate; no scheduling behaviour changed.
**Canonical route:** `/revision/app/#/plan`, React/Vite PlanScreen; Home/REV consume the same preparation decision.
**Normative source:** `10-product-governance/Adaptive Revision Planning.md`.
**Evidence:** `src/app/planner-recovery-694.test.ts` using published catalogue adapters for Business 7132 and Psychology 7182.

## Falsifiable finding
The current preparation allocator assigns each supported candidate ID at most once through the whole exam horizon, then removes it from the outstanding set. No scored learning or additional supported assessment opportunity is inferred solely from spare time. Therefore some future weeks can have spare capacity and no allocated objectives. The new fixture explicitly detects this condition using the current real published adapters, recorded paper dates and 45/60-minute availability, and separately ensures the 14-day executable schedule never exceeds capacity.

This is a **diagnostic** that describes current code, not a passing product-acceptance assertion. The number of empty weeks, individual educational omissions and an actual signed-in learner account's outcome remain to be evaluated. A future change removing sparse weeks must replace this diagnostic with an evidence-backed acceptance test rather than simply disabling the check.

## Distinct remaining gates
1. Run exact-head CI and inspect this diagnostic's actual results; do not claim it passed until observed.
2. Review the real course's supplied Learn/Practice/Exam Prep opportunity coverage, candidate depletion and paper-specific limits.
3. Specify permitted pedagogical re-check and retrieval cadence based on genuine supported assets and evidence; never invent a fixed-repeat debt cycle.
4. Where the proposed work goes beyond FI-001's approved R2 Ready boundaries, complete the Definition-of-Ready and explicit Founder approval before implementing product behaviour.
5. Run authenticated browser/database acceptance for exam date changes, accepted sessions, progress updates, Week/Home/REV consistency and multi-course balance.

## Documentation impact
No new normative rule. This candidate adds regression/diagnostic evidence plus technical explanation; retain existing authority and historical audits unchanged.

## 29 October 2026 — P0, genuinely empty Plan despite known configured data

The Founder reported no visible planned activities on canonical `/revision/app/#/plan` after #695 (future-week objectives) and #696 (sparse-horizon diagnostics) deployed. Issue #694 was reopened; neither previous PR proves learner acceptance.

A read-only production **aggregate** query (no account identities or answer text) found one learner with four future assessments against AQA Business 7132 and Psychology 7182, correctly matching course membership, whole-course `scope={}`, `module_id=NULL`, and 225 known weekly minutes (45 minutes on five days). No accepted/manual sessions exist in the `learner_planned_sessions` table; this is compatible with derived auto-planned recommendations and is not a reason to show none. The configured learner has 84 past learning evidence events. There are also additional learner accounts with course membership but no full planner configuration. **These facts do not establish which authenticated account or Plan date/view the Founder was using.**

The app's `PlanScreen` displays detailed automatic suggestions from a 14-day snapshot; more distant weeks display provisional supported objectives. If loading assessments/evidence fails, the screen resets learning state; if near-term accepted-session loading fails, the detailed snapshot is disabled. The first reproducibility gate therefore must distinguish missing setup, returned data/error, real candidate scarcity and the browser display path rather than invent sessions or assume every calendar day needs a task.

PR #702 adds a published real-course synthetic regression using matching whole-course assessments and availability, plus a second scenario with accumulated *synthetic* evidence. It also adds an isolated **real Auth/PostgREST browser journey** (not intercepted requests) that creates a disposable ordinary learner, persists both courses, future exams and study capacity, checks that Week shows at least one actual suggested activity, reloads and verifies persistence, then removes the account. The runner rejects production Supabase URLs. This does **not** independently reproduce the Founder's own signed-in state, guarantee educational sufficiency through the last exam, or authorise a speculative scheduling fix.

**Acceptance remains P0 OPEN** until a real user's current Week page visibly shows supported scheduled activities (or a truthful, evidenced missing-input explanation), following week/day and progress changes remain coherent, long-horizon future objectives are meaningful, and actual browser data-load errors have not been hidden as an empty calendar. Any behavioural fix needs specific Founder-approved PR merge and live release verification. Broader assessment accuracy remains a separate educational acceptance gate.

## 29 October — screenshot-backed acceptance gap and limited Month visibility correction

Founder-provided screenshots of the production Plan on 29 October show one Business Marketing Learn task (15 minutes) on the current Thursday of a 225-minute availability week, and November Month with only a single early-month study marker and no useful visible forecast. Saved exam countdowns confirm that valid relevant assessments are being displayed. This is **not** an empty-missing-configuration reproduction: the UI is displaying the existing planner's limited output.

The decisive code distinction is that `buildPreparationProgramme` (programme-wide work) meters its finite, deduplicated candidate set across all weeks until the last exam, while `PlanScreen` maps only the first 14 days of its near-term results to calendar dates. The ordinary Month view was rendering those dated entries only. Supported week-level priorities were already available through `PlanProgrammeOutlook`, but hidden under a long-term disclosure.

The bounded draft correction in this PR exposes the **existing** programme's weekly objectives immediately beneath Month, labelled provisional, with estimated supported minutes and View week links. This does **not** manufacture appointments, infer answers, create activity candidates, change scoring, or promise that the 225 weekly minutes are usefully planned. The preview and disclosure both consume the same `fullProgramme`; this is not a second planner.

**Separate unresolved P0:** the actual decision allocates too few useful tasks (one 15-minute task for the screenshot's week), and finite candidate inventory leaves future weeks unallocated. The app must improve educationally supported opportunity inventory, paper-demand mapping, revisits/checkpoints and/or planning policy under the Ready/approval lifecycle and simulation requirements in `Adaptive Revision Planning.md`. Blank weeks must not be disguised as a completed revision programme. The screenshot and programmatic quality checks below are necessary but not sufficient to close #694.

Acceptance for the Month presentation: November displays any genuine weekly objectives without falsely painting them on specific dates, explains periods with no allocated objectives, links to the chosen week, and maintains truthful Home/Plan/REV coherence. No current student data was changed and no database migration is needed.

## 29 October urgent learner-test patch — evidence-building work in rolling 14 days

After the Founder clarified that detailed dates should roll over approximately 14 days, while the whole-programme budget remains strategic, this draft PR now includes a narrowly scoped allocator correction. Where an ordinary learner has a valid future exam, actual saved weekday capacity, a supported published action and unknown scored understanding, the **near-term 14-day forecast** may place that real acquisition/independent-check activity without amortising the entire small candidate list across 33 distant weeks. Actual daily capacity, prerequisite Learn-before-Check sequence, nonduplication, course/assessment scope and exam cutoff remain enforced. For demonstrated understanding or distant weeks, the existing pacing policy remains intact.

This changes how soon existing supported opportunities are suggested; it creates **no new questions, checkpoints, unapproved recurrence rule or mastery evidence**, and does **not** claim that the 36 available candidates / 428 minutes reflect the genuine whole-subject revision workload. The evidence-led periodic reassessment programme, whole-exam time-to-complete model, shortage prioritisation, and appropriate learner reassurance remain **unimplemented** and require their own scoped Definition-of-Ready/product and educational assurance. They are recorded on issue #694 as the immediately following governed acceptance programme.

A regression with actual AQA Business/Psychology published packs now rejects a return to one 15-minute recommendation for this fully configured fixture, and checks both saved courses contribute to near-term planning. Existing production-auth synthetic browser acceptance confirms the full 14-day forecast appears at all, but cannot alone prove the quality or sufficiency of the new allocation.

**Safety/assurance boundary:** The corrected scheduling is a claimed R2 defect remedy, not an R3 replacement algorithm. If new checks reveal unsafe subject starvation, missing prerequisite logic, or unsupported activity scheduling, stop and correct before merge. No release or family readiness claim may be made from a branch-only result, and no merge occurs without Founder approval for PR #702.

## 29 October 12:16 — returning-learner gap, authored retrieval opportunity (#709, draft)

**Live acceptance counterexample after #702:** 2–8 November still has nine eligible activities (81 minutes), clustered into Monday/Tuesday, with Wednesday–Friday containing 135 minutes of unused available time. This is a **core product outcome failure**; do not declare the student ready to use the timetable or extrapolate a full 225-minute work requirement from that screenshot.

The first diagnosed inventory loss in main is `plannerCandidatesFromLearningState` producing one selected Practice mode per coarse topic. Even where real course content has both original independently assessable flashcards and scored objective questions, only one mode is represented in the programme. `buildPreparationProgramme` then consumes each candidate once as a forecast, not as achieved knowledge. Greedy earliest-day fit clusters that limited inventory.

The controlled R2 correction in **draft PR #709** makes an *additional, distinctly authored opportunity* available when a scoped topic has scored questions and **previously unattempted flashcards**:
- uses the approved course adapter's actual card IDs only, capped by existing eight-card focused activity;
- selects a stable content-specific candidate with the course/assessment provenance and existing Learn prerequisite where required;
- carries those exact card IDs through PlannerItem → HomeTask → Home/Plan focused Start so the learner answers those cards, not the same first cards from a generic deck;
- reads previously persisted learning evidence to select remaining unattempted assets on the next calculation; no unscored reading, click or calendar appearance is evidence of competence;
- preserves daily study time, paper deadlines, owner evidence, exact card completion and existing study modes.

This is **not** an automated repeat/retest scheduler: a previously attempted card is not silently presented as new content, and subjective flashcard confidence does not create a certified exam mastery score. Nor does this calculate full syllabus demand; future work must use requirements/paper skills, purposeful review, evidence-triggered repair, remaining work and capacity, as already governed by `Adaptive Revision Planning.md` and #694. The approved FI-001 programme-first vertical slice is Ready; specialist FI-009–012 algorithms are not authorised by this correction. Formal educational assurance of the available assets remains #698.

**Proof obligations before release:** exact-head static/unit/build and responsive CI; real authored Business/Psychology regression for the candidate, Start and changed evidence; cross-surface coherence; returning-learner dated simulation showing actual improvement without claiming all weekdays must be filled; no unjustified repeat or false activity. Human approval for PR #709 is required individually. The screenshot P0 remains open until sustained learner acceptance, regardless of successful CI.

**Documentation impact:** this is implementation evidence in `docs/technical/` accompanying the code, not a change to normative planning policy or a rewrite of prior investigation.

### Measured returning-learner counterexample (CI diagnostic, 29 October)

The first exact-source run of `src/app/plan-retrieval-inventory.test.ts` used 84 **synthetic** authentic-source attempts spread over 21 Business/Psychology topic placements, with four future exams and five 45-minute weekdays. It found **36 current candidate opportunities** including **18 additional genuine, unattempted flashcard retrieval candidates**. The November 2–8 rolling forecast allocated **42 / 42 / 42 / 40 / 44 minutes on Monday–Friday, with both weekend days at zero**, compared to the Founder's screenshot of **40 / 41 / 0 / 0 / 0**. This is 210 of 225 known available minutes and shows *real, additional authored material* rather than redistributed placeholder calendar blocks.

This is **not a claim that the student's actual 84 recorded answers match the fixture**, that five days must always be filled, or that the entire syllabus is covered. The test explores what the current published assets make genuinely executable with one returning learner profile. The same run had two legacy assertions that assumed a single Practice mode per topic; those have been updated to assert distinct objective-check/retrieval modalities and preserve the rule that authentic exam response work never depends on a generic check. A fresh exact-head test run must pass before any release claim.

Remaining hard boundaries: no arbitrary forgetting curve, no automatic reattempt of previously answered cards, no inference that unattempted cards exhaust course need. Future unassessed/weak content and paper skill assurance remain mandatory in Gate B of #694 and whole-course educational audit #698.
