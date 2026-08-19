# Founder Assurance Implementation

**Status:** Current `main` includes governed coverage/defect projection, authenticated persistence/reload assurance, protected Edge authorization integration, automated accessibility assurance, fail-closed path-to-live correlation, risk-based assurance planning and repository secret/config scanning. The current closure PR adds durable commit-level path-to-live evidence and deployment enforcement; those additions remain in review until merged and observed in production.

## Purpose

Define how Revision implements the living Founder assurance model so operational confidence grows with the product and missing evidence remains visible rather than converted into false certainty.

This document implements:

- `50-engineering-standards/Testing & Assurance Standard.md`;
- `50-engineering-standards/Observability & Operations Standard.md`;
- `50-engineering-standards/Release & Deployment Standard.md`;
- `90-governance-registers/Assurance Coverage Register.md`;
- `90-governance-registers/Defect Register.md`; and
- `10-product-governance/Core User Journeys.md`.

It does not replace those authorities.

## Canonical runtime

Founder Assurance remains inside the role-gated Admin capability in the canonical React runtime:

- application: `/app/`;
- Admin landing: `/app/#/admin`;
- Founder Assurance: `/app/#/admin/assurance`;
- protected evidence service: `supabase/functions/admin-operations`.

No second Admin application or alternate learner runtime exists.

## Governed coverage and defect projection

`src/assurance/coverage-register.ts` reads `90-governance-registers/Assurance Coverage Register.md` as governed build input and fails unrecognised status text to `Unknown`.

`src/assurance/defect-register.ts` reads `90-governance-registers/Defect Register.md`. The projection is available only when the register has the supported schema version and a deliberate triage date. Open and Fix-in-review records count as open; Closed records remain durable history but do not contribute to current counts.

A deliberately triaged valid register with no open records may therefore truthfully show zero **known** P0/P1/P2 defects. It never claims undiscovered defects cannot exist.

## Founder Assurance view

The Admin Assurance view separates:

1. **Production** — canonical learner-app reachability;
2. **Path to live** — correlated release lineage when evidence is complete;
3. **Critical journeys** — governed journey/control coverage;
4. **Data & security** — governed data/security coverage; and
5. **Defects** — governed P0/P1/P2 state.

It does not calculate a single confidence percentage.

## Database, persistence and planner assurance

Revision CI starts an isolated Supabase stack, replays the version-controlled migration chain and runs pgTAP database/RLS assurance. Synthetic authenticated users then exercise the same service adapters used by the application.

Current repeatable evidence includes:

- learning evidence write/reload through the real Data API and RLS boundary;
- cross-user learner-evidence rejection;
- planner assessment, availability, exception, preference and activity persistence/reload;
- cross-user planner read/write rejection;
- reloaded planner state fed back through the deterministic planner, proving persisted preference affects recommendation reasons; and
- a real browser Practice → database save → reload → Progress reconstruction journey against isolated Supabase.

Production learner data is not used for CI integration assurance.

## Protected Edge authorization assurance

Repository `admin-operations` and `planner-operations` source is served against isolated Supabase during CI. Integration tests require:

- unauthenticated requests → `401`;
- authenticated ordinary learner → `403`; and
- database-authorised synthetic administrator → successful response.

This verifies the server/data authorization boundary rather than relying on Admin UI visibility.

## Automated accessibility assurance

Pinned `@axe-core/playwright` checks WCAG A/AA rules on phone, tablet and desktop across sign-in, Home, Plan, REV, Subjects, Subject Home, course Overview, Learn, Practice, Quick Check, Exam Prep, expanded exam-paper content, timed exam, course Progress and global Progress.

The gate discovered two P2 accessibility defects during PR #66: hidden focusable drawers and insufficient inactive desktop-navigation contrast. Both were durably recorded, fixed and closed only after exact-head browser/accessibility evidence passed.

Automated axe coverage is a baseline; manual assistive-technology/usability review remains appropriate for interaction patterns automated rules cannot meaningfully judge.

## Path-to-live correlation

Production and PR evidence remain separate. Protected `admin-operations` correlates, where GitHub evidence is readable:

1. deployed `main` commit;
2. associated merged PR;
3. exact proposed PR head;
4. successful Revision CI for that exact head;
5. machine-readable Founder approval marker authored by the configured Founder GitHub identity;
6. merge revision; and
7. successful backend-readiness-gated Pages deployment and production smoke.

Founder approval marker format:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

Missing evidence is `Unknown`; a known failed required stage is `Attention needed`. Approval is never inferred merely because a merge occurred.

PR #66 introduced the protected correlation implementation. PR #67 then added machine-readable risk classification and secret/config assurance and was explicitly Founder-approved and merged as `7295f21d9baaf058e8f438fd48558a33f05d2042`.

### Durable commit-level release evidence

The current closure PR strengthens the release path so path-to-live evidence no longer depends solely on a consumer being able to enumerate push-triggered GitHub Actions runs.

It adds a pre-deploy release-lineage verifier and a final durable commit status:

`revision/path-to-live`

Before backend readiness, deployment must prove the current `main` commit came from a merged PR whose exact proposed head has successful Revision CI and an exact-head Founder approval marker. After the one explicit bootstrap release, the previous `main` commit must also carry `revision/path-to-live = success`.

After backend readiness, build, Pages deploy and production smoke finish, the workflow writes `revision/path-to-live = success` only if every required stage succeeded; otherwise it writes failure. The status is attached to the exact `main` revision and links to the release run.

This gives Revision a durable release-chain fact that can be inspected independently of workflow-list visibility. PTL-03 remains Partial until the first post-merge success status is actually observed.

## Risk-based assurance planning

PR #67 implemented the first machine-readable change-assurance plan and repository secret/config gate.

The plan records exact base/head SHAs, risk level/reasons, affected domains, required assurance layers and execution mode. V1 is intentionally `conservative-full`: classification is inspectable but both existing CI suites still run for every PR while the classifier is calibrated. Unknown executable/config changes escalate fail-safe.

The repository secret/config scanner runs before downstream CI and scans every tracked non-binary file within the supported size boundary for privileged credential/config patterns. Public browser-safe Supabase publishable keys remain intentionally permitted.

See `docs/technical/Risk-Based Assurance Plan Implementation.md`.

## Current external security/repository controls

### GitHub branch protection

GitHub `main` protection/rulesets are not currently enabled. The available connected GitHub capability does not expose branch-protection/ruleset mutation.

The closure PR therefore adds a strong compensating production control: an ungoverned direct `main` push cannot deploy through the unchanged workflow because it cannot satisfy PR/CI/Founder lineage, and its failed `revision/path-to-live` status breaks the prior-release chain for subsequent deployment until deliberately remediated.

This is not equivalent to branch protection because an administrator could deliberately change the workflow itself. Repository protection remains required defence in depth and should be configured manually before the foundation programme is finally closed.

### Supabase leaked-password protection

Supabase Security Advisor currently reports managed leaked-password protection disabled. Current project inspection confirms the Revision Supabase organisation is on the **Free** plan; Supabase's managed HaveIBeenPwned password protection is available only on Pro and above.

The active Revision Security Standard does not mandate that specific vendor feature. Current production inspection on 2026-08-19 shows a small controlled Auth population (3 Auth users / 3 profiles, including 1 admin). Revision will therefore **not incur a paid Supabase plan change solely to clear this advisor warning without a separate commercial decision**.

The warning remains visible and is not dismissed or represented as fixed. Managed leaked-password protection becomes a launch/upgrade control: enable and reverify it before broad external learner acquisition, or when Revision moves to Supabase Pro for another justified reason, whichever comes first.

This is a transparent risk disposition, not an assertion that leaked-password protection is unnecessary.

## Truthfulness boundary

Founder Assurance may show only evidence that exists. Planned tests do not count as coverage. Missing/stale evidence is `Unknown`; known failed required evidence is `Attention needed`; coverage rows are promoted only after their declared layer is repeatably demonstrated.

## Remaining boundaries

- PTL-03 requires the first observed successful `revision/path-to-live` status after the closure PR merges.
- GitHub `main` protection remains an external defence-in-depth control until manually configured and reverified.
- Supabase managed leaked-password protection remains a visible Pro-plan launch/upgrade control, not a closed advisor finding.
- Real production sign-in transaction assurance remains separate from isolated CI authentication.
- Full exam save/result lifecycle assurance remains separate from the current Practice/Progress persistence path.
- Educational/content assurance remains governed independently of software CI.

## Documentation impact

The closure PR changes release-path implementation truth and records the current external-control disposition. This document, the Production Backend Readiness Gate, Technology Stack, Assurance Coverage Register and foundation tracker are maintained accordingly. Historical audits/incidents are not rewritten.
