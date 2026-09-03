# Risk-Based Assurance Plan Implementation

**Status:** Active current implementation. Normative policy remains `50-engineering-standards/Testing & Assurance Standard.md`, `50-engineering-standards/Release & Deployment Standard.md` and, for AI-led independence controls, `50-engineering-standards/AI-Led Development Assurance Standard.md`.

## Purpose

Make Revision's change risk and selected assurance inspectable before the main CI suites run, fail safe when classification is uncertain, and trigger additional assurance only where the classified risk requires it.

## Current implementation

`Revision CI` begins with an **Assurance plan and secret scan** job. It:

1. checks out full Git history for the proposed base/head pair;
2. generates `assurance-plan.json` from the exact change;
3. records risk level, reasons, affected assurance domains and required assurance layers;
4. scans tracked repository text for privileged credential/config patterns;
5. validates structural integrity of declared critical assurance controls;
6. validates the additional PR assurance evidence required for Level 3/4 AI-led changes;
7. uploads the JSON as a 30-day GitHub Actions artifact; and
8. blocks downstream CI if required planning/integrity/evidence checks fail.

The classifier lives in `scripts/assurance/change-classifier.mjs`. The CLI wrapper is `scripts/assurance/generate-assurance-plan.mjs`.

AI-led critical-assurance implementation detail is recorded in `docs/technical/AI-Led Assurance Implementation.md`.

## Risk classification

The classifier implements the highest-applicable-factor rule from the Testing & Assurance Standard.

- Ordinary Markdown-only changes are Level 1 / Low.
- Bounded application changes and non-critical test maintenance are at least Level 2 / Medium.
- CI/deployment, dependencies/build contract, Supabase/database/RLS/Edge boundaries, learner educational content, shared runtime/auth/persistence/evidence/planning changes are Level 3 / High.
- Critical assurance/release-safety implementation under `scripts/assurance/` is Level 3 / High.
- Declared critical RLS, protected-service, persistence and critical-browser assurance files are Level 3 / High when changed.
- `.github/PULL_REQUEST_TEMPLATE.md` is Level 3 because it carries the required high-risk assurance evidence contract.
- Destructive migration signatures such as table/schema/column drops, truncation or delete operations are Level 4 / Critical.
- Unclassified non-documentation changes fail safe to Level 3 / High.
- If changed files cannot be determined, classification fails safe to Level 3 / High.

This prevents a change that weakens the assurance system from being down-classified merely because it is a test or assurance file.

The generated plan includes exact `baseSha` and `headSha`, so the evidence can be tied to the proposed revision.

## Assurance plan schema v2

Schema version 2 retains the existing layers and additionally declares whether the proposed change requires:

- authority-derived assurance contract evidence;
- fresh-context adversarial review;
- test-sensitivity evidence;
- critical-assurance integrity validation; and
- independent security analysis.

The last four high-risk independence controls are governed by the AI-Led Development Assurance Standard.

## Conservative execution mode

The current implementation continues to use `selectionMode: conservative-full` for the pre-existing Revision suites.

The classifier declares the minimum assurance implied by risk, but **does not yet skip the existing Foundation quality or Database/RLS/protected-service jobs**. This remains deliberate while selective execution is separately calibrated.

The new AI-led independence controls are risk-conditional:

- the high-risk PR assurance contract is required only at Level 3/4; and
- independent CodeQL/dependency analysis runs only on Level 3/4 pull requests.

This improves dangerous-change depth without adding the expensive new controls to Level 1/2 work.

Selective execution of the older broad suites may only be introduced through a separate governed change after the classifier has demonstrated reliable boundaries; uncertainty must continue to escalate rather than skip assurance.

## Critical assurance integrity

`scripts/assurance/critical-assurance-manifest.json` and `scripts/assurance/validate-critical-assurance.mjs` protect the currently declared critical assurance assets and explicit CI invocations.

The validator runs in the assurance-plan job and fails if a protected asset disappears, is unexpectedly empty, uses test suppression syntax where applicable, drops a minimum control ID, or loses a required explicit CI invocation.

This is a structural integrity control, not proof of assertion semantics. Semantic weakening is addressed by Level-3 escalation, test-sensitivity evidence and adversarial review.

## High-risk PR evidence

`scripts/assurance/validate-high-risk-pr-evidence.mjs` reads the generated plan plus the GitHub pull-request event.

At Level 3/4 it requires meaningful content under the exact PR sections:

- `Assurance invariants`;
- `Failure and abuse hypotheses`;
- `Adversarial review`; and
- `Test sensitivity`.

At Level 1/2 the validator does not add those requirements.

## Independent security analysis

For Level 3/4 pull requests, `Revision CI` adds an independent job using GitHub Dependency Review and CodeQL. This supplements, rather than replaces, Revision's dynamic database/RLS/protected-service assurance.

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

The scanner is a repository control, not proof that every external secret store or account setting is healthy. Supabase leaked-password protection and repository merge-boundary enforcement remain separate controls.

## Evidence and tests

- classifier unit tests: `scripts/assurance/change-classifier.test.mjs`;
- secret scanner unit tests: `scripts/assurance/scan-secrets.test.mjs`;
- critical-assurance integrity unit tests: `scripts/assurance/validate-critical-assurance.test.mjs`;
- high-risk evidence gate unit tests: `scripts/assurance/validate-high-risk-pr-evidence.test.mjs`;
- live CI artifact: `assurance-plan-<run-id>`; and
- CI run summary exposes risk, reasons, affected domains and required assurance.

## History

The original v1 classifier/plan was introduced through PR #67. Version 1 deliberately retained full existing CI while collecting classification evidence.

The AI-led assurance change of 3 September 2026 advances the plan to schema v2, protects critical assurance implementation as high risk, and adds risk-conditional adversarial/security controls. Historical PR #67 evidence remains historically true; this document records the current implementation rather than rewriting that historical run.

## Documentation impact

Normative rules live in the engineering standards and AI operating system. This document records implementation truth only. `INDEX.md` and the Assurance Coverage Register are updated whenever this implementation changes current source-of-truth relationships or declared controls.
