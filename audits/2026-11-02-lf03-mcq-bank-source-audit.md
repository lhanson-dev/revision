# LF-03 — AQA Psychology and Business multiple-choice bank source audit

**Date:** 2 November 2026. **Source baseline:** approved `main` `63ad63f6b2aa4835a7484e3b59b85a0a03bfdf2c` (before bounded LF-03 correction). **Scope:** actual published course-pack question generators / published Business retained structured bank, not unpublished draft PRs #773/#774. Programmes #765 and #698.

## Method, limits and priorities

Inspected source generator, published pack import and canonical Practice scoring/pool selection, followed by deterministic grouping of options ignoring ordering, keyed-position distribution and exact requirement identities. Source-derived findings are **not** teacher/editor adjudications; a proper A3 independent educational review must evaluate factual correctness, ambiguity, distractors, answer clues, exact AO demand and whether repeated questions are pedagogically useful. Historical assessment evidence is preserved. No learner's private answers were inspected.

### Priority 1 — confirmed LF-03 Psychology Social Influence defect

Four previous V1 source IDs: `psy-psy0101-check`, `psy-psy0102-check`, `psy-psy0103-check`, `psy-psy0104-check`. Repeated identical answer set in all four, despite answer order changing, and correct indexes 3,3,2,1 (D,D,C,B). Reused definition template and generic explanation. See `docs/technical/LF-03 Social Influence MCQ Validity.md` for exact questions and V2 correction. Corrected source under new question IDs; independent A3, CI/browser and production not assumed.

### Priority 2 — 15 repeated-set Psychology groups outside/including LF-03

Using the same four-option/source-prototype generator for the AQA Psychology 7182 cohort, the source audit identified these **15 repeated-option-set groups** (first group is LF-03; other 14 are separate follow-ups):

| Topic | Prototype requirements sharing identical option sets |
| --- | --- |
| Social influence | PSY-01-01, PSY-01-02, PSY-01-03, PSY-01-04 |
| Memory | PSY-02-01, PSY-02-02, PSY-02-03, PSY-02-04 |
| Attachment | PSY-03-04, PSY-03-05 |
| Approaches in Psychology | PSY-05-03, PSY-05-06 |
| Biopsychology | PSY-06-02, PSY-06-05 |
| Issues and Debates | PSY-08-01, PSY-08-04 |
| Relationships | PSY-09-01, PSY-09-02, PSY-09-03, PSY-09-04 |
| Gender | PSY-10-03, PSY-10-05 |
| Gender | PSY-10-04, PSY-10-06 |
| Cognition and Development | PSY-11-01, PSY-11-02, PSY-11-03, PSY-11-04 |
| Schizophrenia | PSY-12-01, PSY-12-05 |
| Schizophrenia | PSY-12-02, PSY-12-03 |
| Stress | PSY-14-02, PSY-14-05 |
| Aggression | PSY-15-02, PSY-15-03, PSY-15-05 |
| Forensic Psychology | PSY-16-01, PSY-16-02, PSY-16-03, PSY-16-04 |

These 15 *groups* do **not** imply 15 invalid factual answer keys or 15 course specification gaps. The Psychology course contains 118 source-prototype requirements and 117 source §4 parent bullets; some requirements combine/split AQA rows and one concept label has a special parser override. Every old question has the same generic first-definition recognition format. In generated order, the Research Methods topic contains a four-same-position run and Relationships contains three A answers; this indicates session-pattern review, not an assumption that adaptive selection always presents that order.

**Bounded follow-up:** separately assess and replace the 14 other repetitive groups, prioritising small-topic four-question sets, with fresh unique IDs when answer meaning changes, educational review and saved-checkpoint handling. Do not bundle into LF-03 or overwrite existing #698 questions.

### Priority 3 — Business original structured bank correct-answer concentration

`content/business/aqa-a-level/shared/fast-path-question-bank.json` contains 231 authored records, of which 59 are MCQs. Source count by marked correct letter: **A 40, B 12, C 7, D 0** (40/59 = 67.8% at A). No repeated exact four-option-set fingerprints were found among those 59. These 59 are only the *retained structured bank*, not all AQA Business pack and slice/imported MCQs. Another 4 original recheck MCQs in `source-mapped-recheck-questions.json` have three B and one A. The pack also includes `content/business/aqa-a-level/shared/questions.ts` and original content-factory slice questions; they form a broader review queue. Any rekeying for existing scored Business IDs must use versioned item identity or explicit immutable option-index mapping; do not silently rewrite past answers. No mass answer shuffling proposed.

**Bounded follow-up:** run a full published-integrated Business bank and course-pack review queue by exact IDs; subject expert check key correctness, distractor plausibility, misleading wording and option length, and assess actual session selection before separately reauthoring the biased cohort.

### Additional quality classes and evidence limits

| Class | Deterministic check | Qualitative exception/status |
| --- | --- | --- |
| Identical option multisets, verbatim/near duplicate stems | implemented `lf03-mcq-quality.ts` and both-course tests, item-ID queue | Some legitimate reinforcement may be intentional |
| Invalid key, duplicate option text | implemented as blocking deterministic findings | Cannot detect a factually wrong *in-range* key |
| Long correct-position runs, ≥60% position skew at n≥12 | implemented as review-only signals | Observed bank skew; actual adaptive session selection still needs browser acceptance |
| Excessive answer length | review-only correct option >2.5× every distractor | No proof that a longer answer is a clue |
| Generic feedback | check for known template, route to review | Explanations may be inadequate without matching literal template |
| Multiple valid answers, subject-truth/key errors, implausible distractors, mapping fidelity | human/independent subject A3 review required | **NOT exhaustively independently adjudicated** |
| Exam application/analysis/evaluation demand vs AO mapping | source and subject review required | Untagged course-pack MCQs only produce topic-level scored evidence; no individual-item competence claim |
| Historical learner evidence affected counts | authenticated owner-scoped backend required | **Unknown, not inspected** |

**Audit disposition:** Scope of the *deterministic source-pattern audit* recorded, LF-03 targeted correction candidate; wider substantive item-level educational review and remedial PRs are **OPEN, bounded exceptions**, not silently certified as passed. Post-release acceptance / production evidence remains pending.
