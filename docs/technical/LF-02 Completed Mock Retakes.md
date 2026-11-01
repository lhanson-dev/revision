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
