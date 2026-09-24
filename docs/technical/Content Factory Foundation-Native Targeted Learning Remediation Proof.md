# Content Factory Foundation-Native Targeted Learning Remediation Proof

**Status:** Current implementation contract for the retained targeted-remediation proof runner  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`; `10-product-governance/Course Learning Blueprint.md`  
**Related implementation:** `docs/technical/Content Factory Foundation-Native Targeted Learning Remediation.md`; `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`

## Purpose

Define the retained live-proof boundary that may execute the Foundation-native targeted Learn/Practice remediation runtime after the remediation capability itself is approved, merged and confirmed Live.

This proof is pre-production only. It may create a corrected retained bundle for re-assurance; it cannot mark findings resolved, mark derived assets assured, approve the Foundation or publish learner content.

## Retained Business proof inputs

The first intended execution is bound to the existing AQA A-level Business 7132 — 2027 evidence chain:

- retained generation run `35789048198`;
- retained generation artifact `10723573827`;
- generation implementation commit `541a079f5647c54e04e67040f25f08ab86402665`;
- retained fresh assurance run `35836291040`;
- retained fresh assurance artifact `10739757463`;
- assurance implementation commit `b50d191e35b5d161e73301d18c2879f884045de0`; and
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

The retained assurance proof contains 20 open findings across 17 target records. The proof runner must consume that exact retained review rather than regenerate or reinterpret the finding set.

## Workflow boundary

`.github/workflows/content-factory-foundation-internal-learning-remediation-proof.yml` is dispatchable only from `main` or by the Founder-owned control comment on issue `#289`.

The trigger requires exact identities for:

- the successful retained generation run, artifact and implementation SHA;
- the successful retained assurance run, artifact and implementation SHA; and
- the exact Foundation fingerprint.

The workflow fails closed unless both retained run/artifact identities are successful, unexpired, digest-bound and exact-head matches.

## Transitive Foundation lineage

The retained generation proof already records the exact Foundation Live Proof and AI-Assured Proof from which its Candidate, Coverage Model and Course Knowledge Model were derived. The remediation workflow resolves those identities from the retained generation proof, then independently verifies:

- the Foundation Live Proof run is successful on `main` and its artifact digest/head match;
- the AI-Assured Proof run is successful on `main` and its artifact digest/head match;
- both proofs bind to the same exact Foundation fingerprint;
- the AI-Assured Candidate still computes to that fingerprint; and
- qualified-human Foundation approval and learner publication remain false.

This transitive retrieval is provenance verification only. It does not create a new Foundation or introduce new course truth.

## Exact retained remediation execution

The live integration proof reconstructs the exact AI-assured Foundation job and calls `remediateFoundationInternalLearningAssets` using:

- the retained 49-work-unit generation bundle;
- the retained independent review;
- every and only retained open finding/target;
- the exact Coverage Model and Course Knowledge Model from the retained Foundation proof; and
- the Foundation-native OpenAI remediation workers.

The runtime therefore retains the controls already implemented by the targeted remediation boundary:

- exact Foundation/Candidate identity;
- exact source-bundle/review fingerprint binding;
- exact deterministic Blueprint-v2 plan equality;
- exact work-unit and reviewed asset-side targeting;
- fresh remediation contexts;
- no regeneration of untargeted Learn/Practice sides; and
- changed derived assets returning to `pending` rather than becoming assured.

For the retained Business finding set, the current target graph implies 5 Learn-side remediations and 15 Practice-side remediations. Learn uses the two-stage `9-remediation` generate-then-bind path, so the expected retained execution is 25 provider calls in total if every call succeeds. The proof derives these counts from the retained target set rather than hard-coding them as acceptance truth.

## Cost and failure boundary

The workflow uses the same hard provider-spend pattern as the current Foundation-native learning proofs:

- model: `gpt-5.6-terra`;
- hard remediation spend ceiling: `$12`;
- maximum output tokens per remediation call: `8000`; and
- provider retries: maximum `2` under the configured client.

If any identity, provider call, provider contract, deterministic output rule or fresh-context rule fails, the proof writes fail-hold evidence and exits non-zero. In that state:

- no retained finding is treated as resolved;
- no derived asset is marked assured; and
- learner publication remains blocked.

## Retained proof output

A successful execution uploads `content-factory-foundation-internal-learning-remediation-proof-<main-sha>` containing `foundation_internal_learning_remediation_live_proof_evidence`.

The evidence retains:

- exact upstream run/artifact/digest/head identities;
- source and corrected bundle fingerprints;
- source independent-review fingerprint;
- every addressed retained finding ID;
- exact per-work-unit/per-asset remediation targets;
- underlying provider run/context/cost telemetry;
- fresh-context collision evidence;
- the remediation record; and
- the corrected pending Learn/Practice bundle.

Untargeted Learn/Practice sides are explicitly compared with the retained source bundle and must remain unchanged.

## Re-assurance boundary

Successful remediation is not assurance.

After exactly one retained Business remediation proof succeeds, the corrected bundle must pass deterministic assurance and then genuinely fresh independent semantic review. Re-assurance contexts must exclude Foundation contexts, original generation contexts, remediation contexts and all earlier reviewer contexts.

The existing original-generation assurance workflow must not be made to pretend that a remediation artifact is a fresh original-generation artifact. A separate governed re-assurance slice must explicitly accept the remediation proof identity and preserve this context exclusion rule.

If remediation cannot correct a finding from retained Course Truth without inventing unsupported truth, the run must fail closed and the Foundation Candidate/version must be reopened instead.

## Publication safety

Nothing in this proof changes release eligibility. The Business Foundation remains `ai_assured`, qualified-human Foundation review remains pending and corrected assets remain pre-production.

Learner publication still requires both fresh asset assurance PASS and qualified-human `foundation_approved` state for the exact same Foundation fingerprint.

## Documentation impact

This proof runner implements the already-governed smallest-safe-scope remediation and fresh re-assurance sequence. It does not change normative product/workflow authority and does not require a new ADR.

Historical generation and assurance artifacts remain immutable. The first paid remediation execution must occur only after this workflow implementation is separately approved, merged and confirmed Live.
