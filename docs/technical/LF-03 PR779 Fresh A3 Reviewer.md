# LF-03 — trusted, fresh-context blinded A3 review for PR #779

**Status:** proposed separately governed reviewer tooling; not yet on approved `main`, not run, not certified. The content correction remains draft [PR #779](https://github.com/lhanson-dev/revision/pull/779). Related #765 and #698.

## Why this is separate

Existing approved-main independent reviewer workflows are bound to other PR identities/content and cannot truthfully certify PR #779. A workflow placed on the candidate content branch cannot safely execute arbitrary unmerged code with the provider secret. This proposed runner therefore requires its **own** explicit Founder-approved workflow merge before any A3 assessment can be invoked.

## Safeguards

- Workflow `.github/workflows/lf03-pr779-independent-a3.yml` is only enabled from approved main after a separate governed merge.
- It will accept **only** a GitHub issue comment authored by the repository Founder (OWNER association) on PR #779, exactly:
  
  ```text
  revision-run-lf03-pr779-independent-a3:v1
  head_sha: <exact 40-character PR779 head SHA>
  ```
  
  The comment triggers independent educational review. **It is not merge approval.**
- Review checks both the PR's same-repository, open, main-targeted exact head SHA and trusted current main SHA; mismatches fail closed.
- GitHub read-only fetches the single allowlisted `social-influence-mcq-v2.ts` at exact PR head, verifies the Git blob SHA, parses inert TypeScript via the trusted parser; it does **not** checkout or execute PR code.
- Only the four authored question IDs, stems and four textual options are sent for the blind independent first answer. **The correct-option indexes and authored explanations are withheld**, compared against independently returned answer indexes only after model response.
- Two separate fresh `gpt-5.6-terra` Responses contexts, both with `store=false`, assess: (1) blind answers, independently challenging all four options, ambiguity, syllabus alignment and answer clues **before seeing any authored answer key or explanatory feedback**; (2) only after locking a valid blinded result, challenge the original keyed answers and full explanation/feedback for consistency, misconceptions, ambiguous keys and teaching errors. A material/blocking issue, incomplete review, invalid schema, mismatch, or keyed-feedback contradiction returns **FAIL/HOLD**.
- `OPENAI_API_KEY` is used only by the trusted approved-main workflow; conservative spend reserve limited to **USD $0.50**. No AQA protected PDF text or authentic student data is transmitted. Raw API errors must not expose the key.
- Receipts (PR head SHA, approved-main runner SHA, content Git blob SHA, reviewed original IDs, individual blind keys and critiques, separate authored-feedback critiques) retained as GitHub Action artifacts for 30 days. Review may be rerun for an exact new content head and older receipts are stale.
- Offline tests verify owner identity, exact input, static literal and ID parser, wrong-answer/material-finding fail-close contracts.

## Nonclaims and next gates

An independent fresh-model A3 PASS is **not** independent qualified examiner signoff, direct model access to the original AQA PDF, browser acceptance, proof of course completeness, or production deployment. All relevant CI checks and actual responsive learner session must pass separately. After the reviewer-tool PR is approved/merged, execute the exact-head review for #779, inspect the artifact for all four explicit questions and remediate any substantial issues on #779 before requesting *separate* Founder approval to merge #779. Production/live learner acceptance is a subsequent gate.

## Documentation impact

No new learner product behaviour or normative standard introduced; this separate trusted review infrastructure implements the pre-existing Content Accuracy Assurance Gate, AI Agent Constitution, knowledge and licensing authorities. The implementation is independently documented and indexed. Historical A2/A3 evidence in other PRs is not reclassified or rewritten.
