# Issue #698 — AQA Business 7132 §3.7.2 financial-ratio method and independent final-number candidates

**4 November 2026. PR candidate, educational A2/A3 HOLD.** Canonical learner route: `/revision/app/` → Courses → Business → Learn/Practice. Shared `content/business/aqa-a-level/shared/` assets are assembled in all three actual published Business ContentPacks, not an alternate assessment engine.

## Source and bounded requirements

Founder-supplied AQA A-level Business 7132 **v2.0 dated 14 June 2023**, 42 pages, SHA-256 **`3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`** verified in this work session; rights **REFERENCE_ONLY**. Printed page 25, **§3.7.2**, calls for assessment of financial performance using balance sheets, income statements, profitability (ROCE), liquidity (current ratio), gearing and efficiency ratios (payables days, receivables days, inventory turnover), including comparison across time or with other businesses. The 42-section/504-candidate audit register is separately proposed in PR #830; it is **not** a certified exhaustive atomic source denominator.

The existing three published packs already contain general ratio explanations (`shared/topics.ts`), calculation formulas (`shared/learning.ts`), self-checked `shared/quantitative.ts` drills, section-linked original fast-path bank questions and mock-paper content. Those constitute **supply**, not independently verified proficiency in all six calculations, statement interpretation or AO3/AO4 evaluation.

## Proposed correction and exact published path

- New `strategic-ratio-supplement.ts` contributes one original Learn page `strategic-financial-ratios-method` in the **strategic-position** topic; explains each denominator, units, financial-statement provenance, two worked examples, a quick check, decision caveats and a recap.
- New `strategic-ratio-practice.ts` provides 12 original typed final-answer Practice questions, two materially different numerical cases per measure: ROCE, current ratio, gearing, payables days, receivables days and inventory turnover. All are independently recomputed in `strategic-ratio-assurance.test.ts` and map **one** exact source item and one real teaching page to each one-mark attempt.
- `shared/learn.ts` and three `paper-{1,2,3}/index.ts` assemblies add the actual learner content using existing `learn` and `practiceBank` route; no new UI, scorer, storage table, plan engine, auth requirement or exam simulation is created.
- Existing question IDs, older scored attempt records, mocks and three 100-mark paper totals remain unchanged. `rev7132-3.7.2-*` is a new separate identity namespace. Questions offer a second independent attempt without reusing the same numbers.

## Honest assurance matrix

| Capability | Existing or new supply | Independently educationally verified? |
|---|---|---|
| Six formula definitions and numeric method modelling | Existing formulas plus new original worked lesson | **No. A2 HOLD** until blind fresh-context review |
| Six distinct single-target typed final-value calculations, two scenarios each | 12 new proposed questions with deterministic arithmetic checks | **No. A3 HOLD** until adversarial independent source/wording/distractor/feedback review |
| Read and interpret complete balance sheets/income statements | General existing topic text and mixed existing question bank | **Unverified per independent skill** |
| Interpret each ratio in distinct business contexts | New caveats and original worked comparisons plus previous mixed prompts | **Unverified; no separately scored written AO3 evidence** |
| Compare performance over time and against competitors; defend judgement | Existing original mixed assessment stimuli and limited Learn guidance | **Unverified AO3/AO4/A4 marking** |
| Saved authenticated learner result, repair, independent Plan retest, readiness | Existing general scoring/evidence systems only | **WS4/WS5 acceptance outstanding** |
| Full-course exact atomisation, three-paper suitability and expert sign-off | PR #830 candidate register and earlier #698 audits | **Unverified** |

## Review and release gate

1. Fresh independent A2 teaching review and A3 question/answer calibration against source and real published content, including formula conventions, accounting assumptions, decimals, cases, units, exact skill identity, independent second attempt and no accidental multiple-skill credit. Any material failure requires a fix and re-review of the changed head, preserving previous failure receipt.
2. Pass current-head Revision CI across foundation, TypeScript/lint/build, database/RLS, signup, three device sizes, content tests, and clean main integration. Verify no duplicate bank IDs or changed existing 100-mark papers.
3. Obtain **specific Founder approval** for this PR before recording the exact-head approved marker and merging. Only then verify release-lineage and production. Independently reproduce a signed-in original learner answer and wrong-answer feedback, reload, subsequent different ratio case and Progress/Plan handling under WS4/WS5.
4. Keep #698 open. The current content proposal is **not** a verified complete course, independently A2/A3 accepted, a method-marking feature, or a genuine 16/25-mark AO4 essay solution. LF-05 #706/#813 owns written-practice product readiness; original long-form Business content must separately pass A1/A2/A3/A4 and user review.

## Documentation impact

This is a learner-content implementation change, so this technical note, INDEX and deterministic tests accompany code in the **same branch**. It implements existing Course Learning Blueprint and Claims and Progress governance without changing normative desired behaviour. Historic candidate inventories, independent review receipts and source PDFs are unchanged. No ADR or new tracker is required.
