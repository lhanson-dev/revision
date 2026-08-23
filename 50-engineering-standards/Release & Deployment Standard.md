---
title: "Release & Deployment Standard"
document_id: "revision-release-deployment"
document_type: "standard"
authority: "engineering"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-23"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["CI/CD and deployment", "path-to-live assurance"]
depends_on: ["ADR-0007", "ADR-0009", "ADR-0017", "ADR-0018"]
supersedes: null
---
# Release & Deployment Standard

## Rules
- GitHub Actions is the default CI/CD platform.
- Only validated production build artifacts may be deployed.
- CI selects assurance depth using change risk, with critical shared areas escalating automatically.
- The test set should be proportionate: low-risk changes should not automatically incur full end-to-end regression; high-risk/shared changes must run the relevant broader suite.
- **Revision operates with startup pace and enterprise-grade production discipline: speed must come from automation, proportionate assurance and clear ownership, not from bypassing required controls.**
- **When a required production condition, approval, integration state or assurance result is unknown, release must fail closed rather than assume success.**
- **`main` is the single canonical integrated product state. Governed work reaches production only through a PR-based integration path.**
- **Revision supports multiple concurrent branches and PRs. Branches do not need continuous rebasing during active work, but every merge candidate must be validated in combination with the then-current `main` before merge.**
- Explicit Founder approval remains required for every merge to `main`.
- **A Founder instruction such as `Approve merge PR #X` is the complete human approval action for that proposed production change. Where release lineage requires machine-readable GitHub evidence, the executing agent owns persisting and verifying that evidence before merge. The Founder must not be asked to perform Git bookkeeping.**
- **Where the release verifier specifies an exact machine-readable approval marker, that exact marker format is part of the release contract. Prose summaries, quoted approvals or alternative approval-record comments are not equivalent evidence.**
- **Once the trusted `revision/founder-approval` gate is available on `main`, a release-governed PR must not be merged unless that status is `success` for the current exact PR head. The status reports valid CI/approval evidence; it does not create or substitute for Founder approval.**
- **After Recovery 4, ordinary release-governed merges must not resume until GitHub repository-level enforcement is independently verified to require successful Revision CI and `revision/founder-approval = success` for the current candidate. If the platform cannot provide that hard barrier, a Founder-approved alternative hard enforcement mechanism is required before ordinary merges resume.**
- **A purely mechanical refresh from newer `main` may retain the existing Founder approval only when the PR delta is demonstrably unchanged, no substantive conflict resolution occurred and fresh required assurance passes. A material change to the PR delta requires renewed Founder approval.**
- A merge to `main` triggers automated production build/deployment.
- **Where the frontend depends on separately deployed database or backend capabilities, production deployment must fail closed until an automated backend-readiness gate confirms the required production contract is present.**
- Critical post-deployment journeys must be smoke-tested automatically where the change can affect them.
- Application rollback defaults to revert/redeploy.
- Database migrations should be forward-safe and backward-compatible where practical.
- **Revision has one Production application environment and one production Supabase project. Prototype and Staging are approved non-production application review environments with distinct purposes; they do not create additional production sources of truth or production backends.**

## Environment model

Revision uses one canonical source repository and three application review/deployment environments:

### Prototype

Prototype is disposable exploration derived from the then-current `main` baseline.

It exists to resolve journey, screen-purpose, CTA, hierarchy, content and interaction uncertainty quickly before production implementation.

Prototype rules:

- prototype work uses short-lived branches in `lhanson-dev/revision`;
- materially new prototype work starts from current `main`;
- prototype data is synthetic/demo data, never genuine learner data;
- prototype approval is concept approval, not governed Definition-of-Ready approval;
- a prototype may be used during `Analyse` to resolve uncertainty;
- prototype code/artifacts are not promoted or copied into Staging or Production; and
- after concept agreement, the production change is implemented properly through a governed implementation PR based on the then-current `main`.

### Staging

Staging is the browser-review surface for the exact engineered release candidate.

Staging rules:

- Staging is built from the final implementation PR head after integration/revalidation with the then-current `main`;
- required risk-proportionate CI/assurance for that exact candidate must pass before it is represented as the release candidate;
- Staging uses deliberately isolated synthetic/test data and must not cause test activity to be interpreted as live learner evidence, metrics or production health;
- candidate provenance, including exact commit/head identity, should be visible or durably recorded where practical;
- a changed PR head invalidates older Staging evidence for that candidate; and
- Staging is not a long-lived source branch and has no independent product authority.

### Production

Production is the live product deployed from Founder-approved `revision/main` only.

Prototype and Staging may never deploy directly to the Production Pages environment. Staging review does not replace Founder approval, exact-head approval evidence, production backend readiness, production deployment, smoke or release-lineage controls.

### Hosting boundary

The approved target topology is:

- `lhanson-dev/revision` — canonical source, governance, test and release repository; and
- `lhanson-dev/revision-nonprod` — generated/static non-production hosting space for `/prototype/<name>/` and `/staging/` only.

`revision-nonprod` must contain no competing governance, independent application source, product authority or development lifecycle. It is a disposable deployment target generated from `revision`.

The non-production hosting repository and workflows are not yet implemented. Until the governed implementation lands, the existing Production workflow remains the only operational deployment path and absence of Staging must not block otherwise-governed releases. Once the Staging workflow is deliberately activated on `main`, its required use and assurance become part of the live path-to-production contract.

See `docs/technical/Path to Live Environments.md` for the target technical topology and implementation boundary.

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

Where Staging is live, a head refresh also makes the old Staging build stale. A purely mechanical refresh may preserve the existing Founder approval under the rule above, but the exact refreshed candidate must still be rebuilt/revalidated in Staging when Staging is a required path-to-live stage.

### Founder approval status gate

`docs/technical/Founder Approval Gate.md` defines the pre-merge commit status:

`revision/founder-approval`

For an ordinary release-governed PR after the gate workflow is live on `main`, merge-time evidence must include:

1. successful required Revision assurance for the current integration candidate;
2. explicit Founder approval for the PR change;
3. the exact machine-readable Founder marker for the current PR head, created at or after the latest exact-head CI; and
4. `revision/founder-approval = success` on that same head.

A head change requires the status to be re-evaluated. An old head's success is never evidence for a new head.

Recovery 3 introduced the status workflow. Recovery 4 records that PR #139 was merged while the status correctly remained `pending`, proving that the status alone was not a hard barrier while repository required-check enforcement was off.

### Recovery 4 hard-enforcement hold

After Recovery 4 merges, no ordinary release-governed PR may merge until actual GitHub repository state has been verified to require both the relevant Revision CI check(s) and `revision/founder-approval = success` for the current PR head.

This is a production-control hold, not a recommendation. Workflow files, documentation and a visible status are insufficient evidence of enforcement. The repository setting itself must be verified.

If GitHub cannot provide the required barrier for the current repository plan/ownership model, ordinary merges remain blocked until a different hard enforcement mechanism is explicitly designed, documented and Founder-approved. A return to advisory-only agent discipline is not an acceptable fallback after the fourth recurrence.

The Recovery 4 PR is the narrow exceptional recovery that establishes the new prospective lineage anchor and records this enforcement hold. It still requires successful exact-head CI, explicit Founder approval, exact machine-readable approval evidence, `revision/founder-approval = success`, exact-head merge and full post-merge Production evidence.

## Continuous delivery improvement

The delivery system itself is subject to continuous improvement.

- Repeated CI churn, stale-branch problems, near misses, release defects, avoidable manual steps or unclear ownership should be treated as signals to improve tooling or governance.
- Improvement proposals should favour automation, simpler controls and shorter feedback loops where those changes preserve or strengthen production safety.
- Process should be proportionate to risk; enterprise-grade does not mean maximum ceremony for every change.
- Material changes to approval boundaries, production controls or governance still require documented Founder-approved change before they become authoritative.
- Historical incidents and audits remain evidence; they are not rewritten merely because the process later improves.

## Repository enforcement target

`main` must enforce, through GitHub repository settings or a separately approved hard technical equivalent:

- changes arrive through pull requests;
- required Revision CI/status checks pass before merge;
- `revision/founder-approval` is a required status check;
- force pushes and deletion are blocked;
- the governed merge path cannot be silently bypassed; and
- the merge candidate is integrated with current `main` before acceptance.

Repository settings must never be represented as enforcing a check unless that enforcement has actually been verified from GitHub state.

As of the Recovery 4 incident investigation on 23 August 2026, branch metadata reported required-status-check enforcement as `off`, with no required contexts/checks. That state is not compliant for ordinary merges after Recovery 4.

## Path-to-live evidence chain
Revision treats path-to-live as a chain of separately evidenced stages rather than one green status:

1. **Change classification** — determine the change risk and affected journeys/controls.
2. **Branch assurance** — complete implementation/documentation work and proportionate checks required to make the PR ready for final integration.
3. **Current-main integration** — validate the proposed change in combination with the then-current `main`, resolving overlap deliberately.
4. **Final assurance** — required Revision CI/checks for the final integration candidate pass at the proportionate depth defined by the Testing & Assurance Standard.
5. **Staging candidate review** — once the Staging workflow is live and required for the change class, deploy the exact final current-main-integrated candidate to Staging with candidate provenance and validate it in the browser before production approval.
6. **Founder gate** — explicit approval exists for the PR change proposed for production. The operating agent persists/verifies required GitHub evidence and, once available, verifies `revision/founder-approval = success` for the exact head.
7. **Pre-merge revalidation** — if `main` changed after approval, apply the mechanical-refresh versus material-change rule above and re-establish all head-specific evidence, including Staging evidence where required.
8. **Hard merge enforcement** — for ordinary PRs after Recovery 4, repository-level required-check enforcement must be verified active before merge is permitted.
9. **Merge** — the approved and validated change is merged into `main`.
10. **Backend readiness** — where the release depends on database migrations, Edge Functions or other separately deployed backend capabilities, the production readiness contract is checked before a new frontend artifact may be published.
11. **Production build/deploy** — the intended `main` commit is built and deployed successfully only after any required backend-readiness gate passes.
12. **Production smoke** — affected critical deployed checks pass against the canonical live surface.
13. **Operational observation** — production availability/health evidence remains current after deployment.

Admin may summarise the path as Healthy only when the required current stages are green for the production commit being reported. Missing or stale stage evidence is Unknown; a known failed required stage is Attention needed.

A successful PR CI run or Staging deployment must never be displayed as proof that Production is healthy. A successful production deployment without its required smoke evidence must not be displayed as complete path-to-live assurance.

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

Staging evidence should similarly identify the exact PR/head it represents so that Founder review is traceable to the candidate proposed for merge.

## Database/backend enablement
Static frontend deployment does not prove separately deployed database migrations, Edge Functions or server-side secrets/configuration are healthy. Where a feature depends on those components, path-to-live assurance must include explicit deployment/readiness evidence for them before the feature is represented as operationally Healthy.

For the canonical Revision release path:
- the database exposes a deliberately narrow, non-sensitive release-readiness contract that reports whether the currently required schema capabilities are present;
- the Pages deployment checks the expected contract before building/uploading a new frontend artifact;
- required protected Edge Functions are probed for deployed/authenticated behaviour rather than assumed present because source files exist in Git;
- a missing readiness function, contract mismatch, missing required capability, missing Edge Function, or unexpected authentication response blocks the frontend deployment;
- adding a new production database/backend dependency requires updating the release-readiness contract and deployment expectation in the same governed PR; and
- the readiness contract proves capability presence, not learner-data correctness or full security assurance; those remain governed by the Testing & Assurance Standard and Assurance Coverage Register.
