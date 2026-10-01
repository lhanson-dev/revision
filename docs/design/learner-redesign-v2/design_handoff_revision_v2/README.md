> **v2.1 update:** the screenshots and v2 mockups that used to be in this folder are superseded and have moved to `archive/`. The current screens are `ui_kits/learner_app/index.html` (see `ui_kits/learner_app/README.md` for the route of each screen) and the gallery `Revision Screens v2.1.dc.html`. Rules: `STYLE_GUIDE.md`, `SUBJECT_PALETTE.md`, `RESPONSIVE.md`, `CHANGES_v2.1.md`. Where anything below conflicts with those, they win.

# Handoff: Revision learner app redesign (v2)

## Overview
A redesign of every learner-facing screen in `lhanson-dev/revision`. The goal is to make it more engaging for teenagers while keeping the Calm Teal brand. There are **no game mechanics** (no XP, streaks, levels, badges or leaderboards). Engagement comes from bolder type, colour-coded subjects, clear progress bars, and **REV**, the AI support. REV (1) answers questions whenever the student asks, and (2) looks at the student's progress data and suggests what to do next, always saying why.

## About the design files
The files in `designs/` are **design references made in HTML**. They show the intended look and content; they are not production code. Rebuild them in the existing React + TypeScript codebase using its patterns (`src/app/ui/*`, `brand-tokens.css`, existing screens). Do not copy the HTML across. Open `designs/Revision Desktop v2.dc.html` in a browser to view them (keep all files in the same folder). The theme toggle (light/dark) is a prop on the root.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii and copy are final. Match them closely, reusing existing components where they fit (buttons, cards, progress, icons from `ui/Icon.tsx`). Keep the existing app shell and routing.

## Screens → repo files
| # | Screen | Design frame | Likely repo files |
|---|---|---|---|
| 01 | Home (populated) | Desktop v2 "01 · Home" | `PlannerHomeScreen.tsx`, `HomeFocusedActivity.tsx`, `RevPresence.tsx` |
| 02 | Plan (week) | "02 · Plan" | `PlanScreen.tsx`, `PlannerRuntime.tsx` |
| 03 | Courses | "03 · Courses" | `CoursesScreen.tsx`, `courses.css` |
| 04 | Course Overview | "04 · Course Overview" | `CourseExperienceScreen.tsx`, `CourseHeader.tsx`, `course-overview-rev-feature.css` |
| 05 | Learn | "05 · Learn" | `LearnReadingWorkspace.tsx`, `FocusedLearningWorkspace.tsx` |
| 06 | Practice | "06 · Practice" | `FocusedLearningWorkspace.tsx` |
| 07 | Exam Prep (timed) | "07 · Exam Prep" | `ExamSimulator.tsx`, `exam.css`, `course-exam.css` |
| 08 | Progress | "08 · Progress" | `ProgrammeProgressScreen.tsx` |
| 09 | Ask REV | "09 · Ask REV" | `PlannerRevScreen.tsx`, `ask-rev-cta.css` |
| 10 | Onboarding | "10 · First-use onboarding" | `FirstUseGate.tsx`, `first-use.css` |
| 11 | Sign in | "11 · Sign in" | `AuthGate.tsx`, `auth-entry.css` |
| 12–14 | Empty states (Home, Plan, Progress) | Desktop v2 second section | same screens, zero-data branch |
| Nav | Sidebar | `Sidebar.dc.html` | `ContextualLearnerNavigation.tsx`, `contextual-navigation.css` |
| Brand | REV "living e" mark | `LivingE.dc.html` | `ui/BrandAsset.tsx`, `assets/brand/source/revision-rev-living-e-master.svg` |
| Phone/Tablet | P1–P4, T1–T2 | `Revision Mobile v2.dc.html` | responsive CSS for the screens above |

Suggested order: tokens → sidebar/shell → REV suggestion card component → Home → Plan → Courses/Overview → Learn/Practice → Exam → Progress → Ask REV → Onboarding/Sign in → empty states → responsive.

## Design tokens
Add these to `brand-tokens.css` (or map them onto existing tokens if they're close).

### Colours: light / dark
| Token | Light | Dark | Use |
|---|---|---|---|
| --bg | #f3f7f5 | #0b1518 | page background |
| --sf | #ffffff | #121f24 | cards/surfaces |
| --soft | #e2f3ef | #163430 | teal tint, selected states |
| --line | #dde8e4 | #233639 | borders, empty progress tracks |
| --tx | #132026 | #e8f3f0 | primary text |
| --tx2 | #4f6268 | #9db1b2 | secondary text |
| --acc | #0f7a6d | #52d6c2 | teal text/links |
| --deep | #0f2f36 | #0a2b2d | REV cards, dark hero panels |
| --coralS / --coralT | #ffe7df / #b13d1f | #3b231d / #ffab94 | coral tint / text |
| --sunS / --sunT | #fff1c9 / #7a5600 | #372d14 / #ffd97a | yellow tint / text |
| --vioS / --vioT | #ebe8ff / #4b3dc4 | #25214a / #b8afff | violet tint / text |

Fixed (both themes): teal **#2bb6a3** (primary buttons, progress, checks; text on it #0f2f36), coral **#ff7a59**, yellow **#ffc53d**, violet **#7b6cf6**. Text on the `--deep` panels: #e8f3f0, muted #b7cfcc, label #7fe3d3.

### Subject colours
Each course gets one fixed colour, used for its tile, progress bar and plan blocks: Business #2bb6a3 (text #0f2f36), Biology #ff7a59 (#3a130a), Psychology #7b6cf6 (#fff), Maths #ffc53d (#3d2b00). Assign new subjects from this set in turn.

### Typography
- Display: **Bricolage Grotesque** 800 (Google Fonts, opsz 12–96). H1 46px/1.0, letter-spacing −0.025em; card titles 22–38px; big stats 56px.
- UI/body: **Manrope** 500–800. Body 15–18px/1.5–1.6 weight 600; labels 14–16px weight 700–800.
- Eyebrow labels: Manrope 800, 12px, uppercase, letter-spacing 0.12–0.14em.

### Radii / spacing / shadow
- Radii: pills 999px; big cards 24–28px; list rows/options 16–20px; small chips 12–14px; progress bars 9px.
- Main padding 36px 40px (desktop); grid gaps 20–24px; inside cards 22–36px.
- Frame shadow (mock only): 0 20px 60px rgba(15,47,54,.14). Cards use a 1px `--line` border and no shadow. Focus/active input: 2px #2bb6a3 border + 0 0 0 5px `--soft` ring.
- Buttons: primary = #2bb6a3 fill, #0f2f36 text, 48–56px tall, pill; secondary = `--tx` fill with `--bg` text, or `--sf` with a 1px `--line` border.

## Key new component: REV suggestion card
Used on Home ("REV suggests", "REV noticed"), Plan, Course Overview ("REV's advice"), Progress ("REV's read"), Learn (sidebar).
- `--deep` background, 24px radius, 22px padding, 12–16px gap.
- Header: LivingE mark (30px) + eyebrow label in #7fe3d3.
- Body: one or two sentences in Manrope 700 15–16px. **Always include the reason** based on the data ("you scored 38%…", "not touched in 9 days").
- Actions: a primary pill (#2bb6a3) that does the suggestion (add to plan, start practice) + a secondary pill (rgba(255,255,255,.1)) to dismiss or ask for something else.
- On Home, the main suggestion expands into a 3-step session list (Learn → Practice → Exam Prep) showing done/current/upcoming states.

## Interactions & behaviour
- **Ask REV** is always one click away: a pill in the Home header, the centre button of the mobile tab bar, a sidebar entry, and "Stuck? Ask REV" prompts in Learn. Suggested prompts are tappable chips.
- Suggestion actions: "Add to Thursday" / "Move it" edit the plan; "Suggest something else" asks REV for another option; "Not now" hides the card for the day.
- Practice: after answering, a full-width feedback bar slides up from the bottom (teal = correct, coral = wrong). It says why, and a wrong answer is queued to come back later. The top bar shows question progress (e.g. 5 / 10).
- Exam Prep: focus mode (no sidebar), countdown timer, question grid (answered / flagged / current), autosave, and an examiner checklist that ticks off as the answer covers each point (hidden in real mocks).
- Plan: Day/Week/Month segmented control; today's column is highlighted in `--soft`; done sessions shown at 55% opacity; REV-picked sessions labelled "REV PICK".
- Onboarding: 4 steps (subjects → exam dates → study times → plan). Multi-select subject chips fill with the subject colour when picked; exam board picker for each subject.
- Theme: light/dark via `[data-theme=dark]` token swap.
- Responsive: desktop 1440 (248px sidebar); tablet 1024 (84px icon rail); phone 390 (bottom tab bar Home/Plan/REV/Courses/Progress, REV raised in the centre).

## Data REV needs (state / back end)
The suggestions depend on progress data. For each learner, expose:
- Mastery % per topic and per course; recent quiz scores per topic.
- Last-studied date per topic/course (for "not touched in N days").
- Upcoming exams/quizzes with dates and the topics they cover.
- Planned sessions (day, time, length, type, subject, done flag) and study time logged.
- A suggestion engine returning `{ title, reason, steps[], actions[] }`, with dismiss/snooze saved.
Empty states (no data yet) show setup steps and explain that suggestions get better after a few sessions.

## Copy tone
Warm, direct, second person, short sentences, like a helpful older student. REV speaks in first person ("I'd give it two sessions this week"). No game language (no "missions", "XP", "streaks", "unlock").

## Assets
- REV living-e mark: `assets/brand/source/revision-rev-living-e-master.svg` (already in the repo); animated version in `designs/LivingE.dc.html`.
- Wordmark: `assets/brand/exports/revision-wordmark-primary-light.svg`.
- Icons: simple 2.2–2.6px stroke line icons; use `ui/Icon.tsx`.
- Fonts: Bricolage Grotesque + Manrope (Google Fonts).

## Files
- `designs/Revision Desktop v2.dc.html`: screens 01–14
- `designs/Revision Mobile v2.dc.html`: phone P1–P4, tablet T1–T2
- `designs/Sidebar.dc.html`, `designs/LivingE.dc.html`: shared parts
- `designs/support.js`: runtime needed to open the design files in a browser (not for production)
- `screenshots/`: light-theme PNGs to compare against. `desktop-01…14` (1440×900), `phone-P1…P4` (390×844 @2x), `tablet-T1…T2` (1024×768). Open the design files and switch the theme prop for dark.
