# Release Lineage Recovery Checkpoint

**Status:** Recovery 1 completed via PR #85; Recovery 2 completed via PR #109; Recovery 3 in review  
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

## Recovery 3 — approval-marker recurrence after PR #106

### Trigger

PR #106 merged exact head:

`21f173f4d8cd16d5d528697a3851e9a3d687b9a1`

as merge commit:

`29cefc2afd8d0949876fee31298e747ec1ff70f8`

The PR conversation contains genuine Founder approval, including comment `5378444745`, but the record is prose rather than the required exact machine-readable marker. That historical evidence is deliberately left unchanged.

PR #111 later followed the correct merge sequence for its own exact head `889675eb6e301ef917f05f95cde154a514e391df`: Revision CI #652 passed, exact marker comment `5379218979` was persisted and verified, and the exact head merged as `ad112f426b7f8430ddb03f2b0979e2706cb59c38`.

Production run `32561748699` then failed closed while traversing the PR #106 ancestor. Backend readiness, build, Pages deployment and production smoke were skipped, so the prior known-good production deployment remained in place.

### Third recovery anchor

ADR-0016 proposes the third exceptional prospective trust root:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=ad112f426b7f8430ddb03f2b0979e2706cb59c38
```

This exact SHA is the failed pre-remediation `main` commit from PR #111. It is not a declaration that PR #106 complied with the marker contract and does not rewrite any historical path-to-live evidence.

### Recovery-PR invariant

The Recovery 3 PR must satisfy:

1. current-main integration under the active trunk-based governance;
2. successful required Revision CI on its final integration candidate;
3. explicit Founder approval of the recovery PR, which also accepts ADR-0016;
4. exact machine-readable Founder marker persisted for the final head after CI;
5. marker re-read and verified before merge;
6. only the evidenced head merged;
7. governed release lineage passes using the Recovery 3 anchor;
8. production backend readiness, build, Pages deployment and production smoke pass; and
9. durable `revision/path-to-live = success` is published before Recovery 3 is represented as complete.

### Prevention control included in Recovery 3

Because this is another recurrence after procedural hardening, Recovery 3 adds a technically evaluated pre-merge commit status:

`revision/founder-approval`

The trusted default-branch workflow verifies that the current PR head has both successful exact-head Revision CI and the exact Founder marker created at or after that CI. Prose approval remains insufficient, and a new PR head is evaluated independently.

The workflow is documented in `docs/technical/Founder Approval Gate.md`. Once it is live on `main`, operating agents must treat `revision/founder-approval = success` as a mandatory pre-merge condition. Where GitHub repository settings support required status checks, the status should also be configured as a repository-enforced required check.

### Outcome

Pending. Recovery 3 remains in review until its governed PR reaches successful production path-to-live evidence. DEF-2026-006 remains open until that evidence exists.

`audits/Path-to-Live Approval Marker Recurrence 2026-08-22.md` preserves the incident evidence.

## Guardrail

Do not advance the bootstrap parent as a routine way to clear failed lineage. Every recovery reset requires a new governed decision, explicit rationale and Founder approval. Historical comments/statuses must not be edited to manufacture compliance.

Recovery 3 moves beyond procedural wording by adding a machine-readable pre-merge Founder approval status. Future approval-evidence incidents should first be treated as failures of technical enforcement/configuration and investigated at that layer rather than answered with another routine bootstrap reset.
