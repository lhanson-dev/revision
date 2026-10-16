# Risk-Based Assurance Plan Implementation

**Status:** Active on `main`; full desktop browser sharding proposed in the current CI maintenance PR. Normative policy remains `50-engineering-standards/Testing & Assurance Standard.md` and `50-engineering-standards/Release & Deployment Standard.md`.

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

The mainline baseline uses `selectionMode: conservative-full`.

The classifier declares the minimum assurance implied by risk. Before the bounded docs-only change is merged, it **does not skip any existing CI suite**. `Foundation quality` and `Database, RLS and protected service assurance` both remain mandatory after the plan job succeeds.

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

## Foundation quality execution optimisation (16 October 2026 — merged PR #638)

The previous full Foundation quality job ran unit/static/build checks, then all phone, tablet and desktop Playwright projects sequentially, using two browser workers. Exact-head PR #637 CI run 38866205296 took approximately 17m28s for Foundation quality; browser regression took approximately 15m18s (648 passed, 332 skipped, 1 flaky). Database/RLS assurance finished independently in approximately 2m39s. A previous run (38770327258) failed two browser assertions, reinforcing the need to retain visual/accessibility failure evidence.

The merged workflow splits the unchanged full Playwright regression across three parallel jobs (one per existing viewport project). Static, unit and build assurance also runs concurrently. Each browser project retains the existing automatic single retry and failure artifacts. The existing required **Foundation quality** job name remains, implemented as a fail-closed aggregator that succeeds only if assurance-plan, static/unit/build and the complete browser matrix all succeeded. Database, RLS and protected-service assurance remains a separate required job. No browser tests or required checks are removed.

The workflow cancels superseded pull-request runs for the same PR, without cancelling main-branch push runs. npm caching is enabled on new test jobs. Timing and flakiness must be remeasured using multiple exact-head GitHub Actions runs; the estimated 8–10-minute full CI duration is not an observed result.

**Test-selection boundary of PR #638:** this work did **not** enable selective execution or scheduled replacement testing. The active classifier remains `conservative-full`; it is hardened so central Home/Plan recommendation paths are classified High risk rather than Medium. Selective execution requires a separate, evidence-based coverage mapping and demonstration that changed critical/shared journeys trigger all required tests, with fallback to full assurance on uncertainty. A nightly full run cannot replace mandatory high-risk pre-merge checks.

**PR #638 acceptance:** exact-head Revision CI passed with all three Playwright projects, static/unit/build, DB/RLS and a green fail-closed Foundation quality aggregator. One timed-exam visual assertion passed on retry. The 6m33s run was a first observation, not an assured future duration. Preserve protected merge status `Foundation quality` and Founder approval rules. Record observed duration and any observed flaky baseline. The canonical production learner route remains `/revision/app/`; this infrastructure-only PR does not modify the deployed learner runtime or any learner-facing route.

## Bounded documentation-only selection (16 October 2026 — merged PR #640)

This narrowly controlled first selector enables `docs-only` **only** if the complete diff, between the exact configured base and head commits, contains one or more changed paths, every path ends in `.md` or `.mdx`, **and every path belongs to an explicit documentation/governance allowlist**: root `README.md`/`INDEX.md`/agent and knowledge instructions, numbered governance folders, `docs/`, `decisions/`, `audits/`, `research/` or `archive/`. Markdown under `src/`, `content/`, `public/`, `tests/`, `.github/` and unclassified locations does **not** qualify, because it could influence runtime, learner content or test fixtures. An empty/unknown diff, any executable change, even mixed Markdown and code, any CI change, configuration change or shared planner change retains `conservative-full`.

For a docs-only diff:

- The assurance-plan and repository secret scanner always run; the risk classification, selected mode, base/head SHA and reasons are kept in the CI artifact and summary.
- The static/unit/build and three responsive browser projects are explicitly skipped by GitHub Actions conditions.
- The **Foundation quality** aggregate retains its required check name and succeeds only with an affirmative docs-only decision plus the expected skipped-code/browser results, or with all suites succeeding on a non-docs change; an unknown/failed assurance plan always fails closed.
- The existing **Database, RLS and protected service assurance** job always runs and remains a separate required check in this first rollout. The production deployment/release-lineage workflow, post-deployment smoke and Founder approval status are unchanged.

PR #640 does **not** selectively skip tests for TypeScript/CSS/UI/educational content, and does **not** create a nightly-only substitute for a required PR test. Medium-risk targeting requires verified dependency-to-journey mapping, responsive/accessibility coverage, and an independently demonstrated conservative fallback before replacing full regression on executable changes.

The documented baseline of PR #638 remains one observed ~6m33s high-risk run. Documentation-only savings are not yet measured; the always-on database assurance sets a floor until an independent gated change safely optimises it.

**Documentation impact:** existing numbered Testing & Assurance and Release & Deployment Standards already authorize this proportionate docs-only selection. This is a technical implementation change, not a new product policy. Maintain PTL-04 in the Assurance Coverage Register when merged. The canonical learner runtime and route remain React/Vite `/revision/app/`; no learner product surface is changed.

## Learn-local presentation journey selection (16 October 2026 — merged PR #641)

This first **executable-code** selector is intentionally limited to an explicit allowlist of 14 Learn presentation paths under `src/app/ui/learn/`, e.g. LearnBlock, LearnPageLayout, chart geometry and local layout calculation. These specific source paths may be selected together with approved documentation files only. At least one allowed Learn source file must change, the complete diff must contain no other files, and the highest applicable classifier risk must remain Level 2 / Medium.

The selected responsive browser coverage is an **exact** 17-spec allowlist, covering Learn blocks, Learn active-trail/course navigation, course presentation and dark theme, accessibility, responsive layout, horizontal overflow, design consistency, site theme, overlays, contextual navigation and approved interface visual contracts. All chosen files run under the existing phone/tablet/desktop Playwright projects, respecting their declared skips. Full typecheck, lint, the entire existing Vitest suite, production build, existing content provenance/schema checks, secret scan and real database/RLS/Edge assurance still run for these changes. The `Foundation quality` required aggregator still rejects any failed or missing required job; the trusted Founder approval status and production-lineage checks are unchanged.

The mapping is both human-reviewable (`learnTargetedSourceFiles` and `learnTargetedBrowserSpecs` in `change-classifier.mjs`) and executable. The CI-generated plan records `selectionMode: learn-targeted` and its exact `selectedBrowserSpecs`. The browser runner accepts only the exact complete declared set on one of the three supported viewport projects, validates every file exists and passes explicit argument arrays to Playwright (no shell-evaluated test names). Unknown mode, incomplete selection or unrecognised project fails closed.

**Escalation:** changes in shared `src/app/ui/` outside this exact list, any test/fixture/schema/config/lockfile, Learn barrel/index or type contract, any navigation/Planner/Home/evidence/auth/persistence/exam/Practice source, new Learn component not yet registered, mixed unexpected Markdown or any unknown path must still run `conservative-full`. A future new Learner test or critical dependency must trigger mapping review during the same governed change; the explicit list is not a general wildcard for any `learn/` source.

**PR #641 verification:** its exact-head CI classified High, executed full responsive regression and passed (1,401 unit tests; phone 173, tablet 166 and desktop 301 browser tests; database/security and required Foundation quality passed). The complete allowlist and fail-closed runner were unit-tested. A subsequent actual PR containing only mapped Learn source is still needed to establish the narrower GitHub Actions path and its observed runtime; treat medium-risk savings as **unverified** until measured. Do not enable generic or other-domain medium-risk selection from this proof alone.

This is implementation of the existing risk-proportionate assurance authority, not a normative change. Document control PTL-04 in the Assurance Coverage Register has a linked implementation candidate. Canonical learner React/Vite runtime and `/revision/app/` route remain unchanged; no learner interface code is modified by this PR.

## Bounded Practice presentation journey selection (16 October 2026 — merged PR #642)

The candidate adds `practice-targeted` selection exclusively for four explicit Practice presentation sources: `PracticeActivityWorkspace.tsx`, `PracticeFlashcard.tsx`, `PracticeStart.tsx` and `PracticeSummary.tsx` under `src/app/ui/practice/`. These components receive callbacks from the scored learning/evidence engine rather than owning persistence and scoring contracts. A qualifying change must touch at least one allowed Practice presentation file and **no changed files outside that list except approved governance/documentation Markdown**, and must remain Level 2 / Medium overall.

The candidate executes an immutable, precisely enumerated 25-file responsive Playwright set on the existing phone, tablet and desktop projects. The tests cover Practice start, flashcards and feedback, calculations and written-question routes, completion, visual layouts, planned/accepted sessions, returned Home, evidence-boundary regression, course navigation, accessibility, cross-journey learner styles, visual contracts, contrast, overflow, theme and overlays. The complete unit test suite, TypeScript, lint, production build, subject/content provenance checks, assurance-plan/secret scan and independent database/RLS/protected-service assurance still run. The protected `Foundation quality` aggregate stays fail-closed with the new explicitly recognised mode. GitHub Founder approval and production lineage/smoke remain unchanged.

The following changes **must never use this shortcut** without a separate governed expansion: `PracticeQuestion.tsx` (choice/confidence/scored interaction), `PracticeWrittenQuestion.tsx` (REV marking/challenges), `practice.css` (cross-surface styling), `index.ts` barrel/shared contracts, scoring/evidence/learning-engine/progress/planner/Home/auth/persistence services, shared UI controls, question/content schema or packs, test files/fixtures, CI/build/configuration, new or unknown Practice modules, mixed Learn/Practice changes or any unclassified file. These retain `conservative-full` and require the existing full browser suite.

`practiceTargetedSourceFiles` and `practiceTargetedBrowserSpecs` are declared in the classifier, written into the machine-readable plan and checked by `run-browser-tests.mjs` against the exact full list. Runner tests reject missing/extra/unrelated files and unknown project/mode; classifier tests verify every selected source and negative high-risk/mixed cases. **PR #642 completed full exact-head CI and deployed successfully** (1,405 unit tests, full phone/tablet/desktop Playwright, database/RLS/Edge and green production smoke). A later genuine Practice-only PR is still needed to measure savings under an actual `practice-targeted` workflow run. Do not interpret unit selection tests as observed live shortcut timing.

**Documentation impact:** This expands the technical implementation of the existing active Testing & Assurance and Release & Deployment Standards; no normative product decision changes. Update Assurance Coverage Register PTL-04 in this PR and append observations after release without rewriting historical audit evidence. The learner product remains React/Vite under `/revision/app/`; this PR does not alter application runtime or student-facing features.

## Complete desktop regression split into parallel Playwright shards (16 October 2026 — proposed CI PR)

The full desktop browser project was the longest remaining Foundation quality lane on PR #642: 301 browser tests passed, 21 skipped; the desktop run reported **7.7 minutes**. The static/unit/build and phone/tablet lanes finished earlier. This proposal preserves all test names and all required checks while enabling GitHub to run desktop regression on two disjoint Playwright shards.

- The static, checked-in workflow matrix runs `phone 1/1`, `tablet 1/1`, `desktop 1/2` and `desktop 2/2`, using Playwright's `--shard=1/2` and `--shard=2/2` on the existing `fullyParallel: true` desktop project. The two desktop job executions together cover the same desktop test inventory as the original single desktop job. Neither shard is an optional test sample or a replacement for coverage.
- The existing `run-browser-tests.mjs` runner validates the project/shard combinations and still enforces the exact approved file lists for `learn-targeted` and `practice-targeted` modes. Invalid, missing and unrecognised shards fail closed; phone/tablet remain unsharded.
- Unique run/project/shard visual artifact names prevent the two desktop jobs from uploading to the same evidence location. No screenshots or approved visual baselines are changed.
- `Foundation quality` remains the required branch-protection check and depends on the entire responsive matrix; one failed, cancelled or absent expected shard prevents the matrix from succeeding. A dedicated Vitest workflow contract asserts the complete four-entry matrix, Playwright fully parallel execution, unique artifact names and the existing required aggregate check.
- Assurance-plan/secret scanning, all unit tests, TypeScript/lint/build, database/RLS/Edge/protected-service integration and post-merge release lineage, backend readiness and production smoke continue unchanged.

**Acceptance:** Since this PR changes CI tooling, it must classify High and complete exact-head full CI itself, showing both desktop shards and the unchanged phone/tablet suites green. The logged per-shard Playwright test totals should sum to the previous full desktop inventory, with omissions/duplicates investigated before approval. Compare elapsed CI time to the PR #642 baseline; timing varies with GitHub runner availability, so one successful run is an observation rather than an assured speed guarantee.

**Documentation impact:** the active Testing & Assurance and Release & Deployment Standards already require risk-proportionate, complete high-risk regression; this changes only execution topology. Technical implementation documentation and PTL-04 assurance register update with the governed PR. The canonical learner React/Vite runtime and `/revision/app/` route are unchanged. No student experience or product authority changes.

## Screenshot and starting-check state-readiness correction (16 October 2026 — QA candidate, issue #644)

The full CI optimisations of PRs #638/#640/#641/#642/#643 exposed previously intermittent browser test failures without any corresponding student-facing code change. In particular, the original PR #643 CI run #38916555060 failed an approved desktop Plan light SHA-256 screenshot comparison on both Playwright attempts, then passed during a failed-jobs-only rerun. Following merge, main CI #38923977578 failed the approved phone onboarding dark visual hash on both attempts and passed when only failed jobs were rerun. R1-11 starting-check progression has also been intermittent, including a Playwright retry on PR #643. These observations are tracked in issue #644; reruns are evidence of intermittent behaviour, **not** proof that failures are harmless.

A source review identified specific test-state race conditions:

- **Plan capture:** the test previously required only the global `.loading-shell` to disappear, but the Plan React route independently loads planner setup/evidence and a saved-session window *after* that point. The test now waits for the real `#plan-page-title`, `.pln-nav` and `.pln-summary` UI and both Plan-specific loading messages to disappear before screenshot capture. It still hashes the **unaltered Founder-approved pixels** and fails if the settled design disagrees.
- **First-use capture:** the heading alone did not guarantee that the selected theme and all three experience cards had mounted. The test now waits for the canonical `data-theme`, three visible choice cards, usable Student action, two Coming soon labels and fonts to finish loading and paint before capture. The approved light/dark screenshot digests and the strict SHA-256 comparison remain untouched.
- **R1-11 starting check:** the test previously clicked each Next action without verifying it was enabled or that a new question had mounted, although another first-use journey already follows this explicit synchronisation. R1-11 now verifies button enablement, clicking, and prompt transition at every non-final question. It still requires five unscored starting observations, zero scored evidence and all later Home/Plan/REV/Progress expectations.

**Acceptance boundary:** CI itself must exercise unchanged approved visual digests and full required browser suites on every viewport. If a newly awaited settled screenshot still differs from its approved hash, **HOLD** for evidence inspection and explicit visual approval of any intentional product difference. Do not re-pin, expand allowed digests, weaken matching thresholds or skip the test. Unit/static/build, independent database/security, Founder approval and release controls remain unchanged. Passing one run or retry is not sufficient to claim all flakiness eliminated; retain issue #644 for repeated-run observation and further root-cause investigation.

**Documentation impact:** This is a test-only assurance stability implementation aligned with the existing Testing & Assurance and Release & Deployment Standards. No normative authority or product implementation changes; canonical learner React/Vite path is `/revision/app/`.
