# FI-001 — Vision-to-Governance-to-Implementation Gap Analysis

**Observed:** 15 October 2026, current approved main `fd8565838db8fc27cbf359fc86d846e9ab11fda5` (merge PR #632). **Status:** Point-in-time audit/evidence, not product authority. Reviewed INDEX, hierarchy, constitution, strategy, Product System Model, Course Learning Blueprint, Adaptive Revision Planning, REV, R1/R2 readiness, FI-009–012, learning-science research and canonical React/TypeScript engine and Plan tests.

## Finding

**[Certain] The Founder vision already exists in normative authority but is not demonstrated by production planning.** Strategy defines Personalised Revision Intelligence; Product System Model requires linked curriculum/learner/exam/planning layers; Course Learning Blueprint defines treatment types. Adaptive Revision Planning, especially its whole-programme section, already requires horizon to the last known paper, weekly cross-course allocations, evidence-sensitive treatments, checkpoints and same-plan Home/REV. Rewriting the vision from scratch would add competing authority, not solve the discrepancy.

## Trace by desired learner capability

| Desired outcome | Governing authority | Observed main implementation | Gap / disposition |
|---|---|---|---|
| Exact course, specification, paper and selected options | Product System Model; Course Content and Assessment Component Placement; Adaptive Planning | `plannerCandidatesFromLearningState`, `scopeTopicIds`, `buildPlannerProgramme`; supported Business 7132 and Psychology 7182 paper scopes | **Reuse**, but verify completeness of obligation/skill mapping and no paper-skill omission |
| Trustworthy knowledge/uncertainty | Evidence Trust; Claims and Progress; Course Blueprint | `topicEvidenceSummary` averages scoped percentage evidence and approximates strength by `count/4`; course readiness confidence contributes to strength; engine owns separate progress/readiness | **Modify planning adapter**: proxy strength is not a full learner-evidence sufficiency model; do not override evidence engine |
| Exam-backwards knowledge/skill requirements | Adaptive Planning whole-programme contract | `programme.ts` constructs date-keyed weeks and exam milestones from active assessments and supported R1 candidates | **Missing** preparation obligations, dependency chains, treatment-phase strategy, demand/workload and feasibility |
| Balanced time across exams and subjects | Adaptive Planning cross-course rule | `planning.ts` ranks each candidate with weighted heuristic then greedily packs once in dates; `weekly-focus.ts` shows up to 1/2/3 topic labels and sometimes alternates courses | **Replace allocation core** with coherent needs/capacity allocation; do not mistake alternation for balance |
| Real weekly learning objectives | Adaptive Planning Week/Month; Course Blueprint | `weekly-focus.ts` uses global candidate rank, a `seen` set and a one-per-course loop; `PlanProgrammeOutlook.tsx` displays topics and generic activity format | **Missing** why this week, intended capability, phase, meaningful workload/constraints or verified revisits |
| Justified revisit / broad checking / exam demands | Course Blueprint; Adaptive Planning; FI-009–012 gates | repeated topics only after unseen exhausted; no approved scheduling/cadence evidence; R1 exact exam question can launch when verified | **Missing** evidence-dependent treatment opportunities and supported scope; specialist modes remain gated |
| Whole horizon and deadline safety | Adaptive Planning | `programme.ts` spans last valid exam; R1 specific-day per-assessment cutoffs; detailed tasks bounded at 14 days; separate 60-day accepted-session lookahead | **Retain** these strong technical safety boundaries |
| One shared actionable Today | Adaptive Planning; REV; Home | `today-recommendations.ts` promotes accepted then derived Plan tasks; exact supported routes enforced, truthful fallback | **Retain**, then make recommendation derive from programme objective |
| Missed work / student choices | Adaptive Planning | accepted sessions preserved, recalculation possible, no general missed-task debt | **Retain** and add programme-level consequence/reallocation |
| Honest learner acceptance | Product UX Principles; Testing Standard | R2 tests assert horizon, dedupe, topic variety, low minutes, no accidental writes and a11y, but not quality of preparation strategy | **Replace acceptance centre** with end-to-end counterfactual student outcomes |

## How the narrowing occurred

1. **Sensible R1:** 13 October R1 readiness prioritised safety: paper cutoff, shared-course dedupe, assets, supported Start, same Today between Home/Plan/REV. These are necessary foundations, not a product strategy.
2. **Decisive R2 scope restriction:** R2 readiness, approved after #628, specified a *programme-horizon and weekly-envelope* stage and explicitly **excluded** rewrite of R1 rank logic, exam demands, cross-course optimisation (R3), and checks/recall (FI-009–012). R2a was built as a read-only calendar projection, consciously not an allocator.
3. **R2b/R2c inherited an empty strategy:** #630/#631 added a factual weekly Plan outlook and exam-proximity course ordering. Dates/capacity were visible, but there was no calculated learning progression.
4. **Visible symptom and incomplete correction:** #632 replaced repetitive weekly course names using `weekly-focus.ts`. Its algorithm chooses up to three candidate topics based on capacity thresholds (0, <45, <120 minutes), avoids previously *displayed* topics, and alternates courses under one-topic capacity. These are display/rotation heuristics, **not educationally justified weekly preparation**; marking a repeated display as `revisit` cannot prove retrieval is useful.
5. **Acceptance definition rewarded technical invariants:** R2-01..12 guard chronology, factual paper scope, query windows, determinism and responsive UI. New weekly-focus test requires 24 unique topics in eight weeks and rotated 30-minute weeks. Neither confirms that study opportunities match remaining required learning, skill dependencies, validated evidence, workload realism, or paper demand. A visually populated month could therefore pass while being strategically incoherent.

**Responsibility:** scope and product-acceptance mismatch, not a claimed failure of CI, a regression by a particular engineer, or failure of the underlying educational research. Approval of the bounded R2 was legitimate *for its stated scope* but should not have been treated as proving the USP. No historical CI/test result is altered.

## Classification and governance

- **True active authority conflict:** none identified between the Founder's renewed vision and existing foundational/active product principles. These already support programme-first planning.
- **Delivery/lifecycle tension requiring explicit amendment:** the proposed *minimum meaningful intelligent planner* crosses exclusions in approved R2 readiness (R3 balancing; potentially FI-009/010/011/012). It must be treated as **new, proposed FI-001 scope/Definition of Ready**, not as maintenance within R2.
- **Implementation gaps:** obligation graph, treatment selection, feasible allocation, interpretable objectives, strategic-consistent Today, and educational scenario oracles.
- **Recorded incomplete assurance:** R1-11 published-course unscored Learn → planner path stays Partial (issue #621). R2 learner-value remains unproven despite #632 in main. Main merge does not independently establish #632 production deployment.
- **No new automatic authority:** pre-existing R3–R5 phase sketches and research scenarios remain candidate analysis until deliberately approved.

## Documentation impact

Product Strategy, Product System Model, Adaptive Revision Planning and REV receive targeted proposed clarification; proposed target architecture and revised Definition of Ready are separate programme planning records. Backlog/assurance/index are updated with explicit non-Live, non-Ready status. No historical decisions/research are rewritten; no production code or database behaviour changes in this governance PR.
