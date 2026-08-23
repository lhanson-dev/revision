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

The previously active `Authentication Experience.md` v0.2 defined account creation but did not require a post-registration Student / Parent / Teacher selector and used older `learner` terminology.

The Founder decisions on 23 August 2026 establish the intended product direction:

> After registration, a new account must establish whether the user is a Student, Parent or Teacher so Revision can determine the correct post-registration experience.

> Student is the only enabled initial experience. Parent and Teacher remain visible but unavailable and are clearly marked `Coming soon`.

> Student is the canonical term for the Revision user of the study product. Revision should not use `learner` internally and `student` externally for the same entity.

This analysis remains non-normative. The accompanying governed authority change must be approved and merged before implementation relies on it.

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

### Parent — visible, unavailable, Coming soon

Parent remains visible so the product architecture and user expectation recognise that Revision is intended to support parents in future.

For the initial product, Parent is not selectable and is clearly marked **Coming soon**. It must not silently route a Parent into a Student account or imply that Parent functionality or Student-data access currently exists.

### Teacher — visible, unavailable, Coming soon

Teacher likewise remains visible as a future experience but is not selectable in the initial product and is clearly marked **Coming soon**.

The presentation should not imply that classroom, school, class-management or Student-data permissions currently exist.

### Unavailable-state interaction

Parent and Teacher should remain clearly visible as first-class future Revision experiences while being unmistakably unavailable.

The unavailable state must not rely on colour alone. It should be semantically non-selectable/disabled and accessible to keyboard and assistive-technology users.

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
Student | Parent — Coming soon | Teacher — Coming soon
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

Parent and Teacher remain visible future product directions, but only Student can be selected in the initial product.

## D3 — Experience selection is not a permission model

**Decision:** Yes.

The selector establishes experience context. Payer, linked-supporter, Student-data and future Teacher permissions continue to require their own governed relationship/authorization models.

## D4 — Student is the canonical product term

**Decision:** Yes.

Revision should use Student consistently for the study-product user rather than using learner internally and Student externally. Existing authority/technical terminology must be migrated deliberately before implementation.

## D5 — Starting check remains part of the primary Student happy path

**Working recommendation:** Yes.

It provides enough early evidence to demonstrate Revision's `understand → guide` proposition without pretending sparse evidence establishes mastery/readiness. A later alternative-path pass should define `Skip for now` so the Student is not permanently blocked from useful revision.

## D6 — Only one course is required before first value

**Working recommendation:** Yes.

Additional courses can be added later. First use should not become full programme administration.

## D7 — Parent and Teacher launch treatment

**Decision:** Show both options, mark each **Coming soon**, and do not allow either to be selected initially.

Reason: Revision should make its three core experience types explicit from the start without pretending unfinished Parent or Teacher products are available.

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
- Student, Parent and Teacher are all visible on the selection screen;
- Student is selectable and routes to Student onboarding;
- Parent and Teacher are visibly marked `Coming soon` and cannot be selected;
- unavailable-state meaning is accessible and does not rely on colour alone;
- experience context persists rather than being re-asked on every session;
- course identity is established correctly;
- the Student can reach and complete the starting activity;
- sparse starting evidence does not create unsupported mastery/readiness claims;
- first useful work and feedback complete successfully;
- context is preserved into Home/next recommendation; and
- the critical journey remains usable on representative phone, tablet and desktop viewports with the required accessibility baseline.

# Documentation impact

This journey file remains analysis only and does not itself grant implementation approval.

The immediate normative dependency is the governed Authentication Experience update defining Student / Parent / Teacher routing and the Parent/Teacher `Coming soon` state. Broader Student terminology alignment across remaining product/experience authority, technical documentation, persistence/routing rules, analytics and assurance remains deliberate follow-up before implementation where those sources govern the same Student entity.
