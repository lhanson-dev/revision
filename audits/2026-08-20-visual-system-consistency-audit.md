# Visual System Consistency Audit — 20 August 2026

**Status:** In progress  
**Scope:** Revision cross-channel brand system, with current implementation evidence concentrated in the learner application because that is the implemented public product surface today.  
**Canonical learner runtime reviewed:** `/revision/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` with nested learner screens from `src/app/App.tsx` and planner screens.  
**Authority baseline:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`, `20-brand-and-experience/Tone of Voice Framework.md`, `10-product-governance/Information Architecture.md`, and relevant marketing authority.

## Audit objective

Determine whether Revision has enough brand-system definition and implementation discipline to achieve both:

1. recognisable, professional consistency across the learner app, future marketing site, Admin, social media, video/motion and reusable brand assets; and
2. deliberate creative flexibility for cards, panels, forms, illustrations, campaigns, social/video treatments and future experiences without creating visual drift.

This audit remains evidence/recommendation. The Founder has now explicitly directed that the Brand System should become the cross-channel brand-guidelines system rather than remain learner-app-only. That instruction conflicts with the previous narrow purpose statement in the active Visual Brand System, so this branch deliberately proposes the corresponding authority change rather than silently treating the old and new scopes as equivalent.

## Founder scope decision captured during audit

The intended target is now:

- one Revision brand system across learner product, marketing, Admin, social and media assets;
- consistency through shared foundations rather than identical layouts;
- enough bounded flexibility for strong creative work in cards, boxes, forms, campaigns and media;
- one visual reference/approval surface where approved patterns and assets can be seen; and
- guidance that tells contributors which treatment is recommended for which job.

The proposed authority update in this PR therefore expands `20-brand-and-experience/Visual Brand System.md` into the canonical **Revision Brand System** while preserving the existing file path for continuity.

## Current authority assessment

The existing visual authority established the right broad direction:

- focused energy;
- Deep Ink, Revision Indigo, Bright Lime, cool near-white and soft indigo/blue surfaces;
- expressive but readable typography;
- generous whitespace;
- rounded cards and restrained depth;
- REV as a distinctive indigo/AI surface;
- clear responsive navigation; and
- WCAG 2.2 AA intent.

The main weakness is that it was scoped primarily to the learner application and remained directional rather than defining enough reusable system grammar for implementation across multiple channels.

## Current implementation findings

### 1. Competing colour foundations exist

`src/app/app.css` still declares an older cream/navy/green palette while `src/app/rev-home.css`, loaded later, redefines legacy aliases onto the newer ink/indigo/canvas palette.

The current look therefore depends partly on cascade/import order rather than one canonical token layer.

**Assessment:** high-priority design-system debt.

### 2. Design tokens are incomplete and inconsistently named

The newer layer defines useful colour and shadow variables, but there is no complete token model for semantic colours, spacing, radii, elevations, type scale, control heights, layout widths/gutters, motion or focus roles.

**Assessment:** high-priority consistency gap.

### 3. Styling is fragmented across global CSS layers

`src/main.tsx` imports thirteen application CSS files in a fixed sequence. Multiple files contribute to shared visual behaviour without an explicit layering contract for foundations, primitives, components and screen-specific composition.

**Assessment:** medium/high maintainability and drift risk.

### 4. Radius, spacing and surface treatments are individually chosen

The learner implementation contains many reasonable but unrelated radius and surface values. Variation itself is desirable; accidental variation is not.

The system needs named families such as control, compact surface, standard surface, feature surface and pill/circular treatments rather than arbitrary local values.

**Assessment:** medium-priority consistency gap.

### 5. Card creativity exists, but without a governed family model

REV hero, subject cards, progress cards, planner panels, recommendations, course cards, exam cards and topic cards are intentionally different.

This demonstrates why one universal card component would be too restrictive. The missing piece is a family model: shared foundations plus deliberately different surface types.

**Assessment:** preserve variety; govern the grammar.

### 6. Forms do not yet have one shared visual language

Authentication, planner forms, learning inputs and exam-response fields use overlapping but different dimensions, borders, radii and focus states.

**Assessment:** high-priority component-system gap because forms are frequent and accessibility-sensitive.

### 7. Hard-coded presentation colours remain common

Some direct colour values are justified for art-directed REV effects or illustrations. Routine controls/statuses should instead resolve through semantic roles.

**Assessment:** explicitly separate expressive colour from semantic/system colour.

### 8. Responsive rules have accumulated by feature

Different breakpoints are sometimes justified by content, but shared layout/navigation breakpoints should be named and deliberate rather than independently recreated.

**Assessment:** medium-priority system gap.

## Cross-channel consistency-with-creativity model

### Layer 1 — Brand foundations: tightly controlled

Shared across all Revision channels:

- primary identity and lock-ups;
- core brand colours and semantic colour roles;
- typography family and hierarchy;
- spacing rhythm;
- radius/elevation families;
- focus/accessibility treatment;
- icon/illustration language;
- motion principles; and
- REV identity rules.

### Layer 2 — UI primitives: controlled variants

Reusable primitives should offer a small supported range rather than a single rigid appearance:

- buttons;
- inputs/selects/textareas;
- check/radio/toggle controls;
- badges/chips;
- tabs/segmented controls;
- navigation;
- progress/status indicators;
- modals/drawers; and
- feedback/error states.

### Layer 3 — Surface families: flexible within rules

Cards, boxes and panels should support creativity through named families such as:

- standard;
- quiet;
- interactive;
- feature/editorial;
- guidance;
- status/feedback;
- REV;
- exam/performance; and
- subject-accent.

Within an approved family, layout, illustration, accent placement and composition may vary substantially.

### Layer 4 — Composition/art direction: deliberately creative

Home, Plan, REV, Subjects, Learn, Practice, Exam Prep and Progress should not be forced into the same card grid.

Likewise, marketing pages, social posts and video frames should not be expected to look like application screens. They should express the same Revision identity through channel-appropriate composition.

## Expression profiles

### Learner product
Balanced expression: energetic, calm, intelligent and highly usable.

### Marketing/editorial
Higher expressive freedom: editorial composition, illustration, larger type and motion can be bolder while staying on-brand.

### Admin/operations
Lower expressive freedom: functional and denser where needed, but still using shared primitives, typography and semantic colours.

### Social/campaign
High expressive freedom within approved identity rules and reusable templates.

### Video/motion
High motion/art-direction freedom relative to the product, while preserving brand recognition, captions/accessibility and recognisable REV treatment.

## Colour-system recommendation

The confirmed system should use three levels:

### A. Brand palette
Recognisable source colours and approved supporting tints/shades.

### B. Semantic tokens
Roles such as text, surface, border, action, focus, success, warning, danger and information.

### C. Expressive palette
Bounded additional colours/tints for REV, illustrations, subject recognition, social/video art direction and feature surfaces.

Expressive colour must not redefine controls, accessibility-critical statuses or educational evidence semantics.

## Brand reference and approval surface

The Founder should not have to approve a list of CSS values blind. Revision should maintain a rendered **Brand Studio** (working name) where the full system can be inspected visually.

It should show:

1. logo/wordmark and lock-up examples;
2. core/semantic/expressive colours;
3. typography hierarchy;
4. spacing/radius/elevation families;
5. buttons and interaction states;
6. complete form states;
7. card/surface families from quiet through feature/REV;
8. tabs, chips, progress and statuses;
9. icon/illustration treatment;
10. mobile/desktop navigation;
11. learner-app page examples;
12. marketing-site examples;
13. Admin examples;
14. social post/story/thumbnail examples;
15. video title/lower-third/caption/end-card examples; and
16. approved reusable assets/templates.

Every pattern/asset should carry a status and usage recommendation:

- **Recommended** — default for the stated job;
- **Alternative** — approved for the stated context;
- **Experimental** — not yet standard;
- **Deprecated** — do not use for new work; and
- **Do not use** — explicitly rejected/non-compliant.

Where useful, it should show **use when**, **avoid when**, applicable channels, accessibility notes and canonical implementation/asset references.

## Technical recommendation for the Brand Studio

Do **not** add a heavyweight design-system platform merely to create the gallery.

The current React/TypeScript/Vite stack can support a protected native Brand Studio. The preferred first implementation is a Founder/Admin reference surface inside the existing application runtime because:

- it avoids a second frontend/toolchain;
- it can render the actual production tokens/components rather than screenshots;
- it can show responsive states and motion;
- it can link directly to canonical assets and code references; and
- it can later expose selected public brand guidance if needed without making internal experiments public.

This is an implementation recommendation, not yet implementation authority. Before coding, the canonical route/runtime and appropriate Admin access model must be recorded under the governed implementation workflow.

## What still needs visual Founder confirmation

The scope/model can be governed now, but the following should **not** be treated as approved merely from prose:

- final logo/wordmark lock-up rules;
- exact complete colour/tint system and expressive colours;
- typography scale/weights;
- spacing/radius/elevation scales;
- component variants;
- form anatomy/states;
- icon and illustration language;
- final surface families/examples;
- social templates; and
- video/motion templates.

These should be presented visually through the confirmation board/Brand Studio and approved as a coherent range.

## Proposed delivery sequence

1. Complete the cross-channel audit and inventory current styling/assets.
2. Produce a visual confirmation set covering the system foundations and representative channel examples.
3. Founder confirms/refines the grammar and range.
4. Promote confirmed rules into the Brand System.
5. Establish one canonical token/primitives implementation layer.
6. Build the protected Brand Studio/reference surface.
7. Migrate learner product styling from legacy/local CSS to the confirmed system.
8. Add marketing/Admin/social/video examples and reusable assets as those channels are built.
9. Add responsive/accessibility and targeted visual-regression assurance for shared system behaviour.

## Current conclusion

Revision does **not** need identical cards, pages or media assets.

It needs one recognisable brand grammar with a clear boundary between foundations and creative expression.

The target is:

**one brand → shared foundations → controlled primitives → flexible surface families → channel-specific creative composition.**

## Documentation-impact check

This branch now contains a proposed normative scope change because the Founder has explicitly expanded the intended Brand System beyond the learner application.

The proposed `20-brand-and-experience/Visual Brand System.md` update captures that cross-channel authority and the requirement for a visual reference/approval surface. `INDEX.md` and marketing-folder ownership guidance are updated to prevent visual-brand and marketing-channel authority from competing.

No production styling or Brand Studio implementation is changed in this audit stage. Technical documentation will need updating when the canonical token architecture and Brand Studio are implemented. Historical merged audit/decision evidence must remain unchanged.
