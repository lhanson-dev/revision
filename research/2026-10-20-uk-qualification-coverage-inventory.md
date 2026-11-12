# UK GCSE and A-level qualification coverage inventory — research plan

**Status:** Exploratory research; no production or launch commitment. **Date:** 20 October 2026.

## Purpose
Build a specification-exact, demand-informed content production queue for UK GCSE and A-level courses, aligned with Revision's approved Foundation-first Content Factory.

## Scope and counting
- England, Wales and Northern Ireland; report jurisdiction separately.
- Scotland's National 5 and Highers are separate qualifications, not GCSE/A-level, and excluded from this inventory.
- Distinguish subject, qualification, awarding organisation, specification/version, course option, tier, assessment component and paper. These are not interchangeable counts.
- Count regulated specifications, not theoretical board × subject products.
- Record withdrawn and replacement specifications and first/last teaching and assessment dates.
- Keep England certificate figures separate from UK subject-entry figures; GCSE Combined Science can represent two GCSE grades and needs explicit counting treatment.
- Do not confuse exam entries with unique students or add subject reach to claim distinct learners.

## Proposed machine-readable schema
`jurisdiction,qualification_level,regulator,awarding_body,subject_group,qualification_title,qualification_number,specification_code,version,first_teaching,first_assessment,last_assessment,active_status,tier,options,component_structure,official_spec_url,verification_date,annual_entries,entry_year,entry_geography,entry_metric,rights_classification,revision_course_id,foundation_version,foundation_assurance_status,blueprint_status,asset_assurance_status,reviewer_status,publication_status,estimated_production_cost,estimated_review_hours,priority_wave,evidence_url,notes`

## Authoritative source plan
1. Ofqual annual qualifications market report 2024–25: awarding-organisation × subject certificates and market share. https://www.gov.uk/government/statistics/annual-qualifications-market-report-academic-year-2024-to-2025
2. JCQ results data, including 2026 GCSE and A-level subject entries: https://www.jcq.org.uk/exam-results-data/
3. Regulator registers and current awarding-body specification pages for exact course identity and assessment rules. Reconcile Wales and Northern Ireland separately.
4. Revision current course catalogue, approved foundation status and content factory provenance from main/code/technical docs. Unverified readiness = not ready.

## Priority model (proposed, not approved)
Evaluate demand, compulsory/core relevance, incremental reach, review complexity, expected production and assurance cost, current readiness, and defensible reuse. Rank expected educational reach per *assured* production cost; do not fabricate costs or a weighted score until real data is available.

**Candidate first wave to investigate, not a production decision:** GCSE Mathematics, English Language, English Literature, Combined Science; A-level Mathematics, Psychology, Biology, Chemistry, Business. Board order depends on exact demand and readiness.

## Delivery gates
1. Source register and full qualification rows independently reconciled.
2. Revision current-state coverage joined to exact specification identifiers.
3. Costs and educational/assessment review capacity estimated from pilot evidence.
4. Candidate production waves presented for Founder decision.
5. Only then promote accepted policy into appropriate numbered authority, and implement via governed branch/PR with qualified Foundation approval before assets.

## Documentation impact
Research-only file: no change to normative scope, Content Factory process, technical implementation or public marketing coverage. If launch scope or production policy changes, update appropriate numbered authority and any relevant technical documentation in the same governed PR. Do not merge without Founder approval.

## Open questions
- Complete count of currently active UK GCSE and A-level specification combinations is **not yet established**.
- Wales/NI jurisdiction and board overlap must be deduplicated.
- Current Revision exact-course coverage and cost estimates need extraction before production ranking is credible.
