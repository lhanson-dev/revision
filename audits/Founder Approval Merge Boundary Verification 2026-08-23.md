# Founder Approval Merge Boundary Verification — 23 August 2026

**Status:** Verified  
**Control:** PTL-02 / PTL-03 — enforced pre-merge Founder approval status  
**Related defect:** DEF-2026-007  
**Recovery PR:** #151  
**Verification PR:** #152

## Purpose

Verify that Recovery 4 is fully closed not only operationally, but also at the repository merge boundary.

PR #151 restored Revision's governed production release lineage. Its merge commit `cfa2e19ffdb4c097ea31daa7e92e3e02673ef8ba` completed production run `32661644881` successfully across governed release lineage, production backend readiness, build, Pages deployment, production smoke and durable `revision/path-to-live = success`.

That proves the production recovery succeeded. DEF-2026-007 additionally required independent evidence that a PR cannot merge to `main` while the trusted `revision/founder-approval` status is unsatisfied.

## Repository configuration change

On 23 August 2026 the Founder configured an active GitHub branch ruleset named:

`Main — Founder Approval Gate`

The ruleset targets the default branch (`main`) with no bypass actors. It requires pull-request integration, up-to-date required checks, the relevant Revision CI checks, and the trusted Founder approval status:

`revision/founder-approval`

Deletion and force-push protection are retained.

## Independent live verification

PR #152 was opened from current `main` specifically to exercise the new merge boundary before any Founder marker was written.

Verification candidate:

- PR: #152
- exact head: `df2f2c31d203b26cc97c0bd937c0acc2c3813a6e`
- base: `cfa2e19ffdb4c097ea31daa7e92e3e02673ef8ba`
- Revision CI: #889 / run `32663715546`

The exact-head CI completed successfully across all three Revision CI jobs:

1. `Assurance plan and secret scan` — success;
2. `Foundation quality` — success; and
3. `Database, RLS and protected service assurance` — success.

No machine-readable Founder approval marker existed for that head. The trusted commit status therefore remained:

`revision/founder-approval = pending`

After all Revision CI jobs were green, GitHub's pull-request API continued to report:

`mergeable_state = blocked`

The PR itself was otherwise mechanically mergeable (`mergeable = true`), so the remaining block was the required unsatisfied merge control rather than a code conflict. No bypass actor or bypass route was used.

This independently proves that the repository merge boundary now prevents an unevidenced PR from entering `main` while `revision/founder-approval` is unsatisfied.

## Conclusion

The two DEF-2026-007 closure conditions are now evidenced:

1. Recovery 4 successfully restored the governed Production path through PR #151 and production run `32661644881`.
2. The repository merge boundary independently blocks a PR whose exact-head Revision CI is green but whose `revision/founder-approval` status remains pending.

DEF-2026-007 may therefore be closed by the governed bookkeeping change in PR #152. The post-merge release-lineage verifier remains an independent backstop rather than the primary prevention control.

## Documentation impact

This is current verification evidence. Historical PR #139, #149 and #138 failure records remain unchanged. Recovery 4 production evidence and prevention evidence are appended rather than backfilling historical approval evidence.
