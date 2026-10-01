# Revision — New Features Spec (for build + back end)

Features added in the v2 mockups that the current site doesn't have (or only partly has). Each one lists what the student sees, the rules, and the data/back-end work needed. Visual rules are in `STYLE_GUIDE.md`; screen specs are in `README.md`.

---

## F1. REV suggestions ("REV suggests")
**Where:** Home (main card), Plan, Course Overview ("REV's advice"), Learn sidebar.
**What:** REV picks the next best thing to revise and says why.

Rules:
- Every suggestion has: title, reason (from real data), 1–3 steps, 1 primary action, 1 secondary action.
- Priority order for picking a topic:
  1. Exam/quiz within 14 days covering a topic with mastery < 60%
  2. Topic with a recent quiz score < 50%
  3. Topic not studied for 7+ days that has an exam coming
  4. Next unstarted topic in the course order
- Never suggest the same topic twice in one day unless the student asks.
- "Suggest something else" returns the next candidate in the list.
- "Not now" hides that suggestion until the next day.
- If there's not enough data (fewer than ~3 sessions), show the empty state instead of guessing.

Back end:
- `GET /rev/suggestions?context=home|plan|course:{id}|learn:{topicId}` → `[{ id, title, reason, subjectId, topicId, steps[], actions[] }]`
- `POST /rev/suggestions/{id}/dismiss` with `{ until }` (snooze), `POST /rev/suggestions/{id}/accept`
- Store dismissals so the same card doesn't come back the same day.
- Engine can start rule-based (above); LLM only rewrites the wording of `reason`, it does not choose the topic.

## F2. Guided session (Learn → Practice → Exam Prep)
**Where:** Home main suggestion expands into a 3-step list.
Rules:
- Steps show done / current / upcoming.
- Finishing a step marks it done and moves "current" on.
- Session can be left and resumed the same day.
Back end: `sessions` record `{ id, topicId, steps[{type, status}], startedAt, completedAt }`.

## F3. "REV noticed" patterns: DEFERRED (not at launch)
Removed from Home and Progress for launch. Keep the data (session and quiz history) so it can come back later.

## F4. Smarter Plan
**Where:** Plan screen.
- Day / Week / Month views.
- Today's column highlighted; done sessions faded; REV-added sessions labelled "REV PICK".
- "Add to Thursday" / "Move it" from REV cards edits the plan directly.
Rules:
- Don't double-book a time slot; REV picks the next free slot inside the student's chosen study times.
- Sessions use the subject's catalogue hue. Quizzes and exams use the same subject colour; the title says what they are.
Back end: `planned_sessions { id, userId, subjectId, topicId, date, start, durationMin, type, source: 'student'|'rev', done }`; CRUD endpoints.

## F5. Practice feedback + retry queue
**Where:** Practice.
- After each answer, feedback bar slides up: correct (teal) or wrong (coral), with the explanation.
- Wrong answers are added to a retry queue and come back later in the same set or the next session.
- Question progress shown (e.g. 5 / 10).
Rules:
- A queued question comes back after at least 3 other questions.
- Answered correctly on retry → removed from the queue.
Back end: `attempts { userId, questionId, correct, answeredAt }`, `retry_queue { userId, questionId, dueAfter }`.

## F6. Exam Prep focus mode
**Where:** Exam Prep.
- No sidebar; countdown timer; question grid (answered / flagged / current); autosave.
- "What examiners look for" panel: labelled as **a guide, not a mark**. Practice mode only; **hidden in timed mocks**. Items show as covered or not yet covered, never as marks awarded.
Rules:
- Autosave every 10 seconds and on question change.
- Timer runs server-side truth; if the tab closes, time keeps counting.
Back end: `exam_attempts { id, examId, startedAt, endsAt, answers{}, flags[] }`; marking-point check endpoint (LLM or keyword match) returns which checklist items are covered.

## F7. Progress: three measures, never one mastery %
- **Topics covered**: x of y topics with any evidence (shown on tiles, cards and Progress, as a 56px number).
- **Understanding**: count of topics in each status: Got it / Nearly there / Needs work / Just started (some answers, too few to tell) / Not started. Shown as a stacked bar with text labels.
- **Exam readiness**: a value (format TBD, e.g. a grade range) or "Not enough evidence yet".
Rules: status thresholds and the readiness model need defining (not in this spec). Never combine the three into a single %.
Back end: `GET /progress` → per course `{ topicsCovered, topicsTotal, understanding: { gotit, nearly, needswork, started, notstarted }, readiness: { value | null, evidenceCount }, topics[{ id, status, lastStudiedAt }], minutesThisWeek }`.

## F8. Ask REV everywhere
- Entry points: Home header pill, sidebar, mobile centre tab, "Stuck? Ask REV" in Learn.
- Suggested prompts as tappable chips, tailored to the current screen/topic.
Rules: REV gets the current topic and the student's recent scores as context. REV answers questions; it never does graded exam answers for the student during a mock.
Back end: `POST /rev/chat` with `{ context: { screen, subjectId, topicId }, messages[] }`; `GET /rev/prompts?context=…`.

## F9. Onboarding
Order: **Level** (GCSE / A-level; both allowed) → **subjects** at that level → **exam board** per subject. Then exam dates, study times and the first plan (**to confirm**: these weren't in the v2.1 decision).
Rules:
- Subject chips fill with the subject's catalogue hue when picked.
- Subjects or boards not offered yet can still be added and show "Coming soon" (neutral). Store the request so you can tell the student when it's ready.
Back end: `enrolments { userId, subjectId, level, examBoard, examDate, available: bool }`, `study_availability { userId, day, start, end }`, `POST /plan/generate` (skips unavailable courses).

## F10. Empty states
Home, Plan, Progress have zero-data versions: setup steps + "REV's suggestions get better after a few sessions".
Rule: show the empty state until the student has ≥ 3 completed sessions.

## F11. Subject colours
Rule: one hue per **top-level subject** in the catalogue (`subjects.hue`), inherited by every course. Split subjects (Biology, Chemistry, Physics; English Language, Literature) use family variants (`violet-bio` etc.). Never teal, yellow or coral. See `SUBJECT_PALETTE.md`.

## F13. Quick check (Learn)
An unscored check inside Learn: dashed neutral card with a "Not scored" tag. Answers give feedback but **never** change status, topics covered or readiness. They can still be logged for REV's context.

## F14. Living E states
The REV mark reflects what REV is doing: waiting, listening (the student is typing in Ask REV), thinking (request in flight), responding (stream started → settles → waiting). With reduced motion, show a text label instead. The front end needs typing and streaming events from the chat; no extra back end.

## F12. Light / dark theme
Toggle saved per user (`users.theme: 'light'|'dark'|'system'`); default `system`.

---

## Data REV needs (summary)
- Mastery % per topic and course; quiz scores per topic with dates.
- Last-studied date per topic.
- Upcoming exams/quizzes with dates and covered topics.
- Planned sessions and logged study time.
- Dismissed/snoozed suggestions.
- Study availability and exam boards.

## Out of scope (on purpose)
No XP, streaks, levels, badges, leaderboards or rewards. No "REV noticed" pattern cards at launch. Engagement comes from clear progress and useful REV suggestions.

## Suggested build order
1. Tokens + theme (STYLE_GUIDE) → 2. Data model (enrolments, sessions, attempts, planned_sessions) → 3. REV card component + rule-based suggestion engine (F1) → 4. Home + guided session (F2) → 5. Plan (F4) → 6. Practice queue (F5) → 7. Exam focus mode (F6) → 8. Progress + insights (F3, F7) → 9. Ask REV (F8) → 10. Onboarding (F9) → 11. Empty states, responsive.
