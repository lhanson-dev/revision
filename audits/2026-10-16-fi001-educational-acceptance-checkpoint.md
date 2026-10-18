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

### FI-001 accepted-session accessibility assertion correction (17 October 2026)

[CI #38987255138](https://github.com/lhanson-dev/revision/actions/runs/38987255138) passed 1,445 unit tests, TypeScript, build, DB/RLS/security and Desktop shard 2. Desktop shard 1, phone and tablet each failed the *same* Playwright accepted-session WCAG journey **before axe ran**, because `expect(locator('.home-v3-plan-row')).not.toContainText('Marketing')` requires a single locator match while programme-first Home now renders one actual accepted session and two valid suggestions. The underlying rendered rows contained Finance, Business exam work and Business Quick; no completed Marketing activity was present. Fix: retain the explicit single accepted-session count and completion summary, and require `locator('.home-v3-plan-row').filter({hasText:'Marketing'})` to have count zero over **all** rendered rows, then run the unchanged full automated A/AA axe scan. No product implementation or tests are removed; assertion remains strict across all supported viewports. Exact-head CI required to verify. Educational acceptance of thirteen scenarios remains Partial/Not Accepted and PR #637 stays draft, unmerged.

### FI-001 responsive accessibility target-size checkpoint (17 October 2026)

[CI #39010733770](https://github.com/lhanson-dev/revision/actions/runs/39010733770) passed 1,445 unit tests, all TypeScript/static/build, DB/RLS/security, desktop (both shards) and tablet. The prior accepted-session multirow correction passed all responsive viewports. The only failure was on phone in existing cross-course `accessibility.spec.ts` at **Practice flashcards**: axe reported a serious `target-size` violation for the `.breadcrumbs > button[type=button]` course-header button (once on each retry). Source inspection shows the existing shared course CSS has a genuine `min-width` and `min-height` of `--control-height-compact: 36px`, and the preceding course and Practice screens' WCAG scans passed. The activity starts in-page and may scroll the header button into a partly clipped viewport; actual clipping versus CSS regression was not demonstrated by the logs.

The affected test now returns to a stable top-of-page viewport and waits for loaded fonts/paint, then **independently asserts the actual visible breadcrumb bounding box is at least 24px in both dimensions** before running the *same* full axe WCAG A/AA scan. If the button genuinely cannot meet WCAG size, the test still fails; no exclusions, test skips, threshold relaxation or CSS changes were made. Exact-head CI is needed to test this explanation and cannot be considered green beforehand. Product normative authority unchanged, and the 13 educational acceptance scenarios remain PARTIAL/NOT ACCEPTED. No merge authorisation.


### E-02: Align planner topic interpretations with authoritative Progress bands (17 October 2026)

**Confirmed source discrepancy:** `src/engine/knowledge/topic-knowledge.ts` uses 50% as the Low→Medium/Nearly there boundary and 75% as the Medium→Good/Got it boundary. The programme initially labelled a supported 50–54% Topic Knowledge score as `needs-work`, selected `repair` and could schedule a repeated Learn explanation. That contradicted Progress's educational classification. **Candidate correction on PR #637:** import the existing engine constants; classify below 50% as needs-work, 50–74% as developing/provisional, 75%+ as supported; use the same boundary for the weak-topic Learn treatment, and explain developing evidence without claiming exam readiness. A targeted real Business 7132 mixed-family scored case has been added to demonstrate the exact 50% boundary once CI runs. The source engine's scoring, sufficiency gate and grade claims have not changed.

**Acceptance impact:** Eliminates a specific false-weakness/avoidable remedial-work risk in SV-02/SV-10 and strengthens consistent Progress/Plan communication. This does **not** close any of SV-01–SV-13: frozen main-vs-candidate executions, full journeys, paper-skill/constraint judgement, real persistence and accessible student comprehension remain missing. **Status: HOLD; exact-head CI after this correction required.**


### E-03: Do not promote one raw answer into a planner knowledge score (17 October 2026)

[CI #39014319334](https://github.com/lhanson-dev/revision/actions/runs/39014319334) failed at TypeScript compilation because the new 50% regression fixture widened a flashcard rating to `number`, while the schema permits only `0 | 1 | 2`. Browser/DB jobs consequently failed before execution. The fixture now uses literal typed ratings; this is a test type correction, not a weakened assertion.

**Independently identified implementation issue:** `plannerCandidatesFromLearningState` had still inferred `understanding` from a raw mean of observed answer percentages. A single correct answer could thus produce `understanding=1` even where Topic Knowledge, Progress and the governed evidence engine correctly report `score=null`. It could promote an exam-question as a near-paper score-based preference without the requisite evidence. The candidate now reads the existing topic-knowledge score and leaves insufficient evidence unknown; the weak-evidence reason uses the same engine's 50% boundary. A real Business paper/topical scored fixture demonstrates the one-answer condition.

This removes a concrete misleading evidence→activity transition, but is not proof of full exam-skill progression or scenario SV-09 acceptance. Production code/assurance and technical documentation amended together, normative authority unchanged. **Status: HOLD until exact-head CI and all educational gates pass.**


### Exact-head #39015039513 findings / E-04 (17 October 2026)

[Run #39015039513](https://github.com/lhanson-dev/revision/actions/runs/39015039513) passed compilation, database/RLS, security and desktop shard 1; 1,445 unit tests passed with two failures. One test expected verified weakness/strength from one Business and three Psychology multiple-choice responses; the second expected a verified near-exam exam-question first activity from four correct multiple-choice responses. Both are insufficient under the approved Topic Knowledge minimum (six distinct content items, two families). Responsive desktop shard 2, phone and tablet additionally timed out at an absent exam-practice Start button in the same inadequate R1-07 fixture. Those are evidence-contract fixture problems caused by removing the planner's unauthorised raw-average shortcut; there is no evidence of an inaccessible existing correct exam-practice Start.

**Correction:** keep the new evidence-integrity rule, strengthen both unit fixtures and the responsive browser fixture with six distinct corroborating recall/application observations rather than changing product behaviour to reproduce an unsupported grade of knowledge. The original strict exam-question route, on-screen identity, deadline and Home/Plan/REV assertions remain. **Not yet validated at new head.** Educational 13-case acceptance and controlled same-fixture baseline comparison remain outstanding; PR #637 stays HOLD.


### SV-05 day-level feasibility correction — 17 October 2026

**Source-level confirmed defect:** Weekly preparation allocation consumed pooled weekly minutes without verifying whole candidate fit on any individual available day. Thus 10 minutes on two separate days could endorse a 15-minute objective while Day properly refused to schedule it. This is a real student-facing feasibility conflict, not merely a cosmetic calendar issue. **Candidate remediation in PR #637:** when the learner's day-level profile is known, use non-persisted day capacity buckets after known commitments and exceptions; place only indivisible objectives before their applicable paper; expose the ephemeral fit date solely to align the detailed Day projection. Never turn it into an accepted appointment or assert distant booking completeness.

New SV-05 real-course boundary tests probe 10+10 minute non-fit, adding feasible time, pre-exam cutoff and an accepted booking reducing a Saturday slot. These remain domain probes, not the full five-view, frozen baseline, expert-judged 13-case or accessible student acceptance oracle. At this writing, the change has not passed its new exact-head CI. Merge verdict remains **HOLD**.


### E-05: Today explanation lost the programme's educational purpose (17 October 2026)

**Source-proven finding:** The programme-first objective in `src/engine/planning/preparation.ts` carries treatment purpose and a real exam-linked evidence rationale. The Day/Today projection in `src/app/planner-model.ts` previously discarded these when passing selected candidates to the rank/schedule adapter. `tasksFromPlanner` then constructed a different generic priority explanation. Home and REV agreed with one another but **did not explain the education strategy emitted by the authoritative programme**; this breached the common five-view SV contract even when the recommendation ID matched.

**Candidate correction:** Carry exact programme-selected `purpose` and `reason` as optional, nonpersistent fields through the selected planner item to Home and REV. Accepted appointments and honest unscheduled fallbacks retain their distinct explanations. Business real-course unit tests and five-view browser assertions now require paper-linked rationale; no new decision owner or tutoring claim. CI not yet verified on the new head. **Educational acceptance still HOLD**, including same-input baseline, expert adjudication, complete longitudinal events and human student comprehension.

## Executed-baseline evidence method added — 17 October 2026

Previous educational checkpoint correctly recorded that same-input frozen baseline vs new implementation execution was missing. The existing draft PR #637 now includes a dedicated comparator for every SV-01 to SV-13 scenario and its defined change, running exactly the same probe under frozen previous main fd8565838db8fc27cbf359fc86d846e9ab11fda5 and the exact candidate head. It records full inputs, bounded candidate outputs, programme objectives and omissions, and verifies cross-revision equality of scenario input hashes. Exact-head CI, comparator execution and artifacts are not yet verified at the time of this record.

This is a deterministic desk-evidence comparison, not a measured outcome, expert educational sign-off or human usability study. Previous main did not model preparation objectives; missing baseline fields cannot alone establish superiority. Synthetic scores and real published content-adapter IDs do not prove real learner persistence or AO completeness. **All thirteen student-value scenario verdicts remain PARTIAL/HOLD** until objective-by-objective educational review, five-view journeys, evidence quality and accessible student comprehension are accepted. No merge authority.


### First executed same-input evidence review — 17 October 2026

[Counterfactual run #39027380930](https://github.com/lhanson-dev/revision/actions/runs/39027380930) completed successfully on frozen previous main and exact candidate PR head. All 13 fixture cases and before/after variants executed, and baseline/candidate input hashes matched. Raw artifact contained both full decision outputs and comparator JSON/Markdown. This is a **deterministic internal desk review**, not external expert opinion or a real student study. The first run supports the following provisional observations; counts represent *supported forecast opportunities* only, not complete syllabus/AO demand.

| Case | Candidate before → after: allocated objectives / unallocated opportunities | Observed educational direction and remaining judgement |
|---|---|---|
| SV-01 | 43/0 → 42/0 | New scored strong area changes first learning focus to Finance; full programme exists, but its pedagogical timing and skills/AO completeness need review. |
| SV-02 | 35/7 → 34/7 | Previously weak Business area becomes supported; remedial load reduces, first task changes; omitted need remains. |
| SV-03 | 38/3 → 2/10 | Nearer Business examination passes; remaining Psychology preparation is prioritised before its paper. Need course-share opportunity-cost adjudication. |
| SV-04 | 43/0 → 33/0 | Archiving first shared-syllabus paper reduces practice demand without removing later papers. |
| SV-05 | 38/4 → 42/0 | Added weekly availability creates four additional supported objectives; original run did not cover defined day-off exception, now rectified in fixture pending re-run. |
| SV-06 | 7/33 → 5/35 | Capacity cut reduces proposed work and increases exclusions; check if scarce time favours the right paper-answer skill versus introductory learning. |
| SV-07 | 37/2 → 36/6 | Missed week changes priorities and increases unserved work without changed knowledge evidence. Preserve accepted commitments and clear restart explanation still need actual journey checks. |
| SV-08 | 43/0 → 42/0 | Corroborated new scores shift first priority; test also includes completed activity, so isolation of completion-only semantics relies on separate coverage. |
| SV-09 | 41/0 → 42/0 | New independently scored weakness changes first task to appropriate explanation/repair; later reassessment/REV explanation not fully reviewed. |
| SV-10 | 43/0 → 42/0 | Reliable improvement removes weak-topic foundation repetition; lack of exam-answer evidence remains a concern. |
| SV-11 | 40/0 → 40/0 | Changed paper dates alter future objectives while preserving accepted input; unchanged count is not proof of unchanged decisions. |
| SV-12 | 0/42 → 6/36 | No available time produces no assignment, while adding Wednesday 30 minutes permits supported actions. Verify the actual highest-value educational omissions. |
| SV-13 | 0/0, date-only 0/30, time-only 0/0, both 30/0 | Missing inputs do not manufacture dates or scheduled capacity. Separate honest Home/REV fallback and student comprehension still required. |

**Potential normative discrepancy requiring governed resolution:** Founder-approved learner progress rules in 40-evidence-and-trust/Claims and Progress Governance.md say a learner-facing Quick check is unscored and must not alter status. Yet src/app/HomeFocusedActivity.tsx writes scored multiple-choice evidence when a learner completes a task labelled Quick check. FI-001's Learn→check and repair paths can recommend that same activity. This discrepancy must be reconciled against the approved educational treatment scope; it must **not** be silently fixed by changing evidence rules or loosening assertions. Status remains **HOLD** for the affected evidence-to-replanning acceptance.

**Priority educational reviews still missing:** verified AO/response section coverage, what the student can usefully complete before an imminent paper, conditional learning progression after an actual scored result (as opposed to forecast intentions), all five rendered views and accessible real-student comprehension. The next fixture version retains actual response-section/AO provenance and the specified SV-01/SV-05 constraints. The first successful comparison is a historical snapshot, not final acceptance.

### FI-001 second full counterfactual execution — 17 October 2026

[Same-input comparison #39027797610](https://github.com/lhanson-dev/revision/actions/runs/39027797610) PASSED on PR #637 after refining the SV-01 study pattern to four real available days, adding SV-05's specified saved day-off exception and collecting section/AO provenance. It again ran the same fixed scenarios on frozen baseline fd8565838db8fc27cbf359fc86d846e9ab11fda5 and exact candidate head, verifying unchanged inputs. For SV-05 the candidate now allocates **36 supported objectives with 6 unallocated** rather than the earlier unexceptioned 38/4. No change to normative time policy or the planner calculation followed from the fixture correction.

**Educational review finding E-06 — Business paper-specific coverage gap:** The new output identifies eight approved AQA Business 7132 paper-response sections but no verified, exact section-matched preparation candidate for any of the eight. All four Psychology 7182 Paper 1 sections in mixed-course scenarios do have verified section-mapped practice, but their matched candidate AO evidence only reports AO1. Business still has 23 actual exact exam-question opportunities in the SV-01 forecast; they are not attributable to named response sections. Inspection of the Business authored exam source showed no sectionLabel metadata despite question prompts naming Section A/B/C/D or Data Response 1/2/3, while the official guide uses explicit section names. The FI-001 planner correctly refuses to infer the mapping and visibly reports the unmet response demands. **Not a code scheduling failure; a verified-content provenance and educational acceptance dependency.**

**What can responsibly be concluded:** Baseline comparisons now confirm that circumstances and scored evidence change the candidate's decisions, and that it does not force an impossible no-time schedule. They do **not** establish that it selects the *best* time allocation or adequately prepares Business written-answer skills. Real student comprehension, qualified educational review, authentic persisted scored activity/replanning and subject/paper-specific AO coverage remain open. SV-04, SV-06 and SV-12 merit priority scrutiny. Full PR verdict remains **HOLD**. No asset metadata has been invented or changed.

**Terminology clarification:** The earlier Quick check discrepancy requires distinguishing the unscored Learn QuickCheck (governed FI-001 R1c case) from the separately implemented, scored Home Quick check. They currently share a learner-facing name; the proven issue is ambiguous evidence provenance and explanation, not proof that unscored Learn checks are being incorrectly persisted. Keep source-specific scoring unchanged pending governed experience review.


### E-07: Scored Home questions were mislabelled as unscored Quick checks (18 October 2026)

**Confirmed authority/code drift:** Founder-approved learner Progress says a Quick check is unscored. The canonical `HomeFocusedActivity` question writes `learning_evidence` through scored `createMultipleChoiceEvidence` but appeared to the learner under the same “Quick check” label as the genuinely unscored Learn component. Wholesale suppression of scores would silently invalidate real Practice activity and undermine the FI-001 evidence loop. **Bounded candidate repair:** use “Practice question” consistently for the scored `quick-check` internal intent in Home, Plan and REV, plus a plain scored-evidence disclaimer on the focused activity. Keep the separate unscored Learn QuickCheck unchanged. No normative change or new scored evidence is introduced. Update existing exact-identity browser assertions and add shared activity-label unit regression. **Acceptance: still HOLD** pending exact-head CI, multi-view experience confirmation and authentic evidence/replanning journeys. Any protected visual diff remains subject to existing visual governance; no silent repin.


### E-07 exact-head regression #39116363394 — changed-text assertions and protected visual hashes (18 October 2026)

The first scored-Practice disambiguation commit `defa8b8a` passed static/unit/build and database/RLS but browser assurance failed for **two different reasons**. (1) Existing R1c, R2c and Returning Home tests expected “Finance — Quick check” and “Start quick check”, while the authentic common Home/REV output now correctly says “Practice question”; the Start target and stored evidence schema are unchanged. The affected assertions were updated to the new name, keeping their original identity/route/replanning and accessible action checks. (2) The approved Home visual digests changed for desktop light/dark and phone light/dark because the exact hero/activity copy changed. **Do not silently repin these hashes or weaken the assertions.** The four affected visual references require separate Founder approval or a deliberately approved alternative experience correction. Until then, exact-head CI cannot be considered green and PR #637 remains HOLD. No original design-baseline approval is retroactively transferred.


### E-07 Founder visual acceptance boundary — 18 October 2026

The Founder explicitly approved only PR #637's four scored `Practice question` Home screenshot baselines at reviewed head `2f9c286b52a2b54e1ae5948d1206547317a615cb`, desktop/phone light/dark. The replacement SHA-256 values come from matching exact-head CI #39116844038 and #39116363394. `tests/e2e/interface-visual-regression.spec.ts` changes only these four protected values and adds a provenance comment. The approval, exact values and limits are recorded in `audits/2026-10-18-fi001-home-practice-visual-approval.md`. **No merge, release, content section-mapping approval or educational SV-01–SV-13 acceptance is inferred.** New exact-head CI is required. All educational HOLD conditions remain unchanged.
