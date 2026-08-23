# ADR-0018 — Fourth governed release-lineage recovery and hard merge enforcement

Status: Accepted on merge — explicit Founder approval of the recovery PR is the acceptance decision
Date: 2026-08-23

## Context

Recovery 3 completed through PR #112 and introduced the trusted pre-merge commit status `revision/founder-approval`. The status is designed to be `success` only when the same exact PR head has successful Revision CI and the mandatory machine-readable Founder approval marker created at or after that CI.

On 23 August 2026, PR #139 was merged from exact head:

`8a514a91b41a36da24c0606b000143d74d62e1df`

as merge commit:

`22c6d40295cbeb012b12895538318e3601f62ab9`

Revision CI run #871 completed successfully for that exact head, but `revision/founder-approval` remained `pending` and the PR conversation contains no machine-readable Founder approval marker. The PR was nevertheless merged.

This proves that the Recovery 3 gate calculated the unsafe state correctly but was not a hard merge barrier. Current branch metadata also reports required-status-check enforcement as off for `main`. The incident is therefore a failure of repository-level enforcement and merge execution, not a failure of the status evaluator.

PR #149 subsequently followed the correct approval sequence for its own exact head and merged as:

`e21903e580facdc36f2f676582e48ff0df88d3f7`

Production run `32658623030` failed closed while traversing the PR #139 ancestor. Backend readiness, build, Pages deployment and production smoke were skipped. The prior known-good Production artifact therefore remained in place.

Historical PR #139 evidence must not be rewritten or backfilled to manufacture compliance.

## Decision

### 1. Establish a fourth exceptional recovery checkpoint

Use the existing bootstrap-parent mechanism to establish a new prospective governed trust root from the exact failed pre-remediation `main` commit:

`e21903e580facdc36f2f676582e48ff0df88d3f7`

This checkpoint does not assert that PR #139 complied with the approval-marker contract and does not alter PR #139 or PR #149 historical evidence.

The Recovery 4 PR must:

1. be based on the exact recovery anchor above unless a later current-main refresh is deliberately reconciled under active integration rules;
2. pass required Revision CI for its final integration candidate;
3. receive explicit Founder approval for the Recovery 4 PR merge;
4. persist and verify the exact `revision-founder-approval:v1` marker for the final head after the latest exact-head CI;
5. verify `revision/founder-approval = success` on that same head before merge;
6. merge only the evidenced exact head;
7. pass governed release lineage using the Recovery 4 anchor;
8. pass production backend readiness, production build, Pages deployment and production smoke; and
9. publish durable `revision/path-to-live = success` for the recovery merge before release continuity is considered restored.

### 2. Treat the recurrence as an enforcement failure, not another wording failure

Recovery 3 already made the required evidence contract machine-readable. PR #139 proves that an advisory status is insufficient when the repository still permits a merge while that status is pending.

Recovery 4 therefore does not add another equivalent procedural reminder as the primary prevention control. The missing hard barrier is repository-level required-check enforcement.

### 3. Require verified repository-level enforcement before ordinary merges resume

After Recovery 4 is merged, ordinary release-governed PRs must not be merged into `main` until repository settings are independently verified to require, at minimum:

- successful Revision CI for the current candidate; and
- `revision/founder-approval = success` for the current exact PR head.

The repository setting must be verified from actual GitHub state. Documentation or workflow presence is not evidence that the check is enforced.

The Recovery 4 PR itself is the narrow recovery needed to restore the broken prospective release chain and is governed under the pre-existing exact-head CI, Founder marker, approval-status and post-merge lineage controls. It does not constitute evidence that repository-level enforcement is already active.

If the current GitHub plan/ownership model cannot provide required-status enforcement, ordinary merges remain blocked until an explicitly Founder-approved alternative hard enforcement mechanism is designed and implemented. The system must not silently fall back to the advisory operating rule that has now failed.

### 4. Preserve post-merge fail-closed verification

The existing release-lineage verifier remains mandatory even after hard pre-merge enforcement is configured. The pre-merge barrier prevents known-unapproved candidates from entering `main`; post-merge lineage independently proves that the Production release chain remains governed.

## Historical evidence rule

Do not add a retrospective exact marker to PR #139. Do not edit its empty PR conversation or failed descendant release status to make the historical merge appear compliant.

The failed `revision/path-to-live` status on `e21903e580facdc36f2f676582e48ff0df88d3f7` remains historical evidence of the fail-closed release control working as intended.

## Consequences

- Recovery 4 can restore prospective Production release continuity without falsifying PR #139 history.
- The recurrence is explicitly classified as a hard-enforcement gap rather than another marker-format misunderstanding.
- Ordinary merges are blocked after Recovery 4 until required-status enforcement is independently verified, or a different hard enforcement mechanism is explicitly governed.
- `revision/founder-approval` remains necessary but is no longer treated as sufficient merely because it exists.
- Post-merge release lineage, backend readiness, deployment and smoke continue to fail closed independently.
