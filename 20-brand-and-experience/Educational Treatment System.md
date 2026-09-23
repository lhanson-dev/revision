---
title: "Educational Treatment System"
document_id: "revision-educational-treatment-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "proposed"
version: "1.1"
owner: "Founder"
effective_date: "2026-09-23"
last_reviewed: "2026-09-23"
content_review_status: "founder-approved-direction-pending-governed-merge"
source_of_truth_for: ["educational treatment visual semantics", "cross-subject treatment consistency", "subject-accent parameterisation of educational treatments", "shared educational treatment extension rules"]
depends_on: ["Visual Brand System", "Subject Accent Colour System", "Product UX Principles", "Course Learning Blueprint"]
supersedes: null
---
# Educational Treatment System

## Purpose

Define a shared learner-facing treatment language for recurring educational content so students can recognise the meaning of a treatment wherever it appears in Revision.

Revision may vary page composition by job and may vary subject-recognition accents by subject, but the semantic treatment itself must remain familiar and predictable.

## Core rule

**Same educational meaning = same governed treatment family. Subject identity may change the accent, not the treatment semantics.**

A learner who has seen a Key Idea, Example, Worked Example, Misconception, Recap or contextual REV explanation in one subject should recognise the same treatment immediately in another subject.

Consistency includes, where applicable:

- the treatment's educational purpose;
- hierarchy and relative visual strength;
- label/icon language;
- spacing, radius, border and surface behaviour;
- interaction and focus behaviour;
- responsive behaviour;
- Light/Dark translation;
- accessibility semantics; and
- the relationship between the treatment and surrounding teaching content.

## Founder-approved operating rules

The shared educational treatment system follows three mandatory rules:

1. **Treatment semantics are global.** The same educational meaning must use the same governed treatment family wherever it appears in Revision, unless a genuinely different interaction job requires a distinct pattern.
2. **Subject accents parameterise treatments; they do not redesign them.** Subject identity may change a restrained recognition cue such as an edge, marker, label accent or supporting tint, but it must not redefine component anatomy, hierarchy, spacing, radius, interaction, icon language or semantic meaning.
3. **Treatments appear because the content requires them, not because a template has an empty slot.** A teaching page must not be forced to contain a Key Idea, Example, Worked Example, Misconception, Diagram, Recap or any other treatment simply to create visual variety or satisfy a page quota.

The desired page rhythm is therefore normally:

`plain teaching → selective justified treatment → plain teaching → selective justified treatment → recap/navigation`

not:

`treatment card → treatment card → treatment card → treatment card`.

Consistency must create familiarity without turning educational content into template stuffing.

## Subject variation

Subject identity is allowed to parameterise restrained recognition cues through the governed Subject Accent Colour System.

For example, a Key Idea in Business may use the Business Sage accent while the same Key Idea treatment in Economics uses the Economics Stone Blue accent.

The following must not vary merely because the subject changes:

- treatment purpose;
- component anatomy;
- label meaning;
- hierarchy;
- interaction behaviour;
- radius/shadow conventions;
- icon family;
- semantic status meaning; or
- REV/action colour ownership.

Primary Teal remains Revision/REV/action colour. Success, Warning, Error and Information remain functional semantic colours and must not be repurposed as subject decoration.

## Initial shared treatment families

The initial treatment system is deliberately small. New treatment families require a real recurring educational need rather than a desire for visual variety.

### Normal explanation

The default teaching treatment is ordinary readable content, not a card.

Use normal headings, paragraphs, lists and whitespace. Most learner-facing teaching content should remain visually quiet so stronger treatments retain meaning.

### Key Idea / Definition

**Purpose:** make an important concept, term or compact principle easy to locate and remember without interrupting the reading flow.

Default visual strength: light.

Expected pattern:

- small controlled label;
- restrained subject-accent cue such as a thin edge/marker or comparable accent;
- no decorative shadow by default;
- ordinary readable body text; and
- no implication that the treatment is a warning, success state or assessment result.

### Example

**Purpose:** make a concept concrete by showing it in a realistic or useful context.

Default visual strength: medium-light.

Expected pattern:

- shared quiet/supporting surface treatment;
- governed radius/border/spacing;
- subject accent may appear as a restrained cue;
- example content explains or applies the concept rather than decorating the page.

### Worked Example

**Purpose:** model a process, calculation, method, reasoning sequence or structured answer that the learner can follow.

Default visual strength: medium.

Expected pattern:

- clearer structural separation than an ordinary Example;
- explicit stages/steps where the learning task requires them;
- shared typography, controls and spacing;
- no page-local component anatomy for individual subjects.

### Diagram / Relationship Visual

**Purpose:** explain a relationship, process, comparison, causal chain, structure or quantitative idea more clearly than prose alone.

Default visual strength depends on educational importance, but the diagram should remain part of the teaching narrative rather than becoming decorative illustration.

Expected pattern:

- Revision typography/icon/line language;
- subject accent only as a supporting cue;
- accessible text alternative or equivalent explanation where required;
- no subject-specific visual grammar invented locally.

### Misconception / Common Mix-up

**Purpose:** repair a plausible misunderstanding or important distinction.

Default visual strength: medium-light.

This is an educational clarification, not automatically a Warning or Error state. Do not use semantic warning/error colour merely because the learner might get the concept wrong.

### Recap / What to remember

**Purpose:** provide a compact memory anchor after understanding has been established.

Default visual strength: quiet-medium.

The recap should feel like the close of a teaching sequence. It must not become a substitute for the explanation above it.

### Contextual REV explanation

**Purpose:** let the learner ask for another explanation without creating a second assistant experience inside the page.

Default visual strength: light.

Use the governed REV/action language and existing Ask REV interaction. The active course/topic/page context should be passed into REV so the learner does not need to restate it.

## Cross-site consistency

These treatment families are shared product patterns, not Learn-only styling.

Where the same educational semantic appears elsewhere in Revision, including appropriate Learn, Practice feedback, Exam Prep explanation or supporting educational surfaces, the same governed treatment family should be reused unless the different interaction job genuinely requires a separate pattern.

Consistency does not mean forcing every screen into the same composition. Practice may remain task-led and Exam Prep performance-led. The rule applies when the **meaning of the educational treatment is the same**.

A learner should be able to transfer interface familiarity from one course or subject to another. New course content should therefore inherit the established treatment vocabulary rather than teach the learner a new visual language.

## Content and implementation separation

Content should identify the semantic treatment required; it should not choose page-local styling.

For generated or Content Factory material, content contracts should be able to express treatment intent such as:

`key-idea`, `example`, `worked-example`, `relationship-visual`, `misconception`, `recap`, `rev-explanation`

The interface layer owns how that semantic treatment is rendered through the shared Revision design system.

This separation prevents each new course, subject or generated content pack from inventing its own visual implementation.

## New treatment rule

Before adding a recurring educational treatment that is not covered above:

1. prove that the educational job is materially distinct from an existing treatment;
2. define its learner meaning and relative hierarchy centrally;
3. define how subject accents may or may not parameterise it;
4. ensure Light/Dark, responsive and accessibility behaviour are defined;
5. implement it through the shared Interface System rather than a page-local style; and
6. add the relevant component/visual assurance before treating it as reusable.

Do not create a new treatment because one subject needs a different colour, illustration or content example.

## Implementation expectation

When these patterns move into production, recurring treatment anatomy should be owned centrally through the Revision Interface System and reusable components/variants.

Feature code and content renderers should consume the shared treatment contract rather than reproduce visually similar local components.

Subject variation should normally be supplied through central subject-accent tokens/metadata, not hard-coded per page or component.

The shared implementation should be assured across applicable:

- supported subjects;
- Light and Dark themes;
- phone, tablet and desktop;
- keyboard/focus behaviour; and
- representative content lengths.

Implementation assurance should also verify that content renderers do not require every treatment family to appear on every page. Treatment presence is driven by governed educational need, while treatment presentation is driven by this shared system.

## Documentation impact

This authority extends the existing Visual Brand System and Subject Accent Colour System by defining the semantic consistency contract for recurring educational treatments.

It does not itself implement the components. Production implementation must update the Interface System component registry, technical implementation documentation and visual/browser assurance in the same governed implementation change.