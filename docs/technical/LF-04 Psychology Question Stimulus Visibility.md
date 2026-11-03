# LF-04 — Psychology question-stimulus visibility across Exam Prep

**Status:** Candidate fix on governed branch; not merged, deployed or learner-accepted.  
**Tracking:** #765 LF-04; #698 owns educational/source sufficiency; Workstream 5 owns original learner acceptance.

## Verified existing learner route and defect

The canonical learner runtime is `/revision/app/`: Courses → AQA A-level Psychology 7182 → Exam Prep → Paper → **Practise untimed** or **Start timed**. `src/app/ExamPrepSection.tsx` launches `src/app/ExamSimulator.tsx` for both. The older non-canonical learner surfaces are not changed.

The published Psychology paper-question source (`content/psychology/aqa-a-level/shared/course.ts`) includes authored question-level `stimulus` narratives and, where appropriate, tables for contextual questions. The timed `ExamSimulator` question view already rendered this source data. The untimed single-question view did **not** render question-level `stimulus`; neither did the answer-by-answer **Self-mark your paper** review. Both showed the prompt without its associated source, even where the question expressly required applying information from the stimulus.

The bug is lost **presentation of existing authored source**, not proof of missing source content, nor a justification to fabricate a generic case. It conflicts with contextual application expectations in AQA Psychology 7182 v1.4 (1 September 2025), A-level subject-content application requirements in §4 (printed pages 17–21). The published Psychology AO2 questions need their actual case/study data in view.

## Narrow correction

`ExamSimulator` now uses a single `QuestionStimulus` view across the timed question, untimed question and self-marking review. It displays the original heading, narrative and any semantic data table with `caption` and column headings. The original authored `exam.caseHtml` remains displayed; it is not substituted for the question-specific material. If no question stimulus is authored, no extra generic context appears.

The fix changes **presentation only**. It does not alter AQA alignment or the authored question, question identity, answers, marks, marking guidance, AO allocation, stored attempts, saved evidence, retake logic or adaptive learning/planning. There is no backend or schema migration.

## Regression and release boundary

The canonical authenticated-fixture Playwright route checks that a Psychology Paper 1 contextual question includes its author-provided stimulus in **untimed Practice**, still displays the identical stimulus in the timed paper, and retains it beside the learner answer during self-marking. This is configured for desktop, tablet and phone. CI must establish that each route works with the exact candidate head, including accessibility/zoom coverage where feasible.

**Not yet proved:** successful exact-head CI, live production deployment, reporter's original authenticated session, 200% browser zoom, screen-reader/manual keyboard checks, or independent source-to-question adequacy across all Psychology topics. These remain #765/#698/Workstream 5 actions. In particular, this correction cannot cure *un-authored* or irrelevant stimuli.

## Documentation impact

Existing Course Learning Blueprint, Product UX Principles, Tone of Voice, and source/evidence rules already require source-relevant application context and accessible presentation; no normative policy amendment is proposed. This technical implementation note, `INDEX.md`, scoped browser regression and active defect tracking accompany the fix. Historic audits stay unchanged.
