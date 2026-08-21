# Path-to-Live Assurance Review — 2026-08-21

**Status:** Point-in-time assurance evidence  
**Scope:** Current `main`, recent merged PRs, release lineage, production deployment evidence, current defect/assurance records.

## Executive finding

Revision's repository and PR CI remain operational, but the production path to live is currently **Attention needed**.

The latest `main` commit `d960c950f4620dd469888a1174af582524706ec2` (PR #84) has durable `revision/path-to-live = failure`. The associated Pages workflow run `32432017259` failed at **Governed release lineage** because PR #84 had no machine-readable Founder approval marker for exact head `754077b40c7ca6fac40117629b97d576285fdc58`. Backend readiness, build, deployment and production smoke were therefore skipped as designed.

This is not evidence that PR #84's code failed CI. PR #84 records successful exact-head Revision CI. The failure is the handoff between explicit Founder approval in the operating conversation and the GitHub evidence required by the release verifier.

## Failure sequence observed

The last currently observed successful path-to-live commit in the inspected recent sequence is `e8ed2a97f22e80165aec3b6d165bc4ec56875d04` from PR #80, with `revision/path-to-live = success`.

Subsequent inspected merged commits have terminal path-to-live failure:

| PR | Merge commit | Result | Observed release issue |
|---|---|---|---|
| #75 | `bd89496e6798fc7be3a56a11b8fa9a15e8eacefb` | failure | governed release lineage failed; downstream deploy stages skipped |
| #77 | `9fe85b054147e8d8166db7dd71c3a163dedb3b0b` | failure | terminal path-to-live failure |
| #81 | `6ee653870fdf15d8a3a3632c71fe0ec44c7b984c` | failure | terminal path-to-live failure |
| #82 | `379da192ea066e6bb03b8268ee7d8e6fe08f87cb` | failure | terminal path-to-live failure |
| #84 | `d960c950f4620dd469888a1174af582524706ec2` | failure | missing Founder approval marker for exact head; downstream stages skipped |

The inspected PR conversation timelines for #75, #77, #81, #82 and #84 contain no top-level GitHub comments, therefore no `revision-founder-approval:v1` marker.

## Control behaviour

The fail-closed release control behaved correctly. `scripts/assurance/release-lineage.mjs` requires all of the following before deployment:

1. exact merged PR correlation;
2. latest exact-head Revision CI completed successfully;
3. a Founder-authored machine-readable approval marker for that exact head;
4. approval recorded after exact-head CI completion; and
5. a recoverable governed prior-release chain.

A merge without the marker is therefore intentionally prevented from deploying.

## Root cause

The operational workflow and the automated release contract are not joined up.

The Founder can explicitly approve a merge in the operating conversation and the agent can then merge the PR, but the current AI/repository workflow does not require the agent to persist the machine-readable approval marker into the PR conversation **before** performing the merge. The production release verifier only reads GitHub evidence and correctly refuses to infer approval from the fact that the PR merged.

This created a repeated class of governed-but-unreleasable merge.

## Severity

**P1 — High.** The Testing & Assurance Standard explicitly includes an unhealthy production deployment while an older safe version remains available as a P1 example. Current `main` is ahead of the last successful production release and the latest release attempt is failed.

No evidence in this review establishes a P0: the fail-closed control prevented an unproven release from reaching production, and an older deployed version remains available.

## Documentation / register drift

At review time, `90-governance-registers/Defect Register.md` still reports zero known open P0/P1/P2 defects and was last triaged on 2026-08-19. That is stale relative to the observed release failure and should be corrected in the remediation PR.

The Assurance Coverage Register remains valid as a statement that the path-to-live controls exist and are repeatable, but dynamic path-to-live health is currently **Attention needed**, not Healthy. Coverage must not be confused with the current execution result.

## Required remediation

1. Record the current failed release as an open P1 defect.
2. Amend the AI/repository merge workflow so that, after explicit Founder approval for a specific PR and before merge, the agent must:
   - re-read the exact current PR head;
   - confirm required exact-head CI is successful;
   - write `revision-founder-approval:v1` with that exact head to the PR conversation using the Founder-authorised GitHub workflow;
   - verify the marker is readable; and only then
   - merge the same exact head.
3. Do not backfill historical Founder approval markers by inference. Existing failed ancestors may be recovered only from explicit approval evidence that can be established without inventing authority, or through a separately approved recovery mechanism/change.
4. Reconcile the current FI-002 open PR #83 with current `main` before any merge because its head currently diverges from `main`.
5. After remediation is approved and merged, verify the resulting `main` release reaches backend readiness, build, deployment and production smoke, and that the exact production commit carries `revision/path-to-live = success`.
6. Only then close the P1 with verification evidence.

## Documentation impact conclusion

This incident changes current operational truth and exposes a missing procedural step in the AI/repository workflow. It therefore requires both a current defect record and a normative AI workflow clarification. Historical release evidence is preserved rather than rewritten.
