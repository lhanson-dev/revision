# Revision Interface System Component Registry

**Status:** B2.5 implementation reference; B7 shell icon ownership consolidation in progress  
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
  EmptyState,
  Icon,
  IconButton,
  LoadingState,
  Menu,
  MenuItem,
  PageHeader,
  SelectField,
  Status,
  Surface,
  TextField,
} from './ui'
```

Use the relative path appropriate to the feature location. Do not import internal component files merely to bypass the public registry.

## Component catalogue

| Component | Approved job | Variants / options | Do not use it for |
| --- | --- | --- | --- |
| `PageHeader` | Standard learner/product page title hierarchy | eyebrow, title, description, optional children | feature hero/REV expression that genuinely needs the Feature family |
| `Surface` | Named content grouping | Standard, Quiet, Interactive, Feature and Floating; optional padding | wrapping every paragraph or inventing dashboard density |
| `Button` | Shared learner/admin actions | Primary, Strong, Secondary, Tertiary, Destructive; Compact/Standard/Large | links that are not actions or one-off local button styling |
| `IconButton` | 44×44 icon-only action | accessible label required | unlabeled controls or decorative icons |
| `TextField` | Labelled input anatomy | hint/error support; native input props | placeholder-only forms |
| `SelectField` | Labelled native select anatomy | hint/error support; native select props | bespoke selection UI where a native select is sufficient |
| `SegmentedControl` | Bounded mutually exclusive selection | labelled group containing shared buttons | navigation or arbitrary collections of actions |
| `Status` | Semantic feedback | Success, Warning, Error, Information | decorative coloured callouts; status without visible semantic text |
| `EmptyState` | Truthful absence / next-step support | title, description, optional action | manufactured upgrade friction or generic filler |
| `LoadingState` | Bounded loading feedback | custom loading text | hiding long-running work without state explanation |
| `ModalShell` | Modal dialog frame | labelled/labelled-by dialog | page navigation or ordinary content grouping |
| `DrawerShell` | Responsive drawer frame | labelled/labelled-by dialog | desktop sidebar composition |
| `PopoverShell` | Compact floating contextual surface | labelled/labelled-by | full task flows that need a modal/page |
| `Menu` / `MenuItem` | Recurring menu/progressive disclosure | current-page state | dense unrelated button groups |
| `Icon` | Controlled rounded-line product icon | inline/compact/standard/large | Living E identity, emoji controls or page-local icon libraries |
| `BrandAsset` | Canonical Revision identity asset selection | wordmark, Living E resting, Living E nav | redrawing or approximating identity marks |

## Surface selection

Choose the family before styling the composition:

- **Standard** — ordinary content grouping.
- **Quiet** — supporting/secondary information.
- **Interactive** — routes and selectable/actionable summaries.
- **Feature** — deliberately exceptional editorial/brand moment.
- **Floating** — popovers and compact elevated context.

REV, Exam/Performance, Guidance and other specialist families remain governed by the Visual Brand System. Add a reusable shared variant only when its recurring job is proven; do not stretch Standard/Feature merely for appearance.

## Button selection

- **Primary:** the principal useful action in the immediate context.
- **Strong:** inverse/deep-teal action where a stronger surface relationship is justified.
- **Secondary:** meaningful alternative with a persistent container.
- **Tertiary:** lower-emphasis action without a permanent container.
- **Destructive:** deletion/irreversible action with Error semantics.

A page may contain several actions but should not make several unrelated actions look equally primary.

## Fields

Use `TextField` and `SelectField` so labels, support/error text, 48px field sizing, typography, theme roles and focus treatment stay consistent. Native capabilities such as `type="date"`, `type="number"`, `required`, `min`, `max` and `autocomplete` remain available through normal props.

Do not replace accessible native behaviour merely to make a control visually unusual.

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

If a recurring icon is missing, add it to the registry and assurance rather than adding a separate icon source to a page.

### B7 learner-shell ownership

The canonical `PlannerRuntime` shell consumes the public `Icon` registry for recurring learner navigation and account jobs rather than maintaining a shell-local SVG family. The controlled registry includes the shell jobs for Home, Plan, Progress, Courses, Profile/user, Settings, Admin, Upgrade plan and Log out.

The shell may retain composition-specific sizing through its `nav-icon` class, but the drawing, stroke language and reusable icon identity are owned centrally by `src/app/ui/Icon.tsx`.

This B7 increment addresses recurring shell navigation/account icons only. The shell's local REV wordmark reconstruction, text close glyphs and other recurring control glyphs remain separate B7 ownership work and are not silently treated as resolved by the icon migration.

## Canonical identity assets

`BrandAsset` consumes theme-paired files from the canonical `assets/brand/` package. Current helpers cover:

- primary Revision wordmark;
- Living E Resting treatment; and
- Living E navigation treatment.

Both light and dark sources are present in the same component structure. Theme translation is controlled by the runtime `data-theme` state and shared component CSS; pages do not choose a separate local dark asset rule.

The brand manifest remains the canonical lifecycle/provenance record. A new identity asset must enter that package/manifest before the helper treats it as approved.

## Light and dark mode rule

Components never define a page-specific dark palette. They consume semantic roles from `brand-tokens.css`. The same markup is rendered in both themes.

When a reusable visual genuinely requires distinct exported artwork, such as the wordmark, `BrandAsset` owns the paired light/dark selection centrally.

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
  <Button>Continue</Button>
</Surface>
```

This is intentionally ordinary. Page identity should come from the product job and composition, not from inventing new controls or decorative values.

## B2.5 proof consumer

`src/app/PlanScreen.tsx` is the first learner page migrated from CSS-class-only primitive consumption to the reusable React component registry. Its planner calculations, persistence, labels and route behaviour remain unchanged.

## Assurance

B2.5 is protected by:

- component rendering/semantic tests in `src/app/ui/ui-components.test.tsx`;
- enterprise token/component/icon/asset checks in `scripts/assurance/interface-system-governance.test.mjs`;
- existing Plan/Progress phone/tablet/desktop browser assurance; and
- the normal risk-classified Revision CI and path-to-live controls.

B7 shell-icon ownership additionally has a static fail-closed contract in `scripts/assurance/b7-shell-icon-ownership.test.mjs` that prevents the canonical shell from reintroducing its local SVG icon family and verifies the required shell jobs remain registered centrally.

## Extension rule

Before adding a new shared component or variant:

1. identify the recurring product job;
2. confirm existing components cannot express it cleanly;
3. map it to the governing surface/control/semantic rules;
4. implement it centrally using design tokens;
5. provide relevant accessibility/theme/responsive states;
6. add assurance; and
7. update this registry when the public component contract changes.

A one-page visual preference is not sufficient reason to expand the shared registry.
