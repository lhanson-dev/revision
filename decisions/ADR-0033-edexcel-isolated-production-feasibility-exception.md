# ADR-0033 — Bounded Edexcel 9BS0 internal production feasibility exception

**Status:** Proposed; NOT operative until specifically Founder-approved and merged
**Decision owners:** Founder / Educational Content / Engineering
**Target:** one Pearson Edexcel A-level Business 9BS0 Market section 1.2, optionally one subsequent section
**Normative change:** `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`

## Problem

The active exact-course AI Foundation gate correctly prevents derived assets from being taken as trusted. The current Edexcel 9BS0 source universe and 26 Market learning obligations are research rather than approved exact Course/Exam Truth. The existing working generic learner pack/adapter cannot itself prove the Edexcel content-generation production line. Weeks of metadata preflights have not produced a new trusted student-ready course.

## Decision proposed

Permit precisely scoped, isolated **non-publishing** adapter evaluation of existing Revision-original Edexcel research candidates before `ai_assured`, keeping candidate packs outside the registry and excluding all unapproved exam marking/learned-evidence claims. After distinct recorded section-level facts, provenance, operation rights, independent factual review and bounded spend controls are satisfactory, allow one explicitly labelled **research-only** live section-production experiment. Keep production workers' ordinary lifecycle contracts and learner-publication guards intact. No bypass for any real learner path.

## Alternatives rejected

- Falsely promote provisional Edexcel nodes or draft marking rubrics to `ai_assured`: corrupts trusted Foundation history and learner claims.
- Copy AQA-generated content into a relabelled 9BS0 released pack: loses board-specific curricular and assessment requirements.
- Add Edexcel-specific React routes or import research specimens into the normal registry: creates unnecessary code, risks publishing unreviewed content and violates generic integration.
- Wait for completion of the entire exact course before testing any adapter compatibility: more delay than needed to reveal contract failures.

## Consequences

- A bounded test can show the actual Learn and Practice schema compatibility now; **it does not establish** qualified educational acceptance, real model-produced content, a full-paper experience or confidence for an exam candidate.
- Separate rights clearance and accepted section truth remain required before sending source-derived inputs to a live model. `REFERENCE_ONLY` Pearson prose is excluded.
- The experiment cannot be reported as live learner publication, nor establish whole-course completeness or costs. Existing Business and Psychology paths are not modified.
- The normal release gate is unchanged. Any attempt to generalise this exception, include real learner sessions or remove publication checks needs a separate Founder-approved decision.
- The decision expires after the declared bounded trial; accumulated failures, manual work and real costs determine the next engineering change.

## Evidence and implementation

- Technical trial implementation and verification limits: `docs/technical/Content Factory Edexcel Isolated Production Trial.md`.
- Isolated research projection: `research/content-production-repeatability/edexcel-9bs0-market-content-preview.ts`.
- Schema/adapter tests: `research/content-production-repeatability/edexcel-9bs0-market-content-preview.test.ts`.
- Prior research specimens and tests remain historical, without retrospective educational approval.

## Documentation-impact check

The narrowly defined normative exception, this ADR and its technical evidence note must merge together. No other normative product behaviour, learner app implementation or historical evidence changes in this package.
