# FI-001 — Planner Decisions 18–20 Addendum

**Status:** Exploring — Founder decisions captured; not yet promoted to normative authority  
**Feature:** FI-001 Intelligent Exam Calendar / Adaptive Revision Planner  
**Owner:** Product  
**Captured:** 2026-08-19  
**Relationship:** Companion decision record to `FI-001 Adaptive Revision Planner Product Definition.md`. Consolidate into the main product definition before promotion.

> This addendum records approved product decisions while FI-001 is still being defined. It does not itself override normative authority.

## D18 — Recalculate on meaningful triggers, plus a quiet daily check

The planner should recalculate when something meaningful changes and should also perform a quiet daily review to decide whether the current plan still makes sense.

Meaningful triggers include, at minimum:

- new learning or assessment evidence that materially changes the learner state;
- reliable completion of a recommended or self-selected activity;
- a material change to exam date, assessment scope or relative importance;
- a change to realistic availability;
- meaningful self-reported external revision where that changes planning context; and
- another product event that materially changes the priority calculation.

The daily check should compare the current plan with the latest learner state, remaining time, availability and assessment context, and only change the plan where there is a useful reason.

The planner should not churn after every minor click or interaction. Recalculation and learner notification are separate concerns: the engine may update silently while REV only explains or surfaces a change when that change is materially useful to the learner.

## D19 — Recommendations must explain their evidence and opportunity

Revision should be clear about why it is recommending one subject, topic or activity over another, particularly when time is constrained.

Useful reasons may include:

- Revision has little or weak evidence for an important topic;
- recent answers or assessment evidence indicate a weakness;
- an assessment is closer or more important;
- a topic or question type has greater exam weighting or broader mark opportunity;
- the learner is already strong in an area, making more repetition lower value;
- exam-style practice is more useful than passive review at the learner's current stage; or
- the proposed activity is a realistic area for improvement in the time available.

Revision must not imply guaranteed marks or precise score gains without evidence strong enough to support such a claim. Explanations should distinguish exam weighting/opportunity from certainty of outcome.

The learner remains free to disagree and choose different work. Choosing differently should feed the next plan recalculation rather than be treated as non-compliance.

## D20 — REV can negotiate temporary learner priorities while preserving the whole-programme view

The learner should be able to discuss planning preferences naturally with REV, for example:

- `I want to focus more on Spanish this week.`
- `I want to spend today on Business.`
- `Can we do more essay practice for a few days?`
- `I know you are recommending this topic, but I want to review another one first.`

REV should listen, discuss and advise rather than simply accept every instruction or refuse to adapt.

A learner preference may legitimately change the short-term shape of the plan. For example, Revision may support a heavier Spanish week now and compensate with more Business work later where the overall assessment picture and remaining capacity make that reasonable.

Before applying a material preference, REV should use the whole-programme view to explain relevant consequences. It should make clear, in simple language, what the choice means for competing subjects, assessments, remaining coverage and available time.

Where the preference is compatible with a healthy overall plan, Revision should adapt without unnecessary friction.

Where the preference creates a material trade-off, REV should explain it and allow an informed choice. For example:

> `We can give Spanish more time this week. Business is currently in a stronger position, so that is reasonable. I will bring Business back up next week.`

or:

> `We can focus on Spanish, but your Business test is also close and I have less evidence on Operations. If we move all of today's Business time, that area will need more attention later.`

The product should not force the learner to follow Revision's preferred plan merely because the algorithm ranked it highest.

Equally, learner preference must not silently make the wider programme invisible. Home, Plan, Progress and REV should continue to preserve an understandable cross-subject view so the learner can see where they stand overall.

The planner therefore combines three inputs:

1. evidence-based product recommendations;
2. the learner's deliberate priorities and real choices; and
3. the wider constraints across all relevant subjects, assessments and available time.

The operating principle is:

> **REV listens and adapts, but keeps the whole picture visible.**

A learner's expressed preference is planning context, not objective evidence of mastery or readiness. It may change allocation and sequencing, but must not directly improve progress/readiness judgements.

## Promotion impact

Before FI-001 implementation, these decisions should be consolidated into the main FI-001 product definition and promoted into the relevant normative authority, including Product System Model, Core User Journeys, Information Architecture where applicable, REV experience rules, evidence/claims governance and technical planner design.