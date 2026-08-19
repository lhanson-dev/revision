# Product System Model

**Status:** Draft authority candidate — v0.3  
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
7. use what the student actually did, together with the resulting evidence and remaining time, to recalculate future guidance.

The system should optimise from reality rather than try to preserve an obsolete plan. A recommendation is guidance for the current moment, not a commitment the learner must later reschedule if life changes.

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

A click-through alone must not be treated as completion where the activity has a meaningful completion event. The product should distinguish recommendation exposure, activity start and activity completion so product metrics do not overstate useful engagement.

At an appropriate return point, Revision may use a very short reconciliation interaction such as asking what the learner got done since their last visit. This should primarily:

- confirm what Revision already inferred where confirmation is useful;
- let the learner add meaningful revision completed outside Revision; and
- correct obvious gaps without turning the student into a time-sheet administrator.

Reconciliation must be lightweight, skippable where appropriate and designed to improve the next recommendation rather than police compliance.

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
- exam timing and importance where known;
- realistic available revision time; and
- the student's recent revision activity and actual choices.

The exact weighting is an implementation and evidence question and should be refined as the product develops.

## Continuous adaptation

Revision's wider guidance and any revision plan built from it should be treated as a living model rather than a fixed timetable.

When the student completes different work from what Revision recommended, misses a day, has less time than expected or generates new learning evidence, the next recommendation should be recalculated from the updated state.

The system should not create artificial task debt by carrying every uncompleted recommendation forward. It should decide again what matters most given:

- current coverage, understanding and exam-readiness evidence;
- the time remaining before relevant assessments;
- the student's realistic future availability;
- competing priorities across subjects; and
- the educational value of the remaining work.

Where the available time is no longer sufficient to cover everything, Revision should say so without judgement and prioritise the work most likely to improve the student's position. It should not imply that an impossible plan remains achievable.

Revision may suggest that additional study time would materially help when that is genuinely supported by the remaining workload and the student's stated availability. Such suggestions must be optional, proportionate and non-pressuring. If extra time is not available, the system should continue to optimise the time the student does have.

## Recommendation behaviour

Revision should be proactive enough to explain why an action matters.

For example, the system may identify that a student has spent substantial time on one strong area while another area is weaker or under-covered, and recommend switching focus.

Recommendations should be understandable rather than opaque. The student should be able to see enough of the reasoning to trust why something has been suggested.

## AI tutor role

The AI tutor should use the student's broader revision state to provide personalised support and guidance.

It should be able to:

- recommend useful next actions;
- explain why an area deserves attention;
- answer questions in the context of the student's subject and specification;
- help interpret assessment feedback;
- encourage the student when progress is good;
- respond constructively when the student is behind or struggling;
- explain changes to the wider revision plan when priorities move; and
- help the student stay calm and focused on what is most useful now.

The tutor should not manufacture urgency from isolated weak evidence or imply failure because a previous recommendation was not followed.

## Student agency

Revision should provide strong guidance, not a locked pathway.

The student must remain free to ignore a recommendation and choose a different subject, topic or activity.

The product should not require the learner to manage the recommendation by manually moving it to another day. What the learner actually chooses to do becomes additional context for the next recommendation and for any wider adaptive plan.

Student choices should not be treated as product failure simply because the system recommended something else.

## Desired outcome

The system model succeeds when the complexity of balancing subjects, coverage, evidence, exam dates, available time and exam preparation is handled largely behind the scenes, leaving the student with a simple answer to the question:

**What is the most useful thing for me to do next, and why?**
