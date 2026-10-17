# FI-001 — Programme-First Intelligent Planner Reset: Definition of Ready

**Lifecycle:** Founder-approved **Ready** for the scope below on 15 October 2026; implementation **In Progress** in draft PR #637 (unmerged, not Live). Prepared 15 October 2026 from approved main `fd8565838db8fc27cbf359fc86d846e9ab11fda5`. This is an amendment to FI-001, not a new competing feature or engine. Historical R1/R2 scopes and their prior Founder approvals remain intact; this record proposes a *new* material scope whose readiness is independent. **Owner:** Product / Education / Engineering; Founder decides `Analyse → Ready` after the governing PR merges.

**Source hierarchy:** `00-company-foundation/Product Strategy.md` → `10-product-governance/Adaptive Revision Planning.md` + Product System Model/Course Learning Blueprint/Claims → proposed technical architecture and scenario contract. This backlog analysis is deliberately non-authoritative.

## Decision sought

Approve the **minimum meaningful exam-backwards programme** as one coherent FI-001 vertical capability. Its first learner-facing release must contain a defensible knowledge-and-skill preparation strategy to the final known exam, within available approved assets and evidence constraints—not another independent horizon projector, weekly topic rotation, infrastructure-only milestone or calendar embellishment. A stage may remain in Analyse until material safety feasibility is validated, but not be self-approved by an agent.

## 1–3. Student problem, strategy and falsifiable hypothesis — PASS (definition)

Learners with multiple subjects/papers must not have to derive their own revision strategy from topic cards. The current main R2 programme display lacks obligation→evidence→treatment→realistic whole-exam allocation, despite existing Personalised Revision Intelligence strategy and whole-horizon authority. **Hypothesis:** given same real exams, supported content/evidence and capacity, the programme-first planner produces more defensible end-to-end preparation objectives and clearer actionable advice than the current weighted candidate + rotation baseline, with no hard integrity/safety regression. Blind expert judgement and usability test the practical learner value; simulator scores do not prove grade improvements. See dated gap audit.

## 4. Learner experience and simplicity — PASS (target contract)

One Plan with the common five-view oracle in `FI-001 Programme Value Scenarios.md`: full exam programme; Month learning/skill outcomes, milestones, constraints; Week named specific attainable objectives/treatments/why now; Day exact supported tasks; Home and REV the same next action and explanation. Future precision reduces but programme strategy does not vanish after 14 days. Normal plan not fixed appointments. Optional dates in onboarding; do not block first Home task on initial assessment or study-time setup; availability stays later in Plan per existing first-use journey. Calm rest/restart/unknown states.

## 5. Evidence and intelligence — PASS (restricted boundary)

Use approved Course Truth, Exam Truth and Course Learning Blueprint classifications *where published*, selected course memberships, actual permitted paper/option mappings, existing governed scored evidence and separate understanding/coverage/readiness/confidence/provenance. No shadow mastery calculation, invented syllabus/AO mapping, unapproved Learning Check, assumption of decay, scored promotion of FI-006 directional starts/unscored Learn or clicks. Explicit supported/unserved demands rather than fake assets. Reconcile any planning-only `count/4`/averaging heuristics with evidence authority before release; do not change Progress calculations implicitly.

## 6. REV role — PASS

Interpret the same versioned programme; answer why a concrete current activity supports the named Week and exam objectives; explain constraints and adjustments, supportive when work missed; bounded confirmed preferences preserving consequences. REV never ranks independently, predicts marks or labels absence as failure. Exact task identity and route remain shared with Home/Plan.

## 7. MVP and exclusions — PASS as proposed new scope

**First released vertical slice is mandatory end-to-end:** obligation/real paper graph for selected assured content; different learning vs authentic paper-skill demands where metadata supports them; evidence/uncertainty-aware treatment choices; full known horizon; coarse realistic weekly allocation across active courses with unserved-work disclosure; meaningful Month/Week objectives; near-term eligible Day and same Home/REV Start; adaptation for validated new evidence, missed work, date changes and capacity; scenario + production assurance. Reuse standard supported Learn, Practice and existing exact exam question paths.

**Excluded until separate approval:** FI-009 bespoke retrieval scheduler/interval model, FI-010 newly generated weakness tests, FI-011 separate wrong-answer mode, FI-012 special exam-soon mode, new AI marking/content, new formal diagnosis, grade prediction, notifications, school calendar sync, unsanctioned Psychology paper options, fixed distant task appointments. Baseline reasoning may suggest an existing valid opportunity to retrieve or recheck knowledge, but cannot implement those deferred specialist features.

## 8–9. Tiers and conversion — PASS

A useful, truthful, integrated **core preparation plan is for Free, Paid and Premium** under existing entitlements; no artificial degradation of programme intelligence, horizon, evidence or safety for conversion. No new paid model/variable LLM priority calls. Conversions and pricing not part of this work; Premium contextual AI conversational enhancements remain separately approved FI-003/FI-002 territory. Hypothesis of better retention is not a promised conversion uplift.

## 10. Measurement — PASS (measurement design)

**Deterministic zero-tolerance:** exam-cutoff, exact scope, supported asset/Start, capacity, active membership, RLS, evidence promotion, accepted sessions, cross-surface agreement, programmatic date correctness. **Programme quality:** traced obligation and exam-skill coverage, explained deferrals, confidence-sensitive treatment choices, unsupported opportunity disclosure, responsiveness to evidence, non-starvation trade-offs, false repetition, stable before/after replan; compare with main's exact baseline on identical 13 frozen scenarios. **Student value:** assess "I understand what I should work on this month, this week and now" by comprehension task and usefulness/feasibility rating from limited representative students; report small-N limitations and recruitment bias. No inference of learning efficacy from CI, clickthrough, user ratings or external studies alone. Technical time/memory and bounded accepted-commitment requests at 120/365/730 days measured before threshold choice.

## 11–12. Assurance, privacy, safeguarding and accessibility — PASS (plan)

Risk Level 3 / High: educational truth, multi-course eligibility, learner-state and canonical routes. Protect privacy/owner/RLS, age-suitable language, no shaming or AI attachment, authentic assessment, meaningful keyboard/phone access and WCAG 2.2 AA. Add `PLN-VALUE-01` to assurance register as **Uncovered** until measured. R1-11 published unscored Learn journey stays Partial (#621) and does not silently block a bounded validated scored-evidence planner slice; any changed evidence-write path must reopen evidence proof. Exact-head CI, production route and result/outcome acceptance are separate requirements.

## 13. Technical feasibility / code ownership — PASS with listed implementation checks

The existing React route `#/plan`, TypeScript engine, R1 paper safeguards, real content adapters, evidence engine, 14-day detailed plan, bounded session lookahead, accepted commitments and verified exact Start can be reused. `programme.ts` must become meaningful allocation; `weekly-focus.ts` display rotation is retired as allocator; `planning.ts` greedy rank remains a baseline/safety utility not a strategic owner; `planner-model.ts` bridges governed evidence. Target interfaces and risk disposition are in `docs/technical/Intelligent Exam-Backwards Planner Target Architecture.md`.

**Preproduction checks within authorised work:** inventory actual available Business 7132 and selected Psychology 7182 obligation, AO/skill and teaching asset coverage; any absent demands explicitly reported; ensure no reliance on unpublished assets; calculate actual performance/cost envelope and expose policy/treatment decision reasons. Start with derived non-persisted programme; any new schema/RLS/telemetry requires justified extension, separate detailed assurance and current technical-doc update.

## 14. Falsifiable acceptance and assurance plan — PASS (specification, not tested output)

Freeze all thirteen SV-01..SV-13 oracles with exact inputs/evidence, expected whole programme, five views, defined changes and fail conditions. Test baseline/candidate on identical data and report differences including cases where improvement is not achieved. Add property/sensitivity and real-content end-to-end checks with no secret scoring or arbitrary equal ratios. Require **all thirteen scenario product-acceptance passes** and no hard safety violation for the first learner-facing vertical slice; green CI and 24 unique topic labels are *not* sufficient. An actual controlled student usability check must corroborate clarity before product acceptance; do not pretend fixtures alone measured educational outcomes.

## 15. Documentation/authority — PASS (governed proposal, conditional on merge)

Amend only existing Product Strategy, Adaptive Revision Planning, Product System Model and REV authority, not competing canon. This DoR, dated audit, target architecture, scenario oracles, proposed ADR, backlog/assurance/index updates accompany one documentation-only governed PR. On implementation update actual technical docs and branch-specific assurance with code, preserve historic R1/R2 records unchanged. Proposed changes do not have active authority until the Founder explicitly approves PR merge.

## 16. Blocking choices — PASS for recommended boundary

Recommend one coherent course/paper-aware vertical slice rather than historical R2/R3 split. Do not gate first value on generating a new content bank or unapproved FI-009–012. Assess and disclose unsupported coverage rather than overstating a subject as completely supported. Heuristic parameters, work-duration bounds and specific educational policy choices must be versioned and calibrated against scenarios, not asserted as scientific optima. If published content cannot support a meaningful programme, declare the student-value gate blocked and escalate a concrete asset/metadata dependency, not lower acceptance criteria.

## 17. Human Definition-of-Ready decision — **FOUNDER APPROVED READY, 15 October 2026**

Only the Founder may move this **new FI-001 programme-first scope** from Analyse to Ready after governance text has entered approved `main`, and may authorise implementation through the precise scope in this document. Prior R2 Ready does **not** suffice; R3–R5/FI-009–012 remain without Ready for independently excluded specialist features. If this DoR changes materially following review, request the specific renewed Ready decision. A PR merge approval and a feature-Ready approval are **separate human decisions**; neither is implied from this drafting task.

## Workstreams after explicit Ready

**Workstream A (first learner-facing vertical slice, 1 coherent PR):** programme graph/evidence assessment/treatment selection, paper deadlines/realistic allocation, one Week+Month+Day view and shared REV/Home Start, 13 scenario contract, R1/R2 regression. Do not split into "algorithm only" and "UI later" if neither yields student value.

**Workstream B (part of A where needed, otherwise immediate next coherent PR):** deeper replanning and consequence explanations, calibrate low-time/multi-course/contradictory results using held-out fixture evaluation, authentic published-course R1-11 assurance where feasible, edge-case quality and performance. Keep feature not product-accepted if essential SV scenarios fail.

**Workstream C (later separate DoRs):** extended retrieval/check/misconception/exam-soon intelligence from FI-009–012; approved new content assets and paper skills as quality-assured; no alternative planner owner. Track outcomes with product-specific evidence before marketing learning gains.

**Founder decisions after review:** (1) merge this governance/readiness proposal PR, which changes normative direction and records a new proposed FI-001 scope but makes no runtime change; (2) explicitly approve or reject the *FI-001 programme-first reset Ready* decision against merged, final DoR. Each subsequent implementation PR requires its own approval to merge.

## Founder approval receipt and implementation continuation (15 October 2026)

The Founder explicitly said **“Approve FI-001 Programme-First Intelligent Planner Ready. Proceed with the governed implementation programme, starting with the meaningful learner-facing vertical slice. Do not merge implementation PRs without my approval.”** after governance PR #633 merged at `931bee72de204e1910c2ad4d6b5fa1c0d0c39873`. Durable human Ready record: [PR #633 comment #6188330812](https://github.com/lhanson-dev/revision/pull/633#issuecomment-6188330812). This transitions the **new reset scope only** `Analyse → Ready`; actual implementation began on `feature/fi-001-programme-first-vertical-slice-20261015` / draft PR #637 and is **In Progress, not Live or merge-approved**. The historical `PENDING` wording above is superseded by this dated decision. R3–R5 separate exclusions and FI-009–012 readiness remain unchanged.
