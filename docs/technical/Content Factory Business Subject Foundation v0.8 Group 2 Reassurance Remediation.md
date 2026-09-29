# Content Factory Business Subject Foundation v0.8 Group 2 Reassurance Remediation

**Status:** implementation candidate; requires exact-head deterministic assurance, full Revision CI, Founder-approved merge, then a fresh v0.8 reassurance on exact approved `main`.

## Triggering evidence

Fresh v0.8 reassurance workflow run `36632074524` ran on exact `main` SHA:

`2cf21d546b15b2e072dabb06bdf8d3d63f6df53d`

against candidate fingerprint:

`5ff48501805714be547b3c471eb2d984edd6ccd4dc0a7a59660d90a842dc2844`

Retained artifact:

- artifact ID: `11063785064`;
- digest: `sha256:fe9b8b5c61fde8d86a8b7a099dc95d15e5712b0095a9a960f6a14e2e99ec8c7c`.

Deterministic candidate validation and the no-spend reassurance self-test passed. Group 1 completed and passed. Group 2 provider output was retained before validation, then the workflow stopped with `evidence_contract_failure` and `qualityDecision: not_reached`.

The failed run remains immutable historical evidence. Its unvalidated provider output is not promoted into an assurance receipt or represented as a completed educational `fail_hold`.

## EnPress evidence-route classification

The failed evidence item was:

- source ID: `SRC-OER-HARD-SOFT-HRM-2024`;
- registered canonical publication page: `https://www.enpress-publisher.com/journal/JIPD/8/9/10.24294/jipd.v8i9.5910`;
- provider-returned evidence URL: `https://www.enpress-publisher.com/files/journals/1/articles/5910/public/5910-31063-1-PB.pdf`.

The registered page identifies the Journal of Infrastructure Policy and Development article as volume 8, issue 9, article `5910`, DOI `10.24294/jipd.v8i9.5910`, and links to the publisher-hosted PDF. The rejected PDF is on the same EnPress publisher host and inside the publisher's article-`5910` public-file path. This is the same approved publication, not a mirror, resolver, aggregator or materially different source.

Classification: **evidence-contract route-equivalence defect**, not a provenance failure and not an incorrectly registered canonical source.

The correction does not weaken same-host or publication-identity controls generally. `SRC-OER-HARD-SOFT-HRM-2024` receives one explicit permitted route prefix for EnPress article `5910` public files. Deterministic self-tests require the exact retained PDF route to pass while rejecting the adjacent article-`5911` route. Existing cross-host and unrelated-page rejection guards remain in force.

## Independently verified BUS-PEO-010 teaching defect

Although Group 2 did not reach a valid workflow quality decision, its retained provider output also identified a material issue in `BUS-PEO-010 / paternalistic_leadership`: the candidate explained retained authority, welfare/guidance and reciprocal loyalty but omitted moral leadership as a defining dimension.

That diagnostic output is not used as an assurance receipt. Before remediation, the issue was independently checked against the already registered promotion-eligible source `SRC-OER-FRONTIERS-PATERNALISTIC-LEADERSHIP-2020`. The Frontiers article defines paternalistic leadership as a multidimensional construct comprising authoritarianism, benevolence and morality, and describes moral leadership through personal virtue, self-discipline, unselfishness and role modelling.

The omission is therefore a genuine reusable teaching-content defect worth correcting before another paid reassurance run.

## Smallest-safe teaching correction

Historical `REMEDIATION.json` is not rewritten. New additive file `REASSURANCE_REMEDIATION_2.json` composes a targeted patch only over `BUS-PEO-010` and records the triggering failed run as `evidence_contract_failure / qualityDecision: not_reached`.

The patch:

- explicitly teaches the authoritarian, benevolent and moral dimensions of paternalistic leadership;
- distinguishes benevolent welfare concern from moral leadership/integrity;
- explains that reciprocal loyalty or obligation does not substitute for the moral dimension;
- retains the distinction from participative leadership and concentrated final decision authority;
- retains cultural/contextual limitations; and
- leaves the Tannenbaum-Schmidt facet unchanged.

No node ID, domain membership, prerequisite edge, relationship edge or source registration changes. The already mapped Frontiers source remains the direct promotion source. The changed teaching overlay participates in the effective v0.8 fingerprint, so prior reassurance results cannot be reused as a pass.

## Deterministic regression guards

Exact-head validation now fails if:

- the additive remediation is no longer bound to reassurance run `36632074524`;
- the historical failed run is reclassified as an educational assurance decision;
- the remediation expands beyond `BUS-PEO-010`;
- the effective paternalistic-leadership teaching no longer includes authoritarianism, benevolence and moral leadership;
- the moral dimension is no longer distinguished through integrity/virtue; or
- the existing direct Frontiers source ceases to be promotion-eligible CC BY 4.0 evidence for `BUS-PEO-010`.

The reassurance self-test additionally fails if the exact EnPress article-`5910` publisher PDF is rejected or an article-`5911` publisher PDF is accepted.

## Required gates

Before merge, the exact PR head must pass:

1. v0.8 remediation validation;
2. reassurance contract self-test;
3. Course + Exam Truth compatibility checks;
4. deterministic exact-course compatibility checks; and
5. full Revision CI.

The PR must not be merged without explicit Founder approval for that specific PR.

After merge, a fresh v0.8 reassurance must run against the new exact current `main` SHA and new exact candidate fingerprint. Only a genuine retained v0.8 `PASS` can advance to the already planned exact AQA Course Truth + Exam Truth remediation. A fresh exact-course T8 `PASS` remains required before controlled internal learner-asset production.

## Documentation impact

No normative authority or ADR change is required. This remediation follows the existing Subject Knowledge Foundation / Course Projection authority, AI-Assured Foundation Gate, provenance standard and testing/assurance controls. It changes implementation evidence and reusable teaching content only, so the additive research evidence layer, loader/validator/runner implementation and this technical record are updated together. Historical reassurance artifacts and prior Foundation evidence remain unchanged.
