# Content Factory Foundation Curriculum and Exam Coverage Amendment

**Status:** Active v1.0 — Founder-approved via PR #318  
**Owner:** Founder / Product / Content Operations  
**Applies to:** `Content Factory Foundation and Asset Production Model.md`, Foundation coverage, Course Truth, Exam Truth and Foundation approval packaging  
**Purpose:** Make Foundation completeness explicitly prove full curriculum coverage and full exam/marking coverage before approval.

## Governing rule

A Foundation is complete only when Revision can prove two things for the exact course and cohort:

1. **Curriculum coverage** — every applicable curriculum area, topic, subtopic and required knowledge/skill is represented in Course Truth.
2. **Exam coverage** — every applicable exam component, structure rule, assessment objective/demand, quantitative or other assessment requirement, response expectation and marking principle needed for authentic assessment is represented in Exam Truth.

The Foundation Factory is not creating learner-facing Learn, Practice or Exam Prep material at this stage. This control is solely about establishing and approving the complete Course Truth and Exam Truth on which those later factories will depend.

## Curriculum coverage map

Revision must establish a source-led curriculum hierarchy for the exact course/cohort.

The normal shape is:

`curriculum area → topic → subtopic / explicit requirement → Course Truth representation`

The hierarchy may be deeper or shallower where the specification requires it. The structure comes from the applicable curriculum/specification, not from a configured target number of topics or nodes.

Every lowest-level applicable curriculum requirement must map to retained Course Truth semantics. Parent headings do not prove that all of their children are covered.

A curriculum map is complete only when:

- all applicable areas/topics/subtopics from the authoritative source have been captured;
- every applicable lowest-level requirement has a Course Truth mapping;
- every mapping resolves to retained governed content/evidence;
- no requirement remains missing, partial or silently omitted; and
- exclusions, non-applicability and cohort-specific boundaries are explicit.

## Exam coverage map

Revision must separately establish a source-led model of how the exact course is assessed.

The normal shape is:

`qualification → paper/component → structure and rules → assessment/marking requirement → Exam Truth representation`

This includes, where applicable:

- papers/components and their compulsory/optional status;
- marks, timings and weightings;
- question/response structure and supported question families;
- assessment objectives and cognitive/command demands;
- quantitative, practical, synoptic, data/source or other assessment requirements;
- response expectations and levels/rubric principles where applicable;
- marking behaviour and valid alternative reasoning routes where required; and
- explicit pre-calibration or evidence limits where exact detail is not yet governed.

Every applicable exam/marking requirement must map to retained Exam Truth. Unsupported precision must not be invented merely to make the model appear complete.

## Completeness rule

The Foundation may claim complete coverage only when both maps reconcile completely:

- **zero applicable curriculum requirements unmapped to Course Truth**; and
- **zero applicable exam/marking requirements unmapped to Exam Truth**.

The number of curriculum areas, topics, subtopics, semantic nodes, papers or assessment requirements is an output of the authoritative course and exam definition. It is not a production target.

Official numeric facts remain enforceable where the source specifies them. Examples include paper marks, timing, weighting, an official quantitative minimum or a verified question count/shape. Those are exam facts, not generated-content quotas.

## Approval-pack rule

A qualified-human Foundation approval pack must not present only Revision's generated Foundation artifacts and ask the reviewer to infer whether they are complete.

The pack must include or resolve the exact source-led reconciliation evidence showing:

1. the complete curriculum hierarchy applicable to the course/cohort;
2. the mapping from every applicable lowest-level curriculum requirement to Course Truth;
3. the complete applicable exam/marking requirement set;
4. the mapping from every applicable exam/marking requirement to Exam Truth; and
5. any explicit exclusions, uncertainties, limitations or pre-calibration boundaries.

The reviewer can then challenge both:

- whether Revision captured the correct requirement universe; and
- whether the resulting Course Truth and Exam Truth represent it accurately and at the right depth.

The approval pack must not rely on internal Foundation consistency as a substitute for external specification completeness.

## Fail-closed rule

If the curriculum hierarchy or exam/marking requirement set cannot be established or fully reconciled, the Foundation remains incomplete/blocked and must not proceed to qualified-human approval packaging.

The system must not:

- derive the complete requirement universe solely from the semantic seed it is trying to validate;
- treat a parent topic heading as proof that all underlying requirements are covered;
- infer completeness because Course Truth exactly matches an internally generated coverage set; or
- rely on the qualified human as the primary detector of an explicit missing specification requirement that could have been exposed by source reconciliation earlier.

## Human-review role

Qualified human review remains mandatory.

The human reviewer should judge matters that require educational and assessment expertise, including:

- whether the interpreted curriculum/exam requirement universe is correct for the cohort;
- factual and conceptual accuracy;
- sufficient depth and emphasis;
- assessment authenticity;
- marking and response expectations;
- ambiguity or alternative valid interpretations; and
- whether any source boundary has been misapplied.

The human review is stronger when the complete curriculum and exam maps are visible rather than hidden behind generated artifact structure.

## Relationship to existing authority

This amendment clarifies the existing Foundation Production Model, which already requires:

- complete curriculum/specification coverage;
- complete Course Truth;
- complete Exam Truth; and
- qualified Foundation approval before learner-facing asset production.

The failure exposed by the AQA Business review was therefore an implementation/assurance gap: the new Foundation path proved consistency against its own narrower requirement seed instead of proving that seed against the complete applicable curriculum and exam definition.

Historical records remain unchanged.

## Documentation and implementation consequence

Current implementation must:

- establish a source-led curriculum hierarchy/coverage map before declaring Course Truth complete;
- establish a source-led exam/marking coverage map before declaring Exam Truth complete;
- deterministically reject unmapped applicable requirements;
- make both reconciliation maps part of the Foundation assurance and qualified-human review evidence set;
- preserve source/cohort boundaries and explicit uncertainty; and
- update current technical documentation and ADRs for the changed assurance boundary.