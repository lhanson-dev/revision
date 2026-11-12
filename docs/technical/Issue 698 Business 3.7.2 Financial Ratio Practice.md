# Issue #698 — AQA Business 7132 §3.7.2 financial-ratio method and independent final-number candidates

**Prepared 4 November; updated 12 November 2026. PR candidate; original scoped A2/A3 PASS at exact head `13e7bbe7b3c6f2161b25e9265fb3c4fdaf8713f7`; not yet Founder-approved, merged or live.** Canonical learner route: `/revision/app/` → Courses → Business → Learn/Practice. Shared `content/business/aqa-a-level/shared/` assets are assembled in all three actual published Business ContentPacks, not an alternate assessment engine.

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
| Six formula definitions and numeric method modelling | Existing formulas plus new original worked lesson | **Scoped A2 PASS** on 12 November exact-head review; no full-section or human-expert claim |
| Six distinct single-target typed final-value calculations, two scenarios each | 12 new proposed questions with deterministic arithmetic checks | **Scoped A3 PASS** on 12 November exact-head review; final-number evidence only |
| Read and interpret complete balance sheets/income statements | General existing topic text and mixed existing question bank | **Unverified per independent skill** |
| Interpret each ratio in distinct business contexts | New caveats and original worked comparisons plus previous mixed prompts | **Unverified; no separately scored written AO3 evidence** |
| Compare performance over time and against competitors; defend judgement | Existing original mixed assessment stimuli and limited Learn guidance | **Unverified AO3/AO4/A4 marking** |
| Saved authenticated learner result, repair, independent Plan retest, readiness | Existing general scoring/evidence systems only | **WS4/WS5 acceptance outstanding** |
| Full-course exact atomisation, three-paper suitability and expert sign-off | Released PR #830 provisional register and earlier #698 audits | **Unverified** |

## Independent review receipt and bounded correction — 10 November 2026

The fresh approved-main reviewer ran against prior exact head `eff091879454b0cbe8dd63957281b595d321f805` in [GitHub Actions run 42919603566](https://github.com/lhanson-dev/revision/actions/runs/42919603566), with retained artifact `issue-698-business-a2a3-836-42919603566` (artifact ID `13811865086`). Reviewer returned **FAIL/HOLD**; preserve that historical result. All 12 answers, both worked examples, source rights, the three real ContentPacks and identity were reviewed positively within narrow final-number scope. The material finding was shared scorer over-crediting: an answer of `19.5` could earn the mark for an exact `20`, and a `1.45` could earn the mark for exact current ratio `1.5`, without an authorised rounding policy. Reviewer also noted that prompts should be explicit about precision.

This correction opts only the twelve *new* ratio questions into an `exact-number` check (including decimal current-ratio values), keeps the older `exact-integer` statistic rule and all legacy rounding behavior, and adds actual published-path regression tests for false-positive boundaries, units and complete numeric tokens. It changes the shared scorer implementation and its content adapter wiring, but does not retroactively re-mark saved learner answers. The source method remains educational teaching, not an assessed written working. The corrected head completed fresh 9/9 CI and exact-main integration, then received the separately returned A2/A3 decision recorded below; a reviewed old head did not license the correction.


## Revalidation receipt — 12 November 2026

The installed approved-main reviewer rechecked exact PR #836 head `13e7bbe7b3c6f2161b25e9265fb3c4fdaf8713f7` against approved main `7da3ac9c205c77f1a51f6dd27cb78e9bc8b05255` in [GitHub Actions run 43301075298](https://github.com/lhanson-dev/revision/actions/runs/43301075298). The isolated fresh-context A2/A3 review returned **PASS**. Its 30-day machine-readable receipt is retained as artifact `issue-698-business-a2a3-836-43301075298` (artifact ID `13981712319`; expires 12 December 2026).

The receipt independently recalculated both worked examples and all 12 final answers; verified the strict exact-number correction rejects the former false positives; confirmed source rights, unique identity and all three actual Business ContentPacks; and found no blocking or material issue. It records one non-blocking limitation: the final-number items do **not** independently evidence financial-statement extraction, comparative written interpretation, judgement, AO3/AO4, signed-in persistence/retest, Plan/Progress behaviour, full-course coverage or human-examiner approval. The historical 10 November FAIL/HOLD receipt remains preserved and is not superseded.

## Review and release gate

1. The scoped fresh independent A2/A3 review and all nine exact-head CI jobs are PASS on the documented head. Any later material head change, source/worker-contract change or educational defect must be re-reviewed; preserve prior receipts.
2. Obtain **specific Founder approval** for this PR before recording the exact-head approved marker and merging. Because this documentation update creates a new exact head, regenerate CI and A2/A3 evidence first; this is an approval-readiness rule, not approval itself. Only then verify release-lineage and production.
3. Independently reproduce a signed-in original learner answer and wrong-answer feedback, reload, subsequent different ratio case and Progress/Plan handling under WS4/WS5.
4. Keep #698 open. The current content proposal is **not** a verified complete course, independently A2/A3 accepted, a method-marking feature, or a genuine 16/25-mark AO4 essay solution. LF-05 #706/#813 owns written-practice product readiness; original long-form Business content must separately pass A1/A2/A3/A4 and user review.

## Documentation impact

This is a learner-content implementation change, so this technical note, INDEX and deterministic tests accompany code in the **same branch**. It implements existing Course Learning Blueprint and Claims and Progress governance without changing normative desired behaviour. Historic candidate inventories, independent review receipts and source PDFs are unchanged. No ADR or new tracker is required.
