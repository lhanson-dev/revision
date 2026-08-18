# Course and Assessment Component Classification Check

## Trigger

Run this check before building or materially restructuring any Revision course that has more than one paper, component, theme, text, unit or assessment area.

## Purpose

Prevent the content-pack storage structure from being mistaken for the learner-facing academic structure.

The check determines whether Learn, Practice and Progress belong at course/specification level or within individual assessment components, and records where paper/component-specific work belongs in Exam Prep.

## Governing authority

Apply `10-product-governance/Course Content and Assessment Component Placement.md`.

Use current official awarding-body sources as educational authority.

## Required classification

Before full content generation, answer the following from the current official specification and assessment guidance:

1. What is the exact course/specification identity?
2. What are the compulsory and optional papers/components?
3. Which official syllabus requirements can be assessed on each paper/component?
4. Is the same syllabus assessable across several papers/components?
5. Does any paper/component own genuinely distinct knowledge, skills, themes, texts or specification areas?
6. Which differences are assessment-format differences only, such as question structure, source handling, timing or weighting?

Then classify the course as one of:

### A — Shared course learning

Use when the same syllabus content can be assessed across multiple papers/components.

Learner placement:

- shared Overview / Learn / general Practice / Progress at course level;
- paper/component-specific formats, targeted written questions and simulations inside Exam Prep.

### B — Component-specific learning

Use when official authority assigns genuinely different syllabus content to components.

Learner placement:

- relevant Learn / Practice / Progress may exist within those components;
- Exam Prep still contains assessment-format and timed-practice material.

### C — Hybrid

Use when part of the syllabus is shared but some content is component-specific.

Do not duplicate the shared layer. Record explicitly which content belongs to course level and which belongs to each component before implementation.

## Required source record

The source/coverage record for the course must state:

- classification A, B or C;
- the official evidence supporting that classification;
- the shared syllabus scope, if any;
- the component-specific syllabus scope, if any;
- the assessment-format differences that belong in Exam Prep; and
- any ambiguity requiring Founder/subject-review resolution.

## Implementation check

Before publication, verify that:

- the learner catalogue reflects the recorded classification;
- shared topics are not multiplied by the number of papers/components;
- REV does not treat duplicate paper-pack copies as separate learning gaps;
- global and contextual Progress count shared learning once;
- paper/component exam evidence retains appropriate identity; and
- no unpublished component is implied merely because the official qualification contains it.

If the current schema or shell cannot represent the official classification cleanly, treat that as an architecture/schema defect. Do not distort the course to fit the existing Business or paper-pack structure.

## Current Business classifications

- **AQA A-level Business 7132:** Classification A — all three papers may assess the full course content. Paper 1, Paper 2 and Paper 3 belong under Exam Prep for paper-specific preparation.
- **AQA AS Business 7131:** Classification A — both papers may assess all six AS content areas. The current repository has an assured Paper 2 pack only; Paper 1 must not be shown as published until separately produced and assured.

## PR evidence

A new-course or material course-structure PR should state the classification and link the official source used to establish it. Structural tests should cover the learner placement when more than one component is published.
