# ADR-0013 — One-time release-lineage recovery checkpoint

Status: Draft pending merge
Date: 2026-08-21

## Context

Revision's production release verifier requires a durable exact-head Founder approval marker in the GitHub PR conversation. Several recent PRs reached `main` after explicit Founder approval in the operating workflow but before the agent workflow persisted that marker to GitHub. Their releases therefore failed closed, and the verifier cannot traverse those failed ancestors without inventing retrospective approval evidence.

The current pre-remediation `main` commit is `d960c950f4620dd469888a1174af582524706ec2` from PR #84. Its failed path-to-live status and the surrounding sequence are preserved in `audits/Path-to-Live Assurance Review 2026-08-21.md`.

## Decision

Use the existing configured bootstrap-parent mechanism once to re-establish a prospective governed release chain from the exact pre-remediation `main` commit `d960c950f4620dd469888a1174af582524706ec2`.

PR #85 must still satisfy all current controls for its own exact head: successful required CI, explicit Founder merge approval, the machine-readable approval marker recorded after CI, merge of that same head, backend readiness, production build/deploy and production smoke.

The bootstrap change does **not** assert that PRs #75, #77, #81, #82 or #84 had compliant GitHub approval evidence. It deliberately treats the pre-remediation repository state as a one-time recovery trust root so the corrected process can operate prospectively without fabricating history.

## Guardrail

The bootstrap parent must not be advanced again merely to bypass a future failed governance check. Any future reset requires a new explicit governed recovery decision with recorded rationale and Founder approval.

## Consequences

- PR #85 can restore a clean path to production without falsifying historical approval records.
- Historical failed release statuses remain intact and auditable.
- Once PR #85 reaches `revision/path-to-live = success`, future releases chain from a successfully governed production commit under the corrected approval workflow.
