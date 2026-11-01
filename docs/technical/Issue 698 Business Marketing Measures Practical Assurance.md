# Issue #698 — Business 7132 Marketing numerical skills: source-to-published correction

**31 October 2026 — unmerged governed candidate, not expert assured or accepted by a real learner.** The canonical route is `/revision/app/` → Courses → AQA Business 7132 → Learn/Practice. The three `content/business/aqa-a-level/paper-{1,2,3}/index.ts` packs share `bus-mkt-002` Learn and the same structured Practice adapter. No separate assessment engine is introduced.

## Source and source-rights boundary

The Founder-supplied AQA Business 7132 **v2.0 (14 June 2023)** 42-page PDF matched Issue #698 SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332` in the audit workspace. Printed **p15** requires independently distinguishable calculations for market size, market growth, market share and a firm's **sales growth**. Source is `REFERENCE_ONLY`; the new teaching and question contexts are original Revision-authored materials.

`BUS7132-ATOM-3.3.2-005..008` are four **provisional** independent source skills, not a complete or independently approved source denominator. Source maps historically associate size, growth and share with §3.3.1 item IDs. The old 344-item map lacks an exact, separate `sales-growth` item ID; it must not be fabricated or credited by reusing market-growth results.

## What was actually published before this correction

The actual structured bank already contained **software-scored final numbers**:
- `aqa7132-3.3-q01`, `aqa-7132-3.3.1:market-size`: a sum of four firm sales, £24.2m. Original **4-mark** source question includes method points, while the current typed-answer Practice checks only the final number.
- `aqa7132-3.3-q02`, `aqa-7132-3.3.1:market-growth`: rising market £48m→£54m, 12.5%. Original **3-mark** source question includes method points, while Practice checks only the final number.
- `aqa7132-3.3-q03` and `rev7132-recheck-3.3-recheck-market-share-01`: existing individually tagged, independently answered *option-selection* market-share calculations, not marked workings.

These are **not unscored exercises**. Earlier candidate description asserting otherwise was corrected after inspecting `fast-path-question-bank.json` and the actual `bankRecordToPractice` behaviour. The previously observed multi-mark label defect was fixed separately in **PR #749**, now merged into `main`: typed single-final-number Practice checks display **one mark**, while the source bank's original method-mark rubrics remain unchanged. This correction neither captures nor grades working and is not attributed to this Marketing PR.

## Exact bounded corrective work

| Requirement | Actual Learn | Proposed new supply | Remaining limitation |
| --- | --- | --- | --- |
| Market growth — atom 005 | `bus-mkt-002` explains market growth | **One original negative-growth** final-number task `rev7132-3.3.2-market-growth-decline-02`, genuinely different from existing positive `q02` | No independent workings or AO3 application/evaluation |
| **Sales growth — atom 006** | Adds a **firm-sales 20% vs whole-market 30%** worked method; firm share falls from 20% to 18.46% | No new scored item until source mapping is governed | **Inadequate** separately credited sales-growth practice |
| Market share — atom 007 | `bus-mkt-002` includes value/volume share, working and pitfalls | No new task; reuse existing two exact-item MCQs | Options do not establish constructed calculation or judgement |
| Market size — atom 008 | `bus-mkt-002` explains totals and summing companies | **One original inverse market-share** final-number task `rev7132-3.3.2-market-size-from-share-02`, distinct from existing summed-market `q01` | No independently marked written method, market definition or evaluation |

These two new tasks provide meaningful alternative *methods or direction of change* for the two existing tagged final-number skills, not a quota of questions. Every original scored record and evidence ID stays intact.

Machine-readable four-atom evidence ledger: `audits/2026-10-31-aqa-business-7132-marketing-measures-source-to-learner.json`. Three requirements remain **Unverified** as to overall educational adequacy and authentic learner experience; sales growth remains **Inadequate** for individually scored Practice. None is `Adequate and verified`.

## Tests, learner evidence and governance

`content/business/aqa-a-level/marketing-quantitative-assurance.test.ts` loads the *three real published Business packs*, verifies the existing original q01/q02 are already projected as final-number calculations, checks the new uniquely tagged and different scenarios, independently reconstructs £25m and −16%, checks wrong-sign rejection and observes actual Learn teaching text. Exact-head CI and real signed-in browser acceptance remain separate.

The existing Focused Learning workspace can capture the new typed final number and student confidence; this patch does **not** change the storage contract, self-assessed essays, model marking or learner planning. **PR #743 was merged into `main` during this Marketing PR's assurance**, adding bounded exact-skill calculation rechecks to existing Plan/Home infrastructure under #704/#705. That shared mechanism is outside this PR; the new Marketing items do not thereby prove valid learner-level repair, authenticated persistence, calculation method, or mastery. Real signed-in end-to-end acceptance and qualified examiner review remain open.

**Next #698 step:** Independently establish and govern a distinct sales-growth source-to-skill ID, then publish a valid separately scored sales-growth attempt and independent recheck. Verify signed-in Marketing skill evidence and Plan/Home repair using the latest merged #743 mechanism; continue per-atom educational adequacy review for the rest of §3.3.2 and all applicable sections. The already-released #749 generic mark-label correction needs no duplicate work.

**Documentation impact:** Current-source audit, this indexed technical note, source Learn correction, two original bank alternatives and three-pack regression are in the same PR. No new product feature, normative authority/ADR, database schema or historical evidence overwrite.


## Follow-up candidate — separately scored firm-sales-growth practice (31 October 2026)

**Supersedes the earlier delivery gap for source atom `BUS7132-ATOM-3.3.2-006` if this candidate merges; it does not alter the dated historic audit.** The original 42-page Founder PDF `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332` has been checked directly in the current working environment: **printed p15**, §3.3.1 separately names market and sales growth and §3.3.2 explicitly requires both to be calculated. Market growth = change in whole market sales; *sales growth* = change in **one firm's** sales. A source-led distinct identifier is now recorded in `content/business/aqa-a-level/shared/marketing-sales-growth-source.ts` as `aqa-7132-3.3.2:sales-growth`, linking candidate atom `BUS7132-ATOM-3.3.2-006` to the already published Learn node `bus-mkt-002`. This is a *reviewed source-derived extension*, **not** a claim that the historical 344-ID research list was inaccurate, edited or independently approved as a new complete denominator.

In the existing shared `marketing-quantitative-practice.ts`, two original, independently attempted **final-number only** calculations are added with the new unique `target_item_ids` source target, both including only `bus-mkt-002` as their Foundation Learn node and one **AO2 mark**: firm sales **£6m → £7.5m = 25%** while its whole market grows **40%**, then a separate retailer's own **£160,000 → £140,000 = −12.5%**, although its whole market rises **10%**. Those market-level figures are deliberate, plausible distractors, not separately credited skills. Correct worked-method feedback is revealed only after the learner submits the answer. No part of the original named-items research or original bank questions is changed, and no additional paper-specific lesson path is introduced.

The existing three Business paper `ContentPack`s import the updated shared bank without another implementation branch, schema or frontend feature. `content/business/aqa-a-level/marketing-sales-growth-assurance.test.ts` loads actual published ContentPacks, checks source-to-target identity, right/wrong/sign and market-vs-company discriminability, records compatible versioned numeric evidence, verifies a **different** unattempted question and the actual FI-001 Plan candidate for this exact skill, and rejects unverifiable/foreign-course or altered-key events. This is an automated *candidate proof*, not a complete authenticated learner/browser evidence-reload or adaptive-planning acceptance. The separate §3.3.2 target cannot inherit credit from the historical `aqa-7132-3.3.1:market-growth` target.

The scoped **dated new** audit addendum is `audits/2026-10-31-business-sales-growth-source-to-learner-addendum.json`; its status remains **Unverified** for educational adequacy and signed-in acceptance pending CI, deployment, end-to-end proof and independent subject review. The earlier assessment shortfall should be regarded as an implementation candidate correction only until its PR is released. It is still not proof of workings, interpretation, exam evaluation, retained knowledge, or mastery.

**Documentation/authority impact:** Implements existing approved Course Learning Blueprint, progress/claims policy and source/rights standard within canonical `/revision/app/` Courses → Business → Learn / Practice. No new material product capability, backend table, migration, marking algorithm, learner score, normative authority or ADR. The source-reviewed mapping record, question bank, tests, new audit addendum and this technical documentation travel together. Preserve all dated historical audits, legacy question IDs, existing learner progress and Psychology content.
