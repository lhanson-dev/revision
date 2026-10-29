# Issue #698 — Psychology Paper 3 exam-option scope on the learner Plan

**Status:** proposed targeted correction (not live until PR review, explicit Founder approval and verified deployment).

**Canonical runtime/route:** the authenticated Vite/React learner website `/revision/app/#/plan`; existing `src/app/PlanScreen.tsx` > **Exam dates** > **Add exam** > `saveCourseAssessment` in `src/services/courses/course-planner-service.ts`, persisting `revision_assessments.scope.topicIds`. The existing `src/app/planner-model.ts::scopeTopicIds` consumes that exact field to determine which published learning topics are eligible for an assessment. No new route, database schema, planner engine or student evidence state is introduced.

**Exact source:** the Founder-uploaded AQA Psychology A-level 7182, v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, checked from the actual attached PDF. AQA 7182 Paper 3 assesses compulsory Issues and Debates and one student-selected topic from each of three optional groups, yielding 27 valid combinations. The PDF is REFERENCE_ONLY, not a source of copyable content. The approved Psychology Course/Exam Truth and published mock exam encode groups B/C/D and their actual topic IDs.

## Defect and correction

The live Plan **Exam dates** form saved Paper 3 with empty scope. The existing FI-001 domain code intentionally omits all Paper 3 options until it receives explicit selected `scope.topicIds`; therefore an ordinary learner could not receive a trusted Paper 3 option-specific plan even though Exam Prep supported 27 paper compositions. That silently under-prepares a student.

Within existing Founder-approved FI-001/ FI-020 assessment-scope and paper-scoped planning capability, the Plan **Exam dates** form now asks for exactly one choice in Sections B, C and D *only for AQA Psychology 7182 Paper 3*. The list is derived from the **published** `LearningContentAdapter.listExams()` and `listTopics()` data, not arbitrary hardcoded options or new generated requirements. Each chooser begins blank; the code does not silently choose a topic. `psychologyPaper3TopicScope` rejects empty, partial, unknown or extraneous selections and returns compulsory Issues and Debates plus the three exact student choices as the existing `scope.topicIds`. Non-Psychology public exams and AQA Business essay alternatives retain existing behaviour. The saved scope is present on ordinary assessment persistence/reload; no new table or access rule is needed.

**Domain test:** `src/app/psychology-paper3-option-scope.test.ts` checks the three real groups against the current published Psychology Exam Truth, all **27** legitimate topic triples and the exact FI-001 `scopeTopicIds` output, and fails closed on unselected/invalid topic IDs. It checks the Business paper remains unaffected. Entire Revision CI, browser/phone/keyboard and authenticated persistence path still require exact-head verification.

## Boundaries and outstanding routes

The normal Plan exam-date form is the target here. Other ways to record public-exam dates (particularly first-use onboarding and any imported legacy records) must be audited: existing Paper 3 records with **empty scope** remain deliberately unselected and cannot truthfully give an option-complete plan without the student explicitly selecting their own topics. Do not backfill or infer options, claim the whole Psychology option requirement is assured, or count unspecified options as complete in Progress. A follow-up scoped remediation must ensure onboarding/date-reentry and progress accurately explain and capture these choices without new unapproved interactions.

**Governance/DoR:** The approved FI-001 programme-first Ready scope explicitly covers `actual permitted paper/option mappings` and student-selected course/paper scope, while R1/R2 safeguards exclude invented Psychology options. This change connects an already approved input and published output, not a new diagnosis, marking, planner priority algorithm or autonomous option-choice feature. If the user experience or cross-journey solution requires a *material* feature beyond this bounded bug repair, separate DoR/Founder approval is required before implementation.

**Documentation impact:** this new technical implementation evidence note is committed with code and tests. The governing Adaptive Revision Planning policy already requires no revision for unselected options and correct paper scope; it is not silently changed. The historic audit and 2026-10-29 Issue #698 gap record remain intact.
