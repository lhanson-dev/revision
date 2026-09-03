# Product System Model

**Status:** Draft authority candidate — v0.7  
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

The governing strategic objective is that useful interactions compound: **Revision should know the student better after every useful interaction**, where the interaction produces reliable educational evidence or legitimate planning/context information. The system must not collect or infer learner state merely to satisfy this slogan; evidence quality, provenance and privacy remain controlling boundaries.

## Connected intelligence model

Revision's product system should combine four connected forms of intelligence:

### Curriculum intelligence

The system understands the applicable qualification, exam board, specification structure, course/component relationships, governed content and assessment context.

### Learner intelligence

The system maintains a structured, evidence-aware picture of what the learner has reviewed, what they currently appear to understand, where evidence is weak or stale, recurring misconceptions or mistake patterns where supported, and relevant planning/preferences context.

### Exam intelligence

The system distinguishes knowing content from applying it effectively in exam-style conditions. Written answers, assessment objectives, timing, realistic exam questions, paper/component context and validated marking evidence may contribute to the learner's exam-readiness picture where the evidence rules permit.

### Planning intelligence

The system combines curriculum need, learner evidence, exam timing, realistic available time and bounded preferences to recommend the most useful next action.

These forms of intelligence should reinforce one another rather than create separate product silos.

## Learner-facing course model

Within a course, the primary focused learner jobs are:

- **Learn** — help me understand this;
- **Practice** — help me test and improve what I know; and
- **Exam Prep** — help me perform in the real exam.

These sections are different routes into one underlying curriculum/evidence model. A topic or knowledge/skill node must not become a different academic identity merely because the learner reaches it through a different activity type.

### Learn

Learn contains the explanations, notes, worked examples, visual material, formulas, relationships, misconceptions and other learning formats justified by the Course Knowledge Model and Learning Blueprint.

Meaningful use of Learn may update a `Reviewed`/content-exposure signal, but Learn completion does not itself establish mastery or Exam Readiness.

### Practice

Practice may include flashcards, retrieval, quizzes, calculations, application/case work, topic tests, mixed tests, practice questions and other validated techniques.

Practice types are alternative techniques rather than mandatory completion lanes. A learner should not have to use every available format to demonstrate knowledge. Each practice format should cover the full relevant curriculum scope that the format can validly assess, and its results should update the same underlying knowledge/skill evidence model.

A format may provide evidence only for what it can genuinely test. For example, flashcards can provide strong recall evidence but cannot by themselves prove extended evaluation, complex applied reasoning or other skills they do not validly assess.

### Exam Prep

Exam Prep includes targeted exam-question work, timed practice, exam technique, full-paper/component practice, trusted Revision mock examinations and the Exam Simulator where supported.

Exam Prep evidence should normally carry the strongest weight in Exam Readiness because it most directly represents performance under authentic assessment demands.

## Three distinct dimensions

Revision should not collapse all progress into one score. It should distinguish at least three dimensions:

### Reviewed / coverage

Has the student meaningfully encountered or revised the relevant material?

This is primarily an orientation signal. It helps the learner see what they have and have not looked at, but it is not an achievement measure.

### Understanding / mastery

What does the available evidence suggest the student currently understands, can recall and can use?

### Exam readiness

Can the student apply that knowledge and skill effectively under exam-style conditions, including realistic questions, timing and mark expectations?

These dimensions are related but not interchangeable. A student can have reviewed a topic without mastering it, understand content without yet demonstrating exam readiness, or demonstrate strong performance despite not having consumed all Revision Learn content.

Revision must not penalise a learner for unreviewed Learn material when stronger evidence already demonstrates the relevant knowledge/skill. Conversely, reviewing all Learn material must not compensate for weak performance evidence.

## Exam Readiness as the primary performance signal

Learner-facing course and topic progress should treat **Exam Readiness** as the primary demonstrated-performance signal and `Reviewed` as a secondary content-exposure signal.

Exam Readiness should be updated from validated Practice and Exam Prep performance, weighted by the strength, breadth, recency and assessment relevance of the evidence. Different activity types are not automatically equivalent evidence.

The readiness judgement and Revision's confidence in that judgement are separate. Narrow or stale evidence may justify a promising provisional judgement while still leaving low confidence in its breadth. The product should explain this in plain English and avoid unsupported precision.

## Structured learner memory

Revision should preserve useful educational context as structured learner state rather than treating an unlimited conversation transcript as the learner model.

Structured learner memory may include, subject to the applicable evidence, privacy and product rules:

- active courses, qualification and exam-board context;
- specification/topic structure relevant to the learner;
- Reviewed/content-exposure state;
- understanding/mastery evidence with provenance, recency and confidence;
- exam-readiness evidence with provenance, recency and confidence;
- repeated misconception or error patterns where supported by sufficient evidence;
- evidence that may be stale or worth checking again;
- recent meaningful assessment feedback;
- relevant upcoming assessments and current plan priorities;
- bounded learner preferences that improve support; and
- concise conversation context needed for immediate continuity where appropriate.

Different memory classes must retain their meaning. For example:

- learner preference is not mastery evidence;
- Learn completion is not Exam Readiness evidence;
- a conversation statement is not automatically an objective fact;
- a single wrong answer is not automatically a durable misconception;
- self-reported outside revision may inform planning but does not create objective readiness; and
- starting-check evidence remains low-strength directional evidence under its separate rules.

Structured learner memory should be permissioned, inspectable or explainable where appropriate, data-minimised and governed by Revision's privacy and safeguarding rules.

## Evidence sources

The model may use evidence from activities including:

- quizzes;
- active recall and flashcards;
- calculations and other skill drills;
- topic and mixed tests;
- practice questions;
- exam-style questions;
- timed practice;
- full or simulated papers; and
- other validated learning interactions introduced later.

Assessment should not only produce a score. Where practical it should provide feedback that helps the student understand mistakes and improve.

All scored Practice and Exam Prep assets should map back to the relevant curriculum knowledge/skill nodes so results can update the same learner model regardless of the activity format used.

## Directional starting-check evidence

When Revision has little or no Student-specific evidence for a newly added course, it may use a deliberately short **starting check** to improve the first recommendation.

Starting-check answers are a distinct, low-strength evidence class. They may provide a **directional signal** about what is worth investigating or revising first, but they are not equivalent to ordinary scored Practice evidence.

A starting-check answer may:

- influence the immediate first recommendation;
- identify a sampled area that is worth investigating next;
- provide context for a cautious explanation of why Revision chose that starting point; and
- remain available for later calibration of the starting-check feature.

Starting-check evidence must **not by itself**:

- mark a topic as reviewed or covered;
- establish understanding, proficiency or mastery;
- create or increase a readiness score;
- count towards the minimum evidence threshold for readiness;
- create an estimated-grade or on-track claim; or
- permanently label a Student as strong or weak in a topic.

A correct answer means only that the Student answered that sampled item correctly. An incorrect answer is a provisional reason to investigate that sampled area, not proof of a broad weakness.

Implementation must preserve explicit starting-check provenance so these observations cannot become indistinguishable from ordinary Practice evidence merely because the question format is the same.

Later normal Learn, Practice and Exam Prep evidence may confirm, weaken or overturn the initial directional signal. Once stronger evidence exists, normal evidence and recency rules govern subsequent recommendations.

The initial starting-check selection and recommendation logic should be deterministic and testable rather than delegated to an LLM.

## Activity completion and reconciliation

Revision should infer completion from reliable product activity wherever possible rather than asking the student to maintain a manual task list.

Where REV recommends an in-product activity and the learner follows that recommendation into the activity, Revision should retain the recommendation-to-activity link. When the activity reaches a reliable completion state, the system should record that the recommended work was completed and use any resulting valid evidence automatically.

A click-through alone must not be treated as completion where the activity has a meaningful completion event. The product should distinguish recommendation exposure, activity start, meaningful engagement and activity completion so product metrics do not overstate useful engagement.

Activity completion is not itself educational achievement. Revision must not create a completion tax in which a learner has to consume all Learn content or complete every Practice format to improve a performance indicator. Where stronger existing evidence already demonstrates the intended outcome, the planner should be free to prioritise other work.

At an appropriate return point, Revision may use a very short reconciliation interaction. This should primarily:

- confirm what Revision already inferred where confirmation is useful;
- let the learner add meaningful revision completed outside Revision; and
- correct obvious gaps without turning the student into a time-sheet administrator.

Reconciliation must be lightweight, skippable where appropriate and designed to improve the next recommendation rather than police compliance.

External self-report is planning/context evidence and must not directly create objective mastery or readiness claims.

## Weakness Repair

When reliable evidence exposes a meaningful weakness or recurring misconception, Revision should prefer improvement over passive labelling.

Where the applicable activity and evidence support it, the desired loop is:

**detect → explain → repair → retest → update the evidence → decide what matters next.**

This means:

- feedback should explain the educational meaning of the result before overwhelming the learner with detail;
- the learner should be offered a direct route into an appropriate explanation, worked example, recall activity, related practice or exam-style retry;
- repair activity should generate its own evidence rather than automatically clearing the weakness because content was viewed;
- subsequent evidence may confirm improvement, show that the issue remains, or reveal that the original interpretation was too strong; and
- the wider learner model and future recommendations should update accordingly.

Revision must not create punitive mistake lists, overreact to isolated errors or claim a weakness is permanently fixed from one successful retry.

## Evidence recency and adaptive recall

Understanding can become uncertain over time. Where supported by evidence rules, Revision should be able to distinguish strong recent evidence from older or stale evidence and use that distinction when deciding whether recall is worthwhile.

Adaptive recall should integrate with the wider planner rather than become a competing flashcard schedule.

A future retrieval system may consider factors such as:

- previous recall performance;
- evidence recency and confidence;
- topic importance and specification coverage;
- exam proximity;
- existing strengths and weaknesses; and
- competing priorities across the learner's programme.

The desired outcome is not endless repetition. It is to resurface knowledge when checking it again is a useful use of limited revision time.

Self-rated recall remains weaker evidence than objective scored evidence unless separately validated and governed otherwise.

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

- current Reviewed, understanding and exam-readiness evidence;
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

Recommendations should be understandable rather than opaque. REV should be able to explain material reasons such as limited evidence, demonstrated weakness, stale evidence worth checking, assessment proximity, known exam weighting/mark opportunity, already-strong material or a realistic improvement opportunity.

Where the learner has not reviewed some Learn content but already has strong, representative evidence for the same knowledge/skill, REV should be able to recommend spending time elsewhere rather than forcing content completion.

The product must not expose false-precision internal priority scores or promise precise additional marks unless evidence and claims authority support such a claim.

## AI tutor role

The AI tutor should use the student's broader structured revision state to provide personalised support and guidance.

It should be able to:

- recommend useful next actions;
- explain why an area deserves attention;
- answer questions in the context of the student's subject and specification;
- adapt explanations using relevant evidence about what the learner currently appears to understand;
- help interpret assessment feedback;
- help move from a detected weakness into an appropriate repair activity;
- explain important plan changes;
- discuss learner preferences and negotiate short-term priorities;
- encourage the student when progress is good;
- respond constructively when the learner is struggling or time is constrained; and
- help the student stay calm and focused on what is most useful now.

The AI tutor should not calculate the deterministic planner priority order itself.

REV should use structured learner state and bounded relevant context rather than depend on replaying unlimited raw conversation history. Conversation can create candidate context or preferences where appropriate, but conversational claims must not silently become objective educational evidence.

The tutor should not manufacture urgency from isolated weak evidence or imply failure because a previous recommendation was not followed.

## Student agency

Revision should provide strong guidance, not a locked pathway.

The student must remain free to ignore a recommendation and choose a different subject, topic or activity.

The student may also discuss a deliberate short-term preference with REV. Where reasonable, the plan may adapt around that preference while REV preserves the wider cross-subject view and explains material consequences.

The product should not require the learner to manage recommendations by manually moving tasks to another day. What the learner actually chooses to do becomes additional context for the next recommendation and wider adaptive plan.

Student choices should not be treated as product failure simply because the system recommended something else.

## Desired outcome

The system model succeeds when the complexity of balancing subjects, Reviewed state, understanding, forgetting risk, misconceptions, exam readiness, exam dates, available time, learner preferences and exam preparation is handled largely behind the scenes, leaving the student with a simple answer to the question:

**What is the most useful thing for me to do next, and why?**

The governing strategic context for this system model is `00-company-foundation/Product Strategy.md`.

## Documentation impact

This v0.7 clarification aligns the learner evidence model with the three focused course jobs, establishes Exam Readiness as the primary demonstrated-performance signal, and explicitly prevents content/activity completion from becoming a performance gate. It must remain aligned with Claims and Progress Governance, Information Architecture, Core User Journeys and Content Factory authority.