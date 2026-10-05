---
title: "Subject Accent Colour System"
document_id: "revision-subject-accent-colour-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "2.1"
owner: "Founder"
effective_date: "2026-10-01"
last_reviewed: "2026-10-05"
content_review_status: "founder-approved"
source_of_truth_for: ["subject colour mapping", "subject letter marks", "subject colour usage", "subject colour accessibility"]
depends_on: ["Visual Brand System", "Product UX Principles"]
supersedes: ["Subject Accent Colour System v1.0 (pale Sage and Stone Blue accents, restrained-cue-only usage)", "Visual Brand System statement that no fixed subject-to-colour mapping is approved"]
---
# Subject Accent Colour System

## Purpose

Give every subject a stable, recognisable identity (a colour and a letter mark) so students can tell their subjects apart at a glance, without mixing that identity with Revision's brand colour or with learning status.

## Core rule

**Three colour roles never mix.**

1. **Brand teal** belongs to Revision, REV, primary actions, links and focus. No subject uses it.
2. **Learning status** (teal, yellow, coral, neutral) is always shown as an icon plus text. No subject uses teal, yellow or coral.
3. **Subjects** use their own palette, below, with the letter mark.

## Subject hues and letter marks

- One hue per **top-level subject**, fixed for every student and stored in the subject catalogue (`subjects.hue`). Every course inherits it, so GCSE and A-level Business are both blue.
- GCSE Combined Science uses the parent violet. Split subjects use variants of the parent hue: Biology, Chemistry and Physics use the `violet-*` variants; English Language and English Literature use the `magenta-*` variants.
- The **subject icon is a letter mark**, like a periodic-table element: one or two letters, first letter capital, set in Bricolage Grotesque 800 on a rounded square. It is stored in the catalogue (`subjects.mark`). There are no pictogram icons.
- The mark is always shown with the subject name. It is hidden from screen readers; the name carries the meaning.
- Mark sizes: 40px on tiles, 26px in Plan blocks, 56px on course card panels. On a neutral surface the mark is a solid hue fill with `-on` text. Inside a solid-hue block (Plan) it is a `--color-surface` fill with `-ink` text so it stays visible.

## Palette

Every hue ships as **solid / tint / ink / on**. Solids are the same in light and dark. `-ink` text goes on `-tint`; `-on` text goes on the solid. Every text pair passes 4.5:1 in both themes (ratios computed by the design system and recorded below).

| Token | Subject | Mark | Solid | Text on solid | Tint / ink (light) | Tint / ink (dark) |
| --- | --- | --- | --- | --- | --- | --- |
| `--subject-violet` | Science · GCSE Combined Science | **Sc** | #855bdc | #ffffff (4.6:1) | #f1edfe / #7152b5 (5.1:1) | #302846 / #b6a3f0 (6.3:1) |
| `--subject-violet-bio` | Biology | **Bi** | #ad74dd | #21132c (5.3:1) | #f5ecfe / #814caa (5.2:1) | #352643 / #c49ee7 (6.2:1) |
| `--subject-violet-chem` | Chemistry | **Ch** | #6d3cb3 | #ffffff (7.1:1) | #f2edfe / #7551b3 (5.1:1) | #312746 / #b9a2ee (6.2:1) |
| `--subject-violet-phys` | Physics | **Ph** | #7679de | #161731 (4.6:1) | #edeffe / #5b5abc (5.0:1) | #292a49 / #a3a9f6 (6.3:1) |
| `--subject-blue` | Business (GCSE + A-level) | **B** | #236bcf | #ffffff (5.2:1) | #e8f1fe / #2a67bd (4.9:1) | #1c2e49 / #85b3f7 (6.4:1) |
| `--subject-sky` | Maths | **M** | #4caad7 | #001e2c (6.6:1) | #e0f4ff / #08729a (4.7:1) | #083245 / #60bdeb (6.4:1) |
| `--subject-magenta` | English | **En** | #cd2e8b | #ffffff (4.8:1) | #ffe9f3 / #a53c75 (5.2:1) | #422232 / #e694bb (6.2:1) |
| `--subject-magenta-lang` | English Language | **EL** | #e34d83 | #2d0f19 (4.7:1) | #ffeaef / #aa3a62 (5.2:1) | #44212c / #eb93ac (6.2:1) |
| `--subject-magenta-lit` | English Literature | **Li** | #9b2d8c | #ffffff (6.6:1) | #fee9f9 / #9a418c (5.2:1) | #3e2339 / #dc96ce (6.2:1) |
| `--subject-umber` | Psychology | **Ps** | #8a5d3e | #ffffff (5.6:1) | #ffece0 / #8a5d3e (4.9:1) | #432610 / #d7a583 (6.3:1) |
| `--subject-plum` | History | **H** | #603367 | #ffffff (9.7:1) | #fbe9fd / #84548b (5.0:1) | #3b243e / #cf9cd7 (6.2:1) |
| `--subject-green` | Geography | **G** | #3a9742 | #09200b (4.6:1) | #e4f6e3 / #167b26 (4.8:1) | #1b351c / #84c485 (6.5:1) |
| `--subject-olive` | Modern Languages | **La** | #858932 | #1b1d00 (4.6:1) | #f0f3db / #6b6f0e (4.8:1) | #2f300c / #b3b862 (6.4:1) |
| `--subject-slate` | Computer Science | **Cs** | #5a6b7d | #ffffff (5.5:1) | #e6f2fe / #5a6b7d (4.8:1) | #162f48 / #a1b3c7 (6.4:1) |
| `--subject-navy` | Economics | **Ec** | #234077 | #ffffff (10.1:1) | #e9f1fe / #4868a2 (4.9:1) | #1e2d49 / #8eb1f1 (6.3:1) |

Values live in `src/app/brand-tokens.css` as `--subject-<hue>`, `--subject-<hue>-on`, `--subject-<hue>-tint` and `--subject-<hue>-ink`. The central map from subject to hue and mark is `src/app/subject-palette.ts`. Subject hex values appear nowhere else: no page or component CSS may contain one.

### Closest pairs

Check these if a student takes both. The letter mark keeps subjects distinct even when the colours are close.

- Biology and History (plum): both violet-leaning, separated by lightness.
- Blue (Business) and Navy (Economics): separated by lightness.
- Green is nearest to teal (Got it). Olive is nearest to yellow (Nearly there). Drop these first if fewer hues are needed.

## Usage

Subject colour appears on: the letter mark, subject tiles, **solid course card panels**, the Topics covered bar, the **letter mark on every Plan session**, **solid Plan exam rows and month-grid exam days**, and onboarding chips.

- Use **solids** to tell subjects apart. Pale tints all look alike at a glance, so never rely on a tint alone. Use a tint only behind text that already names the subject, such as a chip label.
- Plan sessions are list rows: the subject's letter mark, "Subject · Topic" and a neutral meta line. Exams are the only solid-colour rows on Plan, and exam days in the month grid are filled in the solid subject colour with the letter mark. Sessions are marked by subject-colour dots in the day strip and month grid.
- A done Plan session shows muted text and a "Done" label with a tick icon. Its letter mark drops to 45% opacity; the text is never faded and stays AA. This is the only place a letter mark is faded.
- Subject colour is **not** used on buttons, headings, learning status or REV.
- Activity types (Learn, Practice, Exam Prep), durations and ordinary metadata stay neutral.

## Functional and status colours stay reserved

Success, Warning, Error and Information keep their governed meaning. Learning status (Got it teal, Nearly there yellow, Needs work coral, Just started and Not started neutral) is governed by `Claims and Progress Governance.md`. A subject must never read as a status.

## Accessibility

Colour is supplemental. Subject identity is always carried by the name plus the letter mark. All text pairs meet 4.5:1 in both themes. Dark mode uses the same solids with dark tints and lighter inks.

## Governance and expansion

Subject mappings are a central brand decision, not a local implementation detail.

When adding a subject:

1. choose an unused hue, or a variant of the parent hue for a split subject;
2. check distinction from existing subjects in light and dark, and for common colour-vision differences;
3. record the hue and mark here and in `subject-palette.ts`, and add the catalogue values;
4. never assign teal, yellow or coral.

If more subjects are supported than the palette can separate safely, reuse a hue family and rely on the letter mark and name.

## Documentation impact

Version 2.0 records the Founder decisions of 1 October 2026 (effective on merge of the design-system v2.1 PR), replacing version 1.0 of 24 August 2026:

1. the saturated subject palette replaces the pale Sage (Business) and Stone Blue (Economics) accents;
2. solid subject fills are adopted on course card panels and Plan exam rows, replacing "restrained cues only";
3. ten-plus hues with family variants replace "reuse colour families plus name and icon";
4. letter marks replace governed iconography as subject icons.

Business is now blue (`--subject-blue`) and Economics navy (`--subject-navy`). Educational Treatment System examples that name Sage or Stone Blue are updated to say "the subject colour". Data-visualisation colours in the Visual Brand System are a separate palette and are unchanged. Full decision record: `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. Design values: `docs/design/learner-redesign-v2/guidelines/SUBJECT_PALETTE.md`.

Version 2.1 (5 October 2026, Plan redesign v2.2) changes the Plan usage only: sessions are list rows with the letter mark instead of solid blocks, exams are the only solid rows, and a done session's letter mark is faded to 45% while its text stays at full contrast. Source: `docs/design/learner-redesign-v2/design_handoff_revision_v2/CHANGES_v2.1.md`, section "v2.2 (Plan redesign)".
