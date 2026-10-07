# Design Lab Implementation

**Status:** Live via PR #426; Phase D reconciliation/expansion pending against the 7 October learner design authority  
**Date:** 29 September 2026  
**Authority:** `20-brand-and-experience/Learner Design System.md` plus the applicable specialist numbered authorities  
**Implementation references:** `docs/technical/Interface System Component Registry.md`, `docs/technical/Interactive Component Quality Implementation.md`  
**Canonical review surface:** `/revision/design-lab.html`

## Purpose

The Revision Design Lab is a protected, interactive visual reference for the production interface system. PR #426 merged it to `main` at `4b4936da0f865db38dcb2bf1b3e42b37146fad2f`. Phase D of the 7 October reconciliation will bring its specimens/reference coverage into line with the current learner design authority.

The Design Lab is **not** design authority. `Learner Design System.md` is the learner-design entry point and specialist numbered authorities own their domains. Where the Design Lab and authority disagree, the Design Lab is implementation debt and must be corrected.

The Design Lab is also not a second learner application, a replacement for page-level design approval, or an independent design system. It consumes the same production Interface System components and semantic tokens wherever a shared implementation exists.

Phase C1 begins that reconciliation at the shared-foundation owner: the Design Lab now consumes the canonical 28px learner feature radius and shows only the four learner REV states. The wider specimen/composition/reference-set upgrade remains Phase D.

## Access boundary

The Design Lab is built as a separate Vite entry point at:

`/revision/design-lab.html`

It is deliberately absent from Home / Plan / Progress / Courses learner navigation and is marked `noindex, nofollow`.

Access requires:

1. a valid Revision authenticated session; and
2. `public.profiles.is_admin = true` for that authenticated account.

The browser-side Admin check mirrors the existing Admin presentation boundary. It prevents ordinary learner accounts from opening the Design Lab. It is not a new privileged server capability and does not grant access to learner data or Admin APIs.

The current production administrator is the Founder account, so the present effect is Founder-only access. If additional Admin accounts are created later, they would also be able to open this surface. A future requirement for a distinct Founder-only role would require an explicit authorization-model change rather than pretending `is_admin` means Founder.

## Data boundary

The Design Lab does not query learner programme, progress, evidence or planning data. Its specimens use fixed demonstration content and local component state only.

Interactive demonstrations such as button processing, theme switching, selection controls, modals and drawers are self-contained. They do not write learner evidence, course membership or planning state.

Theme selection uses the existing `revision:theme` preference because the purpose of the lab is to inspect the same light/dark interface translation used by Revision.

## Canvas organisation

The first Design Lab version is a component canvas rather than a gallery of copied product pages. It includes:

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

It deliberately does **not** recreate Home, Plan, Progress, Courses, Learn, Practice or Exam Prep as duplicate prototype pages in this increment.

## Implementation-status labels

Each specimen is classified so the Founder can distinguish current reusable implementation from governed patterns that still need consolidation.

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

The authority already permits or specifies the pattern, but the Interface System does not yet expose a first-class reusable primitive. The initial Design Lab calls these gaps out rather than falsely presenting them as completed shared components.

The first identified examples are:

- checkbox/radio wrappers;
- toggle/switch;
- general chip/multi-select treatment; and
- general reusable tag/badge treatment.

These labels are implementation visibility, not a new approval state. They do not authorise new visual rules.

## PR #425 integration

The canvas uses the button and interaction implementation now on `main` following PR #425.

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

The Design Lab uses the same `data-theme` boundary and semantic tokens as the learner runtime. It does not define an independent dark palette.

Canonical assets use `BrandAsset`, which centrally selects the correct light/dark export. Components continue to consume semantic roles from `brand-tokens.css`.

## Responsive behaviour

The canvas itself adapts for desktop, tablet and smaller browser widths so components remain inspectable without inventing a second mobile component set.

This first increment does not add viewport emulation frames. Responsive page-composition prototyping can be introduced later when individual page work begins.

## Assurance

The Design Lab requires normal repository validation plus targeted browser assurance.

The dedicated Playwright coverage proves that:

- an authenticated Admin can load the Design Lab;
- a non-Admin cannot load the canvas;
- the major canvas sections render;
- light/dark theme switching changes the active runtime theme;
- the shared PR #425 processing button exposes a real busy state and pending label; and
- a shared modal can open and close through the interactive canvas.

The normal build also proves the additional Vite entry point compiles with the current application source and shared Interface System.

## Deliberate non-goals

This increment does not:

- change the learner navigation or expose Design Lab to ordinary students;
- create copies of each Revision product page;
- make the Design Lab a normative design source;
- introduce a second visual theme or component library;
- create a new Founder authorization role;
- use real learner data in specimens;
- change learner evidence, planning or Content Factory behaviour; or
- implement the still-deferred `revision-nonprod` Prototype/Staging hosting architecture.

## Documentation impact

The original increment did not create normative design authority. Following the 7 October reconciliation, `Learner Design System.md` is the canonical learner-design source and the Design Lab must be updated in Phase D where its current specimens differ.

This document records the new implementation surface, its access/data boundary and the rule that it is a visual projection of authority rather than a competing source of truth. Historical design evidence is unchanged.
