# Content Factory Foundation Assurance — Live Proof 13 Rebind

**Status:** Current implementation checkpoint — proposed rebind after successful Foundation Live Proof #13  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Related implementation:** `.github/workflows/content-factory-foundation-assurance-proof.yml`; `src/content-factory/foundation-assurance-proof.integration.test.ts`

## Purpose

Record the exact retained Foundation Candidate produced by the successful source-led AQA Business live proof and the deterministic-assurance workflow identity that must be used next.

This checkpoint does not approve the Foundation. It only rebinds deterministic assurance to the exact retained Candidate so the governed assurance sequence can continue.

## Successful source proof

Foundation Live Proof #13 completed successfully for **AQA A-level Business 7132 — 2027 cohort**.

Exact retained identity:

- workflow run: `34017938933`;
- source `main` head: `5734f266a551069b27ea9a158a37c7ef93db9bb6`;
- artifact id: `9984534245`;
- artifact name: `content-factory-foundation-live-proof-5734f266a551069b27ea9a158a37c7ef93db9bb6`;
- artifact digest: `sha256:0b11868b48bfdbdeb5fd8db5fbca4378e62e227f37949347c97175e87aa2622a`;
- proof file: `aqa-a-level-business-7132-foundation-5734f266a551-1788677993717.json`;
- Candidate ID: `aqa-a-level-business-7132-foundation-5734f266a551-1788677993717-candidate-1`;
- Foundation fingerprint: `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`.

The retained proof records:

- Course Truth completeness: `complete`;
- Exam Truth completeness: `complete`;
- source-led curriculum requirements: `49`;
- canonical coverage requirements: `49`;
- Course Truth nodes: `49`;
- exact source-led requirement IDs equal the retained canonical coverage requirement IDs;
- learner-facing assets: `0`;
- OpenAI generation model: `gpt-5.6-terra`;
- provider runs: `3`;
- conservative provider spend: `$0.176596` against the `$12` configured maximum;
- deterministic assurance: `pending` in the retained source proof;
- independent review: `pending` in the retained source proof.

The successful live proof therefore establishes a valid retained Foundation Candidate for the next assurance stage. It does not establish deterministic PASS, independent-review PASS, qualified-human approval or `foundation_approved`.

## Deterministic-assurance rebind

The deterministic-assurance workflow must consume only the exact retained identity above.

The rebind updates:

- source run ID;
- source artifact ID;
- source artifact name;
- source artifact digest;
- source head SHA;
- Foundation fingerprint; and
- retained proof file path.

Before downloading the proof, the workflow verifies the artifact ID resolves to the expected name, digest, workflow run and source head. A mismatch fails closed.

The retained deterministic-assurance evidence also records the source artifact ID in addition to the existing run/name/digest identity.

## Governed trigger

After this rebind reaches approved `main`, deterministic assurance may be launched from Issue #289 only by the repository owner using the exact command:

`revision-run-foundation-assurance-proof:v1`

The workflow also retains its manual `workflow_dispatch` path on `main`.

## Documentation-impact check

No normative authority changes are required. The existing Foundation production and requirement-led coverage authorities already require exact-fingerprint deterministic assurance before independent review and qualified-human approval.

This file is current implementation evidence only. Historical live-proof and earlier assurance records remain unchanged.

## Next governed step

After the rebind PR is assured, Founder-approved, merged and production-verified:

1. trigger deterministic assurance against this exact Candidate;
2. retain the exact assurance artifact and PASS/FAIL evidence;
3. only after deterministic PASS, rebind/run fresh-context independent review against the same exact Foundation fingerprint;
4. proceed to the qualified-human expert package only after all earlier gates pass.

No learner-facing asset factory may start before the exact Foundation reaches qualified-human `foundation_approved`.
