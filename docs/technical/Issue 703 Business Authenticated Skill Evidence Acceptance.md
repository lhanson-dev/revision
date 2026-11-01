# Issue #703 — AQA Business authenticated skill-evidence acceptance, first observed slice

**Status (1 November 2026):** First isolated authentic learner evidence acceptance slice; prior full CI #41301700438 passed, but the branch must be revalidated after integration with the latest approved main. Not merged or live; new exact-head CI pending. **Do not close #703, #704, #705, #698 or #694 on this package.**

## Canonical user path and purpose

Actual student runtime: `/revision/app/` → AQA A-level Business 7132 → Practice / Plan / Progress. This does **not** add a learner route, a mock data store, a second planner, a new score or a marking product. Existing Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance already prescribe defensible evidence and next actions. This test only expands acceptance evidence for the current implementation.

### Reproducible isolated authenticated browser/DB acceptance (new test)

`tests/e2e/plan-live-auth-configuration.spec.ts` adds an explicit **two distinct Business Marketing weaknesses** scenario to its *existing* CI-invoked authenticated integration file. Its real local Supabase integration flag is `REVISION_BROWSER_DB_INTEGRATION=1`; it **refuses any non-local host, any non-http scheme or any port other than 54321**. An ephemeral confirmed ordinary student is created in the disposable stack; the same learner is enrolled into actual `aqa:aqa-a-level:7132`, completes ordinary first-use state through learner services, and has a genuine future AQA Business paper and realistic daily capacity.

The test loads two actually published, independently scored typed final-number cases from the *same Business ContentPack source module* (not a bespoke mock):
- `rev7132-3.3.2-firm-sales-growth-increase-01` → `aqa-7132-3.3.2:sales-growth` (one firm's growth), and
- `rev7132-3.3.2-market-growth-decline-02` → `aqa-7132-3.3.1:market-growth` (whole market growth).

Their original answers are independently re-derived by the existing calculator/marking tests. This acceptance scenario injects two intentionally wrong, certain final-number attempts through **the ordinary authenticated, owner-scoped application EvidenceStore** using its real `createCalculationEvidence` contract and `recordLearningEvidence`. It is important **not** to call these two initial attempts *browser-typed answers*: the service directly creates and saves them, specifically to test reload/recommendation effects without depending on a random initial question queue.

The test then independently re-reads PostgREST rows and verifies the unique exact `singleTargetSpecItemId`, immutable source-appropriate mark provenance `software-scored-final-number`, the learner's specific module/topic, and incorrect outcome. A **fresh browser Auth session** logs in using the ordinary student email/password UI; the canonical Plan shows supported Business Marketing work in its current detailed Week view and still shows it after a real reload. Progress is opened and the database records independently checked again. No mock Auth token, intercepted `learning_evidence` HTTP response, privileged evidence write, production credentials, admin learner impersonation, revised grade claim or forged Plan task is used. Cleanup deletes the isolated student.

## Boundaries — what is **NOT** accepted by this first slice

- A complete browser-typed wrong answer → exact Learn repair → new, **different** browser-typed assessed item → updated Progress/Home/REV/Plan after refresh has **not** been accepted. The current full learner acceptance remains an explicit next gate.
- The browser's general Marketing recommendation **does not**, on its own, prove that **both distinct** skill repairs or targeted rechecks are visible and startable. Additional assertions must check specific Plan tasks, their distinct content IDs, skill-scoped evidence and their correct withdrawal after fresh reassessment.
- One right final number proves neither a working method nor exam AO3/AO4 assessment, sound explanation, durable mastery or sufficient Practice across 42 Business sections.
- Ordinary local Supabase Auth/CI is not a hosted SMTP signup confirmation/recovery test (#693), family observation or independent expert curriculum/marking review.
- Do not present the 344 historic mapping, the 194 official checkpoints or 501 provisional atoms as an independently exhaustive adequacy denominator; the full #698 AQA Business audit continues.

## Assurance and documentation impact

The change adds one real database/browser acceptance case to an existing CI-invoked test file, without modifying learner code, schema, migrations, progress labels, privacy rules, source files, exam bank identities, or Psychology. This note and `INDEX.md` are included in the **same PR**, preserving dated historical assessments. **Normative authority remains unchanged** because the test verifies pre-existing approved behaviour.

The next governed acceptance package should navigate and submit the **different** assigned question through the actual Plan/Home activity UI, verify accurate owner-scoped persisted evidence and the changed recheck recommendation, then observe what the learner sees in Home/REV/Progress after refresh. Where the live UI fails, fix only the verified integration defect and add regression evidence; do not claim readiness based on this scoped test.

## Current main reconciliation — 1 November 2026

The original candidate was approved-ready and passed all nine required CI jobs in run #41301700438. Since then approved main advanced. This branch is mechanically integrated with latest main without changing its scoped learner test contract, scoring or runtime. A new exact-head full CI is required; its result must be recorded before seeking specific merge approval. This is separate from draft PR #757, which adds a *different* new authored independent calculated recheck browser scenario. Neither branch alone constitutes complete wrong-answer → two-skill exact repair → independent follow-up → shared Home/REV/Plan/Progress acceptance.
