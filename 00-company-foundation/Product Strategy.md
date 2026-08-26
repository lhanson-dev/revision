---
title: "Revision Product Strategy"
document_id: "revision-product-strategy"
document_type: "founder-strategic-authority"
authority: "company-foundation"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-26"
last_reviewed: "2026-08-26"
source_of_truth_for: ["product strategic thesis", "personalised revision intelligence", "bootstrap product allocation rules", "strategic sequencing and differentiation"]
depends_on: ["Founder Doctrine", "Strategic Positioning", "Product Promise", "Product Principles", "Product System Model"]
---
# Revision Product Strategy

## Purpose

Define the strategic product thesis Revision should use to choose what to build, how capabilities should reinforce one another, where AI creates real advantage, and how a bootstrapped company should allocate scarce product and engineering effort.

This strategy is normative product direction. It does not by itself make an individual backlog item `Ready` for implementation. Material features must still follow the governed feature lifecycle and Definition of Ready.

## Strategic thesis — Personalised Revision Intelligence

Revision should not compete as a generic AI revision website or as a toolbox containing the largest number of disconnected study features.

Revision should build **Personalised Revision Intelligence**: a revision system that knows the learner's curriculum, progressively learns what the learner knows and does not yet know well enough, understands their exam context and available time, and uses that understanding to decide what will be most useful next.

The student-facing proposition is:

> **Revision knows what you're studying, learns what you know, works out what matters next, and helps you improve it.**

General-purpose AI can answer an isolated question. Revision should become more valuable as the learner uses it because useful interactions improve its structured understanding of the learner and therefore improve future teaching, practice, feedback and recommendations.

## Core product mantra

> **Revision should know the student better after every useful interaction.**

This does not mean collecting data for its own sake. A useful interaction should either help the learner directly, create reliable educational evidence or planning context that can improve later support, or both.

Low-quality behavioural signals must not be promoted into educational truth merely because they are easy to collect. Evidence provenance, strength, recency and confidence remain governed by the relevant product and evidence authorities.

## The compounding learner loop

The strategic product flywheel is:

**REV recommends → learner learns → learner practises → Revision observes evidence → feedback explains meaning → learner improves → learner model updates → REV makes a better recommendation.**

The product should be designed so that Learn, Practice, Exam Prep, REV, Progress and Plan are not separate destinations competing for attention. They are different parts of one adaptive learning system.

A feature is strategically stronger when its output becomes useful input to the rest of this loop.

## Four intelligence layers

Revision's product advantage should compound across four connected layers:

### 1. Curriculum intelligence

Revision knows the correct qualification, exam board, specification structure, applicable assessment components and governed educational content.

### 2. Learner intelligence

Revision builds an evidence-aware picture of what the learner has covered, what they currently appear to understand, recurring misconceptions, stale or uncertain knowledge, exam-technique patterns and relevant learning preferences.

### 3. Exam intelligence

Revision distinguishes knowing content from being able to apply it in realistic exam conditions. Exam questions, marking, timing, assessment objectives and paper context should improve the learner's exam-readiness picture rather than sit in a disconnected practice area.

### 4. Planning intelligence

Revision combines curriculum need, learner evidence, exam timing and realistic available time to answer the question:

**What is the most useful thing for me to do next, and why?**

These four layers should reinforce one another. A feature that generates activity without improving learning, evidence or guidance should be challenged.

## REV's strategic role

REV is not a generic chatbot attached to Revision.

REV is the learner-facing tutor and study coach through which Revision can use the wider structured learner and curriculum model conversationally and proactively.

REV should increasingly be able to understand the learner's current course, topic, recent evidence, mistakes, exam context and plan; explain concepts in that context; interpret feedback; help repair a weakness; and explain why Revision recommends a particular next action.

Persistent value should come from structured, permissioned educational memory and learner state rather than replaying an unlimited chat transcript. Conversation history may support immediate continuity, but raw chat history is not the strategic learner model.

## Signature product behaviours

### Context-aware REV

The tutor should know enough relevant context that the learner does not repeatedly need to explain what they study, what they have already done or why they are asking a question.

This strategic behaviour is delivered through the existing **FI-003 — Full REV Intelligent AI Tutor**, not through a competing chatbot feature.

### Weakness Repair

Revision should not merely identify or display weaknesses. Where evidence supports a meaningful gap or misconception, the preferred loop is:

**detect → explain → repair → retest → confirm or revise the evidence → decide what to do next.**

A learner should be able to move directly from useful feedback into improvement without being forced to navigate away and work out what to do.

Existing **FI-010 — Weakness-Driven Targeted Tests** and **FI-011 — Misconception Recovery / Wrong-Answer Mode** are the principal backlog candidates for this behaviour and should be analysed as parts of one coherent repair loop rather than isolated practice utilities.

### Adaptive Recall / Forgetting Intelligence

Revision should not build a generic flashcard destination merely to match competitors. It should use evidence, recency, confidence, importance, exam proximity and competing priorities to decide which knowledge is worth retrieving again.

The intended pattern is:

**learn or demonstrate understanding → evidence becomes stale or uncertain → useful recall is resurfaced → new evidence refreshes the learner model → future priorities update.**

This strategic behaviour maps to **FI-009 — Adaptive Retrieval / Spaced Repetition**.

### Evidence-linked exam improvement

Exam marking should do more than return a mark. It should help explain why marks were earned or lost, identify recurring topic or assessment-objective patterns where evidence supports them, route the learner into useful improvement and update the wider readiness picture.

This strategic behaviour maps to **FI-007 — Assisted / AI Exam-Answer Marking** and the governed Exam Prep / Exam Simulator system.

## Learn and Practice strategy

Learn should increasingly adapt around what the learner needs to understand rather than becoming a static content library. A useful pattern may move between concise explanation, examples, another explanation where needed, checking understanding and targeted support from REV.

Practice should be evidence-generating and improvement-oriented. A result should explain what matters before detail and, where a weakness is exposed, provide a direct route to improve it.

The strategic objective is not dynamic AI generation everywhere. Governed structured content should remain the reliable base; AI should be used where explanation, interpretation, dialogue or personalised feedback materially improves the learner outcome.

## Bootstrap product allocation rule

Revision is being bootstrapped. Scarce founder, engineering, content and AI spend must therefore compound rather than create feature breadth for its own sake.

A proposed investment should be challenged unless it materially strengthens at least one of:

1. the learner model or quality of educational evidence;
2. the learner's understanding, retention or exam performance;
3. the quality and clarity of the next useful recommendation;
4. repeat use, retention or willingness to pay through genuine learner value;
5. scalable curriculum/content coverage without proportional manual effort;
6. sustainable distribution; or
7. sustainable product economics.

Competitor parity alone is not a sufficient reason to build a feature.

## Deterministic intelligence before unnecessary AI

Revision should use the least costly mechanism that reliably produces the required educational outcome.

Deterministic and testable logic should normally own tasks such as:

- evidence aggregation and confidence rules;
- progress/readiness calculation;
- recommendation ranking and adaptive planning;
- retrieval scheduling where rules can be made reliable;
- exam/date arithmetic;
- entitlement and allowance decisions; and
- other rule-based product behaviour.

Generative AI should be used where generation, interpretation or conversation creates material learner value, including suitable uses such as:

- contextual explanation and alternative explanation;
- Socratic or scaffolded tutoring;
- interpreting feedback;
- appropriately validated free-text answer marking;
- answering learner questions in curriculum context; and
- personalised coaching conversation.

Using AI because a model call is easy is not product strategy. AI should change the learner outcome enough to justify its educational, safety, latency and cost burden.

## Strategic sequence

Revision should sequence product maturity roughly through these proof points rather than attempting competitor feature breadth all at once:

1. **Nail the learning loop** — Learn → Practice → feedback → improve must create obvious student value.
2. **Make REV contextually useful** — prove that knowing curriculum and learner state makes REV materially better than generic AI.
3. **Deepen structured learner memory** — make useful interactions compound into better future support.
4. **Own exam improvement** — connect exam questions, marking, feedback, repair and readiness.
5. **Add adaptive recall** — intelligently resurface knowledge at risk of becoming stale.
6. **Monetise intelligence sustainably** — use the approved Free / Paid / Premium ladder without corrupting educational truth.
7. **Create parent/supporter value** — reassurance and support insight within the governed privacy boundary.
8. **Scale curriculum coverage** — use Content Factory and reusable product surfaces rather than subject-specific forks.
9. **Use teacher/school capability selectively for distribution** — only after the direct learner proposition is proven and without becoming an LMS.
10. **Add advanced REV interaction modes** — such as richer multimodal or voice support only where value and economics justify them.

This is strategic sequencing, not a fixed calendar. Evidence may change the order, but moving effort into a later breadth feature should carry an explicit opportunity-cost argument against the earlier compounding system.

## Deliberate strategic de-prioritisation

Revision should not chase the following merely because competitors offer them:

- a social feed or student messaging system;
- leaderboards, virtual currency or engagement mechanics that create pressure rather than useful momentum;
- a large unmoderated community-content marketplace;
- a broad generic homework solver;
- a toolbox of disconnected AI utilities;
- a full school learning-management system;
- native applications before responsive web has proved insufficient;
- real-time multiplayer or live-class mechanics before learner value and distribution justify the complexity;
- AI-generated media libraries for their own sake; or
- voice/multimodal interaction before the core tutor intelligence is useful without them.

A de-prioritised capability may later become worthwhile when evidence, distribution or economics changes. It does not become forbidden unless another authority explicitly makes it a red line.

## Commercial strategy relationship

Revision should preserve the governed commercial ladder:

- Free demonstrates the real intelligent Revision proposition;
- Paid provides the complete serious self-service system; and
- Premium should eventually provide a qualitatively deeper personalised REV/tutor experience where higher intelligence and variable cost justify it.

Usage controls should be designed from learner value and cost-to-serve rather than copied from competitor credit systems. Internal cost-weighted allowance accounting remains preferable to pretending every AI interaction costs the same.

## Competitive-learning rule

Competitors are evidence about student needs, market expectations, distribution and possible solutions. They are not product authority.

Revision should learn from the **job a competitor feature solves**, then ask whether Revision can solve that job more effectively through its connected learner model and adaptive loop.

The preferred question is not:

> What feature do they have that we need?

It is:

> What student problem are they solving, and how can Revision solve it in a way that becomes more useful because we know the curriculum and the learner?

## Decision test

Before promoting a material feature, ask:

1. Does this make Revision know something useful and reliable about the learner, or use existing learner knowledge better?
2. Does it improve learning, retention, exam readiness or the clarity of the next action?
3. Does it strengthen the connected revision loop rather than create an isolated tool?
4. Can a simpler deterministic mechanism achieve the same outcome more cheaply and reliably?
5. Is the implementation proportionate for a bootstrapped company?
6. Does it create genuine Free, Paid or Premium value without artificial degradation?
7. Is its opportunity cost better than strengthening the core learner-intelligence loop?

If the answer is weak across these tests, the feature should normally be deferred even if a competitor already ships it.

## Backlog relationship

The canonical Product Feature Backlog remains the inventory and lifecycle source for individual product capabilities. This strategy does not silently promote backlog items to `Ready` or implementation.

The strategy-to-backlog mapping is recorded in `10-product-governance/backlog/Personalised Revision Intelligence Strategy Mapping.md` so the strategic bets remain visible without duplicating feature ownership.

## Change and documentation rule

Material changes to this strategic thesis, the core compounding loop, bootstrap allocation rule or strategic sequencing require a Founder-approved governed change.

When a strategic capability is promoted into concrete product behaviour, update the relevant product authority and backlog lifecycle record in the same governed change. Implementation detail belongs in code and technical documentation after the feature has achieved the required human-approved `Ready` state.
