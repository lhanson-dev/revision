# Intelligent Exam-Backwards Planner — Proposed Target Architecture

**Status:** Founder-approved FI-001 programme-first scope is Ready (15 October 2026); implementation candidate on draft PR #637, not merged or Live. The design describes intended target behaviour, not demonstrated production delivery. **Baseline:** approved main `fd8565838db8fc27cbf359fc86d846e9ab11fda5`, 15 October 2026. **Canonical route:** `/revision/app/#/plan`, React/Vite; Home and shared Ask REV are consumers. **Normative owner:** `10-product-governance/Adaptive Revision Planning.md`, under Product Strategy and the evidence/course authorities. This document describes the *target*, not an implemented or deployed capability.

## Architectural decision

**One deterministic, inspectable programme decision produces every planning view.** The current R1 candidate engine, R2 programme projection and weekly-focus selector must be consolidated behind one programme-building boundary, not run as independent authoritative planners. A lightweight target pipeline:

`active courses + Exam Truth + Course Truth/Blueprint + evidence projection + real calendar/capacity + choices → canonical preparation obligations → treatment opportunities → programme optimiser → versioned weekly objectives + near-term eligible actions → Plan Day/Week/Month, Home, REV.`

No LLM calculates planning or readiness. Generative support may explain approved decisions without changing priority truth. Preserve existing course membership, exams, evidence source, consent, commitment and route boundaries.

## Domain contracts (proposed, TypeScript shapes illustrative)

1. `ExamDemand { examId, courseId, paperId?, localDate, assessedNodes, assessedSkills, assessmentObjectives?, officialScopeProvenance, optionScope, importance }`. Unknown paper/option/date is explicitly `unknown`, not a wildcard. Date-only exams have no eligible paper-only actions on the exam date.
2. `PreparationObligation { obligationId, courseId, nodeIds, appliesToPaperIds[], requiredDemand, prerequisites[], evidencePicture, learningStatus, provenance, assetCoverage }`. Deduplicate shared syllabus nodes across papers; distinct AO/response/format demands remain separate. Mark content/skill mappings `unknown` where the course foundation cannot substantiate them, and report coverage limitation.
3. `EvidencePicture { coverage, observedUnderstanding?, observedReadiness?, breadth, recency, reliability, confidence, contradictions, missingScopes[] }`. Built via the governed evidence/readiness engine and validated provenance. Planning-side proxies can rank uncertainty for checking, but cannot masquerade as official Progress values or infer actual forgetting.
4. `PreparationOpportunity { id, obligationIds[], treatment: learn | guided-apply | independent-retrieve | repair | check | authentic-exam-practice, supportedAssetRef, assessedScope, durationEstimate, prerequisiteIds[], earliestEligible?, lastEligibleDate, repeatPolicy, resultEvidenceSemantics, exactStartTarget? }`. Its purpose and permitted evidence follow the Course Learning Blueprint; valid supported content and scope are mandatory. No automatic question generation or unapproved check format.
5. `ProgrammeDecision { policyVersion, inputFingerprint, asOfLocalDate, knownHorizon, integrityWarnings[], unservedObligations[], courseConstraints[], weeks: ProgrammeWeekObjective[], nearTerm: PlanScheduledDay[], todayDecision, decisionReasons[] }`. Each week objective holds course, paper relevance, obligation/skill outcome, preparation treatment, why-now reason, coarse opportunity budget, feasible/at-risk/unknown categorisation and date constraints. All views reference the same immutable computation.
6. `ActionIdentity` reuses supported R1 target/module/question/learn-page routing and stable learner accepted-session IDs. Near-term actions link back to a week objective and obligation; accepted student choices are retained explicitly and never silently reclassified as derived appointments.

Treat the shapes as an internal contract proposal, not approval for a new persisted evidence model. Default to pure TypeScript computed state with existing owner-protected Supabase inputs; propose schema changes only if a justified need is discovered. If snapshot/provenance persistence is proposed, require a separate privacy/RLS migration and readiness review.

## Deterministic planning process

**A. Establish requirements.** Traverse each selected, published exact course and authorised paper. Create obligation graph from trusted Course Truth, Exam Truth, published adapter topic structure and available blueprint classification. Include response skill/AO only when mapped. Group repeated shared-course knowledge requirements once and retain multiple eligible paper deadlines; never duplicate them per paper.

**B. Interpret learner evidence.** Join stable IDs to real scored responses and evidence-engine assessment. Distinguish: unknown/unassessed, low-confidence, demonstrated secure within assessed scope, gap supported by evidence, contradiction, and incomplete evidence for exam conditions. Keep engagement, dates, preferences and unscored checks as context only. Repair/level selection must not increase readiness directly.

**C. Determine useful work.** For each obligation, choose supported pedagogical opportunity pathways: explain when foundations are not demonstrated, scaffold/independent application where required, retrieve already-encountered knowledge where appropriate, repair a corroborated misconception and retest only with valid existing evidence assets, or practise authentic paper demand once foundational learning is sufficient. An unseen-topic priority is not automatically flashcards; strong recall evidence is not evidence of higher-order exam skill. Missing suitable assets are an explicit unserved limitation, never a substitute activity silently labelled equivalent.

**D. Work backwards from deadlines.** Find each obligation's last eligible paper date and realistic available calendar windows, including zero-day/exception effects and existing accepted commitments. Place feasible phases and potential checkpoints relative to prerequisite completion, assessed demand and deadlines rather than preset arbitrary week numbers. Allocate coarse weekly opportunity budgets against total demand and competing papers. Prioritise deadline-critical foundations/skills; preserve opportunities across active courses unless justified constraints require an explicit trade-off. This is a constrained, auditable heuristic; not a guarantee of a globally optimal timetable.

**E. Pack realistic work forwards into execution.** From the current accepted commitments and selected week's objectives, choose a supported action that fits a specific day's known remaining capacity. Prefer meaningful uninterrupted work for complex reasoning or timed tasks; use subject variation only where the learning and feasibility case warrants it. Generate precise actions only for a near-term rolling forecast (initial hypothesis 14 days). Validate deadlines again for *each actual scheduled date*. Do not manufacture distant accepted sessions or future exact Start targets.

**F. Explain and adapt.** Every selection records at least relevant paper/requirement, observed gap or evidence uncertainty, chosen treatment, opportunity cost/time constraint and why the action fits now. At meaningful events (new scored result, changed paper date, capacity, course, accepted work, interruption or rollover), rebuild deterministically and compare meaningful objective changes; suppress trivial churn. Do not carry uncompleted suggestions as task debt. With no known exam date, offer grounded rolling objectives without a fabricated horizon or paper plan; with no availability, avoid a capacity/feasibility calculation while retaining a useful immediate action.

## Current-code disposition

| Current owner | Decision | Reason / work |
|---|---|---|
| `src/engine/planning/planning.ts` | **Refactor / retain safety primitives** | Keep deterministic scoring as baseline and exact per-day eligibility/route identity; replace greedy globally ranked one-off candidate scheduling as the programme's strategic centre. Record policy version and decision trace. |
| `src/app/planner-model.ts` | **Modify planning adapter** | Retain scoped assessments, deduplicated intents, asset lookup, capacity/exception bridge. Stop depending on unqualified `count/4` or averaged raw percentages as sufficient learner intelligence; derive defensible evidence states separately from progress truth. |
| `src/engine/planning/programme.ts` | **Retain and evolve** | Reuse full date-keyed horizon, milestone and safe provenance joins; emit objective/phase, capacity, constraint and skill need rather than mere candidate presence. |
| `src/engine/planning/weekly-focus.ts` | **Retire as independent allocator** | Its 1–3-topic display cap, `seen` rotation and week-index subject alternation are not educational decision rules. Preserve only reusable presentation mapping if justified. |
| `src/app/plan-session-windows.ts`, `accepted-sessions.ts` | **Retain** | Keep 14-day detailed window (calibration candidate), bounded independent visible/commitment reads and accepted choices; do not stretch I/O through all months. |
| `src/app/PlanScreen.tsx`, `PlanViews.tsx`, `PlanProgrammeOutlook.tsx` | **Modify existing UI** | Make Month a genuine objective/milestone/constraints summary, Week an achievable plan with treatment and reason, Day actionable and consistent; no new calendar runtime. |
| `src/app/today-recommendations.ts`, Home, shared Ask REV | **Retain route/consistency contract; change upstream source** | One next eligible programme action with supported exact Start; deliberate unscheduled fallback when inputs missing; REV never re-ranks. |
| `src/engine/evidence/**`, Progress, scored Practice, Exam Prep and active course model | **Reuse unmodified as truth sources by default** | Do not fork mastery/readiness, invent question assets, expand optional Psychology scope or relax evidence integrity. |
| `docs/technical/Adaptive Revision Planner Implementation.md` | **Update only with actual implementation** | Current-code evidence must remain distinguishable from this proposed architecture. |

## Product views: one decision, changing precision

- **Full programme:** through last known exam, paper/course obligations, broad learning→application→retrieval/check→exam-demand preparation intentions, constrained and unserved requirements, changing milestones and explanation of partial evidence. No false time commitment in far future.
- **Month:** meaningful outcomes across each contained week, per-course/paper strategic emphasis, outstanding skill coverage, realistic known capacity envelope, assessment and reassessment opportunities, conflicts and trade-offs. Never empty solely because precise tasks stop at day 14.
- **Week:** named skills/topics with intended knowledge or exam-skill outcome, appropriate treatment (not just "flashcards"), rough workload, relation to exam and specific evidence, selected supported activity opportunities. Explain what will be deferred if constrained.
- **Day:** best actually eligible supported action(s), precise course, objective, activity and reason, realistic duration and Start; existing accepted choices shown as chosen, not engine commitments.
- **Home/REV:** promote the same exact next actionable Plan entry, preserving student choice and honesty when none exists. REV can say, in natural language, "We're practising evaluation for [mapped paper] because [valid evidence] and [deadline/capacity trade-off]; here's the task", without invented assurance or grades.

## Scope / dependencies and gates

**Minimum meaningful vertical slice:** exact active supported courses/papers; real approved topic and mapped skills where available; evidence-aware need and uncertainty; whole-exam workload/phase feasibility; genuine weekly objectives across courses; 14-day feasible actions; one Home/REV Start; automatic missed-work/new-scored-evidence replanning. Existing assured activities only. An unexplained unserved requirement must be surfaced. A first slice producing weekly topic labels with no demand, phases or opportunity allocation **fails**.

**Enhancement, separately governed:** FI-009 adaptive spaced retrieval algorithm and exact intervals; FI-010/011 newly composed targeted or broad checks, misconception diagnostic workflows; FI-012 special near-exam mode; extra mocks/marking and generative content. Use existing approved ordinary retrieval or exam assets in FI-001 without claiming these later specialist capabilities are Live or Ready.

**Assurance:** freeze initial Business 7132 shared-paper and selected Psychology 7182 scenario fixtures, run old/new baseline comparison, property-based date/time/capacity safety, evidence-provenance and assessed-skill coverage, long-horizon update, contradictory evidence and student-choice journeys. Typecheck/lint/build, risk-tier CI, browser keyboard/a11y/phone-tablet-desktop, database/RLS if affected, exact head, Founder-specific merge approval and production path-to-live. Product usefulness requires separately adjudicated learner scenarios; deployment is not educational validation.

## Proposed implementation sequence

**Slice 1 — meaningful exam-backwards programme (one coherent reviewable vertical PR):** derive obligations/skill needs from approved content; evidence-aware treatments and feasible cross-course allocation through final known exam; replace `weekly-focus` ranking-only result; render Month/Week/Day; wire Home/REV, explain constraints; include 13 frozen realistic learner-oracle tests and baseline comparisons. Hold release if Student Value contract fails even with green CI.

**Slice 2 — adaptation and assurance hardening:** scored improvement/contradiction, exam moved, low-time/late start/missed week, shared course/paper and unknown states; calibrate sensitivity from counterexamples, no secret mastery changes; ensure programme-change explanations, no churn, close applicable open assurance gaps when authentic published evidence permits. May be part of Slice 1 if a separate PR would yield no real learner value.

**Slice 3 — authorised specialisation (independent Ready decisions):** retrieval scheduler FI-009 and richer FI-010/011/012 checks/near-exam modes only after separate DoRs, content quality and evidence integration. This extends the same programme engine, never creates a competing one.

**Documentation impact:** after approval/implementation, update exact normative scope where altered, this proposed design's status, actual planner technical implementation, a final accepted ADR, backlog/readiness, assurance register, index and production evidence. No production change is made by this document.
