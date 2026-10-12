# Evidence-led Adaptive Planner — Algorithm and Benchmark Contract

**Status:** Proposed R0 design contract; non-authoritative; not approved for implementation.
**Date:** 2026-10-12. **Current approved main checked:** `c4e990bc35682bd80815fdde221f57c9823f0c86`.
**Companion:** `research/Evidence-led Adaptive Planner Proposal - 2026-10-12.md` and `research/Evidence-led Planner Learning Science Register - 2026-10-12.md`.
**Scope owner:** FI-001; integration dependencies FI-006/009/010/011/012. All scoring thresholds, ratios and intervals below are **engineering test hypotheses**, not scientific optima.

## Decision to promote after human review

### D0. One planning engine; hard rules before optimisation

A deterministic, testable domain engine produces the authoritative recommendation set used by Home, Plan and REV. Learner, assessment and curriculum state and validated evidence feed one engine; no LLM schedule source or shadow mastery model. Separate data transformations are allowed; separate competing priority policies are not.

The order is **hard constraints → coverage/capacity feasibility → programme balance → near-term opportunity ranking → explanation**, not “score every topic once and fill the calendar”.

#### Hard invariants (fatal failures, not tradeable for utility)

- All target courses are actively saved, scoped to the correct exact specification and current learner identity. Respect privacy, permissions and existing entitlements.
- A task tied exclusively to paper P cannot be scheduled **after the start of P**. If exam start time is unknown, no paper-specific revision task should be placed on the calendar date of P by default. Cross-paper knowledge remains eligible only if a later relevant paper still needs it. Do not schedule a full paper mock unless the available uninterrupted window can accommodate the true duration.
- In-scope educational tasks must point to real, eligible and assured Learn/Practice/Exam Prep assets. Where the task is unsupported, offer a truthful supported alternative or disclose unmet need rather than a broken link or fictional study work.
- Each day’s total proposed minutes must not exceed the date-specific capacity after subtracting **accepted, non-skipped** sessions. Do not infer available minutes when missing, and do not fill all free time without useful activity.
- A shared knowledge/skill obligation must have one stable curriculum identity even if assessed by multiple papers. One objective attempt can legitimately produce multiple links only within its assured scope; **do not count duplicated assessments as repeated learning evidence**. Component-specific exam technique is a separate obligation.
- Starting-check-only and unscored Quick-check events are prohibited from positive understanding/readiness updates. Planning history and self-report are not valid mastery proof. Progress updates use the governed evidence engine and provenance, not a planner-side substitute.
- No mandatory weekly study, fixed daily subject count, shame-labelled overdue task ledger or unrealistic exam guarantee. Choice, accessibility and safe fallback remain available.
- Plan extends from local today to **final known active public paper/assessment** without artificial day cutoff, while only the bounded near-term view assigns specific activities by date. If no dates are known, generate a **rolling study strategy without exam claims**, not a fictional “last exam”.
- Determinism: equal inputs, engine version and calendar/timezone produce identical outputs and reason traces; deterministic tie-breaks must use stable IDs.

### D1. Separate course demand, actual opportunity and educational evidence

Represent `Obligation` as stable (course ID, curriculum node or AO/response skill, required demand, valid paper IDs). Store coverage/evidence scope separately from planner task IDs. Represent `Opportunity` as an approved activity with assessed skill scope, intended teaching/retrieval/exam treatment, estimated **range** of time or bounded duration, prerequisites, repeatability and current eligibility. Do not create a task merely because a topic is uncovered if no meaningful asset exists.

Evidence data reference the **existing** readiness/understanding source of truth: quality/marking method, recency, breadth, multiple observations, contradiction and relation to question demand. Use null/unknown rather than pseudo-zero for absent data. Planner may decide a check is useful because confidence is low; it must not automatically lower the understanding score because N days have passed.

#### Course Paper profile reference fixtures

- **AQA Business 7132 (2027 cohort):** three 2-hour, 100-mark papers (one-third each); all three can assess all course content but assessment formats differ (Paper 1 MCQ/short/essay, Paper 2 data response, Paper 3 case study). Therefore shared topic identity plus distinct format obligations. Official: https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance
- **AQA Psychology 7182 (2027):** three 2-hour, 96-mark papers; paper-specific compulsory content and Paper 3 option selection, with research-methods assessment also appearing in relevant other paper demands. Only **selected** options and assured scope may be scheduled, not all nine optional topics. Official: https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/specification-at-a-glance

Do not assume all Business content is equally examinable in the same response form or that Psychology Paper 3 option choices can be inferred from incomplete data.

### D2. Programme construction (calendar until final known exam)

1. Normalize active course IDs, permitted exam/paper structures, optional known dates, selected Psychology options, preferences and local calendar. Drop inactive/past assessment targets but preserve historical evidence.
2. Derive the relevant **per-paper** knowledge and skill obligations from assured course/exam truth. Deduplicate genuinely shared nodes and retain paper-specific response skills.
3. Inventory evidence for obligations: confirmed need, low evidence or no evidence, inconsistent/stale evidence, demonstrated recall without exam transfer, validated strengths.
4. Construct available capacity calendar from recurring availability and date exceptions, deduct accepted sessions, and mark **paper cutoff** windows. Unknown capacity is represented as unknown (does not become 0 or assumed 60).
5. Group future time into weekly planning envelopes and feasible preparation phases. Identify coverage, revisiting, repair and authentic practice *milestone opportunities* per relevant paper. Do **not** schedule a fixed sequence of dated tasks up to the exam.
6. Compute feasibility by exam: known capacity before the paper versus **coarse estimated demand range**. Show a factual prioritising state only when supported, distinguishing workload estimates from exact needs. On constrained courses explain what may need deprioritisation; do not hide unavoidable unmet need.
7. Return `programme`: final known exam, dated papers, weekly course priority envelopes, milestone intents, uncertainty/coverage and unmet-demand annotations. Return `forecast` (7–14 days; hypothesis) only for next supported activities.

**Temporal correctness:** every obligation-to-task/paper edge needs its own valid-until cutoff, and the scheduler checks it against the proposed **calendar day**, not against “days until assessment” computed at generation time. If a real start time is known, use it; else exclude exam date from exam-specific planning by default. Manual learner-selected work is separate from endorsed revision scheduling.

### D3. Evidence-grounded treatment selection

Use explicit `ActivityIntent` instead of only `quick-check/exam-question`:
- **Acquire/understand**: no robust valid evidence, prerequisite gap, complex concept or skill; use approved explanation/worked/gradually faded support as needed (LS-06).
- **Retrieve/retain**: prior meaningful exposure/achievement and useful reason for delayed independent retrieval (LS-01/02); don't over-test immediately after a correct answer unless mismatch/repair justifies.
- **Diagnose uncertainty**: narrow, old, contradictory or unrepresentative evidence for an important obligation; choose an assured scoped check (LS-05/10).
- **Repair/retest**: validated weakness or misconception; new supported independent attempt after relevant feedback/repair (LS-04).
- **Transfer/exam practice**: demonstrated basic knowledge but paper/AO/application, time pressure or response construction not well evidenced; align to authentic format (LS-08).
- **Rest/unused capacity**: no credible available activity, student choice or genuine need for respite; do not force work to hit available minutes.

Unscored Quick checks can guide formative interaction only and never update readiness by themselves; early low-strength FI-006 starting check remains optional and excluded from ordinary readiness.

### D4. Cross-course weekly allocation (priority envelopes, not fixed quotas)

**Hard feasibility dominates any prioritisation score.** Given courses C and scarce weekly capacity T:
- First identify courses with a near known paper and unsatisfied critical obligations, especially where further practice opportunity would expire. Protect plausible preparation for these deadlines.
- Compare candidate **incremental learning opportunities** for each course using validated need, paper demand/scope, urgency, evidence uncertainty, opportunity cost in minutes, learner preference and remaining course preparation, with source-specific reason codes.
- Allocate enough programme opportunities to prevent avoidable **starvation** of a course that has meaningful unaddressed preparation and feasible capacity. Do not use automatic 50/50 sharing or a mandatory switch each day.
- Permit one long uninterrupted block for complex learning or authentic timed assessment and naturally allow multiple subjects on a day when capacities/tasks justify it.
- Do not claim that “two subjects/day” is a research-supported default: within-topic/problem-type **interleaving** is separately justified where discrimination is part of the learning target (LS-03).
- If all courses cannot receive meaningful preparation, record **transparent tradeoffs** and an unmet-priority explanation; no unearned assurance of full coverage. In constrained mode prioritise real, actionable opportunities rather than maximising topic-count completion.

Proposed explainable allocation semantics: 
`course pressure = achievable critical unmet obligations before paper + uncertain/old evidence checks + paper-aligned performance gaps`, adjusted by remaining time and capacity. This is an engineering target, **not** a validated predictive expected-grade-gain function.

Proposed config candidate values for *simulation exploration only*: near-term task horizon 7 / 10 / 14 days; weekly soft no-neglect floor 0 / 1 feasible course opportunity (when capacity supports it); subject switch encouragement off / weak / moderate; practical short work chunks varied with actual asset constraints; checkpoint sampling sparse / medium. These are **alternative parameter arms**, not default requirements; select only after comparisons and human approval.

### D5. Candidate packing and recalculation

For each date in the near-term forecast, enumerate feasible activities with scope, required duration, prerequisite status, effective paper deadline and capacity. Assign next activity through a deterministic capacity-aware selection that accounts for weekly course priority envelope and preserves within-session task continuity. Re-evaluate eligibility after each allocation; a candidate cannot be placed after its relevant paper, nor can work cross midnight into an exam on an unknown clock.

Outputs include `recommended_today` and eligible alternatives, `day_schedule`, `programme_weeks`, `milestones`, `remaining_uncertain_needs`, `capacity_state`, `reasons`, `change_events`, `planner_version`, `parameter_version`. Every visible explanation traces to actual inputs; no invented personal prediction.

Recalculate on substantive changes (new valid evidence, corrected marking, exam date/scope, paper options, availability, completed/accepted activity and confirmed preferences) and daily date rollover. Restrict churn for cosmetic changes by keeping stable suggestions when educational opportunity has not materially changed; never keep a now-ineligible task for perceived stability. User-selected “Not now” is hidden until next local day, “Suggest something else” uses the same ordered eligible alternatives; a deliberate selection must not change educational truth.

### D6. Checkpoints: events, not clock-only repetitions

Evidence triggers checkpoint *consideration*, not obligation: conflicting strong/weak results, important stale/narrow evidence, unresolved repaired errors, missing AO/performance scope, approaching paper or planned broader survey milestone. Decide between (1) targeted retest, (2) mixed previously covered-topic retrieval, (3) sampled broad-course check, (4) authentic timed paper/AO task. Only schedule if supported question/marking assets, appropriate prerequisites, practical capacity and student choice exist.

Each check specifies covered nodes/papers/AOs, question count, marking/provenance reliability, previous exposure, assessment demands, timing mode and uncertainty. Sampled breadth cannot license whole-course mastery. Objective evidence updates existing Progress calculations; the next plan then responds. A decline in belief requires legitimate new evidence; evidence merely ageing may reduce confidence or prompt reassessment but cannot silently fabricate deterioration in knowledge.

### D7. Reproducible benchmark and functional oracle

Baseline implementation from approved main:
- `src/engine/planning/planning.ts`
- `src/app/planner-model.ts`
- `src/app/plan-model.ts`
- `src/engine/planning/planning.test.ts`
- `docs/technical/Adaptive Revision Planner Implementation.md`.

**Second 60-day coupling found:** `src/app/PlanScreen.tsx` uses `PLANNER_HORIZON_DAYS = 60` in the default accepted-session load range. It is a **fetch-window policy**, not the same as the engine's schedule cutoff. Replace the engine cutoff with the full programme/milestone horizon, but keep accepted-session loading bounded and demand-driven (visible dates and short-horizon scheduling), using pagination/windowing for later weeks. Assert that an exam 120+ days away appears in programme milestones **without** triggering a long-range per-session fetch.

The benchmark runner (future R1/R2 governed implementation, **not created in R0**) takes JSON fixtures with `fixture_id`, fixed `clock` and timezone, exact course IDs and optional paper dates, selected Psychology options, course-level node-to-paper/AO edges, known supported assets and actual duration, weekly+exception capacity, accepted sessions, immutable evidence events with their true provenance/mode/marking and optional short-term preferences.

Run existing FI-001 baseline and candidate against identical fixture inputs after mapping to each engine's capabilities. Freeze seed/config and record versions. Compare:
- **Fatal safety**: work after paper/date, invalid assets, unsupported paper/option, capacity oversubscription, leaked inactive course, passive evidence changing readiness, starting-check contamination, duplicated evidence, nondeterministic result.
- **Programme coverage**: final known exam reached, paper-specific preparation feasibility/unmet need, no hidden 60-day truncation.
- **Distribution**: long-run course starvation, last-minute clustering, repeated work without new educational purpose, paper competition, concentration after preferences.
- **Learning process**: proportion of justified independent retrieval and retest opportunities, breadth of knowledge checks, availability of repair before repeat, match of exam skill to assessment demand.
- **Interaction quality**: stable meaningful recommendations, honest reason codes, alternative action path, no debt, missed-day recovery, learner workload.
- **Reliability/cost**: deterministic runtime, database/API complexity, per-plan CPU and optional AI calls (target zero AI priority calls).

Deterministic test passes are necessary, not efficacy proof. Run sensitivity sweeps of policy parameters and **counterexamples** where a changed input must logically change one course's priority. Require zero fatal violations; require improvement versus baseline on substantial distribution/deadline test cases, with tradeoffs recorded rather than manufactured target percentages.

### Mandatory scenario expectations

1. **Months-out Business + Psychology**: programme goes to last exam but only 7–14 days of precise tasks; both active courses have defensible coverage, no rigid 50/50 requirement.
2. **Three courses, colliding papers**: deadline pressure and feasibility determine competing study envelopes; no automatic starvation of one course without explicit resource explanation.
3. **Late starter**: realistic priority mode, short actionable improvements and no full-coverage promise.
4. **Good recall, poor timed/extended responses**: prefer AO-specific exam task and feedback over more flashcards; do not inflate readiness.
5. **Low/narrow evidence**: supported evidence-building rather than claiming mastery; broad sampled check cannot certify full course.
6. **Contradictory retention check**: evidence engine updates appropriate scope; planner prioritises repair/retest only where supported.
7. **Unexpected genuine improvement**: no stale weakness lock-in; confidence and future allocations respond to validated evidence.
8. **30 minutes weekly and zero minutes variant**: no capacity violation; useful fallback and honest lack-of-capacity messaging.
9. **Missed several sessions**: new recommendations from reality; no mandatory backlog.
10. **Assessment date moves**: immediate re-evaluation; no task after revised paper date, including within month and horizon.
11. **Exam >60 days away**: final exam included in programme; mid-range weekly priorities and near-term tasks, no full-daily phantom calendar.
12. **Unknown exams; starting check skipped**: usable subject study; no invented countdown/knowledge.
13. **Business topic shared across papers**: one knowledge obligation, multiple eligible future-paper links, distinct paper practice.
14. **Psychology selected options**: only selected Paper 3 optional topics appear; research method demand mapped to actual applicable papers.
15. **Long timed exam vs fragmented availability**: don't split mock invalidly or imply completed authentic paper.
16. **Accepted manual session and student preference**: capacity adjusted and choice respected without evidence changes.
17. **New course removed from membership**: promptly removed from new learner-wide plan, historical scored evidence retained.
18. **Exam already taken, later paper still ahead**: passed-paper work absent; shared knowledge remains if genuinely assessed later.

Additionally require property-based date/capacity tests, age/timezone rollover and reordering-stability tests. Initial policy variants are measured against realistic journey fixtures; no gold labels of 'scientific optimal allocation' may be invented.

### D8. Observable quality beyond code

Initial business-quality hypotheses: improve plan helpfulness and task-start conversion; reduce time spent selecting work, after-deadline tasks, needless repeat and course neglect. Collect only legitimately allowed, low-cost telemetry. A small learner study with independent delayed retrieval and held-out exam-style questions may indicate educational utility; measurement must control/qualify initial skill and engagement differences. Simulation or research references must never yield a 'grades improved' product claim.

### D9. Cost, sequencing and gates

**R0 (now):** research verification, this algorithm contract, feature-level Definition of Ready, authority reconciliation proposals and scenario oracle; no implementation. **R1:** safety first, paper cutoff/identity/data semantics, baseline deterministic tests. **R2:** full horizon and capacity-aware weekly allocation. **R3:** near-term balancing and explained action. **R4:** conditional retention/checkpoint opportunities, FI-009/010/011 approvals and evidence integration. **R5:** authentic paper practice and FI-012, only within supported assessment assets. **R6:** Business/Psychology pilot and iteration.

Critical uncertainties before `Ready`: authoritative recommendation priority order conflicting with REV's 14/7-day policy; algorithm/evidence-engine API and skills/asset coverage; FI-006 exclusion of periodic checks; cross-feature lifecycle approval; Free/Paid/Premium value and fixed vs variable cost; end-to-end Home/Plan/REV UX contracts; thresholds/config review; data security and exam dates; simulation evidence.

## Evidence / research trace

LS-01 retrieval → D3/D6; LS-02 spacing → D2/D3/D6; LS-03 selective interleaving → D4; LS-04 feedback → D3/D6; LS-05 formative assessment → D6; LS-06 worked examples and cognitive load → D3; LS-07 self-regulation → D5/REV; LS-08 authentic exams → D1/D3; LS-09 subject balancing as *hypothesis* → D4; LS-10 recency and adaptive confidence → D1/D3/D6. No arbitrary fixed exam checkpoint dates, subject proportions or improvement percentage are approved or implied.

## Documentation impact (R0 vs eventual production)

**This branch/PR (R0):** `research/` only, non-authoritative; research/source links and explicit open authority conflicts; no production/technical truth changes. Before `Ready`: appropriate changes to `10-product-governance/Adaptive Revision Planning.md`, `20-brand-and-experience/REV Guidance and Conversation Pattern.md`, relevant course/evidence authority *only if rules truly change*, FI-001 live-enhancement analysis and distinct FI-009/010/011/012 lifecycle records, tiering and assurance acceptance. **During implementation**: code, tests, canonical technical doc and registers, ADR if architecture materially changes, `INDEX.md` only for new authority references. Preserve historical records.
