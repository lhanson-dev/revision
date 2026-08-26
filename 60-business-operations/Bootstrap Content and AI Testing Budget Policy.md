---
title: "Revision Bootstrap Content and AI Testing Budget Policy"
document_id: "revision-bootstrap-content-ai-testing-budget-policy"
document_type: "domain-authority"
authority: "business-operations"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-26"
last_reviewed: "2026-08-26"
review_cadence: "after each live Content Factory pilot and monthly during pre-launch testing"
content_review_status: "reviewed"
source_of_truth_for: ["bootstrap Content Factory budget", "pre-launch AI testing spend", "quality-first content cost trade-offs"]
depends_on: ["Educational Content Source Licensing and Provenance Standard", "Content Factory v2 Expert Review Ready Amendment", "AI Cost and Allowance Policy", "AI Agent Constitution"]
supersedes: null
---
# Bootstrap Content and AI Testing Budget Policy

## Purpose

Define the Founder-approved bootstrap budget strategy for producing Revision course content and testing AI-enabled learner experiences before commercial scale.

This policy exists to preserve three things at the same time:

1. **excellent educational quality**;
2. **legally admissible, traceable source use**; and
3. **disciplined bootstrap economics**.

Budget pressure must never become a reason to weaken source-rights controls, educational assurance, assessment integrity or qualified human review.

## Founder decision

Founder direction on 26 August 2026:

> Revision must create absolutely high-quality content that has been legally sourced and created, while doing so on a bootstrap budget.

The operating rule is therefore:

**quality and legal admissibility are hard constraints; cost is optimised inside those constraints.**

If the governed quality or source-rights threshold cannot be met inside a current budget ceiling, the system must stop and escalate the cost/route/scope decision. It must not silently lower quality, ingest questionable source material, remove required assurance or publish weaker content.

## Priority order

When cost, speed and quality compete, use this order:

1. lawful source rights and provenance;
2. factual/curriculum/assessment correctness;
3. educational usefulness and clarity;
4. independent assurance and qualified expert credibility;
5. efficient model/provider routing and automation;
6. speed and raw content volume.

This is a bootstrap strategy, not a lowest-cost-content strategy.

## Initial pre-launch planning envelopes

These figures are **bootstrap planning controls**, not permanent economics, customer-facing limits or guarantees. They must be replaced or refined using measured evidence from real pilots.

### Content Factory live pilot

For the first real single-course Content Factory pilot:

- expected AI inference spend target: **US$10–15 or less per complete course run**;
- hard automated per-run AI spend ceiling: **US$20**;
- initial OpenAI/API account planning envelope: **US$50 per month** during the first pilot/tuning cycle;
- no automatic spend increase solely to force a failed run to completion.

A run approaching its ceiling must stop safely and preserve evidence showing which workers, retries, context sizes or model routes consumed the budget.

### Founder / family pre-launch learner testing

For deliberate pre-launch testing by the Founder and a small family/test cohort:

- working AI inference allowance: **US$5–10 per month** for routine testing;
- initial hard test-spend ceiling: **US$20 per month** unless a specific governed test requires more;
- non-AI product testing should remain effectively outside this inference allowance where no model call is required.

These test envelopes are deliberately more generous per tester than eventual average production learner economics because pre-launch testers will repeat flows, probe edge cases and exercise features unnaturally heavily.

### Qualified expert review

Qualified human review remains a separate assurance cost and must not be removed to make AI generation appear cheap.

For bootstrap financial planning only, reserve approximately **£200 per course** for initial qualified expert review until real reviewer quotes and measured review effort establish a better planning baseline.

This £200 figure is a provisional reserve, not a fixed supplier rate, procurement commitment or assertion of market price.

## What these budgets include and exclude

### Content-production AI budget includes

- model calls that compile reusable subject/knowledge structures;
- Learn and Practice generation;
- assessment design and Revision-owned question generation;
- Marking Pack generation;
- independent model-based educational/assessment review;
- bounded retries and permitted targeted remediation.

### It excludes

- qualified human expert review;
- hosting, Supabase and other base infrastructure;
- payment fees/tax;
- Founder/employee time;
- legal advice where a source-rights question needs professional clearance;
- future learner-facing REV inference cost.

Content-production cost and learner-serving AI cost must remain separately measurable. A cheap learner interaction must not hide an expensive content-production process, and vice versa.

## Cost-control strategy

Revision should reduce content-production cost in this order:

1. deterministic code for deterministic work;
2. smallest lawful/relevant structured context needed for each worker;
3. reuse of precomputed Course Knowledge Models, Assessment Blueprints, Question Families and Marking Pack structures where valid;
4. route routine work to the least-expensive model/provider proven to meet the required quality threshold;
5. reserve stronger/more expensive reasoning for stages where it materially improves correctness or assurance;
6. bounded retries with explicit retry causes;
7. targeted remediation rather than regenerating whole courses;
8. safe caching/reuse where source rights, privacy and provider terms permit it.

Cost reduction must never be achieved by:

- passing REFERENCE_ONLY/PROHIBITED/UNKNOWN source text to a model;
- skipping required source-rights classification;
- reducing educational scope below the governed course requirement without an explicit scope decision;
- weakening deterministic validation;
- letting the generating model self-certify its own output without fresh-context challenge;
- removing the qualified expert gate where required;
- claiming `expert_review_ready` means expert-approved, benchmark-approved or awarding-body-endorsed.

## Spend ceilings are safety controls, not quality targets

A US$20 per-course ceiling means **stop and inspect**, not "force the whole course to fit at any quality".

If a high-quality run repeatedly cannot complete inside the current ceiling, record:

- actual spend by stage/model/provider;
- token/context size by material worker where available;
- retries and failure causes;
- independent-review/remediation cost;
- whether stronger models materially improved quality;
- which optimisations are available without quality loss.

Then make a governed decision to optimise architecture, change routing, increase the planning envelope or reconsider scope. Do not silently compromise the educational product.

## Evidence required after the first live course

The first real course pilot should report at minimum:

- exact course and content head;
- final factory state;
- whether `expert_review_ready` was reached;
- provider/model route per worker class;
- input/output usage and observed cost where the provider exposes it;
- total AI generation cost;
- independent-review cost;
- remediation cost, if any;
- retry count and causes;
- source-rights interventions;
- other human interventions;
- material/blocking independent-review findings;
- package completeness;
- qualified expert findings once reviewed.

Use this evidence to replace estimates with measured course economics before batch scaling.

## Relationship to learner AI economics

`AI Cost and Allowance Policy.md` remains the authority for eventual Free/Paid/Premium average learner AI cost envelopes. Those commercial learner envelopes are intentionally separate from this pre-launch Content Factory/testing policy.

The current approved production planning envelopes remain:

- Free: ≤ £0.10 average variable AI cost per active learner-month;
- Paid: ≤ £0.60;
- Premium: ≤ £1.85.

Pre-launch Founder/family testing may exceed those per-person averages because its purpose is assurance and calibration, not representative customer economics.

## Review trigger

Revisit these bootstrap figures after:

- the first successful live Content Factory course run;
- the first qualified-expert review of a factory-produced course;
- a material model/provider pricing change;
- a material source-licensing/terms change;
- a repeated course-build ceiling breach;
- the start of batch/multi-course production;
- the start of meaningful learner-facing AI testing beyond the small pre-launch cohort.

The permanent principle—**quality and lawful sourcing first, bootstrap cost optimisation inside those constraints**—does not change merely because model prices move.

## Documentation-impact rule

Material changes to the priority order, source-rights/quality protection, bootstrap content-production envelope or pre-launch testing envelope must update this authority through a governed PR.

Measured pilot results belong in durable operational evidence/technical records and should inform later revisions rather than rewriting historical estimates.