# Revision Design System

Revision is a revision app for GCSE/A-level students (teenagers). **REV** is its AI tutor. It reads each student's progress, suggests what to revise next and says why, and answers questions. The brand is **Calm Teal**: quiet teal-grey surfaces, bold Bricolage headings, a separate palette with one hue per subject, and the Living E, REV's always-moving signature. The look is deliberately *not* gamified: no XP, streaks, badges or confetti.

**Sources**
- Repo: `lhanson-dev/revision` (main): `src/app/brand-tokens.css`, `src/app/ui/`, visual-regression snapshots in `tests/e2e/`
- Current screens: `ui_kits/learner_app/index.html` (all 14 screens, responsive, light + dark) and the gallery `Revision Screens v2.1.dc.html`. Old v1/v2 mockups are in `archive/` (superseded).
- Handoff docs: `design_handoff_revision_v2/README.md`, `STYLE_GUIDE.md`, `NEW_FEATURES.md`, `CHANGES_v2.1.md`
- Decisions: "Revision Design System v2" (claude.ai artifact; applied from the chat summary, see `CHANGES_v2.1.md`)

## Index
- `styles.css`: the entry point (imports only). Link this one file.
- `tokens/`: `colors.css` (brand, status, subject palette; light + `[data-theme="dark"]`), `subject-palette.json` (values + contrast ratios), `typography.css`, `spacing.css` (space, radii, motion, focus), `layout.css` (canvas, breakpoints, gutters), `fonts.css`, `base.css`
- `guidelines/`: foundation specimen cards (Colors, Type, Spacing, Brand) + `RESPONSIVE.md` (layout rules) + `SUBJECT_PALETTE.md`
- `components/`
  - `core/`: Button, Chip (incl. Coming soon), Tag, StatusBadge, UnderstandingBar, ProgressBar, Segmented, Card + Stat, Icon
  - `rev/`: RevMark, RevCard + StepRow
  - `subjects/`: SubjectTile, SubjectBadge, CourseCard, ProgressMeasures
  - `practice/`: AnswerOption, FeedbackBar, QuickCheck (Not scored), ExaminerGuide
  - `navigation/`: AppShell + useBreakpoint, Sidebar, Rail, TabBar
  - `_preview.js`: loader used only by the preview cards
- `ui_kits/learner_app/`: v2.1 click-through of every screen. Open a screen with `#home`, `#plan`, `#courses`, `#course`, `#learn`, `#practice`, `#exam`, `#progress`, `#rev`, `#onboarding`, `#signin`, `#home-empty`, `#plan-empty` or `#progress-empty`; add `?theme=dark` for dark
- `assets/brand/`: living-e master SVG, primary wordmark SVG
- `SKILL.md`: Agent Skill entry point

## Content fundamentals
- **Voice:** an older student who aced these subjects, not a teacher. Encouraging, specific and honest. Never claims to be human. Direct, short, second person ("you"). REV talks in the first person ("Here's what I'd do today", "Want me to move Saturday's Maths?").
- **Always give the reason:** "Why: break-even is marked Needs work, and it's on Friday's quiz."
- **Casing:** sentence case for headings and buttons. UPPERCASE only for eyebrows ("REV SUGGESTS · 45 MIN", "NEXT EXAM").
- **Buttons are verbs:** Start practice, Add to Thursday, Move it, Not now, Suggest something else.
- **Encouraging but honest:** "Nice — that's the one." / "Not this time." / "This will come back later." Status words are fixed: Got it / Nearly there / Needs work / Just started / Not started. Never "Failing".
- **No game words:** missions, XP, streaks, unlock, level up, boss.
- **No emoji.** Unicode arrows (→, ▲) are fine inside explanations.
- Student messages to REV can be casual lower-case. REV replies in clean, plain English.

## Visual foundations
- **Colour:** neutrals cover about 90% of the screen (`--bg` #f3f7f5, `--sf` white, `--line`, `--tx`, `--tx2`). Colour has three separate jobs that never borrow from each other. **Brand teal** #2bb6a3 is for the brand, REV, primary actions, links and focus. **Status** uses teal / yellow / coral / neutral. **Subjects** use their own palette. Every hue is a **solid / tint / ink / on** set: `-ink` text goes on `-tint` and `-on` text goes on solids. Every pair is at least 4.5:1 in both themes. Never put grey text on a tint, and never use alpha to lighten text.
- **Subjects:** one hue per top-level subject, set in the catalogue and inherited by every course. Science is violet (Combined Science uses the parent; Biology, Chemistry and Physics use `violet-bio/-chem/-phys`), Business is blue, and English is magenta (`magenta-lang/-lit`). Psychology is umber. Others are in `guidelines/SUBJECT_PALETTE.md`. Tell subjects apart with the solid hue + letter mark, never tints alone. Subjects never use teal, yellow or coral. The subject colour always appears with the name and letter badge.
- **Status:** always icon + text on the tint (`StatusBadge`). Got it is teal, Nearly there yellow, Needs work coral ("look at this", never error red). Just started and Not started are neutral. Dates and "coming up" are plain text with a clock icon.
- **Progress:** three measures, never one mastery %. Topics covered (x of y, 56px number + subject-hue bar), Understanding (stacked status bar + text labels) and Exam readiness (a value, or "Not enough evidence yet"). Use `ProgressMeasures`.
- **REV surface:** `--deep` #0f2f36 with #7fe3d3 eyebrows. It is reserved for REV, and a dark card always means REV is speaking.
- **Type:** Bricolage Grotesque 800 for headings and big numbers (tracking −0.02 to −0.03em). Manrope 600 for body and 700–800 for labels and buttons.
- **Backgrounds:** flat colour only. No images, gradients, textures or patterns. The one soft effect is the living-e radial halo, used in hero REV placements.
- **Cards:** flat, with a 1px `--line` border and no shadow, at radius 24 (rows 16–20, hero 28). Depth comes from colour (tint panels, the deep REV card), not from elevation. The only shadow is on the device/frame mockups and the Ask REV sidebar button (0 8px 22px teal 22%).
- **Radii:** pills (999) for anything tappable. 28 hero, 24 card, 20 tile, 16 row, 12 icon square, 9 bar.
- **Spacing:** 4px base. Page padding is 36/40, grid gaps 20–24, card padding 22–36.
- **Hover:** a slight darken (brightness .95). **Press:** no shrink. **Focus:** 2px teal border + 5px `--teal-tint` ring.
- **Selection:** use a tint fill with ink text, or an ink (`--tx`) fill with `--bg` text for segmented controls and the current question.
- **Motion:** short and functional. 150ms for hover, 250ms for bar fills, 300ms for the feedback bar sliding up. The **Living E** is always gently moving: waiting (slow breathing), listening (leans in, brighter, quicker), thinking (bars sway) and responding (settles, then back to waiting). With reduced motion it stays still and shows a text label ("REV is thinking"). It appears on REV cards, Ask REV, the REV nav entry and the Home hero only. No bounces or confetti, and `prefers-reduced-motion` is respected.
- **Transparency:** only on the deep REV card (white 8–14% rows, 10% secondary button).
- **Layout:** fully responsive, scroll down never sideways (see `guidelines/RESPONSIVE.md`). One centred 1100px content canvas (from the live site). Sidebar above 960px, 84px icon rail from 621–960, bottom tab bar (REV raised centre) at 620 and below. Two-column grids stack at 1100 or less. Gutters are 40/28/24/20. Use `AppShell` + `useBreakpoint`. Exam Prep hides all nav (focus mode).
- **Imagery:** none. No stock photos, illustrations or mascot. The living-e is the only character.

## Iconography
- A custom rounded line set on a 24px grid with round caps and joins. Stroke is 2 for nav, 2.4–2.6 for UI and 3–3.2 for checks inside filled circles. It ships as `components/core/Icon.jsx` (paths copied from the mockups and the repo's `ui/Icon.tsx` style).
- Icons use `currentColor` and take on the text colour of their context. They are never multi-coloured. Status icons: gotit (check in circle), nearly (half-filled circle), needswork (flag), started (dotted circle), notstarted (dashed circle).
- No icon font, no emoji. **Subjects use letter marks, not icons:** 1–2 letters in Bricolage 800 on a rounded square, like periodic-table elements (B, Bi, Ch, Ps, M). See `guidelines/SUBJECT_PALETTE.md`.

## Intentional additions
- `Segmented`, `Stat` and `StepRow` were pulled out of repeated mockup patterns so screens don't re-implement them.
- `StatusBadge`, `UnderstandingBar`, `ProgressMeasures`, `QuickCheck` and `ExaminerGuide` were added for the v2.1 decisions.
- "REV noticed" pattern cards are out for launch.
