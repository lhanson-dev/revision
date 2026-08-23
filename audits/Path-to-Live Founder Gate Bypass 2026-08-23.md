# Path-to-Live Founder Gate Bypass — 2026-08-23

**Status:** Open incident evidence  
**Observed:** 2026-08-23  
**Control:** PTL-02 / PTL-03 — Founder approval and governed production lineage

## Summary

PR #139 merged into `main` without the repository being able to prove the mandatory exact-head Founder approval marker. The pre-merge `revision/founder-approval` status remained `pending`, so the status gate itself correctly reported that the merge was not release-ready. Merge execution nevertheless occurred.

The post-merge release verifier then failed closed as designed. No new production artifact from PR #139, PR #149 or PR #138 was deployed through the governed production path after the lineage break.

## Evidence

### PR #139

- PR: #139 — Analyse journey priorities, screen jobs and CTAs
- exact merged head: `8a514a91b41a36da24c0606b000143d74d62e1df`
- Revision CI: #871 / run `32657267686` — success
- `revision/founder-approval`: `pending`
- PR conversation: no machine-readable Founder marker present in repository evidence
- merge commit: `22c6d40295cbeb012b12895538318e3601f62ab9`
- production run: `32657564150`
- durable result: `revision/path-to-live = failure`

### PR #149 inherited the failed chain

- merge commit: `e21903e580facdc36f2f676582e48ff0df88d3f7`
- production run: `32658623030`
- durable result: `revision/path-to-live = failure`

### PR #138 followed the current pre-merge control correctly

- exact head: `3d4791481eb6504080ac1d53d9112bfa3233f7f5`
- Revision CI: #876 / run `32659988896` — success
- explicit Founder approval given for PR #138
- exact marker comment: `5387932486`
- `revision/founder-approval = success` verified immediately before merge
- merge commit: `8ed308ad39a9f585a2a578be396a0161df011a8b`
- production run: `32660332173`
- governed release-lineage job failed while traversing PR #139
- backend readiness, build, deploy and production smoke were skipped
- durable result: `revision/path-to-live = failure`

The release-lineage error stated that previous main commit `22c6d40295cbeb012b12895538318e3601f62ab9` could not be proven as a governed merge because PR #139 had no Founder approval marker for exact head `8a514a91b41a36da24c0606b000143d74d62e1df`.

### Merge-boundary configuration evidence

After the PR #138 release failure, connected GitHub branch metadata for current `main` reported:

- branch `protected: true` at the top-level metadata flag;
- nested protection `enabled: false`;
- required-status-check `enforcement_level: off`; and
- no required status contexts/checks.

This does not provide evidence that `revision/founder-approval` is enforced at the repository merge boundary. The connected capability does not expose a mutation for branch/ruleset protection, so this incident response cannot truthfully claim that repository-level enforcement has been enabled from this workflow.

## Impact

- The governed production release path is blocked.
- The older known-good production deployment remains in place.
- There is no evidence that an unverified new artifact reached Production.
- PR #138 is merged to canonical `main`, but its governance/UX documentation is not yet represented as a successfully completed production release because path-to-live evidence is failed.

This matches the established P1 path-to-live severity pattern: production deployment is unhealthy/blocked while an older safe version remains available.

## Root cause

The machine-readable pre-merge status gate detected the missing approval evidence correctly, but repository/merge execution did not prevent a merge while that status was `pending`.

The observed branch metadata is consistent with required status-check enforcement not being active at the merge boundary. This is therefore not primarily a release-verifier defect. It is a failure to enforce the existing pre-merge control at the merge boundary.

## Recovery direction

ADR-0018 proposes Recovery 4:

1. preserve PR #139 and all failed release evidence unchanged;
2. establish a new prospective release-lineage trust root from failed current `main` commit `8ed308ad39a9f585a2a578be396a0161df011a8b`;
3. require the Recovery 4 PR itself to satisfy exact-head CI, explicit Founder approval, exact marker evidence and `revision/founder-approval = success` before merge;
4. require full post-merge lineage, backend readiness, build, deploy and production smoke success; and
5. independently harden/verify repository-level enforcement so `revision/founder-approval` is required before future `main` merges where GitHub supports it, or implement an equivalent independently enforced fail-closed merge control.

Recovery 4 can restore the prospective production lineage, but DEF-2026-007 must remain open until the merge-boundary prevention requirement is separately evidenced.

## Historical evidence rule

Do not add a retrospective PR #139 marker merely to clear the release verifier. Do not rewrite the failed status history for PR #139, PR #149 or PR #138. Recovery must be prospective and explicitly governed.
