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

## Opportunity omission explanation — 16 October 2026

**Evidence-based finding:** `buildPreparationProgramme` already returned `unserved` supported objective records, but Plan previously gave a count (and requirement rows requiring expansion), not an immediately legible, course-specific explanation of what the current plan cannot fit. **Student-value risk SV-05/SV-06/SV-12:** a 0/30-minute learner could mistake an incomplete programme for adequate preparation. The PR candidate now groups/labels true unallocated supported opportunities by course/topic and target date, exposes the initial three without hidden clicks, and discloses the remainder. It explicitly cautions that this **is not complete syllabus/AO demand** and that a topic missing from the schedule is not secure. This is a presentation/provenance improvement, not a new pedagogical optimiser. A new responsive SV-12 path checks zero known weekly capacity, two real subject-paper obligations, named unserved topics, no falsely assigned work, and the difference between zero time and missing time.

**Still insufficient for acceptance:** the logic may not yet select the educationally *best* omissions or explain detailed subject-level opportunity costs within REV; no held-out baseline comparison, exam AOs/prerequisites judgement or observed real learner comprehension has been done. Scenario SV-12 remains PARTIAL until these pass. New exact-head CI must succeed. No Founder merge approval has been requested.

## Integration of main #644 QA correction (16 October 2026)

The approved main branch advanced seven commits to `7e253fa5`, overlapping the candidate's screenshot readiness and R1-11 first-use stability checks. The main Plan visual stability rule expects a settled calendar summary; on FI-001 PR #637's **approved unconfigured Plan design** that would be a false expectation. The branch now waits for settled actual guided setup instead, with Plan loading indicator absence and exact protected image hash. Main's improved first-use screenshot readiness and equivalent R1-11 transition rules were accepted. This integration does not alter scheduling, domain educational rules, accepted student commitments or approved visual pixels. New exact-head CI and all 13 educational acceptance judgements remain required; the PR is still HOLD and no merge approval is inferred.

## Expert educational desk review and remediation: 17 October 2026

**Review basis:** normative `10-product-governance/Adaptive Revision Planning.md`; frozen thirteen-case expected outcomes in `10-product-governance/backlog/FI-001 Programme Value Scenarios.md`; source inspection of `src/app/planner-model.ts`, `src/engine/planning/preparation.ts`, `src/app/PlanProgrammeOutlook.tsx`; real-content domain tests and responsive browser checks. **This is a source/evidence gap analysis, not the required same-input production-baseline execution, human review of rendered outputs, or learner study.** The previous green CI #38932984112 was superseded by [#38971354659](https://github.com/lhanson-dev/revision/actions/runs/38971354659), which failed only desktop Plan Light/Dark screenshot checks because the #644 merge added an assertion that `.pln-nav` exists even on the *approved guided setup* state. All non-desktop-shard-1 jobs passed. The current branch fixes the test to assert guided setup and no `.pln-nav`, retains loading checks, font/paint settling and strict hashes. New exact-head CI is required.

### Scenario-by-scenario educational verdicts (no artificial 13/13 pass)

| Case | Real approved-paper/candidate evidence | Educational verdict and missing proof |
| --- | --- | --- |
| SV-01 New learner | Shared Business paper knowledge, future horizon, first Learn then check, supported Start/browser trace | **PARTIAL:** no expert score of the whole period's phase quality; no observed learner clarity |
| SV-02 Uneven evidence | Published mixed-evidence domain + browser status changes; weak-topic supported Learn→check candidate and sequencing now strengthened | **PARTIAL:** insufficient verified long-range targeted gap/skill distribution and independent educational adjudication |
| SV-03 Two subjects | Both genuine Business/Psychology obligations and nonzero feasible allocation proven | **PARTIAL:** no compared warranted allocation ratio/opportunity cost or weekly no-starvation evidence for authentic mixed mastery |
| SV-04 Three Business papers | Shared obligations deduplicated, eight source-derived paper sections, date-safe response candidates | **PARTIAL:** cannot prove complete and timely AO/response progression for all papers |
| SV-05 30 minutes/week | Real-course capacity and indivisible-task bounds; both subjects have feasible work | **PARTIAL:** no justified ranking of scarce time against omitted learning/AO demand |
| SV-06 Late start | Date-safe paper deadlines and short horizon | **PARTIAL:** insufficient demonstrated educational triage of learning versus exam technique |
| SV-07 Missed week | Recalculation does not convert absence to weaker scored knowledge | **PARTIAL:** no full five-view resumption explanation or commitment continuity review |
| SV-08 Extra completion | Completed unscored work is not mastery; active saved choices suppress duplicate suggestions | **PARTIAL:** no authentic excess-scored-work advancement and next-objective transition adjudication |
| SV-09 New weakness | Latest distinct scored evidence reduces topic status; supported explanation candidate added when a published Learn page exists | **PARTIAL:** verify scored-event persistence through real activities, later retest appropriateness and on-screen reason |
| SV-10 Improvement | Latest scored content reclassifies a topic and suppresses unnecessary foundation reread | **PARTIAL:** no supported proof of appropriate independent exam-answer progression after improvement |
| SV-11 Moved exam | Actual paper dates update Month/Week/Home/REV tests | **PARTIAL:** needs expert reallocation and accepted-session validity review after a deadline moves |
| SV-12 Impossible time | Named, grouped real course-topic *supported opportunity* omissions in Month plus zero-capacity browser evidence | **PARTIAL:** supported-candidate minutes do **not** measure total course, AO or response-skill workload |
| SV-13 Missing inputs | Honest guided setup and usable unscheduled Home; typed REV no-date response tested | **PARTIAL:** mixed known/unknown one-input cases and genuine learner comprehensibility remain unproven |

### First substantive educational finding and correction

**Finding E-01 (real, not just missing test):** `preparationCandidatesFromLearningState` previously generated an assured Learn→check sequence only for zero observed content. For a **sufficiently evidenced weak topic**, it returned a scored check/flashcard intent directly, despite an approved Learn page potentially being available. A programme could therefore label the work 'repair' without containing a pedagogically useful explanation step.

**Correction on PR #637:** If the evidence-engine's validated topic score is below 55% *and* the course adapter exposes an exact approved Learn page, create a distinct supported explanation opportunity before the existing check; preserve `understanding` and `evidenceStatus='needs-work'` throughout, avoid unsupported content, preserve the check prerequisite and all paper deadlines. New real Business fixture asserts the weak Learn→check ordering and that new sufficient strong evidence removes the unnecessary Learn repeat. An intermediate nonzero *unscored/inconclusive* evidence state does not manufacture a weakness or force a fresh Learn page. This is a bounded opportunity-sequencing improvement, **not** a new mastery algorithm, FI-009/010/011/012 feature or guarantee of future scored gain. The candidate requires new exact-head CI before claiming successful implementation.

### Hard-stop educational acceptance gaps

1. Frozen **identical fixture** execution and recorded metric-by-metric comparison against approved main baseline `fd856583` for all thirteen, not just inferred code differences. Current source comparison does not satisfy this.
2. Expert per-week educational judgements of topic/skill prerequisites, actual published response/AO mappings, authentic activity Start, realistic daily exceptions/timezone and defensible course share for sparse time.
3. A **real student accessible comprehension test** of why a task is suggested, what is deliberately unallocated, how to begin, and how the plan changes after an evidenced event. No claim of educational efficacy or better grades until independently evaluated.
4. Hold any PR merge when scenario or hard-gate evidence is absent, even if all CI jobs are green. The Founder alone can authorise merge PR #637 after the governed requirements are met.

**Documentation impact:** `docs/technical/Adaptive Revision Planner Implementation.md`, the Assurance Coverage Register and this historical audit are updated in the same branch. The approved normative educational strategy is unchanged. History stays as recorded.

### FI-001 weak-topic scenario test typecheck correction (17 October 2026)

[CI #38986002132](https://github.com/lhanson-dev/revision/actions/runs/38986002132) failed at TypeScript typechecking in the new SV-02/09 Business test. The ISO date string passed to Vitest's numeric toBeGreaterThan matcher caused a TS2345 error; every Playwright webServer-dependent job subsequently failed to start, propagating to Foundation Quality. The test now compares lexically ordered YYYY-MM-DD keys and asserts the boolean, preserving the deadline requirement. No production code, accepted visual digest or normative product rule is modified. A fresh full exact-head CI is required; educational acceptance remains PARTIAL/NOT ACCEPTED.
