# Release Lineage Recovery Checkpoint

**Status:** Current remediation implementation for PR #85  
**Date:** 2026-08-21

## Purpose

Record the one-time technical recovery used to restore Revision's governed path to production after several merged PRs lacked the machine-readable GitHub Founder approval marker required by the release verifier.

Steady-state release-lineage behaviour remains defined in `docs/technical/Founder Assurance Implementation.md`: a failed ancestor may be traversed only when its PR/CI/Founder evidence can be independently re-proven. The 21 August incident cannot use that normal recovery path because the missing historical markers must not be fabricated retrospectively.

## Recovery anchor

PR #85 changes `.github/workflows/deploy-pages.yml` so:

```text
REVISION_RELEASE_BOOTSTRAP_PARENT=d960c950f4620dd469888a1174af582524706ec2
```

That SHA is the exact pre-remediation `main` commit from PR #84.

When PR #85 is merged while `d960c950f4620dd469888a1174af582524706ec2` remains its first parent, the release verifier will treat that parent as the explicit recovery trust root. PR #85 itself still has to prove all current controls: exact-head CI success, Founder approval marker recorded after CI, exact-head merge, production backend readiness, build/deployment and production smoke.

## Why this is safer than backfilling

The checkpoint makes no claim that PRs #75, #77, #81, #82 or #84 satisfied the later GitHub marker contract. Their failed release statuses remain unchanged. The recovery is visible as a deliberate configuration decision rather than manufactured historical evidence.

ADR-0013 records the rationale and `audits/Path-to-Live Assurance Review 2026-08-21.md` preserves the incident evidence.

## Merge-time invariant

Before PR #85 is approved for merge, confirm its current base/first-parent candidate is still exactly:

`d960c950f4620dd469888a1174af582524706ec2`

If `main` moves before PR #85 merges, do not merge with this stale recovery anchor. Reconcile the branch and deliberately re-evaluate the checkpoint instead.

## Post-merge verification

The remediation is not complete merely because PR #85 merges. Close DEF-2026-003 only after the resulting production commit demonstrates:

1. governed release lineage success;
2. production backend readiness success;
3. production build/deploy success;
4. production smoke success; and
5. durable `revision/path-to-live = success` on the exact merge commit.

## Guardrail

Do not advance the bootstrap parent as a routine way to clear failed lineage. Any future recovery reset requires a new governed decision and explicit Founder approval.
