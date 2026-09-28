---
title: "Revision Content Factory Completion-First Cost Control Amendment"
document_id: "revision-content-factory-completion-first-cost-control-amendment"
document_type: "domain-authority-amendment"
authority: "business-operations"
status: "active-on-founder-approved-merge"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-28"
content_review_status: "founder-directed"
amends: ["Content Factory Bootstrap Cost Strategy"]
---
# Content Factory Completion-First Cost Control Amendment

## Purpose

Correct the Content Factory cost-control semantics so bootstrap cost guardrails control and expose spend without turning budget exhaustion into an educational failure or causing already-paid, still-valid work to be discarded and repurchased.

This amendment changes only cost-control and resume semantics. It does **not** weaken educational quality, source-rights, provenance, independent review, exact-course assurance, qualified-expert review or learner-publication gates.

Where this amendment conflicts with `60-business-operations/Content Factory Bootstrap Cost Strategy.md` on a fixed per-run or per-course spend ceiling stopping completion, this amendment governs.

## Founder decision

Founder direction on 28 September 2026:

> Revision must achieve an approved content run efficiently. A cost limit must not make otherwise valid content fail, and repeated assurance must not keep repurchasing unchanged work.

The Content Factory therefore operates on a **completion-first, bounded-resume** model.

## Governing rule

A spend threshold is an **operational cost-control boundary**, not an educational assurance decision.

- Educational/content status may be `PASS`, `CONDITIONAL PASS` where separately permitted, or `FAIL/HOLD` only for the applicable educational, source-rights, identity, provenance, assurance or trust reasons defined by the governing content gates.
- Reaching an execution spend threshold must never by itself create `FAIL/HOLD`.
- Before a new paid provider call would exceed the currently authorised execution slice, the system must persist the current checkpoint and enter a resumable cost-control state such as `cost_paused`.
- Completed, accepted and still-valid work must remain reusable after a cost pause.
- A deliberate resume may open the next bounded execution slice and continue from the exact compatible checkpoint.
- Cumulative course spend must remain visible across all attempts. Resume does not reset or hide spend.
- A changed dependency invalidates only the work that genuinely depends on that change; unrelated valid work is not repurchased.

Actual provider/account exhaustion may physically prevent the next call, but the Content Factory state remains operationally paused rather than educationally failed.

## Relationship to existing bootstrap numbers

The existing bootstrap values remain useful planning and control signals but their completion semantics are amended:

- the approximately **US$10–15** complete-course AI production range remains the current planning expectation;
- the existing **US$20** course value becomes a bounded execution-slice / cost-review threshold, not a terminal lifetime ceiling that can make an otherwise completable course fail;
- the **US$50 monthly API working envelope** remains a bootstrap operating budget and escalation signal, not an educational quality decision;
- reliability-soak budgets remain separately bounded experiments and do not determine whether an exact course is educationally valid.

If cumulative cost materially exceeds the planning range, the system must surface the variance and its cause. The response order remains: verify measurement, eliminate repeated work, reduce unnecessary context/output, improve deterministic ownership and caching, evaluate provider/model routing, then escalate the commercial budget decision if necessary. It must not lower educational quality or discard valid work to make the metric look healthy.

## Durable reuse requirement

Every material paid Content Factory stage that can be safely resumed must use durable checkpoint/reuse semantics appropriate to that stage.

At minimum:

1. exact input/version/fingerprint and worker-contract provenance are retained;
2. successful accepted outputs are reusable while their dependencies remain valid;
3. deterministic validation runs before repurchasing provider work;
4. a cost pause records what has completed, cumulative observed/reserved spend and the exact next work item;
5. resume reuses accepted evidence and executes only genuinely outstanding work; and
6. historical failed/paused attempts remain historical evidence rather than being rewritten.

A workflow design that repeatedly buys the same unchanged assurance because a later call or budget boundary stopped the run is non-compliant with this amendment.

## Assurance efficiency rule

Independent AI assurance remains required where the active educational governance requires it, but it must be scoped to the smallest safe affected dependency set.

Once a content node/work unit has accepted independent evidence, it remains accepted unless a material dependency changes or a later whole-course/integration finding specifically invalidates it. A new reviewer context is not, by itself, a reason to reopen unchanged accepted work.

Whole-course or whole-subject checks must be limited to the integration purpose for which they are required and must not silently become repeated standalone review of every previously accepted unit.

## Provider independence

Content Factory governance is provider-agnostic.

OpenAI, Anthropic/Claude or another provider may perform a governed worker role only after that route satisfies the applicable quality, reliability, privacy, source-rights and structured-contract requirements for the role. Provider identity is retained as provenance, but a provider change must not automatically force repurchase of unrelated accepted artifacts whose semantic inputs and governed dependencies remain valid.

Provider/model routing should use the least-cost route that demonstrably meets the required quality for the worker role. Higher-cost reasoning should be reserved for work where it materially improves the educational or assurance outcome.

## Completion objective

During the first Business controlled trial, optimisation decisions must be judged against the practical objective of reaching one complete, correctly assured AQA A-level Business 7132 course suitable for the governed expert-review and student-testing path.

Cost control exists to make that completion sustainable. It must not create an endless sequence of disposable partial runs.

## Documentation and implementation impact

Implementation must:

- distinguish cost-pause state from educational `FAIL/HOLD`;
- persist and reuse compatible accepted work across cost pauses;
- retain cumulative spend across attempts;
- permit deliberately resumed bounded execution without resetting spend;
- report cumulative spend and repeated-work avoidance;
- keep deterministic checks ahead of paid provider calls; and
- preserve all existing educational/trust gates.

Technical documentation for durable resume/spend and any standalone assurance runner that currently treats a spend ceiling as a terminal failure must be updated in the same governed change.
