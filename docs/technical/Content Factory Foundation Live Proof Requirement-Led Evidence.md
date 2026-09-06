# Content Factory Foundation Live Proof Requirement-Led Evidence

**Status:** Current implementation record — fresh AQA 7132 / 2027 Foundation live-proof remediation after run `34014343565`  
**Authority:** `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Related implementation:** `src/content-factory/foundation-live-proof.integration.test.ts`, `src/content-factory/foundation-precalibration-assembly.ts`, `src/content-factory/requirement-led-coverage.ts`

## Purpose

Record the executable evidence boundary for the fresh AQA A-level Business 7132 / 2027 Foundation live proof after requirement-led coverage hardening.

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

The live integration test now replaces the invalid volume comparison with direct source-led reconciliation evidence:

- the exact curriculum requirement IDs retained in the Foundation coverage artifact must equal the exact requirement IDs in `AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS`;
- Course Truth node count must equal the canonical node count established by Foundation coverage;
- the retained proof evidence records the source-led curriculum requirement count and both exact requirement-ID sets;
- quantitative minimum, compiler-completeness, provider-stage, spend and zero-learner-asset checks remain unchanged; and
- source-led Exam Truth coverage continues to be enforced by the AQA wrapper before Question Family output is accepted.

This means an equal semantic-seed and source-led requirement count is permitted only when the independent source-led universe actually reconciles. Equality of counts alone proves nothing.

## Documentation impact check

No normative authority or ADR change is required. The active requirement-led coverage authority already requires source-led universes, exact reconciliation and count independence. This change corrects the live-proof implementation and records the failed run without rewriting its historical outcome.

No learner-facing product behaviour changes.

## Next governed step

After this remediation passes exact-head repository assurance, receives explicit Founder merge approval, is merged and production-verified, run one fresh AQA 7132 / 2027 Foundation live proof from the new approved `main`.

Only a successful fresh run with a retained Candidate/fingerprint may be used to rebind deterministic Foundation assurance and the subsequent independent-review / qualified-human review sequence.
