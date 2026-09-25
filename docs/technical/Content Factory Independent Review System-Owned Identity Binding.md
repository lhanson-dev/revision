# Content Factory Independent Review System-Owned Identity Binding

**Status:** Current implementation note  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Scope:** Foundation-native Learn/Practice independent-review provider contract

## Purpose

Independent educational reviewers judge learner content. They do not own system provenance such as Foundation, Candidate, corrected-bundle or work-unit fingerprints.

The provider-facing review contract therefore treats these identity fields as system-owned values:

- `foundationFingerprint`;
- `foundationCandidateId`;
- `sourceBundleFingerprint`;
- `workUnitId`; and
- `workUnitFingerprint`.

The caller validates the exact identity before constructing the review contract. The provider-facing JSON shape retains these existing string fields for compatibility, but no longer constrains them to exact machine literals. Parsing deterministically overwrites whatever provider string is returned with the validated caller-owned identity. The downstream assurance boundary still verifies the fully bound identity against the exact work unit before accepting a review result.

This avoids making review success depend on a model reproducing long machine fingerprints exactly. Educational judgement remains model-owned; provenance remains deterministic and fail-closed.

## Evidence prompting this correction

After PR #388 was production-verified, zero-provider recovery run `36140767632` successfully re-attested the original cycle-2 corrected bundle without regeneration:

- remediation artifact `10866767131`;
- remediation artifact digest `sha256:e0f9b54b1cb991b87ff5e289959a1720ce032562d0857f6e8589c21da4ba2db1`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- retained source-review fingerprint `9f7ed5af13c2be07dba670c4f99e6a4ea4cc2ee7711b00f092572ab061b9461c`;
- cumulative prior reviewer contexts `98`;
- recovery provider calls repeated `0`.

Fresh v2 re-assurance run `36140909957` then passed all retained-lineage checks and reached the independent-review provider boundary. The first provider-contract failure occurred on work unit `foundation-improving-cash-flow-and-profits`, the 24th work unit in the deterministic 49-work-unit order. The provider response failed because `workUnitFingerprint` did not exactly reproduce the caller-owned value `76808b2e6d3f355459bd69abd32d9336e23d425285a754113cd8bbc585e33959`.

This was not an educational `fail_hold` and did not identify a Foundation defect. The retained failure artifact contains no semantic findings. Learn and Practice remain unassured, the Foundation remains `not_approved`, and learner publication remains blocked.

Because the current fallback failure artifact records only the terminal failure rather than completed partial review-run cost telemetry, exact spend from the 23 preceding successful review calls is not recoverable from that artifact. The configured hard spend ceiling remained `$12`. This historical evidence is not rewritten.

## Assurance rule

The corrected contract must prove in normal CI that:

1. provider-supplied identity strings cannot override caller-owned provenance;
2. provider-facing identity fields retain their established required-string shape but no longer encode exact literal constraints; and
3. invalid caller-owned identity is rejected before provider execution.

No Course Truth, Exam Truth, learner content, remediation output, Foundation approval state or publication rule changes as part of this correction.

## Post-correction live re-assurance evidence

PR #390 was merged and confirmed Live at `fea7308d96f6ff0ddfc03f8137395bf35bf89ed9`. Its governed production release passed release lineage, production backend readiness, build, Pages deployment, production smoke and durable path-to-live verification.

Exactly one fresh v2 re-assurance was then triggered against recovered remediation run `36140767632`, artifact `10866767131`, and corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`.

The resulting re-assurance run was `36150592345` on implementation commit `fea7308d96f6ff0ddfc03f8137395bf35bf89ed9`. All retained-lineage checks passed and the fresh semantic review reached the 45th work unit, `foundation-managing-change`, before the OpenAI API returned HTTP 429 because the API account had no credits remaining.

Retained failure evidence:

- artifact `10871169668`;
- artifact digest `sha256:886fcc97499b0e36ee6add6b334f16f768c68faddfaf87d4cdf6f4b098b4eaae`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- assured asset count `0`;
- human review `pending`;
- Foundation approval `not_approved`;
- learner publication eligible `false`.

This is an external provider billing/infrastructure blocker, not a semantic `fail_hold` and not evidence of a Foundation defect. Because the assurance loop is sequential, reaching work unit 45 means the preceding 44 work-unit executions returned successfully enough for the loop to continue. However, the current fallback artifact does not retain those partial review outputs, reviewer contexts or cost telemetry. They therefore cannot be treated as assurance evidence, reused, or counted toward a passing asset decision. Historical run `36150592345` remains immutable.

## Safe replay

Do not regenerate remediation content.

No further paid re-assurance should be triggered while the provider account has no credits. Once provider credits are restored, run exactly one new fresh v2 re-assurance against recovered remediation run `36140767632` / artifact `10866767131` and corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`.

The new run must use fresh reviewer contexts and independently review all 49 work units; the 44 unretained partial reviews from run `36150592345` are not reusable evidence. If fresh semantic assurance returns blocking/material findings, continue with smallest-safe targeted remediation. If it exposes a credible Foundation defect, reopen the Foundation instead. If it passes, Learn and Practice may become assured but learner publication remains blocked until qualified-human `foundation_approved` state is recorded.

## Documentation impact

This remains an implementation/evidence record under existing Content Factory authority. It introduces no new normative authority and requires no ADR. Historical proof artifacts and failed runs remain immutable.
