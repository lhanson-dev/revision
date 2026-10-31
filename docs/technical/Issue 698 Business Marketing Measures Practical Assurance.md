# Issue #698 — AQA Business 7132 Marketing numerical capability: source-to-published correction

**31 October 2026 — governed candidate, not merged, live or externally educationally approved.** Canonical route `/revision/app/` → Courses → AQA A-level Business 7132 → Learn / Practice. Published storage: `content/business/aqa-a-level/paper-{1,2,3}/index.ts`, shared Learn projection `shared/learn.ts` from `content-factory/slices/aqa-7132-3.3/learn-practice/bus-mkt-002.json`, shared structured bank via `src/app/practice-questions.ts` and `FocusedLearningWorkspace`. Exam Prep and mocks are unchanged.

## Governing source and rights

The original Founder-supplied AQA AS/A-level Business **7132**, **v2.0, 14 June 2023**, 42-page PDF was SHA-256 verified in the audit workspace against #698's pinned `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. It is `REFERENCE_ONLY`. Printed p15, §§3.3.1–3.3.2, requires business marketing objectives and the **separable calculations** of market growth, sales growth, share and size. The new examples are independently Revision-authored, not copied source text or awarding-body questions.

The previous 501-provisional-atom register correctly differentiates these four abilities as `BUS7132-ATOM-3.3.2-005..008`, but this is not an independently approved complete denominator. The legacy 344 item IDs for market size, market growth and share are attached to **§3.3.1**; the historical map does **not** include a separately approved `sales-growth` item. Do not equate market-level growth and one firm's sales growth, including when attributing marks. Do not modify/relabel the historical 344 inventory to hide the gap.

## Exact learner review

| Source skill | Actual Learn | Previously published evidence | Corrective work | Remaining limitation |
| --- | --- | --- | --- | --- |
| Market growth (atom 005) | `bus-mkt-002` explains percentage growth | Unscored worked methods and written answer-reveal/point responses, not a reliable software-scored isolated final number | Two original typed final-answer calculations, with both an increase and a **negative contraction** | Working, applied interpretation and later independent retest not demonstrated |
| **Sales growth (atom 006)** | `bus-mkt-002` compares firm sales with the market, but previously lacked an explicit worked firm-specific percentage-growth method | No separately mapped, independently scored sales-growth item | Added original **20% firm sales vs 30% market growth** stepwise worked comparison, and demonstrated the fall in market share from 20% to ~18.46% | Distinct approved `sales-growth` item mapping and authentic independently marked response **remain absent** |
| Market share (atom 007) | `bus-mkt-002` has ratio, value/volume and counterexamples | Published `aqa7132-3.3-q03` and `rev7132-recheck-3.3-recheck-market-share-01` source-tagged MCQs | Reused both rather than generating a duplicate | Correct selected percentage does not prove independent working, interpretation or AO3/AO4 |
| Market size (atom 008) | `bus-mkt-002` has size-by-value definition and sum-of-firms worked method | Historical source bank includes written numeric question not automatically marked as a final-number check | Two original typed results: **sum all market suppliers** and **derive total market from a firm’s share** | No scored market-definition reasoning, working or exam judgement |

The scoped machine-readable adjudication is `audits/2026-10-31-aqa-business-7132-marketing-measures-source-to-learner.json`. It retains all four distinct requirement statuses; **none** is marked `Adequate and verified`. Sales-growth practice is **Inadequate**, not hidden by tagging it as market growth. The other three remain **Unverified** until marking, educational quality and actual student acceptance pass.

## Published implementation and validity boundary

Four new `rev7132-3.3.2-*` structured-bank question identities in `shared/marketing-quantitative-practice.ts` use the *existing* generic practice adapter and the exact historical 3.3.1 item IDs plus `bus-mkt-002` Learn node. Each is single-target and deterministically scores a **one-mark final number**. There are two genuine independent contexts for size, two for market growth; these are pedagogically justified alternatives for a fresh skill check, not an arbitrary number-of-questions quota.

All three Business ContentPacks import the same four authored records. Existing question identities, mock papers, Learn page IDs, saved evidence, signup, database, course-level sequencing, REV, Plan and Psychology are unchanged. The separate draft #743 is responsible for using signed-off numerical evidence to launch a typed Plan/REV independent recheck; this patch **does not claim** that the adaptive learner loop is released or that any right number proves workings, a sound method or mastery.

## Assurance and next action

`content/business/aqa-a-level/marketing-quantitative-assurance.test.ts` inspects all three *actual* learner packs and their Learn, resolves real Practice-pool identities, checks deterministic numerical results and wrong answers (including sign), distinguishes the two exact targets, and prevents the sales-growth mapping gap from being silently claimed as covered. CI, signed-in live learner E2E, expert mathematical/exam-script checking and Paper-specific marking are separate gates, **not** satisfied by this record.

**Next within #698:** Approve a reviewed, distinct `sales-growth` source item in the governed Foundation/skill map, then publish an appropriate independently evaluated student attempt and recheck without attributing a general market-growth calculation to the new requirement. Continue source-led per-atom quality adjudication for the other 18 provisional §3.3.2 skills, then the other sections and AO/Annex. #704/#705 own shared evidence and Plan linkage, not this content patch.

**Documentation impact:** scoped source-to-learner audit JSON, this technical note, regression, Learn correction and bank changes, with INDEX link, are included in the same PR. The approved Learning Blueprint and content licensing/claims/assessment authority already prescribe these outcomes, so no normative authority/ADR change is proposed. Historical source review datasets and question IDs remain untouched.
