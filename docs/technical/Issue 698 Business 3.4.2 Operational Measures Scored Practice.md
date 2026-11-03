# Issue #698 — Business §3.4.2 operational performance: published-supply correction

**Status:** Scoped candidate on `assurance/698-business-342-operational-measures`; NOT merged, independently educationally reviewed, or accepted in production. Governing learner route: `/revision/app/` → saved AQA A-level Business 7132 → Operations Learn and Operations Practice. This record is implementation/assurance evidence, not new curriculum authority.

## Exact source and provenance

The Founder-supplied official 42-page AQA Business 7132 **v2.0, 14 June 2023**, SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, has been byte-verified in the current work session. §3.4.2, **printed p18** (PDF physical page 18), distinguishes calculation and use of labour productivity, unit cost (average cost), capacity and capacity utilisation. Source-use classification is **REFERENCE_ONLY**; no protected source exam questions or passages are reproduced in the learner content. New explanations, datasets and scenarios are Revision-original. The source PDF itself is not committed.

The four modes below are deliberately distinguished; the source also requires *interpretation and use* of data, which the typed final values do not assess:

| Source demand | Existing published Learn evidence | New original and independently software-scored **final-number** candidates | Remaining scope limit |
| --- | --- | --- | --- |
| Capacity | `bus-ops-003` | `rev7132-3.4.2-weekly-capacity-packaging-01` and `rev7132-3.4.2-weekly-capacity-technicians-02` | Real operating bottleneck assumptions and decision justification not independently marked |
| Capacity utilisation | `bus-ops-003` | `rev7132-3.4.2-weekly-capacity-utilisation-01`, `rev7132-3.4.2-daily-capacity-utilisation-02` | Numerical result only, no verified reasoned interpretation |
| Labour productivity | `bus-ops-004` | `rev7132-3.4.2-monthly-labour-productivity-01`, `rev7132-3.4.2-weekly-labour-productivity-02` | No independently marked comparison, limitations or argument |
| Unit cost (average cost) | Prior course-wide numeric drill and original `3.1-3.2:q17` multi-part question | `rev7132-3.4.2-monthly-unit-cost-trays-01`, `rev7132-3.4.2-monthly-unit-cost-bottles-02` | Single value not method marks, evaluation or written working |

## Why the change is needed and what it actually changes

Existing course-wide unscored DataDrills rehearse operational arithmetic; existing slice `bus-ops-003` explains capacity and utilisation and `bus-ops-004` explains labour productivity, but the reviewed `§3.4` Learn slices do not provide a dedicated combined explanation and worked unit-cost method. The existing source-tagged bank includes one `3.4:q07` capacity-utilisation MCQ, `3.4:q09` labour-productivity written item, and the combined `3.1-3.2:q17` unit-cost written calculation. They do not by themselves establish two distinct independently marked final-number situations for each of the four demands, nor true working/interpretation competence.

This package reuses the **existing published** course-level `learn` and `practiceBank` within each actual AQA 7132 paper pack, with:

- Original integrated operations Learn page `operations-four-performance-measures`, checked slug locators `operations-performance` and `aqa-7132-3-4-2` (exact official section §3.4.2): four definitions, capacity/utilisation and productivity/unit-cost methods, an original cross-plan operational comparison, explicit units and periods, decision/use self-review, two unscored quick checks, misconceptions and limits. Learn quick checks remain unscored.
- Eight one-mark, distinct, original typed-answer final-result questions (two separate scenarios for each named source skill); exact `target_item_ids` with `bus-ops-003` for capacity/utilisation, `bus-ops-004` for labour productivity and **the new `operations-four-performance-measures` page for unit-cost repair**; objective evidence limited to a **single directly assessed numeric result**.
- All three accepted AQA 7132 packs share the identical added objects. Existing question, exam, DataDrill and Learn IDs, saved answers, scores and evidence are untouched. No DB migration, new marker or second learning system.

**The original source requires more than this candidate package supplies.** Authentic multi-step written working, interpreting the four measures, business contextual judgement, application, AO3/AO4 reasoning, unfamiliar mixed tasks and Exam Prep sufficiency remain unverified. Repeating a number after seeing an answer is not independent rechecking; an independent new attempt must be persisted and reviewed separately under #703/#705.

## Tests and educational assurance boundary

`content/business/aqa-a-level/operations-performance-source-assurance.test.ts` is designed to validate every actual three-paper ContentPack, distinct targets and two stimuli per skill, correct independent arithmetic, one-mark typed scoring, no credit for working, retained legacy identities, and exact source-linked Learn presence.

A new disposable local-Supabase real-auth Playwright candidate in `tests/e2e/learner-value-journey.spec.ts` traverses the actual Operations Practice topic and the deterministic Plan, after a persisted *wrong* unit-cost answer to the first original check. It must launch the second, differently authored unit-cost check and persist a correct single-target result in the owner-scoped evidence store, surviving Progress navigation. The prior corrected unit-cost repair head `a215ea138435b56745d8f1d74138ead903fbbe5d` passed all nine jobs including this real-auth scenario in [CI #41605948344](https://github.com/lhanson-dev/revision/actions/runs/41605948344). Further educational corrections now change the head; **rerun CI and do not carry forward that earlier PASS**.

**Pending:** rerun full exact-head CI after the material educational correction and final current-main integration; rerun one fresh independent A2/A3 on that final head; inspect and retain the actual second review receipt, and resolve/escalate any remaining material finding under the two-round limit. After separate Founder approval and merge, require production path-to-live success and genuine learner acceptance. An AI educational check is not qualified AQA examiner certification.

## First independent A2/A3 review: dated FAIL/HOLD, correction candidate

The newly enabled, **approved-main, fresh-context** reviewer on 3 November 2026 inspected actual PR #805 head `a215ea138435b56745d8f1d74138ead903fbbe5d`, the three paper-pack files, the SHA-verified original bank subset, the exact-head nine-job CI receipt, the bounded AQA 7132 §3.4.2 source facts and all nine proposed new assets. The original [run #41611393660](https://github.com/lhanson-dev/revision/actions/runs/41611393660), 30-day artifact `13219945111` / `issue-698-business-a2a3-805-41611393660`, contains a full seven-dimension machine-readable **FAIL/HOLD** receipt. Preserve this first review as history; it is not a review of later heads.

The independent reviewer recomputed every one of the eight final numbers and both existing worked examples correctly, accepted the source rights, distinct checks, narrow evidence claims and implemented unit-cost repair mapping. It identified **one material educational gap**: simply warning students that figures cannot prove quality/profit does not itself teach them to interpret the measures and use figures to plan or make a choice. It also identified **one minor locator** issue: the Learn page supplied only the generic operations slug, not an explicit resolvable source locator.

The bounded correction adds one **Revision-original, unscored applied Learn case** comparing two delivery operating plans. Its stated figures cover the same weekly period, permit independent calculation of capacity utilisation (80% versus 90%), labour productivity (80 versus 90 deliveries per employee per week) and average cost (£32 versus £28), alongside delivery punctuality (94% versus 97%) and demand/capacity uncertainty. Students must make a *conditional* business recommendation, explicitly weigh costs and quality, explain when greater spare capacity matters and identify further information to monitor. A second contextual multiple-choice self-check rehearses that judgement; Learn checks are not persisted as assessed knowledge or AO3/AO4 marks. The schema-valid explicit `aqa-7132-3-4-2` source locator is added **alongside** `operations-performance` to preserve existing topic-section mapping. Both corrections are original text; the REFERENCE_ONLY PDF has not entered content-generation input.

This closes the specific *teaching omission* if validated by fresh independent review. It does **not** supply independently marked written interpretation, extended AO3/AO4 performance, applied exam-level sufficiency, qualified AQA examiner moderation, production learner acceptance or full-section/full-course completeness. Existing eight scored calculation items, original IDs, saved evidence, marks, assessments and source rights remain unchanged.

## Documentation impact

The approved Course Learning Blueprint, source-rights authority, and Claims and Progress Governance already require exact-skill evidence with truthful limits. This is a bounded correction to existing learner content, not a new product-policy decision: no normative authority/ADR change. This technical record and INDEX pointer accompany the governed PR. Do not overwrite or relabel historical inventories (194 checkpoint, 344 keyword, 80+421 provisional candidate reviews), and do not claim whole-course percentage or completeness. Carry continuing work in Issue #698.
