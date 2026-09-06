# Content Factory Foundation Live Proof Requirement-Led Evidence

**Status:** Current implementation record — fresh AQA 7132 / 2027 Foundation proof, deterministic assurance and independent-review remediation sequence  
**Authority:** `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related implementation:** `src/content-factory/foundation-live-proof.integration.test.ts`, `src/content-factory/foundation-precalibration-assembly.ts`, `src/content-factory/requirement-led-coverage.ts`, `src/content-factory/foundation-independent-review-proof.integration.test.ts`, `src/content-factory/foundation-expert-review-package-proof.integration.test.ts`

## Purpose

Record the executable evidence boundary for the fresh AQA A-level Business 7132 / 2027 Foundation proof and the downstream assurance chain.

This document describes implementation truth. It does not change Foundation authority, curriculum scope or approval policy.

## Governing completeness rule

Foundation completeness is requirement-led rather than count-led.

For curriculum coverage, the independent source-led profile in `aqa-a-level-business-7132-2027-coverage.ts` defines the applicable requirement universe. The governed semantic seed is the Revision-owned representation used to generate Course Truth; it may not define, narrow or enlarge that source-led universe by itself.

The live runtime wraps the AQA Foundation workers with `withAqa7132PreCalibrationAssemblyGuard(...)`. During Foundation coverage compilation that wrapper:

1. derives semantic items from the governed curriculum requirements supplied to compilation;
2. builds obligations from the independent source-led AQA coverage profile;
3. calls `assertRequirementLedCoverage(...)`;
4. fails closed if an applicable source requirement is unmapped, if a semantic item is not governed by the source-led universe, or if required named scope is absent; and
5. only then allows compilation to continue to Course Truth.

The same wrapper performs source-led Exam Truth reconciliation after Question Family generation through `assertExamRequirementCoverage(...)`.

A Foundation Candidate therefore cannot reach the live proof's retained-evidence stage unless both source-led curriculum and exam reconciliation have passed.

## Live Proof #10 — 6 September 2026

Workflow run `34014343565` executed from released `main` commit `aebe6d48eef44f8b5748b47855c25353e976c4b3`.

Compilation completed far enough to retain a Foundation Candidate and evidence artifact:

- Candidate: `aqa-a-level-business-7132-foundation-aebe6d48eef4-1788672915523-candidate-1`
- Foundation fingerprint: `5057049898191d5c6803cf154d1936c51a9310156435cea780682e13988a0f6c`
- workflow artifact ID: `9983454417`
- workflow artifact digest: `sha256:bfe96dab8e2e1008c55999e96059432c4d67150b38d676272e9a65bbd37b304e`
- Course Truth completeness: `complete`
- Exam Truth completeness: `complete`
- canonical Course Truth nodes: `49`
- canonical coverage nodes: `49`
- learner-facing assets: `0`
- deterministic assurance: `pending`
- independent review: `pending`
- conservative provider spend: `$0.172902` against the `$12` cap.

The workflow nevertheless ended `failure` because the integration test then asserted that the Course Truth node count must be strictly greater than the semantic-seed requirement count. Both values happened to be `49`, so the post-generation assertion failed with `expected 49 to be greater than 49`.

This was a stale test assumption, not evidence of a source-led coverage gap. The active requirement-led authority explicitly makes counts outputs rather than production targets, and the runtime source-led guards had already passed before the Candidate/evidence was retained.

Because the workflow conclusion is failed, Live Proof #10 is retained diagnostic evidence only. Its Candidate/fingerprint must not be rebound into downstream deterministic assurance. A new successful proof is required after remediation is released.

## Corrected executable proof

The live integration test replaced the invalid volume comparison with direct source-led reconciliation evidence:

- the exact curriculum requirement IDs retained in the Foundation coverage artifact must equal the exact requirement IDs in `AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS`;
- Course Truth node count must equal the canonical node count established by Foundation coverage;
- the retained proof evidence records the source-led curriculum requirement count and both exact requirement-ID sets;
- quantitative minimum, compiler-completeness, provider-stage, spend and zero-learner-asset checks remain unchanged; and
- source-led Exam Truth coverage continues to be enforced by the AQA wrapper before Question Family output is accepted.

This means an equal semantic-seed and source-led requirement count is permitted only when the independent source-led universe actually reconciles. Equality of counts alone proves nothing.

## Live Proof #13 — successful fresh source-led Foundation

Workflow run `34017938933` executed successfully from released `main` commit `5734f266a551069b27ea9a158a37c7ef93db9bb6`.

Retained identity:

- Candidate: `aqa-a-level-business-7132-foundation-5734f266a551-1788677993717-candidate-1`
- Foundation fingerprint: `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`
- workflow artifact ID: `9984534245`
- workflow artifact name: `content-factory-foundation-live-proof-5734f266a551069b27ea9a158a37c7ef93db9bb6`
- workflow artifact digest: `sha256:0b11868b48bfdbdeb5fd8db5fbca4378e62e227f37949347c97175e87aa2622a`
- source-led curriculum requirements: `49`, reconciled exactly to the canonical coverage requirement IDs;
- Course Truth completeness: `complete`;
- Exam Truth completeness: `complete`;
- learner-facing assets: `0`.

This fresh successful identity supersedes failed Live Proof #10 for downstream assurance use.

## Deterministic assurance — PASS

After the deterministic assurance workflow was rebound to Live Proof #13, run `34021119755` passed against the exact Foundation fingerprint `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`.

The retained assurance result recorded `19` passed checks, `0` failed checks and `0` learner-facing assets.

This proves the source Candidate cleared the deterministic Foundation assurance layer. It does not by itself establish educational sufficiency or qualified-human approval.

## Independent Review Proof #46 — PASS after targeted remediation

Fresh-context independent review run `34022356623` executed from released `main` commit `d7607b0d30f97fb750956dbb573404373aae1a4d`.

Retained independent-review artifact:

- artifact ID: `9985944396`;
- artifact name: `content-factory-foundation-independent-review-proof-d7607b0d30f97fb750956dbb573404373aae1a4d`;
- artifact digest: `sha256:97fd656721c926355a80b31bebf2d2e79c72032449ee4490b91a5ac87511587b`;
- learner-facing assets: `0`;
- configured provider cap: `$12`;
- conservative consumed provider spend: `$0.385308`.

The first independent review returned `fail_hold` with one material curriculum-sufficiency finding: `quantitative-methods-not-operationalised`.

The issue was that several quantitative Course Truth nodes made calculations assessable but did not operationalise the Revision-owned calculation methods, formulas, units/period conventions and interpretation boundaries needed to generate and assure correct quantitative teaching and assessment reliably.

Targeted remediation corrected that material finding without semantic expansion. The remediation rebuilt the affected Course Knowledge Model dependency and dependent Assessment Blueprint references, then reran deterministic assurance.

The remediated exact Candidate is:

- Candidate: `aqa-a-level-business-7132-foundation-5734f266a551-1788677993717-candidate-1-r1`;
- Foundation fingerprint: `09acd5d79698fa029c9b9b53138878c893940eed5c6b2534695aaba6c7779456`;
- deterministic re-assurance: `pass`;
- independent review: `pass`;
- unresolved Foundation blockers: `0`;
- operational blockers: `0`.

The final independent review retains one `minor` known limitation, `critical-path-duration-precision`: the Course Truth definition should more explicitly describe the critical path as the longest-duration sequence of dependent activities, normally with zero total float, explaining why it determines the minimum possible project duration. This does not block independent-review PASS and is carried into the exact Candidate's `knownLimitations` for qualified-human review.

## Expert-package remediated-candidate contract

The expert-review package must be built from the exact final assured Foundation version. A legitimate independent-review remediation can change both Candidate ID and Foundation fingerprint, so package assembly must distinguish:

- the original Live Proof source identity and source fingerprint; from
- the final independently reviewed/remediated Candidate identity and final fingerprint.

The package proof therefore must not require the final Candidate ID or fingerprint to equal the source Live Proof Candidate ID or fingerprint.

It must instead prove that:

1. the retained source proof is the exact approved Live Proof artifact;
2. the independent-review proof identifies that exact source proof;
3. the final Candidate ID is the final Candidate recorded by the independent-review proof;
4. the final Candidate recomputes to the exact final Foundation fingerprint;
5. the final Candidate carries passing deterministic assurance and independent review for that same final fingerprint;
6. source artifacts plus review/remediation artifact overlays resolve every exact final Candidate dependency;
7. learner-facing assets remain `0`; and
8. the qualified-human package remains `humanReviewStatus: pending` and `foundationApprovalStatus: not_approved` until genuine qualified review is recorded.

Retained workflow artifact IDs, names, digests, source workflow run IDs and source head SHAs are verified before package download so the package cannot silently consume a similarly named or stale artifact.

## Documentation impact check

No normative authority or ADR change is required. The active Foundation model already requires fresh-context independent review, smallest-safe remediation, re-assurance, qualified subject/assessment review of the exact Foundation version and explicit known limitations before `foundation_approved`.

The implementation correction is required because the earlier expert-package proof encoded a stale assumption that independent review would never mutate the Candidate identity. The historical Live Proof and independent-review evidence are preserved unchanged.

No learner-facing product behaviour changes.

## Next governed step

After the expert-package remediated-candidate change passes exact-head repository assurance, receives explicit Founder merge approval, is merged and production-verified, run the retained expert-review package workflow against:

- source Live Proof run `34017938933` / source fingerprint `843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976`; and
- independent Review Proof #46 / final fingerprint `09acd5d79698fa029c9b9b53138878c893940eed5c6b2534695aaba6c7779456`.

A successfully assembled package is still not Foundation approval. Genuine qualified subject/assessment review of that exact final package remains mandatory before `foundation_approved` and before any Learn, Practice or Exam Prep asset factory may start.
