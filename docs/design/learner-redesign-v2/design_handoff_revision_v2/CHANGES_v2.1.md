# Design system v2.1: decisions applied + conflicts

This applies the decisions from "Revision Design System v2". **I couldn't open that artifact link** (it needs a claude.ai sign-in), so this was built from the decisions summary pasted in chat. If the full doc has more detail (e.g. status thresholds), paste it in and I'll reconcile.

## Conflicts with what was built before (now changed)
| # | Before (v2) | Now (v2.1) | Notes |
|---|---|---|---|
| 1 | Subjects used teal (Business), coral (Biology), yellow (Maths), violet (Psychology) | Separate subject palette; Business blue, Science violet, Psychology umber, Maths sky | Teal / yellow / coral are now brand + status only |
| 2 | Subject hue assigned **per student** in enrolment order and stored on the enrolment | Hue fixed **per top-level subject in the catalogue**; every course inherits it | Back-end change: `subjects.hue`, not `enrolments.colourHue` |
| 3 | Yellow = "coming up / exam soon" | Yellow = **Nearly there** only | Upcoming/exam-soon is now neutral + clock icon |
| 4 | Violet tint "Next exam" card on Home | Neutral card | Violet belongs to Science now |
| 5 | Tags "Needs love", "On a roll", "Mock in 23d" | Five fixed status labels; dates as plain text | |
| 6 | Single mastery % (tiles, course cards, Progress big number) | Topics covered · Understanding · Exam readiness | 56px number is now Topics covered |
| 7 | "REV noticed" pattern cards (Home, Progress "REV's read") | Removed for launch | F3 deferred |
| 8 | Living E: still, with an optional "thinking" sway | Always moving; 4 states; reduced-motion label | |
| 9 | Onboarding: subjects → exam dates + boards → study times → plan | Level → subjects → board per subject (+ Coming soon) | **Open:** exam dates, study times and first-plan steps aren't in the new order. I kept them *after* boards. Confirm or cut. |
| 10 | Examiner checklist "ticks as the answer covers marking points" | "What examiners look for: a guide, not a mark"; practice mode only; hidden in timed mocks | |
| 11 | Quick check used the yellow bolt | Neutral dashed card, "Not scored" tag | Yellow is status now |
| 12 | Plan: Friday quiz block in teal | Same solid subject colour as other sessions | |
| 13 | Voice: "warm older sibling" | Older student who aced these subjects; never claims to be human | Close, but reworded |

## Things I had to decide (check these)
- **Palette size:** 10 top-level hues + 5 family variants. See the closest pairs in `SUBJECT_PALETTE.md`.
- **Subject → hue mapping** beyond Science, Business and Combined Science is a suggestion (see the table below).
- **Subject icon:** decided. Letter marks (periodic-table style) are the subject icons; no pictograms.
- **Status thresholds** (what counts as Got it / Nearly there / Needs work / Just started) aren't defined here. The back end needs them.
- **Exam readiness format:** shown as text such as "Grade 6–7". The real value format is open.

## Still to update
- `Revision Desktop v2.dc.html`, `Revision Mobile v2.dc.html` and the `screenshots/` in this folder **still show the old rules** (teal subjects, mastery %, REV noticed). The design system and UI kit are updated; the mockups are not yet.

## v2.1.1 (after Plan review)
- **Psychology moved from plum to umber.** Plum and the Biology violet were nearly the same hue, so Biology and Psychology looked alike on Plan. History takes plum (dark), and the Biology variant moves slightly bluer (H 308).
- **Plan blocks are now solid subject colour + a letter mark** (white square, ink letter) for upcoming and done sessions. Done = same full colour, title struck through, plus "✓ Done" (never fade the text). Pale tints were too similar to tell subjects apart. Quizzes and exams use the same solid subject colour as any other session (the title says "quiz").
- **Letter marks are the official subject icons** (`subjects.mark`).
