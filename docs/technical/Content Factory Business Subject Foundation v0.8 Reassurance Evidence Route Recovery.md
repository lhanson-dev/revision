# Content Factory Business Subject Foundation v0.8 Reassurance Evidence Route Recovery

**Status:** implementation correction awaiting governed PR assurance and post-merge fresh v0.8 reassurance.

## Triggering run

Fresh v0.8 reassurance workflow run `36589766815` reviewed exact approved `main` SHA `a66e253b5bdebb3c0f23497528aeb8dfb32d6e56` against Business Foundation v0.8 fingerprint:

`8d3daa57cee2113839ee4ec2aaa0731cc4d25afd73224178da96d53d7ee848ec`

Retained artifact:

- artifact ID: `11043198393`;
- digest: `sha256:143e87caab90e7b209ede1db9c0ee21d87e1b794a63c4ae564b853bb61ec29ea`.

Deterministic v0.8 validation passed, including the 81-node identity, 14 changed nodes, 22 structured named facets, direct paternalistic-leadership evidence, corrected GOV.UK metadata and the 79-node prerequisite-complete AQA projection. The reassurance contract self-test also passed. Group 1 completed with decision `pass` and its retained minor BUS-FIN-008 factoring source-scope finding remains historical evidence.

Group 2 then stopped during evidence-contract validation with:

`BUS-PEO-001 evidence URL outside registered path for SRC-OER-HARD-SOFT-HRM-2024`

This stop is not an educational `fail_hold`. The runner had received a schema-valid provider review but rejected one evidence URL before a Group 2 quality decision could be retained.

## Source and route investigation

The effective registered source remains:

- source ID: `SRC-OER-HARD-SOFT-HRM-2024`;
- publisher: Journal of Infrastructure, Policy and Development / EnPress;
- article: *Performance of public service employees in Makassar: Hard & soft analysis of human resource management approach*;
- DOI: `10.24294/jipd.v8i9.5910`;
- registered URL: `https://www.enpress-publisher.com/journal/JIPD/8/9/10.24294/jipd.v8i9.5910`;
- licence: CC BY 4.0;
- promotion eligibility: retained.

Fresh publication inspection confirmed that EnPress exposes the same article through its current registered route and publisher-controlled legacy `systems.enpress-publisher.com` article routes keyed to article ID `5910`. The article title, article identity and DOI are the same publication. This does not justify a host-wide exception and does not establish a provenance gap requiring a replacement source.

The failed run cannot prove the exact provider-returned Group 2 URL because the runner validated the output before writing the Group 2 artifact. Only Group 1 was retained. The exact rejected URL must therefore not be reconstructed or asserted after the fact.

## Classification

The smallest safe classification is a **source-specific evidence-route contract defect**, compounded by a **forensic retention defect**:

1. the source registration is still a valid canonical publication route;
2. the reusable provenance remains promotion-eligible and publication-identical;
3. the validator was too rigid for this verified publisher migration/legacy-route case;
4. the validator must not be relaxed for arbitrary same-host paths, DOI resolvers, mirrors or aggregators; and
5. future schema-valid provider output must be retained before evidence-contract validation so a rejection is auditable.

No Business teaching content, node taxonomy, relationship graph, promotion-source mapping or candidate fingerprint is changed by this correction.

## Implementation correction

The v0.8 reassurance runner now:

- preserves the existing canonical same-host registered-path/child-path rule;
- adds a source-ID-specific equivalence rule only for `SRC-OER-HARD-SOFT-HRM-2024` and EnPress legacy article-ID `5910` routes;
- continues to reject adjacent article IDs and unrelated publisher paths;
- instructs the reviewer to prefer the registered URL and forbids substitution of DOI resolvers, mirrors, aggregators or unrelated same-host pages;
- includes both actual and registered URLs in any future path-validation error;
- writes `group-N-provider-output.json` before evidence validation;
- writes `validation-failure.json` with `qualityDecision: not_reached` when a schema-valid provider response fails the evidence contract; and
- only writes the normal validated `group-N.json` after evidence validation succeeds.

The no-spend reassurance self-test now proves that:

- the registered EnPress route is accepted;
- the verified legacy article route for article `5910` is accepted;
- the verified legacy article-file route for article `5910` is accepted; and
- a neighbouring EnPress article ID remains rejected.

This prevents the same failure mode from recurring silently while keeping the evidence boundary fail-closed.

## Historical evidence

Run `36589766815` and artifact `11043198393` remain unchanged historical evidence. The absent Group 2 object is not backfilled. Earlier Foundation evidence is not rewritten.

A fresh post-merge v0.8 reassurance must review the new exact approved `main` SHA. The previous partial run cannot be promoted into a pass.

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