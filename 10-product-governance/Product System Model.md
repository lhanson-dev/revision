# Product System Model

**Status:** Draft authority candidate — v0.1  
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
6. let the student complete, defer or override that recommendation;
7. use the resulting evidence to update future guidance.

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
- exam timing and importance where known; and
- the student's recent revision activity.

The exact weighting is an implementation and evidence question and should be refined as the product develops.

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
- respond constructively when the student is behind or struggling; and
- help the student stay calm and focused on the wider plan.

The tutor should not manufacture urgency from isolated weak evidence.

## Student agency

Revision should provide strong guidance, not a locked pathway.

The student must remain free to ignore, defer or override a recommendation and choose a different subject, topic or activity.

Student choices become additional context for future guidance; they should not be treated as product failure simply because the system recommended something else.

## Desired outcome

The system model succeeds when the complexity of balancing subjects, coverage, evidence and exam preparation is handled largely behind the scenes, leaving the student with a simple answer to the question:

**What is the most useful thing for me to do next, and why?**
