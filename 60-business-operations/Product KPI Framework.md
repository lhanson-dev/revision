# Product KPI Framework

**Status:** Draft authority candidate — v0.1  
**Owner:** Product / Business Operations  
**Purpose:** Define how Revision measures whether product capabilities create meaningful student and business value, and how those measures should be surfaced for Founder assurance.

## Measurement principle

Revision should not judge product success from feature output or raw activity alone.

A material feature should normally define measures across four layers:

1. **Adoption** — are the intended users reaching and starting to use the capability?
2. **Useful engagement** — are they using it in the intended way rather than merely generating activity?
3. **Student outcome / product value** — is there evidence that the capability improves the student's revision experience, learning behaviour, confidence, coverage, understanding or exam readiness?
4. **Product / business value** — does the capability strengthen retention, differentiation, conversion, sustainable usage or other agreed strategic outcomes without compromising educational quality?

Metrics should be defined before or alongside implementation so the required events and data are designed into the feature rather than retrofitted later.

## Evidence hierarchy

Metrics should distinguish between:

- **behavioural evidence** — what students actually did;
- **learning evidence** — what assessments and validated interactions suggest about coverage, understanding and readiness;
- **self-reported experience** — how the student says they feel, including confidence;
- **commercial/product evidence** — retention, conversion, usage cost and other business measures; and
- **operational evidence** — whether the feature and its supporting systems are functioning correctly.

No single category should be treated as proof of another.

## Student confidence

Student confidence is a meaningful product outcome and should be measured deliberately.

Revision should be capable of asking a student how confident they currently feel about an upcoming subject assessment or exam, capturing a baseline and repeating the measure at useful intervals or milestones.

Confidence is **self-reported sentiment**, not evidence of mastery or exam readiness.

Revision must therefore keep confidence distinct from evidence-backed measures such as coverage, understanding/mastery and exam readiness.

### Core confidence measures

At minimum, the product should support analysis of:

- initial confidence baseline by subject / assessment;
- latest confidence;
- absolute and relative confidence change over time;
- percentage of students whose confidence improves, remains stable or declines;
- confidence change alongside revision activity and plan engagement;
- confidence change alongside evidence-backed mastery/readiness change; and
- confidence response / refresh rate so reporting does not imply representativeness where data is sparse.

### Confidence calibration

A particularly valuable measure is the relationship between **felt confidence** and **evidence-backed readiness**.

Revision should eventually be able to identify patterns such as:

- low confidence + strong evidence — the student may need justified reassurance;
- high confidence + weak evidence — the student may need constructive guidance toward important gaps;
- improving confidence + improving evidence — desired aligned progress; and
- declining confidence despite improving evidence — possible anxiety or poor interpretation of progress that the experience may be able to address.

This relationship should support guidance, but the system must not diagnose emotional or mental-health conditions from confidence data.

## Claims and marketing guardrail

Confidence improvement may become a valuable externally communicated product outcome, but claims must only be made when supported by adequate data and the applicable claims/evidence governance.

Revision must not turn a small, self-selected or poorly controlled confidence sample into a broad claim such as "Revision makes students more confident" without appropriate evidence.

Where reporting is used externally, the measurement definition, sample, period and limitations should be understood and retained.

## Feature KPI contract

For every material product feature, product definition should identify where relevant:

- primary user hypothesis;
- adoption metric;
- useful-engagement metric;
- student-value or outcome metric;
- relevant subjective-experience metric;
- retention / commercial metric;
- cost-to-serve metric where material;
- guardrail metrics;
- operational/health metrics; and
- events/data required to calculate them.

Not every feature requires every metric class. Measures should be proportionate to the feature and chosen because they inform a decision, not because they are easy to count.

## Admin / Founder assurance

Admin should progressively provide a Founder-facing view that answers:

- Are important capabilities being adopted?
- Are students receiving the intended value?
- Are educational and subjective outcomes moving in the desired direction?
- Are there material differences between activity and actual learning evidence?
- Are confidence and evidence-backed readiness becoming better aligned?
- Are there significant drop-offs, pathological usage patterns or operational failures?
- What requires product or operational attention?

Feature-level dashboards should favour trends, cohorts, denominators and actionable exceptions over vanity totals.

## Relationship to product governance

This framework defines the common measurement approach. Individual product authorities and feature definitions should specify the concrete metrics needed for their capability.

Product metrics must remain consistent with Revision's evidence, privacy, safeguarding and claims governance, particularly because Revision serves young people.
