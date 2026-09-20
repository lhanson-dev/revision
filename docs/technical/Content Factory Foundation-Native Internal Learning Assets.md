# Content Factory Foundation-Native Internal Learning Assets

**Status:** Current implementation contract after ADR-0025; Foundation-native asset assurance proposed in ADR-0026  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md` plus `Content Factory AI-Assured Foundation Gate Amendment.md` and `Content Accuracy Assurance Gate.md`

## Purpose

Define the clean learner-asset production and assurance boundary after a Foundation reaches `ai_assured`.

This runtime is pre-production only. It creates Learn and Practice material, proves the generated bundle against the exact Foundation, independently challenges that learner content in fresh contexts, and can then exercise assured material through internal test/preview paths while qualified-human Foundation review proceeds separately.

## Inputs

The producer requires:

- a Foundation job in `ai_assured`, `expert_review` or `foundation_approved`;
- the exact Foundation Coverage Model identified by the Candidate;
- the exact Course Knowledge Model identified by the Candidate;
- structured Learn and Practice workers; and
- a production timestamp/asset identity.

The runtime fails closed if the supplied coverage fingerprint or Course Knowledge Model fingerprint does not match the Candidate, or if the artifacts belong to a different Foundation job.

Asset assurance additionally requires the exact retained generated bundle, the exact Coverage Model and Course Knowledge Model bound to that bundle, and independent review workers whose contexts have not been used by Foundation generation/assurance, external challenge or Learn/Practice generation.

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

### Retained proof #5 successful production

After the provider-contract repair merged, retained Business proof run `35468029336` completed successfully on generation implementation commit `1444af1f7a3c33e8902b0c148a5e18ec8634235b` against the unchanged Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

The retained artifact is `content-factory-foundation-internal-learning-proof-1444af1f7a3c33e8902b0c148a5e18ec8634235b`, artifact ID `10592980673`, digest `sha256:4d463ff3a8d6473a53b8fab1ee1074195ed41a2938ac8801b2db4359fc0a2863`.

The retained evidence records:

- 49 deterministic Foundation work units;
- 49 successful Learn generation calls and 49 successful Practice generation calls;
- 98 successful provider calls in total;
- zero provider retries across those 98 calls;
- 98 unique generation context IDs with zero collision against the Foundation's earlier generation, assurance or external-challenge contexts;
- provider/model `openai` / `gpt-5.6-terra`, contract version `4` for every call;
- `$1.766944` of reported final-response usage cost across all 98 calls, explicitly not represented as retry-complete total spend;
- one aggregate Learn derived asset and one aggregate Practice derived asset, both still `assuranceStatus: pending` at the end of generation;
- qualified-human review pending, Foundation not approved and learner publication false.

A successful production proof therefore proves complete controlled generation from the exact AI-assured Foundation. It does not prove asset assurance or release eligibility.

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

Generation contexts are retained so independent asset assurance can explicitly exclude them.

Generation does **not** set asset assurance to PASS.

## Foundation-native asset assurance

`runFoundationInternalLearningDeterministicAssurance` and `assureFoundationInternalLearningAssets` form the Foundation-native assurance boundary recorded by ADR-0026.

Before an independent reviewer is called, deterministic assurance verifies:

- the Foundation state remains eligible for controlled internal asset assurance;
- exact Foundation fingerprint and Candidate identity;
- exact Coverage Model and Course Knowledge Model fingerprints and job ownership;
- the generated work-unit plans equal the plans reconstructed deterministically from Foundation coverage and Course Truth;
- required Learn sections and worked examples are present where planned;
- Practice contains the planned modes and no unplanned modes;
- exact teaching-point evidence remains valid for both Learn and Practice;
- the generated bundle contains exactly two generation contexts per work unit, with no duplicate generation context;
- generation contexts do not collide with Foundation generation, Foundation assurance or external-source challenge contexts; and
- both aggregate derived assets are still pending when they enter assurance.

A deterministic failure returns `fail_hold` before independent review and cannot mark an asset assured.

### Independent review

Each deterministic work unit is then challenged in its own fresh independent-review context. The reviewer receives only:

- exact course identity;
- exact Foundation and generated-bundle fingerprints;
- the work-unit plan and governed teaching points;
- the relevant structured coverage requirements;
- the relevant structured Course Truth knowledge nodes; and
- the Revision-owned generated Learn and Practice output for that work unit.

Protected awarding-body source prose is not supplied.

Every asset-review context must be different from:

- Foundation generation contexts;
- Foundation independent-assurance contexts;
- the Foundation external-source-challenge reviewer context;
- every retained Learn/Practice generation context; and
- every earlier asset-review context in the same assurance run.

The review is adversarial rather than editorial. It is asked to identify factual distortion, omitted conditions, misleading certainty, curriculum drift, invalid misconceptions, weak or misleading pedagogy, internally inconsistent practice, incorrect expected responses and quantitative errors. Where quantitative material is present, the reviewer is instructed to recompute calculations or conclusions independently from the supplied structured facts and generated values.

The review returns a machine-readable decision and issue register. A clean work unit returns `pass`; open minor findings require `conditional_pass`; open blocking/material findings require `fail_hold`.

### Remediation and assurance state

Findings are converted into smallest-scope remediation targets by work unit and affected asset kind (`learn`, `practice` or `both`). Non-pass assurance does not mark either aggregate asset assured.

Only when deterministic assurance passes and every independent work-unit review passes does Revision call `recordFoundationDerivedAssetAssurance` for the aggregate Learn and Practice records. The evidence reference is retained on both assets.

If an asset-local defect is found, remediation should replace only the smallest safe affected content and rerun the affected deterministic/independent assurance. If the review reveals a credible Foundation defect, asset work must stop and the Foundation must be reopened through a new Candidate/version rather than patching content around incorrect Course Truth.

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

## Retained live asset-assurance proof

`Content Factory Foundation Internal Learning Assurance Proof` is the retained operational proof for the new assurance boundary.

It consumes three exact retained packages:

1. the Foundation Live Proof;
2. the AI-Assured Foundation Proof; and
3. the successful Foundation Internal Learning Proof.

The workflow verifies workflow identity, successful state, exact head SHA, artifact identity, digest, expiry and Foundation fingerprint before running assurance. It then runs the deterministic assurance described above and one high-reasoning independent review per deterministic work unit.

The trigger marker is `revision-run-foundation-internal-learning-assurance-proof:v1`. The trigger binds the exact source run/artifact/head, AI-assured run/artifact/head, internal-learning run/artifact/head and Foundation fingerprint. The workflow retains PASS, conditional/fail-hold or outer failure evidence for 30 days and records reviewer context/cost provenance.

For the Business proof configuration, asset review uses `gpt-5.6-terra`, high reasoning, a 5,000-output-token cap per work-unit review and a US$12 hard provider spend ceiling. A successful run is not assumed by implementation; the exact retained proof must be executed and inspected after this implementation reaches approved `main`.

## Release safety

The runtime does not register pre-production content in the ordinary production `content/**` registry.

Production Pages must not expose AI-assured-only learner material. Internal browser/site testing should use retained pre-production artifacts through a test-only or future governed non-production deployment path.

The existing `assertFoundationDerivedAssetReleaseEligible` guard remains the release authority. Learner publication requires:

1. asset assurance PASS;
2. Foundation state `foundation_approved`; and
3. the asset Foundation fingerprint exactly matching the human-approved Foundation fingerprint.

Passing Foundation-native asset assurance while the Foundation remains `ai_assured` therefore still produces release problems stating that qualified-human `foundation_approved` state is required.

## Next implementation slices

1. merge and execute the retained fresh-context Business Learn/Practice asset-assurance proof against successful generation run `35468029336`;
2. if the retained proof passes, add a test-only internal site preview adapter that consumes the exact retained assured bundle without entering Production Pages;
3. if the retained proof returns findings, remediate only the smallest safe affected work units and re-assure them before preview integration;
4. implement the separate Exam Prep Factory using Course Truth + Exam Truth; and
5. after qualified-human approval of the exact Foundation fingerprint, promote otherwise-valid assured assets through the learner-release controls.

## Documentation impact

ADR-0025 records the Foundation-native generation architecture. ADR-0026 records the Foundation-native asset-assurance boundary. This implementation record preserves the earlier proof #3 failure, records the successful proof #5 generation evidence, and defines the retained fresh-context assurance proof without changing normative Content Factory authority. Historical evidence is not rewritten.