# Brand and Experience

This folder contains normative authority for Revision's learner experience, language and visual brand system.

## Active sources

- `Product UX Principles.md` — learner experience, hierarchy, journey and accessibility principles.
- `Tone of Voice Framework.md` — learner-facing language and interaction tone.
- `Visual Brand System.md` — company-wide visual identity and cross-channel Brand System covering learner product, marketing/editorial, Admin, social, video/motion, email, REV visual/motion treatment and reusable brand assets.
- `Interactive Component Quality Standard.md` — governed quality rules for buttons and recurring action controls.

## Proposed governed additions

- `Interaction State and Recovery Standard.md` — loading, empty, error, retry/recovery, feedback patterns, destructive actions, search/filter/sort, pagination, tables and date/time interactions.
- `Design Evidence and Coverage Register.md` — the traceability and gap-detection register for external design evidence, rule strength, domain ownership and implementation assurance.

## Design evidence rule

The design authorities in this folder are Revision-specific rules. They must not become a copy of another product or design system.

The `Design Evidence and Coverage Register.md` is the companion governance mechanism that checks those rules against a standing reference set including WCAG/WAI, Apple HIG, Material, GOV.UK and other mature design systems and usability research.

When a material design rule is introduced or changed, the governed review should identify:

- the user problem being solved;
- the strongest relevant evidence or standard;
- whether the rule is a Requirement, Strong default, Context-dependent heuristic or Revision-specific decision;
- the owning Revision authority document;
- any deliberate exception from major external guidance; and
- how implementation will be assured.

If the coverage register marks a domain `Gap`, Revision must not claim the style guide is comprehensive for that domain. If it marks a domain `Partial`, the gap must be resolved when that area becomes material or when the product audit finds repeated inconsistency.

## Candidate / supporting authority

- `Emotional Experience Principles.md` — desired emotional state and motivational principles; currently a draft authority candidate.

## Knowledge rule

The numbered authority folder contains normative truth about what Revision should do. Visual explorations and boards in `research/brand-studio/` are evidence/reference only until deliberately promoted into a governed authority through the approval path.

External design systems, social-media design accounts, competitor screenshots and research references are evidence/reference, not Revision authority by themselves. A recommendation becomes normative only when deliberately adopted into the relevant Revision authority.

Implementation evidence lives in code and `docs/technical/`; it does not override this authority. Equally, a Markdown rule is not considered embedded merely because it exists: material rules should be traceable to shared implementation and/or appropriate automated, accessibility, browser, responsive or usability assurance.