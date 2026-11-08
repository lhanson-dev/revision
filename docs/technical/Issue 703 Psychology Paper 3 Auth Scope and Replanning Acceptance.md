# Issue #703 — Psychology Paper 3 real-Auth option scope and replanning acceptance

**State:** test-only candidate on branch `test/703-psychology-paper3-auth-scope`; not yet a CI PASS, merge, educational assurance decision, hosted observation or learner acceptance.

## Exact canonical route and existing system

The application is `/revision/app/`, the one canonical React runtime. The test opens **Plan → Exam dates**, uses the real published Psychology 7182 Paper 3 section choices, saves them through `PlanScreen` → `saveCourseAssessment` and owner-scoped `revision_assessments`, then reopens FI-001 Plan's existing `buildLearnerPreparationProgramme` projection. It does not create an alternative recommendation/scheduling path.

The approved `src/app/psychology-paper3-option-scope.test.ts` already deterministically enumerates all 27 valid combinations of one selected subject from each of Sections B/C/D, plus compulsory Issues and Debates. That proves candidate scoping logic only. It does not test a signed-in student's persistence, stale-optional exclusion after a change or adequate AQA educational content.

## Added isolated real-Auth QA journey

`tests/e2e/plan-live-auth-configuration.spec.ts` now runs a disposable local GoTrue/PostgREST account in the real learner browser. It asserts:

1. The ordinary Plan UI saves Paper 3 options Relationships / Schizophrenia / Aggression for 9 June 2027, with exact owner-scoped four-topic `scope.topicIds`. After reload the FI-001 full-programme knowledge requirements list has **only** the compulsory topic and the three chosen topics; six unselected alternatives are not presented as relevant syllabus requirements.
2. The learner archives that exam in **Exam dates** and re-adds it with Cognition and Development / Eating Behaviour / Forensic Psychology and an earlier 20 May 2027 date. The older assessment record remains archived, not lost or used as current Plan scope. The new scope and date survive reload; the old options no longer appear as Plan requirements.
3. Saving zero weekly minutes through that account's existing owner-scoped availability API and reloading preserves the true applicable syllabus scope while showing no time allocated, without indicating the course is fully prepared.

The test refuses any non-local authentication URL, uses no real child data or production account, and requires synthetic-account cleanup. This is an **actual runtime + authenticated database + user-interface** test rather than a mocked Plan fixture. The Date and course content are synthetic but use the existing published AQA 7182 assets and genuine Plan controls.

## Confidence and boundaries

Successful CI would prove only these two browser-saved Paper 3 selection scenarios plus existing deterministic 27-combination source scoping. It would **not** establish independently correct AQA teaching and exams, all 27 authenticated scenarios, a valid assessed Psychology misconception → repair → independent recheck, whole-exam readiness, sustainably useful 14-day scheduling or firsthand human learner usefulness. Those remain explicitly tracked under #698 (source/content and #787 MCQ), #703/#704/#705 (integrated learning loop), #694 (real multiweek capacity), #706/LF-05 (written evidence) and WS5 (hosted/human observation).

This deliberately fails if changing choices retains stale options or if zero study capacity turns unknown into claimed mastery. Do not weaken that failure into a false PASS. Do not assume a valid selection guarantees every active specification requirement is sufficiently practised.

## Documentation-impact assessment

Only test assurance and this technical note/INDEX pointer change. No normative Course Learning Blueprint, Adaptive Revision Planning, Claims and Progress, assessment schema, score interpretation or planner code changes. No ADR required. Historical evidence and old assessment identities remain intact. New findings must be recorded as evidence; any product bug found should receive a separate governed implementation correction with fresh exact-head tests. PR merge requires specific Founder approval.
