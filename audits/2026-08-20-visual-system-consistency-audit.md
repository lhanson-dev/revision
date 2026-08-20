# Visual System Consistency Audit — 20 August 2026

**Status:** In progress  
**Scope:** learner-facing Revision application visual system and styling architecture  
**Canonical runtime reviewed:** `/revision/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` with nested learner screens from `src/app/App.tsx` and planner screens.  
**Authority baseline:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`, `10-product-governance/Information Architecture.md`.

## Audit objective

Determine whether Revision has enough visual-system definition and implementation discipline to achieve both:

1. recognisable, professional consistency across learner surfaces; and
2. deliberate creative flexibility for cards, panels, forms, subject treatments, REV surfaces and future experiences without creating styling drift.

This audit is evidence and recommendation only. It does not redefine active visual authority until any proposed changes are deliberately approved and promoted.

## Current authority assessment

The active Visual Brand System establishes a useful visual direction:

- focused energy;
- Deep Ink, Revision Indigo, Bright Lime, cool near-white and soft indigo/blue surfaces;
- expressive but readable typography;
- generous whitespace;
- rounded cards and restrained depth;
- REV as a distinctive indigo/AI surface;
- clear responsive navigation;
- WCAG 2.2 AA intent.

However, it currently operates mainly at **directional** level. It does not yet define enough system-level rules for consistent implementation of typography scale, spacing, radii, elevations, semantic colour roles, buttons, fields, form states, card families, feedback surfaces or component variants.

That gap makes local CSS choices too easy and means visual consistency currently depends on individual implementation judgement rather than an explicit reusable system.

## Initial implementation findings

### 1. Competing colour foundations exist

`src/app/app.css` still declares an older cream/navy/green palette (`--navy: #10243d`, `--green: #18a66a`, `--cream: #f7f4ee`) while `src/app/rev-home.css`, loaded later, redefines those aliases onto the approved ink/indigo/canvas palette.

This works through cascade order rather than through a single source of truth. It is fragile and obscures which tokens are actually authoritative.

**Assessment:** high-priority design-system debt.

### 2. Design tokens are incomplete and inconsistently named

The newer layer defines useful colour and shadow variables, but there is no complete token system covering:

- semantic text/background/action/status roles;
- spacing scale;
- radius scale;
- elevation scale;
- typography scale;
- control heights;
- responsive layout widths/gutters;
- motion durations/easing;
- focus-ring semantics.

Several files therefore fall back to local hard-coded values or legacy aliases.

**Assessment:** high-priority consistency gap.

### 3. Styling is fragmented across many global CSS files

`src/main.tsx` imports thirteen application CSS files in a fixed sequence. Additional CSS files also exist in `src/app/`.

The current visual result therefore depends materially on import order and overlapping global selectors. `app.css`, `rev-home.css`, `hierarchy.css`, `planner.css`, `planner-runtime.css`, `planner-today.css`, `planner-rev.css`, `exam.css`, `guidance.css`, `auth-entry.css` and other files all contribute to shared visual behaviour.

This is not automatically wrong, but there is no explicit layering contract defining which file owns foundations, primitives, components and screen-specific composition.

**Assessment:** medium/high maintainability and drift risk.

### 4. Radius, spacing and surface treatments are individually chosen

Current implementation uses many reasonable but unrelated radii and surface treatments — for example 11px, 12px, 13px, 14px, 15px, 17px, 18px, 20px, 22px, 24px, 26px, 28px, 30px and 32px treatments across controls, cards and hero surfaces.

Variation itself is desirable; accidental variation is not. There is currently no documented distinction between:

- control radius;
- compact card radius;
- standard card radius;
- feature card radius;
- hero/special surface radius;
- pill/circular treatment.

**Assessment:** medium-priority visual consistency gap.

### 5. Card creativity exists, but without a governed family model

The implementation already uses materially different card types — REV hero, subject cards, progress cards, planner panels, recommendation panels, course cards, exam cards, topic cards and operational/admin cards.

This proves that a single universal card component would be too restrictive. The missing piece is a **family system**: shared structural rules with deliberately permitted variants.

**Assessment:** preserve variety; govern the underlying grammar.

### 6. Forms do not yet have one shared visual language

Authentication, planner forms, learning inputs and exam-response fields use overlapping but different dimensions, radii, borders, focus states and local fallback colours.

The active UX authority requires responsive, accessible and understandable interactions, but the current visual authority does not define field anatomy and states precisely enough.

**Assessment:** high-priority component-system gap because forms are both frequent and accessibility-sensitive.

### 7. Hard-coded presentation colours remain common

Several learner-facing files use direct hex/RGBA values for borders, success/error feedback, soft surfaces, REV gradients and other presentation details.

Some direct values are appropriate for distinctive compositions such as the REV orb or intentionally art-directed hero gradients. Routine component colours should instead resolve through semantic tokens so they can be kept coherent and contrast-tested.

**Assessment:** distinguish expressive/art-directed colour from semantic/system colour.

### 8. Responsive rules have accumulated by feature

The recently corrected global navigation breakpoint exposed a wider pattern: multiple files contain independent responsive thresholds and local adaptations.

Different breakpoints are sometimes justified by content, but shared layout/navigation breakpoints should be named and deliberate rather than recreated independently.

**Assessment:** medium-priority system gap.

## Proposed consistency-with-creativity model

The design system should not attempt to make every screen or card look the same. It should define **what is fixed, what is bounded and what is free**.

### Layer 1 — Brand foundations: tightly controlled

These should be consistent across all learner-facing Revision surfaces:

- core brand colours and semantic colour roles;
- typography family and type scale;
- spacing rhythm;
- radius scale;
- elevation/shadow scale;
- focus treatment;
- core icon language;
- primary action language;
- responsive layout/gutter conventions;
- accessibility and contrast rules;
- REV identity rules.

### Layer 2 — UI primitives: controlled variants

Reusable primitives should have a small supported variant set rather than one fixed appearance:

- buttons;
- inputs, selects, textareas and check/radio controls;
- badges/chips;
- tabs/segmented controls;
- navigation controls;
- dividers;
- progress/status indicators;
- modal/drawer treatment.

Developers/designers may choose a supported variant but should not create a new visual language locally without deliberate need.

### Layer 3 — Surface families: flexible within rules

Cards, boxes and panels should support creativity through named families such as:

- **standard surface** — ordinary content grouping;
- **quiet surface** — low-emphasis support information;
- **interactive surface** — clickable subject/topic/route card;
- **feature surface** — a stronger editorial or promotional moment;
- **guidance surface** — recommendation/explanation/next-step treatment;
- **status/feedback surface** — success, warning, error, information;
- **REV surface** — recognisable AI-guide treatment;
- **exam/performance surface** — calm but more performance-oriented;
- **subject-accent surface** — restrained subject recognition.

Each family can vary layout, illustration, accent placement and composition while inheriting tokenised colour, typography, radius/elevation ranges and interaction states.

### Layer 4 — Page composition: deliberately creative

Home, Plan, REV, Subjects, Learn, Practice, Exam Prep and Progress should not be forced into the same card grid.

Page-level art direction may vary substantially where it supports the learner job, provided it uses the shared foundations and primitives and remains recognisably Revision.

This is where creative differentiation should live.

## Colour-system recommendation for confirmation

The approved palette should be expanded from raw brand colours into three levels.

### A. Brand palette

The recognisable source colours, including Deep Ink, Revision Indigo, Deep Indigo, Bright Lime and carefully approved supporting tints.

### B. Semantic tokens

Components should normally consume roles such as:

- text-primary / text-secondary / text-inverse;
- canvas / surface / surface-subtle / surface-brand;
- border-default / border-strong / border-focus;
- action-primary / action-primary-hover / action-secondary;
- accent-momentum;
- status-success / status-warning / status-danger / status-info;
- focus-ring.

This allows the brand palette to evolve without rewriting every component and prevents arbitrary local colour choices.

### C. Expressive palette

A deliberately bounded set of art-direction colours/tints for:

- REV effects;
- subject recognition;
- illustrations;
- feature cards;
- special editorial surfaces.

Expressive colours must not redefine core controls, educational evidence semantics or accessibility-critical status behaviour.

## What needs Founder/design confirmation before implementation

The next confirmation stage should be visual, not just a long list of CSS numbers.

A compact **Revision visual-system confirmation board** should show representative examples of:

1. core palette and semantic colour roles;
2. typography hierarchy;
3. spacing/radius/elevation families;
4. primary, secondary, tertiary and destructive actions;
5. form fields in default, focus, error, disabled and completed states;
6. card/surface families from quiet through feature/REV;
7. tabs, chips, progress and status treatments;
8. icon style;
9. mobile/desktop navigation;
10. representative page compositions for Home, Plan, a subject/course screen and a learning/exam screen.

The Founder should approve the **system grammar and representative range**, not every future card layout. Once the grammar is approved, future screens retain creative freedom within it.

## Proposed implementation sequence after confirmation

1. Confirm the design-system grammar and visual board.
2. Promote approved rules into the Visual Brand System (normative authority).
3. Create one canonical implementation token layer.
4. Remove legacy/competing root palette definitions and aliases where no longer required.
5. Introduce reusable primitive/component classes or React primitives where repetition warrants it.
6. Migrate forms and common controls first.
7. Migrate shared navigation and common surfaces.
8. Migrate learner screens by journey: Home → Plan → REV → Subjects/course → Learn/Practice → Exam Prep → Progress.
9. Retain intentional page-specific/art-directed styling at the composition layer.
10. Add responsive/accessibility and selective visual-regression assurance for the shared system.

## Initial conclusion

Revision does **not** need a rigid component library that makes every card and page identical.

It does need a stronger design system than it currently has.

The correct target is **consistent foundations + controlled primitives + flexible surface families + creative page composition**.

The current Visual Brand System provides the right broad direction, but implementation has already accumulated enough local CSS and legacy overrides that further feature-by-feature styling without this system would increase drift.

## Documentation-impact check

No normative authority is changed by this audit record.

If the proposed model is approved, `20-brand-and-experience/Visual Brand System.md` should be expanded in the same governed change that establishes the implementation token/component foundation. Technical documentation should also record the resulting CSS/design-system architecture. Historical audit evidence should remain unchanged.
