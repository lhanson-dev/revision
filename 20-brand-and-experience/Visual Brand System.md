---
title: "Visual Brand System"
document_id: "revision-visual-brand-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "0.4"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-19"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["visual identity", "learner application visual system", "REV visual presence", "responsive navigation treatment"]
depends_on: ["Product UX Principles", "Emotional Experience Principles", "Tone of Voice Framework", "Information Architecture"]
supersedes: null
---
# Visual Brand System

## Purpose

Define the initial visual language for the Revision learner application.

This system translates Revision's approved product and experience principles into a recognisable interface for 15–18-year-old learners. It is intentionally an early system: strong enough to govern current implementation while remaining open to refinement through learner testing.

## Core visual idea — focused energy

Revision should feel:

- contemporary and made for students rather than institutions;
- energetic enough to motivate action;
- calm enough to keep the next step obvious;
- intelligent and personalised;
- educationally credible without looking like a school portal; and
- distinctive without becoming gimmicky.

The interface should not resemble a dense adult SaaS dashboard, school learning-management system or children's game.

## Home experience

Home is led by REV as the first primary surface after sign-in. The greeting and the prompt "What shall we do today?" belong inside the REV surface rather than being repeated as a separate heading above it.

Home is learner-wide rather than paper-specific. REV's opening recommendation should be visually capable of identifying which subject deserves attention before narrowing into a course, paper/component, topic or activity.

Supporting subject and high-level progress content may remain on Home, but it should sit beneath REV and be discovered naturally by scrolling rather than competing with the opening CTA.

On mobile in particular, Home is a conversation starter first and a dashboard second.

## REV — the AI guide

Revision's AI tutor is presented as a named, non-human product presence.

**Current product-facing name: REV.**

REV should feel like an intelligent operating-system-style guide integrated into Revision rather than a simulated human tutor.

Visual rules:

- do not represent REV with a human portrait or invented person;
- use an abstract orb, pulse, waveform, halo or related system motif;
- the visual presence may use restrained glow or motion to signal intelligence and responsiveness;
- REV's language follows the Tone of Voice Framework: clear, supportive, direct and evidence-aware;
- the interface should never imply a human is monitoring or replying when that is not true.

The same REV identity should remain recognisable when it appears on global Home, Subject Home, course/paper Overview or in activity context. Context may narrow, but the visual treatment must not imply separate assistant personas.

The name and exact mark may be revisited deliberately later, but REV is the approved current product-facing identity.

## Colour direction

The core application palette is:

- **Deep ink** — primary text, navigation and high-contrast structure.
- **Revision indigo** — primary brand surface and interaction colour.
- **Bright lime** — selective action and momentum accent, normally paired with dark text.
- **Cool near-white** — main application canvas.
- **Soft indigo/blue surfaces** — secondary grouping and depth.

Initial implementation tokens:

- deep ink: `#10143F`
- Revision indigo: `#3349F4`
- deep indigo: `#18279F`
- bright lime: `#C9FF2E`
- canvas: `#F7F8FF`
- muted text: `#66708F`
- surface border: `#E3E6F2`

These values are the current implementation baseline, not permission to use colour alone for meaning. Status and progress information must retain text/icon cues and required contrast.

## Typography

Typography should be:

- large, confident and compact for key learner questions and actions;
- highly readable for learning and explanatory content;
- noticeably more expressive in hierarchy than the previous prototype;
- free from decorative type that harms speed or accessibility.

Use a modern sans-serif family with system-safe fallbacks. Very large headlines are appropriate where they clarify the main action; ordinary learning content must remain comfortable to read.

## Layout and hierarchy

- Use generous whitespace.
- Prefer one dominant primary surface over many equal-weight cards.
- Use rounded cards and controls with restrained shadows.
- Keep secondary information visually quieter than the current task.
- Avoid long rows of equal widgets on the learner Home screen.
- Progressive disclosure is preferred when detail is not needed immediately.
- Progress signals must explain meaning rather than exist as decorative metrics.
- Subject Home should feel like a clear narrowing of context from global Home, not a different product or visual theme.
- Course/paper/component Overview should orient and signpost rather than render every learning capability in full.
- Learn, Practice, Exam Prep and Progress should each feel like focused working spaces rather than stacked sections on one enormous page.

## Navigation

The primary global navigation follows the Information Architecture and represents learner-wide destinations rather than activity types.

### Desktop

Desktop uses a persistent top navigation with:

- Home
- Plan
- REV
- Progress
- Subjects

Plan is a genuine primary learner job under the approved adaptive-planning model, not a decorative navigation item. REV may receive distinctive visual treatment while preserving the clarity and accessibility of every other destination. Account and utility controls remain visually secondary.

Learn, Practice, Exam Prep and contextual Progress appear once a subject/course/paper/component is selected. They should not compete with the four learner-wide destinations in global navigation.

### Mobile

Mobile uses:

- Revision wordmark at the top left;
- a burger/menu control at the top right for account and secondary utilities; and
- a fixed bottom navigation for the highest-frequency learner-wide destinations.

The current bottom navigation is:

- Home
- Plan
- REV
- Progress
- Subjects

REV occupies the centre position and may receive a modest differentiated treatment because it is a core product capability. That prominence must not reduce label clarity, touch-target quality, focus visibility or the usability of the other four destinations. Do not add further global destinations solely for symmetry; later navigation changes require deliberate product/experience authority.

### Contextual subject and course navigation

Within Subject Home, the learner should be able to see and enter the relevant course/specification or paper/component context without losing the global application navigation.

Within a course, paper or component that has meaningful depth, contextual navigation should treat the following as first-class sibling sections:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

The active section must be visually unambiguous. The learner should not have to scroll through Learn content to reach Practice, through Practice to reach Exam Prep, or through Exam Prep to reach Progress.

The exact control may vary by screen size. Desktop may use a horizontal secondary navigation or equivalent. Mobile may use a compact tab row, segmented navigation, selector or another accessible pattern. Whatever pattern is used must:

- preserve the academic context clearly;
- make the current section obvious;
- allow fast switching between sections;
- remain usable by touch and keyboard where applicable;
- avoid horizontal page scrolling; and
- leave the global Home / Subjects / Progress / REV model understandable and recoverable.

Not every subject must expose every section at every level. The structure should follow the Information Architecture and the actual qualification context rather than forcing empty navigation items.

## Focused section presentation

### Overview

Overview should feel like a calm hub. It may show the paper/component identity, REV recommendation, concise progress signals, recent activity and routes into the other sections. It must not become a duplicate of Learn, Practice, Exam Prep and Progress.

### Learn

Learn should prioritise readable educational content and topic exploration. The visual hierarchy should support sustained reading, worked examples and explanation without looking like a school textbook portal.

### Practice

Practice should prioritise the current task, prompt and feedback. Activity selection should remain available without competing with the exercise itself.

### Exam Prep

Exam Prep should feel more performance-oriented while remaining calm. Timing, marks, exam conditions and the Exam Simulator may become more prominent, but the experience must not manufacture stress or urgency.

### Progress

Contextual Progress should use the same visual language and evidence semantics as global Progress while clearly showing the narrower academic scope. It should explain what the evidence means and provide direct next actions into Learn, Practice or Exam Prep.

## Components

### Primary actions

Primary learner actions should be unmistakable, touch-friendly and written as actions.

The bright-lime treatment is reserved for a small number of genuinely primary actions, such as starting the recommended next step.

### Cards

Cards should group a clear job or message, not create dashboard density. Use large-radius corners, light borders and soft depth.

### Subject cards

Subject cards should represent the learner's subject-level choices rather than individual paper tools. A card may show course/specification context and a quiet progress signal, but it should primarily act as the route into Subject Home.

### REV surface

The REV recommendation/conversation surface may use a richer indigo treatment than the surrounding application so the AI guide has a recognisable home across devices.

On Subject Home or a course/paper Overview, the REV surface may be smaller than the global Home hero while remaining clearly identifiable as the same assistant.

Inside a focused section, REV may use a compact contextual affordance so it supports the current task without dominating the learning content.

## Motion

Motion should communicate state, response or momentum.

The REV orb may use subtle pulse or waveform movement. The initial REV message may type onto the screen once when the learner enters Home, and response text may type when REV returns a recommendation, provided this remains fast and optional. Motion must:

- remain non-essential to understanding;
- respect reduced-motion preferences;
- avoid flashing or excessive stimulation; and
- not delay the learner reaching useful work.

## Subject differentiation

Subjects may gain restrained accent colours or iconography for fast recognition, but subject colour must not become a competing theme system or a proxy for attainment.

Subject differentiation should help learners recognise where they are while preserving Revision as one coherent product.

## Accessibility

This visual system inherits the Product UX Principles, including the WCAG 2.2 AA target.

In particular:

- colour is never the only carrier of status;
- interactive controls need clear focus and touch states;
- text/background combinations require adequate contrast;
- motion must be reducible;
- navigation remains usable by keyboard and touch; and
- hierarchy must survive smaller screens without forcing horizontal scrolling.

## Design test

A learner opening Revision should quickly feel:

> This is for me. I know what I can do next.

A learner moving from Home into a subject should also immediately understand:

> I know which subject I am in, and I know what I can do here.

A learner entering a course or paper should be able to answer:

> Am I learning, practising, preparing for the exam or checking my progress?

The design succeeds when the application feels motivating and distinctive while making the useful next action simpler, not harder, to find.
