# ADR-0018 — Fourth governed release-lineage recovery after PR #139

Status: Accepted on merge — explicit Founder approval of the recovery PR is the acceptance decision
Date: 2026-08-23

## Context

Recovery 3 introduced the trusted pre-merge `revision/founder-approval` status gate and made that status a mandatory operating check for release-governed PRs.

PR #139 nevertheless merged from exact head `8a514a91b41a36da24c0606b000143d74d62e1df` as merge commit `22c6d40295cbeb012b12895538318e3601f62ab9` while `revision/founder-approval` remained `pending`. Revision CI #871 had passed for the exact head, but the PR conversation contains no exact machine-readable Founder marker and no durable PR comment that can satisfy the current release contract.

Production run `32657564150` failed closed on PR #139. PR #149 then merged as `e21903e580facdc36f2f676582e48ff0df88d3f7` and also received `revision/path-to-live = failure` in run `32658623030` because the failed PR #139 ancestry remained unresolved.

PR #138 subsequently followed the current pre-merge control correctly: exact-head Revision CI #876 succeeded for `3d4791481eb6504080ac1d53d9112bfa3233f7f5`, the Founder explicitly approved the merge, exact marker comment `5387932486` was persisted and verified, and `revision/founder-approval = success` was confirmed immediately before merge. PR #138 merged as `8ed308ad39a9f585a2a578be396a0161df011a8b`.

Production run `32660332173` then failed closed while traversing the earlier PR #139 merge. Backend readiness, production build, deployment and smoke were skipped. The prior known-good production deployment therefore remained protected.

The repository's recovery guardrail prohibits retrospectively creating historical approval evidence merely to make an old merge appear compliant. A new recovery trust root therefore requires its own governed decision and Founder-approved recovery PR.

## Decision

### 1. Establish a fourth exceptional recovery checkpoint

Set the release-lineage bootstrap parent to the exact failed current `main` commit before the recovery PR:

`8ed308ad39a9f585a2a578be396a0161df011a8b`

This is a prospective trust root only. It does not assert that PR #139 satisfied the Founder approval contract and it does not alter the failed `revision/path-to-live` evidence on PR #139, PR #149 or PR #138 merge commits.

The Recovery 4 PR must:

1. start from the exact failed current `main` commit above unless later mechanically reconciled under the active current-main integration rule;
2. pass required Revision CI for its final exact head;
3. receive explicit Founder approval for this specific recovery merge;
4. persist and verify the exact machine-readable Founder marker after the latest exact-head CI;
5. show `revision/founder-approval = success` for the same exact head immediately before merge;
6. merge only that evidenced head;
7. pass governed release lineage using the Recovery 4 trust root;
8. pass production backend readiness, production build, Pages deployment and production smoke; and
9. publish durable `revision/path-to-live = success` before Recovery 4 is considered operationally complete.

### 2. Preserve the incident as a control failure

PR #139's historical evidence must remain unchanged. Do not add or edit an old marker solely to make the historical merge appear compliant.

The incident is a P1 path-to-live control failure because production release is blocked while an older known-good deployment remains available. The Defect Register must remain open until recovery production evidence is green and the recurrence-prevention control is addressed.

### 3. Escalate repository-level enforcement

The pre-merge status gate worked: PR #139's exact head remained `pending`. The failure was that merge execution was still possible despite that status.

The repository enforcement target in the Release & Deployment Standard therefore becomes a material follow-up: `revision/founder-approval` should be configured as a repository-required status check on `main` where GitHub supports it. Recovery 4 restores the release chain, but the recurrence-prevention defect should not be considered fully closed until that enforcement is independently verified or an equivalent fail-closed repository control is implemented.

## Historical evidence rule

Do not rewrite PR #139 comments, statuses, merge metadata or failed production runs. Preserve PR #149 and PR #138 failed release statuses as evidence of the inherited lineage break.

## Consequences

- Production remains on the prior known-good deployment until Recovery 4 completes successfully.
- The recovery is explicit and prospective rather than retrospective evidence manufacturing.
- PR #138 remains validly merged to `main`; its production release is delayed only by the inherited lineage break.
- Repository-level enforcement of the Founder approval status is now a concrete recurrence-prevention requirement rather than a best-effort operating reminder.
- Any future bootstrap reset remains exceptional and requires its own Founder-approved decision.
