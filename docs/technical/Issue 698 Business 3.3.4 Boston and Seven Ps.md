# Issue #698 — AQA Business 7132 §3.3.4 Boston Matrix and seven-P remediation

**2 November 2026 — separate governed candidate PR, not merged or live.**

## Exact source authority and learner path

- Founder-supplied 42-page **AQA A-level Business 7132**, version 2.0, 14 June 2023, SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, opened and checked directly.
- §3.3.4, **printed pages 16–17**: all seven Ps; marketing mix for **goods and services, industrial and consumer**; product portfolio analysis and the **Boston Matrix**; PLC/extension; NPD; pricing; promotion; distribution; people/process/physical environment; all **seven** named integration influences; digital marketing and e-commerce.
- Rights: `REFERENCE_ONLY`; AQA requirements guide fully original Revision learning objects and self-check scenarios, without copying question papers or mark-scheme text.
- Canonical learner React application: `/revision/app/` → Course Business 7132 → **Learn** for the pages and **Practice → Marketing → Warm-up → Formulas** for DataDrill exercises. The content enters the existing validated three Business paper packs, not a new assessment engine.

## Actual previously published evidence and identified weakness

Published Fast Path Learn has `bus-mkt-006` (product design, life cycle, extension and NPD), `bus-mkt-008` (pricing) and `bus-mkt-009` (promotion, e-commerce, distribution, generic marketing mix). The Marketing topic-summary bullet mentions the Boston Matrix but does not teach its **axes, relative-share method or four categories**. Existing `fast-path-question-bank.json` question `3.3:q31` asks a **nine-mark Boston evaluation** and `3.3:q32` a **25-mark Boston/PLC/mix essay**. Those questions are not a substitute for explicit teaching, and neither is evidence of independently awarded written marks without independently valid marking.

The seven Ps are named in a topic-summary bullet and `bus-mkt-009` describes an integrated mix, but the existing supply does not explicitly distinguish four goods/services × industrial/consumer settings with a coached seven-P recommendation. The original 21-row candidate inventory is too coarse to claim exact complete official atomisation; it does not independently separate all source named integration influences, cases and evidence capabilities.

## Bounded correction in this PR

1. **Learn:** `shared/marketing-mix-supplement.ts` adds a supported Boston Matrix worked example on high/low growth, **relative market share against the largest rival**, quadrants (star, cash cow, question mark, dog), actual arithmetic, evidence-informed portfolio decisions and limits; plus a seven-P application page covering industrial/consumer goods and services, including a worked industrial service mix. Unscored Learn quick checks are pedagogical aids only.
2. **Practice:** `shared/marketing-mix-practice.ts` adds two original paper exercises: a fresh four-product Boston Matrix drawing and classification and an industrial-service seven-P recommendation with cross-context consumer comparison. These DataDrills are **self-check via model reveal**, not independently marked drawings, numeric workings, written analysis or evaluation. No marks or mastery credit.
3. **Delivery:** `shared/learn.ts` assembles new pages alongside existing authored/Fast Path pages; all three standard ContentPacks append two Marketing-only drills after the existing 29. Existing page and question IDs, saved evidence, exam papers and database schema remain unchanged.
4. **Assurance:** `marketing-mix-source-assurance.test.ts` validates three-pack page and question availability, original data arithmetic/quadrants, topic filtering, no marks and source-to-learner boundaries; existing content and drill scope regressions updated. This is automated structural/logic testing, not expert educational adequacy.
5. **Traceability:** `audits/2026-11-02-business-334-marketing-mix-source-to-learner.json` links **21 provisional candidate rows** to actual Learn and Practice IDs and leaves educational, Exam Prep and production status **unverified**. Does not rewrite the 194/344 historical or 421 newer candidate baselines.

## Explicit remaining blockers and next work

- Confirm current-head CI and authenticated Marketing Learn/Practice UI, including mobile and restart. Full production acceptance after a specific approved merge and deployment.
- Independently challenge the subject accuracy and mark schemes of `3.3:q31` and `3.3:q32` (nine/25 marks), including source-supported AO demands, quality of example judgement and whether students can submit actual evaluated writing. No qualified examiner sign-off is claimed.
- Test seven-P **industrial goods and consumer services** in independent contextual tasks, not just the worked industrial-service and consumer-good comparison.
- Verify each of the **seven named influences** in sufficiently deep contextual application. The 21 source prompts cannot be counted as passed official atoms.
- Scored diagram construction remains **unsupported** by existing DataDrill UI. No new marking capability or normative product decision proposed; an assessment feature would need separate governance.
- Do not confuse unscored Learn quick-checks and model reveals with independent Practice evidence capable of updating Progress, REV or Plan.

**Documentation impact:** This technical note and source-to-learner evidence addendum accompany the content correction with INDEX pointer; existing Course Learning Blueprint, Content Accuracy and Claims/Progress authorities are sufficient for the current bounded behaviour, so no normative authority change or ADR is proposed. Historical evidence is preserved.

## 2 November 2026 — current-main reconciliation and exact learner evidence gate

**Historical candidate description above** records the original pre-#777 baseline. Approved main now includes Business Marketing §3.3.3 positioning-map Learn and DataDrill through [PR #777](https://github.com/lhanson-dev/revision/pull/777), production-verified [run #41542514232](https://github.com/lhanson-dev/revision/actions/runs/41542514232) at merge SHA `0d672c07997bc776bf89188f7bcfb896f98daaa5`. The approved baseline has **30** Business data drills, including **four** Marketing exercises. This PR appends two §3.3.4 drills **after** the previously accepted positioning-map drill: intended integrated totals **32** Business and **six** Marketing, preserving all 30 historical identities and order, source-gated lesson corrections, and Paper 1–3 consistency. Counts/sequence in baseline unit, topic-scoped, finance/graph and new marketing-mix tests are updated together. No duplicate content engine and no overwrite of #777's qualitative-targeting safeguard.

**Real-Auth acceptance extension:** The existing disposable local Supabase Business Marketing learner-journey browser case is extended from §3.3.3 through the two new §3.3.4 exercises. It checks real navigation, distinct prompts/model answers, and zero assessed evidence from unscored reveals. This remains local authenticated QA, not hosted Production acceptance or independent student proficiency.

**AQA scope precision:** §3.3.4 (pp16–17) requires understanding the value of product portfolio analysis and Boston Matrix; it does **not expressly specify drawing a Boston Matrix in an examination**. Guided construction is marked as optional extension/rehearsal, not an AQA examination command. Source is the exact Founder-supplied 7132 v2.0, `REFERENCE_ONLY`, SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. The 21-row audit is a provisional learning-obligation candidate inventory, not an assured coverage or mastery denominator.

**Release gates:** This integration candidate needs fresh nine-job current-head CI followed by protected trusted exact-head independent A2/A3 educational review of #784 and its actual paper-pack integration, then a separate Founder merge approval and post-merge production verification. Do not infer eligibility from the original pre-integration CI or count unscored answer reveals as achieved competencies. No normative product or evidence rule is altered, so existing Course Learning Blueprint and Content Accuracy/Progress authorities remain intact. Historical PR #777 review and prior #784 draft evidence are preserved.
