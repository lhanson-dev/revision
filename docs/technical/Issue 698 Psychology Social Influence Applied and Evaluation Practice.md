# Issue #698 — Psychology Social Influence applied and evaluation Practice

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

## Test and release gate

The cross-pack test `content/psychology/aqa-a-level/shared/social-influence-practice.test.ts` verifies original PDF fingerprint, parent/target IDs, all three real content packs, eight distinct scored records, exactly one target each, correct conversion through `bankRecordToPractice`, original four concept-MCQ IDs retained, four self-check drills and no invented written marks.

**HOLD until:** full exact-head CI, fresh-context **independent A3 challenge** of all original stimuli, keys, distractors, feedback, target attribution, written model checklists and permitted source use; correction of all material findings; current-main integration and distinct Founder approval for the new Practice PR. Existing independent PR #759 and #768 review workflows are restricted to other assets and cannot certify this work. Human examiner signoff, written grading calibration, real signed-in learner acceptance and the remaining #698/#703–705 requirements stay open.

**Documentation impact:** Code/data, tests and this indexed technical note are paired in one governed PR; no normative authority change, schema migration, new route or scoring engine. Historical A2 review evidence and source snapshot are not altered. No completed-course assurance claim.
