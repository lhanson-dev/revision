# Risk-Based Assurance Plan Implementation

**Status:** Active on `main`; parallel execution optimisation proposed in the current maintenance PR. Normative policy remains `50-engineering-standards/Testing & Assurance Standard.md` and `50-engineering-standards/Release & Deployment Standard.md`.

## Purpose

Make Revision's change risk and selected assurance inspectable before the main CI suites run, without weakening the existing gates while the classifier is being calibrated.

## Current implementation

`Revision CI` begins with an **Assurance plan and secret scan** job. It:

1. checks out full Git history for the proposed base/head pair;
2. generates `assurance-plan.json` from the exact change;
3. records risk level, reasons, affected assurance domains and required assurance layers;
4. scans tracked repository text for privileged credential/config patterns;
5. uploads the JSON as a 30-day GitHub Actions artifact; and
6. blocks downstream CI if classification or secret scanning fails.

The classifier lives in `scripts/assurance/change-classifier.mjs`. The CLI wrapper is `scripts/assurance/generate-assurance-plan.mjs`.

## Risk classification

The classifier implements the highest-applicable-factor rule from the Testing & Assurance Standard.

- Markdown-only changes are Level 1 / Low.
- Bounded application or assurance implementation changes are at least Level 2 / Medium.
- CI/deployment, dependencies/build contract, Supabase/database/RLS/Edge boundaries, learner educational content, shared runtime/auth/persistence/evidence/planning changes are Level 3 / High.
- Destructive migration signatures such as table/schema/column drops, truncation or delete operations are Level 4 / Critical.
- Unclassified non-documentation changes fail safe to Level 3 / High.
- If changed files cannot be determined, classification fails safe to Level 3 / High.

The generated plan includes exact `baseSha` and `headSha`, so the evidence can be tied to the proposed revision.

## Conservative execution mode

Version 1 uses `selectionMode: conservative-full`.

The classifier declares the minimum assurance implied by risk, but **does not skip any existing CI suite**. `Foundation quality` and `Database, RLS and protected service assurance` both remain mandatory after the plan job succeeds.

This is deliberate. The first stage is to make classification transparent and collect trustworthy evidence. Selective execution may only be introduced later through a governed change after the classifier has demonstrated reliable boundaries; uncertainty must continue to escalate rather than skip assurance.

## Repository secret/config scanning

`scripts/assurance/scan-secrets.mjs` scans tracked text without third-party dependencies. It rejects known privileged credential patterns including:

- GitHub personal/application token formats;
- OpenAI-style secret keys;
- Supabase `sb_secret_` keys;
- legacy Supabase JWTs whose payload role is `service_role`;
- AWS access-key identifiers;
- private-key blocks;
- credential-bearing database URLs;
- literal privileged environment assignments such as `SUPABASE_SERVICE_ROLE_KEY`; and
- privileged Supabase credential references in non-test browser/application source.

Supabase publishable keys are intentionally not treated as secrets because browser-delivered configuration is public by design under the Security Standard.

The scanner is a repository control, not proof that every external secret store or account setting is healthy. Supabase leaked-password protection and GitHub branch protection remain separate controls.

## Evidence and tests

- classifier unit tests: `scripts/assurance/change-classifier.test.mjs`;
- secret scanner unit tests: `scripts/assurance/scan-secrets.test.mjs`;
- live CI artifact: `assurance-plan-<run-id>`;
- CI run summary exposes risk and reasons to reviewers.

PR #67's first classifier execution correctly classified its own CI/path-to-live change as Level 3 / High and successfully uploaded the machine-readable artifact while retaining the full existing CI suites.

## Documentation impact

No normative standard change is required because active engineering authority already mandates risk-based classification, progressive automation, inspectable assurance scope and fail-safe escalation. This document records implementation truth. The Technology Stack, INDEX and Assurance Coverage Register are updated in the same PR where the evidence changes current state.

## Foundation quality execution optimisation (16 October 2026 — proposal)

The previous full Foundation quality job ran unit/static/build checks, then all phone, tablet and desktop Playwright projects sequentially, using two browser workers. Exact-head PR #637 CI run 38866205296 took approximately 17m28s for Foundation quality; browser regression took approximately 15m18s (648 passed, 332 skipped, 1 flaky). Database/RLS assurance finished independently in approximately 2m39s. A previous run (38770327258) failed two browser assertions, reinforcing the need to retain visual/accessibility failure evidence.

The proposed workflow splits the unchanged full Playwright regression across three parallel jobs (one per existing viewport project). Static, unit and build assurance also runs concurrently. Each browser project retains the existing automatic single retry and failure artifacts. The existing required **Foundation quality** job name remains, implemented as a fail-closed aggregator that succeeds only if assurance-plan, static/unit/build and the complete browser matrix all succeeded. Database, RLS and protected-service assurance remains a separate required job. No browser tests or required checks are removed.

The workflow cancels superseded pull-request runs for the same PR, without cancelling main-branch push runs. npm caching is enabled on new test jobs. Timing and flakiness must be remeasured using multiple exact-head GitHub Actions runs; the estimated 8–10-minute full CI duration is not an observed result.

**Test-selection boundary:** this PR does **not** enable selective execution or scheduled replacement testing. The active classifier remains `conservative-full`; it is hardened so central Home/Plan recommendation paths are classified High risk rather than Medium. Selective execution requires a separate, evidence-based coverage mapping and demonstration that changed critical/shared journeys trigger all required tests, with fallback to full assurance on uncertainty. A nightly full run cannot replace mandatory high-risk pre-merge checks.

**Acceptance:** before merge, demonstrate successful exact-head Revision CI, all three Playwright projects, static/unit/build, DB/RLS, exact required status names, and correct fail-closed aggregator semantics. Preserve protected merge status `Foundation quality` and Founder approval rules. Record observed duration and any observed flaky baseline. The canonical production learner route remains `/revision/app/`; this infrastructure-only PR does not modify the deployed learner runtime or any learner-facing route.
