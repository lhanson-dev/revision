# Content Factory Foundation-Native Learning Review Structured Output

**Status:** Current implementation note  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Related implementation:** `src/content-factory/foundation-internal-learning-review-contract.ts`; the Foundation-native Learn/Practice assurance and re-assurance live-proof runners

## Purpose

Record the provider-contract hardening applied to Foundation-native Learn/Practice independent semantic review after the cycle 2 AQA A-level Business 7132 re-assurance reached the provider stage but failed before an educational decision was completed.

This note changes no normative Content Factory authority. It documents how the current implementation enforces the already-governed rule that mechanically provable identity and provenance must fail closed while the independent reviewer owns the educational judgement.

## Triggering evidence

After PR #388 reached Live, the retained cycle 2 remediation evidence was successfully recovered without regeneration:

- recovery run `36140767632`;
- recovery artifact `10866767131`;
- recovery artifact digest `sha256:e0f9b54b1cb991b87ff5e289959a1720ce032562d0857f6e8589c21da4ba2db1`;
- recovery implementation/main head `47d7c0ce5da4bcfb0ef2b4fb8636631d568a5fda`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- addressed findings `12 / 12`;
- remediated work units `12`;
- remediated asset sides `14`;
- retained remediation contexts `18`, all successful;
- cumulative prior reviewer contexts `98`, all unique;
- remediation-context collisions `0`;
- provider calls repeated by recovery `0`;
- Learn assurance `pending`;
- Practice assurance `pending`;
- Foundation approval `not_approved`;
- learner publication eligible `false`.

Fresh v2 re-assurance run `36140909957` then passed every retained-lineage, corrected-bundle, cumulative-reviewer-context and dependency gate and reached the actual semantic provider stage. It did not produce a semantic assurance result. The first provider response, for work unit `foundation-improving-cash-flow-and-profits`, returned a `workUnitFingerprint` that did not match the exact literal fingerprint bound into the provider-facing review schema. The local provider contract therefore failed closed before the full 49-work-unit review could complete.

Retained failure evidence:

- re-assurance run `36140909957`;
- artifact `10867670234`;
- artifact digest `sha256:2b4de652aec28af47eef6fbfe404780ee39fc265315311633240976bb0654e38`;
- implementation/main head `47d7c0ce5da4bcfb0ef2b4fb8636631d568a5fda`;
- source remediation run `36140767632` / artifact `10866767131`;
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`;
- assured asset count `0`;
- Foundation human review `pending`;
- Foundation approval `not_approved`;
- learner publication eligible `false`.

The run did make a provider call before aborting. The retained failure artifact does not provide a trustworthy retry-complete spend total, so this note does not infer one.

## Root cause

The provider-facing review schema already binds these mechanically provable fields to exact JSON-Schema literals:

- Foundation fingerprint;
- Foundation Candidate ID;
- corrected/source bundle fingerprint;
- work-unit ID; and
- work-unit fingerprint.

The review instructions also state that these identity fields are fixed and that the reviewer should judge only the supplied work unit. However, the live review calls were using the generic structured-output client's default `strictOutput: false`. Under that non-strict provider setting, the model could return syntactically valid JSON while still copying a fixed literal identity value incorrectly. Local Zod validation then correctly rejected the response.

This was a provider-contract failure, not evidence that the learner content was educationally wrong and not evidence of a Foundation defect.

## Current implementation contract

All three Foundation-native Learn/Practice semantic-review runners now request **strict structured output** from the provider while retaining the existing exact-literal identity schema:

1. initial generated-bundle independent assurance;
2. first corrected-bundle re-assurance; and
3. second-and-later cumulative-context re-assurance.

The provider therefore receives the same exact identity-bound JSON schema, but the Responses API is instructed to enforce that schema strictly before the local worker accepts the output. Revision still validates the returned object locally and the downstream assurance engine independently checks that the retained review identity equals the deterministic Foundation, bundle and work-unit values.

Educational judgement remains model-owned within the bounded review task: `decision`, findings, severity, evidence and recommended correction. Foundation, bundle and work-unit identity remain mechanically constrained provenance.

A normal CI regression requires every live Foundation-native Learn/Practice semantic-review runner to keep `strictOutput: true`; the existing review-contract tests continue to prove that all five identity fields are emitted as exact provider-facing JSON-Schema `const` constraints.

## Safe replay

No learner content should be regenerated because run `36140909957` did not identify an educational defect and the recovered remediation artifact remains valid.

After this implementation is approved, merged and confirmed Live, the safe next action is exactly one fresh v2 re-assurance using the already-recovered remediation proof:

- remediation run `36140767632`;
- remediation artifact `10866767131`;
- remediation head `47d7c0ce5da4bcfb0ef2b4fb8636631d568a5fda`;
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`;
- result bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`.

Do not repeat remediation or recovery merely because the prior semantic-review provider response violated its output contract.

If the fresh re-assurance completes with semantic `pass`, Learn and Practice may become asset-assured while qualified-human Foundation approval and learner publication remain separate blocked gates. If it completes with genuine semantic `fail_hold` or `conditional_pass`, use the retained findings to decide between smallest-safe asset remediation and Foundation reopening according to the existing authority.

## Documentation impact

This is an implementation hardening under existing Content Factory and accuracy-assurance authority. It introduces no new product behaviour, Course Truth, Exam Truth, Foundation approval rule or publication rule. No ADR or normative authority change is required.

Historical proof runs remain immutable. Run `36140909957` remains evidence of a provider-contract failure before a complete semantic result, not a retroactively reclassified educational review.
