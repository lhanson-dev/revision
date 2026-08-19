# Risk-Based Assurance Plan Implementation

**Status:** In review on PR #67. Normative policy remains `50-engineering-standards/Testing & Assurance Standard.md` and `50-engineering-standards/Release & Deployment Standard.md`.

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
