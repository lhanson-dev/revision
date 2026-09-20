# ADR-0026 — Foundation-native Learn and Practice asset assurance

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 20 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Context

The AQA A-level Business 7132 — 2027 Foundation is `ai_assured` on exact Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

Retained internal Learn/Practice proof run `35468029336` successfully generated the complete pre-production bundle from that exact Foundation using the Foundation-native production boundary introduced by ADR-0025. The retained bundle contains 49 deterministic work units, 49 Learn generations and 49 Practice generations, all with distinct generation contexts. Both aggregate derived assets remain `assuranceStatus: pending` and learner publication remains blocked.

The active Content Accuracy Assurance Gate requires derived learner content to receive deterministic verification and fresh-context adversarial review before it is treated as assured. The repository already contains proven generic v2 assurance concepts, but that implementation is coupled to the retired end-to-end course-pack state machine and must not be imposed on the Foundation-native asset lifecycle merely for compatibility.

## Decision

Introduce a Foundation-native Learn/Practice asset-assurance boundary over an exact retained generated bundle.

The boundary:

1. accepts only an exact Foundation job in `ai_assured`, `expert_review` or `foundation_approved` state;
2. verifies the generated bundle against the exact Foundation fingerprint, Candidate, Coverage Model and Course Knowledge Model;
3. deterministically reconstructs the expected Foundation-native work-unit plan and verifies the retained bundle matches it;
4. reruns structural, planned-mode and teaching-point evidence checks before any independent review call;
5. proves the retained Learn/Practice generation contexts are unique and do not collide with prior Foundation generation, Foundation assurance or external-challenge contexts;
6. independently reviews each generated work unit in a fresh review context;
7. forbids every retained generation context, prior Foundation assurance/generation context and external-challenge context from being reused as an asset-review context;
8. also requires each work-unit review context to be unique within the assurance run;
9. supplies the reviewer only the exact Revision-owned generated Learn/Practice content plus the relevant structured Foundation coverage and Course Truth facts;
10. requires adversarial review for factual distortion, omitted conditions, misleading certainty, curriculum drift, pedagogy, misconceptions, expected-response correctness and quantitative errors, including independent recomputation where relevant;
11. returns a machine-readable issue register and smallest-scope remediation targets when findings remain;
12. records Learn and Practice asset assurance as PASS only when deterministic assurance passes and every independent work-unit review passes with no open blocking, material or minor finding; and
13. leaves learner publication blocked until the exact Foundation later reaches qualified-human `foundation_approved` state.

A `conditional_pass` or `fail_hold` does not mark either aggregate asset assured. Remediation is targeted by work unit and affected asset kind rather than regenerating the full course by default.

## Independence model

The generated bundle retains every generation context ID. The Foundation Candidate retains its earlier generation and assurance contexts, and its external-source challenge retains its reviewer context.

All of those contexts are forbidden for Foundation-native asset review. The live proof additionally records all new reviewer context IDs and verifies there are no collisions.

The implementation reuses the proven principle from the older Content Factory assurance contract—`fresh-context-not-used-by-generation-review-or-remediation`—without reusing the old course-pack state machine.

## Assurance granularity

Independent review is performed per deterministic Foundation work unit rather than as one unconstrained full-course model call. This keeps the reviewer input bounded, ties findings to the smallest useful remediation scope and gives each review a durable work-unit fingerprint.

The aggregate Learn and Practice asset records remain the release-controlled units. They move from `pending` to `pass` only after every work unit has passed.

## Source-rights boundary

The reviewer receives structured Foundation facts and Revision-owned generated learner content. Protected awarding-body source prose is not supplied. The Source Licensing and Provenance Standard therefore continues to govern the Foundation extraction boundary rather than being weakened for downstream assurance.

## Publication boundary

Asset assurance is not Foundation approval and is not learner-publication approval.

Even after Learn/Practice assurance PASS, `assertFoundationDerivedAssetReleaseEligible` continues to require:

1. derived-asset assurance PASS;
2. qualified-human `foundation_approved` state; and
3. exact equality between the asset Foundation fingerprint and the approved Foundation fingerprint.

The retained asset-assurance proof remains pre-production evidence and must not register content in the ordinary production learner-content registry.

## Consequences

Revision gains a clean path from AI-assured Foundation → generated internal Learn/Practice bundle → independently assured internal Learn/Practice bundle while qualified-human Foundation review continues separately.

If the independent review exposes a credible Foundation defect rather than an asset-local generation defect, the affected work must reopen the Foundation through a new Candidate/version instead of silently patching learner content around incorrect truth.

A successful asset-assurance proof allows the next implementation slice—a test-only internal preview adapter—but still does not authorize learner publication.

## Documentation impact

`docs/technical/Content Factory Foundation-Native Internal Learning Assets.md` records the runtime contract and retained proof chain. The active normative Content Factory authorities do not change; this ADR implements their existing asset-assurance requirements. Historical generation and failure evidence remains unchanged.
