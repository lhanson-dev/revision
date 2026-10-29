# Issue #698 — Four verified published Business single-item alternatives for #705 independent retesting

**Status:** Candidate (not released, not independently expert-assured). Date: 29 October 2026. Owner: Business content assurance / learner evidence.  
**Course/source:** AQA A-level Business **7132**, specification v2.0 (14 June 2023), user-pinned 42-page source and official AQA authority. The official specification is treated as **REFERENCE_ONLY** for curriculum/examination facts. The authored question material below is entirely new Revision content, not official AQA questions or reproduced mark schemes. Original user-uploaded PDF binary equivalence/individual SHA remains unverified in this content PR.

**Existing operational baseline:** #712 saved precise objectively scored single-target evidence; #716 produced one evidence-led Plan/Home/REV candidate and refused a pseudo-independent retest when only one authored question existed. Existing `fast-path-question-bank.json` had 231 questions of which 59 software-scored one-item MCQs mapped to **59 different specification IDs**; those 59 alone cannot independently recheck the same item. Original slice records, if any, remain intact.

## Bounded content correction — four different genuine assessment opportunities

| AQA specification item already present in existing approved source map | Original source bank task | New Revision-authored published assessment ID | Different tested task |
| --- | --- | --- | --- |
| `aqa-7132-3.3.1:market-share` → `bus-mkt-002` | `aqa7132-3.3-q03` | `rev7132-recheck-3.3-recheck-market-share-01` | Derive market share by value from £6.3m out of £45m (14%) in a new cycling context |
| `aqa-7132-3.4.2:capacity-utilisation` → `bus-ops-003` | `aqa7132-3.4-q07` | `rev7132-recheck-3.4-recheck-capacity-01` | Derive 65% utilisation from 5,850 of 9,000 maximum meals in a new food-production context |
| `aqa-7132-3.7.2:payables-days` → `bus-fin-013` | `aqa7132-3.7-q18` | `rev7132-recheck-3.7-recheck-payables-01` | Apply £54k/£657k × 365 = 30 days in a new lighting-manufacturer context |
| `aqa-7132-3.10.3:critical-path` → `bus-evi-008` | `aqa7132-3.10-q02` | `rev7132-recheck-3.10-recheck-critical-path-01` | Calculate three linked project path durations (13, 12, 12 days) and choose the actual longest critical route |

The new choices are **different from the prior question in context, stem, options and cognitive job**. These are software-marked one-option objective checks: they can supply exactly **one raw item observation** per answer, with student confidence preserved. The critical-path question uses specified full route durations and does not assert evidence that a student has drawn or independently amended a diagram. Likewise numeric MCQs cannot substitute for open typed calculation, showing workings or writing a full exam answer. Their status is *internally arithmetic/answer-key checked, pending independent educational review*, not externally calibrated.

**Placement:** Four authored records in `content/business/aqa-a-level/shared/source-mapped-recheck-questions.json`, imported once into `fast-path-questions.ts` alongside *untouched* previously accepted bank and original-slice data. The existing `contentPackSchema` publishes the combined bank across all three Business packs using the same canonical `/revision/app/` Course Practice adapter. New stable IDs are namespace-separated to preserve all old learner answer histories and prevent retry-ID collisions. No parallel practice engine, database, paid gating, provider call or new scoring rule.

## Executable assurance

The same-PR `src/app/business-authored-recheck-supply.test.ts`:
- Asserts all four new records validate against the existing structured-bank schema and appear in **every published Business paper pack** with unique identities and identical exact target IDs/node IDs.
- Checks independent arithmetic results (14%, 65%, 30 days, 13-day critical path), keyed options and four worked feedback explanations, not simply trusting a stored correct key.
- Verifies old/new question context, stem, answers and ID are **different**, and a real saved incorrect first-item result selects the other **published** question with matching item identity. This is not the earlier synthetic duplicate-question fixture.
- Drives an authentic published-catalogue, source-backed scored miss into a single FI-001 Plan candidate, the exact Home focused Start and a separately scored correct answer that withdraws the targeted recheck; raw item result is not automatically mastery.
- Requires existing full static/unit/build, Auth, RLS, responsive browser and unchanged Business/Psychology frozen-plan assurance before any merge. CI is **not** independent expert academic sign-off or a real student's acceptance.

## Outstanding obligations

- Four valid alternatives do not imply 344 independently taught or independently tested Business obligations, sufficient broader assessment breadth, adequate mixed practice, exam evaluation, or 7182 Psychology option-specific parity.
- The published 231-item snapshot's 59 one-item targets are only a limited denominator; this PR creates **at most four** additional independent-target opportunities where no other distinct asset has already been authored. Future source-first inventory must count the complete actual adapter, deduplicate questions and qualify content quality.
- #698 remains OPEN pending actual version-bound atomic obligation ledger, full teaching depth, all AQA skills, qualified independent subject assurance and live learner acceptance. #705/#703 remain OPEN pending complete repeated assessment and end-to-end student proof; #694 keeps exam-horizon work/capacity; #693 keeps signup SMTP.
- Do not count a single right answer, even on a fresh check, as proof of mastery. A lack of a second independently authored eligible question remains a **content-supply gap**, not a forced repeat or schedule debt.

**Documentation-impact check:** this is a content-and-source adapter ingestion change, with a same-PR technical evidence record, tests and INDEX locator. No normative authority modification, historical evidence rewriting or irreversible schema migration.
