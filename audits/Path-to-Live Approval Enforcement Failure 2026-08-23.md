# Path-to-Live Approval Enforcement Failure — 23 August 2026

**Status:** Open incident evidence pending Recovery 4 closure  
**Affected control:** PTL-02 / PTL-03 — governed merge approval and production release lineage  
**Severity:** P1

## Summary

PR #139 merged even though the trusted pre-merge `revision/founder-approval` status for its exact head was `pending` and no machine-readable Founder approval marker existed in the GitHub PR conversation.

The later PR #149 followed the correct exact-head approval sequence itself, but its post-merge Production release failed closed when the release-lineage verifier reached PR #139. No unverified artifact was deployed.

## Evidence

### PR #139

- PR: `#139 — Analyse journey priorities, screen jobs and CTAs`
- Exact head: `8a514a91b41a36da24c0606b000143d74d62e1df`
- Merge commit: `22c6d40295cbeb012b12895538318e3601f62ab9`
- Exact-head Revision CI: run `32657267686` / Revision CI #871 — `success`
- `revision/founder-approval` on the exact head: `pending`
- GitHub PR conversation comments: none

The status gate therefore represented the evidence state correctly: CI was green, but the required exact approval marker had not been persisted.

### Repository enforcement state

At investigation time, GitHub branch metadata for `main` reported:

- branch protected flag: `true`;
- required-status-check enforcement level: `off`;
- required status contexts/checks: empty.

This means the repository did not provide a verified hard barrier preventing merge while `revision/founder-approval` was pending.

### PR #149 and Production failure

PR #149 exact head `e959e17a1f7865772b26a61ba3d5f0036d573278` passed Revision CI #873. After explicit Founder approval, exact machine-readable marker comment `5387770459` was persisted and `revision/founder-approval` reached `success` before merge.

PR #149 merged as:

`e21903e580facdc36f2f676582e48ff0df88d3f7`

Production run `32658623030` failed at `Governed release lineage` with the exact failure:

> Previous main commit `22c6d40295cbeb012b12895538318e3601f62ab9` has `revision/path-to-live=failure` and cannot be proven as a governed merge: PR #139 has no Founder approval marker by `lhanson-dev` for exact head `8a514a91b41a36da24c0606b000143d74d62e1df`.

Production backend readiness, build, Pages deployment and production smoke were skipped. The older known-good Production artifact remained live.

## Root cause

The Recovery 3 status gate was functioning as designed but remained advisory at repository level. The executing merge path failed to honour the mandatory pending status, and GitHub required-status enforcement was not active to prevent that mistake mechanically.

This is therefore not another marker-parser defect and not a case where the status workflow produced a false success. It is a missing hard enforcement barrier.

## Required remediation

Recovery 4 must:

1. preserve PR #139 history unchanged;
2. establish a new prospective release trust root from the failed current `main` commit `e21903e580facdc36f2f676582e48ff0df88d3f7`;
3. prove the Recovery 4 PR through exact-head CI, exact Founder marker, `revision/founder-approval = success`, merge and complete Production path-to-live evidence; and
4. stop ordinary merges after Recovery 4 until GitHub repository-level required-check enforcement for Revision CI and `revision/founder-approval` is independently verified, or an alternative hard enforcement mechanism is explicitly governed.

## Closure evidence

Pending. Do not close the associated defect merely because the Recovery 4 PR merges. Closure requires successful Production recovery evidence and verified hard pre-merge enforcement.
