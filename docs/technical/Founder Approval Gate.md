# Founder Approval Gate

**Status:** Active on `main`; advisory status worked for PR #139 but repository-level enforcement was not active; Recovery 4 hardening pending  
**Date:** 2026-08-23

## Purpose

Make the exact Founder merge-approval evidence contract visible on the PR head before merge, so concurrent feature work and separate executing conversations do not rely only on procedural memory.

This control supplements rather than replaces:

- explicit Founder approval for the specific PR merge;
- current-main integration checks;
- Revision CI;
- the exact two-line GitHub marker;
- verified repository-level merge enforcement; and
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

For every release-governed PR, merge must not be executed unless the current PR head has:

- required Revision assurance success;
- current-main integration evidence required by governance;
- the exact Founder marker; and
- `revision/founder-approval = success`.

The executing agent must re-read the PR head, latest exact-head CI and status immediately before merge.

After Recovery 4, ordinary release-governed merges also require verified repository-level enforcement of the required Revision CI and `revision/founder-approval` checks. Agent-side verification remains necessary but is no longer accepted as the sole merge barrier.

## Recovery 4 enforcement incident

PR #139 exact head `8a514a91b41a36da24c0606b000143d74d62e1df` completed Revision CI #871 successfully. The trusted gate nevertheless remained correctly:

`revision/founder-approval = pending`

because the PR conversation contained no exact machine-readable Founder marker.

PR #139 was still merged as `22c6d40295cbeb012b12895538318e3601f62ab9`.

This is important evidence: the status evaluator did **not** falsely report success. The failure was that the pending status was not mechanically required as a merge condition and the executing merge path did not honour the operating rule.

PR #149 later followed the correct sequence for its own head, but Production run `32658623030` failed closed while traversing PR #139. No new Production artifact was deployed.

## Repository-level enforcement

The strongest steady-state configuration is now mandatory after Recovery 4: GitHub branch protection/rules, or a separately Founder-approved hard technical equivalent, must prevent an ordinary merge unless the current candidate has the required Revision CI success and:

`revision/founder-approval = success`

At the Recovery 4 investigation point, GitHub branch metadata reported required-status-check enforcement level `off` and no required contexts/checks. That state is not sufficient for ordinary merges after Recovery 4.

Workflow presence, a visible commit status and documentation do not prove repository enforcement. Actual GitHub repository state must be independently verified.

If the current repository plan/ownership model cannot provide required-status enforcement, ordinary merges remain blocked until an alternative hard mechanism is explicitly governed. The system must not silently fall back to the advisory-only operating rule that PR #139 bypassed.

The post-merge release-lineage verifier remains independent and mandatory even after the hard pre-merge barrier is active.

## Recovery 3 rollout history

PR #112 introduced the gate and merged exact head `c2d94210aa48b0e5b078b730d812857b77448989` after Revision CI #658 and exact Founder marker comment `5379367930` were verified. The merge commit `62d75df280ac0ba5b0df72916b9394ecb8de75b5` completed production run `32562931908` with governed release lineage, backend readiness, build, Pages deployment, production smoke and durable `revision/path-to-live = success`.

Recovery 3 therefore proved that the status workflow could operate correctly. Recovery 4 records the separate lesson that correct status calculation is not enough unless merge enforcement is hard rather than advisory.
