# Founder Approval Gate

**Status:** Active on `main`; Recovery 4 merge-boundary hardening proposed via PR #151  
**Date:** 2026-08-23

## Purpose

Make the exact Founder merge-approval evidence contract visible on the PR head before merge, so concurrent feature work and separate executing conversations do not rely only on procedural memory.

This control supplements rather than replaces:

- explicit Founder approval for the specific PR merge;
- current-main integration checks;
- Revision CI;
- the exact two-line GitHub marker;
- enforced prevention of merge while the gate is not successful; and
- post-merge governed release-lineage verification.

## Commit status

The workflow publishes this status on the current PR head:

`revision/founder-approval`

The status is evaluated by `scripts/assurance/founder-approval-status.mjs`.

### Success

`success` requires all of the following for the same exact PR head:

1. the latest Revision CI run is completed;
2. that latest exact-head CI concluded successfully;
3. the PR conversation contains the exact machine-readable Founder marker:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

4. the marker was created by the configured Founder GitHub login; and
5. the marker timestamp is at or after completion of the latest exact-head CI.

### Pending

The status remains `pending` when:

- no exact-head Revision CI exists yet;
- exact-head CI is still running;
- the exact marker is absent;
- only prose/non-machine-readable approval evidence exists; or
- the marker predates the latest exact-head CI.

### Failure

The status is `failure` when the latest exact-head Revision CI has completed unsuccessfully or the PR head cannot be established.

## Workflow triggers

`.github/workflows/founder-approval-status.yml` runs from trusted default-branch code on:

- PR open/reopen;
- PR head synchronization/change;
- PR ready-for-review transition;
- PR conversation comments being created or edited; and
- completion of a pull-request-triggered `Revision CI` workflow run.

The CI-completion trigger is important even when the PR SHA is unchanged: a rerun can become the latest exact-head CI and therefore change whether previously recorded approval evidence is still valid. The gate must recalculate rather than leave a stale success status in place.

A head change causes the new head to be evaluated independently. An old head's approval cannot make the new head green.

## Security boundary

The workflow uses `pull_request_target`, `issue_comment` and `workflow_run` only to run trusted code checked out from `main`; it does not execute code from an untrusted PR head.

For `workflow_run`, only pull-request-triggered Revision CI runs with an associated PR are evaluated. Push runs do not become approval evidence.

The workflow has read-only repository/PR/Actions permissions plus `statuses: write` solely to publish the gate status.

The status does not grant approval. It reports whether repository evidence proves approval that has already been explicitly given.

## Merge-time operating rule

For every release-governed PR after Recovery 3, merge must not be executed unless the current PR head has:

- required Revision assurance success;
- current-main integration evidence required by governance;
- the exact Founder marker; and
- `revision/founder-approval = success`.

The executing agent must re-read the PR head, latest exact-head CI and status immediately before merge.

Recovery 4 does not weaken this rule. The Recovery 4 PR must itself meet the same exact-head Founder gate before merge.

## Repository-level enforcement

After DEF-2026-007, the status is not only an operating-agent check. The merge boundary must fail closed when `revision/founder-approval` is not successful.

Where GitHub exposes required-status enforcement for `main`, repository protection/rules must require `revision/founder-approval` before a merge can be accepted. Where that repository-native enforcement is not available, an equivalent independently enforced fail-closed merge control is required.

Operating-agent convention alone is no longer sufficient evidence of prevention. Repository settings must not be represented as enforcing the gate until that enforcement has been independently verified.

The post-merge release-lineage verifier remains an independent backstop. It protects Production if a merge-boundary control fails, but a successful fail-closed production backstop is not a substitute for preventing an unevidenced merge into canonical `main`.

## Recovery 3 rollout completion

PR #112 introduced the gate and merged exact head `c2d94210aa48b0e5b078b730d812857b77448989` after Revision CI #658 and exact Founder marker comment `5379367930` were verified. The merge commit `62d75df280ac0ba5b0df72916b9394ecb8de75b5` completed production run `32562931908` with governed release lineage, backend readiness, build, Pages deployment, production smoke and durable `revision/path-to-live = success`.

The workflow is therefore live on `main` and correctly evaluates each prospective exact PR head.

## Recovery 4 incident and hardening

PR #139 showed the remaining gap. Its exact head `8a514a91b41a36da24c0606b000143d74d62e1df` passed Revision CI #871, but `revision/founder-approval` remained `pending` and the PR conversation contained no exact machine-readable Founder marker. The status gate therefore identified the PR as not ready, yet the merge still entered `main` as `22c6d40295cbeb012b12895538318e3601f62ab9`.

The production release verifier then failed closed, and later PR #149 and PR #138 inherited the broken release lineage. PR #138 itself had correctly satisfied its own exact-head CI, explicit Founder approval, exact marker and successful Founder status before merge; its production run still stopped while traversing the older PR #139 ancestor.

ADR-0018 and PR #151 define Recovery 4. The recovery preserves all historical PR #139 evidence unchanged, establishes a prospective release trust root from failed current `main`, and elevates merge-boundary enforcement from a desirable repository hardening step to a required control.

DEF-2026-007 must not close merely because Recovery 4 restores a green Production release. Closure also requires independent evidence that `revision/founder-approval` is enforced at the merge boundary, or that an equivalent fail-closed merge control is live.
