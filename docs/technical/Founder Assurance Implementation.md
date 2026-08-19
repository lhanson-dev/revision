# Founder Assurance Implementation

**Status:** Current implementation on `main` includes governed coverage/defect projection, authenticated persistence/reload assurance, protected Edge authorization integration, automated accessibility assurance and fail-closed path-to-live lineage correlation. PR #67 adds inspectable risk classification and repository secret/config scanning and remains in review until merged.

## Purpose

Define how Revision implements the living Founder assurance model so operational confidence grows with the product and missing evidence remains visible rather than being converted into false certainty.

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

Production and PR evidence remain separate. Protected `admin-operations` correlates, where available:

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

PR #66 was explicitly approved with the marker and merged as `d49e5c7cc956a8c37294fa7c2392646505204a29`. The updated `admin-operations` implementation is deployed to production as version 2 with JWT verification enabled. The current execution environment could not independently enumerate the push-triggered Pages run after that merge, so the first complete observed production lineage remains deliberately unpromoted rather than reconstructed or assumed.

## Risk-based assurance planning

PR #67 introduces the first machine-readable change-assurance plan. It implements existing authority rather than changing it.

The plan records exact base/head SHAs, risk level/reasons, affected domains, required assurance layers and execution mode. V1 is intentionally `conservative-full`: classification is inspectable but both existing CI suites still run for every PR while the classifier is calibrated. Unknown executable/config changes escalate fail-safe.

See `docs/technical/Risk-Based Assurance Plan Implementation.md`.

## Truthfulness boundary

Founder Assurance may show only evidence that exists. Planned tests do not count as coverage. Missing/stale evidence is `Unknown`; known failed required evidence is `Attention needed`; coverage rows are promoted only after their declared layer is repeatably demonstrated.

## Remaining external/current boundaries

- GitHub `main` protection/ruleset is not enabled and remains an external repository-setting control.
- Supabase leaked-password protection remains disabled according to the current Security Advisor and must be enabled in Auth settings before that warning can close.
- Real production sign-in transaction assurance remains separate from isolated CI authentication.
- Full exam save/result lifecycle assurance remains separate from the current Practice/Progress persistence path.
- Educational/content assurance remains governed independently of software CI.

## Documentation impact

PR #67 changes CI/assurance implementation truth and therefore maintains this document, the Technology Stack, the Risk-Based Assurance Plan implementation document and the Assurance Coverage Register in the same governed change. Historical audit/incident evidence is not rewritten.
