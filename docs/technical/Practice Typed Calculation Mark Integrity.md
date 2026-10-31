# Practice — typed final-number scoring must not claim method marks

**31 October 2026 — governed candidate, not yet merged or production-verified.** Canonical signed-in runtime: `/revision/app/` → Courses → Practice → `FocusedLearningWorkspace`. Bank intake: `src/app/practice-questions.ts` → `bankRecordToPractice` → `toCalculation`, which the ordinary session screen uses to display the question's mark label. The result is recorded as right/wrong numeric evidence in `createCalculationEvidence`, not a graded written method.

## Verified mismatch

The actual published AQA Business 7132 structured bank includes:
- `aqa7132-3.3-q01`: **4 exam-style marks** (three method/partial-work points and one final market-size result), `calcs.length === 1`. The generic converter turns this into a **typed final-number** question but previously displayed **4 marks**.
- `aqa7132-3.3-q02`: **3 exam-style marks** (growth difference, prior-period denominator and final percentage) with one `calcs` value; the typed check previously displayed **3 marks**.

The learner does not submit intermediate method steps in this activity. The renderer's multi-mark label can mislead students into thinking the method has been checked. A right number currently persists as a boolean `calculation` result, **not** an earned 4/3-mark exam response, but the screen's mark wording misrepresents the assessed scope.

## Bounded correction

For every bank record converted to `type: 'calculation'`, **override the Practice question label to 1 mark**, because its deterministic checker verifies one final numerical value only. Leave the source bank's authored exam-style question, its 4/3 written mark points, its original ID, answer key, detailed worked feedback and other written/exam assets untouched. Preserve `isCalculationRecord` selection logic and the existing storage schema/results.

This is a single existing adapter bug fix, not a new scoring algorithm, exam marking model, student plan feature or qualification content expansion. A correct final value still does not establish mathematical method, interpolation, evaluation, exam-paper marks or mastery. A broader method-marked response would need independent assessment capability and educational calibration; none is introduced.

`src/app/practice-questions.test.ts` asserts **every** published converted final-number question is now labelled one mark and explicitly verifies q01/q02 retain original 4/3 marks in the source, but are only **one-mark checks** in Practice. Existing written point questions keep their genuine separately verified point totals; self-assessed full mocks remain unchanged.

## Assurance and delivery

Treat this as a **high-impact assessment-integrity presentation correction**: targeted unit tests, foundation/type/build and all relevant full CI, real learner-facing focused question behaviour across phone/tablet/desktop, and production smoke when released. No DB migration, existing evidence or readiness algorithm change. The underlying per-atomic skill evidence/recheck architecture remains under #704/#705, and the complete student route under #703.

**Documentation-impact check:** Code, specific source-backed regression, this technical note and INDEX pointer in one PR. Governing Course Learning Blueprint, claims policy and Content Accuracy gate already prohibit claiming work the app has not marked; no normative authority, new feature approval, ADR, or historical audit rewrite is required. Founder approval required before any merge.
