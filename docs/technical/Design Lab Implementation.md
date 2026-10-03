# Design Lab Implementation

**Status:** Implemented on governed branch; pending PR assurance and Founder merge approval  
**Date:** 29 September 2026  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Interactive Component Quality Standard.md`, `20-brand-and-experience/Product UX Principles.md`, `10-product-governance/Global Learner Navigation.md`  
**Implementation references:** `docs/technical/Interface System Component Registry.md`, `docs/technical/Interactive Component Quality Implementation.md`  
**Canonical review surface:** `/revision/design-lab.html`

## Purpose

The Revision Design Lab is a protected visual review surface for two different but related jobs:

1. inspecting the **actual current learner application** as implemented on the governed branch; and
2. inspecting and interacting with the real foundations, shared components and approved recurring page patterns used to compose Revision screens.

The actual-app reference exists specifically so Founder design approval is not based on a hand-reconstructed mock, stale screenshot gallery or parallel design system. It loads the same `/app/` learner runtime that Revision currently ships and presents its current light and dark rendering in a review frame.

The component canvas remains useful for inspecting foundations and primitives in isolation. It is not a substitute for page-level review.

The Design Lab is **not** design authority. Normative visual, interaction and navigation rules remain in the numbered brand/product authority documents. Where the Design Lab, actual implementation and authority disagree, authority wins and the implementation/review surface must be corrected.

## Access boundary

The Design Lab is built as a separate Vite entry point at:

`/revision/design-lab.html`

It is deliberately absent from Home / Plan / Progress / Courses learner navigation and is marked `noindex, nofollow`.

Access requires:

1. a valid Revision authenticated session; and
2. `public.profiles.is_admin = true` for that authenticated account.

The browser-side Admin check mirrors the existing Admin presentation boundary. It prevents ordinary learner accounts from opening the Design Lab. It is not a new privileged server capability and does not grant access to learner data or Admin APIs beyond the permissions already held by the signed-in account.

The current production administrator is the Founder account, so the present effect is Founder-only access. If additional Admin accounts are created later, they would also be able to open this surface. A future requirement for a distinct Founder-only role would require an explicit authorization-model change rather than pretending `is_admin` means Founder.

## Actual application reference

The first section of the Design Lab is the **Current Revision app** reference. It does not recreate learner pages in Design Lab code.

It embeds the current learner application entry point and lets the reviewer select:

- Home;
- Plan;
- Progress;
- Courses;
- AQA A-level Business 7132 Course overview;
- Learn;
- Practice;
- Exam Prep; and
- course Progress.

The AQA Business course id is resolved by the same catalogue contract as production: `aqa:aqa-a-level:7132` (`examBoard.id:qualification.id:specificationCode`).

Each selected route is rendered in both light and dark modes. The reviewer can also inspect desktop, tablet and mobile viewport widths. The embedded runtime is deliberately non-interactive; a separate **Open live page** action opens the selected real route for full interaction.

This approach is preferred to committed screenshot baselines for Founder visual review because screenshots would immediately become a second, potentially stale representation of the product. Browser visual-regression baselines may still be introduced separately where deterministic pixel assurance is justified.

## Preview-mode safety boundary

The actual-app frames use the same authenticated account and therefore query the same learner programme, planning, progress and evidence sources needed by the real runtime. This is deliberate: the purpose is to review what the signed-in product actually renders, including its contextual navigation and learner state.

The embedded preview route adds the non-authoritative query parameter:

`?designPreview=1`

The query parameter does **not** change learner page composition, routing, navigation or visual rules. It only establishes a review safety boundary:

- the Design Lab places an interaction shield over each embedded frame, preventing pointer interaction;
- frames are removed from the keyboard tab order; and
- `PlannerActivityReconciler` does not run when `designPreview=1`, preventing its normal background completion reconciliation from writing planner activity while a review frame is merely being viewed.

The normal `/app/` runtime without `designPreview=1` is unchanged.

The preview is therefore allowed to perform the real read operations needed to render the current app, while the known route-load background reconciliation writer is suppressed and user-triggered actions are blocked inside the embedded frame.

## Component canvas organisation

Below the actual-app reference, the Design Lab retains its interactive component canvas. It includes:

- visual foundations: colours, type roles, spacing, radius and depth;
- canonical Revision identity and REV state treatments;
- PR #425 button hierarchy, sizing and interaction states;
- text, select, date and text-area fields;
- selection-control examples;
- segmented view selection;
- shared Surface variants and approved specialised surface families;
- semantic Status treatments and compact tags;
- menu/navigation anatomy, locked course hierarchy and page/course-header patterns;
- all shared Learn educational treatment families;
- progress, countdown, comparison and tabular evidence patterns;
- EmptyState and LoadingState;
- ModalShell, DrawerShell and PopoverShell interactions; and
- the controlled product icon registry plus approved restrained graphic language.

The canvas does not contain duplicate prototype implementations of Home, Plan, Progress, Courses, Learn, Practice or Exam Prep. Page-level review is provided by the actual learner runtime above it.

## Implementation-status labels

Each component specimen is classified so the Founder can distinguish current reusable implementation from governed patterns that still need consolidation.

### Shared component

The specimen is rendered with the current public `src/app/ui/` Interface System component, for example:

- `Button` / `IconButton`;
- `TextField`, `TextAreaField`, `SelectField`;
- `SegmentedControl`;
- `Surface`;
- `Status`;
- `PageHeader`;
- `Menu` / `MenuItem`;
- `EmptyState` / `LoadingState`;
- `ModalShell`, `DrawerShell`, `PopoverShell`;
- `Icon` / `BrandAsset`; and
- `EducationalTreatment`.

### Approved page-owned pattern

The pattern is authorised by current visual/product authority and exists as a legitimate page/composition family, but its precise composition remains feature-owned rather than one general-purpose shared component. Examples include guidance/recommendation surfaces, REV composition, exam/performance summaries, subject-accent composition, course header anatomy and bounded progress/data views.

### Approved pattern · shared primitive missing

The authority already permits or specifies the pattern, but the Interface System does not yet expose a first-class reusable primitive. The Design Lab calls these gaps out rather than falsely presenting them as completed shared components.

Current examples include:

- checkbox/radio wrappers;
- toggle/switch;
- general chip/multi-select treatment; and
- general reusable tag/badge treatment.

These labels are implementation visibility, not a new approval state. They do not authorise new visual rules.

## PR #425 integration

The component canvas uses the button and interaction implementation now on `main` following PR #425.

The live button specimens therefore demonstrate the current governed contract rather than the pre-#425 version:

- 48px standard learner action;
- 52px large learner CTA;
- 36px compact secondary/Admin action where justified;
- 44×44px minimum icon-only action;
- approximately 20px standard and 24px large horizontal padding;
- Primary / Strong / Secondary / Tertiary / Destructive hierarchy;
- visible hover and keyboard focus;
- restrained pressed movement;
- disabled state; and
- first-class processing state with spinner, meaningful pending label, `aria-busy` and duplicate-submit protection.

The processing demonstration is intentionally interactive so the Founder can inspect the actual response rather than a static picture of a loading button.

## Light and dark themes

The Design Lab uses the same semantic tokens as the learner runtime. It does not define an independent dark palette.

For the component canvas, the existing theme control changes its `data-theme` boundary and persists the normal `revision:theme` preference.

For actual-app review, two instances of the real runtime are presented for the selected page. On load, the review surface applies the appropriate light or dark `data-theme` to each same-origin frame so both variants remain visible at once without inventing alternative component styling.

Canonical assets continue to use `BrandAsset`, which centrally selects the correct light/dark export. Components continue to consume semantic roles from `brand-tokens.css`.

## Responsive behaviour

The component canvas itself adapts for desktop, tablet and smaller browser widths so components remain inspectable without inventing a second mobile component set.

The actual-app reference additionally provides explicit review widths:

- Desktop: 1440px minimum embedded runtime width;
- Tablet: 1024px;
- Mobile: 390px.

These frames use the real application responsive CSS. They are not separate mobile/tablet mockups.

## Assurance

The Design Lab requires normal repository validation plus targeted browser assurance.

The dedicated Playwright coverage proves that:

- an authenticated Admin can load the Design Lab;
- a non-Admin cannot load either review surface;
- the **Current Revision app** reference is present before component review;
- two actual-runtime frames are produced for light and dark review;
- embedded frames use `?designPreview=1` rather than the normal interactive route;
- selecting Course overview resolves the exact encoded AQA Business 7132 route;
- viewport selection changes the embedded review width mode;
- the major component-canvas sections render;
- component-canvas light/dark theme switching changes the active canvas theme;
- the shared PR #425 processing button exposes a real busy state and pending label; and
- a shared modal can open and close through the interactive canvas.

The normal build also proves the additional Vite entry point and actual-app review component compile with the current application source and shared Interface System.

## Deliberate non-goals

This implementation does not:

- change the learner navigation or expose Design Lab to ordinary students;
- create copies of each Revision product page;
- make the Design Lab a normative design source;
- introduce a second visual theme or component library;
- create a new Founder authorization role;
- replace the real learner runtime with fixed demonstration data;
- change normal learner evidence, planning or Content Factory behaviour; or
- implement the still-deferred `revision-nonprod` Prototype/Staging hosting architecture.

## Documentation impact

No normative design or navigation authority change is required because this work changes **how approved/current implementation is reviewed**, not what the learner product should do.

This technical record is updated because the Design Lab implementation boundary has materially changed from component-only review to a two-part surface: actual-app reference plus component canvas. The authoritative Visual Brand System, Interactive Component Quality Standard and Global Learner Navigation remain unchanged. Historical design evidence is unchanged.
