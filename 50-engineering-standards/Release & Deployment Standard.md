---
title: "Release & Deployment Standard"
document_id: "revision-release-deployment"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.7"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-22"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["CI/CD and deployment", "path-to-live assurance"]
depends_on: ["ADR-0007", "ADR-0009"]
supersedes: null
---
# Release & Deployment Standard

## Rules
- GitHub Actions is the default CI/CD platform.
- Only validated production build artifacts may be deployed.
- CI selects assurance depth using change risk, with critical shared areas escalating automatically.
- The test set should be proportionate: low-risk changes should not automatically incur full end-to-end regression; high-risk/shared changes must run the relevant broader suite.
- **`main` is the single canonical integration baseline. A PR must include the latest `main` as an ancestor before it enters final exact-head assurance or Founder merge approval.**
- **Parallel branches may be developed concurrently, but final integration is serialized: one PR occupies the merge gate at a time, and the next ready PR refreshes against the `main` produced by the preceding merge.**
- Explicit Founder approval remains required for every merge to `main`.
- **A Founder instruction such as `Approve merge PR #X` is the complete human approval action for that merge. Where release lineage requires machine-readable GitHub evidence, the executing agent owns persisting and verifying that exact-head evidence before merge. The Founder must not be asked to repeat approval or perform a separate release-registration step.**
- **Where the release verifier specifies an exact machine-readable approval marker, that exact marker format is part of the release contract. Prose summaries, quoted approvals or alternative approval-record comments are not equivalent evidence and must not be substituted or converted retrospectively after merge.**
- **If `main` advances after the PR was refreshed, assured or approved, the PR must be refreshed onto the new canonical baseline. The new exact head requires fresh applicable assurance and renewed Founder merge approval.**
- A merge to `main` triggers automated production build/deployment.
- **Where the frontend depends on separately deployed database or backend capabilities, production deployment must fail closed until an automated backend-readiness gate confirms the required production contract is present.**
- Critical post-deployment journeys must be smoke-tested automatically where the change can affect them.
- Application rollback defaults to revert/redeploy.
- Database migrations should be forward-safe and backward-compatible where practical.
- One production environment is sufficient until an additional environment has a demonstrated operational benefit.

## Canonical integration and merge-queue rule

Revision supports concurrent delivery without accepting competing integration baselines.

- Governed branches start from the then-current approved `main`.
- Active branches do not need continuous refresh merely because unrelated work merges.
- When a PR is otherwise ready to become merge-ready, it enters the final integration gate and is refreshed onto the latest `main`.
- Any overlapping shared file must be resolved to preserve the current `main` state plus the PR's intended delta. This applies particularly to knowledge indexes, governance registers, package manifests, shared routing/configuration, database migrations and other cumulative files.
- A refresh that changes the PR head invalidates earlier exact-head CI and any earlier merge approval.
- Only one PR should occupy the final integration gate at a time. Other completed PRs wait outside the gate instead of repeatedly chasing a moving `main`.
- Immediately before merge, the executing agent must confirm that the approved PR head still contains the current `main` as an ancestor.

This is the default manual merge queue until a separately governed automated merge queue is introduced. Technical mergeability alone does not satisfy the canonical-baseline rule.

## Path-to-live evidence chain
Revision treats path-to-live as a chain of separately evidenced stages rather than one green status:

1. **Change classification** — determine the change risk and affected journeys/controls.
2. **Change assurance before integration** — complete the implementation/documentation work and proportionate branch-level checks required to make the PR otherwise ready.
3. **Canonical-main integration** — refresh the PR onto the latest `main`, deliberately resolve any overlap/conflict and prove the refreshed head contains that `main` baseline.
4. **Exact-head assurance** — required Revision CI for the refreshed proposed head passes at the proportionate depth defined by the Testing & Assurance Standard.
5. **Founder gate** — explicit approval is recorded for that specific refreshed PR head. The operating agent persists and verifies the required exact-head GitHub evidence as part of carrying out the approved merge; this is not a second Founder action.
6. **Pre-merge baseline recheck** — confirm `main` has not advanced since the approved head was refreshed. If it has, return to canonical-main integration and repeat exact-head assurance and Founder approval on the new head.
7. **Merge** — the approved, durably evidenced and current-main-baselined head is merged into `main`.
8. **Backend readiness** — where the release depends on database migrations, Edge Functions or other separately deployed backend capabilities, the production readiness contract is checked before a new frontend artifact may be published.
9. **Production build/deploy** — the intended `main` commit is built and deployed successfully only after any required backend-readiness gate passes.
10. **Production smoke** — affected critical deployed checks pass against the canonical live surface.
11. **Operational observation** — production availability/health evidence remains current after deployment.

Admin may summarise the path as Healthy only when the required current stages are green for the production commit being reported. Missing or stale stage evidence is Unknown; a known failed required stage is Attention needed.

A successful PR CI run must never be displayed as proof that production is healthy. A successful deployment without its required smoke evidence must not be displayed as complete path-to-live assurance.

## Risk-proportionate execution
Path-to-live must preserve confidence without creating unnecessary delivery cost.

- **Low-risk** changes run lightweight relevant assurance and may omit unrelated browser regression.
- **Medium-risk** changes run targeted behavioural/journey assurance for the changed surface.
- **High-risk** changes run the broader relevant regression for every critical journey/control that depends on the changed shared layer.
- **Critical-risk** changes run full regression plus additional production/recovery verification justified by the blast radius.

Risk classification is based on impact and coupling rather than file count. A one-line auth/RLS change may be high risk; a large documentation-only change may be low risk.

When test selection is automated, the workflow must make the selected risk level and suite visible in evidence. If the system cannot confidently determine whether a critical dependency is affected, it must escalate assurance depth rather than silently skip tests.

## Production identity
Where practical, operational evidence should expose the production commit/revision being checked so the Founder can tell whether CI, deployment and smoke refer to the same code lineage.

## Database/backend enablement
Static frontend deployment does not prove separately deployed database migrations, Edge Functions or server-side secrets/configuration are healthy. Where a feature depends on those components, path-to-live assurance must include explicit deployment/readiness evidence for them before the feature is represented as operationally Healthy.

For the canonical Revision release path:
- the database exposes a deliberately narrow, non-sensitive release-readiness contract that reports whether the currently required schema capabilities are present;
- the Pages deployment checks the expected contract before building/uploading a new frontend artifact;
- required protected Edge Functions are probed for deployed/authenticated behaviour rather than assumed present because source files exist in Git;
- a missing readiness function, contract mismatch, missing required capability, missing Edge Function, or unexpected authentication response blocks the frontend deployment;
- adding a new production database/backend dependency requires updating the release-readiness contract and deployment expectation in the same governed PR; and
- the readiness contract proves capability presence, not learner-data correctness or full security assurance; those remain governed by the Testing & Assurance Standard and Assurance Coverage Register.
