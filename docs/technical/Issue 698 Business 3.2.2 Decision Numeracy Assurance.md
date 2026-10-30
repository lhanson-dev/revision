# Issue #698 — Business 7132 §3.2.2 decision-tree numeracy

**Status:** Publication candidate on governed PR; **not on the live site until the PR is explicitly merged and deployed**. Date: 30 October 2026.

## Source and exact teaching obligation

The official AQA A-level Business **7132**, version **2.0 dated 14 June 2023**, §3.2.2 (printed p14, PDF physical page index 13) explicitly includes interpreting decision trees and calculating **expected value** and **net gain**. The authoritative Founder-supplied PDF path is available from the AQA 2023 official archive at [specification source](https://www.aqa.org.uk/files/faf787aa-3753-423d-b4fa-55f2374d4441/5c265ac92b9358f142c2b69483df78f811d52739.pdf); the parallel AQA filestore version was visually inspected to establish these table demands. The historic Founder-uploaded binary's exact SHA-256 has **not** been independently reverified in this execution. Both documents are reference-only: no protected question, source paragraphs or mark scheme is copied.

The source also demands understanding scientific versus intuitive management decisions, risk, rewards, uncertainty, opportunity cost, interpreting decision trees, and influences including mission, objectives, ethics, competition and resources. **This PR does not certify those demands.** The JSON evidence at `audits/2026-10-30-aqa-business-7132-section-322-decision-numeracy.json` records only the two measured *calculation* obligations, not a denominator for whole-section adequacy.

## Verified existing implementation and smallest necessary correction

The existing published leadership Learn node `bus-evi-004` already teaches a decision tree, probability branches, expected values, net gains, risk, uncertainty and contextual judgement, with two worked examples. Its existing original question `q03` asks students to calculate both expected value and net gain and show working, but it is a `SHORT_ANSWER` with a multi-point written mark scheme, **not an independently marked final-value task in the standard Practice pool**. Existing other `q04`–`q06`, `q39`, `q40`, `q44` and the authored Learn material are preserved.

This narrow correction introduces **four Revision-original, one-mark, typed final-number checks** through the existing generic validated `StructuredPracticeBank`: two different cases for the `aqa-7132-3.2.2:expected-value` item and two for `aqa-7132-3.2.2:net-gain`. Each has a new stable `rev7132-3.2.2-*` ID, one exact item and `bus-evi-004` Learn-node link, a different context and numbers, deterministic correct answer and worked feedback. All three existing Business paper ContentPacks use the **same** source through `content/business/aqa-a-level/shared/decision-tree-numeric-practice.ts`. No new UI, engine path, data table, paid service, access flag, Plan logic, REv recommendation or scoring policy is introduced. Existing IDs, saved marks and questions remain untouched; a currently saved session in the same topic may require an updated checkpoint if the question-pool fingerprint changes, but previously saved scored evidence remains retained.

### Exact arithmetic for independent checks

| Practice case | Calculated arithmetic | Final scored value |
| --- | --- | --- |
| expected-value-01 | 0.60 × 150,000 + 0.40 × (−40,000) | £74,000 |
| expected-value-02 | 0.25 × 240,000 + 0.75 × (−20,000) | £45,000 |
| net-gain-01 | 0.70 × 80,000 + 0.30 × (−20,000) − 12,000 | £38,000 |
| net-gain-02 | 0.55 × 125,000 + 0.45 × (−45,000) − 18,500 | £30,000 |

Every figure and context is Revision-authored; no source examination questions are reproduced.

## What remains unproved

A final result can be marked right or wrong, but the student's **tree construction, probability notation, intermediate working, treatment of risk and assumptions, real-world comparison, written analysis and evaluation are not independently marked by these tasks**. Two same-item questions are not proof that a specific student has performed a later independent recheck. This PR is evidence of question *supply*, not adequate educational coverage, skill mastery, full §3.2.2 completion, real signed-in persistence or current production activation. These remaining issues continue in #698 and #703, with relevant skill evidence / assessment issues #704–706.

## Acceptance and documentation impact

`content/business/aqa-a-level/decision-tree-numeracy-assurance.test.ts` tests actual all-three published ContentPacks and Practice question-pool types, exact stable mapping, answer scoring against independent arithmetic, and prior `q03` and §3.1.3 ID retention. The shared content-adapter historical ordering/length assertion is expanded by **exactly four new records**, not weakened. Standard CI, database/RLS, responsive browser and production release gates apply.

This is a scoped **content correction within an existing Founder-authorised #698 programme**, not a new product behaviour or architecture proposal. No normative authority or ADR change is needed. This technical note, bounded source audit, test and INDEX entry accompany the change in the same governed PR; do not rewrite historical source evidence or present the audit as completed syllabus assurance.
