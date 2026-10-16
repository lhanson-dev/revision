# FI-001 — Student-value acceptance checkpoint (16 October 2026)

**Status:** HOLD — bounded candidate assurance only. **PR:** [#637](https://github.com/lhanson-dev/revision/pull/637), draft. **Normative authority:** `10-product-governance/Adaptive Revision Planning.md`. **Acceptance oracle:** `10-product-governance/backlog/FI-001 Programme Value Scenarios.md`. This audit is historical evidence, not authority or authorisation to merge.

## Proven scope

The initial 13 **domain-level** real-adapter scenarios in `src/app/planner-programme-scenario-safety.test.ts` exercise date eligibility, missing evidence, shared paper identities, coarse week capacity, missing/changed time, unscored completion semantics and synthetic scored evidence changes. Their **names do not constitute educational acceptance**.

The candidate has additional **responsive browser** paths in `tests/e2e/planner-programme-five-view.spec.ts`: SV-01 and SV-04 combined (three-paper Business 7132), SV-03 (Business and Psychology), SV-11 (changed paper dates), and SV-13 (missing dates and availability). Tests use approved published paper IDs, fixed dates and controlled network rows, not genuine learner progression. Run #38893190109 established green engineering CI **before** the SV-13 and visual-settling extension; the new head needs its own results.

## Scenario-by-scenario coverage and unresolved educational criteria

| Scenario | Existing automated evidence | What is still missing for a Pass |
|---|---|---|
| SV-01 New learner | Domain: all Business papers, unknown knowledge; browser: five-view first action, Start and far month | Independent quality review of explain → check → apply progression and scored-change follow-up |
| SV-02 Uneven understanding | Domain: genuine course topics with strong/weak synthetic scores | Full five-view gap-repair programme, recheck phase and result-driven transition |
| SV-03 Competing subjects | Domain: two course demands, bounded capacity; browser: both courses and shared next action | Justified course share, no starvation over weeks, exact workload/skill trade-offs |
| SV-04 Shared syllabus | Domain: distinct paper sections and shared knowledge; browser: three-paper route and Start | Verified paper-specific response-skill progression and no obsolete post-paper practice |
| SV-05 Thirty minutes | Domain: no over-allocated week | Five-view impossible-capacity trade-offs and full-activity fit after capacity changes |
| SV-06 Late start | Domain: deadline cutoffs | Feasible learning/technique triage shown and explained across all five views |
| SV-07 Missed week | Domain: rollover keeps unknown knowledge unknown | Five-view missed-session recovery and genuine accepted booking continuity |
| SV-08 More completed | Domain: done/unscored is not mastery; planned is not duplicated | Scored extra work changes Month/Week and next action without busywork |
| SV-09 New weakness | Domain: revised supported→needs-work using same-item scored observations | Real saved scored evidence, repair/retest path and five-view explanation |
| SV-10 Improvement | Domain: needs-work→supported with real course topics and synthetic scores | Appropriate independent practice phase and follow-up, not declared paper readiness |
| SV-11 Exam moved | Domain: recomputed paper horizon; browser: changed deadlines and shared action | Accepted-session review, changed constraint prioritisation and complete five-view educational judgement |
| SV-12 Infeasible | Domain: zero-capacity unserved supported activities | Credible whole-syllabus plus AO/response-skill demand and five-view honest omissions |
| SV-13 Unknown setup | Domain: no fabricated horizon/capacity; new browser: Home, Week, Month, Day, REV | Exact unscheduled fallback parity and independent student clarity when one input is known and the other unknown |

**Remaining cross-cutting hard gates:** same-input frozen current-main `fd856583` versus PR-head result comparison, authentic publication/asset exact Start on all selected treatment pathways, correct option and paper response scope, daily availability exceptions and DST, non-starvation across subjects, programme recomputation after real evidence/events, trusted feasibility across total specification demand, and accessible real-student comprehension. Unknown or absent evidence must remain unknown. **No claims of measured educational efficacy or grade impact.**

**Founder merge authority:** Not granted. The Founder approved the two Plan visual baselines only. Expert review, original acceptance evidence and explicit approval of **merge PR #637** remain separate. This audit intentionally retains partial results.

## Reconciliation after CI #38896618089 (16 October 2026)

CI showed SV-13's no-date REV question **cannot** be offered as a suggestion chip, by design. The test now exercises the supported typed question and expected truthful reply, without making a false product defect or hiding the scenario. SV-03 and SV-05 now assert actual allocations to both courses over the full horizon with known feasible 30-minute weekly slots. The old tests checked only that requirements existed, which did not establish non-starvation. These assertions are domain-level and do not prove the educational appropriateness of weekly timing, treatment sequences, AO coverage or trade-offs. The full Founder-approved student-value gate remains HOLD; outcomes depend on the new exact-head CI.

## Post-CI #38908654724 — controlled longitudinal scored evidence path (16 October 2026)

Static/unit/build and phone/tablet were green. Desktop R1-11 existing first-use test stalled on a correctly disabled Continue button; the candidate now waits for an enabled button **and a new question** between answers, as already required by the sibling first-use test. This does not declare the R1c educational boundary passed without re-execution.

A new E2E candidate tests SV-02, SV-09 and SV-10 evidence classification using actual published AQA Business module/topic identity and valid synthetic records returned by the real persistence-read route. Six separate observations across recall and application for each topic, plus newer replacement observations on the same content IDs, must produce the corresponding needs-work/supported/unknown messages in the rendered programme. Home, Week and REV must agree on the next action after changed evidence. The test does not prove real saved user events, real assets, full AO-demand strategy, long-term spacing or expert educational benefit. Do not mark any of the three scenarios Accepted until the complete frozen learner-value oracle and human comprehensibility checks are adjudicated.

## CI #38909740946 staged evidence fixture finding (16 October 2026)

The new browser SV-02/09/10 test failed in all three responsive suites because its second round of synthetic persisted score rows was injected into the mocked Supabase GET response without remounting the same Plan route. At the identical hash route, `page.goto` did not reload the learner state; this is a test lifecycle error, not proof that latest-per-content scored-evidence handling was wrong. The new test enforces a true reload and an incremented evidence GET after each stage, then verifies low/strong→strong/strong→strong/low status messaging, no invented full-paper mastery and stable Home/Week/REV next-task identity. This is **reload-driven** adaptation, not a verified no-reload push update. The stage-by-stage browser result is pending new exact-head CI. The 13 expert educational and human-comprehension verdicts remain open.
