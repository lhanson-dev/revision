# Founder Assurance Implementation

**Status:** Founder Assurance v1 and database/RLS assurance are implemented on `main`. PR #66 extends the implementation with authenticated persistence/reload assurance, protected Edge authorization integration, automated accessibility assurance, a durable defect register and fail-closed path-to-live lineage correlation. Those additions remain in review until merged and verified.

## Purpose

Define how Revision implements the living Founder assurance model so operational confidence grows with the product and missing evidence remains visible rather than being converted into false certainty.

This document implements the intent of:

- `50-engineering-standards/Testing & Assurance Standard.md`;
- `50-engineering-standards/Observability & Operations Standard.md`;
- `50-engineering-standards/Release & Deployment Standard.md`;
- `90-governance-registers/Assurance Coverage Register.md`;
- `90-governance-registers/Defect Register.md`; and
- `10-product-governance/Core User Journeys.md`.

It does not replace those authorities.

## Canonical runtime

The implementation remains inside the existing role-gated Admin capability in the canonical React runtime:

- application: `/app/`;
- Admin landing: `/app/#/admin`;
- Founder Assurance: `/app/#/admin/assurance`;
- protected evidence service: `supabase/functions/admin-operations`.

No second Admin application or alternate learner runtime is introduced.

## Governed coverage projection

`src/assurance/coverage-register.ts` imports `90-governance-registers/Assurance Coverage Register.md` as raw build input and parses the governed table into typed coverage records.

The Markdown register remains the source of current assurance ownership. The runtime projection:

- recognises stable assurance IDs;
- preserves risk, required layer, evidence source, status and gap/next action;
- normalises qualified Covered states to the governed headline state;
- fails unrecognised status text to `Unknown`; and
- is covered by unit tests.

## Durable defect evidence

PR #66 introduces `90-governance-registers/Defect Register.md` as the durable source for known P0/P1/P2 defects and `src/assurance/defect-register.ts` as its fail-closed runtime projection.

The projection is considered available only when the register declares the supported schema version and a deliberate triage date. `Open` and `Fix in review` records count as open. `Closed` records remain durable history in the register but do not contribute to current open-defect counts.

A valid deliberately triaged empty register can therefore truthfully mean **zero known open P0/P1/P2 defects**. It does not claim that undiscovered defects cannot exist. If the register cannot be parsed or has not been deliberately triaged, Founder Assurance reports defect status as `Unknown` rather than zero.

The Admin Assurance view exposes both the headline P0/P1/P2 counts and the underlying open defect evidence.

## Founder Assurance Admin view

`src/app/FounderAssurance.tsx` presents five separate Founder questions:

1. **Production** — current canonical learner-app reachability evidence.
2. **Path to live** — correlated release-lineage evidence when the protected operations contract can prove it; otherwise `Unknown` or `Attention needed` as appropriate.
3. **Critical journeys** — counts and detailed rows from the governed Assurance Coverage Register.
4. **Data & security** — counts and detailed rows from the same governed register.
5. **Defects** — P0/P1/P2 state from the governed Defect Register when its projection is available.

The page does not calculate a single confidence percentage.

## Database, RLS and authenticated persistence assurance

The CI database job starts an isolated Supabase stack, replays the complete version-controlled migration chain and runs `supabase/tests/database-assurance.test.sql` through pgTAP. No production learner data is used.

The existing pgTAP suite proves the declared database/RLS scope, including learner evidence ownership, planner table ownership, browser-role denial for privileged Admin aggregates and least-privilege release-readiness execution.

PR #66 adds `tests/integration/supabase-persistence.test.ts`. It creates synthetic authenticated users in the isolated stack and exercises the same Supabase service adapters used by the application:

- learning evidence is written through `recordLearningEvidence()` and reloaded through `loadLearningEvidence()`;
- another authenticated learner cannot read that evidence through the service path;
- assessments, availability, availability exceptions, learner planning preferences and activity events are written and reloaded through the planner service;
- another learner cannot read those planner rows and a cross-user planner write is rejected; and
- reloaded assessment/availability/preference state is fed back into the deterministic planner and demonstrably affects its recommendation reasons.

PR #66 also adds a database-backed Playwright journey. The real app signs into the isolated Supabase Auth service, completes a scored Practice quick check, persists learning evidence, reloads the browser, and verifies that Progress reflects the persisted evidence. Public browser Supabase configuration is environment-overridable for this isolated test while production public configuration remains the default.

## Protected Edge authorization assurance

PR #66 runs repository `admin-operations` and `planner-operations` source locally with `supabase functions serve` against the isolated stack.

`tests/integration/edge-operations.test.ts` proves for both functions that:

- unauthenticated requests are rejected with `401`;
- an authenticated ordinary learner is rejected with `403`; and
- a database-authorised synthetic administrator receives a successful response.

For `admin-operations`, the integration test also requires the path-to-live health check to be present in the protected operations contract.

This is materially stronger evidence than proving only that an Edge Function route exists or that a browser mock renders an Admin screen.

## Automated accessibility assurance

PR #66 pins `@axe-core/playwright` and runs automated WCAG A/AA checks through Playwright on phone, tablet and desktop.

The assurance covers sign-in, Home, Plan, REV, Subjects, Subject Home, course Overview, Learn, Practice, Quick Check, Exam Prep, expanded exam-paper content, a timed exam, course Progress and global Progress.

The first runs found a real P2 defect: closed account/menu drawers remained keyboard-focusable while hidden. The defect is recorded as `DEF-2026-001`; PR #66 changes both implementations so closed drawers are removed from the DOM. The defect must remain open until an exact-head expanded accessibility run proves the fix.

Automated axe coverage is a baseline, not a claim that all accessibility quality can be proven mechanically. Manual/assistive-technology review remains appropriate where a change introduces interaction patterns not meaningfully covered by automated rules.

## Path-to-live correlation

Pre-merge and production evidence remain separate. A green PR run is not production evidence, and a successful deployment is not proof that the approved PR head was correctly governed.

PR #66 adds a fail-closed `path-to-live` check to the protected `admin-operations` contract. For the latest successful `main` Pages deployment it attempts to correlate:

1. deployed `main` commit SHA;
2. the merged PR associated with that commit;
3. the exact proposed PR head SHA;
4. successful `Revision CI` for that exact PR head;
5. a machine-readable Founder approval marker authored by the configured Founder GitHub identity for that exact head;
6. the merged `main` revision; and
7. the backend-readiness-gated Pages deployment and production smoke represented by the successful deployment workflow.

The Founder approval marker format is intentionally explicit:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

The marker must be authored by the configured Founder GitHub identity and recorded **after explicit approval and before merge**. Missing approval evidence is `Unknown`; it is never inferred from the fact that a PR was merged. Known failed CI/deployment evidence is `Attention needed`.

PR #64 predates this marker and must not be backfilled to manufacture historical evidence. The first complete lineage can only be recorded on a future explicitly approved merge using the marker prospectively.

## Core implementation rule

Every material change must resolve:

1. which governed user journeys and controls are affected;
2. the risk level of the change;
3. the minimum required assurance layers;
4. whether existing tests still provide valid evidence;
5. which checks must run before merge;
6. which checks must run after deployment; and
7. whether the Assurance Coverage Register or Defect Register changes.

A feature is not complete merely because its implementation works locally. Its assurance ownership and evidence must remain aligned with the governed registers.

## Remaining boundaries after PR #66

PR #66 does not by itself justify claiming every assurance row is Covered. In particular:

- the first fully correlated production path-to-live lineage cannot exist until an explicitly approved PR using the new marker is merged, deployed and smoked;
- repository branch protection remains an external GitHub settings control until configured and reverified;
- Supabase leaked-password protection remains an external Auth setting until enabled and the Security Advisor rechecked;
- real production authentication transaction assurance remains separate from isolated CI authentication;
- complete exam save/result lifecycle assurance remains separate from the Practice/Progress persistence path; and
- content-pack educational assurance remains governed independently of software CI.

Risk-based CI selection and a machine-readable assurance-plan artifact remain a useful engineering maturity improvement, but are not substituted for the concrete evidence layers above.

## Truthfulness boundary

The Admin must show existing evidence only. Missing or stale evidence is `Unknown`. Planned tests never count as coverage. A known failed required stage is `Attention needed`. Coverage-register rows are promoted only after their declared required assurance is repeatably demonstrated.

## Documentation impact

PR #66 changes implementation truth around CI, protected operations, defect evidence, public test configuration and accessibility. This document, the Technology Stack, the Assurance Coverage Register, the Defect Register and INDEX are therefore maintained in the same governed PR. Historical audits/incidents are not rewritten.
