---
title: "Release & Deployment Standard"
document_id: "revision-release-deployment"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.2"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-19"
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
- Explicit Founder approval remains required for every merge to `main`.
- A merge to `main` triggers automated production build/deployment.
- Critical post-deployment journeys must be smoke-tested automatically.
- Application rollback defaults to revert/redeploy.
- Database migrations should be forward-safe and backward-compatible where practical.
- One production environment is sufficient until an additional environment has a demonstrated operational benefit.

## Path-to-live evidence chain
Revision treats path-to-live as a chain of separately evidenced stages rather than one green status:

1. **Change assurance** — required PR CI for the exact proposed head passes.
2. **Founder gate** — explicit approval is recorded for that specific PR.
3. **Merge** — the approved head is merged into `main`.
4. **Production build/deploy** — the intended `main` commit is built and deployed successfully.
5. **Production smoke** — critical deployed checks pass against the canonical live surface.
6. **Operational observation** — production availability/health evidence remains current after deployment.

Admin may summarise the path as Healthy only when the required current stages are green for the production commit being reported. Missing or stale stage evidence is Unknown; a known failed required stage is Attention needed.

A successful PR CI run must never be displayed as proof that production is healthy. A successful deployment without its required smoke evidence must not be displayed as complete path-to-live assurance.

## Production identity
Where practical, operational evidence should expose the production commit/revision being checked so the Founder can tell whether CI, deployment and smoke refer to the same code lineage.

## Database/backend enablement
Static frontend deployment does not prove separately deployed database migrations, Edge Functions or server-side secrets/configuration are healthy. Where a feature depends on those components, path-to-live assurance must include explicit deployment/readiness evidence for them before the feature is represented as operationally Healthy.
