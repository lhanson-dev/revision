---
title: "Learner Content Canvas Standard"
document_id: "revision-learner-content-canvas-standard"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder / Product / Experience"
effective_date: "2026-09-26"
last_reviewed: "2026-09-26"
content_review_status: "founder-approved-direction"
source_of_truth_for: ["learner content canvas width", "learner page horizontal alignment", "cross-section layout consistency"]
depends_on: ["Product UX Principles", "Visual Brand System"]
supersedes: ["Learn MVP Experience v1.8 narrow 760px top-level teaching-article canvas requirement"]
---
# Learner Content Canvas Standard

## Purpose

Define the horizontal content-canvas rule for Revision's learner application so moving between learner destinations and course sections does not cause the main body content to jump, narrow or widen unexpectedly.

## Governing rule

Revision uses one coherent learner content canvas.

Across the learner application, the main page body must use the same governed horizontal boundaries for the same viewport and shell state. This applies to Home, Plan, Progress, Courses and selected-course sections including Overview, Learn, Practice, Exam Prep and Progress.

The main learner canvas may respond to viewport size and the governed learner shell, but a learner moving between destinations at the same viewport must not see the body canvas shift because an individual feature chose its own top-level maximum width or horizontal offset.

## Consistency without sameness

Canvas consistency does not require page-content sameness.

Within the shared body boundaries, each experience may use the composition best suited to its job. For example:

- Learn may use textbook-like explanatory hierarchy, diagrams, examples, worked examples, callouts and other educational treatments;
- Practice may prioritise activities, responses and feedback;
- Exam Prep may use performance-oriented tasks and simulations;
- Progress may use evidence summaries, interpretation and data displays; and
- Overview/Home may use recommendations, priorities and supporting information.

These differences should make the product more useful and engaging. They must not be expressed by silently changing the outer content canvas.

## Readability rule

Readable line length remains an important design concern, but it must be solved inside the shared canvas rather than by narrowing the entire page body.

A paragraph, text block, explanatory column or other local element may use a deliberately shorter line measure where that improves readability. Wider treatments, diagrams, comparison layouts, tables, recaps, navigation and other content may use the rest of the shared canvas where useful.

A local readable measure must therefore be a content-level composition decision, not a new top-level page or section canvas.

## Course-section rule

Inside a selected course, Overview, Learn, Practice, Exam Prep and Progress must share the same body-content start/end alignment beneath the common course chrome.

Section-specific surfaces may use different internal layouts and treatments, but the main section content must not shift horizontally when the learner changes section.

For Learn specifically, the previous approximately `760px` top-level teaching-article width is not governing authority. It was an implementation/design assumption that was incorrectly promoted as Founder-approved. Learn should use the same course-section body canvas as its sibling sections and manage reading comfort through internal composition.

## Responsive rule

The invariant applies on phone, tablet and desktop.

Responsive layouts may stack, reflow and reduce density. Horizontal page padding may change at governed breakpoints. Those breakpoint changes must be shared rather than feature-local so the learner canvas remains stable while navigating at a given viewport.

## Assurance requirement

Material learner-interface changes must protect this invariant with browser assurance on supported phone, tablet and desktop viewports.

Assurance should compare representative destinations and selected-course sections at the same viewport and verify that:

- the main learner page canvas retains the same horizontal boundaries;
- selected-course section content retains the same horizontal alignment;
- Learn does not introduce a narrower top-level body canvas; and
- feature-specific internal composition remains free to differ inside the shared boundaries.

## Documentation impact

This standard corrects the narrow Learn-canvas wording introduced in `Learn MVP Experience` v1.8 and the corresponding technical implementation record. The correction does not change Learn's reading-first educational model, content completeness, teaching-page anatomy or educational-treatment rules.

Future consolidation should remove superseded narrow-canvas wording from the Learn authority rather than reintroduce it as a competing rule.
