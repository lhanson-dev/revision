# Content Pack Source and Coverage Template

Use this template for each new subject/paper/component pack. Keep it concise enough to maintain, but complete enough to prove what was sourced, what is covered and what remains uncertain.

## Pack identity

- Subject:
- Qualification:
- Exam board / awarding organisation:
- Specification code:
- Paper / component / area:
- Relevant exam series/year (if applicable):
- Pack ID:
- Repository path:
- Current status: `planned` / `preview` / `available`
- Learner-specific option/text/module if applicable:

## Primary source record

| Source | Issuer | Type | Version/date | Governs | Checked | Notes / limitations |
|---|---|---|---|---|---|---|
| | | | | | | |

Use official awarding-organisation material first. Supplementary sources may be recorded below but must not silently redefine curriculum or assessment authority.

## Supplementary source record

| Source | Publisher | Why used | Checked | Notes / limitations |
|---|---|---|---|---|
| | | | | |

## Specification coverage blueprint

| Official requirement / reference | Revision topic / area | Learner needs to know / do | Assessment relevance supported by source | Planned Revision coverage | Status | Notes |
|---|---|---|---|---|---|---|
| | | | | Learn / Practice / Exam Prep | Complete / Partial / Deferred / N/A | |

## Capability check

For this pack, record what is educationally meaningful rather than forcing every capability to exist.

| Capability | Included? | Coverage / rationale |
|---|---|---|
| Learn / explanations | | |
| Topic relationships / connections | | |
| Flashcards / active recall | | |
| Quick checks / quizzes | | |
| Application / case practice | | |
| Data / calculation drills | | |
| Exam questions | | |
| Exam technique | | |
| Timed/full exam simulator | | |
| Progress evidence | | |

## Educational assurance

- [ ] Exact course/paper/component identity checked against primary authority
- [ ] Intended specification coverage checked against blueprint
- [ ] Factual content checked
- [ ] Paper/component timing and marks checked where applicable
- [ ] Assessment objectives / marking structure checked where applicable
- [ ] Generated questions are not represented as official past-paper questions
- [ ] Marking guidance is consistent with approved assessment principles
- [ ] Learner explanations preserve the meaning of the source material
- [ ] Known ambiguities or limitations are documented
- [ ] No material requirement is silently omitted

### Assurance notes

Record material findings, corrections or residual limitations here.

## Structural assurance

- [ ] `contentPackSchema` validation passes
- [ ] Topic/reference integrity tests pass
- [ ] Mark totals / manifest metadata checks pass where applicable
- [ ] Production build discovers the pack
- [ ] Shared learner shell renders the pack without subject-specific React code
- [ ] Evidence writes use the correct module/topic IDs
- [ ] Global Progress recognises the module
- [ ] REV can include the module in catalogue-level prioritisation

## Publication decision

### Ready for `available`?

- [ ] Yes
- [ ] No

### Intentionally deferred coverage

State anything deliberately excluded from the current pack and why.

### Known limitations

State any limitation that a learner, reviewer or future content maintainer should know.

### Documentation impact

Record technical/governance documentation updated, or explicitly state why none is required.

### Founder approval

A merge into `main`, including a change that makes a pack `available`, requires explicit Founder approval for that specific PR.
