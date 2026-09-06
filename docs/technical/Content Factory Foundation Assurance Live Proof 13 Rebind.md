# Content Factory Foundation Assurance — Live Proof 13 Rebind

**Status:** Current implementation checkpoint — deterministic PASS retained; independent-review rebind proposed  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Related implementation:** `.github/workflows/content-factory-foundation-assurance-proof.yml`; `.github/workflows/content-factory-foundation-independent-review-proof.yml`; `src/content-factory/foundation-assurance-proof.integration.test.ts`; `src/content-factory/foundation-independent-review-proof.integration.test.ts`

## Purpose

Record the exact retained Foundation Candidate produced by the successful source-led AQA Business live proof, the deterministic-assurance result now retained for that Candidate, and the exact identity that fresh-context independent review must use next.

This checkpoint does not approve the Foundation. Qualified-human subject/assessment approval remains mandatory before `foundation_approved`.

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
- conservative provider spend: `$0.176596` against the `$12` configured maximum.

## Deterministic-assurance result

After PR #324 reached approved `main`, Issue #289 triggered the exact retained deterministic assurance path using:

`revision-run-foundation-assurance-proof:v1`

Deterministic Foundation Assurance Proof run `34021119755` completed successfully on reviewed commit `bfa66de6ac7f7a531ffdb135d657ee8e44264890`.

Retained deterministic evidence:

- assurance artifact id: `9985517206`;
- assurance artifact name: `content-factory-foundation-assurance-proof-bfa66de6ac7f7a531ffdb135d657ee8e44264890`;
- assurance artifact digest: `sha256:0ac1701e8f589c4d1d5af3fbc94d30f0f86886ea6860c42030c8bb7bad123996`;
- Foundation fingerprint: `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`;
- deterministic decision: `pass`;
- deterministic checks: `19` total / `0` failed;
- learner-facing assets: `0`;
- resulting Candidate deterministic-assurance status: `pass`;
- independent-review status: `pending`.

This proves the exact retained Candidate clears the released deterministic Foundation assurance layer. It does not establish fresh-context independent-review PASS, qualified-human approval or `foundation_approved`.

## Independent-review rebind

The current independent-review workflow still points to the earlier retained Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca` and therefore must not be run for the new source-led Candidate until rebound.

The rebind updates the independent-review workflow to consume only the exact Live Proof #13 identity above:

- source run ID `34017938933`;
- source artifact ID `9984534245`;
- exact source artifact name and digest;
- source head SHA `5734f266a551069b27ea9a158a37c7ef93db9bb6`;
- Foundation fingerprint `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`;
- retained proof file path.

Before download, the workflow verifies that the exact artifact ID resolves to the expected artifact name, digest, workflow run and source head. A mismatch fails closed.

The released Slice 3B runtime then performs its own exact-current-commit deterministic precondition before fresh-context independent review, so the independent-review run cannot rely on stale assurance state inside the original live-proof Candidate.

## Governed independent-review trigger

After this independent-review rebind is assured, Founder-approved, merged and production-verified, Issue #289 may launch the fresh-context review using the existing owner-only exact command:

`revision-run-foundation-independent-review-proof:v1`

The independent-review workflow remains bounded to the `$12` configured provider-spend maximum and generates zero learner-facing assets.

## Documentation-impact check

No normative authority changes are required. Existing Foundation production and requirement-led coverage authorities already require the sequence:

`Course Truth + Exam Truth → deterministic assurance → fresh-context independent review/remediation → qualified-human approval → foundation_approved`

This file is current implementation evidence only. Historical live-proof, assurance and independent-review records remain unchanged.

## Next governed step

1. assure and release the independent-review rebind;
2. run fresh-context independent review against exact fingerprint `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`;
3. retain any targeted remediation, deterministic re-assurance and fresh re-review evidence required by Slice 3B;
4. only after exact independent-review PASS, update/rebind the qualified-human expert-review package;
5. obtain genuine qualified subject/assessment approval before creating an immutable Approved Course Foundation.

No learner-facing asset factory may start before the exact Foundation reaches qualified-human `foundation_approved`.
