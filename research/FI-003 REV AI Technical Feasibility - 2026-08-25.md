# FI-003 — REV AI Technical Feasibility Study

**Date:** 2026-08-25  
**Feature:** FI-003 — Full REV Intelligent AI Tutor  
**Knowledge class:** Research / feasibility evidence  
**Status:** Exploratory evidence; not product authority and not implementation approval  
**Lifecycle effect:** None. FI-003 remains `To Do` until the governed `Start FI-003` workflow begins active Definition-of-Ready analysis.

## Purpose

Preserve the technical feasibility findings produced from analysis of Revision Genie's publicly described AI implementation and assess how an equivalent or stronger capability could fit Revision's approved product, technical and commercial foundations.

This record is evidence for future FI-003 analysis. It does not approve Azure OpenAI, OpenAI, GPT-4, GPT-5, a particular model, a public usage allowance, a production architecture or implementation work.

## Executive conclusion

A production-grade REV AI capability is technically feasible within Revision's existing architecture without requiring the Founder to become a software developer.

The difficult part is not making an API call to a large language model. The difficult and strategically valuable part is building a trustworthy tutoring system around the model:

`learner state + curriculum grounding + retrieval + deterministic product logic + bounded memory + safety + evaluation + model routing + cost control`

Revision should therefore avoid treating a particular GPT model as the product. The recommended direction is for REV to be the intelligent conversational interface to Revision's evidence-backed learning system rather than making the LLM itself the source of learner truth, planner priority or curriculum authority.

## Competitor architecture lessons

Public Revision Genie material indicates a stack using Azure OpenAI for AI inference, with a wider web/server architecture including Vercel, MongoDB Atlas and Upstash Redis. Their AI approach is described as using learner messages, recent conversational context, relevant curriculum, skill level and limited memory notes rather than simply replaying all learner history.

The key lesson is architectural rather than vendor-specific:

- provide the model with only relevant learner and curriculum context;
- retrieve relevant knowledge instead of attempting to place an entire curriculum into every prompt;
- keep memory bounded and useful;
- apply rate/cost controls;
- add product-specific safeguarding around the model;
- do not assume that using a premium model alone creates a differentiated tutor.

Revision should not copy the competitor's Vercel/MongoDB/Redis stack where Revision already has equivalent capabilities through React, Supabase, PostgreSQL and Edge Functions.

## Azure OpenAI operating model

Azure OpenAI provides OpenAI model families through Microsoft Azure. A product creates an Azure AI/OpenAI resource, deploys one or more model deployments, and makes authenticated server-side requests to those deployments.

For an early Revision product the relevant commercial model is usage-based inference rather than reserved provisioned throughput. Variable cost is driven principally by model route, input/context tokens and output tokens.

Azure is not technically required. Direct OpenAI or another provider could perform the same logical role. Provider selection should therefore be an evaluated engineering/privacy/commercial decision rather than an assumption inherited from a competitor.

## Cost conclusion

The feasibility analysis showed that model choice changes economics dramatically. Large-model-only routing can consume Revision's approved AI cost envelope quickly, whereas smaller capable models can make substantial learner interaction volumes commercially plausible.

Current Revision authority sets average variable AI/REV planning envelopes of:

| Tier | Average monthly AI/REV cost envelope |
|---|---:|
| Free | <= £0.10 per active learner-month |
| Paid | <= £0.60 per active learner-month |
| Premium | <= £1.85 per active learner-month |

The architectural implication is important: Revision should not define `REV = GPT-4` or `REV = one fixed model`. It should route each approved task to the least-cost provider/model route that passes the required educational, safety and reliability evaluation, escalating only where greater capability materially improves the learner outcome.

This validates the existing cost-weighted allowance principle. A learner-facing raw message count should not be invented before representative REV workloads are evaluated.

## Candidate Revision architecture

The strongest current candidate fits the existing stack rather than introducing a parallel backend:

```text
Student
   |
   v
Revision React application
   |
   v
Authenticated REV orchestration boundary
(Supabase Edge Function candidate)
   |
   |-- learner identity / entitlement
   |-- current product/activity context
   |-- structured learner state
   |-- deterministic planner/recommendation evidence
   |-- curriculum/content retrieval
   |-- bounded conversational context / preference memory
   |-- safeguarding and policy controls
   |-- model routing
   |-- token/cost metering
   |
   v
AI provider abstraction
   |
   |-- low-cost/simple route
   |-- routine tutor route
   `-- high-capability/deep route
   |
   v
Azure OpenAI / direct OpenAI / other evaluated provider
```

Supabase Postgres remains the natural system of record for learner state and AI operational data. `pgvector`/vector search is a candidate mechanism for retrieval where semantic retrieval materially helps; it is not an automatic requirement for every content lookup.

## RAG / curriculum grounding

Revision should favour retrieval-augmented generation over attempting to fine-tune a model to memorise every specification.

A representative interaction should assemble only relevant context, for example:

- exact learner course, qualification and exam board;
- exact current topic/activity;
- relevant approved curriculum/content excerpts;
- structured learning evidence and current gaps where appropriate;
- planner/recommendation state where relevant;
- bounded recent conversational context;
- learner preferences that legitimately improve explanation.

The model then generates an explanation or tutoring response from that grounded context.

This has several advantages:

- governed curriculum material remains updateable without retraining a model;
- provenance can be controlled;
- context cost is bounded;
- hallucination risk can be reduced;
- different specifications remain clearly separated.

## Deterministic intelligence versus generative intelligence

Revision should not ask an LLM to decide facts or priorities that Revision already knows deterministically.

Examples:

- planner priority should remain deterministic and testable;
- entitlement state should remain deterministic;
- learner course identity should remain deterministic;
- readiness/evidence rules should remain governed and deterministic where specified.

REV can then explain, tutor, scaffold, question and converse around those results.

Preferred relationship:

`Revision decides from governed evidence -> REV explains/teaches/adapts conversationally`

rather than:

`LLM invents the learner state or planner decision`.

This should improve cost, explainability, testability and educational trust.

## Model routing

A model-router abstraction is a strong candidate requirement. Different jobs can have materially different cost/quality needs, for example:

- deterministic/no-model operation where generation is unnecessary;
- cheap classification or structured extraction;
- routine concept explanation;
- quiz/scaffolding generation;
- normal feedback;
- difficult extended-answer reasoning/marking;
- nuanced exam-technique support;
- safety or policy classification where separately justified.

The product should route by capability and evaluated quality rather than by brand/model prestige.

The provider boundary should also avoid coupling REV permanently to one vendor. A conceptual interface such as `AIProvider` could allow Azure OpenAI, direct OpenAI or future providers behind the same governed orchestration layer.

## Structured learner context and memory

REV should not use unlimited transcript replay as memory.

A stronger separation is:

- objective learner state -> Revision's structured evidence model;
- curriculum truth -> governed Revision content/retrieval;
- learner preferences -> bounded structured REV memory where appropriate;
- immediate continuity -> short recent context or rolling conversation summary;
- raw historical conversation -> retained only according to deliberately approved privacy/retention rules.

The model should not manufacture durable claims such as "this learner is weak at elasticity" when Revision already has an evidence model capable of supporting or rejecting that conclusion.

## Privacy and data-processing implications

Tutor conversations are already treated by Revision as private learner data. Any third-party provider route must therefore be assessed for:

- model-training/data-use terms;
- processing location / deployment geography;
- retention and abuse-monitoring arrangements;
- provider access/support arrangements;
- minimisation of learner-identifiable context;
- deletion/retention behaviour;
- contractual/data-processing terms;
- suitability for teenage users and future school procurement.

Azure has potentially attractive enterprise/privacy properties, but it should not be described as a zero-processing or zero-human-access environment without qualification. Deployment geography and abuse-monitoring arrangements require deliberate review.

No API key, service credential or privileged provider secret may ever be exposed to the browser or committed to GitHub. The AI provider must be invoked through a protected server-side boundary.

## Safeguarding implications

REV cannot rely on a single system prompt for safeguarding.

The production design must integrate Revision's safeguarding standard, including:

- serious-risk recognition;
- proportionate treatment of ambiguous/normal teenage language;
- safe diversion from ordinary revision mode where necessary;
- no automated third-party reporting in the first product version unless governance changes;
- validated real-world support behaviour;
- false-positive and false-negative evaluation;
- safe failure behaviour when the AI provider is unavailable or uncertain.

Provider-native content filtering may be useful defence in depth but cannot replace Revision's own governed safeguarding behaviour.

## Founder/non-developer feasibility

The Founder does not need to write the implementation code.

Founder responsibilities remain product and supplier decisions, including:

- Azure/OpenAI/provider account ownership and billing;
- contractual/privacy decisions;
- deployment geography and supplier configuration decisions;
- secure secret ownership/provisioning;
- commercial envelope decisions;
- product/experience approval;
- governed Definition-of-Ready and merge approvals.

The software itself can be implemented through the existing GitHub workflow using TypeScript, Supabase migrations/Edge Functions, tests, evaluation suites, technical documentation and governed PRs once FI-003 has achieved human-approved `Ready` status.

## Evaluation is the critical feasibility gate

A simple `browser -> LLM -> answer` prototype proves API connectivity but does not prove REV.

Before provider/model approval, FI-003 should establish a representative evaluation set. A Business pilot could include scenarios such as:

- explain a concept to a struggling learner;
- explain the same concept to a stronger learner;
- scaffold without immediately revealing the answer;
- respond correctly to an incorrect learner premise;
- remain within the correct exam board/specification;
- say that evidence is insufficient rather than fabricate certainty;
- explain an existing deterministic planner recommendation accurately;
- handle ordinary exam stress proportionately;
- handle serious safeguarding language correctly;
- maintain age-appropriate and concise tutoring tone;
- avoid unsupported grade/mark claims.

Candidate routes should be compared on at least:

- factual/curriculum correctness;
- educational usefulness;
- grounding/provenance adherence;
- hallucination rate/severity;
- tutoring/scaffolding behaviour;
- safeguarding behaviour;
- latency;
- input/output token consumption;
- variable £ cost;
- provider reliability/failure behaviour.

A durable evaluation corpus and scoring methodology can become a strategic Revision asset because models/providers can then be changed without losing the product's definition of acceptable tutor quality.

## Candidate analysis sequence for FI-003

When FI-003 is deliberately started, the current recommended analysis sequence is:

1. move `To Do -> Analyse` through the normal feature workflow;
2. define representative Business tutor/evaluation scenarios;
3. define the smallest bounded non-production feasibility spike needed to measure real model behaviour;
4. compare at least a low-cost route, routine tutor route and high-capability route;
5. evaluate Azure OpenAI against direct OpenAI/other credible provider routes where appropriate;
6. measure real token/latency/cost distributions rather than rely on headline price tables;
7. design curriculum retrieval/RAG against governed Revision content;
8. define structured learner context and bounded memory;
9. define safeguarding/policy orchestration;
10. define provider abstraction and model routing;
11. define usage/cost metering and its relationship to FI-002 entitlements;
12. complete product experience, measurement, assurance and documentation decisions required by the Definition of Ready;
13. produce the dedicated REV technical architecture/ADR and required authority changes;
14. request explicit Founder `Analyse -> Ready` approval before production implementation.

## Strategic conclusion

The strongest product direction is not to copy a competitor's use of GPT-4. It is to make REV the natural-language intelligence layer over a stronger Revision learning system.

Conceptually:

```text
Deterministic learner model
        +
Evidence-backed progress/readiness
        +
Adaptive planning
        +
Governed curriculum content
        +
REV conversational intelligence
```

The model should be replaceable. Revision's learner model, curriculum grounding, evaluation corpus, tutoring behaviour, product integration and accumulated evidence should be the defensible system.

## Open decisions for later FI-003 analysis

This study deliberately does **not** resolve:

- Azure OpenAI versus direct OpenAI versus another provider;
- exact provider/model deployments;
- exact RAG/vector implementation;
- exact prompt/orchestration framework;
- exact conversation retention period;
- exact structured memory schema;
- exact model-routing table;
- public Free/Paid/Premium REV allowances;
- voice implementation;
- final AI evaluation thresholds;
- production latency SLOs;
- exact user-facing failure/fallback states.

Those decisions belong to FI-003 Definition-of-Ready analysis and, where applicable, dedicated authority/ADR work.

## Documentation-impact conclusion

Creating this research record does not change normative product, commercial, privacy, safeguarding or engineering authority. It records evidence that future FI-003 analysis must consume.

If FI-003 progresses, documentation impact is expected to include at minimum:

- fuller REV product behaviour authority where needed;
- relevant core user journeys and experience authority;
- AI/privacy/safeguarding/evidence authority as required;
- a dedicated REV technical architecture document;
- provider/model architecture ADR(s);
- AI evaluation/assurance design;
- usage/cost metering documentation and FI-002 interaction;
- relevant indexes/registers once those sources become authoritative or implemented.

Historical competitor/research evidence should remain research and must not be silently promoted into product authority.