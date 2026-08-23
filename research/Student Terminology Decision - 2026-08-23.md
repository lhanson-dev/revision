# Student Terminology Decision — 23 August 2026

**Status:** Founder-directed proposed authority change / analysis input — not yet normative authority  
**Programme:** Issue #141 — journey-led full-site content and design review  
**Purpose:** Record the Founder decision that Revision should use one consistent term for the person using the core study product: **Student**.

## Founder direction

Revision should not use `learner` internally while using `student` in customer-facing language for the same person.

The canonical product term is:

> **Student**

This applies consistently across future:

- product governance;
- user journeys and scenario names;
- information architecture;
- account and experience-type modelling;
- UI copy and content;
- technical documentation;
- code/domain naming where it represents the Revision Student account or Student experience;
- analytics and assurance terminology; and
- operational/Admin terminology where referring to Revision Students.

## Three core experience types

Revision should be designed around three core user/customer experience types:

1. **Student** — the person using Revision to study and revise. This is the first complete product experience being built.
2. **Parent** — the parent/supporter experience. This is a core future experience type even though its full product experience is not yet available.
3. **Teacher** — the teacher experience. This is a core future experience type even though its full product experience is not yet available.

The product and technical architecture should therefore avoid assumptions that every authenticated account is permanently a Student account, even while Student is the only complete initial experience.

Conceptually:

`Account → primary experience type: Student | Parent | Teacher → experience-specific product shell and journeys`

This experience type remains distinct from commercial, relationship and permission roles such as payer, linked supporter, administrator or future school/class permissions.

## Terminology rule

Use **Student** whenever the subject is the Revision user/customer participating in the study product.

Do not maintain a parallel `learner` synonym for the same entity merely because it is internal, technical or governance language.

`Learner` may still appear only where it is genuinely generic educational language and does **not** refer to the Revision Student account/entity. For example, an external research quotation about “learners” may retain its original wording.

Historical evidence and decision records must not be rewritten merely to modernise terminology. Their original wording remains historically accurate.

## Current-authority conflict

Current approved `main` uses `learner` extensively in active authority and technical documentation, including Authentication Experience, Information Architecture, Tone of Voice and other product/experience sources.

The Founder direction therefore conflicts with the existing terminology in those sources and must be treated as a proposed authority change until deliberately promoted through the governed documentation path.

This research record does not silently override current authority.

## Migration principle

The terminology should be normalised deliberately, not through an unsafe blind search-and-replace.

Before implementation of the new Student/Parent/Teacher routing model, the governed change should:

1. update the relevant normative product and experience authorities to use Student consistently;
2. define Student / Parent / Teacher as the three core experience types;
3. update active journey and information-architecture language;
4. update technical documentation and code/domain terms where they represent the same Student entity;
5. preserve compatibility where changing stored schema, routes or API contracts immediately would create unnecessary migration risk;
6. document any temporary technical compatibility names explicitly rather than treating them as a second vocabulary; and
7. update assurance/analytics naming as implementation migrates.

A temporary compatibility identifier may remain in code or persistence only when changing it safely requires a deliberate migration. It must not be treated as the preferred domain term for new work.

## Journey-programme effect

From this decision onward, new journey analysis should use:

- **New Student** rather than New Learner;
- **Returning Student** rather than Returning Learner;
- **Student programme** rather than learner programme;
- **Student choice / Student agency** where referring to the Revision user; and
- **Student experience** rather than learner experience.

Existing research in PR #139 that predates this decision should be normalised to Student before the analysis is treated as complete.

## Documentation impact

Before implementation, this decision requires a governed authority update spanning at minimum:

- `10-product-governance/Target Audience and Personas.md`;
- `10-product-governance/Authentication Experience.md`;
- `10-product-governance/Core User Journeys.md`;
- `10-product-governance/Information Architecture.md`;
- `10-product-governance/Global Learner Navigation.md` (including likely document rename where appropriate);
- `10-product-governance/Product System Model.md`;
- `20-brand-and-experience/Tone of Voice Framework.md`;
- relevant trust/evidence authorities where the Revision Student is named;
- relevant technical documentation and implementation domain naming; and
- `INDEX.md` if authority/document names change.

Historical audits, decisions and archived material must remain historically accurate rather than being rewritten.
