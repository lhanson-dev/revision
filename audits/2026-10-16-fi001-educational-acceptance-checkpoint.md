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
