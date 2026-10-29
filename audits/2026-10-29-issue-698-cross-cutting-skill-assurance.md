# Issue #698 — source-first cross-cutting skill assurance checkpoint (29 October 2026)

**Scope:** AQA A-level Business 7132 v2.0 June 2023 and AQA A-level Psychology 7182 v1.4 September 2025. **Classification:** independent audit/checklist evidence, not curriculum product authority or published learner content. Source texts are REFERENCE_ONLY; only concise Revision-written requirement labels and page locators are stored.

## Result

- Existing mapped inventory: **344** AQA 7132 named items over **42** sections; existing Psychology Course Truth holds **118** records across **17** published topics (8 compulsory, 9 potential options; one from each option group applies).
- Newly enumerated **53 distinct cross-cutting assurance assertions** directly inspected from both official specifications: 13 broad Business decision-making expectations, 9 Business mathematical competencies, 6 cross-topic Psychology investigation/synoptic competencies, and 25 Psychology A-level mathematics competencies.
- These **are not added as 53 new disjoint syllabus topics**. They may overlap named content items. They serve as a second, independent constraint on course completeness and are intentionally **UNVERIFIED** in three columns: adequate teaching, demonstrated practice/marking, and actual hosted learner acceptance. No false 100% headline.
- The companion Vitest test asserts each of the **118 Psychology** existing Course Truth IDs reaches an actual published Learn page, flashcard and recognition MCQ in **each of the three current ContentPacks**, and that the bound Research Methods scored additions and ungraded drills are present. These are real *existence/binding* checks, not proof that any content is accurate or that a learner can produce a written answer.
- Existing `scripts/assurance/aqa-7132-learner-crosswalk.mjs` is the structural Business 344-item map and already distinguishes self-check, scored questions and marker-dependent written questions. Do not duplicate or rewrite it. Its source ID mappings are candidates for independent semantic review, never proof.

## High-risk exact-source assurance findings (OPEN, not cleared)

1. **Psychology maths — standard deviation:** AQA 7182 v1.4 A-level mathematical annex, printed p36, explicitly includes *calculating* standard deviation, while core Research Methods content mainly references descriptive understanding. Any conflict/ambiguity previously noted in research or draft PR #700 must be assessed against this actual annex demand and the real learner's written or numeric response capability. No course-level scored, answer-reconstructed calculation of SD is independently demonstrated by the recently released nine test-choice MCQs. **Status: learning/practice adequacy unverified.**
2. **Graph construction:** AQA 7132 Annex p41 and AQA 7182 A-level Annex pp35/37 require constructing or plotting graphs. Identifying a correct bar height in an MCQ, or revealing a suggested hand-drawn solution, cannot prove a graph was independently constructed or assessed. **Status: constructed-performance evidence unverified** on both courses.
3. **Psychology inferential choice:** #710 now includes nine scored recognition-case items and an ungraded on-paper justification exercise. Selection recognition is improved; unmarked justification and independent written selection reasoning remain **not verified as graded skill**.
4. **Psychology research conduct:** AQA 7182 cross-paper requirements describe designing, conducting, analysing and ethical risk management. A written description of a design may help; it does not prove practical execution. **Status: genuine performance evidence unverified.**
5. **Business AO4 decisions:** The cross-topic Business specification expects evidence-informed evaluation and proposals, across cases and quantitative/qualitative formats. A flashcard or generic self-check is insufficient by itself; inspect exact case stimuli, response modes, rubrics and student evidence per obligation.

## Acceptance and next execution

All **six** course-by-gate outcomes remain open under [Issue #698](https://github.com/lhanson-dev/revision/issues/698): independently adequate Learn, capability-valid Practice, and hosted authenticated learner acceptance for Business **and** Psychology. Source-first requirement atomicisation must still reconcile every relevant numbered section and *compound* demand directly with the exact user-supplied PDF versions. Do not multiply existing mapping counts by these overlapping assertions to generate a denominator.

Next repair slices must be chosen from actual failed semantic/skill findings, not asset quotas. Priority: accurately taught and assessed SD calculation, graph construction plus response evidence, extended exam writing/marking validity, option-aware Progress, then authenticated hosted assessment-to-plan improvement. Preserve existing evidence identities and privacy. PR-specific Founder approval precedes each governed merge.

**Documentation-impact check:** adds a source audit, regression tests and machine-readable audit assertions only; no user-facing feature or normative authority changed, so no product-authority/ADR edit or historical evidence rewrite. Source URLs and SHA pins reuse the existing approved reference manifest.
