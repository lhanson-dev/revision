# LF-02 — Completed mock retakes

**Status:** PR candidate; integrated CI 9/9 at previous head, additional Psychology browser regression awaiting exact-head checks and Founder merge approval.
**Canonical route:** `/revision/app/` → course → Exam Prep → `ExamPrepSection` → `ExamSimulator`.

## Source-confirmed defect

Exam Prep presented the same “Start timed” action for untouched and previously completed papers. When a completed REC-10 checkpoint remained in `learner_exam_attempts`, simulator initialisation restored the completed result instead of starting fresh. Restart was available only inside that result screen. Thus direct retaking from Exam Prep was not possible, despite a hidden “Start another attempt” flow.

This is a code-traced cause, **not a reproduction from the reporting learner account**; exact paper/screen remains unconfirmed.

## Correction

- Paper rows use saved evidence and recovery phase to show **Retake exam**, **Continue saved exam**, **Finish saving exam**, or **Start timed** as appropriate.
- Explicit Retake exam for a submitted checkpoint removes only that finished checkpoint via `removeCompletedExamAttempt` after the existing submitted-phase validation, then creates a clean REC-10 attempt with fresh identity, answer state, paper selections and timer.
- Unfinished and submitting checkpoints are never deleted as part of retake. A previously completed result can still be reopened while its short-lived checkpoint exists; original scored evidence remains separately durable.
- Results offer Retake exam and Back to Exam Prep. Blank results are explicitly not scored evidence. A legitimate zero scored result remains a real attempt.
- Repeated papers are practice of familiar questions, not independent unseen testing or proof of mastery.

## Evidence and assurance

Business canonical-app regressions in `tests/e2e/exam-prep-page.spec.ts` exercise both historical scored-zero evidence and 0-to-positive fresh attempts. The Psychology canonical-app browser regression in `tests/e2e/psychology-restricted-pilot-route.spec.ts` exercises a genuine submitted zero-mark Psychology Paper 1, saved-result review, direct clean retake, retained scored evidence and interrupted-draft recovery using synthetic signed-in browser API fixtures. Existing recovery/retry tests cover draft recovery, CAS protection, frozen submission retries and owner-scoped evidence identity.

**Verification boundary:** The fully integrated head `7abaae799bbcdbc4670d163726eaed40320006b3` completed Revision CI 9/9 on 1 November 2026, including isolated authenticated database/RLS and responsive browser suites. The added Psychology-specific test changes the PR head; it **must pass new exact-head CI** before merge readiness. Synthetic browser authentication is not a real learner account; live learner acceptance remains outstanding after deployment. No SQL migration or new product authority is required.

**Documentation impact:** Existing approved Exam Session Recovery and Course Content and Assessment Component Placement authorities already cover this correction. Technical implementation, defect register, INDEX and #765/#703 status require linked tracking; no historical audit rewrite.


## 3 November 2026 — real local Auth zero-to-positive retake acceptance candidate (LA-15, LF-02)

**Evidence gap:** Earlier signed-in synthetic browser tests proved the zero-score Retake exam UI and distinct evidence IDs with intercepted Supabase HTTP calls. Existing actual isolated Auth/PostgREST learner tests only opened Exam Prep lists; they did **not** save a zero scored exam and then a second marked exam using the same real authenticated owner service. Neither evidence type is an authorised hosted learner session.

**New bounded regression on existing canonical learner app** (\`tests/e2e/learner-value-journey.spec.ts\`): create an isolated disposable local real GoTrue learner on strictly validated localhost:54321, add the actual AQA Business 7132 course through Courses, navigate to Exam Prep, start published Paper 1 Simulation 1, answer its first MCQ incorrectly, select the real mutually exclusive essay choices, complete \`Finish and self-mark\` and save **0/100**. Verify via the ordinary owner-bound PostgREST client the persisted first \`exam_attempt\` content identity, immutable \`evidence_id\`, zero marks and honest \`self_assessed\` provenance. Leave the result, click the existing **Retake exam**, verify blank second attempt, enter the correct MCQ, self-mark **1/100**, and save again. Require two distinct owner-readable saved \`exam_attempt\` IDs (0 then 1), unchanged first payload, and both surviving reload/re-entry to Exam Prep. The same test keeps the published mock structure, marking and all learner evidence rules unchanged and removes its disposable user in \`finally\`.

**Limits and rejection criteria:** This is **test-only**; no new learner route, feature, score, exam data structure, RLS, pilot flag, provider, content or schema. A passing local run establishes a narrowly supported **L** result for one Business paper, not all paper variants, not a Psychology retake, not a hosted sign-out/sign-in or actual reporting learner acceptance. Failure from missing real backend release features, incorrect score persistence or confusing retake controls must be diagnosed under existing #765/#703; do not loosen correctness to force green. Never run this test against hosted Auth or record a real child's answer in CI/GitHub. Existing synthetic Psychology zero-score browser coverage remains historical **B**, not promoted to L or H.

**Documentation impact:** This additive implementation-evidence note belongs here because existing INDEX already links the LF-02 technical contract. No normative change is requested; earlier historical acceptance records remain unchanged. On verified release add an exact-SHA update to existing #765, #665 and the current acceptance matrix in a governed evidence update; no new programme tracker or duplicate specification audit. Founder-specific PR approval remains mandatory before merge.
