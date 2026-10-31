# Issue #698 — Psychology 7182 exact-version source-first section and inferential-testing audit

**State:** provisional, source-first audit candidate; NOT a full-course or section adequacy pass. **Source:** exact 38-page Founder-supplied AQA A-level Psychology 7182 v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. Printed PDF pp17–24 section 4 and p21 §4.2.3.3 directly inspected. AQA content remains **REFERENCE_ONLY**, no protected source text or exam questions reproduced. The technical learner runtime is `/revision/app/`, publishing the actual `content/psychology/aqa-a-level/paper-*/index.ts` shared course packs.

## Independently observed source scope

The 17 section-to-topic locations recorded in `scripts/assurance/data/aqa-psychology-7182-source-first-review.json` consist of **eight compulsory** headings and the **nine Paper 3 options** in exactly three groups of three. Students select one from each group. This is a source-structure map and NOT a full independent atom inventory; extra named studies, mathematical annex sections, assessment objectives, holistic research/practical demands and exam-response modes have **not** all been decomposed or assured.

## Bounded §4.2.3.3 decomposition

Rather than treating prototype `PSY-07-32`, `PSY-07-33` and `PSY-07-34` as three complete independently testable source items, the source-first pass identifies **17 separately observable candidate skills**: inferential-testing purpose; sign-test selection and calculation; significance/probability; table and critical-value interpretation; Type I and Type II errors; experimental design and measurement-level choice; and selection of each of the seven named other tests. This is an audit breakdown, not a final denominator.

Each candidate records the printed source locator and concrete existing Learn page candidate ID, one or more actual published Psychology MCQ candidates if present, independently required evidence mode and explicit **unverified** educational and authenticated acceptance states. This audit does not promote a generic course-pack MCQ, unscored DataDrill or self-marked exam answer to an independently verified skill pass. No automated marking reliability, source completeness or learner mastery is claimed.

**Observed supply distinctions on approved main at audit start:**
- Real Learn pages `research-methods-psy0732`, `research-methods-psy0733`, `research-methods-psy0734` are published. Their presence does not establish completeness or correctness.
- `psy-rm-applied-sign-test-01` asks for recognition of effective n and S, rather than a typed independently scored statistic; original follow-on calculation publication is separately proposed in draft PR #746 and is not assumed live.
- Seven original `psy-rm-select-*-01` MCQs ask learners to choose a named test from unseen scenarios. The question responses are topic-level and cannot be credited as exact persistent AQA source-atom observations merely because this audit identifies their relevance.
- `psy-rm-type-i-error-01` and `psy-rm-type-ii-error-01` distinguish error types. They cannot prove independent extended explanation.
- A separate `psy-rm-applied-spearman-01` question supplies a critical value; recognising the correct conclusion does not prove an independent table lookup or a robust explanation of the decision rule.
- Real exam simulations and 27 Paper 3 combinations are structurally covered in existing content tests, but authenticated option-persistence and end-to-end examination marking/recommendation acceptance remain open.

## Repeatable assurance and next steps

`scripts/assurance/aqa-psychology-7182-source-first-review.test.ts` uses all three actual published learner packs to verify the 17 section-topic identities, the 8+3+3+3 partition, the actual Learn page IDs and question candidate IDs, and the explicit false completion gates. It is a machine-checkable *candidate presence and absence* test only.

Next, finish independent atomic decomposition of the rest of section 4 and the mathematical annex and scheme of assessment, join each atom to *read* teaching and valid learner response evidence, and correct absent or inadequate educational content in bounded content PRs. Distinguish source scope, teach sufficiency, independently demonstrated skill, genuine learner retest and actual signed-in production acceptance. Coordinate #704/#705 improvements instead of inventing a second learning-loop architecture. Independent subject/assessment specialist sign-off remains mandatory for full-assurance claims.

**Documentation impact:** This technical audit note, reusable JSON register, test and INDEX pointer belong to the same governed PR. No normative authority, content, learner feature, grading, schema, deployment or learner data changed. Do not rewrite historical audits. Separate Business work remains independent. Each merge needs its own explicit Founder approval.
