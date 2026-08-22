# FI-007 — Layer 0 Provider Evaluation Shortlist

**Document type:** non-authoritative feasibility-analysis proposal  
**Status:** Proposed / under `Analyse`  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Evidence date:** 2026-08-22

## Purpose

Define the smallest useful provider/model shortlist for the 7131 Paper 2 Layer-0 evaluation.

This document does not approve a provider or production model. Provider capability, pricing, privacy terms and availability change over time and must be revalidated before implementation/release.

## Evaluation principle

The Layer-0 benchmark should answer two separate questions:

1. what quality ceiling can a strong current model achieve on the governed 7131 marking contract?; and
2. can a materially cheaper routine route achieve the same required learner trust bar, with selective escalation where necessary?

Do not choose a provider from general benchmark reputation or price alone.

---

## Proposed shortlist

### OpenAI GPT-5.6 Luna — low-cost primary candidate

**Role in evaluation:** cost-efficient routine marker hypothesis.

Current published standard short-context API pricing checked 2026-08-22:

- input: **$0.20 / 1M tokens**;
- cached input: **$0.02 / 1M tokens**;
- output: **$1.20 / 1M tokens**.

Why test it:

- very low marginal cost;
- current GPT-5.6 family structured reasoning capability;
- large context window; and
- prompt caching may make stable marking-pack context particularly economical.

Failure rule: if educational reliability or confidence calibration is materially worse than the stronger routes, cost cannot justify its use as primary marker.

### OpenAI GPT-5.6 Terra — balanced candidate

**Role in evaluation:** potential routine marker if Luna is too weak; possible selective escalation tier.

Current published standard short-context API pricing checked 2026-08-22:

- input: **$2.00 / 1M tokens**;
- cached input: **$0.20 / 1M tokens**;
- output: **$12.00 / 1M tokens**.

Why test it:

- provides a middle point between very cheap Luna and frontier Sol;
- may reduce arbitration frequency if it is materially more reliable than Luna; and
- helps determine whether the cost/performance curve has a useful middle tier.

### OpenAI GPT-5.6 Sol — strong baseline / arbitration candidate

**Role in evaluation:** quality ceiling and potential independent stronger arbitration route.

Current published standard short-context API pricing checked 2026-08-22:

- input: **$5.00 / 1M tokens**;
- cached input: **$0.50 / 1M tokens**;
- output: **$30.00 / 1M tokens**.

Why test it:

- establishes whether the bounded marking task is solvable at the current OpenAI frontier;
- provides a comparator for judging whether cheaper routes lose educational reliability; and
- may be appropriate only for low-confidence, boundary or `Check this mark` cases if cheaper routes pass normal cases.

### Anthropic Claude Sonnet 5 — independent vendor comparison

**Role in evaluation:** credible non-OpenAI comparison and possible strong primary/arbitrator alternative.

Current published API pricing checked 2026-08-22:

- introductory through 2026-08-31: **$2 / 1M input, $10 / 1M output**;
- standard thereafter: **$3 / 1M input, $15 / 1M output**.

Why test it:

- avoids concluding that the best OpenAI-family configuration is automatically the best market configuration;
- provides vendor-portability evidence; and
- may offer a different reliability/cost profile on qualitative marking.

Use the post-introductory standard rate for commercial sustainability modelling unless a lower rate is contractually durable.

---

## Privacy/data-processing screening

Before real learner answers are sent to any provider, the implementation design must confirm the provider route against Revision's privacy authority and current commercial terms.

### Current OpenAI API position checked 2026-08-22

- API/business inputs and outputs are not used for model training by default unless the customer explicitly opts in;
- standard API retention can be up to approximately 30 days depending on endpoint/controls;
- qualifying organizations may be able to use Zero Data Retention / stronger retention controls.

### Current Anthropic API position checked 2026-08-22

- commercial API inputs/outputs are not used for model training by default unless the customer opts into an applicable programme/feedback use;
- standard API inputs/outputs are normally deleted from backend systems within 30 days, subject to documented exceptions;
- qualifying customers may have zero-data-retention arrangements for eligible products/routes.

### Revision-side minimisation rule

Even where provider terms are acceptable:

- do not send learner name, email, account identifiers or unnecessary profile data with a marking request;
- use opaque attempt/request identifiers;
- send only the academic context required to mark the answer;
- keep provider/model metadata in Revision's own evidence record; and
- treat retention/data-region/ZDR decisions as implementation/privacy controls, not prompt details.

---

## Comparable evaluation configuration

All providers/models should receive materially equivalent academic information and output requirements.

Do not deliberately give one provider a richer mark scheme, more case context or an easier output schema.

For each run record:

- provider;
- exact model identifier/version or dated alias;
- reasoning/effort setting where configurable;
- temperature/sampling controls where applicable;
- prompt/marking-contract version;
- marking-pack version;
- input/output/cached usage;
- total model calls;
- latency;
- provider-reported request ID where available; and
- calculated cost using the price in force for that run.

## Initial Layer-0 comparison

Recommended order:

1. **Sol** on the calibration set to establish the strong baseline;
2. **Luna** on the same cases;
3. **Terra** where Luna materially underperforms or where the cost/performance middle point needs resolving;
4. **Sonnet 5** on the same stratified set as independent vendor check;
5. test routed combinations only after individual-route behaviour is understood.

Do not conceal model identities during engineering analysis; the purpose is to select architecture. Human feedback reviewers may be blinded to model identity where that improves usefulness-rating independence.

---

## Provider selection gate after Layer 0

Return one of:

### `PRIMARY CANDIDATE`
A route is credible for Stage A as the routine marker.

### `ARBITRATOR ONLY`
A route is too expensive or slow for routine use but materially improves difficult-case reliability.

### `REJECT`
The route fails quality, privacy, operational, output-contract or economic requirements.

More than one candidate may proceed to Stage A if Layer-0 evidence does not clearly separate them.

## Documentation impact

This is non-authoritative market/feasibility analysis. No provider/model is approved.

Any provider/model selected for production must be reflected in the appropriate technical architecture, privacy/security controls, operational documentation and ADR/governance record required by the repository operating model. Pricing and provider terms must be revalidated at that decision point.
