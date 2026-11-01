# Issue #698 — Trusted Psychology PR #759 critical-table and scatter A2/A3 independent review

**State:** proposed reviewer infrastructure, not available on approved `main` until separately Founder-approved and merged. **Scope:** existing draft [PR #759](https://github.com/lhanson-dev/revision/pull/759); **no learner-facing change** and no sign-off of its new content by merely installing the runner.

## Why the separate controlled change exists

PR #759 has full current-head engineering CI, but it adds three original scored table-lookup questions and two self-check activities. The existing trusted reviewer `.github/workflows/psychology-pr746-a3-review.yml` only authorises PR #746 and cannot be used as evidence for these five new activities. The **Content Accuracy Assurance Gate** requires independent fresh-context A3, and A2 review for explanatory feedback; same-context author arithmetic or green CI does not meet that gate.

## Entrypoint and isolation

The governed workflow is `.github/workflows/psychology-pr759-a3-review.yml` and calls `scripts/assurance/psychology-pr759-a3-review.mjs`, with fail-closed no-secret tests in `scripts/assurance/psychology-pr759-a3-review.node-check.mjs`.

Once this **separate reviewer PR** is merged and verified on approved main, the executing agent may initiate review by posting this exact comment **on PR #759**, attributed to Founder account `lhanson-dev`:

```text
revision-run-psychology-critical-table-a3:v1
head_sha: <exact current 40-character head SHA of PR #759>
```

This marker starts only the separate AI review. It is **not** `revision-founder-approval:v1`, does not approve a merge and cannot publish the reviewed content.

The trusted workflow runs only on an `issue_comment` for PR #759 whose author is the repository Founder/OWNER. The runner independently validates comment syntax, same-repository PR, exact SHA, current `main` checkout and branch state. The `OPENAI_API_KEY` remains in the approved-main workflow, never in PR #759's build, tests or code execution. All allowlisted PR #759 files are fetched over read-only GitHub API as inert UTF-8 text and their Git blob SHA-1 hashes recomputed. Unexpected changed content, moved PR/head, non-Owner comment, malformed review schema, absent key or provider errors fail closed. No PR code is checked out, imported or executed by the review job.

## Exact review contract

The five explicit required item IDs are:

1. `rev7182-4.2.3-sign-critical-lookup-01`
2. `rev7182-4.2.3-sign-critical-lookup-02`
3. `rev7182-4.2.3-sign-critical-lookup-03`
4. `psy-rm-sign-critical-interpret-01`
5. `psy-rm-scatterplot-construction-01`

The independent reviewer receives only original Revision content and bounded structured exam facts: AQA Psychology **7182 version 1.4 (1 September 2025)**, Research Methods **§4.2.3.3 printed p21** and mathematical skills Annex **§7.2 printed pp35–37**, treated as **REFERENCE_ONLY**. No protected board source paragraphs, exam questions or official mark scheme prose are provided.

All eight dimensions must be returned: scope/rights; independently reconstructed exact binomial critical table; each of the three lookup items; statistical-significance conclusions and worked feedback; scatterplot coordinates/construction/causality; and assessment scoring, readability and claim limitations. An independently reviewed one-number answer establishes **table lookup only**; the statistical interpretation and graph construction exercises are self-checked and must not be credited as independently marked skills or student mastery.

Strict JSON issue registers require exact item IDs, dimensional statuses, material/blocking finding details and internally consistent `pass` vs `fail_hold` decision. Material or blocking findings fail the workflow. Provider work is bounded by model `gpt-5.6-terra`, `store=false`, a **US$0.50** conservative reserve/cost ceiling and retained 30-day GitHub Actions review artifact. This is an independent AI challenge, **not** qualified human educator/examiner sign-off, legal clearance, or full course coverage.

## Release and documentation impact

After the runner is installed: trigger it for PR #759's exact head; inspect the original retained receipt and source blob fingerprints; correct any material findings in PR #759 and rerun independent review on the new head; verify exact-head engineering CI and main integration; then seek distinct Founder approval before merging PR #759. Neither this review infrastructure nor subsequent PR #759 content is approved merely because engineering checks pass.

Documentation impact: this indexed technical note accompanies this restricted reviewer workflow and tests. No runtime, product feature, learning evidence, database, governance authority, source-rights classification, schema or learner data changes. Historical PR #746 receipt and original Psychology source audits are not rewritten. Full Issue #698 remains open.
