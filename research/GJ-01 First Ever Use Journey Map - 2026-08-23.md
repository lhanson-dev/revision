# GJ-01 — First Ever Use → First Useful Revision

**Status:** Analysis / journey-design input — not normative authority  
**Programme:** Issue #141 — journey-led full-site content and design review  
**Golden journey:** GJ-01  
**Primary scenarios:** NS-01, NS-02, NS-03, NS-04  
**Purpose:** Map the happy-path screen journey for a first-time user before detailed screen content, CTA copy and visual design are defined.

## User situation

A new user has found Revision and wants to see whether it will help them revise.

For the initial product, the only complete post-registration product experience is the **Student** experience. Revision must nevertheless establish the user's intended primary experience after registration so future Student, Parent and Teacher experiences can route deliberately rather than being inferred later.

## Important account-role distinction

The post-registration **Student / Parent / Teacher** choice is an experience/account-context decision. It must not be collapsed into the separate FI-002 commercial and permission roles.

In particular:

- **Student** means the user is entering the Student product experience.
- **Parent** identifies the intended parent/supporter product experience; it does not by itself make the person a billing customer/payer or grant access to Student information.
- **Teacher** identifies the intended future teacher experience; it does not grant school/class permissions merely because it was selected.
- A Student may later also be an adult payer.
- A Parent may later be a payer, linked supporter, both or neither.

Permission and commercial state must therefore continue to be governed separately from this primary experience selection.

## Canonical terminology

**Student** is the canonical term for the person using Revision's study product.

This journey does not maintain a separate internal `learner` label for the same person. Future product, governance, technical and assurance work should use Student consistently, subject only to deliberate compatibility migration where an existing stored/technical identifier cannot safely be renamed immediately.

## Authority impact

Current active `Authentication Experience.md` defines the default new-user path as Google or first name + email + password → Create account and then continuing into the current study application. It does not currently require a post-registration Student / Parent / Teacher selector and uses older `learner` terminology.

The Founder decisions on 23 August 2026 introduce proposed product-authority changes:

> After registration, a new account must establish whether the user is a Student, Parent or Teacher so Revision can determine the correct post-registration experience. Student is the only complete viable product experience initially.

> Student is the canonical term for the Revision user of the study product. Revision should not use `learner` internally and `student` externally for the same entity.

This analysis records the intended journey but does not itself amend normative authority. The authority changes must be promoted before implementation.

# Proposed happy-path screen journey

| Step | Screen/state | User job | Primary action | Outcome |
| --- | --- | --- | --- | --- |
| **1** | Public Revision landing | Decide whether Revision appears useful enough to try | **Start revising free** | Enter account creation |
| **2** | Create account | Create a secure account with minimum friction | **Continue with Google** or **Create account** | Authenticated new account exists |
| **3** | Choose how you use Revision | Tell Revision which product experience this account needs | **Student** | Primary experience is recorded as Student and Student onboarding begins |
| **4** | Add first course | Tell Revision what the Student studies | **Add my course** / **Add this course** | Exact supported course is saved to the Student programme |
| **5** | Course ready / starting-point invitation | Understand that enough setup exists to begin | **Find my starting point** | Enter short starting check |
| **6** | Quick starting check | Give Revision enough early evidence to make a more useful first recommendation | **Answer / Continue** | Small, deliberately limited evidence set created |
| **7** | Starting picture | Understand what Revision currently knows and its uncertainty | **Start recommended revision** | Route directly into first useful work |
| **8** | First revision activity | Actually revise something useful | **Continue / Answer** | Useful activity completed and new evidence created |
| **9** | First feedback | Understand what happened and what to do next | **Continue with recommendation** | Student receives useful next action rather than a score-only endpoint |
| **10** | Home / normal Student experience | Enter Revision's recurring experience with meaningful context already established | **Start / Continue recommended work** | Student is now inside the normal adaptive Revision loop |

# Experience-selection screen — journey contract

## Product job

Determine the user's intended primary experience immediately after account creation so Revision can route the account deliberately.

## Initial choices

### Student — available

Student is the only complete viable experience in the initial product.

Selecting Student:

1. records the user's primary experience/account context as Student;
2. routes directly into first-course setup; and
3. does not ask unnecessary additional profile questions.

### Parent — visible but not yet a complete product experience

Parent should be visible so the product architecture and user expectation recognise that Revision is intended to support parents in future.

The initial treatment must be explicit that the Parent experience is not currently available. It must not silently route a Parent into a Student account or imply that selecting Parent grants Student-data access.

Exact launch treatment — disabled option, `Coming soon` state, or a bounded registered holding experience — should be decided before implementation.

### Teacher — visible but not yet a complete product experience

Teacher should likewise be visible as a future experience but must not imply that classroom/school functionality currently exists.

Exact launch treatment should be consistent with Parent unless a material product reason justifies a different treatment.

## Recommended interaction principle

The experience-selection screen should be a short routing decision, not a persona questionnaire.

It should not ask follow-up questions such as school, job title, age, number of children or teaching institution merely because the selector exists.

# Updated GJ-01 flow

```text
Discovery
   ↓
Create account
   ↓
Choose experience
Student | Parent (not yet available) | Teacher (not yet available)
   ↓
Student
   ↓
Add first course
   ↓
Course ready
   ↓
Quick starting check
   ↓
Early interpretation
   ↓
Recommended first revision
   ↓
Complete revision
   ↓
Useful feedback
   ↓
Home / next recommendation
```

# Material decisions resolved so far

## D1 — Experience selection exists after registration

**Decision:** Yes.

Reason: the account must establish which product experience it should enter instead of assuming every authenticated user is permanently a Student.

## D2 — Student is the only complete initial route

**Decision:** Yes.

Parent and Teacher remain visible future product directions, but the initial journey continues only through Student.

## D3 — Experience selection is not a permission model

**Decision:** Yes.

The selector establishes experience context. Payer, linked-supporter, Student-data and future teacher permissions continue to require their own governed relationship/authorization models.

## D4 — Student is the canonical product term

**Decision:** Yes.

Revision should use Student consistently for the study-product user rather than using learner internally and Student externally. Existing authority/technical terminology must be migrated deliberately before implementation.

## D5 — Starting check remains part of the primary Student happy path

**Working recommendation:** Yes.

It provides enough early evidence to demonstrate Revision's `understand → guide` proposition without pretending sparse evidence establishes mastery/readiness. A later alternative-path pass should define `Skip for now` so the Student is not permanently blocked from useful revision.

## D6 — Only one course is required before first value

**Working recommendation:** Yes.

Additional courses can be added later. First use should not become full programme administration.

# What this journey deliberately does not ask during first use

- surname;
- date of birth purely for ordinary account creation;
- school;
- target grade;
- broad revision-goals questionnaire;
- detailed revision habits;
- every course the Student studies;
- notification preferences;
- subscription selection;
- feature tour.

Any future request for these must justify why it is needed at that point in the journey.

# Next design pass

For Steps 1–10, define:

- what the user must understand within seconds;
- primary CTA and legitimate secondary action;
- exact content hierarchy;
- REV presence/absence and role;
- what must not compete with the primary job; and
- transition into the next state.

Only after that content/action contract is agreed should the journey be turned into a clickable prototype.

# Assurance intent

Once implemented, GJ-01 should become a critical browser regression journey mapped to NS-01–NS-04. Assurance should prove at minimum that:

- new account creation can continue into experience selection;
- Student routes to Student onboarding;
- experience context persists rather than being re-asked on every session;
- course identity is established correctly;
- the Student can reach and complete the starting activity;
- sparse starting evidence does not create unsupported mastery/readiness claims;
- first useful work and feedback complete successfully;
- context is preserved into Home/next recommendation; and
- the critical journey remains usable on representative phone, tablet and desktop viewports with the required accessibility baseline.

Parent/Teacher unavailable-state assurance belongs to the later alternatives/recovery pass until those experiences become active product journeys.

# Documentation impact

This is analysis only. No production implementation or feature lifecycle state changes.

Before implementation, the post-registration experience-selection and Student terminology decisions require governed updates to relevant normative product/experience authority, including `Authentication Experience.md`, `Target Audience and Personas.md`, `Core User Journeys.md`, Information Architecture/navigation, FI-002 account/supporter authority and future teacher scope. Implementation would then need matching technical documentation, persistence/routing rules, domain terminology and assurance coverage.
