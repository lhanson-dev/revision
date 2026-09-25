# Content Factory Independent Review System-Owned Identity and Decision Binding

**Status:** Current implementation note  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Scope:** Foundation-native Learn/Practice independent-review provider contract

## Purpose

Independent educational reviewers judge learner content. They do not own deterministic system provenance or the mechanical aggregate outcome implied by their retained findings.

The provider-facing review contract therefore treats these identity fields as system-owned values:

- `foundationFingerprint`;
- `foundationCandidateId`;
- `sourceBundleFingerprint`;
- `workUnitId`; and
- `workUnitFingerprint`.

The caller validates the exact identity before constructing the review contract. The provider-facing JSON shape retains these existing string fields for compatibility, but no longer constrains them to exact machine literals. Parsing deterministically overwrites whatever provider string is returned with the validated caller-owned identity. The downstream assurance boundary still verifies the fully bound identity against the exact work unit before accepting a review result.

The provider also returns its semantic finding register and an aggregate `decision` field for the established structured-output shape. The semantic findings remain reviewer-owned. The aggregate decision is system-derived from those retained findings:

- any open `blocking` or `material` finding → `fail_hold`;
- otherwise any open `minor` finding → `conditional_pass`;
- otherwise → `pass`.

The provider-supplied decision is therefore not trusted as an independent source of truth. Parsing derives the decision mechanically from the findings, then the downstream canonical assurance schema reparses the result and independently enforces the same finding/decision consistency rules. This preserves fail-closed assurance while preventing contradictory model-authored summary fields from discarding useful semantic evidence.

## Evidence prompting the identity correction

After PR #388 was production-verified, zero-provider recovery run `36140767632` successfully re-attested the original cycle-2 corrected bundle without regeneration:

- remediation artifact `10866767131`;
- remediation artifact digest `sha256:e0f9b54b1cb991b87ff5e289959a1720ce032562d0857f6e8589c21da4ba2db1`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- retained source-review fingerprint `9f7ed5af13c2be07dba670c4f99e6a4ea4cc2ee7711b00f092572ab061b9461c`;
- cumulative prior reviewer contexts `98`;
- recovery provider calls repeated `0`.

Fresh v2 re-assurance run `36140909957` then passed all retained-lineage checks and reached the independent-review provider boundary. The first provider-contract failure occurred on work unit `foundation-improving-cash-flow-and-profits`, the 24th work unit in the deterministic 49-work-unit order. The provider response failed because `workUnitFingerprint` did not exactly reproduce the caller-owned value `76808b2e6d3f355459bd69abd32d9336e23d425285a754113cd8bbc585e33959`.

This was not an educational `fail_hold` and did not identify a Foundation defect. The retained failure artifact contains no semantic findings. Learn and Practice remained unassured, the Foundation remained `not_approved`, and learner publication remained blocked.

PR #390 moved those provenance fields to system-owned binding while retaining downstream exact-identity validation.

## Evidence prompting the decision correction

After PR #390 was merged and production-verified, fresh v2 re-assurance run `36157286274` replayed the exact retained corrected bundle against approved `main` commit `fea7308d96f6ff0ddfc03f8137395bf35bf89ed9`.

The run proved that provider access and credits were available, passed the retained remediation identity and cumulative-lineage checks, installed successfully, and reached fresh semantic review. It then failed on work unit `foundation-human-resource-objectives` with:

`provider_contract_failure: Blocking/material findings require fail_hold → at decision`

This means the provider produced a finding register containing at least one open blocking/material finding but returned an aggregate decision inconsistent with that register. The structured-output parser rejected the response before the semantic finding details could be retained by the assurance proof.

The failure therefore does **not** establish that the Human Resource Objectives content is correct or incorrect. It establishes that the provider returned internally contradictory structured output and the existing contract discarded potentially useful semantic evidence before the deterministic assurance layer could classify it.

Failure evidence was retained as workflow artifact `10874421741` with digest `sha256:9e3515c7434466d227282a099e9184d81ed3af0d19c875973bb35a6e6f12c550`. That fallback artifact records the terminal provider-contract failure only; it does not preserve the rejected semantic finding register. Historical evidence is not rewritten.

## Assurance rule

The corrected contract must prove in normal CI that:

1. provider-supplied identity strings cannot override caller-owned provenance;
2. provider-facing identity fields retain their established required-string shape without exact literal constraints;
3. invalid caller-owned identity is rejected before provider execution;
4. open blocking/material findings deterministically produce `fail_hold` regardless of the provider-supplied decision;
5. otherwise open minor findings deterministically produce `conditional_pass`;
6. a clean retained finding register deterministically produces `pass`; and
7. every normalized provider result still passes the unchanged canonical downstream assurance schema before it can be retained or affect asset status.

The correction does not weaken semantic assurance. The reviewer still owns the educational findings. The system owns only deterministic provenance and the mechanical classification implied by those findings.

## Safe replay

After this implementation is approved, merged and confirmed Live, run exactly one fresh v2 re-assurance against:

- recovered remediation run `36140767632`;
- retained remediation artifact `10866767131`;
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`.

Do not regenerate remediation content. If fresh semantic assurance returns blocking/material findings, retain them and continue with the smallest-safe targeted remediation. If the findings expose a credible Foundation defect, reopen the Foundation instead. If the bundle passes, Learn and Practice may become internally assured, but learner publication remains blocked until qualified-human `foundation_approved` state is recorded.

## Scope and documentation impact

This is an implementation correction under existing Content Factory authority. It changes neither Course Truth nor Exam Truth, learner content, remediation output, Foundation approval state, publication eligibility, nor the requirement for qualified human Foundation approval before learner publication.

No normative authority change or ADR is required. This technical implementation/evidence note is the documentation impact for the correction. Historical proof artifacts and failed workflow runs remain immutable.
