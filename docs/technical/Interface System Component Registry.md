# Revision Interface System Component Registry

**Status:** B2.5 reusable foundation live; B7.1–B7.4 ownership consolidation live; B7.5 final component/compatibility acceptance pending exact-head assurance and merge  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Runtime location:** `src/app/ui/`

## Purpose

Give contributors one implementation reference for recurring Revision interface anatomy so a new page starts by selecting existing components, icons and assets rather than recreating equivalent styling locally.

This registry is implementation guidance. The Visual Brand System remains normative authority.

## Import boundary

Feature code should normally import shared UI from:

```ts
import {
  BrandAsset,
  Button,
  DrawerShell,
  EmptyState,
  Icon,
  IconButton,
  LoadingState,
  Menu,
  MenuItem,
  ModalShell,
  OverlayBackdrop,
  PageHeader,
  SegmentedControl,
  SelectField,
  Status,
  Surface,
  TextAreaField,
  TextField,
} from './ui'
```

Use the relative path appropriate to the feature location. Do not import internal component files merely to bypass the public registry.

## Component catalogue

| Component | Approved job | Variants / options | Do not use it for |
| --- | --- | --- | --- |
| `PageHeader` | Standard learner/product page title hierarchy | eyebrow, title, description, optional children | feature hero/REV expression that genuinely needs the Feature family |
| `Surface` | Named content grouping | Standard, Quiet, Interactive, Feature, Floating; optional padding | wrapping every paragraph or inventing dashboard density |
| `Button` | Shared learner/admin actions | Primary, Strong, Secondary, Tertiary, Destructive; Compact/Standard/Large | links that are not actions or one-off local button styling |
| `IconButton` | 44×44 icon-only action | accessible label required | unlabeled controls or decorative icons |
| `TextField` | Labelled single-line input anatomy | hint/error support; native input props | placeholder-only forms |
| `TextAreaField` | Labelled multiline text-entry anatomy | hint/error support; native textarea props | specialist editors whose semantics differ from ordinary text entry |
| `SelectField` | Labelled native select anatomy | hint/error support; native select props | bespoke selection UI where a native select is sufficient |
| `SegmentedControl` | Bounded mutually exclusive selection | labelled group containing shared buttons | navigation or arbitrary collections of actions |
| `Status` | Semantic feedback | Success, Warning, Error, Information | decorative coloured callouts; status without visible semantic text |
| `EmptyState` | Truthful absence / next-step support | title, description, optional action | manufactured upgrade friction or generic filler |
| `LoadingState` | Bounded loading feedback | custom loading text | hiding long-running work without state explanation |
| `ModalShell` | Modal dialog interaction/surface frame | label or labelled-by; `onDismiss`; optional initial/return-focus selectors | page navigation or ordinary content grouping |
| `DrawerShell` | Responsive/contextual drawer interaction/surface frame | label or labelled-by; `onDismiss`; optional initial/return-focus selectors | persistent desktop sidebar composition |
| `OverlayBackdrop` | Pointer-dismiss backdrop paired with a modal/drawer | accessible label; consumer-owned click dismissal | keyboard focus target or replacement for the dialog shell |
| `PopoverShell` | Compact floating contextual surface | labelled/labelled-by | full task flows that need a modal/page |
| `Menu` / `MenuItem` | Recurring menu/progressive disclosure | current-page state | dense unrelated button groups |
| `Icon` | Controlled rounded-line product icon | inline/compact/standard/large | Living E identity, emoji controls or page-local icon libraries |
| `BrandAsset` | Canonical Revision identity asset selection | wordmark, Living E resting, Living E nav | redrawing or approximating identity marks |

## Shared modal/drawer interaction contract

`ModalShell` and `DrawerShell` own the reusable keyboard/focus behaviour for modal work. Consumers provide placement/composition and, where necessary, selectors for the most useful initial and stable return-focus targets.

When mounted, the shared contract:

- moves initial focus inside the dialog;
- contains forward and reverse `Tab` navigation;
- redirects escaped programmatic focus back into the active dialog;
- makes background branches `inert`;
- locks body scrolling;
- invokes `onDismiss` for `Escape` where the consumer allows dismissal;
- restores focus after close, including responsive trigger replacement through `returnFocusSelector`; and
- respects active-dialog stacking so one closing overlay cannot steal focus from another newly opened overlay.

Feature code must not add a second focus trap, body-scroll lock or Escape listener around a shared modal/drawer. `OverlayBackdrop` is deliberately outside keyboard tab order; keyboard dismissal belongs to the shell contract.

The shared shells do not own screen placement. A feature may compose a centred modal, edge drawer or contextual panel through feature CSS while preserving the common interaction contract.

## Surface selection

Choose the family before styling composition:

- **Standard** — ordinary content grouping.
- **Quiet** — supporting/secondary information.
- **Interactive** — routes and selectable/actionable summaries.
- **Feature** — deliberately exceptional editorial/brand moment.
- **Floating** — popovers and compact elevated context.

REV, Exam/Performance, Guidance and other specialist families remain governed by the Visual Brand System. Add a reusable shared variant only when its recurring job is proven; do not stretch Standard/Feature merely for appearance.

A reading page is not automatically a collection of `Surface` cards. B7.5 explicitly keeps Learn as one reading workspace with section dividers rather than nested bordered containers.

## Button selection

- **Primary:** the principal useful action in the immediate context.
- **Strong:** inverse/deep-teal action where a stronger surface relationship is justified.
- **Secondary:** meaningful alternative with a persistent container.
- **Tertiary:** lower-emphasis action without a permanent container.
- **Destructive:** deletion/irreversible action with Error semantics.

A page may contain several actions but should not make several unrelated actions look equally primary.

Feature-specific interactive cards, assessment answers and dense operational navigation do not need to become `Button` merely because they respond to a click. Use `Button` where the recurring job is an ordinary action control.

## Fields

Use `TextField`, `TextAreaField` and `SelectField` so labels, support/error text, field sizing, typography, theme roles and focus treatment stay consistent.

Native capabilities such as `type="date"`, `type="number"`, `required`, `min`, `max`, `autocomplete`, `rows` and `maxLength` remain available through normal props.

Do not replace accessible native behaviour merely to make a control visually unusual.

Specialist evidence controls such as AO mark allocation may remain feature-owned because they combine bounded numeric entry with assessment semantics. The exception is about interaction meaning, not permission to create a new visual foundation.

## Current B7.5 common-control consumers

B7.5 extends shared-control consumption in two previously partial areas.

### Focused Learn / Practice

`FocusedLearningWorkspace` uses:

- `SelectField` for topic choice;
- `SegmentedControl` + `Button` for activity mode selection;
- `Button` for ordinary reveal/check/next/record actions; and
- `TextAreaField` for written case/exam-practice drafts.

Multiple-choice option rows and AO marking inputs remain specialist assessment controls.

### Admin / Content Operations

`ContentOperations` uses:

- compact secondary `Button` for refresh;
- `Button` for ordinary route/intake actions;
- `TextField` for the official awarding-body URL; and
- `TextAreaField` for optional intake instructions.

Admin stat cards, sub-navigation, trends, tables, health rows and operational text links remain deliberately dense Admin composition.

## Status and empty/loading states

`Status` always includes a controlled semantic icon and visible semantic label in addition to colour. This protects meaning for colour-vision differences and when styles fail to load.

`EmptyState` and `LoadingState` are calm supporting patterns. Feature code supplies truthful domain copy; the component supplies consistent anatomy.

## Icons

`Icon` is the only general-purpose product icon registry introduced by B2.5. Icons:

- use `currentColor`;
- use central size and stroke roles;
- use rounded caps/joins;
- remain semantically labelled by their containing control or by an explicit `title` when the icon itself conveys information; and
- do not include the Living E.

If a recurring icon is missing, add it to the registry and assurance rather than adding a separate icon source to a page. B7.4 added controlled `arrow-up` and `play` jobs so Home REV submit and Exam resume no longer use text/Unicode glyphs.

### B7 learner-shell and recurring ownership

The canonical `PlannerRuntime` shell consumes the public `Icon` registry for recurring learner navigation/account jobs rather than maintaining a shell-local SVG family. The controlled registry includes Home, Plan, Progress, Courses, Profile/user, Settings, Admin, Upgrade plan, Log out, close and chevron-right jobs.

The shell may retain composition-specific sizing through feature classes, but reusable drawing, stroke language and control anatomy are centrally owned.

B7.3 moved Ask REV and the mobile navigation drawer onto `DrawerShell`/`OverlayBackdrop`, removed local focus/scroll/Escape ownership, and replaced raw close/chevron glyphs with controlled `Icon`/`IconButton` treatments. `AccountModal` and Exam Pause/Stop consume the same modal focus contract.

B7.4 completed the bounded identity/glyph consolidation by:

- replacing the shell-local `RevWordmark()` reconstruction with canonical theme-paired `BrandAsset` wordmarks;
- removing Account's local Profile/Settings SVG family;
- replacing Home raw submit/chevron/arrow control glyphs with shared `Icon` jobs;
- replacing Home alternate REV recommendation marks with governed `RevPresence`; and
- replacing the Exam pause/resume Unicode play glyph with `play`.

Domain/activity-specific task markers are not silently reclassified as general navigation icons. The final B7 record documents their deliberate status.

## Canonical identity assets

`BrandAsset` consumes theme-paired files from the canonical `assets/brand/` package. Current helpers cover:

- primary Revision wordmark;
- Living E Resting treatment; and
- Living E navigation treatment.

Both light and dark sources are present in the same component structure. Theme translation is controlled by runtime `data-theme` state and shared component CSS; pages do not choose a separate local dark asset rule.

The canonical learner shell uses this helper for its full Revision wordmark instead of reconstructing REV from text and locally drawn E bars. The brand manifest remains the canonical lifecycle/provenance record.

## Light and dark mode rule

Components never define a page-specific dark palette. They consume semantic roles from `brand-tokens.css`. The same markup is rendered in both themes.

When a reusable visual genuinely requires distinct exported artwork, such as the wordmark, `BrandAsset` owns paired light/dark selection centrally.

The retired `interface-theme-integrity.css` file is not an extension point. B7.5 removes it; theme defects must be corrected in the token/shared/semantic feature owner.

## Example composition

```tsx
<PageHeader
  titleId="example-title"
  eyebrow="Context"
  title="Example"
  description="Explain what this page is for and what the learner can do next."
/>

<Surface aria-labelledby="example-section">
  <h2 id="example-section">Useful work</h2>
  <TextField label="Name" />
  <TextAreaField label="Notes" />
  <Button>Continue</Button>
</Surface>
```

This is intentionally ordinary. Page identity should come from the product job and composition, not from inventing new controls or decorative values.

## Assurance

The shared system is protected by:

- component rendering/semantic tests in `src/app/ui/ui-components.test.tsx`;
- enterprise token/component/icon/asset checks in `scripts/assurance/interface-system-governance.test.mjs`;
- final bridge/component/composition checks in `scripts/assurance/b7-final-acceptance.test.mjs`;
- site-wide semantic theme checks;
- `tests/e2e/overlay-focus.spec.ts` for shared modal/drawer interaction;
- `tests/e2e/b7-final-acceptance.spec.ts` for fixed-dock clearance/timed-exam suppression;
- `tests/e2e/interface-visual-regression.spec.ts` for the bounded 18-state Light/Dark visual matrix; and
- normal risk-classified Revision CI/path-to-live controls.

B7 shell icon/identity ownership additionally has fail-closed static contracts in `b7-shell-icon-ownership.test.mjs` and `b7-identity-glyph-ownership.test.mjs`.

## Extension rule

Before adding a new shared component or variant:

1. identify the recurring product job;
2. confirm existing components cannot express it cleanly;
3. map it to governing surface/control/semantic rules;
4. implement it centrally using design tokens;
5. provide relevant accessibility/theme/responsive states;
6. add assurance; and
7. update this registry when the public component contract changes.

A one-page visual preference is not sufficient reason to expand the shared registry.
