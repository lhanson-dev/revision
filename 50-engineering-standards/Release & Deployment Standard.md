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
- **`main` is the single canonical integrated product state. Governed work reaches production only through a PR-based integration path.**
- **Revision supports multiple concurrent branches and PRs. Branches do not need continuous rebasing during active work, but every merge candidate must be validated in combination with the then-current `main` before merge.**
- Explicit Founder approval remains required for every merge to `main`.
- **A Founder instruction such as `Approve merge PR #X` is the complete human approval action for that proposed production change. Where release lineage requires machine-readable GitHub evidence, the executing agent owns persisting and verifying that evidence before merge. The Founder must not be asked to perform Git bookkeeping.**
- **Where the release verifier specifies an exact machine-readable approval marker, that exact marker format is part of the release contract. Prose summaries, quoted approvals or alternative approval-record comments are not equivalent evidence.**
- **A purely mechanical refresh from newer `main` may retain the existing Founder approval only when the PR delta is demonstrably unchanged, no substantive conflict resolution occurred and fresh required assurance passes. A material change to the PR delta requires renewed Founder approval.**
- A merge to `main` triggers automated production build/deployment.
- **Where the frontend depends on separately deployed database or backend capabilities, production deployment must fail closed until an automated backend-readiness gate confirms the required production contract is present.**
- Critical post-deployment journeys must be smoke-tested automatically where the change can affect them.
- Application rollback defaults to revert/redeploy.
- Database migrations should be forward-safe and backward-compatible where practical.
- One production environment is sufficient until an additional environment has a demonstrated operational benefit.

## Trunk-based integration model

Revision uses short-lived branches around one protected trunk: `main`.

Multiple feature, defect, governance and maintenance PRs may be developed and become ready concurrently. The repository/integration process, not the Founder, is responsible for safely ordering merges.

For each PR approaching merge:

- establish the current `main` state;
- validate the proposed PR change together with current `main`;
- use a native merge queue when repository ownership/plan and governed workflow support one;
- otherwise update/rebase/merge current `main` into the PR branch before final merge assurance;
- deliberately resolve any shared-file or behavioural overlap;
- preserve newer cumulative `main` content plus the PR's intended delta; and
- run the required assurance against the final integration candidate.

A repository-native merge queue is preferable on a sufficiently busy repository because it can test queued PRs against the latest base automatically. At the time this standard was updated, Revision is hosted in an individual-owned GitHub repository and GitHub's native merge queue is not available for that ownership model. Revision therefore uses the explicit current-`main` integration fallback until repository ownership/capability changes.

Governance does **not** require that only one PR may be review-ready at a time. Merges themselves are ordered because each successful merge creates the next canonical `main` state.

## Founder approval and integration refresh

Founder approval is approval of the specific PR change proposed for production.

If `main` advances after approval but before merge:

- revalidate the PR with the new `main`;
- if this is a conflict-free/mechanical baseline refresh and the PR delta remains materially unchanged, rerun assurance and regenerate the required exact-head approval evidence without requiring the Founder to approve the same unchanged work again;
- if conflict resolution or any other change alters the PR delta materially, return to the Founder with the changed proposal and obtain renewed approval.

This distinction preserves the Founder production gate without making the Founder responsible for branch-management mechanics.

## Repository enforcement target

Where GitHub supports the relevant controls, `main` should be protected so that:

- changes arrive through pull requests;
- required Revision CI/status checks pass before merge;
- force pushes and deletion are blocked;
- the governed merge path cannot be silently bypassed; and
- the merge candidate is integrated with current `main` before acceptance.

If repository-level enforcement is not available for a control, the operating agent must perform the equivalent governed verification explicitly and record the evidence.

## Path-to-live evidence chain
Revision treats path-to-live as a chain of separately evidenced stages rather than one green status:

1. **Change classification** — determine the change risk and affected journeys/controls.
2. **Branch assurance** — complete implementation/documentation work and proportionate checks required to make the PR ready for final integration.
3. **Current-main integration** — validate the proposed change in combination with the then-current `main`, resolving overlap deliberately.
4. **Final assurance** — required Revision CI/checks for the final integration candidate pass at the proportionate depth defined by the Testing & Assurance Standard.
5. **Founder gate** — explicit approval exists for the PR change proposed for production. The operating agent persists/verifies required GitHub evidence as part of carrying out that approval.
6. **Pre-merge revalidation** — if `main` changed after approval, apply the mechanical-refresh versus material-change rule above.
7. **Merge** — the approved and validated change is merged into `main`.
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
