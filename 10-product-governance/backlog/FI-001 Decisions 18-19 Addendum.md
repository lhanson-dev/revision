# FI-001 — Decisions 18–19 Addendum

**Status:** Exploring — Founder decisions captured; not yet promoted to normative product authority  
**Feature:** FI-001 Intelligent Exam Calendar / Adaptive Revision Planner  
**Parent definition:** `10-product-governance/backlog/FI-001 Adaptive Revision Planner Product Definition.md`  
**Captured:** 2026-08-19

> This addendum records approved Founder decisions while FI-001 remains in product definition. It does not override normative authority. It must be consolidated into the FI-001 product definition and promoted into the relevant authorities before implementation.

## D18 — Event-triggered replanning plus a daily check

The adaptive planner should recalculate when meaningful new information could change the best use of the learner's remaining time, and should also perform a quiet daily check before presenting the current day's plan.

Meaningful triggers include:

- new assessment or learning evidence;
- reliable activity completion or meaningful engagement evidence;
- a material change in learner availability;
- an assessment date, scope or importance change;
- meaningful self-reported revision completed outside Revision;
- a material learner choice that changes what has actually been worked on; and
- other deliberately defined state changes that can materially affect prioritisation.

The system should not continually churn the learner-facing plan after insignificant interactions. Recalculation and communication are separate concerns: the engine may update silently, while REV should explain or notify the learner only when a change is material enough to help them act or understand what matters.

A daily planner check should reconcile the latest known learner state, remaining time, assessment context and current priorities even when no explicit event has occurred.

## D19 — Recommendations must be explainable and remain overridable

Revision should make a clear recommendation about the best current use of time, including when the learner is in an insufficient-capacity / prioritising state, but the learner remains free to choose different work.

The product must make the important reasons behind a recommendation easy to understand. Relevant reasons may include:

- little or no reliable evidence for an important topic;
- repeated evidence that understanding or exam readiness is weaker in an area;
- an assessment being closer or more important;
- an area representing a larger proportion of the assessment or a higher mark opportunity because of known exam structure or question weighting;
- a topic or task being prerequisite to other useful work;
- evidence that the learner is already relatively strong in another area, making additional repetition lower value;
- the need to move from learning into exam-style practice as an assessment approaches;
- a task offering a realistic improvement opportunity within the time available; and
- competing subject priorities and the learner's remaining realistic capacity.

Explanation should be concise and student-facing rather than exposing an internal priority score or algorithmic weighting. REV should be able to answer natural questions such as `Why are you suggesting this?`, `Why not this topic?`, and `What happens if I work on this instead?`

The planner should not claim that a task will produce a specific number of additional marks unless the evidence and claims governance genuinely support that precision. It may explain a higher **mark opportunity** where that conclusion is grounded in known assessment structure, weighting and the learner's current evidence.

If the learner chooses different work, Revision should not treat that choice as failure or require manual rescheduling. The activity becomes part of the learner's actual state and the planner recalculates accordingly.

The product principle is:

> **Revision recommends clearly. The student chooses freely. Revision explains why and recalculates from reality.**

## Promotion impact

Before implementation, these decisions should be consolidated into the main FI-001 product definition and reflected where appropriate in:

- `10-product-governance/Product System Model.md`;
- `10-product-governance/Core User Journeys.md`;
- `20-brand-and-experience/Tone of Voice Framework.md` or related experience authority where additional recommendation-language rules are needed;
- `40-evidence-and-trust/Claims and Progress Governance.md` for claim-strength alignment; and
- technical planner design, analytics and assurance documentation.
