# Content Pack Source and Coverage Template

Use this template for each new subject/course/component pack. Keep it concise enough to maintain, but complete enough to prove identity, source rights, Course Truth, Exam Truth, learner-asset coverage and assurance status.

For Content Factory v2 jobs, the same information should also exist in machine-readable structured artifacts so the orchestrator can validate and reuse it.

## Pack identity

- Subject:
- Qualification:
- Exam board / awarding organisation:
- Specification code:
- Paper / component / area:
- Relevant cohort / exam series/year:
- Pack ID:
- Repository path:
- Current learner status: `planned` / `preview` / `available`
- Current factory state:
- Learner-specific option/text/module if applicable:

## Source Licence Register

Every material source must have a source-use classification before generative use. Apply `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.

| Source ID | Source / URL | Issuer | Educational role | Version/date | Use class | AI input permitted? | Derived commercial use? | Permission / policy basis | Attribution / restrictions | Checked | Notes / revalidation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | OPEN / REVISION_OWNED / LICENSED / REFERENCE_ONLY / PROHIBITED / UNKNOWN | | | | | | |

`UNKNOWN` is a blocker. `REFERENCE_ONLY` material must not be supplied as substantial protected prose to downstream generative workers unless a specific licence permits it.

## Board Alignment

Record approved qualification-specific facts separately from reusable curriculum/subject truth.

| Alignment ID | Fact / requirement | Component scope | Marks / duration / weighting if relevant | AO / skill / assessment relevance | Source ref | Verification status | Notes |
|---|---|---|---|---|---|---|---|
| | | | | | | Verified / Pending / Blocked | |

## Course Truth — curriculum / specification coverage

Every material examinable requirement must be represented before learner collateral is treated as complete. Generated volume cannot compensate for missing coverage.

| Requirement ID | Requirement / skill summary | Revision topic / area | Learner needs to know / do | Component scope | Assessment relevance | Planned Revision coverage | Source / alignment refs | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | Learn / Practice / Exam Prep / Evidence | | Complete / Partial / Deferred / N/A | |

## Course Knowledge Model references

For each substantial node, record or link the structured representation of:

- stable concept/requirement ID;
- plain-language concept/skill summary;
- prerequisites/relationships;
- formulas or quantitative rules;
- common misconceptions;
- application contexts;
- depth/difficulty indicators;
- curriculum/source references;
- Board Alignment/component mappings;
- valid learner evidence types.

- Course Knowledge Model path/reference:
- Version/fingerprint:
- Course Truth complete for intended scope? Yes / No

## Exam Truth — Assessment Blueprint

Complete before high-volume learner collateral generation where the course/component includes exam-style assessment.

- Assessment Blueprint path/reference:
- Version/fingerprint:
- Exam Truth complete for intended scope? Yes / No / N/A

Record or link:

- assessment objectives / skills and weightings;
- component structure;
- question/response families;
- command/cognitive demands;
- mark/timing constraints;
- quantitative/synoptic requirements;
- evidence/evaluation expectations;
- approved structured assessment source/alignment references.

## Question Family register

| Family ID | Skill / AO profile | Context requirements | Mark range | Response shape | Application / analysis / evaluation expectations | Compatible Marking Pack template | Expert calibration status | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Learning Blueprint

Create the Learning Blueprint from Course Truth plus the relevant Exam Truth. Record which modes are educationally appropriate rather than forcing every topic into the same asset set or a fixed arbitrary quantity.

| Requirement / cluster | Learn explanation/example | Flashcards / retrieval | Quiz / quick check | Practice questions | Application / case | Data / calculation | Topic/mixed test | Exam Prep | Evidence type | Rationale / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

Rules:

- asset volume follows curriculum/skill coverage rather than a universal fixed count;
- each Practice format should cover the full relevant scope that it can validly assess;
- a format must not be treated as evidence for skills it cannot genuinely test;
- a learner does not need to complete every Practice format to demonstrate knowledge;
- all scored Practice and Exam Prep assets map back to Course Knowledge Model nodes and applicable assessment demand.

- Learning Blueprint path/reference:
- Version/fingerprint:

## Learner evidence mapping

| Asset / activity ID | Section | Practice/Exam Prep type | Knowledge / skill node(s) | Assessment demand / family | Evidence strength/type | Can affect Reviewed? | Can affect Exam Readiness? | Notes |
|---|---|---|---|---|---|---|---|---|
| | Learn / Practice / Exam Prep | | | | | | | |

Evidence semantics:

- **Reviewed** is a secondary content-exposure/orientation signal normally updated by meaningful Learn encounter;
- **Exam Readiness** is the primary demonstrated-performance signal and is updated from validated Practice and Exam Prep performance;
- Learn completion does not directly create Exam Readiness;
- unreviewed Learn content must not create an artificial readiness penalty when stronger evidence already demonstrates the relevant knowledge/skill;
- evidence weighting must reflect strength, breadth, recency and assessment relevance rather than treating all activity types as equivalent.

## Representative Practice and Exam Prep

### Practice coverage

Record whether each relevant curriculum/skill cluster has sufficient Practice coverage across appropriate techniques. Quantity should be whatever is required for meaningful coverage and useful variation.

### Trusted mock / simulation register

Full mock examinations are a higher-assurance asset class than ordinary practice questions.

| Mock / simulation ID | Component | Full marks | Duration | Coverage profile checked | Question-family / demand mix checked | Difficulty/representativeness checked | Marking Packs complete | Independent review | Expert calibration | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | Pass / Fail | Pass / Fail | Pass / Fail / Pending | Pass / Fail | Pass / Fail / Pending | Passed / Pending / N/A | |

A full mock must be assessed as a whole against Exam Truth. Revision should prefer a smaller trusted bank over a larger weakly calibrated bank.

## Marking Pack coverage

Every written item represented as eligible for governed assisted marking must have a Marking Pack.

| Question ID | Question family | Max mark | Concepts / AOs | Marking Pack ref | Anchor/calibration status | Deterministic validation | Independent review | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | | | | Pass / Fail / N/A | Pass / Fail / Pending | |

A Marking Pack should contain, as applicable, rubric/level logic, application/analysis/evaluation requirements, legitimate alternative reasoning, non-exhaustive indicative content, misconceptions, anchors, diagnostic feedback, improvement actions, ambiguity/confidence rules and provenance/version status.

## Capability check

Record what is educationally meaningful rather than forcing every capability to exist.

| Learner section / capability | Included? | Coverage / rationale |
|---|---|---|
| Learn — explanations / notes | | |
| Learn — relationships / connections | | |
| Learn — worked examples / visuals | | |
| Practice — flashcards / active recall | | |
| Practice — quick checks / quizzes | | |
| Practice — application / case work | | |
| Practice — data / calculation | | |
| Practice — topic / mixed tests | | |
| Practice — exam-style questions | | |
| Exam Prep — technique | | |
| Exam Prep — targeted/timed questions | | |
| Exam Prep — trusted full mocks / simulation | | |
| Structured Marking Packs | | |
| Reviewed signal mapping | | |
| Exam Readiness evidence mapping | | |

## Educational and assessment assurance

- [ ] Exact course/component identity checked
- [ ] Every material source classified for permitted use
- [ ] No `UNKNOWN` / unresolved source-rights blocker remains
- [ ] Board Alignment facts verified
- [ ] Course Truth covers intended curriculum/specification scope
- [ ] Course Knowledge Model complete where v2 applies
- [ ] Exam Truth / Assessment Blueprint complete before applicable learner collateral generation
- [ ] Question Family constraints checked where applicable
- [ ] Learning Blueprint derives from Course Truth plus relevant Exam Truth
- [ ] Practice formats comprehensively cover the scope they can validly assess
- [ ] Scored Practice / Exam Prep assets map to underlying knowledge/skill nodes
- [ ] Factual content checked
- [ ] Paper/component timing and marks checked where applicable
- [ ] Generated questions are not represented as official past-paper questions
- [ ] Trusted mocks assessed as whole papers/components for representativeness
- [ ] Marking Packs exist for every item represented as markable
- [ ] Marking guidance is consistent with approved assessment principles
- [ ] Legitimate alternative reasoning has been considered where judgement is required
- [ ] Learner explanations preserve underlying educational truth
- [ ] Reviewed is not treated as achievement or Exam Readiness
- [ ] No completion requirement penalises a learner who already has stronger evidence
- [ ] Known ambiguities or limitations are documented
- [ ] No material requirement is silently omitted
- [ ] Independent fresh-context review completed for applicable A2/A3/A4 material

### Assurance notes

Record material findings, corrections or residual limitations here.

## Structural / deterministic assurance

- [ ] `contentPackSchema` / current content contract validation passes
- [ ] Topic/reference integrity tests pass
- [ ] Course Truth coverage completeness checks pass
- [ ] Exam Truth / assessment-contract completeness checks pass where applicable
- [ ] Learning Blueprint coverage checks pass
- [ ] Evidence-map references and permitted evidence semantics pass
- [ ] Arithmetic / formula / unit checks pass where applicable
- [ ] Answer-key consistency checks pass
- [ ] Mark totals / manifest metadata checks pass where applicable
- [ ] AO totals / Assessment Blueprint constraints pass where computable
- [ ] Whole-mock structural/coverage/demand checks pass where computable
- [ ] Marking Pack required-field / cross-reference checks pass
- [ ] Internal case-data consistency checks pass where computable
- [ ] Production build discovers the pack
- [ ] Shared learner shell renders the pack without subject-specific React code
- [ ] Evidence writes use correct module/topic/knowledge-node IDs
- [ ] Progress / REV catalogue integration remains valid

## Expert review readiness

### Ready for `expert_review_ready`?

- [ ] Yes
- [ ] No
- [ ] Not applicable to this production mode

If yes, confirm:

- [ ] all required source, Board Alignment, Course Truth, Exam Truth, learning/practice/exam-prep and evidence-map artifacts are present;
- [ ] representative mock/simulation requirements are satisfied where applicable;
- [ ] all Marking Packs required for markable written items are complete;
- [ ] deterministic assurance is green;
- [ ] no blocking/material independent-review findings remain;
- [ ] portable expert package is tied to the exact reviewed version/commit;
- [ ] known limitations are explicit.

- Expert Review Contract / export reference:
- Exact reviewed version/commit:

## Qualified human review

- Reviewer role / expertise:
- Review status: `not started` / `pending` / `conditional` / `passed` / `fail-hold`
- Review record reference:
- Material findings/remediation reference:
- Benchmark status:

## Publication decision

### Ready for `available` under applicable pilot/publication authority?

- [ ] Yes
- [ ] No

### Intentionally deferred coverage

State anything deliberately excluded and why.

### Known limitations

State limitations a learner, reviewer or future maintainer should know.

### Documentation impact

Record normative/technical documentation updated, or explicitly state why none is required.

### Founder approval

Every merge into `main`, including any change that makes a pack `available` or changes benchmark/claim status, requires explicit Founder approval for that specific PR.