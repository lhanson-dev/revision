# Product System Model

**Status:** Draft authority candidate — v0.4  
**Purpose:** Define the core model by which Revision understands a student, recommends activity and updates guidance over time.

## Core model

Revision should continuously build and update a picture of the student's revision state using evidence from their activity.

The system should use that picture to help decide what the student should work on next, while keeping the student free to choose a different path.

The core loop is:

1. understand the student's subjects, qualification and specification;
2. collect evidence from revision and assessment activity;
3. update the student's current revision state;
4. compare needs across topics and subjects;
5. recommend the most useful next action;
6. let the student choose whether to follow that recommendation or do something else; and
7. use what the student actually did, together with the resulting evidence, assessment context and remaining time, to recalculate future guidance.

The system should optimise from reality rather than try to preserve an obsolete plan. A recommendation is guidance for the current moment, not a commitment the learner must later reschedule if life changes.

Adaptive revision planning is governed in detail by `Adaptive Revision Planning.md`.

## Three distinct dimensions

Revision should not collapse all progress into one score. It should distinguish at least three dimensions:

### Coverage
Has the student meaningfully revised the relevant area of the specification?

### Understanding / mastery
What does the available evidence suggest the student currently understands and can recall?

### Exam readiness
Can the student apply that knowledge effectively in exam-style conditions, including realistic questions, timing and mark expectations?

These dimensions are related but not interchangeable. A student can have covered a topic without mastering it, or understand content without yet demonstrating exam readiness.

## Evidence sources

The model may use evidence from activities including:

- quizzes;
- active recall and flashcards;
- topic tests;
- exam questions;
- timed practice;
- full or simulated papers; and
- other validated learning interactions introduced later.

Assessment should not only produce a score. Where practical it should provide feedback that helps the student understand mistakes and improve.

## Activity completion and reconciliation

Revision should infer completion from reliable product activity wherever possible rather than asking the student to maintain a manual task list.

Where REV recommends an in-product activity and the learner follows that recommendation into the activity, Revision should retain the recommendation-to-activity link. When the activity reaches a reliable completion state, the system should record that the recommended work was completed and use the resulting evidence automatically.

A click-through alone must not be treated as completion where the activity has a meaningful completion event. The product should distinguish recommendation exposure, activity start, meaningful engagement and activity completion so product metrics do not overstate useful engagement.

At an appropriate return point, Revision may use a very short reconciliation interaction. This should primarily:

- confirm what Revision already inferred where confirmation is useful;
- let the learner add meaningful revision completed outside Revision; and
- correct obvious gaps without turning the student into a time-sheet administrator.

Reconciliation must be lightweight, skippable where appropriate and designed to improve the next recommendation rather than police compliance.

External self-report is planning/context evidence and must not directly create objective mastery or readiness claims.

## Context over reaction

Recommendations must consider the bigger picture rather than overreacting to a single event.

One weak test should influence the student's model, but it should not automatically become the highest priority if longer-term evidence shows the student is normally strong in that area and other topics or subjects have greater need.

Prioritisation should therefore consider context such as:

- recent evidence;
- longer-term performance;
- confidence and consistency of the evidence;
- specification coverage;
- strength and weakness across the wider subject;
- competing priorities across other subjects;
- exam timing, scope and importance where known;
- realistic available revision time;
- recent revision activity and actual choices; and
- deliberate short-term learner preferences where these have been discussed with REV.

The underlying planner should use deterministic, testable logic rather than depend on a large language model to calculate priorities or schedules. Exact weighting remains an implementation and evidence question.

## Continuous adaptation

Revision's wider guidance and revision plan should be treated as a living model rather than a fixed timetable.

The planner should recalculate when meaningful state changes could affect the best use of time and should also perform a quiet daily check.

Meaningful changes include new evidence, reliable activity completion, assessment changes, availability changes, meaningful external revision and material learner choices.

The system should not churn after insignificant interactions, and recalculation should be separated from learner notification. Most internal recalculation may remain silent.

When the student completes different work from what Revision recommended, misses a day, has less time than expected or generates new learning evidence, the next recommendation should be recalculated from the updated state.

The system should not create artificial task debt by carrying every uncompleted recommendation forward. It should decide again what matters most given:

- current coverage, understanding and exam-readiness evidence;
- the time remaining before relevant assessments;
- realistic future availability;
- competing priorities across subjects; and
- the educational value of the remaining work.

## Insufficient capacity

Where the available time is no longer sufficient to cover everything, Revision should treat that as a planning condition rather than a learner failure.

It should say so calmly, move into a prioritisation mode and focus on work most likely to improve the learner's position with the time available.

Revision may suggest that additional study time would materially help when genuinely supported by the remaining workload and stated availability. Such suggestions must be optional, proportionate and non-pressuring. If extra time is not available, the system continues to optimise the time the student does have.

## Recommendation behaviour

Revision should be proactive enough to explain why an action matters.

Recommendations should be understandable rather than opaque. REV should be able to explain material reasons such as limited evidence, demonstrated weakness, assessment proximity, known exam weighting/mark opportunity, already-strong material or a realistic improvement opportunity.

The product must not expose false-precision internal priority scores or promise precise additional marks unless evidence and claims authority support such a claim.

## AI tutor role

The AI tutor should use the student's broader revision state to provide personalised support and guidance.

It should be able to:

- recommend useful next actions;
- explain why an area deserves attention;
- answer questions in the context of the student's subject and specification;
- help interpret assessment feedback;
- explain important plan changes;
- discuss learner preferences and negotiate short-term priorities;
- encourage the student when progress is good;
- respond constructively when the learner is struggling or time is constrained; and
- help the student stay calm and focused on what is most useful now.

The AI tutor should not calculate the deterministic planner priority order itself.

The tutor should not manufacture urgency from isolated weak evidence or imply failure because a previous recommendation was not followed.

## Student agency

Revision should provide strong guidance, not a locked pathway.

The student must remain free to ignore a recommendation and choose a different subject, topic or activity.

The student may also discuss a deliberate short-term preference with REV. Where reasonable, the plan may adapt around that preference while REV preserves the wider cross-subject view and explains material consequences.

The product should not require the learner to manage recommendations by manually moving tasks to another day. What the learner actually chooses to do becomes additional context for the next recommendation and wider adaptive plan.

Student choices should not be treated as product failure simply because the system recommended something else.

## Desired outcome

The system model succeeds when the complexity of balancing subjects, coverage, evidence, exam dates, available time, learner preferences and exam preparation is handled largely behind the scenes, leaving the student with a simple answer to the question:

**What is the most useful thing for me to do next, and why?**
