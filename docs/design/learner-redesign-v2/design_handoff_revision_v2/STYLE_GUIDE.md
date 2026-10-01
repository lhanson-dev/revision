# Revision: Visual Style Guide (v2.1)

How the app should look and why. Exact values are in the design system's `tokens/`. Subject colours are in `SUBJECT_PALETTE.md`, layout rules in `RESPONSIVE.md`, and what changed since v2 in `CHANGES_v2.1.md`.

## 1. Principles
1. **Calm base, meaningful colour.** Neutrals cover about 90% of the screen. Colour is only used for brand, status and subjects, and those three never borrow from each other.
2. **Never colour alone.** Every colour is paired with text and an icon.
3. **Bold type does the work.** Engagement comes from big, confident headings, not illustrations.
4. **REV is alive.** The Living E is always gently moving, so REV feels like something real waiting to help.
5. **No game styling.** No XP, streaks, badges, trophies or confetti.

## 2. Colour
### 2.1 Three separate jobs
| Job | Colours | Used for |
|---|---|---|
| Brand | Teal #2bb6a3 | Brand, REV, primary actions, links, focus. **No subject uses teal.** |
| Status | Teal, yellow, coral + neutral | Understanding only (§2.3) |
| Subjects | Subject palette (violet, blue, sky, magenta, plum, green, olive, umber, slate, navy + family variants) | The subject's badge, tile, topics-covered bar, plan blocks, onboarding chips |

### 2.2 Solid + tint + ink + on
Every hue is a set: **solid** (fills), **tint** (pale backgrounds), **ink** (text/icons on tint), **on** (text on solid). Ink goes on tint and on goes on solid. Never put grey text on a tint, and never use transparency to lighten text. Every pair is at least 4.5:1 in both themes.

### 2.3 Status
Always **icon + text on the tint**. Use the `StatusBadge` component.
| State | Colour | Icon | Meaning |
|---|---|---|---|
| Got it | Teal | check in circle | Secure |
| Nearly there | Yellow | half-filled circle | Mostly right |
| Needs work | Coral | flag | "Look at this". Never error red |
| Just started | Neutral | dotted circle | Some answers, too few to tell |
| Not started | Neutral | dashed circle | No answers yet |

Dates and "coming up" are plain text with a clock icon, not yellow.

### 2.4 Subjects
- One hue per top-level subject, set in the catalogue and inherited by every course.
- Science = violet (Combined Science uses the parent). Biology, Chemistry and Physics, and later English Language and Literature, use subtle variations of the parent hue.
- Business = blue. Other mappings are in `SUBJECT_PALETTE.md`.
- Always shown with the subject name and its **letter mark** (periodic-table style: B, Bi, Ch, Ps, M). Letter marks are the subject icons; there are no pictograms.
- Use solid hue + letter mark to tell subjects apart (Plan blocks, tiles). Pale tints look alike, so never use them alone to separate subjects.

### 2.5 REV surface
`--deep` #0f2f36 with #7fe3d3 eyebrows. It's reserved for REV: a dark card always means REV is speaking.

### 2.6 Dark theme
Tokens swap under `[data-theme="dark"]`. Solids stay the same; tints get darker and inks lighter.

## 3. The Living E
| State | When | Motion |
|---|---|---|
| Waiting | Default, everywhere | Slow breathing (about 4s) |
| Listening | The student is typing | Leans in, slightly brighter and quicker (about 1.6s) |
| Thinking | REV is working | Bars sway in a visible thinking motion (about 1.1s) |
| Responding | The answer appears | Bars settle, then return to Waiting |

- Appears on REV cards, Ask REV, the REV nav entry and the Home hero only.
- **Reduced motion:** the mark stays still and a short label shows the state ("REV is listening", "REV is thinking", "REV is answering").
- Never recolour it (on teal buttons the bars use `--teal-on`), outline it or add a face.

## 4. Progress: three measures, never one mastery %
| Measure | Shows | Visual |
|---|---|---|
| Topics covered | x of y | 56px Bricolage number + subject-hue bar |
| Understanding | Topic counts by status | Stacked status bar + text labels, e.g. "1 got it · 2 nearly there · 1 needs work · 6 not started" |
| Exam readiness | A value, or "Not enough evidence yet" | Text, neutral when there isn't enough evidence |

Subject tiles and course cards show Topics covered. Course overview and Progress show all three (`ProgressMeasures`).

## 5. Typography
| Role | Font | Size / weight |
|---|---|---|
| H1 | Bricolage Grotesque | clamp(34–46px) / 800, −0.025em |
| H2 / card title | Bricolage | clamp(26–32px) / 800 |
| Big number | Bricolage | 56px / 800 |
| Eyebrow | Manrope | 12px / 800, UPPERCASE, +0.12em |
| Body | Manrope | 15–18px / 600 |
| Labels, buttons | Manrope | 13–16px / 700–800 |

Bricolage is for headings and numbers only. Use sentence case everywhere except eyebrows.

## 6. Shape and space
- Pills (999) for anything tappable. Radii: 28 hero, 24 card, 20 tile, 16 row, 12 badge, 9 bar.
- Cards are flat: 1px `--line` border, no shadow.
- 4px spacing grid. Focus is a 2px teal border + 5px teal-tint ring.

## 7. Components
- **Buttons:** one teal primary per card; labels are verbs.
- **REV card:** deep surface, Living E + eyebrow, 1–2 sentences, **always a reason from real data**, one primary + one secondary. "REV noticed" pattern cards are out for launch.
- **Subject tile / course card:** solid hue badge or panel, name, topics covered, optional understanding bar. No %.
- **Quick check (Learn):** dashed neutral card with a "Not scored" tag. It never affects progress.
- **Examiner guide (Exam Prep):** "What examiners look for". It's a guide, not a mark. Practice mode only; hidden in timed mocks.
- **Onboarding chips:** Level (GCSE / A-level, both allowed) → subjects at that level → exam board per subject. Subjects and boards not offered yet can still be picked, with a neutral "Coming soon" tag.

## 8. Layout
Scroll down, never sideways. See `RESPONSIVE.md`.

## 9. Voice
REV sounds like an older student who aced these subjects, not a teacher. Encouraging, specific and honest. Speaks in the first person and never claims to be human. Short sentences, second person, no game words.

| Do | Don't |
|---|---|
| "Break-even is Needs work, and it's on Friday's quiz. 15 minutes of practice will help." | "Great job, superstar!" / "You must revise break-even." |
| "I'm not sure. Check this with your teacher." | "As your tutor, I…" / "I remember when I sat this exam…" |

## Do / Don't
| Do | Don't |
|---|---|
| Use the subject's catalogue hue wherever that subject appears | Use teal, yellow or coral for a subject |
| Use icon + text on status tints | Show status by colour alone |
| Show topics covered, understanding and readiness separately | Show a single mastery % |
| Keep the Living E moving (unless reduced motion) | Use a static or recoloured mark |
| Give every REV suggestion a reason | Show "REV suggests" with no "because" |
