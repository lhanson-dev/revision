# Issue #698 — Psychology 7182 sign-test assessed calculation correction

**Status:** Candidate governed branch, not merged or live. **Source:** Founder-supplied AQA A-level Psychology 7182 version 1.4 (1 September 2025), printed p21 §4.2.3.3; mathematical annex pp35–37 §7.2. Source is **REFERENCE_ONLY**. No AQA text, past questions or mark schemes have been reproduced.

## Verified gap and correction
The current shared Psychology content contains a sign-test worked DataDrill and an automatically scored recognition MCQ. Those do not establish that a learner can *independently enter* the calculated sign-test statistic. Two new original paired-score problems, `rev7182-4.2.3-sign-test-01` and `rev7182-4.2.3-sign-test-02`, supply different data, include tied values, and independently compute the smaller sign count S (2 and 1). The source-linked single target is `PSY-07-32`; each case has worked feedback.

Both use the existing automatically checked one-mark numerical Practice adapter and existing Psychology Research Methods topic. Source `content/psychology/aqa-a-level/shared/sign-test-practice.ts` is shared across the three already published paper packs; Learn, exams, planner, schema, database and stable existing content identities are unchanged. The runtime remains `/revision/app/`.

## Assurance and limitations
Arithmetic is executable in `sign-test-practice.test.ts` with independent reconstruction of plus, minus and tied counts, exact per-question source mapping and conversion to real paper-pack Practice. A saved final-number observation must **not** be treated as written method evidence, test-selection reasoning, significance interpretation, durable mastery, actual later retest or confirmed signed-in student acceptance. Cross-question identity permits later rechecking, but full #704/#705 repair and progress integration remains open.

This bounded correction is not the entire Psychology course audit. The provisional 118 Course Truth records remain unverified as a complete atomic requirement denominator. Independent specialist subject/assessment judgement and student-site acceptance are still outstanding.

**Documentation impact:** Technical implementation note and INDEX pointer added alongside content and tests. Existing approved Course Learning Blueprint, Claims and Progress Governance and source-licensing authority are not changed. Historical audits remain unchanged. The programme remains under #698 and #703; no feature-ready decision, new schema, licensing decision, ADR or migration is required.
