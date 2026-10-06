# Exam Prep: understand the papers, then sit a mock

**Status:** Exam Prep v2.2. PR 1 of 4 (the page, in the shell) is in review. PR 2 (mock pop-up: before you start and questions), PR 3 (untimed examiner guide, hand in, marking) and PR 4 (results and evidence) are not built yet.
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 5 and 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 7), `docs/features/shell-navigation.md`. Visual source: the Exam Prep redesign, option 1a.

## PR 1: the page, in the learner shell

**The main fix.** Exam Prep used to open in a focus mode with no navigation and a "Leave Exam Prep" bar. It now opens in the normal shell, like Learn and Practice: sidebar (desktop), icon rail (tablet) or tab bar (phone), the unchanged course header, and the Overview / Learn / Practice / Exam Prep / Progress tabs with Exam Prep selected. The focus mode and its bar are removed from the route and from the styles.

**What the student sees**, in this order, on the 1100px canvas with 32px between sections:

1. **Header.** "EXAM PREP · {course} · {board}", "Get ready for the exams", one lead line, and the first exam: "First exam: {paper} · {date} · {n} weeks away" from the student's own exam dates (the ones from onboarding and Plan). With no date it says so and does not invent one. Two columns on desktop, stacked at 960px and under. Next to it, **REV's card** (deep): one mock, with the reason, and "Start it" / "Not now". REV only suggests a mock when the student has started at least half the topics it covers, and the reason gives the real count ("You've started 4 of the 5 topics it covers"). No fitting mock, no card.
2. **Your papers.** Three cards (one column at 960px and under). Each is a button with `aria-expanded`: "PAPER n", a neutral chip with topics covered (from the student's Topics covered), what the paper contains, "2 hours · 100 marks · a third of your A-level" and "How it runs". One paper opens at a time (teal 2px ring). Its **How it runs** panel has a 44px time bar split by minutes (the sections alternate the subject tint and a neutral tint; the checking time is a plain line segment), one row per section (name, type, marks, "about n min") and "Leaves 5 minutes to check." The minutes are worked out in code: the paper's time less 5 minutes, shared out in proportion to each section's marks (`pacedSections` in `src/app/exam-prep.ts`), so nobody types a timing in. A short **On the day** list appears only when the content file has one (AQA 7132 does not yet).
3. **What examiners look for.** Four assessment-objective cards (4 across, 2 on tablet, 1 on a phone): the AO chip, the objective in the factory's words ("Knowledge and understanding", "Application to business contexts", "Analysis of business issues and influences", "Evaluation and evidence-based judgement") and its weight ("22–25% of your A-level marks"). A **Command words** card and a levels note are built, but show only when the content file has factory-approved wording for them. AQA 7132 has none yet, so they are not shown.
4. **Mock exams.** One row per mock: name, "Paper n style · q questions · m marks", clock and time, and an honest note only when it is true ("Has 5 topics you haven't started yet." is counted from the student's topic status). **Start timed** (teal) and **Practise untimed**. Under the list: "Last mock: {name} · {marks} · {mode} · {date}" from the student's latest saved attempt; nothing if they have not sat one.

**Content rule (Founder, 6 October 2026): content comes through the Content Factory.** The new Exam Prep copy must not be interpreted or written by the design or by Claude. The paper guide (`content/business/aqa-a-level/shared/exam-papers.ts`, schema `content/exam-papers-schema.ts`, one file per board and specification, listed in `src/app/exam-prep.ts`) holds only what the factory's AQA 7132 **Exam Truth** records (`scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs`): three papers of 2 hours and 100 marks (33.3% each), every paper can assess the whole course, each paper's question structure, and the four assessment objectives with their weightings. The structure was also checked against AQA's "specification at a glance" page on 6 October 2026. The file records where it came from (`checkedAgainst.approvedBy`), and a test refuses a paper whose section marks do not add up to its marks.

**Left out until the factory approves wording for it** (the first version of this PR had them, taken from the design sample copy and my own reading; they were removed): command words and their "usual marks", the "levels" explanation, "How you show it" coaching on each objective, and "On the day" advice (including "Calculator allowed", which AQA's page does not state). The Exam Truth itself says mark allocations and mark-scheme wording are not stable Exam Truth. To add any of these, the factory must produce and approve the text; the page will then show it with no code change.

Nothing the factory produced (questions, mark schemes, mock papers, marking) is changed by this work. The mocks are read as they are.

**Mock exams today.** The list is every real mock the course has: each paper's simulation, and the retained AQA 7132 mocks. There is no short mock yet, so none is shown. **Until PR 2**, "Start timed" opens the existing simulator inside the Practice pop-up (same dialog, focus trap, Esc, and focus back to the button). "Practise untimed" opens the existing single-question practice; it is off for the retained pilot papers, which do not offer it. The Before you start screen, question strip, the new timer and the rest of the mock flow arrive in PR 2.

**Removed from this tab:** the old "Choose a paper" list with a simulator inside each paper, and the browsable AQA question bank. The bank's questions are used in Practice.

## Not built yet
- Mock pop-up flow, timer, flags, autosave and leaving rules (PR 2).
- Examiner guide, hand in, time's up and REV marking (PR 3).
- Results and the `mock_exam` evidence source (PR 4).

## Tests
- `src/app/exam-prep.test.ts`: the paper guide against AQA's structure and the factory's objectives, that no unapproved wording is present, suggested minutes worked out from marks, the date and topic wording, mock rows, REV's suggestion and "Last mock".
- `tests/e2e/exam-prep-page.spec.ts`: opens in the shell, order and wording, no date, one paper open at a time, AOs and command words, mock rows, the pop-up and focus return, no sideways scroll at 1440 / 960 / 620 / 390 / 320, no label wraps mid-label, accessibility check, and that no command words, levels note or day advice appear. Set `EXAM_PREP_SHOTS=<folder>` to also write the light and dark screenshots at 1440, 834 and 390.
