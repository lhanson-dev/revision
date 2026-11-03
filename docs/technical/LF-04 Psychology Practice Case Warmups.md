# LF-04 — Psychology topic-relevant case material in untimed Practice

**State:** Proposed and not learner accepted. Existing #765 LF-04 remains OPEN. This is a bounded candidate correction, not a claim that every Psychology 7182 Practice question now has adequate context.

## Runtime and defect classification

Canonical learner entry is `/revision/app/`, route Courses → AQA A-level Psychology 7182 → Practice → selected topic → Case study. The existing `FocusedLearningWorkspace` already displays a case narrative, facts, an authored question and separate guidance side-by-side, and clearly labels the activity **unscored**. The source pack used `caseStudies: []` in all three published Psychology modules; consequently the actual course Practice screen offered **no** Psychology Case study warm-ups. That is a confirmed absence of authored case material, not a proof the UI renderer is broken.

The earlier learner LF-04 report described missing question-relevant context in both courses, without a retained question ID; this correction addresses **one known absence** but does not establish the original learner's precise item or its resolution. The Business case mismatch was already separately corrected in released PR #781. Exam Prep mocks have distinct authored stimuli; their existence does not make Psychology course Practice case work available.

## Scoped correction

Five original short case narratives, each tied to exactly one course topic, have been authored through the established content schema:

| Topic | New case | Question purpose |
| --- | --- | --- |
| Social influence | Training-centre supervisor pressure | Apply legitimacy of authority; recognise alternative explanations and evidence limits |
| Memory | Concurrent verbal/spatial tasks | Apply components of the working memory model; distinguish support from decisive proof |
| Attachment | Caregiver and unfamiliar nursery | Interpret secure-base cues; avoid unsupported attachment classification |
| Clinical Psychology and Mental Health | Intrusive thoughts, anxiety and washing | Identify cognitive/emotional/behavioural characteristics and operationalise an observed measure without diagnosing |
| Research Methods | Picture or spoken revision cues | Operationalise variables and identify self-selection/confounding |

Each case contains two case-linked guided prompts and authored explanation, with no marks or grading. Each is tagged with its actual course topic, so `caseStudyForPractice` cannot select a random unrelated case for an unsupported topic. All three published Paper 1/2/3 packs share identical course-level case warm-ups. All original scored MCQs, objective Practice records, exam questions, scores, old checkpoints and existing case material are unchanged. No migration, new UI screen, account feature flag or new recommendation engine.

**Important boundary:** These materials are unscored, self-directed application warm-ups. Reading them or seeing guidance is not independently assessed understanding or readiness. Do not attach them automatically as stimuli to unrelated legacy MCQs. Topic scope and exam applicability remain governed by the source-version AQA Psychology 7182 v1.4 and the Course Learning Blueprint; question-level AO fit needs independent educational review before final adequacy claims.

## Verification and acceptance gates

1. `cases.test.ts` checks all three packs, exact topic selection, no false case on unsupported topics, independent case/question IDs, question-specific guidance, and no scored-item identity or marks.
2. Before merge, run exact-head CI including static/typecheck/lint/unit/build and the usual security/DB/Auth and desktop/tablet/phone selection relevant to risk. Add or validate an actual canonical Practice browser assertion: chosen Psychology topic shows its own case text and guidance; switching to an unsupported topic does not show the case.
3. Obtain fresh independent subject/AO review for this new learner-facing Psychology content; limitations or failures remain open. Verify safe original authored text and the exact 2027 AQA specification context. A self-authored internal check is not independent A2/A3 or qualified examiner certification.
4. Integrate with latest approved main and obtain **specific Founder approval for this PR** before merge; then verify the exact release and original reporting learner's test on laptop/phone.
5. Under #765, identify any original Psychology Practice MCQ or written item that itself refers to missing material, distinguish source omission versus renderer fault, and fix that exact question in a separately bounded PR. This package does not close full LF-04 or all Psychology case adequacy.

## Documentation impact

This records current proposed content implementation, distinct from normative product authority. INDEX points here. Existing issue #765 and #698 remain the owners of original defects and syllabus adequacy; their historical audit findings are preserved. No ADR, new feature lifecycle approval or normative edit required for a course-content correction using an existing supported unscored activity.
