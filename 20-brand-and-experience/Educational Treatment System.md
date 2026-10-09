---
title: "Educational Treatment System"
document_id: "revision-educational-treatment-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.5"
owner: "Founder"
effective_date: "2026-10-07"
last_reviewed: "2026-10-09"
content_review_status: "founder-approved"
source_of_truth_for: ["educational treatment visual semantics", "cross-subject treatment consistency", "subject-accent parameterisation of educational treatments", "shared educational treatment extension rules", "in-reading quick check treatment"]
depends_on: ["Learner Design System", "Subject Accent Colour System", "Product UX Principles", "Course Learning Blueprint", "Claims and Progress Governance"]
supersedes: null
---
# Educational Treatment System

## Purpose

Define a shared learner-facing treatment language for recurring educational content so students can recognise the meaning of a treatment wherever it appears in Revision.

Revision may vary page composition by job and may vary subject-recognition accents by subject, but the semantic treatment itself must remain familiar and predictable.

## Authority relationship

This document owns educational-treatment meaning, anatomy and extension rules. `Learner Design System.md` owns the shared learner visual foundations those treatments consume. A treatment may not create its own radius family, type system, icon language, theme or page-local visual grammar.

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

## Approval status

Founder approved on 30 September 2026. Version 1.2 promotes this document from proposed to active authority and adds the **Quick check** treatment family. Version 1.5 reconciles duplicated treatment geometry with the newer Learner Design System: treatment meaning and anatomy are unchanged, while exact learner type/radius roles now use the canonical design-system family.

Quick check is approved at authority level. The reusable component exists in `src/app/ui/` (design-system v2.1); the content block that feeds it is added through the Content Factory process, and the Learn screen wiring follows in the Learn PR. Implementation must follow the New treatment rule and Documentation impact sections below.

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

For example, a Key Idea in Business uses the Business subject colour (blue) as its restrained cue while the same Key Idea treatment in Economics uses the Economics colour (navy). Subject colours and letter marks are governed by `Subject Accent Colour System.md`.

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

## Treatment anatomy (tinted look, v2.2)

One shared way to style each Learn content type, so that any teaching page of any course renders correctly from its content alone. The content says what a block is (`type`); the UI decides how it looks and where it sits; the course supplies only its subject hue. Pages are never hand-styled per course or per page, and a block with an unknown `type` fails content validation rather than falling back to a generic style.

Source: `Learn Page Final` and `LearnBlock` (design system v2.1). Implementation: `src/app/ui/learn/` (one component per schema type, `LearnBlock` and `LearnPageLayout`) and `src/app/learn-reading.css`.

**Subject hue, set once.** The workspace root sets `--accent`, `--accent-tint`, `--accent-ink` and `--accent-on` from the course's hue. Blocks read only `--accent*`. No subject names or hex values inside block components. Labels and muted text on any tint use that tint's `-ink`, never `--tx2`.

**Shared parts.** Padding `P` is 24px 26px (18px on mobile). The label is an eyebrow (800 12px, .12em, uppercase) beside a 10×10 subject-solid square (radius 3).

| Type | Surface | Content |
| --- | --- | --- |
| explanation | none | h3 Bricolage 800 using the canonical learner H3 role; paragraphs `--type-lead`, `--tx` |
| key-idea | `--accent-tint`, r20, P | label `--accent-ink`; term Bricolage 800 20 `--accent-ink`; definition 600 16/1.5; terms one above another in the margin, auto-fit 240px otherwise |
| example | `--sf` + 1px `--line` inset, r20, P | label `--tx2`; title 800 20; body 600 16/1.6 |
| worked-example | `--accent-tint`, r20, P | `setup` (the situation and the numbers the steps work from) and `task` (what to work out, e.g. "Work out the margin of safety.") are shown first as "Your task"; without them a student cannot work a step out before it is shown, so every worked example needs both. Factory output gets its task from the example's formula name. Step-through: step 1, then "Show step N" and "Show all"; hidden steps show a dashed "Work this one out, then show it"; steps separated by the canonical border role; 36px number tile (r12); conclusion on `--sf`, r12, only once all steps are shown |
| relationship | `--bg`, r20, P | chain of compact nodes (r12, 800 15), the last on `--accent-tint`; a row on desktop and tablet, a column on mobile |
| comparison | none | 2–3 columns on `--accent-tint`, r20; rows separated by `--line`; stack on mobile |
| quantitative | `--bg`, r20, P | legend; series 1 `--accent` 3px, series 2 `--tx` 3px, series 3 `--tx2` 2px dashed; the crossing of series 1 and 2 is worked out and marked (dot, dashed drop line, label); "Show the data" toggle opens a per-series table; `role="img"` with a label |
| misconception | `--neutral-tint`, r20, P | 40px `--sf` icon tile; label `--neutral-ink`; never coral or warning |
| quick-check | governed: `--sf`, 2px dashed canonical border, r20, P | "Not scored"; aim for at most 2 per page, placed after what it checks (guidance for Content Factory; the schema does not reject more) |
| recap | `--accent-tint`, r20, P | numbered list in 2 columns on desktop and tablet, 1 on mobile; always renders last |

**Placement** (`LearnPageLayout`). On desktop a `key-idea` sits in the right-hand margin (`minmax(0,1fr) 264px`, gap 48), top-aligned with the first block it sits beside: the run of `explanation` blocks directly before it (Content Factory pages put key terms after all their sections), or, when none, the explanation, example or worked example directly after it. It never sits beside a chart, comparison or chain. Every other block, quick check included, spans the full article width. Tablet and mobile are one column in content order. Content order is kept except that `recap` is always last; Content Factory places any `misconception` directly before the recap so the page closes with Common mix-up, then What to remember.

**Crossing label.** The schema has no field naming the crossing point, so it is read from the series names: revenue against costs is a "Break-even" point with Loss and Profit either side; any other pair is a "Crossing point" with no region words.

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

### Quick check

**Purpose:** ask the learner to retrieve or apply what they have just read, so reading becomes active rather than passive.

Default visual strength: medium.

Quick check passes the New treatment rule because its educational job is materially distinct from every other family: it is the only treatment that asks the learner to respond. Key Idea, Example, Worked Example, Diagram, Misconception and Recap all present information; Quick check asks for it back.

Expected pattern:

- small controlled label that says **Not scored** (a tag, in the v2.1 design a neutral dashed card);
- one short question about content the learner has just read on the same page, never about content not yet taught;
- a small set of answer choices, or a short recall prompt with a reveal;
- immediate feedback that explains why an answer is right or not, rather than only marking it;
- the learner may try again, and a wrong first answer is treated as normal learning rather than failure. Correct feedback uses the teal "Got it" colours and wrong uses coral ("look at this"), never error red, and always with an icon and text;
- quiet supporting surface, distinct from the Worked Example anatomy;
- subject accent may appear as a restrained cue only; and
- no points, streaks, sounds, celebratory animation or other gamified reward.

Use normally one, and at most two, quick checks per teaching page. Place each one after the explanation it checks, not at the top of the page.

Evidence boundary (Founder decision, 1 October 2026): a quick check is an **unscored** learning activity. It **never changes status, Topics covered or readiness.** It must not be treated as scored Practice, mastery or readiness evidence. The reusable component has no way to record an answer. Whether quick check activity could ever be recorded as a planning signal would be a separate Founder decision under `Claims and Progress Governance`.

The in-app wording after an answer ends with a plain sentence that the check does not count towards progress. Instant feedback explains why; another try is allowed.

Accessibility: choices must be real buttons or radio controls reachable by keyboard; feedback must be announced to assistive technology (for example through a polite live region); and correctness must not be shown by colour alone, so feedback always includes text and an icon or equivalent cue.

Quick check questions and feedback are educational content. They carry the same source, accuracy and assurance expectations as the teaching content they check.

### Recap / What to remember

**Purpose:** provide a compact memory anchor after understanding has been established.

Default visual strength: quiet-medium.

The recap should feel like the close of a teaching sequence. It must not become a substitute for the explanation above it.

### Written answer marked by REV (Practice)

When REV marks a written Practice answer, the result is shown on the REV surface (the deep card), never as a tinted teaching block: it is REV speaking, not course content. It lists every mark point with an icon and words ("Mark given" / "Not in your answer yet"), never colour alone, gives one specific note on how to earn a missing mark, lets the student challenge a mark, and always says **"REV's marking is a guide, not an exam board mark."** It is capped like self-marked work in readiness and never claims examiner certainty. Product rules: `10-product-governance/Assisted Exam Answer Marking.md`. Screen behaviour: `docs/features/practice.md`.

### Contextual REV help

**Purpose:** let the learner ask for another explanation without creating a second assistant experience inside the page.

Contextual REV help is the deep REV card at the end of the page ("Still not got it?"), not light inline prompts and not mid-page prompts. It uses the governed REV/action language and the existing Ask REV interaction. The active course/topic/page context is passed into REV with a draft question so the learner does not need to restate it.

## Cross-site consistency

These treatment families are shared product patterns, not Learn-only styling.

Where the same educational semantic appears elsewhere in Revision, including appropriate Learn, Practice feedback, Exam Prep explanation or supporting educational surfaces, the same governed treatment family should be reused unless the different interaction job genuinely requires a separate pattern.

Consistency does not mean forcing every screen into the same composition. Practice may remain task-led and Exam Prep performance-led. The rule applies when the **meaning of the educational treatment is the same**.

A learner should be able to transfer interface familiarity from one course or subject to another. New course content should therefore inherit the established treatment vocabulary rather than teach the learner a new visual language.

## Content and implementation separation

Content should identify the semantic treatment required; it should not choose page-local styling.

For generated or Content Factory material, content contracts should be able to express treatment intent such as:

`key-idea`, `example`, `worked-example`, `relationship-visual`, `misconception`, `quick-check`, `recap`, `rev-explanation`

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

This authority specialises `Learner Design System.md` and Subject Accent Colour System by defining the semantic consistency contract for recurring educational treatments.

It does not itself implement the components. Production implementation must update the Interface System component registry, technical implementation documentation and visual/browser assurance in the same governed implementation change.

Version 1.3 (Founder authorisation of 1 October 2026, effective on merge of the design-system v2.1 PR) adds the unscored Quick check rules above (Not scored label, never changes status, Topics covered or readiness), replaces the Sage / Stone Blue example with the v2.1 subject colours, and records that the Quick check component now exists. The Content Factory schema change for the quick-check block is a separate, Founder-approved piece of work (PR 3).
