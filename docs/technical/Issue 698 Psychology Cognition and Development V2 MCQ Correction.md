# #698 / #787 — Psychology Cognition and Development MCQ correction (candidate)

**Status: DRAFT EDUCATIONAL HOLD; not merged, not deployed, not learner accepted.**

## Source and actual learner route
Founder-provided 38-page AQA A-level Psychology 7182 v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. Rights **REFERENCE_ONLY**, §4.3.4 printed p22. Canonical learner runtime `/revision/app/`, saved 7182 course → Practice → Cognition and Development. Shared production `content/psychology/aqa-a-level/shared/course.ts` is projected to all three Paper ContentPacks. Paper 3 only: the topic is one of the three Option 1 alternatives; no student must study all three.

## Proved bounded defect
Approved main still publishes four V1 prototype definition MCQs (`psy-psy1101-check` through `psy-psy1104-check`) using the identical multiset of four options, despite targeting four different specification parent bullets. Dated LF-03 source audit flagged the exact set. Such repetition encourages answer-list memorisation. This is a demonstrated design weakness, not proof that each old correct key was factually false.

## Proposed original learner correction
Four single-target, scenario-based V2 items (new IDs ending `-check-v2`): interpreting a Piagetian conservation response; distinguishing Vygotskian ZPD and adaptive scaffolding; cautious interpretation of Baillargeon violation-of-expectation looking time; and attributing false belief in a Sally–Anne scenario. The authored keys are C/A/D/B respectively. Scoring is one-mark MCQ only. Independent blinded key, plausible-distractor and separate explanation A3 review is **pending**. Written AO2/AO3, subject-depth assurance and authentic examiner marking are **not** established.

## Evidence preservation
The exact original questions retain old prompts/option order/key through `psychologyLegacyCognitionDevelopmentQuestions` and a topic-, specification- and fingerprint-restricted saved-session reconstruction. Historic raw scores are untouched. Retired `psy-psy110*-check` scored responses no longer increase *newly derived* Psychology learning-inference confidence; new V2 responses remain topic-level, not verified individual-atom mastery. Unknown fingerprints fail closed. No migration, permissions, backend, RLS, or other subject changes.

## Regression and assurance
`cognition-development-mcq-v2.test.ts` checks exact source identity, all-three-pack V2 IDs and keys, quality heuristic, historical score/inference distinction and old checkpoint fingerprint. Existing source-to-performance and launch contracts now look up the new published IDs. CI authoring and checks do not constitute independent educational review. Before PR merge: full exact-head CI, independent blind-key A3 and separate feedback review, synthetic signed-in responsive Practice/reload, current-main integration, **specific Founder approval**. After merge: governed production deployment, production smoke and authentic learner acceptance under WS5 #703. Historical failures remain historical.

**Documentation impact:** bounded correction to existing Psychology Practice and indexed technical evidence only. No normative policy or new production capability; no ADR. #698 remains the controlling unfinished assurance register. Do not close #787 on this narrow four-item candidate.
