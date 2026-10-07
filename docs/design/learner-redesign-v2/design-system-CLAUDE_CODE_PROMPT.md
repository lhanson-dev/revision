> **HISTORICAL SETUP PROMPT — DO NOT USE AS CURRENT AUTHORITY.** Use `20-brand-and-experience/Learner Design System.md` and the current AI learner-design guide once Phase E lands.

Read CLAUDE.md and AUTHORITY_HIERARCHY.md first. Work on a new branch `design-system-v2.1` and open a PR. Do NOT merge.

I've attached the Revision design system (from Claude Design). **Visual source of truth: `ui_kits/learner_app/index.html`** (route per screen in `ui_kits/learner_app/README.md`). Ignore `archive/`: it's superseded. Also attached: `readme.md`, `tokens/`, `components/`, `guidelines/` (RESPONSIVE.md, SUBJECT_PALETTE.md), `design_handoff_revision_v2/` (STYLE_GUIDE.md, NEW_FEATURES.md, CHANGES_v2.1.md).

## My decisions on the conflicts (Founder)
1. Subject palette: ADOPT design system / KEEP Sage + Stone Blue  ← pick one
2. Solid subject fills on course cards and Plan blocks: ADOPT / KEEP restrained cues
3. 10+ subject hues with family variants: ADOPT / KEEP
4. Bricolage Grotesque for headings: ADOPT / KEEP Manrope only
5. Letter marks as subject icons: ADOPT / KEEP
6. Living E thinking loop: 1.4s (match repo) / 1.1s

## Do this
1. **Authority docs (in 20-brand-and-experience/):** update `Subject Accent Colour System.md`, `Visual Brand System.md` and `Identity Asset Usage Rules.md` to match my decisions. Bump the version, set `last_reviewed` to today and `content_review_status: founder-approved`, and add a "Documentation impact" note recording the decision. Put the full palette table (solid / tint / ink / on, light + dark, contrast ratios) from `guidelines/SUBJECT_PALETTE.md` into the subject doc. Add `docs/design-system/RESPONSIVE.md` (from guidelines/RESPONSIVE.md) and link it from Visual Brand System.
2. **Tokens:** merge `tokens/colors.css`, `typography.css`, `spacing.css` and `layout.css` into `src/app/brand-tokens.css`. Keep the existing variable names where they exist and add the new ones. Use one central subject map (`subjects.hue`, `subjects.mark`) and no subject hex values in page CSS.
3. **Components:** build these in `src/app/ui/` from `components/*.jsx` (+ `.d.ts` for props), in TypeScript and using tokens only: StatusBadge, UnderstandingBar, ProgressMeasures, SubjectBadge (letter mark), RevMark (4 states + reduced-motion label), RevCard, QuickCheck, ExaminerGuide, AppShell/Rail/TabBar.
4. **Guardrails:** add a lint rule or test that fails on raw hex colours outside brand-tokens.css. Add a Playwright check in `tests/e2e/` that fails if any learner route scrolls horizontally at 1440, 1160, 960, 768, 620, 390 or 320px.
5. **CLAUDE.md:** add a short "Design system" section: "All UI must follow 20-brand-and-experience/ and docs/design-system/. Use tokens and src/app/ui components only. Colour roles never mix: teal = brand/REV/action; teal/yellow/coral/neutral = status (icon + text); subjects = subject palette + letter mark. Progress = Topics covered · Understanding · Exam readiness, never one %. Scroll down, never sideways."
6. Log one line in `content-factory/RUN_LOG.md`. In the PR description, list every doc changed and every conflict decision in plain English, and include before/after screenshots.

Don't redesign screens in this PR. Tokens, components, docs and guardrails only; the screens come in follow-up PRs.
