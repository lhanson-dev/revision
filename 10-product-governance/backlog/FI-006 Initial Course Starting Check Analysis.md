# FI-006 — Initial Course Starting Check / Periodic Knowledge Check-in — Analysis Record

**Document type:** product-management working record  
**Authority:** non-authoritative Definition-of-Ready analysis  
**Feature:** FI-006  
**Lifecycle state:** Analyse  
**Analysis started:** 2026-08-24  
**Owner:** Product / Founder  
**Implementation status:** Not started — material production implementation is prohibited until explicit human-approved `Ready` status.

## Lifecycle evidence

FI-006 is already `To Do` because baseline/diagnostic assessment is part of Revision's approved Understand capability and the Founder previously confirmed that an initial broad knowledge check belongs in the product.

On 24 August 2026 the Founder instructed the agent to continue the GJ-01 implementation-readiness work. FI-021 identifies FI-006 as the critical evidence dependency for the accepted Student first-use journey. Active Definition-of-Ready analysis therefore begins here and FI-006 moves `To Do → Analyse`.

This does **not** constitute `Analyse → Ready` approval and does not permit production implementation.

## Governing context

Read together:

- `10-product-governance/Product System Model.md`;
- `10-product-governance/Core User Journeys.md`;
- `40-evidence-and-trust/Evidence Trust and Educational Integrity.md`;
- `40-evidence-and-trust/Claims and Progress Governance.md`;
- `20-brand-and-experience/Product UX Principles.md`;
- `60-business-operations/Product KPI Framework.md`;
- `80-company-workflows/Feature Definition and Measurement Workflow.md`; and
- `research/GJ-01 Student Onboarding Screen Contract - 2026-08-23.md` as accepted design evidence rather than normative authority.

The governing product loop is evidence-driven but explicitly distinguishes coverage, understanding/mastery and exam readiness. Stronger claims require stronger evidence and isolated results must not be allowed to overstate a Student's position.

## Current implementation evidence

The current React/Supabase implementation already provides useful foundations:

- course/topic-aligned assured multiple-choice questions in the content packs;
- append-only `learning_evidence` persistence;
- an evidence engine supporting flashcard, multiple-choice, exam-question and exam-attempt sources; and
- deterministic readiness/recommendation logic.

However, the current evidence model treats ordinary `multiple_choice` answers as scored application evidence. The current readiness engine can expose a topic readiness score after six scored attempts across at least two evidence families, provided evidence extends beyond recall.

Therefore **FI-006 must not persist or interpret the short starting check as ordinary multiple-choice readiness evidence**. Five shallow onboarding questions could otherwise contribute materially to a later readiness threshold, which conflicts with the approved evidence/claims rules and with the Founder requirement that the initial quiz must not make a Student appear proficient after only a few answers.

This is the principal technical/evidence constraint for FI-006.

---

# Definition of Ready analysis

## 1. Student problem and target user — PASS

### Target Student

A Student who has just added a supported course and for whom Revision has little or no meaningful course-specific learning evidence.

### Problem

Course identity tells Revision **what** the Student studies but not where useful revision should begin for that individual. Sending every new Student to the same generic starting activity weakens Revision's central promise of intelligent guidance.

At the same time, requiring a large diagnostic before value would create setup friction and falsely imply that a short assessment can comprehensively judge a Student's knowledge.

### Why Revision should solve it

Revision's core product model depends on collecting evidence and using it to recommend the next useful action. A deliberately small starting check can improve the first recommendation while the richer model develops naturally from actual revision activity.

## 2. Strategic case — PASS

FI-006 strengthens the core loop:

`course context → small early signal → first recommendation → useful work → stronger evidence → adaptive guidance`

It differentiates Revision from a static course/content library without requiring a high-friction onboarding assessment.

### Alternatives considered

**Do nothing / recommend the same first topic to everyone** — simpler technically, but fails to demonstrate early personalisation.

**Large comprehensive diagnostic** — could provide more evidence but conflicts with the low-friction first-value journey and increases abandonment risk.

**Ask the Student to self-rate every topic** — low assessment cost but creates subjective confidence data rather than demonstrated knowledge evidence and imposes substantial setup work.

**Recommended:** a short demonstrated-knowledge starting check that is useful only as directional evidence until later work corroborates it.

## 3. User-value hypothesis — PASS

**Hypothesis:** If Revision asks a new Student a short, low-stakes set of representative course questions and uses those answers only as provisional directional evidence, the Student can receive a more relevant first recommendation without materially delaying first useful revision or creating misleading progress/readiness claims.

This is falsifiable through completion/drop-off, time-to-first-useful-activity, recommendation follow-through and later calibration against stronger evidence.

## 4. Experience and simplicity — PASS for MVP

The Founder-reviewed GJ-01 design already establishes the primary experience:

1. course added;
2. explain why a short check helps;
3. `Find my starting point`;
4. about five quick questions;
5. cautious starting recommendation;
6. direct route into the exact recommended useful activity.

### Student-facing language

Use **starting check**, **quick check** or equivalent plain language. Do not present the interaction as a formal diagnostic examination.

Required explanation:

- it is short;
- it does not judge the whole course;
- it gives Revision a better place to begin; and
- Revision will keep adjusting as the Student does more work.

### MVP completion states

- **Completed:** use the directional evidence to select the first recommendation.
- **Partially completed:** use answered questions only where they provide an applicable directional signal; never invent answers for missing questions.
- **Skipped:** continue directly to a deterministic course starter activity rather than sending the Student to generic Home.
- **Interrupted/reload:** preserve completed answers and allow safe resume or skip so the Student is not trapped in onboarding.
- **No eligible assured questions:** fail gracefully to the deterministic course starter activity and record an operational exception; do not generate unassured questions on demand.

### Student agency

The starting recommendation remains guidance. The Student may choose another area after seeing the recommendation.

## 5. Evidence / intelligence model — PASS subject to normative promotion in this PR

### New evidence class: directional starting-check evidence

FI-006 introduces a deliberately weaker evidence class:

**directional starting-check evidence** — demonstrated answers useful for selecting what to investigate or revise first, but insufficient by itself to create or increase coverage, mastery/proficiency, readiness or estimated-grade claims.

This evidence is distinct from normal scored practice evidence even if the underlying question format is multiple choice.

### Required semantics

A starting-check answer may:

- indicate that a sampled area is worth investigating first;
- influence the immediate first recommendation;
- provide context to REV when explaining why the recommendation is provisional; and
- remain available for later analysis/calibration of the starting-check feature.

A starting-check answer must **not by itself**:

- mark a topic covered;
- mark a topic understood, proficient or mastered;
- create or increase a readiness score;
- count toward the minimum evidence threshold for readiness;
- create an estimated grade or on-track claim; or
- permanently label a Student strong or weak.

Later normal learning/practice/exam evidence may confirm, weaken or overturn the initial directional signal.

### Persistence requirement

Implementation must retain explicit provenance that an answer came from the starting check. It must not be persisted as indistinguishable ordinary `multiple_choice` evidence.

The exact storage/schema design is an engineering decision at implementation, but the semantic separation is a product/trust requirement.

### Evidence-strength model

For MVP, each sampled question provides one topic-level directional observation:

- correct → no immediate evidence of difficulty from that sampled item;
- incorrect → provisional reason to investigate that sampled topic;
- unanswered/skipped → no signal.

Do not convert a correct answer into a broad positive topic claim and do not convert an incorrect answer into a durable weakness label.

## 6. REV role — PASS

REV's role is explanatory, not generative or scoring-critical.

REV may say, in substance:

- `You looked less certain here, so this is a useful place to begin.`
- `This is only an early signal — I'll keep adjusting as you do more revision.`

REV must not say that the Student has mastered, failed, is weak at, is ready for, or is likely to achieve a grade based on the starting check.

The sampling and first-recommendation selection should be deterministic/testable product logic rather than an LLM decision.

## 7. MVP boundary — PASS

### Included

- one initial starting check after the first supported course is added in GJ-01;
- normally five short assured multiple-choice questions, each from a distinct sampled high-level course topic where the course contains at least five eligible topics;
- fewer questions where fewer than five eligible distinct topics exist rather than padding the check with repeated shallow questions from the same topic;
- deterministic broad sampling over the course's canonical ordered topic set;
- explicit directional evidence provenance;
- deterministic first-recommendation selection;
- partial, skip, interruption/reload and no-question fallback;
- measurement and assurance required to prove evidence protection and first-value behaviour.

### Deliberately excluded from MVP

- periodic/repeated check-ins;
- adaptive computerised testing or item-response modelling;
- AI-generated diagnostic questions;
- comprehensive syllabus diagnosis;
- learner-facing diagnostic score/percentage;
- topic mastery/proficiency labels from the starting check;
- grade prediction;
- confidence self-rating;
- replacing normal Practice evidence with diagnostic evidence; and
- a separate diagnostic question-authoring pipeline.

The periodic check-in part of the backlog concept remains a later extension and must return through proportionate Definition-of-Ready analysis before implementation.

## 8. Free / Paid / Premium — PASS

The MVP starting check is foundational product behaviour and is available across **Free, Paid and Premium**.

Rationale:

- course context and truthful early guidance are part of Revision's core product proposition;
- evidence semantics must not be weakened by tier;
- withholding the starting check from Free would make the basic adaptive experience less representative and less useful; and
- the interaction has low enough marginal cost when based on assured deterministic question content.

No tier-specific depth or allowance is introduced by FI-006 MVP.

## 9. Upgrade / conversion hypothesis — N/A

FI-006 is not an upgrade mechanism. It should not interrupt first-use value with commercial messaging.

It may contribute indirectly to conversion by demonstrating that Revision can adapt intelligently, but no direct paywall or conversion funnel is part of this feature.

## 10. Measurement contract — PASS

### Primary hypothesis

The starting check should improve the relevance and follow-through of the first recommendation without creating unacceptable onboarding abandonment or false progress/readiness.

### Required funnel

At minimum distinguish:

`eligible → offered → started → answered/partial → completed or skipped → recommendation shown → recommended activity started → first useful activity completed`

### Core measures

**Adoption**
- percentage of eligible Students who start the check;
- completion rate;
- skip rate;
- partial/interrupted rate.

**Useful engagement**
- recommendation-to-activity start rate;
- first useful activity completion rate;
- time from course added to first useful activity start/completion.

**Student/product value**
- recommendation override rate;
- continued revision after the first activity;
- later calibration: whether topics selected from an incorrect starting-check response subsequently receive corroborating normal evidence more often than random/course-order alternatives, reported only with sufficient sample size.

**Guardrails**
- abandonment during starting check;
- median/percentile completion time;
- readiness/mastery/coverage changes caused solely by starting-check evidence — expected **zero**;
- repeated accidental prompting for the same completed first-course check;
- question/content integrity exceptions;
- persistence/resume failures.

### Analytics/data minimisation

Operational product analytics should record bounded event/state metadata rather than duplicate the full question text or unnecessary Student response content. The educational answer itself remains governed learning evidence with explicit starting-check provenance.

## 11. Admin / Founder assurance — PASS

Founder assurance should be able to answer:

- How many new Students reach the starting check?
- What proportion complete, partially complete or skip it?
- Does it materially delay or improve first useful activity completion?
- Are recommendations being followed or frequently overridden?
- Are there content/sampling/persistence failures?
- Has any starting-check evidence incorrectly entered mastery/readiness/coverage calculations?

The last item is a release-critical educational integrity guardrail: the expected exception count is zero.

## 12. Risk / trust / accessibility — PASS with controls

### Educational/claims risk — HIGH

Primary risk: a small sample is accidentally treated as broad knowledge/readiness evidence.

Control: dedicated evidence provenance/class, hard exclusion from coverage/mastery/readiness thresholds and explicit unit/integration assurance.

### UX risk — MEDIUM

Primary risk: the check becomes an onboarding barrier.

Controls: about five short questions, clear purpose, progress indicator, skip/recovery path, no score endpoint and direct transition to useful work.

### Content risk — MEDIUM

Only assured, course-aligned questions may be used. If a course lacks enough eligible assured questions, reduce the sample or fall back safely rather than generate unassured content.

### Privacy risk — LOW/MEDIUM

Answers are Student educational data and remain private by default. Collect only what is needed for the recommendation/evidence model and bounded analytics.

### Accessibility — REQUIRED

The interaction must satisfy Revision's WCAG 2.2 AA baseline, keyboard completion, visible focus, programmatic question/progress labels, touch-size targets and phone/tablet/desktop responsive behaviour. Timed answering is not required.

## 13. Technical feasibility and dependencies — PASS

### Existing feasible foundations

Current content packs provide topic-linked multiple-choice questions with validated correct options/explanations. AQA A-level Business currently contains multiple assured MCQs across ten broad topic groups, so a five-topic initial sample is feasible for the pilot course.

Current evidence persistence is append-only and owner-scoped. Current readiness/recommendation logic is deterministic and testable.

### Required implementation evolution

Implementation will need to:

- represent starting-check provenance/evidence strength explicitly;
- prevent starting-check observations entering ordinary readiness threshold calculations;
- add deterministic sampling logic;
- add deterministic first-recommendation logic using the directional observations;
- preserve/resume check state where required by the GJ-01 onboarding implementation; and
- expose bounded measurement/assurance state.

This touches evidence persistence/readiness logic and is therefore **Level 3 — High risk** under the Testing & Assurance Standard despite the small UI.

## 14. Test and assurance approach — PASS

### Unit/domain

Prove:

- deterministic sample selection;
- maximum one starting-check question per sampled topic;
- broad spread across canonical topic order;
- fewer-than-five eligible-topic behaviour;
- correct/incorrect/unanswered directional semantics;
- deterministic first-recommendation tie-breaks;
- all-correct fallback;
- partial fallback;
- skip fallback; and
- ordinary readiness/mastery/coverage functions ignore starting-check evidence.

### Content/schema

Prove:

- every starting-check item is from the exact supported course;
- every item maps to a valid course topic;
- only assured/published content is eligible; and
- no duplicate question/topic is selected in one check.

### Database/integration

Prove:

- owner-only RLS;
- append-only or otherwise appropriately immutable evidence behaviour;
- persistence/reload/resume;
- cross-user denial;
- diagnostic provenance survives round-trip; and
- starting-check rows cannot be mistaken for ordinary practice evidence at the service boundary.

### Browser/journey

Cover the GJ-01 path:

`course added → starting check → recommendation → exact useful activity`

and separately:

- skip;
- partial/interrupted/resume;
- no eligible question fallback;
- keyboard completion;
- phone/tablet/desktop responsive completion;
- Light/Dark theme; and
- automated accessibility checks where practical.

### Regression

Because evidence/readiness is shared, regress normal Practice, Progress/readiness and recommendation journeys so existing ordinary evidence continues to behave unchanged.

## 15. Documentation and authority impact — PASS subject to governed changes in this PR / FI-021

### FI-006 normative promotion

Before FI-006 may become Ready, update:

- `10-product-governance/Product System Model.md` — recognise directional starting-check evidence and its permitted influence;
- `40-evidence-and-trust/Claims and Progress Governance.md` — explicitly prohibit starting-check evidence from creating mastery/readiness/coverage claims by itself.

### FI-021 journey promotion

The precise successful-signup → course → starting check → first useful work sequence belongs to FI-021/GJ-01 and should be promoted into `10-product-governance/Core User Journeys.md` on the onboarding readiness branch rather than duplicated here.

### Implementation documentation later

When implementation begins, update the evidence/readiness technical documentation, authentication/onboarding implementation record, database/readiness contract documentation where schema changes require it, and the Assurance Coverage Register.

Historical PR #57 and the GJ-01 research/design contract remain historical/supporting evidence and must not be rewritten as implementation truth.

## 16. Blocking decisions resolved — PASS

The FI-006 MVP decisions are resolved as follows:

- **length:** normally five questions, with fewer where fewer distinct eligible topics exist;
- **breadth:** distinct high-level topics spread deterministically across canonical course topic order;
- **question source:** assured existing course MCQ content only for MVP;
- **evidence semantics:** directional only; excluded from coverage/mastery/readiness;
- **recommendation use:** may select the first topic/activity to investigate;
- **all-correct result:** no broad positive claim; use deterministic course starter/least-evidenced fallback;
- **incorrect result:** provisional reason to investigate, not durable weakness;
- **partial result:** use available directional observations where useful, otherwise fallback;
- **skip:** direct deterministic course starter activity; never generic empty Home;
- **periodic check-ins:** excluded from MVP;
- **commercial treatment:** foundational across all tiers;
- **AI role:** explanatory only; deterministic sampling/scoring/recommendation;
- **learner-facing score:** none.

### Deterministic first-recommendation rule

For MVP:

1. consider sampled topics answered incorrectly;
2. if one or more exist, choose the earliest such topic in the course's canonical topic order as the first investigation target;
3. if none exist, choose the earliest eligible course topic that does not already have stronger normal evidence, otherwise the earliest eligible course topic;
4. route into the course-defined useful starter activity for that topic, preferring a focused Learn/Practice activity that exists in the supported content model;
5. explain the recommendation as an early starting point, not a weakness/mastery judgement.

This deterministic tie-break avoids hidden AI judgement and is straightforward to assure. Future evidence may immediately reprioritise the Student after the first useful activity.

## 17. Human Definition-of-Ready approval — PENDING

An AI agent may recommend FI-006 `Ready` after the normative authority changes are complete and the exact PR has passed appropriate documentation assurance. It may not self-approve `Analyse → Ready`.

---

# Preliminary Definition-of-Ready decision

- Student problem — **PASS**
- Strategic case — **PASS**
- User value — **PASS**
- Experience — **PASS**
- Evidence / intelligence — **PASS subject to normative promotion**
- REV role — **PASS**
- MVP boundary — **PASS**
- Free / Paid / Premium — **PASS**
- Upgrade hypothesis — **N/A**
- Measurement — **PASS**
- Founder/Admin assurance — **PASS**
- Risk / trust / accessibility — **PASS**
- Technical feasibility — **PASS**
- Test / assurance approach — **PASS**
- Documentation / authority impact — **PASS subject to governed changes**
- Blocking decisions — **NONE**
- Human Definition-of-Ready approval — **NOT YET GRANTED**

## Product Manager recommendation

Complete the two normative promotions identified above, update the canonical backlog to `Analyse`, then present FI-006 for explicit Founder `Ready` approval. Do **not** start production implementation before that approval is recorded.

## Documentation-impact check

This analysis changes product/evidence intent beyond the existing generic diagnostic backlog description by explicitly defining the directional evidence class, MVP boundary, deterministic first-recommendation rule and evidence-protection contract. Therefore normative authority changes are required before Ready.

No production code or technical implementation documentation should be changed during this analysis increment.