# Core User Journeys

**Status:** Draft authority candidate — v0.2  
**Purpose:** Define the primary product journeys Revision should support so later information architecture, UX and implementation decisions are anchored in real student use.

## Journey principles

- Get students to useful value quickly.
- Ask only for the minimum setup needed to make a meaningful recommendation.
- Break setup and complex tasks into short, understandable steps.
- Explain why information is being requested where it is not obvious.
- Keep the AI tutor central to guidance, explanation and encouragement.
- Allow students to override recommendations and choose their own focus.
- Adapt recommendations as new evidence appears.
- Shift the balance of activity as exams approach.
- Keep parent and teacher experiences separate from the student's everyday flow.
- Keep the primary journey concise while allowing deeper information through progressive disclosure.

## Journey 1 — New student setup and first useful action

A new student should not be asked to configure the entire product before receiving value.

Minimum setup should establish the context needed for accurate guidance, including:

1. qualification level;
2. subject;
3. exam board/specification; and
4. relevant paper or course context where needed.

Once this is known, Revision should move quickly towards a useful first action.

Setup should be presented in short, clear steps rather than a dense form. The system can then learn more about the student progressively through diagnostics, activity and results rather than front-loading excessive setup.

Account creation and data collection should introduce no more friction than is genuinely required. Where a piece of information is needed, Revision should explain its purpose in plain language.

### Intended flow

Select qualification/subject → select exam board/specification → select relevant paper/course → establish enough baseline context → receive a useful recommended action → complete activity → receive feedback → update student model.

Authentication may occur before or during this path according to implementation and commercial needs, but it should not become a long configuration barrier before value is clear.

## Journey 2 — Returning student

The default returning experience should answer three questions immediately:

- Where am I?
- What matters most now?
- What should I do next?

The AI tutor should be prominent and able to translate the underlying model into clear, calm guidance.

A typical experience may be:

> Here is where you are. Here is what matters most today. Shall we get started?

The student should not need to interpret complex analytics before they can begin useful work.

## Journey 3 — Student-led revision

Students must remain free to choose their own focus.

If the student wants to revise a particular topic, paper or subject, Revision should support that choice without penalty or artificial friction.

The product may still provide useful context, such as noting that another area is currently a higher priority, but guidance must not become a locked path.

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

The AI tutor should explain why a recommendation matters where useful.

## Journey 5 — Exam preparation

As an exam approaches, Revision should progressively shift the balance of activity towards exam performance.

This should include:

- weak-area revision;
- targeted exam questions;
- timed practice;
- full-paper practice where appropriate;
- Exam Simulator use; and
- readiness reassessment from real performance evidence.

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

## Journey 7 — Parent support

Parent functionality should be a separate experience from the student's everyday revision flow.

Its purpose is reassurance and appropriate support, not surveillance.

Parents should eventually be able to understand at a high level whether the student is:

- engaging with revision;
- making progress;
- broadly on track; and
- showing areas where additional support may help.

Detailed student conversations, answers and activity should not automatically be assumed to be parent-visible. The detailed scope, consent and privacy boundaries of the parent experience require later trust and product design work.

## Journey 8 — Teacher/class insight

Teacher functionality is not required to prove the initial student proposition, but it is a deliberate future direction.

The intended value is group-level insight, for example helping a teacher identify areas where a class or cohort appears consistently weak.

Teacher functionality should not redefine Revision into a school learning-management system or teacher lesson-planning product.

## Journey priority

The initial product should prioritise:

1. new student setup and first useful action;
2. returning guided revision;
3. student-led revision;
4. assessment and feedback;
5. exam preparation and Exam Simulator.

Parent and teacher journeys should be developed later without compromising the student-first product model.
