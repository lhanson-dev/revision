# Competitor Feature Gap Analysis — 20 August 2026

**Document type:** research  
**Authority:** non-authoritative  
**Status:** point-in-time competitive research  
**Owner:** Product  
**Purpose:** Record competitor capabilities that may be worth considering for Revision, identify genuine feature gaps versus the current canonical product, and prevent competitor observations from being mistaken for approved product direction.

## Governance boundary

This document is research, not product authority. A competitor capability being listed here does **not** mean Revision should copy it or that it is approved for implementation.

Product candidates are recorded in `10-product-governance/backlog/Product Feature Backlog.md`. Promotion follows `KNOWLEDGE_ARCHITECTURE.md` and `80-company-workflows/Feature Definition and Measurement Workflow.md`.

Revision's governing strategic test remains that a capability should strengthen the personalised revision system rather than turn Revision into a generic content library, generic chatbot or school LMS.

## Competitors reviewed

Primary benchmark:

- Save My Exams

Additional direct/adjacent benchmarks:

- Seneca Learning
- Quizlet
- ExamSolutions
- BBC Bitesize
- Physics & Maths Tutor

The analysis also considered the broader pattern of AI study products that transform learner-provided material into generated study assets.

## Current Revision baseline

The approved `main` implementation already includes meaningful capabilities that should not be misclassified as gaps:

- adaptive revision planning using assessments, availability, evidence and bounded learner preferences;
- evidence-aware progress/readiness modelling;
- revision notes / focused learning material;
- flashcards;
- quick checks / quizzes;
- case-study and application practice;
- formulas and data drills where the content pack supports them;
- exam-style written questions with marking guidance and self-assessment;
- timed full-paper Exam Simulator capability; and
- a current REV planner experience that can explain priorities and negotiate bounded short-term planning preferences.

Current catalogue breadth remains deliberately narrow relative to major competitors, with the pilot centred on assured AQA Business content.

## Key competitor movement

### Save My Exams is no longer only a content-library benchmark

Save My Exams now markets a connected toolset including:

- Study Planner — a personalised revision timetable built around subjects and exam dates;
- Strengths & Weaknesses — topic-performance guidance intended to show where to focus;
- Smart Mark — AI-assisted, exam-specific marking and feedback;
- Target Test — personalised exam-style tests built from weaker areas;
- mock exams;
- flashcards;
- large past-paper and mark-scheme coverage; and
- teacher Test Builder capability.

This means Revision should **not** rely on the weak positioning claim that competitors provide resources while Revision alone tells learners what to revise. That distinction is already narrowing.

Revision's stronger strategic territory is the depth of the adaptive loop: cross-subject prioritisation, realistic availability and remaining capacity, evidence confidence, separate coverage/mastery/readiness dimensions, continuous replanning from actual learner behaviour, and REV explaining or negotiating the trade-offs.

## Gap matrix

| Gap / competitor capability | Current Revision position | Strategic assessment | Backlog treatment |
| --- | --- | --- | --- |
| AI / assisted marking of written exam answers | Current written exam evidence is self-assessed against marking guidance | High-value gap. Strong fit because marking evidence can feed directly into readiness, planning and REV | New FI candidate |
| Full contextual conversational tutor | Approved direction exists, but current runtime is still primarily planner-oriented rather than full tutoring | Core differentiation, already represented by FI-003 | Existing FI-003 |
| Broad multi-subject / multi-board catalogue | Current assured pilot catalogue is narrow | Commercial/table-stakes scaling gap, but breadth must not outrun content assurance | New FI candidate |
| Adaptive spaced retrieval / repetition | Flashcards record evidence, but no mature resurfacing scheduler is yet a product capability | Strong fit with evidence-aware personalisation; preferable to generic flashcard copying | New FI candidate |
| Weakness-driven personalised test generation | REV can recommend existing activities, but does not yet construct a targeted assessment from current gaps | Strong fit if generated/selected questions are curriculum-grounded and evidence-safe | New FI candidate |
| Wrong-answer retry / misconception recovery mode | No dedicated mode | Useful targeted-practice pattern; should be integrated into evidence loop rather than copied as a standalone gimmick | New FI candidate |
| Cram / exam-soon priority mode | Planner already handles constrained capacity, but no distinct learner-facing intensive review mode exists | Potentially useful if it remains calm, evidence-led and does not create panic or false promises | New FI candidate |
| Large searchable past-paper / mark-scheme library | Exam Simulator exists but breadth is limited | Useful exam-prep/table-stakes capability; licensing/source and content governance matter | New FI candidate |
| Video / audio learning at meaningful scale | Product authority allows multiple formats but live catalogue breadth is limited | Selective value; do not start a race to own the largest video library | New FI candidate |
| Learner upload → generated notes/flashcards/tests | Not present | Useful adjacent capability, but uploaded material may be inaccurate and cannot automatically become authoritative curriculum truth | New FI candidate |
| Offline / downloadable study | Online-first responsive application | Convenience feature; lower differentiation | New FI candidate |
| Native mobile applications | Responsive web runtime today | Potential later convenience/retention investment; not needed to prove core proposition | New FI candidate |
| Teacher/classroom tooling | Explicitly outside first-release LMS direction | Real competitor capability, but strategically dangerous if pursued too early | New FI candidate, expected low priority/park candidate |
| Predicted papers / grade guarantee style products | Not present | Predicted-paper practice may be assessable later; grade guarantees conflict with Revision's evidence/truthfulness posture unless exceptionally well supported | New FI candidate with explicit guardrails |
| Subscription / entitlement system | Not live | Important commercial gap already represented by FI-002 | Existing FI-002 |

## Recommended strategic priority bands

These are **research recommendations only**, not approved sequencing.

### Highest-value gaps to investigate

1. Assisted/AI exam-answer marking.
2. Full REV tutoring/orchestration (FI-003).
3. Assured catalogue expansion.
4. Subscription and entitlement implementation (FI-002) for commercial viability.
5. Adaptive retrieval / spaced repetition.
6. Weakness-driven targeted tests.

The common property is that each can strengthen Revision's core closed loop:

`recommend → learn/practise → evaluate → update evidence → update readiness → replan → explain next action`

### Useful second-wave capabilities

- wrong-answer / misconception recovery;
- exam-soon focused review;
- stronger past-paper coverage;
- selective video/audio learning.

### Capabilities to preserve for consideration but resist prioritising prematurely

- native apps;
- offline/downloadable study;
- learner-uploaded content generation;
- teacher/classroom tooling;
- predicted-paper products.

These can be useful, but they are weaker differentiators or carry meaningful strategic/governance risk.

## What Revision should not copy blindly

### Do not compete on raw content volume alone

Save My Exams, Seneca, BBC Bitesize, Quizlet and Physics & Maths Tutor have existing libraries, distribution and/or network effects. Revision needs sufficient assured breadth to be credible, but its moat should be the intelligent learner model and adaptive system around that content.

### Do not reduce REV to an AI-chat checkbox

Generic AI tutoring is increasingly common. The defensible value is REV using structured curriculum and learner state, not merely exposing a chatbot.

### Do not turn the product into an LMS because competitors serve teachers

Teacher tools can create distribution value later, but early classroom-management expansion would conflict with the current strategic red line against becoming a conventional school platform.

### Do not use grade promises as a shortcut to conversion

Revision's claims and progress model deliberately separates evidence quality from confidence. Any future prediction or attainment claim must meet the evidence and claims governance threshold rather than copying marketing practices that create false certainty.

## Defensible differentiation implication

The emerging competitive position should be tested against this standard:

> Revision continuously works out the most useful thing for this learner to do next, across their real subjects and constraints, using evidence it can explain — then learns from what happened and changes the guidance.

A competitor may offer a study planner, weak-topic dashboard, AI marker or AI tutor individually. Revision's opportunity is to make those behaviours parts of one coherent learner-state system.

## Official sources consulted

Accessed 20 August 2026 unless stated otherwise.

- Save My Exams Study Planner: https://www.savemyexams.com/study-tools/study-planner/
- Save My Exams Smart Mark: https://www.savemyexams.com/study-tools/smart-mark/
- Save My Exams Strengths & Weaknesses: https://www.savemyexams.com/study-tools/strengths-and-weaknesses/
- Save My Exams overview of current study tools: https://www.savemyexams.com/learning-hub/sme-articles/what-is-save-my-exams/
- Quizlet Practice Tests help: https://help.quizlet.com/hc/en-us/articles/25946589648013-Studying-with-Practice-Tests
- Quizlet AI Flashcard Generator: https://quizlet.com/features/ai-flashcard-generator
- Quizlet AI PDF Summarizer: https://quizlet.com/features/ai-pdf-summarizer/
- Seneca Learning public product/help materials reviewed during the competitive analysis.
- ExamSolutions public product materials reviewed during the competitive analysis.
- BBC Bitesize public learner resources reviewed during the competitive analysis.
- Physics & Maths Tutor public revision-resource catalogue reviewed during the competitive analysis.

## Documentation impact check

This research does not change normative product authority or implementation truth.

Required documentation impact from this analysis:

- create this research record;
- add distinct candidate capabilities to the canonical non-authoritative product feature backlog;
- link existing FI-002 and FI-003 conceptually rather than duplicate them.

No change is required to `INDEX.md`, approved product authority, technical documentation, ADRs or assurance registers at this stage because no feature has been approved or implemented. Those impacts must be revisited individually if a backlog item is promoted.