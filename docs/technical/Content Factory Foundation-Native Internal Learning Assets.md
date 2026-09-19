# Content Factory Foundation-Native Internal Learning Assets

**Status:** Current implementation contract after ADR-0025 is merged  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md` plus `Content Factory AI-Assured Foundation Gate Amendment.md`

## Purpose

Define the first clean learner-asset production boundary after a Foundation reaches `ai_assured`.

This runtime is pre-production only. It creates Learn and Practice material that can be assured and exercised through internal test/preview paths while qualified-human Foundation review proceeds separately.

## Inputs

The producer requires:

- a Foundation job in `ai_assured`, `expert_review` or `foundation_approved`;
- the exact Foundation Coverage Model identified by the Candidate;
- the exact Course Knowledge Model identified by the Candidate;
- structured Learn and Practice workers; and
- a production timestamp/asset identity.

The runtime fails closed if the supplied coverage fingerprint or Course Knowledge Model fingerprint does not match the Candidate, or if the artifacts belong to a different Foundation job.

## Planning

`planFoundationInternalLearningWorkUnits` is deterministic.

It groups Foundation requirements by `revisionArea`, carries their exact `requirementIds` and `knowledgeNodeIds`, and requires every Course Truth node to be represented by governed coverage.

Mode selection is mechanical:

- explanation + retrieval for every work unit;
- worked example + quantitative practice when formula knowledge exists;
- application practice when application contexts exist.

The model is not allowed to decide whether governed curriculum requirements should be covered.

## Generation

`generateFoundationInternalLearningAssets` uses the existing bounded structured Learn/Practice worker interfaces with only structured Foundation facts:

- Course identity;
- canonical knowledge-node summaries/formulas/misconceptions/application contexts/evidence types;
- deterministic work-unit scope; and
- governed teaching points.

Awarding-body source prose is not supplied.

Each returned Learn/Practice output must provide auditable teaching-point evidence. The evidence validator proves every assigned teaching point is represented by an exact excerpt from generated learner content.

## Provenance and state

The generated bundle retains:

- exact Foundation fingerprint;
- Foundation Candidate ID;
- Course identity;
- exact coverage-model fingerprint;
- exact Course Knowledge Model fingerprint;
- generation context IDs;
- deterministic work-unit mappings; and
- pending Learn and Practice derived-asset records.

Generation contexts are retained so later independent asset assurance can use fresh contexts and explicitly exclude generation contexts.

Generation does **not** set asset assurance to PASS.

## Release safety

The runtime does not register pre-production content in the ordinary production `content/**` registry.

Production Pages must not expose AI-assured-only learner material. Internal browser/site testing should use retained pre-production artifacts through a test-only or future governed non-production deployment path.

The existing `assertFoundationDerivedAssetReleaseEligible` guard remains the release authority. Learner publication requires:

1. asset assurance PASS;
2. Foundation state `foundation_approved`; and
3. the asset Foundation fingerprint exactly matching the human-approved Foundation fingerprint.

## Next implementation slices

1. release a retained live Business Learn/Practice production proof using the exact AI-assured Business Foundation;
2. add independent asset assurance/remediation over that retained generated bundle;
3. add a test-only internal site preview adapter that consumes the retained bundle without entering Production Pages;
4. implement the separate Exam Prep Factory using Course Truth + Exam Truth; and
5. after qualified-human approval of the exact Foundation fingerprint, promote otherwise-valid assured assets through the learner-release controls.

## Documentation impact

ADR-0025 records the architecture choice. No normative authority changes are introduced by this implementation.
