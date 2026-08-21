# Exam Simulator Session Controls

**Status:** Current implementation documentation  
**Canonical learner runtime:** `/revision/app/`  
**Primary implementation:** `src/app/ExamSimulator.tsx`, `src/app/exam.css`

## Purpose

Document the current learner-facing timed Exam Simulator session behaviour. Product authority for timed practice and the Exam Simulator remains in `10-product-governance/Scope and Capability Taxonomy.md` and `10-product-governance/Core User Journeys.md`.

## Entry and focused session

The Exam Simulator remains attached to the relevant course/paper **Exam Prep** context. Selecting **Start timed exam** opens the attempt as a dedicated full-screen session within the canonical React learner runtime.

The full-screen treatment deliberately removes competing page content from the active exam surface while preserving the learner's academic context behind the session. It does not create a second exam product, route hierarchy or evidence model.

## Pause behaviour

During the writing phase the learner can choose **Pause**.

When paused:

- the underlying exam content is blurred and non-interactive;
- the pause dialog is modal and receives focus;
- the learner cannot read or continue answering the paper through the paused surface;
- the visible countdown stops;
- elapsed paused time is excluded from the recorded active attempt duration; and
- the learner resumes explicitly through **Continue exam**.

Pause is an interruption of a timed practice attempt, not additional working time.

## Stop behaviour

During the writing phase the learner can choose **Stop exam**.

The system does not immediately abandon the attempt. It first opens a modal confirmation with the paper obscured and the timer stopped. The learner can:

- **Continue exam** — return to the same attempt and resume timing; or
- **Yes, stop exam** — discard the unsaved attempt answers and return to the simulator launch state.

Stopping an unsaved attempt does not create exam-result evidence.

## Timing semantics

The countdown runs only while the timed writing session is active and unobscured.

Recorded `durationMinutes` is calculated from wall-clock attempt start minus accumulated paused/confirmation time, capped at the configured exam duration. This keeps the persisted exam-attempt evidence consistent with the visible timer behaviour.

The self-marking phase begins after the learner finishes writing or the countdown reaches zero. Pause and Stop controls are writing-phase controls and are not shown during self-marking.

## Accessibility and responsive behaviour

The pause and stop confirmations use modal dialog semantics. The underlying exam section is `aria-hidden` while an interruption dialog is active, and the exam content is also visually blurred and made non-interactive.

The dedicated session and interruption controls are responsive across phone, tablet and desktop layouts. The existing Exam Simulator remains keyboard-operable and does not rely on hover-only interaction.

## Assurance

`tests/e2e/exam-session-controls.spec.ts` provides targeted browser assurance that:

- a timed attempt opens in the dedicated full-screen session;
- Pause obscures the paper and freezes the countdown;
- Continue resumes the attempt and timer;
- Stop Exam requires confirmation;
- cancelling the stop returns to the same attempt; and
- confirming stop exits the session and returns to the simulator launch state.

The broader `tests/e2e/app-responsive.spec.ts` continues to prove the Exam Prep → paper → timed-exam start path across the existing responsive journey suite.

Full exam submission/result persistence remains a separate assurance gap already recorded in the Assurance Coverage Register.

## Documentation-impact conclusion

This is a bounded interaction and evidence-consistency improvement to the already-authorised Exam Simulator. It does not change product scope, educational evidence meaning, REV behaviour, subscription packaging or the course/paper information architecture, so no normative product-authority amendment is required.
