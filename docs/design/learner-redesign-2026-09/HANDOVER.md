# Revision learner redesign: handover for Claude Code

> **SUPERSEDED on 1 October 2026.** This 30 September 2026 Claude Code handover is replaced by the learner redesign v2.1: decisions in `docs/design/decisions/2026-10-01-learner-redesign-v2.md`, design values and tracker in `docs/design/learner-redesign-v2/`. Its findings stay here as historical evidence. Do not build from it. Where it conflicts with the v2.1 decisions (for example the navigation drawer, Ask REV dock, pale subject accents and Manrope-only typography), follow the v2.1 decisions.


**From:** Claude (Cowork design review session) · **For:** a Claude Code session on `lhanson-dev/revision` · **Date:** 30 September 2026 · **Owner:** Lee (Founder)

This brief covers everything needed to put the approved design review into the learner app. The work is split into small pull requests. Read sections 0–2 before touching code.

---

## 0. Ground rules (read first)

1. **`CLAUDE.md` still governs.** Work on a branch, **open one PR per step below**, and **stop before every merge**. Lee approves each PR himself.
2. **Lee doesn't read code.** Every PR ends with the plain-English summary in section 8, including before and after screenshots.
3. **This is learner-interface work, not Content Factory work.** Don't change anything under `content-factory/`, `research/`, `scripts/assurance/` or the content schemas, and don't generate or edit teaching content.
4. **Don't write new standards or ADRs** (CLAUDE.md rule 2). The designs sit inside the existing authorities:
   - `20-brand-and-experience/Visual Brand System.md` (palette, type, spacing, surfaces, REV states)
   - `10-product-governance/Global Learner Navigation.md` (rail, drawer, Ask REV dock, course branch expansion)
   - `20-brand-and-experience/Educational Treatment System.md` (Key idea, Worked example, Quick check…)
   - `20-brand-and-experience/Tone of Voice Framework.md` and `Emotional Experience Principles.md`

   If a change seems to conflict with one of these, stop and ask Lee one question.
5. **Honest data only.** The mockups show a returning student ("Alex") with **sample** numbers and **sample** teaching content (break-even, 3.5.2). Bind every number and label to real app data. If the data doesn't exist yet, leave that element out or show the honest empty state. Never hard-code sample figures.
6. **Use existing tokens and components.** Colours, radii, spacing and type come from `src/app/brand-tokens.css`. Reuse the `src/app/ui/*` components (`Button`, `Status`, `EmptyState`, `EducationalTreatment`, …) and `RevPresence` for the Living E. **Add no new colours.**
7. **Accessibility is not optional.** Learner controls are 48px (touch targets at least 44px). Status is always icon + text, never colour alone. Feedback goes in `aria-live` regions. The `tests/e2e/accessibility.spec.ts` (axe) checks must pass.

---

## 1. What's in this package

| Item | What it is |
| --- | --- |
| `HANDOVER.md` | This brief |
| `learner-quick-fixes.patch` | One ready commit (see step 1) |
| `design-review.md` | The full review: findings per page, with the standard each one relates to |
| `images/01–23*.png` | The approved designs, desktop and phone |
| `mockups/*.html` | **Clickable** mockups. Open in a browser (they need `runtime.js` beside them). Use them to check behaviour, spacing and wording. |

If this package is attached to your session, commit it to the repo as `docs/design/learner-redesign-2026-09/` in step 1, so later PRs can link to it.

The mockups are reference, not production code. Rebuild them with the app's React components and CSS. Don't copy the mockup markup.

---

## 2. Order of work (one PR each)

| PR | Branch | Scope | Why this order |
| --- | --- | --- | --- |
| 1 | `fix/learner-quick-fixes-review` | Apply the patch, and add the design package under `docs/design/…` | Already built and tested. Fixes a visible bug. |
| 2 | `design/course-header-and-practice` | Shared course header plus the **Practice** redesign | Lee will test the 3.5 slice as a student. Practice matters most. |
| 3 | `design/learn-reading` | **Learn** page layout, treatment styling, and the Quick check treatment | Second most used. Content arrives with the 3.5 slice. |
| 4 | `design/course-overview` | **Course Overview** | Orientation hub for the course |
| 5 | `design/progress-shared-measures` | **Course Progress** and **global Progress** together | They must share wording and measures |
| 6 | `design/exam-prep` | **Exam Prep** | Uses the existing `ExamSimulator` |
| 7 | `design/courses-index` | **Courses** list page | Small |
| 8 | `design/plan-week-first` | **Plan** | Bigger layout change |
| 9 | `design/first-visit` | **New student** (no courses yet) Home state | Onboarding |
| 10 | `design/home-returning` | **Home** (returning student) | Depends on 2–8 for its links |
| — | *(not now)* | **REV conversation page** | Needs product decisions about real REV answers first. Build nothing that fakes REV replies. |

Start each PR from the latest `main`. Keep every PR to one page, plus any shared piece it introduces.

---

## 3. Step 1: quick-fix PR

```bash
git checkout -b fix/learner-quick-fixes-review origin/main
git am -3 learner-quick-fixes.patch        # applies cleanly on main @ f3a16dd
npm ci && npm run validate                  # typecheck, lint, unit tests, build
```

What the patch does:

- **Plan:** the weekly steppers no longer truncate to "N.." on desktop.
- **Courses:** "Remove from my courses" is moved away from "Open course" and de-emphasised, with plain wording in the confirmation. The header no longer squeezes "Add course" onto two lines, and the stretched empty rows are gone.
- **Copy:** Home says "Hey {name}". REV, Progress, Courses and the first recommendation reasons are rewritten without system language.
- **Tests:** e2e specs are updated for the new greeting, button name and reason strings.

**Expected test impact:** the exact-digest visual baselines in `tests/e2e/interface-visual-regression.spec.ts` for **home, plan and courses** will change (see section 7). Also add the design package to `docs/design/learner-redesign-2026-09/` in this PR.

---

## 4. Shared pieces (build in PR 2, reuse afterwards)

**Course header.** This replaces the tall header in `CourseExperienceScreen.tsx`, currently around line 320. It shows:

- a breadcrumb `Courses › {Subject}`;
- a 52px subject icon tile (Warm Sand accent);
- `{Subject}` as the H2-size title, e.g. "Business";
- a metadata line `{Board} {Level} · {Spec code} · exams {season year}`, e.g. "AQA A-level · 7132 · exams summer 2027";
- underline section tabs: Overview · Learn · Practice · Exam Prep · Progress.

Header rules:

- Remove the eyebrow ("AQA · SPECIFICATION 7131") and the intro sentence ("Learn and practise the shared course syllabus here…") from **every** section.
- The active tab uses a 3px Primary Teal underline and bold text.
- On phone, all five tabs share the width equally in one row (12.5px, `white-space:nowrap`), with no hidden overflow.
- The left rail keeps its governed course-branch expansion. Don't remove it.
- The exam year only appears if it's known from course data. Otherwise leave it off.

**Status badge.** Four states, always icon + text:

| State | Colours |
| --- | --- |
| Secure | success fg/bg |
| Developing | info fg/bg |
| Needs work | warning fg/bg |
| Not started / Not enough evidence yet | mist bg, secondary text |

Map these from the existing readiness engine (`src/engine/readiness/readiness.ts`). Don't create new thresholds. If the engine has no equivalent of a state, ask Lee rather than inventing one.

**Guidance banner.** A Soft Aqua surface (radius 24) holding a small Living E (`RevPresence`, resting), an eyebrow, a one-line title, a one-sentence reason and one primary action. On phone it stacks vertically. Use it for "Up next", "Recommended next" and "Your biggest gain right now".

---

## 5. Page specs

For every page, the matching image and clickable mockup are named in brackets.

### 5.1 Practice (`images/15`, `21` · `mockups/Practice.html`)

**Files:** `FocusedLearningWorkspace.tsx` (`section="practice"`) and the practice branch of `CourseExperienceScreen.tsx`.

**Problem (from the review):** two activities compete, and system caveats come before the task. The root cause is that `defaultMode('practice')` returns `'flashcards'` even when the recommendation is a Quick check.

**Build:**

- **Open the recommended activity by default.** If there's no recommendation, open Quick check.
- **The task fills the main column (max 760px).** It shows:
  - the label `Quick check · {topic}` and `Question n of N`;
  - a segmented progress bar;
  - the question as an H3 (21px);
  - options as full-width 52px radio-style buttons;
  - a **Check answer** button, disabled until an option is chosen, plus a "Show a hint" tertiary button if the content has hints;
  - after checking, a feedback box: **Correct** (success) or **Not quite** (warning, not error), with the content's explanation, then **Next question** or **Try again**.
- **Right column (300px):** a "Why this activity" card with one sentence built from the recommendation, plus a "This session" card showing correct so far and elapsed time. On phone it sits below the task.
- **Below:** "Other ways to practise {topic}", with Flashcards, Case study and Formulas & data as secondary cards. These replace the old tab row, which was cut off on phone.
- **Remove:**
  - the "Evidence used: … Confidence limitation: …" text;
  - the "Scored evidence — your self-rating is recorded…" bar;
  - the "Practice · {course}" heading;
  - the Topic dropdown in the header. Move the topic choice into a small "Change topic" control next to the activity label.
- **Keep:** evidence recording (`createMultipleChoiceEvidence` etc.) exactly as it is.
- **Wording:** wrong-answer feedback comes from content data. If the content doesn't carry per-option explanations, show only the general explanation. Don't write new explanations in code.

### 5.2 Learn (`images/14`, `20` · `mockups/Learn.html`)

**Files:** `LearnReadingWorkspace.tsx`, `learn-reading.css`, and `ui/EducationalTreatment.tsx`.

**Good news:** Learn already renders content blocks through `EducationalTreatment` (key-idea, example, worked-example, misconception, recap, quantitative…). Most of this PR is layout and styling.

**Build:**

- Use the shared course header (section 4). The lesson must start well above the fold.
- **Reading column (max 720px) plus a 240px sticky "On this page" panel** with section anchors and a `{subsection} · page n of N` progress bar. The panel is hidden on phone.
- **Page top:** a trail `{area} › {subsection}`, the H1 (34px), a one-line lead (18px, secondary text) and `Page n of N · about X minutes`, only if a reading time is available.
- **Remove** the templated subtitle ("Understand the key ideas in … and how they connect to the wider topic").
- **Treatment styling, as defined in the Educational Treatment System:**

| Treatment | Style |
| --- | --- |
| Key idea | Thin teal left marker, small uppercase label, no card |
| Formulas (quantitative) | Soft surface, formula lines in bold, operators in secondary colour |
| Worked example | Card with a soft header strip holding the problem, then numbered steps with teal counters |
| Common mix-up (misconception) | Mist surface. **Not** warning colours. |
| What to remember (recap) | Label plus a list, quiet |

- **Add a Quick check treatment.** It's in the Educational Treatment System but missing from `EducationalTreatmentKind`. Its label says "Not scored". It has option buttons, immediate feedback explaining why, and allows another try. It must **not** record evidence.
  - Only render it when the content supplies a quick-check block. If the schema (`content/learn-schema.ts`) has no such block, **stop and ask Lee**. Adding it to the schema is a Content Factory decision.
- **Page close, in this order:**
  1. A contextual "Still not clicking? … Explain it another way" row, using the existing `onOpenRev` with the page context.
  2. A "Ready to try it? n questions · about X minutes · scored" card with a primary button to Practice for this topic.
  3. Previous and Next page cards.

### 5.3 Course Overview (`images/13`, `19` · `mockups/CourseOverview.html`)

**File:** the overview branch of `CourseExperienceScreen.tsx` (about lines 327–356).

**Build:**

- **Remove** the dark feature hero, the "Powered by REV" pill and the second Ask REV input.
- **Two-column row:**
  - Left: an "Up next in {Subject}" card, built from the existing recommendation. It shows the title, activity, time and spec code, a one-sentence reason from `recommendation.reason`, a primary **Start** button, and a tertiary alternative.
  - Right: an "At a glance" quiet card with Topics covered (x of y, with a bar), Scored answers, and an Exam readiness badge, plus a "See course progress" link.
- **Topics:** every specification area as a card showing the code, name, status badge, a coverage bar, and **Learn** plus **Practise/Start/Review** links. It's a 2-column grid on desktop and 1 column on phone. Areas come from the course map. Don't hard-code 7132.
- **Your papers:** one small card per paper, showing length, marks, a one-line format and an "Add exam date" link to Plan. Show the date instead once it's set. Take format and marks from course/exam data only. If the data is missing, show just the paper name.

### 5.4 Course Progress and global Progress (`images/17`, `23`, `04`, `10` · `mockups/CourseProgress.html`, `Progress.html`)

**Files:** the progress branch of `CourseExperienceScreen.tsx` (about line 379) and `ProgrammeProgressScreen.tsx`.

**Both pages use the same three measures, with the same names:**

| Measure | Shows |
| --- | --- |
| **Topics covered** | x of y, with a Data Teal bar |
| **Understanding** | A small stacked bar (Data Teal, Data Blue, Data Sand, track), with direct text labels such as "1 secure · 2 developing · 1 needs work · 6 not started" |
| **Exam readiness** | Either the real estimate, or the "Not enough evidence yet" badge plus what unlocks it |

Never merge the measures into one percentage (Visual Brand System · Data visualisation).

- **Top of each page:** a guidance banner with one plain summary sentence ("You've made a start in 4 of 10 areas. Your next biggest gain is …") and a Start action.
- **By topic:**
  - Course page: every area is an expandable row (code, name, "n parts · n scored answers", status, chevron). Opening it lists its subsections with status and a Practise/Start link. Default to opening the most recently worked area.
  - Global page: the same list with a segmented filter (All / Needs work / Developing / Not started).
- **"How this is worked out":** a disclosure with three plain sentences.
- **Remove** "Shared syllabus coverage is counted once…", "Course membership itself is not progress evidence" and the stretched "Open course progress" button.

### 5.5 Exam Prep (`images/16`, `22` · `mockups/ExamPrep.html`)

**Files:** the exam-prep branch of `CourseExperienceScreen.tsx` (about lines 361–378), `FocusedLearningWorkspace.tsx` (`answer` mode) and `ExamSimulator.tsx`.

**Build, in this order:**

1. A "Recommended next" guidance banner. Only include it if a recommendation of type `exam-question` exists.
2. **Your papers:** one card per paper showing the paper chip, status ("Not attempted" or last attempt), the name, the format line, `2 hours · 100 marks` from data, and two actions, **One question** (secondary) and **Timed paper** (Deep Teal). These open the existing `ExamSimulator` flows. If there are no exam dates, add the note "No exam dates yet · add them in Plan".
3. **Exam technique:** an open-and-close list. The first item is open by default and each item shows a one-line summary. Use the existing technique content. Put the plain name first:
   - "Build analysis (BLT)"
   - "Earn evaluation (MOPS)"
   - "Calculation questions"
   - "Using the case study"
   - "Analyse questions"
   - "Evaluate and assess questions"

   Each item has its steps list plus an "Exam habit:" line.

**Remove:** the Topic dropdown, the single "Exam technique" tab, and the "Reading this guidance does not count as scored evidence" bar.

### 5.6 Courses list (`images/05`, `11` · `mockups/Courses.html`)

**File:** `CoursesScreen.tsx`.

**Build, on top of PR 1:**

- **Course card:** the icon tile, a chip `{Board} · {Level} · {code}`, the subject as an H2, and "Exams {season} · {n} papers" if the data is known.
- **Two quiet stats:** Progress (topics covered, with a bar) and Up next.
- **Section links:** Overview · Learn · Practice · Exam Prep · Progress.
- **Primary action:** "Continue {Subject}".
- **Manage menu:** a "…" icon button (with aria-label) opening a menu that includes "Remove course…". It opens the existing confirmation.
- **After the course list:** a dashed "Add another course" card.

### 5.7 Plan (`images/02`, `08` · `mockups/Plan.html`)

**File:** `PlanScreen.tsx`.

**Build:**

- **Week first.** A "This week" card with seven day columns (one column on phone). Each day shows its sessions as tiles: activity label (Learn / Practice / Exam Prep, as text), title and minutes. Today is highlighted, and its sessions can be ticked off. Days with no sessions say "Rest day". Use the planner's existing week data (`plan-week-grid`).
- **Study time:** one full-width card with seven compact steppers, two presets ("30 min on weekdays", "45 weekdays · 60 Saturday") and a live weekly total. Keep the existing save or recalculation behaviour. Presets only fill in the draft; they don't save automatically unless that's how the current flow already works.
- **Exam dates:** three labelled date fields in a row, one per paper, plus an "Add a mock or school test" tertiary button. There's an info banner, "Add your dates and REV can pace the plan to each paper.", until they're set.
- **"How your plan works":** a disclosure with three bullets. It replaces the four-line explanation panel.
- **Remove** the duplicate "Ask REV anything" input from the Plan header.
- **Set-up states:** if availability or exams are missing, set-up takes priority. The week view shows "Your plan appears here once…" in place of the grid. The order stays week, then time, then dates.

### 5.8 New student (`images/12`, `18` · `mockups/Welcome.html`)

**Files:** `PlannerHomeScreen.tsx` (the no-courses branch) and possibly `FirstUseGate.tsx`. Check how first use already flows before changing anything.

**Build:**

- **Hero:** "Hey {name}, welcome to Revision.", with the line "Three quick steps and I can build your first week of revision. It takes about two minutes." There's no REV input.
- **Set-up checklist, three steps:**
  1. Add the courses you study
  2. Add your exam dates
  3. Set your weekly study time

  Show states as done (tick and "Done"), current (primary button) and upcoming. Each button routes to the existing Courses / Plan flows. Completion comes from real data.
- **Side card:** "What you'll get" with three rows (plan, exact course, REV) and the link "Ask REV how Revision works".
- **Remove:** the "Today's revision plan" heading, "View full plan", and "It will not invent work from the wider catalogue".

### 5.9 Home, returning student (`images/01`, `06`, `07` · `mockups/Home.html`)

**File:** `PlannerHomeScreen.tsx`.

**Build:**

- **Greeting:** Display L (44px desktop, 34px mobile), stacked under the Living E and REV state on phone. Remove the "Powered by REV" pill.
- **REV input:** stays directly under the greeting.
- **Quick actions:** only include ones that route to real features, for example "What should I revise now?" opening REV with that prompt. **Don't render canned REV answers inline.** That was mockup-only.
- **Below the hero:**
  - an "Up next" card with a plain reason and a Start button;
  - a "Today" list from the planner, with tick-off;
  - "Continue where you left off", only if recent-activity data exists;
  - a slim course progress row.

### 5.10 REV page: design only, no build yet

Only build this if Lee asks. The mockup (`images/03`, `09`) shows a thread, suggested prompts, visible states (Ready / Listening / Thinking / Answered) and a "What I'm using" panel. It depends on how real REV conversations will work. Raise it with Lee as a decision rather than building a front end that fakes answers.

---

## 6. Data honesty checklist (every PR)

- [ ] No number, date, name or topic is hard-coded from the mockups.
- [ ] Readiness is only ever "Not enough evidence yet" or an engine-produced value. It's never guessed.
- [ ] Coverage, understanding and readiness stay separate.
- [ ] The empty states read well for a brand-new student with one course and no answers.
- [ ] The sample teaching content (break-even) appears nowhere in the app.

---

## 7. Tests and visual baselines

- `npm run validate` must pass: typecheck, lint, unit tests and build.
- Run the relevant `tests/e2e/*.spec.ts` for the pages you touched. Update selectors and wording where the design changed wording on purpose.
- **Visual baselines.** `interface-visual-regression.spec.ts` pins **exact SHA-256 digests** of CI screenshots for home, learn, plan, courses, practice, exam-prep and timed-exam, and uses snapshot files for admin. Any layout change will fail these. The correct process:
  1. Let CI run on the PR.
  2. Download the attached screenshots from the failing visual job.
  3. Show them to Lee in the PR summary as before and after.
  4. **Only after Lee's OK**, update the digests with a comment dated and noting his approval, in the same style as the existing comments.

  Never update digests just to make CI green.
- Local captures may differ from CI (fonts, Chromium build). Treat CI as the source of truth for digests.
- `accessibility.spec.ts` (axe WCAG A/AA) must pass. Check keyboard order, focus rings, `aria-live` on feedback, and aria-labels on icon buttons.
- Check both themes (light and dark) and phone (390px) for each page.

---

## 8. What to send Lee with each PR

```
**What changed:** 2–4 plain-English bullets about what a student will notice.
**Before / after:** desktop + phone screenshots (light), one dark-mode shot.
**How I checked it:** validate ✓, e2e specs run (names), axe ✓, visual baselines (changed/unchanged).
**What's left:** anything not done and why.
**Decision needed:** one question with options and a recommendation (or "none").
```

---

## 9. Open decisions for Lee (ask when you reach them, one at a time)

1. **Quick check in Learn:** does the Learn content schema need a quick-check block? This is a Content Factory decision (PR 3).
2. **Exam year and paper format lines:** where should these come from if course data doesn't include them (PRs 4 and 6)?
3. **REV conversation page:** what should real REV conversations do before the front end is built (5.10)?
4. **Subject icons:** is the briefcase OK for Business, and should there be an icon set for future subjects?
