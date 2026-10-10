/* Exam Prep timed session, redesign v2 (design_handoff_revision_v2 screen 07). */

/* Focus-mode top bar: dark panel with a large timer. */
.planner-runtime .exam-sticky-bar { background: var(--rv-deep); border-bottom: 0; color: var(--rv-on-deep); backdrop-filter: none; }
.planner-runtime .exam-sticky-bar strong { color: var(--rv-on-deep); font-weight: 800; }
.planner-runtime .exam-sticky-bar span { color: var(--rv-on-deep-muted); }
.planner-runtime .exam-sticky-bar .exam-control { border: 0; background: var(--rv-on-deep-tint-2); color: var(--rv-on-deep); border-radius: var(--radius-pill); }
.planner-runtime .exam-sticky-bar .exam-control-stop { background: var(--rv-coral-soft); color: var(--rv-coral-text); }
.planner-runtime .exam-sticky-bar .timer {
  background: none;
  color: var(--rv-on-deep);
  min-width: 0;
  padding: 0 var(--space-2);
  font-family: var(--rv-font-display);
  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  letter-spacing: -.01em;
}
/* Low time is coral ("look at this") with a clock icon and words, never yellow, which means Nearly there only. */
.planner-runtime .exam-sticky-bar .timer { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.planner-runtime .exam-sticky-bar .timer.warning { background: none; color: var(--rv-coral); }
.planner-runtime .exam-sticky-bar .timer .timer-note { font-family: var(--rv-font-body, inherit); font-weight: 800; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: inherit; }
.planner-runtime .exam-sticky-bar .timer .ui-icon { width: 22px; height: 22px; }
/* Heard by screen readers at 10, 5 and 1 minutes; the clock itself is not read every second. */
.exam-time-notice { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

/* Question grid: numbered squares; answered = teal, current = dark. */
.planner-runtime .question-nav { gap: 10px; }
.planner-runtime .question-nav button { min-width: 52px; min-height: 52px; border: 0; border-radius: var(--rv-radius-chip); background: var(--rv-soft); color: var(--rv-text); font-weight: 800; font-size: 16px; }
.planner-runtime .question-nav button.answered { background: var(--rv-teal); color: var(--rv-teal-text); }
.planner-runtime .question-nav button.active { background: var(--rv-text); color: var(--rv-bg); box-shadow: var(--rv-ring); }

/* Question and answer box. */
.planner-runtime .exam-question-sheet h3 { font-family: var(--rv-font-display); font-weight: 800; font-size: 28px; line-height: 1.2; letter-spacing: -.02em; color: var(--rv-text); }
.planner-runtime .exam-question-sheet .practice-meta { font-weight: 800; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--rv-text-2); }
.planner-runtime .exam-question-sheet .answer-label textarea { border: 2px solid var(--color-border-control); border-radius: var(--rv-radius-card); background: var(--rv-surface); }
.planner-runtime .exam-question-sheet .answer-label textarea:focus { outline: 0; border-color: var(--rv-teal); box-shadow: var(--rv-ring); }
.planner-runtime .exam-case { border-radius: var(--rv-radius-card); }
.exam-word-count { margin: -12px 0 var(--space-5); font-weight: 700; font-size: 13px; color: var(--rv-text-2); }

/* Question grid: wraps instead of scrolling sideways. Answered, flagged and current are shown in words and icons, not colour alone. */
.planner-runtime .question-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; overflow: visible; padding-bottom: 0; margin-bottom: 8px; }
.planner-runtime .question-grid button { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-width: 0; min-height: 64px; padding: 8px 4px; border: 2px solid transparent; }
.planner-runtime .question-grid button b { font-family: var(--rv-font-display); font-weight: 800; font-size: 20px; line-height: 1; }
.planner-runtime .question-grid button span { margin: 0; font-size: 12px; font-weight: 700; }
.planner-runtime .question-grid button i { position: absolute; top: 4px; right: 4px; display: inline-flex; font-style: normal; }
.planner-runtime .question-grid button i .ui-icon { width: 16px; height: 16px; }
.planner-runtime .question-grid button.flagged:not(.active) { border-color: var(--rv-text); border-style: dashed; }
.planner-runtime .question-grid-key { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 var(--space-5); font-weight: 700; font-size: 13px; color: var(--rv-text-2); }
.planner-runtime .question-grid-key span { display: inline-flex; align-items: center; gap: 6px; }

/* Flag for review, and what to check before finishing. */
.planner-runtime .exam-flag-toggle { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 18px; border: 2px solid var(--color-border-control); border-radius: var(--radius-pill); background: var(--rv-surface); color: var(--rv-text); font: inherit; font-weight: 800; font-size: 15px; cursor: pointer; margin-bottom: var(--space-4); }
.planner-runtime .exam-flag-toggle[aria-pressed="true"] { border-color: var(--rv-text); background: var(--rv-soft); }
.planner-runtime .exam-flag-toggle:focus-visible { outline: 2px solid var(--rv-teal); box-shadow: var(--rv-ring); }
.planner-runtime .exam-finish-check { margin: 0 0 var(--space-4); font-weight: 700; font-size: 15px; line-height: 1.5; color: var(--rv-text); }

/* The clock keeps its large display style (the wrapper span must not inherit the bar's small muted text). */
.planner-runtime .exam-sticky-bar .timer > span { font: inherit; color: inherit; }
.planner-runtime .exam-session-controls { flex-wrap: wrap; justify-content: flex-end; }
@media (max-width: 620px) {
  .planner-runtime .exam-sticky-bar .timer { font-size: 26px; }
  .planner-runtime .exam-sticky-bar .timer .timer-note { flex-basis: 100%; font-size: 11px; }
}


/* Transitional Exam Prep mock dialog: only ExamPrepSection still consumes PracticeDialog.
   Retire this entire block in the governed Exam Prep / Simulator package. */
.planner-runtime .practice-overlay { position: fixed; inset: 0; z-index: 90; display: flex; justify-content: center; align-items: flex-start; padding: 40px 48px; overflow: hidden; overscroll-behavior: contain; background: var(--scrim); }
.planner-runtime .practice-dialog { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 900px; height: calc(100dvh - 80px); margin: 0; padding: 0; overflow: hidden; border: 0; border-radius: 28px; background: var(--rv-bg); color: var(--rv-text); box-shadow: var(--shadow-overlay); }
.planner-runtime .practice-dialog__bar { padding: 16px 28px; background: var(--rv-surface); border-bottom: 1px solid var(--rv-line); }
.planner-runtime .practice-dialog__bar-inner { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 14px; max-width: 820px; margin: 0 auto; }
.planner-runtime .practice-dialog__close { display: grid; place-items: center; flex: none; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 999px; background: var(--rv-bg); color: var(--rv-text-2); cursor: pointer; }
.planner-runtime .practice-dialog__close:hover { color: var(--rv-text); }
.planner-runtime .practice-dialog__close:focus-visible { outline: 2px solid var(--rv-teal); outline-offset: 2px; }
.planner-runtime .practice-dialog__mark { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 10px; background: var(--accent); color: var(--accent-on); font: 800 15px/1 var(--font-family-display); }
.planner-runtime .practice-dialog__body { flex: 1; min-height: 0; overflow-y: auto; padding: 36px 28px 40px; }
.planner-runtime .practice-dialog__body:focus-visible { outline: 2px solid var(--rv-teal); outline-offset: -4px; }
.planner-runtime .practice-dialog__column { display: flex; flex-direction: column; gap: 24px; max-width: 820px; margin: 0 auto; min-width: 0; }
@media (max-width: 960px) {
  .planner-runtime .practice-overlay { padding: 28px 24px; }
  .planner-runtime .practice-dialog { height: calc(100dvh - 56px); }
}
@media (max-width: 620px) {
  .planner-runtime .practice-overlay { padding: 40px 0 0; }
  .planner-runtime .practice-dialog { height: calc(100dvh - 40px); border-radius: 28px 28px 0 0; }
  .planner-runtime .practice-dialog__bar { padding: 12px 16px; }
  .planner-runtime .practice-dialog__body { padding: 28px 16px 32px; }
}
