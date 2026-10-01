# Responsive layout rules

**The one rule:** the page scrolls **down**, never **sideways**, at any width from 320px up. If anything causes horizontal scroll, that's a bug.

These rules come from the live site (`src/app/brand-tokens.css`, `interface-layout.css` and the per-screen `@media` rules). The v2 design follows them.

## 1. One content canvas
| Token | Value | Use |
|---|---|---|
| `--layout-min` | 320px | Smallest supported viewport (`body { min-width }`) |
| `--layout-learner-canvas-max` | 1100px | Max content width for **every** learner screen |
| canvas + gutters | 1180px | `max-width: calc(1100px + 80px)`, centred with `margin-inline: auto` |
| `--layout-focus-measure` | 820px | Practice and Exam question column |
| `--layout-prose-measure` | 760px | Reading text: Learn cards, Ask REV thread |

- Screens must not invent their own wider or narrower top-level frame. Variation happens *inside* the canvas, so the product doesn't jump sideways between pages.
- On very wide screens the canvas stays at 1100 and centres; the background fills the rest.

## 2. Breakpoints
| Name | Width | Navigation | Gutters | Grid behaviour |
|---|---|---|---|---|
| Desktop | > 1160 | 248px sidebar | 40px | Full layout (main + 300–340px side column) |
| Laptop | 961–1160 | 248px sidebar | 28px | Side column collapses below main at ≤ 1100 |
| Tablet | 621–960 | 84px icon rail | 24px | Single column; side cards sit 2-up |
| Phone | ≤ 620 | Bottom tab bar (REV raised centre) | 20px | Single column; tiles 2-up; full-width primary buttons |
| Small phone | ≤ 390 | — | 20px | Tighten only, never remove content |

The existing 960 and 620 breakpoints stay as they are. The old site used a burger drawer at ≤ 960; v2 replaces it with the rail (tablet) and tab bar (phone). Exam Prep hides all nav at every size (focus mode).

## 3. CSS rules that prevent sideways scroll
1. **Every grid and flex child that holds text gets `min-width: 0`.** This is the most common cause of overflow.
2. **Grid tracks use `minmax(0, 1fr)`**, never bare `1fr` or fixed pixel tracks for content.
3. **No fixed widths on content containers.** Use `max-width` + `width: 100%`. Fixed widths are only for nav chrome (248 sidebar, 84 rail) and small icons/badges.
4. **Rows that can run out of space wrap** (`flex-wrap: wrap`): page headers, button groups, chip rows, the feedback bar.
5. **Headings scale with `clamp()`**: H1 `clamp(34px, 2.4vw + 18px, 46px)`, H2 `clamp(26px, …, 32px)`, hero numbers `clamp(40px, …, 56px)`.
6. **Long words can break** (`overflow-wrap: anywhere`) in nav labels, course names and anything user- or exam-board-supplied.
7. **Images and SVGs**: `max-width: 100%`.
8. **Root guard**: `html, body { overflow-x: clip }`. This is a safety net only, not a fix. Find and fix the overflowing element.
9. **Decorative elements** (living-e watermark) are `pointer-events: none`, positioned inside an `overflow: hidden` card, and **hidden on phone** so they never sit behind text.

## 4. Allowed horizontal scroll (contained only)
Sideways scrolling is allowed **only inside a component**, never on the page, and only for:
- tab/segment strips that can't fit (`.mode-tabs`, the Exam question number strip)
- wide data tables in admin/content ops

The scroll must be on that strip (`overflow-x: auto; overscroll-behavior-inline: contain`), with the last item partly visible as a hint. Learner content cards never scroll sideways.

## 5. How each pattern reflows
| Pattern | Desktop | ≤ 1100 | ≤ 960 | ≤ 620 |
|---|---|---|---|---|
| Home main + side | 2 columns | Side stacks below, cards 2-up | same | 1-up |
| Subject tiles | 4-up | 4-up | 4-up | 2-up |
| Course cards | 2-up, hue panel left | 1-up | 1-up | hue panel becomes top band |
| Plan week | 7 columns + side | side stacks below | **day list** (day label left, sessions wrap) | day list |
| Practice / Exam | 820 column | same | same | same, full-width options |
| Feedback bar | sticky bottom | same | same | sits above tab bar, wraps |
| Exam Prep 3-pane | grid · question · checklist | checklist below | question grid becomes a scrolling number strip | same |

## 6. Touch and spacing
- Tap targets are at least 44×44px on tablet and phone, even if the visual is smaller.
- Fixed bottom UI (tab bar 76px, feedback bar) reserves space with `padding-bottom` so it never covers content.
- Respect `env(safe-area-inset-bottom)` on the tab bar.

## 7. Testing checklist (every screen, both themes)
- [ ] 1440, 1160, 1100, 960, 768, 620, 390, 320 wide: `document.documentElement.scrollWidth <= window.innerWidth`
- [ ] Longest real course name and a 3-digit percentage still fit
- [ ] 200% browser zoom at 1280 behaves like 640
- [ ] Add a Playwright check: for each route × width, assert there's no horizontal overflow (extend `tests/e2e/interface-visual-regression.spec.ts`)
