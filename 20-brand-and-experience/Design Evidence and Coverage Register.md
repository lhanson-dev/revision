---
title: "Design Evidence and Coverage Register"
document_id: "revision-design-evidence-and-coverage-register"
document_type: "governance-register"
authority: "brand-and-experience"
status: "proposed"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-29"
last_reviewed: "2026-09-29"
review_cadence: "quarterly"
content_review_status: "founder-approved-direction-pending-governed-merge"
source_of_truth_for: ["design source traceability", "design best-practice coverage", "design rule evidence strength", "design governance gap detection"]
depends_on: ["Product UX Principles", "Visual Brand System", "Interactive Component Quality Standard", "Interaction State and Recovery Standard", "Tone of Voice Framework"]
supersedes: null
---
# Design Evidence and Coverage Register

## Purpose

This register prevents Revision's design guidance becoming a collection of attractive opinions or incomplete remembered rules.

It answers four questions for every material design topic:

1. What external evidence or standard informs the rule?
2. How strong is that evidence?
3. Which Revision authority document owns the product-specific rule?
4. What assurance proves the rule is implemented in the product?

The aim is not to copy Apple, Material, GOV.UK or any other design system. Revision keeps its own audience, brand, interaction character and educational purpose. External guidance is used to challenge omissions, validate decisions and expose risk.

## Evidence hierarchy

When sources differ, use this order unless the product context justifies a documented exception.

### Level A — standards and mandatory accessibility requirements

Examples:

- WCAG 2.2 and associated WAI guidance;
- relevant HTML/native semantic requirements;
- platform or legal requirements that materially constrain the implementation.

Level A rules are treated as requirements where applicable.

### Level B — mature primary platform and public-service guidance

Examples:

- Apple Human Interface Guidelines;
- Material Design;
- GOV.UK Design System;
- Microsoft Fluent;
- IBM Carbon;
- Adobe Spectrum;
- Atlassian Design System;
- Shopify Polaris;
- Salesforce Lightning Design System.

These are strong implementation references, but platform-specific guidance must not be copied blindly into Revision.

### Level C — established usability research and expert evidence

Examples:

- Nielsen Norman Group;
- Baymard Institute;
- published usability research and tested service-pattern evidence.

These sources inform strong defaults and heuristics. They do not automatically override Revision-specific user evidence or Level A requirements.

### Level D — product-specific evidence

Examples:

- learner usability testing;
- support/contact evidence;
- analytics that expose confusion or failure;
- accessibility testing;
- observed defects and incident evidence;
- A/B or prototype testing where appropriate.

Product evidence should refine the rule without weakening accessibility, safety, truthfulness or learner protection.

### Level E — inspiration only

Examples include social-media design accounts, visual trend references, competitor screenshots and informal design commentary.

These sources are useful for discovering questions and anti-patterns, but a rule must not become normative solely because it appeared in an inspirational source.

## External reference set

The following sources form Revision's standing design reference set. Their inclusion does not mean every recommendation is automatically a Revision rule.

| Source | Primary use | Evidence class |
|---|---|---|
| W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/ | accessibility baseline | A |
| WAI ARIA Authoring Practices — https://www.w3.org/WAI/ARIA/apg/ | accessible interaction patterns | A/B |
| Apple Human Interface Guidelines — https://developer.apple.com/design/human-interface-guidelines/ | hierarchy, feedback, accessibility, platform interaction | B |
| Material Design 3 — https://m3.material.io/ | component/state comparison, responsive behaviour | B |
| GOV.UK Design System — https://design-system.service.gov.uk/ | forms, validation, dates, pagination, content clarity, tested service patterns | B/C |
| Microsoft Fluent 2 — https://fluent2.microsoft.design/ | component/state comparison and enterprise interaction | B |
| IBM Carbon — https://carbondesignsystem.com/ | data-heavy UI, tables, forms, accessibility | B |
| Adobe Spectrum — https://spectrum.adobe.com/ | component anatomy, accessibility and dense product UI | B |
| Atlassian Design System — https://atlassian.design/ | workflow UI, messaging, navigation, tables | B |
| Shopify Polaris — https://polaris.shopify.com/ | forms, resource lists, filters, product workflows | B |
| Salesforce Lightning Design System — https://www.lightningdesignsystem.com/ | data-heavy enterprise UI and component states | B |
| Nielsen Norman Group — https://www.nngroup.com/ | usability principles and research | C |
| Baymard Institute — https://baymard.com/ | form, ecommerce and interaction usability research | C |

## Rule classification

Every new material design rule should be classifiable as one of:

- **Requirement** — needed for accessibility, safety, truthfulness, legal/platform compliance or a Founder-approved product invariant.
- **Strong default** — research-supported behaviour Revision should normally follow, with exceptions documented.
- **Context-dependent heuristic** — useful guidance whose value depends on the task, audience or platform.
- **Revision-specific design decision** — a deliberate brand/product choice rather than a universal usability claim.

Do not present a heuristic as a requirement merely because several design systems use it.

## Coverage matrix

This matrix is the gap detector. A topic marked `Covered` has an owning Revision authority. `Partial` means some rules exist but the area still needs explicit treatment. `Gap` means the style guide is incomplete and must not be described as comprehensive for that area.

| Design domain | Revision authority | Current coverage |
|---|---|---|
| Product purpose, hierarchy and next action | Product UX Principles | Covered |
| Journey design and progressive disclosure | Product UX Principles | Covered |
| Brand identity, colour, typography, spacing, surfaces | Visual Brand System | Covered |
| Responsive layout and stable learner canvas | Product UX Principles + Visual Brand System | Covered |
| Buttons and recurring action controls | Interactive Component Quality Standard | Covered |
| Loading, processing and system status | Interaction State and Recovery Standard | Covered |
| Empty, no-result and unavailable states | Interaction State and Recovery Standard | Covered |
| Validation, service errors and retry/recovery | Interaction State and Recovery Standard | Covered |
| Offline, stale and partial-failure states | Interaction State and Recovery Standard | Covered |
| Feedback pattern choice: inline/toast/banner/dialog | Interaction State and Recovery Standard | Covered |
| Destructive and irreversible actions | Interaction State and Recovery Standard | Covered |
| Search, filters and sorting | Interaction State and Recovery Standard | Covered |
| Pagination and long lists | Interaction State and Recovery Standard | Covered |
| Tables and bulk actions | Interaction State and Recovery Standard | Covered |
| Date and time interaction | Interaction State and Recovery Standard | Covered |
| Forms, field labels, hints and local errors | Product UX Principles + Interaction State and Recovery Standard | Partial — strengthen into explicit form standard if audit shows repeated divergence |
| Authentication and account-recovery UX | Product UX Principles + Interaction State and Recovery Standard | Partial — product audit required |
| Navigation patterns, tabs, breadcrumbs and wayfinding | Product UX Principles + Visual Brand System | Partial — audit against implemented navigation patterns |
| Dialog, drawer, popover and focus behaviour | Interactive Component Quality Standard + Interaction State and Recovery Standard | Partial — implementation is strong but normative accessibility anatomy should be explicit |
| File uploads/downloads | Interaction State and Recovery Standard | Partial — add dedicated rules when product surface exists or audit finds current use |
| Settings/preferences | Product UX Principles + Interaction State and Recovery Standard | Partial — add explicit settings rules when product surface matures |
| Charts/data visualisation | Visual Brand System + Product UX Principles | Partial — needs explicit accessible data-visualisation standard before broad use |
| Motion and reduced motion | Visual Brand System + Interactive Component Quality Standard | Covered at principle level; component-specific motion remains contextual |
| Accessibility/WCAG 2.2 AA | Product UX Principles + component/domain standards | Covered baseline; continuous assurance required |
| Content/microcopy and tone | Tone of Voice Framework | Covered |
| Educational content treatment | Educational Treatment System | Covered |
| REV conversational guidance | REV Guidance and Conversation Pattern | Covered |
| Privacy, permissions, consent and trust UX | Product UX Principles plus product/security authorities | Partial — design rules must align with privacy/security authority |
| Localisation/internationalisation | None currently | Gap unless/until Revision supports additional locales; do not claim coverage |
| Complex drag-and-drop/spatial interaction | None currently | Gap/not currently material; govern before introduction |

## Best-practice admission test

Before adding an external recommendation to Revision's normative design guidance, answer:

1. **Problem:** what user problem does the recommendation solve?
2. **Evidence:** which Level A–D source supports it?
3. **Applicability:** does it apply to Revision's current audience, platform and task?
4. **Conflict:** does it conflict with an existing Revision authority or another stronger source?
5. **Brand fit:** can it be implemented without flattening Revision into another product's visual system?
6. **Accessibility:** does it preserve or improve accessibility?
7. **Assurance:** how will we test that the implementation actually follows the rule?

If those questions cannot be answered, keep the recommendation as research/reference rather than normative authority.

## Source-to-rule traceability

Material standards should include enough wording to show the product rule directly. This register holds the external source map so the standards themselves do not become unreadable bibliographies.

For substantial new standards or revisions, the PR should identify:

- the design domains affected;
- relevant Level A/B/C evidence reviewed;
- whether the result is a Requirement, Strong default, Heuristic or Revision-specific decision;
- any deliberate exception from a major source and why;
- implementation/assurance implications.

## Implementation traceability

A rule is not considered embedded merely because it exists in Markdown.

For material rules, assurance should be traceable through one or more of:

- shared component implementation;
- automated component tests;
- accessibility tests;
- bounded browser journey tests;
- responsive/mobile evidence;
- screenshot/visual review where appearance matters;
- product analytics or usability research where behaviour needs validation.

Repeated page-local fixes are a signal that the rule belongs in a shared component or shared interaction contract.

## Review cadence

At least quarterly, and whenever a major underlying source changes, review:

1. WCAG/WAI changes and interpretations relevant to Revision;
2. major Apple/Material platform guidance changes;
3. relevant GOV.UK, Carbon, Spectrum, Atlassian, Polaris, Fluent and Lightning pattern updates;
4. new Nielsen Norman Group/Baymard evidence relevant to live Revision interactions;
5. new product capabilities that create previously irrelevant design domains;
6. audit findings showing a repeated product inconsistency;
7. learner/accessibility evidence that challenges an existing heuristic.

The review is not complete if it only confirms that documents exist. It must update the coverage matrix and record any new `Gap` or `Partial` areas.

## Rule for AI-assisted design and implementation

When AI is asked to review, design or change a Revision interface, the instruction should be:

> Review the interface against Revision's governed Brand and Experience authorities and the Design Evidence and Coverage Register. Separate accessibility/safety/truthfulness defects from strong best-practice improvements and subjective aesthetic preferences. Do not redesign for novelty or copy another design system's appearance. Where the guide is silent, identify the gap instead of inventing a new local standard.

This prevents AI-generated redesign churn and makes an uncovered design domain visible before code quietly creates a new convention.
