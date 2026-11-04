# #787 / LF-03 — AQA Psychology 7182 Relationships V2 Practice correction

**Implementation status:** Draft candidate on governed branch. **NOT merged, released or original-learner accepted.** Independent source-blob educational A3 key/distractor and separate feedback challenge passed on 3 November 2026; integrated-head CI and release remain outstanding. Existing #787/#765/#698 remain the owners; this is not a new content programme.

## Canonical learner entry and rights

Learner route: `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7182/practice/relationships`. The existing `Practice` question selector uses the shared `psychologyQuestions` records in `content/psychology/aqa-a-level/shared/course.ts`, which are published in the three paper content packs. Topic Relationships is a selectable **Paper 3 Option 1**, not an independent fourth paper.

Source: Founder-supplied official AQA A-level Psychology 7182 specification **v1.4 (1 September 2025)**, §4.3.2, 4 printed source bullets, PDF SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. Rights classification `REFERENCE_ONLY`; candidate scenarios, distractors and guidance are original Revision wording and do not reproduce exam-board materials. Approved Course Truth topic-09 supplies source-grounded concept, evaluation and limitations; its existence is not independent educational validation.

## Confirmed reported fault and proposed correction

The old authored source prototype used **four identical answer-option multisets** with minor changes to stem and correct index for source requirements `PSY-09-01` through `PSY-09-04`. That permits repeated concept-label recognition instead of demonstrating distinct case understanding.

One original, scenario-based and one-mark software-scored single-best-answer decision per source bullet replaces each old concept-template item:

| Requirement | New identity | Correct choice (0-based) | Exact narrow decision |
| --- | --- | ---: | --- |
| PSY-09-01 Attraction and filters | `psy-psy0901-check-v2` | 2 | Contact opportunity, similar attitudes and reciprocal disclosure versus competing relationship theories |
| PSY-09-02 Relationship accounts | `psy-psy0902-check-v2` | 0 | Investment model commitment despite dissatisfaction and perceived poor alternatives |
| PSY-09-03 Online relationships | `psy-psy0903-check-v2` | 3 | Altered online gating and truthful selective self-presentation versus deception |
| PSY-09-04 Parasocial relationships | `psy-psy0904-check-v2` | 1 | One-sided parasocial bond without inferring pathology, dependency or attachment diagnosis |

Each question has four distinct contextual options and model-authored feedback that addresses why the other mechanisms are not established. Option character-length max/min in the draft is below 1.15; this is a deterministic guard, **not proof of plausible distractors, correctness, exam fidelity or actual psychometric discrimination**. The four original parent bullets collectively cover more than these four decisions (for example Duck's phase model, absorption-addiction and attachment explanations); an answer must not be represented as independent mastery of every subskill.

## Learner history and adaptive planning safeguards

- Four new `-v2` identities. The former `psy-psy0901-check`…`psy-psy0904-check` records remain unchanged in historic scores and saved selected-option/key data.
- Old V1 outcomes are removed **only from new understanding/readiness inference**, limited to actual Psychology AQA 7182 module IDs. Raw marks, old progress history and unrelated courses remain untouched.
- A *previously saved* four-item V1 session can be resumed using the exact former four-item content fingerprint through `legacyRelationshipsPool` and the existing exact-fingerprint recovery code. Unknown fingerprints, course/topic mismatches and partially altered pools fail closed; V1 cannot appear in fresh Practice.
- No DB migration, account bypass, new grading provider, new question engine, generic recommendation system or source/course taxonomy change.

## Acceptance evidence and outstanding gates

Deterministic candidate tests in `relationships-mcq-v2.test.ts` cover all three real course packs; exact source crosswalk, keys, no repeated option multisets, option length and explanation specificity; old historic evidence and scoped non-inference; current V2 evidence; old precise checkpoint recovery and unknown mismatch. The actual authenticated synthetic canonical Practice route checks every keyed answer, score append, reload and continuation across desktop/tablet/phone in `psychology-restricted-pilot-route.spec.ts`. Source-to-Learn checks remain intact. Updated `lf03-mcq-quality.test.ts` removes only this proven repeated-option cohort from its fixed unresolved queue and retains the other two large unsolved four-item cohorts.

**Remaining before merge:** fresh integrated-head full CI including responsive/DB/RLS/Auth; verify unchanged A3-reviewed source blob and previously accepted blind keys plus separate adverse feedback receipt; optional qualified educator review where necessary; **explicit separate Founder merge approval**. Release and original learner's observation are further gates.

**Further #787 risk:** Other Psychology option-set groups, generic feedback and the Business 59-item A=40/B=12/C=7/D=0 retained source-position bias remain OPEN. This package does not close either bank, #787 or LF-03. Do not claim production readiness or complete educational adequacy based on this four-item patch.

## Documentation impact

Existing Course Learning Blueprint and Claims and Progress Governance already prohibit unsupported mastery claims; no normative amendment is proposed. Implemented source, technical note, regression and INDEX update belong on the same governed PR. Dated 2 November audit remains historically immutable. #787 and #765 receive additive status updates; no duplicate tracker.


## 4 November 2026 — checked independent A3 and integration boundary

The trusted main-only independent [review #41666277535](https://github.com/lhanson-dev/revision/actions/runs/41666277535) passed on the prior exact PR #816 head `5c24236a092483855d56b2d2f11fdfcb75123121` with original review [artifact #13244528585](https://github.com/lhanson-dev/revision/actions/runs/41666277535/artifacts/13244528585) and its verified candidate source Git blob `ad96b281613e045222758e3acfa2e114cb90528c`. Blind answers 2/0/3/1 match all four authored keys; separate feedback challenge passed. Minor item-phrasing clues remained noted, not a competing correct key. The 4 November main integration preserves this **exact unchanged source blob**; the reviewed questions are not reauthored during integration. The receipt is associated with the original PR head, so do not misdescribe it as a newly executed A3 at the merge head; a new review would be required if authored content changed. Current exact-head CI and separate Founder approval are still required; no new learner marks or historic scores are touched.
