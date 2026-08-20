# Brand Studio v0.3 — system foundations, controls and forms

**Status:** Experimental proposal for Founder confirmation  
**Authority:** None until deliberately promoted into `20-brand-and-experience/Visual Brand System.md`  
**Foundation already confirmed:** Manrope, Calm Teal, Living E + soft halo, light/dark modes and REV-led responsive Home

## Purpose

Turn the confirmed visual direction into a reusable system that can keep learner, marketing, Admin and media work recognisably Revision without forcing identical layouts.

This tranche deliberately concentrates on the most reusable foundations:

1. typography;
2. spacing and responsive layout;
3. radii, borders and elevation;
4. buttons and interaction states; and
5. form anatomy and validation states.

It does **not** lock card families, illustration, subject accents, data visualisation, social, video or REV motion timing yet.

---

## 1. Typography proposal — Manrope

Use a small, stable set of roles rather than arbitrary local font sizes.

| Role | Desktop | Mobile | Weight | Line height | Typical use |
| --- | --- | --- | --- | --- | --- |
| Display XL | 56px | 40px | 700 | 64 / 48 | Marketing hero / exceptional brand moment |
| Display L | 44px | 34px | 700 | 52 / 42 | Learner Home greeting / major page statement |
| H1 | 36px | 30px | 700 | 44 / 38 | Primary page title |
| H2 | 28px | 26px | 700 | 36 / 34 | Major section heading |
| H3 | 22px | 20px | 650/700 | 30 / 28 | Card group / working-area heading |
| H4 | 18px | 18px | 650/700 | 26 | Compact heading |
| Body L | 18px | 18px | 400/500 | 28 | Intro / explanation |
| Body | 16px | 16px | 400/500 | 24 | Default learner/product copy |
| Body S | 14px | 14px | 400/500 | 20 | Secondary UI / Admin density |
| Label | 13px | 13px | 600 | 18 | Field label / compact control label |
| Button | 15px | 15px | 600 | 20 | Button and prominent action label |
| Caption | 12px | 12px | 500/600 | 16 | Metadata / timestamps / helper metadata |

### Typography rules

- Default body copy stays at **16px minimum** in learner experiences.
- Marketing may use Display XL more freely; learner product should reserve it for genuinely dominant moments.
- Admin may use Body S where density helps the task, but form input text remains 16px where practical.
- Avoid weights above 700 as a routine hierarchy tool. Revision should feel clear rather than shouty.
- Prefer weight + size + spacing hierarchy before using colour for hierarchy.
- Text should not be tightly tracked; use normal Manrope spacing for body and small negative tracking only on large display text where visually necessary.

---

## 2. Spacing and responsive layout proposal

Use a **4px base rhythm** with a deliberately limited token set:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`

These are available values, not a requirement to use every value in every component.

### Semantic spacing defaults

| Job | Recommended |
| --- | --- |
| Icon-to-label gap | 8px |
| Tight internal grouping | 8–12px |
| Control group gap | 12–16px |
| Standard card padding | 20–24px |
| Feature-card / REV padding | 28–32px |
| Mobile page gutter | 16px |
| Tablet page gutter | 24px |
| Desktop page gutter | 32–40px |
| Mobile section gap | 32px |
| Tablet section gap | 48px |
| Desktop section gap | 64px |
| Marketing/hero breathing space | 64–96px where composition supports it |

### Width guidance

- General product max-width: **1200px**.
- Long-form reading width: **680–760px**.
- Forms and focused setup flows: usually **560–680px** rather than stretching full width.
- Dense Admin tables may exceed the standard content width when the job genuinely needs it, but ordinary page chrome should remain aligned.

The responsive system should scale spacing rather than completely redesign the hierarchy between mobile, tablet and desktop.

---

## 3. Radius proposal

Use named radius families so surfaces can vary intentionally:

| Token | Value | Use |
| --- | ---: | --- |
| Compact | 12px | Dense Admin cells, small grouped controls, compact status surfaces |
| Control | 14px | Buttons, inputs, selects, segmented controls |
| Standard surface | 20px | Ordinary cards/panels |
| Feature surface | 32px | REV, hero, editorial or high-expression surfaces |
| Pill | 999px | Chips, badges, toggles, circular/pill treatments |

Rules:

- Do not use Feature radius merely to make every card look soft.
- Controls should normally share the 14px family across learner, marketing and Admin.
- Cards can vary between 20px and 32px according to their family; this is intentional creative range.
- Small dense Admin surfaces may use 12px without making Admin feel like a separate brand.

---

## 4. Border and elevation proposal

Revision should rely more on **surface hierarchy, borders and whitespace** than on heavy shadow.

### Light mode

| Level | Treatment | Typical use |
| --- | --- | --- |
| Flat | 1px `#E6ECEB`, no shadow | Default cards, fields, Admin panels |
| Raised | border + `0 2px 8px rgba(15,47,54,.06)` | Interactive cards, selected panels |
| Floating | `0 10px 30px rgba(15,47,54,.10)` | Mobile nav, menus, popovers |
| Overlay | `0 20px 50px rgba(15,47,54,.14)` | Modal/dialog only |

### Dark mode

Prefer surface-tone steps and `#24434A` borders. Shadows should be weaker and used primarily for separation of floating/overlay content rather than to create black depth around every card.

---

## 5. Control sizing

| Control | Visual height | Notes |
| --- | ---: | --- |
| Compact | 36px | Admin/secondary only; preserve adequate hit area where touch applies |
| Standard | 44px | Default minimum interactive height |
| Large | 52px | Primary learner/marketing CTA, large search/REV actions |
| Icon button | 44×44px | Default touch target |

Learner product should default to **44px or larger** interaction targets. No essential interaction may depend on hover.

---

## 6. Button family

### Primary

- Background: Primary Teal `#2BB6A3`.
- Text/icon: **Graphite Ink `#132026`**, not white.
- Radius: 14px.
- Default height: 44px; 52px for major CTA.

**Accessibility finding:** white on Primary Teal is only about **2.52:1**, so the earlier white action-text mapping is not acceptable for normal button text. Graphite on Primary Teal is about **6.59:1**. This changes usage, not the confirmed palette.

### Strong / inverse primary

- Background: Deep Teal Ink `#0F2F36`.
- Text: white.
- Use where a darker anchored CTA is compositionally preferable.
- Contrast is comfortably above AA.

### Secondary

- Light: white or Soft Surface Tint with Neutral 200 border.
- Dark: dark elevated surface with `#24434A` border.
- Text: primary text colour.
- Hover/selected emphasis may use Soft Aqua Accent without changing semantic meaning.

### Tertiary

- No permanent container.
- Use primary text/deep teal text with teal icon/underline/accent.
- **Do not use Primary Teal for ordinary small text on white as the sole contrast signal**, because the contrast is insufficient.

### Destructive

- Error source colour may be used for border/icon/fill accent.
- Destructive text must use an accessible strong semantic foreground or primary text rather than relying on `#E0605A` as small text on white.

### Common states

- Hover: subtle tonal shift or surface fill, never hover-only discoverability.
- Pressed: visible depth/tone change.
- Focus: high-contrast visible ring; light mode should use Deep Teal Ink or another tested ≥3:1 outline rather than Primary Teal alone.
- Disabled: reduced emphasis plus disabled cursor/behaviour; do not communicate disabled state through opacity alone when text becomes unreadable.
- Loading: keep label context where possible and show progress without changing width unexpectedly.

---

## 7. Form anatomy

### Default field

- Label above field, not placeholder-only.
- 48px standard field height.
- 14px radius.
- 16px input text.
- Light surface: white, Neutral 200 border.
- Dark surface: `#13272B` / `#173136`, border `#24434A`.
- Placeholder uses secondary text, never so faint that it becomes decorative.

### Focus

- Border becomes Deep Teal Ink in light mode / Soft Aqua or equivalent tested light focus treatment in dark mode.
- Add an outer focus halo/ring without shifting layout.
- Focus must remain obvious without relying on glow alone.

### Filled

Filled fields remain visually close to default. Do not use a dramatic new colour merely because a value exists.

### Helper text

Use Body S / 14px. Explain format, consequence or useful guidance; do not duplicate the label.

### Error

- Error icon/border/source accent.
- Accessible error message beneath field.
- Message explains how to resolve the problem.
- Colour is supplemental to icon/text.

### Success

Use sparingly. Routine valid fields do not all need green confirmation; reserve success for meaningful completion/verification.

### Warning

Use when input can continue but deserves attention. Do not style warning and error identically.

### Disabled/read-only

Disabled and read-only are distinct:

- disabled = cannot be acted on;
- read-only = visible/selectable where useful but not editable.

### Loading/submission

- Keep the action visible.
- Prevent duplicate submission.
- Show progress in the action or adjacent status area.
- Do not wipe entered values if a recoverable validation/server error occurs.

---

## 8. Selection controls

- Checkbox/radio visual control: 20–22px inside a larger click/touch area.
- Selected state should use a high-contrast mark. Deep Teal + white mark or Primary Teal + Graphite mark are both viable; avoid white mark on Primary Teal if the mark becomes the only visual cue.
- Toggle track may use Primary Teal as an accent, but state also needs position/label semantics.
- Chips use pill radius and should have explicit selected/focus treatment rather than colour-only state.

---

## 9. Candidate semantic foregrounds for accessible messaging

The confirmed functional colours are useful source/accent colours but several are too light to serve as normal text on white. Candidate stronger foregrounds can be derived without replacing the source palette:

| Role | Source | Candidate strong foreground | Contrast on white |
| --- | --- | --- | ---: |
| Success | `#3BAA7A` | `#2D7A5D` | ~5.18:1 |
| Warning | `#DDAA3A` | `#826C31` | ~5.07:1 |
| Error | `#E0605A` | `#AD504D` | ~5.21:1 |
| Information | `#4A8ECB` | `#3C72A2` | ~5.10:1 |

Suggested pale status surfaces:

- success `#E7F5EF`;
- warning `#FBF5E7`;
- error `#FBECEB`;
- information `#E9F1F9`.

These are **v0.3 candidates**, not yet approved brand tokens.

---

## 10. Stress-test conclusions

The proposed system supports the confirmed visual direction without forcing one universal style:

- learner cards can use Standard and Feature radii with generous spacing;
- Admin can use Compact/Standard radii and tighter spacing while keeping the same controls;
- marketing can use Display XL, Feature radius and larger 64–96px composition spacing;
- forms stay consistent across all three;
- dark mode relies on surface hierarchy rather than adding excessive glow or shadow; and
- the Living E remains the expressive focal point rather than making every component decorative.

## Founder confirmation requested

Approve or adjust the following as a **system direction**:

1. Manrope type-role scale above;
2. 4px spacing rhythm and responsive gutter defaults;
3. `12 / 14 / 20 / 32 / pill` radius family;
4. four-level elevation model;
5. 44px standard control / 52px large control sizing;
6. Primary Teal + Graphite as the default accessible primary button treatment;
7. shared form anatomy and state model; and
8. use of stronger semantic foreground derivatives for accessible status text.

Approval would allow these recurring rules to be promoted into the Brand System and used for the next card/surface-family tranche. It would not approve every future card or layout.