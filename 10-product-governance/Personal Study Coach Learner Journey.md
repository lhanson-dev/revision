---
title: "Personal Study Coach Learner Journey"
document_id: "revision-personal-study-coach-journey"
document_type: "domain-authority"
authority: "product"
status: "draft"
version: "0.1"
owner: "Founder"
effective_date: null
last_reviewed: "2026-08-17"
review_cadence: "quarterly"
content_review_status: "founder-review-required"
source_of_truth_for: ["personal study coach learner journey"]
depends_on: ["Personal Study Coach Capability", "Product UX Principles", "Tone of Voice Framework"]
supersedes: null
---
# Personal Study Coach Learner Journey

## Journey goal

Help the learner move from uncertainty or indecision to a useful, active learning step without taking control away from them.

## Entry points

### Study start

After authentication, the normal learner home remains available. A non-blocking coach card may say:

> Hi Jamie. What would help today?

Actions:
- **Guide me**
- **I’m stuck on something**
- **Continue where I left off**
- **Not now**

A greeting must not imply the coach knows how the learner feels. “How are you doing today?” may be used only as an optional social greeting and must not trigger wellbeing inference or profiling.

### Persistent support

A consistently placed **Study Coach** control opens contextual support from ordinary learning routes. The control must not cover essential content or controls.

### Contextual invitation

Revision may offer help after a meaningful signal such as repeated misconception evidence or an abandoned activity. It must state the observed reason and remain dismissible. It must not interrupt timed or focused work.

## Journey A — learner chooses the topic

1. Learner opens Study Coach.
2. Coach invites a question in ordinary language.
3. Learner describes the problem.
4. Coach identifies the active module and likely topic.
5. If ambiguity would materially change the explanation, the coach asks one short diagnostic question.
6. Coach gives a concise grounded explanation.
7. Coach asks the learner to recall, distinguish, calculate or apply the idea.
8. Learner responds.
9. Coach gives specific feedback and corrects misconceptions.
10. Coach offers a next action and explains why.
11. Valid learner performance may be submitted to the evidence service; the conversation itself is not evidence.

Example:

> **Jamie:** I really don’t get how supply chains work.  
> **Study Coach:** I’ve got you. A supply chain is everything involved in getting a product from its raw materials to the customer. Which part is hardest: who is involved, how goods move, or why supply-chain decisions affect a business?

## Journey B — learner asks to be guided

1. Learner selects **Guide me**.
2. Coach retrieves the minimum relevant learning-evidence summary.
3. Coach determines whether evidence is sufficient for a recommendation.
4. If sufficient, it proposes one priority and explains the evidence, confidence and expected benefit.
5. If insufficient, it says so and offers a brief diagnostic choice.
6. Learner accepts, changes the topic or dismisses the suggestion.
7. Revision launches the selected activity with the coaching context preserved.
8. Completion and valid performance return to the evidence stream.
9. Coach summarises what changed and proposes the next reasonable step.

Example:

> Your recent answers suggest you can define contribution but find it harder to use contribution in decisions. That is based on two questions, so the evidence is still limited. Shall we try one short case question?

## Journey C — contextual help during learning

1. Learner opens the coach from a topic or activity.
2. Coach receives only the necessary context: module, topic, activity type and permitted help level.
3. Coach acknowledges the current task.
4. It provides an explanation, hint or scaffold appropriate to that help level.
5. Learner returns to the activity without losing their work.
6. Any assisted result is labelled appropriately so assistance is not mistaken for independent mastery.

## Journey D — protected assessment or exam

1. Learner opens Study Coach during a scored or exam-mode attempt.
2. Coach explains that giving the answer would invalidate the attempt.
3. It may provide neutral operational help that does not reveal subject answers.
4. Learner may return to the attempt, submit/end the attempt and then review, or leave under the assessment’s existing rules.
5. After submission, the coach may explain errors using approved content and assessment guidance.
6. Independent and assisted performance remain distinguishable.

## Journey E — close and return

At any point the learner may:
- close the coach without losing their current work;
- start a new conversation;
- clear permitted conversation history;
- inspect why a recommendation was made; or
- continue without the coach.

The coach must not repeatedly reopen itself after dismissal within the same study context.

## Response pattern

Unless the learner asks for a different format, coaching turns should prefer:
1. brief acknowledgement;
2. one clear explanation or question;
3. an example only where useful;
4. an active learner step; and
5. feedback plus next action.

The coach should not overload the learner with an explanation, quiz, exam technique and progress report in a single turn.

## Assistance levels

| Context | Permitted default support |
|---|---|
| Topic learning | Full explanation, examples, questions and feedback |
| Recall practice | Prompt or hint first; explanation after learner attempt |
| Ordinary practice question | Scaffold and analogous example; protect the direct answer until attempted |
| Scored test | No answer-revealing help; allow exit then review |
| Timed exam simulation | Operational help only until submission or formal exit |
| Results review | Full feedback grounded in the learner response and approved marking guidance |

## Failure and uncertainty states

### Missing grounding

> I can explain the general idea, but I cannot verify the course-specific detail from your Revision material right now. Let’s avoid treating it as an exam-ready answer.

### Insufficient learner evidence

> I don’t have enough evidence to identify your weakest area reliably yet. We can run a short check or you can choose a topic.

### Service unavailable

The learner’s normal revision experience must remain usable. Revision explains that the coach is temporarily unavailable and preserves any unsent learner text locally only where approved.

### Safety boundary

When a message falls outside safe study support, the coach responds according to the approved safeguarding policy and does not improvise a hidden clinical or disciplinary judgement.

## Acceptance criteria for initial release

- Each entry point is dismissible and usable at supported viewport classes.
- Topic explanations identify and use the active approved content version.
- **Guide me** never claims a weakness without sufficient evidence and a visible rationale.
- At least one active learner check follows substantive explanations unless the learner declines.
- Coach messages alone never create mastery/readiness evidence.
- Assisted and independent learner performance remain distinguishable.
- Protected assessment modes prevent answer leakage.
- The learner can close the coach without losing activity state.
- Privacy and history controls are available before any conversation is persisted.
- Failure of the AI service does not block core revision journeys.
