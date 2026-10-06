# Path-to-Live GitHub Actions Incident Recovery — 2026-10-06

## Status

Open incident record. Recovery 5 is proposed through PR #538; closure evidence must be appended only after a Founder-approved recovery merge completes the full production path-to-live successfully.

## Scope

This audit records why Revision's governed production release chain became blocked after the 5 October 2026 GitHub Actions incident, what evidence is missing, and why an explicit prospective recovery checkpoint is required instead of historical backfilling.

## External incident evidence

GitHub Status recorded an Actions incident beginning at 19:11 UTC on 5 October 2026. During the incident GitHub reported delays assigning GitHub-hosted runners, workflow start failures/delays, degraded Actions availability and degraded Pages performance. GitHub reported Actions operational at 21:54 UTC, Pages operational at 22:40 UTC, and the incident resolved at 22:49 UTC.

Public incident source: https://www.githubstatus.com/

## Revision evidence

### PR #534

- Merge commit: `c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5`
- Merge time: 2026-10-05 20:39 UTC
- Revision CI #2706 / run `37371107367`: first assurance job cancelled before executing steps; retry was also cancelled before executing steps.
- Pages #432 / run `37371107506`: governed release-lineage job cancelled before executing steps; downstream deployment jobs were skipped.
- Result: no `revision/path-to-live` status exists on the PR #534 merge commit.

The absence of status is historical evidence in its own right. It must not be replaced by a synthetic success or failure merely to make lineage traversable.

### PR #535

- Merge commit / current main at incident diagnosis: `5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54`
- PR head: `68bbd46de4b32dbfc2193ba1db1a6ac2ea08e581`
- Exact-main Revision CI #2710 / run `37379487098`: completed successfully.
- Pages #433 / run `37379487100`: failed.
- Fresh post-incident rerun of governed release lineage: executed normally and failed with:
  - `Previous main commit c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5 has no revision/path-to-live status; release chain fails closed.`
- Current main has durable `revision/path-to-live = failure`.

This rerun distinguishes the remaining problem from the GitHub runner outage: the service recovered, the verifier executed, and the historical evidence gap remained.

## Control assessment

The release-lineage verifier behaved correctly. Its fail-closed rule prevented a production release from treating missing historical evidence as success.

The correct repair is not to weaken verification and not to publish a retrospective status on PR #534. The approved recovery mechanism is an explicit prospective trust root established through a new governed decision and Founder-approved PR.

This incident therefore does not show a failure of the Founder approval gate or a bypass of repository merge enforcement. It is an external CI/CD availability incident whose cancelled release run left an unavoidable gap in the durable release-status chain.

## Severity

P1 under the Testing & Assurance Standard:

- the governed production deployment path is blocked;
- an older known-good production deployment remains available;
- there is no evidence of an uncontrolled or unapproved production publication.

Tracked as DEF-2026-008.

## Recovery requirement

ADR-0030 proposes Recovery 5 using exact failed current main `5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54` as the prospective bootstrap parent.

Closure requires all of:

1. exact-head Revision CI success for the recovery PR;
2. explicit Founder approval and exact-head machine-readable approval evidence;
3. `revision/founder-approval = success`;
4. exact-head merge;
5. governed release lineage success using the Recovery 5 trust root;
6. production backend readiness;
7. production build;
8. Pages deployment;
9. production smoke; and
10. durable `revision/path-to-live = success` on the recovery merge commit.

Until those conditions are met, this audit remains open and DEF-2026-008 remains open.

## Evidence preservation

Do not rewrite or backfill:

- PR #534 workflow cancellations;
- the absent PR #534 path-to-live status;
- PR #535 failed path-to-live evidence; or
- GitHub's external incident history.

Append closure evidence after successful recovery; do not replace the incident record with the later state.
