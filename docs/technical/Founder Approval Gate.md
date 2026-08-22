# Founder Approval Gate

**Status:** Active on `main`; Recovery 3 production verification complete  
**Date:** 2026-08-22

## Purpose

Make the exact Founder merge-approval evidence contract visible on the PR head before merge, so concurrent feature work and separate executing conversations do not rely only on procedural memory.

This control supplements rather than replaces:

- explicit Founder approval for the specific PR merge;
- current-main integration checks;
- Revision CI;
- the exact two-line GitHub marker; and
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

## Repository-level enforcement

The strongest steady-state configuration is for GitHub branch protection/rules to require the Founder approval status and relevant Revision CI checks before `main` can accept a merge.

At the time this control was designed, repository metadata showed required status-check enforcement was not independently enumerable through the connected capability. The workflow therefore provides the machine-readable status immediately, while repository-level required-check configuration remains a separate administrative hardening step that must be verified rather than assumed.

Until that repository setting is enabled and verified, operating agents must still treat the status as mandatory. Post-merge release lineage remains fail-closed independently, so a missed pre-merge check cannot silently reach PROD.

## Recovery 3 rollout completion

PR #112 introduced the gate and merged exact head `c2d94210aa48b0e5b078b730d812857b77448989` after Revision CI #658 and exact Founder marker comment `5379367930` were verified. The merge commit `62d75df280ac0ba5b0df72916b9394ecb8de75b5` completed production run `32562931908` with governed release lineage, backend readiness, build, Pages deployment, production smoke and durable `revision/path-to-live = success`.

The workflow is therefore live on `main` and applies prospectively to subsequent release-governed PRs. Repository-level required-check enforcement remains a separate hardening action and must not be represented as enabled until independently verified.
