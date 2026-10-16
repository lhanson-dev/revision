# Risk-Based Assurance Plan Implementation

**Status:** Active on `main`; selective execution candidate proposed in the current governed maintenance PR. Normative policy remains `50-engineering-standards/Testing & Assurance Standard.md` and `50-engineering-standards/Release & Deployment Standard.md`.

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

## Risk-selected execution mode (governed proposal)

The current released implementation uses `conservative-full`: all PRs execute full CI. The proposed implementation uses `risk-selected` with only two deterministic, narrow exceptions for **pull requests**. All `main` pushes and other PRs run the full static, responsive browser and database/Edge assurance suites.

1. **Allowlisted non-executable Markdown only:** `README.md`, `docs/technical/**/*.md`, `docs/design/**/*.md` and `audits/**/*.md`. These paths cannot change executable runtime or governed educational inputs. The assurance-plan and secret scan run. Other Markdown paths, including numbered governance authorities, content factories and registers, are full CI by default.
2. **Isolated browser-spec maintenance:** at most eight existing `tests/e2e/<name>.spec.ts` files, optionally with the allowlisted Markdown files. Typecheck, lint, validators, unit tests and production build all run. Phone, tablet and desktop each run the changed browser spec(s), with existing retries, accessibility/snapshot assertions and failure evidence intact. The separate database-backed browser specs `database-persistence.spec.ts` and `first-use-real-service.spec.ts` trigger full assurance.

**Fail-safe:** changed application code, shared component styles, learner planning/educational scoring, authentication, RLS, database migrations, workflow/configuration changes, mixed executable+test diffs, deleted/renamed browser tests, unknown paths, missing changed-file evidence or more than eight changed specs all trigger full CI. A Medium risk classification alone does **not** enable selection: the specific change must meet the allowlist proof. The classifier uses no speculative dependency-to-test mapping.

**Required status integrity:** all required job names are retained, including `Foundation quality` (the fail-closed aggregate) and `Database, RLS and protected service assurance`. For an inapplicable layer the job executes an explicit no-op reporting why it was not run; a passing not-applicable job does not mean the browser or database tests executed. The plan artifact and job summary expose mode, changed files, browser targets and executed layers. Failures, missing/unknown selection modes and upstream plan failure block the required Foundation gate.

**Release boundary:** every merge still needs an exact-head successful `Revision CI` for its *appropriate* scope, the machine-readable Founder approval, current-`main` integration and production release lineage. All pushes to `main` run the complete regression suite; a nightly full run is not needed as a substitute for the full post-merge push and must never substitute for high-risk PR testing.

**Candidate acceptance:** independently test documentation, isolated browser specs, mixed changes, deleted/renamed specs, database-backed specs, planner/auth/security paths, unclassified files and push events. Prove unchanged mandatory status names, all-viewport targeted test execution, full assurance for this workflow PR, and fail-closed behaviour. Do not claim a measured fast-path duration until an eligible PR completes.

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

## Foundation quality execution optimisation (16 October 2026 — merged PR #638)

The previous full Foundation quality job ran unit/static/build checks, then all phone, tablet and desktop Playwright projects sequentially, using two browser workers. Exact-head PR #637 CI run 38866205296 took approximately 17m28s for Foundation quality; browser regression took approximately 15m18s (648 passed, 332 skipped, 1 flaky). Database/RLS assurance finished independently in approximately 2m39s. A previous run (38770327258) failed two browser assertions, reinforcing the need to retain visual/accessibility failure evidence.

The merged workflow splits the unchanged full Playwright regression across three parallel jobs (one per existing viewport project). Static, unit and build assurance also runs concurrently. Each browser project retains the existing automatic single retry and failure artifacts. The existing required **Foundation quality** job name remains, implemented as a fail-closed aggregator that succeeds only if assurance-plan, static/unit/build and the complete browser matrix all succeeded. Database, RLS and protected-service assurance remains a separate required job. No browser tests or required checks are removed.

The workflow cancels superseded pull-request runs for the same PR, without cancelling main-branch push runs. npm caching is enabled on new test jobs. PR #638 exact-head CI run 38870291231 completed successfully in ~6m33s, compared with ~17m28s for the earlier serial Foundation job; one tablet visual assertion passed on retry. This is one observed comparison, not an assured typical time. Release run 38871877134 then passed lineage, backend, build, production smoke and durable `revision/path-to-live = success`.

**PR #638 boundary:** the merged optimisation did not enable selective execution; Home/Plan core decisions remain High risk. Selective scope is proposed only through the narrow eligibility rules above; learner code and shared dependencies stay on full assurance.

**Acceptance:** before merge, demonstrate successful exact-head Revision CI, all three Playwright projects, static/unit/build, DB/RLS, exact required status names, and correct fail-closed aggregator semantics. Preserve protected merge status `Foundation quality` and Founder approval rules. Record observed duration and any observed flaky baseline. The canonical production learner route remains `/revision/app/`; this infrastructure-only PR does not modify the deployed learner runtime or any learner-facing route.
