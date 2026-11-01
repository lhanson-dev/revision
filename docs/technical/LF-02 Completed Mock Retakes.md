# LF-02 — Completed mock retakes

**Status:** PR candidate; awaiting exact-head CI, authenticated backend/browser verification and Founder merge approval.
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

Automated candidate regression added to `tests/e2e/exam-prep-page.spec.ts` for historical scored-zero evidence and fresh start in the canonical app. Existing recovery/retry tests cover draft recovery, CAS protection, frozen submission retries and owner-scoped evidence identity. Exact-head CI and realistic authenticated database/browser checks remain outstanding until separately verified. The present change has no SQL migration or new product authority.

**Documentation impact:** Existing approved Exam Session Recovery and Course Content and Assessment Component Placement authorities already cover this correction. Technical implementation, defect register, INDEX and #765/#703 status require linked tracking; no historical audit rewrite.
