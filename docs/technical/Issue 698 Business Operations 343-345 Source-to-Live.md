# Issue #698 — AQA Business §§3.4.3–3.4.5 source-to-live checkpoint

**State:** Governed *candidate correction* on `assurance/698-business-345-inventory-chart`; **unmerged, not in production, educational A2/A3 and real learner acceptance pending**. This is implementation evidence, not a new product authority or a claim of full Operations readiness.

## Controlling source and delivery

- Official Founder-uploaded 42-page AQA Business 7132 specification **version 2.0, 14 June 2023**, exact SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, verified directly against the uploaded file in this work session.
- §3.4.3 and §3.4.4: printed **p18**; §3.4.5: printed **p19**. The specification is **REFERENCE_ONLY**: use it to identify obligations, do not reproduce its protected content or source exam questions. All new learner examples and numbers are Revision-original.
- Actual canonical learner route `/revision/app/` → enrolled AQA A-level Business 7132 → Operations **Learn**, **Practice** and **Exam Prep**. Three real paper ContentPacks `content/business/aqa-a-level/paper-{1,2,3}/index.ts` use the existing `shared/learn.ts`, validated `practiceBank`, and standard content adapter. This package does **not** add another route, system, account requirement, marker or database migration.
- The previously released §3.4.2 [PR #805](https://github.com/lhanson-dev/revision/pull/805) remains complete and unchanged. Keep #698 open; do not rewrite its independent review history.

## Source-to-live review — 30 *bounded obligation candidates*, not a final syllabus denominator

Each row states a distinct check to assess, with *existing published supply* and its educational acceptance limit. A source tag, broad question, unscored guided activity or a CI-green pack alone is **not** proof of adequately developed, independently marked A-level ability. The source also requires cross-cutting operations technology, ethics, sustainability, market conditions, competitiveness and interfunctional choices; those need a separate synoptic evidence pass. The 30 checks below are a bounded review subset, **not 30/30 independently passed**.

| Source and separately observable check | Existing Learn supply in the published pack | Existing published Practice/Exam Prep candidate | Evidential status |
| --- | --- | --- | --- |
| §3.4.3 capacity's importance and use | `bus-ops-002`, `bus-ops-003` | `3.4:q05` multi-demand analysis | Taught candidate; interpretation scoring unverified |
| §3.4.3 importance of efficiency | `bus-ops-002`, `bus-ops-004` | `3.4:q05` | Taught candidate; independent evidence unverified |
| §3.4.3 importance of labour productivity | `bus-ops-004` | `3.4:q05`, `q09` | Taught candidate; scoped final-number evidence is in §3.4.2 package |
| §3.4.3 ways to increase efficiency | `bus-ops-002` | `3.4:q05`, `q06` | Taught candidate; contextual judgement unverified |
| §3.4.3 ways to increase labour productivity | `bus-ops-002`, `bus-ops-004` | `3.4:q05` | Taught candidate; independent application unverified |
| §3.4.3 difficulties improving efficiency/productivity | `bus-ops-002`, `bus-ops-005` | `3.4:q05`, `q06` | Taught candidate; explicit balance/constraints need educational A2/A3 |
| §3.4.3 lean production benefits | `bus-ops-005` | `3.4:q10`, `q11` | Taught candidate; answer quality and transfer unverified |
| §3.4.3 lean production difficulties | `bus-ops-005` | `3.4:q11` | Taught candidate; JIT vulnerability contextualised, not proven mastered |
| §3.4.3 JIT operation | `bus-ops-005`, `bus-ops-006` | `3.4:q11` | Taught candidate; test response adequacy unverified |
| §3.4.3 JIC operation and compare with JIT | `bus-ops-006` | `3.4:q14`, `q11` | Taught candidate; comparison adequacy unverified |
| §3.4.3 labour-intensive process and context | `bus-ops-002` | `3.4:q04` | Discrimination exists; independent choice/judgement unverified |
| §3.4.3 capital-intensive process and trade-off | `bus-ops-002` | `3.4:q04`, `q06` | Taught candidate; justified mix unverified |
| §3.4.3 technology's effects on efficiency | `bus-ops-002` | `3.4:q06` | Contextual written supply; marking/transfer unverified |
| §3.4.4 quality control as detection | `bus-ops-008` | `3.4:q22` | Source-targeted MCQ exists; wider use unverified |
| §3.4.4 quality assurance as prevention | `bus-ops-008` | `3.4:q23` | Taught candidate; written response marking unverified |
| §3.4.4 distinguish QC and QA in context | `bus-ops-008` | `3.4:q22`, `q23` | Candidate; compare and correct misconception unverified |
| §3.4.4 benefits of improving quality | `bus-ops-008` | `3.4:q24` | A-level analysis supply; rubric adequacy unverified |
| §3.4.4 difficulties improving quality | `bus-ops-008` | `3.4:q24` | A-level analysis supply; independent evidence unverified |
| §3.4.4 consequences of poor quality | `bus-ops-008` | `3.4:q23`, `q24` | Taught candidate; impact chain unverified |
| §3.4.5 match supply to demand and its value | `bus-ops-006` | `3.4:q15`, `q16` | Candidate; contextual evaluation unverified |
| §3.4.5 outsourcing to match supply | `bus-ops-007` | `3.4:q21` | Candidate; policy benefit/risk unverified |
| §3.4.5 temporary/part-time staff for demand peaks | `bus-ops-006` | `3.4:q15` | Candidate; application unverified |
| §3.4.5 make-to-order and demand matching | `bus-ops-006` | `3.4:q16` | Candidate; implications and transfer unverified |
| §3.4.5 factors affecting stock levels | `bus-ops-006`, `bus-ops-007` | `3.4:q19`, `q20` | Contextual supply; evidence adequacy unverified |
| §3.4.5 **interpret an actual plotted inventory-control chart** | `bus-ops-006` contains a textual stock sketch, not a plotted stock timeline | `3.4:q20` and `q43` refer to a chart but present **tables of chart information**; `bus-ops-006:p3` is an **unscored construction self-check** | **Verified teaching/response gap**: no genuine on-screen graph to interpret; do not claim visual assessment |
| §3.4.5 lead time from order to receipt | `bus-ops-006` | `3.4:q16`, `q17`; proposed 2 numeric Practice checks | Teaching candidate; only new final-number checks will be independently scored |
| §3.4.5 re-order level as an order trigger | `bus-ops-006` | `3.4:q17`, `q20` | Interpretation/writing assessment unverified |
| §3.4.5 buffer inventory | `bus-ops-006` | `3.4:q17`, `q20` | Taught candidate; written analysis unverified |
| §3.4.5 re-order quantity as a delivered amount | `bus-ops-006` | `3.4:q13`; proposed 2 numeric Practice checks | Source-targeted MCQ exists; new independent final numbers separately limited |
| §3.4.5 suppliers, supply-chain management and outsourcing value | `bus-ops-006`, `bus-ops-007` | `3.4:q18`, `q19`, `q21`, `q43` | Candidate; authentic AO3/AO4 written assessment and broader synoptic transfer unverified |

**Do not conflate supply with adequacy.** In particular, multi-target bank items marked `DATA_RESPONSE` or `ESSAY` may carry a sound indicative response but that does not show current Practice software independently scores the combined skill. Original question IDs and learner results must remain stable.

## Bounded correction: actual visual chart and honest quantitative Practice

The candidate adds an original `operations-inventory-control-chart` Learn page, using the **existing** schema-supported `quantitative` renderer. It plots one clearly specified 20-day stock cycle, in packets and days: day 0 (1,800), day 10 order trigger (800), day 16 before/after receipt (200/1,800), then day 20 (1,400). The second and third plotted series are horizontal guide lines at 800 reorder and 200 buffer. Both the visual stock-line intersection and the same-day vertical receipt are visible. Readable `Show the data` table, explicit labels, worked method and **two unscored interpretation quick checks** support accessibility and learning. No new graph-renderer code or opaque image file.

Four additional **original, one-mark, exact-integer typed numeric cases** go through the same three existing `practiceBank` adapters and scored save route:
- Two separately authored `aqa-7132-3.4.5:re-order-quantity` delivery-amount questions, calculated from before/after stock values (1,600 and 1,150).
- Two distinct `aqa-7132-3.4.5:lead-time` elapsed-day calculations from order and delivery events (7 and 5 days).

**Limit:** these questions use *stated chart-event data*, not an independently shown or interacted-with unseen graph. They assess final-number **quantity/time arithmetic only**, not construction, interpretation of an unseen graphical chart, written working, process judgment or AO3/AO4. Correct on-screen graph reading is taught and quick-checked but **not independently scoreable** with the current Practice question presentation. An actual independent unseen-graph response needs an existing-renderer-capability check and, if missing, a properly approved shared learner capability change; do not silently claim this content patch closes the whole §3.4.5 performance requirement.

## Test, review and acceptance gates

- `content/business/aqa-a-level/inventory-chart-source-assurance.test.tsx`: exact three-pack Learn and bank wiring; actual chart geometry; independent arithmetic, correct one-mark source target, no visual-mastery/working claim; legacy stock question IDs and mock marks preserved; renderer accessible role and data alternative.
- `tests/e2e/business-inventory-chart.spec.ts`: canonical route with **synthetic locally seeded auth**; chart and data toggling on desktop, tablet and phone widths, original questions and feedback. This is not independently proven hosted learner acceptance.
- **Pending:** current-head TypeScript/lint/unit/build, RLS/DB and signup compatibility, responsive browser tests and signed-in source-linked evidence acceptance, fresh independent A2/A3 source-bounded review of teaching accuracy and graphic semantics, then PR-specific Founder approval, merge, production build/smoke and real learner acceptance. Do not count this as an Operations or full-course completion.
- The original q13/q20/q43 and all existing exam/Practice identifiers remain untouched; old scores, progress and saved checkpoints remain meaningful. AQA PDF is not added to source control.

## Documentation impact

No normative authority amendment. Existing Course Learning Blueprint, source rights, Claims and Progress and the #698 audit protocol already govern this content-only addition. Update this technical note and INDEX in the **same** scoped PR as implementation. Preserve historical keyword, 194/220/421 candidate inventories and independent #805 review records. Update issue #698 with the verified pre-merge educational/technical result and the remaining gap; do not invent a whole-course pass percentage.
