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

Each returned Learn/Practice output must provide auditable teaching-point evidence. The provider-facing structured-output contract constrains `coverageEvidence` to the exact number of required teaching points and only permits the exact governed teaching-point strings supplied for that work unit. Revision then resolves each structured evidence location into generated learner text, and the downstream evidence validator remains the final deterministic proof that every assigned teaching point is represented exactly as required.

### Retained proof #3 contract finding

The retained Business proof run `35458295457` reached real Learn/Practice generation and correctly fail-held on the `Management and Leadership` Learn work unit after the provider returned structurally valid output that did not evidence the exact governed teaching point. Eleven generation calls had been made at that point; the retained failure evidence reports `$0.191054` of final-response usage cost, which is not represented as retry-complete total spend.

The failure exposed implementation drift between the worker instruction and the structured provider schema: the instruction required every teaching point exactly once, while the schema previously required only a non-empty evidence array. The repair binds evidence cardinality and allowed teaching-point labels directly into the strict provider schema for both Learn and Practice. The existing downstream exact teaching-point validator is unchanged and remains fail-closed. The failed run remains historical evidence and is not rewritten.

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

## Retained live production proof

`Content Factory Foundation Internal Learning Proof` operationalises the producer for the current AQA A-level Business 7132 — 2027 pilot.

The proof does not rebuild or reinterpret the Foundation. It consumes two retained evidence packages by exact workflow run, artifact identity, digest and fingerprint:

1. the Foundation Live Proof package containing the exact structured Foundation artifacts; and
2. the AI-Assured Foundation Proof package proving the same exact Foundation fingerprint reached `ai_assured`.

The workflow verifies both packages before any model call, reconstructs the `ai_assured` job from the retained final Candidate, and then extracts the exact Coverage Model and Course Knowledge Model whose fingerprints are recorded on that Candidate.

The generation implementation commit is recorded separately from the historical Foundation Candidate implementation commit. A newer asset-generator implementation therefore does not mutate Foundation identity or claim that the Foundation itself was regenerated.

For the current Business proof:

- the provider model is `gpt-5.6-terra`;
- generation uses medium reasoning effort;
- each bounded call is limited to 4,000 output tokens;
- the provider client enforces a **US$12 hard spend ceiling** before starting further calls, which remains below the active US$20 complete-course production ceiling; and
- the retained evidence records per-run provider/model/retry provenance and final-response usage cost where supplied by the provider.

The sum of reported final-response `usageCost` values is explicitly **not** represented as retry-complete total spend. The provider's internal hard-ceiling accounting remains the operational spend control.

The proof fails closed if exact evidence identity, fingerprints, Foundation state, structured artifact ownership, generation contracts or spend controls fail. Whether PASS or fail-hold, it cannot mark an asset assured or learner-publication eligible.

## Release safety

The runtime does not register pre-production content in the ordinary production `content/**` registry.

Production Pages must not expose AI-assured-only learner material. Internal browser/site testing should use retained pre-production artifacts through a test-only or future governed non-production deployment path.

The existing `assertFoundationDerivedAssetReleaseEligible` guard remains the release authority. Learner publication requires:

1. asset assurance PASS;
2. Foundation state `foundation_approved`; and
3. the asset Foundation fingerprint exactly matching the human-approved Foundation fingerprint.

## Next implementation slices

1. execute and retain the live Business Learn/Practice production proof using the exact AI-assured Business Foundation;
2. add fresh-context independent asset assurance/remediation over that retained generated bundle;
3. add a test-only internal site preview adapter that consumes the retained assured bundle without entering Production Pages;
4. implement the separate Exam Prep Factory using Course Truth + Exam Truth; and
5. after qualified-human approval of the exact Foundation fingerprint, promote otherwise-valid assured assets through the learner-release controls.

## Documentation impact

ADR-0025 records the architecture choice. The retained proof workflow operationalises that existing decision and does not change normative Content Factory authority. This implementation record retains the proof #3 failure and the provider-contract hardening that follows from it; no normative authority or ADR change is required. `INDEX.md` points to this implementation contract and the ADR-0025 decision history.