# Founder Delivery Notifications

**Status:** implementation candidate  
**Date:** 2026-09-05  
**Authority:** `50-engineering-standards/Release & Deployment Standard.md`, `70-ai-operating-system/AI Agent Constitution.md`, `80-company-workflows/Governed Implementation Workflow.md`  
**Related control:** `docs/technical/Founder Approval Gate.md`

## Purpose

Remove repeated manual `Check` / `Status` polling from the Founder delivery loop without weakening the explicit Founder merge gate.

The repository already requires event-driven CI/CD, explicit Founder approval for every merge, truthful reporting of external waits, current-`main` integration, and continuous improvement when repeated manual steps create avoidable delivery delay. This implementation uses those existing rules; it does not create a new approval authority or change who may merge.

## Operational model

`.github/workflows/founder-delivery-notifications.yml` listens to completed trusted workflow runs for:

- `Revision CI`; and
- `Deploy Revision to Pages`.

The workflow checks out only trusted `main` code and runs `scripts/assurance/founder-delivery-notifications.mjs`.

There is no timer, scheduled polling job or AI/model call.

### 1. PR ready for Founder decision

When the latest exact-head pull-request `Revision CI` run succeeds, that run was based on the current `main`, and no valid exact-head Founder approval evidence already follows that CI run, the workflow posts one durable PR comment containing:

- `@lhanson-dev` so normal GitHub notification settings can surface the event;
- the PR number and title;
- the exact PR head;
- the successful CI run;
- the next ChatGPT action: `Approve merge PR #X`; and
- an explicit statement that the notification is informational and does not itself approve or merge anything.

The durable marker is:

`revision-founder-action:v1 head_sha=<exact-head>`

A stale CI run cannot create an approval-ready notification after a newer exact-head CI run exists.

### 2. Current-main integration refresh needed

If the PR head still matches the CI run but that CI run was based on an older `main`, the workflow does **not** ask for Founder approval.

It posts a durable integration-attention comment showing:

- the exact PR head;
- the CI base SHA;
- the current `main` SHA; and
- `Check PR #X` as the next ChatGPT action.

The executing agent can then perform the governed mechanical refresh/revalidation. This preserves the existing rule that approval is requested only for a candidate validated with current `main`.

### 3. PR assurance blocked

When the latest exact-head `Revision CI` run does not succeed, the workflow posts one durable attention comment with the failed run and the next ChatGPT action `Check PR #X`.

The durable marker includes both the exact head and run id so a later genuinely new failed attempt can be reported without duplicating the same event.

No merge approval is requested while assurance is not green.

### 4. Production verified

When `Deploy Revision to Pages` completes for an exact merge commit and both:

- the production workflow concludes successfully; and
- `revision/path-to-live = success` exists on that exact merge commit,

the workflow posts a durable notification on the merged PR stating that production is verified and the workstream is ready to continue.

This is the signal that replaces repeated manual polling after merge.

The notification does not create a new approval. A later PR still requires its own explicit Founder approval.

### 5. Production blocked

If the production workflow fails or the exact merge commit does not have `revision/path-to-live = success`, the workflow posts an attention notification with the production run and `Check PR #X` as the next ChatGPT action.

## Duplicate and stale-event protection

The coordinator fails closed against stale or duplicate signals:

- PR notifications require the workflow run head to equal the current PR head;
- approval-ready / CI-blocked notifications require the triggering CI run to still be the latest exact-head Revision CI run;
- approval-ready notification additionally requires the CI run base SHA to equal current `main`;
- production notifications require an exact merged PR whose `merge_commit_sha` equals the production run head;
- production success requires the separate durable `revision/path-to-live` status;
- prior durable notification markers suppress duplicate comments for the same event.

## Security boundary

`workflow_run` is used deliberately because it executes the trusted default-branch coordinator after another workflow finishes. The coordinator does not execute code from the PR head.

Permissions are limited to:

- Actions read;
- repository contents read;
- pull-request read;
- commit-status read; and
- Issues write solely so the GitHub Actions identity can post the durable PR notification.

The notification comment cannot satisfy `revision/founder-approval`. The approval gate still requires the exact machine-readable marker created for the Founder after explicit approval, and repository merge-boundary enforcement remains unchanged.

## ChatGPT boundary

This implementation does not claim that ChatGPT itself wakes up, runs in the background or sends a spontaneous ChatGPT reply.

GitHub is the real asynchronous mechanism. Its workflow posts the durable PR notification and mentions the Founder. Whether that mention also appears as push, email or another GitHub notification surface depends on the Founder's GitHub notification settings.

The intended Founder experience becomes:

`machine work runs → GitHub says a decision/continuation is ready → Founder returns to ChatGPT only when needed`

rather than:

`Check → wait → Check → wait → Check`.

## Machine continuation boundary

Existing encoded GitHub jobs continue automatically inside their governed workflows and after merge. This notification coordinator does not invent arbitrary next work or dynamically execute an unapproved workflow.

A future workstream-specific workflow may automatically trigger a further machine-only stage when its preconditions and authority are already explicit. Any new human decision, scope change, merge or approval gate must still stop for the relevant human action.

## Assurance

Regression tests cover:

- green exact-head CI on current `main` producing one approval-ready notification;
- suppression of stale older CI runs;
- current-`main` movement producing integration attention rather than an approval request;
- suppression when valid post-CI Founder evidence already exists;
- failed CI producing attention rather than approval language;
- exact production success producing a ready-to-continue notification;
- production failure producing attention; and
- duplicate marker suppression.

## Documentation impact

No new ADR or normative authority change is required. The implementation operationalises existing Release & Deployment Standard requirements to favour automation, shorter feedback loops and reduced avoidable manual steps while preserving current-main integration, the existing Founder gate and AI Agent Constitution boundaries.

There is no learner-facing product change.
