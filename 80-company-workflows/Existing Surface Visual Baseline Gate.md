# Existing Surface Visual Baseline Gate

**Status:** Proposed — Founder direction received 2026-09-23; active after governed merge  
**Owner:** Founder  
**Purpose:** Prevent existing Revision product surfaces from being visually redesigned as greenfield concepts and require every visual proposal to inherit the current approved product baseline before introducing deliberate changes.

## Operating rule

When a task concerns an **existing Revision product surface**, visual design begins from the current approved Revision product, not from a generic design prompt, market convention or blank canvas.

The question is:

> **What should change from the current approved Revision experience to improve this journey?**

It is not:

> **What would a modern app for this problem look like if designed from scratch?**

This gate applies to design analysis, wireframes, mock-ups, image-generation prompts, prototypes and production implementation.

## Mandatory baseline inspection before a visual proposal

Before producing or approving a visual artefact for an existing learner surface, the designer or AI agent must inspect current approved `main` and identify the canonical route/runtime for the surface.

The inspection must include, where applicable:

1. the current screen/component implementation for the exact route;
2. the canonical learner shell and navigation used around it;
3. the approved Visual Brand System and Product UX Principles;
4. the Interface System Operating Standard and relevant component/asset registry;
5. the current design tokens and shared surface/control roles;
6. the relevant feature composition CSS or equivalent implementation source;
7. subject-accent authority and mappings where the surface is subject-scoped;
8. current Light/Dark and responsive behaviour; and
9. the latest approved visual-regression snapshot, design-acceptance evidence or other retained visual baseline for that surface or its nearest inherited parent experience.

Reading brand guidelines alone is not sufficient where current implementation evidence exists. Current implementation does not override authority, but it is required evidence for understanding what approved Revision already looks like.

## Preserve / change contract

Before creating the visual proposal, explicitly separate:

### Preserve

Existing product elements that remain governed and should carry forward, such as:

- Revision identity and wordmark;
- Living E / REV presence;
- global learner shell;
- desktop rail and responsive drawer patterns;
- typography roles;
- brand/action colours;
- subject accents;
- shared controls, icons, radii, spacing and surface hierarchy;
- course identity/navigation patterns; and
- Light/Dark behaviour.

### Change

Only the elements that the current journey decision genuinely requires to evolve, for example:

- page composition;
- content hierarchy;
- information density;
- local navigation depth where governed;
- educational treatment;
- page-specific reading/task/performance layout; or
- a deliberately approved new shared variant.

A visual proposal is not ready if this boundary is unclear.

## Fidelity rule for mock-ups

A mock-up of an existing Revision surface must be a **fidelity mock-up of Revision plus the proposed change**, not concept art for a different product.

It must not invent, unless explicitly proposed and approved:

- a new global shell;
- a different sidebar/header treatment;
- a replacement logo, wordmark, icon family or REV identity;
- an unrelated primary colour system;
- arbitrary typography;
- a second navigation model for information already owned by the shell;
- new radius/shadow/card conventions; or
- surrounding UI that is not supported by inspected current-product evidence.

If the available prototyping or image-generation method cannot reproduce the current shell with sufficient fidelity, do **not** fabricate it. Instead, constrain the artefact to the bounded new area being reviewed and show its relationship to inherited shell elements through annotations or a structural wireframe.

## Visual-reference rule

Where approved screenshots or visual-regression baselines exist, they are required design input for an existing-surface visual review.

The designer should compare the proposal against the baseline for:

- shell and navigation;
- typography;
- colour roles;
- density and spacing;
- control language;
- subject identity;
- REV treatment;
- Light/Dark translation; and
- responsive composition.

A proposal that could plausibly belong to an unrelated education product fails this gate even if its local content structure is strong.

## Relationship to consistency without sameness

This gate does **not** require every Revision page to have the same composition.

The Journey-Led Experience Review Workflow still requires page composition to reflect the job of the experience. Learn may become more editorial and reading-led; Practice may become more task-led; Exam Prep may become more performance-led.

The distinction is:

- **composition may evolve for the job**;
- **Revision's design grammar and inherited shell do not reset for each page**.

## Review evidence

For a material visual-design approval, retain enough evidence to show:

- which current baseline was inspected;
- what was deliberately preserved;
- what was deliberately changed;
- why each change supports the screen-purpose contract;
- how the proposal translates across relevant phone/tablet/desktop and Light/Dark states; and
- whether any shared-system extension is required.

This may be captured in the journey review, PR description, design-acceptance record or equivalent governed evidence rather than creating duplicate documentation.

## Acceptance questions

Before presenting an existing-surface visual proposal to the Founder, ask:

- Does this visibly look like the current Revision product before considering the new feature-specific composition?
- Can every material departure from the current visual baseline be named and justified?
- Have existing shell, navigation, subject accent, REV, typography and component rules been preserved where they remain applicable?
- Was an approved visual baseline inspected where one exists?
- Has the proposal avoided inventing surrounding UI merely because the mock-up tool started from a blank canvas?
- Could this proposal be implemented primarily through the existing Interface System rather than creating a parallel local design system?

If the answer to any applicable question is no, the visual proposal is not ready for Founder approval.

## Documentation impact

This gate specialises the Journey-Led Experience Review Workflow and operationalises the existing Visual Brand System and Interface System Operating Standard for visual-design work on existing product surfaces.

It does not change the approved Revision brand. It adds a mandatory evidence and process step so existing-product visual work is grounded in the current canonical product before deliberate evolution is proposed.
