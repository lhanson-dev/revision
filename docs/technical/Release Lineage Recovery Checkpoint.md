# Release Lineage Recovery Checkpoint

**Status:** Recovery 1 completed via PR #85; Recovery 2 completed via PR #109  
**Date:** 2026-08-22

## Purpose

Record the exceptional technical recovery checkpoints used to restore Revision's governed path to production when historical merge evidence cannot be re-proven under the current machine-readable Founder approval contract without rewriting history.

Steady-state release-lineage behaviour remains defined in `docs/technical/Founder Assurance Implementation.md`: a failed ancestor may be traversed only when its PR/CI/Founder evidence can be independently re-proven. Recovery checkpoints are exceptional governance decisions, not routine substitutes for that chain.

## Recovery 1 — PR #85

### Recovery anchor

PR #85 changed `.github/workflows/deploy-pages.yml` so:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=d960c950f4620dd469888a1174af582524706ec2
```

That SHA was the exact pre-remediation `main` commit from PR #84.

The release verifier therefore treated that parent as an explicit one-time recovery trust root. PR #85 itself still had to prove all current controls: exact-head CI success, Founder approval marker recorded after CI, exact-head merge, production backend readiness, build/deployment and production smoke.

### Why this was safer than backfilling

The checkpoint made no claim that PRs #75, #77, #81, #82 or #84 satisfied the later GitHub marker contract. Their failed release statuses remained unchanged. The recovery was visible as a deliberate configuration decision rather than manufactured historical evidence.

ADR-0013 records the rationale and `audits/Path-to-Live Assurance Review 2026-08-21.md` preserves the incident evidence.

### Merge-time invariant

Before PR #85 was merged, its base/first-parent candidate was verified as exactly:

`d960c950f4620dd469888a1174af582524706ec2`

PR #85 exact head `077b3f36eb1b32b01ab55aac35ce41e7e36ca9e2` passed Revision CI #536. The Founder approval marker for that exact head was then persisted to the GitHub PR conversation and verified before merge.

### Post-merge verification

PR #85 merged as:

`f5e2b312c4187fb550a63a1b92a5de431077e7d3`

GitHub Pages run `32456337760` completed successfully across every required stage:

1. governed release lineage;
2. production backend readiness;
3. production build;
4. GitHub Pages deployment;
5. production smoke; and
6. durable `revision/path-to-live = success` publication for the exact merge commit.

That satisfied the closure condition for DEF-2026-003 and re-established a prospective governed release chain from PR #85 onward.

## Recovery 2 — approval-marker recurrence after PR #107

### Trigger

PR #105 had genuine pre-merge Founder approval recorded for exact head:

`f6aa2d98b136f899b8d15c9424064058ce1f8bf8`

However, GitHub comment `5375594982` used prose instead of the exact release-verifier marker:

```text
revision-founder-approval:v1
head_sha: f6aa2d98b136f899b8d15c9424064058ce1f8bf8
```

PR #105 merged as `468f4262e14dd3769965a52ac9cd6d4df913d754`. That historical comment is deliberately left unchanged.

PR #107 later followed the corrected merge sequence for its own exact head and merged as:

`d2534774344677013777a31a2a82bedb8919a7fe`

Production run `32534598367` failed at governed release lineage while traversing PR #105. Backend readiness, build, deployment and production smoke were skipped, and durable `revision/path-to-live = failure` was published for the PR #107 merge commit.

### Second recovery anchor

ADR-0015 approved a second exceptional reset using the exact pre-remediation `main` commit:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=d2534774344677013777a31a2a82bedb8919a7fe
```

This does not assert that PR #105 had a compliant machine-readable marker and does not rewrite its historical approval record. It establishes a newly approved prospective trust root through a separately governed recovery PR.

### Recovery-PR invariant

PR #109 satisfied the required invariant:

1. base/first parent remained `d2534774344677013777a31a2a82bedb8919a7fe`;
2. exact head `3c775eafc4a837a7ad2f712176d39816cf11d886` passed Revision CI #634;
3. the Founder explicitly approved PR #109;
4. exact marker comment `5376828120` was persisted for that head;
5. the marker was re-read and verified;
6. the PR head remained unchanged; and
7. only that exact head was merged.

### Post-merge verification

PR #109 merged as:

`acfaaf59abce40c03a2f8cd1313bfc90e7b93577`

GitHub Pages run `32541072920` completed successfully across every required stage:

1. governed release lineage;
2. production backend readiness;
3. production build;
4. GitHub Pages deployment;
5. production smoke; and
6. durable `revision/path-to-live = success` publication for the exact merge commit.

That satisfied the closure condition for DEF-2026-005 and restored the prospective governed production chain while preserving PR #105 and PR #107 historical evidence unchanged.

`audits/Path-to-Live Approval Marker Recurrence 2026-08-21.md` preserves the incident evidence.

## Guardrail

Do not advance the bootstrap parent as a routine way to clear failed lineage. Every recovery reset requires a new governed decision, explicit rationale and Founder approval. Historical comments/statuses must not be edited to manufacture compliance.

If malformed approval evidence recurs after this hardening, Revision should move from procedural reinforcement to a technically enforced pre-merge approval-status mechanism where the repository/tooling allows it.
