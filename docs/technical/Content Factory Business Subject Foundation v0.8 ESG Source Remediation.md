# Content Factory Business Subject Foundation v0.8 ESG Source Remediation

**Status:** targeted source-only remediation candidate; not assured or promotable until exact-head PR gates pass and a fresh post-merge v0.8 reassurance returns a genuine `pass`.

## Trigger

Fresh v0.8 reassurance workflow run `36627655202` executed against exact approved `main` SHA `430c7ecee5d98c88804be435ac5254a15bb793f1` and candidate fingerprint `8d3daa57cee2113839ee4ec2aaa0731cc4d25afd73224178da96d53d7ee848ec`.

The run completed with a genuine educational `fail_hold`, not a provider, infrastructure or evidence-route failure. Retained evidence:

- workflow run: `36627655202`;
- artifact: `11060759556`;
- artifact digest: `sha256:ed7ff42cf7821a8a6a6390cd41b857726816660e37a753a8e77d03812dbd2e72`;
- failed review group: `External, sustainability and operations remediation`;
- finding: `F-BUS-EXT-006-ESG-SOURCE-GAP`;
- affected node: `BUS-EXT-006`.

Review Groups 1 and 2 passed. In Group 3, `BUS-EXT-006` passed factual accuracy, Level 3 depth, relationships and boundaries but received a material source-support finding. Group 4 therefore did not run.

## Finding

The existing registered promotion sources support net zero, environmental claims and Triple Bottom Line, but they did not directly support the node's central ESG reporting/disclosure treatment strongly enough. The retained reviewer evidence specifically identified two missing support areas:

1. the distinction between ESG disclosure/reporting and actual sustainability performance; and
2. limitations arising from differing ESG metrics, rating methodologies and comparability.

The teaching treatment itself was not found materially inaccurate or under-depth. The smallest-safe correction is therefore a source/provenance remediation rather than a teaching rewrite.

## Remediation

`SOURCE_AUGMENTATIONS_3.json` adds one promotion-eligible reusable subject-truth source:

- source ID: `SRC-OER-FRONTIERS-ESG-COMMENSURABILITY-2022`;
- issuer: Frontiers in Sustainability;
- publication: *ESG metrics and social equity: Investigating commensurability*;
- DOI: `10.3389/frsus.2022.920955`;
- published: 21 September 2022;
- licence: Creative Commons Attribution (`CC BY` / recorded as `CC_BY_4_0`);
- promotion mapping: `BUS-EXT-006` only.

The source directly discusses ESG information disclosure standards and their variation, and the divergence of ESG metrics caused by differences in scope, measurement and weighting. It is therefore used narrowly to support the disclosure-versus-performance distinction and the limitations of metric/rating comparability.

The source restrictions explicitly prevent treating disclosure alone as proof of real-world sustainability performance or turning any named commercial rating methodology, dataset or empirical result into a universal rule.

## Candidate composition and deterministic guard

The v0.8 candidate loader now composes `SOURCE_AUGMENTATIONS_3.json` as an additional evidence layer. The historical v0.8 remediation, earlier source augmentations and failed reassurance evidence are not rewritten.

Because promotion-source composition is governed candidate evidence, the augmentation participates in the candidate fingerprint. The corrected candidate must therefore receive a new exact fingerprint; the prior failed fingerprint cannot be reused as assurance evidence.

The deterministic v0.8 validator now fails if:

- `BUS-EXT-006` does not include `SRC-OER-FRONTIERS-ESG-COMMENSURABILITY-2022`;
- the source is not promotion eligible; or
- its recorded licence is no longer `CC_BY_4_0`.

The existing guards remain unchanged for the 81-node taxonomy, 14-node fresh review scope, 67 preserved nodes, 22 structured facets, source-rights boundary, AQA 42-requirement mapping and 79-node prerequisite-complete projection.

## Scope deliberately not changed

This remediation does **not** change:

- `BUS-EXT-006` teaching wording or named facets;
- any other node teaching content;
- node IDs, taxonomy or domain membership;
- prerequisite or relationship edges;
- AQA Course Truth or Exam Truth;
- the exact-course runtime crosswalk; or
- previously retained historical assurance evidence.

## Required assurance

Before merge, the exact PR head must pass the v0.8 remediation workflow and full Revision CI.

After merge, `Content Factory Business Subject Foundation v0.8 Reassurance` must be dispatched against the new exact current `main` SHA. The fresh reviewer must see the corrected promotion source composition. Only a genuine `finalDecision=pass` progresses the workstream to the governed exact-course remediation/proof stage. Another material educational finding remains `fail_hold`; provider/infrastructure or evidence-contract failures remain distinct and cannot be treated as an educational decision.

## Documentation impact

No normative authority or ADR change is required. This correction follows the existing Subject Knowledge Foundation / Course Projection, source licensing/provenance, assurance and Content Factory operating authorities. This document records the implementation and assurance lineage only. Historical failed evidence remains immutable.
