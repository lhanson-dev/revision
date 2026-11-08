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

## 8 November 2026 — exact-head CI failures preserved, QA selector repair candidate

- [First run #42435126384](https://github.com/lhanson-dev/revision/actions/runs/42435126384) failed **before any Psychology choices**: the global `Exam dates` button label resolved to two page controls. The test was corrected to scope the existing Plan header action. This is test-layer locator ambiguity, not evidence that the FI-001 option projection failed.
- [Second run #42436002550](https://github.com/lhanson-dev/revision/actions/runs/42436002550) on mechanically merged head `b6126a54857dfba14ddcd700b1fa89dbe93de9db` completed **8 non-DB jobs green, DB/RLS/browser job FAILED**. Both real-Auth browser attempts reached the actual **Your exams** dialog but timed out on `getByLabel('Exam', { exact:true })` at line 314, so neither option selection nor persistence/replanning was tested. The 180s test deadline and retried failure must not be reported as passing evidence. The login, Plan route and modal heading did become visible. The precise source of the missing accessible-name locator is not yet established; do not call it a confirmed learner UI defect or a valid option test.
- QA-only correction: resolve the real published dropdown via `.plan-add-exam select`, require it to be visible within 15 seconds and require the **exact Paper 3 template option** to exist. Select the three real option controls under the existing `Psychology Paper 3 options` group by the same form's native select elements; require exactly three. The dated input is similarly scoped to the actual add-exam form. This preserves the *real browser actions* and all actual owner-scope, change/reload, historical archive and FI-001 Plan assertions. If no template is present, the new check fails quickly with a specific product/fixture supply blocker instead of consuming 180 seconds twice. It does not fabricate a template or silently promote an incorrect published option.
- Approved main has meanwhile advanced with unrelated and Psychology MCQ commits. **A mechanical current-main integration and fresh exact-head CI remain required.** All prior failed receipts remain evidence. No merge approval, production release, or educational validity claim is warranted at this checkpoint.

## 8 November 2026 — third exact-head failure, actual custom date UI correction

[Revision CI #42529242237](https://github.com/lhanson-dev/revision/actions/runs/42529242237) on `bca329eb53861c74c36903ae2d8f64126af1255c` finished **eight other jobs green and the DB/RLS browser job red**. Its 13 pre-existing real-Auth cases passed. The new Psychology case selected all three actual published Paper 3 options but both attempts timed out before saving an assessment because it searched for a native `input[type=date]` that does not exist. `src/app/ui/controls.tsx` actually renders `TextField(type='date')` as an accessible **button opening a calendar dialog**, with month navigation and named day buttons. No true assessment/persistence/Plan acceptance assertion was exercised. This is a test harness/UI interaction mismatch; do not misreport it as a production FI-001 scope failure or an educational PASS.

QA-only correction uses the real button and its calendar popover, verifies the target month via the visible month heading, selects the exact date by its accessible day label, and requires the dialog to close. No direct database date injection, hidden-input mutation, page code change, or disabled assertion. The next exact-head CI must demonstrate the actual successful save and four-topic FI-001 projection, change/reload, archived history and zero study capacity. The prior failing run is retained and remains independently inspectable. Main integration and fresh exact-head evidence are mandatory before any merge decision.
