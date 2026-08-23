# GJ-01 — Student Onboarding Screen Contract

**Status:** Founder-reviewed journey-design input — accepted and design-locked 23 August 2026; not production implementation  
**Golden journey:** GJ-01 — First Ever Use → First Useful Revision  
**Scope:** successful account creation → Student Home  
**Out of scope:** public marketing/landing site and redesign of the existing signup screen  

## Purpose

Lock the Founder-reviewed Student first-use experience so later implementation starts from an agreed journey and screen-purpose contract rather than reinterpreting the flow during coding.

This is design evidence and implementation input. It does not itself grant production implementation approval or change feature lifecycle state.

## Accepted journey

```text
Existing successful signup
   ↓
Choose account type
   ↓
Student
   ↓
Add first course
   ↓
Course ready / explain starting check
   ↓
Quick starting check
   ↓
Early starting recommendation
   ↓
First useful revision
   ↓
Useful feedback + next action
   ↓
Student Home with meaningful context
```

The new Student must not be dropped directly onto an empty or generic dashboard after account creation. Revision should establish enough context to make the first Home experience useful before showing the normal Student Home.

## Screen-purpose contract

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary action | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Choose account type** | Tell Revision which experience is mine | Route the account into the correct product experience | Student is available; Parent and Teacher are future experiences | **Student card** | None in the primary path | Minimal/resting presence only | Student type persists → first-course setup |
| **Add first course** | Tell Revision what I study | Establish one exact supported course with minimal setup | I only need one course to start; I can add the rest later | **Add this course** | None in the primary path | Briefly explain that course context makes recommendations relevant | Exact supported course saved → course-ready state |
| **Course ready** | Understand that my course was added and why Revision is asking me questions next | Confirm success, then bridge setup into useful personalisation | My course was added successfully; a short check will improve the first recommendation | **Find my starting point** | `Skip for now` belongs to the later alternatives/recovery pass | Explain purpose, not conduct a conversation | Student enters quick starting check |
| **Quick starting check** | Give enough early evidence to begin intelligently | Collect a deliberately small evidence sample without presenting a high-stakes diagnostic | This is short and does not judge my whole course | **Answer / Continue** | None in the primary path | Quiet contextual guidance only | Small evidence set exists → early interpretation |
| **Starting recommendation** | Know where to begin | Turn limited evidence into a cautious, actionable first recommendation | This is an early signal, not a mastery/readiness judgement | **Start revision** | **Choose something else** | Explain why this was recommended and acknowledge uncertainty | Route directly into exact useful work |
| **First useful revision** | Actually revise something | Deliver useful learning/practice rather than another navigation step | I am now doing the work Revision recommended | **Complete / Check answer** | Contextual help where appropriate | Available in context without taking over the task | Useful activity completed; evidence created |
| **First feedback** | Understand what happened and what to do next | Convert the activity into learning and momentum | What I understood, what needs work, and what Revision recommends next | **Continue** | Deeper progress/detail later | Interpret evidence constructively; no score-only endpoint | Updated recommendation/evidence → Home |
| **Student Home** | Know what matters now | Enter the recurring Student experience with meaningful context already established | What Revision recommends next and why | **Continue revision** | Open course / Ask REV / choose own work as subordinate paths | Contextual ongoing intelligence | Student is inside the normal adaptive loop |

## Account-type interaction

The account-type screen uses three visually designed cards/boxes rather than a dropdown:

- **Student** — enabled, whole card actionable;
- **Parent** — visible, non-selectable, explicitly **Coming soon**;
- **Teacher** — visible, non-selectable, explicitly **Coming soon**.

Activating an enabled experience card records that account type and moves directly into that experience's onboarding. Parent and Teacher must not silently fall through to Student.

Unavailable meaning must not rely on colour alone and must be available to keyboard and assistive-technology users.

### Responsive account-card treatment

The three account types must remain understandable as one choice set on constrained screens rather than becoming three oversized feature cards.

- Desktop may use the more spacious three-card composition where the viewport supports it.
- At tablet and phone widths the three cards become **compact stacked rows** rather than tall blocks.
- The account-type **icon sits on the same line as the title**.
- Each card keeps only one short supporting line beneath the title.
- **Student** keeps its clear Continue affordance at the trailing edge.
- **Parent** and **Teacher** keep a visible trailing **Coming soon** state rather than consuming an additional content row.
- At common phone and tablet sizes, all three choices should be visible together in the initial viewport without requiring large vertical scrolling solely to compare account types.
- Responsive compaction must preserve touch-target size, readable text, keyboard focus and the explicit unavailable semantics.

## First-course interaction

First-course setup is progressive and should ask only for information required to resolve the exact supported course, for example qualification, subject and exam board.

Revision should not force an extra selection when the information already supplied uniquely identifies the supported course.

Only one course is required before first value. Additional courses are added later through normal course management.

### Course-ready composition

The course-ready state should use a clear page hierarchy rather than splitting the screen into two equally weighted panels.

- The top of the screen is a restrained, explicit **success state**: an accessible success tick/icon with **`Course added`**.
- Success meaning must not rely on colour alone; the text confirmation remains present for visual and assistive-technology users.
- The success cue should feel positive and reassuring without becoming celebratory, gamified or visually noisy.
- **`Business is ready.`** remains the dominant page-level title and spans the top of the content area beneath the success confirmation.
- The exact course identity remains immediately visible with the title, for example `AQA A-level Business` and `AQA · 7132`.
- Beneath the title, the next-step content forms one simple action row.
- The left side explains **`Now let’s work out where to start.`** and why the short starting check will make the first recommendation more useful.
- The right side carries the dominant **`Find my starting point`** CTA.
- On tablet and phone widths, the explanation and CTA may stack vertically, with the CTA remaining prominent and easy to tap.
- Do not return to an equal split-card composition that makes the course confirmation and next action compete for hierarchy.

## Starting-check principles

The starting check remains part of the accepted primary happy path.

It must:

- feel short and low stakes rather than like an exam or formal diagnostic;
- collect only enough evidence to improve the first recommendation;
- avoid implying that a handful of questions proves topic proficiency, mastery or exam readiness;
- explain why the Student is being asked before beginning; and
- feed a cautious early recommendation that explicitly acknowledges limited evidence.

The alternative `Skip for now` path still needs deliberate alternatives/recovery design before implementation.

## First-value principle

The recommendation must terminate in **work**, not another dashboard or course homepage.

When Revision recommends a specific concept/activity, **Start revision** should take the Student directly into that exact useful activity with academic context preserved.

## Home-entry principle

Normal Student Home is shown only after enough context exists to make it useful in the primary happy path.

By that point Revision should know at minimum:

- the primary experience is Student;
- the Student's first name where available from authentication;
- at least one exact saved course;
- a deliberately small amount of starting evidence;
- the first completed useful activity; and
- a credible next recommendation.

Home should therefore orient and create momentum rather than present an empty setup dashboard.

## Founder prototype review

The clickable prototype representing this contract was reviewed iteratively by the Founder on 23 August 2026 and is now design-locked for the GJ-01 primary happy path.

The completed prototype review and responsive refinement established that:

- Light and Dark theme transitions were exercised through the real prototype toggle;
- Dark mode was corrected so the application background and inherited text/surface tokens switch with the theme rather than leaving a light outer canvas;
- the full click-through completed successfully in both Light and Dark modes;
- all eight post-signup screens were checked at representative **390px** and **360px** phone widths with no horizontal overflow;
- following Founder feedback that the account-type cards were too tall on mobile/tablet, the selector was compacted into shallow stacked rows with the icon and title on one line;
- the refined account selector was browser-checked at **360×640**, **390×844** and **768×1024**;
- Student, Parent and Teacher are all visible together within those checked initial viewports;
- the checked responsive selector has no horizontal overflow;
- Dark mode on the refined selector resolves to the governed dark background (`#0F2024`) and primary text (`#E6F2EF`) token values;
- the Course-ready state was simplified from competing panels into one page-level confirmation followed by one explanation/action row;
- the Course-ready confirmation now uses an accessible tick + `Course added` success cue while keeping `Business is ready.` as the dominant title;
- longer Learn content remains vertically scrollable without sideways scrolling;
- the prototype-only banner no longer obstructs the mobile top bar; and
- the duplicate prototype/Home identity treatment was removed from the Home state.

The approved experience must continue to satisfy Revision's responsive and WCAG 2.2 AA baseline during implementation; prototype checks are design validation, not production accessibility certification.

## Design-lock boundary

The GJ-01 primary happy path described in this document is now the accepted design input for the next governed implementation-definition stage. Later implementation should not casually reinterpret the journey, screen jobs or hierarchy during coding.

A future change to the accepted journey order, account-type interaction, first-course setup, starting-check purpose, recommendation-to-work transition, Course-ready hierarchy or Home-entry principle should be treated as a deliberate design/product change and documented accordingly rather than appearing as incidental implementation drift.

## Visual direction

Use the approved Revision Calm Teal visual system, Manrope typography, shared Interface System foundations and Light/Dark themes.

The screens should remain visually coherent without becoming identical card grids:

- account selection should feel like a deliberate product-routing choice, with compact comparison on phone/tablet rather than oversized cards;
- course setup should feel focused and progressive;
- the course-ready state should use one positive success confirmation, one page-level title and one obvious next-step row rather than competing panels;
- the starting check should prioritise the question and progress through the short task;
- the recommendation should feel intelligently interpreted rather than analytically dense;
- Learn should prioritise comprehension and the response/feedback loop; and
- Home should orient the Student and surface the next useful action.

Prototype educational wording/examples are illustrative journey content only. Production learning content remains subject to Revision's normal content and evidence governance.

## Deliberately excluded from this lock

This accepted contract does **not** lock:

- the future marketing/public landing site;
- a redesign of the existing signup page;
- Parent onboarding;
- Teacher onboarding;
- the final `Skip for now` alternative/recovery behaviour;
- final supported-course catalogue breadth;
- production persistence schema for primary experience type;
- final analytics event names;
- production accessibility certification; or
- production implementation details.

## Documentation and implementation impact

The accompanying `Authentication Experience.md` v0.3 proposal is the normative vehicle for the Student / Parent / Teacher primary-experience selector, card interaction and initial Parent/Teacher `Coming soon` state.

The remaining accepted GJ-01 behaviour is consistent with the current journey-led review direction, Core User Journeys and Product UX Principles. Before production implementation, the implementation task must confirm the applicable feature Definition of Ready, current-main integration baseline, persistence/routing design, technical documentation and scenario-mapped assurance.

Historical research remains historical and is not rewritten merely to match this accepted design state.
