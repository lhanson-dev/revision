# Content Factory Foundation-Native Targeted Learning Remediation Proof

**Status:** Current implementation contract for retained targeted-remediation and corrected-bundle re-assurance proof runners  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`; `10-product-governance/Course Learning Blueprint.md`  
**Related implementation:** `docs/technical/Content Factory Foundation-Native Targeted Learning Remediation.md`; `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`

## Purpose

Define the retained live-proof boundary that may execute the Foundation-native targeted Learn/Practice remediation runtime after the remediation capability itself is approved, merged and confirmed Live, and the separate retained re-assurance boundary that validates the corrected bundle.

Both proofs are pre-production only. Remediation may create a corrected retained bundle but cannot mark findings resolved or assets assured. Re-assurance may mark the corrected Learn and Practice assets assured only if deterministic assurance and genuinely fresh semantic review pass. Neither proof can approve the Foundation or publish learner content.

## Retained Business source inputs

The AQA A-level Business 7132 — 2027 remediation chain begins from:

- retained generation run `35789048198`;
- retained generation artifact `10723573827`;
- generation implementation commit `541a079f5647c54e04e67040f25f08ab86402665`;
- retained fresh assurance run `35836291040`;
- retained fresh assurance artifact `10739757463`;
- assurance implementation commit `b50d191e35b5d161e73301d18c2879f884045de0`; and
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

The retained assurance proof contains 20 open findings across 17 target records. The remediation runner consumes that exact retained review rather than regenerating or reinterpreting the finding set.

## Targeted-remediation workflow boundary

`.github/workflows/content-factory-foundation-internal-learning-remediation-proof.yml` is dispatchable only from `main` or by the Founder-owned control comment on issue `#289`.

The trigger requires exact identities for:

- the successful retained generation run, artifact and implementation SHA;
- the completed retained assurance run whose exact semantic result is `fail_hold`, together with its artifact and implementation SHA; and
- the exact Foundation fingerprint.

The retained assurance workflow deliberately exits non-zero when independent semantic assurance returns `fail_hold`. Therefore retained assurance run `35836291040` has GitHub conclusion `failure` while still carrying the valid uploaded `fail_hold` evidence that creates the remediation target set. The remediation proof binds this exact state fail-closed: it requires the generation run to conclude `success`, the bound assurance run to be `completed` with conclusion `failure`, and the downloaded assurance artifact itself to prove `status=fail_hold`, deterministic assurance `pass`, independent review `fail_hold`, exact lineage and non-publication state. It does not accept an arbitrary failed assurance run.

The workflow fails closed unless the generation and assurance run/artifact identities match those exact expected states, are unexpired, digest-bound and exact-head matches.

## Transitive Foundation lineage

The retained generation proof records the exact Foundation Live Proof and AI-Assured Proof from which its Candidate, Coverage Model and Course Knowledge Model were derived. The remediation workflow resolves those identities from the retained generation proof, then independently verifies:

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

The runtime retains:

- exact Foundation/Candidate identity;
- exact source-bundle/review fingerprint binding;
- exact deterministic Blueprint-v2 plan equality;
- exact work-unit and reviewed asset-side targeting;
- fresh remediation contexts;
- no regeneration of untargeted Learn/Practice sides; and
- changed derived assets returning to `pending` rather than becoming assured.

For the retained Business finding set, the target graph produced 5 Learn-side remediations and 15 Practice-side remediations. Learn uses the two-stage `9-remediation` generate-then-bind path, so the retained execution used 25 provider contexts in total.

## Successful retained remediation evidence

The first corrected retained Business bundle completed successfully after the runner correction:

- workflow run `35996162981`;
- artifact `10806996448`;
- implementation/main head `f568101c44f402899b9d65171413533f34b4c029`;
- artifact digest `sha256:e4783c7df2bb8b11b09385534e33c3780cb36006eebd7a7d441bb4ebf9bb2302`;
- result bundle fingerprint `8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9`;
- 20 retained findings addressed;
- 15 remediated work units;
- 20 remediated asset sides;
- 25 fresh remediation contexts with zero context collisions;
- Learn and Practice assurance status still `pending`;
- assured asset count `0`;
- qualified-human Foundation review still pending; and
- learner publication still false.

Reported final-response remediation usage was `$1.19167` across 25 provider runs. This is retained telemetry rather than retry-complete spend; the provider client separately enforced the `$12` hard spend ceiling.

The earlier run `35994489923` remains historical fail-closed evidence. It stopped before provider execution because the runner incorrectly required the source semantic `fail_hold` assurance workflow to have GitHub conclusion `success`. That historical run is not rewritten.

## Corrected-bundle re-assurance boundary

Successful remediation is not assurance.

`.github/workflows/content-factory-foundation-internal-learning-reassurance-proof.yml` is a separate governed adapter for the corrected bundle. It accepts only:

- the exact successful remediation workflow run ID;
- the exact remediation artifact ID;
- the exact remediation implementation/main head;
- the exact Foundation fingerprint; and
- the exact corrected result-bundle fingerprint.

The workflow derives every earlier identity from the retained remediation evidence rather than asking the caller to restate the upstream chain. Before any provider call it verifies:

1. the remediation run is completed successfully on `main` at the exact supplied head;
2. the remediation artifact name, run binding, digest and expiry state;
3. semantic remediation evidence is `pass`, binds the exact Foundation and corrected bundle fingerprints, has no remediation context collision, leaves both assets `pending`, has zero assured assets and leaves publication false;
4. the exact Foundation Live Proof and AI-Assured Proof runs/artifacts/digests/heads are still valid and bind the same Foundation;
5. the exact original Learn/Practice generation run/artifact is still valid;
6. the exact original semantic assurance run is the retained completed GitHub `failure` whose artifact is `fail_hold`, deterministic `pass` and independent-review `fail_hold`; and
7. all transitive artifacts remain unexpired and digest-bound.

The corrected bundle is then passed through the existing Foundation-native deterministic assurance engine. No separate or weakened deterministic contract is introduced for remediation.

## Fresh-context re-review rule

The corrected bundle must be semantically reviewed again from scratch. The re-assurance reviewer must not reuse or inherit any conclusion from the original review or the remediation worker.

Every new reviewer context is forbidden from colliding with:

- Foundation generation contexts;
- Foundation assurance/reviewer contexts;
- any external-source-challenge reviewer context retained by the Candidate;
- all original Learn/Practice generation contexts;
- all remediation contexts retained in the corrected bundle; and
- all reviewer contexts from the original Learn/Practice assurance proof.

The existing assurance engine enforces Candidate and corrected-bundle context separation. The re-assurance adapter additionally supplies every previous Learn/Practice reviewer context as forbidden input and records collision evidence in the retained proof.

The review evaluates every corrected work unit against the exact structured Foundation Course Truth and coverage facts. It independently checks factual distortion, omitted conditions, misleading certainty, curriculum drift, misconceptions, pedagogy, Practice validity, expected responses and quantitative consistency.

If deterministic assurance fails, no semantic reviewer result is treated as sufficient. If semantic re-review returns blocking/material findings, the corrected assets remain unassured and a new smallest-safe remediation cycle is required. If the evidence instead reveals missing or incorrect Course Truth, the Foundation Candidate/version must be reopened rather than patching learner assets around the defect.

## Re-assurance result and release state

A clean re-assurance result may set the corrected Learn and Practice derived-asset assurance status to `pass` and retain the exact assurance evidence reference.

That still does not make the assets publishable. The Business Foundation remains `ai_assured`, not `foundation_approved`. `assertFoundationDerivedAssetReleaseEligible` therefore continues to block learner release until qualified-human Foundation approval exists for the exact same Foundation fingerprint.

If the re-assurance result is `fail_hold` or `conditional_pass`, assured asset count remains zero and publication remains false.

## Cost and failure boundary

The re-assurance proof uses:

- model `gpt-5.6-terra`;
- hard review spend ceiling `$12`;
- maximum output tokens per review call `5000`; and
- provider retries maximum `2` under the configured client.

If identity verification, deterministic assurance, provider execution, response contracts or fresh-context rules fail, the proof writes fail-hold evidence and exits non-zero. No asset is treated as assured from a failed proof.

## Retained proof output

A re-assurance execution uploads `content-factory-foundation-internal-learning-reassurance-proof-<main-sha>`.

Its evidence retains:

- exact remediation run/artifact/digest/head identity;
- exact corrected bundle fingerprint;
- exact transitive Foundation/AI/generation/original-assurance lineage;
- deterministic assurance output;
- genuinely fresh reviewer runs and contexts;
- previous-reviewer exclusion counts and collision evidence;
- new issue register/remediation targets, if any;
- provider/cost telemetry;
- corrected asset assurance states; and
- the continuing Foundation-approval/publication block.

## Documentation impact

These runners implement the already-governed smallest-safe-scope remediation and fresh revalidation sequence. They do not change normative product/workflow authority and do not require a new ADR.

Historical generation, assurance and remediation artifacts remain immutable. The corrected-bundle re-assurance evidence is additive implementation evidence and must not rewrite the original `fail_hold` review.

Provider-spend remediation or re-assurance execution must occur only from an approved, merged and confirmed-Live proof runner.
