# #698 / #787 — Psychology Cognition and Development MCQ correction (candidate)

**Status (4 November 2026): independent source-blob AI A3 PASS; content remains DRAFT / UNMERGED / NOT LIVE / NOT original-learner accepted.**

## Source and actual learner route
Founder-provided 38-page AQA A-level Psychology 7182 v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. Rights **REFERENCE_ONLY**, §4.3.4 printed p22. Canonical learner runtime `/revision/app/`, saved 7182 course → Practice → Cognition and Development. Shared production `content/psychology/aqa-a-level/shared/course.ts` is projected to all three Paper ContentPacks. Paper 3 only: the topic is one of the three Option 1 alternatives; no student must study all three.

## Proved bounded defect
Approved main still publishes four V1 prototype definition MCQs (`psy-psy1101-check` through `psy-psy1104-check`) using the identical multiset of four options, despite targeting four different specification parent bullets. Dated LF-03 source audit flagged the exact set. Such repetition encourages answer-list memorisation. This is a demonstrated design weakness, not proof that each old correct key was factually false.

## Proposed original learner correction
Four single-target, scenario-based V2 items (new IDs ending `-check-v2`): interpreting a Piagetian conservation response; distinguishing Vygotskian ZPD and adaptive scaffolding; cautious interpretation of Baillargeon violation-of-expectation looking time; and attributing false belief in a Sally–Anne scenario. The authored keys are C/A/D/B respectively. Scoring is one-mark MCQ only. Independent blinded key and separate authored-feedback AI A3 review **passed on original candidate head** (see below). Written AO2/AO3, subject-depth assurance and authentic examiner marking are **not** established.

## Evidence preservation
The exact original questions retain old prompts/option order/key through `psychologyLegacyCognitionDevelopmentQuestions` and a topic-, specification- and fingerprint-restricted saved-session reconstruction. Historic raw scores are untouched. Retired `psy-psy110*-check` scored responses no longer increase *newly derived* Psychology learning-inference confidence; new V2 responses remain topic-level, not verified individual-atom mastery. Unknown fingerprints fail closed. No migration, permissions, backend, RLS, or other subject changes.

## Regression and assurance
`cognition-development-mcq-v2.test.ts` checks exact source identity, all-three-pack V2 IDs and keys, quality heuristic, historical score/inference distinction and old checkpoint fingerprint. Existing source-to-performance and launch contracts now look up the new published IDs. CI authoring and checks do not constitute independent educational review. Before PR merge: fresh integrated-head CI, synthetic signed-in responsive Practice/reload, confirmation the independent reviewed question source blob remains unchanged, **specific Founder approval**. After merge: governed production deployment, production smoke and authentic learner acceptance under WS5 #703. Historical failures remain historical.

**Documentation impact:** bounded correction to existing Psychology Practice and indexed technical evidence only. No normative policy or new production capability; no ADR. #698 remains the controlling unfinished assurance register. Do not close #787 on this narrow four-item candidate.

## Independent educational A3 receipt — 4 November 2026

- Trusted reviewer-only PR #828 merged to production on main `c4ccac464c3478be74364d2e565e021c42bcb210`; real path-to-live run [#41825901071](https://github.com/lhanson-dev/revision/actions/runs/41825901071) completed success, including smoke and `revision/path-to-live=success`.
- Owner-authenticated exact-head independent [A3 run #41826346386](https://github.com/lhanson-dev/revision/actions/runs/41826346386) **SUCCESS**; full [review receipt artifact #13318622955](https://github.com/lhanson-dev/revision/actions/runs/41826346386/artifacts/13318622955) verified, ZIP digest `sha256:7b29fb169f162c74381d2c5135d883eef72b68b65bb1c25e9f02964e6b7f04a8`, retained through 4 December 2026. Original reviewed head `913d29aefbf01d8985a274ed852c11d7de08b7ab`, original authored content blob `ddc92e1940029c2d5afc913191adda9a24af45ff`, status completed, overall decision **PASS**. This is a prior original-content A3 receipt, not an independent model run on the later integrated/documentation head.
- All four blind reconstructed key indexes **2/0/3/1** agree with the authors. Item A3 verdicts PSY-11-01/02/03/04: **pass / minor / pass / pass**. Independent fresh-context authored-feedback stage: **PASS**.
- Open nonblocking limitations: PSY-11-02 uses gradual withdrawal of hints without explicit adjustment to each need, so 'responsive' support is a reasonable but modest inference. Other distractors sometimes use conspicuous absolutes; true real-student discrimination remains unmeasured. No competing correct key or blocking content defect found by AI review.
- Exact AQA 7182 v1.4 §4.3.4 mapping remains controlled by the Founder-provided REFERENCE_ONLY PDF. The AI reviewer used summarised official scope, not the copyrighted PDF; it is not a qualified examiner, full content adequacy or real learner acceptance.
- Existing raw marks, original option positions and saved legacy sessions remain unchanged. Publication still requires fresh current-main integration/CI, specific Founder merge approval and post-merge release plus WS5 authentic learner testing. Programme trackers #698/#787 remain open.
