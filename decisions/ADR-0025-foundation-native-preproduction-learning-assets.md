# ADR-0025 — Foundation-native pre-production Learn and Practice assets

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 19 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`

## Context

AQA A-level Business 7132 — 2027 has reached `ai_assured` on exact Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

The next governed stage is controlled internal learner-asset production. The repository already contains useful v2 Learn/Practice worker contracts and output validators, but the active Foundation/Asset Production Model explicitly says not to inherit the old coupled course state machine or legacy Learn/Practice work-unit coupling merely for compatibility.

The current Foundation coverage model is also intentionally different from the old v2 coverage map. Foundation coverage maps each governed requirement directly to canonical Course Truth knowledge nodes. It does not contain the retired `learnRequired`, `practiceRequired`, `examPrepRequired` or `contentRefs` fields.

## Decision

Introduce a clean Foundation-native pre-production Learn/Practice production boundary.

The new boundary:

1. accepts an exact `ai_assured`, `expert_review` or `foundation_approved` Foundation job through the existing `createFoundationDerivedAsset` gate;
2. consumes the exact Foundation Coverage Model and Course Knowledge Model bound to the Candidate;
3. deterministically groups governed requirements by `revisionArea` into course-scoped work units;
4. requires every governed Course Truth node to be mapped by Foundation coverage;
5. derives learning/practice modes from Course Truth structure rather than asking a model to decide curriculum coverage;
6. reuses the proven structured Learn and Practice generation worker contracts and teaching-point evidence validator;
7. retains the exact Foundation fingerprint and Candidate identity on both Learn and Practice asset records;
8. records generation contexts separately so later independent asset assurance can exclude generation contexts; and
9. leaves generated assets at `assuranceStatus: pending`. Generation is not assurance and does not create learner-publication eligibility.

The deterministic initial mode policy is:

- every work unit receives explanation plus retrieval practice;
- a work unit containing formula knowledge receives worked-example and quantitative practice;
- a work unit containing application contexts receives application practice.

This is a production-planning default, not a claim that every learner must use every format. Later Practice Factory expansion remains coverage/evidence driven under the active authority.

## Publication boundary

This decision does not add generated pre-production content to the ordinary production `content/**` registry and does not expose it through Production Pages.

Internal site-preview integration must consume retained pre-production artifacts through a non-production/test-only path. Learner release remains governed by the existing derived-asset release guard: exact `foundation_approved` fingerprint plus passing asset assurance.

## Reuse boundary

Reusable v2 components:

- structured Learn/Practice worker output schemas;
- provider worker contracts;
- teaching-point evidence integrity checks; and
- Course Knowledge Model schema.

Not reused:

- the v2 end-to-end course state machine;
- the old `mapped → generating` lifecycle;
- model-planned coverage obligations; or
- legacy Learn/Practice coupling as an orchestration requirement.

## Consequences

This creates a direct path from an AI-assured Foundation to internally testable learner assets without weakening the qualified-human publication gate.

Exam Prep remains a separate factory because it depends on both Course Truth and Exam Truth and needs its own assurance boundary.

## Documentation impact

The implementation is documented in `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`. Historical v2 documentation and evidence remain unchanged.
