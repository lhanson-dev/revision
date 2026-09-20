# Course Learning Blueprint

**Status:** Active product authority — approved and merged in PR #351  
**Owner:** Founder / Product / Educational Content  
**Purpose:** Define the qualification-agnostic learning-design model that transforms an Approved Course Foundation into coherent Learn, Practice and Exam Prep experiences.

## Governing decision

Revision must not convert Course Truth directly into a generic bundle of notes, flashcards and quizzes.

For every exact course, Revision must first derive a **Course Learning Blueprint** from the Approved Course Foundation. The blueprint determines what kind of learning treatment each knowledge/skill node needs, which learning objects are justified, which forms of Practice can validly evidence the node, and how Exam Prep should bridge that learning into authentic assessment performance.

The governing chain becomes:

`Approved Course Foundation → Course Learning Blueprint → Learn / Practice / Exam Prep asset planning → asset generation → asset assurance → learner use → evidence → REV next action`

The Approved Course Foundation remains the source of curriculum and assessment truth. The Course Learning Blueprint does not decide what belongs in the course. It decides how approved truth should be taught, practised and connected to assessment.

This document is the **Learning Blueprint** referred to by `Product System Model.md`.

## Product objective

A student should not need to decide which study technique is pedagogically appropriate for every concept.

Revision should make effective learning behaviour the default while preserving learner agency over what to study and allowing legitimate alternative Practice formats where those formats can provide valid evidence.

The learner-facing goal is:

> Help me understand this, remember it, use it in unfamiliar situations, learn from mistakes, and become able to perform with it in the real exam.

## Relationship to existing product authority

This blueprint operates within the existing course model:

- **Learn** — help me understand this;
- **Practice** — help me test and improve what I know;
- **Exam Prep** — help me perform in the real exam; and
- **Progress** — help me understand what I have reviewed and what the available evidence says about readiness.

It does not create a competing course hierarchy.

Where syllabus knowledge is shared across papers/components, Course Truth and ordinary Learn/Practice remain course-level and paper/component differences belong primarily inside Exam Prep, consistent with `Course Content and Assessment Component Placement.md`.

## Core learning-design principles

### 1. Learning design is requirement-driven, not format-driven

Revision must not require a fixed quota such as one mind map, one video, ten flashcards and one quiz for every topic.

The learning treatment must be selected from the educational characteristics of the node and the relevant exam demand.

Different subjects should therefore produce different mixes of learning objects while using the same governing model.

### 2. Active retrieval is a default learning behaviour

Where knowledge can validly be recalled from memory, Practice should require the learner to retrieve rather than merely reread.

Passive review can support understanding and orientation but must not be treated as equivalent to demonstrated recall or performance.

### 3. Important knowledge should be revisited over time

Revision should support spaced resurfacing of material rather than treating one successful interaction as permanent mastery.

The exact interval, weighting and resurfacing algorithm are implementation/evidence questions. The product authority is that useful knowledge should be revisited when the evidence suggests checking it again is worthwhile.

### 4. Feedback must cause learning

Practice feedback must do more than expose a right/wrong result.

Where useful it should explain the educational reason, identify the misconception or missing reasoning, provide an appropriate repair route and offer a later opportunity to demonstrate improvement.

The preferred loop remains:

`retrieve / attempt → feedback → explain → repair → retest → update evidence → decide what matters next`

### 5. Guidance should reduce as competence increases

For complex procedures, calculations, reasoning and exam responses, Revision should normally progress from high support to lower support:

`model / worked example → guided or partially completed attempt → independent attempt → mixed or authentic use`

The learner should not be left to discover a complex method by unguided trial when an explicit model would teach it more efficiently.

Conversely, Revision should not keep competent learners trapped in unnecessary scaffolding.

### 6. Visuals must teach something

Diagrams, graphs, maps, timelines, process flows and other visuals are justified where they improve understanding of relationships, sequence, structure, comparison, spatial arrangement or data.

Decorative images are not a learning requirement.

A node should not receive a visual asset merely because visual content is more engaging.

### 7. Interleaving is selective, not universal

Mixed Practice is useful where the learner needs to select between similar concepts, methods, categories or response approaches, or where exam performance requires switching between them.

Initial acquisition may still require focused practice before mixing. Revision must not randomise material merely to claim that Practice is interleaved.

### 8. Learning preferences are not learning-style labels

Revision may respect legitimate learner preferences for presentation or activity, accessibility needs and motivational differences.

It must not label a learner as a fixed visual, auditory or reading/writing learner or restrict teaching to a supposed learning style.

The representation should be chosen primarily because it suits the material and learning job.

### 9. Coherent learning beats card volume

Learn should read and behave as a coherent explanation experience rather than a database of disconnected widgets.

Learning objects are planning units, not a requirement to display every element as a separate bordered card.

The learner should experience a clear narrative and progression through the material.

### 10. Exam performance requires more than recall

Where Exam Truth requires application, analysis, evaluation, extended reasoning, quantitative work, practical execution, source handling or another higher-order demand, the blueprint must create a path from foundational knowledge into that demand.

Strong recall evidence must not substitute for a skill it cannot demonstrate.

## Course section content architecture

The canonical course section remains:

```text
Course / specification
├── Overview
├── Learn
├── Practice
├── Exam Prep
└── Progress
```

### Overview

The course Overview should orient the learner rather than reproduce the full curriculum.

It should provide, where available and appropriate:

- exact course/specification identity;
- upcoming assessment date/context;
- an obvious recommended next action;
- a concise view of Reviewed and Exam Readiness state;
- topic/course structure; and
- direct routes into Learn, Practice and Exam Prep.

### Learn

Learn owns explanations and comprehension.

It should help the learner build a usable mental model of the course content through the learning treatments selected by this blueprint.

### Practice

Practice owns retrieval, application, skill execution, feedback, repair and repeated evidence generation outside authentic full exam conditions.

Practice techniques are alternative evidence routes where valid, not mandatory completion lanes.

### Exam Prep

Exam Prep owns translation from course knowledge into authentic assessment performance. It uses both Course Truth and Exam Truth.

### Progress

Progress explains Reviewed state, demonstrated performance, evidence confidence and the most useful next action. It must preserve the separate meanings governed by `Claims and Progress Governance.md`.

## Canonical learning-node classification

The Course Learning Blueprint must classify each canonical knowledge/skill node using one or more educational characteristics. A node may legitimately carry several classifications.

The minimum supported classifications are:

| Classification | Meaning | Typical examples |
| --- | --- | --- |
| `fact_term` | terminology, factual proposition or required recall | definition, named feature, rule |
| `concept` | an idea that needs meaning and boundaries | profit, opportunity cost, osmosis |
| `comparison_discrimination` | the learner must distinguish alternatives | leadership styles, mitosis vs meiosis |
| `relationship_causal` | variables/events influence one another | price → demand → revenue; cause/effect chains |
| `process_sequence` | ordered stages or procedural flow | a biological process, method, operational sequence |
| `formula_quantitative` | mathematical relationship/calculation/interpretation | ratios, break-even, gradients |
| `model_framework` | structured model/theory used to organise or analyse | Ansoff, SWOT, a scientific model |
| `procedure_skill` | repeatable method or performance skill | calculation method, translation routine, practical method |
| `application_context` | knowledge must be selected and used in context | business case, source, unseen text |
| `analysis_reasoning` | linked reasoning must explain mechanisms/consequences | analytical chain, scientific explanation |
| `evaluation_judgement` | competing evidence/factors must support a conclusion | business judgement, source evaluation |
| `misconception_risk` | a known plausible error requires explicit handling | confusable concepts, common calculation mistake |
| `synoptic_connection` | successful use depends on links across nodes/topics | cross-functional business decision, multi-topic science question |
| `exam_response_skill` | the learner must construct a response in a governed assessment form | extended answer, essay, source response |

The classification is educational metadata. It must trace back to approved Course Truth / Exam Truth rather than being invented from the generated asset.

## Canonical Learn object types

Learn planning may use the following object types where justified:

### Core explanation

Plain-language explanation of the approved knowledge, with sufficient depth for the qualification.

### Definition in context

Precise meaning of a term together with an example, non-example or boundary where that distinction improves understanding.

### Example / non-example

Concrete examples showing what a concept does and does not look like.

### Comparison

Structured contrast when the learner must discriminate between similar options, categories, theories or methods.

### Relationship / causal chain

An explicit representation of how one factor leads to or influences another, including conditions where the relationship changes.

### Process / sequence

Ordered stages with explanation of why the order or transition matters.

### Purposeful visual

Diagram, graph, timeline, process flow, map, annotated image or other visual representation where the content is better understood through spatial/relational presentation.

### Worked example

A fully modelled solution, calculation, reasoning process or response showing not only the result but the important steps and decisions.

### Faded / guided example

A partially completed example in which support is deliberately reduced and the learner supplies increasing parts of the method.

### Misconception repair

A plausible incorrect idea or method, why it fails, the correct principle and a discriminating example.

### Connection / synoptic link

Explicit link to prerequisites, downstream concepts or other topics that change how the current material is understood or used.

### Self-explanation prompt

A short prompt requiring the learner to explain why a result follows, why a method applies, or what would change under different conditions.

### Memory anchor / recap

Compact summary of the high-value knowledge after understanding has been established. This is a recall support, not a substitute for the explanation.

### Media explanation

Audio, animation or video may be used where motion, demonstration, pronunciation, modelling or another medium adds genuine learning value. Media is never mandatory merely for variety.

## Canonical Practice object types

Practice planning may use the following evidence/learning modes where valid:

- retrieval prompt / flashcard;
- recognition or discrimination check;
- classification / matching / ordering;
- short constructed response;
- calculation or quantitative drill;
- interpretation of data / graph / source;
- contextual application scenario;
- reasoning-chain construction;
- compare / justify task;
- misconception diagnostic;
- mixed-topic retrieval;
- mixed-method discrimination;
- topic test;
- repair item targeted at a diagnosed weakness; and
- spaced recheck of previously demonstrated knowledge.

A Practice object must declare what knowledge/skill evidence it can validly provide.

## Canonical Exam Prep object types

Exam Prep may use:

- paper/component orientation;
- assessment-objective / skill orientation where this is useful to performance;
- command/demand guidance;
- question-family walkthrough;
- source/case/data handling guidance;
- annotated model/anchor response;
- worked exam response;
- faded/scaffolded exam response;
- independent exam-style question;
- targeted timed question;
- timed section;
- mixed/synoptic exam set;
- marking/feedback/repair interaction; and
- full paper/component simulation.

Exam Prep objects must trace to approved Exam Truth and Course Truth.

## Deterministic selection rules

The planner must select required treatments mechanically from governed node metadata wherever the rule can be made deterministic.

A generative model may create the content for a selected treatment. It must not decide that an examinable requirement can be omitted because it considers another format sufficient.

### Baseline rule

Every material knowledge node requires:

1. an adequate Learn explanation or an explicitly governed reason why explanation is not applicable; and
2. at least one valid active Practice route capable of testing the core knowledge/skill represented by that node.

### Definition / fact rule

When a node is `fact_term`:

- require precise explanation/definition;
- require retrieval Practice;
- add contrast/non-example when confusability is material.

### Concept rule

When a node is `concept`:

- require explanation of meaning and boundaries;
- require at least one concrete example/application;
- require Practice that goes beyond simple recognition where the course expects use of the concept.

### Comparison rule

When a node is `comparison_discrimination`:

- require structured comparison;
- require Practice that makes the learner choose/distinguish between alternatives;
- permit later interleaving with confusable alternatives when educationally useful.

### Causal relationship rule

When a node is `relationship_causal`:

- require an explicit mechanism or reasoning chain;
- require an application task that changes context or one relevant condition;
- require a purposeful visual when the relationship has enough interacting parts that a visual materially clarifies it.

### Process rule

When a node is `process_sequence`:

- require ordered explanation;
- require a process visual when it materially improves comprehension;
- require Practice that checks ordering, transitions or application rather than terminology alone.

### Formula / quantitative rule

When a node is `formula_quantitative`:

- explain the meaning of the quantities/variables and the relationship, not only the formula;
- require at least one independently verified worked example;
- require guided/faded practice where the procedure is non-trivial;
- require independent calculation/interpretation Practice;
- vary relevant values/context to avoid memorising one example;
- test interpretation where Exam Truth requires interpretation rather than calculation alone.

### Model / framework rule

When a node is `model_framework`:

- explain purpose, elements and relationships;
- show the structure visually where appropriate;
- show a contextual application;
- include limitations/conditions where they are part of Course Truth or required for valid use;
- require Practice that applies/selects/criticises the model at the level demanded by the course.

### Procedure / skill rule

When a node is `procedure_skill`:

- require modelling or a worked example before unsupported independent performance unless prior evidence justifies skipping scaffolding;
- reduce scaffolding as evidence improves;
- require independent performance before treating the skill as demonstrated.

### Application rule

When a node has governed application contexts or is `application_context`:

- require transfer into more than one materially different example/context where breadth is needed;
- avoid using only the same scenario seen in Learn;
- use case/source facts that require selecting relevant knowledge rather than keyword matching.

### Analysis / reasoning rule

When a node is `analysis_reasoning`:

- require at least one modelled reasoning chain;
- use prompts that expose mechanism and consequence, not only final statements;
- progress toward independent construction of reasoning;
- connect reasoning to relevant context where the qualification requires application.

### Evaluation / judgement rule

When a node is `evaluation_judgement`:

- present competing considerations, conditions or evidence rather than a single universal answer;
- model what makes a justified conclusion strong;
- require the learner to make and support a contextual judgement;
- Exam Prep must eventually remove scaffolding and require authentic response construction where the exam does so.

### Misconception rule

When a node has a governed misconception or is `misconception_risk`:

- require explicit correction in Learn or feedback;
- include at least one diagnostic Practice item capable of distinguishing the misconception from the correct idea;
- a learner viewing the correction must not automatically clear evidence of the misconception.

### Synoptic rule

When a node is `synoptic_connection` or has material cross-topic dependencies:

- expose the relevant connection in Learn;
- include later mixed Practice that requires the learner to decide which knowledge is relevant;
- reflect the connection in Exam Prep where Exam Truth is synoptic.

### Exam-response rule

When Exam Truth requires a constructed response skill:

- Exam Prep must include a progression from model/annotation to guided/faded response where useful and then to independent authentic response;
- successful recall Practice alone cannot satisfy the response-skill obligation.

## Practice progression

The default progression is not a fixed number of questions. It is a change in the kind of thinking required.

A typical progression is:

```text
remember → recognise/discriminate → use → explain/derive → combine → judge → perform under exam conditions
```

A course does not need every stage for every node. The highest required stage is determined by Course Truth and Exam Truth.

## Spacing and resurfacing

The blueprint must identify knowledge/skills that should remain available for later retrieval rather than treating Practice as a one-off event.

Revision may resurface material based on evidence including:

- recency;
- previous retrieval/performance;
- evidence confidence;
- importance/coverage;
- prerequisite role;
- demonstrated weakness;
- exam proximity; and
- competition from higher-priority work.

The product must not expose a rigid fixed repetition schedule as educational truth unless validated evidence justifies it.

## Mixed and interleaved Practice

The blueprint should mark opportunities for mixed Practice when any of the following is true:

- the exam mixes several topic types;
- the learner must choose which method/model applies;
- several categories are easily confused;
- performance depends on linking multiple course areas; or
- the same question can legitimately require more than one node.

Mixing should normally follow sufficient initial teaching to make the discrimination educationally meaningful.

## Learn / Practice boundary

An unscored prompt inside Learn may support attention, self-explanation and retrieval without becoming readiness evidence.

If an embedded interaction is intended to produce scored learner evidence, it must retain Practice provenance and obey Practice evidence/assurance rules even if launched contextually from Learn.

Opening, scrolling, watching or completing Learn material may update `Reviewed` only. It must not directly establish mastery or Exam Readiness.

## Practice / Exam Prep boundary

Practice may include difficult constructed responses and topic tests, but Exam Prep is distinguished by explicit use of Exam Truth and authentic assessment demand.

Exam Prep increasingly owns:

- question-family behaviour;
- paper/component format;
- authentic marks/timing;
- source/case constraints;
- assessment-objective balance;
- marking behaviour; and
- full simulation.

## Learner adaptation

The Course Learning Blueprint defines what treatments exist and what evidence they can provide. REV then adapts which treatment to recommend based on learner state.

Examples:

- a learner with strong representative evidence may skip basic retrieval and move to application;
- a learner repeatedly making one misconception may receive a targeted repair explanation and diagnostic recheck;
- a learner strong on knowledge but weak in extended responses may be routed toward Exam Prep rather than more notes;
- a learner with stale evidence may receive a short retrieval check before Revision assumes the knowledge remains secure.

Personalisation must not corrupt the underlying educational obligation. A recommendation can skip unnecessary activity for a particular learner; the course blueprint still records the valid learning/evidence routes for the node.

## Course Learning Blueprint data contract

For each canonical node or deliberately grouped work unit, the blueprint should be able to represent at least:

- `courseId` / exact qualification identity;
- `foundationFingerprint`;
- `knowledgeNodeIds` / skill-node IDs;
- `prerequisiteNodeIds`;
- `learningClassifications[]`;
- required depth/difficulty;
- `learnTreatments[]`;
- `practiceEvidenceModes[]`;
- `examDemandLinks[]` where applicable;
- `misconceptionIds[]` where applicable;
- application-context requirements;
- quantitative/visual/worked-example requirements;
- synoptic/mixed-practice links;
- scaffolding/fading requirements;
- permitted evidence claims by object type;
- accessibility/media requirements; and
- provenance back to the Approved Course Foundation.

The schema may evolve, but these responsibilities must remain represented.

## Grouping rule

The learner should not receive one isolated page or card for every Course Truth node.

The planner may group related nodes into a coherent teaching work unit when:

- the relationship between the nodes is educationally meaningful;
- all node-level coverage obligations remain traceable;
- the grouping does not hide missing content; and
- Practice evidence can still map back to the appropriate underlying nodes/skills.

## Content-volume rule

Asset volume is an output of the blueprint, not an input quota.

The factory should create enough material to:

- explain every material requirement adequately;
- cover necessary examples/variation;
- provide valid evidence opportunities;
- support repair of material misconceptions;
- bridge to required assessment demand; and
- allow representative Practice without pointless duplication.

More generated content is not evidence of a better course.

## Accessibility and cognitive-load requirements

Learning objects must conform to Revision's accessibility and UX authority.

In particular:

- explanations should be segmented into manageable conceptual chunks;
- headings and signalling should make structure obvious;
- visuals must have meaningful text alternatives where applicable;
- colour must not carry educational meaning alone;
- motion/audio/video require suitable controls/transcripts/captions where applicable;
- irrelevant decorative detail must not obstruct the learning job;
- mobile layouts must preserve the learning sequence and essential information; and
- complex tables/diagrams must remain usable on constrained screens.

## Blueprint assurance requirements

A Course Learning Blueprint is valid only when assurance can prove:

1. every material Course Truth node is represented;
2. every selected treatment traces to approved Foundation data or a permitted generic learning rule;
3. mandatory treatments implied by node classifications are present;
4. no fixed format quota has created unjustified assets;
5. every Practice mode declares valid evidence scope;
6. complex procedures/quantitative nodes receive required modelling where applicable;
7. known misconceptions receive required diagnostic/repair treatment;
8. synoptic/exam-response obligations are not reduced to recall;
9. Exam Prep links to approved Exam Truth rather than invented exam assumptions;
10. Learn activity is not misclassified as readiness evidence;
11. the learner experience can be assembled coherently rather than only as disconnected objects; and
12. accessibility/media requirements are explicit where needed.

Deterministic rules should prove these obligations mechanically where possible. Independent review should challenge pedagogical appropriateness, misleading simplification and whether the proposed treatment is capable of teaching/testing the intended node.

## Subject portability

This blueprint is deliberately subject-neutral.

For example:

- mathematics will naturally create many procedure, worked-example, faded-example and mixed-method discrimination treatments;
- sciences will frequently require processes, diagrams, models, calculations, practical/analytical reasoning and misconceptions;
- history will emphasise chronology, causation, evidence, comparison, interpretation and argument;
- languages will emphasise retrieval, production, grammar application, reading/listening comprehension and speaking/writing performance;
- Business will combine concepts, causal relationships, quantitative work, models, application to context, analysis, evaluation and synoptic decision making.

The common architecture is stable. The resulting asset mix changes because the course requirements change.

## Reference course

AQA A-level Business 7132 for the 2027 examination cohort is the first reference application of this model.

The reference application must not become a hidden rule that all subjects resemble Business. It exists to prove that the blueprint can represent a course containing factual knowledge, models, quantitative work, contextual application, analysis, evaluation and synoptic exam demand.

The detailed reference application is retained separately as research/evidence so this authority stays qualification-agnostic.

## What this blueprint explicitly rejects

Revision must not standardise course production around:

- notes as the primary learning mechanism;
- a mandatory asset count per topic;
- flashcard performance as universal mastery;
- decorative visual quotas;
- passive video libraries without a learning reason;
- learner-style labelling;
- one identical page pattern for every subject/topic;
- random interleaving without a discrimination/transfer purpose;
- content completion as a performance gate; or
- exam technique taught without connection to Course Truth and authentic Exam Truth.

## Documentation impact

This document is active product authority for course learning design and fills the previously implicit `Learning Blueprint` responsibility referenced by `Product System Model.md`.

Content Factory production workflows must require blueprint derivation before learner-asset planning/generation. Technical Content Factory documentation and implementation must be updated when that production change is implemented.

This authority does not itself claim that any particular Content Factory runtime implementation has passed its governed portability proof.
