# Content Factory Foundation Learning Output Capacity Remediation

**Status:** Current implementation evidence for the third `course-learning-blueprint-v2` / provider-v5 Business generation attempt  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`

## Purpose

Record the retained live failure from Foundation Internal Learning Proof run `35569824646` and the smallest implementation remediation required before another paid Business generation attempt.

This is a technical capacity/reliability correction. It does not change Course Truth, the Course Learning Blueprint, provider contract v5, deterministic evidence placement, asset assurance, Foundation approval or learner-publication rules.

## Retained proof

Run `35569824646` executed on approved `main` commit `250ac7f1cd7e829fc6cadfdb52fd7e8a6d65d489` from the unchanged retained AQA A-level Business 7132 — 2027 Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

All retained source-proof and AI-assured Foundation identity/fingerprint checks passed before generation.

The run retained artifact `10625697294` with digest `sha256:3bab6ab6069d9cf2935055a5b6f6699ed8d54c4fd40314ae327bc8eabe577448`.

Generation progressed materially beyond both earlier v2/v5 fail-holds:

- 10 complete Learn/Practice work units succeeded;
- the Learn asset for the 11th work unit, `foundation-markets-and-customers`, also succeeded;
- the 11th Practice call returned provider response status `incomplete`;
- provider contract version remained `5`;
- provider/model remained `openai / gpt-5.6-terra`;
- 22 provider calls were attempted with zero retries;
- reported final-response usage cost was `$0.79932` across those 22 calls;
- the failing Practice call retained reported usage cost `$0.0544`;
- the configured output ceiling was `4000` tokens;
- the configured hard course spend ceiling remained `$12.00`;
- learner asset count remained `0`;
- overall result was `fail_hold`;
- qualified-human Foundation review remained pending; and
- learner publication remained false.

The exact retained failure was:

`Foundation Practice generation failed for foundation-markets-and-customers: OpenAI response status was incomplete`

The previous atomic-placement and Practice evidence-indexing failures did not recur before this infrastructure stop. The successful `foundation-external-business-environment` Practice call is direct live evidence that the PR #356 locator-alignment repair cleared the earlier missing-activity failure at that work unit.

## Root cause and remediation boundary

The live proof workflow explicitly constrained generation responses to `4000` output tokens even though the shared provider adapter's bounded default is `8000` tokens. The failure occurred as an infrastructure `incomplete` response rather than a provider-contract rejection.

The smallest safe correction is therefore to align this proof workflow to the existing `8000`-token adapter capacity while preserving the unchanged `$12.00` hard spend ceiling. The shared spend ledger reserves conservatively against the configured maximum before each call and still refuses a call that would breach the hard ceiling.

This repair deliberately does **not**:

- weaken any v5 schema or deterministic evidence resolver;
- retry the failed historical run or mutate its evidence;
- automatically retry an unchanged `incomplete` response;
- increase the hard course spend ceiling;
- change Foundation truth or approval state; or
- make any generated content learner-publication eligible.

A regression test binds the workflow to both the `8000` response-capacity setting and the unchanged `$12` hard spend ceiling.

## Governed next step

After this implementation repair passes exact-head assurance, receives explicit Founder approval, merges and becomes Live, trigger exactly one **new** Business v2/v5 generation from the unchanged retained Foundation proof. Do not rerun or relabel run `35569824646`.

If the new generation succeeds, bind deterministic and genuinely fresh-context independent asset assurance to that exact new bundle. If it fails, diagnose the retained failure and remediate the smallest safe scope rather than weakening the approved learning or evidence contracts.

## Documentation impact

No normative authority or architecture decision changes, so no new ADR is required. This document is the technical implementation/evidence record for the output-capacity repair and preserves the failed run as immutable historical evidence.
