# ADR-0030 — Fifth governed release-lineage recovery after GitHub Actions incident

Status: Accepted on merge — explicit Founder approval of the recovery PR is the acceptance decision  
Date: 2026-10-06

## Context

On 5 October 2026 GitHub reported an Actions incident affecting GitHub-hosted runner assignment and workflow start times. GitHub later also reported degraded Pages performance. GitHub marked Actions operational at 21:54 UTC, Pages operational at 22:40 UTC, and the incident resolved at 22:49 UTC.

PR #534 merged as `c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5` at 20:39 UTC while that incident was active. Revision CI run `37371107367` was cancelled before its assurance job executed, including on retry. Pages run `37371107506` was also cancelled before governed release lineage executed, so no durable `revision/path-to-live` status was published for the PR #534 merge commit.

PR #535 subsequently merged as `5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54`. Exact-main Revision CI #2710 / run `37379487098` completed successfully. Pages run #433 / `37379487100`, including a fresh rerun after GitHub recovery, failed closed in governed release lineage with:

`Previous main commit c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5 has no revision/path-to-live status; release chain fails closed.`

The current main commit therefore has durable `revision/path-to-live = failure`, while the previous main commit has no historical path-to-live status at all.

The release verifier is behaving correctly: absence of required historical evidence must fail closed. The missing status cannot be reconstructed honestly after the fact, and the recovery guardrail prohibits manufacturing or backfilling historical release evidence.

## Decision

### 1. Establish a fifth exceptional recovery checkpoint

Set the release-lineage bootstrap parent to the exact failed current `main` commit before the recovery PR:

`5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54`

This is a prospective trust root only. It does not create a `revision/path-to-live` status for PR #534, does not reinterpret the cancelled runs as successful, and does not alter the failed path-to-live evidence on PR #535.

The Recovery 5 PR must:

1. start from the exact failed current `main` commit above unless later mechanically reconciled under the active current-main integration rule;
2. pass required Revision CI for its final exact head;
3. receive explicit Founder approval for this specific recovery merge;
4. persist and verify the exact machine-readable Founder marker after the latest exact-head CI;
5. show `revision/founder-approval = success` for the same exact head immediately before merge;
6. merge only that evidenced head;
7. pass governed release lineage using the Recovery 5 trust root;
8. pass production backend readiness, production build, Pages deployment and production smoke; and
9. publish durable `revision/path-to-live = success` before Recovery 5 is considered operationally complete.

### 2. Preserve all historical evidence

Do not add a synthetic path-to-live status to `c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5`. Do not edit the cancelled workflow evidence from the GitHub incident. Do not rewrite the failed path-to-live status on `5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54`.

Recovery 5 exists precisely because the historical chain contains an evidence gap that cannot be honestly repaired retrospectively.

### 3. Keep the steady-state verifier unchanged

No weakening of `scripts/assurance/release-lineage.mjs` is authorised. A missing prior `revision/path-to-live` status must continue to fail closed in normal operation.

The recovery is implemented only by moving the explicitly governed bootstrap trust root. Any future reset remains exceptional and requires its own decision and Founder-approved PR.

### 4. Track the outage consequence as P1

The blocked production path is a P1 defect under the Testing & Assurance Standard because production deployment is unhealthy while an older known-good production deployment remains available.

Record this as DEF-2026-008 and keep it open until the Recovery 5 merge has completed governed release lineage, backend readiness, build, Pages deployment, production smoke and durable path-to-live success.

## Consequences

- The prior known-good production deployment remains protected until Recovery 5 completes.
- Historical PR #534 and PR #535 evidence remains unchanged.
- Release-lineage fail-closed behaviour remains intact.
- Recovery 5 restores a prospective governed chain without asserting evidence that never existed.
- No learner-facing product behaviour changes in this PR.
- No Content Factory or paid-generation workflow is resumed by this decision.

## Documentation impact

This decision updates the deployment bootstrap checkpoint, appends Recovery 5 to the technical recovery checkpoint, records the incident in the Defect Register and audit history, and updates the repository index. The Release & Deployment Standard itself is not changed because its existing recovery guardrail already requires exactly this governed exception process.
