# Release Lineage Recovery Checkpoint

**Status:** Recovery completed and verified on 2026-08-21  
**Date:** 2026-08-21

## Purpose

Record the one-time technical recovery used to restore Revision's governed path to production after several merged PRs lacked the machine-readable GitHub Founder approval marker required by the release verifier.

Steady-state release-lineage behaviour remains defined in `docs/technical/Founder Assurance Implementation.md`: a failed ancestor may be traversed only when its PR/CI/Founder evidence can be independently re-proven. The 21 August incident could not use that normal recovery path because the missing historical markers must not be fabricated retrospectively.

## Recovery anchor

PR #85 changed `.github/workflows/deploy-pages.yml` so:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=d960c950f4620dd469888a1174af582524706ec2
```

That SHA is the exact pre-remediation `main` commit from PR #84.

The release verifier therefore treated that parent as the explicit one-time recovery trust root. PR #85 itself still had to prove all current controls: exact-head CI success, Founder approval marker recorded after CI, exact-head merge, production backend readiness, build/deployment and production smoke.

## Why this is safer than backfilling

The checkpoint makes no claim that PRs #75, #77, #81, #82 or #84 satisfied the later GitHub marker contract. Their failed release statuses remain unchanged. The recovery is visible as a deliberate configuration decision rather than manufactured historical evidence.

ADR-0013 records the rationale and `audits/Path-to-Live Assurance Review 2026-08-21.md` preserves the incident evidence.

## Merge-time invariant

Before PR #85 was merged, its base/first-parent candidate was verified as exactly:

`d960c950f4620dd469888a1174af582524706ec2`

PR #85 exact head `077b3f36eb1b32b01ab55aac35ce41e7e36ca9e2` passed Revision CI #536. The Founder approval marker for that exact head was then persisted to the GitHub PR conversation and verified before merge.

## Post-merge verification

PR #85 merged as:

`f5e2b312c4187fb550a63a1b92a5de431077e7d3`

GitHub Pages run `32456337760` then completed successfully across every required stage:

1. governed release lineage;
2. production backend readiness;
3. production build;
4. GitHub Pages deployment;
5. production smoke; and
6. durable `revision/path-to-live = success` publication for the exact merge commit.

This satisfies the closure condition for DEF-2026-003 and re-establishes a prospective governed release chain from PR #85 onward.

## Guardrail

Do not advance the bootstrap parent as a routine way to clear failed lineage. Any future recovery reset requires a new governed decision and explicit Founder approval. Future releases should normally terminate prior-release verification at the successful PR #85 merge status without relying on the historical recovery anchor.
