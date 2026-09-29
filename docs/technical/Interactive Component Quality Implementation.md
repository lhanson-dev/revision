# Interactive Component Quality Implementation

Status: Current implementation record  
Authority: `20-brand-and-experience/Interactive Component Quality Standard.md`  
Related authority: `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`  
Canonical runtime: React learner app mounted from `src/main.tsx` and `src/app/PlannerRuntime.tsx`

## Purpose

Record how the Founder-approved interactive-component refinement is implemented across the canonical Revision runtime.

This is a refinement of the existing Interface System, not a visual redesign. The existing Calm Teal visual language, button hierarchy, typography, 14px control radius, restrained depth and REV-specific identity treatment remain in force.

## Shared implementation

### Sizing

`src/app/brand-tokens.css` owns the shared interaction sizing roles.

- Compact control: 36px, limited to appropriate secondary/Admin use.
- Standard learner action: 48px.
- Large learner CTA: 52px.
- Standard field: 48px.
- Icon-only action: 44×44px minimum.

`src/app/interface-system.css` applies the standard learner action height centrally. Standard buttons use 20px horizontal padding; large buttons use 24px. The existing 14px control radius, button typography, focus ring, pressed movement and restrained transition timing are unchanged.

### Processing state

`src/app/ui/controls.tsx` exposes first-class asynchronous state on the shared `Button`:

- `loading?: boolean`
- `loadingLabel?: ReactNode`

When `loading` is true the control:

- disables itself to prevent duplicate submission;
- exposes `aria-busy="true"`;
- renders a controlled processing indicator; and
- may replace the normal action label with a meaningful pending label such as `Adding…`, `Removing…` or `Saving changes…`.

Features should use this state when an async action lasts long enough that the learner could reasonably question whether the interaction was received. A disabled-looking control without an explanation is not the preferred processing pattern.

### Shared specialist primitives

Specialist controls keep their own anatomy where that anatomy communicates their job better than a generic button.

Current shared corrections include:

- menu items: minimum 44px interaction height;
- segmented controls containing shared buttons: minimum 44px interaction height;
- date-picker month navigation: 44×44px;
- date-picker day targets: 44px height on desktop and mobile.

`src/app/interactive-component-quality.css` is a deliberately narrow final enforcement layer for specialist controls whose feature CSS remains local. It is not a second design system. Its current role is to prevent known feature styles from shrinking below the governing target-size contract after the shared Interface System has loaded.

## Canonical page review

The implementation pass reviewed the interactive patterns used by the canonical runtime rather than mechanically restyling every `<button>` element.

### Home

Home retains its distinctive REV prompt, plan navigation and task-row anatomy. These are specialist controls, not generic CTA replacements. Existing large start/task targets are retained. Empty-state ordinary learner actions are raised to the 48px standard.

### Plan

Plan retains its specialist planner controls and view-switch composition. Two pre-existing target-size defects are corrected centrally:

- weekly capacity `+ / −` controls: 32×32px → 44×44px target;
- Day / Week / Month learner view selector: 40px → 48px minimum height.

The planner's existing status messages remain the post-action confirmation mechanism where they already explain recalculation or saved changes.

### Progress

Progress uses shared `Button` actions and therefore inherits the 48px learner standard automatically. Its page hierarchy and course-progress actions do not require a new local button treatment.

### Courses

Courses uses shared buttons. The learner-facing add-course action now uses the standard learner size rather than the compact role. Add/remove mutations use action-specific processing state so only the action actually in flight shows a spinner and pending label. Final course removal uses the Destructive variant; the lower-risk action that merely opens the confirmation remains tertiary.

### Course Overview / Learn / Practice

Shared ordinary actions inherit the new standard sizing and padding. Navigation, response choices and learning-mode selectors remain specialist/contextual controls where their current semantics are clearer than forcing generic action wording. Existing consequence-specific CTAs such as `Start flashcards`, `Start quick check`, `Check answer`, `Practice this topic` and `Record this result` remain appropriate.

### Exam Prep / Exam Simulator

The existing B5 Interface System migration already gives full-exam actions, timed-exam controls, case disclosure and question selectors governed target sizes and visible focus. Question-number navigation remains specialist exam navigation. It is not converted into a generic Button family.

### Authentication and first use

Authentication fields/provider actions and first-use shared buttons already use 48px field or standard-control roles. First-use option rows are already larger than the learner minimum. Noninteractive 32px status badges are intentionally unchanged because the target-size rule applies to interaction, not decorative/status chrome.

### Admin

Admin retains the approved compact 36px action/subnavigation role where dense operational use warrants it. This is explicitly permitted by the authority and is not propagated back into touch-first learner primary actions.

## Language and hierarchy review

The pass applies consequence-first language where ambiguity exists without turning every response or navigation control into verb + object.

Examples of retained valid labels include `Previous`, `Next question`, `Close`, `Not yet`, `Nearly` and `Knew it`. The Courses surface normalises its principal action to `Add course`, exposes `Adding…` while processing, and uses the Destructive visual role only at the actual confirmed removal step.

## Accessibility and motion

The shared contract preserves:

- native button semantics;
- visible `:focus-visible` treatment;
- keyboard operation;
- disabled semantics;
- 44px specialist minimum targets and 48px standard learner actions;
- no essential hover-only behaviour;
- accessible names for icon-only actions; and
- `prefers-reduced-motion` handling.

Loading state meaning must remain understandable even when non-essential animation is removed.

## Assurance

The shared reusable-component test suite covers the asynchronous Button state and verifies that it exposes `aria-busy`, prevents duplicate submission, renders the controlled processing indicator and presents the pending label.

Repository assurance should continue to cover representative Home, Plan, Courses, Learn/Practice, Exam Prep, authentication/first-use and Admin surfaces because feature CSS can otherwise regress shared target sizes after the central system loads.

## Maintenance rule

New ordinary actions should use the shared `Button` / `IconButton` contract. Feature CSS may compose or position controls but must not recreate a competing ordinary button family or shrink interaction targets below the governing standard.

When a specialist control is intentionally kept outside the shared Button component, its owner must still verify target size, keyboard focus, pressed/selected state, disabled/processing behaviour where relevant, reduced motion and accessible naming.
