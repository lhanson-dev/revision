# Learner redesign v2: historical / derived design package

**Status:** Historical and derived reference material. **Not normative learner-design authority after the 7 October 2026 reconciliation.**
**Historical role:** Founder-approved v2.1 handoff/build package from 1 October 2026.

This folder is retained because it records the design handoff, mockup components, token proposals and delivery tracker used during the v2.1 rollout. It must not compete with current numbered authority.

## Current source order

1. **Current learner visual/interaction authority:** `20-brand-and-experience/Learner Design System.md`.
2. **Specialist product/evidence authority:** the relevant numbered document located through `INDEX.md` (for example Global Learner Navigation, REV Guidance, Claims and Progress Governance, Learn MVP Experience).
3. **Current implementation truth:** code and `docs/technical/`.
4. **This folder:** derived/historical reference only. Its tokens, mockups, components and handoff rules may be stale and must not override current authority or implementation evidence.

The 1 October decision record in `docs/design/decisions/2026-10-01-learner-redesign-v2.md` is also historical decision evidence. ADR-0031 records the later reconciliation history.

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
