# FI-001 Evidence-led Programme — Definition of Ready Assessment

**Status:** Product analysis / proposed FI-001 **material enhancement**, not Ready. 12 October 2026.
**Approved main reviewed:** `c4e990bc35682bd80815fdde221f57c9823f0c86`.
**Implementation:** none under this proposal. **Feature status in canonical backlog:** FI-001 `Live`; supporting FI-006 `Ready`; FI-009/010/011/012 `New`. Do not change those statuses based on a research PR or generic expression of agreement.
**Related analysis:** `research/Evidence-led Adaptive Planner Proposal - 2026-10-12.md`, `research/Evidence-led Planner Algorithm and Benchmark Contract - 2026-10-12.md`, `research/Evidence-led Planner Learning Science Register - 2026-10-12.md`.

## Recommendation

Run a bounded `Analyse` work package for a **Live** FI-001 enhancement and perform proportionate Definition-of-Ready revalidation before production changes. Do not invent a competing engine or new FI number. Prepare cross-feature dependency definitions for FI-009/010/011/012, but retain their lifecycle approval gates before production delivery. The direction is broadly agreed with the Founder on 12 October 2026; this is **not** a record of approved `Ready`, normative merge, or a specific PR merge approval.

## 17-point DoR assessment (not a self-approval)

| Gate | Status | Current finding and remaining decision |
|---|---|---|
| 1. Student problem | Pass for analysis | Multi-course students cannot reliably distribute prep through all exams and verify retained knowledge; main students GCSE/A-level. |
| 2. Strategic case | Pass for analysis | Directly strengthens Personalised Revision Intelligence; alternative of simply widening 60-day schedule is inadequate and risks false precision. |
| 3. Value hypothesis | Provisional | Better justified next task, fewer impossible/deadline-violating plans, no subject starvation, useful delayed checks. Needs pilot success/stop criteria. |
| 4. Experience and simplicity | Partial | Home today, Plan Day/Week/Month, REV interaction and graceful unknown dates already governed; long-term programme/milestone presentation requires concrete design/acceptance before Ready. |
| 5. Evidence/intelligence | Partial | Boundaries clear; audited agreement needed on actual evidence-model API, recency/contradiction/confidence semantics and actual asset coverage. No new planner shadow readiness. |
| 6. REV | Pass in principle, conflict unresolved | REV explains and negotiates rather than calculates; fixed REV 14/7-day ordering conflicts with programme-aware ranking, needing normative reconciliation. |
| 7. MVP boundary | Proposed | R1 deadline/identity safety; R2 full horizon; R3 fair short-term allocation. R4/R5 checkpoint/Exam Prep additions separate and dependent on their feature approvals. No LLM scheduler. |
| 8. Free/Paid/Premium | Partial | Proposed: preserve useful today, fair plan and truthful necessary evidence on Free; fuller view/management/convenience on Paid; contextual in-depth coaching on Premium. Needs FI-002 entitlement review, cost and exact valuable differentiators. Do not restrict educational truth or safety by tier. |
| 9. Upgrade hypothesis | Partial | Paid improves visible multiweek programme control and planning explanation; Premium adds higher-touch interaction. Verify that added convenience/value motivates upgrades without anxiety manipulation. |
| 10. Measurement | Proposed | Canonical actionable recommendation start, balanced prep, deadline correctness, healthy capacity, repeat work, user-rated helpfulness; product-specific delayed retrieval/held-out exam skill only after meaningful pilot. Need event/data minimisation plan and denominators. |
| 11. Founder/Admin assurance | Proposed | Track overloaded days, post-exam recommendations, unexplained subject starvation, unknown dates/capacity cases, low evidence, churn, supported asset failures, model/runtime costs; reconcile with existing Assurance Coverage Register rather than new dashboard. |
| 12. Risks/trust/accessibility | Partial | Strict deadline and valid-scope gates, no fabricated evidence, student choices/rest, low-pressure UX. Need formal safeguards for minors' context, keyboard/accessible timeline, unnecessary pressure, timezone handling and backfilled data. |
| 13. Technical feasibility | Partial | Existing canonical React/Vite `/app/` via `src/app/PlannerRuntime.tsx` and `src/app/PlanScreen.tsx`; deterministic logic `src/engine/planning/`; bridge `src/app/planner-model.ts`; Supabase planner services. Need fit-to-runtime/asset/data review, fixture extraction and rough per-phase effort/cost estimates. |
| 14. Test assurance | Proposed | Eighteen frozen business/Psychology learner journeys, paper cutoff, curriculum identity, time/availability, evidence provenance, stability, Home/Plan/REV consistency, browser/a11y/security and pilot evaluation. Must run, not merely write the plan. |
| 15. Docs and authority | Partial | Promote FI-001 model to `Adaptive Revision Planning.md`, reconcile REV priority; update `Course Learning Blueprint.md` only for new mandatory treatment rules, claims/evidence only for changes, backlog and technical docs with implementation; source chronology preserved. |
| 16. Blocking decisions | **Fail** | Reconcile priority algorithm vs fixed REV rules; choose approved treatment of no dates/no availability; define authoritative checkpoints vs FI-006 excluded repeated diagnostics; confirm real course/option/AO/asset applicability and commercial MVP boundary. |
| 17. Founder Ready approval | **Not given** | Requires explicit feature-specific decision after all gates are satisfied and appropriate normative PR reviewed. This user's agreement to direction is not `Approve FI-001 enhancement Ready`, nor `Approve merge PR #...`. |

## Owner/risk/assurance separation

- **FI-001** is the sole programme scheduler and owner of capacity/time horizon, subject budget, milestones, near-term decisions and reason tracing.
- **FI-006** provides initial low-strength directional check **only**; periodic/course-wide diagnostic function is currently excluded by its Ready definition. No retrospective scope change.
- **FI-009** owns spaced retrieval selection policy and evidence of delayed recall; initially `New`.
- **FI-010** owns assured targeted-test assembly and discriminative breadth; initially `New`.
- **FI-011** owns misconception correction + independent retest treatment; initially `New`.
- **FI-012** owns optional student-facing exam-soon focus behaviour; initially `New`; it does not create a second scheduling engine.
- **Existing Exam Prep / learning-evidence engine** owns authentic paper/marking confidence and actual educational claim strength; the planner only consumes validated outcomes.

### Free/Paid/Premium provisional experience recommendation

Free: permit at least one genuine useful next recommendation and fair timing, no fake diagnostic paywall, no premium lock on necessary educational integrity or safeguarding. Paid: programme-wide subject balance view, more detailed multi-week context and ongoing user controls **if** sustainable and consistent with FI-002. Premium: richer REV coaching/explanation (not superior honesty or safety). These are proposed for DoR assessment, not final entitlements. Deterministic planner calculation is cost-negligible relative to content production and optional AI tutoring; specific monetary forecasts require usage/work estimates, not made-up values.

## Minimal integrated decisions to resolve before Ready

1. **Priority source of truth:** replace REV's rigid per-topic 14/7-day order with programme-aware FI-001 ranking while preserving `Not now` and `Suggest something else`; document jointly in REV and Adaptive Planning authority after Founder review. 14/7 are tuneable legacy candidates, not learning-science facts.
2. **Scope and timing of checkpoints:** FI-001 reserves broad preparation opportunities; FI-009/010/011 supply selected assured retrieval/tests and evidence. No fixed universally mandatory day offsets, no FI-006 scope override. Independent checks must support student opt-out/alternative.
3. **Missing information:** unknown exam dates cannot block useful revision and cannot fabricate deadlines; unknown availability cannot become fictitious booked time; present a supported next action and optional setup, respecting approved onboarding order.
4. **Paper/qualification truth:** verify Business shared topics and distinct formats; Psychology selected Paper 3 options and exam-demand mappings before any high-risk planner computation.
5. **Phased pilot and commercial boundary:** implement hard correctness first, then long-horizon and balancing; gated FI-009/010/011 before intelligent retrieval/checkpoints; begin with affordable deterministic logic, assured content and sufficient low-cost tests.

## Start condition and documentation-impact check

R0 research and proposal branch may proceed now under `Analyse`. Formal authority changes should be prepared on governed branch/PR and remain proposals until Founder review and merge approval. Production code changes must wait for relevant Ready approval, except a separately scoped defect correction under the repository's defect workflow. At production implementation each PR must update `docs/technical/Adaptive Revision Planner Implementation.md`, tests and applicable authority/registers together. New immutable evidence and necessary recording must be privacy-governed. No historical audit/decision/source data rewritten.

**Gate summary:** substantive product direction supported; **not Ready**. Founder action for R0: review proposed normative reconciliation and product scope. Later: explicitly approve Definition of Ready, and explicitly approve each merge at its own boundary.

## Latest current-main reconciliation note (12 October 2026)

Fresh code inspection confirmed `src/app/PlanScreen.tsx` also uses `PLANNER_HORIZON_DAYS = 60` for its accepted-session load window in addition to the engine's separate 60-day task horizon. This is a data-loading concern: extend long-term programme/milestone horizon without making Plan query a year of individual sessions. Preserve lazy/visible-range loading and add a regression scenario for a 120+ day exam with bounded accepted-session fetches. AQA's 2027 Psychology 7182 specification has three 96-mark two-hour papers and Paper 3 requires one selected topic from each of its three option groups; Business 7132 uses three 100-mark two-hour papers and all course content can be assessed in each. The fixture contract must model selected options and paper-format differences without inventing missing options or dates. References: https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/specification-at-a-glance ; https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance . No new product authority or implementation has been approved by this note.
