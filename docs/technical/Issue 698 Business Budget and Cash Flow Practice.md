# Issue #698 — AQA Business 7132: budget/cash-flow Practice publication correction

**29 October 2026 · Proposed Business-only content wiring, not live until separately approved and merged.** Canonical learner runtime: `/revision/app/`, ordinary enrolled Business Course Practice through `FocusedLearningWorkspace`, three available coordinated AQA 7132 ContentPacks.

## Source, rights and exact requirement boundaries

Official AQA Business 7132 **v2.0 14 June 2023**, §**3.5.2 Analysing financial performance**, printed **p20** (source PDF physical p19): construction and interpretation of budgets and cash-flow forecasts, identification and analysis of variances, and financial-data interpretation. The approved source manifest is `research/specification-to-learner/aqa-2027-source-manifest.json` and pins SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. The original uploaded bytes are **not independently rehashed** in this work; verified official source version is the relevant reference. Rights classification **REFERENCE_ONLY**; learner case text, values and exercises are Revision-authored, not official AQA assessment.

Existing Course Truth evidence `bus-fin-007` maps `aqa-7132-3.5.2:budgets-income-expenditure-profit`, `...:variance-analysis`, `...:adverse-and-favourable-variances`; `bus-fin-005` maps `...:cash-flow-forecast` and `...:timing-of-payables-and-receivables`. The independently established total 7132 syllabus denominator is **still OPEN**; source IDs and a section-reference alone do not establish complete atomic adequacy.

## Reproduced site gap and smallest valid correction

**Before:** existing generated, learner-visible Learn pages `bus-fin-005` (cash-flow construction with carried month closing balances and timing) and `bus-fin-007` (budget construction, variance signs and analysis) have substantial factual content. Their **paired original Content Factory practice items are in `content-factory/slices/aqa-7132-3.5/learn-practice/*.json` but `content/business/aqa-a-level/shared/learn.ts` projects only `asset.learn`**. Their construction prompts do not enter `ContentPack.dataDrills`; a learner could not attempt these authored table exercises in the actual Practice screen. The published site already has a separate **one-period cash closing** reveal drill and many general finance bank questions. Neither a single ending balance nor a displayed worked table proves a learner can construct a multi-period forecast and a complete budget with variance labels.

**This candidate:**

1. `shared/financial-construction-practice.ts` promotes **two unchanged, original authored** construction questions and model answers from `bus-fin-007/practice.items/p-construct-and-reconcile-march-budget` and `bus-fin-005/practice.items/p11-three-month-cash-flow-forecast`, using the existing `dataDrillSchema`. Checks the expected source and item identity, retains the full original model, and explicitly says that model-answer reveal is **not** software marking of the constructed table.
2. `shared/financial-numeric-practice.ts` adds **six new original final-number practice questions** on budgeted profit, cost variance, income variance, two distinct two-month cash balances and delayed cash receipt. This uses the existing validated `ContentPack.practiceBank` + generic calculation input/feedback/evidence path, not a new UI or engine. Each question has a stable `rev7132-3.5.2-` namespace, one exact source-item target, one existing Learn node `bus-fin-005` or `bus-fin-007`, `topic_id: finance`, original context, exact numeric answer, and worked feedback. For the real learner, **only the typed final number** is marked and stored; no working, forecast table or essay reasoning is assessed. Current #704 exact skill provenance helper covers MCQs, not these calculations: an exact target in authored content **must not** be represented as persistent scored skill mastery for this release.
3. All 3 current published `paper-{1,2,3}/index.ts` packs include the same shared two drills and six numerical bank records using the existing `content-adapter` and `FocusedLearningWorkspace`. No paper divergence or new subject-specific learner screen. Old question, Learn, drill and exam IDs preserved; no database migration or change to recorded evidence version.
4. Deterministic real-pack tests in `financial-construction-practice.test.ts` check source Learn pages, the exact original prompt answers and self-check boundary, original IDs, all three published packs, bank-to-actual Practice pool, independently recomputed six answers, correct/wrong signed numerical checking and current evidence limits. Existing expected data-drill count moves **27 → 29**.

## Truthful quality and acceptance classification

| Required capability | Learner evidence after this proposed PR | Status |
| --- | --- | --- |
| Budget/cash-flow explanations and constructed worked examples | Existing published `bus-fin-007`, `bus-fin-005` Learn | **PRESENT, independent full-semantic review still UNVERIFIED** |
| Full table construction and variance/cash-flow timing rehearsal | New existing-authored reveal-only construction data drills | **SELF-CHECK AVAILABLE; independently assessed skill UNSUPPORTED** |
| Independent final-number financial calculations | Six typed, software-scored checks; original worked answer feedback | **SCORING COMPONENT VERIFIED in CI only; hosted acceptance UNVERIFIED** |
| Original question-to-exact requirement saved skill result | Bank content tagged, but calculation evidence does not retain authenticated exact-item scored provenance | **UNSUPPORTED by #704 current slice** |
| Differentiated repair, independent later recheck and evidence-led Plan | Only eligible objective evidence and authored rechecks when supported | **UNVERIFIED end-to-end under #703/#705/#694** |
| Genuine signed-in hosted registration, feedback, durable storage and Progress/REV/Plan | Not tested by this content-only PR | **UNVERIFIED; #693 signup/email separately OPEN** |
| Full independent atomic course coverage, examiner sign-off | No additional whole-course audit certification | **OPEN, #698** |

Existing `dataDrills` remain a course-wide sequence rather than topic-filtered cards, so targeted discoverability is a known limitation. A learner drawing on paper is not captured. Do not add two drills or six scored questions to the denominator as eight new syllabus requirements, and do not award full §3.5.2 or any of the 8 programme checkpoints a PASS from existence/CI alone.

**Documentation impact:** this note, direct real-course regression, additive shared assets, 3 pack manifests, data-drill cardinality test and INDEX. No change to normative standards, specification source, historical evidence or migration. A material new table/diagram auto-marking feature would require separate governed Ready, privacy/accessibility and marking validation. This scoped implementation correction does not.

**Cost:** deterministic reuse of existing authored assets and original authored numeric examples; no external paid content generation or new service dependency. End-to-end course production cost remains unmeasured pending #698 programme closure.
