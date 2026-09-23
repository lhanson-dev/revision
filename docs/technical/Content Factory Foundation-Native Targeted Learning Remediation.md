# Content Factory Foundation-Native Targeted Learning Remediation

**Status:** Current implementation contract for remediating independently assured Foundation-native Learn/Practice bundles  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Related implementation:** `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`

## Purpose

Define the smallest-safe-scope remediation boundary for Foundation-native Learn and Practice assets when fresh independent assurance returns blocking, material or minor findings against an otherwise structurally valid generated bundle.

This is an asset-remediation path. It does not permit learner assets, reviewer recommendations or generated corrections to redefine Course Truth or Exam Truth.

## Trigger evidence

The first successful provider-v9 Business generation is retained as:

- generation run `35789048198`;
- retained generation artifact `10723573827`;
- generation implementation commit `541a079f5647c54e04e67040f25f08ab86402665`;
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`; and
- generation artifact digest `sha256:2a3ca3566a68841be45ff429ded01e16b2f3ebb537c727722b4a33f061cd99f1`.

The corrected fresh-context assurance run after PR #373 is retained as:

- assurance run `35836291040`;
- assurance artifact `10739757463`;
- assurance implementation commit `b50d191e35b5d161e73301d18c2879f884045de0`; and
- assurance artifact digest `sha256:11484ed3ccaa9672558c6d5c43a4843ec43912d10d2159e9b664b296dfc374e8`.

Deterministic assurance passed and all 49 fresh independent reviewer calls completed without context collision. Independent semantic review returned `fail_hold` with:

- 20 open findings;
- 11 material findings;
- 9 minor findings; and
- 17 retained remediation target records.

No Learn or Practice asset was assured or published.

## Why targeted remediation is required

The current production authority requires asset findings to be corrected at the smallest safe scope. Re-running all 49 work units would discard valid generated content, spend unnecessarily and weaken provenance by treating unaffected assets as if they were defective.

The Foundation-native generation runtime therefore needs an explicit remediation boundary that can replace only the affected Learn and/or Practice side of each targeted work unit while preserving every unaffected work unit exactly.

The older v2 content-pack remediation state machine is not revived. Its useful control principles—exact finding scope, immutable identity and fresh contexts—are implemented directly against the current Foundation-native bundle.

## Exact input contract

Targeted remediation requires:

- the exact retained Foundation-native source bundle;
- the exact Foundation job/Candidate and Course Truth artifacts;
- the exact fresh independent-review record for that bundle;
- the retained remediation targets derived from that review; and
- remediation workers capable of correcting Learn and Practice under the current provider contracts.

Before any provider call, the runtime fails closed unless:

1. the source bundle, Candidate and review share the exact Foundation fingerprint and Candidate ID;
2. Coverage Model and Course Knowledge Model fingerprints still match the Candidate;
3. the independent review's `sourceBundleFingerprint` matches the exact retained bundle;
4. the current deterministic Course Learning Blueprint v2 plan exactly matches the retained source plan;
5. every targeted work unit exists in that plan;
6. every target finding belongs to that exact reviewed work unit;
7. every target asset side exactly matches the reviewed finding's `assetKind`; and
8. the target set covers every and only open finding retained by the source review.

A passing review cannot enter remediation.

## Smallest-safe-scope replacement

Targets are grouped by work unit and asset side.

For each affected work unit:

- `learn` regenerates only the Learn side;
- `practice` regenerates only the Practice side; and
- `both` regenerates each side once, even when several findings refer to it.

Untargeted work units are copied into the corrected bundle without regeneration.

If only Practice changes, the retained Learn content and Learn derived-asset identity remain unchanged. If only Learn changes, Practice remains unchanged. A changed aggregate side receives a new pending derived-asset identity because remediation does not imply assurance.

## Remediation provider contract

Each remediation call receives:

- the exact deterministic work-unit plan;
- relevant structured Course Truth nodes;
- required teaching points;
- the prior generated asset side;
- exact finding IDs;
- finding severity and issue type;
- retained reviewer evidence;
- the reviewer finding; and
- the recommended correction.

Reviewer findings identify what must be corrected. They do not become a new source of curriculum truth.

### Learn

Foundation-v2 Learn remediation retains the v9 two-stage structure:

1. regenerate the corrected final learner content under a `9-remediation` contract; then
2. bind every deterministic evidence obligation to the actual corrected fields using the strict v9 binding schema.

Both provider contexts are retained.

### Practice

Foundation-v2 Practice remediation retains the v5 structural contract under a `5-remediation` contract:

- exact selected Practice modes;
- exact teaching-point coverage;
- exact `(nodeId, capability)` evidence;
- deterministic capability-to-mode ownership; and
- active prompt/expected-response evidence where required.

Quantitative remediation instructions explicitly require independent recalculation rather than preservation of a previous expected answer.

## Fresh-context and provenance rule

Every remediation provider context must be unique and must not reuse:

- Foundation generation contexts;
- Foundation assurance/challenge contexts;
- any provider context from the retained source learning bundle; or
- any reviewer context from the independent review that produced the findings.

The corrected bundle retains the original generation contexts plus the new remediation contexts. A separate remediation record retains:

- source bundle fingerprint;
- corrected bundle fingerprint;
- source independent-review fingerprint;
- every addressed finding ID;
- exact per-side remediation targets;
- every remediation provider context; and
- the prior reviewer context set.

## Re-assurance

Remediation does not resolve a finding merely by generating replacement text.

The corrected bundle must pass the normal deterministic assurance boundary and then be challenged again in genuinely fresh independent contexts. Re-assurance reviewers must not reuse Foundation, original generation, remediation or earlier review contexts.

Only a clean independent pass may mark the new derived assets assured.

## Foundation escalation rule

Most findings in assurance run `35836291040` are currently classified as asset-generation defects: arithmetic mistakes, missing Practice capabilities, incomplete teaching, unsupported inferences or internally inconsistent prompts/expected responses.

If targeted remediation cannot correct a finding from the retained structured Course Truth without inventing unsupported truth, remediation must fail closed. The affected Foundation must then be reopened through a new Candidate/version rather than patching the learner asset around a Foundation defect.

## Publication safety

Nothing in targeted remediation changes the publication gate.

The current Business Foundation is still `ai_assured`, not `foundation_approved`. Corrected Learn/Practice assets remain pre-production and pending until fresh asset assurance passes. Learner publication still additionally requires qualified-human approval of the exact Foundation fingerprint.

## Documentation impact

This is a localized implementation contract inside the existing Foundation/Asset Production Model and ADR-0025/ADR-0026/ADR-0027 architecture. It implements the already-governed smallest-safe-scope remediation rule; it does not change normative product or workflow authority and does not require a new ADR.

Historical generation and assurance artifacts remain immutable. This document records the new remediation implementation and does not rewrite earlier fail-holds.
