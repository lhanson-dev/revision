# Issue #765 LF-03 — original Psychology Social Influence MCQ validity correction

**Status: candidate; not independently A3-assured or live until reviewed, Founder-approved and deployed.**  
**Parent programme:** #698, coordination #703/#704/#705. **Exact source:** Founder-supplied AQA Psychology 7182, version 1.4 (1 September 2025), printed §4.1.1 p17; source PDF SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. Rights: **REFERENCE_ONLY**. These are Revision-authored choices, not AQA questions or protected wording.

## Verified defect and canonical runtime

Actual React learner route is `/revision/app/` → signed-in Courses → Psychology → Practice. The published 118-item shared course adapter `content/psychology/aqa-a-level/shared/course.ts` builds four original Social Influence topic-level one-mark questions (`psy-psy0101-check` through `psy-psy0104-check`) by selecting distractors from *the other three* source-truth requirement names. This produces four permutations of **the same four text options**. At the inspected approved-main baseline, correct indices were **3, 3, 2, 1**. That makes selection by repeated-option patterns disproportionately easy and corroborates the learner's report. These four existing pack questions are NOT the eight new distinct scenario-bank items in draft PR #773.

## Bounded change

Preserve the four original question IDs, Course Truth definition stems, correct concept labels and one-mark topic-only evidence contract. Replace the recycled distractors with twelve original, conceptually separate, source-related alternatives authored specifically for each stem. Set correct positions to **1, 3, 0, 2**: each of A, B, C and D occurs once. This is not a generic random shuffle, new practice engine, alternative course, schema migration or marking-provenance change.

The new `social-influence-original-mcqs.ts` supplies only this four-question exception. All other 114 generated course-level MCQs follow the same existing generator. The paired test asserts every item exists in all three actual published Psychology packs, original IDs and keyed concepts are intact, sixteen displayed option texts are distinct, four option sets do not repeat, positions are distributed and the adapter still attributes no unsupported exact specification skill observations.

Student-owned scored evidence remains associated with the original stable question and topic IDs. The existing versioned saved-Practice checkpoint fingerprint rejects a resumed question set with changed content; it must not replay a previously selected letter against the new order. Authenticated resume/reload acceptance remains an explicit release gate.

## CI/regression finding and correction

The first full PR #778 foundation job in [CI run 41418731700](https://github.com/lhanson-dev/revision/actions/runs/41418731700) failed on one existing test in `content/psychology/aqa-a-level/content.test.ts`. That test required **every** distractor in all 118 generated questions to equal one of the other parent-requirement headline labels — the exact design constraint responsible for LF-03's repeated four-option menu. The new dedicated LF-03 tests themselves passed in that run. The existing full-course test has therefore been narrowed **only for these four named IDs** to assert the explicitly authored options and keyed correctness; its unchanged source-label constraint continues to apply to the other 114 generated questions. The failing CI outcome remains recorded historically and a new exact-head full suite must pass.

## Educational/evidence boundary

The four questions remain **single-concept recognition**, not independent demonstration of AQA AO2 application, AO3 evaluation, extended explanation, an individual specification subskill, or Social Influence mastery. Draft PR #773 is a *separate* eight-scenario/four-self-check educational addition and itself requires independent A3 review via proposed reviewer PR #774. Neither the #773 reviewer nor earlier A2 Learn assurance automatically validates these four updated original questions.

Before merge: full exact-head current-main CI; fresh independent A3 review of all four keys, plausible distractors, scope and the learner inference boundary; test the real canonical Practice and saved-checkpoint recovery including changed answer indices. If findings are material, correct and re-review rather than counting green TypeScript as educational assurance. Issue #698 and LF-03 remain open until those checks and deployment evidence are recorded.

## Documentation impact

This note and the INDEX pointer are the current technical record; no normative product or claims rule changes, no database migration, no historical audit edits. Preserve all existing learner evidence and previous question identities. Release status must be recorded in #765 and #698 only after actual acceptance.
