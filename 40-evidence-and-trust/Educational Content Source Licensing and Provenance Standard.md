# Educational Content Source Licensing and Provenance Standard

**Status:** Founder-approved authority for Content Factory v2 — approved 25 August 2026  
**Owner:** Founder / Content / Trust  
**Purpose:** Define which educational sources Revision may use, how those sources may enter AI-assisted production, and what provenance must be retained before learner content is generated.

## Core principle

Revision must distinguish **educational authority** from **permission to copy, transform, ingest or commercially reuse a source**.

A source may be authoritative for curriculum or assessment facts without being licensed for generative-AI ingestion, reproduction or adaptation. Content production must therefore pass a source-rights gate before substantial source material is supplied to an AI worker.

Revision must not infer a licence merely because material is publicly accessible.

## Required source-use classification

Every material source in a Content Factory job must be classified before generative use as one of:

- **OPEN** — the applicable licence or public-domain basis permits the intended commercial reuse/adaptation and AI-assisted production use.
- **REVISION_OWNED** — Revision owns the material or it was created under terms that give Revision the required rights.
- **LICENSED** — Revision has an explicit licence/contract permitting the intended use; the record must identify the applicable permission and restrictions.
- **REFERENCE_ONLY** — the source may be consulted only within the deliberately approved factual/alignment process; substantial source text must not be supplied to generative workers or reproduced in learner content.
- **PROHIBITED** — the intended use is not permitted or remains legally unresolved; the source must not enter the production pipeline.

`UNKNOWN` is a blocking state, not permission to proceed.

## Source-rights gate

Before source material is supplied to a generation, transformation, summarisation, question-generation, marking-pack or independent-review worker, the job must retain:

- source identity and issuer;
- source URL/reference and version/date where available;
- educational role of the source;
- source-use classification;
- permission/licence basis or approved policy reference;
- whether source text may enter an AI context;
- whether derived commercial content may be produced from it;
- attribution requirements where applicable;
- known restrictions or expiry/revalidation conditions;
- date checked and checker/method provenance.

A worker must receive only source content permitted by this record.

## Curriculum truth versus board alignment

Where legally and educationally appropriate, Revision should separate:

1. **Curriculum/subject truth** — knowledge, skills, formulas, concepts and requirements derived from OPEN, REVISION_OWNED or appropriately LICENSED authority; and
2. **Board Alignment** — structured qualification-specific facts such as course identity, component scope, marks, timing, weighting, options and other approved alignment facts.

REFERENCE_ONLY awarding-body material may inform Board Alignment only through a deliberately approved extraction/verification process. The downstream AI production context should receive the approved structured facts rather than copied protected prose unless a licence explicitly permits broader use.

The system must not convert a restrictive source into reusable AI input merely by paraphrasing it first.

## Revision-authored learner content

Unless an explicit licence permits otherwise, learner-facing explanations, examples, cases, questions, simulations, model answers, marking packs and diagnostic feedback should be independently authored by Revision from permitted curriculum/subject truth and approved structured assessment/alignment facts.

Revision-authored exam practice must be labelled as original / exam-style / aligned as appropriate and must not be represented as official awarding-body questions, papers or mark schemes.

## Assessment and marking provenance

A Revision Marking Pack may use:

- permitted curriculum/subject truth;
- approved assessment objectives and structured assessment rules;
- the exact Revision-owned question/context;
- Revision-authored rubric/level logic, indicative reasoning paths, misconceptions, anchor responses and feedback rules; and
- qualified-human calibration evidence.

Protected third-party mark-scheme text must not be ingested into the marking worker unless the source-rights record explicitly permits that use.

## Automation rule

The Content Factory may automate discovery and preliminary classification, but automation must fail closed.

If licence terms are ambiguous, contradictory, source-specific or otherwise not safely classifiable under an approved rule, the job becomes `blocked` with reason `source_rights_review_required`.

Only a deliberately authorised human/legal decision or a previously approved reusable policy rule may clear that blocker. AI workers must not decide that commercial copyright use is lawful based on convenience or probability.

## Provenance and revalidation

Source-use decisions must remain attributable to the affected content/version. A material source, licence, policy, qualification or worker-input change must invalidate affected downstream assurance deliberately.

Revalidation is required when:

- source terms/licences materially change;
- a course is reused for a later cohort where rights/currency are uncertain;
- Revision changes how source material is supplied to AI providers;
- a legal/licensing review changes the permitted-use classification; or
- a defect reveals that protected material entered the pipeline incorrectly.

## Product/trust claims

Revision may explain that its courses are built from authoritative curriculum sources and mapped/aligned to relevant qualifications only when the retained source and assurance evidence supports that claim.

Do not claim awarding-body endorsement, official status or legal permission beyond the recorded evidence.

## Relationship to other authority

This standard supplements:

- `80-company-workflows/Awarding Body URL Content Intake Workflow.md`;
- `80-company-workflows/Content Pack Production and Assurance Workflow.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`;
- `80-company-workflows/Content Factory Operating Model.md`.

Where an older workflow assumes that public awarding-body material may automatically become AI input, this standard takes precedence for source-use safety until those workflows are amended and aligned.