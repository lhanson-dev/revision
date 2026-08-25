# Content Pack Source and Coverage Template

Use this template for each new subject/course/component pack. Keep it concise enough to maintain, but complete enough to prove identity, source rights, coverage, assessment structure and assurance status.

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

## Curriculum / specification coverage blueprint

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

## Learning Blueprint

Record which modes are educationally appropriate rather than forcing every topic into the same asset set.

| Requirement / cluster | Explanation | Worked example | Flashcards / retrieval | Quick checks | Application / case | Data / calculation | Exam prep | Evidence type | Rationale / notes |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

- Learning Blueprint path/reference:
- Version/fingerprint:

## Assessment Blueprint

Complete where the course/component includes written or exam-style assessment.

- Assessment Blueprint path/reference:
- Version/fingerprint:

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

## Marking Pack coverage

Every written item represented as eligible for governed assisted marking must have a Marking Pack.

| Question ID | Question family | Max mark | Concepts / AOs | Marking Pack ref | Anchor/calibration status | Deterministic validation | Independent review | Notes |
|---|---|---|---|---|---|---|---|---|
| | | | | | | Pass / Fail / N/A | Pass / Fail / Pending | |

A Marking Pack should contain, as applicable, rubric/level logic, application/analysis/evaluation requirements, legitimate alternative reasoning, non-exhaustive indicative content, misconceptions, anchors, diagnostic feedback, improvement actions, ambiguity/confidence rules and provenance/version status.

## Capability check

Record what is educationally meaningful rather than forcing every capability to exist.

| Capability | Included? | Coverage / rationale |
|---|---|---|
| Learn / explanations | | |
| Topic relationships / connections | | |
| Worked examples | | |
| Flashcards / active recall | | |
| Quick checks / quizzes | | |
| Application / case practice | | |
| Data / calculation drills | | |
| Exam-style questions | | |
| Exam technique | | |
| Timed/full exam simulation | | |
| Structured Marking Packs | | |
| Progress evidence | | |

## Educational and assessment assurance

- [ ] Exact course/component identity checked
- [ ] Every material source classified for permitted use
- [ ] No `UNKNOWN` / unresolved source-rights blocker remains
- [ ] Board Alignment facts verified
- [ ] Intended curriculum/specification coverage checked against blueprint
- [ ] Course Knowledge Model / Learning Blueprint complete where v2 applies
- [ ] Factual content checked
- [ ] Paper/component timing and marks checked where applicable
- [ ] Assessment Blueprint checked where applicable
- [ ] Question Family constraints checked where applicable
- [ ] Generated questions are not represented as official past-paper questions
- [ ] Marking Packs exist for every item represented as markable
- [ ] Marking guidance is consistent with approved assessment principles
- [ ] Legitimate alternative reasoning has been considered where judgement is required
- [ ] Learner explanations preserve underlying educational truth
- [ ] Known ambiguities or limitations are documented
- [ ] No material requirement is silently omitted
- [ ] Independent fresh-context review completed for applicable A2/A3/A4 material

### Assurance notes

Record material findings, corrections or residual limitations here.

## Structural / deterministic assurance

- [ ] `contentPackSchema` validation passes
- [ ] Topic/reference integrity tests pass
- [ ] Coverage completeness checks pass
- [ ] Arithmetic / formula / unit checks pass where applicable
- [ ] Answer-key consistency checks pass
- [ ] Mark totals / manifest metadata checks pass where applicable
- [ ] AO totals / Assessment Blueprint constraints pass where computable
- [ ] Marking Pack required-field / cross-reference checks pass
- [ ] Internal case-data consistency checks pass where computable
- [ ] Production build discovers the pack
- [ ] Shared learner shell renders the pack without subject-specific React code
- [ ] Evidence writes use correct module/topic IDs
- [ ] Progress / REV catalogue integration remains valid

## Expert review readiness

### Ready for `expert_review_ready`?

- [ ] Yes
- [ ] No
- [ ] Not applicable to this production mode

If yes, confirm:

- [ ] all required source, Board Alignment, coverage, knowledge, learning and assessment artifacts are present;
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