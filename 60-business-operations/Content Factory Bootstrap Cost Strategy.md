---
title: "Revision Content Factory Bootstrap Cost Strategy"
document_id: "revision-content-factory-bootstrap-cost-strategy"
document_type: "domain-authority"
authority: "business-operations"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-26"
last_reviewed: "2026-08-26"
review_cadence: "after each live course pilot until stable, then quarterly"
content_review_status: "founder-directed"
source_of_truth_for: ["Content Factory bootstrap cost strategy", "course-production AI spend guardrails", "quality-first cost optimisation order", "initial live-pilot budget assumptions"]
depends_on: ["Educational Content Source Licensing and Provenance Standard", "Content Factory v2 Expert Review Ready Amendment", "AI Cost and Allowance Policy", "AI Agent Constitution"]
supersedes: null
---
# Content Factory Bootstrap Cost Strategy

## Purpose

Define how Revision should bootstrap educational content production economically without compromising educational quality, lawful source use, provenance, assessment integrity or qualified-human credibility.

This authority governs **Content Factory production economics**. It is separate from `60-business-operations/AI Cost and Allowance Policy.md`, which governs learner-facing variable AI/REV cost envelopes and deliberately excludes content-production cost.

## Founder principle

Founder direction on 26 August 2026:

> Revision must produce absolutely high-quality educational content that has been legally sourced and independently created, while operating within a bootstrap budget.

Budget pressure must therefore change **how efficiently Revision produces and assures content**, not whether Revision follows source-rights, educational-quality or qualified-review controls.

## Non-negotiable quality and trust floor

Revision must not reduce cost by:

- supplying protected or rights-uncertain material to a generative model;
- treating public accessibility as permission for AI ingestion or commercial reuse;
- weakening the Source Licence Register or fail-closed source-rights gate;
- using lower-quality model routes that have not passed the required quality/assurance threshold for their worker role;
- skipping deterministic assurance, fresh-context independent review or required targeted remediation;
- removing qualified-human review where the Content Factory governance requires benchmark credibility;
- misrepresenting Revision-authored questions, Marking Packs or simulations as official awarding-body material;
- accepting known blocking/material defects merely to keep a run under budget; or
- publishing incomplete or insufficiently assured content because further remediation would cost more.

If a course cannot meet the required quality and trust floor inside the current bootstrap ceiling, the factory should stop and escalate the cost/architecture decision. It must not silently degrade the educational product.

## Bootstrap optimisation order

When reducing Content Factory cost, apply the following order:

1. **Do deterministic work deterministically.** Do not spend model tokens on mechanically provable checks, state transitions, source classification rules, fingerprints, schema validation or exact cross-reference checks.
2. **Reuse governed artifacts.** Reuse Course Knowledge Models, Board Alignment facts, Question Families, Marking Pack templates, validated structured facts and unchanged work units rather than regenerating them.
3. **Send only necessary context.** Prefer compact structured evidence over source dumps or repeated full-course context.
4. **Use the least-cost route that passes quality.** Routine synthesis/generation may use a lower-cost provider/model only after representative output passes the relevant educational, assessment and safety expectations.
5. **Reserve stronger reasoning for higher-risk work.** Independent educational/assessment review, difficult remediation or other high-judgement stages may justify a stronger route where it materially improves defect detection or outcome quality.
6. **Bound output and retries.** Use explicit output limits, bounded retries and fail-closed provider errors.
7. **Target remediation.** Correct the smallest safe affected artifact/dependency set rather than regenerating an entire course.
8. **Measure before scaling.** Use real per-stage provider, token, retry, intervention and cost evidence before increasing concurrency, batch size or budget.

Cost optimisation may never reverse the non-negotiable quality/trust floor above.

## Initial bootstrap planning guardrails

These values are **initial operating guardrails for the live-pilot/calibration period**, not permanent provider commitments, customer prices or forecasts.

### OpenAI/API account working envelope

- Initial working API budget: **US$50 per month** while the first live course and limited Founder/family testing are being calibrated.
- Do not increase this simply because credit is exhausted. First inspect which worker/stage consumed spend and whether the run produced useful quality evidence.

### Content Factory course-production ceiling

- Initial expected AI production range for one complete course: **approximately US$10–15**.
- Initial hard automated ceiling for a single live Content Factory course run: **US$20**.
- The live adapter must stop before deliberately starting another model call when its conservative spend guard indicates the configured course ceiling could be breached.
- A ceiling stop is an operational/cost signal, not permission to publish partial content.

The first real courses must replace these estimates with observed evidence. If high-quality, fully assured output regularly needs more than US$20, Revision should review architecture/model routing and then make a deliberate budget decision rather than degrading quality.

### Founder/family product testing allowance

Once learner-facing AI/REV calls are enabled for controlled product testing:

- working allowance for Founder/family testing: **approximately US$5–10 per month**;
- initial hard testing ceiling: **US$20 per month**.

This deliberate testing allowance is separate from normal learner economics because test users may exercise edge cases, repeat flows and intentionally stress functionality. It does **not** change the approved Free/Paid/Premium average AI/REV cost envelopes in `AI Cost and Allowance Policy.md`.

### Qualified expert review planning reserve

Until Revision has real reviewer quotes and measured review effort, use **approximately £200 per course** as a provisional planning reserve for qualified subject/assessment expert review.

This is a budgeting assumption only. It is not a reviewer rate, procurement commitment, payment approval or claim about market pricing.

The factory should reduce expert effort by delivering a complete, exact-version, well-structured `expert_review_ready` package. It must not reduce expert-review quality simply to fit the provisional reserve.

## Cost categories must remain separate

Founder assurance should distinguish at least:

1. content-production model/provider cost;
2. qualified expert-review cost;
3. learner-facing AI/REV inference cost;
4. deterministic application/infrastructure cost; and
5. other operating costs such as hosting, payments and support.

Do not make Content Factory economics look healthy by mixing one category into another or by using learner AI envelopes to hide content-production spend.

## Live-pilot evidence requirement

For every material live Content Factory pilot, retain where available:

- exact course and course version;
- exact provider/model route by worker stage;
- observed model usage cost by stage and total;
- configured hard course ceiling;
- retry/failure count;
- source-rights interventions;
- other human interventions and reasons;
- automated assurance findings/remediation count;
- whether the course reached `expert_review_ready`;
- qualified-expert findings when later available; and
- known limitations in the cost measurement.

The first successful real-course pilot should trigger an immediate review of the US$10–15 expectation and US$20 course ceiling.

## Scaling rule

Do not infer enterprise-scale affordability from one successful inexpensive run.

Before material batch/concurrency expansion, evidence should cover:

- more than one real course/qualification shape;
- normal and remediation-heavy runs;
- cost distribution rather than only the cheapest example;
- quality outcomes by provider/model route;
- source-rights blocker behaviour;
- independent/expert defect rates; and
- failure/retry tail behaviour.

Scale only when both **quality/trust** and **cost predictability** are demonstrated.

## Change authority

The Founder may revise these bootstrap planning guardrails as real evidence arrives. A material change to the quality-first principle, source-rights floor, expert-assurance requirement or production-spend strategy must be recorded through governed authority and merged through the normal Founder approval gate.

Routine provider/model routing optimisation within these principles does not automatically require a new commercial decision, but any material privacy, rights, educational-quality, architecture or user-experience impact remains subject to its own authority.

## Documentation impact

This policy should be reviewed whenever:

- the first real course reaches `expert_review_ready`;
- provider/model pricing or routing changes materially;
- observed course-production cost materially exceeds the current planning range;
- expert-review cost evidence becomes available;
- a source-rights or quality defect reveals cost pressure influenced an unsafe decision; or
- Content Factory moves from pilot operation into batch-scale production.
