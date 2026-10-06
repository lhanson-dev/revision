# Exam Prep: understand the papers, then sit a mock

**Status:** Exam Prep v2.2. PR 1 of 4 (the page, in the shell) is merged. PR 2 (the mock pop-up: Before you start, the questions, the timer, flags, leaving, autosave) is in review. PR 3 (untimed examiner guide, hand in, REV marking) and PR 4 (results and evidence) are not built yet.
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 5 and 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 7), `docs/features/shell-navigation.md`. Visual source: the Exam Prep redesign, option 1a.

## PR 1: the page, in the learner shell

**The main fix.** Exam Prep used to open in a focus mode with no navigation and a "Leave Exam Prep" bar. It now opens in the normal shell, like Learn and Practice: sidebar (desktop), icon rail (tablet) or tab bar (phone), the unchanged course header, and the Overview / Learn / Practice / Exam Prep / Progress tabs with Exam Prep selected. The focus mode and its bar are removed from the route and from the styles.

**What the student sees**, in this order, on the 1100px canvas with 32px between sections:

1. **Header.** "EXAM PREP · {course} · {board}", "Get ready for the exams", one lead line, and the first exam: "First exam: {paper} · {date} · {n} weeks away" from the student's own exam dates (the ones from onboarding and Plan). With no date it says so and does not invent one. Two columns on desktop, stacked at 960px and under. Next to it, **REV's card** (deep): one mock, with the reason, and "Start it" / "Not now". REV only suggests a mock when the student has started at least half the topics it covers, and the reason gives the real count ("You've started 4 of the 5 topics it covers"). No fitting mock, no card.
2. **Your papers.** Three cards (one column at 960px and under). Each is a button with `aria-expanded`: "PAPER n", a neutral chip with topics covered (from the student's Topics covered), what the paper contains, "2 hours · 100 marks · a third of your A-level" and "How it runs". One paper opens at a time (teal 2px ring). Its **How it runs** panel has a 44px time bar split by minutes (the sections alternate the subject tint and a neutral tint; the checking time is a plain line segment), one row per section (name, type, marks, "about n min") and "Leaves 5 minutes to check." The minutes are worked out in code: the paper's time less 5 minutes, shared out in proportion to each section's marks (`pacedSections` in `src/app/exam-prep.ts`), so nobody types a timing in. An **On the day** list and any paper notes (such as a reading time) follow, each with the "Being checked" chip.
3. **What examiners look for.** Four assessment-objective cards (4 across, 2 on tablet, 1 on a phone): the AO chip, the objective in the factory's words ("Knowledge and understanding", "Application to business contexts", "Analysis of business issues and influences", "Evaluation and evidence-based judgement") and its weight ("22–25% of your A-level marks"). Each card also shows what the objective means and "How you show it", then a **Command words** card and the levels note. All of that is flagged "Being checked" (see below).
4. **Mock exams.** One row per mock: name, "Paper n style · q questions · m marks", clock and time, and an honest note only when it is true ("Has 5 topics you haven't started yet." is counted from the student's topic status). **Start timed** (teal) and **Practise untimed**. Under the list: "Last mock: {name} · {marks} · {mode} · {date}" from the student's latest saved attempt; nothing if they have not sat one.

**Content rule (Founder, 6 October 2026, refined the same day).** Wording that explains a feature, progress or what to do next on the screen is ours to write: headings, labels, empty states, REV's reasons, and the note that suggested minutes are the paper's time shared out by marks. But anything *official* about the course content, questions, exams or marks must be approved through the Content Factory or checked against the exam board; it must not be interpreted or written by the design or by Claude. And **useful items that are not yet approved are kept and flagged, not dropped**.

The paper guide (`content/business/aqa-a-level/shared/exam-papers.ts`, schema `content/exam-papers-schema.ts`, one file per board and specification, listed in `src/app/exam-prep.ts`) has two kinds of content:
- **Approved:** what the factory's AQA 7132 **Exam Truth** records (`scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs`): three papers of 2 hours and 100 marks (33.3% each), every paper can assess the whole course, each paper's question structure, and the four assessment objectives with their weightings. Also checked against AQA's "specification at a glance" page on 6 October 2026.
- **Flagged `needs_check`:** everything else. Each such item carries a `check` (status and why) in the content file, shows a neutral **"Being checked"** chip (icon and words) on the page, and is listed by `examPapersReviewItems()` for whoever does the checking. The schema refuses an unflagged item, so nothing can slip in looking approved.

**Items waiting for a check (14), AQA 7132:**
1. **AO1 to AO4 "what it is" and "how you show it"** (4): from the design sample copy; they say what earns marks.
2. **Command words** (5: State / Define, Calculate, Explain, Analyse, Evaluate / To what extent): the "asks" wording is from the design sample copy; the **usual mark ranges** are read from the factory's question bank and retained mocks, not an AQA rule.
3. **Levels note** (1): explains how longer answers are marked. Check against the factory's level descriptors.
4. **On the day** (3): "Calculator allowed" (AQA's published pages do not state a calculator rule); **"Answer every question" (likely wrong: Paper 1 Sections C and D are one essay from two, so it needs correcting before approval)**; "The marks are printed next to each question… about 1 minute a mark" (the printed-marks claim needs checking).
5. **Paper 3 reading time** (1): "about 15 minutes", from the design sample copy; AQA's page states none.

When an item is approved, remove its `check` in the content file and the chip goes. When one is corrected, edit the text and then remove the `check`.

Nothing the factory produced (questions, mark schemes, mock papers, marking) is changed by this work. The mocks are read as they are.

**Mock exams today.** The list is every real mock the course has: each paper's simulation, and the retained AQA 7132 mocks. There is no short mock yet, so none is shown. A mock opens in the pop-up described below (PR 2).

**Removed from this tab:** the old "Choose a paper" list with a simulator inside each paper, and the browsable AQA question bank. The bank's questions are used in Practice.

## PR 2: the mock pop-up

A mock opens as a pop-up over the faded Exam Prep page, in the same shell as a Practice session: `role="dialog"`, `aria-modal`, focus trapped, Esc or the close button, and focus goes back to the button that opened it. Up to 900px wide on desktop; on a phone a full-height sheet. The top bar has a 44px close button, the subject letter mark, the mock's name with a mode line ("Timed mock · like the real exam" or "Untimed practice") and, once the student starts, the timer pill. **The mode is chosen on the Exam Prep page (Start timed or Practise untimed) and cannot change after the Before you start screen.**

**Before you start.** "BEFORE YOU START" and "{mock}, timed" (or "untimed"), then rows with an icon tile, a title and one line:
- Timed: "{n} minutes, and the timer doesn't stop"; "{q} questions, {m} marks" with the pacing line; "No help while the clock runs" (no examiner guide, no REV, no notes); "Flag a question and come back" (answers save as you type); "Marked straight after". A neutral chip says "Counts towards Exam readiness". Buttons: **Start the clock** and Not now.
- Untimed: "No timer"; the questions and marks; flag and come back; "Marked at the end". The chip says "Doesn't count towards Exam readiness: untimed practice". Buttons: **Start** and Not now.
- The numbers (minutes, questions, marks) are the exam's own (`briefFor` in `src/app/mock-exam.ts`). A choice between two essays counts as one question.
- If the student has a saved attempt for this mock, the screen says so ("You have a saved attempt. 3 of 25 answered") with **Carry on** or **Start again**.

**The question strip** sits under the bar: 44px squares, answered = filled, current = teal ring, flagged = a flag icon. Each is a real button named in words ("Question 3, answered, flagged"). Beside it: "3 of 25 answered · 1 flagged". On a phone the squares scroll sideways **inside the strip**; the page never scrolls sideways.

**The question.** "QUESTION n OF m", a marks chip, a clock and "about {marks × 1.2, rounded} min" (the paper's 2 hours over its 100 marks; arithmetic, not an exam board rule). The case study or source material is a `<details>` box on the subject tint: open on desktop and tablet, open on a phone only for question 1. It shows the paper's own context and tables as they are. Then the prompt (30px, 24px on a phone), and either the paper's own answer options (no feedback of any kind) or a box with "{n} words · saved". Footer: **Flag to check** (on = yellow tint, a flag and "Flagged"), Previous, Next question or Finish. A choice between two essays keeps its "Attempt this question for section …" choice, and Finish waits until each is made.

**The timer.** An ink pill that counts down the paper's time (`role="timer"`, not read out every second). At 5 minutes left it becomes the yellow tint with the same clock icon and words; it never flashes. A separate polite notice says "5 minutes left." once and "1 minute left." once. Untimed shows a neutral "Untimed · n min in", counted in whole minutes. The seconds spent on each question are recorded (kept in the saved attempt for PR 4's evidence). The clock follows real time, so a sleeping tab does not lose time. When the time runs out the answers are handed in and there is no way back to the questions.

**Leaving.** The close button (and Esc) opens an inline yellow panel, "Leave this mock?", with focus on **Keep going**. Timed: "Your answers are saved and you can finish it later. The timer stops, so it won't count as a timed mock." **Save and leave** saves the attempt as untimed. The clock keeps running while the panel is open: leaving is a choice, not a pause. A saved attempt always carries on untimed.

**Autosave.** Every answer, flag and choice is saved after a short pause, and when the page is hidden, so a refresh loses nothing. **Where:** in this browser (localStorage), per student and per mock, behind a `MockDraftStore` interface (`src/app/mock-exam-drafts.ts`). Saving on the server needs the exam-attempts/drafts table (data model proposal section 7), a migration that needs the Founder's approval, so it is **not built here**; the interface lets it replace the browser version without touching the screens.

**What happens at the end (until PR 3).** Finish, or time running out, hands the written paper to the existing self-marking ("Self-mark your paper"), which is unchanged: the student compares each answer with the marking guidance and awards AO marks. REV marking, the hand-in screen and the examiner guide are PR 3. **Evidence:** a mock that stayed timed from the first second to the last saves each question's marks and the whole-paper attempt as timed (as before). An untimed mock, or a timed one that was left, saves each question's marks (Understanding) but **no whole-paper attempt**, so it never feeds Exam readiness (the PR 4 evidence rule, applied early because the readiness engine would otherwise count it).

**Removed:** the old Pause and Stop exam controls and the 10-minute "Under 10 min" timer state (the old simulator is still used on the paper-level route, unchanged). The timer no longer pauses; leaving replaces Stop.

## Not built yet
- Examiner guide (untimed), the hand-in screen, the "TIME'S UP" screen and REV marking (PR 3).
- Results and the `mock_exam` evidence source (PR 4).

## Tests
- `src/app/exam-prep.test.ts`: the paper guide against AQA's structure and the factory's objectives, that every item not from the factory is flagged and listed for the checker, suggested minutes worked out from marks, the date and topic wording, mock rows, REV's suggestion and "Last mock".
- `src/app/mock-exam.test.ts`: the timer (format, yellow at 5 minutes, milestones once), untimed counter, question names, suggested minutes, the Before you start numbers, leaving, and the saved attempt (including broken storage).
- `tests/e2e/mock-exam-flow.spec.ts`: Before you start (timed, untimed, Not now, focus), the strip and question (no feedback, flags, words saved), the timer (not read every second, yellow, announced once), time's up, leaving and carrying on, refresh autosave, evidence for untimed and timed hand-ins, the case study box, no sideways scroll at 1440 / 960 / 620 / 390 / 320, accessibility.
- `tests/e2e/exam-prep-page.spec.ts`: opens in the shell, order and wording, no date, one paper open at a time, AOs and command words, mock rows, the pop-up and focus return, no sideways scroll at 1440 / 960 / 620 / 390 / 320, no label wraps mid-label, accessibility check, and that the items still being checked all carry the flag. Set `EXAM_PREP_SHOTS=<folder>` to also write the light and dark screenshots at 1440, 834 and 390.
