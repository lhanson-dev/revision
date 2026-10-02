# Content Factory Business Subject Foundation v0.8 T8 Remediation

**Status:** implementation candidate; not promoted or assured until the post-merge v0.8 reassurance passes on exact approved `main`.

## Why this exists

The first post-merge T8 exact-course assurance for AQA A-level Business 7132 — 2027 ran on `main` SHA `fa3f862055941abb8bf5ed33460a1d18eff55715` as workflow run `36551801263`. Deterministic assurance passed and the fresh official-AQA reference challenge produced no external-source findings. The independent educational review correctly returned `fail_hold` with four material findings.

The remediation does not restart the Business Foundation. It preserves the exact reassured v0.7 baseline and changes only the smallest governing layers required by the T8 findings.

## Governing split

The active Subject Knowledge Foundation / Course Projection authority requires reusable subject gaps to be fixed in the reusable Foundation, while AQA-specific conventions remain in Course Truth.

The remediation therefore has two governed stages:

1. **v0.8 reusable Business Foundation remediation and fresh reassurance** — this PR/capability;
2. **exact AQA Course Truth remediation** — a subsequent PR only after the v0.8 fingerprint has passed reassurance.

Learner Learn/Practice/Exam Prep generation remains blocked until exact-course T8 passes again.

## v0.8 Foundation scope

v0.8 composes over exact Business v0.7 fingerprint:

`64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53`

It preserves:

- all 81 existing subject-node IDs;
- domain membership;
- prerequisite/relationship edges;
- the prior accepted assurance for 67 unchanged nodes; and
- all historical v0.7 evidence unchanged.

Fourteen nodes receive targeted structured teaching enrichment. The additions cover the reusable Business concepts that T8 showed were not sufficiently teachable from the selected Foundation: stakeholder power-interest mapping; debt factoring; crowdfunding; hard/soft HRM; organic/mechanistic structures; paternalistic leadership; Tannenbaum-Schmidt; works councils/representative consultation; Handy culture types; emerging economies/MNEs; local responsiveness versus cost pressure; Carroll CSR; Triple Bottom Line; Kaizen; benchmarking; Porter generic strategies; integration types; retrenchment; big data; data mining; Kotter-Schlesinger resistance responses; and strategic drift.

Each addition is stored as a structured named facet with explanation, distinctions, application and boundaries. This avoids treating an AQA facet identifier as evidence of teachable coverage.

## Provenance and rights boundary

AQA remains reference-only alignment/assessment evidence. No awarding-body material is promoted to reusable subject truth.

v0.8 adds promotion-eligible CC BY 4.0 or OGL sources where the existing reusable evidence set was not sufficiently direct for the new facet. Deterministic validation rejects excluded/awarding-body sources in promotion truth. The fresh reviewer is restricted to the registered promotion-permitted publications and the returned evidence URLs must remain on the registered publication path.

## AQA prerequisite closure

The T8 finding on `BUS-MKT-001` is a course-projection defect, not a reason to rewrite the node. `BUS-MKT-001` is already assured reusable Business truth and is an explicit prerequisite of selected marketing nodes.

The deterministic v0.8 validator recomputes transitive prerequisite closure from all 42 AQA mapping rows. The required target is 79 of 81 reusable nodes:

- `BUS-MKT-001` is restored by prerequisite closure;
- `BUS-PEO-003` remains outside the AQA projection; and
- `BUS-MOD-004` remains outside the AQA projection.

This is not a hardcoded convenience selection: the validator fails if the current graph produces a different closure or any selected node has an omitted prerequisite.

The actual Course Truth/runtime crosswalk is deliberately not changed in the v0.8 Foundation PR. It will be changed only after v0.8 reassurance passes.

## Fresh v0.8 reassurance

The post-merge workflow `Content Factory Business Subject Foundation v0.8 Reassurance` runs only by explicit `workflow_dispatch` on an exact current `main` SHA.

It performs:

1. deterministic candidate/provenance/AQA-closure validation;
2. a no-spend contract self-test;
3. four fresh independent changed-scope review groups covering all 14 changed nodes and all 22 structured facets;
4. permitted-source web evidence checks for every changed node/facet; and
5. a final changed-scope/whole-subject integration review for cross-domain contradiction, dependency consistency, duplication and major Level 3 scope gaps.

Any blocking/material finding returns `fail_hold`. Minor findings may pass but remain retained. A spend/provider pause cannot be represented as a pass: the workflow requires a retained final receipt with `finalDecision=pass`.

The run uses the existing quality-first bootstrap guardrail: deterministic work is deterministic, prior accepted evidence is reused for unchanged nodes, and provider spend is bounded to a default US$15 execution slice and never above the governed US$20 single-course ceiling.

## First v0.8 reassurance result and targeted provenance correction

The first post-merge v0.8 reassurance ran as workflow `36560923261` on exact `main` SHA `5ca8d6e2e41ab4b03f03f1080ad0adc3ce5919fe` against candidate fingerprint:

`987454817b031eaafb00129fae72b86a3b9a0c69c6e48be9f6f80368fdd1e192`

The deterministic candidate and 79-node AQA prerequisite closure checks passed. Review group 1 passed. Review group 2 returned `fail_hold` on one material provenance finding only: `BUS-PEO-010 / paternalistic_leadership` was judged factually accurate and sufficiently deep, but the then-mapped reusable sources did not directly support the paternalistic-leadership construct.

The retained failed reassurance artifact remains the historical evidence for that exact fingerprint. The candidate had not passed reassurance and had not become an assured dependency set, so the smallest-safe correction is a source-only augmentation that deliberately changes the candidate fingerprint without changing the 81-node taxonomy, teaching facet wording or dependency graph.

`SOURCE_AUGMENTATIONS_2.json` adds a direct promotion-eligible CC BY 4.0 Frontiers source covering paternalistic leadership as retained authority combined with benevolence/welfare and moral leadership, including reciprocal subordinate obligation and the differing effects/limitations of authoritarian versus benevolent/moral dimensions. `BUS-PEO-010` is explicitly mapped to that source. The pre-existing open leadership sources remain mapped for comparison with participative/autocratic/delegative approaches.

Deterministic validation now fails if this direct paternalistic-leadership source is absent, non-promotion-eligible or no longer recorded as CC BY 4.0. A fresh reassurance must run against the new exact fingerprint; the previous `fail_hold` cannot be reused as a pass.

## Second reassurance run: provider failure, not educational fail-hold

After the paternalistic-leadership provenance correction, fresh reassurance workflow `36568614490` ran on exact `main` SHA `052dd804f0b8a018812951d754b58293a0c1c106` against candidate fingerprint:

`2d7322d9bdae2bf617f3ca7fc2e8724d62f88cd017d3b88c13cbef0ed8c8a46d`

The deterministic v0.8 validation, 81-node identity, 79-node AQA prerequisite closure and reassurance self-test all passed. Review group 1 also completed and passed. Its only retained finding was minor source-metadata drift: the registered `SRC-GOVUK-SHAREHOLDER-RIGHTS-2026` record stated that GOV.UK CG50200 had been updated on 23 September 2026, while the live GOV.UK page reported 28 September 2026. The educational claims and OGL v3 rights boundary remained supported.

The run then failed while obtaining the next structured provider response. The provider returned unusable/truncated JSON after the bounded provider attempts, ending with `Unterminated string in JSON`. Because no valid Group 2 review object existed, the run produced **no educational quality decision** for Group 2, Groups 3–4 or the integration review. This is provider/infrastructure failure evidence, not `fail_hold` evidence.

The retained artifact is:

- workflow run: `36568614490`;
- artifact: `11032864248`;
- digest: `sha256:525783e404e8c19b5601aa8770e8c88d19e61cd5e73a630a51f0ac291607a626`.

The artifact retains the completed Group 1 pass. It is historical partial evidence only and cannot be promoted into a full v0.8 reassurance pass.

### Source metadata correction

The minor GOV.UK metadata correction is applied through `SOURCE_METADATA_PATCHES.json` rather than rewriting the historical v0.7 remediation record. The effective source record now states that CG50200 was checked on 29 September 2026 and reports the page update date as 28 September 2026.

Because current promotion-source metadata participates in the governed candidate evidence, this patch is included in the v0.8 candidate fingerprint. The next reassurance therefore runs against a new exact fingerprint even though the teaching content, node graph, source rights and educational claims are unchanged.

### Provider-contract hardening

The v0.8 reassurance runner is hardened under the existing provider-contract, testing and bootstrap-cost authorities:

- structured-output allowance increases from 6,000 to 12,000 tokens so larger four-node review groups are not forced into the previously observed truncation boundary;
- provider responses explicitly marked incomplete are treated as retryable infrastructure/provider failures;
- malformed JSON remains bounded-retryable;
- a completed response that violates the requested schema is not blindly retried;
- all paid provider attempts are accumulated in observed spend rather than reporting only the final successful attempt;
- pre-call spend reservation is retry-aware and reserves for the bounded two-attempt policy;
- provider/infrastructure exhaustion writes `provider-failure.json` with `qualityDecision: not_reached`, preserving the distinction from an educational `fail_hold`; and
- the two-attempt maximum, default US$15 execution slice and governed US$20 hard course ceiling remain unchanged.

The no-spend self-test deterministically checks incomplete-response classification and retry-aware reserve behaviour. The normal v0.8 deterministic validator separately checks the effective GOV.UK metadata correction, direct paternalistic-leadership provenance, 81-node identity and 79-node AQA closure.

## What a v0.8 PASS means

A successful v0.8 reassurance means only that the reusable Business Foundation changes are sufficiently assured to be used by the next controlled exact-course projection step. It does **not** mean:

- the AQA exact course is T8 `ai_assured`;
- learner assets may be generated;
- the Foundation is qualified-human approved; or
- learner publication is eligible.

## Required follow-up after v0.8 PASS

The subsequent exact-course remediation must:

- bind Course Truth to the exact reassured v0.8 fingerprint/receipt;
- recompute and materialise the 79-node prerequisite-complete AQA selection, including `BUS-MKT-001`;
- bind each required AQA named facet to the corresponding structured reusable Foundation facet rather than carrying only an identifier;
- add rights-safe AQA-specific quantitative/presentation conventions for decision-tree net gain, inventory control, employee-cost/labour-cost measures, working-capital ratios, ARR/NPV conventions and network diagrams;
- update the runtime crosswalk and fingerprints;
- rerun deterministic exact-course assurance; and
- rerun the fresh T8 independent review + official-AQA source challenge.

Only a new exact-course T8 PASS can unlock controlled internal learner-asset derivation. Qualified human approval and learner-publication eligibility remain later gates.

## Documentation impact

No normative authority change is required: the remediation and provider recovery follow the current Subject Knowledge Foundation / Course Projection, AI-Assured Foundation Gate, Testing & Assurance and Content Factory bootstrap-cost authorities. No ADR is required because the architecture boundary, assurance gates and spend ceiling are unchanged. This document records implementation and assurance behaviour only; historical v0.7, failed v0.8 and provider-failure evidence remain unchanged.


## Post-#499 T8 fail-hold and bounded follow-up — 2 October 2026

Fresh exact-course proof run `37024423431` ran on exact `main` SHA `22519cb71ac09b4481621f670aea3b447ea9214a`. Deterministic assurance and the official AQA source check passed. The fixed-checklist review reused 31 unchanged section fingerprints, freshly reviewed 11 sections, and returned `fail_hold` on two blocking gaps. Conservative provider spend was US$0.354888 of the US$12 cap.

The two findings are intentionally fixed at different layers:

- **3.1.3 market conditions** is reusable Business knowledge. `POST_MERGE_T8_FIXES.json` adds one source-bound definition to `BUS-FND-009`, and the v0.8 loader includes that overlay in the candidate fingerprint and `changedSinceAssurance` set.
- **3.10.3 network-diagram presentation** is an AQA-specific convention. It remains outside the reusable Business Foundation. The AQA mapping states the rights-safe activity-on-arrow presentation convention and the existing `network-analysis` named item carries it as `aqa_convention`, so downstream Blueprint/Learn/Practice generation receives the exact course convention without treating it as universal subject truth. The official AQA network-analysis teaching guide and sample Paper 1 are retained as REFERENCE_ONLY alignment evidence.

The failed run ledger is retained because the fast-path rule preserves valid item-level evidence even when another item blocks. A fresh post-merge T8 run must therefore review only units whose exact fingerprints change; it must not repurchase unchanged section reviews. No learner-publication, qualified-human-review or `foundation_approved` gate is changed.

Committed Learn/Practice assets follow the same fail-closed rule: repository-wide software re-proof treats an asset as current only when its accepted ledger fingerprint reconstructs exactly from the current Blueprint, Foundation teaching, sources and asset bytes. Fingerprint-stale assets are not reclassified as valid and are not regenerated before T8; the targeted resume proof records them for the post-T8 refresh.

### Documentation impact

No normative authority or ADR change is required. This is a bounded implementation/evidence correction under the existing Subject Knowledge Foundation / Course Projection and Fast-Path authorities. Historical T8 evidence remains unchanged; the run log appends the new failure and fixes.
