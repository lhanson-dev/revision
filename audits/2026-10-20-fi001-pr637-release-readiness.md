# FI-001 — PR #637 integration and release readiness checkpoint

**Date:** 20 October 2026  
**Status:** HOLD — candidate, not approved for merge or unrestricted real-student pilot.  
**Repository:** `lhanson-dev/revision`; **PR:** #637.  
**Authority:** approved `main`; `INDEX.md`, `AUTHORITY_HIERARCHY.md`, `KNOWLEDGE_ARCHITECTURE.md`, `70-ai-operating-system/AI Agent Constitution.md`, Adaptive Revision Planning and Release & Deployment Standard.

## Integration decision

Approved main at `0ae04959491d963c0c70e651e3488eaebe3c0c78` contains the Founder-approved standalone REV fix #648 (production verified at run #39445510168). The prior FI-001 head `91e644bc543e9c812da8f5a01bc77abdca94d6b9` independently adapted the same focused-session semantics alongside newer educational and programme-first behaviour.

Rather than overwrite newer `main` or roll back FI-001's programme-first content, the integration retains the candidate's current shared Home/Plan/REV runtime and adds the standalone real-Business and real-Psychology browser tests for partial/full focused completion and interrupted work, plus main's bounded-dose unit regression. The current release contains no new migration or modified grading algorithm due to this merge. Other divergent code (notably PlanScreen, planner-model, source-backed Learn, paper skills, educational tests) is intentional FI-001 work proposed for this PR and must be judged independently.

## Automated evidence still required

- Revision CI, exact combined-head static/unit/browser desktop, tablet and phone; database/security and visual baselines.
- Frozen same-input Business and Psychology scenario comparison at the exact integration head.
- Review any real changes in recommendation rank, coverage/omissions, cross-screen identity or source-linked exam requirements. Do not infer quality from passing assertions.

## Educational acceptance not established

- All thirteen `SV-01…SV-13` require educational judgements; existing CI names and quantified counts are not substitutes.
- Business 7132 original exam question accuracy and AO/marking authenticity have not received the required independent content review, especially paper choices/representative essay answers. Prior structural validation does not prove original content is correct.
- Full learner comprehension of why REV recommends a task, the time estimate, omitted tasks and what changes after real results is not observed.
- Focused-session interruption preserves saved responses but restarts at question one. True resumption is not implemented, and actual learner impact is unknown.

## Release boundary

PR #637 remains draft and unmerged. The separate #648 release authorisation does not approve #637. Before the Founder receives a final merge recommendation, update technical docs and assurance register to state the actual final-head evidence and clearly separate any accepted known limitation from a hard blocker. Historical evidence must not be rewritten. No grades/efficacy claims are authorised.
