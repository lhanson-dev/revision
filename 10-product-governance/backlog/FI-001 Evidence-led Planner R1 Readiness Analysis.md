# FI-001 — Evidence-led Adaptive Planner R1: Correctness and Single Recommendation Authority

**Lifecycle (as of 13 October 2026):** FI-001 existing capability is **Live**; bounded R1 received human-approved `Ready` on 13 October 2026. **R1a/R1b are merged and production-verified** through #617 (main `e9d1266791f234753780ffbb489f0126ce12eadf`, path-to-live #38401029075). **R1c/R1-11 remains partial**, under issue #621; its implementation/CI/independent acceptance must be established before all-R1 completion is claimed. R2–R5 retain separate readiness gates. The original preapproval assessment and snapshots below remain historical and were not retroactively rewritten.
**Date / approved baseline:** 13 October 2026; main `3639bb3f782b6ed104824010db7dbd9e50f262b1` following Founder-approved #606 (non-authoritative research) and #609 (normative planning/REV alignment).
**Owner:** Product / Engineering; Founder retains Definition-of-Ready and per-PR merge approval.
**Governing authority:** `10-product-governance/Adaptive Revision Planning.md` v0.6, `20-brand-and-experience/REV Guidance and Conversation Pattern.md` v2.3, `10-product-governance/Returning Student Home Experience.md`, `10-product-governance/Course Learning Blueprint.md`, `40-evidence-and-trust/Claims and Progress Governance.md`, `80-company-workflows/Feature Definition and Measurement Workflow.md`.
**Research:** `research/Evidence-led Adaptive Planner Proposal - 2026-10-12.md`, `research/Evidence-led Planner Algorithm and Benchmark Contract - 2026-10-12.md`, `research/Evidence-led Planner Learning Science Register - 2026-10-12.md`.
**Scope of this readiness review:** R1 only, *not* the long-range weekly allocation (R2), scientifically informed retrieval/checkpoint orchestration (R4), or authentic mocks (R5).

## Product decision / why R1 must come first

Implementing months of planning on the present engine would amplify unsafe deadlines, shared-paper duplicate workload and conflicting next-task selection. **R1 must establish correctness and one deterministic recommendation authority before R2 expands the planning horizon.** The existing features and code must be reused; neither another engine nor a new FI identifier is justified.

### Existing implementation evidence (not normative)

- `src/app/planner-model.ts` creates a separate topic candidate for every assessment and computes urgency relative to `now`, with `examWeight: null` and an approximate count/average evidence proxy.
- `src/engine/planning/planning.ts` globally ranks each candidate, greedily allocates a candidate at most once, and **does not compare the proposed scheduled date with its exam date**. Current stable IDs include assessment IDs, so genuinely shared Business topics may reappear per paper.
- `src/app/PlanScreen.tsx` consumes `buildPlannerSnapshot`, while `src/app/PlannerHomeScreen.tsx` renders both a planner snapshot *and* a hero recommendation ranked separately by `src/app/rev-suggestions.ts` (fixed 14-day/7-day rules). `src/app/PlannerRevScreen.tsx` consumes the planner snapshot. **This divergence contradicts newly approved FI-001/REV selection authority.**
- `src/app/accepted-sessions.ts` already deducts persisted non-skipped sessions and suppresses planned-topic suggestions. Keep explicit learner-accepted commitments separate from auto-generated work and respect capacity.
- `src/app/PlanScreen.tsx` and `src/app/planner-model.ts` each have 60-day limits serving **different** responsibilities. Do not widen either in R1 without R2's long-horizon and data-loading design.
- `src/services/planning/planner-service.ts` persists assessment `courseId`, optional `moduleId`, `scope`, `assessmentDate` (date only), and importance. `src/app/catalogue-model.ts` can normalise common-course evidence across modules. Current storage does not support reliable public-exam start times; apply date-only conservative deadline eligibility.
- `src/app/rev-suggestions.ts` still encodes legacy REV 14/7 ranking. Reconciliation must preserve Home's explicit `Not now`/`Suggest something else` contract and any supported useful fallback when dates or capacity are unknown.

**Authority conflict status:** RESOLVED normatively by approved PR #609. **Implementation alignment is not yet done.** Existing Home v3 authority correctly distinguishes the proactive REV suggestion from Today's Plan *presentation* when they are not literally the same accepted task. The R1 source must be one shared decision; the labels/visual composition need not imply an unaccepted suggestion is already on a student's Plan.

## 1. Student problem, hypothesis, strategy and deliberate alternatives

**User:** GCSE/A-level learner with one or more active exact courses, potentially shared material across multiple papers, optional exam dates, inconsistent availability, different evidence quality and finite study time.

**Problem:** Revision can present separate and contradictory priorities to Home vs Plan/REV, suggest after the exam an activity is meant to support, or repeat the same shared-course obligation for several papers. Such mistakes make the plan unsafe to trust even before improvements in learning science are delivered.

**Falsifiable R1 hypothesis:** After R1, on the same frozen valid learner context, every surfaced endorsement comes from one traceable deterministic ranked/eligible recommendation set; none of its paper-specific tasks is scheduled on/after the date-only target exam; the same shared course-learning task is not duplicated solely due to multiple paper targets; existing capacity, consent, evidence and route safety remain correct. This is **software and user-trust quality**, not a claim of grade improvement.

**Alternative rejected:** (a) only extend 60 days — worsens exposed errors; (b) add a separate REV priority engine — perpetuates contradictory advice; (c) rewrite readiness scores in planner — corrupts approved evidence semantics.

## 2. Explicit R1 MVP and exclusions

**Include in one or a small number of bounded, governed implementation PRs:**

1. A single canonical deterministic recommendation/ranking result or adapter that Home, Plan and REV can consume with **the same active-course, valid-assessment, learner evidence, accepted-session and choice context**. Remove or demote `rankSuggestions`' independent 14/7 ranking to compatibility code that does not own educational priority. Home's conversational fallback remains a supported output of the same decision contract when no full calendar can be built. Maintain Home v3's exact-task match rule for the `On today's plan` tag; an unaccepted hero recommendation need not be inserted as a scheduled task.
2. Eligibility-before-ranking: exact active course; known compatible course/module/assessment scope; genuine supported asset/entry route; paper-specific work scheduled **before** the target date (exclude the date itself when start time not known); real available capacity after accepted sessions; no unconfirmed paper/option claims. If one paper passes but a later paper still assesses a shared obligation, keep it eligible **for the later paper only**.
3. Deduplicate *truly shared* course-knowledge opportunities by canonical `courseId + learning node or topicId + supported intent` and preserve all applicable future-paper references for reasons/urgency. **Do not deduplicate** distinct paper-format, AO, case/data-response, constructed-response or other legitimately different skills. Do not double-count evidence. In R1 do not invent unsupported paper-to-topic/AO mappings from content not already assured.
4. Preserve existing usable fallback for unknown exam dates and/or availability: an assured immediate activity, accurate `cannot calculate full timed plan` status, no invented dates/minutes and optional plan setup *after first useful revision* per current GJ-01. Do not gate Home behind date entry or starting check.
5. Reconcile stable recommendation IDs and user `Not now`/`Suggest something else`, date changes, old persisted planned sessions, removed courses and older course/module schemas without losing genuine user choices. For data needing migration, use explicit bounded and RLS-protected migration rather than silently rewriting evidence.
6. Add deterministic tests and a small browser/regression assurance set before changing code. Make changed/legacy provenance truthful; preserve current allowed reason semantics and avoid claiming precise `mark gain`, grade prediction or real learning deterioration based solely on old evidence.

**Exclude:** full-exam horizon / weekly envelopes (R2); cross-course educational allocation/fairness tuning (R3); new spaced algorithm (FI-009); periodic checks, targeted diagnostic assembly (FI-010), misconception recovery (FI-011); exam-soon new mode (FI-012); full mock/grade predictive work; AI-led scheduling; new paywalls; redefinition of readiness, score weights, Practice Quick-check semantics, evidence confidence or school examination start times; unrelated learner redesign. These need their own separately approved Ready scope.

## 3. Experience and states: Home ↔ Plan ↔ REV

- Returning Home displays *one* supported recommended next action and reason, with `Start`, `Not now`, `Suggest something else`, independent navigation and Today’s Plan based on actual accepted sessions plus derived forecast; only label `On today's plan` if the precise activity matches the actual scheduled entry.
- Plan retains Day/Week/Month view and setup/empty states; scheduled items align with the shared source, do not exceed capacity or target expired paper. No new full programme UI in R1.
- REV can explain a real reason code and offer eligible alternatives; it may conversationally negotiate confirmed preferences but cannot silently rewrite educational truth or create the second priority engine.
- A learner with no dates, no availability, no scored evidence, an unavailable asset, interrupted session or one completed paper still receives an honest route into supported activity; if none exists, show a truthful explanatory empty state rather than fabricating a candidate.
- Error/partial load: no leaking an old, now-ineligible recommendation; distinguish unavailable data from low evidence; give appropriate course/Plan fallback.
- Responsive: keep governed Home/Plan composition and keyboard/screen-reader label behavior. R1 must pass desktop/tablet/mobile smoke and keyboard checks; no new visual design.

## 4. Evidence and intelligence — hard boundaries

**Read only** existing governed evidence engine outputs (`createCourseLearningState`, `assessPaperReadiness`, course Blueprint/Exam Truth). Planner scheduling, course membership, minutes, self-report, engagement, initial FI-006 starting-check-only observations and unscored Quick checks are not attainment evidence. A missing score is `unknown`, not zero, and an old score is not independently a proven decline. No new scoring fields and no forced course-wide mastery from selected practice. Any change to how the algorithm ingests quality/recency must be separately governed in R3/R4, not smuggled into R1.

A QA/business paper linking rule must follow actual AQA 7132 Course/Exam Truth. For AQA Psychology 7182, do not schedule content for a non-selected option; selection ambiguity must cause conservative eligibility, not speculation. R1 does not claim complete AO coverage until assured mappings become available.

## 5. Free / Paid / Premium and commercial treatment

| Tier | R1 value, cost and limits |
| --- | --- |
| Free | All **correctness**, supported next task, deadline safety, non-duplication, active-course/permission safety, core explanation and learner choice. No paywall for correctness. |
| Paid / Level 1 | All identical safety and objective evidence accuracy; retain whatever additional existing controls and outlook are legitimately available. **No new entitlement change or upgrade prompt in R1.** |
| Premium / Level 2 | All identical safety; existing authorised coaching remains subject to FI-003/FI-002. **No new AI calls** to prioritise tasks. |

The FI-001 v0.6 tier proposal suggests progressively greater outlook/control, but FI-002 is still `Analyse`. R1 is a universally necessary *quality correction*, not a separately chargeable upgrade. **R1 upgrade/conversion hypothesis: N/A** — no new entitlement, monetisation flow or paywall; do not misrepresent correctness as Premium intelligence. Future R2/R3 feature packaging needs its own DoR decision. Variable planner ranking cost target: **zero LLM scheduling calls**; existing React/TypeScript processing plus bounded reads. Engineering effort is modest-to-medium relative to R2/R4 because Home and Plan interfaces differ; no invented currency/hour estimate. Risks to delivery are browser regressions, identity/evidence joins and course-paper scope, not model-token bills.

## 6. Measurement, Founder assurance and risk

**Acceptance denominators:** among eligible deterministic fixture cases, 0 scheduled after-date paper-specific tasks / all paper-specific tasks; 0 ungrounded/unsupported recommendations / all suggestions; 0 day-capacity oversubscriptions / days with known capacity; 0 duplicate same-scope learning obligations / shared course-paper groups; 0 Home/Plan/REV *priority-source mismatches* / matched-input snapshots; 0 inadvertent readiness changes / no-new-scored-evidence scenarios. Use test fixture counts, not fabricated production KPIs.

**Production-safe observability (reuse existing contract):** recommendation offered → started where already captured, planner build failures, invalid scope counts, reason-code integrity, unavailable asset fallback, user alternative/dismissal actions, date-change replan and accepted-session reconciliation. No new student-sensitive analytics or Admin dashboard required merely for R1. Any new telemetry requires existing privacy/data governance review and appropriate aggregate denominators. Monitor student-reported usefulness later; **no R1 grade-improvement claim**.

**Material risks:** accidentally suppressing valid preparation across shared future papers; conflating paper-specific skill with topic knowledge; showing a stale Home recommendation, mass invalidation of accepted sessions, local-date rollovers/DST, unauthorised learner data, unsupported exam options/assets, screen-reader confusion, visible suggestion churn. Mitigations: canonical course/scope IDs, explicit eligible-until date, stable keys with migration tests, freeze local clock in fixtures, RLS/service tests, asset provenance and correct fallback.

**Founder/Admin release checks:** compare pre/post snapshots by fixture; report count and nature of deadline violations, duplicates, choice regressions, real failing routes and query/runtime cost. Do not claim student uptake/outcomes before data exists. Browser smoke in canonical `/app/` route, not a mock design shell.

## 7. Acceptance-test contract — mandatory R1 cases

| Case | Fixture and change | Pass/fail oracle |
| --- | --- | --- |
| R1-01 | Business 7132 shared topic in two future papers | Only one generic topic opportunity per identical intent; both relevant future-paper links retained; paper-format-specific practice distinct. |
| R1-02 | Paper 1 date tomorrow; candidate over 3 available future days | Paper-1-only task cannot be placed on exam date or later; relevant Paper-2 generic work remains eligible if still needed. |
| R1-03 | Paper date moved earlier, later, or archived | Rebuild immediately, invalid task disappears, valid opportunities recalculate without task debt or corrupted accepted sessions. |
| R1-04 | Three active courses, one cancelled membership and ambiguous legacy assessment | Only unambiguous active course/scope; no accidental cross-course leakage. |
| R1-05 | Accepted planned/done/skipped sessions; same topic suggested elsewhere | Deduct actual booked minutes, preserve choice/reconciliation, do not clone already accepted relevant task or create compulsory overdue debt. |
| R1-06 | No assessment date and no availability, starting check skipped | Home retains truthful supported next action and REV alternative; Plan does not invent capacity or exam deadline. |
| R1-07 | Home recommendation, Plan suggestion and REV response from identical context | All use one authoritative ranking result; Home only says `On today's plan` for exact accepted/planned match. No legacy 14/7 separate priority decision. |
| R1-08 | Repeated `Not now`, `Suggest something else`, midnight rollover | Stable key, local-day dismissal and eligible next alternative; no unsolicited repeat until allowed. |
| R1-09 | Psychology 7182 selected Paper 3 option, missing/inactive option, unknown paper mapping | No unsupported option recommendation or invented AO; supported scoped fallback remains. |
| R1-10 | Available minutes 0/15/30, long activity, accepted session already booked | No overbooked day, no false full-mock task, no invented short duration; tell learner when no viable activity. |
| R1-11 | Starting-check-only and unscored Quick check followed by replanning | Understanding, progress and readiness unchanged; only permitted directional first guidance. |
| R1-12 | Local dates near DST/month/year boundary; test same case twice | Correct inclusive/exclusive cutoff semantics and stable deterministic results. |
| R1-13 | Partial backend failure or unsupported activity route | Honest empty/retry/fallback, no misleading CTA or fabricated reason. |
| R1-14 | Correct seeded evidence stronger in different subject while upcoming paper deadline shifts | Planner remains date-safe; explanation traces to real eligible inputs, without promising educationally optimal balance (R3). |

Fixture references should use stable `aqa:aqa-a-level:7132` / `aqa:aqa-a-level:7182` canonical course identities **only where that ID is actually surfaced by the approved content registry**; do not invent source-backed AQA course/paper data. Real fixtures should be derived from approved course manifests and actual available assets, not synthetic content presented as shipped.

**Suite:** unit/contract checks for schedule and date eligibility; planner-model and Home/Plan/REV agreement tests; integration for accepted sessions and course membership; responsive browser/reload/not-now accessibility; RLS/DB access regression where storage changes; production-path smoke. Use current golden tests, adapt only tests whose expectations conflict with **approved** authority, and do not spend days updating unrelated historical snapshots. No forced new telemetry schema.

## 8. Dependency and implementation boundary

**Canonical runtime:** `/app/` React/Vite learner experience, `src/app/PlannerRuntime.tsx` routing to `PlannerHomeScreen.tsx`, `PlanScreen.tsx` and `PlannerRevScreen.tsx`; engine in `src/engine/planning/planning.ts`; bridge in `src/app/planner-model.ts`; `src/app/rev-suggestions.ts` is the competing *implemented* Home selector to retire/centralise; persisted assessment/accepted sessions via `src/services/planning/*`; evidence in `src/engine/evidence/` and readiness engine. Technical docs and tests must be changed in the **implementation** PR(s), not misrepresented now.

**Implementation sequence after human Ready approval:**
- R1a: approved eligibility/date/shared-paper obligation representation and deterministic fixtures.
- R1b: consolidate Home/Plan/REV ranking and reasons on shared decision source, preserving alternative handling and fallback.
- R1c: integration/accessibility/CI/production-path smoke and technical documentation/Assurance Coverage Register updates; only then claim phase complete.

If feasibility reveals an unsupported paper mapping, a brittle data migration or need to change scored-evidence semantics, **stop and return for a bounded product decision** rather than silently expanding R1.

## 9. Definition of Ready — 17 required criteria (original preapproval assessment)

| # | Requirement | R1 assessment and proof |
| --- | --- | --- |
| 1 | Student problem | **PASS** — concrete multi-exam trust defects and Home/Plan mismatch above. |
| 2 | Strategic case | **PASS** — protects the Personalised Revision Intelligence loop before increased planner complexity; alternatives evaluated. |
| 3 | Falsifiable value | **PASS** — 0 safety/identity/priority-source contradictions on frozen tests. Does not promise learning gains. |
| 4 | Experience / edge cases | **PASS as proposal** — preserves approved Home/Plan/REV UX, no dates, no capacity, dismissal, interruption, failure and mobile/a11y states. |
| 5 | Evidence/intelligence | **PASS as proposal** — existing approved evidence path is read-only, provenance and null semantics specified; no readiness model rewrite. |
| 6 | REV role | **PASS** — one deterministic source; REV explanations/choices only. |
| 7 | MVP boundary | **PASS** — R1 constrained to safety, scope and unified recommendation; future R2–R5 excluded. |
| 8 | Free/Paid/Premium | **PASS for R1** — identical safety and honest advice for all tiers, no new entitlements; FI-002 retains later decisions. |
| 9 | Upgrade/conversion | **N/A with rationale** — R1 is a reliability correction, not an upsell; no paywall. |
| 10 | Measurement | **PASS as proposal** — frozen oracle metrics and minimal existing event reuse; no unsupported educational results. |
| 11 | Founder/Admin | **PASS as proposal** — actionable invalid-plan exception and exact route/CI smoke, reuse assurance registers. |
| 12 | Risk/trust/accessibility | **PASS as proposal** — risks and guardrails enumerated, including data isolation and real student choice. |
| 13 | Technical feasibility | **PASS with bounded uncertainty** — exact runtime/engine/services mapped, no speculative new schema; stop if data ambiguity forces a design change. |
| 14 | Test/assurance | **PASS as contract** — 14 fixture oracles plus browser, accessibility, database and release path; **not executed yet**. |
| 15 | Documentation/authority | **PASS** — approved FI-001 + REV authority already on main; this analysis/backlog only, technical/assurance docs must accompany future code. |
| 16 | Blocking product decisions | **NONE for bounded R1**, conditional on retaining existing educational evidence semantics, no new feature tiering and not expanding to R2–R5. Open implementation parameters do not change core expected behaviour. |
| 17 | Human Ready approval | **PENDING** — explicit Founder decision still required for the exact R1 scope after this review is integrated in main. |

**Product Owner recommendation:** recommend a **bounded R1 `Ready` approval only**, following documentary review of this analysis and its backlog linkage. This does not approve R2/R3 full programme logic or R4/R5 new assessment capabilities. The Founder must separately approve the relevant documentation PR merge, then `Approve FI-001 R1 Ready` to authorise R1 implementation. Do not mark the entire FI-001 redesign Ready by implication. The FI-001 overall feature stays `Live` for its existing deployed capability until a separately proven enhancement release occurs.

## 10. Documentation-impact check

- **This analysis PR:** add this non-authoritative readiness record under `10-product-governance/backlog/`; link it from existing FI-001 backlog; mechanically correct v0.6/v2.3 status text if needed to reflect merged PR #609. No change to current runtime/technical truth; do not edit older research or historical decisions.
- **Future R1 implementation PR(s), if human Ready approved:** tests/source, `docs/technical/Adaptive Revision Planner Implementation.md`, `Assurance Coverage Register` as applicable, Home/Plan/REV integration/visual tests, release lineage. No new ADR unless material architecture/schema changes. No need for new normative document or independent feature number.
- **Future R2–R5:** separate product/feature DoR assessment and appropriate authority amendments for tiering/evidence changes. Historical research stays non-authoritative.

## 11. Founder-approved R1 Ready decision (13 October 2026)

**Human decision — APPROVED:** The Founder explicitly instructed `Approve FI-001 R1 Ready — implement via Codex` after the 17-point analysis was merged as PR #611. The decision is durably recorded as a Founder-authored [approval comment on PR #611](https://github.com/lhanson-dev/revision/pull/611#issuecomment-6139380663), posted after the merged readiness contract was verified on `main`.

**Effect:** The **R1 slice alone** is `Ready` for implementation under the Governed Implementation Workflow. Existing FI-001 stays `Live` for its previously implemented behaviour until the enhanced implementation is merged, deployed and production-verified; the overall evidence-led planner programme is **not** wholly Ready. Approval authorises engineering to begin **R1a/R1b/R1c** in scoped PRs once this Ready record is present on approved `main`; each eventual PR merge requires new, specific Founder approval. This is not merge approval and must not be recorded as the `revision-founder-approval:v1` release marker.

**Approved delivery method:** Codex to execute bounded engineering tasks. Product authority, validation of delegated work, risk assessment, integration and merge gates remain with the governing GitHub/Founder process. See `docs/technical/FI-001 R1 Codex Implementation Handoff.md`.

**Scope kept frozen:** deadline/supported-asset/scope eligibility, legitimate shared-paper deduplication, one deterministic Home/Plan/REV priority authority, local-day choice/accepted-session handling, zero invented evidence/grades, stable route, zero scheduling LLM calls, all 14 frozen R1 acceptance scenarios. **Excluded:** R2 complete exam horizon, R3 balancing, R4/R5 retrieval/knowledge checks/mocks, new FI-009/010/011/012 implementations, algorithmic mastery/readiness changes, new subscription entitlements, a second planner engine. If a material change is required, return to product governance before implementing it.

**Preapproval assessment preserved:** Criterion 17 above was correctly marked PENDING when the analysis was written. This dated addendum supplies subsequent human evidence without pretending the original research or analysis self-approved. The original prospective recommendation remains history.

**Documentation impact:** The FI-001 backlog must simultaneously distinguish current `Live` capability from the `Ready` R1 enhancement. No runtime/technical implementation truth changes until coding PRs, which must update technical docs and assurance registers together with code. 


## 12. Founder clarification proposed for governed approval — Today's Plan is REV's next-task source (13 October 2026)

The Founder clarified during independent review of draft PR #617: **"REV should recommend whatever is next on the plan for today."** This strengthens the already-approved single FI-001 priority source in R1b. Existing Home v1.3 had allowed an independent off-plan recommendation even when a plan existed; the accompanying proposed Home v1.4, REV v2.4 and FI-001 v0.7 amendments must be merged with explicit Founder approval to make that stricter experience contract active.

**R1a impact:** retain date safety/shared-paper/course+asset correctness. Do **not** implement a permanent second Home exam-question selector or remove exam questions from the unified future planning model merely to avoid an unsupported route. Draft PR #617's shared `activityForTopic` call affects legacy Home recommendations and must be reconciled with the exact supported exam Start in separately open PR #612 and the single-plan R1b contract. A short-lived safe interoperability fix may be required; isolate and regression-test it. No automatic merge of either PR.

**R1b acceptance refinement:** where Today's Plan contains actionable intended work (accepted or derived), the Home REV hero, the Plan's next-item indication and REV's explanation refer to the **same exact next item**, with activity type, course, topic and supported paper/question identity where applicable. Student-confirmed plan choices are not ignored; completed/skipped/dismissed work is not presented as due. 'Suggest something else' traverses remaining same-day eligible work; 'Not now' does not delete or complete a commitment. Missing setup permits a truthful unscheduled fallback; genuinely completed/free days and partial accepted-session loads must not invent booked work. A selected exact supported exam question is legitimate and must Start in the question, not the general course Exam Prep landing. Source and presentation are shared; no independent Home 14/7 priority rules.

**DoR/documentation impact:** This is an experience clarification **within approved R1b unification**, not permission to extend R1a into R2–R5 or alter scored evidence, entitlements or Home visual design. Update the R1b unit/contract/browser fixtures, Plan/Home technical documentation and assurance coverage in the implementation PR. Preserve the original R1 analysis/17-gate judgement as historical context.
