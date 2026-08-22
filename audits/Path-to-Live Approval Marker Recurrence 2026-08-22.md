# Path-to-Live Approval Marker Recurrence — 2026-08-22

**Type:** Incident / assurance evidence  
**Status:** Closed on Recovery 3 production evidence  
**Affected control:** PTL-02 / PTL-03 — governed merge evidence and production path-to-live

## Summary

Production deployment for PR #111 failed closed because the release-lineage verifier encountered an older merge, PR #106, whose genuine Founder approval had been recorded in prose rather than in the mandatory machine-readable two-line marker format.

No ungoverned artifact was deployed. Backend readiness, production build, Pages deployment and production smoke were skipped after the lineage failure, so the existing known-good production deployment remained in place.

## Current release failure

PR #111:

- exact PR head: `889675eb6e301ef917f05f95cde154a514e391df`;
- Revision CI: #652 — successful;
- required Founder marker persisted and verified before merge;
- merge commit: `ad112f426b7f8430ddb03f2b0979e2706cb59c38`;
- production run: `32561748699`;
- governed release-lineage result: failure;
- backend readiness/build/deploy/smoke: skipped;
- durable `revision/path-to-live`: failure.

The verifier reported:

> Previous main commit `29cefc2afd8d0949876fee31298e747ec1ff70f8` has `revision/path-to-live=failure` and cannot be proven as a governed merge because PR #106 has no Founder approval marker for exact head `21f173f4d8cd16d5d528697a3851e9a3d687b9a1`.

## PR #106 evidence

PR #106 merged exact head `21f173f4d8cd16d5d528697a3851e9a3d687b9a1` as `29cefc2afd8d0949876fee31298e747ec1ff70f8`.

Its conversation contains genuine Founder approval records, including comment `5378444745`, created immediately before merge. The record says the Founder approved the exact PR head, but its body is prose rather than:

```text
revision-founder-approval:v1
head_sha: 21f173f4d8cd16d5d528697a3851e9a3d687b9a1
```

Current governance deliberately treats prose and the exact machine-readable marker as different evidence contracts. Historical approval comments must not be rewritten or converted retrospectively.

## Classification

**P1.** At detection time, the governed path from approved `main` to production was blocked while an older known-good production deployment remained available. The release verifier correctly failed closed and prevented an unproven production release.

## Root cause

The release evidence contract was still dependent on the executing conversation/agent persisting the exact marker before merge. A concurrent workstream merged PR #106 with a prose approval record, reproducing the failure pattern after the previous recovery.

The post-merge verifier protected PROD but could not prevent the repository merge itself, so the invalid historical evidence became part of subsequent release ancestry.

## Recovery approach

ADR-0016 approved:

1. a third exceptional bootstrap recovery checkpoint rooted at the exact failed pre-remediation `main` commit `ad112f426b7f8430ddb03f2b0979e2706cb59c38`;
2. preservation of all historical PR comments and failed release statuses;
3. full CI, explicit Founder merge approval and exact marker verification for the recovery PR; and
4. a new pre-merge `revision/founder-approval` commit-status gate tied to exact-head CI and marker evidence.

## Closure evidence

Recovery 3 completed through PR #112:

- final PR head: `c2d94210aa48b0e5b078b730d812857b77448989`;
- Revision CI: #658 — successful;
- exact Founder approval marker comment: `5379367930`, created after CI and re-read before merge;
- merge commit: `62d75df280ac0ba5b0df72916b9394ecb8de75b5`;
- production run: `32562931908`;
- governed release lineage: success;
- production backend readiness: success;
- production build: success;
- GitHub Pages deployment: success;
- production smoke: success;
- durable `revision/path-to-live`: success.

The `revision/founder-approval` pre-merge workflow introduced by PR #112 is present on `main` and therefore applies prospectively to subsequent release-governed PRs.

All incident closure criteria are satisfied. DEF-2026-006 can be closed on this production evidence rather than on merge alone.

Repository-level configuration making the new status a required branch check remains a further hardening action where GitHub settings support it. That setting is not represented as enabled unless independently verified.
