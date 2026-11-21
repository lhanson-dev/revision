# WS4 #703 — trusted independent Psychology sign-statistic A2 review gate for PR #843

**Scope:** release-governed independent reviewer **infrastructure only**. This is NOT a review PASS, implementation approval, student feature, production Psychology repair, or permission to merge #843.

## Exact target and reason

Draft [PR #843](https://github.com/lhanson-dev/revision/pull/843) adds an ORIGINAL unscored Psychology sign-test statistic S worked refresher to the existing Research Methods Learn page with a source-tagged wrong answer and a different independently scored final-number question. The two original one-mark scored problems were independently A3 reviewed earlier; that reviewer **did not review this new guided teaching**. The Content Accuracy Assurance Gate requires a separate fresh-context educational challenge before the new teaching can be published.

Founder-supplied exact AQA A-level Psychology **7182 version 1.4, 1 September 2025**, §4.2.3.3 p21 and mathematical skills §7.2 control the scope. PDF SHA-256: `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. REFERENCE_ONLY: no protected PDF content or past-paper mark schemes are supplied to the reviewer. One exact output atom `PSY-SRC-4233-IT03` (calculate S after excluding tied pairs), not the complete sign-test selection/significance/working ability.

## Trusted implementation and independence contract

Three files implement the source/identity/receipt gate:
- `.github/workflows/psychology-pr843-a2-review.yml` — executes an isolated fresh-context reviewer ONLY from approved GitHub `main`, with no PR checkout/execution under the provider secret.
- `scripts/assurance/psychology-pr843-a2-review.mjs` — exact Founder/OWNER/PR #843/two-line comment validator; verifies the PR is open and same-repository, base is `main`, reviewed PR head is current, trusted runner SHA equals approved main; fetches an allowlisted set of source text over read-only GitHub API at the exact head, hashes each blob independently, treats source as inert untrusted data, passes strictly scoped original AQA demand/rights and eight dimensions to a separate fresh-context model with `store=false`, capped model expenditure and strict JSON schema.
- `scripts/assurance/psychology-pr843-a2-review.node-check.mjs` — no-provider-key tests for marker, non-owner/cross-PR malformed triggers, SHA integrity, exact review dimensions, source atom only, material/blocking FAIL_HOLD, and retained open issues.

After this **separate reviewer-infrastructure PR** has passed CI, is approved by the Founder for its specific merge, and is merged/verified as trusted on `main`, run the educational review by posting **an authorised Founder-account comment on PR #843**:

```text
revision-run-psychology-sign-test-loop-a2:v1
head_sha: <exact current 40-character PR843 head>
```

This trigger is **not** the Founder approval to merge #843. If PR843 head moves afterward, or material/blocking content findings are reported, repeat or remediate before any specific PR843 merge approval. The provider key remains in the trusted approved-main runner, never a PR checkout. Missing key, stale head, invalid scope/receipt, cost cap, provider failure or material/blocking issue MUST fail closed. No secrets or student data are included in the review input; only allowlisted original code, test and technical scope are provided.

## Mandatory review dimensions

1. Source/rights and the exact source-atom boundary.
2. Independent sign plus/minus/tie count and integer statistic.
3. A third unscored worked example genuinely distinct from both scored source questions.
4. Pedagogical accuracy and learnability at A-level.
5. Exact integer saved evidence, single-target mapping and discrimination boundaries.
6. Genuine FI-001 trusted Plan Start, with no forged URL repair.
7. No marks or mastery from revealing/reading.
8. Limitations of source, assessment and real learner route.

A separate fresh-context AI A2 PASS does **not** equal qualified human Psychology examiner judgement, source PDF rights clearance, a complete AQA skills audit, an authenticated browser/hosted acceptance result, or durable student learning. The original historical A3 FAIL/HOLD and remediation remain intact.

## Documentation impact and governance

No new planner, learner-facing code, Auth/RLS, schema, educational requirement, canonical runtime or product authority. Reviewer infrastructure, guard tests, index and this note are governed together. No normative authority change or ADR is required. **Specific Founder approval is required for reviewer infrastructure merge and separately for the later content PR #843.** Check the then-current approved main and exact-head CI before either decision; never silently override newer main state.