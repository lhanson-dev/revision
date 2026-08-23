# Release Lineage Recovery Checkpoint

**Status:** Recovery 1 completed via PR #85; Recovery 2 completed via PR #109; Recovery 3 completed via PR #112; Recovery 4 proposed via PR #151  
**Date:** 2026-08-23

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

ADR-0016 approved the third exceptional prospective trust root:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=ad112f426b7f8430ddb03f2b0979e2706cb59c38
```

This exact SHA is the failed pre-remediation `main` commit from PR #111. It is not a declaration that PR #106 complied with the marker contract and does not rewrite any historical path-to-live evidence.

### Recovery-PR invariant

PR #112 satisfied the required invariant:

1. current-main integration remained exact against `ad112f426b7f8430ddb03f2b0979e2706cb59c38` with the branch 0 behind `main`;
2. final head `c2d94210aa48b0e5b078b730d812857b77448989` passed Revision CI #658;
3. the Founder explicitly approved Recovery 3 and PR #112;
4. exact machine-readable Founder marker comment `5379367930` was persisted for the final head after CI;
5. the marker was re-read and verified before merge;
6. only the evidenced head was merged as `62d75df280ac0ba5b0df72916b9394ecb8de75b5`;
7. governed release lineage passed using the Recovery 3 anchor;
8. production backend readiness, build, Pages deployment and production smoke all passed; and
9. durable `revision/path-to-live = success` was published for the recovery merge commit.

### Prevention control included in Recovery 3

Because this was another recurrence after procedural hardening, Recovery 3 added a technically evaluated pre-merge commit status:

`revision/founder-approval`

The trusted default-branch workflow verifies that the current PR head has both successful exact-head Revision CI and the exact Founder marker created at or after that CI. Prose approval remains insufficient, and a new PR head is evaluated independently.

The workflow is documented in `docs/technical/Founder Approval Gate.md` and is now live on `main`. Operating agents must treat `revision/founder-approval = success` as a mandatory pre-merge condition for subsequent release-governed PRs. Where GitHub repository settings support required status checks, the status should also be configured as a repository-enforced required check.

### Outcome

Recovery 3 completed successfully through PR #112. Merge commit `62d75df280ac0ba5b0df72916b9394ecb8de75b5` completed GitHub Pages run `32562931908` with governed release lineage, production backend readiness, build, Pages deployment, production smoke and durable `revision/path-to-live = success`.

That satisfies the closure condition for DEF-2026-006 and re-establishes the prospective governed release chain while preserving PR #106 and PR #111 historical evidence unchanged.

`audits/Path-to-Live Approval Marker Recurrence 2026-08-22.md` preserves the incident evidence and closure record.

## Recovery 4 — merge-boundary bypass after PR #139

### Trigger

PR #139 merged exact head:

`8a514a91b41a36da24c0606b000143d74d62e1df`

as merge commit:

`22c6d40295cbeb012b12895538318e3601f62ab9`

Revision CI #871 succeeded, but `revision/founder-approval` remained `pending` and the PR conversation contains no exact machine-readable Founder marker. The merge therefore occurred without the repository being able to prove the mandatory pre-merge approval evidence.

Production run `32657564150` failed closed. PR #149 later merged as `e21903e580facdc36f2f676582e48ff0df88d3f7` and inherited `revision/path-to-live = failure` in run `32658623030`.

PR #138 then followed the current merge sequence correctly for exact head `3d4791481eb6504080ac1d53d9112bfa3233f7f5`: Revision CI #876 passed, explicit Founder approval was given, exact marker comment `5387932486` was persisted and verified, and `revision/founder-approval = success` was confirmed immediately before merge. PR #138 merged as `8ed308ad39a9f585a2a578be396a0161df011a8b`.

Production run `32660332173` still failed closed while traversing PR #139. Backend readiness, build, deployment and production smoke were skipped, leaving the prior known-good Production deployment in place.

### Fourth recovery anchor

ADR-0018 proposes a fourth exceptional prospective trust root:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=8ed308ad39a9f585a2a578be396a0161df011a8b
```

This exact SHA is the failed current `main` commit before Recovery 4. It does not assert that PR #139 complied with the Founder approval contract and does not rewrite the failed evidence on PR #139, PR #149 or PR #138.

### Recovery-PR invariant

PR #151 must satisfy the current control in full before Recovery 4 can be accepted:

1. base/first parent remains the exact failed current `main` commit `8ed308ad39a9f585a2a578be396a0161df011a8b` unless a later mechanical current-main refresh is governed explicitly;
2. the final exact head passes required Revision CI;
3. the Founder explicitly approves PR #151;
4. the exact two-line Founder marker is persisted after the latest exact-head CI;
5. `revision/founder-approval = success` is verified on the same exact head immediately before merge;
6. only that exact head is merged;
7. governed release lineage passes using the Recovery 4 anchor;
8. production backend readiness, build, Pages deployment and production smoke all pass; and
9. durable `revision/path-to-live = success` is published before Recovery 4 is considered operationally complete.

### Recurrence-prevention requirement

Recovery 3's status gate behaved correctly; the PR #139 head remained `pending`. The recurrence happened because merge execution was still possible despite that result.

Repository-level enforcement of `revision/founder-approval` is therefore now a concrete recurrence-prevention requirement. Recovery 4 may restore the production chain, but DEF-2026-007 must not be considered fully closed until the required status is independently verified as enforced on `main` where GitHub supports it, or an equivalent fail-closed repository control is implemented.

`audits/Path-to-Live Founder Gate Bypass 2026-08-23.md` preserves the incident evidence.

## Guardrail

Do not advance the bootstrap parent as a routine way to clear failed lineage. Every recovery reset requires a new governed decision, explicit rationale and Founder approval. Historical comments/statuses must not be edited to manufacture compliance.

Recovery 3 moved beyond procedural wording by adding a machine-readable pre-merge Founder approval status. Recovery 4 demonstrates that the status must also be enforced at the repository merge boundary rather than relying only on operating-agent compliance.
