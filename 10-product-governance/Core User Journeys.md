# Core User Journeys

**Status:** Draft authority candidate — v0.7 proposal pending governed merge  
**Purpose:** Define the primary product journeys Revision should support so later information architecture, UX and implementation decisions are anchored in real student use.  
**FI-020 alignment:** Founder-approved 2026-08-22. `Courses` replaces `Subjects` as the learner-facing academic destination; Subject remains academic/catalogue metadata rather than a required everyday navigation hop.

## Journey principles

- Get students to useful value quickly.
- Ask only for the minimum setup needed to make a meaningful recommendation.
- Break setup and complex tasks into short, understandable steps.
- Explain why information is being requested where it is not obvious.
- Keep REV central to guidance, explanation and encouragement.
- Allow students to override recommendations and choose their own focus.
- Adapt recommendations as new evidence appears.
- Compare priorities across the learner's active courses before narrowing into focused work.
- Use focused course/paper sections rather than presenting all learning tools on one long page.
- Shift the balance of activity as exams approach.
- Keep parent and teacher experiences separate from the student's everyday flow.
- Keep the primary journey concise while allowing deeper information through progressive disclosure.
- Treat the learner's persisted active course set as programme context; do not treat the whole published catalogue as though the learner studies it.

## Journey 1 — New student setup and first useful action

A new student should not be asked to configure the entire product before receiving value.

Minimum setup should establish the supported course context needed for accurate guidance, including as applicable:

1. qualification level;
2. subject or curriculum area;
3. exam board/specification; and
4. relevant paper/component context where needed.

These choices establish a **saved learner course**. They are catalogue-discovery steps, not permanent global navigation levels.

Once enough course context is known, Revision should move quickly towards a useful first action.

Setup should be presented in short, clear steps rather than a dense form. The system can then learn more about the student progressively through diagnostics, activity and results rather than front-loading excessive setup.

Account creation and data collection should introduce no more friction than is genuinely required. Where a piece of information is needed, Revision should explain its purpose in plain language.

### Intended flow

Select supported course context → save course to learner programme → establish enough baseline context → receive a useful recommended action → complete activity → receive feedback → update student model.

Authentication may occur before or during this path according to implementation and commercial needs, but it should not become a long configuration barrier before value is clear.

The setup model must support adding further courses later through **Courses → Add Course** without redesigning Home or treating the first course as the permanent default context.

## Journey 2 — Returning student

The default returning experience should answer three questions immediately:

- Where am I across my revision?
- What matters most now?
- What should I do next?

REV should be prominent on Home and should interpret the learner's active course set and wider revision evidence rather than assuming the learner wants to continue whichever paper happened to be used last.

A typical returning journey may be:

> REV: Business would be the best use of your time today. Shall I take you there?

Student accepts → relevant saved Business course opens → REV narrows its guidance to that course → learner selects Learn, Practice, Exam Prep or Progress → learner starts focused work.

Where the learner studies more than one Business course/specification, Revision must identify the intended course clearly rather than treating the subject name alone as sufficient identity.

The learner should not need to interpret complex analytics before they can begin useful work.

If only one course is currently active, Home may naturally recommend within it, but the structure and language must remain ready for multiple courses.

## Journey 3 — Student-led revision

Students must remain free to choose their own focus.

If the student wants to work on a particular qualification/specification, they choose **Courses** from global navigation. The Courses page shows their saved courses and a clear **Add Course** action.

Selecting a saved course opens its Overview directly rather than forcing the learner through a Subject Home first.

From that course context the learner can choose the focused section that matches their intent:

- **Learn** — understand or revisit content;
- **Practice** — retrieve, test and apply knowledge;
- **Exam Prep** — prepare for real exam performance; or
- **Progress** — understand how they are doing within that context.

Where the qualification genuinely has component/paper-specific content, the course may expose the applicable paper/component path without changing Courses into an always-expanded site tree.

A typical self-directed path is:

Home or Courses → saved course → Overview → focused section → paper/component where applicable → topic/area/activity.

The learner may also enter through a topic and then switch between Learn, Practice, Exam Prep or Progress without losing the relevant academic context.

Revision may still note that another active course or topic is currently a higher priority, but guidance must not become a locked path.

Student-led activity should still feed the wider coverage, mastery and readiness model.

### Add / remove course

The Courses page is also the learner's explicit programme-management surface.

A learner can:

- choose **Add Course** to browse/search the published supported catalogue and save another course;
- remove an active course through a secondary confirmed action when their programme changes or a mistake needs correcting; and
- re-add a previously removed course later.

Adding or removing membership changes active programme scope; it does not itself create, delete or reinterpret learning evidence. Removing a course must preserve historic learning evidence and attempts.

## Journey 4 — Ongoing guided revision

Revision should continuously use the learner's wider evidence across **active saved courses** to determine appropriate next actions.

Recommendations should consider the bigger picture rather than reacting excessively to one weak result. Evidence should be interpreted in context of:

- historic performance;
- recent performance;
- specification coverage;
- relative weaknesses;
- competing course/subject priorities;
- available time; and
- upcoming exam context.

At learner-wide scope, Revision must not recommend work from a published course that is not in the learner's active saved course set.

Guidance should narrow progressively:

1. identify the active course that most deserves attention;
2. identify the most useful course/paper/component scope where necessary;
3. identify whether the learner most needs Learn, Practice, Exam Prep or a Progress review;
4. recommend the appropriate topic/activity within that focused section; and
5. use the resulting evidence to update the wider learner model.

REV should explain why a recommendation matters where useful.

REV may also recommend movement between focused sections. For example, a weak Practice result may lead to a specific Learn explanation before the learner returns to Practice.

## Journey 5 — Learning and understanding

When the learner wants to understand or revisit content, the journey should remain focused on learning rather than mixing assessment and progress tools into the same long page.

A typical journey is:

Saved course → Learn → paper/component where applicable → topic/specification area → explanation, notes, worked example or other learning material.

The learner should be able to move from Learn into an appropriate Practice activity without losing the current course/topic context.

REV should be available to explain the selected material and may recommend the next useful practice step when appropriate.

## Journey 6 — Practice and assessment

Practice should help the learner retrieve knowledge, apply it and learn from feedback.

A typical journey is:

Saved course Overview or recommendation → Practice → activity type → topic/area where relevant → activity → feedback → next action.

Practice may include flashcards, quick checks, quizzes, topic tests, case/application work and exam-style questions.

Tests, quizzes and exam practice must not end at a score.

The student should receive useful feedback that helps them understand:

- what they got right;
- what they got wrong;
- why an answer was weak or incorrect where appropriate;
- what they should learn or practise next; and
- how the result changes the wider picture of their progress.

Assessment feedback should be scannable first, with deeper explanation available where useful. Assessment should create learning evidence and a useful next action.

REV should be available in the context of the current assessment or feedback when the student wants explanation or guidance.

## Journey 7 — Exam preparation

As an exam approaches, Revision should progressively shift the balance of activity towards exam performance.

Exam Prep is a focused section within the relevant saved course/paper/component and should include:

- weak-area exam-question work;
- targeted exam questions;
- timed practice;
- exam technique support;
- full-paper/component practice where appropriate;
- Exam Simulator use; and
- readiness reassessment from real performance evidence.

A typical journey is:

Home/REV/Plan recommendation or saved course → Exam Prep → appropriate timed/question/paper/simulator activity → feedback → readiness update.

Exam-preparation activity should remain attached to the relevant course/paper/component rather than becoming an ambiguous global destination.

REV may recommend Exam Prep from Home or course Overview when exam timing and evidence justify it.

The system should continue to address gaps in knowledge while increasingly testing whether the student can apply that knowledge under realistic exam conditions.

## Journey 8 — Progress review

Progress exists at both learner-wide and contextual levels and should use one underlying evidence model.

A global journey is:

Progress → active programme overview → chosen saved course → paper/component where applicable → topic.

Subject grouping may be used where it helps comprehension, but it must not imply that every published course under that subject belongs to the learner.

A contextual journey is:

Saved course Overview → Progress → coverage / understanding / readiness / weak areas → direct next action.

The learner should be able to understand what a progress signal means and what useful action follows from it. Progress should not become a disconnected analytics dashboard.

Where a signal suggests action, Revision may offer a direct route into the relevant Learn, Practice or Exam Prep section while preserving the selected course context.

## Journey 9 — REV conversation

REV is one ongoing assistant relationship with context that changes as the learner moves through the product.

- On Home or the dedicated REV area, REV can reason across the learner's **active saved course set**, plan, progress and activity.
- On a saved course Overview, REV treats that course as the immediate working context while retaining the wider programme picture.
- On a paper/component Overview, REV can reason about that narrower academic scope.
- Inside Learn, Practice, Exam Prep, Progress or a topic/activity, REV can use the current section, content and feedback as additional context.

The learner should not feel that they are starting a different tutor conversation at every level. Context should narrow naturally while the relationship remains continuous.

REV may explain or help a learner find a supported course, but FI-020 does not require REV to add or remove course membership conversationally. Programme membership changes remain explicit learner actions.

## Journey 10 — Parent / payer / supporter support

Parent/supporter functionality is a separate experience from the student's everyday revision flow.

Its purpose is reassurance and appropriate support, not surveillance.

FI-002 distinguishes three roles: learner, billing customer/payer and linked supporter. A parent will commonly be both payer and linked supporter, but paying for the subscription does not by itself grant learner-data access.

Where a valid linked supporter relationship and the relevant Paid or Premium entitlement exist, FI-002 should provide a bounded parent/supporter dashboard as part of the paid proposition.

### Learner-led linking journey

The learner should be able to initiate a supporter relationship without exposing their account through public or unrestricted lookup.

A typical path is:

Learner account → Link a parent/supporter → secure invitation/link → adult signs in or creates an account → adult accepts relationship → subscription/payer step where relevant → supporter dashboard becomes available only when both relationship and entitlement requirements are satisfied.

### Adult-led purchase/linking journey

An adult should be able to begin from an appropriate commercial journey without automatically receiving learner information.

A typical path is:

Pricing/purchase journey → adult signs in or creates payer account → confirms they meet the approved adult-payer rule → chooses learner-linked purchase → secure learner invitation → learner accepts relationship → subscription entitlement becomes associated with learner → supporter dashboard becomes available only if the adult is also validly linked as supporter.

The system must not infer that the payer has supporter permission simply because payment succeeded.

### Paid parent/supporter journey

A linked Paid parent/supporter should be able to understand at a high level whether the learner is:

- engaging with Revision;
- making progress overall;
- broadly on track where evidence supports that judgement;
- showing a course/subject or area where attention may be useful; and
- approaching important known assessments or exams.

The basic Paid journey should answer a simple parent question:

**Is Revision being used, and do things broadly appear to be moving in the right direction?**

A typical path is:

Parent/supporter sign in → linked learner → parent dashboard → high-level engagement and progress → simple programme overview → any useful support prompt.

Billing/subscription management should be shown to the same adult only where that authenticated person is also the billing customer/payer.

### Premium parent/supporter journey

Premium may provide richer interpretation from the same approved parent-visible evidence boundary, including:

- course/subject-level trends;
- changing priorities;
- progress/readiness trajectory with appropriate uncertainty;
- clearer explanation of why an area may need attention;
- personalised suggestions for useful parent support; and
- restrained proactive summaries or alerts when a material change genuinely warrants attention.

The Premium journey should answer a deeper support question:

**Where are things improving, where may support help, and what can I usefully do without taking over?**

### Learner transparency and parent visibility boundary

A learner with an active linked supporter must be able to see who is linked and understand what that person can and cannot see.

Detailed student conversations, individual answers, raw submitted work, private notes, detailed activity surveillance and safeguarding-sensitive information must not automatically become parent-visible because a subscription is paid or Premium.

Paying more should buy better interpretation, synthesis and support guidance from the approved parent-visible data set, not progressively deeper access to private learner information.

The initial FI-002 product uses an 18+ billing-customer rule and should not collect learner date of birth solely to enable a subscription purchase. Exact payer verification, relationship verification, invitation expiry/recovery, unlinking safeguards and legal/consent mechanisms require the remaining FI-002 trust/commercial Definition-of-Ready work before implementation.

The first implementation should support one primary payer/supporter relationship per learner subscription. It does not make broader family-management, multi-parent household management or teacher-style monitoring part of the initial scope.

## Journey 11 — Teacher/class insight

Teacher functionality is not required to prove the initial student proposition, but it is a deliberate future direction.

The intended value is group-level insight, for example helping a teacher identify areas where a class or cohort appears consistently weak.

Teacher functionality should not redefine Revision into a school learning-management system or teacher lesson-planning product.

## Journey priority

The initial learner product should prioritise:

1. new student setup and first useful action;
2. returning learner-wide guidance across the active saved course set;
3. Courses and student-led direct course navigation, including Add/Remove Course;
4. focused course/paper Overview, Learn, Practice, Exam Prep and Progress sections;
5. guided topic/activity work and transitions between sections;
6. assessment and feedback;
7. global/contextual progress review; and
8. exam preparation and Exam Simulator.

FI-002 additionally includes the bounded Paid parent/supporter dashboard and the learner/payer/supporter linking journeys required to support the approved subscription proposition. The parent/supporter experience must remain separate from the student's everyday flow and must not compromise the student-first product model.

Teacher journeys should be developed later without compromising the student-first product model.
