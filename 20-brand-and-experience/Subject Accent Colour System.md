---
title: "Subject Accent Colour System"
document_id: "revision-subject-accent-colour-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-24"
last_reviewed: "2026-08-24"
content_review_status: "founder-approved"
source_of_truth_for: ["subject accent colour mapping", "subject colour usage", "subject colour accessibility"]
depends_on: ["Visual Brand System", "Product UX Principles"]
supersedes: ["Visual Brand System statement that no fixed subject-to-colour mapping is approved"]
---
# Subject Accent Colour System

## Purpose

Define a stable subject-colour accent system so Revision can use more visual character and faster subject recognition without turning the product into a decorative or inconsistent multi-colour interface.

This authority specialises the `Subject differentiation` section of `Visual Brand System.md`. A fixed subject-colour approach is now Founder-approved. Colour remains an accent and never becomes the sole carrier of subject identity.

## Core rule

**Primary Teal belongs to Revision / REV / primary action. Supporting accent colours identify subjects. Functional colours retain functional meaning.**

The system must preserve a clear distinction between:

1. **brand/action colour**;
2. **subject recognition colour**; and
3. **semantic status colour**.

Do not mix those responsibilities.

## Approved initial mapping

The currently approved subject mappings are:

| Subject | Accent |
| --- | --- |
| Business | Sage `#BCE8CF` |
| Economics | Stone Blue `#C7D9EE` |

Additional subjects must receive a deliberate mapping from the approved subject-accent palette before production use. Do not assign colours locally per component or page.

The available subject-accent family may use the approved supporting accents from the Visual Brand System:

- Sage `#BCE8CF`
- Stone Blue `#C7D9EE`
- Warm Sand `#F2E9D9`
- Mist `#E9EEF2`
- Soft Aqua Accent `#E6FBF4`

Primary Teal may appear as a shared Revision accent where needed, but should not normally be assigned as a subject identity because it already carries REV/brand/action meaning.

## Usage

Subject colour should appear in restrained recognition cues such as:

- subject chips or labels;
- thin edge/marker bars;
- small icon tiles;
- small supporting accents;
- restrained activity/context continuation where it helps the learner recognise that they remain in the same subject.

Subject colour should **not** normally become:

- a full-page background;
- the dominant fill of ordinary content cards;
- a substitute for headings or subject names;
- a semantic success/warning/error signal; or
- an excuse to make every surface colourful.

The intended effect is recognisable colour rhythm, not a rainbow dashboard.

## Activity type and metadata

Activity types such as **Learn**, **Practice** and **Exam Prep**, durations and ordinary metadata remain neutral by default.

Do not create a second competing colour taxonomy for activity mode merely because colour is available.

If a later design requires mode-specific colour, it needs a separate deliberate rule with accessibility and hierarchy review.

## Functional colours remain reserved

The following retain their governed semantic meaning and must not be assigned as subject identities:

- Success;
- Warning;
- Error; and
- Information where it is being used semantically.

A Business task is not "success green" and a subject must never accidentally read as a warning/error state.

## Accessibility

Colour is supplemental. Subject identity must remain understandable through text and, where used, governed iconography.

All foreground/background combinations must meet the applicable contrast requirement. Where a pale subject accent cannot carry accessible ordinary text, use the governed primary/secondary text colour rather than forcing a coloured foreground.

Light and Dark themes should preserve subject recognition while translating the surface/foreground treatment appropriately. Dark-mode subject colours may use derived darker surfaces or lighter foregrounds provided the subject identity remains recognisably tied to its canonical accent.

## Governance and expansion

Subject mappings are a central brand decision, not local implementation detail.

When adding a new subject:

1. choose from the governed supporting accent family or deliberately extend the palette through brand governance;
2. check distinction from existing subject mappings in Light and Dark;
3. verify common colour-vision-deficiency scenarios;
4. record the mapping here before production use; and
5. update central design tokens/implementation mappings rather than hard-coding per screen.

If the number of supported subjects grows beyond what can be differentiated safely with the current palette, Revision should use repeated colour families plus name/icon recognition rather than inventing many saturated colours.

## Documentation impact

This document records Founder approval on 24 August 2026 to use stable colours by subject. The initial locked mappings are Business = Sage and Economics = Stone Blue. Production implementation must expose these through shared tokens or a central subject-accent mapping and must not scatter subject hex values through page-specific CSS.
