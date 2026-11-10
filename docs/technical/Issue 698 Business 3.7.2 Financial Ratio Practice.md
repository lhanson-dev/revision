# Issue #698 — AQA Business 7132 §3.7.2 financial-ratio method and independent final-number candidates

**Prepared 4 November; updated 10 November 2026. PR candidate, educational A2/A3 HOLD pending corrected-head re-review.** Canonical learner route: `/revision/app/` → Courses → Business → Learn/Practice. Shared `content/business/aqa-a-level/shared/` assets are assembled in all three actual published Business ContentPacks, not an alternate assessment engine.

## Source and bounded requirements

Founder-supplied AQA A-level Business 7132 **v2.0 dated 14 June 2023**, 42 pages, SHA-256 **`3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`** verified in this work session; rights **REFERENCE_ONLY**. Printed page 25, **§3.7.2**, calls for assessment of financial performance using balance sheets, income statements, profitability (ROCE), liquidity (current ratio), gearing and efficiency ratios (payables days, receivables days, inventory turnover), including comparison across time or with other businesses. The 42-section/504-candidate audit register was merged in PR #830 on 7 November 2026 and its deployment passed; the candidates remain **provisional**, not a certified exhaustive atomic source denominator.

The existing three published packs already contain general ratio explanations (`shared/topics.ts`), calculation formulas (`shared/learning.ts`), self-checked `shared/quantitative.ts` drills, section-linked original fast-path bank questions and mock-paper content. Those constitute **supply**, not independently verified proficiency in all six calculations, statement interpretation or AO3/AO4 evaluation.

## Proposed correction and exact published path

- New `strategic-ratio-supplement.ts` contributes one original Learn page `strategic-financial-ratios-method` in the **strategic-position** topic; explains each denominator, units, financial-statement provenance, two worked examples, a quick check, decision caveats and a recap.
- New `strategic-ratio-practice.ts` provides 12 original typed final-answer Practice questions, two materially different numerical cases per measure: ROCE, current ratio, gearing, payables days, receivables days and inventory turnover. All are independently recomputed in `strategic-ratio-assurance.test.ts` and map **one** exact source item and one real teaching page to each one-mark attempt.
- `shared/learn.ts` and three `paper-{1,2,3}/index.ts` assemblies add the actual learner content using existing `learn` and `practiceBank` route; no new UI, scorer, storage table, plan engine, auth requirement or exam simulation is created.
- Each published question explicitly instructs learners that the stated figures yield an exact result and need no rounding. The Learn recap distinguishes this specific practice rule from rounding instructions in other exam questions. Each new calculation explicitly opts into `exact-number` scoring: a complete independently entered numeric final answer must equal the specified exact result, including exact decimal values such as 1.5 and 1.4; no undocumented ±0.5/±0.05 marking margin. Earlier questions retain their existing rounding policy and historical learner results remain unchanged. A strictly numeric token (e.g., `20` or `20.0`, not `20%` or `20+1`) is required, consistent with the instruction to type only the number.
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
| Full-course exact atomisation, three-paper suitability and expert sign-off | Released PR #830 provisional register and earlier #698 audits | **Unverified** |

## Independent review receipt and bounded correction — 10 November 2026

The fresh approved-main reviewer ran against prior exact head `eff091879454b0cbe8dd63957281b595d321f805` in [GitHub Actions run 42919603566](https://github.com/lhanson-dev/revision/actions/runs/42919603566), with retained artifact `issue-698-business-a2a3-836-42919603566` (artifact ID `13811865086`). Reviewer returned **FAIL/HOLD**; preserve that historical result. All 12 answers, both worked examples, source rights, the three real ContentPacks and identity were reviewed positively within narrow final-number scope. The material finding was shared scorer over-crediting: an answer of `19.5` could earn the mark for an exact `20`, and a `1.45` could earn the mark for exact current ratio `1.5`, without an authorised rounding policy. Reviewer also noted that prompts should be explicit about precision.

This correction opts only the twelve *new* ratio questions into an `exact-number` check (including decimal current-ratio values), keeps the older `exact-integer` statistic rule and all legacy rounding behavior, and adds actual published-path regression tests for false-positive boundaries, units and complete numeric tokens. It changes the shared scorer implementation and its content adapter wiring, but does not retroactively re-mark saved learner answers. The source method remains educational teaching, not an assessed written working. The corrected head **still requires fresh 9/9 CI, current-main integration and an independently returned A2/A3 PASS** before any approval request; a reviewed old head cannot license this new code.

## Review and release gate

1. Fresh independent A2 teaching review and A3 question/answer calibration against source and real published content, including formula conventions, accounting assumptions, decimals, cases, units, exact skill identity, independent second attempt and no accidental multiple-skill credit. Any material failure requires a fix and re-review of the changed head, preserving previous failure receipt.
2. Pass current-head Revision CI across foundation, TypeScript/lint/build, database/RLS, signup, three device sizes, content tests, and clean main integration. Verify no duplicate bank IDs or changed existing 100-mark papers.
3. Obtain **specific Founder approval** for this PR before recording the exact-head approved marker and merging. Only then verify release-lineage and production. Independently reproduce a signed-in original learner answer and wrong-answer feedback, reload, subsequent different ratio case and Progress/Plan handling under WS4/WS5.
4. Keep #698 open. The current content proposal is **not** a verified complete course, independently A2/A3 accepted, a method-marking feature, or a genuine 16/25-mark AO4 essay solution. LF-05 #706/#813 owns written-practice product readiness; original long-form Business content must separately pass A1/A2/A3/A4 and user review.

## Documentation impact

This is a learner-content implementation change, so this technical note, INDEX and deterministic tests accompany code in the **same branch**. It implements existing Course Learning Blueprint and Claims and Progress governance without changing normative desired behaviour. Historic candidate inventories, independent review receipts and source PDFs are unchanged. No ADR or new tracker is required.
