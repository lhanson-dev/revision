# Evidence-led Adaptive Revision Programme — product analysis and proposed specification (12 October 2026)

**Status: ANALYSE / PROPOSAL ONLY — NON-AUTHORITATIVE. No product rule here is approved or Ready for production implementation.**
**Reference baseline:** approved `main` `0a463f3fea6633410fc8b47fb9dcc0878c566f8e`.
**Scope:** existing FI-001 planning programme; dependencies/feature ownership FI-006, FI-009, FI-010, FI-011, FI-012; AQA A-level Business 7132 and Psychology 7182 as test reference courses.
**Normative owners:** `10-product-governance/Adaptive Revision Planning.md`, `Product System Model.md`, `Course Learning Blueprint.md`, `40-evidence-and-trust/Claims and Progress Governance.md`, `20-brand-and-experience/REV Guidance and Conversation Pattern.md`. This document does **not** amend them.
**Related research:** `research/Course Learning Blueprint Evidence and AQA Business 7132 Reference - 2026-09-20.md` (reuse; avoid re-stating it as newly validated product evidence); `research/Evidence-led Planner Learning Science Register - 2026-10-12.md`.

## Executive recommendation

Keep **one deterministic FI-001 planning authority** and one evidence-aware learner model. Replace the single-pass ranked-candidate calendar with **hierarchical programme allocation**: (1) horizon through final known exam/paper, (2) rolling multiweek subject/skill envelopes, (3) flexible 7–14-day specific activity forecast, and (4) today's top actionable task. Further-out commitments are milestones and priorities, not precisely dated tasks. No arbitrary 60-day programme cap.

Learning science justifies preferential use of retrieval, distributed revisits, appropriate formative feedback, selectively mixed discrimination, scaffold fading and authentic assessment. It **does not** dictate fixed optimal revision intervals, daily subject counts, subject ratios, stage dates, study block minutes or exam-grade improvements. These remain policy hypotheses to test.

## Verified implementation gaps (code-level)

- `src/app/planner-model.ts:185–200`: `Math.min(60, Math.max(1, furthestRelevant + 1, 28))` truncates generated calendar days. There is no distinct full programme horizon.
- `src/engine/planning/planning.ts:103–130, 160–205`: one static candidate score, full global sort, then greedy forward fill; no constrained cross-course allocation, staged milestones, future dated eligibility, workload debt by assessment or conditional mixing.
- `src/engine/planning/planning.ts:165–180`: one allocation per candidate ID in the derived schedule; no planned spaced retrieval/retest sequence. **Correctness bug:** candidate deadlines are not checked against the specific scheduled day; a task for an assessment on an earlier day may fall afterward.
- `src/app/PlanScreen.tsx:64, 222–230`: **an additional 60-day window** controls the default query of student-accepted sessions. A full-exam programme must decouple its full-term subject/milestone horizon from bounded near-term accepted-session fetches; do **not** simply fetch 6–12 months of individual sessions per Plan screen load.
- `src/app/planner-model.ts:138–175`: candidates generated per assessment, potentially repeating the same shared course topic across separate papers; `examWeight` is always null; no explicit paper-specific AO/task pathway.
- `src/app/planner-model.ts:102–109`: topic understanding averages percentages without temporal discrimination; evidence strength is approximated by count/4 and course confidence. This should not be mistaken for a governed validated retention estimator.
- `src/app/planner-model.ts:112–121`: activity type chosen from simple exam-in-21-days/understanding rules, available quick checks and flashcards, without assured competency/assessment-demand matching; Quick checks are unscored under existing progress authority.
- `src/app/plan-model.ts:211–216`: an accepted session that remains overdue may produce 'Catching up' wording, although generated recommendations correctly avoid debt. Distinguish optional explicitly accepted commitments from mandatory algorithmic task debt in product/experience review.
- Existing tests prove deterministic ordering, simple capacity and non-duplication *within a generated schedule*, not multi-month coverage quality, fairness across subjects, post-exam exclusion, stale evidence/retest, deadline collision or educational effect.
- Implemented strengths to retain: active-course identity; scoped assessment/date inputs; weekly capacity and exceptions; learner preferences; deterministic explainability; no auto-fill of low-value hours; prioritising mode; derived recommendations; REV explanation rather than LLM schedule ownership.

These are source inspections, **not** a completed executed A/B benchmark or proof of a production bug experienced by an actual student.

## Proposed FI-001 behavioural contract

### 1. Unified data/ownership model

Inputs: active enrolled course IDs, governed Course Truth/Exam Truth, relevant paper and assessment dates (optional and editable), date-specific/weekly capacity (may be unknown), prior validated evidence with scope, provenance, breadth, recency, reliability and confidence, recent practice/repair events, explicit learner preferences and explicitly accepted sessions. No starting check is required and entering a date never creates attainment evidence.

Represent each `learning obligation` once per shared course-knowledge/skill node, with edges to all relevant paper/component assessment demands. A question or revision activity may satisfy multiple obligations **only where its assured evidence scope genuinely matches**. Preserve distinctions such as shared Business content vs Paper 2 data-response technique or Psychology research-methods demands.

Separate:
- **Curriculum coverage inventory**: what is relevant, not asserted mastery.
- **Evidence inventory**: actual scored attempts, scope, age, contradictions, method/marking quality, learning vs timed exam mode.
- **Needs inventory**: unaddressed obligations, likely weak nodes, stale/uncertain evidence, exam-technique deficiencies, confirmed repair needs.
- **Opportunities**: real assured assets, time estimates, eligibility, course/paper, prerequisites and feasible alternative duration.
- **Plan**: derived programme envelopes, rolling specific suggestions, checkpoints, structured justifications and unmet need/capacity notices.

No AI-generated unassured test is permitted to strengthen readiness merely because it is scheduled. Do not infer performance from minutes, quick-check exposure, self-report or a starting check.

### 2. Four levels of precision

1. **Programme, through last known paper**: finite set of all active known exam dates, target coverage, exam-demand preparation, repair/revisit milestones, coarse capacity demand and gap/risk. Calculate with dates through the final exam regardless of distance. Do not generate an enormous immutable daily task list.
2. **Multiweek allocation**: rolling weekly envelopes for course preparation, evidence checks, focused repair and authentic exam practice; expose tradeoffs, feasible capacity and reserved opportunities before each relevant paper; dynamically re-evaluate on changes.
3. **Near-term forecast (initial hypothesis 7–14 days)**: concrete tasks selected from assured assets, respecting per-date availability, prerequisites, eligibility, student preferences, subject variety and exam cutoffs; recompute when meaningful inputs change.
4. **Today**: highest useful feasible action from the same forecast, plus a small appropriate alternative; REV can truthfully explain the reasons and negotiate bounded preferences; Home and Plan consume the same decision.

**Unknown exam dates:** still provide a rolling near-term learning/retrieval programme and ask gently for dates when helpful; no fabricated deadline, exam countdown or assumption of final-exam horizon. **Unknown availability:** show usable suggested next study rather than fabricate a timed schedule; invite optional capacity setup. **Past exams:** exclude paper-specific prep and detach shared-node workload from that completed paper; retain the node if it matters for another future paper.

### 3. Candidate eligibility and programme optimisation

Hard constraints **before** ranking: active course; supported/assured activity; not after target paper (for exam-specific work); genuine scope and access; capacity on scheduled day; skill prerequisites where needed; protected learner choice; no clone of shared obligation into redundant per-paper tasks. Keep deterministic day-local eligibility and explicit stable tie-breaks.

Programme allocation balances weighted **educational need and opportunity** plus **fairness/no-neglect** subject to remaining finite capacity, *not* a rigid equal-subject daily quota. Candidate utility can consider: diagnostic uncertainty, repeated validated errors, scope breadth, evidence age, priority exam proximity, mark/assessment relevance from Exam Truth, distinct topic/skill preparation, recall/retest utility, learner preference and estimated benefit-per-time as a labelled hypothesis. Revisit usefulness cannot be represented by a fixed universal forgetting curve unless separately validated.

Prefer a constrained multi-pass scheduler:
1. Construct and deduplicate course/paper learning obligations.
2. Work backwards from each real assessment to identify key checkpoints, practice opportunities and unsatisfied demands.
3. Compute date-aware weekly capacity, unmet demand and critical courses; allocate viable weekly subject/skill envelopes without arbitrary equal splits.
4. Generate scored, diverse and deadline-eligible tasks only for the near-term window.
5. Rebalance with explicit recency, fairness, switching friction, feasibility and student preferences; retain genuine slack rather than fill hours.
6. Emit structured reasons, what changed, weak/uncertain evidence flags, uncovered work and calm priority mode where demand exceeds supply.

Report the **course-level opportunity cost** of allocations and starvation risk. Example: weak Psychology can merit more time than Business, but an upcoming Business paper cannot disappear solely because many Psychology topics receive slightly higher independent scores.

### 4. Balancing blocked and mixed work

Do **not** require more than one subject on every day. A single subject may be appropriate for a short available session, early acquisition, sustained reasoning, a timed paper or a focused repair block. Switching subject can be useful when it spreads revisits and limits repetitive monopolisation, but switching itself does not equal educational interleaving.

Use **within-course interleaving** when students must discriminate confusable concepts, problem strategies or exam demands **after sufficient initial instruction**; preserve uninterrupted time where deep reasoning or timed exam simulation requires it. Subject variety across a day is a planning and workload policy to trial, not an effect size claimed by research. Initial thresholds for 'no neglect', daily switch limits, session minimums and percentage caps must be config-versioned and evaluated with simulated journeys and learner feedback, not presented as proven optimum.

### 5. Adaptive knowledge checkpoints (not another diagnostic engine)

Checkpoint is an **assessment opportunity with declared scope and evidence provenance**, not an automatic mastery event. Scope varies:
- **Targeted retest** after supported repair: matched competency or transfer context, with independently attempted new items where available.
- **Mixed-topic retrieval** to check retention and discrimination across previously encountered nodes.
- **Broad sampled course check** to survey *selected* obligations for uncertainty, breadth and unexpected gaps; never describes sample success as complete-course mastery.
- **Authentic exam-style assessment** for AO/paper demands; timed paper/full mock only when assured assets, adequate time and appropriate student context exist.

Trigger checkpoints from educational need: weak/conflicting results, old narrow evidence, long gaps, untested important scope, meaningful stage transitions, approaching paper demand and available capacity; periodic course milestones may **offer** broad checks but no arbitrary compulsory 'every X days' test. Guard against excessive testing, repeated items, full-paper overload or displacing all instruction.

Selection and evidence rules: use assured bank/marking paths; choose breadth and discriminative coverage appropriate to the target; record sampled scope, demands, difficulty, timed/untimed, responses, marks, marking method and quality. Integrate via the existing governed evidence engine. Strong, representative corroboration may increase understanding/readiness confidence; contradiction may lower them, redirect repair and advance a retest; improvement may reduce unnecessary repetition; lack of breadth/poor reliability primarily lowers *confidence* and triggers better evidence. No automatic full-course score or grade estimate from a narrow sample. Starting-check evidence remains distinct low-strength directional evidence under FI-006. Quick checks remain unscored unless separately approved through evidence governance.

**Timing hypothesis, not researched optimum:** programme milestone flags may be expressed as relative preparation phases (early foundation, consolidation, application, examination). Exact offsets, check lengths and cadence are chosen by capacity/demand and then measured; no default '30/14/7 day' mandate.

### 6. Learner experience end-to-end

`Courses → Learn (exposure) → Practice (valid scoped evidence) → feedback → repair/retest → Exam Prep (exam-authentic evidence) → Progress (coverage/understanding/readiness and separate confidence) → FI-001 Plan → REV/Home one explained next action`.

The student can take an alternative activity, decline a check, reduce time or temporarily focus elsewhere. REV offers a feasible alternative without rewriting underlying objective evidence. After disruption, recalculate rather than shift an overdue queue. If the available time is genuinely insufficient, explicitly identify the constraint without grade promises or shame.

Keep REV's suggestion/dismissal UI semantics ('Not now' until tomorrow; 'Suggest something else' next candidate) consistent with one underlying priority decision.

## Deterministic acceptance-test contract (proposed)

Fixtures must use stable clock/timezone, deterministic content IDs, known dates, governed Business 7132 and Psychology 7182 paper/component truth, seeded evidence provenance and explicit capacity. Snapshot *programme*, *weekly allocations*, *7–14-day tasks*, *today*, *reason codes* and *unserved opportunities*. Do not hardcode scientifically optimal allocations.

| ID | Simulated journey | Required invariant / observable behaviour |
| --- | --- | --- |
| S01 | Business + Psychology; papers several months out | Programme covers last paper; near-term specific forecast bounded; both relevant courses get plausible staged preparation; no 60-day truncation. |
| S02 | Three+ courses and colliding papers | Explicit capacity tradeoffs and non-starvation; imminent paper cannot be ignored; consistent deterministic replay. |
| S03 | Starts very close to exams | Calm prioritising mode; attainable high-value retrieval and authentic practice; no fictional full-coverage claim. |
| S04 | Strong recall, weak timed essays | Exam technique/AO tasks outrank more rote recall where justified; readiness remains separate from knowledge. |
| S05 | Low-confidence evidence with few answers | Useful learning/check recommendation and truthful provisional reasons; no 'mastered' assertion. |
| S06 | Later retrieval contradicts earlier strong result | Confidence/readiness change **only** through legitimate evidence path; repair rises in importance with explanation. |
| S07 | Checkpoint confirms unexpected improvement | Retest evidence can update model; redundant repair loses priority without automatic whole-course mastery. |
| S08 | Very limited or zero weekly minutes | No overbooked day, impossible promise or fabricated hours; accessible useful fallback when schedule cannot be built. |
| S09 | Several missed days | Current needs replanned, no accumulated auto-generated task debt; gentle restart. |
| S10 | Paper date moved, earlier or later | All paper-specific preparation re-evaluated; no items scheduled after the new date; transparent material change. |
| S11 | Last paper >60 days away | Long-term milestones extend to the final known paper; no false detailed daily commitments to the exam. |
| S12 | Exams unknown and starting check skipped | Immediate supported study is accessible; no invented dates or diagnostic mastery. |
| S13 | Business's shared content assessed in several papers | Obligation deduplicated; preparation has legitimate links to relevant papers; paper-specific practice remains distinct. |
| S14 | Student deliberately prefers one subject for a week | Preference affects allocation within safety/feasibility constraints; unaffected learning evidence and understandable tradeoff. |
| S15 | One long timed mock versus two short available sessions | Respect uninterrupted mock duration; offer smaller viable task rather than splitting a timed paper misleadingly. |
| S16 | Broad course check based on sampled questions | Scope/coverage accurately disclosed; no whole-course mastery, course-wide strong readiness or predicted grade from sample. |
| S17 | Starting-check-only signals or unscored Quick checks | Do not upgrade mastery, understanding or readiness; directional guidance only where permitted. |
| S18 | Last relevant paper completed, other active paper remains | Remove completed paper-specific prep; retain relevant shared obligation, no scheduling after completed exam. |

Run metamorphic/contract tests: changing one date cannot affect an unrelated course absent competition for shared capacity; increasing available time cannot decrease total feasible opportunities under unchanged priorities; no duplicate obligations per same scope; repeated run stable; latest valid evidence can change ranking; changing passive 'Learn viewed' cannot improve exam readiness; no assessments should cause no phantom exam; every reason emitted maps to true input; all scheduled tasks have supported routes/assets.

### Educational-quality evaluation (distinct from correctness)

Compare old and candidate planners on *identical frozen fixtures*: deadline violations, course/paper neglect, unmet high-value obligations, share of actionable recommendations, unnecessary repetitions, workload overload, unexplained churn, scope validity, evidence-confidence calibration, time spent in checkpoints vs repair/instruction, explanation accuracy and student override burden. For educational quality, use blinded expert or learner scenario ratings (helpfulness, achievability, perceived control, clarity) where affordable.

**Outcome efficacy is separate**: deterministic tests cannot establish better retention or exam grades. Later evaluate repeated delayed retrieval of comparable nodes, held-out exam-style performance and student behaviour under explicit confounding/selection limitations. No outcome claims until supported by Revision-specific evidence.

## Sequenced implementation roadmap (requires approval; not implementation authorisation)

1. **R0 Research/specification and Definition-of-Ready** (this research PR): verify science, authority conflict, evidence schema, package value, data/UX expectations, deterministic test fixtures. Product decision & Founder Ready gates before material implementation.
2. **R1 Safety/correctness in FI-001**: per-day paper deadline eligibility, date/clock integrity, shared obligations/paper deduplication; tests. Assess whether bounded bug fixes can be separately governed.
3. **R2 Long-term programme + weekly envelopes in FI-001**: no 60-day limit; feasible capacity per paper; variable precision UI; fallback for unknown date/capacity.
4. **R3 Cross-course balancing and near-term activity selection in FI-001**: deterministic fairness, adaptive opportunity allocation, explainable reason codes, single Home/Plan source; controlled parameters and golden scenarios.
5. **R4 Knowledge-check orchestration**: align FI-006 initial directional check boundary; seek separate Ready approval for FI-009 spaced retrieval and FI-010/011 targeted repair/retest; checkpoint scope, scheduled milestones, assured items, evidence integration.
6. **R5 Authentic exams + exam-soon**: paper-specific demand/AO practice and mocks; coordinate with Exam Prep/Exam Simulator and FI-012; no alternative exam engine.
7. **R6 Pilot measurement**: Business and Psychology real/seeded multi-month programmes; first-action utility, churn, neglected course rate and small opt-in learner evaluation; tune versioned parameters before claims.

Cost posture: pure TypeScript/deterministic ranking, existing evidence and databases, already assured course question assets; no LLM priority calculation and no automatic expensive question-generation run. Hard cost/risk dependency: sound evidence provenance, assured question-bank breadth, authentic marking reliability, course/paper mapping and engineering/testing effort. Relative estimates: R1 smaller; R2/R3 medium; R4/R5 high complexity because evidence and assessment quality are critical. No invented £/day or grade-benefit estimate.

## Existing authority conflicts / proposed reconciliation

1. **REV order vs programme allocation:** `20-brand-and-experience/REV Guidance and Conversation Pattern.md` governs a four-step 14-day/7-day per-topic suggestion order and dismissal rules. A globally optimised opportunity allocation may disagree with that order. Proposal: set one FI-001 programme-aware ranking contract, preserve explicit REV learner-facing fallback/dismissal behaviours, and amend both authorities *together* after Founder decision. **Not approved.**
2. **FI-006 scope:** Ready FI-006 explicitly excludes periodic repeated checks. Proposed programme checkpoints must not be silently attached to FI-006 Ready. Place cross-course milestone orchestration in FI-001 and scoped retrieval/targeted tests in FI-009/010/011 under their own lifecycle approvals; assess if a FI-006 amendment is warranted.
3. **Existing Plan design:** Day/Week/Month views and less precise future representation already approved. Programme view must extend, not replace this model through code alone. Which long-range view best exposes milestones remains a testable UX design question.
4. **Confidence thresholds:** understanding/status/readiness are owned by `Claims and Progress Governance.md` and the evidence engine. No planner-side shadow mastery formula may redefine these outputs. Current count/average proxies require explicit reconciliation, not silent promotion.
5. **Accepted sessions and missed-debt copy:** `plan-model.ts` has overdue accepted-session wording; reconcile optional user-scheduled commitments with approved non-punitive adaptive-plan semantics.
6. **Commercial scope:** FI-001 existing Free/basic vs paid/full outlook proposals; any new programme/assessment entitlement restriction must pass FI-002 and Free educational-integrity rules. Recommend genuine core planning/check usefulness in Free; advanced coaching/UX depth may be paid, subject to approval.

## Definition-of-Ready / governance position

**Not Ready for new material implementation.** Research and scenario contract are proposed. Still required: Founder resolution of active REV priority conflict, promotion into normative `Adaptive Revision Planning.md` and appropriate REV/Blueprint/Evidence authority; cross-feature lifecycle scope and separate human `New → To Do` / `Analyse → Ready` approvals as applicable; validated score/evidence architecture feasibility; course fixture/asset readiness (especially Psychology), grade/claims guardrails; Free/Paid/Premium design and commercial conversion hypothesis; accessibility and parent/student privacy assessment; measurement/assurance contract; technical interface and phased cost estimates. Do not self-promote FI-009/010/011/012 to Ready or change FI-006 Ready scope.

**Documentation-impact checklist for later governed implementation:** update `Adaptive Revision Planning.md`; REV guidance; `Course Learning Blueprint.md` if treatment rules change; `Product System Model.md`; `Claims and Progress Governance.md` only for deliberately approved evidence semantics; canonical feature backlog/lifecycle records and mapping; `docs/technical/Adaptive Revision Planner Implementation.md`; planner code/tests and Plan/Home/REV integration tests; assurance and defect registers on real evidence; `INDEX.md` if authority locations change; ADR only for substantial architectural decision. Historical research and audits are not retrospectively edited. No production code, statuses, authority or technical implementation claims were changed by this research proposal.
