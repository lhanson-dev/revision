# Event-Driven Engineering Continuation — Investigation and Read-Only Pilot

**Status:** Proposed, not operational authority. 13 October 2026. No autonomous coding service activated.
**Baseline:** approved `main` `b2523fc130b32705d04cb4bb24b9efe8f9736b17`.

## Current-state evidence

- `.github/workflows/ci.yml` triggers on PR and main push; assurance-plan/secret scan is a prerequisite to both Foundation quality (typecheck, lint, unit, build, Playwright) and database/protected-service assurance (isolated Supabase, pgTAP, persistence, Edge and Playwright). All three checks are required by protected-main rulesets.
- `.github/workflows/founder-approval-status.yml` already subscribes to CI completion, PR updates and comments and publishes the exact-head `revision/founder-approval` status. The active main rulesets require this status. This workflow deliberately cannot approve on the Founder's behalf.
- `.github/workflows/founder-delivery-notifications.yml` already subscribes to CI/deploy completion. Its script posts GitHub @mentions only for non-draft PRs; it asks for `Check PR #...` when CI fails or main changed, and for `Approve merge PR #...` when green. It has no agent continuation capability. Receipt through mobile/email has **not** been independently verified.
- PR #612, latest CI run 38352790454 on head `13c1479584689575c5adc9f74fc1090c665d5299`, succeeded (05:42:38–05:57:05 UTC; about 14m27s). The PR remained draft, behind newer main and received no Founder-notification PR comment. Earlier heads also triggered full CI; ordinary changed-head test cycles do not reuse previous results.
- The mandatory CI runs the full Foundation and database suites even though `Risk-Based Assurance Plan Implementation.md` records `conservative-full` as the calibrated default. The elapsed-time example is **not** a billable-minute estimate. Determine billing from GitHub account usage, runner pricing and any private-repo policy before projecting charges.
- Deployment uses `deploy-pages.yml` on main push; lineage, backend-readiness, build, Pages deploy, smoke and `revision/path-to-live` status are separate required stages.

## Architecture choice and trade-offs

**Preferred bounded direction:** GitHub Actions as event router and evidence store; a scoped worker running a coding agent only after an approved-task/opt-in gate, failure diagnosis, current-head verification and a safety budget. Do not add a permanent custom server initially. Keep the existing Founder approval and release workflows intact.

1. GitHub native Actions alone: good for event triggers, deterministic checks, statuses and notification; cannot fix arbitrary code failures without an executable coding worker.
2. Codex CLI/GitHub Action running within ephemeral GitHub Actions: viable candidate for low-infrastructure repair; requires separately reviewed AI credentials, explicit budget, sandbox/permission controls, an action version pin, narrow commit permissions and protection from untrusted logs. **Not activated or proven**.
3. Managed coding agent with webhook/API integration: potentially more persistent and ergonomic, but exact event subscription, wake-up, pricing and branch write limits must be tested. No assumption that a normal ChatGPT chat automatically resumes.
4. Custom orchestrator: defer unless the Action/job and durable PR state cannot support reliable retries and agent transitions.

**Important:** `workflow_run` receives privileged context. Never checkout/execute an untrusted PR head in the event processor with write permissions or secrets. Separate trusted event validation and untrusted coding workspace. Treat logs, comments and artifacts as data, not instructions. Only approved-task scoped changes may be committed.

## Proposed operating loop (not yet implemented)

- Approved task -> governed branch/draft PR; local targeted test + proportionate CI.
- Completed CI -> trusted default-branch event listener verifies event, exact run attempt, PR head, same-repo eligibility, currently approved scope and duplicate lease.
- Failed CI -> inspect job/step/log evidence; classify product/test/infrastructure/transient; permitted coding worker receives short-lived minimum permissions restricted to its PR branch. Max proposed **two** autonomous repair commits, **one** transient retry, **30 minutes** worker runtime and **US$2** agent spend per PR pilot; these are proposed hard limits, not active policies.
- Green CI -> compare with latest main, review overlap, integrate only at final gate, verify final required checks and exact candidate.
- Ready -> one short Founder decision summary with PR URL, risk, evidence and `Approve merge PR #N`; must be delivered using a verified notification channel. No agent approval or merge.
- Explicit chat approval -> current established exact-head marker and status process; governed merge -> deployment and production-smoke status -> concise release notes.
- Persist `(PR, head SHA, workflow run ID, attempt, state)`, enforce one writer per branch, exponential transient handling bounded by budget, terminal stop for unsafe changes. No scheduled polling.

## Pilot implementation (this PR)

`.github/workflows/engineering-continuation-proof.yml` subscribes to **genuine** completed Revision CI events and checks out trusted main only with `contents: read`, `actions: read`, `pull-requests: read` and `persist-credentials: false`. It processes only same-repository opt-in PRs carrying the `revision-autonomy-proof` label. It accepts draft PRs deliberately. The read-only script verifies current head, latest exact-head run and attempt, and current main; it classifies a failure or integration issue, retains a JSON artifact and emits a job summary. It never executes the PR, diagnoses untrusted log bodies, starts a coding agent, posts PR comments, modifies branches or merges. Unlabelled PRs are ignored.

**Working-proof standard:** Unit tests alone are not a working event proof. After a Founder-reviewed merge of this PR, apply the label to a separate, controlled demonstration PR, let genuine PR CI finish, and verify the event workflow run ID, proof artifact, exact head and classification. An actual CI-failure route and stale-event route require bounded genuine GitHub evidence, not a fabricated report. PR #612 must not be modified.

## Notification and cost proof

GitHub @mention is a candidate, not verified delivery. Founder should select a channel (GitHub email/mobile push or an explicit connected service); demonstrate a real device delivery and acknowledgement before treating the workflow as autonomous handoff. Email/service connection, if chosen, requires approval.

Existing observed PR #612 last-run latency: approximately **14m27s** wall clock; the Foundation quality step includes browser assurance and dependency installs, while database assurance completes sooner. Actions optimisations to evaluate separately: npm cache, Playwright browser reuse/pinned image, safe parallel segments, targeted preflight before committing, staged reduction from conservative-full only after risk-classifier evidence. Measure 10+ comparable runs and account billing before claiming savings. Do not disable required CI.

## Phases and acceptance

1. **Analysis and event proof:** this PR reviewed; unit cases pass; controlled labelled PR produces genuine matching event artifact; no branch writes or notifications.
2. **Safe AI repair worker:** separate Founder approval for API spending/credentials/activation; guarded test fixture with a known routine failure; one bounded repair; verify changed-head CI and no unsafe writes.
3. **Final integration and delivery:** enforce fresh main, exact-head evidence, verified Founder notification, deduplication and expiry; demonstrate failure, success, stale branch and stop cases.
4. **Release follow-through and CI efficiency:** preserve existing approval/release contracts, instrument elapsed/cost per PR, measure and safely reduce unnecessary work.

## Governance and documentation impact

No active normative policy has been changed by the pilot. The current Release & Deployment Standard, Testing & Assurance Standard, Governed Implementation Workflow, AI Agent Constitution and exact Founder gate continue to apply. Activating unattended code-writing, adding external credentials/spend, or changing notification policy requires a separate explicit Founder decision and corresponding normative/technical documentation through a governed PR. This proposal is implementation research and technical proof, **not approval to auto-merge**.
