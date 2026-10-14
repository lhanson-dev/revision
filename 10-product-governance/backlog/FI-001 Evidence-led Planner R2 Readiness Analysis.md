# FI-001 R2 — Full-Exam-Horizon Programme and Rolling Weekly Plan: Definition of Ready

**Status:** ANALYSE — proposed **Ready** assessment; **not approved** for implementation.  
**Prepared:** 14 October 2026 against approved `main` `355a4f5d7619d8f6500c4aa02f6263c5b40c33ad` (R1 correctness / #624 and DST regression / #627 production-verified).  
**Owner:** Product / Engineering; Founder controls Definition-of-Ready and PR merges.  
**Authority:** `10-product-governance/Adaptive Revision Planning.md` (approved long-horizon/weekly/Today distinction), `20-brand-and-experience/REV Guidance and Conversation Pattern.md`, `10-product-governance/Returning Student Home Experience.md`, `10-product-governance/Student Lifecycle Journey Contracts.md`, `10-product-governance/Subscription Plans and Entitlements.md`, `40-evidence-and-trust/Claims and Progress Governance.md`. `80-company-workflows/Feature Definition and Measurement Workflow.md` provides all 17 gates.  
**Supporting, non-authoritative evidence:** `research/Evidence-led Planner Algorithm and Benchmark Contract - 2026-10-12.md`, `research/Evidence-led Adaptive Planner Proposal - 2026-10-12.md`, `research/FI-001 Evidence-led Planner Definition of Ready Assessment - 2026-10-12.md`; the frozen R1 readiness/contract. Research parameter suggestions and study-effect sizes are not approved product defaults or claims.

## Decision requested

**Recommend Founder approval of the bounded R2 scope below after this readiness document enters approved `main`.** This record itself is *not* an R2 Ready receipt. Until explicit human approval, FI-001's current implementation remains Live, R2 remains Analyse, and no R2 production-code implementation may begin.

R2 is the **programme-horizon and weekly-envelope** stage, not an overhaul of education scoring, exercise selection, timed exams, cross-course allocation optimisation (R3), spaced-repetition scheduling (FI-009), new targeted tests/checkpoints (FI-010/011), the exam-soon mode (FI-012) or AI scheduling. It should remove the misleading 60-day programme truncation without showing distant daily sessions as promises.

## 1–3. Learner problem, strategic value and falsifiable hypothesis — PASS

A GCSE/A-level student with multiple papers and possibly several active courses needs to understand how the time before their **last known future exam** relates to reasonable weekly preparation, while having **one immediate useful next action**. The current live `plannerDaysFromAvailability()` cuts detailed derived scheduling at 60 days; an unrelated 60-day `PlanScreen` constant controls accepted-session reads. A learner with an exam four months away cannot see a coherent full-horizon programme. Merely raising the day limit would promote imaginary task precision, oversized queries and repeated one-off obligations.

This improves Revision's strategic continuous loop: dates + realistic availability + validated learning evidence → meaningful preparation outlook → next useful supported task → legitimate result → recalculated outlook. **Hypothesis:** given a valid exam more than 60 days away, Plan accurately locates it in the programme, shows date-safe coarse weekly intentions through that final known exam and keeps the next usable supported action stable across Home/Plan/REV, without loading a year of daily tasks or fabricating evidence. If no exams or availability exist, a truthful immediate suggestion and setup path remain.

Doing nothing leaves an avoidable trust/visibility gap. Setting `60 → 365` alone is rejected: it conflates forecast detail with strategic horizon, scales accepted-session fetches incorrectly, and may starve real later-paper obligations.

## 4. Learner experience and simplicity — PASS

- **Entry:** existing authenticated `/revision/app/#/plan` through Home or global Plan. Retain current Day, Week (default), Month, Manage exams and Plan settings. Do not create a new planner engine, navigation destination, wizard, overdue-debt list or paywall.
- **Today / next 7–14 days:** only achievable, asset-backed, date-eligible concrete tasks. The 7–14-day detail interval is a design hypothesis to benchmark, not an educationally proven optimum or a hard entitlement. Home/REV display the exact next actionable Plan item when one exists; accepted student choices remain authoritative.
- **Beyond detailed forecast to last known exam:** coarse **weekly subject/course priority envelopes**, actual exam milestones, supported preparation opportunities and an honest sense of whether time is constrained. These are **not booked sessions**, and no exact day, duration or grade-gain prediction is promised far in advance. Month remains summary-first; deeper weekly ranges may be browsed without seeding hundreds of dated tasks.
- **Updating:** new/changed/archived paper dates, course removal, capacity exceptions, accepted sessions, validated scored evidence and local-day rollover recalculate eligible priorities. A moved paper never leaves its expired target active. Completed and explicitly accepted sessions are not silently rewritten, duplicated or converted into mandatory debt.
- **Incomplete input:** no known dates → no fictitious final-exam milestone; no weekly availability → no fabricated capacity-feasibility conclusion; no scored evidence → uncertainty, not failure or mastery zero; unsupported course/asset/optional Psychology scope → omit unsafe task and explain supported fallback.
- **Responsive/a11y:** reuse canonical Plan components and learner tokens on phone/tablet/desktop, descriptive time ranges and accessible milestone/priority names, keyboard navigation and clear low-pressure language. Do not render an unreadable 365-column calendar.

## 5–6. Educational evidence and REV — PASS

Consume current exact course membership, approved Business 7132/Psychology 7182 per-paper/specification truth, authorised learner assessments, date-only paper cutoffs, existing scored learning-evidence/readiness projections, consented planning preferences, weekly capacity and date exceptions, accepted sessions and supportable activity routes. Reuse current evidence engine and stable IDs. No new score, hidden inferred exam, knowledge-decay formula, evidence confidence upgrade or fabricated school start time. Unscored Learn Quick checks and FI-006 starting checks remain **directional only**; no change to coverage/understanding/readiness/grade is permitted from them. A plan/milestone is not an attainment fact.

REV may **explain** real weekly/daily priority, uncertainty and capacity trade-offs and present the existing single shared next-action decision; it does not manufacture a second priority list, negotiate mastery or independently generate calendar entries. Prefer existing deterministic reason codes; expose an explicit reason when a course cannot be allocated useful near-term work rather than implying it is already prepared.

## 7. R2 MVP and deliberate exclusions — PASS

**Included:** (a) one compact read-only, deterministic programme projection from now through the final valid known active paper, with weekly course-level preparation/envelope summaries and milestones; (b) narrow near-term task dates remaining in the existing safe R1 engine; (c) separation of full horizon from accepted-session I/O and visible-range lazy querying; (d) integration of this projection into existing Plan/Month and bounded REV explanation, with Home's next recommendation unchanged; (e) deterministic recalculation, performance, evidence and responsive assurance.

**Excluded:** rewriting R1 scoring or rank weights; general educational optimality/fairness tuning (R3); invented recurring retrieval obligations; new diagnostic/retest/mocks/AI marking; Psychology option invention; new always-on background worker; extended appointment/history queries; notification scheduling; school calendar integrations; cohort prediction; new commercial entitlements; a new calendar visual design. Where R2 exposes uneven course opportunity, report it; optimise allocation quality under R3 with separate Ready approval.

**Implementation sequencing after Ready:** R2a pure programme projection + benchmark fixtures (no UI). R2b constrained Plan projection and lazy visible-window reads. R2c shared Home/REV consistency and full learner/production assurance. Separate appropriately sized PRs, each Founder-approved before merge.

## 8–9. Free / Paid / Premium and conversion — PASS

Current approved `Subscription Plans and Entitlements.md` grants **core adaptive planning and today-focused guidance at every tier**. Accordingly, **Free, Paid and Premium all receive the same truthful full known-exam horizon, capacity/deadline guards and basic weekly priorities** in R2. No R2-specific pricing, prompts, usage limits or premium planning restrictions are introduced.

- **Free:** real multi-course/core Plan and useful next task; no deliberately truncated horizon.
- **Paid:** the same reliable R2 base as part of a broader separately governed self-service depth proposition; R2 alone does not create a paid discriminator.
- **Premium:** the same reliable R2 base; deeper contextual REV coaching may be added **only through separately approved FI-003/FI-002** scope, not by hiding R2 truth.

**R2 conversion hypothesis: N/A as a direct upgrade intervention.** Increased helpfulness/retention may later support Paid conversion, but no claim or entitlement is preauthorised by this readiness. Deterministic scheduling has no variable LLM calls; actual compute, storage and query cost must be monitored. No artificially reduced Free experience or anxiety messaging.

## 10–11. Measurement and Founder assurance — PASS

Use existing planner-service/experience events and inspect minimal new instrumentation only where a genuinely missing decision cannot be measured. No broad new analytics collection, raw student answers or personal exam history in telemetry.

- **Primary product acceptance:** among fixtures with at least one valid known future paper more than 60 days away, **100%** of last valid exam milestones appear in the programme and **0** projected *paper-only* tasks occur on/after that exam date; denominators disclosed. This is a deterministic correctness target, not an educational efficacy claim.
- **Adoption:** eligible active-course students with known dates who visit Plan's weekly programme / eligible students. **Useful engagement:** open a future week, then Start a supported near-term recommendation; do not count passive open alone as a learning gain.
- **Outcome/experience:** user-rated “I understand what to focus on before my exams” before/after during an appropriately consented pilot; report sample and bias. Held-out grades/learning gains are **not** proven by R2 and should not be asserted.
- **Guardrails:** unsupported/expired tasks = 0 in controlled fixtures; oversubscribed days = 0, same-input Home/Plan/REV next-item mismatch = 0, active-course/option errors = 0; unknown availability never shown as zero available; 0 evidence-metric updates caused by plan actions; no unexplained silent course starvation where meaningful opportunity exists.
- **Operational:** programme computation latency/memory with 120-, 365- and 730-day fixture horizons, number and span of accepted-session queries per visible window, fallback/error rate, deterministic snapshot stability. Measure observed values **before** setting product performance SLAs; no invented thresholds.
- **Founder/Admin:** reuse existing Admin/Assurance and coverage register for high-severity path-to-live status, calendar/capacity violations, unsupported assets, missing-input fallbacks, cross-course opportunity exposure and query/compute regression. No new admin dashboard in R2.

## 12. Risk, safeguarding and accessibility — PASS with controlled risks

**Level 3 / High**: shared deterministic engine, Home/Plan/REV coupling and owner-scoped data. Main risks are post-exam task leakage, shared-paper duplication, overconfident far-future dates, silent course starvation, oversized data queries, R1 regression, unclear mobile horizon and pressure-inducing alerts. Controls: hard eligibility and actual calendar-day cutoff before ranking, valid assured assets/options only, coarse distant milestones, bounded windowed persistence reads, student-chosen commitment preservation, no shame/debt language, a11y keyboard/screen reader checks, and full responsive regression. Supabase RLS/user-isolation and age-appropriate privacy remain unchanged. No new content generation or advice/grade certainty.

**Recorded limitation:** [issue #621](https://github.com/lhanson-dev/revision/issues/621) retains R1-11 Partial for the authentic unscored Learn and first-use directional-only production path. R2 does not modify those pathways, cannot count directional events as attainment, and may not turn this open gap into a complete-R1 claim. Any new evidence-flow touch expands the task back through R1-11 assurance rather than quietly redefining scope.

## 13. Technical feasibility and dependencies — PASS

**Current live implementation:** React/Vite `/revision/app/`; `src/app/PlannerRuntime.tsx`, `PlanScreen.tsx`, `PlanViews.tsx`, `plan-model.ts`; `src/app/planner-model.ts` (`plannerDaysFromAvailability` limits scheduling to `Math.min(60,…)`); `src/engine/planning/planning.ts` (date-eligible R1 derived tasks); `src/app/accepted-sessions.ts` and `src/services/planning/planned-session-service.ts`; `PlanScreen.tsx` separately sets `PLANNER_HORIZON_DAYS = 60` for **accepted-session loading**. Owner/RLS guards and real Business/Psychology content already exist. This is a feasible bounded extension **without new schema, backend job or AI scheduling call as the default approach**; any discovered need for new persistence/migration must be separately justified, tested and documented in the implementation PR.

**Design requirement:** a long-range programme model should calculate weekly date keys/real milestones and coarse opportunity summaries without creating one accepted session per day; detailed tasks should remain a separate bounded near-term projection. Query only relevant accepted-session date ranges for visible dates and near-term schedule. Enforce strict invalid-date handling and avoid pathological computation on extremely remote input while preserving truthful visibility of the known paper. Preserve explicit identity and stable recommendation keys.

**Cost/complexity:** Medium-to-high engineering effort spanning domain tests, responsive Plan UX, integration, lazy data reads and assurance. Variable inference cost target **zero** (no LLM calendar generator). No monetary or time estimate is asserted without measurement.

## 14. Frozen proposed R2 acceptance matrix — PASS as an implementation-ready assurance contract

The actual named tests must be created and run *during implementation*, not claimed here as already green.

| ID | Test oracle | Primary layer |
| --- | --- | --- |
| R2-01 | A future active paper at 120+ days (also 365/730) appears as final exam milestone without extending concrete daily tasks all the way there | Unit + browser |
| R2-02 | Several paper dates in one Business 7132 course retain shared-topic dedupe, later-paper carryover and their distinct true formats | Domain |
| R2-03 | Psychology 7182 only selected/assured Paper 3 options appear; unknown selection fails closed | Domain |
| R2-04 | Weekly capacity from Monday–Sunday, exceptions, actual accepted commitments and zero/15/30 minutes never double-books/overloads | Domain + DB browser |
| R2-05 | No paper-specific recommendation is scheduled on/after its valid date; moving/archiving/deleting exams recalculates safe weeks across local DST/year boundaries | Domain |
| R2-06 | Missing dates/capacity, removed courses, unsupported assets, partial backend failures remain truthful and permit useful safe next work | Domain + browser |
| R2-07 | Home, Plan, REV agree on exact next item and supported Start; student-chosen accepted work and Not now/alternatives retain current R1 semantics | Cross-route browser |
| R2-08 | Distant periods are weekly envelopes/milestones, not persisted fixed appointments, grades, predicted improvements or invented precise durations | UI/browser |
| R2-09 | Opening a 120+ day exam and future Month/Week never triggers 120+ days of accepted-session reads; queries are bounded to displayed/near-term ranges | Service mock + browser |
| R2-10 | Replan from genuine scored Practice can change priorities; date changes/plan interactions, FI-006 and unscored Learn do not mint mastery/readiness | Unit + relevant existing R1/DB assurance |
| R2-11 | Same fixed clock, timezone, assessments, evidence and availability produce stable weekly and near-term results without unacceptable UI churn | Deterministic benchmark |
| R2-12 | Phone/tablet/desktop, light/dark, keyboard and screen reader can find week ranges, milestones, uncertainty and Start without overlong clutter | Responsive/a11y |

**Required gates:** focused unit/benchmark, existing R1-01..14 regressions, browser/visual/a11y at touched surfaces, typecheck/lint/build, DB/RLS if paths affected, exact-head Revision CI, explicit Founder merge approval, governed production deploy/smoke. Compare calculation and query costs with current baseline; test fixture counts are not production-user metrics. Performance and fairness tuning beyond hard invariants stays R3.

## 15–17. Documentation, decisions and Founder gate

**15. Documentation/authority — PASS.** `Adaptive Revision Planning.md` already expressly governs full-exam programme, near-term precision, weekly capacity, real asset eligibility, honest uncertainty and deadline safety. Existing REV, Home, Course Blueprint and Claims authorities control their own areas and are not superseded by this analysis. No new normative threshold or score semantics is being adopted. This *backlog analysis* and `Product Feature Backlog.md` link are non-authoritative readiness evidence. At implementation update `docs/technical/Adaptive Revision Planner Implementation.md`, relevant Home/Plan documentation and `90-governance-registers/Assurance Coverage Register.md` with code in governed PRs; ADR only if material architecture/storage changes. Retain historical R1 and research text unaltered.

**16. Blocking product choices — NONE within bounded R2.** No new tiering; no new AI/data-gathering capability; no new educational optimum; one engine; existing Plan/REV/Home controls; weekly distant envelopes and factual milestones; near-term tasks only. Tunable choice of 7 versus 10 versus 14-day detailed forecast, envelope layout component and performance thresholds are *nonblocking implementation/evaluation parameters* to select against frozen oracles and actual browser usability before merge—not developer permission to redefine feature purpose. R3 balance optimisation and FI-009/010/011/012 remain excluded with their own readiness gates. Existing R1-11 gap is tracked and must not be silently claimed closed.

**17. Founder Ready — PENDING.** The Founder must first approve merging this governed readiness-analysis PR, then **explicitly approve “FI-001 R2 Ready”** against the resulting approved analysis (the commands may be stated together if clearly specific, but Ready must never be inferred from a generic “next”). Until then **R2 is Analyse**, not Ready or In Progress.

## Recommendation and next execution

**Product Owner recommendation: APPROVE the bounded R2 Definition of Ready once this analysis is merged, with R1-11 openly tracked.** This releases R2a programme-model engineering using the already-approved normative behaviour, without importing R3 optimisation or FI-009/010/011/012. If the Founder prefers to defer the R2 Ready gate until R1-11 has a genuine published-course journey, record that as a distinct sequencing decision, not a hidden test failure.
