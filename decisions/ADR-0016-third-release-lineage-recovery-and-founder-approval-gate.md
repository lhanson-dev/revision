# ADR-0016 — Third governed release-lineage recovery and Founder approval gate

Status: Accepted on merge — explicit Founder approval of the recovery PR is the acceptance decision
Date: 2026-08-22

## Context

Revision restored a healthy governed release chain through PR #109 and ADR-0015 after a malformed machine-readable Founder approval marker blocked production lineage.

PR #106 was subsequently merged from exact head `21f173f4d8cd16d5d528697a3851e9a3d687b9a1` as merge commit `29cefc2afd8d0949876fee31298e747ec1ff70f8`.

The PR conversation contains genuine Founder approval records for the exact head, including comment `5378444745`, but those records are prose. They do not use the release verifier's mandatory exact marker:

```text
revision-founder-approval:v1
head_sha: 21f173f4d8cd16d5d528697a3851e9a3d687b9a1
```

Current authority explicitly prohibits converting malformed or prose historical approval records into a compliant marker retrospectively.

PR #111 itself followed the correct merge sequence. Its exact head `889675eb6e301ef917f05f95cde154a514e391df` passed Revision CI #652, the exact two-line Founder marker was persisted and verified, and the exact head merged as `ad112f426b7f8430ddb03f2b0979e2706cb59c38`.

Production run `32561748699` then failed closed while traversing the older PR #106 ancestry. Backend readiness, production build, deployment and production smoke were skipped. The existing production deployment therefore remained protected.

This is a new release-governance incident after the previous hardening. The existing guardrail requires any further recovery reset to have its own evidence, rationale and Founder-approved decision, and recommends moving from procedural reinforcement toward a technically enforced pre-merge approval-status mechanism.

## Decision

### 1. Establish a third exceptional recovery checkpoint

Use the existing bootstrap-parent mechanism one more time to establish a prospective governed trust root from the exact pre-remediation `main` commit:

`ad112f426b7f8430ddb03f2b0979e2706cb59c38`

This recovery anchor does not assert that PR #106 had a compliant marker and does not rewrite PR #106, PR #110 or PR #111 historical path-to-live evidence.

The recovery PR must satisfy every current control:

1. be based on the exact recovery anchor above unless a mechanical current-main refresh is deliberately reconciled under the active integration rules;
2. pass required Revision CI for its final integration candidate;
3. receive explicit Founder approval for the recovery PR merge;
4. persist and verify the required exact machine-readable Founder marker for the final head;
5. merge only the evidenced head;
6. pass governed release lineage using the recovery anchor;
7. pass production backend readiness, production build, Pages deployment and production smoke; and
8. publish durable `revision/path-to-live = success` before the recovery is considered operationally complete.

### 2. Add a pre-merge Founder approval status gate

Add a trusted default-branch GitHub Actions workflow that evaluates each PR head and publishes a durable commit status:

`revision/founder-approval`

The status is:

- `pending` while exact-head CI or the required exact Founder marker is outstanding;
- `failure` when the latest exact-head CI has completed unsuccessfully; and
- `success` only when the latest exact-head Revision CI completed successfully and a valid Founder marker for that same head was created at or after that CI completion.

A PR head change resets the gate because the exact head no longer matches the prior marker.

The status is evidence of an approval already given; it is not permission for automation to invent Founder approval.

### 3. Treat the status as a mandatory operating check

Once the gate workflow is present on `main`, executing agents must not call merge for a release-governed PR unless `revision/founder-approval = success` for the current PR head, in addition to all other required integration and assurance checks.

Where GitHub repository settings support required status-check enforcement, this status should also be configured as a required check on `main`. Until repository-level enforcement is configured, the operating agent must apply the status as a mandatory governed pre-merge check and the post-merge release verifier continues to fail closed independently.

## Historical evidence rule

Do not edit or replace PR #106's prose approval comments. Do not add a retrospective exact marker to make the old merge appear compliant.

The failed `revision/path-to-live` statuses on affected historical commits remain historical evidence.

## Why this is proportionate

The release control prevented an unsafe or ungoverned production deployment; PROD remained on the last known-good version. The incident is therefore a release-governance and delivery-continuity failure rather than evidence of corrupted production state.

A third exceptional recovery is necessary to unblock the prospective release chain, but another wording-only fix would be insufficient. The new pre-merge status gate makes the exact marker contract machine-visible before merge and is designed to work across concurrent feature branches and separate AI/developer conversations.

## Consequences

- The recovery remains explicit rather than rewriting history.
- PROD remains fail-closed until the recovery PR proves the complete release chain.
- Future PRs gain a machine-readable pre-merge approval status tied to exact head and CI state.
- Repository-level branch protection should require the new status where supported; until then, operating agents must enforce it explicitly.
- Any future recovery reset remains exceptional and requires a new governed decision with its own rationale and Founder approval.
