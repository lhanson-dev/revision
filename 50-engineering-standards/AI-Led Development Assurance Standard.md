---
title: "AI-Led Development Assurance Standard"
document_id: "revision-ai-led-development-assurance"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.1"
owner: "Founder"
effective_date: "2026-09-03"
last_reviewed: "2026-09-03"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["AI-led development assurance", "assurance independence without routine human code review", "critical assurance integrity"]
depends_on: ["Testing & Assurance Standard", "Security Standard", "Release & Deployment Standard"]
supersedes: null
---
# AI-Led Development Assurance Standard

## Purpose

Define the additional assurance required when Revision is implemented primarily by AI without routine independent human technical code review.

This standard extends, and does not weaken, the Testing & Assurance Standard, Security Standard or Release & Deployment Standard.

## Current operating premise

Revision may be developed and maintained through AI-led implementation. A blanket human line-by-line code-review gate is **not** required for every production change.

Revision currently does not assume that an independent technical expert is available to review each change. That is a known residual operating risk, not evidence that AI self-review is equivalent to independent expert review.

Founder approval remains the human production-authority gate. Founder approval is an informed product/governance decision and must never be represented as technical code review when the Founder has not performed technical code review.

The compensating assurance objective is therefore:

> **No single AI reasoning path may be treated as sufficient evidence that a material implementation is safe and correct.**

Revision must deliberately combine specification-derived tests, deterministic automation, independent tooling, adversarial review and production evidence so that one mistaken implementation interpretation is less likely to validate itself.

## Risk-proportionate application

The existing Level 1–4 risk classification remains authoritative.

### Level 1 — Low

No additional AI-independence ceremony is required beyond the Testing & Assurance Standard. Documentation, copy, isolated visual changes and similarly bounded work should remain fast.

### Level 2 — Medium

Normal targeted unit/integration/browser assurance applies. The implementer should add negative/boundary tests where the changed behaviour warrants them, but a formal high-risk assurance contract is not mandatory.

### Level 3 — High

A high-risk change requires all of the following in addition to the Testing & Assurance Standard:

1. an authority-derived assurance contract;
2. explicit failure/abuse hypotheses;
3. deterministic negative, boundary and recovery assurance appropriate to the changed responsibility;
4. critical-assurance integrity validation;
5. independent automated security/dependency analysis where the repository/platform supports it;
6. a fresh-context adversarial AI review after implementation; and
7. explicit test-sensitivity evidence showing how a plausible incorrect implementation would be detected.

### Level 4 — Critical

Level 4 requires all Level 3 controls plus the broader critical-release assurance already required by the Testing & Assurance Standard. The final Founder merge summary must state the material residual technical risk created by proceeding without an independent human technical reviewer where that risk remains relevant.

Lack of an available human reviewer does not authorise a Level 4 change to reduce or bypass these controls.

## Authority-derived assurance contract

For Level 3 and Level 4 work, the executing agent must derive an assurance contract from current approved authority **before using the completed implementation as the source of truth for what should be tested**.

The contract must identify, as applicable:

- user/product behaviour that must remain true;
- security and authorisation invariants;
- learner/data ownership invariants;
- persistence and reload invariants;
- educational/scoring/readiness invariants;
- failure, retry, duplicate and partial-write behaviour;
- malformed/untrusted input behaviour;
- recovery/rollback expectations;
- important behaviour that must never occur; and
- the relevant critical journey/control IDs from the Assurance Coverage Register.

Tests may evolve as implementation reveals legitimate new risks, but implementation details must not silently redefine the intended invariant.

## Test design expectations

High-risk assurance must go beyond happy-path examples.

Where relevant, tests should deliberately exercise:

- unauthenticated and unauthorised requests;
- cross-user access attempts;
- privilege escalation attempts;
- direct service/API calls that bypass UI visibility;
- malformed, missing, stale and extreme inputs;
- duplicate delivery and idempotency;
- interrupted/partial operations;
- failed writes and reload/recovery;
- ordering/race-sensitive behaviour where credible;
- boundary values around scoring/readiness/allowances;
- preservation of historical learner evidence; and
- separation of planning/context state from educational truth.

Invariant/property-style tests should be preferred when a rule can be stated across a broad input space rather than as a few hand-picked examples.

Automated property-generation libraries may be introduced for domains where they provide material value, but they are not a blanket dependency or mandatory runtime cost for every PR.

## Test-sensitivity evidence

Passing tests do not prove that the tests can detect a wrong implementation.

For Level 3 and Level 4 changes, the PR must record at least one credible defect or mutation that the changed assurance is designed to catch. Evidence may be provided by:

- a targeted negative/fault-injection test;
- a boundary test that would fail under a plausible wrong condition;
- a deliberately changed local implementation used to prove the test fails; or
- an automated mutation-testing tool where that domain has an approved harness.

Automated mutation testing should be introduced progressively for critical deterministic logic such as readiness/scoring, evidence, planning, entitlements, authorisation helpers and billing calculations. It must be targeted by risk; full-repository mutation testing is not a mandatory step on ordinary PRs.

Raw statement/branch coverage remains supplementary diagnostic evidence and is not a substitute for sensitivity evidence.

## Fresh-context adversarial review

After implementation and normal tests are complete, each Level 3/4 change must receive an adversarial review whose task is to assume the change contains a material defect and attempt to find it.

The review should be based on:

- current approved authority;
- the assurance contract;
- the final proposed diff;
- affected architecture/technical documentation; and
- the tests/evidence actually present.

The reviewer should **not** rely on the implementer's rationale as evidence that the design is correct. Where the same AI system/session must perform both implementation and review, it must deliberately re-read the authority and diff from a fresh reviewer posture and avoid using private implementation reasoning as proof.

The review must challenge, where relevant:

- missing authorisation/data-isolation checks;
- failure-open behaviour;
- unsafe database/RLS assumptions;
- privilege or secret exposure;
- persistence/data-loss risks;
- incorrect scoring/readiness semantics;
- race/idempotency/retry behaviour;
- tests that mirror implementation rather than authority;
- missing edge cases;
- over-broad blast radius; and
- rollback/recovery weakness.

Unresolved material findings block merge. The review record must be truthful about residual uncertainty and must not claim independent human review.

## Independent automated analysis

For Level 3/4 pull requests, Revision should use security/supply-chain analysis that is independent of the AI-authored application tests where the hosting platform supports it.

The current target is:

- GitHub CodeQL analysis for JavaScript/TypeScript security findings; and
- GitHub dependency review to block newly introduced high/critical vulnerable dependencies.

These controls supplement rather than replace database/RLS tests, Edge-function authorisation tests, secret scanning or application-level negative tests.

## Critical assurance integrity

Because automated assurance replaces part of the confidence traditionally supplied by human code review, critical tests and release controls are themselves protected assets.

Revision must maintain a machine-readable set of critical assurance files/commands. CI must fail if a declared critical assurance asset:

- disappears;
- becomes empty;
- is marked skipped/todo/only in a way that suppresses normal execution where such syntax applies; or
- is no longer invoked by the canonical Revision CI workflow when explicit invocation is required.

Changes to critical assurance assets, the risk classifier, release-lineage assurance, Founder-approval assurance or CI/deployment workflows are high-risk assurance changes and must not be classified as routine test maintenance.

Static integrity checks cannot prove assertion quality. That remaining risk is addressed by risk escalation, test-sensitivity evidence and adversarial review.

## Speed and selective depth

This standard must not turn every change into a maximum-assurance release.

- Level 1/2 work must not run Level 3/4 adversarial/security ceremony solely because those controls exist.
- Expensive mutation/fuzz/property runs should be targeted to the changed critical domain or run as deeper periodic assurance where appropriate.
- The existing conservative-full CI execution may be reduced only through a separate governed change after selective execution is evidenced as safe.
- Uncertain risk classification fails safe by escalating; it must not skip required assurance to preserve speed.

The target is **higher confidence on dangerous changes and short feedback loops on ordinary changes**.

## Human specialist review

Independent human technical expertise remains valuable, especially for major authentication, payment, security, privacy, destructive migration or foundational architecture changes.

When such expertise becomes available, Revision may use targeted external review or audit rather than requiring routine human approval of every PR.

Until then, the absence of a human reviewer is a declared residual risk to be compensated through this standard. It must never be hidden by describing AI or Founder approval as human technical review.

## Evidence and maintenance

The implementation of these controls is recorded in `docs/technical/AI-Led Assurance Implementation.md` and current coverage is recorded in the Assurance Coverage Register.

Material changes to these assurance boundaries require Founder-approved governance change through a branch/PR. Historical audits and release evidence remain historical and must not be rewritten to imply these controls existed before they were introduced.
