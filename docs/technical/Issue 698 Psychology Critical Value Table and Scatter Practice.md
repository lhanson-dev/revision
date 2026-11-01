# Issue #698 — Psychology 7182 statistical-table lookup and scatter construction

**Status:** DRAFT CANDIDATE / NOT LIVE. Dated fresh-context A2/A3 review for original PR head `029c95b36a842349297830447115fecdaf991aba` PASSED on 1 November 2026 (5 items, 8 dimensions, no findings); [historical evidence](../../audits/2026-11-01-pr759-original-a3-review.md). Any later head requires fresh integration/assurance and explicit Founder approval. This scoped review is not complete educational or student acceptance. **Source:** exact Founder-supplied AQA 7182 v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, §4.2.3.3 printed p21 and Annex §7.2 printed pp35–37. Rights classification **REFERENCE_ONLY**. Questions, example dataset and binomial-generated reference table are original Revision material.

## Published-surface candidate

Canonical learner route: `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7182/practice`. Existing typed content adapters ingest all three `content/psychology/aqa-a-level/paper-*/index.ts` packs, which import shared Research Methods assets. This proposal introduces no bespoke learner application pathway or new feature; it reuses the approved one-number checker and self-marked DataDrills.

Three original one-mark, strictly integer scored critical-value **lookup** activities use an explicitly labelled two-tailed sign-test table for effective n=8–12 and 5%/1% levels. The table is computed from exact binomial sign-test probabilities. Learners identify the critical S value from a table row/column, rather than having the critical value pre-supplied as in the earlier Spearman multiple-choice question. Different cases show significant and non-significant outcomes **only in feedback**. Each new scored question targets **only** `PSY-SRC-4233-IT05` and Annex `PSY-MATH-72-24` as a candidate skill overlap, *not* the distinct significance decision `IT06` or independent statistical reasoning, method steps or enduring mastery.

One on-paper self-marked table interpretation/explanation exercise and one on-paper self-marked five-point scatterplot construction/interpretation exercise are added under the same existing Research Methods topic. No software-scored or teacher-verified graph construction is claimed; `PSY-MATH-72-32` remains unverified as independently demonstrated. Existing question IDs, Learn, Exam Prep, learner evidence, planning and persistence are unchanged. No database migration.

## Preserved historical evidence and proposed additive mapping

The approved-main 32-maths-skill and 17-inferential-capability source-audit JSON snapshots from PR #758 / previous source review remain historically unchanged, including their earlier missing-candidate and `unverified` fields. This branch adds `scripts/assurance/data/aqa-psychology-7182-pr759-proposed-practice-addendum.json` and a dedicated test that link **proposed** scoped candidate assets to `PSY-SRC-4233-IT05`, `PSY-SRC-4233-IT06`, `PSY-MATH-72-24` and `PSY-MATH-72-32`. This is explicitly prospective, not source-to-live acceptance or a retroactive assertion that those assets existed at the prior audit.

## Assurance and risks

Deterministic test reconstructs the critical table and three numeric cases from exact binomial sums, validates each new ID in all three course packs, checks actual one-mark single-number adapter and discrete integer rules, and confirms the graph exercise is not misrepresented as scored. This test alone is **not** A3 independent review, authenticated learner acceptance, or real student understanding.

**HOLD until:** revalidate the refreshed exact PR head in current-main CI (including signup/database/build/browser), obtain a fresh exact-head reviewer receipt for the unchanged source assets, resolve any material findings, and verify exact-head current-main integration. A previous independent A2/A3 pass is retained as dated historical evidence rather than silently promoted to an unreviewed later head. This draft must not be merged without separate specific Founder approval. Full #698 §4 + optional-group atomic crosswalk, all 32 maths skills, #703 real learner acceptance, #704/#705 independent repairs and retests and qualified subject review remain open.

**Documentation impact:** This same-branch technical note and INDEX pointer describe implementation proposal. Approved normative authority is unchanged, no ADR/schema/migration or history rewrite; future educational findings must be appended or recorded as dated evidence, not silently labelled passed.
