# Revision — Product Recovery Control Plan

**Status:** Active technical recovery control plan; Founder-approved PR #653 merged 21 October 2026 (merge `512d4022e9774355a19d2a87b703dcde3ed3f50f`). Subsequent fixes require separate governed PRs and approvals.
**Prepared:** 21 October 2026
**Source baseline:** approved `main` `b83db167d38ba02ff997c428f31b7f725e8b10d6`
**Founder direction:** 21 October 2026 — authorisation to initiate a controlled recovery, pause non-critical learner feature expansion, reconcile existing proposals/PRs, assess engineering and define one release-oriented recovery plan. This does **not** approve any specific PR merge, wholesale rewrite, new feature Ready state or relaxation of an educational trust gate.
**Evidence appendix:** `audits/2026-10-21-revision-recovery-phase1-baseline.md`
**Existing sources to consolidate, not supersede silently:** draft #562 (7 October engineering reconciliation); draft #634 (15 October inclusive revision-process journey); #651 (calendar-first correction); #652 (educational completeness audit / bounded learner preference); current approved strategy, Adaptive Revision Planning, Course Learning Blueprint, Claims and Progress Governance, Foundation-gated Content Factory authority.

## Outcome and governing boundaries

Revision's first trustworthy learner release must demonstrate one connected loop:

`exact approved course/papers → real curriculum and exam-skill obligations → useful Learn/Practice/Exam Prep → evidence and feedback → separate Topics covered / Understanding / Exam readiness → one exam-backwards feasible adaptive programme → consistent Home/Plan/REV next action → re-evaluation after genuine progress, changed time and further assessments`.

This is **existing approved strategic direction**, not a proposed replacement product. A finite list of generated activities, a visually full calendar, a successful deployment, or green component tests are not proof of this loop.

### Coordination rule during recovery

Founder-authorised temporary **priority and integration hold** on unrelated learner feature expansion and cosmetic churn. This is a programme coordination direction, not a unilateral revision of the repository's rules permitting concurrent PRs. Protect urgent security, data-loss, accessibility and production defects with narrowly scoped governed fixes. Keep valuable Content Factory foundation work independently progressing only if it does not duplicate or change learner runtime responsibilities. Maintain one accountable implementation owner for overlapping core learner work and record dependencies. No auto-close, auto-merge, abandoned-student-data migration or production entitlement change is authorised by this document.

All actual changes to normative product rules require an approved update in the numbered authority folders and, if relevant, a feature Definition-of-Ready approval. All implementation changes require same-PR technical documentation, tests, assurance-register impact and current-main integration. Historical audits remain untouched. Explicit Founder approval is required for **each** PR merge.

## Gate 0 — Establish truthful current state (Phase 1)

**Entry:** this authorised read-only consolidation plus documentation proposal, based on current approved main. No source code modifications.

1. Baseline exact protected main, deployment status, canonical runtime and valid cohort boundaries. Record which claims are backed by source, automated CI, production database/browser or actual observed learners.
2. Inventory and provisionally classify all open PRs; deep-compare only candidates likely to supply unique value against latest main. Do not merge stale #562/#634 as-is or allow #651/#652 to overtake critical completeness work.
3. Retest high-risk assumptions from the older #562 audit against current `main`: one recommendation calculation, activity identity/Start/completion, Learn exposure vs mastery, exam-attempt durability, whole-paper evidence scope, educational assets, real availability and course option/paper boundaries, REV capability and pilot gate.
4. Quantify tech debt **by demonstrated cost/risk**, not file count: duplicate execution paths, unowned state, difficult test boundaries, unsafe lifecycle, stale current-state docs, CI first-attempt reliability, and coupling. Record Keep / Repair / Consolidate / Remove / Decision-needed and exact verification for each.
5. Review defects #647 and educational acceptance #649, plus the Defect/Assurance registers and release lineage. Close nothing without closure evidence; obsolete dated text remains history.
6. Produce one ranked workstream backlog from the acceptance matrix below. Include dependency and exit criteria, and a hard stop on speculative refactors.

**Exit:** one trustworthy matrix of current implementation and evidence, one risk-ranked technical-debt register, all overlapping open PRs classified with disposition and evidence, and a Founder-facing recovery change approval summary. Draft dispositions in the appendix are **not final triage** until relevant file-level comparisons. The existing QA baseline is not a claim of end-to-end educational acceptance.

## Single product acceptance matrix

Definitions: **Implemented** = source path exists, not necessarily student-proven; **Partial** = known gap; **Unknown** = insufficient end-to-end evidence; **Restricted** = withheld in controlled pilot; **Approved/accepted** requires scope-appropriate functional + technical + content/educational evidence. Treat each row as a student outcome, not a feature tick-box.

| ID | Student outcome that must be proven | Current source / assurance | Current judgment | Minimum acceptance evidence |
| --- | --- | --- | --- | --- |
| REC-01 | Sign in, select exact saved course/board/spec and resume setup | `PlannerRuntime`, learner membership, first-use gate; JRN-08 browser/DB | Implemented / production sign-in unverified | Real authenticated pilot sign-in, owner-only persistence, skip/retry/reload |
| REC-02 | Understand actual assessed knowledge and response skills before scheduling | Course Foundation/Blueprint, `scopeTopicIds`, `paperResponseRequirements` | Partial | Requirement coverage independently compared with exact spec/options/papers; unsupported demand explicit |
| REC-03 | Learn content and record meaningful exposure without upgrading marks | `FocusedLearningWorkspace`, `progress-summary`; JRN-03 Partial | Partial | Approved page read completion persists; Topics covered updates; Understanding and Exam readiness do not |
| REC-04 | Complete multi-question scored Practice with useful feedback/repair | Practice workspace, evidence service, topic knowledge; JRN-04 covered at browser/data layer | Implemented / journey-level repair Partial | Correct answer/confidence/scoped persistence, actionable repair and independent retest |
| REC-05 | See distinct, honest coverage, understanding and exam readiness | Claims & Progress authority; `catalogue-model`, `progress-summary` | Partial | No exposure-to-mastery conflation or arbitrary paper-to-topic credit; insufficient evidence disclosed |
| REC-06 | A full exam-backwards plan balances paper dates, skills, capacity and actual progress | `planner-model`, `preparation`; JRN-07 automated at candidate layer; PLN-VALUE-01 Partial | Partial | Source-complete obligations, meaningful full horizon + feasible near term; reviewed SV-01–16 scenarios |
| REC-07 | Same choice, reasons, timing and exact Start across Home, Plan and REV | Each builds planner snapshot; `HomeFocusedActivity`; course Progress has `rankSuggestions` | Partial | One versioned decision / consistency fixture; exact authorised asset launch; no double completion |
| REC-08 | Change study hours, miss work or add mocks without debt or lost accepted sessions | assessment and availability services; planner/programme capacity tests | Partial | Real change/reload counterfactual; no overbooked day, lost commitment, post-exam task or false completion |
| REC-09 | Perform authentic supported paper practice and trusted marking | original Business questions; pilot restrictions; #649 open | Restricted / Partial | Exact source/mark scheme review, AO alignment and appropriate evidence provenance; no unreviewed learner claim |
| REC-10 | Long mock survives refresh/re-entry, submits safely and affects correct scope | `ExamSimulator` local answer/timer state and `exam_attempt` topic fallback | Partial / high-risk | Server-owned resumable attempt, idempotent submission, paper and per-question evidence ownership |
| REC-11 | REV explains supported priorities and helps a stuck learner truthfully | `PlannerRevScreen`; limited rule-based intent; FI-003 not Ready for full tutor | Partial | Contextual truthful explanation, supported shorter action only when real, safeguarding and privacy acceptance; FI-003 Ready for material extension |
| REC-12 | Safeguarding, privacy, accessibility, RLS and resilient production behave safely | authority + existing browser/SQL/security gates | Covered in declared automated subsets, not full real-user acceptance | Live provider/owner-permission and recovery exercises; AT/responsive acceptance, no critical gate bypass |
| REC-13 | Supported course content can be produced repeatably and safely | Foundation-first model; current 7132/2027 source challenge `fail_hold` recorded | Partial / separately gated | Exact approved foundation, source rights + educational review; timed/costed additional-course proof |
| REC-14 | Students understand what to do and why and can continue after interruption | #634 journey study proposal; #649 nine-task protocol | Unknown | Consented supervised students, recorded comprehension and recovery issues, genuine sign-off |

**Trust invariants across every row:** no invented or unsupported exam scope, no unsafe unreviewed marking, no fictional availability, no false grade certainty, no scored credit for passive Learn, no unrelated topic credit for a whole paper, no learner data crossover, no loss of accepted activity or submitted evidence. A restricted pilot must continue to fail closed for withheld material. If release-critical invariants fail, stop the affected release even if CI is green.

## Gate 1 — Product and educational contract

Consolidate #562 engineering and #634 inclusive-journey candidate material against already approved authority, without elevating proposals automatically. Define a single observed first-time, returning, behind-plan, weak-evidence, improved-evidence, scarce-time, multi-paper and interrupted-assessment journey. Use the supported Business 7132 and Psychology 7182 content with correct option handling and honest limitations. Derive acceptance tests from **the actual course/exam demand**, not available activity count. Resolve genuine conflicts as proposed Founder authority changes in a separate governed PR.

**Exit:** Founder-approved changes only where required; an agreed end-to-end journey table, acceptance fixtures/oracles, no competing experience specs, content-assurance attribution and bounded pilot criteria.

## Gate 2 — Engineering consolidation and vertical slices

Use **existing runtime** `/revision/app/` → `src/main.tsx` → `FirstUseBoundary` → `PlannerRuntime`, then canonical Home, Plan, Courses, Progress and REV. Retain validated source/evidence/database/RLS foundations. Change canonical responsibilities in dependency order:

1. Truthful learner state: Learn exposure vs scored evidence, course/paper evidence identity and one activity lifecycle.
2. One shared programme decision and exact launch/completion contract; eliminate independent priority pathways **only after** parity and reason tests.
3. Complete source-backed examination demand, pedagogical progression and evidence-triggered rechecking; keep FI-009–012 specialist scope unimplemented until Ready.
4. Reconcile exam content and mock modes, implement durable full attempt and correct paper evidence; preserve restricted pilot gate pending #649.
5. Align REV with the approved reachable capability; any material FI-003 assistant/model work first needs its own Ready approval and safeguarding/privacy reviews.
6. Remove legacy routes/renderers only after explicit replacement proof, dependency search, browser regression and no historical data loss.

**Do not** refactor just because a module is long or tests are slow. Each coherent slice must include same-main impact assessment, small safe diff, technical docs, domain/browser/DB where relevant, and genuine observed-behaviour exit criteria.

## Gate 3 — Supervised student pilot, then wider release decision

Pilot acceptance is not unrestricted launch acceptance. Pilot may proceed only with exact Auth cohort fail-closed permissions; safe supported Learn/Practice, privacy/RLS, bounded session integrity, truthful Day/Week/Month and Home/REV, usable fallback/recovery, and controlled human observation. Original unreviewed Business assessments and written self-marking stay restricted until qualified A3/A4 review. Run real person tests, not only network-substituted Playwright. Record educator reviewer qualifications, approved source/question versions, observed decisions and remediation. Never claim grade uplift before defensible evidence.

Public launch adds content coverage truly supported/advertised, full eligible exam practice assurance, persistent exam attempts, real operational readiness and documented course-scaling economics.

## Gate 4 — Content Factory repeatability (separate coordinated workstream)

The approved active Foundation and Asset Production Model remains controlling: exact source/legal rights → Course Truth / Exam Truth → deterministic + independent + qualified review → approved Foundation → justified Learn, Practice and Exam Prep assets. Current technical Foundation-gated plan records an external-source `fail_hold` for the AQA 7132/2027 candidate; verify current operation before advancing that specific version. Measure actual human time, generation cost, validation cycles, failures, reuse and final expert approval for an additional exact course. Never infer educational completeness from number of generated assets.

## Delivery order, gates and reporting

- **Recovery PR (this candidate):** documentation only, single live control plan + dated observed evidence; no production effect. Then obtain specific Founder approval to merge if fully reviewed.
- **First implementation slice:** highest-risk current correctness/trust and data-state consolidation, prioritised from Gate 0 verified evidence. Reject unsupported "fix everything" scope.
- **Then:** unified executable learner loop and full programme obligation quality, followed by durable authenticated full mocks and qualified exam content.
- **Pilot:** release-gated under actual student trust constraints, with no fabricated assurance.
- **Wider launch:** only on proved product/operational/course repeatability.

Report weekly by `REC-01..14`: implemented evidence, browser/data/production proof, educational proof, open risk, last version checked, and next blocking slice. Include CI first-pass reliability, escaped defects, source-confirmed duplicate responsibilities and course production costs. A green CI run is a technical input; no score is derived from PR count, test volume or document count.

**Documentation impact:** This candidate creates only a technical delivery plan, dated audit and INDEX link. No change to approved product authority or currently operating code is asserted. If accepted as a standing change to the company workflow rather than a time-bounded Founder-directed programme priority, propose the corresponding numbered workflow authority update through its own PR. Historical #562/#634/#637 material must not be rewritten to new facts.
