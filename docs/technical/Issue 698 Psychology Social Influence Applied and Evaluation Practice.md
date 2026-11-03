# Issue #698 — Psychology Social Influence applied and evaluation Practice

## 3 November 2026 — corrected E2E locator and current-main integration (candidate, NOT released)

**PR #793** reviewer-context infrastructure was separately Founder-approved, merged as `c389867771c735eb53bfd06ea8e381b910844ccb`, and production verified in [release #41517283492](https://github.com/lhanson-dev/revision/actions/runs/41517283492). This permits a fresh independently initiated A3 on the exact head of **PR #773**, but does not reverse the original `fail_hold` receipt or grant publication approval.

PR #773's prior exact-head [CI #41514143779](https://github.com/lhanson-dev/revision/actions/runs/41514143779) **FAILED** three responsive browser shards on the same Social Influence Practice test: `.practice-length` filtered by `hasText: '15'` matched both 15-question and 10-question controls, because the latter displays an estimated 15 minutes. The correction targets the 15-question **number** element with a strictly anchored regex, retaining the test's full 12-item session, refresh/recovery, first-four independently scored V2 evidence and fifth new scenario assertions. Foundation/unit/auth/database jobs had passed on the failed head. The old failed CI run remains failed.

The integrated candidate preserves the original eight scenario and four written authored source blobs and three shared pack imports unchanged, while starting from approved `main` to retain later Social Influence/Memory, Flashcard and other independent work. The source-to-performance audit test retains current-main Flashcard V2 mapping and adjusts only the actual published shared drill count from 18 to 22; INDEX uses the approved-main index plus this candidate pointer. No production learner evidence has been altered, no marking/schema/governance change is proposed, and no visual baseline is approved by this test correction.

**Still HOLD:** newest exact-head CI including visual approval constraints, fresh independent A3 of all 12 assets with retained receipt, resolution of any material issues, signed-in learner acceptance and a separate explicit Founder approval for PR #773. Current-main Playwright simulation is not real-user acceptance. The remaining #698 / #703–705 Psychology coverage and learning-loop obligations remain OPEN.


## 2 November 2026 — combined LF-03 and #698 pre-release assurance state

**Draft, UNMERGED, A3 FAIL/HOLD remains in force.** After the live Social Influence LF-03 four-question V2 correction (PR #779), previously published V1 `psy-psy010[1-4]-check` identifiers remain **immutable historical evidence**, rather than still appearing in the fresh Practice pool. Their live replacements are `psy-psy010[1-4]-check-v2`, and this candidate adds **eight distinct** source-targeted one-mark scenario MCQs after those four: **12 selectable scored Social Influence Practice questions**, plus four self-check written DataDrills. Do not mistakenly interpret the historical pre-LF-03 references below as a requirement to republish the deficient V1 questions.

Original independent trusted [A3 #41424189543](https://github.com/lhanson-dev/revision/actions/runs/41424189543) remains a retained `fail_hold` despite positive checks on the eight proposed keys and four written models. Its one material objection misidentified three internal shared course packs as paper-specific student destinations. Separate draft [review evidence correction PR #793](https://github.com/lhanson-dev/revision/pull/793) is awaiting its own governed approval, then a **fresh** independent review with approved placement authority and Course Practice/Exam Prep route evidence. Do not infer an A3 PASS yet.

The first combined current-main [CI #41511830732](https://github.com/lhanson-dev/revision/actions/runs/41511830732) **FAILED** because older LF-03 automated tests expected exactly four Social Influence scored questions, a four-question start label, and original V1 identifiers, which conflicts with the candidate's new twelve-question published pool and already-live V2 identities. Updated unit tests now separately verify preserved first-four LF-03 V2 keys/evidence **and all eight additional source-mapped questions**; shared-pack tests explicitly assert four current V2 identities while keeping immutable V1 historical records; the signed-in course browser test initiates a twelve-question session, proves saved recovery of the original four and then advances into the fifth original applied case. These are test-contract changes, **not removal of evidence checks or alteration to question/learner scoring code**. Fresh exact-head CI remains required. This addition supersedes dated pre-LF-03 test-count/identity statements below; historical source and review records remain unchanged.



**Draft candidate, NOT independently A3 reviewed or approved for publication.**

## Controlling source and route

Exact Founder-supplied AQA A-level Psychology 7182 v1.4 (1 September 2025) Section 4.1.1, printed p17; PDF SHA-256 db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d; **REFERENCE_ONLY**. No protected question, marking scheme or prose copied. The original four content bullets cover conformity, obedience, resistance and minority influence. The original 117 parent-bullet locator inventory (#767), live four revised Learn pages (#768), and 21 provisional named demand checks remain the source-to-app baseline. Canonical route: `/revision/app/`, current course Practice through all three AQA 7182 ContentPacks.

## Verified pre-change limitation

Existing Social Influence Practice has four generated topic-concept MCQs, without independently attributable requirement-level score. Paper 1 Exam Prep contains written tasks, but self-marking is not independent assessment. Supported shared app capabilities: the existing structured-bank scored **single-option** MCQ can retain **one exact authored candidate skill** as a raw response, while DataDrill asks a written task and shows an answer for learner **self-check**. The app does **not** reliably award AO3 essay marks.

## Proposed authored assets

`content/psychology/aqa-a-level/shared/social-influence-practice.ts` adds eight original, single-target, one-mark scenario MCQs and four unscored written application/evaluation drills to the three existing Psychology paper packs. Every case asks for a particular inference from unfamiliar evidence, not another definition. Distinct authored correct-option feedback explains a specific misconception.

| Parent | Exact original scenario IDs (prefixed `rev7182-4.1.1-`) | One source-atom candidate | Intent |
| --- | --- | --- | --- |
| Conformity | `si-unanimity-ally-01`, `si-task-difficulty-01` | SI06, SI07 | Select dissent/unanimity or informational uncertainty explanation |
| Obedience | `si-milgram-location-01`, `si-uniform-evidence-01`, `si-fscale-causality-01` | SI13, SI14, SI15 | Differentiate location, uniform evidence and questionnaire inference |
| Resistance | `si-disobedient-peers-01`, `si-locus-correlation-01` | SI17, SI18 | Apply social support and evaluate correlation versus cause |
| Minority influence | `si-minority-flexibility-01` | SI21 | Identify flexible adjustment without abandoning a consistent position |

The eight question IDs are new; pre-existing question identities, marks, Progress and learner data are preserved. These SI numbers are Revision provisional decomposition IDs, **not official AQA atomic scores**. Selected responses can support only bounded one-item recognition/decision evidence, not written AO2 or AO3 reasoning, mastery or durable rechecking. Four additional paper/written `dataDrills` provide model-answer checklists for conformity, obedience, resistance and minority influence, with **no score** or independently judged response.

The four older Psychology assurance suites retain their original Research Methods identity/marking assertions; only their cumulative three-pack DataDrill count has been reconciled from 18 to 22 (18 pre-existing + four new Social Influence self-checks). No historical snapshots have been edited.

## Test and release gate

The cross-pack test `content/psychology/aqa-a-level/shared/social-influence-practice.test.ts` verifies original PDF fingerprint, parent/target IDs, all three real content packs, eight distinct scored records, exactly one target each, correct conversion through `bankRecordToPractice`, original four concept-MCQ IDs retained, four self-check drills and no invented written marks.

**HOLD until:** full exact-head CI, fresh-context **independent A3 challenge** of all original stimuli, keys, distractors, feedback, target attribution, written model checklists and permitted source use; correction of all material findings; current-main integration and distinct Founder approval for the new Practice PR. Existing independent PR #759 and #768 review workflows are restricted to other assets and cannot certify this work. Human examiner signoff, written grading calibration, real signed-in learner acceptance and the remaining #698/#703–705 requirements stay open.

**Documentation impact:** Code/data, tests and this indexed technical note are paired in one governed PR; no normative authority change, schema migration, new route or scoring engine. Historical A2 review evidence and source snapshot are not altered. No completed-course assurance claim.
