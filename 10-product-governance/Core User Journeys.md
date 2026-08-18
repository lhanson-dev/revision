# Core User Journeys

**Status:** Draft authority candidate — v0.3  
**Purpose:** Define the primary product journeys Revision should support so later information architecture, UX and implementation decisions are anchored in real student use.

## Journey principles

- Get students to useful value quickly.
- Ask only for the minimum setup needed to make a meaningful recommendation.
- Break setup and complex tasks into short, understandable steps.
- Explain why information is being requested where it is not obvious.
- Keep REV central to guidance, explanation and encouragement.
- Allow students to override recommendations and choose their own focus.
- Adapt recommendations as new evidence appears.
- Compare priorities across subjects before narrowing into subject-specific work.
- Shift the balance of activity as exams approach.
- Keep parent and teacher experiences separate from the student's everyday flow.
- Keep the primary journey concise while allowing deeper information through progressive disclosure.

## Journey 1 — New student setup and first useful action

A new student should not be asked to configure the entire product before receiving value.

Minimum setup should establish the context needed for accurate guidance, including:

1. qualification level;
2. subject;
3. exam board/specification; and
4. relevant paper, component or course context where needed.

Once this is known, Revision should move quickly towards a useful first action.

Setup should be presented in short, clear steps rather than a dense form. The system can then learn more about the student progressively through diagnostics, activity and results rather than front-loading excessive setup.

Account creation and data collection should introduce no more friction than is genuinely required. Where a piece of information is needed, Revision should explain its purpose in plain language.

### Intended flow

Select qualification/subject → select exam board/specification → select relevant paper/component/course where needed → establish enough baseline context → receive a useful recommended action → complete activity → receive feedback → update student model.

Authentication may occur before or during this path according to implementation and commercial needs, but it should not become a long configuration barrier before value is clear.

The setup model must support adding further subjects later without redesigning the learner Home or treating the first subject as the permanent default context.

## Journey 2 — Returning student

The default returning experience should answer three questions immediately:

- Where am I across my revision?
- What matters most now?
- What should I do next?

REV should be prominent on Home and should interpret the learner's wider revision picture rather than assuming the learner wants to continue whichever paper happened to be used last.

A typical returning journey may be:

> REV: Business would be the best use of your time today. Shall I take you there?

Student accepts → Business Home opens → REV narrows its guidance to Business → student starts the recommended paper/topic/activity.

The learner should not need to interpret complex analytics before they can begin useful work.

If only one subject is currently enrolled, Home may naturally recommend within that subject, but the structure and language should remain ready for multiple subjects.

## Journey 3 — Student-led revision

Students must remain free to choose their own focus.

If the student wants to revise a particular subject, they should be able to choose Subjects from the global navigation and enter that Subject Home directly.

Within the subject, they should be able to browse their course/specification, paper/component structure and topics, then choose the learning, practice or exam-preparation activity they want.

A typical self-directed path is:

Home or Subjects → Subject Home → course/specification → paper/component where applicable → topic/area → activity.

Revision may still provide useful context, such as noting that another subject or topic is currently a higher priority, but guidance must not become a locked path.

Student-led activity should still feed into the wider coverage, mastery and readiness model.

## Journey 4 — Ongoing guided revision

Revision should continuously use the student's wider evidence to determine appropriate next actions.

Recommendations should consider the bigger picture rather than reacting excessively to one weak result. Evidence should be interpreted in context of:

- historic performance;
- recent performance;
- specification coverage;
- relative weaknesses;
- competing subject priorities;
- available time; and
- upcoming exam context.

Guidance should narrow progressively rather than forcing a global learner to choose an activity before subject context is established.

A recommendation may therefore operate in stages:

1. identify the subject that most deserves attention;
2. once the learner enters that Subject Home, identify the most useful course/paper/component/topic focus;
3. recommend an appropriate learning, practice or exam-preparation activity; and
4. use the resulting evidence to update the wider student model.

REV should explain why a recommendation matters where useful.

## Journey 5 — Exam preparation

As an exam approaches, Revision should progressively shift the balance of activity towards exam performance.

This should include:

- weak-area revision;
- targeted exam questions;
- timed practice;
- full-paper/component practice where appropriate;
- Exam Simulator use; and
- readiness reassessment from real performance evidence.

Exam-preparation activity should remain attached to the relevant subject/course/paper/component rather than becoming an ambiguous global destination.

REV may recommend Exam Prep from Home or Subject Home when exam timing and evidence justify it.

The system should continue to address gaps in knowledge while increasingly testing whether the student can apply that knowledge under realistic exam conditions.

## Journey 6 — Assessment and feedback

Tests, quizzes and exam practice must not end at a score.

The student should receive useful feedback that helps them understand:

- what they got right;
- what they got wrong;
- why an answer was weak or incorrect where appropriate;
- what they should learn or practise next; and
- how the result changes the wider picture of their progress.

Assessment feedback should be scannable first, with deeper explanation available where useful. Assessment should create learning evidence and a useful next action.

REV should be available in the context of the current assessment or feedback when the student wants explanation or guidance.

## Journey 7 — Progress review

Progress should support the learner in moving from the whole revision picture into useful detail.

A typical journey is:

Progress → all-subject overview → chosen subject → course/specification → paper/component → topic.

The learner should be able to understand what a progress signal means and what useful action follows from it. Progress should not become a disconnected analytics dashboard.

Where a signal suggests action, Revision may offer a direct route back into the relevant Subject Home or activity.

## Journey 8 — REV conversation

REV is one ongoing assistant relationship with context that changes as the learner moves through the product.

- On Home or the dedicated REV area, REV can reason across the learner's whole revision programme.
- On Subject Home, REV treats that subject as the immediate working context while retaining the wider picture.
- Inside a topic, practice activity or assessment, REV can use the current content and feedback as additional context.

The learner should not feel that they are starting a different tutor conversation at every level. Context should narrow naturally while the relationship remains continuous.

## Journey 9 — Parent support

Parent functionality should be a separate experience from the student's everyday revision flow.

Its purpose is reassurance and appropriate support, not surveillance.

Parents should eventually be able to understand at a high level whether the student is:

- engaging with revision;
- making progress;
- broadly on track; and
- showing areas where additional support may help.

Detailed student conversations, answers and activity should not automatically be assumed to be parent-visible. The detailed scope, consent and privacy boundaries of the parent experience require later trust and product design work.

## Journey 10 — Teacher/class insight

Teacher functionality is not required to prove the initial student proposition, but it is a deliberate future direction.

The intended value is group-level insight, for example helping a teacher identify areas where a class or cohort appears consistently weak.

Teacher functionality should not redefine Revision into a school learning-management system or teacher lesson-planning product.

## Journey priority

The initial product should prioritise:

1. new student setup and first useful action;
2. returning learner-wide guidance;
3. Subject Home and student-led subject navigation;
4. guided subject/course/topic activity;
5. assessment and feedback;
6. progress review; and
7. exam preparation and Exam Simulator.

Parent and teacher journeys should be developed later without compromising the student-first product model.
