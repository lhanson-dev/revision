---
title: "Release & Deployment Standard"
document_id: "revision-release-deployment"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.6"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-21"
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
- Explicit Founder approval remains required for every merge to `main`.
- **A Founder instruction such as `Approve merge PR #X` is the complete human approval action for that merge. Where release lineage requires machine-readable GitHub evidence, the executing agent owns persisting and verifying that exact-head evidence before merge. The Founder must not be asked to repeat approval or perform a separate release-registration step.**
- **Where the release verifier specifies an exact machine-readable approval marker, that exact marker format is part of the release contract. Prose summaries, quoted approvals or alternative approval-record comments are not equivalent evidence and must not be substituted or converted retrospectively after merge.**
- A merge to `main` triggers automated production build/deployment.
- **Where the frontend depends on separately deployed database or backend capabilities, production deployment must fail closed until an automated backend-readiness gate confirms the required production contract is present.**
- Critical post-deployment journeys must be smoke-tested automatically where the change can affect them.
- Application rollback defaults to revert/redeploy.
- Database migrations should be forward-safe and backward-compatible where practical.
- One production environment is sufficient until an additional environment has a demonstrated operational benefit.

## Path-to-live evidence chain
Revision treats path-to-live as a chain of separately evidenced stages rather than one green status:

1. **Change classification** — determine the change risk and affected journeys/controls.
2. **Change assurance** — required PR CI for the exact proposed head passes at the proportionate depth defined by the Testing & Assurance Standard.
3. **Founder gate** — explicit approval is recorded for that specific PR. The operating agent persists and verifies the required exact-head GitHub evidence as part of carrying out the approved merge; this is not a second Founder action.
4. **Merge** — the approved and durably evidenced head is merged into `main`.
5. **Backend readiness** — where the release depends on database migrations, Edge Functions or other separately deployed backend capabilities, the production readiness contract is checked before a new frontend artifact may be published.
6. **Production build/deploy** — the intended `main` commit is built and deployed successfully only after any required backend-readiness gate passes.
7. **Production smoke** — affected critical deployed checks pass against the canonical live surface.
8. **Operational observation** — production availability/health evidence remains current after deployment.

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
