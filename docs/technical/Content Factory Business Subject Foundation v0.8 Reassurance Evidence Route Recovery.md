# Content Factory Business Subject Foundation v0.8 Reassurance Evidence Route Recovery

**Status:** implementation correction awaiting governed PR assurance and post-merge fresh v0.8 reassurance.

## First triggering run — EnPress legacy route

Fresh v0.8 reassurance workflow run `36589766815` reviewed exact approved `main` SHA `a66e253b5bdebb3c0f23497528aeb8dfb32d6e56` against Business Foundation v0.8 fingerprint:

`8d3daa57cee2113839ee4ec2aaa0731cc4d25afd73224178da96d53d7ee848ec`

Retained artifact:

- artifact ID: `11043198393`;
- digest: `sha256:143e87caab90e7b209ede1db9c0ee21d87e1b794a63c4ae564b853bb61ec29ea`.

Deterministic v0.8 validation passed, including the 81-node identity, 14 changed nodes, 22 structured named facets, direct paternalistic-leadership evidence, corrected GOV.UK metadata and the 79-node prerequisite-complete AQA projection. The reassurance contract self-test also passed. Group 1 completed with decision `pass` and its retained minor BUS-FIN-008 factoring source-scope finding remains historical evidence.

Group 2 then stopped during evidence-contract validation with:

`BUS-PEO-001 evidence URL outside registered path for SRC-OER-HARD-SOFT-HRM-2024`

This stop was not an educational `fail_hold`. The runner had received a schema-valid provider review but rejected one evidence URL before a Group 2 quality decision could be retained.

### EnPress source and route investigation

The effective registered source remains:

- source ID: `SRC-OER-HARD-SOFT-HRM-2024`;
- publisher: Journal of Infrastructure, Policy and Development / EnPress;
- article: *Performance of public service employees in Makassar: Hard & soft analysis of human resource management approach*;
- DOI: `10.24294/jipd.v8i9.5910`;
- registered URL: `https://www.enpress-publisher.com/journal/JIPD/8/9/10.24294/jipd.v8i9.5910`;
- licence: CC BY 4.0;
- promotion eligibility: retained.

Fresh publication inspection confirmed that EnPress exposes the same article through its current registered route and publisher-controlled legacy `systems.enpress-publisher.com` article routes keyed to article ID `5910`. The article title, article identity and DOI are the same publication. This did not justify a host-wide exception and did not establish a provenance gap requiring a replacement source.

The failed run could not prove the exact provider-returned Group 2 URL because the runner validated the output before writing the Group 2 artifact. Only Group 1 was retained. The exact rejected URL was therefore not reconstructed or asserted after the fact.

The first recovery correction:

- preserved the canonical same-host registered-path/child-path rule;
- added source-ID-specific EnPress legacy-route equivalence only for article `5910`;
- retained schema-valid provider output before evidence validation;
- separated evidence-contract failure from educational `fail_hold`; and
- included actual and registered URLs in future route-validation errors.

## Second triggering run — publisher-hosted download route

After the first recovery was merged as PR `#435`, fresh v0.8 reassurance workflow run `36619201381` reviewed exact approved `main` SHA:

`c3cb0e8e2181a748ab250579304af50cdee1ba69`

against the same Business Foundation v0.8 fingerprint:

`8d3daa57cee2113839ee4ec2aaa0731cc4d25afd73224178da96d53d7ee848ec`

Retained artifact:

- artifact ID: `11058032016`;
- digest: `sha256:1ef297247e7932e22e216763d3696b9a261da4157a422885b65d6f28f91bd124`.

The exact-main identity check, deterministic v0.8 validation and reassurance contract self-test all passed. The fresh substantive reassurance then completed Groups 1, 2 and 3 before stopping in Group 4 (`Strategy, data and change remediation`) during evidence-contract validation.

The retained failure is:

`BUS-STR-009 evidence URL outside registered path for SRC-OER-ARC-STRATEGIC-DRIFT-2022: actual=https://arcjournals.org/arc_download.php?id=5805 registered=https://arcjournals.org/article/5805`

The runner correctly recorded:

- `status: evidence_contract_failure`;
- `qualityDecision: not_reached`;
- Groups 1–3 as completed;
- the Group 4 schema-valid provider response in `group-4-provider-output.json`; and
- the exact rejected and registered URLs.

This demonstrates that the first forensic-retention correction worked. This second stop is not evidence of a new educational failure.

### ARC route investigation

The effective registered source remains:

- source ID: `SRC-OER-ARC-STRATEGIC-DRIFT-2022`;
- publisher: ARC Journals;
- registered URL: `https://arcjournals.org/article/5805`;
- promotion eligibility: retained.

Fresh publication inspection confirmed that the registered ARC article page links to the publisher-hosted full-text download route `https://arcjournals.org/arc_download.php?id=5805`. Both routes carry the same publisher and publication identity `5805`.

The evidence contract therefore rejected an alternate representation of the registered publication rather than an unrelated source, mirror, aggregator or different article.

## Third triggering run — canonical DOI versus publisher article ID

After PR `#438` added the direct ESG-reporting source remediation, fresh v0.8 reassurance workflow run `36632074524` reviewed exact approved `main` SHA:

`2cf21d546b15b2e072dabb06bdf8d3d63f6df53d`

against Business Foundation v0.8 fingerprint:

`5ff48501805714be547b3c471eb2d984edd6ccd4dc0a7a59660d90a842dc2844`.

Retained artifact:

- artifact ID: `11063785064`;
- digest: `sha256:fe9b8b5c61fde8d86a8b7a099dc95d15e5712b0095a9a960f6a14e2e99ec8c7c`.

The exact-main identity check, deterministic v0.8 validation and reassurance contract self-test passed. Group 1 completed successfully. Group 2 then stopped during evidence-contract validation with:

`BUS-PEO-001 evidence URL outside registered path for SRC-OER-HARD-SOFT-HRM-2024: actual=https://www.enpress-publisher.com/files/journals/1/articles/5910/public/5910-31063-1-PB.pdf registered=https://www.enpress-publisher.com/journal/JIPD/8/9/10.24294/jipd.v8i9.5910`

The runner correctly recorded `status: evidence_contract_failure` and `qualityDecision: not_reached`; it did not convert the route mismatch into an educational `fail_hold`. The exact Group 2 provider output was retained before validation.

This failure exposed a remaining identity-representation gap in the otherwise class-level publisher-document rule. The registered EnPress route identifies the publication through DOI `10.24294/jipd.v8i9.5910`, while the publisher PDF route identifies the same publication through EnPress article ID `5910`. The existing validator only matched an identity that appeared literally in both URLs, so it could not prove that the DOI and publisher article ID were aliases for one publication.

The correction therefore adds an explicit source-scoped publication-identity alias for `SRC-OER-HARD-SOFT-HRM-2024`:

`10.24294/jipd.v8i9.5910` ↔ publisher article ID `5910`.

This is not a PDF-path exception. The generic same-host publisher-document rule remains responsible for validating the route shape. The alias only supplies the independently established publication identity that the canonical DOI URL does not otherwise expose as a standalone numeric path/query identifier.

The validator now accepts a same-host document route only when its extracted publication identity matches either the canonical registered identity or a source-scoped approved alias. It still rejects a neighbouring article ID such as `5911`, an unrelated same-host page, mirrors and cross-host substitutions.

## Revised classification

Across these failures, the underlying pattern is a **publisher-route representation defect in the reassurance evidence contract**, not repeated Business-content failure.

The safe classification is:

1. canonical registered publication URLs remain authoritative evidence anchors;
2. canonical same-host child paths remain accepted;
3. source-specific cross-host legacy equivalence remains explicit where independently verified, as with EnPress;
4. a same-host publisher document/download route may be treated as equivalent only when it carries a stable publication identity that exactly matches the registered publication or an explicitly registered source-scoped identity alias;
5. wrong publication IDs, unrelated same-host pages, mirrors, aggregators and cross-host substitutions remain rejected; and
6. a route-contract rejection remains `qualityDecision: not_reached`, not educational `fail_hold`.

No Business teaching content, node taxonomy, relationship graph, promotion-source mapping or candidate fingerprint is changed by this correction.

## Class-level implementation correction

The v0.8 reassurance runner retains the existing canonical and EnPress-specific legacy-route rules and uses a narrow publisher-document equivalence guard.

A same-host alternate document route is accepted only when all of the following are true:

1. the normalized publisher host exactly matches the registered host;
2. the actual route is document-shaped (`download`, `pdf`, `viewFile`, or a `.pdf` path);
3. the registered route exposes a stable publication identity through its canonical final numeric article identifier, query identifier or DOI, or the exact source has an independently established publication-identity alias; and
4. the actual document route carries that same exact publication identity in its path, query or DOI.

This is deliberately not a generic same-host exemption. It allows the ARC `article/5805` → `arc_download.php?id=5805` representation and the EnPress DOI canonical route → same-publisher article `5910` PDF representation while rejecting:

- `arc_download.php?id=5806`;
- an EnPress PDF for article `5911`;
- an unrelated same-host page carrying a valid-looking ID; and
- a document route on another host carrying the same numeric ID.

The reviewer instruction continues to state that publisher-hosted document/download routes are acceptable only where they preserve the same registered publication identity. DOI resolvers, mirrors, aggregators and unrelated same-host pages remain prohibited.

The no-spend reassurance self-test now proves:

- canonical EnPress evidence is accepted;
- verified EnPress legacy article and article-file routes for article `5910` are accepted;
- the current same-publisher EnPress PDF carrying article ID `5910` is accepted through the source-scoped publication alias;
- neighbouring EnPress article/PDF ID `5911` is rejected;
- the ARC publisher download route with matching article ID `5805` is accepted;
- the ARC download route with a different article ID is rejected;
- an unrelated ARC same-host route carrying `5805` is rejected; and
- a cross-host download route carrying `5805` is rejected.

## Historical evidence

Runs `36589766815`, `36619201381` and `36632074524`, and artifacts `11043198393`, `11058032016` and `11063785064`, remain unchanged historical evidence.

The missing Group 2 object from the first run is not backfilled. The second run's retained Group 4 provider output and the third run's retained Group 2 provider output remain unvalidated historical evidence and are not rewritten into a pass.

A fresh post-merge v0.8 reassurance must review the new exact approved `main` SHA. No partial run can be promoted into a pass.

## Required assurance for this correction

The governed PR must pass on its exact head:

1. `node scripts/assurance/validate-business-subject-foundation-v08-t8-remediation.mjs`;
2. `node scripts/assurance/business-subject-foundation-v08-t8-remediation-reassurance.mjs --self-test`;
3. the current AQA Course + Exam Truth deterministic compatibility workflow;
4. the current deterministic exact-course T8 compatibility workflow; and
5. full `Revision CI`.

After merge, run the fresh `Content Factory Business Subject Foundation v0.8 Reassurance` workflow against the new exact `main` SHA. Only a genuine fresh v0.8 PASS can unlock the already-planned AQA exact-course remediation; only a later fresh exact-course T8 PASS can unlock controlled internal learner-asset production.

## Documentation impact

No normative authority change or ADR is required. This correction implements the existing provenance, fail-closed assurance, historical-evidence preservation and smallest-safe-remediation rules. The technical record is additive; historical research and failed reassurance evidence are not rewritten.
