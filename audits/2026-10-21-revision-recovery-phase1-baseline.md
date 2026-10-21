# Revision — Phase 1 recovery source baseline and provisional work triage

**Observed:** 21 October 2026
**Class:** dated repository evidence, not accepted normative authority or student study
**Approved-main commit inspected:** `b83db167d38ba02ff997c428f31b7f725e8b10d6`, which includes merged PR #637
**Runtime:** canonical authenticated `/revision/app/`, `src/main.tsx → FirstUseBoundary → PlannerRuntime`; user-facing `#/home`, `#/plan`, Courses, Progress and REV panel. Do not silently replace this with legacy `src/app/App.tsx` or the frozen baseline planner.
**Method:** GitHub main authority/docs/source reads, PR/issue/status metadata and previous dated audits. **No new production signed-in browser trial, independent expert curriculum validation, database query, local integration test or student study was performed for this audit.** GitHub actions reported here are historical workflow results, not new manually executed tests.

## Baseline decision

**Retain the existing core rather than assume a rewrite is warranted.** The current main has a successful `revision/path-to-live` status (run 39486586481). Current PR #651 head `5b27777f` and PR #652 head `9e9add5e` each report successful Revision CI and FI-001 frozen-baseline workflows; both remain open and unmerged. This shows delivery plumbing exists, **not** that whole-course educational decisions or real students are accepted.

Relevant existing policy sources: `00-company-foundation/Product Strategy.md`; `10-product-governance/{Adaptive Revision Planning,Course Learning Blueprint,Student Lifecycle Journey Contracts}.md`; Claims and Progress Governance; Engineering and Testing Standards; Content Factory Foundation and Asset Production Model; AI Agent Constitution. Older #562 (7 October) and #634 (15 October) are valuable point-in-time proposals, not current approved main. #652 supplies newer source-level EC-01..08 evidence, but its learner-priority code change remains a separate unmerged candidate.

## Confirmed current source risks and decisions

| ID | Risk to student/release | Current verified source | Evaluation and targeted next evidence | Provisional priority |
| --- | --- | --- | --- | --- |
| TD-01 | Course demand is represented mainly as topic requirements and separately as paper sections, not a complete validated atomic knowledge/response-skill preparation graph | `planner-model.ts:scopeTopicIds/buildLearnerPreparationProgramme`; `preparation.ts` finite candidates | **Confirm structural boundary**; compare exact approved Course Truth/Exam Truth and learner assets for 7132 and 7182, record unrepresented obligations | Launch trust |
| TD-02 | Each supported candidate is removed from outstanding after first allocation; allocated workload cannot alone mean learner prepared | `preparation.ts:buildPreparationProgramme` | **Confirmed mechanism**, not proven harmful case prevalence; assess replay/retest/skill progression with educator using real content and evidence | Launch trust |
| TD-03 | Home/Plan/REV each build planner snapshot, Plan separately calls programme builder, while Progress derives a next action via `rankSuggestions` | `PlannerHomeScreen.tsx`, `PlanScreen.tsx`, `PlannerRevScreen.tsx`, `progress-summary.ts` | **Confirmed redundant calculation/selection paths**; prove cross-view divergence (if any) and define one immutable shared decision before refactor | High |
| TD-04 | Three activities have overlapping session interfaces and execution state | `HomeFocusedActivity.tsx`, `FocusedLearningWorkspace.tsx`, `ExamSimulator.tsx`; Home, Plan, REV all launch first | **Confirmed multiple implementations**, not proof all duplicate semantics are wrong; enumerate distinct obligations, identical evidence types and exact Start/finish contract, consolidate after replacement tests | High |
| TD-05 | Whole-paper `exam_attempt` evidence currently assigns `topicId: exam.questions[0]?.topic ?? 'business'` | `ExamSimulator.tsx` save path | **Confirmed risky attribution**; trace to Topic Knowledge and Progress and adjust scope carefully with database compatibility tests before trusting paper-driven learner state | Launch trust |
| TD-06 | Mock attempted answers, flags, timer and selected options live in React state | `ExamSimulator.tsx` useState fields; no durable attempt API evidenced in the inspected component | **Confirmed local state**, but server-side whole-attempt absence is not independently exhaustive-proven; trace services, then add durable draft/resume only through approved data design | Launch trust |
| TD-07 | Learn completion/coverage semantics uncertain | `progress-summary.ts`, `catalogue-model.ts` and #562 audit; JRN-03 remains Partial | **High-priority hypothesis requiring exact current Learn code/evidence data check**; do not count reading as mastery or a single answer as content exposure | High |
| TD-08 | Full original exam-source and marking assurance incomplete | #649 open; pilot exclusion code in `planner-model.ts`, current AI/course/content governance | **Confirmed known release boundary**; finish qualified A3/A4 review before opening withheld assets | Launch trust |
| TD-09 | Non-pilot and pilot run differing planner versions | `PlannerRuntime` passes `pilotEnabled`; three screens select `planner-model-baseline` or programme-first path | **Confirmed deliberate restricted rollout**, not automatically a defect; isolate migration/retirement plan after controlled cohort safety validation | Medium |
| TD-10 | REV's structured learner-context/ordinary revision-process coaching may be narrower than marketing desire | `PlannerRevScreen`; #634 dated audit | **Partially established**; verify exact current intents with existing tests. Material FI-003 capability is not self-Ready | High |
| TD-11 | Current-state repository docs contain outdated candidate/live statements | `INDEX.md` still calls #637 draft after merged `b83db167`; technical/assurance records append historical candidate descriptions | **Confirmed stale active pointer**; update current-state registers/index only after distinguishing historical audit truth | Medium |
| TD-12 | Pilot source cannot yet demonstrate unrestricted exam-response readiness | `pilotRestricted` blocks original exam-question opportunities; #649 open | **Intentional trust boundary**, not a defect to remove; make student pilot success criteria explicit and honest | Launch trust |
| TD-13 | Two pending planner PRs edit the same preparation engine and technical docs | #651 and #652 changed-file lists | **Confirmed integration overlap**; freeze both for recovery classification; later combine latest approved main + reviewed unique deltas, run full applicable assurance | High |
| TD-14 | New content scaling remains unproven and a Foundation candidate is held | `docs/technical/Content Factory Foundation-Gated Implementation Plan.md` reports AQA 7132/2027 `fail_hold` external source challenge | **Confirmed documented gate**, not a fresh runtime query. Keep Foundation-first, test one repeatable additional course, record actual cost and reliability | Commercial |

Risk terms `Launch trust` and `High` here are **recovery priorities**, not new P0/P1 defect entries. Do not modify the Defect Register severity or claim system-wide P0 without standard-compliant incident/impact evidence.

## All currently open pull requests — initial coordination classification

**40 open pull requests found on GitHub.** These are **preliminary title/metadata-level dispositions**, not final code-diff adjudications. All are open and none is merged/closed by this recovery task.

| Cohort | PR numbers (all 40 exactly once) | Provisional treatment and prerequisite |
| --- | --- | --- |
| Current overlapping planner corrections (2) | #651, #652 | **PAUSE MERGE**. Harvest reviewed calendar clarity/real runway and bounded saved-choice tests only after curriculum-demand and architecture reconciliation. Both touch `preparation.ts`; do not merge either reflexively. |
| Prior recovery/vision proposals (2) | #562, #634 | **HARVEST, DO NOT MERGE AS-IS**. #562 contains valuable R0–R10 reconciling logic but is based on 7 Oct. #634 proposes inclusive student-journey authority on 15 Oct. Compare normative edits to current main; prepare one non-conflicting governing delta if needed. |
| Content availability/licensing research (2) | #646, #584 | **HOLD AS RESEARCH**. Only fold validated findings into exact-specification coverage and cost strategy; do not promote research to authority automatically. |
| CI and development-process changes (3) | #639, #613, #297 | **SEPARATE ENGINEERING REVIEW**. Benchmark actual CI first-attempt duration and security gates; avoid introducing new event/approval complexity merely to reduce wall time. |
| Learner/visual/Exam Prep historical candidates (13) | #582, #574, #573, #561, #560, #552, #441, #440, #432, #410, #408, #397, #200 | **HOLD & UNIQUE-DELTA CHECK**. Compare exact files/authority with latest main; keep necessary UI/accessibility/resume contracts but avoid resurrecting legacy dual runtime. Close as superseded only after file-level evidence and any required stakeholder decision. |
| Content Factory/mocks/content assurance historical candidates (14) | #581, #531, #529, #526, #518, #502, #493, #491, #484, #483, #479, #400, #391, #389 | **SEPARATE FOUNDATION/ASSET FACTORY TRIAGE**. Protect lineage and qualified content gates. Compare each to current approved Foundation model before merging, updating or closing; do not bulk-delete historical production work. |
| Release/recovery operational candidate (1) | #539 | **VERIFY AND RECONCILE** with exact current `revision/path-to-live = success`, open Defect Register #008 and release lineage. No automatic defect closure from a single green status. |
| Other separately gated capabilities (3) | #164, #158, #120 | **FREEZE CORE-SCOPE EXPANSION** while assessing feasibility/readiness/permissions and any urgent educational safety relevance; no assumed Ready/merge. |

**Priority file-level comparison queue:** #651 vs current main; #652 vs #651 and main; #562/#634 authority overlaps; #552/#561 Exam Prep runtime vs main; #582/#574/#573 learner design; #639 CI path; #539 release state. Classify each as retain / revise / supersede / needs-Founder-decision with unique file/behaviour evidence, not merely an aged branch label.

## Protected core to keep until contrary evidence

- Exact saved-course identity and owner-scoped persistence, starting-check boundary.
- Append-only typed Practice evidence and source-scoped Topic Knowledge/Readiness engines.
- Real calendar/assessment/weekly daily availability and legitimate accepted-session constraints.
- Restricted pilot fail-closed source and Auth protections.
- Current PR and main automated CI, data/RLS protections and governed release lineage.
- Source-rights-first Foundation → Course Truth/Exam Truth → approved asset model.

No removal without proving the replacement and ensuring user data, routes and release remain intact.

## Explicit uncertainties / remaining Phase 1 checks

1. **No local build or direct production authenticated test performed.** For claims of live student reliability, run production-mode cohort/no-cohort, RLS/ownership, real provider sign-in and interrupted/reloaded learning and mock journeys.
2. **Content source truth:** compare complete active Business/Psychology published packs against exact approved specification/assessment scope and Foundation fingerprints. Code metadata alone cannot certify educational accuracy.
3. **Technical risk quantification:** measure actual dependency reach, bundles, code duplication, failure rates, maintenance cost and first-pass test time from a repeatable baseline before deciding whether/what to remove.
4. **Whole-product educational benefit:** SV-01..13 and proposed SV-14..16 require recorded qualified evaluation and observed learner comprehension. No completed expert judgment found in #649.
5. **PR backlog:** initial 40-way coordination classification must be followed by file-by-file unique-delta checks before any closure/merge.
6. **Current state authority conflict:** proposed improvements in #634 to journey/UX/marketing and the time-bounded recovery freeze must not be promoted into permanent normative workflow or new feature scope without explicit governed approval.

## Next implementation approval boundary

This point-in-time audit and companion control plan contain **no code, database migration, test modification or active product-authority change**. Next step is to review this combined baseline, merge the **documentation-only recovery PR only with specific Founder authorisation and exact-head CI**, and execute the prioritised Gate 0 checks before preparing implementation slices. If new risk emerges earlier, escalate only the bounded safety-critical fix through normal feature/defect authority.

**Do not infer:** all 40 PRs are defects; all tests green means trust; retired planner fallback can be deleted immediately; a fixed date or duration means a student learned; the Founder has approved any PR merge by authorising this recovery process.
