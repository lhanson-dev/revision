---
title: "Interactive Component Quality Standard"
document_id: "revision-interactive-component-quality-standard"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-28"
last_reviewed: "2026-09-28"
review_cadence: "quarterly"
content_review_status: "founder-approved"
source_of_truth_for: ["button quality", "action control sizing", "interactive control hierarchy", "interaction feedback states", "action labelling"]
depends_on: ["Visual Brand System", "Product UX Principles", "Tone of Voice Framework"]
supersedes: "For ordinary action buttons and button-like learner controls only, this standard supersedes the earlier 44px Standard button-height clause and 44px standard-button references in Visual Brand System > Controls and forms where the rules below are more specific. All other Visual Brand System rules remain active."
---
# Interactive Component Quality Standard

## Purpose

Define the minimum quality bar for buttons and recurring action controls across Revision without introducing a new visual aesthetic.

This standard refines the existing Calm Teal Interface System. It does not authorise page-local button families, blanket pill styling, decorative glow, heavy elevation or unrelated redesign.

## Core rule

Every important interactive component must make seven things clear:

1. **Size** — it is comfortably tappable or clickable.
2. **Language** — the learner can understand what will happen.
3. **Contrast** — it is distinguishable from surrounding content and its hierarchy is clear.
4. **Depth** — its layer and importance make sense without decorative excess.
5. **Detail** — typography, shape, spacing and any icon form one coherent control.
6. **Response** — the interface acknowledges the interaction and its resulting state.
7. **Accessibility** — the control remains usable with touch, keyboard, assistive technology, zoom and reduced motion.

A control that fails one of these tests is not complete merely because its default screenshot looks correct.

## Action hierarchy

Revision retains the approved shared action hierarchy:

- **Primary** — the principal useful action in the immediate context.
- **Strong / inverse primary** — a justified higher-contrast action on an inverse or special surface.
- **Secondary** — a meaningful alternative with a persistent container.
- **Tertiary** — a lower-emphasis action without a permanent container.
- **Destructive** — deletion or irreversible action with Error semantics.

A material screen should not present several unrelated actions as equally primary. Visual emphasis must correspond to the screen's actual next useful action.

Navigation controls, segmented selectors, answer choices, exam question selectors and other specialist interactions do not automatically become ordinary `Button` components. Their specialist anatomy may remain, but they must still meet this standard's target-size, state, feedback and accessibility requirements.

## Control sizing

### Ordinary learner actions

- **Standard learner button:** 48px minimum interaction height.
- **Large learner / major CTA:** 52px minimum interaction height.
- **Compact:** 36px may be used only for genuinely compact secondary/Admin actions where surrounding layout and pointer use justify it; compact controls must not be the primary learner action on touch-first surfaces.
- **Icon-only control:** minimum 44×44px interactive target. Prefer 48×48px when the icon control is a primary learner action or sits in a touch-first flow.
- **Button-like segmented/tab selector:** minimum 44px interactive height; prefer 48px for primary learner view selection.
- **Small visible glyphs or circles:** may sit inside a larger invisible or transparent target. Do not make learners aim at a 32px control simply because the visible mark is small.

Standard learner buttons should normally use approximately 20px horizontal padding; large CTAs approximately 24px. Compact secondary/Admin actions may use approximately 12px. Text wrapping and responsive layout may require sensible exceptions without shrinking the hit target.

## Shape, edge and depth

Keep the approved 14px Control radius for ordinary buttons. Pill treatment remains for chips, badges, toggles and deliberately pill-like selectors; do not make all buttons pills.

Interactive controls must be distinguishable through an appropriate combination of fill, edge, contrast, spacing and state response. Do not rely on a tiny colour difference alone.

Depth communicates hierarchy, not decoration. Ordinary buttons do not gain glow or heavy shadow merely to appear premium. The existing Revision approach — surface hierarchy, restrained borders, subtle raised treatment where justified and a small pressed movement — remains the default.

## Action language

### Consequence-first labels

Where an action changes data, starts work or has a material consequence, prefer a concise label that describes the result, normally **verb + object**:

- Add exam
- Save changes
- Add course
- Remove course
- Start flashcards
- Check answer
- Record result

Do not enforce verb + object mechanically where the surrounding interaction already supplies the object or where the control is a response/navigation state. Labels such as Previous, Next question, Close, Not yet, Nearly and Knew it can be correct.

Avoid vague primary labels such as Continue, Submit, OK or Done when the consequence is not obvious from nearby context. In progressive flows, Continue is acceptable when the next step is self-evident and no data-changing consequence is being hidden.

## Icons

Use an icon when it improves recognition, communicates state or clarifies the action. Do not add icons merely because there is space.

Icons inside standard action controls should normally use the approved compact icon role with approximately 8px separation from the label. Icons must use the controlled Revision icon language and may not substitute for a clear label where text is required.

## Interaction states

Every recurring ordinary action must deliberately support the states relevant to its job:

- default;
- hover where pointer input exists;
- keyboard focus;
- pressed;
- loading / processing where the action is not effectively immediate;
- success where confirmation is useful before the interface moves on;
- disabled where an action is genuinely unavailable; and
- error/recovery where an attempted action fails.

No essential interaction may depend on hover.

### Pressed response

Revision's restrained physical response remains approved: a control may move approximately 1px on press. Do not combine this with exaggerated scaling or bounce.

### Processing

When an action takes long enough that the learner could reasonably wonder whether the interface heard them:

- acknowledge the action immediately;
- prevent unsafe duplicate submission;
- expose a clear processing state in the control or immediately adjacent status;
- keep the label meaningful, for example `Saving…`, `Adding course…` or `Recording result…`;
- preserve entered work after recoverable failure; and
- use `aria-busy` or an equivalent accessible state where appropriate.

A disabled-looking button without any processing explanation is not sufficient feedback for a submitted action.

### Success

Use short confirmation when it helps preserve certainty, for example `Saved` or `Recorded`, paired with an approved success icon or adjacent success status. Do not delay useful navigation merely to play a success animation.

## Motion

Motion must explain state change rather than decorate the interface.

- Hover/focus transitions should remain restrained.
- Press acknowledgement should be immediate.
- Standard state transitions should normally remain within the existing fast/standard Revision motion roles (approximately 160–200ms).
- Loading indicators may animate continuously only while work is actually in progress.
- Success transitions should be short and functional.
- `prefers-reduced-motion` must remove non-essential transition and animation without removing state meaning.

## Accessibility

Interactive controls must:

- meet the target-size rules above;
- preserve visible keyboard focus;
- use sufficient text/icon/background contrast;
- remain understandable without colour alone;
- expose an accessible name;
- use logical native semantics where available;
- not hide an enabled action behind hover-only behaviour;
- remain usable under text enlargement/zoom; and
- respect reduced-motion preferences.

Revision continues to target WCAG 2.2 AA for learner-facing experiences.

## Page-level review rule

When a learner or Admin surface is materially changed, review its interactive controls rather than assuming shared CSS makes the page correct.

The review must check:

1. whether the dominant action is visually and verbally clear;
2. whether ordinary actions use the shared `Button` / `IconButton` contract where applicable;
3. whether specialist controls still meet target-size, focus and state rules;
4. whether async actions visibly acknowledge processing and recovery;
5. whether labels describe consequences where ambiguity exists;
6. whether multiple primary-looking actions have diluted the hierarchy; and
7. whether mobile/tablet interaction remains at least as usable as desktop.

Do not convert specialist interactions into generic buttons solely for visual consistency. Consistency means a shared interaction-quality contract, not identical anatomy.

## Deliberate non-goals

This standard does **not** authorise:

- a new visual theme;
- full-pill ordinary buttons by default;
- glowing or sci-fi CTA treatments;
- decorative shadows on every action;
- icons on every button;
- 48px visible chrome for every specialist control when a larger transparent target can satisfy touch requirements;
- verbose labels that make simple navigation harder to scan; or
- page-local forks of the shared action system.

## Implementation and assurance

The shared Interface System should own ordinary button dimensions, typography, spacing, focus, pressed, disabled and processing anatomy. Feature styles should own only genuine job-specific composition.

Assurance should include shared-component tests plus bounded browser/screenshot coverage of representative learner surfaces. Local controls below the governed target size are defects even when they pre-date this standard.
