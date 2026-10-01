# Adding the Revision design system to the repo (lhanson-dev/revision)

Hand this file to Claude Code together with the downloaded design system files. It says where each file goes and which rules to add.

## 1. Copy the files in
| From this project | To the repo |
|---|---|
| `readme.md` | `docs/design-system/README.md` |
| `guidelines/SUBJECT_PALETTE.md`, `guidelines/RESPONSIVE.md` | `docs/design-system/` |
| `design_handoff_revision_v2/STYLE_GUIDE.md`, `NEW_FEATURES.md`, `CHANGES_v2.1.md` | `docs/design-system/` |
| `tokens/*.css` | merge into `src/app/brand-tokens.css` (keep the existing variable names where they already exist; add the new ones) |
| `tokens/subject-palette.json` | `src/app/subject-palette.json` (seed for `subjects.hue` + `subjects.mark`) |
| `components/**/*.jsx` + `.d.ts` | **reference only.** Rebuild them as typed components in `src/app/ui/` (Button, Chip, StatusBadge, UnderstandingBar, ProgressBar, Card/Stat, RevMark, RevCard/StepRow, SubjectBadge/SubjectTile/CourseCard, ProgressMeasures, AnswerOption, FeedbackBar, QuickCheck, ExaminerGuide, AppShell/Sidebar/Rail/TabBar) |

## 2. Add this to the repo's `CLAUDE.md` (create it at the root if it doesn't exist)
```md
## Design system (must follow)
Source of truth: docs/design-system/. Read README.md, STYLE_GUIDE.md, SUBJECT_PALETTE.md and RESPONSIVE.md before any UI work.

- Use only CSS variables from src/app/brand-tokens.css. No hard-coded hex colours, fonts or radii in components.
- Build screens only from src/app/ui/ components. Ask before adding a new one.
- Colour roles never mix. Teal = brand, REV, primary actions, links, focus. Teal / yellow / coral / neutral = status only, always icon + text (StatusBadge). Subjects use the subject palette (subjects.hue) plus their letter mark (subjects.mark), never teal/yellow/coral.
- Progress = Topics covered · Understanding · Exam readiness. Never a single mastery %.
- The REV Living E is always moving (waiting / listening / thinking / responding). With prefers-reduced-motion it stays still and shows a text label.
- Layout scrolls down, never sideways: one 1100px canvas; sidebar > 960px, icon rail 621–960, bottom tab bar ≤ 620. min-width: 0 on grid/flex children; minmax(0,1fr) tracks.
- No game styling (XP, streaks, badges, confetti). No "REV noticed" cards at launch.
- REV's voice: an older student who aced these subjects. Encouraging, specific, honest, never claims to be human. Every suggestion gives a reason from real data.
- When a design rule changes, update docs/design-system/, brand-tokens.css and the affected ui/ components in the same PR.
```

## 3. Guardrails (so the rules can't drift)
1. **Lint for raw colours:** add a stylelint rule (`color-no-hex` outside `brand-tokens.css`) and an ESLint rule that flags hex strings in `src/app/**/*.tsx`.
2. **No horizontal overflow test:** in `tests/e2e/`, for every learner route at 1440, 1160, 960, 768, 620, 390 and 320px wide, assert `document.documentElement.scrollWidth <= window.innerWidth`.
3. **Visual regression:** refresh the `interface-visual-regression` snapshots once the v2.1 screens are built. Generate reference screenshots from `ui_kits/learner_app/index.html#<route>` (1440, 900, 390 wide; light + `?theme=dark`). Never use anything in `archive/`.
4. **PR checklist** (`.github/pull_request_template.md`): "Uses tokens only · Status = icon + text · No mastery % · Checked at 390px and 1440px, light and dark."

## 4. Suggested order for Claude Code
1. Tokens → `brand-tokens.css` + subject palette seed
2. Root `CLAUDE.md` rules + lint guardrails
3. Core components (Button, Chip, StatusBadge, ProgressBar, Card)
4. RevMark (Living E states) + RevCard
5. Subject components + ProgressMeasures
6. AppShell (sidebar / rail / tab bar) + overflow test
7. Screens, one per PR
