---
title: "Interaction State and Recovery Standard"
document_id: "revision-interaction-state-and-recovery-standard"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "proposed"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-29"
last_reviewed: "2026-09-29"
review_cadence: "quarterly"
content_review_status: "founder-approved-direction-pending-governed-merge"
source_of_truth_for: ["system states", "loading and progress feedback", "empty states", "error and recovery behaviour", "offline and partial-failure behaviour", "feedback pattern selection", "destructive action recovery", "date and time interaction", "pagination and long-list interaction", "search filter and sort state", "table and bulk-action state behaviour"]
depends_on: ["Product UX Principles", "Visual Brand System", "Interactive Component Quality Standard", "Tone of Voice Framework"]
supersedes: null
---
# Interaction State and Recovery Standard

## Purpose

Define Revision's cross-product interaction rules for the states between ideal screenshots: loading, empty, success, warning, failure, offline, partial results, permissions, stale data, destructive recovery, pagination, date/time selection, and other stateful interactions.

This standard extends the existing Revision visual and UX system. It does not introduce a new aesthetic. Feature implementations continue to use the approved Calm Teal Interface System, shared components, learner language and accessibility requirements.

## Core principle

**A learner journey is not complete when only the happy path is designed.**

Every material feature must deliberately consider the states that can realistically occur and must preserve learner understanding, work and momentum wherever possible.

For each component or journey, consider whether the following states apply:

- default / ready;
- hover where pointer input exists;
- focus;
- active / pressed;
- selected;
- disabled or unavailable;
- loading / processing;
- empty / first use;
- filtered or searched empty;
- success;
- warning;
- validation error;
- service / system error;
- offline / reconnecting;
- partial failure / partial data;
- permission denied;
- stale / expired;
- read-only;
- long or overflow content;
- large text / zoom; and
- responsive / constrained-screen state.

Not every feature needs every state. Every state that can occur in the real product needs intentional behaviour.

## State clarity

A material state must make three things understandable where relevant:

1. **What is happening?**
2. **Is the learner's work or data safe?**
3. **What, if anything, should the learner do next?**

Do not rely on colour alone to communicate state. Use appropriate combinations of wording, iconography, structure and semantic colour.

Do not show a disabled-looking control as the only evidence that an action is processing.

## Loading and processing

When an operation takes long enough that the learner could reasonably wonder whether Revision responded:

- acknowledge the action immediately;
- expose a truthful loading / processing state;
- prevent unsafe duplicate submission;
- preserve the current context;
- use meaningful processing language where useful, for example `Saving…`, `Loading questions…` or `Updating your plan…`;
- expose accessible busy/status semantics where appropriate; and
- do not invent completion percentages or time remaining when Revision cannot know them.

### Skeletons

Skeleton loading may be used where it accurately previews the structure that is about to appear and reduces disruptive layout movement.

Do not use skeletons merely because they look modern. A small spinner, progress indicator, inline status or immediate content transition may be more appropriate for compact operations.

### Layout stability

Reserve space for expected asynchronous content where practical. Late-loading content must not unexpectedly move important controls under the learner's pointer or finger.

## Empty states

Empty states must distinguish why content is absent.

### First-use / genuinely empty

Explain what normally appears here and give the useful next action where one exists.

Example:

> You haven't added any courses yet. Add a course to start building your revision programme.

### Search / filtered empty

Explain that the current search or filters produced no matches and provide a recovery route such as clearing filters, changing the query or broadening the selection.

### Permission / unavailable empty

Do not present missing-permission or unavailable data as though no data exists. Explain the actual condition and the route forward where appropriate.

### Empty-state rule

Do not use generic `No data` wording when Revision can explain the state more usefully.

## Success states

Match feedback strength to consequence.

- Routine setting or preference changes may use subtle inline/transient confirmation.
- Saved learner work should give enough confirmation to remove uncertainty.
- Major milestones may justify a stronger completion treatment.
- Do not delay the learner's next useful action purely to play a success animation.
- Do not celebrate trivial actions with confetti or gamified effects by default.

## Error and recovery behaviour

Revision error handling follows the Tone of Voice Framework and must explain:

- what happened;
- whether learner work is safe;
- what Revision is doing, if anything; and
- what the learner can do next.

### Validation errors

Use specific, local, actionable messages. Preserve valid values. Do not make a learner re-enter correct information because another field failed.

### Service / system failures

Do not present a service failure as though the learner entered something incorrectly. Preserve work, provide retry where safe, and explain when retrying would not help.

### Retry

A retry action should repeat only the failed operation where practical rather than restarting the entire journey.

### Partial failure

When part of a page or operation succeeds and another part fails:

- preserve and show the successful result;
- identify what is unavailable or failed;
- avoid turning the whole screen into a generic error if useful content remains valid;
- provide a bounded retry or recovery route where practical.

## Offline and reconnection

Network failure is normal product behaviour, not an exceptional design afterthought.

Where a feature depends on connectivity:

- distinguish offline/network failure from server/application failure where useful;
- preserve unsent learner work where technically possible;
- explain whether the learner can continue locally or must reconnect;
- provide retry/reconnect behaviour without duplicate actions; and
- do not imply data has been saved until Revision knows it has been saved.

If automatic reconnection or replay occurs, the learner should not be required to repeat an action unless necessary.

## Stale and expired data

Where data can become stale or a session/action can expire:

- identify that the information is no longer current when that matters to the decision;
- refresh or offer refresh where safe;
- preserve learner context;
- avoid allowing a stale action to silently overwrite newer information; and
- explain expiry in learner language rather than technical session terminology where possible.

## Permission denied and read-only states

Unavailable permissions and read-only conditions must be visually and semantically distinct from disabled loading states.

Explain why the action is unavailable when the reason is useful and safe to disclose.

Do not expose controls as apparently available and reveal permission failure only after avoidable learner work.

## Feedback pattern selection

Revision uses the least disruptive pattern that reliably communicates the state.

### Inline feedback

Use for information tied to a specific field, control, task or content region.

Typical uses:

- field validation;
- upload failure;
- task-specific warning;
- contextual save status.

### Toast / transient confirmation

Use for short-lived, low-consequence confirmation that the learner does not need to remember or act upon.

Do not place critical information, recovery instructions or required actions only inside a disappearing toast.

### Banner / persistent contextual notice

Use for a condition affecting a meaningful page or product region and which should remain visible while relevant.

Examples may include a service limitation, offline mode or important contextual warning.

Avoid banner proliferation; repeated banners weaken attention.

### Dialog / alert

Use only where the learner must make an immediate decision or understand a material consequence before proceeding.

Do not use a dialog merely because a message is important. Do not nest dialogs.

### Drawer / sheet

Use for contained secondary interaction where preserving the underlying page context is useful. The pattern must remain keyboard/focus accessible and must not become a substitute for proper information architecture.

### Tooltip

Use only for supplemental explanation. Essential instructions and required actions must not depend on hover-only tooltip content.

## Destructive and irreversible actions

The strength of protection must match consequence.

### Reversible actions

Where technically safe and comprehensible, prefer recovery such as Undo over repeated confirmation for low-risk reversible actions.

### Irreversible / consequential actions

Use explicit confirmation when an action can cause material data loss, account impact, payment/subscription consequence or another high-impact outcome.

Confirmation wording must name the action and affected object, for example `Remove Business course?`, rather than relying on `Are you sure?`.

Destructive actions remain governed by Error semantics and must not be visually confused with constructive primary actions.

## Search, filters and sorting

Where search, filter or sort is used:

- preserve the learner's query and active state while they inspect a result and return where practical;
- make active filters visible;
- provide a clear reset/remove route;
- show current sort order where sorting changes interpretation;
- distinguish filtered-empty from genuinely empty content;
- tolerate realistic input such as case differences and minor spelling variation where the domain and implementation reasonably allow it; and
- avoid making the learner reconstruct a query after recoverable failure.

Search should support the learner's task rather than compensate for unnecessarily complex information architecture.

## Pagination and long lists

Pagination and progressive/infinite loading are different tools; neither is universally preferred.

### Use pagination when

- position matters;
- learners/admin users need to revisit or compare bounded result sets;
- the total or current range provides useful orientation; or
- operational/Admin work benefits from explicit chunks.

### Use progressive / infinite loading when

- the task is continuous exploration;
- exact page position is not important; and
- returning to the list can reliably restore the learner's location.

### Pagination requirements

Where pagination is used:

- communicate useful position, such as current range and total where known;
- make Previous / Next and page controls unambiguous;
- disable or omit impossible navigation clearly;
- preserve filters, sort and selected context across pages;
- preserve the user's page/scroll position when they inspect an item and return where practical;
- do not unexpectedly reset to the first page after a non-structural action; and
- ensure controls remain keyboard and touch accessible.

Prefer `21–40 of 126` or equivalent useful range context over a bare `Page 2` where total/range is meaningful and available.

### Long-list completion

For finite progressive lists, make the end of the list understandable rather than silently ceasing to load.

## Tables and bulk actions

Tables are appropriate where comparison across structured columns is part of the job. Do not force data-heavy Admin work into card grids merely for visual consistency.

Where tables are used:

- keep column headings understandable;
- use sticky headers/columns where they materially improve long-table orientation;
- align comparable numbers consistently;
- expose sort state;
- preserve filter/pagination state when opening and returning from a record where practical;
- make selected rows and selection count obvious;
- make bulk-action scope explicit before consequential actions;
- distinguish empty, filtered-empty, loading, partial-failure and permission states; and
- define a deliberate constrained-screen strategy rather than squeezing every desktop column onto mobile.

## Date and time interaction

Use the interaction that best fits whether the learner already knows the date/time or needs to explore available dates.

### Known dates

For dates the learner already knows, such as a personal or exam date they have been given, allow efficient direct entry where appropriate rather than forcing repeated calendar navigation.

### Choosing from availability

Use a calendar/date picker when the learner needs to understand day-of-week, relative dates, availability or surrounding dates.

### Date rules

Where date pickers or date fields are used:

- allow keyboard/direct entry where appropriate;
- use unambiguous learner-facing date presentation, especially for consequential dates;
- localise to the product's supported locale while avoiding ambiguous numeric-only formats where confusion is plausible;
- explain why a date is unavailable when that information helps the learner recover;
- prevent impossible selections rather than accepting them and failing later where practical;
- retain the selected/entered date after unrelated validation errors;
- make mobile date selection suitable for touch rather than shrinking a desktop popover;
- ensure keyboard/focus operation is accessible; and
- state timezone where it materially changes meaning.

### Date ranges

Where users commonly choose relative periods, offer useful presets such as `Last 7 days` or `Last 30 days` when they reduce effort and match the task. Do not add presets that are irrelevant to learner decisions.

## Responsive and accessibility requirements

All state and recovery patterns inherit Revision's WCAG 2.2 AA target and responsive requirements.

At minimum:

- status meaning must not depend on colour alone;
- important dynamic status changes must be exposed appropriately to assistive technology;
- keyboard focus remains visible and is not obscured by sticky/floating UI;
- transient feedback must not disappear before it can reasonably be perceived where its content matters;
- touch targets meet the governed interaction-size requirements;
- long state/error messages wrap without breaking the layout;
- reduced-motion preferences remove non-essential state animation; and
- mobile treatments retain the same recovery capability as desktop.

## Implementation and assurance

When a feature is introduced or materially changed, design/implementation review must identify the applicable states before considering the feature complete.

At minimum, assurance should consider:

1. happy path;
2. loading / processing;
3. empty or no-result state where applicable;
4. validation error;
5. service/network failure;
6. retry/recovery;
7. responsive/mobile behaviour;
8. keyboard/focus/accessibility behaviour;
9. preservation of learner work/context; and
10. destructive or irreversible consequences where applicable.

Features using pagination, date/time controls, search/filter/sort or tables must additionally test the specific rules in this standard.

## Deliberate non-goals

This standard does not require every feature to implement every possible state or component pattern. It requires teams and AI-assisted implementation to identify which states can genuinely occur and design those states deliberately.

It does not authorise page-local notification systems, new visual themes, arbitrary component variants or generic redesign.
