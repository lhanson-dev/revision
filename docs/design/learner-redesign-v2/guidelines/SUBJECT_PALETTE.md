# Subject palette + subject marks

Subjects never use teal, yellow or coral, so a subject's progress bar can never be mistaken for a status. Every hue ships as solid / tint / ink / on, and every text pair passes 4.5:1 in both themes (ratios computed). Solids are the same in light and dark.

## Colour rules
- One hue per **top-level subject**, set in the subject catalogue. Every course inherits it (GCSE and A-level Business are both blue).
- Science = violet. GCSE Combined Science uses the parent violet. Biology, Chemistry and Physics use the `violet-*` variants. English Language and Literature use the `magenta-*` variants.
- Subject hues are used on: the mark, tile and course card panel, the topics-covered bar, plan blocks and onboarding chips. They are not used on buttons, headings, status or REV.
- **Use solids to tell subjects apart.** The pale tints all look alike at a glance, so never rely on a tint alone to tell two subjects apart. Use tints only behind text that already names the subject, such as a chip label.

## Subject marks (instead of icons)
The subject icon is a **letter mark**, like a periodic-table element. There are no pictogram icons.
- 1–2 letters, first letter capital (B, Bi, Ch, Ps, M). Set in Bricolage Grotesque 800.
- A rounded square: 40px on tiles, 26px in plan blocks, 56px on course card panels.
- On a neutral surface: solid hue fill with `-on` text. Inside a solid-hue block (Plan): `--sf` fill with `-ink` text, so the mark stays visible.
- The mark is fixed per subject in the catalogue (`subjects.mark`) alongside `subjects.hue`. Variants get their own mark (Bi / Ch / Ph). Combined Science uses Sc.
- Always paired with the subject name. It's `aria-hidden`; the name carries the meaning.

| Token | Subject (suggested) | Mark | Solid | Text on solid | Tint L / ink L | Tint D / ink D |
|---|---|---|---|---|---|---|
| `--violet` | Science · GCSE Combined Science | **Sc** | #855bdc | #ffffff (4.6:1) | #f1edfe / #7152b5 (5.1:1) | #302846 / #b6a3f0 (6.3:1) |
| `--violet-bio` | Biology | **Bi** | #ad74dd | #21132c (5.3:1) | #f5ecfe / #814caa (5.2:1) | #352643 / #c49ee7 (6.2:1) |
| `--violet-chem` | Chemistry | **Ch** | #6d3cb3 | #ffffff (7.1:1) | #f2edfe / #7551b3 (5.1:1) | #312746 / #b9a2ee (6.2:1) |
| `--violet-phys` | Physics | **Ph** | #7679de | #161731 (4.6:1) | #edeffe / #5b5abc (5.0:1) | #292a49 / #a3a9f6 (6.3:1) |
| `--blue` | Business (GCSE + A-level) | **B** | #236bcf | #ffffff (5.2:1) | #e8f1fe / #2a67bd (4.9:1) | #1c2e49 / #85b3f7 (6.4:1) |
| `--sky` | Maths | **M** | #4caad7 | #001e2c (6.6:1) | #e0f4ff / #08729a (4.7:1) | #083245 / #60bdeb (6.4:1) |
| `--magenta` | English | **En** | #cd2e8b | #ffffff (4.8:1) | #ffe9f3 / #a53c75 (5.2:1) | #422232 / #e694bb (6.2:1) |
| `--magenta-lang` | English Language | **EL** | #e34d83 | #2d0f19 (4.7:1) | #ffeaef / #aa3a62 (5.2:1) | #44212c / #eb93ac (6.2:1) |
| `--magenta-lit` | English Literature | **Li** | #9b2d8c | #ffffff (6.6:1) | #fee9f9 / #9a418c (5.2:1) | #3e2339 / #dc96ce (6.2:1) |
| `--umber` | Psychology | **Ps** | #8a5d3e | #ffffff (5.6:1) | #ffece0 / #8a5d3e (4.9:1) | #432610 / #d7a583 (6.3:1) |
| `--plum` | History | **H** | #603367 | #ffffff (9.7:1) | #fbe9fd / #84548b (5.0:1) | #3b243e / #cf9cd7 (6.2:1) |
| `--green` | Geography | **G** | #3a9742 | #09200b (4.6:1) | #e4f6e3 / #167b26 (4.8:1) | #1b351c / #84c485 (6.5:1) |
| `--olive` | Modern Languages | **La** | #858932 | #1b1d00 (4.6:1) | #f0f3db / #6b6f0e (4.8:1) | #2f300c / #b3b862 (6.4:1) |
| `--slate` | Computer Science | **Cs** | #5a6b7d | #ffffff (5.5:1) | #e6f2fe / #5a6b7d (4.8:1) | #162f48 / #a1b3c7 (6.4:1) |
| `--navy` | Economics | **Ec** | #234077 | #ffffff (10.1:1) | #e9f1fe / #4868a2 (4.9:1) | #1e2d49 / #8eb1f1 (6.3:1) |

## Closest pairs (check if a student takes both)
- **Biology / History (plum):** both violet-leaning, separated by lightness (light vs very dark).
- **Blue / Navy:** separated by lightness.
- **Green:** nearest to teal (Got it). **Olive:** nearest to yellow (Nearly there). Drop these if you need fewer than 10 subjects.
In every case the letter mark keeps subjects distinct even when the colours are close.

Values are in `tokens/subject-palette.json`; the CSS is in `tokens/colors.css`.
