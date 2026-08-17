---
title: "Visual Brand System"
document_id: "revision-visual-brand-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "0.1"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-17"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["visual identity", "learner application visual system", "REV visual presence", "responsive navigation treatment"]
depends_on: ["Product UX Principles", "Emotional Experience Principles", "Tone of Voice Framework", "Information Architecture"]
supersedes: null
---
# Visual Brand System

## Purpose

Define the initial visual language for the Revision learner application.

This system translates Revision's approved product and experience principles into a recognisable interface for 15–18-year-old learners. It is intentionally a v0.1 system: strong enough to govern current implementation while remaining open to refinement through learner testing.

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

The learner's next useful action or conversation with Revision should dominate the first screenful. Supporting subject, progress and continue-learning content may remain on Home, but it should sit beneath REV and be discovered naturally by scrolling rather than competing with the opening CTA.

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

The name and exact mark may be revisited deliberately later, but REV is the approved v0.1 product-facing identity.

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

These values are the v0.1 implementation baseline, not permission to use colour alone for meaning. Status and progress information must retain text/icon cues and required contrast.

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

## Navigation

### Desktop

Desktop uses a persistent top navigation with the primary learner jobs:

- Home
- Subjects
- Practice
- Exam Prep
- Progress
- REV / Tutor

Account and utility controls remain visually secondary.

### Mobile

Mobile uses:

- Revision wordmark at the top left;
- a burger/menu control at the top right for account and secondary utilities; and
- a fixed bottom navigation for the highest-frequency learner destinations.

The v0.1 bottom navigation is:

- Home
- Subjects
- Practice
- Progress
- REV

Exam Prep remains a primary product job but may be reached contextually or through wider navigation on constrained screens until usability evidence justifies a different mobile information architecture.

## Components

### Primary actions

Primary learner actions should be unmistakable, touch-friendly and written as actions.

The bright-lime treatment is reserved for a small number of genuinely primary actions, such as starting the recommended next step.

### Cards

Cards should group a clear job or message, not create dashboard density. Use large-radius corners, light borders and soft depth.

### REV surface

The REV recommendation/conversation surface may use a richer indigo treatment than the surrounding application so the AI guide has a recognisable home across devices.

## Motion

Motion should communicate state, response or momentum.

The REV orb may use subtle pulse or waveform movement. The initial REV message may type onto the screen once when the learner enters Home, and response text may type when REV returns a recommendation, provided this remains fast and optional. Motion must:

- remain non-essential to understanding;
- respect reduced-motion preferences;
- avoid flashing or excessive stimulation; and
- not delay the learner reaching useful work.

## Subject differentiation

Subjects may gain restrained accent colours or iconography for fast recognition, but subject colour must not become a competing theme system or a proxy for attainment.

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

The design succeeds when the application feels motivating and distinctive while making the useful next action simpler, not harder, to find.
