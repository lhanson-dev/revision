# Issue #698 — Trusted independent A3 review runner for Psychology PR #746

**State:** governed proposal, not installed on approved `main` until this PR is independently approved and merged. **Purpose:** remove the current Psychology sign-test Practice review bottleneck without weakening the active `80-company-workflows/Content Accuracy Assurance Gate.md`.

## Why this is needed

Draft PR #746 introduces two original, independently scored sign-test S calculations. Its exact-head engineering CI has passed, but the new A3 questions require a *fresh separate review context* to challenge the paired observations, arithmetic, question demand, strict-integer scoring, feedback, rights boundary and evidence claim. Prior authoring-context arithmetic and QA do not constitute this independent review.

The existing Psychology Step 6 and launch workflows review approved `main`, not the unmerged sign-test PR. Moving code to production solely to run the review would invert the content gate.

## Trusted trigger and execution contract

Approved-main GitHub Actions workflow: `.github/workflows/psychology-pr746-a3-review.yml`. Entrypoint: `scripts/assurance/psychology-pr746-a3-review.mjs`, with standalone tests `psychology-pr746-a3-review.node-check.mjs`.

After this review-workflow change has its own governed Founder-approved merge, the authorized Founder can trigger the reviewer by posting an **issue comment on PR #746** with *exactly*:

```text
revision-run-psychology-sign-test-a3:v1
head_sha: <current exact 40-character PR #746 head SHA>
```

The executing agent may post this comment as a mechanical review initiation after reading the current approved `main` and the unmerged PR. This is **not** the `revision-founder-approval:v1` merge authorization and must never be mistaken for one.

A workflow job is enabled only for PR #746 and the Founder GitHub login `lhanson-dev`, with owner association. The trusted runner independently checks the event marker, author, PR identity and exact head, same-repository branch, approved-main checkout and current main SHA. A moved PR or stale trigger fails closed. Secrets reside only in the trusted workflow from `main`; the process **never checks out, imports or executes PR code**. It retrieves allowlisted original learner assets as inert GitHub data, verifies their Git blob SHA-1 values and confirms the reviewer packet's exact source blob fingerprint.

## Source rights, reviewer independence and economics

The model receives only permitted structured AQA 7182 v1.4 alignment facts (printed section 4.2.3.3), original Revision-authored sign-test code/questions, actual numeric scoring-path excerpts and independently observable evidence limits. AQA `REFERENCE_ONLY` content is not supplied as protected specification or examiner prose, and web search is not enabled. The authoring-context issue register is deliberately **excluded** from the model input to reduce anchoring.

One isolated `gpt-5.6-terra` OpenAI Responses call uses `store=false`, strict structured output and high independent reasoning effort. The maximum conservative estimated model spend permitted per trigger is **US$0.50**, following the existing Psychology review provider-cost convention. Unexpected scope, unreadable source, missing protected key, API failure, overspend, malformed result, missing item/dimension or inconsistent pass/fail decision cause a stop, not a fabricated pass.

The eight mandatory review dimensions cover source rights/scope, both datasets and arithmetic, statistical validity, marks/scoring, worked feedback, learner readability and bounded evidence claims. Findings include item, severity, evidence, correction, affected artifact and `open` resolution state. Any blocking/material issue causes `fail_hold`.

Retained evidence is uploaded as a time-bounded Actions artifact with exact PR head, trusted main runner SHA, reviewed blob SHAs, reviewer model, dimensions, findings and cost. A successful workflow proves only that the scoped separate AI review returned a validated result; the executing agent must still read the artifact and independently compare it to the original instruction, source IDs and tests before recommending educational publication. Copy a validated reviewer receipt into the content PR and repeat affected assurance if code changes. Do not falsely claim qualified human review or examiner-equivalent marking.

## Limits and governance

This review mechanism **does not merge or edit PR #746**, release content, elevate source-first prototype truth, change Progress/Plan, process learner data or modify normative governance. It cannot fulfil the outstanding independent human subject/assessment sign-off for broader Psychology commercial assurance. Exact-content evidence, no unresolved material findings, fresh current-main CI and **separate Founder-specific merge approval for PR #746** remain mandatory before that PR enters `main`.

**Documentation impact:** this note and INDEX pointer accompany the new trusted workflow, runner and tests; no active authority/ADR/schema changes or existing historical audit rewrites. The mechanism is deliberately narrowly scoped rather than an unsanctioned general new product/assessment feature.
