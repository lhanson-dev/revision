# Learner redesign v2: start here

**Status:** Founder-approved on merge of the PR that adds this folder (design-system v2.1, 1 October 2026).
**Supersedes:** the 30 September 2026 design review and Claude Code handover in `docs/design/learner-redesign-2026-09/`.

This folder holds the Revision Design System (made in Claude Design) and the build tracker for the learner redesign. It is reference material for building; the rules the app must follow are in the standards listed below.

## Which source wins

1. **Decisions and behaviour:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. Follow it, and ask Lee before changing it.
2. **Visual values** (colours, type, spacing, layout): this folder's `tokens/`, `components/`, `guidelines/SUBJECT_PALETTE.md`, `guidelines/RESPONSIVE.md` and `design_handoff_revision_v2/CHANGES_v2.1.md`. The live values are in `src/app/brand-tokens.css` and `src/app/ui/`.
3. **Background only:** `design_handoff_revision_v2/NEW_FEATURES.md`, `STYLE_GUIDE.md` and `README.md`. Where they disagree with 1 or 2, follow 1 or 2. The decisions file lists the exact overrides.
4. **Reference only:** old mockups and screenshots, and anything in the design system's `archive/` folder (not copied here).

## What is in this folder

| Path | What it is |
| --- | --- |
| `STATUS.md` | One row per feature and screen: what is built, which PR, what is left, decisions pending. Updated in every redesign PR. |
| `readme.md` | The design system's own readme (voice, visual foundations, iconography). |
| `guidelines/` | Subject palette and marks, responsive layout rules, and the foundation specimen cards. |
| `components/` | The design system's reference components (React, plain style objects) and their usage notes. The app's real components are in `src/app/ui/`. |
| `tokens/` | The design system's token files. The app's real tokens are in `src/app/brand-tokens.css`. |
| `design_handoff_revision_v2/` | Handoff notes. `CHANGES_v2.1.md` records what changed from v2 to v2.1. |
| `design-system-CLAUDE.md` | The design system's own project rules. |
| `design-system-CLAUDE_CODE_PROMPT.md` | The prompt that set up PR 1. |

Not copied here: the clickable UI kit (`ui_kits/learner_app/`), the gallery page, and the `archive/` folder. They are large, and the UI kit should be re-supplied from Claude Design when a screen PR needs it.

## Sample content warning

The reference components and handoff notes contain sample names, numbers and topics (for example "Maya", "Alex", break-even and "Grade 6-7"). These are placeholders. The app must never show them: bind every screen to real data, or show the honest empty state.

## The standards this redesign updated

Each is marked founder-approved with a "Documentation impact" note.

- `20-brand-and-experience/Subject Accent Colour System.md`
- `20-brand-and-experience/Visual Brand System.md`
- `20-brand-and-experience/Identity Asset Usage Rules.md`
- `20-brand-and-experience/REV Guidance and Conversation Pattern.md`
- `20-brand-and-experience/Tone of Voice Framework.md`
- `20-brand-and-experience/Educational Treatment System.md`
- `40-evidence-and-trust/Claims and Progress Governance.md`
- `10-product-governance/Global Learner Navigation.md`
- `docs/design-system/RESPONSIVE.md` (new)
