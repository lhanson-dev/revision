# Board-shape preflight: second-board Business and GCSE science

**Recorded:** 22 October 2026  
**Classification:** Research/qualification-shape evidence, not Foundation approval or normative policy  
**Repository base:** approved `main` `df1adc5b7fd49d52a78f8c5651977a1077ebf118`; working proof on draft PR #659  
**Execution boundary:** provider-free, original fictional test questions, no real course asset generation, no live learner publication

## Questions tested

1. Can the existing typed learner-content storage model preserve what makes a **second Business exam board** academically different even when broad subject knowledge is reusable?
2. Can it represent **GCSE tier, paper/topic separation, required practicals and mathematical/application demands** without quietly losing crucial metadata?
3. If not, what is the smallest **upstream intake/Exam Truth check** needed before investing in a full course?

### Official publisher references consulted for *manual structural alignment*, not AI source input

These are official verification entry points only. **Do not treat their publicly accessible text as OPEN, licensed learner prose or permitted model-worker input.** Until the governed Source Licence Register classifies an exact source/version and its proposed operation, treat substantial publisher wording as `REFERENCE_ONLY` and do not copy it into generated teaching or marking assets.

**Pearson Edexcel A level Business (9BS0):**
- Current qualification landing page: https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/business-2015.html
- 19 August 2026 assessment support: https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/business-2015/teaching-support/news..html?article=%2Fcontent%2Fdemo%2Fen%2Fnews-policy%2Fsubject-updates%2Fbusiness%2Fgce-business-assessment-support&pageTypes=
- October 2026 update (assessment contexts from summer 2027): https://qualifications.pearson.com/en/news-policy/subject-updates/business/october-2026-business-update.html
- Publisher confirms **three 100-raw-mark components, with qualification weightings 35% / 35% / 30%**, and a pre-released-context component. A 2027 change concerns anonymising real names/adapting supporting context data; it does not authorise ingesting protected source wording or invent a change in tested skills.

**AQA GCSE Biology (8461):**
- Current subject specification: https://www.aqa.org.uk/subjects/biology/gcse/biology-8461/specification
- Subject content: https://www.aqa.org.uk/subjects/biology/gcse/biology-8461/specification/subject-content
- Scheme of assessment: https://www.aqa.org.uk/subjects/biology/gcse/biology-8461/specification/scheme-of-assessment
- Practical assessment: https://www.aqa.org.uk/subjects/biology/gcse/biology-8461/specification/practical-assessment
- AQA's own cross-board assessment description: https://www.aqa.org.uk/resources/science/gcse/biology/plan/switching-to-aqa-from-ocr
- AQA identifies **Foundation and Higher**, **two 100-mark/105-minute components**, separate per-paper topic coverage, **10 required practical activities**, and written examination assessment of practical knowledge accounting for **at least 15%** of overall marks; higher-tier-only requirements also exist. These high-level alignment facts must be reconciled to the exact current cohort and official source universe before they become production Course or Exam Truth.

## Executable provider-free proof

`src/content-factory/qualification-shape-cross-board-probe.test.ts` contains original synthetic, **planned-only** course/paper/question records shaped to stress the differences. These are not copied board questions or purported exam mocks.

| Probe | Existing schema behaviour being characterised | Production consequence |
| --- | --- | --- |
| B1: equal raw marks, unequal qualification weightings | `contentManifestSchema` retains per-paper raw mark total, but drops an extra `qualificationWeightPercent` field | Raw mark total cannot prove qualification weighting. Independently governed Exam Truth or a validated projection must own that relationship. |
| B2: pre-released context | An extra `preReleaseContextCohort` field on the paper manifest is dropped | Cohort-specific assessment resources/rights/currentness need an explicit upstream mapping/check. |
| B3: paper-specific subjects | `contentPackSchema` tests topic membership of the **course**, not topic eligibility for the **particular paper** | A valid subject/topic can still be attributed to the wrong paper. Exact Exam Truth must prevent this. |
| G1: tier and practical identity | An extra `tier` or `requiredPracticalIds` field in a paper manifest is dropped | A structurally valid GCSE pack does not prove tier eligibility or practical coverage. |
| G2: higher-only learning node | An extra `higherTierOnly` annotation on a topic is dropped | Tier-specific content must be retained and verified through an explicit governed requirement model. |
| G3: paper-to-topic mapping | A course-valid topic is accepted on a fictional paper for which its test profile declared that topic out of scope | Wrong paper allocation is not caught by the generic schema. |
| G4: practical-mark share | A structurally valid mock with no practical demand is accepted | Whole-course practical assessment obligations cannot be inferred from total marks. |
| G5: AO2-context coherence | AO2 mark allocation can be schema-valid without an item-level scenario | Question-family stimulus and rubric coherence needs a separate contract; shared paper case context must also be considered, not blanket item-level stimulus requirements. |

**Critical interpretation:** These are *limitations of the typed learner pack schema*, not proof that existing higher-level Foundation or Exam Truth models have no way to capture the requirement. Do not add every qualification fact to `content/schema.ts` simply because a field was stripped. Prove where that information should live, how its source/rights are established, and how downstream publication can validate that it has not been lost.

## Root-cause analysis and smallest remedy proposal

The most expensive mistake would be to generate an entire new course and only then realise that its **governed qualification-shape requirements were not carried into the published course**.

### Proposed next smallest action

Create a small **pre-production qualification projection completeness checker**, reading rights-safe approved structured Course/Exam Truth plus the actual candidate course pack. It must:
- report missing compulsory academic dimensions before generation/publishing: course/cohort, required components, optional choice semantics, tier/variant, component-topic eligibility, applicable practical/quantitative quotas, and relevant component weightings;
- require explicit `not_applicable` determinations with reasons, not merely blank/default values;
- fail `UNSUPPORTED` instead of silently accepting erased fields or guessing a new schema;
- leave the immutable Approved Foundation/asset release gates, qualified educational review, and Founder merge approval unchanged;
- be tested first with these two minimal synthetic profiles and deliberately malformed versions.

This is a **proposal**, not approval to wire a new validator into production. Its generic scope and impact on existing gates require an explicit implementation decision; any user-visible product feature remains subject to its normal Ready approval.

## Trial status and limits

- [x] Current approved-main repository read and governing authority compared.
- [x] Current board-specific **structural** facts cross-checked against official publisher websites at this point in time.
- [x] Synthetic test specimens committed to draft PR #659.
- [ ] New PR-head CI confirms all characterisation assertions and existing regressions pass.
- [ ] Separate official Source Universe, current-course/cohort, licence and Rights Register intake — **not started**.
- [ ] Authorised Foundation/Exam Truth production for either new course — **not started**.
- [ ] Generic candidate projection completeness checker implemented and separately qualified — **not started**.
- [ ] Actual end-to-end full course, independent educational/marking assurance, human expert review, student journey and total cost/time measurements — **not started**.

## Documentation impact

Research evidence and executable non-publishing tests only. No existing normative Content Factory standard, experimental Source-First exception, learner course manifests, content source permissions, technical implementation documentation or historical audit is changed. If the projection-checker proposal is accepted, implement it on its own governed branch/PR together with technical documentation and appropriate same-head tests.
